<?php
session_start();
require_once('../conm/conn.php');

// Verificar se o usuário está logado
if (!isset($_SESSION['contratanteid'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

// Receber o evento_id
$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;

if ($evento_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID do evento inválido']);
    exit;
}

// Buscar lotes do evento
$sql = "SELECT id, nome, tipo, data_inicio, data_fim, percentual_venda 
        FROM lotes 
        WHERE evento_id = ? 
        ORDER BY data_inicio ASC";

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $evento_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$lotes = array();
while ($row = mysqli_fetch_assoc($result)) {
    $lotes[] = $row;
}

mysqli_stmt_close($stmt);

echo json_encode(['success' => true, 'lotes' => $lotes]);
?>
