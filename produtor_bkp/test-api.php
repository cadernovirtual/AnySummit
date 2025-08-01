<?php
// Teste simples da API
header('Content-Type: application/json; charset=utf-8');

// Log de depuração
$log = date('Y-m-d H:i:s') . " - Requisição recebida\n";
$log .= "Método: " . $_SERVER['REQUEST_METHOD'] . "\n";
$log .= "Headers: " . print_r(getallheaders(), true) . "\n";

// Receber dados
$input = file_get_contents('php://input');
$log .= "Dados brutos: " . substr($input, 0, 500) . "\n";

// Decodificar JSON
$dados = json_decode($input, true);
$log .= "JSON decodificado: " . (json_last_error() === JSON_ERROR_NONE ? 'OK' : 'ERRO: ' . json_last_error_msg()) . "\n";

// Salvar log
file_put_contents(__DIR__ . '/api_debug.log', $log, FILE_APPEND);

// Resposta simples
echo json_encode([
    'success' => true,
    'message' => 'Teste OK',
    'data' => [
        'evento_id' => 999,
        'debug' => 'API de teste funcionando'
    ]
]);
?>
