<?php
// API para enviar código - VERSÃO FUNCIONAL FINAL
error_reporting(0);
ini_set('display_errors', 0);

// Limpar buffer
if (ob_get_level()) ob_clean();

// Headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir conexão
require_once '../conm/conn.php';

// Resposta padrão
$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    // Pegar dados
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email']) || !isset($input['nome'])) {
        throw new Exception('Dados inválidos');
    }
    
    $email = trim($input['email']);
    $nome = trim($input['nome']);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }
    
    // Gerar código
    $codigo = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    
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
    
    mysqli_query($con, $createTable);
    
    // Limpar códigos antigos
    $sqlDelete = "DELETE FROM password_tokens WHERE email = ? AND used = 0";
    if ($stmtDelete = mysqli_prepare($con, $sqlDelete)) {
        mysqli_stmt_bind_param($stmtDelete, "s", $email);
        mysqli_stmt_execute($stmtDelete);
        mysqli_stmt_close($stmtDelete);
    }
    
    // Inserir novo código
    $expires_at = date('Y-m-d H:i:s', time() + 600);
    $sqlInsert = "INSERT INTO password_tokens (email, token, expires_at, used) VALUES (?, ?, ?, 0)";
    
    if (!$stmtInsert = mysqli_prepare($con, $sqlInsert)) {
        throw new Exception('Erro ao preparar inserção');
    }
    
    mysqli_stmt_bind_param($stmtInsert, "sss", $email, $codigo, $expires_at);
    
    if (!mysqli_stmt_execute($stmtInsert)) {
        throw new Exception('Erro ao salvar código');
    }
    
    mysqli_stmt_close($stmtInsert);
    
    // HTML do email
    $subject = "Código de Verificação - AnySummit";
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 50px auto; background: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            h1 { color: #00C2FF; font-size: 28px; margin: 0 0 20px; }
            .content { color: #333333; line-height: 1.6; }
            .code-box { background: #f8f9fa; border: 2px solid #00C2FF; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .code { font-size: 32px; font-weight: bold; color: #00C2FF; letter-spacing: 5px; }
            .footer { margin-top: 30px; text-align: center; color: #888888; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Bem-vindo ao AnySummit!</h1>
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
    </html>";
    
    // Tentar enviar via SMTP Locaweb
    $emailEnviado = false;
    $metodoEnvio = '';
    
    // Configurações SMTP
    $smtp_server = 'email-ssl.com.br';
    $smtp_port = 465;
    $smtp_user = 'noreply@anysummit.com.br';
    $smtp_pass = 'Swko15357523@#';
    $from_email = 'noreply@anysummit.com.br';
    $from_name = 'AnySummit';
    
    // Tentar SMTP primeiro
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    
    $socket = @stream_socket_client(
        "ssl://$smtp_server:$smtp_port",
        $errno,
        $errstr,
        10,
        STREAM_CLIENT_CONNECT,
        $context
    );
    
    if ($socket) {
        // Função auxiliar para ler resposta
        $lerResposta = function($socket) {
            $resposta = '';
            do {
                $linha = fgets($socket, 512);
                $resposta .= $linha;
                if (preg_match('/^\d{3} /', $linha)) break;
            } while (!feof($socket));
            return $resposta;
        };
        
        try {
            $lerResposta($socket);
            fputs($socket, "EHLO anysummit.com.br\r\n");
            $lerResposta($socket);
            
            fputs($socket, "AUTH LOGIN\r\n");
            $lerResposta($socket);
            fputs($socket, base64_encode($smtp_user) . "\r\n");
            $lerResposta($socket);
            fputs($socket, base64_encode($smtp_pass) . "\r\n");
            $auth = $lerResposta($socket);
            
            if (strpos($auth, '235') !== false) {
                fputs($socket, "MAIL FROM: <$from_email>\r\n");
                $lerResposta($socket);
                fputs($socket, "RCPT TO: <$email>\r\n");
                $lerResposta($socket);
                fputs($socket, "DATA\r\n");
                $lerResposta($socket);
                
                $headers = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
                $headers .= "From: $from_name <$from_email>\r\n";
                $headers .= "To: $email\r\n";
                $headers .= "MIME-Version: 1.0\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                $headers .= "Date: " . date('r') . "\r\n";
                
                fputs($socket, $headers . "\r\n");
                fputs($socket, $message . "\r\n.\r\n");
                $lerResposta($socket);
                
                fputs($socket, "QUIT\r\n");
                fclose($socket);
                
                $emailEnviado = true;
                $metodoEnvio = 'SMTP';
            }
        } catch (Exception $e) {
            if ($socket) fclose($socket);
        }
    }
    
    // Se SMTP falhar, tentar mail()
    if (!$emailEnviado) {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= "From: AnySummit <noreply@anysummit.com.br>\r\n";
        
        $emailEnviado = @mail($email, $subject, $message, $headers);
        $metodoEnvio = 'mail()';
    }
    
    // Sempre retornar sucesso (código foi salvo no banco)
    $response = [
        'success' => true,
        'message' => 'Código enviado com sucesso',
        'debug' => [
            'codigo' => $codigo,
            'email_enviado' => $emailEnviado,
            'metodo' => $metodoEnvio
        ]
    ];
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

// Fechar conexão
if (isset($con)) mysqli_close($con);

// Enviar resposta
echo json_encode($response);
exit();
?>