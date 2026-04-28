<?php
/**
 * Two Admins & a Mic — Tags API
 * 
 * GET    /api/tags.php         — List all tags (public)
 * POST   /api/tags.php         — Create a new tag (auth required)
 * PUT    /api/tags.php?slug=x  — Update a tag (auth required)
 * DELETE /api/tags.php?slug=x  — Delete a tag (auth required)
 */

require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

defined('TAGS_STORAGE_FILE') || define('TAGS_STORAGE_FILE', dirname(__DIR__, 2) . '/storage/tags.json');

$defaultTags = [
    ['name' => 'Leadership', 'slug' => 'leadership', 'color' => '199 62% 28%', 'bgColor' => '#2FBF71', 'textColor' => '#ffffff'],
    ['name' => 'Career Growth', 'slug' => 'career-growth', 'color' => '160 60% 35%', 'bgColor' => '#5A7DFF', 'textColor' => '#ffffff'],
    ['name' => 'Communication', 'slug' => 'communication', 'color' => '25 85% 55%', 'bgColor' => '#FF8A00', 'textColor' => '#ffffff'],
    ['name' => 'Technology', 'slug' => 'technology', 'color' => '250 55% 50%', 'bgColor' => '#7C5AFF', 'textColor' => '#ffffff'],
    ['name' => 'Admin Life', 'slug' => 'admin-life', 'color' => '340 65% 50%', 'bgColor' => '#FF3B7A', 'textColor' => '#ffffff'],
    ['name' => 'Wellness', 'slug' => 'wellness', 'color' => '140 50% 40%', 'bgColor' => '#33A66E', 'textColor' => '#ffffff'],
    ['name' => 'Team Building', 'slug' => 'team-building', 'color' => '210 60% 45%', 'bgColor' => '#3A8FD6', 'textColor' => '#ffffff'],
    ['name' => 'Humor & Human Moments', 'slug' => 'humor-human-moments', 'color' => '45 80% 50%', 'bgColor' => '#E6A817', 'textColor' => '#1a1a1a'],
];

function ensureTagsFile(): string {
    global $defaultTags;
    $dir = dirname(TAGS_STORAGE_FILE);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    if (!file_exists(TAGS_STORAGE_FILE)) {
        file_put_contents(TAGS_STORAGE_FILE, json_encode($defaultTags, JSON_PRETTY_PRINT));
    }
    return TAGS_STORAGE_FILE;
}

function loadTags(): array {
    global $defaultTags;
    $file = ensureTagsFile();
    $raw = @file_get_contents($file);
    $tags = json_decode($raw ?: '[]', true);
    return is_array($tags) && count($tags) > 0 ? $tags : $defaultTags;
}

function saveTags(array $tags): void {
    $file = ensureTagsFile();
    file_put_contents($file, json_encode(array_values($tags), JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        jsonResponse(['tags' => loadTags()]);
        break;

    case 'POST':
        requireAuth();
        $body = getRequestBody();
        if (empty($body['name']) || empty($body['slug'])) {
            jsonResponse(['error' => 'name and slug are required'], 400);
        }
        $tags = loadTags();
        foreach ($tags as $t) {
            if ($t['slug'] === $body['slug']) {
                jsonResponse(['error' => 'Tag with this slug already exists'], 409);
            }
        }
        $newTag = [
            'name' => $body['name'],
            'slug' => $body['slug'],
            'color' => $body['color'] ?? '200 50% 50%',
            'bgColor' => $body['bgColor'] ?? '#5A7DFF',
            'textColor' => $body['textColor'] ?? '#ffffff',
        ];
        if (!empty($body['borderColor'])) {
            $newTag['borderColor'] = $body['borderColor'];
        }
        $tags[] = $newTag;
        saveTags($tags);
        jsonResponse(['tag' => $newTag, 'tags' => $tags], 201);
        break;

    case 'PUT':
        requireAuth();
        $slug = $_GET['slug'] ?? '';
        if (!$slug) {
            jsonResponse(['error' => 'slug query parameter is required'], 400);
        }
        $body = getRequestBody();
        $tags = loadTags();
        $found = false;
        foreach ($tags as &$t) {
            if ($t['slug'] === $slug) {
                if (!empty($body['name'])) $t['name'] = $body['name'];
                if (!empty($body['slug'])) $t['slug'] = $body['slug'];
                if (isset($body['color'])) $t['color'] = $body['color'];
                if (isset($body['bgColor'])) $t['bgColor'] = $body['bgColor'];
                if (isset($body['textColor'])) $t['textColor'] = $body['textColor'];
                if (isset($body['borderColor'])) $t['borderColor'] = $body['borderColor'];
                $found = true;
                break;
            }
        }
        unset($t);
        if (!$found) {
            jsonResponse(['error' => 'Tag not found'], 404);
        }
        saveTags($tags);
        jsonResponse(['tags' => $tags]);
        break;

    case 'DELETE':
        requireAuth();
        $slug = $_GET['slug'] ?? '';
        if (!$slug) {
            jsonResponse(['error' => 'slug query parameter is required'], 400);
        }
        $tags = loadTags();
        $tags = array_values(array_filter($tags, fn($t) => $t['slug'] !== $slug));
        saveTags($tags);
        jsonResponse(['tags' => $tags]);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
