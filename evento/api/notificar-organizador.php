<?php
/**
 * Função para notificar organizador sobre nova compra
 */

// Evitar redeclaração da função
if (!function_exists('notificarOrganizadorCompra')) {

function notificarOrganizadorCompra($pedidoid, $con) {
    error_log("=== INICIO NOTIFICACAO ORGANIZADOR - Pedido: $pedidoid ===");
    
    try {
        // Buscar dados do pedido com comprador
        $sql_pedido = "SELECT p.*, c.nome as comprador_nome, c.email as comprador_email, c.celular as comprador_celular
                       FROM tb_pedidos p 
                       LEFT JOIN compradores c ON p.compradorid = c.id 
                       WHERE p.pedidoid = ?";
        
        $stmt = $con->prepare($sql_pedido);
        if (!$stmt) {
            throw new Exception("Erro ao preparar query pedido: " . $con->error);
        }
        
        $stmt->bind_param("i", $pedidoid);
        $stmt->execute();
        $pedido = $stmt->get_result()->fetch_assoc();
        
        if (!$pedido) {
            throw new Exception("Pedido não encontrado: " . $pedidoid);
        }

        // Buscar dados do evento e organizador
        $sql_evento = "SELECT e.*, c.nome_fantasia as organizador_nome, c.logomarca as organizador_logo,
                       c.email_contato as organizador_email, c.telefone as organizador_telefone,
                       u.email as usuario_email, u.nome as usuario_nome
                       FROM eventos e 
                       LEFT JOIN contratantes c ON e.contratante_id = c.id 
                       LEFT JOIN usuarios u ON e.usuario_id = u.id
                       WHERE e.id = ?";
        
        $stmt = $con->prepare($sql_evento);
        if (!$stmt) {
            throw new Exception("Erro ao preparar query evento: " . $con->error);
        }
        
        $stmt->bind_param("i", $pedido['eventoid']);
        $stmt->execute();
        $evento = $stmt->get_result()->fetch_assoc();
        
        if (!$evento) {
            throw new Exception("Evento não encontrado: " . $pedido['eventoid']);
        }

        // Email do organizador (prioridade: contratante, depois usuário)
        $email_organizador = $evento['organizador_email'] ?: $evento['usuario_email'];
        $nome_organizador = $evento['organizador_nome'] ?: $evento['usuario_nome'];
        
        if (!$email_organizador) {
            error_log("Email do organizador não encontrado para evento " . $pedido['eventoid']);
            return false;
        }

        // Buscar ingressos do pedido (sem desmembrar combos)
        $sql_ingressos = "SELECT titulo_ingresso, COUNT(*) as quantidade, preco_unitario
                          FROM tb_ingressos_individuais 
                          WHERE pedidoid = ? 
                          GROUP BY titulo_ingresso, preco_unitario
                          ORDER BY titulo_ingresso";
        
        $stmt = $con->prepare($sql_ingressos);
        if (!$stmt) {
            throw new Exception("Erro ao preparar query ingressos: " . $con->error);
        }
        
        $stmt->bind_param("i", $pedidoid);
        $stmt->execute();
        $result_ingressos = $stmt->get_result();
        
        $ingressos = [];
        while ($ingresso = $result_ingressos->fetch_assoc()) {
            $ingressos[] = $ingresso;
        }

        error_log("Enviando notificação para organizador: $email_organizador");
        
        // Gerar HTML do email para organizador
        $html = gerarTemplateNotificacaoOrganizador($pedido, $evento, $ingressos, $nome_organizador);
        
        // Configurações SMTP
        $smtp_host = 'mail.anysummit.com.br';
        $smtp_port = 465;
        $smtp_user = 'ingressos@anysummit.com.br';
        $smtp_pass = 'Miran@Janyne@Gustavo';
        $from_email = 'ingressos@anysummit.com.br';
        $from_name = 'AnySummit - Notificações';
        
        $assunto = "Nova Compra: " . $evento['nome'] . " - " . $pedido['codigo_pedido'];
        
        // Enviar email
        include('enviar-email-confirmacao.php');
        $resultado = enviarEmailSMTP(
            $email_organizador, 
            $assunto, 
            $html, 
            $smtp_host, 
            $smtp_port, 
            $smtp_user, 
            $smtp_pass, 
            $from_email, 
            $from_name
        );
        
        if ($resultado === true) {
            error_log("=== NOTIFICACAO ORGANIZADOR ENVIADA COM SUCESSO ===");
            return true;
        } else {
            error_log("=== ERRO NOTIFICACAO ORGANIZADOR: " . $resultado . " ===");
            return $resultado;
        }
        
    } catch (Exception $e) {
        error_log("=== EXCECAO NOTIFICACAO ORGANIZADOR: " . $e->getMessage() . " ===");
        return "Exceção: " . $e->getMessage();
    }
}

function gerarTemplateNotificacaoOrganizador($pedido, $evento, $ingressos, $nome_organizador) {
    // Formatar data do evento
    $data_evento = '';
    if ($evento['data_inicio']) {
        $data_evento = date('d/m/Y H:i', strtotime($evento['data_inicio']));
    }

    // Formatar data do pedido
    $data_pedido = date('d/m/Y H:i', strtotime($pedido['data_pedido']));

    // Gerar lista de ingressos HTML (sem códigos, apenas resumo)
    $ingressos_html = '';
    foreach ($ingressos as $ingresso) {
        $preco_formatado = number_format($ingresso['preco_unitario'], 2, ',', '.');
        $subtotal = number_format($ingresso['quantidade'] * $ingresso['preco_unitario'], 2, ',', '.');
        
        $ingressos_html .= '
        <div style="background: rgba(26, 26, 46, 0.9); border: 1px solid rgba(114, 94, 255, 0.3); border-radius: 16px; margin: 15px 0; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin: 0; color: #E1E5F2; font-size: 16px;">' . htmlspecialchars($ingresso['titulo_ingresso']) . '</h4>
                    <p style="margin: 5px 0 0 0; color: #8B95A7; font-size: 14px;">Quantidade: ' . $ingresso['quantidade'] . ' × R$ ' . $preco_formatado . '</p>
                </div>
                <div style="text-align: right;">
                    <span style="color: #00C2FF; font-weight: bold; font-size: 18px;">R$ ' . $subtotal . '</span>
                </div>
            </div>
        </div>';
    }

    $html = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Compra - ' . htmlspecialchars($evento['nome']) . '</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6; 
            color: #E1E5F2; 
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
            min-height: 100vh;
        }
        .email-container {
            max-width: 700px;
            margin: 0 auto;
            background: rgba(26, 26, 46, 0.9);
            border: 1px solid rgba(114, 94, 255, 0.3);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        .content {
            padding: 32px;
        }
        .section-title {
            color: #E1E5F2;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(114, 94, 255, 0.2);
        }
        .info-card {
            background: rgba(15, 15, 35, 0.6);
            border: 1px solid rgba(114, 94, 255, 0.2);
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(114, 94, 255, 0.1);
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            color: #00C2FF;
        }
        .detail-label {
            color: #8B95A7;
            font-weight: 500;
        }
        .detail-value {
            color: #E1E5F2;
            font-weight: 600;
        }
        .footer {
            background: rgba(15, 15, 35, 0.8);
            border-top: 1px solid rgba(114, 94, 255, 0.2);
            color: #8B95A7;
            padding: 24px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 class="header-title">💰 Nova Compra Realizada!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Você recebeu uma nova compra para seu evento</p>
        </div>

        <div class="content">
            <p style="color: #E1E5F2; font-size: 16px; margin-bottom: 24px;">
                Olá <strong>' . htmlspecialchars($nome_organizador) . '</strong>,
            </p>
            <p style="color: #8B95A7; margin-bottom: 32px;">
                Uma nova compra foi realizada para o evento <strong style="color: #E1E5F2;">' . htmlspecialchars($evento['nome']) . '</strong>.
            </p>

            <h3 class="section-title">📋 Detalhes da Compra</h3>
            <div class="info-card">
                <div class="detail-row">
                    <span class="detail-label">Pedido</span>
                    <span class="detail-value">' . htmlspecialchars($pedido['codigo_pedido']) . '</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Data</span>
                    <span class="detail-value">' . $data_pedido . '</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Comprador</span>
                    <span class="detail-value">' . htmlspecialchars($pedido['comprador_nome']) . '</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">E-mail</span>
                    <span class="detail-value">' . htmlspecialchars($pedido['comprador_email']) . '</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Valor Total</span>
                    <span class="detail-value">R$ ' . number_format($pedido['valor_total'], 2, ',', '.') . '</span>
                </div>
            </div>

            <h3 class="section-title">🎫 Ingressos Comprados</h3>
            ' . $ingressos_html . '

            <div style="background: rgba(0, 194, 255, 0.1); border: 1px solid rgba(0, 194, 255, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; color: #E1E5F2; font-size: 14px;">
                    <strong>ℹ️ Informação:</strong> O comprador já recebeu os vouchers por email e poderá identificar os titulares de cada ingresso antes do evento.
                </p>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0; font-size: 14px;">
                Este é um email automático de notificação.<br>
                AnySummit - Sistema de Eventos
            </p>
        </div>
    </div>
</body>
</html>';

    return $html;
}

} // Fim do if (!function_exists('notificarOrganizadorCompra'))
?>
