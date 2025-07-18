<?php
/**
 * Teste Rápido de Email - Linha de Comando
 * 
 * Execute via terminal: php teste-email-simples.php email@exemplo.com
 * ou acesse via navegador: /evento/teste-email-simples.php?email=email@exemplo.com
 */

// Configurar para mostrar erros
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar email
$email_teste = '';
if (isset($argv[1])) {
    // Chamada via linha de comando
    $email_teste = $argv[1];
} elseif (isset($_GET['email'])) {
    // Chamada via navegador
    $email_teste = $_GET['email'];
} else {
    echo "❌ Uso: php teste-email-simples.php email@exemplo.com\n";
    echo "   ou: /evento/teste-email-simples.php?email=email@exemplo.com\n";
    exit(1);
}

if (!filter_var($email_teste, FILTER_VALIDATE_EMAIL)) {
    echo "❌ Email inválido: $email_teste\n";
    exit(1);
}

echo "🧪 Testando envio de email para: $email_teste\n";
echo "⏳ Configurando conexão SMTP...\n";

// ========================================
// CONFIGURAÇÃO LOCAWEB
// ========================================
$config = [
    'host' => 'email-ssl.com.br',
    'port' => 465,
    'user' => 'noreply@anysummit.com.br',
    'pass' => 'Swko15357523@#',
    'from_email' => 'noreply@anysummit.com.br',
    'from_name' => 'Any Summit - Teste Simples'
];

// Testar conexão
echo "🔌 Testando conexão com {$config['host']}:{$config['port']}...\n";

$context = stream_context_create([
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true
    ]
]);

$socket = stream_socket_client(
    "ssl://{$config['host']}:{$config['port']}", 
    $errno, 
    $errstr, 
    10, 
    STREAM_CLIENT_CONNECT, 
    $context
);

if (!$socket) {
    echo "❌ Erro de conexão: $errstr ($errno)\n";
    echo "💡 Possíveis causas:\n";
    echo "   - Servidor bloqueando conexões SSL\n";
    echo "   - Firewall bloqueando porta 465\n";
    echo "   - Configurações SMTP incorretas na Locaweb\n";
    exit(1);
}

echo "✅ Conexão estabelecida!\n";
echo "🔐 Testando autenticação...\n";

// Função para ler resposta SMTP
function lerResposta($socket, $esperado = null) {
    $resposta = fgets($socket, 512);
    echo "📨 Servidor: " . trim($resposta) . "\n";
    
    if ($esperado && strpos($resposta, $esperado) !== 0) {
        echo "❌ Erro: Esperado '$esperado', recebido '$resposta'\n";
        return false;
    }
    return $resposta;
}

try {
    // Handshake inicial
    lerResposta($socket, '220');
    
    // EHLO
    fputs($socket, "EHLO anysummit.com.br\r\n");
    lerResposta($socket, '250');
    
    // Autenticação
    fputs($socket, "AUTH LOGIN\r\n");
    lerResposta($socket, '334');
    
    fputs($socket, base64_encode($config['user']) . "\r\n");
    lerResposta($socket, '334');
    
    fputs($socket, base64_encode($config['pass']) . "\r\n");
    $auth_response = lerResposta($socket, '235');
    
    if (strpos($auth_response, '235') === 0) {
        echo "✅ Autenticação bem-sucedida!\n";
    } else {
        echo "❌ Falha na autenticação\n";
        echo "💡 Verifique email e senha na Locaweb\n";
        exit(1);
    }
    
    echo "📧 Enviando email de teste...\n";
    
    // Enviar email
    fputs($socket, "MAIL FROM: <{$config['from_email']}>\r\n");
    lerResposta($socket, '250');
    
    fputs($socket, "RCPT TO: <$email_teste>\r\n");
    lerResposta($socket, '250');
    
    fputs($socket, "DATA\r\n");
    lerResposta($socket, '354');
    
    // Conteúdo do email
    $assunto = "=?UTF-8?B?" . base64_encode("🧪 Teste Simples - Any Summit") . "?=";
    $html = "Subject: $assunto\r\n";
    $html .= "From: {$config['from_name']} <{$config['from_email']}>\r\n";
    $html .= "Content-Type: text/html; charset=UTF-8\r\n";
    $html .= "\r\n";
    $html .= "<h2>✅ Teste de Email Simples</h2>";
    $html .= "<p>Este email foi enviado em: " . date('d/m/Y H:i:s') . "</p>";
    $html .= "<p>Se você recebeu este email, a configuração SMTP está funcionando!</p>";
    $html .= "<hr><small>Any Summit - Sistema de Email Configurado</small>";
    
    fputs($socket, $html . "\r\n.\r\n");
    lerResposta($socket, '250');
    
    // Finalizar
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    echo "🎉 Email enviado com sucesso!\n";
    echo "📬 Verifique a caixa de entrada de: $email_teste\n";
    echo "📄 (Incluindo pasta de spam)\n";
    
} catch (Exception $e) {
    echo "❌ Erro durante o envio: " . $e->getMessage() . "\n";
    if (isset($socket) && is_resource($socket)) {
        fclose($socket);
    }
    exit(1);
}

echo "\n✅ Teste concluído!\n";

// Se chamado via navegador, mostrar resultado em HTML
if (isset($_GET['email'])) {
    echo "<br><br><a href='/evento/teste-email.php'>🔙 Voltar ao teste completo</a>";
}
?>