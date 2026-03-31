<?php
/**
 * Password Reset API
 * Handles forgot password, token validation, and password reset.
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

function logResetPasswordEvent(string $message): void {
    $storageDir = dirname(__DIR__, 2) . '/storage';
    if (!is_dir($storageDir)) {
        @mkdir($storageDir, 0755, true);
    }

    $entry = '[' . date('c') . '] ' . $message . PHP_EOL;
    @file_put_contents($storageDir . '/reset-password.log', $entry, FILE_APPEND);
    error_log($message);
}

switch ($action) {
    case 'request':
        handleResetRequest();
        break;
    case 'validate':
        handleTokenValidation();
        break;
    case 'reset':
        handlePasswordReset();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

/**
 * Ensure password_reset_tokens table exists
 */
function ensureResetTokensTable(): void {
    $db = getDB();
    $db->exec("
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash VARCHAR(64) NOT NULL,
            expires_at INT NOT NULL,
            used_at DATETIME DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_token (token_hash),
            KEY idx_user_id (user_id),
            KEY idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

/**
 * Handle password reset request — generate token and send email
 */
function handleResetRequest(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    $body = getRequestBody();
    $email = trim($body['email'] ?? '');

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'A valid email address is required'], 400);
    }

    ensureResetTokensTable();
    $db = getDB();

    // Always return success to prevent email enumeration
    $successMsg = 'If an account exists for this email, a password reset link has been sent.';

    $stmt = $db->prepare('SELECT id, name, email, status FROM admin_users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] !== 'active') {
        // Log attempt but return generic success
        $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_email, action, details, ip_address) VALUES (?, ?, ?, ?)');
        $logStmt->execute([$email, 'password_reset_request', 'No matching active account', $_SERVER['REMOTE_ADDR'] ?? '']);
        logResetPasswordEvent("Password reset requested for missing or inactive account: {$email}");
        jsonResponse(['success' => true, 'message' => $successMsg]);
    }

    // Invalidate any existing tokens for this user
    $db->prepare('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL')
       ->execute([$user['id']]);

    // Generate secure token (64 hex chars)
    $plainToken = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $plainToken);
    $expiresAt = time() + 3600; // 60 minutes

    $stmt = $db->prepare('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)');
    $stmt->execute([$user['id'], $tokenHash, $expiresAt]);

    // Build reset URL
    $resetUrl = 'https://twoadminsandamic.com/reset-password?token=' . $plainToken;

    // Send email
    $subject = 'Reset Your Password – Two Admins and a Mic';
    $htmlBody = buildResetEmail($user['name'], $resetUrl);
    $textBody = buildResetEmailPlainText($user['name'], $resetUrl);

    $sent = sendResetEmail($user['email'], $user['name'], $subject, $htmlBody, $textBody);
    $detail = $sent ? 'Email sent' : 'Email send failed';

    // Log the request
    $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)');
    $logStmt->execute([
        $user['id'],
        $user['email'],
        'password_reset_request',
        $detail,
        $_SERVER['REMOTE_ADDR'] ?? '',
    ]);

    logResetPasswordEvent("Password reset {$detail} for {$user['email']} via " . SMTP_HOST . ':' . SMTP_PORT);

    jsonResponse(['success' => true, 'message' => $successMsg]);
}

/**
 * Validate a reset token (GET request)
 */
function handleTokenValidation(): void {
    $body = $_SERVER['REQUEST_METHOD'] === 'POST' ? getRequestBody() : $_GET;
    $token = trim($body['token'] ?? '');

    if (!$token) {
        jsonResponse(['valid' => false, 'error' => 'Token is required'], 400);
    }

    ensureResetTokensTable();
    $db = getDB();
    $tokenHash = hash('sha256', $token);

    $stmt = $db->prepare('SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?');
    $stmt->execute([$tokenHash]);
    $record = $stmt->fetch();

    if (!$record) {
        jsonResponse(['valid' => false, 'error' => 'Invalid or expired token']);
    }

    if ($record['used_at'] !== null) {
        jsonResponse(['valid' => false, 'error' => 'This token has already been used']);
    }

    if (time() > (int)$record['expires_at']) {
        jsonResponse(['valid' => false, 'error' => 'This token has expired']);
    }

    jsonResponse(['valid' => true]);
}

