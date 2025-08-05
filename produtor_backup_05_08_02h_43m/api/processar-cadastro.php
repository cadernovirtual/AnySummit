0-9]/', '', $input['cpf']);
} else {
    if (empty($input['nomeFantasia']) || empty($input['razaoSocial']) || empty($input['cnpj'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome fantasia, razão social e CNPJ são obrigatórios para pessoa jurídica']);
        exit;
    }
    $nomeFantasia = trim($input['nomeFantasia']);
    $razaoSocial = trim($input['razaoSocial']);
    $cnpj = preg_replace('/[^0-9]/', '', $input['cnpj']);
}

try {
    // Iniciar transação
    mysqli_autocommit($con, false);
    
    // Inserir contratante
    $sql = "INSERT INTO contratantes (
        nome_fantasia, razao_social, cnpj, cpf, email_contato, 
        telefone, ativo, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
    
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) {
        throw new Exception('Erro ao preparar inserção de contratante');
    }
    
    mysqli_stmt_bind_param($stmt, "ssssss", 
        $nomeFantasia, $razaoSocial, $cnpj, $cpf, $email, $celular
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao inserir contratante');
    }
    
    $contratanteId = mysqli_insert_id($con);
    mysqli_stmt_close($stmt);
    
    // Inserir usuário
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO usuarios (
        contratante_id, nome, email, celular, senha_hash, 
        perfil, nome_exibicao, ativo, email_verificado, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, 'produtor', ?, 1, 1, NOW(), NOW())";
    
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) {
        throw new Exception('Erro ao preparar inserção de usuário');
    }
    
    mysqli_stmt_bind_param($stmt, "isssss", 
        $contratanteId, $nome, $email, $celular, $senhaHash, $nome
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao inserir usuário');
    }
    
    $usuarioId = mysqli_insert_id($con);
    mysqli_stmt_close($stmt);
    
    // Salvar log
    salvarLog($con, "CADASTRO_PRODUTOR", $contratanteId, 
        "Novo produtor cadastrado: $nome ($email)");
    
    // Confirmar transação
    mysqli_commit($con);
    
    // Limpar sessão de verificação
    unset($_SESSION['email_verified']);
    unset($_SESSION['verified_email']);
    
    // Definir sessões de login
    $_SESSION['usuario_logado'] = true;
    $_SESSION['usuarioid'] = $usuarioId;
    $_SESSION['usuario_nome'] = $nome;
    $_SESSION['usuario_email'] = $email;
    $_SESSION['contratanteid'] = $contratanteId;
    
    // Definir cookies persistentes
    setCookieForever('usuario_logado', '1');
    setCookieForever('usuarioid', $usuarioId);
    setCookieForever('usuario_nome', $nome);
    setCookieForever('usuario_email', $email);
    setCookieForever('contratanteid', $contratanteId);
    
    // Enviar email de boas-vindas
    enviarEmailBoasVindas($email, $nome);
    
    echo json_encode([
        'success' => true,
        'message' => 'Cadastro realizado com sucesso',
        'usuarioId' => $usuarioId
    ]);
    
} catch (Exception $e) {
    mysqli_rollback($con);
    error_log("Erro ao processar cadastro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar conta. Tente novamente.'
    ]);
} finally {
    mysqli_close($con);
}

// Função para enviar email de boas-vindas
function enviarEmailBoasVindas($email, $nome) {
    $subject = "Bem-vindo ao AnySummit!";
    
    $message = "
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .content {
                color: #333333;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #00C2FF, #725EFF);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
            }
            .features {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #888888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='color: #00C2FF;'>Bem-vindo ao AnySummit!</h1>
            </div>
            
            <div class='content'>
                <p>Olá <strong>" . htmlspecialchars($nome) . "</strong>,</p>
                
                <p>Parabéns! Sua conta foi criada com sucesso. Agora você já pode começar a criar e gerenciar seus eventos.</p>
                
                <div class='features'>
                    <h3>Com o AnySummit você pode:</h3>
                    <ul>
                        <li>Criar eventos ilimitados</li>
                        <li>Gerenciar vendas de ingressos</li>
                        <li>Controlar check-in dos participantes</li>
                        <li>Acompanhar relatórios em tempo real</li>
                        <li>E muito mais!</li>
                    </ul>
                </div>
                
                <center>
                    <a href='https://anysummit.com.br/produtor/' class='button'>
                        Acessar Painel
                    </a>
                </center>
                
                <p>Se tiver qualquer dúvida, nossa equipe está pronta para ajudar!</p>
            </div>
            
            <div class='footer'>
                <p>© " . date('Y') . " AnySummit. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: AnySummit <noreply@anysummit.com.br>" . "\r\n";
    
    @mail($email, $subject, $message, $headers);
}
?>