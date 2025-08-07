<?php
/**
 * Função para enviar email de confirmação de pagamento
 * Inclui informações completas do pedido, evento e ingressos individuais
 */

function enviarEmailConfirmacao($pedidoid, $con) {
    error_log("=== INICIO ENVIO EMAIL CONFIRMACAO - Pedido: $pedidoid ===");
    
    // Configurações SMTP
    $smtp_host = 'mail.anysummit.com.br';
    $smtp_port = 465;
    $smtp_user = 'ingressos@anysummit.com.br';
    $smtp_pass = 'Miran@Janyne@Gustavo';
    $from_email = 'ingressos@anysummit.com.br';
    $from_name = 'AnySummit - Ingressos';

    try {
        error_log("1. Iniciando busca de dados do pedido: $pedidoid");
        
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
        
        error_log("2. Pedido encontrado - Email: " . $pedido['comprador_email']);
        
        if (!$pedido['comprador_email']) {
            throw new Exception("Email do comprador não encontrado");
        }

        error_log("3. Buscando dados do evento: " . $pedido['eventoid']);
        
        // Buscar dados do evento
        $sql_evento = "SELECT e.*, c.nome_fantasia as organizador_nome, c.logomarca as organizador_logo,
                       c.email_contato as organizador_email, c.telefone as organizador_telefone
                       FROM eventos e 
                       LEFT JOIN contratantes c ON e.contratante_id = c.id 
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
        
        error_log("4. Evento encontrado: " . $evento['nome']);

        error_log("5. Buscando ingressos individuais");
        
        // Buscar ingressos individuais
        $sql_ingressos = "SELECT titulo_ingresso, codigo_ingresso, hash_validacao, status, preco_unitario
                          FROM tb_ingressos_individuais 
                          WHERE pedidoid = ? 
                          ORDER BY id";
        
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
        
        error_log("6. Ingressos encontrados: " . count($ingressos));

        if (empty($ingressos)) {
            throw new Exception("Nenhum ingresso encontrado para o pedido");
        }

        error_log("7. Gerando template HTML");
        
        // Incluir o novo template profissional
        include('template-email-novo.php');
        
        // Gerar HTML do email
        $html = gerarTemplateEmailConfirmacao($pedido, $evento, $ingressos);
        
        error_log("8. Template gerado - Tamanho: " . strlen($html) . " chars");
        
        error_log("9. Iniciando envio SMTP para: " . $pedido['comprador_email']);
        
        // Enviar email
        $assunto = "Pagamento Confirmado - " . $evento['nome'] . " - Pedido " . $pedido['codigo_pedido'];
        $resultado = enviarEmailSMTP(
            $pedido['comprador_email'], 
            $assunto, 
            $html, 
            $smtp_host, 
            $smtp_port, 
            $smtp_user, 
            $smtp_pass, 
            $from_email, 
            $from_name
        );
        
        error_log("10. Resultado SMTP: " . ($resultado === true ? "SUCCESS" : $resultado));
        
        if ($resultado === true) {
            error_log("=== EMAIL ENVIADO COM SUCESSO ===");
            return true;
        } else {
            error_log("=== ERRO NO ENVIO: " . $resultado . " ===");
            return $resultado;
        }
        
    } catch (Exception $e) {
        error_log("=== EXCECAO NO ENVIO: " . $e->getMessage() . " ===");
        return "Exceção: " . $e->getMessage();
    }
}

