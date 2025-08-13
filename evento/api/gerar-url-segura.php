<?php
/**
 * API para gerar URLs criptografadas
 * Usado quando JavaScript precisa gerar URLs seguras
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Função de criptografia
function criptografarPedidoId($pedido_id) {
    $chave = 'AnySummit2025@#$%'; // Chave única do sistema
    return base64_encode(openssl_encrypt($pedido_id, 'AES-128-CTR', $chave, 0, '1234567890123456'));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['pedido_id'])) {
    echo json_encode(['success' => false, 'message' => 'pedido_id não fornecido']);
    exit;
}

$pedido_id = trim($input['pedido_id']);

if (empty($pedido_id)) {
    echo json_encode(['success' => false, 'message' => 'pedido_id vazio']);
    exit;
}

try {
    $ref_criptografada = criptografarPedidoId($pedido_id);
    
    echo json_encode([
        'success' => true,
        'ref' => $ref_criptografada,
        'pedido_id' => $pedido_id // Para debug (remover em produção)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criptografar: ' . $e->getMessage()
    ]);
}
?>
