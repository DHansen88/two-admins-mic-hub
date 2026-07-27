<?php
/**
 * Two Admins & a Mic — Anonymous first-party analytics collector
 *
 * POST /api/track.php
 * Body: { "events": [ { "type": "click", "label": "...", "href": "...", "path": "/", ... } ] }
 *
 * Stores anonymous page views and click events in MySQL. No cookies are set and
 * no raw IP address is stored — visitors are identified by a daily salted hash.
 */

require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

const ANALYTICS_MAX_EVENTS_PER_REQUEST = 20;
const ANALYTICS_ALLOWED_TYPES = ['pageview', 'click', 'outbound', 'form'];

function analyticsEnsureTable(PDO $pdo): void {
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS analytics_events (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_type VARCHAR(32) NOT NULL,
            label VARCHAR(191) NOT NULL DEFAULT "",
            category VARCHAR(64) NOT NULL DEFAULT "",
            href VARCHAR(512) NOT NULL DEFAULT "",
            path VARCHAR(255) NOT NULL DEFAULT "",
            referrer VARCHAR(255) NOT NULL DEFAULT "",
            utm_source VARCHAR(128) NOT NULL DEFAULT "",
            utm_medium VARCHAR(128) NOT NULL DEFAULT "",
            utm_campaign VARCHAR(128) NOT NULL DEFAULT "",
            device VARCHAR(16) NOT NULL DEFAULT "",
            browser VARCHAR(32) NOT NULL DEFAULT "",
            os VARCHAR(32) NOT NULL DEFAULT "",
            visitor_hash CHAR(40) NOT NULL DEFAULT "",
            created_at DATETIME NOT NULL,
            INDEX idx_analytics_created (created_at),
            INDEX idx_analytics_type (event_type, created_at),
            INDEX idx_analytics_label (label),
            INDEX idx_analytics_visitor (visitor_hash, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function analyticsClientIp(): string {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $value = explode(',', (string) $_SERVER[$key])[0];
            return trim($value);
        }
    }
    return '';
}

function analyticsVisitorHash(string $userAgent): string {
    $salt = defined('ANALYTICS_SALT') ? (string) ANALYTICS_SALT : 'taam-analytics';
    // Salt rotates daily so the hash cannot be used to track someone over time.
    return sha1($salt . '|' . gmdate('Y-m-d') . '|' . analyticsClientIp() . '|' . $userAgent);
}

function analyticsIsBot(string $userAgent): bool {
    if ($userAgent === '') {
        return true;
    }
    return (bool) preg_match(
        '/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|monitor|curl|wget|python-requests/i',
        $userAgent
    );
}

function analyticsDevice(string $userAgent): string {
    if (preg_match('/ipad|tablet|playbook|silk/i', $userAgent)) return 'tablet';
    if (preg_match('/mobi|iphone|android.*mobile|windows phone/i', $userAgent)) return 'mobile';
    return 'desktop';
}

function analyticsBrowser(string $userAgent): string {
    $map = [
        'Edge' => '/edg[ea]?\//i',
        'Opera' => '/opr\/|opera/i',
        'Samsung' => '/samsungbrowser/i',
        'Chrome' => '/chrome|crios/i',
        'Firefox' => '/firefox|fxios/i',
        'Safari' => '/safari/i',
    ];
    foreach ($map as $name => $pattern) {
        if (preg_match($pattern, $userAgent)) return $name;
    }
    return 'Other';
}

function analyticsOs(string $userAgent): string {
    $map = [
        'iOS' => '/iphone|ipad|ipod/i',
        'Android' => '/android/i',
        'Windows' => '/windows/i',
        'macOS' => '/mac os x|macintosh/i',
        'Linux' => '/linux/i',
    ];
    foreach ($map as $name => $pattern) {
        if (preg_match($pattern, $userAgent)) return $name;
    }
    return 'Other';
}

function analyticsClean($value, int $max): string {
    if (!is_string($value)) return '';
    $value = trim(preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '');
    if ($value === '') return '';
    return mb_substr($value, 0, $max);
}

function analyticsCleanPath($value): string {
    $path = analyticsClean($value, 255);
    if ($path === '') return '';
    if (preg_match('#^https?://#i', $path)) {
        $parts = parse_url($path);
        $path = ($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '');
    }
    if ($path[0] !== '/') $path = '/' . $path;
    return mb_substr($path, 0, 255);
}

function analyticsRateLimited(string $visitorHash): bool {
    $dir = sys_get_temp_dir() . '/taam-analytics';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    if (!is_dir($dir) || !is_writable($dir)) return false;

    $file = $dir . '/' . substr($visitorHash, 0, 16) . '.json';
    $now = time();
    $window = 60;
    $limit = 120;

    $data = ['start' => $now, 'count' => 0];
    if (is_file($file)) {
        $decoded = json_decode((string) @file_get_contents($file), true);
        if (is_array($decoded) && isset($decoded['start'], $decoded['count'])) {
            $data = $decoded;
        }
    }

    if ($now - (int) $data['start'] > $window) {
        $data = ['start' => $now, 'count' => 0];
    }

    $data['count'] = (int) $data['count'] + 1;
    @file_put_contents($file, json_encode($data));

    return $data['count'] > $limit;
}

// ─── Handle request ──────────────────────────────────────────
$userAgent = analyticsClean($_SERVER['HTTP_USER_AGENT'] ?? '', 400);

// Always answer fast and quietly; tracking must never break the page.
function analyticsDone(): void {
    http_response_code(204);
    exit;
}

if (analyticsIsBot($userAgent)) {
    analyticsDone();
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 20000) {
    analyticsDone();
}

$payload = json_decode($raw ?: '[]', true);
$events = is_array($payload['events'] ?? null) ? $payload['events'] : [];
if (empty($events)) {
    analyticsDone();
}

$visitorHash = analyticsVisitorHash($userAgent);
if (analyticsRateLimited($visitorHash)) {
    analyticsDone();
}

$device = analyticsDevice($userAgent);
$browser = analyticsBrowser($userAgent);
$os = analyticsOs($userAgent);
$now = gmdate('Y-m-d H:i:s');

try {
    $pdo = getDB();
    analyticsEnsureTable($pdo);

    $stmt = $pdo->prepare(
        'INSERT INTO analytics_events
            (event_type, label, category, href, path, referrer, utm_source, utm_medium, utm_campaign, device, browser, os, visitor_hash, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );

    $count = 0;
    foreach ($events as $event) {
        if (!is_array($event) || $count >= ANALYTICS_MAX_EVENTS_PER_REQUEST) break;

        $type = analyticsClean($event['type'] ?? '', 32);
        if (!in_array($type, ANALYTICS_ALLOWED_TYPES, true)) continue;

        $path = analyticsCleanPath($event['path'] ?? '');
        // Never record admin activity.
        if ($path === '' || str_starts_with($path, '/admin')) continue;

        $stmt->execute([
            $type,
            analyticsClean($event['label'] ?? '', 191),
            analyticsClean($event['category'] ?? '', 64),
            analyticsClean($event['href'] ?? '', 512),
            $path,
            analyticsClean($event['referrer'] ?? '', 255),
            analyticsClean($event['utm_source'] ?? '', 128),
            analyticsClean($event['utm_medium'] ?? '', 128),
            analyticsClean($event['utm_campaign'] ?? '', 128),
            $device,
            $browser,
            $os,
            $visitorHash,
            $now,
        ]);
        $count++;
    }
} catch (Throwable $e) {
    error_log('[analytics] ' . $e->getMessage());
}

analyticsDone();
