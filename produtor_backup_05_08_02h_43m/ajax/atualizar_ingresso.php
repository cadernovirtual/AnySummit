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

$ticket_id = intval($input['ticket_id']);
$usuario_id = $_COOKIE['usuarioid'];

// Verificar permissão
$sql_check = "SELECT i.id FROM ingressos i 
              INNER JOIN eventos e ON i.evento_id = e.id 
              WHERE i.id = ? AND e.usuario_id = ?";

$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $ticket_id, $usuario_id);
$stmt_check->execute();

if ($stmt_check->get_result()->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Sem permissão']);
    exit;
}

// ATUALIZAR NO BANCO
$sql_update = "UPDATE ingressos SET 
               titulo = ?, 
               quantidade_total = ?, 
               preco = ?, 
               limite_min = ?, 
               limite_max = ?,
               inicio_venda = ?,
               fim_venda = ?,
               descricao = ?
               WHERE id = ?";

$stmt_update = $conn->prepare($sql_update);
$stmt_update->bind_param("sidiiissi", 
    $input['titulo'],
    $input['quantidade'], 
    floatval($input['preco']),
    intval($input['limite_min']),
    intval($input['limite_max']),
    $input['inicio_venda'],
    $input['fim_venda'],
    $input['descricao'],
    $ticket_id
);

if ($stmt_update->execute()) {
    echo json_encode(['success' => true, 'message' => 'Atualizado']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar']);
}
?>