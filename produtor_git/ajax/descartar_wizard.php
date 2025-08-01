<?php
// ajax/descartar_wizard.php
// Descarta wizard abandonado do banco de dados

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
    // Deletar wizard abandonado
    $sql = "DELETE FROM eventos_rascunho 
            WHERE usuario_id = ? AND contratante_id = ?";
    
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("ii", $usuario_id, $contratante_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Wizard descartado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao descartar wizard']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>
