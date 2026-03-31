<?php
/**
 * Two Admins & a Mic — Admin Backend Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a MySQL database on Hostinger
 * 2. Update the credentials below
 * 3. Upload the /api folder to your Hostinger hosting
 * 4. Run setup.php once to create tables and the initial admin account
 */

// Database credentials — update these for your Hostinger setup
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Session settings
define('SESSION_LIFETIME', 14400); // 4 hours in seconds
define('SESSION_NAME', 'taam_admin_session');
define('SESSION_STORAGE_DIR', dirname(__DIR__, 2) . '/storage/sessions');
define('ADMIN_TOKEN_STORAGE_FILE', dirname(__DIR__, 2) . '/storage/admin-tokens.json');

// SMTP settings for outgoing email (Hostinger)
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'info@twoadminsandamic.com');
define('SMTP_PASS', 'YOUR_MAILBOX_PASSWORD_HERE');  // ← Update this on the server
define('SMTP_FROM_NAME', 'Two Admins and a Mic');

// CORS — explicit origins are required when cookies/sessions are used
define('ALLOWED_ORIGINS', [
    'https://twoadminsandamic.com',
    'https://www.twoadminsandamic.com',
    'https://two-admins-mic-hub.lovable.app',
]);

// Initial admin account (used only during setup)
define('INITIAL_ADMIN_EMAIL', 'admin@twoadminsandamic.com');
define('INITIAL_ADMIN_PASSWORD', 'ChangeMe2025!');
define('INITIAL_ADMIN_NAME', 'Site Admin');

/**
 * Get PDO database connection
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

function isHttpsRequest(): bool {
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
        return strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https';
    }

    return (int) ($_SERVER['SERVER_PORT'] ?? 80) === 443;
}

function getHostWithoutPort(): string {
    $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
    return preg_replace('/:\d+$/', '', $host) ?? '';
}

function getRequestOrigin(): string {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        return $origin;
    }

    $host = getHostWithoutPort();
    if ($host === '') {
        return '';
    }

    return (isHttpsRequest() ? 'https' : 'http') . '://' . $host;
}

function getAllowedOrigin(): string {
    $origin = getRequestOrigin();
    $hostOrigin = getRequestOrigin();

    if ($origin !== '' && in_array($origin, ALLOWED_ORIGINS, true)) {
        return $origin;
    }

    if ($hostOrigin !== '') {
        return $hostOrigin;
    }

    return ALLOWED_ORIGINS[0];
}

function getSessionCookieDomain(): ?string {
    $host = getHostWithoutPort();

    if ($host === 'twoadminsandamic.com' || $host === 'www.twoadminsandamic.com') {
        return '.twoadminsandamic.com';
    }

    return null;
}

function ensureSessionStorageDirectory(): ?string {
    $path = SESSION_STORAGE_DIR;

    if (!is_dir($path)) {
        @mkdir($path, 0755, true);
    }

    if (is_dir($path) && is_writable($path)) {
        return $path;
    }

    return null;
}

function ensureAdminTokenStorageFile(): ?string {
    $directory = dirname(ADMIN_TOKEN_STORAGE_FILE);

    if (!is_dir($directory)) {
        @mkdir($directory, 0755, true);
    }

    if (!is_dir($directory) || !is_writable($directory)) {
        return null;
    }

    if (!file_exists(ADMIN_TOKEN_STORAGE_FILE)) {
        @file_put_contents(ADMIN_TOKEN_STORAGE_FILE, json_encode([]));
    }

    if (!is_writable(ADMIN_TOKEN_STORAGE_FILE)) {
        return null;
    }

    return ADMIN_TOKEN_STORAGE_FILE;
}

function loadAdminTokens(): array {
    $file = ensureAdminTokenStorageFile();
    if ($file === null) {
        return [];
    }

    $raw = file_get_contents($file);
    $tokens = json_decode($raw ?: '[]', true);
    return is_array($tokens) ? $tokens : [];
}

function saveAdminTokens(array $tokens): void {
    $file = ensureAdminTokenStorageFile();
    if ($file === null) {
        return;
    }

    file_put_contents($file, json_encode(array_values($tokens), JSON_PRETTY_PRINT));
}

function pruneExpiredAdminTokens(array $tokens): array {
    $now = time();
    return array_values(array_filter($tokens, static function ($token) use ($now) {
        return !empty($token['expires_at']) && (int) $token['expires_at'] > $now;
    }));
}

function getAuthorizationHeaderValue(): string {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['HTTP_AUTHORIZATION']);
    }

    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }

    return '';
}

function getAdminBearerToken(): ?string {
    $header = getAuthorizationHeaderValue();
    if ($header && preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim($matches[1]);
    }

    if (!empty($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        return trim($_SERVER['HTTP_X_ADMIN_TOKEN']);
    }

    return null;
}

function issueAdminToken(array $user): ?string {
    $plainToken = bin2hex(random_bytes(32));
    $tokens = pruneExpiredAdminTokens(loadAdminTokens());
    $tokens[] = [
        'token_hash' => hash('sha256', $plainToken),
        'user_id' => (int) $user['id'],
        'expires_at' => time() + SESSION_LIFETIME,
    ];
    saveAdminTokens($tokens);

    return $plainToken;
}

function revokeAdminToken(?string $plainToken): void {
    if (!$plainToken) {
        return;
    }

    $tokenHash = hash('sha256', $plainToken);
    $tokens = array_values(array_filter(loadAdminTokens(), static function ($token) use ($tokenHash) {
        return ($token['token_hash'] ?? '') !== $tokenHash;
    }));
    saveAdminTokens($tokens);
}

function getAuthenticatedUserById(int $userId): ?array {
    $db = getDB();
    $stmt = $db->prepare('SELECT id, name, email, role, status FROM admin_users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] !== 'active') {
        return null;
    }

    return [
        'id' => (int) $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => $user['name'],
    ];
}

function getUserFromAdminToken(): ?array {
    $plainToken = getAdminBearerToken();
    if (!$plainToken) {
        return null;
    }

    $tokenHash = hash('sha256', $plainToken);
    $tokens = pruneExpiredAdminTokens(loadAdminTokens());
    saveAdminTokens($tokens);

    foreach ($tokens as $token) {
        if (($token['token_hash'] ?? '') !== $tokenHash) {
            continue;
        }

        $user = getAuthenticatedUserById((int) ($token['user_id'] ?? 0));
        if (!$user) {
            revokeAdminToken($plainToken);
            return null;
        }

        return $user;
    }

    return null;
}

function getSessionDebugInfo(): array {
    return [
        'host' => getHostWithoutPort(),
        'origin' => getRequestOrigin(),
        'session_name' => SESSION_NAME,
        'session_id' => session_id(),
        'has_session_cookie' => isset($_COOKIE[SESSION_NAME]),
        'has_admin_token' => getAdminBearerToken() !== null,
        'session_save_path' => session_save_path(),
        'session_storage_ready' => ensureSessionStorageDirectory() !== null,
        'token_storage_ready' => ensureAdminTokenStorageFile() !== null,
    ];
}

/**
 * Set CORS headers
 */
