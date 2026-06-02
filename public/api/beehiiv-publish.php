<?php
/**
 * Beehiiv Newsletter Publish API
 *
 * Pushes a published blog post to Beehiiv as a draft email, so editors can
 * review in the Beehiiv dashboard before sending to subscribers.
 *
 * Endpoints:
 *   GET  ?action=status&slug=...   → returns last-send state for the post
 *   POST ?action=send              → body { slug } → creates Beehiiv draft
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/content.php' === false ? '' : ''; // no-op (content.php would auto-handle requests)

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'status':
        handleBeehiivStatus();
        break;
    case 'send':
        handleBeehiivSend();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

// ─── State (sent history) ──────────────────────────────────────────

function loadBeehiivState(): array {
    $file = BEEHIIV_STATE_FILE;
    $dir = dirname($file);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function saveBeehiivState(array $state): void {
    @file_put_contents(BEEHIIV_STATE_FILE, json_encode($state, JSON_PRETTY_PRINT));
}

function handleBeehiivStatus(): void {
    requireAuth();
    $slug = preg_replace('/[^a-z0-9\-_]/i', '', $_GET['slug'] ?? '');
    if (!$slug) jsonResponse(['error' => 'Slug required'], 400);

    $state = loadBeehiivState();
    $entry = $state[$slug] ?? null;
    jsonResponse([
        'slug' => $slug,
        'sent' => $entry ? true : false,
        'beehiiv_post_id' => $entry['beehiiv_post_id'] ?? null,
        'beehiiv_url' => $entry['beehiiv_url'] ?? null,
        'sent_at' => $entry['sent_at'] ?? null,
    ]);
}

// ─── Load blog post from disk ──────────────────────────────────────

function loadBlogPostForBeehiiv(string $slug): ?array {
    $blogDir = dirname(__DIR__, 2) . '/content/blog';
    $mdFile = "$blogDir/$slug.md";
    $jsonFile = "$blogDir/$slug.json";
    $htmlJsonFile = "$blogDir/$slug.html.json";

    if (file_exists($mdFile)) {
        $raw = file_get_contents($mdFile);
        $meta = parseSimpleFrontMatter($raw);
        if (file_exists($htmlJsonFile)) {
            $h = json_decode(file_get_contents($htmlJsonFile), true);
            if (!empty($h['html_content'])) $meta['html_content'] = $h['html_content'];
        }
        return $meta;
    }
    if (file_exists($jsonFile)) {
        return json_decode(file_get_contents($jsonFile), true);
    }
    return null;
}

function parseSimpleFrontMatter(string $raw): array {
    $meta = [];
    if (!preg_match('/^---\s*\n(.*?)\n---/s', $raw, $m)) return $meta;
    foreach (explode("\n", $m[1]) as $line) {
        if (preg_match('/^([a-z_]+):\s*(.*)$/i', $line, $kv)) {
            $val = trim($kv[2]);
            $val = trim($val, '"\'');
            $meta[$kv[1]] = $val;
        }
    }
    return $meta;
}

// ─── HTML email body ───────────────────────────────────────────────

function buildBeehiivBody(array $post, string $url): string {
    $title = htmlspecialchars($post['title'] ?? 'New on the blog', ENT_QUOTES, 'UTF-8');
    $excerpt = htmlspecialchars($post['excerpt'] ?? '', ENT_QUOTES, 'UTF-8');
    $image = $post['featured_image'] ?? '';
    if ($image && !preg_match('#^https?://#', $image)) {
        $image = rtrim(SITE_PUBLIC_URL, '/') . '/' . ltrim($image, '/');
    }

    $imgBlock = $image
        ? '<p style="margin:0 0 24px 0;"><img src="' . htmlspecialchars($image, ENT_QUOTES, 'UTF-8') . '" alt="" style="display:block;width:100%;max-width:600px;height:auto;border-radius:8px;" /></p>'
        : '';

    return <<<HTML
<div style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:600px;">
  $imgBlock
  <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px 0;color:#0f172a;">$title</h1>
  <p style="font-size:16px;margin:0 0 28px 0;color:#334155;">$excerpt</p>
  <p style="margin:0 0 32px 0;">
    <a href="$url" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:8px;">
      Read the full article →
    </a>
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px 0;" />
  <p style="font-size:13px;color:#64748b;margin:0;">Two Admins &amp; a Mic™</p>
</div>
HTML;
}

// ─── Send to Beehiiv ───────────────────────────────────────────────

function handleBeehiivSend(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    requireAuth();

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
        jsonResponse([
            'error' => 'Beehiiv is not configured. Add BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID to public/api/config.local.php.',
        ], 500);
    }

    $body = getRequestBody();
    $slug = preg_replace('/[^a-z0-9\-_]/i', '', $body['slug'] ?? '');
    if (!$slug) jsonResponse(['error' => 'Slug required'], 400);

    $post = loadBlogPostForBeehiiv($slug);
    if (!$post) jsonResponse(['error' => 'Blog post not found'], 404);

    $url = rtrim(SITE_PUBLIC_URL, '/') . '/blog/' . $slug;
    $subject = 'New on the blog: ' . ($post['title'] ?? 'Untitled');
    $subtitle = $post['excerpt'] ?? '';
    $html = buildBeehiivBody($post, $url);

    $payload = [
        'title' => $subject,
        'subtitle' => $subtitle,
        'body_content' => $html,
        'status' => 'draft',
    ];

    $endpoint = 'https://api.beehiiv.com/v2/publications/' . rawurlencode(BEEHIIV_PUBLICATION_ID) . '/posts';

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . BEEHIIV_API_KEY,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        error_log("[beehiiv] curl error: $curlErr");
        jsonResponse(['error' => 'Failed to reach Beehiiv: ' . $curlErr], 502);
    }

    $decoded = json_decode($response, true);

    if ($httpCode < 200 || $httpCode >= 300) {
        error_log("[beehiiv] HTTP $httpCode response: $response");
        jsonResponse([
            'error' => $decoded['error'] ?? $decoded['message'] ?? "Beehiiv returned HTTP $httpCode",
            'beehiiv_response' => $decoded,
        ], 502);
    }

    $beehiivPostId = $decoded['data']['id'] ?? $decoded['id'] ?? null;
    $beehiivUrl = $decoded['data']['web_url'] ?? null;

    $state = loadBeehiivState();
    $state[$slug] = [
        'beehiiv_post_id' => $beehiivPostId,
        'beehiiv_url' => $beehiivUrl,
        'sent_at' => date('c'),
    ];
    saveBeehiivState($state);

    jsonResponse([
        'ok' => true,
        'beehiiv_post_id' => $beehiivPostId,
        'beehiiv_url' => $beehiivUrl,
        'sent_at' => $state[$slug]['sent_at'],
    ]);
}