<?php
session_start();
include("conm/conn.php");

$token = $_GET['token'] ?? '';
$mensagem = '';
$erro = '';
$email = '';
$nome = '';

// Verificar token
if ($token) {
    $token_escaped = mysqli_real_escape_string($con, $token);
    
    $sql = "SELECT pt.email, pt.expires_at, pt.used, c.nome 
            FROM password_tokens pt 
            LEFT JOIN compradores c ON c.email = pt.email 
            WHERE pt.token = '$token_escaped' AND pt.used = 0";
    
    $result = $con->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $token_data = $result->fetch_assoc();
        $email = $token_data['email'];
        $nome = $token_data['nome'];
        
        // Verificar se token expirou
        if (strtotime($token_data['expires_at']) < time()) {
            $erro = 'Este link expirou. Solicite um novo link de criação de senha.';
        }
    } else {
        $erro = 'Link inválido ou já utilizado.';
    }
} else {
    $erro = 'Token não fornecido.';
}

// Processar criação de senha
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$erro) {
    $senha = $_POST['senha'] ?? '';
    $confirmar_senha = $_POST['confirmar_senha'] ?? '';
    
    if (empty($senha) || empty($confirmar_senha)) {
        $erro = 'Por favor, preencha todos os campos.';
    } elseif (strlen($senha) < 6) {
        $erro = 'A senha deve ter pelo menos 6 caracteres.';
    } elseif ($senha !== $confirmar_senha) {
        $erro = 'As senhas não coincidem.';
    } else {
        // Criptografar senha
        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
        $email_escaped = mysqli_real_escape_string($con, $email);
        $token_escaped = mysqli_real_escape_string($con, $token);
        
        // Debug: Verificar se o comprador existe
        $check_comprador = "SELECT id, nome FROM compradores WHERE email = '$email_escaped'";
        $result_comprador = $con->query($check_comprador);
        
        if ($result_comprador && $result_comprador->num_rows > 0) {
            $comprador_data = $result_comprador->fetch_assoc();
            
            // Atualizar senha do comprador (ambos os campos para compatibilidade)
            $update_sql = "UPDATE compradores SET senha = '$senha_hash', senha_hash = '$senha_hash', senha_criada_em = NOW() WHERE email = '$email_escaped'";
            
            if ($con->query($update_sql)) {
                // Verificar se a atualização funcionou
                $rows_affected = $con->affected_rows;
                
                if ($rows_affected > 0) {
                    // Marcar token como usado
                    $mark_used = "UPDATE password_tokens SET used = 1 WHERE token = '$token_escaped'";
                    $con->query($mark_used);
                    
                    // Log de sucesso
                    error_log("Senha criada com sucesso para comprador ID: {$comprador_data['id']}, Email: $email");
                    
                    $mensagem = 'Senha criada com sucesso! Agora você pode fazer login na plataforma.';
                } else {
                    error_log("Nenhuma linha foi atualizada ao criar senha para: $email");
                    $erro = 'Erro: Não foi possível atualizar a senha. Nenhum registro foi modificado.';
                }
            } else {
                error_log("Erro SQL ao criar senha: " . $con->error . " para email: $email");
                $erro = 'Erro ao criar senha. Tente novamente. (Erro SQL)';
            }
        } else {
            error_log("Comprador não encontrado para o email: $email");
            $erro = 'Erro: Comprador não encontrado. Verifique se o cadastro foi feito corretamente.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Senha - Any Summit</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #e91e63 0%, #9c27b0 50%, #673ab7 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }
        
        .container {
            width: 100%;
            max-width: 450px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 40px);
        }
        
        .container > .card {
            width: 100%;
        }
        
        .card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            width: 100%;
        }
        
        .card-header {
            background: white;
            border-bottom: none;
            text-align: center;
            padding: 2rem 2rem 1rem;
            border-radius: 20px 20px 0 0;
        }
        
        .logo {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .card-body {
            padding: 1rem 2rem 2rem;
        }
        
        .form-control {
            border-radius: 12px;
            border: 2px solid #f1f3f4;
            padding: 12px 16px;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: #e91e63;
            box-shadow: 0 0 0 0.2rem rgba(233, 30, 99, 0.25);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            border: none;
            border-radius: 12px;
            padding: 12px 30px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
        }
        
        .welcome-badge {
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            display: inline-block;
            margin-bottom: 1rem;
        }
        
        .password-requirements {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-top: 10px;
            font-size: 0.9rem;
        }
        
        .requirement {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .requirement i {
            margin-right: 8px;
            width: 16px;
        }
        
        .valid {
            color: #28a745;
        }
        
        .invalid {
            color: #dc3545;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            body {
                padding: 15px;
            }
            
            .container {
                min-height: calc(100vh - 30px);
            }
            
            .card-header,
            .card-body {
                padding: 1.5rem !important;
            }
            
            .logo {
                font-size: 1.75rem;
            }
        }
        
        @media (max-width: 480px) {
            body {
                padding: 10px;
            }
            
            .container {
                min-height: calc(100vh - 20px);
            }
            
            .card-header,
            .card-body {
                padding: 1rem !important;
            }
            
            .logo {
                font-size: 1.5rem;
            }
            
            .password-requirements {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="card-header">
                <div class="logo"><img src="/evento/img/anysummitlogo.png" style=" width:150px;"></div>
                <div class="text-muted">Criar sua senha de acesso</div>
            </div>
            
            <div class="card-body">
                <?php if ($erro): ?>
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <?php echo htmlspecialchars($erro); ?>
                    </div>
                    
                    <div class="text-center">
                        <a href="/evento" class="btn btn-outline-primary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Voltar aos Eventos
                        </a>
                    </div>
                    
                <?php elseif ($mensagem): ?>
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle me-2"></i>
                        <?php echo htmlspecialchars($mensagem); ?>
                    </div>
                    
                    <div class="text-center">
                        <a href="/evento/login.php" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Fazer Login
                        </a>
                    </div>
                    
                <?php else: ?>
                    <?php if ($nome): ?>
                        <div class="text-center mb-3">
                            <div class="welcome-badge">
                                <i class="fas fa-user me-2"></i>
                                Olá, <?php echo htmlspecialchars($nome); ?>!
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <p class="text-center text-muted mb-4">
                        Crie uma senha segura para acessar sua conta na Any Summit
                    </p>
                    
                    <form method="POST">
                        <div class="mb-3">
                            <label for="senha" class="form-label">Nova Senha</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="senha" name="senha" required>
                                <button class="btn btn-outline-secondary" type="button" onClick="togglePassword('senha')">
                                    <i class="fas fa-eye" id="senha-icon"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="confirmar_senha" class="form-label">Confirmar Senha</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="confirmar_senha" name="confirmar_senha" required>
                                <button class="btn btn-outline-secondary" type="button" onClick="togglePassword('confirmar_senha')">
                                    <i class="fas fa-eye" id="confirmar_senha-icon"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="password-requirements">
                            <strong>Requisitos da senha:</strong>
                            <div class="requirement" id="req-length">
                                <i class="fas fa-circle-xmark invalid"></i>
                                Pelo menos 6 caracteres
                            </div>
                            <div class="requirement" id="req-match">
                                <i class="fas fa-circle-xmark invalid"></i>
                                Senhas coincidem
                            </div>
                        </div>
                        
                        <div class="d-grid mt-4">
                            <button type="submit" class="btn btn-primary" id="submit-btn" disabled>
                                <i class="fas fa-key me-2"></i>
                                Criar Senha
                            </button>
                        </div>
                    </form>
                    
                    <div class="text-center mt-3">
                        <small class="text-muted">
                            Após criar sua senha, você poderá acessar sua conta em eventos futuros
                        </small>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const icon = document.getElementById(fieldId + '-icon');
            
            if (field.type === 'password') {
                field.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                field.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
        
        function validatePassword() {
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar_senha').value;
            const submitBtn = document.getElementById('submit-btn');
            
            // Validar comprimento
            const lengthReq = document.getElementById('req-length');
            const lengthIcon = lengthReq.querySelector('i');
            
            if (senha.length >= 6) {
                lengthIcon.className = 'fas fa-circle-check valid';
                lengthReq.classList.remove('invalid');
                lengthReq.classList.add('valid');
            } else {
                lengthIcon.className = 'fas fa-circle-xmark invalid';
                lengthReq.classList.remove('valid');
                lengthReq.classList.add('invalid');
            }
            
            // Validar coincidência
            const matchReq = document.getElementById('req-match');
            const matchIcon = matchReq.querySelector('i');
            
            if (senha && confirmarSenha && senha === confirmarSenha) {
                matchIcon.className = 'fas fa-circle-check valid';
                matchReq.classList.remove('invalid');
                matchReq.classList.add('valid');
            } else {
                matchIcon.className = 'fas fa-circle-xmark invalid';
                matchReq.classList.remove('valid');
                matchReq.classList.add('invalid');
            }
            
            // Habilitar/desabilitar botão
            if (senha.length >= 6 && senha === confirmarSenha && senha) {
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        }
        
        document.getElementById('senha').addEventListener('input', validatePassword);
        document.getElementById('confirmar_senha').addEventListener('input', validatePassword);
    </script>
</body>
</html>