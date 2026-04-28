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
// Prefer config.local.php constants first, then fall back to common PHP env sources.
function resolveConfigValue(array $keys, string $default = ''): string {
    foreach ($keys as $key) {
        if (defined($key)) {
            $value = trim((string) constant($key));
            if ($value !== '') {
                return $value;
            }
        }

        $env = getenv($key);
        if ($env !== false && trim((string) $env) !== '') {
            return trim((string) $env);
        }

        if (!empty($_ENV[$key])) {
            return trim((string) $_ENV[$key]);
        }

        if (!empty($_SERVER[$key])) {
            return trim((string) $_SERVER[$key]);
        }

        if (function_exists('apache_getenv')) {
            $apacheEnv = apache_getenv($key, true);
            if ($apacheEnv !== false && trim((string) $apacheEnv) !== '') {
                return trim((string) $apacheEnv);
            }
        }
    }

    return $default;
}

function resolveConfigList(array $keys): array {
    $raw = resolveConfigValue($keys);
    if ($raw === '') {
        return [];
    }

    return array_values(array_filter(array_map(
        static fn($value) => trim((string) $value),
        preg_split('/[,\n\r]+/', $raw) ?: []
    )));
}

function buildCustomFields(string $firstName, string $lastName): ?array {
    $fields = array_values(array_filter([
        $firstName !== '' ? ['name' => 'First Name', 'value' => $firstName] : null,
        $lastName !== '' ? ['name' => 'Last Name', 'value' => $lastName] : null,
    ]));

    return !empty($fields) ? $fields : null;
}

function beehiivRequest(string $method, string $url, string $apiKey, ?array $payload = null): array {
    $ch = curl_init($url);

    $options = [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ];

    if ($payload !== null) {
        $options[CURLOPT_POSTFIELDS] = json_encode($payload);
    }

    curl_setopt_array($ch, $options);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    return [
        'httpCode' => $httpCode,
        'response' => $response,
        'error' => $curlError,
        'decoded' => json_decode($response ?: '', true),
    ];
}

function syncExistingConantSubscription(
    string $publicationId,
    string $apiKey,
    string $email,
    string $firstName,
    string $lastName,
    array $automationIds
): array {
    $errors = [];
    $encodedEmail = rawurlencode($email);
    $customFields = buildCustomFields($firstName, $lastName);

    if ($customFields !== null) {
        $updateUrl = "https://api.beehiiv.com/v2/publications/{$publicationId}/subscriptions/by_email/{$encodedEmail}";
        $updateResult = beehiivRequest('PUT', $updateUrl, $apiKey, [
            'custom_fields' => $customFields,
        ]);

        if ($updateResult['error']) {
            $errors[] = "custom-fields-curl:" . $updateResult['error'];
        } elseif ($updateResult['httpCode'] < 200 || $updateResult['httpCode'] >= 300) {
            $errors[] = "custom-fields-http:" . $updateResult['httpCode'];
        }
    }

    foreach ($automationIds as $automationId) {
        $journeyUrl = "https://api.beehiiv.com/v2/publications/{$publicationId}/automations/{$automationId}/journeys";
        $journeyResult = beehiivRequest('POST', $journeyUrl, $apiKey, [
            'email' => $email,
            'double_opt_override' => 'on',
        ]);

        if ($journeyResult['error']) {
            $errors[] = "automation-{$automationId}-curl:" . $journeyResult['error'];
            continue;
        }

        if ($journeyResult['httpCode'] < 200 || $journeyResult['httpCode'] >= 300) {
            $errors[] = "automation-{$automationId}-http:" . $journeyResult['httpCode'];
        }
    }

    return [
        'success' => empty($errors),
        'errors' => $errors,
    ];
}

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
$apiKey = resolveConfigValue([
    'BEEHIIV_API_KEY',
    'BEEHIIV_API_TOKEN',
    'BEEHIIV_TOKEN',
    'BEEHIIV_PRIVATE_KEY',
]);
$publicationId = resolveConfigValue([
    'BEEHIIV_PUBLICATION_ID',
    'BEEHIIV_PUBLICATION',
    'BEEHIIV_PUB_ID',
], 'pub_51840fb5-3899-45b2-9b67-dc3ddf9d604b');
$conantTagName = resolveConfigValue([
    'BEEHIIV_CONANT_TAG',
    'BEEHIIV_CONANT_TAG_NAME',
], 'conantleadership');
$conantAutomationIds = resolveConfigList([
    'BEEHIIV_CONANT_AUTOMATION_IDS',
    'BEEHIIV_CONANT_AUTOMATION_ID',
]);
$conantNewsletterListIds = resolveConfigList([
    'BEEHIIV_CONANT_NEWSLETTER_LIST_IDS',
    'BEEHIIV_CONANT_NEWSLETTER_LIST_ID',
]);

if (empty($apiKey) || empty($publicationId)) {
    error_log("SUBSCRIBE: Missing Beehiiv configuration. Email: " . $email);
    jsonResponse([
        'error' => 'Newsletter signup is not configured yet. Please try again later.',
    ], 500);
}

$url = "https://api.beehiiv.com/v2/publications/" . $publicationId . "/subscriptions";
$customFields = buildCustomFields($firstName, $lastName);
$payload = array_filter([
    'email' => $email,
    'reactivate_existing' => true,
    'send_welcome_email' => true,
    'double_opt_override' => 'on',
    'custom_fields' => $customFields,
    // Best-effort compatibility path for legacy behavior; Beehiiv's documented
    // routing options are automations and newsletter lists.
    'tags' => ($conantLeadership && $conantTagName !== '') ? [$conantTagName] : null,
    'automation_ids' => ($conantLeadership && !empty($conantAutomationIds)) ? $conantAutomationIds : null,
    'newsletter_list_ids' => ($conantLeadership && !empty($conantNewsletterListIds)) ? $conantNewsletterListIds : null,
], fn($v) => $v !== null);

$result = beehiivRequest('POST', $url, $apiKey, $payload);
$response = $result['response'];
$httpCode = $result['httpCode'];
$curlError = $result['error'];

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
    if ($conantLeadership && !empty($conantAutomationIds)) {
        $syncResult = syncExistingConantSubscription(
            $publicationId,
            $apiKey,
            $email,
            $firstName,
            $lastName,
            $conantAutomationIds
        );

        if (!$syncResult['success']) {
            error_log("Beehiiv sync for existing subscriber failed: " . implode(', ', $syncResult['errors']));
            jsonResponse(['error' => 'Subscription update failed. Please try again.'], 500);
        }
    }

    jsonResponse([
        'success' => true,
        'message' => $conantLeadership
            ? 'You are already subscribed, and your ConantLeadership preferences have been updated.'
            : 'You are already subscribed!',
    ]);
} else {
    error_log("Beehiiv API returned HTTP $httpCode: $response | payload=" . json_encode($payload));
    jsonResponse(['error' => 'Subscription failed. Please try again.'], 500);
}
