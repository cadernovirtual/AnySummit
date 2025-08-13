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
error_log('Processando pagamento PIX: ' . print_r($input, true));

try {
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production'); // ou 'sandbox' para teste
    
    // Extrair dados
    $pedidoData = $input['pedido'] ?? [];
    $compradorData = $input['comprador'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($pedidoData) || empty($compradorData)) {
        throw new Exception('Dados obrigatórios não informados');
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
    // 2. CRIAR COBRANÇA PIX
    // ========================================
    
    $valor = floatval($pedidoData['valor_total']);
    
    // Configurar timezone para São Paulo
    date_default_timezone_set('America/Sao_Paulo');
    
    // Dados da cobrança PIX (configurado para QR Code imediato)
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'PIX',
        'value' => $valor,
        'dueDate' => date('Y-m-d'), // CORRIGIDO: Vencimento para hoje (PIX QR Code imediato)
        'description' => 'Ingresso(s) - ' . ($pedidoData['evento_nome'] ?? 'Evento'),
        'externalReference' => $pedidoData['codigo_pedido'] ?? $pedidoData['pedidoid'],
        
        // Configurações para PIX QR Code imediato
        'postalService' => false,           // Não enviar pelos correios
        'notificationDisabled' => false,   // CORRIGIDO: Manter webhooks habilitados para detectar pagamento
        
        // Configurações específicas para PIX imediato
        'fine' => [
            'value' => 0                    // Sem multa
        ],
        'interest' => [
            'value' => 0                    // Sem juros
        ],
        'discount' => [
            'value' => 0,                   // Sem desconto
            'dueDateLimitDays' => 0
        ],
        
        // Configurações específicas para PIX imediato (sem callback desnecessário)
    ];
    
    error_log('Dados do pagamento PIX: ' . print_r($paymentData, true));
    
    // Criar cobrança no Asaas
    $payment = $asaas->createPixPayment($paymentData);
    
    error_log('Resposta do Asaas: ' . print_r($payment, true));
    
    // ========================================
    // 3. OBTER QR CODE PIX
    // ========================================
    
    $qrCodeData = null;
    if (isset($payment['id'])) {
        try {
            // Aguardar um pouco para o QR Code ser gerado
            sleep(2);
            $qrCodeData = $asaas->getPixQrCode($payment['id']);
            error_log('QR Code PIX: ' . print_r($qrCodeData, true));
        } catch (Exception $e) {
            error_log('Erro ao obter QR Code: ' . $e->getMessage());
        }
    }
    
    // ========================================
    // 4. ATUALIZAR PEDIDO NO BANCO
    // ========================================
    
    $pedidoid = intval($pedidoData['pedidoid']);
    $asaas_id = $payment['id'] ?? '';
    $status = 'pendente'; // PIX sempre inicia como pendente
    
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
    // 5. RESPOSTA
    // ========================================
    
    $response = [
        'success' => true,
        'message' => 'Pagamento PIX criado com sucesso',
        'payment' => [
            'id' => $payment['id'],
            'status' => $payment['status'],
            'value' => $payment['value'],
            'dueDate' => $payment['dueDate'],
            'invoiceUrl' => $payment['invoiceUrl'] ?? '',
            'bankSlipUrl' => $payment['bankSlipUrl'] ?? ''
        ],
        'customer' => [
            'id' => $customer['id'],
            'name' => $customer['name']
        ]
    ];
    
    // Adicionar dados do QR Code se disponível
    if ($qrCodeData) {
        $response['pix'] = [
            'qrCode' => $qrCodeData['qrCode'] ?? '',
            'encodedImage' => $qrCodeData['encodedImage'] ?? '',
            'payload' => $qrCodeData['payload'] ?? ''
        ];
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log('Erro no pagamento PIX: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao processar pagamento PIX: ' . $e->getMessage(),
        'error_code' => 'PIX_PAYMENT_ERROR'
    ]);
}
?>
