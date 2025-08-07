<?php
// Debug do login admin
session_start();

if (isset($_SESSION['admin_usuarioid']) && !empty($_SESSION['admin_usuarioid'])) {
    header('Location: /admin/index.php');
    exit();
}

require_once 'conm/conn.php';

$erro_login = '';
$debug_info = '';

if ($_POST && isset($_POST['email']) && isset($_POST['senha'])) {
    $email = trim($_POST['email']);
    $senha = trim($_POST['senha']);
    
    $debug_info .= "<div style='background: #f8f9fa; padding: 10px; margin: 10px 0; border: 1px solid #dee2e6;'>";
    $debug_info .= "<strong>DEBUG:</strong><br>";
    $debug_info .= "Email recebido: '" . htmlspecialchars($email) . "'<br>";
    $debug_info .= "Senha recebida: '" . htmlspecialchars($senha) . "' (tamanho: " . strlen($senha) . ")<br>";
    
    if (!empty($email) && !empty($senha)) {
        // Consultar usuário admin no banco
        $stmt = $con->prepare("SELECT id, nome, email, senha_hash, perfil FROM usuarios WHERE email = ? AND perfil = 'admin' AND ativo = 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $debug_info .= "Registros encontrados: " . $result->num_rows . "<br>";
        
        if ($result->num_rows > 0) {
            $usuario = $result->fetch_assoc();
            
            $debug_info .= "Usuário encontrado: " . htmlspecialchars($usuario['nome']) . "<br>";
            $debug_info .= "Hash no banco: " . htmlspecialchars(substr($usuario['senha_hash'], 0, 30)) . "...<br>";
            
            // Verificar senha
            $senha_ok = password_verify($senha, $usuario['senha_hash']);
            $debug_info .= "password_verify resultado: " . ($senha_ok ? 'TRUE' : 'FALSE') . "<br>";
            
            if ($senha_ok) {
                // Login bem-sucedido
                $_SESSION['admin_usuarioid'] = $usuario['id'];
                $_SESSION['admin_nome'] = $usuario['nome'];
                $_SESSION['admin_email'] = $usuario['email'];
                
                error_log("Admin login: " . $usuario['email'] . " - " . date('Y-m-d H:i:s'));
                
                $debug_info .= "<strong style='color: green;'>LOGIN BEM-SUCEDIDO!</strong><br>";
                $debug_info .= "</div>";
                
                header('Location: /admin/index.php');
                exit();
            } else {
                $erro_login = 'Email ou senha inválidos.';
                $debug_info .= "<strong style='color: red;'>SENHA INCORRETA!</strong><br>";
            }
        } else {
            $erro_login = 'Email ou senha inválidos.';
            $debug_info .= "<strong style='color: red;'>USUÁRIO NÃO ENCONTRADO!</strong><br>";
        }
        
        $stmt->close();
    } else {
        $erro_login = 'Por favor, preencha todos os campos.';
        $debug_info .= "<strong style='color: orange;'>CAMPOS VAZIOS!</strong><br>";
    }
    
    $debug_info .= "</div>";
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AnySummit - Admin Login DEBUG</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
            max-width: 500px;
        }
        .login-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 2rem;
        }
        .login-body {
            padding: 2rem;
        }
        .form-control {
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            padding: 0.75rem 1rem;
        }
        .btn-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 10px;
            padding: 0.75rem 2rem;
            color: white;
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <i class="fas fa-bug fa-2x mb-3"></i>
                <h1>AnySummit Admin</h1>
                <p>LOGIN DEBUG</p>
            </div>
            
            <div class="login-body">
                <?php if (!empty($debug_info)): ?>
                    <?php echo $debug_info; ?>
                <?php endif; ?>
                
                <?php if (!empty($erro_login)): ?>
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <?php echo htmlspecialchars($erro_login); ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST" action="">
                    <div class="mb-3">
                        <label for="email" class="form-label">
                            <i class="fas fa-envelope me-1"></i>
                            E-mail
                        </label>
                        <input type="email" 
                               class="form-control" 
                               id="email" 
                               name="email" 
                               placeholder="admin@anysummit.com.br"
                               value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : 'admin@anysummit.com.br'; ?>"
                               required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="senha" class="form-label">
                            <i class="fas fa-lock me-1"></i>
                            Senha
                        </label>
                        <input type="password" 
                               class="form-control" 
                               id="senha" 
                               name="senha" 
                               placeholder="230572gu@"
                               value="<?php echo isset($_POST['senha']) ? htmlspecialchars($_POST['senha']) : ''; ?>"
                               required>
                    </div>
                    
                    <button type="submit" class="btn btn-login">
                        <i class="fas fa-sign-in-alt me-2"></i>
                        Testar Login DEBUG
                    </button>
                </form>
                
                <div class="text-center mt-4">
                    <a href="/admin/diagnostico.php" class="btn btn-warning">
                        🔍 Executar Diagnóstico Completo
                    </a>
                </div>
                
                <div class="text-center mt-2">
                    <a href="/admin/login.php" class="btn btn-secondary">
                        🔙 Voltar ao Login Normal
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>