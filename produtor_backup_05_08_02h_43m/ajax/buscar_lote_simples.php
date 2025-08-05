<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../conm/conn.php'; // CAMINHO CORRETO

// LOG DEBUG
error_log("=== BUSCAR LOTE SIMPLES ===");
error_log("POST: " . print_r($_POST, true));

if (!isset($_SESSION['usuarioid'])) { // NOME CORRETO DA SESSÃO
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

$lote_id = intval($_POST['lote_id']);
$evento_id = intval($_POST['evento_id']);

error_log("Parametros: lote_id=$lote_id, evento_id=$evento_id, usuarioid=" . $_SESSION['usuarioid']);

if (!$lote_id || !$evento_id) {
    echo json_encode(['erro' => 'Parâmetros inválidos']);
    exit;
}

try {
    // SQL SIMPLES SEM VERIFICAÇÃO DE USUÁRIO PRIMEIRO
    $sql = "SELECT nome, tipo, data_inicio, data_fim, percentual_venda 
            FROM lotes 
            WHERE id = ? AND evento_id = ?";
    
    error_log("SQL: $sql");
    
    $stmt = $con->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro prepare: " . $con->error);
    }
    
    $stmt->bind_param("ii", $lote_id, $evento_id);
    if (!$stmt->execute()) {
        throw new Exception("Erro execute: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    error_log("Linhas encontradas: " . $result->num_rows);
    
    if ($lote = $result->fetch_assoc()) {
        error_log("Lote encontrado: " . print_r($lote, true));
        
        // MONTAR TEXTO
        $texto = $lote['nome'];
        
        if ($lote['tipo'] === 'data') {
            $texto .= ' - Por Data';
            if ($lote['data_inicio'] && $lote['data_fim']) {
                $inicio = date('d/m/Y', strtotime($lote['data_inicio']));
                $fim = date('d/m/Y', strtotime($lote['data_fim']));
                $texto .= " - ({$inicio} até {$fim})";
            }
        } else {
            $texto .= ' - Por Vendas';
            if ($lote['percentual_venda']) {
                $texto .= " - ({$lote['percentual_venda']}% vendidos)";
            }
        }
        
        error_log("Texto final: $texto");
        
        echo json_encode([
            'sucesso' => true,
            'texto' => $texto,
            'lote' => $lote
        ]);
    } else {
        error_log("Nenhum lote encontrado");
        echo json_encode(['erro' => 'Lote não encontrado']);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("ERRO EXCEPTION: " . $e->getMessage());
    echo json_encode(['erro' => 'Erro: ' . $e->getMessage()]);
}
?>
