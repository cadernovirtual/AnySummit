<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Teste de Comunicação com Asaas</h1>";

include("AsaasAPI.php");

try {
    echo "<h2>1. Inicializando API Asaas</h2>";
    $asaas = new AsaasAPI('production');
    echo "✅ API inicializada com sucesso<br>";
    
    echo "<h2>2. Testando busca de cliente (teste básico)</h2>";
    $cpfTeste = '12345678901'; // CPF fake para teste
    $cliente = $asaas->getCustomerByCpfCnpj($cpfTeste);
    echo "✅ Comunicação com API funcionando<br>";
    echo "Resultado: " . ($cliente ? "Cliente encontrado" : "Cliente não encontrado (normal)") . "<br>";
    
    echo "<h2>3. Testando dados de teste para pagamento</h2>";
    
    // Dados de teste para validar se a estrutura está correta
    $dadosTeste = [
        'customer' => 'cus_teste', // ID fake
        'billingType' => 'CREDIT_CARD',
        'value' => 10.00,
        'dueDate' => date('Y-m-d'),
        'description' => 'Teste de estrutura',
        'creditCard' => [
            'holderName' => 'TESTE ESTRUTURA',
            'number' => '4111111111111111', // Número de teste Visa
            'expiryMonth' => '12',
            'expiryYear' => '2030',
            'ccv' => '123'
        ],
        'creditCardHolderInfo' => [
            'name' => 'Teste Estrutura',
            'email' => 'teste@teste.com',
            'cpfCnpj' => '12345678901',
            'postalCode' => '01234567',
            'address' => 'Rua Teste',
            'addressNumber' => '123',
            'province' => 'Bairro Teste',
            'city' => 'São Paulo',
            'state' => 'SP',
            'phone' => '11999999999',
            'mobilePhone' => '11999999999'
        ]
    ];
    
    echo "✅ Estrutura de dados preparada<br>";
    echo "<pre>" . print_r($dadosTeste, true) . "</pre>";
    
    echo "<h2>4. Verificação de Token</h2>";
    $reflection = new ReflectionClass($asaas);
    $tokenProperty = $reflection->getProperty('access_token');
    $tokenProperty->setAccessible(true);
    $token = $tokenProperty->getValue($asaas);
    
    if (strpos($token, '$aact_prod_') === 0) {
        echo "✅ Token de produção detectado<br>";
        echo "Token: " . substr($token, 0, 30) . "..." . substr($token, -10) . "<br>";
    } else {
        echo "❌ Token inválido ou sandbox<br>";
    }
    
    echo "<h2>5. URL da API</h2>";
    $urlProperty = $reflection->getProperty('base_url');
    $urlProperty->setAccessible(true);
    $url = $urlProperty->getValue($asaas);
    echo "URL: " . $url . "<br>";
    
    if ($url === 'https://api.asaas.com/v3') {
        echo "✅ URL de produção correta<br>";
    } else {
        echo "❌ URL incorreta<br>";
    }
    
    echo "<h2>6. Teste de cURL básico</h2>";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url . '/customers?limit=1');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'access_token: ' . $token,
        'User-Agent: AnySummit-PHP/1.0'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        echo "❌ Erro cURL: " . $curlError . "<br>";
    } else {
        echo "✅ cURL funcionando<br>";
        echo "HTTP Code: " . $httpCode . "<br>";
        
        if ($httpCode === 200) {
            echo "✅ Autenticação com Asaas OK<br>";
            $data = json_decode($response, true);
            echo "Resposta: " . (isset($data['data']) ? "Dados recebidos" : "Formato inesperado") . "<br>";
        } elseif ($httpCode === 401) {
            echo "❌ Token inválido ou expirado<br>";
        } elseif ($httpCode === 403) {
            echo "❌ Acesso negado<br>";
        } else {
            echo "❌ Erro HTTP " . $httpCode . "<br>";
            echo "Resposta: " . substr($response, 0, 500) . "<br>";
        }
    }
    
    echo "<h2>7. Status Final</h2>";
    if ($httpCode === 200) {
        echo "✅ <strong>COMUNICAÇÃO COM ASAAS OK</strong><br>";
        echo "O problema não está na comunicação básica.<br>";
        echo "Verificar logs de erro específicos do pagamento.<br>";
    } else {
        echo "❌ <strong>PROBLEMA NA COMUNICAÇÃO</strong><br>";
        echo "Verificar token e configurações.<br>";
    }
    
} catch (Exception $e) {
    echo "❌ <strong>ERRO:</strong> " . $e->getMessage() . "<br>";
    echo "Stack trace:<br><pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<h2>8. Verificar Error Log</h2>";
echo "Verifique também o arquivo error_log do servidor para erros específicos.<br>";
echo "Caminho típico: /evento/api/error_log<br>";

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
