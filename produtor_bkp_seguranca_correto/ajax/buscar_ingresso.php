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

// Buscar ingresso
$sql = "SELECT i.* FROM ingressos i 
        INNER JOIN eventos e ON i.evento_id = e.id 
        WHERE i.id = ? AND e.usuario_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $ingresso_id, $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado']);
    exit;
}

$ingresso = $result->fetch_assoc();

// Garantir valores padrão
if (!$ingresso['limite_min']) $ingresso['limite_min'] = 1;
if (!$ingresso['limite_max']) $ingresso['limite_max'] = 5;

echo json_encode([
    'success' => true,
    'ingresso' => $ingresso
]);
?>