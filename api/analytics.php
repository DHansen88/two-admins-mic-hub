<?php
/**
 * Two Admins & a Mic — Analytics reporting API (admin only)
 *
 * GET /api/analytics.php?days=30
 * GET /api/analytics.php?start=2026-01-01&end=2026-01-31
 */

require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

requireAuth();

function analyticsTableExists(PDO $pdo): bool {
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'analytics_events'");
        return $stmt !== false && $stmt->fetchColumn() !== false;
    } catch (Throwable $e) {
        return false;
    }
}

function analyticsResolveRange(): array {
    $start = isset($_GET['start']) ? trim((string) $_GET['start']) : '';
    $end = isset($_GET['end']) ? trim((string) $_GET['end']) : '';

    $valid = static fn(string $d): bool => (bool) preg_match('/^\d{4}-\d{2}-\d{2}$/', $d);

    if ($valid($start) && $valid($end)) {
        return [$start . ' 00:00:00', $end . ' 23:59:59', $start, $end];
    }

    $days = isset($_GET['days']) ? (int) $_GET['days'] : 30;
    if ($days < 1 || $days > 365) $days = 30;

    $endDate = gmdate('Y-m-d');
    $startDate = gmdate('Y-m-d', strtotime("-" . ($days - 1) . " days", strtotime($endDate)));

    return [$startDate . ' 00:00:00', $endDate . ' 23:59:59', $startDate, $endDate];
}

[$from, $to, $startDate, $endDate] = analyticsResolveRange();

try {
    $pdo = getDB();
} catch (Throwable $e) {
    jsonResponse(['error' => 'Database unavailable'], 500);
}

if (!analyticsTableExists($pdo)) {
    jsonResponse([
        'range' => ['start' => $startDate, 'end' => $endDate],
        'empty' => true,
        'totals' => ['pageviews' => 0, 'visitors' => 0, 'clicks' => 0, 'outbound' => 0],
        'timeseries' => [],
        'top_pages' => [],
        'top_links' => [],
        'top_episodes' => [],
        'top_referrers' => [],
        'devices' => [],
    ]);
}

function analyticsRows(PDO $pdo, string $sql, array $params): array {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll() ?: [];
}

$range = [$from, $to];

$totalsRow = analyticsRows($pdo,
    "SELECT
        SUM(event_type = 'pageview') AS pageviews,
        SUM(event_type IN ('click','outbound','form')) AS clicks,
        SUM(event_type = 'outbound') AS outbound,
        COUNT(DISTINCT visitor_hash) AS visitors
     FROM analytics_events
     WHERE created_at BETWEEN ? AND ?", $range)[0] ?? [];

$timeseries = analyticsRows($pdo,
    "SELECT DATE(created_at) AS day,
            SUM(event_type = 'pageview') AS pageviews,
            SUM(event_type IN ('click','outbound','form')) AS clicks,
            COUNT(DISTINCT visitor_hash) AS visitors
     FROM analytics_events
     WHERE created_at BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY day ASC", $range);

$topPages = analyticsRows($pdo,
    "SELECT path AS label, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
     FROM analytics_events
     WHERE created_at BETWEEN ? AND ? AND event_type = 'pageview'
     GROUP BY path
     ORDER BY views DESC
     LIMIT 25", $range);

$topLinks = analyticsRows($pdo,
    "SELECT label, category, href, COUNT(*) AS clicks, COUNT(DISTINCT visitor_hash) AS visitors
     FROM analytics_events
     WHERE created_at BETWEEN ? AND ? AND event_type IN ('click','outbound','form') AND label <> ''
     GROUP BY label, category, href
     ORDER BY clicks DESC
     LIMIT 30", $range);

$topEpisodes = analyticsRows($pdo,
    "SELECT path AS label, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
     FROM analytics_events
     WHERE created_at BETWEEN ? AND ? AND event_type = 'pageview' AND path LIKE '/episodes/%'
     GROUP BY path
     ORDER BY views DESC
     LIMIT 20", $range);

$topReferrers = analyticsRows($pdo,
    "SELECT
        CASE WHEN referrer = '' THEN 'Direct / none' ELSE referrer END AS label,
        COUNT(*) AS visits,
        COUNT(DISTINCT visitor_hash) AS visitors
     FROM analytics_events
     WHERE created_at BETWEEN ? AND ? AND event_type = 'pageview'
     GROUP BY label
     ORDER BY visits DESC
     LIMIT 20", $range);

$devices = analyticsRows($pdo,
    "SELECT device AS label, COUNT(DISTINCT visitor_hash) AS visitors, COUNT(*) AS events
     FROM analytics_events
     WHERE created_at BETWEEN ? AND ?
     GROUP BY device
     ORDER BY events DESC", $range);

jsonResponse([
    'range' => ['start' => $startDate, 'end' => $endDate],
    'empty' => false,
    'totals' => [
        'pageviews' => (int) ($totalsRow['pageviews'] ?? 0),
        'visitors' => (int) ($totalsRow['visitors'] ?? 0),
        'clicks' => (int) ($totalsRow['clicks'] ?? 0),
        'outbound' => (int) ($totalsRow['outbound'] ?? 0),
    ],
    'timeseries' => array_map(static fn($r) => [
        'day' => $r['day'],
        'pageviews' => (int) $r['pageviews'],
        'clicks' => (int) $r['clicks'],
        'visitors' => (int) $r['visitors'],
    ], $timeseries),
    'top_pages' => $topPages,
    'top_links' => $topLinks,
    'top_episodes' => $topEpisodes,
    'top_referrers' => $topReferrers,
    'devices' => $devices,
]);
