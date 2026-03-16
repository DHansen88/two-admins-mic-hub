<?php
/**
 * Database & Content Directory Setup Script
 * Run once after deploying to Hostinger to initialize everything.
 *
 * SETUP STEPS:
 * 1. Create a MySQL database on Hostinger
 * 2. Update credentials in config.php
 * 3. Upload the entire site to Hostinger
 * 4. Visit https://yourdomain.com/api/setup.php in your browser
 * 5. Delete this file after setup is complete
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

try {
    $db = getDB();
    
    // ─── Create Tables ───
    
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $db->exec("
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id VARCHAR(128) PRIMARY KEY,
            user_id INT NOT NULL,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $db->exec("
        CREATE TABLE IF NOT EXISTS admin_activity_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            user_email VARCHAR(255) DEFAULT NULL,
            action VARCHAR(100) NOT NULL,
            details TEXT DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_action (action),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // ─── Create Content Directories ───
    
    $siteRoot = realpath(__DIR__ . '/../../');
    $dirs = [
        $siteRoot . '/content',
        $siteRoot . '/content/blog',
        $siteRoot . '/content/podcasts',
        $siteRoot . '/content/trash',
        $siteRoot . '/content/trash/blog',
        $siteRoot . '/content/trash/episode',
        $siteRoot . '/podcast',
    ];
    
    $createdDirs = [];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
            $createdDirs[] = $dir;
        }
    }
    
    // ─── Create Initial Admin Account ───
    
    $stmt = $db->prepare('SELECT id FROM admin_users WHERE email = ?');
    $stmt->execute([INITIAL_ADMIN_EMAIL]);
    
    $adminCreated = false;
    if (!$stmt->fetch()) {
        $hash = password_hash(INITIAL_ADMIN_PASSWORD, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('INSERT INTO admin_users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, $hash, 'admin', 'active']);
        $adminCreated = true;
    }
    
    // ─── Copy source content files to /content/ if not already present ───
    
    $srcBlogDir = $siteRoot . '/src/content/blog';
    $srcPodcastDir = $siteRoot . '/src/content/podcasts';
    $destBlogDir = $siteRoot . '/content/blog';
    $destPodcastDir = $siteRoot . '/content/podcasts';
    
    $copiedFiles = [];
    
    if (is_dir($srcBlogDir)) {
        foreach (glob($srcBlogDir . '/*') as $file) {
            $dest = $destBlogDir . '/' . basename($file);
            if (!file_exists($dest)) {
                copy($file, $dest);
                $copiedFiles[] = basename($file);
            }
        }
    }
    
    if (is_dir($srcPodcastDir)) {
        foreach (glob($srcPodcastDir . '/*.json') as $file) {
            $dest = $destPodcastDir . '/' . basename($file);
            if (!file_exists($dest)) {
                copy($file, $dest);
                $copiedFiles[] = basename($file);
            }
        }
    }
    
    // ─── Generate initial RSS feed ───
    
    $rssGenerated = false;
    $rssFile = $siteRoot . '/podcast/rss.xml';
    if (!file_exists($rssFile) && is_dir($destPodcastDir)) {
        // Simple RSS generation
        $episodes = [];
        foreach (glob($destPodcastDir . '/*.json') as $file) {
            $data = json_decode(file_get_contents($file), true);
            if ($data) $episodes[] = $data;
        }
        usort($episodes, fn($a, $b) => ($b['number'] ?? 0) - ($a['number'] ?? 0));
        
        $siteUrl = 'https://twoadminsandamic.com';
        $rssItems = '';
        foreach ($episodes as $ep) {
            $rssItems .= "    <item>\n";
            $rssItems .= "      <title>" . htmlspecialchars($ep['title'] ?? '') . "</title>\n";
            $rssItems .= "      <description>" . htmlspecialchars($ep['description'] ?? '') . "</description>\n";
            $rssItems .= "      <guid>{$siteUrl}/episodes/" . htmlspecialchars($ep['slug'] ?? '') . "</guid>\n";
            $rssItems .= "    </item>\n";
        }
        
        $rss = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\" xmlns:itunes=\"http://www.itunes.com/dtds/podcast-1.0.dtd\">\n  <channel>\n    <title>Two Admins and a Mic</title>\n    <link>{$siteUrl}</link>\n{$rssItems}  </channel>\n</rss>";
        file_put_contents($rssFile, $rss);
        $rssGenerated = true;
    }
    
    // Log setup action
    $db->prepare('INSERT INTO admin_activity_log (action, details, ip_address) VALUES (?, ?, ?)')
       ->execute(['system_setup', 'Initial setup completed', $_SERVER['REMOTE_ADDR'] ?? '']);
    
    jsonResponse([
        'success' => true,
        'message' => 'Setup completed successfully!',
        'details' => [
            'tables_created' => ['admin_users', 'admin_sessions', 'admin_activity_log'],
            'directories_created' => $createdDirs,
            'content_files_copied' => $copiedFiles,
            'admin_account_created' => $adminCreated,
            'rss_generated' => $rssGenerated,
            'admin_email' => INITIAL_ADMIN_EMAIL,
            'note' => $adminCreated
                ? 'Admin account created. Change the password after first login!'
                : 'Admin account already exists.',
            'important' => 'DELETE THIS FILE (setup.php) after setup is complete!',
        ],
    ]);
    
} catch (Exception $e) {
    jsonResponse([
        'error' => 'Setup failed: ' . $e->getMessage(),
        'hint' => 'Check your database credentials in config.php',
    ], 500);
}
