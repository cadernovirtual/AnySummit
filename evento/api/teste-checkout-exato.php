<?php
// Teste exato do fluxo do checkout com cartão de teste
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🧪 TESTE REPRODUZINDO CHECKOUT EXATO</h1>";

include("AsaasAPI.php");
include("../conm/conn.php");

// Reproduzir EXATAMENTE os dados que vêm do checkout
$input = [
    'pedido' => [
        'pedidoid' => 999,
        'codigo_pedido' => 'PED_TESTE_' . time(),
        'valor_total' => 15.00, // Mesmo valor que estava falhando
        'evento_nome' => 'GOIANARH 2025',
        'parcelas' => 1
    ],
    'cartao' => [
        'nome' => 'TESTE APROVADO',
        'numero' => '4000 0000 0000 0010', // Com espaços como vem do frontend
        'mes' => '12',
        'ano' => '2030',
        'cvv' => '123'
    ],
    'comprador' => [
        'nome_completo' => 'TESTE APROVADO',
        'documento' => '249.715.637-92', // Com formatação como vem do frontend
        'email' => 'teste@teste.com',
        'telefone' => '', // Vazio como pode vir
        'whatsapp' => '(11) 99999-9999', // Com formatação
        'cep' => '01234-567', // Com formatação
        'endereco' => 'Rua Teste',
        'numero' => '123',
        'complemento' => '',
        'bairro' => 'Centro',
        'cidade' => 'São Paulo',
        'estado' => 'SP'
    ]
];

echo "<h2>1. Dados de entrada (simulando checkout):</h2>";
echo "<pre>" . print_r($input, true) . "</pre>";

