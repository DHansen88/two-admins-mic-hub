<?php
/**
 * User Management API
 * Admin-only endpoints for managing user accounts.
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        handleList();
        break;
    case 'create':
        handleCreate();
        break;
    case 'update':
        handleUpdate();
        break;
    case 'delete':
        handleDelete();
        break;
    case 'reset-password':
        handleResetPassword();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function getAdminTableColumnsForUsers(string $table): array {
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

function logUserAdminActivity(?int $userId, string $email, string $action, ?string $details = null): void {
    try {
        $db = getDB();
        $columns = getAdminTableColumnsForUsers('admin_activity_log');
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
        error_log('User admin activity log failed: ' . $e->getMessage());
    }
}

function handleList(): void {
    $admin = requireAdmin();
    $db = getDB();

    $columns = getAdminTableColumnsForUsers('admin_users');
    if (empty($columns)) {
        jsonResponse(['users' => []]);
    }

    $select = [];
    foreach (['id', 'name', 'email', 'role', 'status', 'permissions', 'created_at'] as $column) {
        if (in_array($column, $columns, true)) {
            $select[] = $column;
        }
    }

    if (empty($select) || !in_array('id', $select, true)) {
        jsonResponse(['users' => []]);
    }

    $orderBy = in_array('created_at', $columns, true) ? 'created_at DESC' : 'id DESC';
    $stmt = $db->query('SELECT ' . implode(', ', $select) . ' FROM admin_users ORDER BY ' . $orderBy);
    $users = $stmt->fetchAll();
    
    // Parse permissions JSON
    foreach ($users as &$user) {
        $user['permissions'] = $user['permissions'] ? json_decode($user['permissions'], true) : null;
        $user['status'] = $user['status'] ?? 'active';
        $user['role'] = $user['role'] ?? 'manager';
    }
    
    jsonResponse(['users' => $users]);
}

function handleCreate(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $admin = requireAdmin();
    $body = getRequestBody();
    
    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $role = $body['role'] ?? 'manager';
    
    // Validation
    if (!$name || strlen($name) > 100) {
        jsonResponse(['error' => 'Name is required (max 100 characters)'], 400);
    }
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Valid email is required'], 400);
    }
    if (!$password || strlen($password) < 8) {
        jsonResponse(['error' => 'Password must be at least 8 characters'], 400);
    }
    if (!in_array($role, ['admin', 'manager', 'intern'])) {
        jsonResponse(['error' => 'Role must be admin, manager, or intern'], 400);
    }
    
    $db = getDB();
    $columns = getAdminTableColumnsForUsers('admin_users');
    if (empty($columns)) {
        jsonResponse(['error' => 'User table is unavailable'], 500);
    }
    
    // Check duplicate email
    $stmt = $db->prepare('SELECT id FROM admin_users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'An account with this email already exists'], 409);
    }
    
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $permissions = isset($body['permissions']) ? json_encode($body['permissions']) : null;

    $insertData = [];
    if (in_array('name', $columns, true)) {
        $insertData['name'] = $name;
    }
    if (in_array('email', $columns, true)) {
        $insertData['email'] = $email;
    }
    if (in_array('password_hash', $columns, true)) {
        $insertData['password_hash'] = $hash;
    } elseif (in_array('password', $columns, true)) {
        $insertData['password'] = $hash;
    }
    if (in_array('role', $columns, true)) {
        $insertData['role'] = $role;
    }
    if (in_array('status', $columns, true)) {
        $insertData['status'] = 'active';
    }
    if (in_array('permissions', $columns, true)) {
        $insertData['permissions'] = $permissions;
    }

    if (!isset($insertData['email']) || (!isset($insertData['password_hash']) && !isset($insertData['password']))) {
        jsonResponse(['error' => 'User table is missing required columns'], 500);
    }

    $fields = array_keys($insertData);
    $placeholders = implode(', ', array_fill(0, count($fields), '?'));
    $stmt = $db->prepare('INSERT INTO admin_users (' . implode(', ', $fields) . ') VALUES (' . $placeholders . ')');
    $stmt->execute(array_values($insertData));
    
    $userId = $db->lastInsertId();
    
    // Log action
    logUserAdminActivity((int) $admin['id'], (string) $admin['email'], 'user_created', "Created user: $email ($role)");
    
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => (int)$userId,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'status' => 'active',
            'permissions' => isset($body['permissions']) ? $body['permissions'] : null,
        ],
    ], 201);
}

function handleUpdate(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $admin = requireAdmin();
    $body = getRequestBody();
    $userId = (int)($body['id'] ?? 0);
    
    if (!$userId) {
        jsonResponse(['error' => 'User ID is required'], 400);
    }
    
    $db = getDB();
    $columns = getAdminTableColumnsForUsers('admin_users');
    if (empty($columns)) {
        jsonResponse(['error' => 'User table is unavailable'], 500);
    }
    
    // Build dynamic update
    $fields = [];
    $params = [];
    
    if (isset($body['name']) && in_array('name', $columns, true)) {
        $fields[] = 'name = ?';
        $params[] = trim($body['name']);
    }
    if (isset($body['role']) && in_array('role', $columns, true) && in_array($body['role'], ['admin', 'manager', 'intern'])) {
        $fields[] = 'role = ?';
        $params[] = $body['role'];
    }
    if (isset($body['status']) && in_array('status', $columns, true) && in_array($body['status'], ['active', 'disabled'])) {
        $fields[] = 'status = ?';
        $params[] = $body['status'];
    }
    if (isset($body['permissions']) && in_array('permissions', $columns, true)) {
        $fields[] = 'permissions = ?';
        $params[] = json_encode($body['permissions']);
    }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $params[] = $userId;
    $sql = 'UPDATE admin_users SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Log action
    logUserAdminActivity((int) $admin['id'], (string) $admin['email'], 'user_updated', "Updated user ID: $userId");
    
    jsonResponse(['success' => true]);
}

function handleDelete(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $admin = requireAdmin();
    $body = getRequestBody();
    $userId = (int)($body['id'] ?? 0);
    
    if (!$userId) {
        jsonResponse(['error' => 'User ID is required'], 400);
    }
    
    // Prevent self-deletion
    if ($userId === (int)$admin['id']) {
        jsonResponse(['error' => 'You cannot delete your own account'], 400);
    }
    
    $db = getDB();
    $columns = getAdminTableColumnsForUsers('admin_users');
    if (empty($columns)) {
        jsonResponse(['error' => 'User table is unavailable'], 500);
    }
    
    // Get user info for logging
    $stmt = $db->prepare('SELECT email FROM admin_users WHERE id = ?');
    $stmt->execute([$userId]);
    $target = $stmt->fetch();
    
    if (!$target) {
        jsonResponse(['error' => 'User not found'], 404);
    }
    
    $stmt = $db->prepare('DELETE FROM admin_users WHERE id = ?');
    $stmt->execute([$userId]);
    
    // Log action
    logUserAdminActivity((int) $admin['id'], (string) $admin['email'], 'user_deleted', "Deleted user: {$target['email']}");
    
    jsonResponse(['success' => true]);
}

function handleResetPassword(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $admin = requireAdmin();
    $body = getRequestBody();
    $userId = (int)($body['id'] ?? 0);
    $newPassword = $body['password'] ?? '';
    
    if (!$userId) {
        jsonResponse(['error' => 'User ID is required'], 400);
    }
    if (!$newPassword || strlen($newPassword) < 8) {
        jsonResponse(['error' => 'Password must be at least 8 characters'], 400);
    }
    
    $db = getDB();
    $columns = getAdminTableColumnsForUsers('admin_users');
    if (empty($columns)) {
        jsonResponse(['error' => 'User table is unavailable'], 500);
    }
    $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

    if (in_array('password_hash', $columns, true)) {
        $stmt = $db->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
        $stmt->execute([$hash, $userId]);
    } elseif (in_array('password', $columns, true)) {
        $stmt = $db->prepare('UPDATE admin_users SET password = ? WHERE id = ?');
        $stmt->execute([$hash, $userId]);
    } else {
        jsonResponse(['error' => 'User table is missing a password column'], 500);
    }
    
    // Log action
    logUserAdminActivity((int) $admin['id'], (string) $admin['email'], 'password_reset', "Reset password for user ID: $userId");
    
    jsonResponse(['success' => true]);
}
