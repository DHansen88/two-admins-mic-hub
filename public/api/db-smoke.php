<?php

require_once __DIR__ . '/config.php';

setCorsHeaders();

try {
    $db = getDB();

    $result = [
        'ok' => true,
        'endpoint' => 'db-smoke',
        'connection' => false,
        'admin_users_exists' => false,
        'admin_activity_log_exists' => false,
    ];

    $db->query('SELECT 1');
    $result['connection'] = true;

    $tables = $db->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
    $tableNames = array_map(static fn($row) => (string) ($row[0] ?? ''), $tables);
    $result['admin_users_exists'] = in_array('admin_users', $tableNames, true);
    $result['admin_activity_log_exists'] = in_array('admin_activity_log', $tableNames, true);

    jsonResponse($result);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'endpoint' => 'db-smoke',
        'error' => get_class($e),
        'message' => $e->getMessage(),
    ], 500);
}
