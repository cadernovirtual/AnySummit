<?php
 
session_start();
include("conm/conn.php");

// Verifica se já está logado
if (isset($_SESSION['staff_logado']) && $_SESSION['staff_logado'] === true) {
    header("Location: checkin");
    exit();
}

// Verifica se há cookies de login
if (isset($_COOKIE['staff_logado']) && $_COOKIE['staff_logado'] == '1') {
    header("Location: checkin");
    exit();
}

// Função para exibir mensagens de erro
function exibirErro($erro) {
    $mensagens = [
        'campos_vazios' => 'Por favor, preencha todos os campos.',
        'email_invalido' => 'Por favor, digite um e-mail válido.',
        'senha_incorreta' => 'Senha incorreta. Tente novamente.',
        'email_nao_encontrado' => 'E-mail não encontrado no sistema.',
        'erro_sistema' => 'Erro interno do sistema. Tente novamente.'
    ];
    
    if (isset($mensagens[$erro])) {
        return '<div class="error-message">' . $mensagens[$erro] . '</div>';
    }
    return '';
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrar - Anysummit</title>
     <link rel="stylesheet" type="text/css" href="/staff/css/css.css">
</head>
<body>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <div class="login-container">
        <div class="logo-section">
           <img src="img/logover.png" style="width:100%; max-width:200px;">
            <p class="subtitle">Entre na sua conta de Participante</p>
        </div>

        <form action="verify.php" method="POST">
            <?php 
            if (isset($_GET['erro'])) {
                echo exibirErro($_GET['erro']);
            }
            ?>
            
            <div class="form-group">
                <label class="form-label" for="email">E-mail</label>
                <input type="email" id="email" name="email" class="form-input" placeholder="Digite seu e-mail" required>
            </div>

            <div class="form-group">
                <label class="form-label" for="password">Senha</label>
                <input type="password" id="password" name="password" class="form-input" placeholder="Digite sua senha" required>
            </div>

       <!--     <div class="forgot-password">
                <a href="#forgot">Esqueci minha senha</a>
            </div>-->

            <button type="submit" class="login-button">
                Entrar
            </button>
        </form>

       <!-- <div class="signup-link">
            Não possui uma conta? <a href="#signup"><strong>Cadastre-se</strong></a>
        </div>-->
    </div>

    <script>
        // Add form interaction effects
        const inputs = document.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'translateY(0)';
            });
        });

        // Add smooth scroll and page interactions
        document.addEventListener('mousemove', function(e) {
            const particles = document.querySelectorAll('.particle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    </script>
</body>
</html>