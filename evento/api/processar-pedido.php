<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");

// Função para enviar email de boas-vindas
function enviarEmailBoasVindas($email, $nome) {
    $to = $email;
    $subject = "Bem-vindo à Any Summit! 🎉";
    
    // Gerar token para criação de senha
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Salvar token no banco (você precisará criar esta tabela)
    global $con;
    $email_escaped = mysqli_real_escape_string($con, $email);
    $token_escaped = mysqli_real_escape_string($con, $token);
    
    // Criar tabela se não existir
    $create_table = "CREATE TABLE IF NOT EXISTS password_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_token (token)
    )";
    $con->query($create_table);
    
    // Inserir token
    $insert_token = "INSERT INTO password_tokens (email, token, expires_at) 
                     VALUES ('$email_escaped', '$token_escaped', '$expires')";
    $con->query($insert_token);
    
    // URL para criação de senha
    $senha_url = "https://" . $_SERVER['HTTP_HOST'] . "/evento/criar-senha.php?token=" . $token;
    
    // Template do email
    $html = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo à Any Summit</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #e91e63;
                padding-bottom: 20px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #e91e63;
                margin-bottom: 10px;
            }
            .welcome-text {
                font-size: 18px;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                background: linear-gradient(135deg, #e91e63, #9c27b0);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
                transition: transform 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
            .features {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .feature {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .feature-icon {
                background: #e91e63;
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Any Summit</div>
                <div style="color: #666;">Sua plataforma de eventos</div>
            </div>
            
            <h1 style="color: #e91e63; text-align: center;">🎉 Bem-vindo(a), ' . htmlspecialchars($nome) . '!</h1>
            
            <div class="welcome-text">
                <p>Que alegria ter você conosco! Sua conta na Any Summit foi criada com sucesso.</p>
                
                <p>Para começar a aproveitar todos os recursos da nossa plataforma, você precisa criar sua senha de acesso:</p>
            </div>
            
            <div style="text-align: center;">
                <a href="' . $senha_url . '" class="btn">🔐 Criar Minha Senha</a>
            </div>
            
            <div class="features">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">O que você pode fazer na Any Summit:</h3>
                
                <div class="feature">
                    <div class="feature-icon">🎫</div>
                    <div>Gerenciar seus ingressos em um só lugar</div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📧</div>
                    <div>Receber atualizações importantes dos eventos</div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div>Acessar informações dos eventos facilmente</div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">💳</div>
                    <div>Histórico completo de suas compras</div>
                </div>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <strong>⏰ Importante:</strong> Este link é válido por 24 horas. Após esse período, você precisará solicitar um novo link de criação de senha.
            </div>
            
            <div class="footer">
                <p>Se você não solicitou esta conta, pode ignorar este email.</p>
                <p>Precisa de ajuda? Entre em contato conosco: <a href="mailto:suporte@anysummit.com">suporte@anysummit.com</a></p>
                <p>&copy; ' . date('Y') . ' Any Summit. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>';
    
    // ========================================
    // OPÇÃO 1: ANYSUMMIT SMTP (Configurado)
    // ========================================
    // Configurações SMTP do AnySummit
    $smtp_host = 'mail.anysummit.com.br';         // Servidor SMTP
    $smtp_port = 465;                             // Porta SSL
    $smtp_user = 'ingressos@anysummit.com.br';    // Email SMTP
    $smtp_pass = 'Miran@Janyne@Gustavo';          // Senha SMTP
    $from_email = 'ingressos@anysummit.com.br';   // Email remetente
    $from_name = 'Any Summit';
    
    return enviarEmailSMTPLocaweb($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
    
    // ========================================
    // OPÇÃO 2: GMAIL SMTP (Alternativa)
    // ========================================
    // Descomente este bloco para usar Gmail SMTP como alternativa
    /*
    // Configurações SMTP do Gmail
    $smtp_host = 'smtp.gmail.com';
    $smtp_port = 587;
    $smtp_user = 'seuemail@gmail.com';        // SEU EMAIL AQUI
    $smtp_pass = 'suasenhaapp';               // SUA SENHA DE APP AQUI
    $from_email = 'seuemail@gmail.com';       // SEU EMAIL AQUI
    $from_name = 'Any Summit';
    
    return enviarEmailSMTP($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name);
    */
    
    // ========================================
    // OPÇÃO 3: SENDGRID API (Profissional)
    // ========================================
    // Descomente este bloco para usar SendGrid
    /*
    $sendgrid_api_key = 'SG.sua_api_key_aqui';  // SUA API KEY DO SENDGRID AQUI
    return enviarEmailSendGrid($to, $subject, $html, $sendgrid_api_key);
    */
    
    // ========================================
    // OPÇÃO 4: PHP MAIL() - Básica (DESABILITADA)
    // ========================================
    /*
    // Headers do email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Any Summit <noreply@anysummit.com>" . "\r\n";
    $headers .= "Reply-To: suporte@anysummit.com" . "\r\n";
    
    // Enviar email usando PHP mail() básico
    return mail($to, $subject, $html, $headers);
    */
}

// ========================================
// FUNÇÃO PARA ENVIO VIA SMTP LOCAWEB (SSL)
// ========================================
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

// ========================================
// FUNÇÃO PARA ENVIO VIA SMTP (Gmail, Outlook, etc.)
// ========================================
function enviarEmailSMTP($to, $subject, $html, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name) {
    // Headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: $from_name <$from_email>",
        "Reply-To: $from_email"
    ];
    
    // Conectar via socket SMTP
    $socket = fsockopen($smtp_host, $smtp_port, $errno, $errstr, 10);
    if (!$socket) {
        error_log("Erro SMTP: $errstr ($errno)");
        return false;
    }
    
    // Função helper para enviar comando SMTP
    $smtp_response = function($expected = null) use ($socket) {
        $response = fgets($socket, 512);
        if ($expected && strpos($response, $expected) !== 0) {
            error_log("Erro SMTP: $response");
            return false;
        }
        return $response;
    };
    
    try {
        // Handshake SMTP
        $smtp_response('220');
        fputs($socket, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
        $smtp_response('250');
        
        // Iniciar TLS
        fputs($socket, "STARTTLS\r\n");
        $smtp_response('220');
        
        // Upgrade para TLS
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new Exception("Falha ao habilitar TLS");
        }
        
        // Novo handshake após TLS
        fputs($socket, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
        $smtp_response('250');
        
        // Autenticação
        fputs($socket, "AUTH LOGIN\r\n");
        $smtp_response('334');
        fputs($socket, base64_encode($smtp_user) . "\r\n");
        $smtp_response('334');
        fputs($socket, base64_encode($smtp_pass) . "\r\n");
        $smtp_response('235');
        
        // Enviar email
        fputs($socket, "MAIL FROM: <$from_email>\r\n");
        $smtp_response('250');
        fputs($socket, "RCPT TO: <$to>\r\n");
        $smtp_response('250');
        fputs($socket, "DATA\r\n");
        $smtp_response('354');
        
        // Conteúdo do email
        fputs($socket, "Subject: $subject\r\n");
        fputs($socket, implode("\r\n", $headers) . "\r\n\r\n");
        fputs($socket, $html . "\r\n.\r\n");
        $smtp_response('250');
        
        // Fechar conexão
        fputs($socket, "QUIT\r\n");
        fclose($socket);
        
        return true;
        
    } catch (Exception $e) {
        error_log("Erro no envio SMTP: " . $e->getMessage());
        fclose($socket);
        return false;
    }
}

// ========================================
// FUNÇÃO PARA ENVIO VIA SENDGRID API
// ========================================
function enviarEmailSendGrid($to, $subject, $html, $api_key) {
    $data = [
        'personalizations' => [[
            'to' => [['email' => $to]],
            'subject' => $subject
        ]],
        'from' => [
            'email' => 'noreply@anysummit.com',
            'name' => 'Any Summit'
        ],
        'content' => [[
            'type' => 'text/html',
            'value' => $html
        ]]
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.sendgrid.com/v3/mail/send');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $api_key,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $http_code >= 200 && $http_code < 300;
}

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

// Log para debug
error_log('Processando pedido: ' . print_r($input, true));

try {
    // Iniciar transação
    $con->autocommit(false);
    
    // Extrair dados
    $carrinho = $input['carrinho'] ?? [];
    $participante = $input['participante'] ?? [];
    $comprador = $input['comprador'] ?? [];
    $pagamento = $input['pagamento'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($carrinho) || empty($participante) || empty($comprador) || empty($pagamento)) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    $eventoid = $carrinho['evento']['id'] ?? 0;
    if (!$eventoid) {
        throw new Exception('Evento não identificado');
    }
    
    // ========================================
    // 1. PROCESSAR PARTICIPANTE
    // ========================================
    $participanteid = null;
    
    if ($participante['metodo_dados'] === 'logged') {
        // Usar participante logado
        $participanteid = intval($participante['participante_id']);
        
    } else if ($participante['metodo_dados'] === 'login') {
        // Buscar participante pelo email do login
        $email = mysqli_real_escape_string($con, $participante['email']);
        $sql = "SELECT participanteid FROM participantes WHERE email = '$email'";
        $result = $con->query($sql);
        if ($result->num_rows > 0) {
            $participanteid = $result->fetch_assoc()['participanteid'];
        } else {
            throw new Exception('Participante não encontrado após login');
        }
        
    } else {
        // Cadastrar novo participante ou buscar existente
        $nome = mysqli_real_escape_string($con, $participante['nome'] . ' ' . $participante['sobrenome']);
        $email = mysqli_real_escape_string($con, $participante['email']);
        $whatsapp = mysqli_real_escape_string($con, $participante['whatsapp']);
        
        // Primeiro, tentar buscar participante existente
        $check_sql = "SELECT participanteid FROM participantes WHERE email = '$email' LIMIT 1";
        $check_result = $con->query($check_sql);
        
        if ($check_result && $check_result->num_rows > 0) {
            // Participante já existe
            $participanteid = $check_result->fetch_assoc()['participanteid'];
        } else {
            // Tentar criar novo participante
            $insert_sql = "INSERT INTO participantes (Nome, email, celular, eventoid) 
                          VALUES ('$nome', '$email', '$whatsapp', $eventoid)";
            
            if ($con->query($insert_sql)) {
                $participanteid = $con->insert_id;
            } else {
                // Se deu erro, pode ser que alguém criou entre nossa verificação e inserção
                // Tentar buscar novamente
                $check_result2 = $con->query($check_sql);
                if ($check_result2 && $check_result2->num_rows > 0) {
                    $participanteid = $check_result2->fetch_assoc()['participanteid'];
                } else {
                    throw new Exception('Erro ao processar participante: ' . $con->error);
                }
            }
        }
    }
    
    if (!$participanteid) {
        throw new Exception('Não foi possível identificar o participante');
    }
    
    // ========================================
    // 2. PROCESSAR COMPRADOR
    // ========================================
    $compradorid = null;
    
    if (isset($comprador['metodo_comprador']) && $comprador['metodo_comprador'] === 'logged') {
        // Usar comprador logado
        $compradorid = intval($comprador['comprador_id']);
        
    } else {
        // Verificar se já existe comprador com este CPF/CNPJ
        $documento = mysqli_real_escape_string($con, $comprador['documento']);
        $check_comprador = "SELECT id FROM compradores WHERE cpf = '$documento' OR cnpj = '$documento'";
        $result_comprador = $con->query($check_comprador);
        
        if ($result_comprador->num_rows > 0) {
            // Comprador já existe, usar o existente
            $comprador_existente = $result_comprador->fetch_assoc();
            $compradorid = $comprador_existente['id'];
            
            // Verificar se é a primeira vez que este comprador faz pedido
            // E se ainda não tem senha cadastrada (nunca recebeu email de boas-vindas)
            $check_primeira_compra = "SELECT COUNT(*) as total_pedidos FROM tb_pedidos WHERE compradorid = $compradorid";
            $result_pedidos = $con->query($check_primeira_compra);
            $total_pedidos = $result_pedidos->fetch_assoc()['total_pedidos'];
            
            // Verificar se já tem senha
            $check_senha = "SELECT senha FROM compradores WHERE id = $compradorid";
            $result_senha = $con->query($check_senha);
            $comprador_data = $result_senha->fetch_assoc();
            $tem_senha = !empty($comprador_data['senha']);
            
            // Se é primeira compra OU não tem senha, enviar email de boas-vindas
            if ($total_pedidos == 0 || !$tem_senha) {
                $email = mysqli_real_escape_string($con, $participante['email']);
                $nome = mysqli_real_escape_string($con, $comprador['nome_completo']);
                
                // ========================================
                // ENVIAR EMAIL DE BOAS-VINDAS PARA COMPRADOR EXISTENTE SEM SENHA
                // ========================================
                try {
                    $email_enviado = enviarEmailBoasVindas($email, $nome);
                    if ($email_enviado) {
                        error_log("Email de boas-vindas enviado para comprador existente: $email");
                    } else {
                        error_log("Falha ao enviar email de boas-vindas para comprador existente: $email");
                    }
                } catch (Exception $email_error) {
                    error_log("Erro ao enviar email de boas-vindas para comprador existente: " . $email_error->getMessage());
                    // Não interromper o processo por falha no email
                }
            }
            
        } else {
            // Criar novo comprador
            $nome = mysqli_real_escape_string($con, $comprador['nome_completo']);
            $email = mysqli_real_escape_string($con, $participante['email']); // Email do participante
            $celular = mysqli_real_escape_string($con, $participante['whatsapp']); // WhatsApp do participante
            $tipo_documento = mysqli_real_escape_string($con, $comprador['tipo_documento']);
            $cep = mysqli_real_escape_string($con, $comprador['cep']);
            $endereco = mysqli_real_escape_string($con, $comprador['endereco']);
            $numero = mysqli_real_escape_string($con, $comprador['numero']);
            $complemento = mysqli_real_escape_string($con, $comprador['complemento']);
            $bairro = mysqli_real_escape_string($con, $comprador['bairro']);
            $cidade = mysqli_real_escape_string($con, $comprador['cidade']);
            $estado = mysqli_real_escape_string($con, $comprador['estado']);
            $telefone = mysqli_real_escape_string($con, $comprador['telefone']);
            
            // Definir qual campo de documento usar
            $cpf_field = ($tipo_documento === 'CPF') ? "'$documento'" : 'NULL';
            $cnpj_field = ($tipo_documento === 'CNPJ') ? "'$documento'" : 'NULL';
            
            // Verificar se tabela compradores tem campos de senha
            $check_columns = "SHOW COLUMNS FROM compradores LIKE 'senha'";
            $result_columns = $con->query($check_columns);
            
            if ($result_columns->num_rows == 0) {
                // Adicionar campos de senha se não existirem
                $alter_table = "ALTER TABLE compradores 
                               ADD COLUMN senha VARCHAR(255) NULL,
                               ADD COLUMN senha_criada_em DATETIME NULL";
                $con->query($alter_table);
            }
            
            $insert_comprador = "INSERT INTO compradores (
                nome, email, celular, cpf, cnpj, tipo_documento, cep, endereco, numero, 
                complemento, bairro, cidade, estado, telefone, ativo, criado_em
            ) VALUES (
                '$nome', '$email', '$celular', $cpf_field, $cnpj_field, '$tipo_documento', 
                '$cep', '$endereco', '$numero', '$complemento', '$bairro', '$cidade', 
                '$estado', '$telefone', 1, NOW()
            )";
            
            if ($con->query($insert_comprador)) {
                $compradorid = $con->insert_id;
                
                // ========================================
                // ENVIAR EMAIL DE BOAS-VINDAS PARA NOVO COMPRADOR
                // ========================================
                try {
                    $email_enviado = enviarEmailBoasVindas($email, $nome);
                    if ($email_enviado) {
                        error_log("Email de boas-vindas enviado para: $email");
                    } else {
                        error_log("Falha ao enviar email de boas-vindas para: $email");
                    }
                } catch (Exception $email_error) {
                    error_log("Erro ao enviar email de boas-vindas: " . $email_error->getMessage());
                    // Não interromper o processo por falha no email
                }
                
            } else {
                throw new Exception('Erro ao cadastrar comprador: ' . $con->error);
            }
        }
    }
    
    if (!$compradorid) {
        throw new Exception('Não foi possível identificar o comprador');
    }

    // ========================================
    // 3. CRIAR PEDIDO
    // ========================================
    $valor_total = floatval($carrinho['total']);
    $metodo_pagamento = mysqli_real_escape_string($con, $pagamento['metodo']);
    $parcelas = intval($pagamento['parcelas'] ?? 1);
    
    $comprador_nome = mysqli_real_escape_string($con, $comprador['nome_completo']);
    $comprador_documento = mysqli_real_escape_string($con, $comprador['documento']);
    $comprador_tipo_documento = mysqli_real_escape_string($con, $comprador['tipo_documento']);
    $comprador_cep = mysqli_real_escape_string($con, $comprador['cep']);
    
    // Gerar código único do pedido
    $codigo_pedido = 'PED_' . date('Ymd') . '_' . uniqid();
    
    $sql_pedido = "INSERT INTO tb_pedidos (
        eventoid, participanteid, compradorid, valor_total, metodo_pagamento, parcelas,
        comprador_nome, comprador_documento, comprador_tipo_documento, comprador_cep,
        codigo_pedido
    ) VALUES (
        $eventoid, $participanteid, $compradorid, $valor_total, '$metodo_pagamento', $parcelas,
        '$comprador_nome', '$comprador_documento', '$comprador_tipo_documento', '$comprador_cep',
        '$codigo_pedido'
    )";
    
    if (!$con->query($sql_pedido)) {
        throw new Exception('Erro ao criar pedido: ' . $con->error);
    }
    
    $pedidoid = $con->insert_id;
    
    // ========================================
    // 4. CRIAR ITENS DO PEDIDO E GERAR INGRESSOS INDIVIDUAIS
    // ========================================
    foreach ($carrinho['ingressos'] as $ingresso) {
        $ingresso_id = intval($ingresso['id']);
        $quantidade = intval($ingresso['quantidade']);
        $preco_unitario = floatval($ingresso['preco']);
        $subtotal = floatval($ingresso['subtotal']);
        
        $sql_item = "INSERT INTO tb_itens_pedido (
            pedidoid, eventoid, ingresso_id, quantidade, preco_unitario, subtotal
        ) VALUES (
            $pedidoid, $eventoid, $ingresso_id, $quantidade, $preco_unitario, $subtotal
        )";
        
        if (!$con->query($sql_item)) {
            throw new Exception('Erro ao criar item do pedido: ' . $con->error);
        }
        
        // ========================================
        // 5. GERAR INGRESSOS INDIVIDUAIS
        // ========================================
        
        // Buscar dados do tipo de ingresso
        $sql_ingresso_info = "SELECT titulo, tipo, conteudo_combo FROM ingressos WHERE id = $ingresso_id";
        $result_ingresso = $con->query($sql_ingresso_info);
        $ingresso_info = $result_ingresso->fetch_assoc();
        $titulo_ingresso = mysqli_real_escape_string($con, $ingresso_info['titulo']);
        $tipo_ingresso = $ingresso_info['tipo'];
        $conteudo_combo = $ingresso_info['conteudo_combo'];
        
        // Verificar se é um combo
        if ($tipo_ingresso === 'combo' && !empty($conteudo_combo)) {
            // Decodificar JSON do combo
            $itens_combo = json_decode($conteudo_combo, true);
            
            if ($itens_combo && is_array($itens_combo)) {
                // Para cada unidade do combo comprada
                for ($combo_unidade = 1; $combo_unidade <= $quantidade; $combo_unidade++) {
                    // Para cada item dentro do combo
                    foreach ($itens_combo as $item_combo) {
                        $combo_ingresso_id = intval($item_combo['ingresso_id']);
                        $combo_quantidade = intval($item_combo['quantidade']);
                        
                        // Buscar título do ingresso do combo
                        $sql_combo_titulo = "SELECT titulo FROM ingressos WHERE id = $combo_ingresso_id";
                        $result_combo_titulo = $con->query($sql_combo_titulo);
                        $combo_titulo_info = $result_combo_titulo->fetch_assoc();
                        $combo_titulo_original = $combo_titulo_info['titulo'];
                        
                        // Gerar ingressos individuais para este item do combo
                        for ($combo_seq = 1; $combo_seq <= $combo_quantidade; $combo_seq++) {
                            // Gerar código único do ingresso
                            $chars = '23456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
                            $codigo_ingresso = '';
                            for ($j = 0; $j < 8; $j++) {
                                $codigo_ingresso .= $chars[rand(0, strlen($chars) - 1)];
                            }
                            
                            // Verificar se o código já existe
                            $check_codigo = "SELECT id FROM tb_ingressos_individuais WHERE codigo_ingresso = '$codigo_ingresso'";
                            $result_check = $con->query($check_codigo);
                            
                            // Se já existir, adicionar sufixo numérico
                            $tentativa = 1;
                            while ($result_check && $result_check->num_rows > 0) {
                                $tentativa++;
                                $codigo_ingresso_temp = $codigo_ingresso . sprintf('%02d', $tentativa);
                                $check_codigo = "SELECT id FROM tb_ingressos_individuais WHERE codigo_ingresso = '$codigo_ingresso_temp'";
                                $result_check = $con->query($check_codigo);
                                if (!$result_check || $result_check->num_rows == 0) {
                                    $codigo_ingresso = $codigo_ingresso_temp;
                                    break;
                                }
                            }
                            
                            // Gerar hash de validação
                            $hash_validacao = hash('sha256', $codigo_ingresso . $pedidoid . $eventoid . time());
                            
                            // Título do ingresso combo (ex: "Associado - Combo(3)")
                            $titulo_combo_final = $combo_titulo_original . " - Combo(" . $combo_seq . ")";
                            $titulo_combo_escaped = mysqli_real_escape_string($con, $titulo_combo_final);
                            
                            // Dados para QR Code (JSON) - usar ingresso_id do item, não do combo
                            $qr_data = json_encode([
                                'codigo' => $codigo_ingresso,
                                'pedido' => $pedidoid,
                                'evento' => $eventoid,
                                'ingresso' => $combo_ingresso_id, // ID do item, não do combo
                                'hash' => $hash_validacao
                            ]);
                            
                            // Inserir ingresso individual do combo
                            $sql_ingresso_individual = "INSERT INTO tb_ingressos_individuais (
                                pedidoid, eventoid, ingresso_id, compradorid, codigo_ingresso,
                                titulo_ingresso, preco_unitario, qr_code_data, hash_validacao
                            ) VALUES (
                                $pedidoid, $eventoid, $combo_ingresso_id, $compradorid, '$codigo_ingresso',
                                '$titulo_combo_escaped', $preco_unitario, '" . mysqli_real_escape_string($con, $qr_data) . "', '$hash_validacao'
                            )";
                            
                            if (!$con->query($sql_ingresso_individual)) {
                                throw new Exception('Erro ao gerar ingresso individual do combo: ' . $con->error);
                            }
                        }
                    }
                }
            }
        } else {
            // Ingresso normal (não combo) - comportamento original
            // Gerar ingressos individuais conforme a quantidade
            for ($i = 1; $i <= $quantidade; $i++) {
                // Gerar código único do ingresso mais curto e amigável
                // Caracteres permitidos (sem 0, O, I, 1 para evitar confusão)
                $chars = '23456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
                $codigo_ingresso = '';
                for ($j = 0; $j < 8; $j++) {
                    $codigo_ingresso .= $chars[rand(0, strlen($chars) - 1)];
                }
                
                // Verificar se o código já existe (improvável, mas por segurança)
                $check_codigo = "SELECT id FROM tb_ingressos_individuais WHERE codigo_ingresso = '$codigo_ingresso'";
                $result_check = $con->query($check_codigo);
                
                // Se já existir, adicionar sufixo numérico
                $tentativa = 1;
                while ($result_check && $result_check->num_rows > 0) {
                    $tentativa++;
                    $codigo_ingresso_temp = $codigo_ingresso . sprintf('%02d', $tentativa);
                    $check_codigo = "SELECT id FROM tb_ingressos_individuais WHERE codigo_ingresso = '$codigo_ingresso_temp'";
                    $result_check = $con->query($check_codigo);
                    if (!$result_check || $result_check->num_rows == 0) {
                        $codigo_ingresso = $codigo_ingresso_temp;
                        break;
                    }
                }
                
                // Gerar hash de validação
                $hash_validacao = hash('sha256', $codigo_ingresso . $pedidoid . $eventoid . time());
                
                // Dados para QR Code (JSON)
                $qr_data = json_encode([
                    'codigo' => $codigo_ingresso,
                    'pedido' => $pedidoid,
                    'evento' => $eventoid,
                    'ingresso' => $ingresso_id,
                    'hash' => $hash_validacao
                ]);
                
                $sql_ingresso_individual = "INSERT INTO tb_ingressos_individuais (
                    pedidoid, eventoid, ingresso_id, compradorid, codigo_ingresso,
                    titulo_ingresso, preco_unitario, qr_code_data, hash_validacao
                ) VALUES (
                    $pedidoid, $eventoid, $ingresso_id, $compradorid, '$codigo_ingresso',
                    '$titulo_ingresso', $preco_unitario, '" . mysqli_real_escape_string($con, $qr_data) . "', '$hash_validacao'
                )";
                
                if (!$con->query($sql_ingresso_individual)) {
                    throw new Exception('Erro ao gerar ingresso individual: ' . $con->error);
                }
            }
        }
    }
    
    // Confirmar transação
    $con->commit();
    
    // Buscar ingressos gerados para incluir na resposta
    $sql_ingressos_gerados = "SELECT codigo_ingresso, titulo_ingresso, preco_unitario 
                              FROM tb_ingressos_individuais 
                              WHERE pedidoid = $pedidoid 
                              ORDER BY id";
    $result_ingressos = $con->query($sql_ingressos_gerados);
    $ingressos_gerados = [];
    while ($row = $result_ingressos->fetch_assoc()) {
        $ingressos_gerados[] = $row;
    }
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Pedido criado com sucesso',
        'pedido' => [
            'pedidoid' => $pedidoid,
            'codigo_pedido' => $codigo_pedido,
            'participanteid' => $participanteid,
            'compradorid' => $compradorid,
            'valor_total' => $valor_total,
            'metodo_pagamento' => $metodo_pagamento,
            'ingressos_gerados' => $ingressos_gerados,
            'total_ingressos' => count($ingressos_gerados)
        ]
    ]);
    
} catch (Exception $e) {
    // Reverter transação em caso de erro
    $con->rollback();
    
    $error_details = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'input_data' => $input,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    error_log('Erro ao processar pedido: ' . json_encode($error_details));
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao processar pedido: ' . $e->getMessage(),
        'debug' => [
            'error_line' => $e->getLine(),
            'error_file' => basename($e->getFile())
        ]
    ]);
}

// Restaurar autocommit
$con->autocommit(true);
?>