/**
 * Reset password using a valid token
 */
function handlePasswordReset(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

    $body = getRequestBody();
    $token = trim($body['token'] ?? '');
    $newPassword = $body['password'] ?? '';

    if (!$token) {
        jsonResponse(['success' => false, 'error' => 'Token is required'], 400);
    }

    if (strlen($newPassword) < 8) {
        jsonResponse(['success' => false, 'error' => 'Password must be at least 8 characters'], 400);
    }

    ensureResetTokensTable();
    $db = getDB();
    $tokenHash = hash('sha256', $token);

    $stmt = $db->prepare('SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?');
    $stmt->execute([$tokenHash]);
    $record = $stmt->fetch();

    if (!$record) {
        jsonResponse(['success' => false, 'error' => 'Invalid or expired token'], 400);
    }

    if ($record['used_at'] !== null) {
        jsonResponse(['success' => false, 'error' => 'This token has already been used'], 400);
    }

    if (time() > (int)$record['expires_at']) {
        jsonResponse(['success' => false, 'error' => 'This token has expired'], 400);
    }

    // Update password
    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $db->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
       ->execute([$passwordHash, $record['user_id']]);

    // Mark token as used
    $db->prepare('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?')
       ->execute([$record['id']]);

    // Invalidate all other tokens for this user
    $db->prepare('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND id != ? AND used_at IS NULL')
       ->execute([$record['user_id'], $record['id']]);

    // Log the reset
    $userStmt = $db->prepare('SELECT email FROM admin_users WHERE id = ?');
    $userStmt->execute([$record['user_id']]);
    $user = $userStmt->fetch();

    $logStmt = $db->prepare('INSERT INTO admin_activity_log (user_id, user_email, action, ip_address) VALUES (?, ?, ?, ?)');
    $logStmt->execute([$record['user_id'], $user['email'] ?? '', 'password_reset_completed', $_SERVER['REMOTE_ADDR'] ?? '']);

    jsonResponse(['success' => true, 'message' => 'Your password has been successfully reset.']);
}

/**
 * Build HTML email body
 */
function buildResetEmail(string $name, string $resetUrl): string {
    $displayName = htmlspecialchars($name);
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <tr><td style="background-color:#1a1a2e;padding:30px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Two Admins and a Mic</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Content Management</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Hello {$displayName},</p>
    <p style="color:#555555;font-size:15px;line-height:1.6;margin:0 0 20px;">We received a request to reset the password for your <strong>Two Admins and a Mic</strong> Admin Dashboard account.</p>
    <p style="color:#555555;font-size:15px;line-height:1.6;margin:0 0 30px;">To reset your password, click the secure link below:</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 30px;">
    <tr><td style="background-color:#E85D2A;border-radius:6px;">
      <a href="{$resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Reset My Password</a>
    </td></tr>
    </table>
    <p style="color:#888888;font-size:13px;line-height:1.5;margin:0 0 20px;text-align:center;">For security purposes, this link will expire in <strong>60 minutes</strong>.</p>
    <hr style="border:none;border-top:1px solid #eeeeee;margin:25px 0;">
    <p style="color:#888888;font-size:13px;line-height:1.5;margin:0 0 10px;">If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
    <p style="color:#888888;font-size:13px;line-height:1.5;margin:0;">If you need assistance, please contact the system administrator.</p>
  </td></tr>
  <tr><td style="background-color:#f8f8fa;padding:25px 40px;text-align:center;">
    <p style="margin:0;color:#999999;font-size:12px;">Thank you,<br><strong>Two Admins and a Mic</strong><br>Content Management Team</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
HTML;
}

