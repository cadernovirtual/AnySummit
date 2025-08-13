<?php
// Versão temporária simplificada para teste
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

error_log('=== TESTE SIMPLIFICADO PAGAMENTO CARTAO ===');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

error_log('Input recebido: ' . json_encode($input));

// Simular processamento bem-sucedido
echo json_encode([
    'success' => true,
    'approved' => true,
    'message' => 'Pagamento simulado com sucesso - versão de teste',
    'payment' => [
        'id' => 'test_' . uniqid(),
        'status' => 'CONFIRMED',
        'value' => $input['pedido']['valor_total'] ?? 0
    ],
    'debug' => [
        'php_version' => PHP_VERSION,
        'timestamp' => date('Y-m-d H:i:s'),
        'cartao_cvv' => isset($input['cartao']['cvv']) ? 'recebido' : 'ausente'
    ]
]);
?>