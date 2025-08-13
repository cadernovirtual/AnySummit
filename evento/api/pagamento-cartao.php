<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include("../conm/conn.php");
include("AsaasAPI.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Leitura do JSON
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!$input || !is_array($input)) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

// Log para debug
error_log('Processando pagamento cartão: ' . print_r($input, true));

try {
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production');
    
    // Extrair dados - CORREÇÃO: Usar sintaxe compatível PHP 5.x
    $pedidoData = isset($input['pedido']) ? $input['pedido'] : array();
    $cartaoData = isset($input['cartao']) ? $input['cartao'] : array();
    $customerData = isset($input['customer']) ? $input['customer'] : (isset($input['comprador']) ? $input['comprador'] : array());
    
    // Validar dados obrigatórios
    if (empty($pedidoData) || empty($cartaoData) || empty($customerData)) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    // Validar valor mínimo
    $valor = floatval($pedidoData['valor_total']);
    if ($valor < 5) {
        throw new Exception('Valor mínimo para pagamento é R$ 5,00');
    }
    
    // Validar parcelas para valor mínimo
    $parcelas = isset($pedidoData['parcelas']) ? intval($pedidoData['parcelas']) : 1;
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
    $cpfCnpj = preg_replace('/[^0-9]/', '', $customerData['documento']);
    
    // Tentar buscar cliente existente
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    
    if (!$customer) {
        // Criar novo cliente - ESTRUTURA COMO GITHUB
        $customerDataAsaas = array(
            'name' => $customerData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'email' => isset($customerData['email']) ? $customerData['email'] : '',
            'phone' => preg_replace('/[^0-9]/', '', isset($customerData['telefone']) ? $customerData['telefone'] : ''),
            'mobilePhone' => preg_replace('/[^0-9]/', '', isset($customerData['whatsapp']) ? $customerData['whatsapp'] : ''),
            'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
            'address' => isset($customerData['endereco']) ? $customerData['endereco'] : '',
            'addressNumber' => isset($customerData['numero']) ? $customerData['numero'] : '1',
            'complement' => isset($customerData['complemento']) ? $customerData['complemento'] : '',
            'province' => isset($customerData['bairro']) ? $customerData['bairro'] : '',
            'city' => isset($customerData['cidade']) ? $customerData['cidade'] : '',
            'state' => isset($customerData['estado']) ? $customerData['estado'] : ''
        );
        
        $customer = $asaas->createCustomer($customerDataAsaas);
        error_log('Cliente criado: ' . print_r($customer, true));
    } else {
        error_log('Cliente encontrado: ' . print_r($customer, true));
    }
    
    // ========================================
    // 2. CRIAR COBRANÇA COM CARTÃO - ESTRUTURA COMO GITHUB
    // ========================================
    
    $valor = floatval($pedidoData['valor_total']);
    $parcelas = isset($pedidoData['parcelas']) ? intval($pedidoData['parcelas']) : 1;
    
    // Dados da cobrança - ESTRUTURA COMO GITHUB
    $paymentData = array(
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => $valor,
        'dueDate' => date('Y-m-d'), // Cobrança imediata
        'description' => 'Ingresso(s) - ' . (isset($pedidoData['evento_nome']) ? $pedidoData['evento_nome'] : 'Evento'),
        'externalReference' => isset($pedidoData['codigo_pedido']) ? $pedidoData['codigo_pedido'] : $pedidoData['pedidoid'],
        
        // Dados do cartão - CORREÇÃO: Usar dados simples como GitHub
        'creditCard' => array(
            'holderName' => $cartaoData['nome'], // CORREÇÃO: Nome do cartão (input card_name)
            'number' => preg_replace('/[^0-9]/', '', $cartaoData['numero']),
            'expiryMonth' => $cartaoData['mes'], // CORREÇÃO: Valor direto como GitHub
            'expiryYear' => $cartaoData['ano'],   // CORREÇÃO: Valor direto como GitHub
            'ccv' => $cartaoData['cvv']           // CORREÇÃO: Valor direto como GitHub
        ),
        
        // Dados do portador do cartão - CORREÇÃO: Nome do comprador como GitHub
        'creditCardHolderInfo' => array(
            'name' => $customerData['nome_completo'], // CORREÇÃO: Nome do comprador como GitHub
            'email' => isset($customerData['email']) ? $customerData['email'] : '',
            'cpfCnpj' => $cpfCnpj,
            'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
            'address' => isset($customerData['endereco']) ? $customerData['endereco'] : '',
            'addressNumber' => isset($customerData['numero']) ? $customerData['numero'] : '1',
            'addressComplement' => isset($customerData['complemento']) ? $customerData['complemento'] : '',
            'province' => isset($customerData['bairro']) ? $customerData['bairro'] : '',
            'city' => isset($customerData['cidade']) ? $customerData['cidade'] : '',
            'state' => isset($customerData['estado']) ? $customerData['estado'] : '',
            'phone' => preg_replace('/[^0-9]/', '', isset($customerData['telefone']) ? $customerData['telefone'] : ''),
            'mobilePhone' => preg_replace('/[^0-9]/', '', isset($customerData['whatsapp']) ? $customerData['whatsapp'] : '')
        ),
        
        'remoteIp' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '' // CORREÇÃO: IP simples como GitHub
    );
    
    // Se for parcelado
    if ($parcelas > 1) {
        $paymentData['installmentCount'] = $parcelas;
        $paymentData['installmentValue'] = round($valor / $parcelas, 2);
        $paymentData['totalValue'] = $valor;
    }
    
    error_log('Dados do pagamento: ' . print_r($paymentData, true));
    
    // Criar cobrança no Asaas - AGORA USA ENDPOINT CORRETO /payments
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    error_log('Resposta do Asaas: ' . print_r($payment, true));
    
    // ========================================
    // 3. ATUALIZAR PEDIDO NO BANCO - MANTIDO COMO ESTAVA
    // ========================================
    
    $pedidoid = intval($pedidoData['pedidoid']);
    $asaas_id = isset($payment['id']) ? $payment['id'] : '';
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
    
    // Atualizar pedido - MANTIDO sistema defensivo
    if (!isset($con) || !is_object($con)) {
        error_log('Conexão com DB ausente ao atualizar pedido.');
    } else {
        $update_sql = "UPDATE tb_pedidos SET 
                       status_pagamento = '$status',
                       asaas_payment_id = '$asaas_id',
                       updated_at = NOW()
                       WHERE pedidoid = $pedidoid";
        
        if (!$con->query($update_sql)) {
            error_log('Erro ao atualizar pedido: ' . $con->error);
        } else {
            // ========================================
            // ENVIAR EMAIL DE CONFIRMAÇÃO PARA PAGAMENTO COM CARTÃO APROVADO
            // ========================================
            if ($status === 'aprovado') {
                error_log("Enviando email de confirmação para pagamento com cartão aprovado - Pedido: $pedidoid");
                
                // Incluir função de envio de email se existir
                if (file_exists("enviar-email-confirmacao.php")) {
                    include_once("enviar-email-confirmacao.php");
                    
                    if (function_exists('enviarEmailConfirmacao')) {
                        try {
                            $email_enviado = enviarEmailConfirmacao($pedidoid, $con);
                            if ($email_enviado === true) {
                                error_log("Email de confirmação enviado com sucesso para pagamento com cartão: $pedidoid");
                            } else {
                                error_log("Falha ao enviar email de confirmação para pagamento com cartão: $pedidoid - Erro: " . $email_enviado);
                            }
                        } catch (Exception $e) {
                            error_log("Exceção ao enviar email de confirmação cartão: " . $e->getMessage());
                        }
                    }
                }
                
                // Incluir notificação do organizador se existir
                if (file_exists("notificar-organizador.php")) {
                    include_once("notificar-organizador.php");
                    
                    if (function_exists('notificarOrganizadorCompra')) {
                        try {
                            $notificacao_enviada = notificarOrganizadorCompra($pedidoid, $con);
                            if ($notificacao_enviada === true) {
                                error_log("Notificação do organizador enviada com sucesso para pagamento com cartão: $pedidoid");
                            } else {
                                error_log("Falha ao enviar notificação do organizador para pagamento com cartão: $pedidoid - Erro: " . $notificacao_enviada);
                            }
                        } catch (Exception $e) {
                            error_log("Exceção ao enviar notificação do organizador cartão: " . $e->getMessage());
                        }
                    }
                }
            }
        }
    }
    
    // ========================================
    // 4. RESPOSTA - MANTIDA COMO ESTAVA
    // ========================================
    
    $is_approved = in_array($payment['status'], array('CONFIRMED', 'RECEIVED'));
    
    echo json_encode(array(
        'success' => true,
        'approved' => $is_approved,
        'message' => $is_approved ? 'Pagamento aprovado com sucesso' : 'Pagamento em processamento',
        'payment' => array(
            'id' => $payment['id'],
            'status' => $payment['status'],
            'value' => $payment['value'],
            'netValue' => isset($payment['netValue']) ? $payment['netValue'] : $payment['value'],
            'invoiceUrl' => isset($payment['invoiceUrl']) ? $payment['invoiceUrl'] : '',
            'installmentCount' => isset($payment['installmentCount']) ? $payment['installmentCount'] : 1
        ),
        'customer' => array(
            'id' => $customer['id'],
            'name' => $customer['name']
        ),
        'pedido' => array(
            'codigo_pedido' => isset($pedidoData['codigo_pedido']) ? $pedidoData['codigo_pedido'] : '',
            'pedidoid' => $pedidoid
        )
    ));
    
} catch (Exception $e) {
    error_log('Erro no pagamento cartão: ' . $e->getMessage());
    
    // Tratamento de erro SIMPLES como GitHub
    echo json_encode(array(
        'success' => false,
        'message' => 'Erro ao processar pagamento: ' . $e->getMessage(),
        'error_code' => 'PAYMENT_ERROR'
    ));
}
?>