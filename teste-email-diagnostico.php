<?php
/**
 * Teste simples para verificar se a função mail() está funcionando
 */

// Configurar para mostrar erros
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

echo "<h1>Teste de Configuração de Email</h1>";

// 1. Verificar se function mail() existe
if (function_exists('mail')) {
    echo "✅ Função mail() está disponível<br>";
} else {
    echo "❌ Função mail() não está disponível<br>";
    exit;
}

// 2. Verificar configurações do PHP
echo "<h2>Configurações PHP para Email:</h2>";
echo "SMTP: " . ini_get('SMTP') . "<br>";
echo "smtp_port: " . ini_get('smtp_port') . "<br>";
echo "sendmail_from: " . ini_get('sendmail_from') . "<br>";
echo "sendmail_path: " . ini_get('sendmail_path') . "<br>";

// 3. Teste de envio simples
echo "<h2>Teste de Envio:</h2>";

$para = "gustavo@cadernovirtual.com.br"; // Seu email para teste
$assunto = "Teste AnySummit - " . date('Y-m-d H:i:s');
$mensagem = "
<html>
<head><meta charset='UTF-8'></head>
<body>
    <h2>Teste de Email do AnySummit</h2>
    <p>Este é um teste para verificar se o envio de emails está funcionando.</p>
    <p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>
    <p><strong>IP do servidor:</strong> " . $_SERVER['SERVER_ADDR'] . "</p>
    <p><strong>User Agent:</strong> " . $_SERVER['HTTP_USER_AGENT'] . "</p>
</body>
</html>";

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: AnySummit <noreply@anysummit.com.br>" . "\r\n";
$headers .= "Reply-To: suporte@anysummit.com.br" . "\r\n";

echo "Enviando email para: $para<br>";
echo "Assunto: $assunto<br>";

$resultado = mail($para, $assunto, $mensagem, $headers);

if ($resultado) {
    echo "✅ <strong>Email enviado com sucesso!</strong><br>";
    echo "Verifique sua caixa de entrada e spam.<br>";
} else {
    echo "❌ <strong>Falha no envio do email!</strong><br>";
    echo "Verifique os logs de erro do servidor.<br>";
}

// 4. Teste do webhook N8N
echo "<h2>Teste do Webhook N8N:</h2>";

$webhook_url = 'https://n8n.webtoyou.com.br/webhook/3e669a00-7990-46b4-a6c7-58018270428a';
$dados_teste = [
    'teste' => true,
    'timestamp' => date('c'),
    'origem' => 'teste-email-anysummit',
    'destinatario' => [
        'nome' => 'Teste',
        'email' => $para
    ],
    'ingresso' => [
        'codigo' => 'TESTE-' . date('Ymd-His'),
        'titulo' => 'Teste de Ingresso'
    ]
];

echo "Testando webhook: $webhook_url<br>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhook_url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados_teste));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$webhook_result = curl_exec($ch);
$webhook_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$webhook_error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $webhook_http_code<br>";
if ($webhook_error) {
    echo "Erro cURL: $webhook_error<br>";
}

if ($webhook_result !== FALSE && $webhook_http_code == 200) {
    echo "✅ <strong>Webhook respondeu com sucesso!</strong><br>";
    echo "Resposta: " . htmlspecialchars(substr($webhook_result, 0, 200)) . "<br>";
} else {
    echo "❌ <strong>Webhook falhou ou retornou erro!</strong><br>";
    echo "Resposta: " . htmlspecialchars($webhook_result) . "<br>";
}

// 5. Teste da API backup
echo "<h2>Teste da API Backup:</h2>";

// Dados fictícios para teste
$dados_backup = [
    'hash_validacao' => 'teste_hash_' . uniqid(),
    'destinatario_nome' => 'Teste Backup',
    'destinatario_email' => $para,
    'mensagem' => 'Esta é uma mensagem de teste da API backup',
    'remetente_nome' => 'Sistema AnySummit'
];

$backup_url = "http://" . $_SERVER['HTTP_HOST'] . "/evento/api/enviar-email-backup.php";
echo "Testando API backup: $backup_url<br>";

// Note: Este teste não vai funcionar porque precisa de um hash válido no banco
// Mas podemos ver se a API responde
echo "⚠️ Este teste não funcionará completamente porque precisa de dados válidos no banco.<br>";

echo "<h2>Resumo:</h2>";
echo "1. Verifique se o email de teste chegou<br>";
echo "2. Verifique se o webhook N8N está funcionando<br>";
echo "3. Se ambos falharam, o problema pode estar na configuração SMTP do servidor<br>";

echo "<hr>";
echo "<small>Teste executado em: " . date('Y-m-d H:i:s') . "</small>";
?>