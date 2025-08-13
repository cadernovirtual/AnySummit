<?php
// Interceptar e comparar dados do checkout vs teste direto
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simular entrada do checkout
$input = json_decode(file_get_contents('php://input'), true);

// Se não veio dados via POST, simular dados do checkout
if (!$input) {
    $input = [
        'pedido' => [
            'pedidoid' => 999,
            'codigo_pedido' => 'PED_TESTE_' . time(),
            'valor_total' => 15.00,
            'evento_nome' => 'Evento Teste',
            'parcelas' => 1
        ],
        'cartao' => [
            'nome' => 'TESTE APROVADO',
            'numero' => '4000000000000010',
            'mes' => '12',
            'ano' => '2030',
            'cvv' => '123'
        ],
        'comprador' => [
            'nome_completo' => 'TESTE APROVADO',
            'documento' => '24971563792',
            'email' => 'teste@teste.com',
            'whatsapp' => '11999999999',
            'cep' => '01234567',
            'endereco' => 'Rua Teste',
            'numero' => '123',
            'complemento' => '',
            'bairro' => 'Centro',
            'cidade' => 'São Paulo',
            'estado' => 'SP'
        ]
    ];
}

echo "<h1>🔍 COMPARAÇÃO: Checkout vs Teste Direto</h1>";

include("AsaasAPI.php");
include("../conm/conn.php");

