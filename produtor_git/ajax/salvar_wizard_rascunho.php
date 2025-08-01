<?php
// ajax/salvar_wizard_rascunho.php
// Salva ou atualiza rascunho do wizard no banco de dados

session_start();
require_once('../conm/conn.php');

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

// Receber dados JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['dados_wizard'])) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$contratante_id = $_SESSION['contratante_id'];
$dados_wizard = $input['dados_wizard'];
$step_atual = $input['step_atual'] ?? 1;

try {
    // Verificar se já existe um rascunho
    $sql_check = "SELECT id FROM eventos_rascunho 
                  WHERE usuario_id = ? AND contratante_id = ?";
    
    $stmt_check = $mysqli->prepare($sql_check);
    $stmt_check->bind_param("ii", $usuario_id, $contratante_id);
    $stmt_check->execute();
    $result = $stmt_check->get_result();
    
    if ($result->num_rows > 0) {
        // Atualizar rascunho existente
        $row = $result->fetch_assoc();
        $rascunho_id = $row['id'];
        
        $sql_update = "UPDATE eventos_rascunho 
                       SET dados_wizard = ?, step_atual = ?, atualizado_em = NOW() 
                       WHERE id = ?";
        
        $stmt = $mysqli->prepare($sql_update);
        $stmt->bind_param("sii", $dados_wizard, $step_atual, $rascunho_id);
    } else {
        // Criar novo rascunho
        $sql_insert = "INSERT INTO eventos_rascunho 
                       (usuario_id, contratante_id, dados_wizard, step_atual) 
                       VALUES (?, ?, ?, ?)";
        
        $stmt = $mysqli->prepare($sql_insert);
        $stmt->bind_param("iisi", $usuario_id, $contratante_id, $dados_wizard, $step_atual);
    }
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Rascunho salvo com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar rascunho']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>
