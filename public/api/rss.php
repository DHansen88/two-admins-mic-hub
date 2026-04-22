<?php
/**
 * Dynamic RSS Feed Generator
 * Generates /podcast/rss.xml from content files on each request.
 * Can be called directly or via a cron job to regenerate the static XML.
 */

require_once __DIR__ . '/config.php';

define('RSS_SITE_ROOT', dirname(__DIR__, 2));
define('RSS_PUBLIC_ROOT', dirname(__DIR__));
define('RSS_PODCAST_DIR', RSS_SITE_ROOT . '/content/podcasts');
define('RSS_STATUS_FILE', RSS_SITE_ROOT . '/content/content-status.json');
define('RSS_SITE_URL', 'https://twoadminsandamic.com');
define('RSS_OWNER_NAME', 'Two Admins and a Mic');
define('RSS_OWNER_EMAIL', 'info@twoadminsandamic.com');
define('RSS_SHOW_DESCRIPTION', 'Honest, practical conversations about leadership, executive support, and the real work behind the administrative profession.');
define('RSS_SHOW_SUBTITLE', 'Leadership, executive support, and the real work behind the administrative profession.');
define('RSS_SHOW_COPYRIGHT', 'Copyright ' . date('Y') . ' Two Admins and a Mic');
define('RSS_SHOW_EXPLICIT', false);
define('RSS_SHOW_IMAGE', RSS_SITE_URL . '/podcast-cover.png');
define('RSS_PLACEHOLDER_IMAGE', '/placeholder.svg');

function rssAbsoluteUrl(?string $url): ?string {
    if (!$url) {
        return null;
    }

    $trimmed = trim($url);
    if ($trimmed === '' || $trimmed === '#') {
        return null;
    }

    if (preg_match('/^https?:\/\//i', $trimmed)) {
        return $trimmed;
    }

    return RSS_SITE_URL . (str_starts_with($trimmed, '/') ? $trimmed : '/' . $trimmed);
}

function rssPublicPath(?string $url): ?string {
    if (!$url) {
        return null;
    }

    $trimmed = trim($url);
    if ($trimmed === '' || !str_starts_with($trimmed, '/')) {
        return null;
    }

    return RSS_PUBLIC_ROOT . $trimmed;
}

function rssDuration(?string $duration): string {
    $value = trim((string)$duration);
    if ($value === '') {
        return '00:00';
    }

    if (preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $value)) {
        return $value;
    }

    if (preg_match('/^(\d+)\s*min/i', $value, $matches)) {
        return str_pad($matches[1], 2, '0', STR_PAD_LEFT) . ':00';
    }

    return $value;
}

function rssExplicitValue(array $episode): string {
    if (array_key_exists('explicit', $episode)) {
        return !empty($episode['explicit']) ? 'true' : 'false';
    }

    if (array_key_exists('isExplicit', $episode)) {
        return !empty($episode['isExplicit']) ? 'true' : 'false';
    }

    // Keep individual episodes clean by default unless an episode-level
    // flag is added in content later. The show itself is marked explicit.
    return 'false';
}

function rssEnclosureMimeType(?string $url): string {
    $path = parse_url((string)$url, PHP_URL_PATH) ?: '';
    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

    return match ($extension) {
        'm4a' => 'audio/mp4',
        'aac' => 'audio/aac',
        'wav' => 'audio/wav',
        'ogg', 'oga' => 'audio/ogg',
        default => 'audio/mpeg',
    };
}

function rssPreferredEpisodeImage(array $episode): string {
    $guestImage = rssAbsoluteUrl($episode['guest']['image'] ?? null);
    if ($guestImage) {
        return $guestImage;
    }

    $thumbnailUrl = $episode['thumbnailUrl'] ?? null;
    if ($thumbnailUrl && trim((string)$thumbnailUrl) !== RSS_PLACEHOLDER_IMAGE) {
        $thumbnailImage = rssAbsoluteUrl((string)$thumbnailUrl);
        if ($thumbnailImage) {
            return $thumbnailImage;
        }
    }

    return RSS_SHOW_IMAGE;
}

// Load content statuses
$statuses = [];
if (file_exists(RSS_STATUS_FILE)) {
    $statuses = json_decode(file_get_contents(RSS_STATUS_FILE), true) ?? [];
}

// Load episodes
$episodes = [];
if (is_dir(RSS_PODCAST_DIR)) {
    foreach (glob(RSS_PODCAST_DIR . '/*.json') as $file) {
        $data = json_decode(file_get_contents($file), true);
        if (!$data) continue;
        
        $number = (string)($data['number'] ?? '');
        $key = "episode:{$number}";
        $status = $statuses[$key]['status'] ?? 'published';
        
        // Skip unpublished and trashed episodes
        if ($status !== 'published') continue;
        if (empty($data['audioUrl'])) continue;
        
        $episodes[] = $data;
    }
}

