<?php
/**
 * Database Setup Script
 * Run this ONCE after uploading to Hostinger to create tables and initial admin.
 * 
 * Usage: Visit https://yourdomain.com/api/setup.php in your browser
 * DELETE THIS FILE after running it successfully.
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

try {
    $db = getDB();
    
    // Create users table
    $db->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'manager') NOT NULL DEFAULT 'manager',
            status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
            permissions JSON DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Create sessions table for server-side session tracking
    $db->exec("
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id VARCHAR(128) PRIMARY KEY,
            user_id INT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Create activity log table
    $db->exec("
        CREATE TABLE IF NOT EXISTS admin_activity_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            user_email VARCHAR(255),
            action VARCHAR(50) NOT NULL,
            details TEXT,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Check if admin already exists
    $stmt = $db->prepare('SELECT id FROM admin_users WHERE email = ?');
    $stmt->execute([INITIAL_ADMIN_EMAIL]);
    
    if (!$stmt->fetch()) {
        // Create initial admin account
        $hash = password_hash(INITIAL_ADMIN_PASSWORD, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('INSERT INTO admin_users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, $hash, 'admin', 'active']);
        
        $message = "Setup complete! Initial admin account created.\n\nEmail: " . INITIAL_ADMIN_EMAIL . "\nPassword: " . INITIAL_ADMIN_PASSWORD . "\n\n⚠️ IMPORTANT: Change this password immediately after first login!\n⚠️ DELETE this setup.php file from your server!";
    } else {
        $message = "Tables verified. Admin account already exists.";
    }
    
    jsonResponse([
        'success' => true,
        'message' => $message,
    ]);
    
} catch (PDOException $e) {
    jsonResponse([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
    ], 500);
}
