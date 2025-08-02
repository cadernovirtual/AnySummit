<?php
include("../check_login.php");
include("../conm/conn.php");

header('Content-Type: application/json');

// Pegar dados do usuário logado
$usuario_id = $_COOKIE['usuarioid'] ?? 0;
$contratante_id = $_COOKIE['contratanteid'] ?? 0;

try {
    // Limpar wizard do banco
    $sql = "DELETE FROM eventos_rascunho 
            WHERE usuario_id = ? AND contratante_id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ii", $usuario_id, $contratante_id);
        $success = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Wizard limpo com sucesso']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Erro ao limpar wizard']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Erro ao preparar query']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

mysqli_close($con);
?>