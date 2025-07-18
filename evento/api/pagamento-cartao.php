<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");
include("AsaasAPI.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

// Log para debug
error_log('Processando pagamento cartão: ' . print_r($input, true));

try {
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production'); // ou 'sandbox' para teste
    
    // Extrair dados
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
    
    // ========================================
    // 1. CRIAR/BUSCAR CLIENTE NO ASAAS
    // ========================================
    $cpfCnpj = preg_replace('/[^0-9]/', '', $compradorData['documento']);
    
    // Tentar buscar cliente existente
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    
    if (!$customer) {
        // Criar novo cliente
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
        
        $customer = $asaas->createCustomer($customerData);
        error_log('Cliente criado: ' . print_r($customer, true));
    } else {
        error_log('Cliente encontrado: ' . print_r($customer, true));
    }
    
    // ========================================
    // 2. CRIAR COBRANÇA COM CARTÃO
    // ========================================
    
    $valor = floatval($pedidoData['valor_total']);
    $parcelas = intval($pedidoData['parcelas'] ?? 1);
    
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
            'phone' => preg_replace('/[^0-9]/', '', $compradorData['telefone'] ?? ''),
            'mobilePhone' => preg_replace('/[^0-9]/', '', $compradorData['whatsapp'] ?? '')
        ],
        
        'remoteIp' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    // Se for parcelado
    if ($parcelas > 1) {
        $paymentData['installmentCount'] = $parcelas;
        $paymentData['installmentValue'] = round($valor / $parcelas, 2);
        $paymentData['totalValue'] = $valor;
    }
    
    error_log('Dados do pagamento: ' . print_r($paymentData, true));
    
    // Criar cobrança no Asaas
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    error_log('Resposta do Asaas: ' . print_r($payment, true));
    
    // ========================================
    // 3. ATUALIZAR PEDIDO NO BANCO
    // ========================================
    
    $pedidoid = intval($pedidoData['pedidoid']);
    $asaas_id = $payment['id'] ?? '';
    $status = '';
    
    // Determinar status baseado na resposta
    if (isset($payment['status'])) {
        switch ($payment['status']) {
            case 'CONFIRMED':
            case 'RECEIVED':
                $status = 'aprovado';
                break;
            case 'PENDING':
                $status = 'pendente';
                break;
            default:
                $status = 'pendente';
        }
    }
    
    // Atualizar pedido
    $update_sql = "UPDATE tb_pedidos SET 
                   status_pagamento = '$status',
                   asaas_payment_id = '$asaas_id',
                   updated_at = NOW()
                   WHERE pedidoid = $pedidoid";
    
    if (!$con->query($update_sql)) {
        error_log('Erro ao atualizar pedido: ' . $con->error);
    }
    
    // ========================================
    // 4. RESPOSTA
    // ========================================
    
    $is_approved = in_array($payment['status'], ['CONFIRMED', 'RECEIVED']);
    
    echo json_encode([
        'success' => true,
        'approved' => $is_approved,
        'message' => $is_approved ? 'Pagamento aprovado com sucesso' : 'Pagamento em processamento',
        'payment' => [
            'id' => $payment['id'],
            'status' => $payment['status'],
            'value' => $payment['value'],
            'netValue' => $payment['netValue'] ?? $payment['value'],
            'invoiceUrl' => $payment['invoiceUrl'] ?? '',
            'installmentCount' => $payment['installmentCount'] ?? 1
        ],
        'customer' => [
            'id' => $customer['id'],
            'name' => $customer['name']
        ],
        'pedido' => [
            'codigo_pedido' => $pedidoData['codigo_pedido'] ?? '',
            'pedidoid' => $pedidoid
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro no pagamento cartão: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao processar pagamento: ' . $e->getMessage(),
        'error_code' => 'PAYMENT_ERROR'
    ]);
}
?>