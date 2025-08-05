<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo - AnySummit</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 35%, #16213E 70%, #0F3460 100%);
            min-height: 100vh;
            color: #FFFFFF;
            overflow-x: hidden;
        }

        /* Animated Background */
        .bg-animation {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: -1;
            opacity: 0.3;
        }

        .bg-animation span {
            position: absolute;
            display: block;
            width: 20px;
            height: 20px;
            background: rgba(0, 194, 255, 0.1);
            animation: move 25s linear infinite;
            bottom: -150px;
        }

        .bg-animation span:nth-child(1) {
            left: 25%;
            width: 80px;
            height: 80px;
            animation-delay: 0s;
            background: radial-gradient(circle, rgba(0, 194, 255, 0.2), transparent);
        }

        .bg-animation span:nth-child(2) {
            left: 10%;
            width: 20px;
            height: 20px;
            animation-delay: 2s;
            animation-duration: 12s;
            background: radial-gradient(circle, rgba(114, 94, 255, 0.2), transparent);
        }

        .bg-animation span:nth-child(3) {
            left: 70%;
            width: 60px;
            height: 60px;
            animation-delay: 4s;
            background: radial-gradient(circle, rgba(0, 194, 255, 0.15), transparent);
        }

        .bg-animation span:nth-child(4) {
            left: 40%;
            width: 40px;
            height: 40px;
            animation-delay: 0s;
            animation-duration: 18s;
            background: radial-gradient(circle, rgba(114, 94, 255, 0.15), transparent);
        }

        .bg-animation span:nth-child(5) {
            left: 65%;
            width: 20px;
            height: 20px;
            animation-delay: 0s;
            background: radial-gradient(circle, rgba(0, 194, 255, 0.2), transparent);
        }

        @keyframes move {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
                border-radius: 0;
            }
            100% {
                transform: translateY(-1000px) rotate(720deg);
                opacity: 0;
                border-radius: 50%;
            }
        }

        /* Container */
        .welcome-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 60px;
            animation: fadeInDown 0.8s ease;
        }

        .logo {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border-radius: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0, 194, 255, 0.3);
            position: relative;
        }

        .logo::before {
            content: 'A';
            font-size: 48px;
            font-weight: bold;
            color: white;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }

        .welcome-title {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .welcome-subtitle {
            font-size: 20px;
            color: #B8B8C8;
            margin-bottom: 8px;
        }

        .user-name {
            font-size: 24px;
            color: #00C2FF;
            font-weight: 600;
        }

        /* Progress Steps */
        .progress-section {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1);
            animation: fadeInUp 0.8s ease 0.2s both;
        }

        .progress-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 32px;
            text-align: center;
        }

        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
        }

        .step-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .step-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #00C2FF, #725EFF);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .step-card:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 24px rgba(0, 194, 255, 0.2);
        }

        .step-card:hover::before {
            transform: scaleX(1);
        }

        .step-number {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 16px;
            box-shadow: 0 4px 16px rgba(0, 194, 255, 0.3);
        }

        .step-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #E0E0E8;
        }

        .step-description {
            font-size: 14px;
            color: #B8B8C8;
            line-height: 1.6;
        }

        /* Quick Actions */
        .actions-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
        }

        .action-card {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 32px;
            text-align: center;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            animation: fadeInUp 0.8s ease 0.4s both;
        }

        .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 
                0 24px 48px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .action-icon {
            font-size: 48px;
            margin-bottom: 20px;
            display: inline-block;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .action-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #E0E0E8;
        }

        .action-description {
            font-size: 16px;
            color: #B8B8C8;
            margin-bottom: 24px;
            line-height: 1.6;
        }

        .action-button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .action-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 194, 255, 0.4);
        }

        .action-button:hover::before {
            left: 100%;
        }

        .action-button.secondary {
            background: transparent;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .action-button.secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.4);
        }

        /* Resources */
        .resources-section {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1);
            animation: fadeInUp 0.8s ease 0.6s both;
        }

        .resources-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 32px;
            text-align: center;
        }

        .resources-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .resource-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            text-decoration: none;
            color: #E0E0E8;
            transition: all 0.3s ease;
        }

        .resource-link:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: #00C2FF;
            transform: translateX(4px);
        }

        .resource-icon {
            font-size: 24px;
            color: #00C2FF;
        }

        /* Animations */
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .welcome-title {
                font-size: 36px;
            }

            .progress-section, .action-card, .resources-section {
                padding: 24px;
            }

            .steps-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <?php
    session_start();
    
    // Verificar se usuário está logado
    if (!isset($_SESSION['usuario_logado']) || !$_SESSION['usuario_logado']) {
        header('Location: index.php');
        exit;
    }
    
    $nomeUsuario = $_SESSION['usuario_nome'] ?? 'Produtor';
    $primeiroNome = explode(' ', $nomeUsuario)[0];
    ?>

    <!-- Animated Background -->
    <div class="bg-animation">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>

    <div class="welcome-container">
        <!-- Header -->
        <div class="header">
            <div class="logo"></div>
            <h1 class="welcome-title">Bem-vindo ao AnySummit!</h1>
            <p class="welcome-subtitle">É ótimo ter você conosco,</p>
            <p class="user-name"><?php echo htmlspecialchars($primeiroNome); ?> 🎉</p>
        </div>

        <!-- Progress Steps -->
        <div class="progress-section">
            <h2 class="progress-title">Vamos configurar sua conta em 4 passos simples</h2>
            <div class="steps-grid">
                <div class="step-card">
                    <div class="step-number">1</div>
                    <h3 class="step-title">Complete seu perfil</h3>
                    <p class="step-description">Adicione informações sobre você e sua empresa para dar mais credibilidade aos seus eventos.</p>
                </div>
                <div class="step-card">
                    <div class="step-number">2</div>
                    <h3 class="step-title">Crie seu primeiro evento</h3>
                    <p class="step-description">Use nosso assistente para criar um evento incrível em poucos minutos.</p>
                </div>
                <div class="step-card">
                    <div class="step-number">3</div>
                    <h3 class="step-title">Configure os ingressos</h3>
                    <p class="step-description">Defina tipos de ingressos, preços e quantidades disponíveis.</p>
                </div>
                <div class="step-card">
                    <div class="step-number">4</div>
                    <h3 class="step-title">Publique e divulgue</h3>
                    <p class="step-description">Torne seu evento visível e comece a vender ingressos online.</p>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
            <div class="action-card">
                <i class="fas fa-calendar-plus action-icon"></i>
                <h3 class="action-title">Criar Primeiro Evento</h3>
                <p class="action-description">Comece agora mesmo a criar seu primeiro evento. Nosso assistente vai guiá-lo passo a passo.</p>
                <a href="novoevento.php" class="action-button">
                    Criar Evento Agora
                </a>
            </div>
            
            <div class="action-card">
                <i class="fas fa-user-circle action-icon"></i>
                <h3 class="action-title">Completar Perfil</h3>
                <p class="action-description">Adicione mais informações ao seu perfil para transmitir mais confiança aos participantes.</p>
                <a href="perfil.php" class="action-button secondary">
                    Editar Perfil
                </a>
            </div>
        </div>

        <!-- Resources -->
        <div class="resources-section">
            <h2 class="resources-title">Recursos para começar</h2>
            <div class="resources-grid">
                <a href="#" class="resource-link">
                    <i class="fas fa-book resource-icon"></i>
                    <span>Guia do Produtor</span>
                </a>
                <a href="#" class="resource-link">
                    <i class="fas fa-video resource-icon"></i>
                    <span>Tutoriais em Vídeo</span>
                </a>
                <a href="#" class="resource-link">
                    <i class="fas fa-question-circle resource-icon"></i>
                    <span>Central de Ajuda</span>
                </a>
                <a href="#" class="resource-link">
                    <i class="fas fa-headset resource-icon"></i>
                    <span>Suporte Online</span>
                </a>
                <a href="#" class="resource-link">
                    <i class="fas fa-users resource-icon"></i>
                    <span>Comunidade</span>
                </a>
                <a href="index.php" class="resource-link">
                    <i class="fas fa-tachometer-alt resource-icon"></i>
                    <span>Ir para o Painel</span>
                </a>
            </div>
        </div>
    </div>

    <script>
        // Adicionar efeito de parallax suave ao scroll
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.bg-animation');
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        });

        // Adicionar classe de animação aos cards quando entrarem na viewport
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar todos os elementos animados
        document.querySelectorAll('.step-card, .action-card, .resource-link').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    </script>
</body>
</html>