try {
    $asaas = new AsaasAPI('production');
    
    echo "<h2>1. Dados recebidos do checkout:</h2>";
    echo "<pre>" . print_r($input, true) . "</pre>";
    
    // Reproduzir EXATAMENTE a lógica do pagamento-cartao.php
    $pedidoData = $input['pedido'] ?? [];
    $cartaoData = $input['cartao'] ?? [];
    $compradorData = $input['comprador'] ?? [];
    
    echo "<h2>2. Processando igual ao checkout...</h2>";
    
    // Criar/buscar cliente (igual ao checkout)
    $cpfCnpj = preg_replace('/[^0-9]/', '', $compradorData['documento']);
    echo "CPF/CNPJ limpo: {$cpfCnpj}<br>";
    
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    
    if (!$customer) {
        $customerData = [
            'name' => $compradorData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'email' => $compradorData['email'] ?? '',
            'phone' => preg_replace('/[^0-9]/', '', $compradorData['telefone'] ?? ''),
            'mobilePhone' => preg_replace('/[^0-9]/', '', $compradorData['whatsapp'] ?? ''),
            'postalCode' => preg_replace('/[^0-9]/', '', $compradorData['cep']),
            'address' => $compradorData['endereco'] ?? '',
            'addressNumber' => $compradorData['numero'] ?? '1',
            'complement' => $compradorData['complemento'] ?? '',
            'province' => $compradorData['bairro'] ?? '',
            'city' => $compradorData['cidade'] ?? '',
            'state' => $compradorData['estado'] ?? ''
        ];
        
        echo "<h3>Criando cliente:</h3>";
        echo "<pre>" . print_r($customerData, true) . "</pre>";
        
        $customer = $asaas->createCustomer($customerData);
        echo "✅ Cliente criado: " . $customer['id'] . "<br>";
    } else {
        echo "✅ Cliente encontrado: " . $customer['id'] . "<br>";
    }
    
    // Preparar dados do pagamento (EXATAMENTE igual ao checkout)
    $valor = floatval($pedidoData['valor_total']);
    $parcelas = intval($pedidoData['parcelas'] ?? 1);
    
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => $valor,
        'dueDate' => date('Y-m-d'),
        'description' => 'Ingresso(s) - ' . ($pedidoData['evento_nome'] ?? 'Evento'),
        'externalReference' => $pedidoData['codigo_pedido'] ?? $pedidoData['pedidoid'],
        
        // Dados do cartão (EXATAMENTE como no checkout)
        'creditCard' => [
            'holderName' => $cartaoData['nome'],
            'number' => preg_replace('/[^0-9]/', '', $cartaoData['numero']),
            'expiryMonth' => $cartaoData['mes'],
            'expiryYear' => $cartaoData['ano'],
            'ccv' => $cartaoData['cvv']
        ],
        
        // Dados do portador (EXATAMENTE como no checkout)
        'creditCardHolderInfo' => [
            'name' => $compradorData['nome_completo'],
            'email' => $compradorData['email'] ?? '',
            'cpfCnpj' => $cpfCnpj,
            'postalCode' => preg_replace('/[^0-9]/', '', $compradorData['cep']),
            'address' => $compradorData['endereco'] ?? '',
            'addressNumber' => $compradorData['numero'] ?? '1',
            'addressComplement' => $compradorData['complemento'] ?? '',
            'province' => $compradorData['bairro'] ?? '',
            'city' => $compradorData['cidade'] ?? '',
            'state' => $compradorData['estado'] ?? '',
            'phone' => preg_replace('/[^0-9]/', '', $compradorData['telefone'] ?? ''),
            'mobilePhone' => preg_replace('/[^0-9]/', '', $compradorData['whatsapp'] ?? '')
        ],
        
        'remoteIp' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    echo "<h2>3. Dados finais que serão enviados ao Asaas:</h2>";
    echo "<pre>" . print_r($paymentData, true) . "</pre>";
    
    echo "<h2>4. 🚀 Enviando para Asaas...</h2>";
    
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    echo "<h2>5. 📋 RESPOSTA DO ASAAS:</h2>";
    echo "<pre>" . print_r($payment, true) . "</pre>";
    
    if (isset($payment['status'])) {
        switch ($payment['status']) {
            case 'CONFIRMED':
            case 'RECEIVED':
                echo "<div style='color: green; font-size: 20px; font-weight: bold;'>✅ SUCESSO: Pagamento aprovado!</div>";
                break;
            case 'PENDING':
                echo "<div style='color: orange; font-size: 20px; font-weight: bold;'>⏳ Pagamento pendente</div>";
                break;
            default:
                echo "<div style='color: red; font-size: 20px; font-weight: bold;'>❓ Status: " . $payment['status'] . "</div>";
        }
    }
    
    echo "<h2>6. 🔍 ANÁLISE DE DIFERENÇAS</h2>";
    
    // Comparar com dados que funcionam no teste direto
    $dadosQueFuncionam = [
        'customer' => 'cus_000125294003', // Exemplo
        'billingType' => 'CREDIT_CARD',
        'value' => 10.00,
        'dueDate' => date('Y-m-d'),
        'description' => 'TESTE DIRETO CARTAO ASAAS',
        'externalReference' => 'TESTE_' . time(),
        'creditCard' => [
            'holderName' => 'TESTE APROVADO',
            'number' => '4000000000000010',
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
        ]
    ];
    
    echo "<h3>Dados que FUNCIONAM no teste direto:</h3>";
    echo "<pre>" . print_r($dadosQueFuncionam, true) . "</pre>";
    
    echo "<h3>🔍 DIFERENÇAS IDENTIFICADAS:</h3>";
    
    // Verificar diferenças críticas
    $diferencas = [];
    
    if ($paymentData['creditCard']['number'] !== $dadosQueFuncionam['creditCard']['number']) {
        $diferencas[] = "Número do cartão diferente: checkout({$paymentData['creditCard']['number']}) vs teste({$dadosQueFuncionam['creditCard']['number']})";
    }
    
    if ($paymentData['creditCard']['holderName'] !== $dadosQueFuncionam['creditCard']['holderName']) {
        $diferencas[] = "Nome do portador diferente: checkout({$paymentData['creditCard']['holderName']}) vs teste({$dadosQueFuncionam['creditCard']['holderName']})";
    }
    
    if ($paymentData['creditCardHolderInfo']['cpfCnpj'] !== $dadosQueFuncionam['creditCardHolderInfo']['cpfCnpj']) {
        $diferencas[] = "CPF diferente: checkout({$paymentData['creditCardHolderInfo']['cpfCnpj']}) vs teste({$dadosQueFuncionam['creditCardHolderInfo']['cpfCnpj']})";
    }
    
    if ($paymentData['value'] !== $dadosQueFuncionam['value']) {
        $diferencas[] = "Valor diferente: checkout({$paymentData['value']}) vs teste({$dadosQueFuncionam['value']})";
    }
    
    if (empty($diferencas)) {
        echo "<div style='color: green;'>✅ Estruturas são idênticas - problema pode ser específico do cartão/dados</div>";
    } else {
        echo "<div style='color: red;'>";
        foreach ($diferencas as $diff) {
            echo "❌ " . $diff . "<br>";
        }
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERRO:</h2>";
    echo "<div style='color: red; font-weight: bold;'>" . $e->getMessage() . "</div>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
