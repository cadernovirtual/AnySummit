<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Log detalhado de debugging
error_log("=== DEBUG ESPECÍFICO COMPRA GRATUITA ===");
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'não definido'));

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("ERRO: Método não é POST");
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Capturar dados brutos
$raw_input = file_get_contents('php://input');
error_log("Raw input recebido: " . $raw_input);
error_log("Tamanho do input: " . strlen($raw_input));

// Tentar fazer decode
$input = json_decode($raw_input, true);
$json_error = json_last_error();

error_log("JSON decode error code: " . $json_error);
error_log("JSON decode error message: " . json_last_error_msg());

if ($json_error !== JSON_ERROR_NONE) {
    error_log("ERRO: Falha no JSON decode");
    echo json_encode([
        'success' => false, 
        'message' => 'Erro no JSON: ' . json_last_error_msg(),
        'raw_input' => $raw_input,
        'input_length' => strlen($raw_input)
    ]);
    exit;
}

if (!$input) {
    error_log("ERRO: Input vazio após decode");
    echo json_encode([
        'success' => false, 
        'message' => 'Dados inválidos - input vazio',
        'raw_input' => $raw_input
    ]);
    exit;
}

error_log("Input decodificado com sucesso: " . print_r($input, true));

// Retornar sucesso para teste
echo json_encode([
    'success' => true,
    'message' => 'Debug completado com sucesso',
    'received_data' => $input
]);
?>