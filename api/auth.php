<?php
/**
 * Authentication API
 * Handles login, logout, and session validation.
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'session':
        handleSession();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function getAdminTableColumns(string $table): array {
    static $cache = [];

    if (isset($cache[$table])) {
        return $cache[$table];
    }

    if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
        return [];
    }

    try {
        $db = getDB();
        $stmt = $db->query("SHOW COLUMNS FROM `{$table}`");
        $rows = $stmt->fetchAll();
        $columns = [];
        foreach ($rows as $row) {
            if (!empty($row['Field'])) {
                $columns[] = (string) $row['Field'];
            }
        }
        $cache[$table] = $columns;
    } catch (Throwable $e) {
        $cache[$table] = [];
    }

    return $cache[$table];
}

function logAdminAuthActivity(?int $userId, string $email, string $action, ?string $details = null): void {
    try {
        $db = getDB();
        $columns = getAdminTableColumns('admin_activity_log');
        if (empty($columns)) {
            return;
        }

        $data = [];
        if ($userId !== null && in_array('user_id', $columns, true)) {
            $data['user_id'] = $userId;
        }
        if (in_array('user_email', $columns, true)) {
            $data['user_email'] = $email;
        } elseif (in_array('user_name', $columns, true)) {
            $data['user_name'] = $email;
        }
        if (in_array('action', $columns, true)) {
            $data['action'] = $action;
        }
        if ($details !== null && in_array('details', $columns, true)) {
            $data['details'] = $details;
        }
        if (in_array('ip_address', $columns, true)) {
            $data['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';
        }
        if (empty($data)) {
            return;
        }

        $fields = array_keys($data);
        $placeholders = implode(', ', array_fill(0, count($fields), '?'));
        $sql = 'INSERT INTO admin_activity_log (' . implode(', ', $fields) . ') VALUES (' . $placeholders . ')';
        $stmt = $db->prepare($sql);
        $stmt->execute(array_values($data));
    } catch (Throwable $e) {
        error_log('Admin auth log failed: ' . $e->getMessage());
    }
}

function fetchAdminUserForLogin(string $email): ?array {
    $db = getDB();
    $columns = getAdminTableColumns('admin_users');
    if (empty($columns) || !in_array('email', $columns, true)) {
        return null;
    }

    $select = ['id', 'name', 'email'];
    foreach (['password_hash', 'password', 'role', 'status', 'permissions'] as $column) {
        if (in_array($column, $columns, true)) {
            $select[] = $column;
        }
    }

    $stmt = $db->prepare('SELECT ' . implode(', ', $select) . ' FROM admin_users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function verifyAdminPassword(string $password, array $user): bool {
    $storedHash = (string) ($user['password_hash'] ?? '');
    if ($storedHash !== '') {
        return password_verify($password, $storedHash);
    }

    $storedPassword = (string) ($user['password'] ?? '');
    if ($storedPassword === '') {
        return false;
    }

    if (password_get_info($storedPassword)['algo'] !== null) {
        return password_verify($password, $storedPassword);
    }

    return hash_equals($storedPassword, $password);
}

function handleLogin(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $body = getRequestBody();
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    
    if (!$email || !$password) {
        jsonResponse(['error' => 'Email and password are required'], 400);
    }
    
    // Basic email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }
    
    $user = fetchAdminUserForLogin($email);
    
    if (!$user || !verifyAdminPassword($password, $user)) {
        logAdminAuthActivity(null, $email, 'login_failed', 'Invalid credentials');
        jsonResponse(['error' => 'Invalid email or password'], 401);
    }
    
    if (($user['status'] ?? 'active') !== 'active') {
        jsonResponse(['error' => 'Account is disabled. Contact an administrator.'], 403);
    }
    
    // Create session
    startSecureSession();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'] ?? 'admin';
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['expires_at'] = time() + SESSION_LIFETIME;
    session_write_close();
    
    logAdminAuthActivity((int) $user['id'], $user['email'], 'login_success');
    
    $permissions = !empty($user['permissions']) ? json_decode((string) $user['permissions'], true) : null;
    $token = issueAdminToken($user);
    
    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'] ?? 'admin',
            'permissions' => $permissions,
        ],
    ]);
}

function handleLogout(): void {
    startSecureSession();
    revokeAdminToken(getAdminBearerToken());
    
    if (!empty($_SESSION['user_id'])) {
        logAdminAuthActivity((int) $_SESSION['user_id'], (string) ($_SESSION['user_email'] ?? ''), 'logout');
    }
    
    session_destroy();
    jsonResponse(['success' => true]);
}

function handleSession(): void {
    $sessionUser = requireAuth();

    $db = getDB();
    $columns = getAdminTableColumns('admin_users');
    if (empty($columns)) {
        jsonResponse(['authenticated' => false], 401);
    }

    $select = [];
    foreach (['permissions', 'role', 'status'] as $column) {
        if (in_array($column, $columns, true)) {
            $select[] = $column;
        }
    }
    if (empty($select)) {
        $select[] = 'id';
    }

    $stmt = $db->prepare('SELECT ' . implode(', ', $select) . ' FROM admin_users WHERE id = ?');
    $stmt->execute([$sessionUser['id']]);
    $user = $stmt->fetch();
    
    if (!$user || ($user['status'] ?? 'active') !== 'active') {
        revokeAdminToken(getAdminBearerToken());
        session_destroy();
        jsonResponse(['authenticated' => false], 401);
    }
    
    $permissions = !empty($user['permissions']) ? json_decode((string) $user['permissions'], true) : null;
    
    jsonResponse([
        'authenticated' => true,
        'user' => [
            'id' => $sessionUser['id'],
            'name' => $sessionUser['name'],
            'email' => $sessionUser['email'],
            'role' => $user['role'] ?? $sessionUser['role'] ?? 'admin',
            'permissions' => $permissions,
        ],
    ]);
}
