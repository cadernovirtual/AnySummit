<?php
/**
 * Script para implementar sincronização de datas entre lotes e ingressos
 * Simula a trigger tr_lotes_sync_ingressos_dates
 * 
 * Uso: incluir em qualquer update de lotes do tipo 'POR DATA'
 */

/**
 * Sincroniza datas dos ingressos quando um lote do tipo 'POR DATA' é atualizado
 * 
 * @param mysqli $con Conexão com banco de dados
 * @param int $lote_id ID do lote que foi atualizado
 * @param string $nova_data_inicio Nova data de início (Y-m-d H:i:s)
 * @param string $nova_data_fim Nova data de fim (Y-m-d H:i:s)
 * @param string $tipo_lote Tipo do lote ('POR DATA' ou 'POR PERCENTUAL DE VENDA')
 * @return array Resultado da operação
 */
function sincronizarDatasIngressos($con, $lote_id, $nova_data_inicio, $nova_data_fim, $tipo_lote) {
    $resultado = [
        'sucesso' => false,
        'ingressos_atualizados' => 0,
        'mensagem' => ''
    ];
    
    try {
        // Só executa para lotes do tipo 'POR DATA'
        if ($tipo_lote !== 'POR DATA') {
            $resultado['mensagem'] = 'Sincronização só aplicável para lotes tipo POR DATA';
            return $resultado;
        }
        
        // Prepara query para atualizar ingressos
        $sql = "UPDATE ingressos 
                SET inicio_venda = ?, 
                    fim_venda = ?, 
                    atualizado_em = NOW()
                WHERE lote_id = ?";
        
        $stmt = mysqli_prepare($con, $sql);
        if (!$stmt) {
            throw new Exception('Erro ao preparar query: ' . mysqli_error($con));
        }
        
        mysqli_stmt_bind_param($stmt, "ssi", $nova_data_inicio, $nova_data_fim, $lote_id);
        
        if (mysqli_stmt_execute($stmt)) {
            $ingressos_atualizados = mysqli_stmt_affected_rows($stmt);
            
            $resultado['sucesso'] = true;
            $resultado['ingressos_atualizados'] = $ingressos_atualizados;
            $resultado['mensagem'] = "Sincronização concluída: {$ingressos_atualizados} ingressos atualizados";
            
            // Log da operação (opcional)
            $log_sql = "INSERT INTO logs_atividade (tabela_afetada, acao, registro_id, detalhes, criado_em) 
                       VALUES ('lotes_ingressos_sync', 'UPDATE_DATAS_INGRESSOS', ?, ?, NOW())";
            
            $log_stmt = mysqli_prepare($con, $log_sql);
            if ($log_stmt) {
                $detalhes = "Lote ID: {$lote_id} - Sincronizadas datas de {$ingressos_atualizados} ingressos";
                mysqli_stmt_bind_param($log_stmt, "is", $lote_id, $detalhes);
                mysqli_stmt_execute($log_stmt);
                mysqli_stmt_close($log_stmt);
            }
            
        } else {
            throw new Exception('Erro ao executar update: ' . mysqli_stmt_error($stmt));
        }
        
        mysqli_stmt_close($stmt);
        
    } catch (Exception $e) {
        $resultado['mensagem'] = 'Erro na sincronização: ' . $e->getMessage();
        error_log("Erro sincronização lotes-ingressos: " . $e->getMessage());
    }
    
    return $resultado;
}

/**
 * Exemplo de uso ao atualizar um lote
 */
function exemploUsoSincronizacao() {
    // Incluir conexão
    require_once __DIR__ . '/../evento/conm/conn.php';
    
    $lote_id = 1;
    $nova_data_inicio = '2025-06-01 10:00:00';
    $nova_data_fim = '2025-07-01 23:59:59';
    
    // 1. Primeiro, obter dados atuais do lote
    $sql_lote = "SELECT tipo, data_inicio, data_fim FROM lotes WHERE id = ?";
    $stmt = mysqli_prepare($con, $sql_lote);
    mysqli_stmt_bind_param($stmt, "i", $lote_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $lote_atual = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    if (!$lote_atual) {
        return ['erro' => 'Lote não encontrado'];
    }
    
    // 2. Verificar se houve mudança nas datas
    $datas_mudaram = ($lote_atual['data_inicio'] !== $nova_data_inicio || 
                     $lote_atual['data_fim'] !== $nova_data_fim);
    
    if (!$datas_mudaram) {
        return ['mensagem' => 'Nenhuma alteração de data detectada'];
    }
    
    // 3. Atualizar o lote
    $sql_update = "UPDATE lotes SET data_inicio = ?, data_fim = ?, atualizado_em = NOW() WHERE id = ?";
    $stmt = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt, "ssi", $nova_data_inicio, $nova_data_fim, $lote_id);
    
    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        
        // 4. Sincronizar ingressos se for tipo 'POR DATA'
        if ($lote_atual['tipo'] === 'POR DATA') {
            $resultado_sync = sincronizarDatasIngressos($con, $lote_id, $nova_data_inicio, $nova_data_fim, $lote_atual['tipo']);
            return $resultado_sync;
        }
        
        return ['sucesso' => true, 'mensagem' => 'Lote atualizado (sem sincronização de ingressos)'];
    } else {
        return ['erro' => 'Erro ao atualizar lote: ' . mysqli_error($con)];
    }
}

?>
