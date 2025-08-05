<?php
session_start();

// Debug da sessão
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'session_id' => session_id(),
    'session_data' => $_SESSION,
    'cookies' => $_COOKIE,
    'usuario_logado' => isset($_SESSION['usuarioid']),
    'usuario_id' => $_SESSION['usuarioid'] ?? 'não definido',
    'contratante_id' => $_SESSION['contratanteid'] ?? 'não definido'
]);
?>