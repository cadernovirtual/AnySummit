<?php
// API para verificar código de verificação
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Pegar dados do POST
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$codigo = isset($input['codigo']) ? trim($input['codigo']) : '';

// Validar dados
if (empty($email) || empty($codigo)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email e código são obrigatórios']);
    exit;
}

try {
    // Verificar se existe código na sessão
    if (!isset($_SESSION['verification_code'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Código expirado. Solicite um novo código.'
        ]);
        exit;
    }
    
    $sessionData = $_SESSION['verification_code'];
    
    // Verificar se o código expirou
    if (time() > $sessionData['expires']) {
        unset($_SESSION['verification_code']);
        echo json_encode([
            'success' => false,
            'message' => 'Código expirado. Solicite um novo código.'
        ]);
        exit;
    }
    
    // Verificar se o email corresponde
    if ($sessionData['email'] !== $email) {
        echo json_encode([
            'success' => false,
            'message' => 'Email inválido.'
        ]);
        exit;
    }
    
    // Verificar se o código está correto
    if ($sessionData['code'] !== $codigo) {
        echo json_encode([
            'success' => false,
            'message' => 'Código inválido. Tente novamente.'
        ]);
        exit;
    }
    
    // Código válido - marcar email como verificado
    $_SESSION['email_verified'] = true;
    $_SESSION['verified_email'] = $email;
    
    // Limpar código da sessão
    unset($_SESSION['verification_code']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Email verificado com sucesso'
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao verificar código: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao verificar código. Tente novamente.'
    ]);
}
?>