<?php
session_start();

header('Content-Type: application/json');

echo json_encode([
    'session_id' => session_id(),
    'usuario_id' => $_SESSION['usuario_id'] ?? null,
    // Removido contratante_id pois não existe mais na sessão
    'session_data' => $_SESSION,
    'cookies' => $_COOKIE
], JSON_PRETTY_PRINT);
?>