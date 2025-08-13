<?php
// Teste com número fixo conhecido que funciona
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🎯 TESTE COM NÚMERO FIXO CONHECIDO</h1>";

include("AsaasAPI.php");
include("../conm/conn.php");

try {
    $asaas = new AsaasAPI('production');
    
    echo "<h2>1. Forçando número que sabemos que funciona</h2>";
    
    // Usar número fixo que sabemos que funciona
    $numeroFixo = '11999999999';
    echo "Número fixo usado: {$numeroFixo}<br>";
    
    // Simular dados do checkout mas com número fixo
    $input = [
        'pedido' => [
            'pedidoid' => 999,
            'codigo_pedido' => 'TESTE_FIXO_' . time(),
            'valor_total' => 10.00, // Valor menor para facilitar
            'evento_nome' => 'TESTE NUMERO FIXO',
            'parcelas' => 1
        ],
        'cartao' => [
            'nome' => 'TESTE APROVADO',
            'numero' => '4000000000000010', // Cartão de teste Asaas
            'mes' => '12',
            'ano' => '2030',
            'cvv' => '123'
        ],
        'comprador' => [
            'nome_completo' => 'TESTE NUMERO FIXO',
            'documento' => '24971563792',
            'email' => 'teste@teste.com',
            'whatsapp' => $numeroFixo, // Usar número fixo
            'cep' => '01234567',
            'endereco' => 'Rua Teste',
            'numero' => '123',
            'complemento' => '',
            'bairro' => 'Centro',
            'cidade' => 'São Paulo',
            'estado' => 'SP'
        ]
    ];
    
    echo "<h2>2. Dados de entrada:</h2>";
    echo "<pre>" . print_r($input, true) . "</pre>";
    
    $pedidoData = $input['pedido'];
    $cartaoData = $input['cartao'];
    $compradorData = $input['comprador'];
    
    // CPF
    $cpfCnpj = preg_replace('/[^0-9]/', '', $compradorData['documento']);
    echo "CPF: {$cpfCnpj}<br>";
    
    // Cliente
    echo "<h2>3. Criando/buscando cliente</h2>";
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    
    if (!$customer) {
        $customerData = [
            'name' => $compradorData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'email' => $compradorData['email'],
            'phone' => $numeroFixo, // MESMO NÚMERO
            'mobilePhone' => $numeroFixo, // MESMO NÚMERO
            'postalCode' => preg_replace('/[^0-9]/', '', $compradorData['cep']),
            'address' => $compradorData['endereco'],
            'addressNumber' => $compradorData['numero'],
            'complement' => $compradorData['complemento'],
            'province' => $compradorData['bairro'],
            'city' => $compradorData['cidade'],
            'state' => $compradorData['estado']
        ];
        
        echo "Criando cliente com dados:<br>";
        echo "<pre>" . print_r($customerData, true) . "</pre>";
        
        $customer = $asaas->createCustomer($customerData);
        echo "✅ Cliente criado: " . $customer['id'] . "<br>";
    } else {
        echo "✅ Cliente encontrado: " . $customer['id'] . "<br>";
    }
    
    echo "<h2>4. Processando pagamento</h2>";
    
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => floatval($pedidoData['valor_total']),
        'dueDate' => date('Y-m-d'),
        'description' => $pedidoData['evento_nome'],
        'externalReference' => $pedidoData['codigo_pedido'],
        
        'creditCard' => [
            'holderName' => $cartaoData['nome'],
            'number' => preg_replace('/[^0-9]/', '', $cartaoData['numero']),
            'expiryMonth' => $cartaoData['mes'],
            'expiryYear' => $cartaoData['ano'],
            'ccv' => $cartaoData['cvv']
        ],
        
        'creditCardHolderInfo' => [
            'name' => $compradorData['nome_completo'],
            'email' => $compradorData['email'],
            'cpfCnpj' => $cpfCnpj,
            'postalCode' => preg_replace('/[^0-9]/', '', $compradorData['cep']),
            'address' => $compradorData['endereco'],
            'addressNumber' => $compradorData['numero'],
            'addressComplement' => $compradorData['complemento'],
            'province' => $compradorData['bairro'],
            'city' => $compradorData['cidade'],
            'state' => $compradorData['estado'],
            'phone' => $numeroFixo, // MESMO NÚMERO
            'mobilePhone' => $numeroFixo // MESMO NÚMERO
        ]
    ];
    
    echo "Dados do pagamento:<br>";
    echo "<pre>" . print_r($paymentData, true) . "</pre>";
    
    echo "<h2>5. 🚀 Enviando para Asaas...</h2>";
    
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    echo "<h2>6. 📋 RESPOSTA:</h2>";
    echo "<pre>" . print_r($payment, true) . "</pre>";
    
    if (isset($payment['status'])) {
        if (in_array($payment['status'], ['CONFIRMED', 'RECEIVED'])) {
            echo "<div style='background: green; color: white; padding: 20px; text-align: center; font-size: 20px;'>";
            echo "✅ SUCESSO! PAGAMENTO APROVADO!<br>";
            echo "Status: " . $payment['status'] . "<br>";
            echo "ID: " . $payment['id'];
            echo "</div>";
        } elseif ($payment['status'] === 'PENDING') {
            echo "<div style='background: orange; color: white; padding: 20px; text-align: center; font-size: 20px;'>";
            echo "⏳ PAGAMENTO PENDENTE<br>";
            echo "Status: " . $payment['status'] . "<br>";
            echo "ID: " . $payment['id'];
            echo "</div>";
        } else {
            echo "<div style='background: blue; color: white; padding: 20px; text-align: center; font-size: 20px;'>";
            echo "📋 Status: " . $payment['status'] . "<br>";
            echo "ID: " . $payment['id'];
            echo "</div>";
        }
    }
    
} catch (Exception $e) {
    echo "<div style='background: red; color: white; padding: 20px;'>";
    echo "<h2>❌ ERRO:</h2>";
    echo "<strong>Mensagem:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Arquivo:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Linha:</strong> " . $e->getLine() . "<br>";
    echo "</div>";
    
    if (strpos($e->getMessage(), 'invalid_mobilePhone') !== false) {
        echo "<div style='background: orange; color: black; padding: 15px; margin-top: 10px;'>";
        echo "<h3>🔍 AINDA É ERRO DE MOBILE PHONE</h3>";
        echo "Mesmo forçando o número {$numeroFixo}, o Asaas ainda reclama.<br>";
        echo "Isso pode indicar:<br>";
        echo "• Problema na conta Asaas<br>";
        echo "• Restrição específica da API<br>";
        echo "• Campo sendo enviado vazio por algum motivo<br>";
        echo "</div>";
    }
}

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
