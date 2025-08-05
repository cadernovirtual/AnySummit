<?php
// Teste para listar categorias disponíveis
include("../conm/conn.php");

$sql = "SELECT id, nome FROM categorias_evento WHERE ativo = 1 ORDER BY nome";
$result = mysqli_query($con, $sql);

$categorias = [];
while ($row = mysqli_fetch_assoc($result)) {
    $categorias[] = $row;
}

header('Content-Type: application/json');
echo json_encode([
    'categorias' => $categorias,
    'total' => count($categorias)
]);
?>