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

function handleList(): void {
    $admin = requireAdmin();
    $db = getDB();
    
    $stmt = $db->query('SELECT id, name, email, role, status, permissions, created_at FROM admin_users ORDER BY created_at DESC');
    $users = $stmt->fetchAll();
    
    // Parse permissions JSON
    foreach ($users as &$user) {
        $user['permissions'] = $user['permissions'] ? json_decode($user['permissions'], true) : null;
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
    
    // Check duplicate email
    $stmt = $db->prepare('SELECT id FROM admin_users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'An account with this email already exists'], 409);
    }
    
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $permissions = isset($body['permissions']) ? json_encode($body['permissions']) : null;
    
    $stmt = $db->prepare('INSERT INTO admin_users (name, email, password_hash, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$name, $email, $hash, $role, 'active', $permissions]);
    
    $userId = $db->lastInsertId();
    
    // Log action
    $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)');
    $logStmt->execute([$admin['id'], $admin['email'], 'user_created', "Created user: $email ($role)", $_SERVER['REMOTE_ADDR'] ?? '']);
    
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => (int)$userId,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'status' => 'active',
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
    
    // Build dynamic update
    $fields = [];
    $params = [];
    
    if (isset($body['name'])) {
        $fields[] = 'name = ?';
        $params[] = trim($body['name']);
    }
    if (isset($body['role']) && in_array($body['role'], ['admin', 'manager'])) {
        $fields[] = 'role = ?';
        $params[] = $body['role'];
    }
    if (isset($body['status']) && in_array($body['status'], ['active', 'disabled'])) {
        $fields[] = 'status = ?';
        $params[] = $body['status'];
    }
    if (isset($body['permissions'])) {
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
    $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)');
    $logStmt->execute([$admin['id'], $admin['email'], 'user_updated', "Updated user ID: $userId", $_SERVER['REMOTE_ADDR'] ?? '']);
    
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
    $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)');
    $logStmt->execute([$admin['id'], $admin['email'], 'user_deleted', "Deleted user: {$target['email']}", $_SERVER['REMOTE_ADDR'] ?? '']);
    
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
    $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    
    $stmt = $db->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$hash, $userId]);
    
    // Log action
    $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)');
    $logStmt->execute([$admin['id'], $admin['email'], 'password_reset', "Reset password for user ID: $userId", $_SERVER['REMOTE_ADDR'] ?? '']);
    
    jsonResponse(['success' => true]);
}
