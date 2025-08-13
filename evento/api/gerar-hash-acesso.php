<?php
/**
 * API para gerar hash de acesso para pagamento-sucesso.php
 * Sistema correto baseado em hash (SEM sessões)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Função para gerar hash de acesso baseado no código do pedido
function gerarHashAcesso($codigo_pedido) {
    $chave_secreta = 'AnySummit2025@#$%';
    return hash('sha256', $codigo_pedido . $chave_secreta);
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
    $hash = gerarHashAcesso($pedido_id);
    
    echo json_encode([
        'success' => true,
        'hash' => $hash,
        'url' => "pagamento-sucesso.php?h=" . $hash,
        'pedido_id' => $pedido_id
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao gerar hash: ' . $e->getMessage()
    ]);
}
?>
