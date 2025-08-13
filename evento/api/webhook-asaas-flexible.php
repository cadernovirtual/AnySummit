<?php
// Webhook do Asaas - Versão com validação flexível
header('Content-Type: application/json');

// Token de segurança (pode ser vazio para testes)
define('WEBHOOK_TOKEN', 'Miran@Janyne@Gustavo');

// Log inicial da requisição
$input = file_get_contents('php://input');
$headers = getallheaders();

error_log("=== WEBHOOK ASAAS RECEBIDO ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Headers: " . print_r($headers, true));
error_log("Body: " . $input);
error_log("Query: " . print_r($_GET, true));
error_log("===============================");

// Verificar método
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Resposta para testes GET
    echo json_encode([
        'status' => 'webhook_active',
        'message' => 'AnySummit Webhook está funcionando',
        'timestamp' => date('Y-m-d H:i:s'),
        'method' => 'GET',
        'token_required' => !empty(WEBHOOK_TOKEN),
        'available_headers' => array_keys($headers)
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed', 'allowed' => 'POST']);
    exit;
}

// Verificar token de segurança conforme documentação ASAAS
$received_token = '';
$token_source = '';

// Verificar diferentes formatos de token que o ASAAS pode enviar
$possible_headers = [
    'asaas-access-token',
    'Asaas-Access-Token', 
    'ASAAS-ACCESS-TOKEN',
    'x-asaas-access-token',
    'X-Asaas-Access-Token'
];

foreach ($possible_headers as $header) {
    if (isset($headers[$header])) {
        $received_token = $headers[$header];
        $token_source = $header;
        break;
    }
}

// Fallbacks adicionais
if (empty($received_token)) {
    if (isset($headers['Authorization'])) {
        $auth = $headers['Authorization'];
        if (strpos($auth, 'Bearer ') === 0) {
            $received_token = substr($auth, 7);
            $token_source = 'Authorization Bearer';
        }
    } elseif (isset($headers['X-Webhook-Token'])) {
        $received_token = $headers['X-Webhook-Token'];
        $token_source = 'X-Webhook-Token';
    } elseif (isset($_GET['token'])) {
        $received_token = $_GET['token'];
        $token_source = 'Query String';
    }
}

error_log("Token recebido: '$received_token' via: '$token_source'");

// Validar token apenas se configurado
if (!empty(WEBHOOK_TOKEN)) {
    if ($received_token !== WEBHOOK_TOKEN) {
        error_log("Token inválido! Esperado: '" . WEBHOOK_TOKEN . "', Recebido: '$received_token'");
        error_log("Headers disponíveis: " . implode(', ', array_keys($headers)));
        
        http_response_code(401);
        echo json_encode([
            'error' => 'Unauthorized - Invalid token', 
            'received_token' => $received_token,
            'token_source' => $token_source,
            'available_headers' => array_keys($headers)
        ]);
        exit;
    }
    error_log("Token validado com sucesso via: $token_source");
} else {
    error_log("Webhook funcionando sem validação de token (para testes)");
}

// Incluir dependências com tratamento de erro
try {
    include_once("../conm/conn.php");
    include_once("AsaasAPI.php");
    
    if (file_exists("enviar-email-confirmacao.php")) {
        include_once("enviar-email-confirmacao.php");
    }
    if (file_exists("notificar-organizador.php")) {
        include_once("notificar-organizador.php");
    }
} catch (Exception $e) {
    error_log("Erro ao incluir dependências: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error - Dependencies']);
    exit;
}

// Decodificar dados do webhook
$webhookData = json_decode($input, true);

if (!$webhookData) {
    error_log("JSON inválido recebido");
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

try {
    // Verificar estrutura do webhook
    if (!isset($webhookData['event']) || !isset($webhookData['payment'])) {
        throw new Exception('Dados do webhook inválidos - event ou payment não encontrados');
    }
    
    $event = $webhookData['event'];
    $paymentData = $webhookData['payment'];
    $paymentId = $paymentData['id'];
    
    error_log("Processando evento: $event - Payment ID: $paymentId");
    
    // Buscar pedido no banco
    $sql = "SELECT * FROM tb_pedidos WHERE asaas_payment_id = ?";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("s", $paymentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        error_log("Pedido não encontrado para payment_id: $paymentId");
        // Retornar sucesso para não causar reenvios do ASAAS
        echo json_encode(['status' => 'ignored', 'reason' => 'payment_not_found']);
        exit;
    }
    
    $pedido = $result->fetch_assoc();
    $pedidoid = $pedido['pedidoid'];
    
    error_log("Pedido encontrado: ID $pedidoid, Status atual: " . $pedido['status_pagamento']);
    
    // Mapear eventos para status internos
    $novoStatus = '';
    switch ($event) {
        case 'PAYMENT_CONFIRMED':
        case 'PAYMENT_RECEIVED':
            $novoStatus = 'aprovado';
            break;
        case 'PAYMENT_OVERDUE':
            $novoStatus = 'vencido';
            break;
        case 'PAYMENT_DELETED':
        case 'PAYMENT_CANCELLED':
            $novoStatus = 'cancelado';
            break;
        case 'PAYMENT_REFUNDED':
            $novoStatus = 'estornado';
            break;
        default:
            error_log("Evento não processado: $event");
            echo json_encode(['status' => 'ignored', 'reason' => 'event_not_handled']);
            exit;
    }
    
    // Atualizar status se mudou
    if (!empty($novoStatus) && $pedido['status_pagamento'] !== $novoStatus) {
        $updateSql = "UPDATE tb_pedidos SET 
                      status_pagamento = ?,
                      updated_at = NOW()
                      WHERE pedidoid = ?";
        
        $stmt = $con->prepare($updateSql);
        $stmt->bind_param("si", $novoStatus, $pedidoid);
        
        if ($stmt->execute()) {
            error_log("Status atualizado: Pedido $pedidoid: {$pedido['status_pagamento']} -> $novoStatus");
            
            // Processar ações pós-aprovação
            if ($novoStatus === 'aprovado') {
                processarPagamentoAprovado($pedidoid, $pedido, $con);
            }
            
        } else {
            error_log("Erro ao atualizar pedido: " . $con->error);
            throw new Exception("Erro ao atualizar status do pedido");
        }
    } else {
        error_log("Status não alterado (já era '$novoStatus')");
    }
    
    // Resposta de sucesso
    echo json_encode([
        'status' => 'success', 
        'pedido_id' => $pedidoid,
        'event' => $event,
        'old_status' => $pedido['status_pagamento'],
        'new_status' => $novoStatus,
        'updated' => ($pedido['status_pagamento'] !== $novoStatus),
        'token_source' => $token_source
    ]);
    
} catch (Exception $e) {
    error_log('Erro no webhook: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function processarPagamentoAprovado($pedidoid, $pedido, $con) {
    error_log("=== PROCESSANDO PAGAMENTO APROVADO ===");
    error_log("Pedido ID: $pedidoid");
    
    // 1. Enviar email de confirmação
    try {
        if (function_exists('enviarEmailConfirmacao')) {
            $email_enviado = enviarEmailConfirmacao($pedidoid, $con);
            error_log("Email confirmação: " . ($email_enviado ? 'Enviado' : 'Falhou'));
        } else {
            error_log("Função enviarEmailConfirmacao não disponível");
        }
    } catch (Exception $e) {
        error_log("Erro ao enviar email: " . $e->getMessage());
    }
    
    // 2. Notificar organizador
    try {
        if (function_exists('notificarOrganizadorCompra')) {
            $notificacao = notificarOrganizadorCompra($pedidoid, $con);
            error_log("Notificação organizador: " . ($notificacao === true ? 'Enviada' : 'Falhou'));
        } else {
            error_log("Função notificarOrganizadorCompra não disponível");
        }
    } catch (Exception $e) {
        error_log("Erro ao notificar organizador: " . $e->getMessage());
    }
    
    error_log("=== FIM PROCESSAMENTO APROVAÇÃO ===");
}
?>