<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificação de login específica para AJAX
session_start();

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['usuario_logado']) && $_COOKIE['usuario_logado'] == '1') {
        $_SESSION['usuario_logado'] = true;
        $_SESSION['usuarioid'] = $_COOKIE['usuarioid'] ?? '';
        $_SESSION['usuario_nome'] = $_COOKIE['usuario_nome'] ?? '';
        $_SESSION['usuario_email'] = $_COOKIE['usuario_email'] ?? '';
        $_SESSION['contratanteid'] = $_COOKIE['contratanteid'] ?? '';
        return true;
    }
    return false;
}

// Verificar se está logado
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    if (!verificarLoginCookie()) {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
        exit();
    }
}

include("../conm/conn.php");

// Usar a variável de conexão correta
$conn = $con;

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

// Receber dados JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit();
}

$evento_id = intval($data['evento_id']);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Verificar se o evento pertence ao usuário logado
$sql_check = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $evento_id, $usuario_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows == 0) {
    echo json_encode(['success' => false, 'message' => 'Evento não encontrado ou acesso negado']);
    exit();
}

try {
    // Inserir novo ingresso
    $sql_insert = "INSERT INTO ingressos (
        evento_id, tipo, titulo, descricao, quantidade_total, preco, 
        inicio_venda, fim_venda, limite_min, limite_max, ativo, 
        criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
    
    $stmt_insert = $conn->prepare($sql_insert);
    
    $tipo = $data['tipo'];
    $titulo = trim($data['titulo']);
    $descricao = isset($data['descricao']) ? trim($data['descricao']) : null;
    $quantidade_total = intval($data['quantidade']);
    $preco = floatval($data['preco']);
    
    // Converter datas para formato MySQL
    $inicio_venda = date('Y-m-d H:i:s', strtotime($data['inicio_venda']));
    $fim_venda = date('Y-m-d H:i:s', strtotime($data['fim_venda']));
    
    $limite_min = intval($data['limite_min']);
    $limite_max = intval($data['limite_max']);
    
    $stmt_insert->bind_param("isssidssii", 
        $evento_id, $tipo, $titulo, $descricao, $quantidade_total, 
        $preco, $inicio_venda, $fim_venda, $limite_min, $limite_max
    );
    
    if ($stmt_insert->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Ingresso criado com sucesso',
            'ingresso_id' => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Erro ao criar ingresso: ' . $stmt_insert->error
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
