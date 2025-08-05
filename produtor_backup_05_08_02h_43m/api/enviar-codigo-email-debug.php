<?php
// API para enviar código de verificação por email - VERSÃO DEBUG
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Capturar todos os erros
ob_start();

try {
    // Headers
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');

    // Iniciar sessão
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Debug - registrar início
    error_log("=== INICIO ENVIAR CODIGO DEBUG ===");

    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    // Pegar dados do POST
    $inputRaw = file_get_contents('php://input');
    error_log("Input raw: " . $inputRaw);
    
    $input = json_decode($inputRaw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    $email = isset($input['email']) ? trim($input['email']) : '';
    $nome = isset($input['nome']) ? trim($input['nome']) : '';

    error_log("Email: $email, Nome: $nome");

    // Validar dados
    if (empty($email)) {
        throw new Exception('Email é obrigatório');
    }
    
    if (empty($nome)) {
        throw new Exception('Nome é obrigatório');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }

    // Gerar código
    $codigo = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    error_log("Código gerado: $codigo");
    
    // Salvar na sessão
    $_SESSION['verification_code'] = [
        'code' => $codigo,
        'email' => $email,
        'expires' => time() + 600
    ];
    
    error_log("Sessão salva com sucesso");
    
    // Por enquanto, vamos apenas logar o código
    error_log("===========================================");
    error_log("CÓDIGO DE VERIFICAÇÃO PARA $email: $codigo");
    error_log("===========================================");
    
    // Limpar qualquer output anterior
    ob_clean();
    
    // Retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Código enviado com sucesso',
        'debug' => [
            'codigo' => $codigo,
            'email' => $email
        ]
    ]);
    
} catch (Exception $e) {
    error_log("ERRO: " . $e->getMessage());
    
    // Limpar buffer
    ob_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error' => true
    ]);
}

// Garantir que nada mais seja enviado
exit();
?>