<?php
include("../conm/conn.php");

header('Content-Type: application/json');
error_log("=== TESTE ESPECÍFICO DE INSERÇÃO ===");

try {
    // Testar inserção básica na tb_pedidos
    $sql_teste = "INSERT INTO tb_pedidos (
        eventoid, participanteid, compradorid, valor_total, metodo_pagamento, parcelas,
        comprador_nome, comprador_documento, comprador_tipo_documento, comprador_cep,
        codigo_pedido, status_pagamento, created_at, updated_at
    ) VALUES (
        1, 1, 1, 0.00, 'gratuito', 1,
        'Teste Nome', '11111111111', 'CPF', '12345678',
        'TEST_" . time() . "', 'aprovado', NOW(), NOW()
    )";
    
    error_log("SQL teste: " . $sql_teste);
    
    if ($con->query($sql_teste)) {
        $pedido_id = $con->insert_id;
        error_log("✅ Inserção bem-sucedida. ID: " . $pedido_id);
        echo json_encode(['success' => true, 'pedido_id' => $pedido_id, 'message' => 'Teste de inserção bem-sucedido']);
    } else {
        $erro = $con->error;
        error_log("❌ Erro na inserção: " . $erro);
        echo json_encode(['success' => false, 'error' => $erro, 'errno' => $con->errno]);
    }
    
} catch (Exception $e) {
    error_log("❌ Exceção: " . $e->getMessage());
    echo json_encode(['success' => false, 'exception' => $e->getMessage()]);
}
?>