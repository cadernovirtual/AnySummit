<?php
// Verificar status específico de um pagamento no ASAAS
header('Content-Type: application/json');

include("../conm/conn.php");
include("AsaasAPI.php");

// Obter ID do pagamento da URL
$payment_id = $_GET['payment_id'] ?? '';

if (empty($payment_id)) {
    echo json_encode(['error' => 'payment_id não informado']);
    exit;
}

try {
    $asaas = new AsaasAPI('production');
    
    // Consultar status do pagamento
    $payment = $asaas->getPaymentStatus($payment_id);
    
    // Buscar pedido no nosso banco
    $sql = "SELECT * FROM tb_pedidos WHERE asaas_payment_id = '$payment_id'";
    $result = $con->query($sql);
    $pedido = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'asaas_payment' => $payment,
        'local_pedido' => $pedido,
        'discrepancia' => $pedido ? ($pedido['status_pagamento'] !== strtolower($payment['status'])) : null
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>