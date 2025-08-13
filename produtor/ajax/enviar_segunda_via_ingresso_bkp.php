<?php
/**
 * Arquivo AJAX para reenviar 2ª via do email do ingresso individual
 * Usado na tela de Ingressos Emitidos
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

include("../check_login.php");
include("../conm/conn.php");

// Verificar método de requisição
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Obter dados JSON da requisição
$input = json_decode(file_get_contents('php://input'), true);
$ingresso_id = $input['ingresso_id'] ?? 0;
$evento_id = $input['evento_id'] ?? 0;

if (!$ingresso_id || !$evento_id) {
    echo json_encode(['success' => false, 'message' => 'ID do ingresso ou evento não informado']);
    exit;
}

// Verificar se o usuário tem permissão para acessar este evento
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

try {
    // Buscar dados completos do ingresso e verificar permissões
    $sql_ingresso = "SELECT ii.*,
                            e.nome as evento_nome,
                            e.data_inicio as evento_data,
                            e.nome_local as evento_local,
                            e.usuario_id as evento_usuario_id,
                            u.nome as participante_nome,
                            u.email as participante_email,
                            c.nome as comprador_nome,
                            c.email as comprador_email,
                            p.codigo_pedido,
                            p.valor_total as pedido_valor,
                            p.status_pagamento,
                            i.preco as ingresso_preco
                     FROM tb_ingressos_individuais ii
                     LEFT JOIN eventos e ON ii.eventoid = e.id
                     LEFT JOIN usuarios u ON ii.participanteid = u.id
                     LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
                     LEFT JOIN compradores c ON p.compradorid = c.id
                     LEFT JOIN ingressos i ON ii.ingresso_id = i.id
                     WHERE ii.id = ? 
                     AND ii.eventoid = ?
                     AND e.usuario_id = ?
                     LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql_ingresso);
    if (!$stmt) {
        throw new Exception("Erro ao preparar consulta: " . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($stmt, "iii", $ingresso_id, $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $ingresso = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    if (!$ingresso) {
        echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado ou sem permissão para acesso']);
        exit;
    }
    
    // Verificar se o ingresso tem participante associado
    if (empty($ingresso['participanteid'])) {
        echo json_encode(['success' => false, 'message' => 'Este ingresso não possui participante associado']);
        exit;
    }
    
    // Gerar o subject igual ao usado na associação
    $subject = "Seu Ingresso para {$ingresso['evento_nome']}";
    
    // Definir variáveis necessárias
    $evento_titulo = $ingresso['evento_nome'];
    $participante_nome = $ingresso['participante_nome'];
    $participante_email = $ingresso['participante_email'];
    $codigo_ingresso = $ingresso['codigo_ingresso'];
    $titulo_ingresso = $ingresso['titulo_ingresso'];
    
    // Simplificar e corrigir o envio de email
    error_log("Iniciando envio de 2ª via - Ingresso ID: $ingresso_id, Email: " . $participante_email);
    
    // Usar método simplificado de email (sem anexo JPG por enquanto)
    $secret_key = "AnySummit2025@#$%ingresso";
    $timestamp = strtotime($ingresso['criado_em']);
    $hash_ingresso = hash('sha256', $secret_key . $ingresso['id'] . $timestamp);
    $link_ingresso = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/ver-ingresso-individual.php?h=" . $hash_ingresso;
    
    $corpo_email = "<!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Seu Ingresso</title>
    </head>
    <body style='font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px; margin: 0;'>
        <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
            <div style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 30px; text-align: center;'>
                <h1 style='margin: 0; font-size: 24px;'>🎟️ Segunda Via do Seu Ingresso</h1>
            </div>
            <div style='padding: 30px;'>
                <h2 style='color: #333; margin-bottom: 20px;'>" . htmlspecialchars($evento_titulo) . "</h2>
                <p style='color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                    Olá <strong>" . htmlspecialchars($participante_nome) . "</strong>,<br><br>
                    Conforme solicitado, aqui está a segunda via do seu ingresso.
                </p>
                
                <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00C2FF;'>
                    <p style='margin: 0 0 10px 0; color: #333; font-size: 16px;'><strong>Código:</strong> " . htmlspecialchars($codigo_ingresso) . "</p>
                    <p style='margin: 0; color: #333; font-size: 16px;'><strong>Tipo:</strong> " . htmlspecialchars($titulo_ingresso) . "</p>
                </div>
                
                <!-- BOTÃO CENTRALIZADO E BEM VISÍVEL -->
                <div style='text-align: center; margin: 40px 0; padding: 20px;'>
                    <a href='" . $link_ingresso . "' 
                       style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); 
                              color: white !important; 
                              padding: 18px 40px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              font-size: 18px;
                              display: inline-block;
                              text-align: center;
                              min-width: 200px;'>
                        🎫 Ver Meu Ingresso
                    </a>
                </div>
                
                <div style='background: #fff3cd; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;'>
                    <p style='margin: 0; color: #856404; font-size: 14px;'>
                        <strong>📱 Dica:</strong> Salve este link ou tire uma foto do QR Code para facilitar o acesso no evento.
                    </p>
                </div>
                
                <p style='color: #999; font-size: 14px; text-align: center; margin-top: 30px;'>
                    Apresente este ingresso (impresso ou digital) na entrada do evento.<br>
                    <strong>AnySummit</strong> - Sua plataforma de eventos
                </p>
            </div>
        </div>
    </body>
    </html>";
    
    // Headers simplificados
    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: AnySummit <ingressos@anysummit.com.br>',
        'Reply-To: ingressos@anysummit.com.br'
    );
    
    // Tentar envio com headers em formato de string
    $headers_string = implode("\r\n", $headers) . "\r\n";
    
    error_log("Tentando enviar email - Para: $participante_email, Subject: $subject");
    
    // Enviar o email
    $email_enviado = mail($participante_email, $subject, $corpo_email, $headers_string);
    
    if (!$email_enviado) {
        // Tentar método alternativo
        error_log("Primeira tentativa falhou, tentando método alternativo");
        
        // Headers mais simples
        $headers_simples = "From: ingressos@anysummit.com.br\r\nContent-Type: text/html; charset=UTF-8\r\n";
        $email_enviado = mail($participante_email, $subject, $corpo_email, $headers_simples);
        
        if (!$email_enviado) {
            // Última tentativa com texto simples
            error_log("Segunda tentativa falhou, tentando email em texto simples");
            
            $corpo_simples = "Segunda Via do Ingresso\n\n";
            $corpo_simples .= "Evento: " . $evento_titulo . "\n";
            $corpo_simples .= "Participante: " . $participante_nome . "\n";
            $corpo_simples .= "Código: " . $codigo_ingresso . "\n";
            $corpo_simples .= "Tipo: " . $titulo_ingresso . "\n\n";
            $corpo_simples .= "Link do ingresso: " . $link_ingresso . "\n\n";
            $corpo_simples .= "Apresente este ingresso na entrada do evento.";
            
            $email_enviado = mail($participante_email, $subject, $corpo_simples);
            
            if (!$email_enviado) {
                // Tentar via API como última opção
                error_log("Todas tentativas mail() falharam, tentando via API");
                
                $dados_api = [
                    'email' => $participante_email,
                    'subject' => $subject,
                    'body' => $corpo_email,
                    'from' => 'ingressos@anysummit.com.br',
                    'type' => 'html'
                ];
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, 'https://' . $_SERVER['HTTP_HOST'] . '/api/send-email.php');
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados_api));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                
                $response = curl_exec($ch);
                $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                if ($response && $http_code == 200) {
                    $result = json_decode($response, true);
                    if ($result && $result['success']) {
                        $email_enviado = true;
                        error_log("Email enviado via API com sucesso");
                    }
                }
            }
        }
    }
    
    if ($email_enviado) {
        // Log do envio
        error_log("2ª Via de ingresso enviada com SUCESSO - ID: " . $ingresso_id . " - Código: " . $codigo_ingresso . " - Email: " . $participante_email);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Segunda via enviada com sucesso para ' . $participante_email
        ]);
    } else {
        // Log detalhado do erro
        $error_details = error_get_last();
        error_log("FALHA no envio de email - ID: $ingresso_id - Email: $participante_email - PHP Error: " . json_encode($error_details));
        
        throw new Exception("Falha ao enviar email - Verifique configurações SMTP do servidor");
    }
    
} catch (Exception $e) {
    error_log("Erro ao enviar 2ª via do ingresso - ID: $ingresso_id - Erro: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Erro interno: ' . $e->getMessage()
    ]);
}
?>