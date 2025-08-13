$sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $lote_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $lote = mysqli_fetch_assoc($result_verificar);
    
    if (!$lote) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado']);
        return;
    }
    
    if ($lote['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso negado']);
        return;
    }
    
    // Verificar se há ingressos associados ao lote
    if ($lote['total_ingressos'] > 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Não é possível excluir lotes que possuem ingressos associados'
        ]);
        return;
    }
    
    // Excluir lote
    $sql_delete = "DELETE FROM lotes WHERE id = ?";
    $stmt_delete = mysqli_prepare($con, $sql_delete);
    mysqli_stmt_bind_param($stmt_delete, "i", $lote_id);
    
    if (mysqli_stmt_execute($stmt_delete)) {
        echo json_encode(['success' => true, 'message' => 'Lote excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir lote']);
    }
}

function handleToggleDivulgarAction($input) {
    global $con, $usuario_id;
    
    $lote_id = intval($input['lote_id'] ?? 0);
    $divulgar_criterio = intval($input['divulgar_criterio'] ?? 0);
    
    if (!$lote_id) {
        echo json_encode(['success' => false, 'message' => 'ID do lote é obrigatório']);
        return;
    }
    
    // Verificar se o lote existe e pertence ao usuário
    $sql_verificar = "SELECT l.id, e.usuario_id 
                      FROM lotes l 
                      INNER JOIN eventos e ON l.evento_id = e.id 
                      WHERE l.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $lote_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $lote = mysqli_fetch_assoc($result_verificar);
    
    if (!$lote) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado']);
        return;
    }
    
    if ($lote['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso negado']);
        return;
    }
    
    // Atualizar divulgar_criterio
    $sql_update = "UPDATE lotes SET divulgar_criterio = ?, atualizado_em = NOW() WHERE id = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt_update, "ii", $divulgar_criterio, $lote_id);
    
    if (mysqli_stmt_execute($stmt_update)) {
        echo json_encode(['success' => true, 'message' => 'Configuração atualizada com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar configuração']);
    }
}
?>