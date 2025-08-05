<?php
/**
 * Script para excluir evento ID 36 e todos os dados relacionados
 */

require_once 'conm/conn.php';

$evento_id = 36;

echo "=== EXCLUSÃO DO EVENTO ID $evento_id ===\n\n";

try {
    // Iniciar transação
    mysqli_begin_transaction($con);
    
    // 1. Buscar e excluir ingressos (incluindo combos)
    $query_ingressos = mysqli_query($con, "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id");
    $total_ingressos = mysqli_fetch_assoc($query_ingressos)['total'];
    
    if ($total_ingressos > 0) {
        $sql = "DELETE FROM ingressos WHERE evento_id = $evento_id";
        if (mysqli_query($con, $sql)) {
            echo "✅ $total_ingressos ingressos/combos excluídos\n";
        } else {
            throw new Exception("Erro ao excluir ingressos: " . mysqli_error($con));
        }
    } else {
        echo "ℹ️ Nenhum ingresso encontrado\n";
    }
    
    // 2. Buscar e excluir lotes
    $query_lotes = mysqli_query($con, "SELECT COUNT(*) as total FROM lotes WHERE evento_id = $evento_id");
    $total_lotes = mysqli_fetch_assoc($query_lotes)['total'];
    
    if ($total_lotes > 0) {
        $sql = "DELETE FROM lotes WHERE evento_id = $evento_id";
        if (mysqli_query($con, $sql)) {
            echo "✅ $total_lotes lotes excluídos\n";
        } else {
            throw new Exception("Erro ao excluir lotes: " . mysqli_error($con));
        }
    } else {
        echo "ℹ️ Nenhum lote encontrado\n";
    }
    
    // 3. Verificar outras tabelas que podem ter referências
    // Exemplo: vendas, participantes, etc (adicionar conforme necessário)
    
    // 4. Por fim, excluir o evento
    $query_evento = mysqli_query($con, "SELECT nome FROM eventos WHERE id = $evento_id");
    if ($evento = mysqli_fetch_assoc($query_evento)) {
        $nome_evento = $evento['nome'];
        
        $sql = "DELETE FROM eventos WHERE id = $evento_id";
        if (mysqli_query($con, $sql)) {
            echo "✅ Evento '$nome_evento' (ID: $evento_id) excluído\n";
        } else {
            throw new Exception("Erro ao excluir evento: " . mysqli_error($con));
        }
    } else {
        echo "❌ Evento ID $evento_id não encontrado\n";
        mysqli_rollback($con);
        exit;
    }
    
    // Commit da transação
    mysqli_commit($con);
    echo "\n✅ EXCLUSÃO CONCLUÍDA COM SUCESSO!\n";
    echo "Todos os dados do evento ID $evento_id foram removidos.\n";
    
} catch (Exception $e) {
    // Rollback em caso de erro
    mysqli_rollback($con);
    echo "\n❌ ERRO: " . $e->getMessage() . "\n";
    echo "Nenhum dado foi excluído (rollback executado).\n";
}

mysqli_close($con);
?>