/**
 * Build plain-text email body
 */
function buildResetEmailPlainText(string $name, string $resetUrl): string {
    return <<<TEXT
Hello {$name},

We received a request to reset the password for your Two Admins and a Mic Admin Dashboard account.

To reset your password, visit the following link:

{$resetUrl}

For security purposes, this link will expire in 60 minutes.

If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.

If you need assistance, please contact the system administrator.

Thank you,
Two Admins and a Mic
Content Management Team
TEXT;
}

/**
 * Send the reset email using authenticated SMTP (Hostinger)
 */
function sendResetEmail(string $to, string $name, string $subject, string $htmlBody, string $textBody): bool {
    $boundary = md5(uniqid(time()));
    $fromEmail = SMTP_USER;
    $fromName = SMTP_FROM_NAME;

    $message = "From: {$fromName} <{$fromEmail}>\r\n";
    $message .= "To: {$name} <{$to}>\r\n";
    $message .= "Subject: {$subject}\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
    $message .= "\r\n";
    $message .= "--{$boundary}\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $message .= $textBody . "\r\n\r\n";
    $message .= "--{$boundary}\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $message .= $htmlBody . "\r\n\r\n";
    $message .= "--{$boundary}--\r\n";

    return smtpSend($fromEmail, $to, $message);
}

/**
 * Raw SMTP sender over STARTTLS for Hostinger
 */
function smtpSend(string $from, string $to, string $message): bool {
    $host = SMTP_HOST;
    $port = SMTP_PORT;
    $user = SMTP_USER;
    $pass = SMTP_PASS;

    $socket = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 15);
    if (!$socket) {
        logResetPasswordEvent("SMTP connect failed: [{$errno}] {$errstr}");
        return false;
    }

    stream_set_timeout($socket, 15);
    $response = '';
    $ok = true;

    $read = function () use ($socket): string {
        $buffer = '';
        while (($line = fgets($socket, 512)) !== false) {
            $buffer .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        return $buffer;
    };

    $send = function (string $cmd, array $expectedCodes) use ($socket, $read, &$ok): string {
        if (!$ok) {
            return '';
        }

        fwrite($socket, $cmd . "\r\n");
        $response = $read();
        $code = (int) substr($response, 0, 3);

        if (!in_array($code, $expectedCodes, true)) {
            logResetPasswordEvent("SMTP error after '{$cmd}': {$response}");
            $ok = false;
        }

        return $response;
    };

    $response = $read();
    if ((int) substr($response, 0, 3) !== 220) {
        logResetPasswordEvent("SMTP greeting failed: {$response}");
        fclose($socket);
        return false;
    }

    $send("EHLO twoadminsandamic.com", [250]);
    $send("STARTTLS", [220]);

    if ($ok && !stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        logResetPasswordEvent('SMTP STARTTLS negotiation failed');
        $ok = false;
    }

    if ($ok) {
        $send("EHLO twoadminsandamic.com", [250]);
        $send("AUTH LOGIN", [334]);
        $send(base64_encode($user), [334]);
        $send(base64_encode($pass), [235]);
        $send("MAIL FROM:<{$from}>", [250]);
        $send("RCPT TO:<{$to}>", [250, 251]);
        $send("DATA", [354]);
    }

    if ($ok) {
        $lines = explode("\n", str_replace(["\r\n", "\r"], "\n", $message));
        foreach ($lines as $line) {
            if (isset($line[0]) && $line[0] === '.') {
                $line = '.' . $line;
            }
            fwrite($socket, $line . "\r\n");
        }
        fwrite($socket, ".\r\n");
        $response = $read();
        $code = (int) substr($response, 0, 3);
        if ($code !== 250) {
            logResetPasswordEvent("SMTP DATA finalization failed: {$response}");
            $ok = false;
        }
    }

    fwrite($socket, "QUIT\r\n");
    fclose($socket);

    return $ok;
}
