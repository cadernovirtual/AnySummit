<?php
// ajax/limpar_wizard.php
// Limpa dados do wizard no banco de dados após publicação

session_start();
require_once('../conm/conn.php');

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$contratante_id = $_SESSION['contratante_id'];

try {
    // Limpar wizard do banco
    $sql = "DELETE FROM eventos_rascunho 
            WHERE usuario_id = ? AND contratante_id = ?";
    
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("ii", $usuario_id, $contratante_id);
    
    if ($stmt->execute()) {
        // Também limpar dados temporários se existirem
        // (adicionar outras limpezas se necessário)
        
        echo json_encode(['success' => true, 'message' => 'Dados do wizard limpos com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao limpar dados do wizard']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>
