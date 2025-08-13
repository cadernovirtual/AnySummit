<?php
// Script para sincronizar status de pagamento manualmente
header('Content-Type: application/json');

include("../conm/conn.php");
include("AsaasAPI.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$pedido_id = $input['pedido_id'] ?? 0;
$asaas_id = $input['asaas_id'] ?? '';

if (!$pedido_id || !$asaas_id) {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

try {
    $asaas = new AsaasAPI('production');
    
    // Verificar status no ASAAS
    $payment = $asaas->getPaymentStatus($asaas_id);
    $status_asaas = $payment['status'];
    
    // Mapear status
    $status_interno = 'pendente';
    switch ($status_asaas) {
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
    
    // Atualizar no banco
    $update_sql = "UPDATE tb_pedidos SET 
                   status_pagamento = '$status_interno',
                   updated_at = NOW()
                   WHERE pedidoid = $pedido_id";
    
    if ($con->query($update_sql)) {
        echo json_encode([
            'success' => true,
            'message' => "Pagamento $pedido_id sincronizado: $status_asaas -> $status_interno",
            'status_asaas' => $status_asaas,
            'status_interno' => $status_interno
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar banco: ' . $con->error
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
?>