// Sort by episode number descending
usort($episodes, function($a, $b) {
    return ($b['number'] ?? 0) - ($a['number'] ?? 0);
});

// Generate RSS XML
header('Content-Type: application/rss+xml; charset=UTF-8');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><?= htmlspecialchars(RSS_OWNER_NAME) ?></title>
    <link><?= htmlspecialchars(RSS_SITE_URL) ?></link>
    <description><?= htmlspecialchars(RSS_SHOW_DESCRIPTION) ?></description>
    <copyright><?= htmlspecialchars(RSS_SHOW_COPYRIGHT) ?></copyright>
    <language>en-us</language>
    <lastBuildDate><?= gmdate('D, d M Y H:i:s T') ?></lastBuildDate>
    <itunes:author><?= htmlspecialchars(RSS_OWNER_NAME) ?></itunes:author>
    <itunes:summary><?= htmlspecialchars(RSS_SHOW_DESCRIPTION) ?></itunes:summary>
    <itunes:subtitle><?= htmlspecialchars(RSS_SHOW_SUBTITLE) ?></itunes:subtitle>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit><?= RSS_SHOW_EXPLICIT ? 'true' : 'false' ?></itunes:explicit>
    <itunes:image href="<?= htmlspecialchars(RSS_SHOW_IMAGE) ?>" />
    <itunes:owner>
      <itunes:name><?= htmlspecialchars(RSS_OWNER_NAME) ?></itunes:name>
      <itunes:email><?= htmlspecialchars(RSS_OWNER_EMAIL) ?></itunes:email>
    </itunes:owner>
    <itunes:category text="Business">
      <itunes:category text="Careers" />
    </itunes:category>
    <itunes:category text="Education">
      <itunes:category text="How To" />
    </itunes:category>
    <atom:link href="<?= htmlspecialchars(RSS_SITE_URL) ?>/podcast/rss.xml" rel="self" type="application/rss+xml" />
<?php foreach ($episodes as $ep): ?>
<?php
    $episodeUrl = RSS_SITE_URL . '/episodes/' . rawurlencode($ep['slug'] ?? '');
    $imageUrl = rssPreferredEpisodeImage($ep);
    $audioUrl = rssAbsoluteUrl($ep['audioUrl'] ?? null);
    $audioPath = rssPublicPath($ep['audioUrl'] ?? null);
    $audioLength = ($audioPath && file_exists($audioPath)) ? (string)filesize($audioPath) : '0';
    $description = trim(strip_tags((string)($ep['description'] ?? '')));
?>
    <item>
      <title><?= htmlspecialchars($ep['title'] ?? '') ?></title>
      <description><?= htmlspecialchars($description) ?></description>
      <content:encoded><![CDATA[<?= $ep['description'] ?? '' ?>]]></content:encoded>
      <pubDate><?= gmdate('D, d M Y H:i:s T', strtotime($ep['date'] ?? 'now')) ?></pubDate>
      <itunes:author><?= htmlspecialchars(RSS_OWNER_NAME) ?></itunes:author>
      <itunes:summary><?= htmlspecialchars($description) ?></itunes:summary>
      <itunes:duration><?= htmlspecialchars(rssDuration($ep['duration'] ?? '')) ?></itunes:duration>
      <itunes:episode><?= (int)($ep['number'] ?? 0) ?></itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit><?= rssExplicitValue($ep) ?></itunes:explicit>
      <guid isPermaLink="true"><?= htmlspecialchars($episodeUrl) ?></guid>
      <link><?= htmlspecialchars($episodeUrl) ?></link>
      <itunes:image href="<?= htmlspecialchars($imageUrl) ?>" />
<?php if ($audioUrl): ?>
      <enclosure url="<?= htmlspecialchars($audioUrl) ?>" length="<?= htmlspecialchars($audioLength) ?>" type="<?= htmlspecialchars(rssEnclosureMimeType($audioUrl)) ?>" />
<?php endif; ?>
<?php if (!empty($ep['topics'])): ?>
<?php foreach ($ep['topics'] as $topic): ?>
      <category><?= htmlspecialchars($topic) ?></category>
<?php endforeach; ?>
<?php endif; ?>
    </item>
<?php endforeach; ?>
  </channel>
</rss>
<?php

// Optionally write static file for caching
$action = $_GET['action'] ?? '';
if ($action === 'generate') {
    setCorsHeaders();
    $user = requireAuth();

    jsonResponse(['success' => true, 'message' => 'RSS feed is served dynamically from /api/rss.php']);
}
