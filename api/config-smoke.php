<?php

require_once __DIR__ . '/config.php';

setCorsHeaders();

jsonResponse([
    'ok' => true,
    'endpoint' => 'config-smoke',
    'origin' => getAllowedOrigin(),
]);
