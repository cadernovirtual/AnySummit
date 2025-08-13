<?php
session_start();
include_once("conm/conn.php");
include_once("api/enviar-email-confirmacao.php");
include_once("api/notificar-organizador.php");

// Verificar se existe sessão válida ou se foi passado um pedido_id válido
$acesso_autorizado = false;
$pedido_id = null;

// Prioridade 1: pedido_id via GET (redirecionamento de pagamento)
if (isset($_GET['pedido_id']) && !empty($_GET['pedido_id'])) {
    $pedido_id = $_GET['pedido_id'];
    $acesso_autorizado = true;
} 
// Prioridade 2: sessão de checkout válida
elseif (isset($_SESSION['checkout_session'])) {
    // Buscar pedido pela sessão (implementar se necessário)
    $pedido_id = 'PED_20250702_6864a82e402dd'; // Fallback para teste
    $acesso_autorizado = true;
} 
// Fallback para teste/desenvolvimento
else {
    $pedido_id = 'PED_20250702_6864a82e402dd'; // Para teste
    $acesso_autorizado = true; // Comentar em produção
}

// Em produção, descomente esta verificação:
/*
if (!$acesso_autorizado) {
    header('Location: /');
    exit;
}
*/

// Buscar dados do pedido
$pedido_data = null;
$itens_pedido = [];
$ingressos_individuais = [];
$evento_data = null;

try {
    // Query para buscar o pedido com dados do comprador
    $sql_pedido = "SELECT p.*, c.nome as comprador_nome_completo, c.email as comprador_email, 
                   c.celular as comprador_celular, c.cpf as comprador_cpf, c.telefone as comprador_telefone
                   FROM tb_pedidos p LEFT JOIN compradores c ON p.compradorid = c.id 
                   WHERE p.codigo_pedido = ? OR p.asaas_payment_id = ? LIMIT 1";
    
    $stmt_pedido = $con->prepare($sql_pedido);
    if (!$stmt_pedido) {
        throw new Exception("Erro ao preparar query do pedido: " . $con->error);
    }
    
    $stmt_pedido->bind_param("ss", $pedido_id, $pedido_id);
    $stmt_pedido->execute();
    $result_pedido = $stmt_pedido->get_result();
    
    if ($result_pedido->num_rows > 0) {
        $pedido_data = $result_pedido->fetch_assoc();
        
        // IMPORTANTE: Verificar se o pedido foi realmente pago
        if ($pedido_data['status_pagamento'] !== 'pago' && $pedido_data['status_pagamento'] !== 'aprovado') {
            // Log da tentativa de acesso
            error_log("Tentativa de acesso a pedido não pago: " . $pedido_id . " - Status: " . $pedido_data['status_pagamento']);
            
            // Buscar slug do evento para redirecionar
            $redirect_url = '/';
            if ($pedido_data['eventoid']) {
                $sql_evento_redirect = "SELECT slug FROM eventos WHERE id = ? LIMIT 1";
                $stmt_evento_redirect = $con->prepare($sql_evento_redirect);
                if ($stmt_evento_redirect) {
                    $stmt_evento_redirect->bind_param("i", $pedido_data['eventoid']);
                    $stmt_evento_redirect->execute();
                    $result_evento_redirect = $stmt_evento_redirect->get_result();
                    if ($result_evento_redirect->num_rows > 0) {
                        $evento_redirect = $result_evento_redirect->fetch_assoc();
                        $redirect_url = '/evento/' . $evento_redirect['slug'];
                    }
                }
            }
            
            // Redirecionar para a página do evento
            header('Location: ' . $redirect_url . '?status=payment_pending');
            exit;
        }
        
        // CORREÇÃO: REMOVIDO - Não enviar emails duplicados aqui
        // Os emails de confirmação e notificação já foram enviados quando o pagamento foi processado
        // Esta página é apenas para mostrar o resultado e permitir ações nos ingressos
        
        // Buscar itens do pedido
        $sql_itens = "SELECT ip.*, i.titulo as ingresso_titulo, i.descricao as ingresso_descricao, i.tipo as ingresso_tipo
                      FROM tb_itens_pedido ip LEFT JOIN ingressos i ON ip.ingresso_id = i.id 
                      WHERE ip.pedidoid = ?";
        
        $stmt_itens = $con->prepare($sql_itens);
        if (!$stmt_itens) {
            throw new Exception("Erro ao preparar query dos itens: " . $con->error);
        }
        
        $stmt_itens->bind_param("i", $pedido_data['pedidoid']);
        $stmt_itens->execute();
        $result_itens = $stmt_itens->get_result();
        
        while ($item = $result_itens->fetch_assoc()) {
            $itens_pedido[] = $item;
        }
        
        // Buscar dados do evento, incluindo campos adicionais
        $evento_data = null;
        if ($pedido_data['eventoid']) {
            $sql_evento = "SELECT id, nome, slug, data_inicio, nome_local, cidade, estado, imagem_capa, 
                          campos_adicionais_participante 
                          FROM eventos WHERE id = ? LIMIT 1";
            $stmt_evento = $con->prepare($sql_evento);
            if ($stmt_evento) {
                $stmt_evento->bind_param("i", $pedido_data['eventoid']);
                $stmt_evento->execute();
                $result_evento = $stmt_evento->get_result();
                if ($result_evento->num_rows > 0) {
                    $evento_data = $result_evento->fetch_assoc();
                    // Decodificar campos adicionais JSON
                    if ($evento_data['campos_adicionais_participante']) {
                        $evento_data['campos_adicionais'] = json_decode($evento_data['campos_adicionais_participante'], true);
                    } else {
                        $evento_data['campos_adicionais'] = [];
                    }
                }
            }
        }
        
        // Buscar ingressos individuais
        $sql_ingressos = "SELECT 
            ii.id, ii.codigo_ingresso, ii.titulo_ingresso, ii.preco_unitario, ii.status,
            ii.participanteid, ii.participante_nome, ii.participante_email, ii.participante_documento,
            ii.data_vinculacao, ii.utilizado, ii.data_utilizacao, ii.hash_validacao
            FROM tb_ingressos_individuais ii 
            WHERE ii.pedidoid = ? 
            ORDER BY ii.id";
        
        $stmt_ingressos = $con->prepare($sql_ingressos);
        if (!$stmt_ingressos) {
            throw new Exception("Erro ao preparar query dos ingressos individuais: " . $con->error);
        }
        
        $stmt_ingressos->bind_param("i", $pedido_data['pedidoid']);
        $stmt_ingressos->execute();
        $result_ingressos = $stmt_ingressos->get_result();
        
        while ($ingresso = $result_ingressos->fetch_assoc()) {
            $ingressos_individuais[] = $ingresso;
        }
    }
} catch (Exception $e) {
    error_log("Erro ao buscar dados do pedido: " . $e->getMessage());
}

// Limpar sessão de checkout após sucesso
unset($_SESSION['checkout_session']);
unset($_SESSION['checkout_start_time']);
?>