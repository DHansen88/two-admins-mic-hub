<?php
/**
 * Content Management API
 * Handles CRUD operations for blog posts and podcast episodes.
 * Reads/writes content files on disk (Hostinger-compatible).
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Content directories (relative to site root)
define('CONTENT_ROOT', dirname(__DIR__, 2) . '/content');
define('BLOG_DIR', CONTENT_ROOT . '/blog');
define('PODCAST_DIR', CONTENT_ROOT . '/podcasts');
define('TRASH_DIR', CONTENT_ROOT . '/trash');

define('SITE_ROOT_CONTENT', dirname(__DIR__, 2));
define('PUBLIC_ROOT_CONTENT', dirname(__DIR__));

define('BLOG_UPLOADS_DIR', PUBLIC_ROOT_CONTENT . '/uploads/blog');
define('PODCAST_UPLOADS_DIR', PUBLIC_ROOT_CONTENT . '/uploads/podcast');

// Ensure directories exist
foreach ([CONTENT_ROOT, BLOG_DIR, PODCAST_DIR, TRASH_DIR, BLOG_UPLOADS_DIR, PODCAST_UPLOADS_DIR] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list-blogs':
        handleListBlogs();
        break;
    case 'list-episodes':
        handleListEpisodes();
        break;
    case 'get-blog':
        handleGetBlog();
        break;
    case 'get-episode':
        handleGetEpisode();
        break;
    case 'save-blog':
        handleSaveBlog();
        break;
    case 'save-episode':
        handleSaveEpisode();
        break;
    case 'delete':
        handleDelete();
        break;
    case 'restore':
        handleRestore();
        break;
    case 'permanent-delete':
        handlePermanentDelete();
        break;
    case 'list-trash':
        handleListTrash();
        break;
    case 'unpublish':
        handleUnpublish();
        break;
    case 'publish':
        handlePublish();
        break;
    case 'activity-log':
        handleActivityLog();
        break;
    case 'upload-blog-image':
        handleUploadBlogImage();
        break;
    case 'upload-podcast-asset':
        handleUploadPodcastAsset();
        break;
    case 'hidden-ids':
        handleHiddenIds();
        break;
    case 'public-list-blogs':
        handlePublicListBlogs();
        break;
    case 'public-get-blog':
        handlePublicGetBlog();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

// ─── Blog Operations ───

function handleListBlogs(): void {
    requireAuth();
    $blogs = [];
    
    if (is_dir(BLOG_DIR)) {
        foreach (glob(BLOG_DIR . '/*.md') as $file) {
            $raw = file_get_contents($file);
            $meta = parseFrontMatter($raw);
            $meta['filename'] = basename($file);
            $meta['status'] = getContentStatus('blog', basename($file, '.md'));
            $blogs[] = $meta;
        }
        foreach (glob(BLOG_DIR . '/*.json') as $file) {
    if (str_ends_with($file, '.html.json')) {
        continue;
    }

    $data = json_decode(file_get_contents($file), true);
    $data['filename'] = basename($file);
    $data['status'] = getContentStatus('blog', basename($file, '.json'));
    $blogs[] = $data;
}
    }
    
    // Sort by date, newest first
    usort($blogs, function($a, $b) {
        $da = strtotime($a['publish_date'] ?? $a['date'] ?? '2000-01-01');
        $db = strtotime($b['publish_date'] ?? $b['date'] ?? '2000-01-01');
        return $db - $da;
    });
    
    jsonResponse(['blogs' => $blogs]);
}

function handleListEpisodes(): void {
    requireAuth();
    $episodes = [];
    
    if (is_dir(PODCAST_DIR)) {
        foreach (glob(PODCAST_DIR . '/*.json') as $file) {
            $data = json_decode(file_get_contents($file), true);
            $data['filename'] = basename($file);
            $data['status'] = getContentStatus('episode', (string)($data['number'] ?? basename($file, '.json')));
            $episodes[] = $data;
        }
    }
    
    // Sort by episode number, highest first
    usort($episodes, function($a, $b) {
        return ($b['number'] ?? 0) - ($a['number'] ?? 0);
    });
    
    jsonResponse(['episodes' => $episodes]);
}

function handleGetBlog(): void {
    requireAuth();
    $slug = $_GET['slug'] ?? '';
    if (!$slug) jsonResponse(['error' => 'Slug required'], 400);
    
    $slug = sanitizeFilename($slug);
    
    // Try .md first, then .json
    $mdFile = BLOG_DIR . "/{$slug}.md";
    $jsonFile = BLOG_DIR . "/{$slug}.json";
    
    if (file_exists($mdFile)) {
        $raw = file_get_contents($mdFile);
        $data = parseFrontMatter($raw);
        $data['_format'] = 'md';
        $data['_raw'] = $raw;
        // Attach html_content if companion file exists
        $htmlJsonFile = BLOG_DIR . "/{$slug}.html.json";
        if (file_exists($htmlJsonFile)) {
            $htmlData = json_decode(file_get_contents($htmlJsonFile), true);
            if ($htmlData && !empty($htmlData['html_content'])) {
                $data['html_content'] = $htmlData['html_content'];
            }
        }
        // Normalize: ensure authors array is canonical, remove stale singular author
        if (!empty($data['authors']) && is_array($data['authors'])) {
            $data['author'] = $data['authors'][0] ?? '';
        } elseif (!empty($data['author'])) {
            $data['authors'] = [$data['author']];
        }
        jsonResponse(['blog' => $data]);
    } elseif (file_exists($jsonFile)) {
        $data = json_decode(file_get_contents($jsonFile), true);
        $data['_format'] = 'json';
        jsonResponse(['blog' => $data]);
    } else {
        jsonResponse(['error' => 'Blog not found'], 404);
    }
}

function handleGetEpisode(): void {
    requireAuth();
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResponse(['error' => 'Episode ID required'], 400);
    
    $id = sanitizeFilename($id);
    $file = PODCAST_DIR . "/{$id}.json";
    
    if (!file_exists($file)) {
        // Try finding by episode number
        foreach (glob(PODCAST_DIR . '/*.json') as $f) {
            $data = json_decode(file_get_contents($f), true);
            if (($data['number'] ?? '') == $id) {
                jsonResponse(['episode' => $data]);
                return;
            }
        }
        jsonResponse(['error' => 'Episode not found'], 404);
    }
    
    $data = json_decode(file_get_contents($file), true);
    jsonResponse(['episode' => $data]);
}

function handleSaveBlog(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    $user = requireAuth();
    checkPermission($user, 'canPublishContent');

    $body = getRequestBody();
    $slug = sanitizeFilename($body['slug'] ?? '');

    if (!$slug) jsonResponse(['error' => 'Slug is required'], 400);
    if (empty($body['title'])) jsonResponse(['error' => 'Title is required'], 400);

    $format = $body['format'] ?? 'md';
    $mdPath = BLOG_DIR . "/{$slug}.md";
    $jsonPath = BLOG_DIR . "/{$slug}.json";
    $htmlJsonPath = BLOG_DIR . "/{$slug}.html.json";

    if ($format === 'md') {
        $frontmatter = "---\n";
        $frontmatter .= 'title: "' . ($body['title'] ?? '') . "\"\n";
        $frontmatter .= 'slug: ' . $slug . "\n";

        $authorList = [];
        if (!empty($body['authors']) && is_array($body['authors'])) {
            $authorList = array_values(array_filter($body['authors'], fn($v) => $v !== ''));
        } elseif (!empty($body['author']) && $body['author'] !== '') {
            $authorList = [$body['author']];
        }

        if (empty($authorList)) {
            jsonResponse(['error' => 'At least one author is required'], 400);
        }

        $frontmatter .= "authors:\n";
        foreach ($authorList as $authorKey) {
            $frontmatter .= "  - " . $authorKey . "\n";
        }

        if (!empty($body['author_avatars']) && is_array($body['author_avatars'])) {
            $hasCustomAvatars = array_filter($body['author_avatars'], fn($v) => !empty($v));
            if (!empty($hasCustomAvatars)) {
                $frontmatter .= "author_avatars:\n";
                foreach ($body['author_avatars'] as $avatar) {
                    $frontmatter .= "  - " . ($avatar ?: '') . "\n";
                }
            }
        }

        $frontmatter .= 'publish_date: ' . ($body['publish_date'] ?? date('Y-m-d')) . "\n";

        if (!empty($body['tags'])) {
            $frontmatter .= 'tags: ' . implode(', ', $body['tags']) . "\n";
        }
        if (!empty($body['excerpt'])) {
            $frontmatter .= 'excerpt: ' . $body['excerpt'] . "\n";
        }
        if (!empty($body['featured_image'])) {
            $frontmatter .= 'featured_image: ' . $body['featured_image'] . "\n";
        }
        if (!empty($body['key_takeaways'])) {
            $frontmatter .= "key_takeaways:\n";
            foreach ($body['key_takeaways'] as $takeaway) {
                $frontmatter .= "  - " . $takeaway . "\n";
            }
        }
        if (!empty($body['related_episode'])) {
            $frontmatter .= 'related_episode: ' . $body['related_episode'] . "\n";
        }
        if (isset($body['show_episode_callout'])) {
            $frontmatter .= 'show_episode_callout: ' . ($body['show_episode_callout'] ? 'true' : 'false') . "\n";
        }

        $frontmatter .= "---\n\n";
        $frontmatter .= $body['content'] ?? '';

        if (!empty($body['html_content']) || !empty($body['tag_styles'])) {
            $htmlData = [];
            if (!empty($body['html_content'])) {
                $htmlData['html_content'] = $body['html_content'];
            }
            if (!empty($body['tag_styles']) && is_array($body['tag_styles'])) {
                $htmlData['tag_styles'] = $body['tag_styles'];
            }
            file_put_contents($htmlJsonPath, json_encode($htmlData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } elseif (file_exists($htmlJsonPath)) {
            unlink($htmlJsonPath);
        }

        file_put_contents($mdPath, $frontmatter);

        if (file_exists($jsonPath)) {
            unlink($jsonPath);
        }
    } else {
        $authorList = [];
        if (!empty($body['authors']) && is_array($body['authors'])) {
            $authorList = array_values(array_filter($body['authors'], fn($v) => $v !== ''));
        } elseif (!empty($body['author']) && $body['author'] !== '') {
            $authorList = [$body['author']];
        }

        if (empty($authorList)) {
            jsonResponse(['error' => 'At least one author is required'], 400);
        }

        $data = [
            'title' => $body['title'],
            'slug' => $slug,
            'authors' => $authorList,
            'publish_date' => $body['publish_date'] ?? date('Y-m-d'),
            'tags' => $body['tags'] ?? [],
            'excerpt' => $body['excerpt'] ?? '',
            'featured_image' => $body['featured_image'] ?? null,
            'key_takeaways' => $body['key_takeaways'] ?? [],
            'content' => $body['content'] ?? '',
        ];

        if (!empty($body['author_avatars']) && is_array($body['author_avatars'])) {
            $hasCustomAvatars = array_filter($body['author_avatars'], fn($v) => !empty($v));
            if (!empty($hasCustomAvatars)) {
                $data['author_avatars'] = $body['author_avatars'];
            }
        }
        if (!empty($body['tag_styles']) && is_array($body['tag_styles'])) {
            $data['tag_styles'] = $body['tag_styles'];
        }

        file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        if (file_exists($mdPath)) {
            unlink($mdPath);
        }

        if (file_exists($htmlJsonPath)) {
            unlink($htmlJsonPath);
        }
    }

    logContentAction($user, 'blog_published', "Published blog: {$body['title']}");
    setContentStatus('blog', $slug, 'published');

    jsonResponse(['success' => true, 'slug' => $slug]);
}

function handleSaveEpisode(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    $user = requireAuth();
    checkPermission($user, 'canPublishContent');
    
    $body = getRequestBody();
    $number = (int)($body['number'] ?? 0);
    
    if (!$number) jsonResponse(['error' => 'Episode number is required'], 400);
    if (empty($body['title'])) jsonResponse(['error' => 'Title is required'], 400);
    
    $slug = $body['slug'] ?? "episode-{$number}-" . slugify($body['title']);
    $filename = "episode-" . str_pad($number, 2, '0', STR_PAD_LEFT);
    
    $data = [
        'number' => $number,
        'title' => $body['title'],
        'slug' => $slug,
        'description' => $body['description'] ?? '',
        'duration' => $body['duration'] ?? '',
        'date' => $body['date'] ?? date('Y-m-d'),
        'topics' => $body['topics'] ?? [],
        'guestName' => $body['guestName'] ?? null,
        'riversideEmbedUrl' => $body['riversideEmbedUrl'] ?? null,
        'thumbnailUrl' => $body['thumbnailUrl'] ?? '/placeholder.svg',
        'audioUrl' => $body['audioUrl'] ?? null,
        'platformLinks' => $body['platformLinks'] ?? null,
        'transcript' => $body['transcript'] ?? null,
        'showNotes' => $body['showNotes'] ?? null,
        'clips' => $body['clips'] ?? null,
    ];
    
    // Remove null values
    $data = array_filter($data, fn($v) => $v !== null);
    
    file_put_contents(
        PODCAST_DIR . "/{$filename}.json",
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
    );
    
    logContentAction($user, 'episode_published', "Published episode {$number}: {$body['title']}");
    setContentStatus('episode', (string)$number, 'published');
    
    jsonResponse(['success' => true, 'filename' => $filename, 'slug' => $slug]);
}

// ─── Delete / Restore / Unpublish ───

function handleDelete(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    $user = requireAuth();
    $body = getRequestBody();
    $type = $body['type'] ?? '';
    $id = $body['id'] ?? '';

    if (!$type || !$id) {
        jsonResponse(['error' => 'Type and ID required'], 400);
    }

    $id = sanitizeFilename($id);
    $sourceDir = $type === 'blog' ? BLOG_DIR : PODCAST_DIR;
    $trashSubDir = TRASH_DIR . "/{$type}";

    if (!is_dir($trashSubDir)) {
        mkdir($trashSubDir, 0755, true);
    }

    $moved = false;
    foreach (['md', 'json'] as $ext) {
        $source = "{$sourceDir}/{$id}.{$ext}";
        if (file_exists($source)) {
            rename($source, "{$trashSubDir}/{$id}.{$ext}");
            $moved = true;
        }
    }

    if (!$moved && $type === 'episode') {
        $padded = "episode-" . str_pad($id, 2, '0', STR_PAD_LEFT);
        $source = "{$sourceDir}/{$padded}.json";
        if (file_exists($source)) {
            rename($source, "{$trashSubDir}/{$padded}.json");
            $moved = true;
        }
    }

    if ($type === 'blog') {
        $htmlSource = "{$sourceDir}/{$id}.html.json";
        $htmlTarget = "{$trashSubDir}/{$id}.html.json";
        if (file_exists($htmlSource)) {
            rename($htmlSource, $htmlTarget);
        }
    }

    setContentStatus($type, $id, 'trashed');
    logContentAction($user, 'content_deleted', "Moved to trash: {$type}/{$id}");

    jsonResponse(['success' => true]);
}

function handleRestore(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    $user = requireAuth();
    $body = getRequestBody();
    $type = $body['type'] ?? '';
    $id = sanitizeFilename($body['id'] ?? '');

    if (!$type || !$id) {
        jsonResponse(['error' => 'Type and ID required'], 400);
    }

    $trashSubDir = TRASH_DIR . "/{$type}";
    $targetDir = $type === 'blog' ? BLOG_DIR : PODCAST_DIR;

    $restored = false;
    foreach (['md', 'json'] as $ext) {
        $source = "{$trashSubDir}/{$id}.{$ext}";
        if (file_exists($source)) {
            rename($source, "{$targetDir}/{$id}.{$ext}");
            $restored = true;
        }
    }

    if (!$restored && $type === 'episode') {
        $padded = "episode-" . str_pad($id, 2, '0', STR_PAD_LEFT);
        $source = "{$trashSubDir}/{$padded}.json";
        if (file_exists($source)) {
            rename($source, "{$targetDir}/{$padded}.json");
            $restored = true;
        }
    }

    if ($type === 'blog') {
        $htmlSource = "{$trashSubDir}/{$id}.html.json";
        $htmlTarget = "{$targetDir}/{$id}.html.json";
        if (file_exists($htmlSource)) {
            rename($htmlSource, $htmlTarget);
        }
    }

    setContentStatus($type, $id, 'published');
    logContentAction($user, 'content_restored', "Restored: {$type}/{$id}");

    jsonResponse(['success' => true]);
}

function handlePermanentDelete(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        // Check manager permission
        $db = getDB();
        $stmt = $db->prepare('SELECT permissions FROM admin_users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();
        $perms = $row ? json_decode($row['permissions'] ?? '{}', true) : [];
        if (empty($perms['canDeleteContent'])) {
            jsonResponse(['error' => 'Permission denied'], 403);
        }
    }
    
    $body = getRequestBody();
    $type = $body['type'] ?? '';
    $id = sanitizeFilename($body['id'] ?? '');
    
    if (!$type || !$id) jsonResponse(['error' => 'Type and ID required'], 400);
    
    $trashSubDir = TRASH_DIR . "/{$type}";
    
    foreach (['md', 'json'] as $ext) {
        $file = "{$trashSubDir}/{$id}.{$ext}";
        if (file_exists($file)) unlink($file);
    }
    
    // Try episode-XX format
    if ($type === 'episode') {
        $padded = "episode-" . str_pad($id, 2, '0', STR_PAD_LEFT);
        $file = "{$trashSubDir}/{$padded}.json";
        if (file_exists($file)) unlink($file);
    }

    if ($type === 'blog') {
        $htmlFile = "{$trashSubDir}/{$id}.html.json";
        if (file_exists($htmlFile)) {
            unlink($htmlFile);
        }
    }
    
    logContentAction($user, 'content_permanently_deleted', "Permanently deleted: {$type}/{$id}");
    
    jsonResponse(['success' => true]);
}

function handleUnpublish(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    
    $user = requireAuth();
    $body = getRequestBody();
    $type = $body['type'] ?? '';
    $id = sanitizeFilename($body['id'] ?? '');
    
    setContentStatus($type, $id, 'unpublished');
    logContentAction($user, 'content_unpublished', "Unpublished: {$type}/{$id}");
    
    jsonResponse(['success' => true]);
}

function handlePublish(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    
    $user = requireAuth();
    checkPermission($user, 'canPublishContent');
    $body = getRequestBody();
    $type = $body['type'] ?? '';
    $id = sanitizeFilename($body['id'] ?? '');
    
    setContentStatus($type, $id, 'published');
    logContentAction($user, 'content_published', "Published: {$type}/{$id}");
    
    jsonResponse(['success' => true]);
}

function handleListTrash(): void {
    requireAuth();
    $items = [];

    foreach (['blog', 'episode'] as $type) {
        $dir = TRASH_DIR . "/{$type}";
        if (!is_dir($dir)) continue;

        foreach (glob($dir . '/*') as $file) {
            if ($type === 'blog' && str_ends_with($file, '.html.json')) {
                continue;
            }

            $ext = pathinfo($file, PATHINFO_EXTENSION);
            $name = basename($file, ".{$ext}");

            if ($ext === 'json') {
                $data = json_decode(file_get_contents($file), true);
                $items[] = [
                    'type' => $type,
                    'id' => $type === 'episode' ? (string)($data['number'] ?? $name) : $name,
                    'title' => $data['title'] ?? $name,
                    'filename' => basename($file),
                    'trashedAt' => date('Y-m-d H:i:s', filemtime($file)),
                ];
            } elseif ($ext === 'md') {
                $raw = file_get_contents($file);
                $meta = parseFrontMatter($raw);
                $items[] = [
                    'type' => $type,
                    'id' => $name,
                    'title' => $meta['title'] ?? $name,
                    'filename' => basename($file),
                    'trashedAt' => date('Y-m-d H:i:s', filemtime($file)),
                ];
            }
        }
    }

    jsonResponse(['items' => $items]);
}

function handleActivityLog(): void {
    requireAuth();
    $db = getDB();
    
    $stmt = $db->query('SELECT * FROM admin_activity_log WHERE action LIKE "content_%" ORDER BY created_at DESC LIMIT 50');
    $log = $stmt->fetchAll();
    
    jsonResponse(['log' => $log]);
}

// ─── Helpers ───

function sanitizeFilename(string $name): string {
    return preg_replace('/[^a-zA-Z0-9_\-]/', '', $name);
}

function slugify(string $text): string {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    return trim($text, '-');
}

function parseFrontMatter(string $raw): array {
    $data = [];
    if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)/s', $raw, $matches)) {
        $yaml = $matches[1];
        $data['_content'] = $matches[2];

        $lines = explode("\n", $yaml);
        $currentKey = '';
        $collectingList = false;

        for ($i = 0; $i < count($lines); $i++) {
            $line = $lines[$i];

            // Check if this is a YAML list item (  - value)
            if (preg_match('/^\s+-\s+(.+)$/', $line, $listMatch)) {
                if ($collectingList && $currentKey) {
                    if (!isset($data[$currentKey]) || !is_array($data[$currentKey])) {
                        $data[$currentKey] = [];
                    }
                    $data[$currentKey][] = trim($listMatch[1], '"\'');
                }
                continue;
            }

            // Key: value line
            if (preg_match('/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/', $line, $kvMatch)) {
                $key = $kvMatch[1];
                $value = trim($kvMatch[2]);
                $currentKey = $key;
                $collectingList = false;

                if ($value === '' || $value === '[]') {
                    // Empty value — next lines may be YAML list items
                    $collectingList = true;
                    $data[$key] = [];
                } elseif (preg_match('/^\[(.+)\]$/', $value, $inlineArr)) {
                    // Inline array: [a, b, c]
                    $data[$key] = array_map(function($s) {
                        return trim(trim($s), '"\'');
                    }, explode(',', $inlineArr[1]));
                } elseif ($key === 'tags' && strpos($value, ',') !== false) {
                    // Comma-separated tags
                    $data[$key] = array_map('trim', explode(',', $value));
                } else {
                    $data[$key] = trim($value, '"\'');
                }
            }
        }
    } else {
        $data['_content'] = $raw;
    }
    return $data;
}

function getContentStatusFile(): string {
    return CONTENT_ROOT . '/content-status.json';
}

function getContentStatuses(): array {
    $file = getContentStatusFile();
    if (file_exists($file)) {
        return json_decode(file_get_contents($file), true) ?? [];
    }
    return [];
}

function setContentStatus(string $type, string $id, string $status): void {
    $statuses = getContentStatuses();
    $statuses["{$type}:{$id}"] = [
        'status' => $status,
        'updatedAt' => date('c'),
    ];
    file_put_contents(getContentStatusFile(), json_encode($statuses, JSON_PRETTY_PRINT));
}

function getContentStatus(string $type, string $id): string {
    $statuses = getContentStatuses();
    return $statuses["{$type}:{$id}"]['status'] ?? 'published';
}

function checkPermission(array $user, string $permission): void {
    if ($user['role'] === 'admin') return;
    
    $db = getDB();
    $stmt = $db->prepare('SELECT permissions FROM admin_users WHERE id = ?');
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    $perms = $row ? json_decode($row['permissions'] ?? '{}', true) : [];
    
    if (empty($perms[$permission]) && empty($perms['fullAdmin'])) {
        jsonResponse(['error' => 'Permission denied'], 403);
    }
}

function logContentAction(array $user, string $action, string $details): void {
    $db = getDB();
    $stmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$user['id'], $user['email'], $action, $details, $_SERVER['REMOTE_ADDR'] ?? '']);
}

function handleUploadBlogImage(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    requireAuth();

    if (empty($_FILES['image'])) {
        jsonResponse(['error' => 'No file uploaded'], 400);
    }

    $file = $_FILES['image'];

    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        jsonResponse(['error' => 'Invalid file type. Allowed: JPG, PNG, WebP, GIF'], 400);
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        jsonResponse(['error' => 'File too large. Maximum 5MB'], 400);
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $slug = preg_replace('/[^a-zA-Z0-9_\-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename = $slug . '-' . time() . '.' . $ext;
    $targetPath = BLOG_UPLOADS_DIR . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        jsonResponse(['error' => 'Failed to save file'], 500);
    }

    $publicUrl = '/uploads/blog/' . $filename;
    jsonResponse(['success' => true, 'url' => $publicUrl]);
}

function handleUploadPodcastAsset(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    requireAuth();

    if (empty($_FILES['file'])) {
        jsonResponse(['error' => 'No file uploaded'], 400);
    }

    $file = $_FILES['file'];
    $type = $_POST['type'] ?? 'audio';

    if ($type === 'cover') {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $maxSize = 5 * 1024 * 1024;
    } else {
        $allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg'];
        $maxSize = 200 * 1024 * 1024;
    }

    if (!in_array($file['type'], $allowedTypes)) {
        $label = $type === 'cover' ? 'JPG, PNG, WebP, GIF' : 'MP3, WAV, M4A, AAC, OGG';
        jsonResponse(['error' => "Invalid file type. Allowed: {$label}"], 400);
    }

    if ($file['size'] > $maxSize) {
        $label = $type === 'cover' ? '5MB' : '200MB';
        jsonResponse(['error' => "File too large. Maximum {$label}"], 400);
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $slug = preg_replace('/[^a-zA-Z0-9_\-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename = $slug . '-' . time() . '.' . $ext;
    $targetPath = PODCAST_UPLOADS_DIR . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        jsonResponse(['error' => 'Failed to save file'], 500);
    }

    $publicUrl = '/uploads/podcast/' . $filename;
    jsonResponse(['success' => true, 'url' => $publicUrl]);
}

// ─── Public: Blog Listing & Detail (no auth) ───

function handlePublicListBlogs(): void {
    $blogs = [];
    $statuses = getContentStatuses();

    if (is_dir(BLOG_DIR)) {
        foreach (glob(BLOG_DIR . '/*.md') as $file) {
            $slug = basename($file, '.md');
            $st = $statuses["blog:{$slug}"]['status'] ?? 'published';
            if ($st !== 'published') continue;

            $raw = file_get_contents($file);
            $meta = parseFrontMatter($raw);
            $meta['slug'] = $meta['slug'] ?? $slug;
            $meta['content'] = $meta['_content'] ?? '';
            unset($meta['_content']);
            // Normalize authors
            if (!empty($meta['authors']) && is_array($meta['authors'])) {
                // authors array is canonical
            } elseif (!empty($meta['author'])) {
                $meta['authors'] = [$meta['author']];
            }
            // Attach html_content if companion file exists
            $htmlJsonFile = BLOG_DIR . "/{$slug}.html.json";
            if (file_exists($htmlJsonFile)) {
                $htmlData = json_decode(file_get_contents($htmlJsonFile), true);
                if ($htmlData && !empty($htmlData['html_content'])) {
                    $meta['html_content'] = $htmlData['html_content'];
                }
                if ($htmlData && !empty($htmlData['tag_styles'])) {
                    $meta['tag_styles'] = $htmlData['tag_styles'];
                }
            }
            $blogs[] = $meta;
        }
        foreach (glob(BLOG_DIR . '/*.json') as $file) {
    if (str_ends_with($file, '.html.json')) {
        continue;
    }

    $slug = basename($file, '.json');
    $st = $statuses["blog:{$slug}"]['status'] ?? 'published';
    if ($st !== 'published') continue;

    $data = json_decode(file_get_contents($file), true);
    $data['slug'] = $data['slug'] ?? $slug;
    $blogs[] = $data;
}
    }

    usort($blogs, function($a, $b) {
        $da = strtotime($a['publish_date'] ?? $a['date'] ?? '2000-01-01');
        $db = strtotime($b['publish_date'] ?? $b['date'] ?? '2000-01-01');
        return $db - $da;
    });

    jsonResponse(['blogs' => $blogs]);
}

function handlePublicGetBlog(): void {
    $slug = sanitizeFilename($_GET['slug'] ?? '');
    if (!$slug) jsonResponse(['error' => 'Slug required'], 400);

    $statuses = getContentStatuses();
    $st = $statuses["blog:{$slug}"]['status'] ?? 'published';
    if ($st !== 'published') jsonResponse(['error' => 'Blog not found'], 404);

    $mdFile = BLOG_DIR . "/{$slug}.md";
    $jsonFile = BLOG_DIR . "/{$slug}.json";

    if (file_exists($mdFile)) {
        $raw = file_get_contents($mdFile);
        $meta = parseFrontMatter($raw);
        $meta['slug'] = $meta['slug'] ?? $slug;
        $meta['content'] = $meta['_content'] ?? '';
        unset($meta['_content']);
        // Attach html_content if companion file exists
        $htmlJsonFile = BLOG_DIR . "/{$slug}.html.json";
        if (file_exists($htmlJsonFile)) {
            $htmlData = json_decode(file_get_contents($htmlJsonFile), true);
            if ($htmlData && !empty($htmlData['html_content'])) {
                $meta['html_content'] = $htmlData['html_content'];
            }
            if ($htmlData && !empty($htmlData['tag_styles'])) {
                $meta['tag_styles'] = $htmlData['tag_styles'];
            }
        }
        jsonResponse(['blog' => $meta]);
    } elseif (file_exists($jsonFile)) {
        $data = json_decode(file_get_contents($jsonFile), true);
        $data['slug'] = $data['slug'] ?? $slug;
        jsonResponse(['blog' => $data]);
    } else {
        jsonResponse(['error' => 'Blog not found'], 404);
    }
}

// ─── Public: Hidden Content IDs ───

function handleHiddenIds(): void {
    // No auth required — this is a public endpoint
    $statuses = getContentStatuses();
    $hidden = ['blogs' => [], 'episodes' => []];

    foreach ($statuses as $key => $value) {
        $status = $value['status'] ?? 'published';
        if ($status !== 'published') {
            $parts = explode(':', $key, 2);
            if (count($parts) === 2) {
                $type = $parts[0];
                $id = $parts[1];
                if ($type === 'blog') {
                    $hidden['blogs'][] = $id;
                } elseif ($type === 'episode') {
                    $hidden['episodes'][] = $id;
                }
            }
        }
    }

    // Also check trash directory for files moved there
    foreach (['blog', 'episode'] as $type) {
        $dir = TRASH_DIR . "/{$type}";
        if (!is_dir($dir)) continue;

        foreach (glob($dir . '/*') as $file) {
            if ($type === 'blog' && str_ends_with($file, '.html.json')) {
                continue;
            }

            $ext = pathinfo($file, PATHINFO_EXTENSION);
            $name = basename($file, ".{$ext}");

            if ($type === 'blog') {
                if (!in_array($name, $hidden['blogs'])) {
                    $hidden['blogs'][] = $name;
                }
            } else {
                $data = json_decode(file_get_contents($file), true);
                $epId = (string)($data['number'] ?? $name);
                if (!in_array($epId, $hidden['episodes'])) {
                    $hidden['episodes'][] = $epId;
                }
            }
        }
    }

    jsonResponse($hidden);
}
