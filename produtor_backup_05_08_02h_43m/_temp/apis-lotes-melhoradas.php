/**
 * MELHORAR APIs DE LOTES - IMPLEMENTAR RENOMEAÇÃO AUTOMÁTICA
 */

// Adicionar ao final do wizard_evento.php antes do mysqli_close

/**
 * Criar lote por data com renomeação automática
 */
function criarLoteDataComRenomeacao($con, $usuario_id) {
    // Limpar output anterior
    if (ob_get_level()) ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $data_inicio = $_POST['data_inicio'] ?? '';
        $data_fim = $_POST['data_fim'] ?? '';
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        $percentual_aumento_valor = intval($_POST['percentual_aumento_valor'] ?? 0);
        
        error_log("=== CRIANDO LOTE POR DATA COM RENOMEAÇÃO ===");
        error_log("evento_id: $evento_id");
        error_log("data_inicio: $data_inicio");
        error_log("data_fim: $data_fim");
        
        if (!$evento_id) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if (!$data_inicio || !$data_fim) {
            echo json_encode(['sucesso' => false, 'erro' => 'Datas de início e fim são obrigatórias']);
            return;
        }
        
        // Verificar permissão do evento
        $sql_permissao = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt_permissao = $con->prepare($sql_permissao);
        $stmt_permissao->bind_param("ii", $evento_id, $usuario_id);
        $stmt_permissao->execute();
        $result_permissao = $stmt_permissao->get_result();
        
        if ($result_permissao->num_rows == 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'Evento não encontrado ou sem permissão']);
            return;
        }
        
        // Calcular nome automaticamente baseado na quantidade de lotes por data existentes
        $sql_contar = "SELECT COUNT(*) as total FROM lotes WHERE evento_id = ? AND tipo = 'data'";
        $stmt_contar = $con->prepare($sql_contar);
        $stmt_contar->bind_param("i", $evento_id);
        $stmt_contar->execute();
        $result_contar = $stmt_contar->get_result();
        $row_count = $result_contar->fetch_assoc();
        
        $proximoNumero = $row_count['total'] + 1;
        $nome_automatico = "Lote $proximoNumero";
        
        error_log("Nome automático calculado: $nome_automatico (posição $proximoNumero)");
        
        // Verificar sobreposições de data
        $sql_verifica = "SELECT id, nome FROM lotes WHERE evento_id = ? AND tipo = 'data' 
                        AND ((data_inicio <= ? AND data_fim >= ?) OR 
                             (data_inicio <= ? AND data_fim >= ?) OR 
                             (data_inicio >= ? AND data_fim <= ?))";
        $stmt_verifica = $con->prepare($sql_verifica);
        $stmt_verifica->bind_param("issssss", $evento_id, $data_inicio, $data_inicio, $data_fim, $data_fim, $data_inicio, $data_fim);
        $stmt_verifica->execute();
        $result_verifica = $stmt_verifica->get_result();
        
        if ($result_verifica->num_rows > 0) {
            $lote_conflitante = $result_verifica->fetch_assoc();
            echo json_encode(['sucesso' => false, 'erro' => 'Há sobreposição de datas com o lote: ' . $lote_conflitante['nome']]);
            return;
        }
        
        // Criar o lote
        $sql = "INSERT INTO lotes (
                    evento_id, nome, tipo, data_inicio, data_fim, 
                    divulgar_criterio, percentual_aumento_valor, criado_em
                ) VALUES (?, ?, 'data', ?, ?, ?, ?, NOW())";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("isssii", $evento_id, $nome_automatico, $data_inicio, $data_fim, $divulgar_criterio, $percentual_aumento_valor);
        
        if ($stmt->execute()) {
            $lote_id = $con->insert_id;
            error_log("✅ Lote por data criado com ID: $lote_id e nome: $nome_automatico");
            
            // Renomear todos os lotes por data para manter sequência
            renomearLotesPorTipo($con, $evento_id, 'data');
            
            echo json_encode([
                'sucesso' => true,
                'lote_id' => $lote_id,
                'nome' => $nome_automatico,
                'mensagem' => 'Lote por data criado com sucesso'
            ]);
        } else {
            error_log("❌ Erro ao criar lote por data: " . $con->error);
            echo json_encode(['sucesso' => false, 'erro' => 'Erro ao criar lote por data']);
        }
        
    } catch (Exception $e) {
        error_log("❌ Exception ao criar lote por data: " . $e->getMessage());
        echo json_encode(['sucesso' => false, 'erro' => 'Erro interno do servidor']);
    }
}

/**
 * Criar lote por quantidade com renomeação automática
 */
