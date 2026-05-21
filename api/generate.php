<?php
/**
 * Content Generation API
 * Generates blog articles, key takeaways, newsletter drafts from transcripts.
 * Template-based generation (no AI API required).
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'blog-from-transcript':
        handleBlogFromTranscript();
        break;
    case 'takeaways':
        handleTakeaways();
        break;
    case 'newsletter':
        handleNewsletter();
        break;
    case 'excerpt':
        handleExcerpt();
        break;
    case 'full-episode':
        handleFullEpisodeGeneration();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function handleBlogFromTranscript(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    requireAuth();
    
    $body = getRequestBody();
    $title = $body['title'] ?? 'Untitled Episode';
    $transcript = $body['transcript'] ?? '';
    
    if (!$transcript) jsonResponse(['error' => 'Transcript is required'], 400);
    
    $sentences = array_filter(
        preg_split('/[.!?]+/', $transcript),
        fn($s) => strlen(trim($s)) > 20
    );
    $sentences = array_values($sentences);
    
    $intro = implode('. ', array_slice($sentences, 0, 3)) . '.';
    $mainInsights = implode('. ', array_slice($sentences, 3, 5)) . '.';
    $lessons = implode('. ', array_slice($sentences, 8, 4)) . '.';
    $takeaways = extractTakeaways($transcript);
    
    $blogTitle = "Insights from \"{$title}\"";
    $takeawayList = implode("\n", array_map(fn($t) => "- {$t}", $takeaways));
    
    $content = "## Introduction\n\n{$intro}\n\n## Main Insights\n\n{$mainInsights}\n\n## Actionable Lessons\n\n{$lessons}\n\n## Key Takeaways\n\n{$takeawayList}\n\n## Conclusion\n\nThis episode of Two Admins and a Mic covered essential strategies that every administrator can apply in their daily work.";
    
    $excerpt = generateExcerpt($intro);
    
    jsonResponse([
        'blog' => [
            'title' => $blogTitle,
            'content' => $content,
            'excerpt' => $excerpt,
            'keyTakeaways' => $takeaways,
        ],
    ]);
}

function handleTakeaways(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    requireAuth();
    
    $body = getRequestBody();
    $content = $body['content'] ?? '';
    
    jsonResponse(['takeaways' => extractTakeaways($content)]);
}

function handleNewsletter(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    requireAuth();
    
    $body = getRequestBody();
    $type = $body['type'] ?? 'episode';
    $title = $body['title'] ?? '';
    $summary = $body['summary'] ?? '';
    $takeaways = $body['takeaways'] ?? [];
    $url = $body['url'] ?? '';
    
    $emoji = $type === 'episode' ? '🎙️' : '📝';
    $subject = "{$emoji} New " . ucfirst($type) . ": {$title}";
    
    $intro = $type === 'episode'
        ? "We just dropped a brand-new episode of Two Admins and a Mic!"
        : "We just published a new article on the blog!";
    
    $takeawayList = implode("\n", array_map(fn($t) => "  • {$t}", $takeaways));
    $cta = $type === 'episode' ? 'Listen Now' : 'Read the Full Article';
    
    $body_text = "Hi there,\n\n{$intro}\n\n**{$title}**\n\n{$summary}\n\n**Key Takeaways:**\n{$takeawayList}\n\n👉 {$cta}: {$url}\n\nThanks for being part of our community!\n\n— The Two Admins and a Mic Team";
    
    jsonResponse([
        'newsletter' => [
            'subject' => $subject,
            'body' => $body_text,
        ],
    ]);
}

function handleExcerpt(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    requireAuth();
    
    $body = getRequestBody();
    $content = $body['content'] ?? '';
    $maxLength = (int)($body['maxLength'] ?? 150);
    
    jsonResponse(['excerpt' => generateExcerpt($content, $maxLength)]);
}

function handleFullEpisodeGeneration(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
    $user = requireAuth();
    checkPermission($user, 'canPublishContent');
    
    $body = getRequestBody();
    $title = $body['title'] ?? '';
    $description = $body['description'] ?? '';
    $transcript = $body['transcript'] ?? '';
    
    $source = $transcript ?: $description;
    if (!$source) jsonResponse(['error' => 'Provide description or transcript'], 400);
    
    $result = [];
    
    // Key takeaways
    $result['takeaways'] = extractTakeaways($source);
    
    // Summary/excerpt
    $result['summary'] = generateExcerpt($source, 200);
    
    // SEO description
    $seo = $result['summary'] . ' | Two Admins and a Mic';
    $result['seoDescription'] = strlen($seo) > 160 ? substr($seo, 0, 157) . '...' : $seo;
    
    // Blog from transcript
    if ($transcript) {
        $sentences = array_filter(preg_split('/[.!?]+/', $transcript), fn($s) => strlen(trim($s)) > 20);
        $sentences = array_values($sentences);
        
        $intro = implode('. ', array_slice($sentences, 0, 3)) . '.';
        $mainInsights = implode('. ', array_slice($sentences, 3, 5)) . '.';
        $lessons = implode('. ', array_slice($sentences, 8, 4)) . '.';
        $takeawayList = implode("\n", array_map(fn($t) => "- {$t}", $result['takeaways']));
        
        $result['blog'] = [
            'title' => "Insights from \"{$title}\"",
            'content' => "## Introduction\n\n{$intro}\n\n## Main Insights\n\n{$mainInsights}\n\n## Actionable Lessons\n\n{$lessons}\n\n## Key Takeaways\n\n{$takeawayList}\n\n## Conclusion\n\nThis episode covered essential strategies that every administrator can apply in their daily work.",
            'excerpt' => generateExcerpt($intro),
            'keyTakeaways' => $result['takeaways'],
        ];
    }
    
    // Newsletter
    $emoji = '🎙️';
    $url = '/episodes/' . slugify($title);
    $takeawayListText = implode("\n", array_map(fn($t) => "  • {$t}", $result['takeaways']));
    
    $result['newsletter'] = [
        'subject' => "{$emoji} New Episode: {$title}",
        'body' => "Hi there,\n\nWe just dropped a brand-new episode of Two Admins and a Mic!\n\n**{$title}**\n\n{$result['summary']}\n\n**Key Takeaways:**\n{$takeawayListText}\n\n👉 Listen Now: {$url}\n\nThanks for being part of our community!\n\n— The Two Admins and a Mic Team",
    ];
    
    jsonResponse(['generated' => $result]);
}

// ─── Helpers ───

function extractTakeaways(string $content): array {
    $takeaways = [];
    
    // From headers
    preg_match_all('/^#{2,3}\s+(.+)$/m', $content, $matches);
    if (!empty($matches[1])) {
        foreach (array_slice($matches[1], 0, 5) as $h) {
            $h = trim($h);
            if (strlen($h) > 10 && strlen($h) < 100) {
                $takeaways[] = $h;
            }
        }
    }
    
    // From bold text
    if (count($takeaways) < 3) {
        preg_match_all('/\*\*(.+?)\*\*/', $content, $boldMatches);
        if (!empty($boldMatches[1])) {
            foreach (array_slice($boldMatches[1], 0, 5 - count($takeaways)) as $b) {
                $b = trim($b);
                if (strlen($b) > 10 && strlen($b) < 100 && !in_array($b, $takeaways)) {
                    $takeaways[] = $b;
                }
            }
        }
    }
    
    return $takeaways ?: [
        'Key insight from this content',
        'Practical application for administrators',
        'Actionable takeaway for your team',
    ];
}

function generateExcerpt(string $content, int $maxLength = 150): string {
    $plain = preg_replace('/^#{1,6}\s+.*/m', '', $content);
    $plain = preg_replace('/[*_~`>\-\[\]()!]/', '', $plain);
    $plain = preg_replace('/\n+/', ' ', $plain);
    $plain = trim($plain);
    
    if (strlen($plain) <= $maxLength) return $plain;
    return preg_replace('/\s+\S*$/', '', substr($plain, 0, $maxLength)) . '...';
}

function slugify(string $text): string {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    return trim($text, '-');
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
