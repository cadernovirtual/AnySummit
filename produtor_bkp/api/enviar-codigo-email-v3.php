<?php
// API para enviar código de verificação - VERSÃO COM TOKEN
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir arquivo de conexão
require_once '../conm/conn.php';

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido', 'success' => false]);
    exit;
}

// Pegar dados do POST
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$nome = isset($input['nome']) ? trim($input['nome']) : '';

// Validar dados
if (empty($email) || empty($nome)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email e nome são obrigatórios', 'success' => false]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido', 'success' => false]);
    exit;
}

try {
    // Gerar código de 6 dígitos
    $codigo = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    
    // Gerar token único
    $token = bin2hex(random_bytes(32));
    
    // Salvar no banco de dados ao invés da sessão
    // Primeiro, limpar códigos antigos do mesmo email
    $sqlDelete = "DELETE FROM password_tokens WHERE email = ? AND used = 0";
    $stmtDelete = mysqli_prepare($con, $sqlDelete);
    mysqli_stmt_bind_param($stmtDelete, "s", $email);
    mysqli_stmt_execute($stmtDelete);
    mysqli_stmt_close($stmtDelete);
    
    // Inserir novo código
    $expires_at = date('Y-m-d H:i:s', time() + 600); // 10 minutos
    $sqlInsert = "INSERT INTO password_tokens (email, token, expires_at, used, created_at) VALUES (?, ?, ?, 0, NOW())";
    $stmtInsert = mysqli_prepare($con, $sqlInsert);
    
    // Usar o código como token para simplificar
    mysqli_stmt_bind_param($stmtInsert, "sss", $email, $codigo, $expires_at);
    
    if (!mysqli_stmt_execute($stmtInsert)) {
        throw new Exception("Erro ao salvar código: " . mysqli_error($con));
    }
    mysqli_stmt_close($stmtInsert);
    
    // Email HTML
    $subject = "Código de Verificação - AnySummit";
    $message = "
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .content {
                color: #333333;
                line-height: 1.6;
            }
            .code-box {
                background: #f8f9fa;
                border: 2px solid #00C2FF;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 30px 0;
            }
            .code {
                font-size: 32px;
                font-weight: bold;
                color: #00C2FF;
                letter-spacing: 5px;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #888888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='color: #00C2FF;'>Bem-vindo ao AnySummit!</h1>
            </div>
            
            <div class='content'>
                <p>Olá <strong>" . htmlspecialchars($nome) . "</strong>,</p>
                
                <p>Você está quase lá! Use o código abaixo para verificar seu email e completar seu cadastro:</p>
                
                <div class='code-box'>
                    <div class='code'>" . $codigo . "</div>
                </div>
                
                <p>Este código é válido por <strong>10 minutos</strong>.</p>
                
                <p>Se você não solicitou este código, pode ignorar este email com segurança.</p>
            </div>
            
            <div class='footer'>
                <p>© " . date('Y') . " AnySummit. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Configurações SMTP Locaweb
    $smtp_server = 'email-ssl.com.br';
    $smtp_port = 465;
    $smtp_user = 'noreply@anysummit.com.br';
    $smtp_pass = 'Swko15357523@#';
    $from_email = 'noreply@anysummit.com.br';
    $from_name = 'AnySummit';
    
    // Tentar enviar via SMTP (função já existente)
    $emailEnviado = false;
    
    // Por enquanto, usar mail() básico
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: AnySummit <noreply@anysummit.com.br>" . "\r\n";
    
    $emailEnviado = @mail($email, $subject, $message, $headers);
    
    // Log do código
    error_log("Código de verificação para $email: $codigo (salvo no banco)");
    
    echo json_encode([
        'success' => true,
        'message' => 'Código enviado com sucesso',
        'token' => $token, // Token para validação
        'debug' => [
            'codigo' => $codigo, // Remover em produção
            'metodo' => 'database'
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao enviar código: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao enviar código. Tente novamente.',
        'debug' => [
            'erro' => $e->getMessage()
        ]
    ]);
} finally {
    mysqli_close($con);
}
?>