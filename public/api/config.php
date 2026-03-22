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

/**
 * Set CORS headers
 */
function setCorsHeaders(): void {
    header('Access-Control-Allow-Origin: ' . getAllowedOrigin());
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
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
    }
}

/**
 * Check if the current session is authenticated
 */
function requireAuth(): array {
    startSecureSession();
    
    if (empty($_SESSION['user_id']) || empty($_SESSION['expires_at'])) {
        jsonResponse(['error' => 'Not authenticated'], 401);
    }
    
    if (time() > $_SESSION['expires_at']) {
        session_destroy();
        jsonResponse(['error' => 'Session expired'], 401);
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
