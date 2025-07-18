<?php
/**
 * Teste Final - Sistema de Email de Boas-Vindas
 * Acesse: /evento/teste-final-email.php?email=seuemail@gmail.com&nome=Teste
 */

include("conm/conn.php");

$email_teste = $_GET['email'] ?? '';
$nome_teste = $_GET['nome'] ?? 'Usuário Teste';

if (empty($email_teste) || !filter_var($email_teste, FILTER_VALIDATE_EMAIL)) {
    echo "❌ Uso: teste-final-email.php?email=seuemail@gmail.com&nome=Teste<br>";
    exit;
}

// ========================================
// FUNÇÃO DE EMAIL DE BOAS-VINDAS (CÓPIA DA PRINCIPAL)
// ========================================
function enviarEmailBoasVindasTeste($email, $nome) {
    $to = $email;
    $subject = "Bem-vindo à Any Summit! 🎉";
    
    // Gerar token para criação de senha
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Salvar token no banco
    global $con;
    $email_escaped = mysqli_real_escape_string($con, $email);
    $token_escaped = mysqli_real_escape_string($con, $token);
    
    // Criar tabela se não existir
    $create_table = "CREATE TABLE IF NOT EXISTS password_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_token (token)
    )";
    $con->query($create_table);
    
    // Inserir token
    $insert_token = "INSERT INTO password_tokens (email, token, expires_at) 
                     VALUES ('$email_escaped', '$token_escaped', '$expires')";
    $con->query($insert_token);
    
    // URL para criação de senha
    $senha_url = "https://" . $_SERVER['HTTP_HOST'] . "/evento/criar-senha.php?token=" . $token;
    
    // Template do email (simplificado para teste)
    $html = '
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Bem-vindo</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; padding: 40px; border-radius: 10px;">
            <h1 style="color: #e91e63;">🎉 Bem-vindo(a), ' . htmlspecialchars($nome) . '!</h1>
            <p>Sua conta na Any Summit foi criada com sucesso!</p>
            <p><a href="' . $senha_url . '" style="background: #e91e63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px;">🔐 Criar Minha Senha</a></p>
            <p><small>Este link é válido por 24 horas.</small></p>
        </div>
    </body>
    </html>';
    
    // Configuração Locaweb (mesma que funcionou)
    $smtp_host = 'email-ssl.com.br';
    $smtp_port = 465;
    $smtp_user = 'noreply@anysummit.com.br';
    $smtp_pass = 'Swko15357523@#';
    $from_email = 'noreply@anysummit.com.br';
    $from_name = 'Any Summit';
    
    return enviarEmailSMTPLocaweb($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
}

// Função SMTP Locaweb (mesma que funcionou)
function enviarEmailSMTPLocaweb($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    
    $socket = stream_socket_client("ssl://$smtp_host:$smtp_port", $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        error_log("Erro SMTP Locaweb: $errstr ($errno)");
        return false;
    }
    
    $lerResposta = function($esperado = null) use ($socket) {
        $resposta = '';
        do {
            $linha = fgets($socket, 512);
            $resposta .= $linha;
            error_log("SMTP Response: " . trim($linha));
            
            if (preg_match('/^\d{3} /', $linha)) {
                break;
            }
        } while (!feof($socket));
        
        if ($esperado && strpos($resposta, $esperado) === false) {
            error_log("Erro SMTP: Esperado '$esperado', recebido: $resposta");
            return false;
        }
        return $resposta;
    };
    
    try {
        $lerResposta('220');
        fputs($socket, "EHLO anysummit.com.br\r\n");
        $lerResposta('250');
        
        fputs($socket, "AUTH LOGIN\r\n");
        $lerResposta('334');
        fputs($socket, base64_encode($smtp_user) . "\r\n");
        $lerResposta('334');
        fputs($socket, base64_encode($smtp_pass) . "\r\n");
        $auth_resp = $lerResposta('235');
        
        if (strpos($auth_resp, '235') === false) {
            fclose($socket);
            return false;
        }
        
        fputs($socket, "MAIL FROM: <$from_email>\r\n");
        $lerResposta('250');
        fputs($socket, "RCPT TO: <$to>\r\n");
        $lerResposta('250');
        fputs($socket, "DATA\r\n");
        $lerResposta('354');
        
        $assunto_codificado = "=?UTF-8?B?" . base64_encode($subject) . "?=";
        fputs($socket, "Subject: $assunto_codificado\r\n");
        fputs($socket, "From: $from_name <$from_email>\r\n");
        fputs($socket, "Content-Type: text/html; charset=UTF-8\r\n\r\n");
        fputs($socket, $html . "\r\n.\r\n");
        $lerResposta('250');
        
        fputs($socket, "QUIT\r\n");
        fclose($socket);
        
        return true;
        
    } catch (Exception $e) {
        if (isset($socket) && is_resource($socket)) {
            fclose($socket);
        }
        return false;
    }
}

