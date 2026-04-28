<?php

$path = __DIR__ . '/config.local.php';

if (!file_exists($path)) {
    header('Content-Type: application/json');
    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'endpoint' => 'config-local-smoke',
        'exists' => false,
    ]);
    exit;
}

require_once $path;

header('Content-Type: application/json');
http_response_code(200);
echo json_encode([
    'ok' => true,
    'endpoint' => 'config-local-smoke',
    'exists' => true,
]);