function enviarEmailSMTP($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
    error_log("=== INICIO ENVIO SMTP ===");
    error_log("Para: $to");
    error_log("Assunto: $subject");
    error_log("SMTP: $smtp_user@$smtp_host:$smtp_port");
    
    // MÉTODO 1: Tentar SMTP manual primeiro
    $resultado_smtp = tentarSMTPManual($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
    
    if ($resultado_smtp === true) {
        error_log("=== EMAIL ENVIADO COM SUCESSO VIA SMTP MANUAL ===");
        return true;
    }
    
    error_log("SMTP manual falhou: " . $resultado_smtp);
    error_log("Tentando fallback com mail() nativo...");
    
    // MÉTODO 2: Fallback para mail() nativo
    $headers = array();
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "From: $from_name <$from_email>";
    $headers[] = "Reply-To: $from_email";
    $headers[] = "X-Mailer: PHP/" . phpversion();
    
    $headers_string = implode("\r\n", $headers);
    
    $resultado_mail = mail($to, $subject, $html, $headers_string);
    
    if ($resultado_mail) {
        error_log("=== EMAIL ENVIADO COM SUCESSO VIA MAIL() NATIVO ===");
        return true;
    } else {
        error_log("=== FALHA EM AMBOS OS MÉTODOS ===");
        return "Falhou SMTP manual: $resultado_smtp | Falhou mail() nativo";
    }
}

function tentarSMTPManual($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
            'crypto_method' => STREAM_CRYPTO_METHOD_TLS_CLIENT
        ]
    ]);
    
    error_log("Tentando conectar em ssl://$smtp_host:$smtp_port");
    
    $connection = stream_socket_client(
        "ssl://$smtp_host:$smtp_port",
        $errno, $errstr, 30, STREAM_CLIENT_CONNECT, $context
    );
    
    if (!$connection) {
        error_log("ERRO CONEXÃO: $errstr ($errno)");
        return "Erro de conexão: $errstr ($errno)";
    }
    
    error_log("Conexão estabelecida");
    
    // Ler resposta inicial
    $response = fgets($connection, 515);
    error_log("Resposta inicial: " . trim($response));
    
    if (substr($response, 0, 3) != '220') {
        fclose($connection);
        return "Erro de conexão SMTP: $response";
    }
    
    // EHLO
    fputs($connection, "EHLO $smtp_host\r\n");
    error_log("Enviado: EHLO $smtp_host");
    
    // Ler todas as linhas da resposta EHLO
    $ehlo_response = '';
    do {
        $line = fgets($connection, 515);
        $ehlo_response .= $line;
        error_log("Linha EHLO: " . trim($line));
        
        // Verificar se é a última linha (sem hífen na posição 3)
        $continue = isset($line[3]) && $line[3] == '-';
    } while ($continue);
    
    // Verificar se EHLO foi aceito (deve começar com 250)
    $lines = explode("\n", trim($ehlo_response));
    $first_line_code = substr($lines[0], 0, 3);
    
    error_log("Código primeira linha EHLO: $first_line_code");
    
    if ($first_line_code != '250') {
        fclose($connection);
        return "Erro EHLO: $ehlo_response";
    }
    
    // AUTH LOGIN
    fputs($connection, "AUTH LOGIN\r\n");
    error_log("Enviado: AUTH LOGIN");
    
    $response = fgets($connection, 515);
    error_log("Resposta AUTH: " . trim($response));
    
    if (substr($response, 0, 3) != '334') {
        fclose($connection);
        return "Erro AUTH LOGIN: $response";
    }
    
    // Enviar usuário
    fputs($connection, base64_encode($smtp_user) . "\r\n");
    $response = fgets($connection, 515);
    error_log("Resposta usuário: " . trim($response));
    
    if (substr($response, 0, 3) != '334') {
        fclose($connection);
        return "Erro usuário: $response";
    }
    
    // Enviar senha
    fputs($connection, base64_encode($smtp_pass) . "\r\n");
    $response = fgets($connection, 515);
    error_log("Resposta senha: " . trim($response));
    
    if (substr($response, 0, 3) != '235') {
        fclose($connection);
        return "Erro de autenticação: $response";
    }
    
    error_log("Autenticação bem-sucedida!");
    
    // MAIL FROM
    fputs($connection, "MAIL FROM: <$from_email>\r\n");
    $response = fgets($connection, 515);
    error_log("MAIL FROM: " . trim($response));
    
    if (substr($response, 0, 3) != '250') {
        fclose($connection);
        return "Erro MAIL FROM: $response";
    }
    
    // RCPT TO
    fputs($connection, "RCPT TO: <$to>\r\n");
    $response = fgets($connection, 515);
    error_log("RCPT TO: " . trim($response));
    
    if (substr($response, 0, 3) != '250') {
        fclose($connection);
        return "Erro RCPT TO: $response";
    }
    
    // DATA
    fputs($connection, "DATA\r\n");
    $response = fgets($connection, 515);
    error_log("DATA: " . trim($response));
    
    if (substr($response, 0, 3) != '354') {
        fclose($connection);
        return "Erro DATA: $response";
    }
    
    // Construir email
    $headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "From: $from_name <$from_email>",
        "Reply-To: $from_email",
        "Subject: $subject"
    ];
    
    $message = implode("\r\n", $headers) . "\r\n\r\n" . $html . "\r\n.\r\n";
    
    // Enviar mensagem
    fputs($connection, $message);
    $response = fgets($connection, 515);
    error_log("Resposta envio: " . trim($response));
    
    // QUIT
    fputs($connection, "QUIT\r\n");
    fclose($connection);
    
    $sucesso = substr($response, 0, 3) == '250';
    error_log("Resultado SMTP manual: " . ($sucesso ? "SUCCESS" : "FAILED"));
    
    return $sucesso;
}
?>
