<?php
// API para verificar se email já existe no sistema
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir arquivo de conexão
require_once '../conm/conn.php';

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Pegar dados do POST
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';

// Validar email
if (empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email é obrigatório']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

try {
    // Verificar se email existe na tabela usuarios
    $sql = "SELECT id FROM usuarios WHERE email = ? LIMIT 1";
    $stmt = mysqli_prepare($con, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $existe = mysqli_num_rows($result) > 0;
        
        mysqli_stmt_close($stmt);
        
        echo json_encode([
            'existe' => $existe
        ]);
    } else {
        throw new Exception('Erro ao preparar consulta');
    }
    
} catch (Exception $e) {
    error_log("Erro ao verificar email: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao verificar email']);
}

mysqli_close($con);
?>