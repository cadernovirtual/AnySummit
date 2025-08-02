<?php
// Desabilitar todos os erros na saída
error_reporting(0);
ini_set('display_errors', 0);

// Garantir que nenhuma saída anterior interfira
ob_clean();

// Header JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Resposta simples
$response = array(
    'success' => true,
    'message' => 'API funcionando',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD']
);

// Se for POST, tentar ler dados
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $response['dados_recebidos'] = $input;
    }
}

// Enviar resposta
echo json_encode($response);
?>