<?php
/**
 * Dynamic RSS Feed Generator
 * Generates /podcast/rss.xml from content files on each request.
 * Can be called directly or via a cron job to regenerate the static XML.
 */

require_once __DIR__ . '/config.php';

// Content directory
$podcastDir = realpath(__DIR__ . '/../../') . '/content/podcasts';
$statusFile = realpath(__DIR__ . '/../../') . '/content/content-status.json';
$siteUrl = 'https://twoadminsandamic.com'; // Update with your domain

// Load content statuses
$statuses = [];
if (file_exists($statusFile)) {
    $statuses = json_decode(file_get_contents($statusFile), true) ?? [];
}

// Load episodes
$episodes = [];
if (is_dir($podcastDir)) {
    foreach (glob($podcastDir . '/*.json') as $file) {
        $data = json_decode(file_get_contents($file), true);
        if (!$data) continue;
        
        $number = (string)($data['number'] ?? '');
        $key = "episode:{$number}";
        $status = $statuses[$key]['status'] ?? 'published';
        
        // Skip unpublished and trashed episodes
        if ($status !== 'published') continue;
        
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
    <title>Two Admins and a Mic</title>
    <link><?= htmlspecialchars($siteUrl) ?></link>
    <description>Leadership insights, career growth strategies, and real talk for administrative professionals.</description>
    <language>en-us</language>
    <lastBuildDate><?= gmdate('D, d M Y H:i:s T') ?></lastBuildDate>
    <itunes:author>Two Admins and a Mic</itunes:author>
    <itunes:category text="Business" />
    <itunes:category text="Education" />
    <atom:link href="<?= htmlspecialchars($siteUrl) ?>/podcast/rss.xml" rel="self" type="application/rss+xml" />
<?php foreach ($episodes as $ep): ?>
    <item>
      <title><?= htmlspecialchars($ep['title'] ?? '') ?></title>
      <description><?= htmlspecialchars($ep['description'] ?? '') ?></description>
      <pubDate><?= gmdate('D, d M Y H:i:s T', strtotime($ep['date'] ?? 'now')) ?></pubDate>
      <itunes:duration><?= htmlspecialchars($ep['duration'] ?? '') ?></itunes:duration>
      <guid><?= htmlspecialchars($siteUrl) ?>/episodes/<?= htmlspecialchars($ep['slug'] ?? '') ?></guid>
      <link><?= htmlspecialchars($siteUrl) ?>/episodes/<?= htmlspecialchars($ep['slug'] ?? '') ?></link>
<?php if (!empty($ep['thumbnailUrl'])): ?>
      <itunes:image href="<?= htmlspecialchars($siteUrl . $ep['thumbnailUrl']) ?>" />
<?php endif; ?>
<?php if (!empty($ep['audioUrl'])): ?>
      <enclosure url="<?= htmlspecialchars($ep['audioUrl']) ?>" type="audio/mpeg" />
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
    
    $rssContent = ob_get_contents();
    $rssDir = realpath(__DIR__ . '/../../') . '/podcast';
    if (!is_dir($rssDir)) mkdir($rssDir, 0755, true);
    file_put_contents($rssDir . '/rss.xml', $rssContent);
    
    jsonResponse(['success' => true, 'message' => 'RSS feed regenerated']);
}
