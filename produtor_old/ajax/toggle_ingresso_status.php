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
$novo_status = intval($input['status']);
$usuario_id = $_COOKIE['usuarioid'];

// Verificar permissão
$sql_check = "SELECT i.id FROM ingressos i 
              INNER JOIN eventos e ON i.evento_id = e.id 
              WHERE i.id = ? AND e.usuario_id = ?";

$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $ingresso_id, $usuario_id);
$stmt_check->execute();

if ($stmt_check->get_result()->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Sem permissão']);
    exit;
}

// Atualizar status
$sql_update = "UPDATE ingressos SET ativo = ? WHERE id = ?";
$stmt_update = $conn->prepare($sql_update);
$stmt_update->bind_param("ii", $novo_status, $ingresso_id);

if ($stmt_update->execute()) {
    echo json_encode(['success' => true, 'message' => 'Status atualizado']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar']);
}
?>