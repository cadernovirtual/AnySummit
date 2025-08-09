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
$nome = trim($input['nome'] ?? '');
$usuario_id = $_SESSION['usuarioid'] ?? $_COOKIE['usuarioid'] ?? 0;

// Validações
if (!$setor_id || !$nome || !$usuario_id) {
    echo json_encode(['success' => false, 'error' => 'Dados obrigatórios não informados']);
    exit;
}

if (strlen($nome) > 100) {
    echo json_encode(['success' => false, 'error' => 'Nome do setor deve ter no máximo 100 caracteres']);
    exit;
}

// Verificar se o setor pertence a um evento do usuário
$stmt = $con->prepare("
    SELECT s.id, s.evento_id 
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

// Verificar se já existe outro setor com o mesmo nome para este evento
$stmt = $con->prepare("SELECT id FROM setores WHERE evento_id = ? AND nome = ? AND id != ?");
$stmt->bind_param("isi", $setor['evento_id'], $nome, $setor_id);
$stmt->execute();
$setor_existe = $stmt->get_result()->fetch_assoc();

if ($setor_existe) {
    echo json_encode(['success' => false, 'error' => 'Já existe um setor com este nome']);
    exit;
}

// Atualizar o setor
$stmt = $con->prepare("UPDATE setores SET nome = ? WHERE id = ?");
$stmt->bind_param("si", $nome, $setor_id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Setor atualizado com sucesso'
    ]);
} else {
    error_log("Erro ao atualizar setor: " . $con->error);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>
