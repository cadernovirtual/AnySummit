<?php
// Teste direto de pagamento com cartão de teste
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 DIAGNÓSTICO COMPLETO - PAGAMENTO CARTÃO</h1>";

include("AsaasAPI.php");
include("../conm/conn.php");

try {
    echo "<h2>1. ✅ Testando inicialização da API</h2>";
    $asaas = new AsaasAPI('production');
    echo "API inicializada com sucesso<br><br>";
    
    echo "<h2>2. ✅ Verificando token e comunicação básica</h2>";
    
    // Teste básico de comunicação
    $reflection = new ReflectionClass($asaas);
    $tokenProperty = $reflection->getProperty('access_token');
    $tokenProperty->setAccessible(true);
    $token = $tokenProperty->getValue($asaas);
    
    echo "Token: " . substr($token, 0, 20) . "..." . substr($token, -10) . "<br>";
    
    // Teste de comunicação simples
    $testCustomer = $asaas->getCustomerByCpfCnpj('12345678901');
    echo "Comunicação básica: ✅ OK<br><br>";
    
    echo "<h2>3. 🧪 CRIANDO CLIENTE DE TESTE</h2>";
    
    $customerData = [
        'name' => 'TESTE CARTAO ASAAS',
        'cpfCnpj' => '24971563792', // CPF válido de teste
        'email' => 'teste@teste.com',
        'phone' => '11999999999',
        'mobilePhone' => '11999999999',
        'postalCode' => '01234567',
        'address' => 'Rua Teste',
        'addressNumber' => '123',
        'complement' => '',
        'province' => 'Centro',
        'city' => 'São Paulo',
        'state' => 'SP'
    ];
    
    // Buscar cliente existente ou criar novo
    $customer = $asaas->getCustomerByCpfCnpj($customerData['cpfCnpj']);
    
    if (!$customer) {
        echo "Criando novo cliente...<br>";
        $customer = $asaas->createCustomer($customerData);
        echo "✅ Cliente criado: " . $customer['id'] . "<br>";
    } else {
        echo "✅ Cliente existente encontrado: " . $customer['id'] . "<br>";
    }
    
    echo "Nome: " . $customer['name'] . "<br><br>";
    
    echo "<h2>4. 💳 TESTANDO PAGAMENTO COM CARTÃO DE TESTE ASAAS</h2>";
    
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => 10.00, // Valor de teste
        'dueDate' => date('Y-m-d'),
        'description' => 'TESTE DIRETO CARTAO ASAAS',
        'externalReference' => 'TESTE_' . time(),
        
        // CARTÃO DE TESTE ASAAS - DEVE APROVAR
        'creditCard' => [
            'holderName' => 'TESTE APROVADO',
            'number' => '4000000000000010', // Visa de teste - APROVADO
            'expiryMonth' => '12',
            'expiryYear' => '2030',
            'ccv' => '123'
        ],
        
        'creditCardHolderInfo' => [
            'name' => 'TESTE APROVADO',
            'email' => 'teste@teste.com',
            'cpfCnpj' => '24971563792',
            'postalCode' => '01234567',
            'address' => 'Rua Teste',
            'addressNumber' => '123',
            'addressComplement' => '',
            'province' => 'Centro',
            'city' => 'São Paulo',
            'state' => 'SP',
            'phone' => '11999999999',
            'mobilePhone' => '11999999999'
        ],
        
        'remoteIp' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
    ];
    
    echo "<strong>Dados do pagamento:</strong><br>";
    echo "<pre>" . print_r($paymentData, true) . "</pre>";
    
    echo "<h3>🚀 Enviando para Asaas...</h3>";
    
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    echo "<h3>📋 RESPOSTA DO ASAAS:</h3>";
    echo "<pre>" . print_r($payment, true) . "</pre>";
    
    if (isset($payment['status'])) {
        switch ($payment['status']) {
            case 'CONFIRMED':
            case 'RECEIVED':
                echo "<h2>✅ SUCESSO: Pagamento aprovado!</h2>";
                echo "Status: " . $payment['status'] . "<br>";
                echo "Valor: R$ " . $payment['value'] . "<br>";
                echo "ID: " . $payment['id'] . "<br>";
                break;
                
            case 'PENDING':
                echo "<h2>⏳ Pagamento pendente (normal para cartão)</h2>";
                echo "Status: " . $payment['status'] . "<br>";
                echo "Aguardando processamento da operadora...<br>";
                break;
                
            default:
                echo "<h2>❓ Status: " . $payment['status'] . "</h2>";
        }
    } else {
        echo "<h2>❌ Resposta inesperada do Asaas</h2>";
    }
    
    echo "<h2>5. 🧪 TESTE COM CARTÃO DE RECUSA</h2>";
    
    $paymentDataRecusa = $paymentData;
    $paymentDataRecusa['creditCard']['number'] = '4000000000000002'; // Cartão de teste - RECUSADO
    $paymentDataRecusa['creditCard']['holderName'] = 'TESTE RECUSADO';
    $paymentDataRecusa['creditCardHolderInfo']['name'] = 'TESTE RECUSADO';
    $paymentDataRecusa['externalReference'] = 'TESTE_RECUSA_' . time();
    $paymentDataRecusa['description'] = 'TESTE CARTAO RECUSADO';
    
    echo "Testando cartão que deve ser recusado...<br>";
    
    try {
        $paymentRecusa = $asaas->createCreditCardPayment($paymentDataRecusa);
        echo "<strong>Resposta cartão recusado:</strong><br>";
        echo "<pre>" . print_r($paymentRecusa, true) . "</pre>";
    } catch (Exception $e) {
        echo "<strong>❌ Erro esperado (cartão recusado):</strong><br>";
        echo $e->getMessage() . "<br>";
        
        // Verificar se é o erro específico de cartão recusado
        if (strpos($e->getMessage(), 'invalid_creditCard') !== false) {
            echo "✅ Sistema funcionando - cartão de teste recusado corretamente<br>";
        }
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERRO CRÍTICO:</h2>";
    echo "<strong>Mensagem:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Arquivo:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Linha:</strong> " . $e->getLine() . "<br>";
    echo "<br><strong>Stack trace:</strong><br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    
    // Verificar erros específicos
    if (strpos($e->getMessage(), '401') !== false) {
        echo "<h3>🔑 PROBLEMA: Token inválido</h3>";
        echo "O token do Asaas está inválido ou expirado.<br>";
    } elseif (strpos($e->getMessage(), '403') !== false) {
        echo "<h3>🚫 PROBLEMA: Acesso negado</h3>";
        echo "O token não tem permissão para esta operação.<br>";
    } elseif (strpos($e->getMessage(), 'cURL') !== false) {
        echo "<h3>🌐 PROBLEMA: Conectividade</h3>";
        echo "Problema de conexão com o Asaas.<br>";
    }
}

echo "<hr>";
echo "<h2>📋 RESUMO DO DIAGNÓSTICO:</h2>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><strong>Ambiente:</strong> Produção</p>";
echo "<p><strong>Teste realizado:</strong> Pagamento direto com API</p>";

?>
