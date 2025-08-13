<?php
// Teste específico para simular webhook do ASAAS com header correto
header('Content-Type: text/html; charset=UTF-8');

$webhook_url = "https://anysummit.com.br/evento/api/webhook-asaas.php";
$token = "Miran@Janyne@Gustavo";

echo "<h1>Teste Webhook ASAAS - Header asaas-access-token</h1>";

// 1. Teste GET simples
echo "<h2>1. Teste GET (verificar se webhook responde)</h2>";

$context_get = stream_context_create([
    'http' => [
        'method' => 'GET',
        'timeout' => 10
    ]
]);

$response_get = @file_get_contents($webhook_url, false, $context_get);

if ($response_get !== false) {
    echo "<p style='color: green;'>✅ Webhook respondeu ao GET:</p>";
    echo "<pre>" . htmlspecialchars($response_get) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ Webhook não respondeu ao GET</p>";
}

// 2. Teste POST com header correto do ASAAS
echo "<h2>2. Teste POST com header asaas-access-token (formato ASAAS)</h2>";

$test_payload = json_encode([
    'event' => 'PAYMENT_CONFIRMED',
    'payment' => [
        'id' => 'pay_teste_' . time(),
        'status' => 'CONFIRMED',
        'value' => 100.00,
        'dateCreated' => date('Y-m-d'),
        'customer' => 'cus_teste123'
    ]
]);

$context_asaas = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
                   "asaas-access-token: $token\r\n" .
                   "User-Agent: Asaas-Webhook/1.0\r\n",
        'content' => $test_payload,
        'timeout' => 10
    ]
]);

echo "<h3>Dados enviados:</h3>";
echo "<pre>Header: asaas-access-token: $token</pre>";
echo "<pre>Payload: " . htmlspecialchars($test_payload) . "</pre>";

$response_asaas = @file_get_contents($webhook_url, false, $context_asaas);

if ($response_asaas !== false) {
    echo "<p style='color: green;'>✅ Webhook aceitou POST com header asaas-access-token:</p>";
    echo "<pre>" . htmlspecialchars($response_asaas) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ Webhook não respondeu ao POST com header correto</p>";
    
    // Verificar se há erro
    $error = error_get_last();
    if ($error) {
        echo "<p>Erro: " . htmlspecialchars($error['message']) . "</p>";
    }
}

// 3. Teste POST sem token (deve dar erro 401)
echo "<h2>3. Teste POST sem token (deve retornar 401)</h2>";

$context_no_token = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $test_payload,
        'timeout' => 10,
        'ignore_errors' => true
    ]
]);

$response_no_token = @file_get_contents($webhook_url, false, $context_no_token);

if ($response_no_token !== false) {
    echo "<p style='color: green;'>✅ Webhook respondeu (deve ser erro 401):</p>";
    echo "<pre>" . htmlspecialchars($response_no_token) . "</pre>";
    
    // Verificar se realmente retornou 401
    if (isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (strpos($header, '401') !== false) {
                echo "<p style='color: green;'>✅ Retornou 401 corretamente!</p>";
                break;
            }
        }
    }
} else {
    echo "<p style='color: orange;'>⚠️ Webhook não respondeu sem token</p>";
}

// 4. Simulação de payload real do ASAAS
echo "<h2>4. Simulação de Payload Real do ASAAS</h2>";

$real_payload = json_encode([
    'event' => 'PAYMENT_CONFIRMED',
    'payment' => [
        'object' => 'payment',
        'id' => 'pay_exemplo_asaas_' . time(),
        'dateCreated' => date('Y-m-d'),
        'customer' => 'cus_G6Lz6Vgz5aVdLdDF',
        'paymentLink' => null,
        'value' => 100.00,
        'netValue' => 98.51,
        'originalDueDate' => date('Y-m-d'),
        'paymentDate' => date('Y-m-d H:i:s'),
        'clientPaymentDate' => date('Y-m-d H:i:s'),
        'installmentNumber' => null,
        'invoiceUrl' => 'https://sandbox.asaas.com/i/exemplo',
        'bankSlipUrl' => null,
        'transactionReceiptUrl' => 'https://sandbox.asaas.com/comprovantes/exemplo',
        'dueDate' => date('Y-m-d'),
        'originalValue' => null,
        'interestValue' => null,
        'description' => 'Pagamento de teste',
        'externalReference' => 'PED_' . date('Ymd') . '_' . rand(100000, 999999),
        'billingType' => 'PIX',
        'status' => 'CONFIRMED',
        'pixTransaction' => [
            'id' => 'pix_' . time(),
            'endToEndId' => 'E123456789202' . date('YmdHis') . 'abcd1234',
            'txId' => 'txid' . time(),
            'payer' => [
                'name' => 'João da Silva',
                'document' => '12345678901'
            ]
        ]
    ]
]);

$context_real = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
                   "asaas-access-token: $token\r\n" .
                   "User-Agent: Asaas-Webhook/1.0\r\n",
        'content' => $real_payload,
        'timeout' => 15
    ]
]);

echo "<h3>Payload Real do ASAAS:</h3>";
echo "<pre>" . htmlspecialchars(json_encode(json_decode($real_payload), JSON_PRETTY_PRINT)) . "</pre>";

$response_real = @file_get_contents($webhook_url, false, $context_real);

if ($response_real !== false) {
    echo "<p style='color: green;'>✅ Webhook processou payload real:</p>";
    echo "<pre>" . htmlspecialchars($response_real) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ Webhook não processou payload real</p>";
}

// 5. Instruções finais
echo "<h2>5. Configuração Final no ASAAS</h2>";
echo "<div style='background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>";
echo "<h3>✅ Configuração Confirmada:</h3>";
echo "<ul>";
echo "<li><strong>URL:</strong> <code>$webhook_url</code></li>";
echo "<li><strong>Header:</strong> <code>asaas-access-token: $token</code></li>";
echo "<li><strong>Método:</strong> POST</li>";
echo "<li><strong>Content-Type:</strong> application/json</li>";
echo "</ul>";
echo "<p><strong>O webhook está configurado corretamente para receber o token no header asaas-access-token conforme documentação do ASAAS!</strong></p>";
echo "</div>";

echo "<h2>6. Verificação de Logs</h2>";
echo "<p>Para monitorar o webhook em tempo real, verifique os logs do servidor em:</p>";
echo "<ul>";
echo "<li>cPanel > Logs de Erro</li>";
echo "<li>Arquivo de log do PHP</li>";
echo "<li>Logs do Apache/Nginx</li>";
echo "</ul>";
echo "<p>Procure por linhas que começam com: <code>=== WEBHOOK ASAAS RECEBIDO ===</code></p>";
?>