try {
    $asaas = new AsaasAPI('production');
    
    // COPIAR EXATAMENTE A LÓGICA DO pagamento-cartao.php
    $pedidoData = $input['pedido'] ?? [];
    $cartaoData = $input['cartao'] ?? [];
    $compradorData = $input['comprador'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($pedidoData) || empty($cartaoData) || empty($compradorData)) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    // Validar valor mínimo
    $valor = floatval($pedidoData['valor_total']);
    if ($valor < 5) {
        throw new Exception('Valor mínimo para pagamento é R$ 5,00');
    }
    
    echo "<h2>2. ✅ Validações básicas OK</h2>";
    echo "Valor: R$ {$valor}<br>";
    
    // Validar parcelas para valor mínimo
    $parcelas = intval($pedidoData['parcelas'] ?? 1);
    $valorParcela = $valor / $parcelas;
    
    if ($parcelas > 1 && $valorParcela < 5) {
        throw new Exception('Valor da parcela não pode ser menor que R$ 5,00');
    }
    
    // Para valor exatamente R$ 5,00, só permitir à vista
    if ($valor == 5 && $parcelas > 1) {
        throw new Exception('Para valores de R$ 5,00, apenas pagamento à vista é permitido');
    }
    
    echo "Parcelas: {$parcelas}x<br>";
    
    // CRIAR/BUSCAR CLIENTE NO ASAAS
    $cpfCnpj = preg_replace('/[^0-9]/', '', $compradorData['documento']);
    echo "CPF/CNPJ processado: '{$cpfCnpj}'<br>";
    
    if (strlen($cpfCnpj) !== 11 && strlen($cpfCnpj) !== 14) {
        throw new Exception('CPF/CNPJ inválido: ' . $cpfCnpj);
    }
    
    // Tentar buscar cliente existente
    echo "<h3>Buscando cliente...</h3>";
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    
    if (!$customer) {
        // Criar novo cliente
        $customerData = [
            'name' => $compradorData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'email' => $compradorData['email'] ?? '',
            'phone' => $mobilePhone, // Usar o mesmo número validado
            'mobilePhone' => $mobilePhone,
            'postalCode' => preg_replace('/[^0-9]/', '', $compradorData['cep']),
            'address' => $compradorData['endereco'] ?? '',
            'addressNumber' => $compradorData['numero'] ?? '1',
            'complement' => $compradorData['complemento'] ?? '',
            'province' => $compradorData['bairro'] ?? '',
            'city' => $compradorData['cidade'] ?? '',
            'state' => $compradorData['estado'] ?? ''
        ];
        
        // Validar e formatar mobilePhone
        $mobilePhone = preg_replace('/[^0-9]/', '', $compradorData['whatsapp'] ?? '');
        echo "WhatsApp original: '{$compradorData['whatsapp']}'<br>";
        echo "WhatsApp limpo: '{$mobilePhone}'<br>";
        
        if (strlen($mobilePhone) === 10) {
            // Adicionar 9 para celulares antigos: 1199999999 -> 11999999999
            $mobilePhone = substr($mobilePhone, 0, 2) . '9' . substr($mobilePhone, 2);
            echo "WhatsApp corrigido (10->11): '{$mobilePhone}'<br>";
        }
        
        if (strlen($mobilePhone) === 11 && substr($mobilePhone, 2, 1) === '9') {
            $customerData['mobilePhone'] = $mobilePhone;
            echo "✅ WhatsApp válido: '{$mobilePhone}'<br>";
        } else {
            // Se não conseguir formatar corretamente, usar telefone fixo padrão
            $customerData['mobilePhone'] = '11999999999';
            echo "⚠️ WhatsApp inválido, usando padrão: '11999999999'<br>";
        }
        
        echo "<h3>Criando cliente:</h3>";
        echo "<pre>" . print_r($customerData, true) . "</pre>";
        
        $customer = $asaas->createCustomer($customerData);
        echo "✅ Cliente criado: " . $customer['id'] . "<br>";
    } else {
        echo "✅ Cliente encontrado: " . $customer['id'] . "<br>";
    }
    
    // CRIAR COBRANÇA COM CARTÃO
    echo "<h2>3. 💳 Processando pagamento...</h2>";
    
    // Dados da cobrança
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => $valor,
        'dueDate' => date('Y-m-d'), // Cobrança imediata
        'description' => 'Ingresso(s) - ' . ($pedidoData['evento_nome'] ?? 'Evento'),
        'externalReference' => $pedidoData['codigo_pedido'] ?? $pedidoData['pedidoid'],
        
        // Dados do cartão
        'creditCard' => [
            'holderName' => $cartaoData['nome'],
            'number' => preg_replace('/[^0-9]/', '', $cartaoData['numero']),
            'expiryMonth' => $cartaoData['mes'],
            'expiryYear' => $cartaoData['ano'],
            'ccv' => $cartaoData['cvv']
        ],
        
        // Dados do portador do cartão
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
            'phone' => $mobilePhone, // Usar o mesmo número validado
            'mobilePhone' => $mobilePhone // Usar o mesmo número validado
        ],
        
        'remoteIp' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    // Se for parcelado
    if ($parcelas > 1) {
        $paymentData['installmentCount'] = $parcelas;
        $paymentData['installmentValue'] = round($valor / $parcelas, 2);
        $paymentData['totalValue'] = $valor;
    }
    
    echo "<h3>Dados enviados ao Asaas:</h3>";
    echo "<pre>" . print_r($paymentData, true) . "</pre>";
    
    // Verificar se todos os campos obrigatórios estão preenchidos
    $camposObrigatorios = [
        'creditCard.holderName' => $paymentData['creditCard']['holderName'],
        'creditCard.number' => $paymentData['creditCard']['number'],
        'creditCard.expiryMonth' => $paymentData['creditCard']['expiryMonth'],
        'creditCard.expiryYear' => $paymentData['creditCard']['expiryYear'],
        'creditCard.ccv' => $paymentData['creditCard']['ccv'],
        'creditCardHolderInfo.name' => $paymentData['creditCardHolderInfo']['name'],
        'creditCardHolderInfo.cpfCnpj' => $paymentData['creditCardHolderInfo']['cpfCnpj'],
        'creditCardHolderInfo.postalCode' => $paymentData['creditCardHolderInfo']['postalCode'],
        'creditCardHolderInfo.address' => $paymentData['creditCardHolderInfo']['address'],
        'creditCardHolderInfo.addressNumber' => $paymentData['creditCardHolderInfo']['addressNumber'],
        'creditCardHolderInfo.province' => $paymentData['creditCardHolderInfo']['province'],
        'creditCardHolderInfo.city' => $paymentData['creditCardHolderInfo']['city'],
        'creditCardHolderInfo.state' => $paymentData['creditCardHolderInfo']['state']
    ];
    
    echo "<h3>Validando campos obrigatórios:</h3>";
    $camposVazios = [];
    foreach ($camposObrigatorios as $campo => $valor) {
        if (empty($valor)) {
            $camposVazios[] = $campo;
            echo "❌ {$campo}: VAZIO<br>";
        } else {
            echo "✅ {$campo}: '{$valor}'<br>";
        }
    }
    
    if (!empty($camposVazios)) {
        throw new Exception('Campos obrigatórios vazios: ' . implode(', ', $camposVazios));
    }
    
    echo "<h2>4. 🚀 Enviando para Asaas...</h2>";
    
    // Criar cobrança no Asaas
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    echo "<h2>5. 📋 RESPOSTA DO ASAAS:</h2>";
    echo "<pre>" . print_r($payment, true) . "</pre>";
    
    if (isset($payment['status'])) {
        switch ($payment['status']) {
            case 'CONFIRMED':
            case 'RECEIVED':
                echo "<div style='background: green; color: white; padding: 20px; font-size: 20px; text-align: center;'>✅ SUCESSO: PAGAMENTO APROVADO!</div>";
                break;
            case 'PENDING':
                echo "<div style='background: orange; color: white; padding: 20px; font-size: 20px; text-align: center;'>⏳ PAGAMENTO PENDENTE</div>";
                break;
            default:
                echo "<div style='background: red; color: white; padding: 20px; font-size: 20px; text-align: center;'>❓ STATUS: " . $payment['status'] . "</div>";
        }
    }
    
    echo "<h2>6. 🎯 RESULTADO:</h2>";
    
    if (isset($payment['status']) && in_array($payment['status'], ['CONFIRMED', 'RECEIVED', 'PENDING'])) {
        echo "<div style='color: green; font-weight: bold; font-size: 18px;'>";
        echo "✅ TESTE PASSOU! O checkout deveria estar funcionando.<br>";
        echo "Se ainda está falhando no site, o problema pode ser:<br>";
        echo "• Dados diferentes chegando do frontend<br>";
        echo "• Problema na validação JavaScript<br>";
        echo "• Cache do navegador<br>";
        echo "• Configuração específica do ambiente<br>";
        echo "</div>";
    } else {
        echo "<div style='color: red; font-weight: bold; font-size: 18px;'>";
        echo "❌ TESTE FALHOU! Problema identificado na estrutura de dados.<br>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERRO:</h2>";
    echo "<div style='background: red; color: white; padding: 15px; font-size: 16px;'>";
    echo "<strong>Mensagem:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Arquivo:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Linha:</strong> " . $e->getLine() . "<br>";
    echo "</div>";
    
    echo "<h3>Stack trace:</h3>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><strong>Teste:</strong> Reprodução exata do fluxo do checkout</p>";
?>
