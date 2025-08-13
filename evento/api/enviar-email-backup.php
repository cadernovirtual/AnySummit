<?php
/**
 * API de backup para envio direto de email quando webhook falha
 * CORREÇÃO: Agora usa SMTP autenticado como os outros emails que funcionam
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");
include("enviar-email-confirmacao.php"); // INCLUIR funções SMTP que funcionam

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
    
    // Extrair dados obrigatórios
    $hash_validacao = $input['hash_validacao'] ?? '';
    $destinatario_nome = trim($input['destinatario_nome'] ?? '');
    $destinatario_email = trim($input['destinatario_email'] ?? '');
    $mensagem_personalizada = trim($input['mensagem'] ?? '');
    $remetente_nome = trim($input['remetente_nome'] ?? '');
    
    // Validar dados obrigatórios
    if (empty($hash_validacao) || empty($destinatario_nome) || empty($destinatario_email)) {
        throw new Exception('Hash, nome e email do destinatário são obrigatórios');
    }
    
    // Buscar dados do ingresso pelo hash
    $sql_ingresso = "SELECT 
        ii.*,
        e.nome as evento_nome, 
        e.data_inicio, 
        e.nome_local, 
        e.cidade, 
        e.estado
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        WHERE ii.hash_validacao = ? 
        AND ii.hash_validacao IS NOT NULL 
        AND ii.hash_validacao != ''
        LIMIT 1";
    
    $stmt = $con->prepare($sql_ingresso);
    if (!$stmt) {
        throw new Exception('Erro ao preparar consulta: ' . $con->error);
    }
    
    $stmt->bind_param("s", $hash_validacao);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Ingresso não encontrado');
    }
    
    $ingresso = $result->fetch_assoc();
    
    // Preparar dados do email
    $evento_nome = $ingresso['evento_nome'];
    $codigo_ingresso = $ingresso['codigo_ingresso'];
    $data_evento = '';
    if ($ingresso['data_inicio']) {
        $data_evento = date('d/m/Y H:i', strtotime($ingresso['data_inicio']));
    }
    $local_evento = $ingresso['nome_local'] . ', ' . $ingresso['cidade'] . ' - ' . $ingresso['estado'];
    
    // Link de validação para o destinatário
    $link_validacao = 'https://anysummit.com.br/validar-ingresso.php?h=' . $hash_validacao;
    
    // Assunto do email
    $assunto = "Você recebeu um ingresso para " . $evento_nome;
    
    // Corpo do email
    $corpo_email = "
    <html>
    <head><meta charset='UTF-8'></head>
    <body style='font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
            <div style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 30px; text-align: center;'>
                <h1 style='margin: 0; font-size: 24px;'>🎟️ Você recebeu um ingresso!</h1>
            </div>
            <div style='padding: 30px;'>
                <h2 style='color: #333; margin-bottom: 20px;'>" . htmlspecialchars($evento_nome) . "</h2>
                
                <p style='color: #666; font-size: 16px; line-height: 1.6;'>
                    Olá <strong>" . htmlspecialchars($destinatario_nome) . "</strong>,<br><br>
                    " . (!empty($remetente_nome) ? 
                        "<strong>" . htmlspecialchars($remetente_nome) . "</strong> enviou um ingresso para você!" : 
                        "Você recebeu um ingresso!") . "
                </p>";
                
    if (!empty($mensagem_personalizada)) {
        $corpo_email .= "
                <div style='background: #f0f8ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                    <p style='margin: 0; color: #333; font-style: italic;'>
                        \"" . htmlspecialchars($mensagem_personalizada) . "\"
                    </p>
                </div>";
    }
    
    $corpo_email .= "
                <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <h3 style='margin: 0 0 10px 0; color: #333;'>Detalhes do Ingresso:</h3>
                    <p style='margin: 5px 0; color: #333;'><strong>Código:</strong> " . htmlspecialchars($codigo_ingresso) . "</p>
                    <p style='margin: 5px 0; color: #333;'><strong>Tipo:</strong> " . htmlspecialchars($ingresso['titulo_ingresso']) . "</p>";
                    
    if ($data_evento) {
        $corpo_email .= "<p style='margin: 5px 0; color: #333;'><strong>Data:</strong> " . $data_evento . "</p>";
    }
    
    $corpo_email .= "<p style='margin: 5px 0; color: #333;'><strong>Local:</strong> " . htmlspecialchars($local_evento) . "</p>
                </div>
                
                <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                    <h4 style='margin: 0 0 10px 0; color: #856404;'>📋 Próximos Passos:</h4>
                    <ol style='margin: 0; color: #856404; line-height: 1.6;'>
                        <li>Clique no botão abaixo para acessar seu ingresso</li>
                        <li>Preencha seus dados pessoais para ativar o ingresso</li>
                        <li>Após a ativação, você poderá visualizar e imprimir seu ingresso oficial</li>
                        <li>Apresente o ingresso (impresso ou digital) na entrada do evento</li>
                    </ol>
                </div>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='" . $link_validacao . "' style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;'>
                        🎫 Acessar Meu Ingresso
                    </a>
                </div>
                
                <div style='background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                    <p style='margin: 0; color: #155724; font-size: 14px;'>
                        <strong>🔒 Importante:</strong> Este link é pessoal e intransferível. 
                        Após preencher seus dados, o ingresso será vinculado definitivamente ao seu nome.
                    </p>
                </div>
                
                <p style='color: #999; font-size: 14px; text-align: center; margin-top: 30px;'>
                    Caso tenha dificuldades, entre em contato com: suporte@anysummit.com
                </p>
            </div>
        </div>
    </body>
    </html>";
    
    // CORREÇÃO: Usar SMTP autenticado como os emails que funcionam
    $smtp_host = 'mail.anysummit.com.br';
    $smtp_port = 465;
    $smtp_user = 'ingressos@anysummit.com.br';
    $smtp_pass = 'Miran@Janyne@Gustavo';
    $from_email = 'ingressos@anysummit.com.br';
    $from_name = 'AnySummit - Ingressos';
    
    error_log("Enviando email via SMTP autenticado para: $destinatario_email");
    
    // Enviar email usando a mesma função que funciona
    $resultado = enviarEmailSMTP(
        $destinatario_email, 
        $assunto, 
        $corpo_email, 
        $smtp_host, 
        $smtp_port, 
        $smtp_user, 
        $smtp_pass, 
        $from_email, 
        $from_name
    );
    
    if ($resultado !== true) {
        throw new Exception('Falha ao enviar email: ' . $resultado);
    }
    
    // Log do envio
    error_log("Email de ingresso enviado com sucesso via SMTP autenticado - Destinatário: $destinatario_email - Hash: " . substr($hash_validacao, 0, 10) . "...");
    
    // Atualizar registro no banco para indicar que foi enviado
    $sql_update = "UPDATE tb_ingressos_individuais SET 
                   transferido_para_email = ?,
                   data_transferencia = NOW(),
                   atualizado_em = NOW()
                   WHERE hash_validacao = ?";
    
    $stmt_update = $con->prepare($sql_update);
    if ($stmt_update) {
        $stmt_update->bind_param("ss", $destinatario_email, $hash_validacao);
        $stmt_update->execute();
    }
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Email enviado com sucesso via SMTP autenticado',
        'dados' => [
            'destinatario_email' => $destinatario_email,
            'codigo_ingresso' => $codigo_ingresso,
            'evento_nome' => $evento_nome,
            'link_validacao' => $link_validacao,
            'metodo_envio' => 'smtp_autenticado',
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro na API backup de envio de email: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug_info' => [
            'input_received' => $input ? 'sim' : 'nao',
            'connection' => $con ? 'ok' : 'erro',
            'metodo_tentado' => 'smtp_autenticado'
        ]
    ]);
}
?>