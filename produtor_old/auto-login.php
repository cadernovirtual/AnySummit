<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrando no sistema...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 35%, #16213E 70%, #0F3460 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .loading-container {
            text-align: center;
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top: 3px solid #00C2FF;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h2 {
            color: #00C2FF;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <?php
    session_start();
    
    // Verificar se veio do cadastro e tem dados na sessão
    if (!isset($_SESSION['usuario_logado']) || !$_SESSION['usuario_logado']) {
        header('Location: index.php');
        exit;
    }
    
    // Pegar dados da sessão
    $email = $_SESSION['usuario_email'] ?? '';
    $senha_temporaria = $_SESSION['senha_temporaria'] ?? '';
    
    // Limpar senha temporária da sessão por segurança
    unset($_SESSION['senha_temporaria']);
    
    if (empty($email) || empty($senha_temporaria)) {
        // Se não tem dados, redireciona direto para meuseventos
        header('Location: meuseventos.php');
        exit;
    }
    ?>
    
    <div class="loading-container">
        <div class="spinner"></div>
        <h2>Entrando no sistema...</h2>
        <p>Aguarde um momento</p>
    </div>
    
    <!-- Formulário invisível para auto-submit -->
    <form id="autoLoginForm" action="verify.php" method="POST" style="display: none;">
        <input type="email" name="email" value="<?php echo htmlspecialchars($email); ?>">
        <input type="password" name="password" value="<?php echo htmlspecialchars($senha_temporaria); ?>">
    </form>
    
    <script>
        // Auto-submit após carregar a página
        window.onload = function() {
            setTimeout(function() {
                document.getElementById('autoLoginForm').submit();
            }, 500);
        };
    </script>
</body>
</html>