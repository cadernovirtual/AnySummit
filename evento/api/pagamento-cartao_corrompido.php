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

/**
 * Validar e formatar mobilePhone para o Asaas
 * Aceita todos os DDDs válidos do Brasil
 */
function validarMobilePhone($whatsapp) {
    // Se vazio, retornar null para não enviar o campo
    if (empty($whatsapp)) {
        return null;
    }
    
    // Limpar tudo que não é número
    $numero = preg_replace('/[^0-9]/', '', $whatsapp);
    
    // Remover código do país se presente (55)
    if (strlen($numero) === 13 && substr($numero, 0, 2) === '55') {
        $numero = substr($numero, 2);
    }
    
    // Remover zero inicial se presente (0XX)
    if (strlen($numero) === 12 && substr($numero, 0, 1) === '0') {
        $numero = substr($numero, 1);
    }
    
    // Se tem 10 dígitos, adicionar 9 na 3ª posição
    if (strlen($numero) === 10) {
        $numero = substr($numero, 0, 2) . '9' . substr($numero, 2);
    }
    
    // Validar formato final: 11 dígitos com 9 na 3ª posição
    if (strlen($numero) === 11 && substr($numero, 2, 1) === '9') {
        
        // DDDs válidos do Brasil (11-99 conforme ANATEL)
        $dddsValidos = [
            '11','12','13','14','15','16','17','18','19',  // SP
            '21','22','24','27','28',                      // RJ/ES
            '31','32','33','34','35','37','38',            // MG
            '41','42','43','44','45','46','47','48','49',  // PR/SC
            '51','53','54','55',                           // RS
            '61','62','63','64','65','66','67','68','69',  // Centro-Oeste
            '71','73','74','75','77','79',                 // BA/SE
            '81','82','83','84','85','86','87','88','89',  // Nordeste
            '91','92','93','94','95','96','97','98','99'   // Norte
        ];
        
        $ddd = substr($numero, 0, 2);
        
        // Verificar se DDD é válido
        if (in_array($ddd, $dddsValidos)) {
            return $numero;
        } else {
            error_log("DDD {$ddd} não é válido no Brasil. Número original: {$whatsapp}");
            return null; // Retornar null se DDD inválido
        }
    }
    
    // Se não conseguiu validar, retornar null
    error_log("Formato de WhatsApp inválido: {$whatsapp} (processado: {$numero})");
    return null;
}

/**
 * Traduz mensagens de erro do Asaas para mensagens amigáveis
 */
function translateAsaasError($errorMessage) {
    // Se a mensagem já está em formato JSON de erro do Asaas
    if (strpos($errorMessage, 'Erro HTTP') !== false && strpos($errorMessage, '[{') !== false) {
        // Extrair o JSON da mensagem
        preg_match('/\[{.*}\]/', $errorMessage, $matches);
        if (!empty($matches[0])) {
            try {
                $errors = json_decode($matches[0], true);
                if (!empty($errors[0])) {
                    $error = $errors[0];
                    
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
                    
                    // Retornar tradução específica se existir
                    if (isset($translations[$error['code']])) {
                        return $translations[$error['code']];
                    }
                    
                    // Se tem descrição, retornar ela limpa
                    if (!empty($error['description'])) {
                        return $error['description'];
                    }
                }
            } catch (Exception $e) {
                // Se falhou ao parsear, continuar com verificações de palavra-chave
            }
        }
    }
    
    // Verificações por palavras-chave
    $keywords = [
        'não autorizada' => 'Cartão recusado pela operadora. Verifique os dados ou tente outro cartão.',
        'transação não autorizada' => 'Cartão recusado pela operadora. Verifique os dados ou tente outro cartão.',
        'cartão inválido' => 'Dados do cartão inválidos. Verifique número, validade e CVV.',
        'saldo insuficiente' => 'Saldo insuficiente no cartão. Tente com outro cartão.',
        'cartão expirado' => 'Cartão expirado. Verifique a data de validade.',
        'cvv inválido' => 'Código de segurança (CVV) incorreto. Verifique os 3 dígitos no verso.',
        'cartão bloqueado' => 'Cartão bloqueado. Entre em contato com seu banco.'
    ];
    
    foreach ($keywords as $keyword => $translation) {
        if (stripos($errorMessage, $keyword) !== false) {
            return $translation;
        }
    }
    
    // Se nada funcionou, retornar mensagem genérica amigável
    return 'Não foi possível processar o pagamento com este cartão. Verifique os dados ou tente outro cartão.';
}

