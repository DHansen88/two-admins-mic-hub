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
define('LEGACY_NEWSLETTER_HEADING', 'Two Admins And A Mic');
define('LEGACY_NEWSLETTER_DESCRIPTION', 'The podcast celebrating the power, creativity, and leadership of administrative professionals. One real story at a time.');

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
                'title' => 'This Website is currently under construction.',
                'active' => true,
                'delaySeconds' => 2,
                'content' => '<p>The admins are behind the scenes, fixing the formatting, organizing the tabs, and making it look easy.</p><p>Subscribe below, and we’ll send the update when everything goes live.</p>',
                'contentBlocks' => [],
                'newsletterConfig' => [
                    'enabled' => true,
                    'heading' => 'Join our Community',
                    'description' => '',
                    'buttonText' => 'Subscribe',
                    'showConantLeadership' => true,
                    'conantLeadershipLabel' => 'Subscribe to the ConantLeadership Newsletter.',
                ],
                'buttonConfig' => null,
                'displayPages' => 'homepage',
                'cooldownDays' => 7,
            ],
        ];
        file_put_contents(POPUPS_FILE, json_encode($seed, JSON_PRETTY_PRINT));
        return $seed;
    }
    $popups = json_decode(file_get_contents(POPUPS_FILE), true) ?? [];

    // Migrate older popup records that only stored legacy content blocks.
    foreach ($popups as &$popup) {
        if (!array_key_exists('buttonConfig', $popup)) {
            $popup['buttonConfig'] = null;
        }

        if (!array_key_exists('newsletterConfig', $popup) || $popup['newsletterConfig'] === null) {
            $popup['newsletterConfig'] = null;
        }

        if (
            empty($popup['newsletterConfig'])
            && !empty($popup['contentBlocks'])
            && is_array($popup['contentBlocks'])
        ) {
            foreach ($popup['contentBlocks'] as $block) {
                if (($block['type'] ?? '') !== 'newsletter') {
                    continue;
                }

                $popup['newsletterConfig'] = [
                    'enabled' => true,
                    'heading' => $block['heading'] ?? 'Join our Community',
                    'description' => $block['description'] ?? '',
                    'buttonText' => $block['buttonText'] ?? 'Subscribe',
                    'showConantLeadership' => $block['showConantLeadership'] ?? true,
                    'conantLeadershipLabel' => $block['conantLeadershipLabel'] ?? 'Subscribe to the ConantLeadership Newsletter.',
                ];
                break;
            }
        }

        $popup['newsletterConfig'] = normalizeNewsletterConfig($popup['newsletterConfig']);
    }
    unset($popup);

    return $popups;
}

function savePopups(array $popups): void {
    file_put_contents(POPUPS_FILE, json_encode($popups, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function normalizeNewsletterConfig(?array $newsletterConfig): ?array {
    if ($newsletterConfig === null) {
        return null;
    }

    if (($newsletterConfig['heading'] ?? '') === LEGACY_NEWSLETTER_HEADING) {
        $newsletterConfig['heading'] = 'Join our Community';
    }

    if (($newsletterConfig['description'] ?? '') === LEGACY_NEWSLETTER_DESCRIPTION) {
        $newsletterConfig['description'] = '';
    }

    return $newsletterConfig;
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
        'buttonConfig' => $body['buttonConfig'] ?? null,
        'newsletterConfig' => $body['newsletterConfig'] ?? null,
        'displayPages' => $body['displayPages'] ?? 'homepage',
        'cooldownDays' => (int)($body['cooldownDays'] ?? 7),
    ];
    $popup['newsletterConfig'] = normalizeNewsletterConfig($popup['newsletterConfig']);

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
