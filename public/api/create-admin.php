<?php
/**
 * One-time script to create an admin account.
 * DELETE THIS FILE IMMEDIATELY AFTER USE.
 */
require_once __DIR__ . '/config.php';

$email = 'info@twoadminsandamic.com';
$password = 'ChangeMe2025!';
$name = 'Admin';
$role = 'admin';

$db = getDB();

// Check if already exists
$stmt = $db->prepare('SELECT id FROM admin_users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo "Account already exists for $email\n";
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$stmt = $db->prepare('INSERT INTO admin_users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$name, $email, $hash, $role, 'active']);

echo "Admin account created successfully!\n";
echo "Email: $email\n";
echo "Password: $password\n";
echo "\n⚠️ DELETE THIS FILE NOW!\n";
