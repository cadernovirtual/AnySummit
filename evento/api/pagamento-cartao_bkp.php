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

// Log de erros
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

include("../conm/conn.php");
include("AsaasAPI.php");

// DEBUG: Log de inicialização
error_log('=== PAGAMENTO CARTAO INICIADO ===');
error_log('PHP Version: ' . PHP_VERSION);
error_log('AsaasAPI exists: ' . (class_exists('AsaasAPI') ? 'SIM' : 'NÃO'));
error_log('$con exists: ' . (isset($con) ? 'SIM' : 'NÃO'));

// Verificações defensivas - CORREÇÃO HTTP 500
if (!class_exists('AsaasAPI')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Biblioteca AsaasAPI não encontrada (verifique o include/caminho).']);
    exit;
}

if (!isset($con)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Conexão com banco não inicializada.']);
    exit;
}

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
error_log('=== CHECKPOINT 1: Input processado ===');

error_log('=== CHECKPOINT 2: Antes das funções ===');

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

error_log('=== CHECKPOINT 3: Antes do try principal ===');

try {
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production');
    
    error_log('=== CHECKPOINT 4: AsaasAPI criada ===');
    
    // CORREÇÃO PHP 5.x: Extrair dados sem operador ?? para compatibilidade
    $pedidoData   = isset($input['pedido'])   ? $input['pedido']   : array();
    $cartaoData   = isset($input['cartao'])   ? $input['cartao']   : array();
    $customerData = isset($input['customer']) ? $input['customer'] : (isset($input['comprador']) ? $input['comprador'] : array());
    
    error_log('=== CHECKPOINT 5: Dados extraídos ===');
    
    // CORREÇÕES HTTP 400: Normalizações críticas
    if (isset($cartaoData['cvv'])) {
        $originalCvv = $cartaoData['cvv'];
        $cartaoData['cvv'] = preg_replace('/\D+/', '', $cartaoData['cvv']); // só dígitos, sem espaços
        error_log('CVV original: "' . $originalCvv . '" | CVV limpo: "' . $cartaoData['cvv'] . '" | Tamanho: ' . strlen($cartaoData['cvv']));
    }
    
    error_log('=== CHECKPOINT 6: CVV normalizado ===');
    
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
        // Criar novo cliente com melhorias de validação
        $customerDataAsaas = [
            'name' => $customerData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'email' => isset($customerData['email']) ? $customerData['email'] : '',
            'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
            'address' => isset($customerData['endereco']) ? $customerData['endereco'] : '',
            'addressNumber' => isset($customerData['numero']) ? $customerData['numero'] : '1',
            'complement' => isset($customerData['complemento']) ? $customerData['complemento'] : '',
            'province' => isset($customerData['bairro']) ? $customerData['bairro'] : '',
            'city' => isset($customerData['cidade']) ? $customerData['cidade'] : '',
            'state' => isset($customerData['estado']) ? $customerData['estado'] : '',
            'notificationDisabled' => true  // OBRIGATÓRIO conforme documentação
        ];
        
        // Adicionar telefones apenas se tiverem conteúdo válido - CORREÇÃO: evitar strings vazias
        $phone = preg_replace('/[^0-9]/', '', isset($customerData['telefone']) ? $customerData['telefone'] : '');
        $mobilePhone = preg_replace('/[^0-9]/', '', isset($customerData['whatsapp']) ? $customerData['whatsapp'] : '');
        
        if (strlen($phone) >= 10) {
            $customerDataAsaas['phone'] = $phone;
        }
        
        if (strlen($mobilePhone) >= 11) {
            $customerDataAsaas['mobilePhone'] = $mobilePhone;
        }
        
        $customer = $asaas->createCustomer($customerDataAsaas);
        error_log('Cliente criado: ' . print_r($customer, true));
    } else {
        error_log('Cliente encontrado: ' . print_r($customer, true));
    }
    
    // ========================================
    // 2. CRIAR COBRANÇA COM CARTÃO
    // ========================================
    
    $valor = floatval($pedidoData['valor_total']);
    $parcelas = isset($pedidoData['parcelas']) ? intval($pedidoData['parcelas']) : 1;
    
    // Dados da cobrança
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => $valor,
        'dueDate' => date('Y-m-d'), // Cobrança imediata
        'description' => 'Ingresso(s) - ' . (isset($pedidoData['evento_nome']) ? $pedidoData['evento_nome'] : 'Evento'),
        'externalReference' => isset($pedidoData['codigo_pedido']) ? $pedidoData['codigo_pedido'] : $pedidoData['pedidoid'],
        
        // Dados do cartão
        'creditCard' => [
            'holderName' => $cartaoData['nome'], // Nome que está no cartão (pode ser diferente do comprador)
            'number' => preg_replace('/[^0-9]/', '', $cartaoData['numero']),
            'expiryMonth' => sprintf('%02d', intval($cartaoData['mes'])), // Garantir 2 dígitos
            'expiryYear' => strval($cartaoData['ano']), // CORREÇÃO: Ano como string, não integer
            'ccv' => trim(preg_replace('/\D/', '', $cartaoData['cvv'])) // CORREÇÃO CVV: remove espaços e não-dígitos
        ],
        
        // Dados do portador do cartão
        'creditCardHolderInfo' => [
            'name' => $cartaoData['nome'], // CORREÇÃO: usar o mesmo nome que está no cartão
            'email' => isset($customerData['email']) ? $customerData['email'] : '',
            'cpfCnpj' => $cpfCnpj,
            'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
            'address' => isset($customerData['endereco']) ? $customerData['endereco'] : '',
            'addressNumber' => isset($customerData['numero']) ? $customerData['numero'] : '1',
            'addressComplement' => isset($customerData['complemento']) ? $customerData['complemento'] : '',
            'province' => isset($customerData['bairro']) ? $customerData['bairro'] : '',
            'city' => isset($customerData['cidade']) ? $customerData['cidade'] : '',
            'state' => isset($customerData['estado']) ? $customerData['estado'] : ''
            // CORREÇÃO: phone/mobilePhone removidos se vazios - incluídos condicionalmente abaixo
        ],
        
        'remoteIp' => isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : (isset($_SERVER['HTTP_CF_CONNECTING_IP']) ? $_SERVER['HTTP_CF_CONNECTING_IP'] : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : ''))
    ];
    
    // Adicionar telefones no holderInfo apenas se válidos - CORREÇÃO: evitar campos vazios
    if (isset($customerDataAsaas['phone'])) {
        $paymentData['creditCardHolderInfo']['phone'] = $customerDataAsaas['phone'];
    }
    
    if (isset($customerDataAsaas['mobilePhone'])) {
        $paymentData['creditCardHolderInfo']['mobilePhone'] = $customerDataAsaas['mobilePhone'];
    }
    
    // Se for parcelado
    if ($parcelas > 1) {
        $paymentData['installmentCount'] = $parcelas;
        $paymentData['installmentValue'] = round($valor / $parcelas, 2);
        $paymentData['totalValue'] = $valor;
    }
    
    error_log('=== DADOS DO PAGAMENTO FINAL ===');
    error_log('holderName (cartão): "' . $paymentData['creditCard']['holderName'] . '"');
    error_log('creditCardHolderInfo.name (mesmo do cartão): "' . $paymentData['creditCardHolderInfo']['name'] . '"');
    error_log('CVV enviado: "' . $paymentData['creditCard']['ccv'] . '" (tamanho: ' . strlen($paymentData['creditCard']['ccv']) . ')');
    error_log('CORREÇÃO APLICADA: holderName e creditCardHolderInfo.name agora usam o mesmo valor do campo #card-name');
    
    // Detectar bandeira para log
    $cardNumber = $paymentData['creditCard']['number'];
    if (preg_match('/^3[47]/', $cardNumber)) {
        error_log('CARTÃO DETECTADO: American Express (CVV deve ter 4 dígitos)');
        if (strlen($paymentData['creditCard']['ccv']) !== 4) {
            error_log('ERRO: CVV do Amex deve ter 4 dígitos, mas tem ' . strlen($paymentData['creditCard']['ccv']));
        }
    } else {
        error_log('CARTÃO DETECTADO: Outras bandeiras (CVV deve ter 3 dígitos)');
        if (strlen($paymentData['creditCard']['ccv']) !== 3) {
            error_log('AVISO: CVV deveria ter 3 dígitos, mas tem ' . strlen($paymentData['creditCard']['ccv']));
        }
    }
    
    error_log('Dados do pagamento: ' . print_r($paymentData, true));
    
    // DEBUG TEMPORÁRIO - VERIFICAR SE DADOS REAIS ESTÃO SENDO ENVIADOS
    error_log('=== DADOS REAIS QUE SERÃO ENVIADOS PARA API ===');
    error_log('Número real: ' . $paymentData['creditCard']['number']);
    error_log('CVV real: ' . $paymentData['creditCard']['ccv']);
    error_log('Nome real: ' . $paymentData['creditCard']['holderName']);
    error_log('Mês real: ' . $paymentData['creditCard']['expiryMonth']);
    error_log('Ano real: "' . $paymentData['creditCard']['expiryYear'] . '" (tipo: ' . gettype($paymentData['creditCard']['expiryYear']) . ')');
    error_log('CORREÇÃO APLICADA: expiryYear agora é STRING conforme API do Asaas');
    error_log('===========================================');
    
    // Log das correções aplicadas
    error_log('=== CORREÇÕES APLICADAS ===');
    error_log('CVV limpo: "' . $paymentData['creditCard']['ccv'] . '"');
    error_log('IP real: ' . $paymentData['remoteIp']);
    error_log('holderName = creditCardHolderInfo.name: ' . ($paymentData['creditCard']['holderName'] === $paymentData['creditCardHolderInfo']['name'] ? 'SIM' : 'NÃO'));
    error_log('AMBOS USANDO CAMPO DO CARTÃO: holderName="' . $paymentData['creditCard']['holderName'] . '" | holderInfo.name="' . $paymentData['creditCardHolderInfo']['name'] . '"');
    error_log('Campos telefone incluídos: phone=' . (isset($paymentData['creditCardHolderInfo']['phone']) ? 'SIM' : 'NÃO') . ', mobile=' . (isset($paymentData['creditCardHolderInfo']['mobilePhone']) ? 'SIM' : 'NÃO'));
    
    // Criar cobrança no Asaas
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    error_log('Resposta do Asaas: ' . print_r($payment, true));
    
    // ========================================
    // 3. ATUALIZAR PEDIDO NO BANCO
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
    
    // Atualizar pedido - CORREÇÃO: verificação defensiva da conexão
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
        }
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
            'netValue' => isset($payment['netValue']) ? $payment['netValue'] : $payment['value'],
            'invoiceUrl' => isset($payment['invoiceUrl']) ? $payment['invoiceUrl'] : '',
            'installmentCount' => isset($payment['installmentCount']) ? $payment['installmentCount'] : 1
        ],
        'customer' => [
            'id' => $customer['id'],
            'name' => $customer['name']
        ],
        'pedido' => [
            'codigo_pedido' => isset($pedidoData['codigo_pedido']) ? $pedidoData['codigo_pedido'] : '',
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