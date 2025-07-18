<?php
// Webhook do Asaas para receber notificações de pagamento
header('Content-Type: application/json');

include("../conm/conn.php");
include("AsaasAPI.php");

// Log da requisição para debug
$input = file_get_contents('php://input');
$headers = getallheaders();

error_log("Webhook Asaas recebido: " . $input);
error_log("Headers: " . print_r($headers, true));

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Decodificar dados
$webhookData = json_decode($input, true);

if (!$webhookData) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

try {
    // Verificar se é evento de pagamento
    if (!isset($webhookData['event']) || !isset($webhookData['payment'])) {
        throw new Exception('Dados do webhook inválidos');
    }
    
    $event = $webhookData['event'];
    $paymentData = $webhookData['payment'];
    $paymentId = $paymentData['id'];
    
    error_log("Evento: $event - Payment ID: $paymentId");
    
    // Buscar pedido no banco pelo payment_id
    $sql = "SELECT * FROM tb_pedidos WHERE asaas_payment_id = '$paymentId'";
    $result = $con->query($sql);
    
    if ($result->num_rows == 0) {
        error_log("Pedido não encontrado para payment_id: $paymentId");
        http_response_code(404);
        echo json_encode(['error' => 'Pedido não encontrado']);
        exit;
    }
    
    $pedido = $result->fetch_assoc();
    $pedidoid = $pedido['pedidoid'];
    
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
            echo json_encode(['status' => 'ignored']);
            exit;
    }
    
    // Atualizar status no banco
    if (!empty($novoStatus) && $pedido['status_pagamento'] !== $novoStatus) {
        $updateSql = "UPDATE tb_pedidos SET 
                      status_pagamento = '$novoStatus',
                      updated_at = NOW()
                      WHERE pedidoid = $pedidoid";
        
        if ($con->query($updateSql)) {
            error_log("Status atualizado para pedido $pedidoid: $novoStatus");
            
            // Se foi aprovado, executar ações adicionais
            if ($novoStatus === 'aprovado') {
                processarPagamentoAprovado($pedidoid, $pedido, $con);
            }
            
        } else {
            error_log("Erro ao atualizar pedido: " . $con->error);
            throw new Exception("Erro ao atualizar status do pedido");
        }
    }
    
    echo json_encode(['status' => 'success', 'pedido_id' => $pedidoid]);
    
} catch (Exception $e) {
    error_log('Erro no webhook: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function processarPagamentoAprovado($pedidoid, $pedido, $con) {
    // Aqui você pode adicionar lógica para:
    
    // 1. Enviar email de confirmação
    // enviarEmailConfirmacao($pedido);
    
    // 2. Gerar QR codes dos ingressos
    // gerarIngressos($pedidoid);
    
    // 3. Notificar o organizador do evento
    // notificarOrganizador($pedido['eventoid']);
    
    // 4. Atualizar estatísticas
    // atualizarEstatisticas($pedido['eventoid']);
    
    error_log("Processamento pós-aprovação executado para pedido $pedidoid");
}
?>
