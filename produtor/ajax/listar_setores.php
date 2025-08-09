<?php
include("../check_login.php");
include("../conm/conn.php");

header('Content-Type: application/json');

$evento_id = intval($_GET['evento_id'] ?? 0);
$usuario_id = $_SESSION['usuarioid'] ?? $_COOKIE['usuarioid'] ?? 0;

// Validações
if (!$evento_id || !$usuario_id) {
    echo json_encode(['success' => false, 'error' => 'Parâmetros obrigatórios não informados']);
    exit;
}

// Verificar se o evento pertence ao usuário
$stmt = $con->prepare("SELECT id FROM eventos WHERE id = ? AND usuario_id = ?");
$stmt->bind_param("ii", $evento_id, $usuario_id);
$stmt->execute();
$evento = $stmt->get_result()->fetch_assoc();

if (!$evento) {
    echo json_encode(['success' => false, 'error' => 'Evento não encontrado ou sem permissão']);
    exit;
}

// Buscar setores do evento
$stmt = $con->prepare("SELECT id, nome FROM setores WHERE evento_id = ? ORDER BY nome");
$stmt->bind_param("i", $evento_id);
$stmt->execute();
$result = $stmt->get_result();

$setores = [];
while ($row = $result->fetch_assoc()) {
    $setores[] = [
        'id' => $row['id'],
        'nome' => $row['nome']
    ];
}

echo json_encode([
    'success' => true,
    'setores' => $setores,
    'total' => count($setores)
]);
?>