function setCorsHeaders(): void {
    header('Access-Control-Allow-Origin: ' . getAllowedOrigin());
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token');
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
    header('Content-Type: application/json');
}

/**
 * Send JSON response
 */
function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

/**
 * Get JSON request body
 */
function getRequestBody(): array {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

/**
 * Start secure session
 */
function startSecureSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        $sessionStorageDir = ensureSessionStorageDirectory();
        if ($sessionStorageDir !== null) {
            session_save_path($sessionStorageDir);
        }

        ini_set('session.gc_maxlifetime', (string) SESSION_LIFETIME);
        ini_set('session.use_strict_mode', '1');

        $cookieParams = [
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'secure' => isHttpsRequest(),
            'httponly' => true,
            'samesite' => 'Lax',
        ];

        $cookieDomain = getSessionCookieDomain();
        if ($cookieDomain) {
            $cookieParams['domain'] = $cookieDomain;
        }

        session_name(SESSION_NAME);
        session_set_cookie_params($cookieParams);
        session_start();

        if (session_status() !== PHP_SESSION_ACTIVE) {
            jsonResponse([
                'error' => 'Failed to start session',
                'debug' => getSessionDebugInfo(),
            ], 500);
        }
    }
}

/**
 * Check if the current session is authenticated
 */
function requireAuth(): array {
    startSecureSession();

    $tokenUser = getUserFromAdminToken();
    if ($tokenUser) {
        $_SESSION['user_id'] = $tokenUser['id'];
        $_SESSION['user_email'] = $tokenUser['email'];
        $_SESSION['user_role'] = $tokenUser['role'];
        $_SESSION['user_name'] = $tokenUser['name'];
        $_SESSION['expires_at'] = time() + SESSION_LIFETIME;

        return $tokenUser;
    }
    
    if (empty($_SESSION['user_id']) || empty($_SESSION['expires_at'])) {
        $error = isset($_COOKIE[SESSION_NAME])
            ? 'Not authenticated: session cookie exists but the server session is empty'
            : 'Not authenticated: session cookie is missing from the request';

        jsonResponse([
            'error' => $error,
            'debug' => getSessionDebugInfo(),
        ], 401);
    }
    
    if (time() > $_SESSION['expires_at']) {
        session_destroy();
        jsonResponse([
            'error' => 'Session expired',
            'debug' => getSessionDebugInfo(),
        ], 401);
    }
    
    // Refresh expiry on activity
    $_SESSION['expires_at'] = time() + SESSION_LIFETIME;
    
    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email'],
        'role' => $_SESSION['user_role'],
        'name' => $_SESSION['user_name'],
    ];
}

/**
 * Check if the current user is an admin
 */
function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        jsonResponse(['error' => 'Admin access required'], 403);
    }
    return $user;
}
