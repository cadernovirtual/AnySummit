<?php
// Script para testar o webhook do ASAAS
header('Content-Type: text/html; charset=UTF-8');

$webhook_url = "https://anysummit.com.br/evento/api/webhook-asaas.php";
$token = "Miran@Janyne@Gustavo";

echo "<h1>Teste do Webhook ASAAS</h1>";

// 1. Teste GET (verificar se webhook responde)
echo "<h2>1. Teste GET (Verificar se webhook está ativo)</h2>";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'timeout' => 10,
        'header' => "X-Webhook-Token: $token\r\n"
    ]
]);

$response_get = @file_get_contents($webhook_url, false, $context);

if ($response_get !== false) {
    echo "<p style='color: green;'>✅ Webhook respondeu ao GET:</p>";
    echo "<pre>" . htmlspecialchars($response_get) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ Webhook não respondeu ao GET</p>";
}

// 2. Teste POST sem token (deve retornar 401)
echo "<h2>2. Teste POST sem token (deve retornar 401)</h2>";

$test_data = json_encode([
    'event' => 'PAYMENT_CONFIRMED',
    'payment' => [
        'id' => 'teste123',
        'status' => 'CONFIRMED'
    ]
]);

$context_no_token = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $test_data,
        'timeout' => 10
    ]
]);

$response_no_token = @file_get_contents($webhook_url, false, $context_no_token);
$http_code = 200;

// Verificar código de resposta
if (isset($http_response_header)) {
    foreach ($http_response_header as $header) {
        if (preg_match('/^HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
            $http_code = intval($matches[1]);
            break;
        }
    }
}

if ($http_code === 401) {
    echo "<p style='color: green;'>✅ Webhook corretamente rejeitou POST sem token (401)</p>";
} else {
    echo "<p style='color: orange;'>⚠️ Webhook não rejeitou POST sem token (código: $http_code)</p>";
    if ($response_no_token) {
        echo "<pre>" . htmlspecialchars($response_no_token) . "</pre>";
    }
}

// 3. Teste POST com token válido
echo "<h2>3. Teste POST com token válido (simulação)</h2>";

$test_data_valid = json_encode([
    'event' => 'PAYMENT_CONFIRMED',
    'payment' => [
        'id' => 'pay_teste_' . time(),
        'status' => 'CONFIRMED',
        'value' => 100.00
    ]
]);

$context_valid = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
                   "X-Webhook-Token: $token\r\n",
        'content' => $test_data_valid,
        'timeout' => 10
    ]
]);

$response_valid = @file_get_contents($webhook_url, false, $context_valid);

if ($response_valid !== false) {
    echo "<p style='color: green;'>✅ Webhook aceitou POST com token:</p>";
    echo "<pre>" . htmlspecialchars($response_valid) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ Webhook não respondeu ao POST com token</p>";
}

// 4. Instruções para configurar no ASAAS (SEM TOKEN NA URL)
echo "<h2>4. Configuração CORRETA no Painel ASAAS</h2>";
echo "<div style='background: #f0f8ff; padding: 15px; border-left: 4px solid #007cba; margin: 10px 0;'>";
echo "<h3>Passo a passo CORRETO:</h3>";
echo "<ol>";
echo "<li>Acesse o painel do ASAAS</li>";
echo "<li>Vá em <strong>Configurações > Integrações > Webhooks</strong></li>";
echo "<li>Clique em <strong>Novo Webhook</strong></li>";
echo "<li>Configure:</li>";
echo "<ul>";
echo "<li><strong>Nome:</strong> AnySummit Webhook</li>";
echo "<li><strong>URL:</strong> <code>$webhook_url</code> (SEM token na URL)</li>";
echo "<li><strong>Token:</strong> O ASAAS enviará automaticamente no header</li>";
echo "<li><strong>Eventos:</strong> PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_CANCELLED, PAYMENT_REFUNDED</li>";
echo "<li><strong>Status:</strong> Ativo</li>";
echo "</ul>";
echo "<li>Salve a configuração</li>";
echo "</ol>";
echo "<p><strong>IMPORTANTE:</strong> O token de segurança é enviado automaticamente pelo ASAAS no header da requisição, NÃO precisa estar na URL!</p>";
echo "</div>";

// 5. Informações técnicas
echo "<h2>5. Informações Técnicas</h2>";
echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
echo "<tr><td><strong>URL do Webhook:</strong></td><td><code>$webhook_url</code></td></tr>";
echo "<tr><td><strong>Token de Segurança:</strong></td><td><code>$token</code></td></tr>";
echo "<tr><td><strong>Método:</strong></td><td>POST</td></tr>";
echo "<tr><td><strong>Header do Token:</strong></td><td>X-Webhook-Token ou Authorization: Bearer</td></tr>";
echo "<tr><td><strong>Fallback Token:</strong></td><td>Query string ?token=</td></tr>";
echo "</table>";

echo "<h2>6. Como Testar um Pagamento Real</h2>";
echo "<div style='background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;'>";
echo "<p><strong>Para testar com pagamento real:</strong></p>";
echo "<ol>";
echo "<li>Crie um PIX de teste no sistema</li>";
echo "<li>Faça o pagamento</li>";
echo "<li>Monitore os logs em <code>/var/log/php_errors.log</code> ou similar</li>";
echo "<li>Verifique se o status do pedido foi atualizado no banco de dados</li>";
echo "</ol>";
echo "</div>";

echo "<h2>7. Teste de Conectividade Básica</h2>";
$ping_test = @file_get_contents($webhook_url . "?token=" . urlencode($token));
if ($ping_test) {
    echo "<p style='color: green;'>✅ URL acessível via GET com token</p>";
} else {
    echo "<p style='color: red;'>❌ URL não acessível via GET com token</p>";
}
?>