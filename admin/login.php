<?php
// Arquivo: /admin/login.php - Versão corrigida
session_start();

// Se já estiver logado, redirecionar para dashboard
if (isset($_SESSION['admin_usuarioid']) && !empty($_SESSION['admin_usuarioid'])) {
    header('Location: /admin/index.php');
    exit();
}

require_once 'conm/conn.php';

$erro_login = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email']) && isset($_POST['senha'])) {
    $email = trim($_POST['email']);
    $senha = trim($_POST['senha']);
    
    if (!empty($email) && !empty($senha)) {
        // Consultar usuário admin no banco
        $stmt = $con->prepare("SELECT id, nome, email, senha_hash, perfil FROM usuarios WHERE email = ? AND perfil = 'admin' AND ativo = 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $usuario = $result->fetch_assoc();
            
            // Verificar senha
            if (password_verify($senha, $usuario['senha_hash'])) {
                // Login bem-sucedido
                $_SESSION['admin_usuarioid'] = $usuario['id'];
                $_SESSION['admin_nome'] = $usuario['nome'];
                $_SESSION['admin_email'] = $usuario['email'];
                
                // Log de acesso
                error_log("Admin login: " . $usuario['email'] . " - " . date('Y-m-d H:i:s'));
                
                // Redirecionar
                header('Location: /admin/index.php');
                exit();
            } else {
                $erro_login = 'Email ou senha inválidos.';
            }
        } else {
            $erro_login = 'Email ou senha inválidos.';
        }
        
        $stmt->close();
    } else {
        $erro_login = 'Por favor, preencha todos os campos.';
    }
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AnySummit - Admin Login</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">    
    <!-- Custom CSS -->
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            max-width: 400px;
        }
        
        .login-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 2rem;
        }
        
        .login-header h1 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .login-header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }        
        .login-body {
            padding: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-label {
            font-weight: 500;
            color: #555;
            margin-bottom: 0.5rem;
        }
        
        .form-control {
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .btn-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 10px;
            padding: 0.75rem 2rem;
            font-size: 1rem;
            font-weight: 500;
            color: white;
            width: 100%;
            transition: all 0.3s ease;
        }
        
        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }        
        .alert {
            border-radius: 10px;
            border: none;
        }
        
        .input-group-text {
            background: #f8f9fa;
            border: 2px solid #e1e5e9;
            border-right: none;
        }
        
        .input-group .form-control {
            border-left: none;
        }
        
        .input-group:focus-within .input-group-text {
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <img src="/img/anysummitlogo.png" alt="AnySummit" style="height: 60px; margin-bottom: 15px;">
                <h1>Admin</h1>
                <p>Painel Administrativo</p>
            </div>
            
            <div class="login-body">
                <?php if (!empty($erro_login)): ?>
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <?php echo htmlspecialchars($erro_login); ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST" action="" accept-charset="UTF-8">
                    <div class="form-group">
                        <label for="email" class="form-label">
                            <i class="fas fa-envelope me-1"></i>
                            E-mail
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-envelope"></i>
                            </span>
                            <input type="email" 
                                   class="form-control" 
                                   id="email" 
                                   name="email" 
                                   placeholder="admin@anysummit.com.br"
                                   value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"
                                   required>
                        </div>
                    </div>                    
                    <div class="form-group">
                        <label for="senha" class="form-label">
                            <i class="fas fa-lock me-1"></i>
                            Senha
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-lock"></i>
                            </span>
                            <input type="password" 
                                   class="form-control" 
                                   id="senha" 
                                   name="senha" 
                                   placeholder="••••••••"
                                   autocomplete="current-password"
                                   required>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-login">
                        <i class="fas fa-sign-in-alt me-2"></i>
                        Entrar no Sistema
                    </button>
                </form>
                
                <div class="text-center mt-4">
                    <small class="text-muted">
                        <i class="fas fa-shield-alt me-1"></i>
                        Acesso restrito a administradores
                    </small>
                </div>
                
                <div class="text-center mt-3">
                    <small>
                        <a href="/admin/login_debug.php" class="text-muted">
                            🔍 Modo Debug
                        </a>
                    </small>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>