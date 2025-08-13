<?php
// Webhook do Asaas para receber notificações de pagamento
header('Content-Type: application/json');

// Token de segurança
define('WEBHOOK_TOKEN', 'Miran@Janyne@Gustavo');

// Log inicial da requisição
$input = file_get_contents('php://input');
$headers = getallheaders();

error_log("=== WEBHOOK ASAAS RECEBIDO ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Headers: " . print_r($headers, true));
error_log("Body: " . $input);
error_log("===============================");

// Verificar método
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Resposta para testes GET
    echo json_encode([
        'status' => 'webhook_active',
        'message' => 'AnySummit Webhook está funcionando',
        'timestamp' => date('Y-m-d H:i:s'),
        'method' => 'GET'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed', 'allowed' => 'POST']);
    exit;
}

// Verificar token de segurança
$received_token = '';

// O ASAAS envia o token no header conforme documentação
if (isset($headers['asaas-access-token'])) {
    $received_token = $headers['asaas-access-token'];
} elseif (isset($headers['Asaas-Access-Token'])) {
    $received_token = $headers['Asaas-Access-Token'];
} elseif (isset($headers['Authorization'])) {
    // Verificar se é Bearer token
    $auth = $headers['Authorization'];
    if (strpos($auth, 'Bearer ') === 0) {
        $received_token = substr($auth, 7);
    }
} elseif (isset($headers['X-Webhook-Token'])) {
    // Fallback para header customizado
    $received_token = $headers['X-Webhook-Token'];
} elseif (isset($_GET['token'])) {
    // Token via query string como último recurso (para testes)
    $received_token = $_GET['token'];
}

// Validar token apenas se configurado (permitir teste sem token também)
if (!empty(WEBHOOK_TOKEN)) {
    if ($received_token !== WEBHOOK_TOKEN) {
        error_log("Token inválido recebido: '$received_token' (esperado: '" . WEBHOOK_TOKEN . "')");
        error_log("Headers disponíveis: " . print_r(array_keys($headers), true));
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Invalid token', 'received_token' => $received_token]);
        exit;
    }
    error_log("Token validado com sucesso");
} else {
    error_log("Webhook funcionando sem validação de token (token não configurado)");
}

// Incluir dependências
try {
    include_once("../conm/conn.php");
    include_once("AsaasAPI.php");
    
    // Verificar se existem antes de incluir
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

// Decodificar dados
$webhookData = json_decode($input, true);

if (!$webhookData) {
    error_log("JSON inválido recebido");
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

try {
    // Verificar se é evento de pagamento
    if (!isset($webhookData['event']) || !isset($webhookData['payment'])) {
        throw new Exception('Dados do webhook inválidos - event ou payment não encontrados');
    }
    
    $event = $webhookData['event'];
    $paymentData = $webhookData['payment'];
    $paymentId = $paymentData['id'];
    
    error_log("Processando evento: $event - Payment ID: $paymentId");
    
    // Buscar pedido no banco pelo payment_id
    $sql = "SELECT * FROM tb_pedidos WHERE asaas_payment_id = ?";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("s", $paymentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        error_log("Pedido não encontrado para payment_id: $paymentId");
        // Não retornar 404, o ASAAS pode enviar webhooks para pagamentos que não são nossos
        echo json_encode(['status' => 'ignored', 'reason' => 'payment_not_found']);
        exit;
    }
    
    $pedido = $result->fetch_assoc();
    $pedidoid = $pedido['pedidoid'];
    
    error_log("Pedido encontrado: ID $pedidoid, Status atual: " . $pedido['status_pagamento']);
    
    // Processar diferentes tipos de eventos
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
    
    // Atualizar status no banco se mudou
    if (!empty($novoStatus) && $pedido['status_pagamento'] !== $novoStatus) {
        $updateSql = "UPDATE tb_pedidos SET 
                      status_pagamento = ?,
                      updated_at = NOW()
                      WHERE pedidoid = ?";
        
        $stmt = $con->prepare($updateSql);
        $stmt->bind_param("si", $novoStatus, $pedidoid);
        
        if ($stmt->execute()) {
            error_log("Status atualizado para pedido $pedidoid: {$pedido['status_pagamento']} -> $novoStatus");
            
            // Se foi aprovado, executar ações adicionais
            if ($novoStatus === 'aprovado') {
                processarPagamentoAprovado($pedidoid, $pedido, $con);
            }
            
        } else {
            error_log("Erro ao atualizar pedido: " . $con->error);
            throw new Exception("Erro ao atualizar status do pedido");
        }
    } else {
        error_log("Status não alterado (já era '$novoStatus' ou status vazio)");
    }
    
    echo json_encode([
        'status' => 'success', 
        'pedido_id' => $pedidoid,
        'event' => $event,
        'old_status' => $pedido['status_pagamento'],
        'new_status' => $novoStatus,
        'updated' => ($pedido['status_pagamento'] !== $novoStatus)
    ]);
    
} catch (Exception $e) {
    error_log('Erro no webhook: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function processarPagamentoAprovado($pedidoid, $pedido, $con) {
    error_log("Iniciando processamento pós-aprovação para pedido: $pedidoid");
    
    // 1. Enviar email de confirmação
    try {
        if (function_exists('enviarEmailConfirmacao')) {
            $email_enviado = enviarEmailConfirmacao($pedidoid, $con);
            if ($email_enviado) {
                error_log("Email de confirmação enviado com sucesso para pedido: $pedidoid");
            } else {
                error_log("Falha ao enviar email de confirmação para pedido: $pedidoid");
            }
        } else {
            error_log("Função enviarEmailConfirmacao não disponível");
        }
    } catch (Exception $e) {
        error_log("Erro ao enviar email de confirmação: " . $e->getMessage());
    }
    
    // 2. Notificar o organizador do evento
    try {
        if (function_exists('notificarOrganizadorCompra')) {
            $notificacao_enviada = notificarOrganizadorCompra($pedidoid, $con);
            if ($notificacao_enviada === true) {
                error_log("Notificação do organizador enviada com sucesso para pedido: $pedidoid");
            } else {
                error_log("Falha ao enviar notificação do organizador para pedido: $pedidoid - " . $notificacao_enviada);
            }
        } else {
            error_log("Função notificarOrganizadorCompra não disponível");
        }
    } catch (Exception $e) {
        error_log("Erro ao enviar notificação do organizador: " . $e->getMessage());
    }
    
    error_log("Processamento pós-aprovação executado para pedido $pedidoid");
}
?>