<?php
header('Content-Type: application/json');
include("../check_login.php");
include("../conm/conn.php");

$conn = $con;

// Verificar se o método é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Obter dados JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['evento_id']) || empty($input['evento_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID do evento não fornecido']);
    exit;
}

$evento_id = intval($input['evento_id']);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

try {
    // Buscar ingressos ativos do evento (exceto combos)
    $sql = "SELECT i.id, i.titulo, i.tipo, i.preco, i.ativo
            FROM ingressos i 
            INNER JOIN eventos e ON i.evento_id = e.id 
            WHERE i.evento_id = ? 
            AND e.usuario_id = ? 
            AND i.ativo = 1 
            AND i.tipo != 'combo'
            ORDER BY i.tipo DESC, i.titulo ASC";
    
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
