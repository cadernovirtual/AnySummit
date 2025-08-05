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

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

// Log para debug
error_log("💾 SALVAR INGRESSO - Dados: " . json_encode($input));

try {
    $evento_id = intval($input['evento_id']);
    $tipo = $input['tipo'];
    $titulo = $input['titulo'];
    $quantidade_total = intval($input['quantidade_total']);
    $preco = isset($input['preco']) ? floatval($input['preco']) : 0;
    $descricao = isset($input['descricao']) ? $input['descricao'] : '';
    $limite_min = isset($input['limite_min']) ? intval($input['limite_min']) : 1;
    $limite_max = isset($input['limite_max']) ? intval($input['limite_max']) : 5;
    $inicio_venda = isset($input['inicio_venda']) ? $input['inicio_venda'] : date('Y-m-d H:i:s');
    $fim_venda = isset($input['fim_venda']) ? $input['fim_venda'] : date('Y-m-d H:i:s', strtotime('+1 year'));
    
    // Verificar se evento pertence ao usuário
    $usuario_id = $_COOKIE['usuarioid'];
    $sql_check = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("ii", $evento_id, $usuario_id);
    $stmt_check->execute();
    
    if ($stmt_check->get_result()->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Evento não encontrado']);
        exit;
    }
    
    // Inserir ingresso
    $sql = "INSERT INTO ingressos (evento_id, tipo, titulo, descricao, quantidade_total, 
            preco, limite_min, limite_max, inicio_venda, fim_venda, ativo, criado_em) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssidiiss", $evento_id, $tipo, $titulo, $descricao, $quantidade_total, 
                      $preco, $limite_min, $limite_max, $inicio_venda, $fim_venda);
    
    if ($stmt->execute()) {
        $ingresso_id = $conn->insert_id;
        echo json_encode(['success' => true, 'message' => 'Ingresso criado', 'id' => $ingresso_id]);
    } else {
        error_log("💾 ERRO SQL: " . $stmt->error);
        echo json_encode(['success' => false, 'message' => 'Erro SQL: ' . $stmt->error]);
    }
    
} catch (Exception $e) {
    error_log("💾 ERRO EXCEPTION: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
?>