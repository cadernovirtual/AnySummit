<?php
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

include("../check_login.php");
include("../conm/conn.php");

$conn = $con;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['evento_id']) || empty($input['evento_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID do evento não fornecido']);
    exit;
}

$evento_id = intval($input['evento_id']);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

try {
    // Buscar ingressos do evento
    $sql = "SELECT i.*, 
                   COALESCE(SUM(ip.quantidade), 0) as vendas_realizadas
            FROM ingressos i 
            INNER JOIN eventos e ON i.evento_id = e.id 
            LEFT JOIN tb_itens_pedido ip ON i.id = ip.ingresso_id
            WHERE i.evento_id = ? AND e.usuario_id = ?
            GROUP BY i.id
            ORDER BY i.criado_em ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $evento_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $ingressos = [];
    while ($row = $result->fetch_assoc()) {
        $ingressos[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'ingressos' => $ingressos
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno: ' . $e->getMessage()
    ]);
}
?>