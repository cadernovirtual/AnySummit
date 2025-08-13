<?php
/**
 * Arquivo AJAX para reenviar 2ª via do email de confirmação de pagamento
 * Rota: /produtor/ajax/enviar-segunda-via.php?id={pedido_id}
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

include("../check_login.php");
include("../conm/conn.php");

// Verificar se foi informado o ID do pedido
$pedido_id = $_GET['id'] ?? 0;

if (!$pedido_id) {
    echo json_encode(['success' => false, 'message' => 'ID do pedido não informado']);
    exit;
}

// Verificar se o usuário tem permissão para acessar este pedido
$contratante_id = $_COOKIE['contratanteid'] ?? 0;

try {
    // Buscar dados completos do pedido
    $sql_pedido = "SELECT p.*, 
                          c.nome as comprador_nome,
                          c.email as comprador_email,
                          c.celular as comprador_celular,
                          c.cpf as comprador_cpf,
                          e.nome as evento_nome,
                          e.data_inicio as evento_data,
                          e.nome_local as evento_local,
                          e.contratante_id
                   FROM tb_pedidos p
                   LEFT JOIN compradores c ON p.compradorid = c.id
                   LEFT JOIN eventos e ON p.eventoid = e.id
                   WHERE p.pedidoid = ? 
                   AND e.contratante_id = ?
                   AND p.status_pagamento = 'pago'
                   LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql_pedido);
    if (!$stmt) {
        throw new Exception("Erro ao preparar consulta: " . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($stmt, "ii", $pedido_id, $contratante_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $pedido = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    if (!$pedido) {
        echo json_encode(['success' => false, 'message' => 'Pedido não encontrado ou sem permissão para acesso']);
        exit;
    }
    
    // Verificar se realmente está aprovado
    if ($pedido['status_pagamento'] !== 'pago') {
        echo json_encode(['success' => false, 'message' => 'Apenas pedidos pagos podem ter o email reenviado']);
        exit;
    }
    
    // Buscar itens do pedido para o email
    $sql_itens = "SELECT pi.*, 
                         i.titulo as ingresso_titulo,
                         i.preco as ingresso_preco
                  FROM pedido_itens pi
                  LEFT JOIN ingressos i ON pi.ingresso_id = i.id
                  WHERE pi.pedido_id = ?
                  ORDER BY pi.id";
    
    $stmt_itens = mysqli_prepare($con, $sql_itens);
    mysqli_stmt_bind_param($stmt_itens, "i", $pedido_id);
    mysqli_stmt_execute($stmt_itens);
    $result_itens = mysqli_stmt_get_result($stmt_itens);
    $itens = mysqli_fetch_all($result_itens, MYSQLI_ASSOC);
    mysqli_stmt_close($stmt_itens);
    
    // Montar o assunto do email idêntico ao original
    $assunto = "Pagamento Confirmado - " . $pedido['evento_nome'] . " - Pedido " . $pedido['codigo_pedido'];
    
    // Montar o corpo do email idêntico ao original
    $data_evento = new DateTime($pedido['evento_data']);
    $data_pedido = new DateTime($pedido['created_at']);
    
    $corpo_email = "
    <!DOCTYPE html>
    <html lang='pt-BR'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Pagamento Confirmado</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);'>
            
            <!-- Header -->
            <div style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 30px; text-align: center;'>
                <h1 style='margin: 0; font-size: 28px; font-weight: bold;'>✅ Pagamento Confirmado!</h1>
                <p style='margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;'>Seu pedido foi processado com sucesso</p>
            </div>
            
            <!-- Content -->
            <div style='padding: 30px;'>
                
                <!-- Saudação -->
                <h2 style='color: #333; margin-bottom: 20px;'>Olá, " . htmlspecialchars($pedido['comprador_nome']) . "!</h2>
                
                <p style='margin-bottom: 25px; font-size: 16px;'>
                    Seu pagamento foi <strong style='color: #00C851;'>confirmado com sucesso</strong>! 
                    Agora você pode acessar seus ingressos e se preparar para o evento.
                </p>
                
                <!-- Info do Evento -->
                <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #725EFF;'>
                    <h3 style='color: #725EFF; margin: 0 0 15px 0; font-size: 20px;'>🎉 " . htmlspecialchars($pedido['evento_nome']) . "</h3>
                    <p style='margin: 5px 0; color: #666;'><strong>📅 Data:</strong> " . $data_evento->format('d/m/Y H:i') . "</p>
                    <p style='margin: 5px 0; color: #666;'><strong>📍 Local:</strong> " . htmlspecialchars($pedido['evento_local']) . "</p>
                </div>
                
                <!-- Info do Pedido -->
                <div style='background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #00C851;'>
                    <h3 style='color: #00C851; margin: 0 0 15px 0; font-size: 18px;'>💰 Detalhes do Pagamento</h3>
                    <p style='margin: 5px 0; color: #666;'><strong>Pedido:</strong> " . htmlspecialchars($pedido['codigo_pedido']) . "</p>
                    <p style='margin: 5px 0; color: #666;'><strong>Valor Total:</strong> R$ " . number_format($pedido['valor_total'], 2, ',', '.') . "</p>
                    <p style='margin: 5px 0; color: #666;'><strong>Forma de Pagamento:</strong> " . ucfirst($pedido['metodo_pagamento']) . "</p>
                    <p style='margin: 5px 0; color: #666;'><strong>Data do Pedido:</strong> " . $data_pedido->format('d/m/Y H:i') . "</p>
                </div>";
    
    // Adicionar itens do pedido
    if (!empty($itens)) {
        $corpo_email .= "
                <!-- Itens do Pedido -->
                <div style='margin-bottom: 25px;'>
                    <h3 style='color: #333; margin-bottom: 15px; font-size: 18px;'>🎫 Seus Ingressos</h3>
                    <div style='background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;'>";
        
        foreach ($itens as $item) {
            $corpo_email .= "
                        <div style='padding: 15px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;'>
                            <div>
                                <strong style='color: #333;'>" . htmlspecialchars($item['ingresso_titulo']) . "</strong><br>
                                <small style='color: #666;'>Quantidade: " . $item['quantidade'] . "</small>
                            </div>
                            <div style='text-align: right;'>
                                <strong style='color: #00C851; font-size: 16px;'>R$ " . number_format($item['preco_unitario'], 2, ',', '.') . "</strong>
                            </div>
                        </div>";
        }
        
        $corpo_email .= "
                    </div>
                </div>";
    }
    
    $corpo_email .= "
                <!-- Próximos Passos -->
                <div style='background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;'>
                    <h3 style='color: #856404; margin: 0 0 15px 0; font-size: 18px;'>📋 Próximos Passos</h3>
                    <ol style='margin: 0; padding-left: 20px; color: #856404;'>
                        <li style='margin-bottom: 8px;'>Seus ingressos serão enviados em breve por email</li>
                        <li style='margin-bottom: 8px;'>Guarde bem os ingressos (digitais ou impressos)</li>
                        <li style='margin-bottom: 8px;'>Apresente o ingresso na entrada do evento</li>
                        <li>Chegue com antecedência para evitar filas</li>
                    </ol>
                </div>
                
                <!-- Mensagem Final -->
                <div style='text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;'>
                    <h3 style='color: #333; margin-bottom: 15px;'>🎊 Estamos ansiosos para te ver no evento!</h3>
                    <p style='color: #666; margin: 0;'>
                        Em caso de dúvidas, entre em contato conosco.<br>
                        <strong>AnySummit</strong> - Sua plataforma de eventos
                    </p>
                </div>
                
            </div>
            
            <!-- Footer -->
            <div style='background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;'>
                <p style='margin: 0; color: #666; font-size: 12px;'>
                    Este é um email automático, não responda esta mensagem.<br>
                    © " . date('Y') . " AnySummit - Todos os direitos reservados.
                </p>
            </div>
            
        </div>
    </body>
    </html>";
    
    // Configurar headers do email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: AnySummit <noreply@anysummit.com.br>" . "\r\n";
    $headers .= "Reply-To: noreply@anysummit.com.br" . "\r\n";
    
    // Enviar o email
    $email_enviado = mail($pedido['comprador_email'], $assunto, $corpo_email, $headers);
    
    if ($email_enviado) {
        // Log do reenvio
        error_log("2ª Via de email enviada - Pedido: " . $pedido['codigo_pedido'] . " - Email: " . $pedido['comprador_email']);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Email reenviado com sucesso para ' . $pedido['comprador_email']
        ]);
    } else {
        throw new Exception("Falha ao enviar email");
    }
    
} catch (Exception $e) {
    error_log("Erro ao reenviar 2ª via - Pedido ID: $pedido_id - Erro: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Erro interno: ' . $e->getMessage()
    ]);
}
?>