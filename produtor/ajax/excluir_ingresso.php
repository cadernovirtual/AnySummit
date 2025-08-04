<?php
session_start();
header('Content-Type: application/json');

// Verificar se está logado
if (!isset($_COOKIE['usuario_logado']) || $_COOKIE['usuario_logado'] != '1') {
    echo json_encode(['success' => false, 'message' => 'Não autenticado']);
    exit;
}

include("../conm/conn.php");
$conn = $con;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$ingresso_id = intval($input['id']);
$usuario_id = $_COOKIE['usuarioid'];

// Verificar se pertence ao usuário
$sql_check = "SELECT i.id FROM ingressos i 
              INNER JOIN eventos e ON i.evento_id = e.id 
              WHERE i.id = ? AND e.usuario_id = ?";

$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $ingresso_id, $usuario_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Sem permissão']);
    exit;
}

// Obter dados do ingresso incluindo evento_id
$ingresso_data = $result_check->fetch_assoc();
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
            if (isset($item['ingresso_id']) && $item['ingresso_id'] == $ingresso_id) {
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

// EXCLUIR DO BANCO COM LOG
$sql_delete = "DELETE FROM ingressos WHERE id = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("i", $ingresso_id);

if ($stmt_delete->execute()) {
    $affected_rows = $stmt_delete->affected_rows;
    error_log("🗑️ EXCLUSÃO - ID: $ingresso_id, Linhas afetadas: $affected_rows");
    
    if ($affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Excluído', 'affected_rows' => $affected_rows]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nenhuma linha foi excluída']);
    }
} else {
    error_log("🗑️ ERRO EXCLUSÃO - ID: $ingresso_id, Erro: " . $stmt_delete->error);
    echo json_encode(['success' => false, 'message' => 'Erro ao excluir: ' . $stmt_delete->error]);
}
?>