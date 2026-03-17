<?php
/**
 * Author Management API
 * CRUD operations for author profiles.
 * Stores authors in a JSON file on disk (Hostinger-compatible).
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('AUTHORS_DIR', realpath(__DIR__ . '/../../') . '/content');
define('AUTHORS_FILE', AUTHORS_DIR . '/authors.json');
define('AUTHOR_IMAGES_DIR', realpath(__DIR__ . '/../../') . '/assets/images/authors');

// Ensure directories exist
if (!is_dir(AUTHORS_DIR)) mkdir(AUTHORS_DIR, 0755, true);
if (!is_dir(AUTHOR_IMAGES_DIR)) mkdir(AUTHOR_IMAGES_DIR, 0755, true);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        handleListAuthors();
        break;
    case 'get':
        handleGetAuthor();
        break;
    case 'save':
        handleSaveAuthor();
        break;
    case 'delete':
        handleDeleteAuthor();
        break;
    case 'upload-headshot':
        handleUploadHeadshot();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function loadAuthors(): array {
    if (!file_exists(AUTHORS_FILE)) {
        // Initialize with default authors
        $defaults = [
            'sarah' => [
                'id' => 'sarah',
                'name' => 'Sarah Mitchell',
                'role' => 'Co-Host & Leadership Coach',
                'bio' => 'Sarah brings 15 years of administrative leadership experience and is passionate about empowering others to reach their full potential.',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
                'linkedin' => '',
                'website' => '',
            ],
            'marcus' => [
                'id' => 'marcus',
                'name' => 'Marcus Chen',
                'role' => 'Co-Host & Operations Expert',
                'bio' => 'Marcus has spent two decades in administrative roles across Fortune 500 companies and loves sharing practical strategies that work.',
                'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                'linkedin' => '',
                'website' => '',
            ],
        ];
        file_put_contents(AUTHORS_FILE, json_encode($defaults, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        return $defaults;
    }
    return json_decode(file_get_contents(AUTHORS_FILE), true) ?? [];
}

function saveAuthors(array $authors): void {
    file_put_contents(AUTHORS_FILE, json_encode($authors, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function handleListAuthors(): void {
    requireAuth();
    $authors = loadAuthors();
    jsonResponse(['authors' => $authors]);
}

function handleGetAuthor(): void {
    requireAuth();
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResponse(['error' => 'Author ID required'], 400);
    
    $authors = loadAuthors();
    if (!isset($authors[$id])) {
        jsonResponse(['error' => 'Author not found'], 404);
    }
    jsonResponse(['author' => $authors[$id]]);
}

function handleSaveAuthor(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $user = requireAuth();
    $body = getRequestBody();
    
    $id = $body['id'] ?? '';
    if (!$id) {
        // Generate ID from name
        $id = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', trim($body['name'] ?? 'author')));
        $id = trim($id, '-');
    }
    
    if (empty($body['name'])) {
        jsonResponse(['error' => 'Author name is required'], 400);
    }
    
    $authors = loadAuthors();
    
    $authors[$id] = [
        'id' => $id,
        'name' => $body['name'],
        'role' => $body['role'] ?? '',
        'bio' => $body['bio'] ?? '',
        'avatar' => $body['avatar'] ?? '',
        'linkedin' => $body['linkedin'] ?? '',
        'website' => $body['website'] ?? '',
    ];
    
    saveAuthors($authors);
    logContentAction($user, 'author_saved', "Saved author: {$body['name']}");
    
    jsonResponse(['success' => true, 'id' => $id, 'author' => $authors[$id]]);
}

function handleDeleteAuthor(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        jsonResponse(['error' => 'Admin access required'], 403);
    }
    
    $body = getRequestBody();
    $id = $body['id'] ?? '';
    
    if (!$id) jsonResponse(['error' => 'Author ID required'], 400);
    
    $authors = loadAuthors();
    $name = $authors[$id]['name'] ?? $id;
    unset($authors[$id]);
    saveAuthors($authors);
    
    logContentAction($user, 'author_deleted', "Deleted author: {$name}");
    
    jsonResponse(['success' => true]);
}

function handleUploadHeadshot(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    requireAuth();
    
    if (empty($_FILES['headshot'])) {
        jsonResponse(['error' => 'No file uploaded'], 400);
    }
    
    $file = $_FILES['headshot'];
    $authorId = $_POST['author_id'] ?? 'unknown';
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        jsonResponse(['error' => 'Invalid file type. Allowed: JPG, PNG, WebP, GIF'], 400);
    }
    
    // Max 5MB
    if ($file['size'] > 5 * 1024 * 1024) {
        jsonResponse(['error' => 'File too large. Maximum 5MB'], 400);
    }
    
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = preg_replace('/[^a-zA-Z0-9_\-]/', '', $authorId) . '.' . $ext;
    $targetPath = AUTHOR_IMAGES_DIR . '/' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        jsonResponse(['error' => 'Failed to save file'], 500);
    }
    
    $publicUrl = '/assets/images/authors/' . $filename;
    
    jsonResponse(['success' => true, 'url' => $publicUrl]);
}

function logContentAction($user, $action, $details): void {
    try {
        $db = getDB();
        $stmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_name, action, details, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([$user['id'], $user['name'], $action, $details]);
    } catch (Exception $e) {
        // Silently fail — logging shouldn't break functionality
    }
}
