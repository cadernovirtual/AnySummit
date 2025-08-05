<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificação de login específica para AJAX
session_start();

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['usuario_logado']) && $_COOKIE['usuario_logado'] == '1') {
        $_SESSION['usuario_logado'] = true;
        $_SESSION['usuarioid'] = $_COOKIE['usuarioid'] ?? '';
        $_SESSION['usuario_nome'] = $_COOKIE['usuario_nome'] ?? '';
        $_SESSION['usuario_email'] = $_COOKIE['usuario_email'] ?? '';
        $_SESSION['contratanteid'] = $_COOKIE['contratanteid'] ?? '';
        return true;
    }
    return false;
}

// Verificar se está logado
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    if (!verificarLoginCookie()) {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
        exit();
    }
}

include("../conm/conn.php");

// Usar a variável de conexão correta
$conn = $con;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit();
}

$ticket_id = intval($data['ticket_id']);
$evento_id = intval($data['evento_id']);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Verificar se o evento pertence ao usuário
$sql_check = "SELECT e.id FROM eventos e 
              INNER JOIN ingressos i ON e.id = i.evento_id 
              WHERE e.id = ? AND e.usuario_id = ? AND i.id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("iii", $evento_id, $usuario_id, $ticket_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows == 0) {
    echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado']);
    exit();
}

try {
    // Verificar se há vendas deste ingresso na tabela tb_itens_pedido
    $sql_vendas = "SELECT COUNT(*) as tem_vendas FROM tb_itens_pedido WHERE ingresso_id = ?";
    $stmt_vendas = $conn->prepare($sql_vendas);
    $stmt_vendas->bind_param("i", $ticket_id);
    $stmt_vendas->execute();
    $result_vendas = $stmt_vendas->get_result();
    $vendas = $result_vendas->fetch_assoc();
    
    if ($vendas['tem_vendas'] > 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Não é possível remover ingresso que já possui vendas realizadas'
        ]);
        exit();
    }
    
    // Buscar dados do ingresso para log
    $sql_ingresso = "SELECT titulo, evento_id FROM ingressos WHERE id = ?";
    $stmt_ingresso = $conn->prepare($sql_ingresso);
    $stmt_ingresso->bind_param("i", $ticket_id);
    $stmt_ingresso->execute();
    $result_ingresso = $stmt_ingresso->get_result();
    $ingresso_data = $result_ingresso->fetch_assoc();
    
    if (!$ingresso_data) {
        echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado']);
        exit;
    }
    
    $evento_id = $ingresso_data['evento_id'];
    
    // VALIDAÇÃO: Verificar se ingresso está referenciado em algum combo
    $sql_combos = "SELECT id, titulo, conteudo_combo FROM ingressos 
                   WHERE evento_id = ? AND tipo = 'combo' AND conteudo_combo IS NOT NULL";
    $stmt_combos = $conn->prepare($sql_combos);
    $stmt_combos->bind_param("i", $evento_id);
    $stmt_combos->execute();
    $result_combos = $stmt_combos->get_result();
    
    $combos_que_referenciam = [];
    
    while ($combo = $result_combos->fetch_assoc()) {
        $conteudo_combo = json_decode($combo['conteudo_combo'], true);
        
        if (is_array($conteudo_combo)) {
            foreach ($conteudo_combo as $item) {
                if (isset($item['ingresso_id']) && $item['ingresso_id'] == $ticket_id) {
                    $combos_que_referenciam[] = $combo['titulo'];
                    break;
                }
            }
        }
    }
    
    // Se está referenciado em combos, bloquear exclusão
    if (!empty($combos_que_referenciam)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Esse ingresso não pode ser excluído pois está inserido em um Combo: ' . implode(', ', $combos_que_referenciam)
        ]);
        exit;
    }
    
    // Se não está em combos, pode excluir
    $sql_delete = "DELETE FROM ingressos WHERE id = ?";
    $stmt_delete = $conn->prepare($sql_delete);
    $stmt_delete->bind_param("i", $ticket_id);
    
    if ($stmt_delete->execute()) {
        // Salvar log da ação
        $contratante_id = $_COOKIE['contratanteid'] ?? 0;
        if (function_exists('salvarLog')) {
            $msg_acao = "Ingresso '{$ingresso_data['titulo']}' (ID: {$ticket_id}) foi removido do evento";
            salvarLog($conn, "Ingresso removido", $contratante_id, $msg_acao);
        }
        
        echo json_encode(['success' => true, 'message' => 'Ingresso removido com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao remover ingresso: ' . $conn->error]);
    }
    
} catch (Exception $e) {
    error_log("Erro ao remover ingresso: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
}

$conn->close();
?>
