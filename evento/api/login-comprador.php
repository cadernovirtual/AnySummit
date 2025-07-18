<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Ler dados JSON do corpo da requisição
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

include('../conm/conn.php');

$email = $data['email'] ?? '';
$senha = $data['senha'] ?? '';

if (empty($email) || empty($senha)) {
    echo json_encode(['success' => false, 'message' => 'E-mail e senha são obrigatórios']);
    exit;
}

try {
    // Buscar comprador pelo e-mail
    $sql = "SELECT * FROM compradores WHERE email = ? AND ativo = 1";
    $stmt = $con->prepare($sql);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'E-mail não encontrado']);
        exit;
    }
    
    $comprador = $result->fetch_assoc();
    
    // Verificar senha
    if (!password_verify($senha, $comprador['senha_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Senha incorreta']);
        exit;
    }
    
    // Login bem-sucedido - definir cookies
    $expire = time() + (86400 * 30); // 30 dias
    setcookie('compradorid', $comprador['id'], $expire, '/');
    setcookie('compradornome', $comprador['nome'], $expire, '/');
    
    echo json_encode([
        'success' => true, 
        'message' => 'Login realizado com sucesso',
        'comprador' => [
            'id' => $comprador['id'],
            'nome' => $comprador['nome'],
            'email' => $comprador['email']
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro no login do comprador: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
}
?>