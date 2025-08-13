<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");
include("AsaasAPI.php");

/**
 * Mascara número do cartão para logs (ex: **** **** **** 1234)
 */
function maskCardNumber($cardNumber) {
    $cleaned = preg_replace('/[^0-9]/', '', $cardNumber);
    if (strlen($cleaned) < 4) return '****';
    return str_repeat('*', strlen($cleaned) - 4) . substr($cleaned, -4);
}

/**
 * Limpa e valida CVV removendo espaços e caracteres inválidos
 */
function cleanCvv($cvv) {
    $cleaned = preg_replace('/\D+/', '', trim($cvv));  // só dígitos, sem espaços
    return substr($cleaned, 0, 4);  // limita a 4 dígitos (Amex=4; outros=3)
}

/**
 * Remove strings vazias e campos nulos do array
 */
function filterEmptyFields($array) {
    if (!is_array($array)) {
        return $array;
    }
    
    $filtered = [];
    
    foreach ($array as $key => $value) {
        if (is_array($value)) {
            $filteredSubArray = filterEmptyFields($value);
            if (!empty($filteredSubArray)) {
                $filtered[$key] = $filteredSubArray;
            }
        } elseif ($value !== "" && $value !== null && $value !== false) {
            $filtered[$key] = $value;
        }
    }
    
    return $filtered;
}

/**
 * Captura o IP real do usuário considerando proxies/CDNs
 */
