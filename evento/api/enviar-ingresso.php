<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");
include("enviar-email-confirmacao.php"); // INCLUIR funções SMTP

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

try {
    // Verificar conexão com banco
    if (!$con) {
        throw new Exception('Erro de conexão com banco de dados');
    }
    
    // Extrair dados
    $ingresso_data = $input['ingresso'] ?? [];
    $destinatario = $input['destinatario'] ?? [];
    $evento = $input['evento'] ?? [];
    $pedido = $input['pedido'] ?? [];
    $remetente = $input['remetente'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($ingresso_data['id']) || empty($destinatario['nome']) || empty($destinatario['email'])) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    // Verificar se o ingresso existe e está disponível
    $ingresso_id = intval($ingresso_data['id']);
    $sql_check = "SELECT ii.*, e.nome as evento_nome, e.data_inicio, e.nome_local, 
                  e.busca_endereco, e.cidade, e.estado 
                  FROM tb_ingressos_individuais ii
                  LEFT JOIN eventos e ON ii.eventoid = e.id
                  WHERE ii.id = ? AND ii.status = 'ativo'";
    $stmt_check = $con->prepare($sql_check);
    
    if (!$stmt_check) {
        throw new Exception('Erro ao preparar consulta: ' . $con->error);
    }
    
    $stmt_check->bind_param("i", $ingresso_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        throw new Exception('Ingresso não encontrado ou não está disponível');
    }
    
    $ingresso_db = $result_check->fetch_assoc();
    
    // ALTERAÇÃO: Usar SMTP direto em vez de webhook
    try {
        $assunto = "{$remetente['nome']} comprou um ingresso para você para o evento {$ingresso_db['evento_nome']}";
        $link_validacao = 'https://anysummit.com.br/validar-ingresso.php?h=' . $ingresso_db['hash_validacao'];
        
        $corpo_email = "
        <html>
        <head><meta charset='UTF-8'></head>
        <body style='font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px;'>
            <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                <div style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 30px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 24px;'>🎟️ Você recebeu um ingresso!</h1>
                </div>
                <div style='padding: 30px;'>
                    <h2 style='color: #333; margin-bottom: 20px;'>" . htmlspecialchars($ingresso_db['evento_nome']) . "</h2>
                    <p style='color: #666; font-size: 16px; line-height: 1.6;'>
                        Olá <strong>" . htmlspecialchars($destinatario['nome']) . "</strong>,<br><br>
                        <strong>" . htmlspecialchars($remetente['nome']) . "</strong> comprou um ingresso para você para o evento 
                        <strong>" . htmlspecialchars($ingresso_db['evento_nome']) . "</strong>.<br><br>
                        Para resgatar seu ingresso com QR CODE, clique no botão abaixo e complete o seu cadastro.
                    </p>";
                    
        if (!empty($destinatario['mensagem'])) {
            $corpo_email .= "
                    <div style='background: #f0f8ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                        <p style='margin: 0; color: #333; font-style: italic;'>
                            <strong>Mensagem pessoal:</strong><br>
                            \"" . htmlspecialchars($destinatario['mensagem']) . "\"
                        </p>
                    </div>";
        }
        
        $corpo_email .= "
                    <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <h3 style='color: #333; margin-top: 0;'>📋 Dados do Evento</h3>";
        
        if ($ingresso_db['data_inicio']) {
            $corpo_email .= "<p style='margin: 5px 0; color: #333;'><strong>📅 Data:</strong> " . date('d/m/Y H:i', strtotime($ingresso_db['data_inicio'])) . "</p>";
        }
        if ($ingresso_db['nome_local']) {
            $corpo_email .= "<p style='margin: 5px 0; color: #333;'><strong>📍 Local:</strong> " . htmlspecialchars($ingresso_db['nome_local']) . "</p>";
        }
        if ($ingresso_db['busca_endereco']) {
            $corpo_email .= "<p style='margin: 5px 0; color: #333;'><strong>🗺️ Endereço:</strong> " . htmlspecialchars($ingresso_db['busca_endereco']) . "</p>";
        }
        
        $corpo_email .= "
                        <h3 style='color: #333; margin: 20px 0 10px 0;'>🎫 Dados do Ingresso</h3>
                        <p style='margin: 5px 0; color: #333;'><strong>Código:</strong> " . htmlspecialchars($ingresso_db['codigo_ingresso']) . "</p>
                        <p style='margin: 5px 0; color: #333;'><strong>Tipo:</strong> " . htmlspecialchars($ingresso_db['titulo_ingresso']) . "</p>
                        <p style='margin: 5px 0; color: #333;'><strong>⚠️ IMPORTANTE:</strong> Este código NÃO é o QR CODE final. Você precisa completar seu cadastro para gerar o QR CODE válido.</p>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='" . $link_validacao . "' style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;'>
                            🎫 Completar Cadastro e Resgatar Ingresso
                        </a>
                    </div>
                    
                    <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <p style='margin: 0; color: #856404; font-size: 14px;'>
                            <strong>⚠️ Ação Necessária:</strong> Clique no link acima para preencher seus dados (nome, CPF, email, WhatsApp e informações adicionais) e ativar seu ingresso com QR CODE.
                        </p>
                    </div>
                    
                    <p style='color: #999; font-size: 14px; text-align: center; margin-top: 30px;'>
                        Após completar o cadastro, você receberá seu ingresso oficial com QR CODE válido.
                    </p>
                </div>
            </div>
        </body>
        </html>";
        
        // CORREÇÃO: Usar SMTP autenticado
        $smtp_host = 'mail.anysummit.com.br';
        $smtp_port = 465;
        $smtp_user = 'ingressos@anysummit.com.br';
        $smtp_pass = 'Miran@Janyne@Gustavo';
        $from_email = 'ingressos@anysummit.com.br';
        $from_name = 'AnySummit - Ingressos';
        
        $resultado_email = enviarEmailSMTP(
            $destinatario['email'], 
            $assunto, 
            $corpo_email, 
            $smtp_host, 
            $smtp_port, 
            $smtp_user, 
            $smtp_pass, 
            $from_email, 
            $from_name
        );
        
        if ($resultado_email === true) {
            error_log("Email enviado com sucesso via SMTP para: {$destinatario['email']}");
            $email_enviado = true;
        } else {
            error_log("Erro no envio de email via SMTP: " . $resultado_email);
            throw new Exception("Erro ao enviar email: " . $resultado_email);
        }
        
    } catch (Exception $e) {
        error_log("Erro ao enviar email do ingresso: " . $e->getMessage());
        throw new Exception("Erro ao enviar email: " . $e->getMessage());
    }
    
    // Registrar que foi enviado (sem alterar status)
    $sql_update = "UPDATE tb_ingressos_individuais SET 
                   transferido_para_email = ?,
                   data_transferencia = NOW(),
                   atualizado_em = NOW()
                   WHERE id = ?";
    
    $stmt_update = $con->prepare($sql_update);
    if (!$stmt_update) {
        throw new Exception('Erro ao preparar atualização: ' . $con->error);
    }
    
    $stmt_update->bind_param("si", $destinatario['email'], $ingresso_id);
    if (!$stmt_update->execute()) {
        throw new Exception('Erro ao atualizar ingresso: ' . $con->error);
    }
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Ingresso enviado com sucesso via SMTP',
        'dados' => [
            'ingresso_id' => $ingresso_id,
            'codigo_ingresso' => $ingresso_db['codigo_ingresso'],
            'destinatario_email' => $destinatario['email'],
            'metodo_envio' => 'smtp_direto',
            'link_validacao' => $link_validacao,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao enviar ingresso: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug_info' => [
            'input_received' => $input ? 'sim' : 'nao',
            'connection' => $con ? 'ok' : 'erro'
        ]
    ]);
}
?>