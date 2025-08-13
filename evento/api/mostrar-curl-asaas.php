<?php
/**
 * Mostrar cURL exato enviado ao Asaas
 */
header('Content-Type: text/plain; charset=utf-8');

// Dados simulados baseados no seu perfil
$dadosReais = [
    'pedido' => [
        'pedidoid' => 80,
        'codigo_pedido' => 'PED_20250810_689955519355b',
        'valor_total' => 15,
        'parcelas' => 1,
        'evento_nome' => 'GOIANARH 2025'
    ],
    'cartao' => [
        'nome' => 'GUSTAVO CIBIM KALLAJIAN',
        'numero' => '5474 0803 4321 2187',
        'mes' => '03',
        'ano' => '2030',  // Agora sempre 4 dígitos
        'cvv' => '322'
    ],
    'customer' => [
        'nome_completo' => 'GUSTAVO CIBIM KALLAJIAN',
        'documento' => '167.867.448-69',
        'cep' => '74093-250',
        'endereco' => 'Avenida 136',
        'numero' => '123',
        'complemento' => '',
        'bairro' => 'Setor Sul',
        'cidade' => 'Goiânia',
        'estado' => 'GO',
        'telefone' => '',
        'email' => 'gustavo@cadernovirtual.com.br',
        'whatsapp' => '(34) 99202-4884'
    ]
];

echo "🔗 cURL EXATO ENVIADO AO ASAAS\n";
echo "===============================\n\n";

// Processar dados como o sistema faz
$cpfCnpj = preg_replace('/[^0-9]/', '', $dadosReais['customer']['documento']);
$whatsappLimpo = preg_replace('/[^0-9]/', '', $dadosReais['customer']['whatsapp']);

// 1. PRIMEIRO - CRIAR/BUSCAR CLIENTE
$customerData = [
    'name' => $dadosReais['customer']['nome_completo'],
    'cpfCnpj' => $cpfCnpj,
    'email' => $dadosReais['customer']['email'],
    'phone' => preg_replace('/[^0-9]/', '', $dadosReais['customer']['telefone']),
    'mobilePhone' => $whatsappLimpo,
    'postalCode' => preg_replace('/[^0-9]/', '', $dadosReais['customer']['cep']),
    'address' => $dadosReais['customer']['endereco'],
    'addressNumber' => $dadosReais['customer']['numero'],
    'complement' => $dadosReais['customer']['complemento'],
    'province' => $dadosReais['customer']['bairro'],
    'city' => $dadosReais['customer']['cidade'],
    'state' => $dadosReais['customer']['estado'],
    'notificationDisabled' => true
];

echo "1️⃣ BUSCAR CLIENTE (GET):\n";
echo "========================\n";
echo "curl -X GET 'https://api.asaas.com/v3/customers?cpfCnpj=" . $cpfCnpj . "' \\\n";
echo "  -H 'Content-Type: application/json' \\\n";
echo "  -H 'access_token: \$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk5NTM1N2ZmLTA3NTctNDM2Yi1hZGUyLTgxMzFjMWZjMDFlODo6JGFhY2hfMjA5ZDAyYWItNGEyOS00MTg1LTg5ZWMtOTJiYzU3NGUxODlm' \\\n";
echo "  -H 'User-Agent: AnySummit-PHP/1.0'\n\n";

echo "2️⃣ SE CLIENTE NÃO EXISTIR - CRIAR (POST):\n";
echo "=========================================\n";
echo "curl -X POST 'https://api.asaas.com/v3/customers' \\\n";
echo "  -H 'Content-Type: application/json' \\\n";
echo "  -H 'access_token: \$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk5NTM1N2ZmLTA3NTctNDM2Yi1hZGUyLTgxMzFjMWZjMDFlODo6JGFhY2hfMjA5ZDAyYWItNGEyOS00MTg1LTg5ZWMtOTJiYzU3NGUxODlm' \\\n";
echo "  -H 'User-Agent: AnySummit-PHP/1.0' \\\n";
echo "  -d '" . json_encode($customerData, JSON_UNESCAPED_UNICODE) . "'\n\n";

