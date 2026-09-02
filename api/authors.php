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

define('SITE_ROOT', dirname(__DIR__, 2));
define('PUBLIC_ROOT', dirname(__DIR__));

define('AUTHORS_DIR', SITE_ROOT . '/content');
define('AUTHORS_FILE', AUTHORS_DIR . '/authors.json');

define('UPLOADS_ROOT', PUBLIC_ROOT . '/uploads');
define('AUTHOR_IMAGES_DIR', UPLOADS_ROOT . '/headshots');

// Ensure directories exist
if (!is_dir(AUTHORS_DIR)) mkdir(AUTHORS_DIR, 0755, true);
if (!is_dir(UPLOADS_ROOT)) mkdir(UPLOADS_ROOT, 0755, true);
if (!is_dir(AUTHOR_IMAGES_DIR)) mkdir(AUTHOR_IMAGES_DIR, 0755, true);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        handleListAuthors();
        break;
    case 'list-public':
        handleListPublicAuthors();
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
        // Initialize with empty authors file — real authors are added via admin UI
        file_put_contents(AUTHORS_FILE, json_encode((object)[], JSON_PRETTY_PRINT));
        return [];
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

function handleListPublicAuthors(): void {
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
    
    $publicUrl = '/uploads/headshots/' . $filename;
    
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
