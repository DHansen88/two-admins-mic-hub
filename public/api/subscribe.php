<?php
/**
 * Newsletter Subscription Endpoint
 * Proxies subscription requests to Beehiiv API
 * 
 * POST /api/subscribe.php
 * Body: { "email": "user@example.com" }
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// ─── Configuration ──────────────────────────────────────────
// IMPORTANT:
// - BEEHIIV_API_KEY must be a private Bearer token, not the publication ID.
// - BEEHIIV_PUBLICATION_ID should be the publication's pub_... identifier.
// Prefer environment variables on the server, with file constants as fallback.
defined('BEEHIIV_API_KEY') || define('BEEHIIV_API_KEY', getenv('BEEHIIV_API_KEY') ?: '');
defined('BEEHIIV_PUBLICATION_ID') || define('BEEHIIV_PUBLICATION_ID', getenv('BEEHIIV_PUBLICATION_ID') ?: 'pub_51840fb5-3899-45b2-9b67-dc3ddf9d604b');

// ─── Input validation ───────────────────────────────────────
$body = getRequestBody();
$email = isset($body['email']) ? trim($body['email']) : '';
$firstName = isset($body['first_name']) ? trim(substr($body['first_name'], 0, 100)) : '';
$lastName = isset($body['last_name']) ? trim(substr($body['last_name'], 0, 100)) : '';
$conantLeadership = !empty($body['conant_leadership']);

if (empty($email)) {
    jsonResponse(['error' => 'Email is required'], 400);
}

if (strlen($email) > 255) {
    jsonResponse(['error' => 'Email too long'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Invalid email address'], 400);
}

// ─── Rate limiting (simple per-IP, per-minute) ──────────────
$rateLimitFile = sys_get_temp_dir() . '/subscribe_rate_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$now = time();

if (file_exists($rateLimitFile)) {
    $lastRequest = (int) file_get_contents($rateLimitFile);
    if ($now - $lastRequest < 10) { // 10 second cooldown
        jsonResponse(['error' => 'Too many requests. Please wait a moment.'], 429);
    }
}
file_put_contents($rateLimitFile, $now);

// ─── Forward to Beehiiv ─────────────────────────────────────
$apiKey = trim((string) BEEHIIV_API_KEY);
$publicationId = trim((string) BEEHIIV_PUBLICATION_ID);

if (empty($apiKey) || empty($publicationId)) {
    error_log("SUBSCRIBE: Missing Beehiiv configuration. Email: " . $email);
    jsonResponse([
        'error' => 'Newsletter signup is not configured yet. Please try again later.',
    ], 500);
}

$url = "https://api.beehiiv.com/v2/publications/" . $publicationId . "/subscriptions";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_POSTFIELDS => json_encode(array_filter([
        'email' => $email,
        'reactivate_existing' => true,
        'send_welcome_email' => true,
        'double_opt_override' => 'on',
        'custom_fields' => array_values(array_filter([
            !empty($firstName) ? ['name' => 'First Name', 'value' => $firstName] : null,
            !empty($lastName) ? ['name' => 'Last Name', 'value' => $lastName] : null,
        ])) ?: null,
        'tags' => $conantLeadership ? ['conantleadership'] : null,
    ], fn($v) => $v !== null)),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    error_log("Beehiiv API error: " . $curlError);
    jsonResponse(['error' => 'Subscription service unavailable'], 502);
}

if ($httpCode >= 200 && $httpCode < 300) {
    $decoded = json_decode($response, true);
    $status = $decoded['data']['status'] ?? null;
    jsonResponse([
        'success' => true,
        'message' => $status === 'validating'
            ? 'Please check your inbox to confirm your subscription.'
            : 'Successfully subscribed!',
        'status' => $status,
    ]);
} elseif ($httpCode === 409) {
    jsonResponse([
        'success' => true,
        'message' => 'You are already subscribed!',
    ]);
} else {
    error_log("Beehiiv API returned HTTP $httpCode: $response");
    jsonResponse(['error' => 'Subscription failed. Please try again.'], 500);
}
