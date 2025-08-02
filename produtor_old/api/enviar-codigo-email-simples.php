<?php
// API para enviar código - VERSÃO SIMPLIFICADA COM DEBUG
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Capturar todos os erros
$response = ['success' => false, 'message' => '', 'debug' => []];

try {
    // Headers
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    // Incluir arquivo de conexão
    $connFile = '../conm/conn.php';
    if (!file_exists($connFile)) {
        throw new Exception('Arquivo de conexão não encontrado');
    }
    require_once $connFile;
    
    // Verificar conexão
    if (!isset($con) || !$con) {
        throw new Exception('Conexão com banco de dados falhou');
    }
    
    // Pegar dados do POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    $email = isset($input['email']) ? trim($input['email']) : '';
    $nome = isset($input['nome']) ? trim($input['nome']) : '';
    
    // Validar dados
    if (empty($email) || empty($nome)) {
        throw new Exception('Email e nome são obrigatórios');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }
    
    // Gerar código
    $codigo = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires_at = date('Y-m-d H:i:s', time() + 600);
    
    // Verificar se tabela existe
    $checkTable = mysqli_query($con, "SHOW TABLES LIKE 'password_tokens'");
    if (mysqli_num_rows($checkTable) == 0) {
        // Criar tabela se não existir
        $createTable = "
        CREATE TABLE IF NOT EXISTS password_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_token (token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        
        if (!mysqli_query($con, $createTable)) {
            throw new Exception('Erro ao criar tabela: ' . mysqli_error($con));
        }
    }
    
    // Limpar códigos antigos
    $sqlDelete = "DELETE FROM password_tokens WHERE email = ? AND used = 0";
    if ($stmtDelete = mysqli_prepare($con, $sqlDelete)) {
        mysqli_stmt_bind_param($stmtDelete, "s", $email);
        mysqli_stmt_execute($stmtDelete);
        mysqli_stmt_close($stmtDelete);
    }
    
    // Inserir novo código
    $sqlInsert = "INSERT INTO password_tokens (email, token, expires_at, used) VALUES (?, ?, ?, 0)";
    if (!$stmtInsert = mysqli_prepare($con, $sqlInsert)) {
        throw new Exception('Erro ao preparar inserção: ' . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($stmtInsert, "sss", $email, $codigo, $expires_at);
    
    if (!mysqli_stmt_execute($stmtInsert)) {
        throw new Exception('Erro ao inserir código: ' . mysqli_stmt_error($stmtInsert));
    }
    
    mysqli_stmt_close($stmtInsert);
    
    // Tentar enviar email
    $subject = "Código de Verificação - AnySummit";
    $message = "
    <html>
    <body style='font-family: Arial, sans-serif;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h1 style='color: #00C2FF;'>Bem-vindo ao AnySummit!</h1>
            <p>Olá <strong>" . htmlspecialchars($nome) . "</strong>,</p>
            <p>Use o código abaixo para verificar seu email:</p>
            <div style='background: #f8f9fa; border: 2px solid #00C2FF; padding: 20px; text-align: center; margin: 20px 0;'>
                <h2 style='color: #00C2FF; font-size: 32px; letter-spacing: 5px; margin: 0;'>" . $codigo . "</h2>
            </div>
            <p>Este código é válido por <strong>10 minutos</strong>.</p>
            <p style='color: #666; font-size: 14px;'>Se você não solicitou este código, ignore este email.</p>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: AnySummit <noreply@anysummit.com.br>\r\n";
    
    @mail($email, $subject, $message, $headers);
    
    // Log do código
    error_log("Código de verificação para $email: $codigo");
    
    // Resposta de sucesso
    $response = [
        'success' => true,
        'message' => 'Código enviado com sucesso',
        'debug' => [
            'codigo' => $codigo,
            'email' => $email,
            'expires_at' => $expires_at
        ]
    ];
    
} catch (Exception $e) {
    error_log("Erro em enviar-codigo-email-v3: " . $e->getMessage());
    $response = [
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]
    ];
}

// Garantir que apenas JSON seja enviado
ob_clean();
echo json_encode($response);
exit();
?>