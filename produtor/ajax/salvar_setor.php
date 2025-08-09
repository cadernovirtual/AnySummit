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

$evento_id = intval($input['evento_id'] ?? 0);
$nome = trim($input['nome'] ?? '');
$usuario_id = $_SESSION['usuarioid'] ?? $_COOKIE['usuarioid'] ?? 0;

// Validações
if (!$evento_id || !$nome || !$usuario_id) {
    echo json_encode(['success' => false, 'error' => 'Dados obrigatórios não informados']);
    exit;
}

if (strlen($nome) > 100) {
    echo json_encode(['success' => false, 'error' => 'Nome do setor deve ter no máximo 100 caracteres']);
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

// Verificar se já existe setor com o mesmo nome para este evento
$stmt = $con->prepare("SELECT id FROM setores WHERE evento_id = ? AND nome = ?");
$stmt->bind_param("is", $evento_id, $nome);
$stmt->execute();
$setor_existe = $stmt->get_result()->fetch_assoc();

if ($setor_existe) {
    echo json_encode(['success' => false, 'error' => 'Já existe um setor com este nome']);
    exit;
}

// Inserir o setor
$stmt = $con->prepare("INSERT INTO setores (evento_id, nome) VALUES (?, ?)");
$stmt->bind_param("is", $evento_id, $nome);

if ($stmt->execute()) {
    $setor_id = $con->insert_id;
    echo json_encode([
        'success' => true, 
        'setor_id' => $setor_id,
        'message' => 'Setor cadastrado com sucesso'
    ]);
} else {
    error_log("Erro ao inserir setor: " . $con->error);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>
