<?php
/**
 * API para definir sessão de pedido via JavaScript
 * Usado quando o redirecionamento vem via sessionStorage
 */

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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
    // Definir sessão para acesso à página de sucesso
    $_SESSION['ultimo_pedido_id'] = $pedido_id;
    $_SESSION['checkout_session'] = true;
    $_SESSION['checkout_time'] = time();
    $_SESSION['acesso_via_javascript'] = true;
    
    error_log("Sessão definida via JavaScript para pedido: $pedido_id");
    
    echo json_encode([
        'success' => true,
        'message' => 'Sessão definida com sucesso',
        'pedido_id' => $pedido_id
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao definir sessão: ' . $e->getMessage()
    ]);
}
?>