function criarLoteQuantidadeComRenomeacao($con, $usuario_id) {
    // Limpar output anterior
    if (ob_get_level()) ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $percentual_venda = intval($_POST['percentual_venda'] ?? 0);
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        $percentual_aumento_valor = intval($_POST['percentual_aumento_valor'] ?? 0);
        
        error_log("=== CRIANDO LOTE POR QUANTIDADE COM RENOMEAÇÃO ===");
        error_log("evento_id: $evento_id");
        error_log("percentual_venda: $percentual_venda");
        
        if (!$evento_id) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if ($percentual_venda < 1 || $percentual_venda > 100) {
            echo json_encode(['sucesso' => false, 'erro' => 'Percentual deve estar entre 1 e 100']);
            return;
        }
        
        // Verificar permissão do evento
        $sql_permissao = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt_permissao = $con->prepare($sql_permissao);
        $stmt_permissao->bind_param("ii", $evento_id, $usuario_id);
        $stmt_permissao->execute();
        $result_permissao = $stmt_permissao->get_result();
        
        if ($result_permissao->num_rows == 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'Evento não encontrado ou sem permissão']);
            return;
        }
        
        // Verificar se percentual já existe
        $sql_verifica_perc = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'quantidade' AND percentual_venda = ?";
        $stmt_verifica_perc = $con->prepare($sql_verifica_perc);
        $stmt_verifica_perc->bind_param("ii", $evento_id, $percentual_venda);
        $stmt_verifica_perc->execute();
        $result_verifica_perc = $stmt_verifica_perc->get_result();
        
        if ($result_verifica_perc->num_rows > 0) {
            echo json_encode(['sucesso' => false, 'erro' => "Já existe um lote com $percentual_venda% de vendas"]);
            return;
        }
        
        // Calcular nome automaticamente baseado na quantidade de lotes por quantidade existentes
        $sql_contar = "SELECT COUNT(*) as total FROM lotes WHERE evento_id = ? AND tipo = 'quantidade'";
        $stmt_contar = $con->prepare($sql_contar);
        $stmt_contar->bind_param("i", $evento_id);
        $stmt_contar->execute();
        $result_contar = $stmt_contar->get_result();
        $row_count = $result_contar->fetch_assoc();
        
        $proximoNumero = $row_count['total'] + 1;
        $nome_automatico = "Lote $proximoNumero";
        
        error_log("Nome automático calculado: $nome_automatico (posição $proximoNumero)");
        
        // Criar o lote
        $sql = "INSERT INTO lotes (
                    evento_id, nome, tipo, percentual_venda, 
                    divulgar_criterio, percentual_aumento_valor, criado_em
                ) VALUES (?, ?, 'quantidade', ?, ?, ?, NOW())";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("isiii", $evento_id, $nome_automatico, $percentual_venda, $divulgar_criterio, $percentual_aumento_valor);
        
        if ($stmt->execute()) {
            $lote_id = $con->insert_id;
            error_log("✅ Lote por quantidade criado com ID: $lote_id e nome: $nome_automatico");
            
            // Renomear todos os lotes por quantidade para manter sequência
            renomearLotesPorTipo($con, $evento_id, 'quantidade');
            
            echo json_encode([
                'sucesso' => true,
                'lote_id' => $lote_id,
                'nome' => $nome_automatico,
                'mensagem' => 'Lote por quantidade criado com sucesso'
            ]);
        } else {
            error_log("❌ Erro ao criar lote por quantidade: " . $con->error);
            echo json_encode(['sucesso' => false, 'erro' => 'Erro ao criar lote por quantidade']);
        }
        
    } catch (Exception $e) {
        error_log("❌ Exception ao criar lote por quantidade: " . $e->getMessage());
        echo json_encode(['sucesso' => false, 'erro' => 'Erro interno do servidor']);
    }
}

/**
 * Renomear lotes por tipo para manter sequência
 */
function renomearLotesPorTipo($con, $evento_id, $tipo) {
    try {
        error_log("=== RENOMEANDO LOTES TIPO: $tipo ===");
        
        if ($tipo === 'data') {
            // Ordenar por data_inicio
            $sql = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'data' ORDER BY data_inicio ASC";
        } else {
            // Ordenar por percentual_venda
            $sql = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'quantidade' ORDER BY percentual_venda ASC";
        }
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("i", $evento_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $contador = 1;
        while ($row = $result->fetch_assoc()) {
            $novo_nome = "Lote $contador";
            
            $sql_update = "UPDATE lotes SET nome = ? WHERE id = ?";
            $stmt_update = $con->prepare($sql_update);
            $stmt_update->bind_param("si", $novo_nome, $row['id']);
            $stmt_update->execute();
            
            error_log("✅ Lote ID {$row['id']} renomeado para: $novo_nome");
            $contador++;
        }
        
        error_log("✅ Renomeação concluída para tipo: $tipo");
        
    } catch (Exception $e) {
        error_log("❌ Erro na renomeação: " . $e->getMessage());
    }
}

// Adicionar rotas para as novas funções
if ($action === 'criar_lote_data_com_renomeacao') {
    criarLoteDataComRenomeacao($con, $usuario_id);
    exit;
}

if ($action === 'criar_lote_quantidade_com_renomeacao') {
    criarLoteQuantidadeComRenomeacao($con, $usuario_id);
    exit;
}
