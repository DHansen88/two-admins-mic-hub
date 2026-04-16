<?php
/**
 * Popup Management API
 * CRUD operations for site popups.
 * Stores popups in a JSON file on disk (Hostinger-compatible).
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('POPUPS_DIR', dirname(__DIR__, 2) . '/content');
define('POPUPS_FILE', POPUPS_DIR . '/popups.json');

if (!is_dir(POPUPS_DIR)) mkdir(POPUPS_DIR, 0755, true);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        handleListPopups();
        break;
    case 'public-list':
        handlePublicListPopups();
        break;
    case 'save':
        handleSavePopup();
        break;
    case 'delete':
        handleDeletePopup();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function loadPopups(): array {
    if (!file_exists(POPUPS_FILE)) {
        // Seed with default newsletter popup
        $seed = [
            [
                'id' => 'popup-001',
                'title' => 'Newsletter Signup',
                'active' => true,
                'delaySeconds' => 2,
                'content' => '',
                'contentBlocks' => [
                    [
                        'type' => 'newsletter',
                        'id' => 'pb-seed-newsletter',
                        'heading' => 'Two Admins And A Mic',
                        'description' => 'The podcast celebrating the power, creativity, and leadership of administrative professionals. One real story at a time.',
                        'buttonText' => 'Subscribe',
                        'showConantLeadership' => true,
                        'conantLeadershipLabel' => 'Subscribe to the ConantLeadership Newsletter.',
                    ],
                ],
                'displayPages' => 'homepage',
                'cooldownDays' => 7,
            ],
        ];
        file_put_contents(POPUPS_FILE, json_encode($seed, JSON_PRETTY_PRINT));
        return $seed;
    }
    return json_decode(file_get_contents(POPUPS_FILE), true) ?? [];
}

function savePopups(array $popups): void {
    file_put_contents(POPUPS_FILE, json_encode($popups, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function handleListPopups(): void {
    requireAuth();
    jsonResponse(['popups' => loadPopups()]);
}

function handlePublicListPopups(): void {
    // Public endpoint — only return active popups
    $popups = loadPopups();
    $active = array_values(array_filter($popups, fn($p) => !empty($p['active'])));
    jsonResponse(['popups' => $active]);
}

function handleSavePopup(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    requireAuth();
    $body = getRequestBody();

    $id = $body['id'] ?? '';
    $popups = loadPopups();

    $popup = [
        'id' => $id ?: ('popup-' . time()),
        'title' => $body['title'] ?? 'Untitled',
        'active' => $body['active'] ?? true,
        'delaySeconds' => (int)($body['delaySeconds'] ?? 2),
        'content' => $body['content'] ?? '',
        'contentBlocks' => $body['contentBlocks'] ?? [],
        'displayPages' => $body['displayPages'] ?? 'homepage',
        'cooldownDays' => (int)($body['cooldownDays'] ?? 7),
    ];

    // Update existing or add new
    $found = false;
    foreach ($popups as $i => $p) {
        if ($p['id'] === $popup['id']) {
            $popups[$i] = $popup;
            $found = true;
            break;
        }
    }
    if (!$found) {
        $popups[] = $popup;
    }

    savePopups($popups);
    jsonResponse(['success' => true, 'popup' => $popup]);
}

function handleDeletePopup(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    requireAuth();
    $body = getRequestBody();
    $id = $body['id'] ?? '';

    if (!$id) jsonResponse(['error' => 'Popup ID required'], 400);

    $popups = loadPopups();
    $popups = array_values(array_filter($popups, fn($p) => $p['id'] !== $id));
    savePopups($popups);

    jsonResponse(['success' => true]);
}
