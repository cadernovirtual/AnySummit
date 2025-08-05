<?php
session_start();

header('Content-Type: application/json');

echo json_encode([
    'session_id' => session_id(),
    'usuario_id' => $_SESSION['usuario_id'] ?? null,
    'contratante_id' => $_SESSION['contratante_id'] ?? null,
    'session_data' => $_SESSION,
    'cookies' => $_COOKIE
], JSON_PRETTY_PRINT);
?>