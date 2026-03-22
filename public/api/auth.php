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
    
    $db = getDB();
    $stmt = $db->prepare('SELECT id, name, email, password_hash, role, status, permissions FROM admin_users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Log failed attempt
        $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_email, action, details, ip_address) VALUES (?, ?, ?, ?)');
        $logStmt->execute([$email, 'login_failed', 'Invalid credentials', $_SERVER['REMOTE_ADDR'] ?? '']);
        
        jsonResponse(['error' => 'Invalid email or password'], 401);
    }
    
    if ($user['status'] !== 'active') {
        jsonResponse(['error' => 'Account is disabled. Contact an administrator.'], 403);
    }
    
    // Create session
    startSecureSession();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['expires_at'] = time() + SESSION_LIFETIME;
    session_write_close();
    
    // Log successful login
    $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, ip_address) VALUES (?, ?, ?, ?)');
    $logStmt->execute([$user['id'], $user['email'], 'login_success', $_SERVER['REMOTE_ADDR'] ?? '']);
    
    $permissions = $user['permissions'] ? json_decode($user['permissions'], true) : null;
    $token = issueAdminToken($user);
    
    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'permissions' => $permissions,
        ],
    ]);
}

function handleLogout(): void {
    startSecureSession();
    revokeAdminToken(getAdminBearerToken());
    
    if (!empty($_SESSION['user_id'])) {
        $db = getDB();
        $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, ip_address) VALUES (?, ?, ?, ?)');
        $logStmt->execute([$_SESSION['user_id'], $_SESSION['user_email'], 'logout', $_SERVER['REMOTE_ADDR'] ?? '']);
    }
    
    session_destroy();
    jsonResponse(['success' => true]);
}

function handleSession(): void {
    $sessionUser = requireAuth();

    $db = getDB();
    $stmt = $db->prepare('SELECT permissions, role, status FROM admin_users WHERE id = ?');
    $stmt->execute([$sessionUser['id']]);
    $user = $stmt->fetch();
    
    if (!$user || $user['status'] !== 'active') {
        revokeAdminToken(getAdminBearerToken());
        session_destroy();
        jsonResponse(['authenticated' => false], 401);
    }
    
    $permissions = $user['permissions'] ? json_decode($user['permissions'], true) : null;
    
    jsonResponse([
        'authenticated' => true,
        'user' => [
            'id' => $sessionUser['id'],
            'name' => $sessionUser['name'],
            'email' => $sessionUser['email'],
            'role' => $user['role'],
            'permissions' => $permissions,
        ],
    ]);
}
