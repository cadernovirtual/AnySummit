<?php
// Reenvio de email com template correto
header('Content-Type: application/json; charset=utf-8');

// Evitar qualquer output anterior
ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Método inválido']);
        exit;
    }
    
    $pedido_id = intval($_POST['pedido_id'] ?? 0);
    if (!$pedido_id) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
        exit;
    }
    
    // Include mínimo
    require_once("../conm/conn.php");
    
    if (!$con) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Sem conexão']);
        exit;
    }
    
    // Buscar dados completos do pedido e evento
    $sql = "SELECT p.pedidoid, p.codigo_pedido, p.status_pagamento, p.valor_total, p.metodo_pagamento, p.created_at as data_pedido, p.asaas_payment_id,
                   c.nome as comprador_nome, c.email as comprador_email, 
                   e.nome as nome, e.data_inicio, e.nome_local, e.cidade, e.estado, e.imagem_capa, 
                   e.nome_produtor as organizador_nome, '' as organizador_email, '' as organizador_telefone, '' as organizador_logo
            FROM tb_pedidos p
            LEFT JOIN compradores c ON p.compradorid = c.id
            LEFT JOIN eventos e ON p.eventoid = e.id
            WHERE p.pedidoid = $pedido_id AND p.status_pagamento = 'aprovado'";
    
    $result = mysqli_query($con, $sql);
    
    if (!$result) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Erro SQL: ' . mysqli_error($con)]);
        exit;
    }
    
    $pedido = mysqli_fetch_assoc($result);
    
    if (!$pedido) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Pedido não encontrado ou não aprovado']);
        exit;
    }
    
    // Buscar ingressos do pedido
    $sql_ingressos = "SELECT ii.hash_validacao, ii.titulo_ingresso, ii.codigo_ingresso
                      FROM tb_ingressos_individuais ii
                      WHERE ii.pedidoid = $pedido_id";
    
    $result_ingressos = mysqli_query($con, $sql_ingressos);
    $ingressos = [];
    
    if ($result_ingressos) {
        while ($row = mysqli_fetch_assoc($result_ingressos)) {
            $ingressos[] = $row;
        }
    }
    
    // Preparar dados do email
    $to = $pedido['comprador_email'];
    $subject = "Segunda via da sua compra - " . $pedido['nome'] . " - Pedido " . $pedido['codigo_pedido'];
    
    // Incluir o template correto
    include("../../evento/api/template-email-novo.php");
    
    // Gerar o HTML usando a função do template
    $html_body = gerarTemplateEmailConfirmacao($pedido, $pedido, $ingressos);
    
    // Headers do email
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: AnySummit - Ingressos <ingressos@anysummit.com.br>\r\n";
    $headers .= "Reply-To: ingressos@anysummit.com.br\r\n";
    $headers .= "X-Mailer: AnySummit v1.0\r\n";
    
    // Tentar enviar o email
    $mail_sent = mail($to, $subject, $html_body, $headers);
    
    ob_end_clean();
    
    if ($mail_sent) {
        echo json_encode([
            'success' => true, 
            'message' => 'Segunda via enviada com sucesso para ' . $pedido['comprador_email'],
            'debug' => [
                'pedido' => $pedido['codigo_pedido'],
                'email' => $pedido['comprador_email'],
                'evento' => $pedido['nome'],
                'ingressos_count' => count($ingressos),
                'template' => 'template-email-novo.php'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Erro ao enviar email. Verifique as configurações do servidor SMTP.',
            'debug' => [
                'to' => $to,
                'subject' => $subject,
                'last_error' => error_get_last()
            ]
        ]);
    }
    
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
} catch (Error $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>