<?php
/**
 * Script de Teste de Todos os Templates de Email
 * Dispara todos os templates encontrados no sistema para gustavo@cadernovirtual.com.br
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Email de destino para testes
$email_teste = 'gustavo@cadernovirtual.com.br';
$nome_teste = 'Gustavo Teste';

echo "<h1>🧪 Teste de Templates de Email - AnySummit</h1>";
echo "<p><strong>Destinatário:</strong> $email_teste</p>";
echo "<p><strong>Data/Hora:</strong> " . date('d/m/Y H:i:s') . "</p>";
echo "<hr>";

// Configurações SMTP atualizadas
$smtp_host = 'mail.anysummit.com.br';
$smtp_port = 465;
$smtp_user = 'ingressos@anysummit.com.br';
$smtp_pass = 'Miran@Janyne@Gustavo';
$from_email = 'ingressos@anysummit.com.br';
$from_name = 'Any Summit';

// ========================================
// FUNÇÃO SMTP PARA ENVIO (CORRIGIDA)
// ========================================
function enviarEmailSMTP($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
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
    
    $connection = stream_socket_client(
        "ssl://$smtp_host:$smtp_port",
        $errno, $errstr, 30, STREAM_CLIENT_CONNECT, $context
    );
    
    if (!$connection) {
        return "Erro de conexão: $errstr ($errno)";
    }
    
    // Ler resposta inicial
    $response = fgets($connection, 515);
    if (substr($response, 0, 3) != '220') {
        fclose($connection);
        return "Erro de conexão SMTP: $response";
    }
    
    // EHLO (em vez de HELO) - necessário para AUTH
    fputs($connection, "EHLO $smtp_host\r\n");
    $response = '';
    do {
        $line = fgets($connection, 515);
        $response .= $line;
    } while ($line[3] == '-'); // Ler todas as linhas de resposta EHLO
    
    if (substr($response, 0, 3) != '250') {
        fclose($connection);
        return "Erro EHLO: $response";
    }
    
    // Verificar se AUTH está disponível
    if (strpos($response, 'AUTH') === false) {
        fclose($connection);
        return "Servidor não suporta autenticação: $response";
    }
    
    // STARTTLS se necessário (alguns servidores exigem)
    if (strpos($response, 'STARTTLS') !== false) {
        fputs($connection, "STARTTLS\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '220') {
            fclose($connection);
            return "Erro STARTTLS: $response";
        }
        
        // Recriar conexão com TLS
        if (!stream_socket_enable_crypto($connection, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($connection);
            return "Erro ao habilitar TLS";
        }
        
        // EHLO novamente após TLS
        fputs($connection, "EHLO $smtp_host\r\n");
        $response = '';
        do {
            $line = fgets($connection, 515);
            $response .= $line;
        } while ($line[3] == '-');
    }
    
    // AUTH LOGIN
    fputs($connection, "AUTH LOGIN\r\n");
    $response = fgets($connection, 515);
    if (substr($response, 0, 3) != '334') {
        fclose($connection);
        return "Erro AUTH LOGIN: $response";
    }
    
    // Enviar usuário (base64)
    fputs($connection, base64_encode($smtp_user) . "\r\n");
    $response = fgets($connection, 515);
    if (substr($response, 0, 3) != '334') {
        fclose($connection);
        return "Erro usuário: $response";
    }
    
    // Enviar senha (base64)
    fputs($connection, base64_encode($smtp_pass) . "\r\n");
    $response = fgets($connection, 515);
    if (substr($response, 0, 3) != '235') {
        fclose($connection);
        return "Erro de autenticação - senha: $response";
    }
    
    // MAIL FROM
    fputs($connection, "MAIL FROM: <$from_email>\r\n");
    $response = fgets($connection, 515);
    if (substr($response, 0, 3) != '250') {
        fclose($connection);
        return "Erro MAIL FROM: $response";
    }
    
    // RCPT TO
    fputs($connection, "RCPT TO: <$to>\r\n");
    $response = fgets($connection, 515);
    if (substr($response, 0, 3) != '250') {
        fclose($connection);
        return "Erro RCPT TO: $response";
    }
    
    // DATA
    fputs($connection, "DATA\r\n");
    $response = fgets($connection, 515);
    if (substr($response, 0, 3) != '354') {
        fclose($connection);
        return "Erro DATA: $response";
    }
    
    // Enviar mensagem
    $message = implode("\r\n", $headers) . "\r\n";
    $message .= "Subject: $subject\r\n\r\n";
    $message .= $html . "\r\n.\r\n";
    
    fputs($connection, $message);
    $response = fgets($connection, 515);
    
    // QUIT
    fputs($connection, "QUIT\r\n");
    fclose($connection);
    
    return substr($response, 0, 3) == '250';
}

// ========================================
// TEMPLATE 1: EMAIL DE BOAS-VINDAS
// ========================================
echo "<h2>📧 Template 1: Email de Boas-Vindas</h2>";

$token = bin2hex(random_bytes(16)); // Token de teste
$senha_url = "https://anysummit.com.br/evento/criar-senha.php?token=" . $token;

$html_boas_vindas = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Any Summit</title>
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
        .welcome-text {
            font-size: 18px;
            color: #666;
        }
        .content {
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #e91e63, #f06292);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .feature-item {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        .feature-icon {
            font-size: 24px;
            margin-right: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #e91e63;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎉 Any Summit</div>
            <div class="welcome-text">Sua plataforma de eventos favorita</div>
        </div>
        
        <div class="content">
            <h2>Olá, ' . htmlspecialchars($nome_teste) . '! 👋</h2>
            
            <p>Que alegria ter você conosco! Sua compra foi processada e agora você faz parte da família Any Summit. 🚀</p>
            
            <p>Para acessar sua conta e gerenciar seus ingressos, você precisa criar sua senha:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . $senha_url . '" class="cta-button">
                    🔐 Criar Minha Senha
                </a>
            </div>
            
            <div class="features">
                <h3>🌟 O que você pode fazer na sua conta:</h3>
                
                <div class="feature-item">
                    <div class="feature-icon">🎫</div>
                    <div>Ver e baixar seus ingressos em PDF</div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div>Transferir ingressos para outras pessoas</div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div>Acessar QR Codes para check-in rápido</div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">💳</div>
                    <div>Histórico completo de suas compras</div>
                </div>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <strong>⏰ Importante:</strong> Este link é válido por 24 horas. Após esse período, você precisará solicitar um novo link de criação de senha.
            </div>
            
            <div class="footer">
                <p>Se você não solicitou esta conta, pode ignorar este email.</p>
                <p>Precisa de ajuda? Entre em contato conosco: <a href="mailto:suporte@anysummit.com">suporte@anysummit.com</a></p>
                <p>&copy; ' . date('Y') . ' Any Summit. Todos os direitos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>';

$resultado1 = enviarEmailSMTP($email_teste, "Bem-vindo à Any Summit! 🎉", $html_boas_vindas, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
echo $resultado1 === true ? "✅ <strong>Enviado com sucesso!</strong>" : "❌ <strong>Erro:</strong> $resultado1";
echo "<br><br>";

// ========================================
// TEMPLATE 2: EMAIL DE CÓDIGO DE VERIFICAÇÃO
// ========================================
echo "<h2>📧 Template 2: Código de Verificação</h2>";

$codigo_verificacao = sprintf('%06d', rand(100000, 999999));

$html_codigo = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificação - Any Summit</title>
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
        .codigo-box {
            background: linear-gradient(135deg, #e91e63, #f06292);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
        }
        .codigo {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Código de Verificação</h1>
            <p>Any Summit - Plataforma de Eventos</p>
        </div>
        
        <div class="content">
            <p>Olá, <strong>' . htmlspecialchars($nome_teste) . '</strong>!</p>
            
            <p>Use o código abaixo para verificar sua conta:</p>
            
            <div class="codigo-box">
                <div class="codigo">' . $codigo_verificacao . '</div>
                <p>Digite este código na tela de verificação</p>
            </div>
            
            <p><strong>⏰ Este código expira em 10 minutos.</strong></p>
            
            <p>Se você não solicitou este código, ignore este email.</p>
        </div>
        
        <div class="footer">
            <p>Any Summit - Sistema de Eventos</p>
            <p>&copy; ' . date('Y') . ' Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>';

$resultado2 = enviarEmailSMTP($email_teste, "Seu código de verificação: $codigo_verificacao", $html_codigo, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
echo $resultado2 === true ? "✅ <strong>Enviado com sucesso!</strong>" : "❌ <strong>Erro:</strong> $resultado2";
echo "<br><br>";

// ========================================
// TEMPLATE 3: EMAIL DE INGRESSO (SIMULADO)
// ========================================
echo "<h2>📧 Template 3: Envio de Ingresso</h2>";

$codigo_ingresso = 'A1B2C3D4';
$evento_nome = 'Congresso de Tecnologia 2025';
$evento_data = '15/09/2025 às 09:00';
$evento_local = 'Centro de Convenções AnySummit';

$html_ingresso = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Ingresso - Any Summit</title>
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
        .ticket {
            background: linear-gradient(135deg, #e91e63, #f06292);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .ticket-code {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            border: 2px dashed white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 10px;
        }
        .evento-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .info-item {
            display: flex;
            margin: 10px 0;
        }
        .info-label {
            font-weight: bold;
            min-width: 120px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="text-align: center; margin-bottom: 30px;">
            <h1>🎫 Seu Ingresso Chegou!</h1>
            <p>Any Summit - Plataforma de Eventos</p>
        </div>
        
        <div class="content">
            <p>Olá, <strong>' . htmlspecialchars($nome_teste) . '</strong>!</p>
            
            <p>Seu ingresso está pronto! Veja os detalhes abaixo:</p>
            
            <div class="ticket">
                <h2>🎉 ' . $evento_nome . '</h2>
                <div class="ticket-code">' . $codigo_ingresso . '</div>
                <p>Apresente este código no evento</p>
            </div>
            
            <div class="evento-info">
                <h3>📋 Detalhes do Evento</h3>
                
                <div class="info-item">
                    <div class="info-label">📅 Data/Hora:</div>
                    <div>' . $evento_data . '</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">📍 Local:</div>
                    <div>' . $evento_local . '</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">🎫 Código:</div>
                    <div>' . $codigo_ingresso . '</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">👤 Participante:</div>
                    <div>' . htmlspecialchars($nome_teste) . '</div>
                </div>
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <strong>💡 Dica:</strong> Salve este email ou tire uma foto do código para facilitar o check-in no evento.
            </div>
            
            <p><strong>Nos vemos no evento! 🚀</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p>Any Summit - Sistema de Eventos</p>
            <p>&copy; ' . date('Y') . ' Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>';

$resultado3 = enviarEmailSMTP($email_teste, "🎫 Seu ingresso para $evento_nome", $html_ingresso, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
echo $resultado3 === true ? "✅ <strong>Enviado com sucesso!</strong>" : "❌ <strong>Erro:</strong> $resultado3";
echo "<br><br>";

// ========================================
// RESUMO DOS TESTES
// ========================================
echo "<hr>";
echo "<h2>📊 Resumo dos Testes</h2>";
echo "<ul>";
echo "<li><strong>Template 1 - Boas-vindas:</strong> " . ($resultado1 === true ? "✅ Sucesso" : "❌ Falha") . "</li>";
echo "<li><strong>Template 2 - Código:</strong> " . ($resultado2 === true ? "✅ Sucesso" : "❌ Falha") . "</li>";  
echo "<li><strong>Template 3 - Ingresso:</strong> " . ($resultado3 === true ? "✅ Sucesso" : "❌ Falha") . "</li>";
echo "</ul>";

echo "<h3>⚙️ Configurações SMTP Utilizadas:</h3>";
echo "<ul>";
echo "<li><strong>Servidor:</strong> $smtp_host</li>";
echo "<li><strong>Porta:</strong> $smtp_port</li>";
echo "<li><strong>Usuário:</strong> $smtp_user</li>";
echo "<li><strong>Remetente:</strong> $from_name &lt;$from_email&gt;</li>";
echo "</ul>";

echo "<p><em>Teste executado em " . date('d/m/Y H:i:s') . "</em></p>";
?>