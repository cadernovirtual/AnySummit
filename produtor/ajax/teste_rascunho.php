<?php
/**
 * TESTE DIRETO DA API verificar_rascunho
 * 
 * Este arquivo testa diretamente a API para ver o que está sendo retornado
 */

// Buffer para capturar qualquer output
ob_start();

// Configurar para JSON limpo
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

// Headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

require_once '../conm/conn.php';
session_start();

// Verificar se usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Usuário não logado']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

// Simular a função verificarRascunho
function testarVerificarRascunho($con, $usuario_id) {
    $sql = "SELECT id, nome, criado_em, atualizado_em 
            FROM eventos 
            WHERE usuario_id = ? 
            AND status = 'rascunho' 
            ORDER BY atualizado_em DESC 
            LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) {
        return json_encode(['erro' => 'Erro ao preparar consulta: ' . mysqli_error($con)]);
    }
    
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    if (!mysqli_stmt_execute($stmt)) {
        return json_encode(['erro' => 'Erro ao executar consulta: ' . mysqli_error($con)]);
    }
    
    $result = mysqli_stmt_get_result($stmt);
    if (!$result) {
        return json_encode(['erro' => 'Erro ao obter resultado: ' . mysqli_error($con)]);
    }
    
    if ($row = mysqli_fetch_assoc($result)) {
        return json_encode([
            'existe_rascunho' => true,
            'evento_id' => $row['id'],
            'nome' => $row['nome'],
            'criado_em' => date('d/m/Y H:i', strtotime($row['criado_em'])),
            'atualizado_em' => date('d/m/Y H:i', strtotime($row['atualizado_em'])),
            'debug' => [
                'usuario_id' => $usuario_id,
                'raw_row' => $row
            ]
        ]);
    } else {
        return json_encode([
            'existe_rascunho' => false,
            'debug' => [
                'usuario_id' => $usuario_id,
                'query_executada' => true
            ]
        ]);
    }
}

// Limpar buffer antes de enviar JSON
ob_clean();

// Executar teste
echo testarVerificarRascunho($con, $usuario_id);

// Garantir que nada mais seja enviado
exit;
?>