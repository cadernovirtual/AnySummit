<?php
// Versão do pagamento-cartao.php SEM mobilePhone
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
error_log('=== TESTE SEM MOBILEPHONE ===');
error_log('Processando pagamento cartão: ' . print_r($input, true));

/**
 * Validar e formatar phone para o Asaas (sem mobilePhone)
 */
function validarPhone($telefone) {
    // Limpar tudo que não é número
    $numero = preg_replace('/[^0-9]/', '', $telefone);
    
    // Se vazio, retornar vazio
    if (empty($numero)) {
        return '';
    }
    
    // Remover código do país se presente (55)
    if (strlen($numero) === 13 && substr($numero, 0, 2) === '55') {
        $numero = substr($numero, 2);
    }
    
    // Remover zero inicial se presente (0XX)
    if (strlen($numero) === 12 && substr($numero, 0, 1) === '0') {
        $numero = substr($numero, 1);
    }
    
    // Se tem 10 ou 11 dígitos, é válido
    if (strlen($numero) >= 10 && strlen($numero) <= 11) {
        return $numero;
    }
    
    // Se não conseguiu validar, retornar vazio
    return '';
}

/**
 * Traduz mensagens de erro do Asaas para mensagens amigáveis
 */
function translateAsaasError($errorMessage) {
    // Traduções específicas por código
    $translations = [
        'invalid_creditCard' => 'Cartão de crédito recusado. Verifique os dados do cartão e tente novamente.',
        'insufficient_funds' => 'Saldo insuficiente no cartão. Tente com outro cartão ou forma de pagamento.',
        'card_expired' => 'Cartão expirado. Verifique a data de validade ou use outro cartão.',
        'invalid_cvv' => 'Código de segurança (CVV) inválido. Verifique os 3 dígitos no verso do cartão.',
        'card_blocked' => 'Cartão bloqueado. Entre em contato com seu banco ou use outro cartão.',
        'invalid_card_number' => 'Número do cartão inválido. Verifique os 16 dígitos digitados.',
        'transaction_not_allowed' => 'Transação não permitida. Entre em contato com seu banco.',
        'exceeds_limit' => 'Valor excede o limite do cartão. Tente um valor menor ou outro cartão.',
        'issuer_unavailable' => 'Banco emissor indisponível no momento. Tente novamente em alguns minutos.',
        'invalid_transaction' => 'Dados da transação inválidos. Verifique todas as informações.',
        'fraud_suspected' => 'Transação suspeita bloqueada por segurança. Entre em contato com seu banco.',
        'invalid_merchant' => 'Problema com o estabelecimento. Tente novamente ou entre em contato conosco.'
    ];
    
    // Verificar se tem código específico
    foreach ($translations as $code => $translation) {
        if (strpos($errorMessage, $code) !== false) {
            return $translation;
        }
    }
    
    // Retornar mensagem genérica amigável
    return 'Não foi possível processar o pagamento com este cartão. Verifique os dados ou tente outro cartão.';
}

try {
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production');
    
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
    
    // ========================================
    // 1. CRIAR/BUSCAR CLIENTE NO ASAAS (SEM MOBILEPHONE)
    // ========================================
    $cpfCnpj = preg_replace('/[^0-9]/', '', $compradorData['documento']);
    
    // Tentar buscar cliente existente
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    
    if (!$customer) {
        // Criar novo cliente SEM mobilePhone
        $phoneValidado = validarPhone($compradorData['whatsapp'] ?? $compradorData['telefone'] ?? '');
        
        $customerData = [
            'name' => $compradorData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'email' => $compradorData['email'] ?? '',
            'postalCode' => preg_replace('/[^0-9]/', '', $compradorData['cep']),
            'address' => $compradorData['endereco'] ?? '',
            'addressNumber' => $compradorData['numero'] ?? '1',
            'complement' => $compradorData['complemento'] ?? '',
            'province' => $compradorData['bairro'] ?? '',
            'city' => $compradorData['cidade'] ?? '',
            'state' => $compradorData['estado'] ?? ''
        ];
        
        // Adicionar phone só se válido
        if (!empty($phoneValidado)) {
            $customerData['phone'] = $phoneValidado;
        }
        
        error_log('Customer data SEM mobilePhone: ' . print_r($customerData, true));
        
        $customer = $asaas->createCustomer($customerData);
        error_log('Cliente criado: ' . print_r($customer, true));
    } else {
        error_log('Cliente encontrado: ' . print_r($customer, true));
    }
    
    // ========================================
    // 2. CRIAR COBRANÇA COM CARTÃO (SEM MOBILEPHONE)
    // ========================================
    
    $valor = floatval($pedidoData['valor_total']);
    $parcelas = intval($pedidoData['parcelas'] ?? 1);
    
    // Dados da cobrança
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => $valor,
        'dueDate' => date('Y-m-d'),
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
        
        // Dados do portador do cartão (SEM mobilePhone)
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
            'state' => $compradorData['estado'] ?? ''
        ],
        
        'remoteIp' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    // Adicionar phone só se válido (SEM mobilePhone)
    if (!empty($phoneValidado)) {
        $paymentData['creditCardHolderInfo']['phone'] = $phoneValidado;
    }
    
    // Se for parcelado
    if ($parcelas > 1) {
        $paymentData['installmentCount'] = $parcelas;
        $paymentData['installmentValue'] = round($valor / $parcelas, 2);
        $paymentData['totalValue'] = $valor;
    }
    
    error_log('Payment data SEM mobilePhone: ' . print_r($paymentData, true));
    
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
    
    // Traduzir mensagem de erro para formato amigável
    $friendlyMessage = translateAsaasError($e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $friendlyMessage,
        'error_code' => 'PAYMENT_ERROR',
        'original_error' => $e->getMessage()
    ]);
}
?>