try {
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production'); // ou 'sandbox' para teste
    
    // Extrair dados - suportar tanto 'customer' quanto 'comprador' para compatibilidade
    $pedidoData = $input['pedido'] ?? [];
    $cartaoData = $input['cartao'] ?? [];
    $customerData = $input['customer'] ?? $input['comprador'] ?? [];  // Priorizar 'customer'
    
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
    $cpfCnpj = preg_replace('/[^0-9]/', '', $customerData['documento']);
    
    // Tentar buscar cliente existente
    $customer = $asaas->getCustomerByCpfCnpj($cpfCnpj);
    
    if (!$customer) {
        // Criar novo cliente
        $mobilePhoneValidado = validarMobilePhone($customerData['whatsapp'] ?? '');
        
        // Preparar dados básicos do cliente
        $clienteAsaasData = [
            'name' => $customerData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'notificationDisabled' => true  // OBRIGATÓRIO: desativar notificações automáticas
        ];
        
        // Adicionar email apenas se não estiver vazio
        if (!empty($customerData['email'])) {
            $clienteAsaasData['email'] = $customerData['email'];
        }
        
        // Adicionar mobilePhone apenas se for válido (11 dígitos)
        if ($mobilePhoneValidado && strlen($mobilePhoneValidado) === 11) {
            $clienteAsaasData['mobilePhone'] = $mobilePhoneValidado;
        }
        
        // Adicionar dados de endereço se disponíveis
        if (!empty($customerData['cep'])) {
            $clienteAsaasData['postalCode'] = preg_replace('/[^0-9]/', '', $customerData['cep']);
        }
        if (!empty($customerData['endereco'])) {
            $clienteAsaasData['address'] = $customerData['endereco'];
        }
        if (!empty($customerData['numero'])) {
            $clienteAsaasData['addressNumber'] = $customerData['numero'];
        }
        if (!empty($customerData['complemento'])) {
            $clienteAsaasData['complement'] = $customerData['complemento'];
        }
        if (!empty($customerData['bairro'])) {
            $clienteAsaasData['province'] = $customerData['bairro'];
        }
        if (!empty($customerData['cidade'])) {
            $clienteAsaasData['city'] = $customerData['cidade'];
        }
        if (!empty($customerData['estado'])) {
            $clienteAsaasData['state'] = $customerData['estado'];
        }
        
        error_log('Dados do cliente para Asaas: ' . print_r($clienteAsaasData, true));
        error_log('mobilePhone validado: "' . $mobilePhoneValidado . '" (original: "' . ($customerData['whatsapp'] ?? 'vazio') . '")');
        
        $customer = $asaas->createCustomer($clienteAsaasData);
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
            'name' => $customerData['nome_completo'],
            'email' => $customerData['email'] ?? '',
            'cpfCnpj' => $cpfCnpj,
            'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
            'address' => $customerData['endereco'] ?? '',
            'addressNumber' => $customerData['numero'] ?? '1',
            'addressComplement' => $customerData['complemento'] ?? '',
            'province' => $customerData['bairro'] ?? '',
            'city' => $customerData['cidade'] ?? '',
            'state' => $customerData['estado'] ?? '',
        ];
        
        // Adicionar telefones apenas se forem válidos
        if ($mobilePhoneValidado && strlen($mobilePhoneValidado) === 11) {
            $paymentData['creditCardHolderInfo']['phone'] = $mobilePhoneValidado;
            $paymentData['creditCardHolderInfo']['mobilePhone'] = $mobilePhoneValidado;
        }
        
        $paymentData['remoteIp'] = $_SERVER['REMOTE_ADDR'] ?? '';
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
    
    // Traduzir mensagem de erro para formato amigável
    $friendlyMessage = translateAsaasError($e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $friendlyMessage,
        'error_code' => 'PAYMENT_ERROR',
        'original_error' => $e->getMessage() // Para debug, se necessário
    ]);
}
?>