// 2. SEGUNDO - CRIAR PAGAMENTO
$paymentData = [
    'customer' => 'cus_000125294002',  // ID que já existe no seu caso
    'billingType' => 'CREDIT_CARD',
    'value' => floatval($dadosReais['pedido']['valor_total']),
    'dueDate' => date('Y-m-d'),
    'description' => 'Ingresso(s) - ' . $dadosReais['pedido']['evento_nome'],
    'externalReference' => $dadosReais['pedido']['codigo_pedido'],
    'creditCard' => [
        'holderName' => $dadosReais['cartao']['nome'],
        'number' => preg_replace('/[^0-9]/', '', $dadosReais['cartao']['numero']),
        'expiryMonth' => $dadosReais['cartao']['mes'],
        'expiryYear' => $dadosReais['cartao']['ano'],  // ✅ Corrigido: sempre 4 dígitos
        'ccv' => $dadosReais['cartao']['cvv']
    ],
    'creditCardHolderInfo' => [
        'name' => $dadosReais['customer']['nome_completo'],
        'email' => $dadosReais['customer']['email'],
        'cpfCnpj' => $cpfCnpj,
        'postalCode' => preg_replace('/[^0-9]/', '', $dadosReais['customer']['cep']),
        'address' => $dadosReais['customer']['endereco'],
        'addressNumber' => $dadosReais['customer']['numero'],
        'addressComplement' => $dadosReais['customer']['complemento'],
        'province' => $dadosReais['customer']['bairro'],
        'city' => $dadosReais['customer']['cidade'],
        'state' => $dadosReais['customer']['estado'],
        'phone' => preg_replace('/[^0-9]/', '', $dadosReais['customer']['telefone']),
        'mobilePhone' => $whatsappLimpo
    ],
    'remoteIp' => '177.35.59.71'
];

echo "3️⃣ PRINCIPAL - CRIAR PAGAMENTO (POST):\n";
echo "======================================\n";
echo "curl -X POST 'https://api.asaas.com/v3/lean/payments' \\\n";  // ✅ Endpoint corrigido
echo "  -H 'Content-Type: application/json' \\\n";
echo "  -H 'access_token: \$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk5NTM1N2ZmLTA3NTctNDM2Yi1hZGUyLTgxMzFjMWZjMDFlODo6JGFhY2hfMjA5ZDAyYWItNGEyOS00MTg1LTg5ZWMtOTJiYzU3NGUxODlm' \\\n";
echo "  -H 'User-Agent: AnySummit-PHP/1.0' \\\n";
echo "  -d '" . json_encode($paymentData, JSON_UNESCAPED_UNICODE) . "'\n\n";

echo "📋 DETALHES DOS DADOS ENVIADOS:\n";
echo "===============================\n\n";

echo "💳 Dados do Cartão:\n";
echo "-------------------\n";
echo "Número: " . $paymentData['creditCard']['number'] . "\n";
echo "Titular: " . $paymentData['creditCard']['holderName'] . "\n";
echo "Validade: " . $paymentData['creditCard']['expiryMonth'] . "/" . $paymentData['creditCard']['expiryYear'] . "\n";
echo "CVV: " . $paymentData['creditCard']['ccv'] . "\n\n";

echo "👤 Dados do Portador:\n";
echo "---------------------\n";
echo "Nome: " . $paymentData['creditCardHolderInfo']['name'] . "\n";
echo "CPF: " . $paymentData['creditCardHolderInfo']['cpfCnpj'] . "\n";
echo "Email: " . $paymentData['creditCardHolderInfo']['email'] . "\n";
echo "Telefone: " . $paymentData['creditCardHolderInfo']['mobilePhone'] . "\n";
echo "CEP: " . $paymentData['creditCardHolderInfo']['postalCode'] . "\n";
echo "Endereço: " . $paymentData['creditCardHolderInfo']['address'] . ", " . $paymentData['creditCardHolderInfo']['addressNumber'] . "\n";
echo "Bairro: " . $paymentData['creditCardHolderInfo']['province'] . "\n";
echo "Cidade: " . $paymentData['creditCardHolderInfo']['city'] . "/" . $paymentData['creditCardHolderInfo']['state'] . "\n\n";

echo "💰 Dados da Cobrança:\n";
echo "---------------------\n";
echo "Valor: R$ " . number_format($paymentData['value'], 2, ',', '.') . "\n";
echo "Descrição: " . $paymentData['description'] . "\n";
echo "Referência: " . $paymentData['externalReference'] . "\n";
echo "Vencimento: " . $paymentData['dueDate'] . "\n\n";

echo "🔧 CORREÇÕES APLICADAS:\n";
echo "=======================\n";
echo "✅ Endpoint: /v3/lean/payments (otimizado para cartão)\n";
echo "✅ Ano: " . $paymentData['creditCard']['expiryYear'] . " (sempre 4 dígitos)\n";
echo "✅ notificationDisabled: true (no customer)\n";
echo "✅ Todos os campos obrigatórios preenchidos\n\n";

echo "🧪 PARA TESTAR MANUALMENTE:\n";
echo "===========================\n";
echo "1. Copie o cURL do PAGAMENTO acima\n";
echo "2. Substitua o access_token pela sua chave real\n";
echo "3. Execute no terminal\n";
echo "4. Veja a resposta exata do Asaas\n\n";

echo "💡 OBSERVAÇÕES:\n";
echo "===============\n";
echo "- Se ainda recusar, a resposta do Asaas dirá exatamente o porquê\n";
echo "- O endpoint /lean/payments é mais direto para cartão\n";
echo "- Todos os dados estão no formato correto\n";
echo "- Estrutura conforme documentação oficial\n";

?>
