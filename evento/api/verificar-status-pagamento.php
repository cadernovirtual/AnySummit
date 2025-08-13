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

try {
    $payment_id = $_GET['payment_id'] ?? '';
    $pedido_id = $_GET['pedido_id'] ?? '';
    
    if (empty($payment_id) && empty($pedido_id)) {
        throw new Exception('ID do pagamento ou pedido é obrigatório');
    }
    
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production');
    
    if ($payment_id) {
        // Consultar pagamento no Asaas
        $payment = $asaas->getPaymentStatus($payment_id);
        
        if (!$payment) {
            throw new Exception('Pagamento não encontrado no Asaas');
        }
        
        // Atualizar status no banco se necessário
        if (isset($payment['status'])) {
            $status_db = '';
            switch ($payment['status']) {
                case 'CONFIRMED':
                case 'RECEIVED':
                    $status_db = 'pago';
                    break;
                case 'PENDING':
                    $status_db = 'pendente';
                    break;
                case 'OVERDUE':
                    $status_db = 'vencido';
                    break;
                case 'REFUNDED':
                    $status_db = 'estornado';
                    break;
                default:
                    $status_db = 'pendente';
            }
            
            // Atualizar pedido no banco
            $update_sql = "UPDATE tb_pedidos SET 
                          status_pagamento = ?,
                          updated_at = NOW()
                          WHERE asaas_payment_id = ?";
            
            $stmt = $con->prepare($update_sql);
            $stmt->bind_param("ss", $status_db, $payment_id);
            $stmt->execute();
        }
        
        echo json_encode([
            'success' => true,
            'status' => $payment['status'],
            'approved' => in_array($payment['status'], ['CONFIRMED', 'RECEIVED']),
            'payment' => $payment
        ]);
        
    } else {
        // Consultar pelo pedido_id no banco
        $sql = "SELECT status_pagamento, asaas_payment_id, codigo_pedido 
                FROM tb_pedidos 
                WHERE codigo_pedido = ? OR pedidoid = ?";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("si", $pedido_id, $pedido_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Pedido não encontrado');
        }
        
        $pedido = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'status' => $pedido['status_pagamento'],
            'approved' => in_array($pedido['status_pagamento'], ['pago', 'aprovado']),
            'asaas_payment_id' => $pedido['asaas_payment_id'],
            'codigo_pedido' => $pedido['codigo_pedido']
        ]);
    }
    
} catch (Exception $e) {
    error_log('Erro ao verificar status do pagamento: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
