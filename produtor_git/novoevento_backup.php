<?php
include("check_login.php");
include("conm/conn.php");

// Lógica de retomada de wizard
$retomar_wizard = isset($_GET['retomar']) && $_GET['retomar'] == '1';
$wizard_data = null;
$wizard_step = 1;

if ($retomar_wizard) {
    // Buscar dados do wizard abandonado
    $sql_wizard = "SELECT dados_wizard, step_atual 
                   FROM eventos_rascunho 
                   WHERE usuario_id = ? AND contratante_id = ? 
                   ORDER BY atualizado_em DESC LIMIT 1";
    
    if ($stmt_wizard = $mysqli->prepare($sql_wizard)) {
        $stmt_wizard->bind_param("ii", $_SESSION['usuario_id'], $_SESSION['contratante_id']);
        $stmt_wizard->execute();
        $result_wizard = $stmt_wizard->get_result();
        
        if ($result_wizard->num_rows > 0) {
            $row = $result_wizard->fetch_assoc();
            $wizard_data = $row['dados_wizard'];
            $wizard_step = $row['step_atual'] ?: 1;
        }
        $stmt_wizard->close();
    }
}
?>