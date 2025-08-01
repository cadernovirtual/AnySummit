<?php
// Teste de sessão via AJAX
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$response = [
    'session_id' => session_id(),
    'test_id' => isset($_SESSION['test_id']) ? $_SESSION['test_id'] : 'não encontrado',
    'session_data' => $_SESSION,
    'cookie' => $_COOKIE,
    'time' => date('Y-m-d H:i:s')
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>