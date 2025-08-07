<?php
/**
 * Script de Teste SMTP Diagnóstico - AnySummit
 * Testa diferentes configurações para encontrar a correta
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$email_teste = 'gustavo@cadernovirtual.com.br';

echo "<h1>🔧 Diagnóstico SMTP - AnySummit</h1>";
echo "<p><strong>Testando diferentes configurações...</strong></p>";
echo "<hr>";

// ========================================
// TESTE 1: SSL direto na porta 465
// ========================================
echo "<h2>🧪 Teste 1: SSL direto (porta 465)</h2>";

$smtp_host = 'mail.anysummit.com.br';
$smtp_port = 465;
$smtp_user = 'ingressos@anysummit.com.br';
$smtp_pass = 'Miran@Janyne@Gustavo';

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

if ($connection) {
    $response = fgets($connection, 515);
    echo "✅ <strong>Conexão SSL:</strong> $response<br>";
    
    // EHLO
    fputs($connection, "EHLO $smtp_host\r\n");
    $response = '';
    do {
        $line = fgets($connection, 515);
        $response .= $line;
        echo "📝 <strong>EHLO Response:</strong> " . trim($line) . "<br>";
    } while (isset($line[3]) && $line[3] == '-');
    
    fclose($connection);
} else {
    echo "❌ <strong>Erro SSL:</strong> $errstr ($errno)<br>";
}

echo "<br>";

// ========================================
// TESTE 2: TLS na porta 587
// ========================================
echo "<h2>🧪 Teste 2: TLS (porta 587)</h2>";

$smtp_port_tls = 587;

$connection2 = stream_socket_client(
    "tcp://$smtp_host:$smtp_port_tls",
    $errno, $errstr, 30
);

if ($connection2) {
    $response = fgets($connection2, 515);
    echo "✅ <strong>Conexão TLS:</strong> $response<br>";
    
    // EHLO
    fputs($connection2, "EHLO $smtp_host\r\n");
    $response = '';
    do {
        $line = fgets($connection2, 515);
        $response .= $line;
        echo "📝 <strong>EHLO Response:</strong> " . trim($line) . "<br>";
    } while (isset($line[3]) && $line[3] == '-');
    
    fclose($connection2);
} else {
    echo "❌ <strong>Erro TLS:</strong> $errstr ($errno)<br>";
}

echo "<br>";

// ========================================
// TESTE 3: Teste com PHPMailer (se disponível)
// ========================================
echo "<h2>🧪 Teste 3: Função mail() do PHP</h2>";

$to = $email_teste;
$subject = "Teste mail() - AnySummit";
$message = "<h1>Teste simples</h1><p>Este é um teste usando a função mail() do PHP.</p>";
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: Any Summit <ingressos@anysummit.com.br>'
];

if (function_exists('mail')) {
    $resultado = mail($to, $subject, $message, implode("\r\n", $headers));
    echo $resultado ? "✅ <strong>mail() funcionou!</strong>" : "❌ <strong>mail() falhou</strong>";
} else {
    echo "❌ <strong>Função mail() não disponível</strong>";
}

echo "<br><br>";

// ========================================
// TESTE 4: Diagnóstico DNS
// ========================================
echo "<h2>🧪 Teste 4: Verificações DNS</h2>";

// Teste de resolução DNS
$ip = gethostbyname($smtp_host);
echo "<strong>Resolução DNS:</strong> $smtp_host → $ip<br>";

// Teste de registros MX
if (function_exists('dns_get_record')) {
    $mx_records = dns_get_record($smtp_host, DNS_MX);
    if ($mx_records) {
        echo "<strong>Registros MX encontrados:</strong><br>";
        foreach ($mx_records as $mx) {
            echo "  - {$mx['target']} (prioridade: {$mx['pri']})<br>";
        }
    } else {
        echo "<strong>Nenhum registro MX encontrado</strong><br>";
    }
} else {
    echo "<strong>Função dns_get_record não disponível</strong><br>";
}

echo "<br>";

// ========================================
// SUGESTÕES BASEADAS NOS TESTES
// ========================================
echo "<h2>💡 Possíveis Soluções</h2>";
echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 8px;'>";
echo "<strong>Se os testes acima falharam, tente:</strong><br><br>";
echo "1. <strong>Verificar com o provedor</strong> se o servidor SMTP está ativo<br>";
echo "2. <strong>Testar porta 587</strong> com STARTTLS em vez de SSL direto<br>";
echo "3. <strong>Verificar firewall</strong> do servidor que pode estar bloqueando<br>";
echo "4. <strong>Confirmar credenciais</strong> diretamente no painel de email<br>";
echo "5. <strong>Testar de outro servidor</strong> para verificar bloqueios de IP<br>";
echo "</div>";

echo "<br>";
echo "<h3>📋 Configurações Testadas:</h3>";
echo "<ul>";
echo "<li><strong>Servidor:</strong> $smtp_host</li>";
echo "<li><strong>Usuário:</strong> $smtp_user</li>";
echo "<li><strong>Porta SSL:</strong> 465</li>";
echo "<li><strong>Porta TLS:</strong> 587</li>";
echo "</ul>";

echo "<p><em>Diagnóstico executado em " . date('d/m/Y H:i:s') . "</em></p>";
?>