<?php
// Arquivo para testar a integração PIX com Asaas
include("AsaasAPI.php");

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Teste PIX Asaas</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>

<h1>Teste de Integração PIX com Asaas</h1>

<?php
try {
    echo "<h2>1. Testando conexão com API do Asaas</h2>";
    
    // Inicializar API
    $asaas = new AsaasAPI('production'); // Altere para 'sandbox' se necessário
    echo "<p class='info'>✓ Classe AsaasAPI inicializada</p>";
    
    // 2. Criar cliente de teste
    echo "<h2>2. Criando cliente de teste</h2>";
    
    $customerData = [
        'name' => 'Cliente Teste PIX',
        'cpfCnpj' => '09134624627', // CPF fictício - apenas para teste
        'email' => 'teste@anysummit.com',
        'phone' => '1140041234',
        'mobilePhone' => '11999887766',
        'postalCode' => '01310100',
        'address' => 'Av. Paulista',
        'addressNumber' => '1000',
        'complement' => 'Sala 100',
        'province' => 'Bela Vista',
        'city' => 'São Paulo',
        'state' => 'SP'
    ];
    
    echo "<p>Dados do cliente:</p>";
    echo "<pre>" . print_r($customerData, true) . "</pre>";
    
    $customer = $asaas->createCustomer($customerData);
    echo "<p class='success'>✓ Cliente criado: " . $customer['id'] . " - " . $customer['name'] . "</p>";
    
} catch (Exception $e) {
    echo "<p class='error'>✗ ERRO: " . $e->getMessage() . "</p>";
    echo "<p>Verifique:</p>";
    echo "<ul>";
    echo "<li>Token de acesso do Asaas</li>";
    echo "<li>Configuração de produção/sandbox</li>";
    echo "<li>Conectividade com a API</li>";
    echo "</ul>";
    exit;
}

try {
    // 3. Criar cobrança PIX
    echo "<h2>3. Criando cobrança PIX</h2>";
    
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'PIX',
        'value' => 50.00, // R$ 50,00 para teste
        'dueDate' => date('Y-m-d'),
        'description' => 'Teste PIX - Ingresso Evento AnySummit',
        'externalReference' => 'TESTE_PIX_' . date('YmdHis')
    ];
    
    echo "<p>Dados da cobrança:</p>";
    echo "<pre>" . print_r($paymentData, true) . "</pre>";
    
    $payment = $asaas->createPixPayment($paymentData);
    echo "<p class='success'>✓ Cobrança PIX criada:</p>";
    echo "<ul>";
    echo "<li><strong>ID:</strong> " . $payment['id'] . "</li>";
    echo "<li><strong>Status:</strong> " . $payment['status'] . "</li>";
    echo "<li><strong>Valor:</strong> R$ " . number_format($payment['value'], 2, ',', '.') . "</li>";
    echo "<li><strong>Vencimento:</strong> " . $payment['dueDate'] . "</li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<p class='error'>✗ Erro ao criar cobrança PIX: " . $e->getMessage() . "</p>";
    exit;
}

try {
    // 4. Obter QR Code PIX
    echo "<h2>4. Obtendo QR Code PIX</h2>";
    echo "<p class='info'>Aguardando 3 segundos para o QR Code ser gerado...</p>";
    
    // Aguardar um pouco para o QR Code ser gerado
    sleep(3);
    
    $qrCodeData = $asaas->getPixQrCode($payment['id']);
    
    if (isset($qrCodeData['payload']) && !empty($qrCodeData['payload'])) {
        echo "<p class='success'>✓ QR Code PIX gerado com sucesso!</p>";
        echo "<p><strong>Payload PIX:</strong></p>";
        echo "<textarea style='width:100%; height:100px;'>" . $qrCodeData['payload'] . "</textarea>";
        
        if (isset($qrCodeData['encodedImage']) && !empty($qrCodeData['encodedImage'])) {
            echo "<p><strong>QR Code (Imagem):</strong></p>";
            echo "<img src='data:image/png;base64," . $qrCodeData['encodedImage'] . "' style='max-width:300px; border:2px solid #28a745; border-radius:8px; padding:10px; background:white;'>";
        }
        
    } else {
        echo "<p class='error'>✗ Erro ao gerar QR Code</p>";
        echo "<pre>" . print_r($qrCodeData, true) . "</pre>";
    }
    
} catch (Exception $e) {
    echo "<p class='error'>✗ Erro ao obter QR Code: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h2>✅ Teste Concluído!</h2>";
echo "<p><strong>ID do Pagamento:</strong> " . ($payment['id'] ?? 'N/A') . "</p>";
echo "<p>Use este ID para consultar o status do pagamento através da API.</p>";

?>

</body>
</html>