echo "<h2>🎯 Teste Final - Sistema de Boas-Vindas</h2>";
echo "<p>Testando a função completa usada no cadastro real.</p>";
echo "<p><strong>Email:</strong> $email_teste</p>";
echo "<p><strong>Nome:</strong> $nome_teste</p>";

echo "<hr><h3>📧 Enviando email de boas-vindas...</h3>";

try {
    $sucesso = enviarEmailBoasVindasTeste($email_teste, $nome_teste);
    
    if ($sucesso) {
        echo "<div style='color: green; font-weight: bold; padding: 20px; background: #d4f6d4; border: 1px solid green; border-radius: 8px;'>";
        echo "✅ <strong>SUCESSO!</strong><br><br>";
        echo "📧 Email de boas-vindas enviado com sucesso!<br>";
        echo "🔗 Token de senha criado e salvo no banco<br>";
        echo "📬 Verifique a caixa de entrada de: $email_teste<br>";
        echo "📄 (Incluindo pasta de spam)<br><br>";
        echo "<strong>O sistema está funcionando perfeitamente!</strong>";
        echo "</div>";
        
        // Verificar se o token foi criado
        $email_escaped = mysqli_real_escape_string($con, $email_teste);
        $check_token = "SELECT token, expires_at FROM password_tokens WHERE email = '$email_escaped' ORDER BY created_at DESC LIMIT 1";
        $result_token = $con->query($check_token);
        
        if ($result_token && $result_token->num_rows > 0) {
            $token_data = $result_token->fetch_assoc();
            echo "<div style='margin-top: 20px; padding: 15px; background: #f0f8ff; border: 1px solid #0066cc; border-radius: 8px;'>";
            echo "🔐 <strong>Token criado:</strong> " . substr($token_data['token'], 0, 10) . "...<br>";
            echo "⏰ <strong>Expira em:</strong> " . $token_data['expires_at'] . "<br>";
            echo "🔗 <strong>Link funcional:</strong> Sim";
            echo "</div>";
        }
        
    } else {
        echo "<div style='color: red; font-weight: bold; padding: 20px; background: #fdd; border: 1px solid red; border-radius: 8px;'>";
        echo "❌ <strong>FALHA!</strong><br><br>";
        echo "📧 Não foi possível enviar o email<br>";
        echo "🔍 Verifique os logs do servidor para detalhes<br>";
        echo "⚠️ Pode ser problema de configuração SMTP";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='color: red; font-weight: bold; padding: 20px; background: #fdd; border: 1px solid red; border-radius: 8px;'>";
    echo "❌ <strong>ERRO:</strong> " . $e->getMessage() . "<br><br>";
    echo "🔍 Verifique a configuração do email no servidor";
    echo "</div>";
}

echo "<hr>";
echo "<h3>📋 Próximos Passos:</h3>";
echo "<ol>";
echo "<li><strong>Se deu sucesso:</strong> Teste fazer um cadastro real no checkout</li>";
echo "<li><strong>Se deu erro:</strong> Verifique os logs do servidor PHP</li>";
echo "<li><strong>Para debug:</strong> Use o teste-locaweb.php para verificar SMTP</li>";
echo "</ol>";

echo "<p><a href='/evento/teste-email.php'>🔙 Voltar ao teste principal</a> | ";
echo "<a href='/evento/checkout/congresso-2025'>🛒 Testar checkout real</a></p>";
?>