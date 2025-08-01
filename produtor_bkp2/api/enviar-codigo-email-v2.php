<?php
// API para enviar código de verificação por email - VERSÃO FUNCIONAL
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
    
    // ========================================
    // ENVIAR VIA SMTP LOCAWEB
    // ========================================
    $smtp_server = 'email-ssl.com.br';
    $smtp_port = 465;
    $smtp_user = 'noreply@anysummit.com.br';
    $smtp_pass = 'Swko15357523@#';
    $from_email = 'noreply@anysummit.com.br';
    $from_name = 'AnySummit';
    
    // Função para enviar via SMTP
    function enviarSMTP($to, $subject, $html, $smtp_server, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
        // Criar contexto SSL
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);
        
        // Conectar ao servidor SMTP
        $socket = stream_socket_client(
            "ssl://$smtp_server:$smtp_port",
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT,
            $context
        );
        
        if (!$socket) {
            throw new Exception("Erro de conexão SMTP: $errstr ($errno)");
        }
        
        // Função para ler resposta
        $lerResposta = function($socket, $esperado = null) {
            $resposta = '';
            do {
                $linha = fgets($socket, 512);
                $resposta .= $linha;
                
                if (preg_match('/^\d{3} /', $linha)) {
                    break;
                }
            } while (!feof($socket));
            
            if ($esperado && strpos($resposta, $esperado) === false) {
                throw new Exception("Resposta SMTP inesperada: $resposta");
            }
            return $resposta;
        };
        
        try {
            // Ler banner inicial
            $lerResposta($socket, '220');
            
            // EHLO
            fputs($socket, "EHLO anysummit.com.br\r\n");
            $lerResposta($socket, '250');
            
            // Autenticação
            fputs($socket, "AUTH LOGIN\r\n");
            $lerResposta($socket, '334');
            fputs($socket, base64_encode($smtp_user) . "\r\n");
            $lerResposta($socket, '334');
            fputs($socket, base64_encode($smtp_pass) . "\r\n");
            $auth_resp = $lerResposta($socket, '235');
            
            if (strpos($auth_resp, '235') === false) {
                throw new Exception("Falha na autenticação SMTP");
            }
            
            // Enviar email
            fputs($socket, "MAIL FROM: <$from_email>\r\n");
            $lerResposta($socket, '250');
            fputs($socket, "RCPT TO: <$to>\r\n");
            $lerResposta($socket, '250');
            fputs($socket, "DATA\r\n");
            $lerResposta($socket, '354');
            
            // Cabeçalhos e conteúdo
            $headers = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
            $headers .= "From: $from_name <$from_email>\r\n";
            $headers .= "To: $to\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "Date: " . date('r') . "\r\n";
            
            fputs($socket, $headers . "\r\n");
            fputs($socket, $html . "\r\n.\r\n");
            $lerResposta($socket, '250');
            
            // Fechar conexão
            fputs($socket, "QUIT\r\n");
            fclose($socket);
            
            return true;
            
        } catch (Exception $e) {
            if (isset($socket) && is_resource($socket)) {
                fclose($socket);
            }
            throw $e;
        }
    }
    
    // Tentar enviar via SMTP
    $emailEnviado = false;
    $erro = '';
    
    try {
        $emailEnviado = enviarSMTP($to, $subject, $message, $smtp_server, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
    } catch (Exception $e) {
        $erro = $e->getMessage();
        error_log("Erro SMTP: " . $erro);
        
        // Fallback: tentar mail() básico
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: AnySummit <noreply@anysummit.com.br>" . "\r\n";
        
        $emailEnviado = @mail($to, $subject, $message, $headers);
    }
    
    // Log do código para debug
    error_log("Código de verificação para $email: $codigo");
    
    if ($emailEnviado) {
        echo json_encode([
            'success' => true,
            'message' => 'Código enviado com sucesso',
            'debug' => [
                'codigo' => $codigo, // Remover em produção
                'metodo' => isset($erro) && $erro ? 'mail()' : 'SMTP'
            ]
        ]);
    } else {
        throw new Exception('Não foi possível enviar o email. ' . $erro);
    }
    
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
}
?>