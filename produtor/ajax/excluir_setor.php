<?php
include("../check_login.php");
include("../conm/conn.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
    exit;
}

$setor_id = intval($input['setor_id'] ?? 0);
$usuario_id = $_SESSION['usuarioid'] ?? $_COOKIE['usuarioid'] ?? 0;

// Validações
if (!$setor_id || !$usuario_id) {
    echo json_encode(['success' => false, 'error' => 'Dados obrigatórios não informados']);
    exit;
}

// Verificar se o setor pertence a um evento do usuário
$stmt = $con->prepare("
    SELECT s.id 
    FROM setores s 
    INNER JOIN eventos e ON s.evento_id = e.id 
    WHERE s.id = ? AND e.usuario_id = ?
");
$stmt->bind_param("ii", $setor_id, $usuario_id);
$stmt->execute();
$setor = $stmt->get_result()->fetch_assoc();

if (!$setor) {
    echo json_encode(['success' => false, 'error' => 'Setor não encontrado ou sem permissão']);
    exit;
}

// Excluir o setor
$stmt = $con->prepare("DELETE FROM setores WHERE id = ?");
$stmt->bind_param("i", $setor_id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Setor excluído com sucesso'
    ]);
} else {
    error_log("Erro ao excluir setor: " . $con->error);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>
