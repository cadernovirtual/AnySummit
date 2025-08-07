<?php
// Arquivo de teste para envio de email - Locaweb
// Acesse via: /evento/teste-email.php

include("conm/conn.php");

// Verificar se formulário foi enviado
$teste_enviado = false;
$resultado = '';
$erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email_teste = $_POST['email_teste'] ?? '';
    $nome_teste = $_POST['nome_teste'] ?? 'Usuário Teste';
    
    if (empty($email_teste)) {
        $erro = 'Por favor, informe um email para teste.';
    } elseif (!filter_var($email_teste, FILTER_VALIDATE_EMAIL)) {
        $erro = 'Email inválido.';
    } else {
        $teste_enviado = true;
        
        // Testar envio de email
        try {
            $sucesso = testarEnvioEmail($email_teste, $nome_teste);
            if ($sucesso) {
                $resultado = "✅ Email enviado com sucesso para: $email_teste";
            } else {
                $resultado = "❌ Falha no envio do email. Verifique os logs do servidor.";
            }
        } catch (Exception $e) {
            $resultado = "❌ Erro: " . $e->getMessage();
        }
    }
}

// Função de teste de email (cópia da função principal com algumas modificações)
function testarEnvioEmail($email, $nome) {
    $to = $email;
    $subject = "🧪 Teste de Email - Any Summit";
    
    // Template simples para teste
    $html = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teste de Email</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #e91e63;
                padding-bottom: 20px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #e91e63;
                margin-bottom: 10px;
            }
            .test-badge {
                background: #28a745;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                display: inline-block;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Any Summit</div>
                <div style="color: #666;">Teste de Configuração de Email</div>
            </div>
            
            <div class="test-badge">🧪 EMAIL DE TESTE</div>
            
            <h1 style="color: #e91e63;">Olá, ' . htmlspecialchars($nome) . '!</h1>
            
            <p>Este é um email de teste para verificar se a configuração SMTP está funcionando corretamente.</p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h3 style="color: #155724; margin-top: 0;">✅ Teste realizado com sucesso!</h3>
                <p style="margin-bottom: 0; color: #155724;">
                    Se você recebeu este email, significa que:
                </p>
                <ul style="color: #155724;">
                    <li>As configurações SMTP estão corretas</li>
                    <li>O servidor está enviando emails normalmente</li>
                    <li>A autenticação foi realizada com sucesso</li>
                </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0;">📋 Informações do Teste:</h4>
                <p style="color: #856404; margin-bottom: 5px;"><strong>Data/Hora:</strong> ' . date('d/m/Y H:i:s') . '</p>
                <p style="color: #856404; margin-bottom: 5px;"><strong>Servidor:</strong> ' . $_SERVER['HTTP_HOST'] . '</p>
                <p style="color: #856404; margin-bottom: 0;"><strong>Email de origem:</strong> noreply@anysummit.com.br</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                <p>Este é um email automático de teste. Não é necessário responder.</p>
                <p>&copy; ' . date('Y') . ' Any Summit. Sistema de Email Configurado.</p>
            </div>
        </div>
    </body>
    </html>';
    
    // ========================================
    // CONFIGURAÇÃO LOCAWEB (mesma do sistema principal)
    // ========================================
    $smtp_host = 'mail.anysummit.com.br';
    $smtp_port = 465;
    $smtp_user = 'ingressos@anysummit.com.br';
    $smtp_pass = 'Miran@Janyne@Gustavo';
    $from_email = 'ingressos@anysummit.com.br';
    $from_name = 'Any Summit - Teste';
    
    return enviarEmailSMTPLocaweb($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
}

// Função SMTP Locaweb (cópia da principal)
function enviarEmailSMTPLocaweb($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: $from_name <$from_email>",
        "Reply-To: $from_email"
    ];
    
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    
    $socket = stream_socket_client("ssl://$smtp_host:$smtp_port", $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        error_log("Erro SMTP Teste Locaweb: $errstr ($errno)");
        throw new Exception("Erro de conexão: $errstr ($errno)");
    }
    
    $smtp_response = function($expected = null) use ($socket) {
        $response = fgets($socket, 512);
        error_log("SMTP Teste Response: $response");
        if ($expected && strpos($response, $expected) !== 0) {
            throw new Exception("Erro SMTP: Esperado '$expected', recebido '$response'");
        }
        return $response;
    };
    
    try {
        $smtp_response('220');
        fputs($socket, "EHLO " . ($_SERVER['HTTP_HOST'] ?? 'anysummit.com.br') . "\r\n");
        $smtp_response('250');
        
        fputs($socket, "AUTH LOGIN\r\n");
        $smtp_response('334');
        fputs($socket, base64_encode($smtp_user) . "\r\n");
        $smtp_response('334');
        fputs($socket, base64_encode($smtp_pass) . "\r\n");
        $smtp_response('235');
        
        fputs($socket, "MAIL FROM: <$from_email>\r\n");
        $smtp_response('250');
        fputs($socket, "RCPT TO: <$to>\r\n");
        $smtp_response('250');
        fputs($socket, "DATA\r\n");
        $smtp_response('354');
        
        fputs($socket, "Subject: $subject\r\n");
        fputs($socket, implode("\r\n", $headers) . "\r\n\r\n");
        fputs($socket, $html . "\r\n.\r\n");
        $smtp_response('250');
        
        fputs($socket, "QUIT\r\n");
        fclose($socket);
        
        error_log("Email de teste enviado com sucesso via Locaweb para: $to");
        return true;
        
    } catch (Exception $e) {
        error_log("Erro no teste SMTP Locaweb: " . $e->getMessage());
        if (isset($socket) && is_resource($socket)) {
            fclose($socket);
        }
        throw $e;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Email - Any Summit</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #e91e63 0%, #9c27b0 50%, #673ab7 100%);
            min-height: 100vh;
            padding: 20px 0;
        }
        
        .test-container {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .card-header {
            background: white;
            border-bottom: none;
            text-align: center;
            padding: 2rem 2rem 1rem;
            border-radius: 20px 20px 0 0;
        }
        
        .logo {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .form-control {
            border-radius: 12px;
            border: 2px solid #f1f3f4;
            padding: 12px 16px;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: #e91e63;
            box-shadow: 0 0 0 0.2rem rgba(233, 30, 99, 0.25);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            border: none;
            border-radius: 12px;
            padding: 12px 30px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
        }
        
        .status-card {
            border-radius: 15px;
            margin-bottom: 20px;
        }
        
        .config-info {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="test-container">
        <div class="card">
            <div class="card-header">
                <div class="logo">Any Summit</div>
                <div class="text-muted">🧪 Teste de Configuração de Email</div>
            </div>
            
            <div class="card-body p-4">
                <!-- Informações da Configuração -->
                <div class="config-info">
                    <h6 class="fw-bold mb-3">📋 Configuração Atual:</h6>
                    <div class="row">
                        <div class="col-sm-6 mb-2">
                            <strong>Servidor:</strong> email-ssl.com.br
                        </div>
                        <div class="col-sm-6 mb-2">
                            <strong>Porta:</strong> 465 (SSL)
                        </div>
                        <div class="col-sm-6 mb-2">
                            <strong>Email:</strong> noreply@anysummit.com.br
                        </div>
                        <div class="col-sm-6 mb-2">
                            <strong>Provedor:</strong> Locaweb
                        </div>
                    </div>
                </div>

                <!-- Resultado do teste -->
                <?php if ($teste_enviado): ?>
                    <div class="status-card">
                        <?php if (strpos($resultado, '✅') !== false): ?>
                            <div class="alert alert-success">
                                <h6><i class="fas fa-check-circle me-2"></i>Teste Concluído</h6>
                                <p class="mb-0"><?php echo $resultado; ?></p>
                                <small class="d-block mt-2">
                                    Verifique sua caixa de entrada (incluindo spam) para o email de teste.
                                </small>
                            </div>
                        <?php else: ?>
                            <div class="alert alert-danger">
                                <h6><i class="fas fa-exclamation-triangle me-2"></i>Teste Falhou</h6>
                                <p class="mb-0"><?php echo $resultado; ?></p>
                                <small class="d-block mt-2">
                                    Verifique os logs do servidor para mais detalhes do erro.
                                </small>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <?php if ($erro): ?>
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <?php echo $erro; ?>
                    </div>
                <?php endif; ?>

                <!-- Formulário de teste -->
                <form method="POST">
                    <div class="mb-3">
                        <label for="nome_teste" class="form-label">Nome para teste</label>
                        <input type="text" class="form-control" id="nome_teste" name="nome_teste" 
                               value="<?php echo htmlspecialchars($_POST['nome_teste'] ?? 'Usuário Teste'); ?>">
                    </div>
                    
                    <div class="mb-3">
                        <label for="email_teste" class="form-label">Email para receber o teste *</label>
                        <input type="email" class="form-control" id="email_teste" name="email_teste" 
                               value="<?php echo htmlspecialchars($_POST['email_teste'] ?? ''); ?>" 
                               placeholder="seu@email.com" required>
                        <small class="text-muted">
                            Digite seu email para receber um email de teste e verificar se está funcionando
                        </small>
                    </div>
                    
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane me-2"></i>
                            Enviar Email de Teste
                        </button>
                    </div>
                </form>

                <!-- Instruções -->
                <div class="mt-4">
                    <h6 class="fw-bold">📌 Como usar este teste:</h6>
                    <ol class="small">
                        <li>Digite um email válido (seu email pessoal)</li>
                        <li>Clique em "Enviar Email de Teste"</li>
                        <li>Verifique sua caixa de entrada (incluindo spam)</li>
                        <li>Se o email chegou, a configuração está funcionando</li>
                        <li>Se não chegou, verifique os logs do servidor</li>
                    </ol>
                </div>

                <!-- Links úteis -->
                <div class="text-center mt-4 pt-3 border-top">
                    <div class="d-flex gap-2 justify-content-center flex-wrap">
                        <a href="/evento" class="btn btn-outline-primary btn-sm">
                            <i class="fas fa-arrow-left me-1"></i>Voltar aos Eventos
                        </a>
                        <a href="/evento/checkout/congresso-2025" class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-shopping-cart me-1"></i>Testar Checkout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>