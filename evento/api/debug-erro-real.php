<?php
/**
 * DIAGNÓSTICO REAL - Capturar erro exato do Asaas
 */
header('Content-Type: application/json; charset=utf-8');

// Ativar logs completos
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

include_once('../conm/conn.php');
include_once('AsaasAPI.php');

echo json_encode([
    'debug' => true,
    'message' => 'Teste para capturar erro real do Asaas',
    'timestamp' => date('Y-m-d H:i:s')
]);

// Dados MÍNIMOS para teste - conforme documentação
$dadosMinimos = [
    'pedido' => [
        'pedidoid' => 999,
        'codigo_pedido' => 'DEBUG_' . uniqid(),
        'valor_total' => 10.00,
        'parcelas' => 1,
        'evento_nome' => 'Debug Test'
    ],
    'cartao' => [
        'nome' => 'TESTE DEBUG',
        'numero' => '4000000000000010',  // SEM espaços
        'mes' => '12',
        'ano' => '2030',
        'cvv' => '123'
    ],
    'customer' => [
        'nome_completo' => 'Debug Test User',
        'documento' => '12345678901',  // CPF válido numericamente
        'cep' => '01234567',           // CEP sem traço
        'endereco' => 'Rua Teste 123',
        'numero' => '123',
        'bairro' => 'Centro',
        'cidade' => 'São Paulo',
        'estado' => 'SP',
        'email' => 'debug@test.com',
        'whatsapp' => '11999999999'    // Telefone padrão válido
    ]
];

// Salvar log específico para debug
error_log('=== DEBUG TESTE CARTÃO SANDBOX ===');
error_log('Dados enviados: ' . print_r($dadosMinimos, true));

try {
    $asaas = new AsaasAPI('production');
    
    // Simular exatamente o que o código faz
    $input = $dadosMinimos;
    $pedidoData = $input['pedido'];
    $cartaoData = $input['cartao'];
    $customerData = $input['customer'];
    
    $cpfCnpj = preg_replace('/[^0-9]/', '', $customerData['documento']);
    
    // 1. CRIAR CLIENTE primeiro
    $clienteData = [
        'name' => $customerData['nome_completo'],
        'cpfCnpj' => $cpfCnpj,
        'email' => $customerData['email'],
        'mobilePhone' => preg_replace('/[^0-9]/', '', $customerData['whatsapp']),
        'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
        'address' => $customerData['endereco'],
        'addressNumber' => $customerData['numero'],
        'province' => $customerData['bairro'],
        'city' => $customerData['cidade'],
        'state' => $customerData['estado'],
        'notificationDisabled' => true
    ];
    
    error_log('Dados do cliente: ' . print_r($clienteData, true));
    
    // Buscar ou criar cliente
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    if (!$customer) {
        $customer = $asaas->createCustomer($clienteData);
        error_log('Cliente criado: ' . print_r($customer, true));
    } else {
        error_log('Cliente encontrado: ' . print_r($customer, true));
    }
    
    // 2. CRIAR PAGAMENTO
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => floatval($pedidoData['valor_total']),
        'dueDate' => date('Y-m-d'),
        'description' => 'Teste Debug - ' . $pedidoData['evento_nome'],
        'externalReference' => $pedidoData['codigo_pedido'],
        'creditCard' => [
            'holderName' => $cartaoData['nome'],
            'number' => preg_replace('/[^0-9]/', '', $cartaoData['numero']),
            'expiryMonth' => $cartaoData['mes'],
            'expiryYear' => $cartaoData['ano'],
            'ccv' => $cartaoData['cvv']
        ],
        'creditCardHolderInfo' => [
            'name' => $customerData['nome_completo'],
            'email' => $customerData['email'],
            'cpfCnpj' => $cpfCnpj,
            'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
            'address' => $customerData['endereco'],
            'addressNumber' => $customerData['numero'],
            'province' => $customerData['bairro'],
            'city' => $customerData['cidade'],
            'state' => $customerData['estado'],
            'mobilePhone' => preg_replace('/[^0-9]/', '', $customerData['whatsapp'])
        ]
    ];
    
    error_log('Dados do pagamento: ' . print_r($paymentData, true));
    
    // ESTE É O MOMENTO DA VERDADE
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    error_log('Resposta do Asaas: ' . print_r($payment, true));
    
    echo json_encode([
        'success' => true,
        'message' => 'Pagamento processado',
        'payment' => $payment,
        'customer' => $customer
    ]);
    
} catch (Exception $e) {
    error_log('ERRO CAPTURADO: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'error_message' => $e->getMessage(),
        'error_line' => $e->getLine(),
        'error_file' => basename($e->getFile()),
        'dados_enviados' => $dadosMinimos
    ]);
}
?>
