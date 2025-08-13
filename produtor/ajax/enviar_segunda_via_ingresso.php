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

// Função SMTP correta (igual aos outros arquivos que funcionam)
function enviarEmailSMTPLocaweb($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
    // Headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: $from_name <$from_email>",
        "Reply-To: $from_email"
    ];
    
    // Conectar via socket SSL SMTP (Locaweb usa SSL direto na porta 465)
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    
    $socket = stream_socket_client("ssl://$smtp_host:$smtp_port", $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        error_log("Erro SMTP Locaweb: $errstr ($errno)");
        return false;
    }
    
    // Função helper para enviar comando SMTP
    $smtp_response = function($expected = null) use ($socket) {
        $response = '';
        do {
            $line = fgets($socket, 512);
            $response .= $line;
            error_log("SMTP Response: $line");
            
            // Verificar se é a última linha (não tem hífen após o código)
            if (preg_match('/^\d{3} /', $line)) {
                break; // Última linha
            }
        } while (!feof($socket));
        
        if ($expected && strpos($response, $expected) === false) {
            error_log("Erro SMTP Locaweb: Esperado '$expected', recebido '$response'");
            return false;
        }
        return $response;
    };
    
    try {
        // Handshake SMTP
        $smtp_response('220');
        fputs($socket, "EHLO " . ($_SERVER['HTTP_HOST'] ?? 'anysummit.com.br') . "\r\n");
        $smtp_response('250');
        
        // Autenticação
        fputs($socket, "AUTH LOGIN\r\n");
        $smtp_response('334');
        fputs($socket, base64_encode($smtp_user) . "\r\n");
        $smtp_response('334');
        fputs($socket, base64_encode($smtp_pass) . "\r\n");
        $auth_resp = $smtp_response('235');
        
        if (strpos($auth_resp, '235') === false) {
            error_log("Falha na autenticação SMTP Locaweb");
            fclose($socket);
            return false;
        }
        
        // Enviar email
        fputs($socket, "MAIL FROM: <$from_email>\r\n");
        $smtp_response('250');
        fputs($socket, "RCPT TO: <$to>\r\n");
        $smtp_response('250');
        fputs($socket, "DATA\r\n");
        $smtp_response('354');
        
        // Conteúdo do email (formato corrigido igual ao teste)
        $assunto_codificado = "=?UTF-8?B?" . base64_encode($subject) . "?=";
        fputs($socket, "Subject: $assunto_codificado\r\n");
        fputs($socket, "From: $from_name <$from_email>\r\n");
        fputs($socket, "Content-Type: text/html; charset=UTF-8\r\n\r\n");
        fputs($socket, $html . "\r\n.\r\n");
        $smtp_response('250');
        
        // Fechar conexão
        fputs($socket, "QUIT\r\n");
        fclose($socket);
        
        error_log("Email enviado com sucesso via Locaweb para: $to");
        return true;
        
    } catch (Exception $e) {
        error_log("Erro no envio SMTP Locaweb: " . $e->getMessage());
        if (isset($socket) && is_resource($socket)) {
            fclose($socket);
        }
        return false;
    }
}

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
    
    // Configurações SMTP corretas (iguais aos outros arquivos)
    $smtp_host = 'mail.anysummit.com.br';
    $smtp_port = 465;
    $smtp_user = 'ingressos@anysummit.com.br';
    $smtp_pass = 'Miran@Janyne@Gustavo';
    $from_email = 'ingressos@anysummit.com.br';
    $from_name = 'AnySummit - Ingressos';
    
    // Gerar o subject igual ao usado na associação
    $subject = "Seu Ingresso para {$ingresso['evento_nome']}";
    
    // Definir variáveis necessárias
    $evento_titulo = $ingresso['evento_nome'];
    $participante_nome = $ingresso['participante_nome'];
    $participante_email = $ingresso['participante_email'];
    $codigo_ingresso = $ingresso['codigo_ingresso'];
    $titulo_ingresso = $ingresso['titulo_ingresso'];
    
    // Gerar link do ingresso
    $secret_key = "AnySummit2025@#$%ingresso";
    $timestamp = strtotime($ingresso['criado_em']);
    $hash_ingresso = hash('sha256', $secret_key . $ingresso['id'] . $timestamp);
    $link_ingresso = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/ver-ingresso-individual.php?h=" . $hash_ingresso;
    
    // Template HTML do email
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
                    Conforme solicitado, segue a segunda via do seu ingresso:
                </p>
                
                <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #ddd;'>
                    <div style='text-align: center;'>
                        <div style='font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px;'>" . htmlspecialchars($titulo_ingresso) . "</div>
                        <div style='font-size: 24px; font-weight: bold; color: #007bff; font-family: monospace; background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #007bff;'>" . htmlspecialchars($codigo_ingresso) . "</div>
                    </div>
                </div>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='" . $link_ingresso . "' style='display: inline-block; background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;'>
                        🎫 Visualizar Ingresso Completo
                    </a>
                </div>
                
                <div style='background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;'>
                    <strong>📱 Importante:</strong> Apresente este ingresso (impresso ou digital) na entrada do evento.
                </div>
                
                <p style='color: #666; font-size: 14px; margin-top: 30px;'>
                    Em caso de dúvidas, entre em contato conosco.<br>
                    Atenciosamente,<br>
                    <strong>Equipe AnySummit</strong>
                </p>
            </div>
        </div>
    </body>
    </html>";
    
    // Log do envio
    error_log("Iniciando envio de 2ª via - Ingresso ID: $ingresso_id, Email: " . $participante_email);
    
    // Enviar email usando SMTP correto
    $email_enviado = enviarEmailSMTPLocaweb(
        $participante_email,
        $subject,
        $corpo_email,
        $smtp_host,
        $smtp_port,
        $smtp_user,
        $smtp_pass,
        $from_email,
        $from_name
    );
    
    if ($email_enviado) {
        error_log("✅ Segunda via enviada com sucesso - Ingresso ID: $ingresso_id, Email: " . $participante_email);
        
        echo json_encode([
            'success' => true,
            'message' => 'Segunda via do ingresso enviada com sucesso!'
        ]);
    } else {
        error_log("❌ Falha ao enviar segunda via - Ingresso ID: $ingresso_id, Email: " . $participante_email);
        
        echo json_encode([
            'success' => false,
            'message' => 'Falha ao enviar email - Verifique os logs do servidor'
        ]);
    }

} catch (Exception $e) {
    error_log("Erro ao enviar 2ª via do ingresso - ID: $ingresso_id - Erro: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno: ' . $e->getMessage()
    ]);
}
?>