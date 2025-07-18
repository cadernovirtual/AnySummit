<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");
include("AsaasAPI.php");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$pedido_id = isset($_GET['pedido_id']) ? intval($_GET['pedido_id']) : 0;

if (!$pedido_id) {
    echo json_encode(['success' => false, 'message' => 'ID do pedido não informado']);
    exit;
}

try {
    // Buscar pedido no banco
    $sql = "SELECT * FROM tb_pedidos WHERE pedidoid = $pedido_id";
    $result = $con->query($sql);
    
    if ($result->num_rows == 0) {
        throw new Exception('Pedido não encontrado');
    }
    
    $pedido = $result->fetch_assoc();
    $asaas_payment_id = $pedido['asaas_payment_id'];
    
    if (empty($asaas_payment_id)) {
        echo json_encode([
            'success' => true,
            'status' => 'pendente',
            'message' => 'Aguardando pagamento'
        ]);
        exit;
    }
    
    // Consultar status no Asaas
    $asaas = new AsaasAPI('production');
    $payment_status = $asaas->getPaymentStatus($asaas_payment_id);
    
    // Mapear status do Asaas para status interno
    $status_interno = 'pendente';
    switch ($payment_status['status']) {
        case 'CONFIRMED':
        case 'RECEIVED':
            $status_interno = 'aprovado';
            break;
        case 'PENDING':
            $status_interno = 'pendente';
            break;
        case 'OVERDUE':
            $status_interno = 'vencido';
            break;
        case 'CANCELLED':
            $status_interno = 'cancelado';
            break;
        case 'REFUNDED':
            $status_interno = 'estornado';
            break;
    }
    
    // Atualizar status no banco se mudou
    if ($pedido['status_pagamento'] !== $status_interno) {
        $update_sql = "UPDATE tb_pedidos SET 
                       status_pagamento = '$status_interno',
                       updated_at = NOW()
                       WHERE pedidoid = $pedido_id";
        
        $con->query($update_sql);
        
        // Se foi aprovado, processar ações adicionais (enviar email, etc.)
        if ($status_interno === 'aprovado') {
            // Aqui você pode adicionar lógica para:
            // - Enviar email de confirmação
            // - Gerar ingressos
            // - Notificar o organizador
            error_log("Pagamento aprovado para pedido $pedido_id");
        }
    }
    
    echo json_encode([
        'success' => true,
        'status' => $status_interno,
        'payment_data' => [
            'id' => $payment_status['id'],
            'value' => $payment_status['value'],
            'status' => $payment_status['status'],
            'dateCreated' => $payment_status['dateCreated'],
            'paymentDate' => $payment_status['paymentDate'] ?? null
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao verificar pagamento: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao verificar pagamento: ' . $e->getMessage()
    ]);
}
?>