function getRealUserIP() {
    $ipHeaders = [
        'HTTP_CF_CONNECTING_IP',     // Cloudflare
        'HTTP_X_FORWARDED_FOR',      // Proxy padrão
        'HTTP_X_REAL_IP',            // Nginx
        'HTTP_X_FORWARDED',          // Proxy alternativo
        'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
        'HTTP_CLIENT_IP',            // Proxy cliente
        'REMOTE_ADDR'                // IP direto (fallback)
    ];
    
    foreach ($ipHeaders as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = explode(',', $_SERVER[$header]);
            $ip = trim($ips[0]); // Primeiro IP da lista
            
            // Validar se é um IP válido
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    // Fallback para REMOTE_ADDR mesmo se for privado
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Valida se telefone é consistente geograficamente com CEP
 */
function isPhoneGeographicallyConsistent($phone, $cep) {
    if (empty($phone) || empty($cep)) return false;
    
    $cleanPhone = preg_replace('/\D/', '', $phone);
    $cleanCep = preg_replace('/\D/', '', $cep);
    
    if (strlen($cleanPhone) < 10 || strlen($cleanCep) != 8) return false;
    
    $ddd = substr($cleanPhone, 0, 2);
    $cepPrefix = substr($cleanCep, 0, 2);
    
    // Mapeamento básico DDD vs CEP (principais regiões)
    $geographicMapping = [
        // Região Sudeste
        '11' => ['01', '02', '03', '04', '05', '06', '07', '08', '09'], // SP
        '12' => ['12'], // Vale do Paraíba SP
        '13' => ['11'], // Santos SP
        '14' => ['17', '18', '19'], // Interior SP
        '15' => ['18'], // Sorocaba SP
        '16' => ['14'], // Ribeirão Preto SP
        '17' => ['15'], // São José do Rio Preto SP
        '18' => ['19'], // Presidente Prudente SP
        '19' => ['13'], // Campinas SP
        '21' => ['20', '21', '22', '23', '24', '25', '26', '27', '28'], // RJ
        '22' => ['28'], // Norte Fluminense RJ
        '24' => ['25', '26', '27'], // Interior RJ
        '27' => ['29'], // ES
        '28' => ['29'], // Interior ES
        '31' => ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39'], // BH MG
        '32' => ['36'], // Juiz de Fora MG
        '33' => ['36'], // Governador Valadares MG
        '34' => ['38'], // Uberlândia MG
        '35' => ['37'], // Poços de Caldas MG
        '37' => ['37'], // Divinópolis MG
        '38' => ['39'], // Montes Claros MG
        
        // Região Centro-Oeste
        '61' => ['70', '71', '72', '73'], // DF
        '62' => ['74', '75', '76'], // GO
        '64' => ['77'], // Rio Verde GO
        '65' => ['78'], // Cuiabá MT
        '66' => ['78'], // Rondonópolis MT
        '67' => ['79'], // MS
        
        // Outras regiões principais...
    ];
    
    if (isset($geographicMapping[$ddd])) {
        return in_array($cepPrefix, $geographicMapping[$ddd]);
    }
    
    return false; // Se não tem mapeamento, considera inconsistente
}

/**
 * Detecta a bandeira do cartão baseado no número
 */
function detectCardBrand($cardNumber) {
    $cleaned = preg_replace('/[^0-9]/', '', $cardNumber);
    $length = strlen($cleaned);
    
    // Visa: começa com 4; comprimentos 13, 16, 19
    if (preg_match('/^4/', $cleaned) && in_array($length, [13, 16, 19])) {
        return 'visa';
    }
    
    // Mastercard: 51-55 ou 2221-2720; comprimento 16
    if ($length == 16 && (
        preg_match('/^5[1-5]/', $cleaned) || 
        preg_match('/^222[1-9]/', $cleaned) || 
        preg_match('/^22[3-9][0-9]/', $cleaned) || 
        preg_match('/^2[3-6][0-9][0-9]/', $cleaned) || 
        preg_match('/^27[0-1][0-9]/', $cleaned) || 
        preg_match('/^2720/', $cleaned)
    )) {
        return 'mastercard';
    }
    
    // American Express: começa com 34 ou 37; comprimento 15
    if (preg_match('/^3[47]/', $cleaned) && $length == 15) {
        return 'amex';
    }
    
    // Elo: prefixos específicos; comprimento 16
    if ($length == 16 && (
        preg_match('/^4011/', $cleaned) ||
        preg_match('/^431274/', $cleaned) ||
        preg_match('/^438935/', $cleaned) ||
        preg_match('/^451416/', $cleaned) ||
        preg_match('/^457393/', $cleaned) ||
        preg_match('/^504175/', $cleaned) ||
        preg_match('/^506699|^5067/', $cleaned) ||
        preg_match('/^5090/', $cleaned) ||
        preg_match('/^627780/', $cleaned) ||
        preg_match('/^636297/', $cleaned) ||
        preg_match('/^636368/', $cleaned)
    )) {
        return 'elo';
    }
    
    // Hipercard: 606282 ou 3841; comprimentos 13, 16, 19
    if ((preg_match('/^606282/', $cleaned) || preg_match('/^3841/', $cleaned)) && 
        in_array($length, [13, 16, 19])) {
        return 'hipercard';
    }
    
    // Discover: vários prefixos; comprimentos 16-19
    if (in_array($length, [16, 17, 18, 19]) && (
        preg_match('/^6011/', $cleaned) ||
        preg_match('/^622(12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[0-1][0-9]|92[0-5])/', $cleaned) ||
        preg_match('/^64[4-9]/', $cleaned) ||
        preg_match('/^65/', $cleaned)
    )) {
        return 'discover';
    }
    
    // Diners: vários prefixos; comprimento 14
    if ($length == 14 && (
        preg_match('/^30[0-5]/', $cleaned) ||
        preg_match('/^3095/', $cleaned) ||
        preg_match('/^36/', $cleaned) ||
        preg_match('/^3[8-9]/', $cleaned)
    )) {
        return 'diners';
    }
    
    // JCB: 3528-3589; comprimentos 16-19
    if (in_array($length, [16, 17, 18, 19]) && 
        preg_match('/^35(2[8-9]|[3-8][0-9])/', $cleaned)) {
        return 'jcb';
    }
    
    return 'unknown';
}

/**
 * Algoritmo de Luhn para validação de cartão
 */
function validateLuhn($cardNumber) {
    $cleaned = preg_replace('/[^0-9]/', '', $cardNumber);
    $sum = 0;
    $alternate = false;
    
    for ($i = strlen($cleaned) - 1; $i >= 0; $i--) {
        $digit = intval($cleaned[$i]);
        
        if ($alternate) {
            $digit *= 2;
            if ($digit > 9) {
                $digit = ($digit % 10) + 1;
            }
        }
        
        $sum += $digit;
        $alternate = !$alternate;
    }
    
    return ($sum % 10) == 0;
}

/**
 * Valida dados completos do cartão
 */
function validateCreditCardData($cartaoData) {
    $errors = [];
    
    // Normalizar número do cartão
    $cardNumber = preg_replace('/[^0-9]/', '', $cartaoData['numero']);
    $cardBrand = detectCardBrand($cardNumber);
    $cardLength = strlen($cardNumber);
    
    // Validar comprimento mínimo/máximo geral
    if ($cardLength < 12 || $cardLength > 19) {
        $errors[] = 'Número do cartão deve ter entre 12 e 19 dígitos';
    }
    
    // Validar comprimento específico por bandeira
    $validLengths = [
        'visa' => [13, 16, 19],
        'mastercard' => [16],
        'amex' => [15],
        'elo' => [16],
        'hipercard' => [13, 16, 19],
        'discover' => [16, 17, 18, 19],
        'diners' => [14],
        'jcb' => [16, 17, 18, 19]
    ];
    
    if ($cardBrand !== 'unknown' && isset($validLengths[$cardBrand])) {
        if (!in_array($cardLength, $validLengths[$cardBrand])) {
            $errors[] = 'Comprimento inválido para cartão ' . strtoupper($cardBrand);
        }
    }
    
    // Validar algoritmo de Luhn
    if (!validateLuhn($cardNumber)) {
        $errors[] = 'Número do cartão inválido (falhou na verificação Luhn)';
    }
    
    // Validar data de validade
    $expiryMonth = intval($cartaoData['mes']);
    $expiryYear = intval($cartaoData['ano']);
    
    if ($expiryMonth < 1 || $expiryMonth > 12) {
        $errors[] = 'Mês de validade inválido';
    }
    
    // Aceitar tanto YYYY quanto YY para o ano
    if ($expiryYear < 100) {
        $expiryYear += 2000; // Converter YY para YYYY
    }
    
    $currentYear = intval(date('Y'));
    $currentMonth = intval(date('n'));
    
    if ($expiryYear < $currentYear || ($expiryYear == $currentYear && $expiryMonth < $currentMonth)) {
        $errors[] = 'Cartão expirado';
    }
    
    // Validar CVV
    $cvv = $cartaoData['cvv'];
    $expectedCvvLength = ($cardBrand === 'amex') ? 4 : 3;
    
    if (strlen($cvv) !== $expectedCvvLength) {
        $cvvName = ($cardBrand === 'amex') ? 'CVV (4 dígitos para American Express)' : 'CVV (3 dígitos)';
        $errors[] = "Código de segurança inválido - esperado {$cvvName}";
    }
    
    // Avisos para bandeiras não reconhecidas
    if ($cardBrand === 'unknown') {
        $errors[] = 'Bandeira do cartão não reconhecida - verifique o número';
    }
    
    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'brand' => $cardBrand,
        'masked_number' => maskCardNumber($cardNumber)
    ];
}

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

// Log para debug (mascarando dados sensíveis)
$inputLog = $input;
if (isset($inputLog['cartao']['numero'])) {
    $inputLog['cartao']['numero'] = maskCardNumber($inputLog['cartao']['numero']);
}
if (isset($inputLog['cartao']['cvv'])) {
    $inputLog['cartao']['cvv'] = '***';
}
error_log('Processando pagamento cartão: ' . print_r($inputLog, true));

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
    $asaas = new AsaasAPI('production');
    
    // Extrair dados - suportar tanto 'customer' quanto 'comprador' para compatibilidade
    $pedidoData = $input['pedido'] ?? [];
    $cartaoData = $input['cartao'] ?? [];
    $customerData = $input['customer'] ?? $input['comprador'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($pedidoData) || empty($cartaoData) || empty($customerData)) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    // ========================================
    // VALIDAÇÃO COMPLETA DO CARTÃO
    // ========================================
    $cardValidation = validateCreditCardData($cartaoData);
    
    if (!$cardValidation['valid']) {
        $errorMessage = 'Dados do cartão inválidos: ' . implode('; ', $cardValidation['errors']);
        error_log('Validação cartão falhou - ' . $cardValidation['masked_number'] . ': ' . $errorMessage);
        throw new Exception($errorMessage);
    }
    
    error_log('Cartão validado com sucesso - Bandeira: ' . $cardValidation['brand'] . ', Número: ' . $cardValidation['masked_number']);
    
    // Log dos dados que serão enviados para o Asaas (mascarados)
    error_log('=== PREPARANDO DADOS PARA ASAAS ===');
    error_log('Valor: R$ ' . number_format($valor, 2, ',', '.'));
    error_log('Parcelas: ' . $parcelas);
    error_log('Bandeira detectada: ' . $cardValidation['brand']);
    error_log('Customer Data: ' . json_encode([
        'cpfCnpj' => $cpfCnpj,
        'name' => $customerData['nome_completo'],
        'email' => $customerData['email'] ?? 'N/A'
    ]));
    error_log('Card Data (masked): ' . json_encode([
        'holderName' => $cartaoData['nome'],
        'number' => $cardValidation['masked_number'],
        'expiryMonth' => $cartaoData['mes'],
        'expiryYear' => $cartaoData['ano'],
        'ccv' => '***'
    ]));
    
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
        // Limpar e validar telefones
        $phone = preg_replace('/[^0-9]/', '', $customerData['telefone'] ?? '');
        $mobilePhone = preg_replace('/[^0-9]/', '', $customerData['whatsapp'] ?? '');
        $cep = preg_replace('/[^0-9]/', '', $customerData['cep']);
        
        // Validar consistência geográfica dos telefones
        $phoneIsConsistent = isPhoneGeographicallyConsistent($phone, $cep);
        $mobileIsConsistent = isPhoneGeographicallyConsistent($mobilePhone, $cep);
        
        error_log('=== VALIDAÇÃO GEOGRÁFICA ===');
        error_log('CEP: ' . $cep);
        error_log('Phone: ' . $phone . ' (consistente: ' . ($phoneIsConsistent ? 'SIM' : 'NÃO') . ')');
        error_log('Mobile: ' . $mobilePhone . ' (consistente: ' . ($mobileIsConsistent ? 'SIM' : 'NÃO') . ')');
        
        // Criar novo cliente com validações de qualidade de dados
        $customerDataAsaas = [
            'name' => $customerData['nome_completo'],
            'cpfCnpj' => $cpfCnpj,
            'email' => $customerData['email'] ?? '',
            'postalCode' => $cep,
            'address' => $customerData['endereco'] ?? '',
            'addressNumber' => $customerData['numero'] ?? '1',
            'complement' => $customerData['complemento'] ?? '',
            'province' => $customerData['bairro'] ?? '',
            'city' => $customerData['cidade'] ?? '',
            'state' => $customerData['estado'] ?? '',
            'notificationDisabled' => true  // OBRIGATÓRIO conforme documentação
        ];
        
        // Incluir telefones somente se forem consistentes geograficamente
        if ($phoneIsConsistent && strlen($phone) >= 10) {
            $customerDataAsaas['phone'] = $phone;
        }
        
        if ($mobileIsConsistent && strlen($mobilePhone) >= 11) {
            $customerDataAsaas['mobilePhone'] = $mobilePhone;
        }
        
        // Filtrar campos vazios antes de enviar
        $customerDataAsaas = filterEmptyFields($customerDataAsaas);
        
        error_log('Customer data final (após filtros): ' . json_encode($customerDataAsaas, JSON_PRETTY_PRINT));
        
        $customer = $asaas->createCustomer($customerDataAsaas);
        error_log('=== CLIENTE CRIADO NO ASAAS ===');
        error_log('Customer ID: ' . ($customer['id'] ?? 'N/A'));
        error_log('Customer Name: ' . ($customer['name'] ?? 'N/A'));
        error_log('Response completa: ' . json_encode($customer, JSON_PRETTY_PRINT));
    } else {
        error_log('=== CLIENTE ENCONTRADO NO ASAAS ===');
        error_log('Customer ID: ' . ($customer['id'] ?? 'N/A'));
        error_log('Customer Name: ' . ($customer['name'] ?? 'N/A'));
        error_log('Response completa: ' . json_encode($customer, JSON_PRETTY_PRINT));
    }
    
    // ========================================
    // 2. CRIAR COBRANÇA COM CARTÃO
    // ========================================
    
    $valor = floatval($pedidoData['valor_total']);
    $parcelas = intval($pedidoData['parcelas'] ?? 1);
    
    // Limpar e validar CVV - CORREÇÃO CRÍTICA
    $cleanedCvv = cleanCvv($cartaoData['cvv']);
    error_log('CVV original: "' . $cartaoData['cvv'] . '" | CVV limpo: "' . $cleanedCvv . '"');
    
    // Capturar IP real do usuário - CORREÇÃO CRÍTICA 
    $realUserIP = getRealUserIP();
    error_log('IP detectado: ' . $realUserIP);
    
    // Preparar dados do portador (creditCardHolderInfo)
    $holderInfo = [
        'name' => $customerData['nome_completo'],
        'email' => $customerData['email'] ?? '',
        'cpfCnpj' => $cpfCnpj,
        'postalCode' => preg_replace('/[^0-9]/', '', $customerData['cep']),
        'address' => $customerData['endereco'] ?? '',
        'addressNumber' => $customerData['numero'] ?? '1',
        'addressComplement' => $customerData['complemento'] ?? '',
        'province' => $customerData['bairro'] ?? '',
        'city' => $customerData['cidade'] ?? '',
        'state' => $customerData['estado'] ?? ''
    ];
    
    // Incluir telefones apenas se foram validados anteriormente
    if (isset($customerDataAsaas['phone'])) {
        $holderInfo['phone'] = $customerDataAsaas['phone'];
    }
    if (isset($customerDataAsaas['mobilePhone'])) {
        $holderInfo['mobilePhone'] = $customerDataAsaas['mobilePhone'];
    }
    
    // Filtrar campos vazios do holderInfo
    $holderInfo = filterEmptyFields($holderInfo);
    
    // Dados da cobrança
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'CREDIT_CARD',
        'value' => $valor,
        'dueDate' => date('Y-m-d'), // Cobrança imediata
        'description' => 'Ingresso(s) - ' . ($pedidoData['evento_nome'] ?? 'Evento'),
        'externalReference' => $pedidoData['codigo_pedido'] ?? $pedidoData['pedidoid'],
        
        // Dados do cartão - CORRIGIDOS
        'creditCard' => [
            'holderName' => $customerData['nome_completo'], // Mesmo nome do holderInfo
            'number' => preg_replace('/[^0-9]/', '', $cartaoData['numero']),
            'expiryMonth' => $cartaoData['mes'],
            'expiryYear' => $cartaoData['ano'],
            'ccv' => $cleanedCvv  // CVV LIMPO SEM ESPAÇOS
        ],
        
        // Dados do portador do cartão - FILTRADOS
        'creditCardHolderInfo' => $holderInfo,
        
        // IP REAL DO USUÁRIO
        'remoteIp' => $realUserIP
    ];
    
    // Se for parcelado
    if ($parcelas > 1) {
        $paymentData['installmentCount'] = $parcelas;
        $paymentData['installmentValue'] = round($valor / $parcelas, 2);
        $paymentData['totalValue'] = $valor;
    }
    
    // FILTRAR STRINGS VAZIAS ANTES DO ENVIO - CORREÇÃO FINAL
    $paymentData = filterEmptyFields($paymentData);
    
    error_log('=== DADOS DO PAGAMENTO PARA ASAAS (FINAL) ===');
    error_log('Customer ID: ' . $customer['id']);
    error_log('Value: ' . $valor);
    error_log('Installments: ' . $parcelas);
    error_log('Real IP: ' . $realUserIP);
    error_log('CVV limpo: "' . $cleanedCvv . '"');
    
    // Log sem dados sensíveis
    $logPaymentData = $paymentData;
    $logPaymentData['creditCard']['number'] = maskCardNumber($logPaymentData['creditCard']['number']);
    $logPaymentData['creditCard']['ccv'] = '***';
    error_log('Payment Data (mascarado): ' . json_encode($logPaymentData, JSON_PRETTY_PRINT));
    
    // Criar cobrança no Asaas
    $payment = $asaas->createCreditCardPayment($paymentData);
    
    error_log('=== RESPOSTA DO PAGAMENTO ASAAS ===');
    error_log('Payment ID: ' . ($payment['id'] ?? 'N/A'));
    error_log('Status: ' . ($payment['status'] ?? 'N/A'));
    error_log('Value: ' . ($payment['value'] ?? 'N/A'));
    error_log('Net Value: ' . ($payment['netValue'] ?? 'N/A'));
    error_log('Invoice URL: ' . ($payment['invoiceUrl'] ?? 'N/A'));
    error_log('Resposta completa: ' . json_encode($payment, JSON_PRETTY_PRINT));
    
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