<?php
// API para verificar código de verificação - VERSÃO DEBUG
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Log inicial
error_log("=== VERIFICAR CÓDIGO DEBUG ===");
error_log("Session ID: " . session_id());
error_log("Session data: " . print_r($_SESSION, true));

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido', 'success' => false]);
    exit;
}

// Pegar dados do POST
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$codigo = isset($input['codigo']) ? trim($input['codigo']) : '';

error_log("Email recebido: $email");
error_log("Código recebido: $codigo");

// Validar dados
if (empty($email) || empty($codigo)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email e código são obrigatórios'
    ]);
    exit;
}

try {
    // Verificar se existe código na sessão
    if (!isset($_SESSION['verification_code'])) {
        error_log("ERRO: Não existe código na sessão");
        echo json_encode([
            'success' => false,
            'message' => 'Código expirado. Solicite um novo código.',
            'debug' => [
                'session_exists' => false,
                'session_id' => session_id()
            ]
        ]);
        exit;
    }
    
    $sessionData = $_SESSION['verification_code'];
    error_log("Dados da sessão: " . print_r($sessionData, true));
    
    // Verificar se o código expirou
    $tempoAtual = time();
    $tempoExpiracao = $sessionData['expires'];
    $tempoRestante = $tempoExpiracao - $tempoAtual;
    
    error_log("Tempo atual: $tempoAtual");
    error_log("Tempo expiração: $tempoExpiracao");
    error_log("Tempo restante: $tempoRestante segundos");
    
    if ($tempoAtual > $tempoExpiracao) {
        unset($_SESSION['verification_code']);
        echo json_encode([
            'success' => false,
            'message' => 'Código expirado. Solicite um novo código.',
            'debug' => [
                'expired' => true,
                'tempo_restante' => $tempoRestante
            ]
        ]);
        exit;
    }
    
    // Verificar se o email corresponde
    if ($sessionData['email'] !== $email) {
        error_log("ERRO: Email não corresponde. Sessão: {$sessionData['email']}, Recebido: $email");
        echo json_encode([
            'success' => false,
            'message' => 'Email inválido.',
            'debug' => [
                'email_match' => false,
                'session_email' => $sessionData['email'],
                'received_email' => $email
            ]
        ]);
        exit;
    }
    
    // Verificar se o código está correto
    if ($sessionData['code'] !== $codigo) {
        error_log("ERRO: Código não corresponde. Sessão: {$sessionData['code']}, Recebido: $codigo");
        echo json_encode([
            'success' => false,
            'message' => 'Código inválido. Tente novamente.',
            'debug' => [
                'code_match' => false,
                'expected_length' => strlen($sessionData['code']),
                'received_length' => strlen($codigo)
            ]
        ]);
        exit;
    }
    
    // Código válido - marcar email como verificado
    $_SESSION['email_verified'] = true;
    $_SESSION['verified_email'] = $email;
    
    // NÃO limpar o código ainda - deixar para depois do cadastro
    // unset($_SESSION['verification_code']);
    
    error_log("Email verificado com sucesso!");
    error_log("Session após verificação: " . print_r($_SESSION, true));
    
    echo json_encode([
        'success' => true,
        'message' => 'Email verificado com sucesso',
        'debug' => [
            'session_id' => session_id(),
            'email_verified' => true,
            'tempo_restante' => $tempoRestante
        ]
    ]);
    
} catch (Exception $e) {
    error_log("ERRO EXCEÇÃO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao verificar código. Tente novamente.',
        'debug' => [
            'error' => $e->getMessage()
        ]
    ]);
}
?>