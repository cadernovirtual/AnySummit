<?php
include("../check_login.php");
include("../conm/conn.php");

header('Content-Type: application/json');

$pedido_id = $_GET['id'] ?? 0;

if (!$pedido_id) {
    echo json_encode(['success' => false, 'message' => 'Pedido não informado']);
    exit;
}

// Verificar se o pedido pertence ao usuário
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

$sql_check = "SELECT p.pedidoid, p.status_pagamento, e.nome as evento_nome
              FROM tb_pedidos p
              LEFT JOIN eventos e ON p.eventoid = e.id
              WHERE p.pedidoid = ? AND e.contratante_id = ? AND e.usuario_id = ?";

$stmt = mysqli_prepare($con, $sql_check);
mysqli_stmt_bind_param($stmt, "iii", $pedido_id, $contratante_id, $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$pedido = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$pedido) {
    echo json_encode(['success' => false, 'message' => 'Pedido não encontrado ou sem permissão']);
    exit;
}

if ($pedido['status_pagamento'] === 'pago') {
    echo json_encode(['success' => false, 'message' => 'Este pedido já está pago']);
    exit;
}

try {
    // Atualizar status do pedido
    $sql_update = "UPDATE tb_pedidos SET status_pagamento = 'pago' WHERE pedidoid = ?";
    $stmt = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt, "i", $pedido_id);
    $executou = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    if ($executou) {
        // Salvar log
        $acao = "Pagamento confirmado manualmente";
        $msgacao = "Pedido ID: {$pedido_id} - Status alterado para 'pago' manualmente pelo produtor";
        salvarLog($con, $acao, $contratante_id, $msgacao);
        
        echo json_encode(['success' => true, 'message' => 'Pagamento confirmado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao confirmar pagamento']);
    }
    
} catch (Exception $e) {
    error_log("Erro ao confirmar pagamento: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
}
?>
