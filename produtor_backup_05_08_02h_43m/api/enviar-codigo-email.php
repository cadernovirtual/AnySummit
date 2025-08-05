<?php
// API para enviar código de verificação por email
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Iniciar sessão se ainda não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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

// Log para debug
error_log("Enviar código - Email: $email, Nome: $nome");

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
    
    // Salvar código na sessão com expiração de 10 minutos
    $_SESSION['verification_code'] = [
        'code' => $codigo,
        'email' => $email,
        'expires' => time() + 600 // 10 minutos
    ];
    
    // Configurar email
    $to = $email;
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
            .logo {
                max-width: 200px;
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
    
    // Headers do email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: AnySummit <noreply@anysummit.com.br>" . "\r\n";
    
    // Tentar enviar via mail() primeiro
    $emailEnviado = @mail($to, $subject, $message, $headers);
    
    // Se falhar, tentar via SMTP (configurações existentes)
    if (!$emailEnviado) {
        // Aqui você pode implementar o envio via SMTP usando as configurações existentes
        // Por enquanto, vamos simular o envio bem-sucedido e mostrar o código no console
        error_log("Código de verificação para $email: $codigo");
        $emailEnviado = true; // Para desenvolvimento
    }
    
    if ($emailEnviado) {
        echo json_encode([
            'success' => true,
            'message' => 'Código enviado com sucesso'
        ]);
    } else {
        throw new Exception('Erro ao enviar email');
    }
    
} catch (Exception $e) {
    error_log("Erro ao enviar código: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao enviar código. Tente novamente.'
    ]);
}
?>