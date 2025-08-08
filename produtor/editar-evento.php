<?php
include("check_login.php");
include("conm/conn.php");

// Pegar ID do evento da URL
$evento_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

if (!$evento_id || !$usuario_id) {
    header('Location: meuseventos.php');
    exit();
}

// Buscar dados completos do evento
$sql = "SELECT 
            e.*,
            ce.nome as categoria_nome
        FROM eventos e
        LEFT JOIN categorias_evento ce ON e.categoria_id = ce.id
        WHERE e.id = ? AND e.usuario_id = ?";

$stmt = $con->prepare($sql);
$stmt->bind_param("ii", $evento_id, $usuario_id);
$stmt->execute();
$dados_evento = $stmt->get_result()->fetch_assoc();

if (!$dados_evento) {
    header('Location: meuseventos.php');
    exit();
}

// Buscar dados do usuário
$stmt = $con->prepare("SELECT * FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

// Buscar contratantes do usuário
$sql_contratantes = "SELECT id, razao_social FROM contratantes WHERE usuario_id = ? ORDER BY razao_social";
$stmt_contratantes = $con->prepare($sql_contratantes);
$stmt_contratantes->bind_param("i", $usuario_id);
$stmt_contratantes->execute();
$result_contratantes = $stmt_contratantes->get_result();
$contratantes = [];
while ($row = mysqli_fetch_assoc($result_contratantes)) {
    $contratantes[] = $row;
}

// Buscar categorias ativas
$sql_categorias = "SELECT id, nome FROM categorias_evento WHERE ativo = 1 ORDER BY nome";
$result_categorias = mysqli_query($con, $sql_categorias);
$categorias = [];
while ($row = mysqli_fetch_assoc($result_categorias)) {
    $categorias[] = $row;
}

// Buscar parâmetros de termos e políticas
$sql_parametros = "SELECT politicas_eventos_default, termos_eventos_default FROM parametros LIMIT 1";
$result_parametros = mysqli_query($con, $sql_parametros);
$parametros = mysqli_fetch_assoc($result_parametros) ?: [
    'politicas_eventos_default' => 'Políticas de Privacidade não configuradas.',
    'termos_eventos_default' => 'Termos de Uso não configurados.'
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Editar Evento - Painel Produtor - Anysummit</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/produtor/css/criaevento.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-0.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" type="text/css" href="/produtor/css/busca-endereco.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/iphone-switch.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/custom-dialogs.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/combo-styles.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/form-alignment.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/sistema-ingressos-etapa6.css?v=<?php echo time(); ?>" />
    
    <style>
        /* CORREÇÕES DE CACHE - CSS INLINE COM ALTA PRIORIDADE */
        
        /* Color picker oculto - FORÇAR */
        #corFundo {
            display: none !important;
            visibility: hidden !important;
        }
        
        /* Preview detail com espaçamento - FORÇAR */
        .detail-icon {
            margin-right: 8px !important;
            display: inline-block !important;
        }
        
        /* Preview card layout - FORÇAR */
        .main-content {
            display: grid !important;
            grid-template-columns: 1fr 460px !important;
            gap: 40px !important;
            align-items: start !important;
        }
        
        .preview-card {
            width: 100% !important;
            max-width: 460px !important;
            padding: 5px !important;
            position: sticky !important;
            top: 0px !important;
            margin-top: 0 !important;
        }
        
        /* Hero miniatura CSS - FORÇAR */
        .hero-mini-logo {
            max-height: 80px !important;
            max-width: 200px !important;
            object-fit: contain !important;
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 2 !important;
        }
        
        .hero-mini-capa {
            width: 100% !important;
            max-width: 120px !important;
            height: 120px !important;
            object-fit: cover !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 2 !important;
        }
        
        /* Garantir que hero logo e capa sempre apareçam */
        #heroLogo, #heroCapa {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 2 !important;
            max-width: none !important;
            max-height: none !important;
        }
        
        /* Layout hero-mini - ESTRUTURA BÁSICA */
        .hero-mini-container {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            padding: 20px !important;
            box-sizing: border-box !important;
        }
        
        .hero-mini-row {
            display: flex !important;
            width: 100% !important;
            height: 100% !important;
            align-items: center !important;
            gap: 15px !important;
        }
        
        .hero-mini-left {
            flex: 0 0 66% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding-right: 10px !important;
            box-sizing: border-box !important;
        }
        
        .hero-mini-right {
            flex: 0 0 33% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            box-sizing: border-box !important;
        }
        
        .hero-mini-logo-area {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 60px !important;
            overflow: visible !important;
        }
        
        .hero-mini-left, .hero-mini-right {
            overflow: visible !important;
        }
        
        .hero-mini-container {
            overflow: visible !important;
        }
        
        .hero-section-mini {
            overflow: visible !important;
        }
        
        /* CSS específico para imagens hero - máxima prioridade */
        div.preview-image div.hero-section-mini div.hero-mini-container div.hero-mini-row div.hero-mini-left div.hero-mini-logo-area img#heroLogo {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            width: auto !important;
            height: auto !important;
            max-width: 200px !important;
            max-height: 80px !important;
            object-fit: contain !important;
            position: relative !important;
            z-index: 999 !important;
        }
        
        div.preview-image div.hero-section-mini div.hero-mini-container div.hero-mini-row div.hero-mini-right img#heroCapa {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            width: 120px !important;
            height: 120px !important;
            object-fit: cover !important;
            border-radius: 8px !important;
            position: relative !important;
            z-index: 999 !important;
        }
        
        /* Botão de exclusão circular */
        .btn-clear-image {
            position: absolute !important;
            top: 8px !important;
            right: 8px !important;
            width: 24px !important;
            height: 24px !important;
            border-radius: 50% !important;
            background: rgba(255, 82, 82, 0.9) !important;
            color: white !important;
            border: none !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 12px !important;
            font-weight: bold !important;
            z-index: 10 !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        }
        
        .btn-clear-image:hover {
            background: rgba(255, 82, 82, 1) !important;
            transform: scale(1.1) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        
        /* Diminuir imagem de capa em 30% */
        #capaPreviewContainer img {
            max-width: 70% !important;
            max-height: 70% !important;
            object-fit: contain !important;
        }
        
        .hero-mini-left {
            flex: 0 0 66% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            padding-right: 10px !important;
        }
        
        .hero-mini-right {
            flex: 0 0 33% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
        }
        
        /* Etapa 5 layout grid - FORÇAR */
        .form-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
        }
        
        /* Loading Spinner com backdrop */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 35, 0.85); /* Backdrop escuro semi-transparente */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(8px); /* Efeito de desfoque no fundo */
        }

        .spinner {
            width: 60px;
            height: 60px;
            border: 6px solid #f3f3f3;
            border-top: 6px solid #00C2FF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-text {
            font-size: 18px;
            color: #fff; /* Texto branco no backdrop escuro */
            font-weight: 500;
            text-align: center;
        }

        .loading-subtext {
            font-size: 14px;
            color: #B8B8C8; /* Texto acinzentado claro */
            margin-top: 8px;
            text-align: center;
        }

        .hidden {
            display: none !important;
        }

        /* Progress bar com 4 etapas */
        .step-indicators .step-indicator:nth-child(n+5) {
            display: none;
        }

        /* Botão salvar estilo especial */
        .btn-save {
            background: #00C2FF !important;
            color: white !important;
            border: none !important;
        }

        .btn-save:hover {
            background: #0098CC !important;
        }

        .btn-save:disabled {
            background: #ccc !important;
            cursor: not-allowed !important;
        }
        
        /* Garantir compatibilidade com layout original */
        /* Remover definições do body que conflitam */
        
        .main-layout {
            display: flex;
            min-height: calc(100vh - 80px);
        }
        
        .content-area {
            flex: 1;
            padding: 20px;
        }
        
        /* Progress Bar - sempre no topo */
        .progress-container {
            position: relative;
            top: 0;
            max-width: 1000px;
            margin: 0 auto 40px;
            padding: 0 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding-top: 0; /* Remove padding superior para evitar acúmulo */
        }
        
        /* Ajustar o header do wizard para não conflitar com o header principal */
        .header.wizard-header {
            display: block !important;
            position: relative !important;
            z-index: 10 !important;
            text-align: center !important;
            margin-bottom: 30px !important;
            border-radius: 20px !important;
            background: rgba(42, 42, 56, 0.6) !important;
            backdrop-filter: blur(10px) !important;
            padding: 30px 20px !important;
            box-shadow: none !important;
        }
        
        .header.wizard-header h1 {
            background: linear-gradient(135deg, #00C2FF 0%, #725EFF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
        }
        
        /* Forçar todas as etapas sempre no topo */
        .main-content {
            position: relative;
            z-index: 5;
            margin-top: 0 !important;
            padding-top: 0 !important;
        }
        
        .section-card {
            position: relative;
            z-index: 5;
            background: rgba(26, 26, 46, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
        }
        
        /* Forçar container principal sem acúmulo de espaçamento */
        .form-container {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }
        
        /* Todas as etapas devem ter a mesma altura de topo */
        .section-card[data-step-content] {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            margin: 0 !important;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .section-card[data-step-content].active {
            position: relative !important;
            opacity: 1;
            visibility: visible;
        }
        
        /* Garantir que particles fiquem atrás de tudo */
        .particle {
            z-index: -1 !important;
            position: fixed !important;
            pointer-events: none !important;
        }
        
        /* Preview Card - Dimensões corretas do novoevento.php */
        .preview-image {
            position: relative;
            z-index: 1;
            width: 100%;
            height: 200px; /* Altura correta do novoevento */
            min-height: 200px;
            overflow: hidden;
            border-radius: 8px;
            margin: 15px auto 20px auto; /* Centralizar e espaçamento igual ao novoevento */
            background: transparent !important; /* Remover background que estava sobrepondo */
        }
        
        .hero-section-mini {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 8px;
        }
        
        /* Background da section */
        .hero-mini-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-color: #000000;
            opacity: 1;
        }
        
        /* Container principal */
        .hero-mini-container {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 20px;
            display: flex;
            align-items: center;
            background: transparent;
        }
        
        /* Row com as duas colunas */
        .hero-mini-row {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        /* Coluna esquerda - 66% (8/12) */
        .hero-mini-left {
            flex: 0 0 66%;
            height: 100%;
            display: flex;
            align-items: center;
            padding-right: 10px;
        }
        
        /* Área da logo */
        .hero-mini-logo-area {
            width: 100%;
            height: 60px;
            display: flex;
            align-items: center;
        }
        
        .hero-mini-logo {
            max-height: 100%;
            max-width: 200px;
            object-fit: contain;
        }
        
        /* Coluna direita - 33% (4/12) */
        .hero-mini-right {
            flex: 0 0 33%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        
        /* Imagem capa */
        .hero-mini-capa {
            width: 100%;
            max-width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        /* Color Picker Styles */
        .color-picker-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
        }
        
        .color-picker-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        #corFundo {
            width: 50px;
            height: 40px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            background: transparent;
            display: none; /* Ocultar o input color nativo */
        }
        
        .color-preview {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            margin-left: 8px;
            cursor: pointer; /* Indicar que é clicável */
            transition: border-color 0.3s ease;
        }
        
        .color-preview:hover {
            border-color: #00C2FF;
        }
        
        .color-hex-input {
            width: 100px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            font-family: monospace;
        }
        
        .color-hint {
            font-size: 12px;
            color: #8B95A7;
            margin-left: 10px;
        }
        
        /* Preview detail com espaçamento */
        .detail-icon {
            margin-right: 8px;
        }
        
        /* Controlar especificamente as imagens do preview */
        .hero-section-mini {
            position: relative;
            z-index: 1;
            overflow: hidden;
        }
        
        .hero-mini-background,
        .hero-mini-container,
        .hero-mini-row,
        .hero-mini-left,
        .hero-mini-right {
            position: relative;
            z-index: 1;
        }
        
        .hero-mini-logo,
        .hero-mini-capa {
            position: relative;
            z-index: 1;
            max-width: 100%;
            height: auto;
        }
        
        /* Garantir que preview não vaze para fora do card */
        .preview-card {
            overflow: hidden !important;
            position: relative !important;
            z-index: 5 !important;
            max-width: 100% !important;
        }
        
        /* FORÇAR contenção da preview-image */
        .preview-image {
            position: relative !important;
            z-index: 1 !important;
            overflow: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 150px !important;
        }
        
        /* TODOS os elementos filhos da preview devem respeitar os limites */
        .preview-image * {
            position: relative !important;
            z-index: 1 !important;
            max-width: 100% !important;
            max-height: 100% !important;
        }
        
        /* Forçar contenção de imagens específicas */
        #heroLogo,
        #heroCapa,
        .hero-mini-logo,
        .hero-mini-capa {
            position: relative !important;
            z-index: 1 !important;
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: contain !important;
        }
        
        /* Forçar z-index correto em todos os elementos principais */
        .content-area {
            position: relative;
            z-index: 3;
        }
        
        .container {
            position: relative;
            z-index: 4;
        }
        
        .section-card {
            position: relative;
            z-index: 5;
            background: rgba(26, 26, 46, 0.95) !important;
            backdrop-filter: blur(20px) !important;
        }
        
        .preview-card {
            position: relative;
            z-index: 5;
            background: rgba(26, 26, 46, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            width: 100%;
            max-width: 460px; /* Largura correta do novoevento */
            padding: 5px !important; /* Padding reduzido igual ao novoevento */
            position: sticky;
            top: 0px; /* Começar no topo igual aos section-cards */
            margin-top: 0 !important; /* Sem margin superior */
        }
        
        /* Layout grid para acomodar preview maior */
        .main-content {
            display: grid !important;
            grid-template-columns: 1fr 460px !important;
            gap: 40px !important;
            align-items: start !important;
        }
        
        @media (min-width: 1200px) {
            .main-content {
                grid-template-columns: 1fr 460px !important;
            }
        }
        
        @media (max-width: 1199px) {
            .main-content {
                grid-template-columns: 1fr !important;
                gap: 30px !important;
            }
            
            .preview-image {
                max-width: 100%;
                height: auto;
                min-height: 200px;
            }
            
            .hero-section-mini {
                transform: scale(0.9);
                transform-origin: center;
            }
        }
    </style>
</head>
<body>
    <!-- Particles Background (atrás de tudo) -->
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
        <div class="loading-text">Carregando dados do evento...</div>
        <div class="loading-subtext">Aguarde enquanto carregamos as informações</div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="logo-section">
            <img src="/img/logohori.png" style="width:100%; max-width:200px;" alt="AnySummit">
        </div>
        
        <div class="header-right">
            <div class="menu-toggle" onClick="toggleMobileMenu()">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>
            <div class="user-menu">
                <div class="user-icon" onClick="toggleUserDropdown()">
                    <?php if ($usuario && !empty($usuario['foto_perfil'])): ?>
                        <img src="/uploads/capas/<?php echo htmlspecialchars($usuario['foto_perfil']); ?>" 
                             alt="Foto do usuário" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <?php else: ?>
                        👤
                    <?php endif; ?>
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" onClick="window.location.href='perfil.php'">
                        👤 Perfil
                    </div>
                    <div class="dropdown-item" onClick="logout()">
                        🚪 Sair
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Mobile Overlay -->
    <div class="mobile-overlay" id="mobileOverlay" onClick="closeMobileMenu()"></div>

    <!-- Main Layout -->
    <div class="main-layout">
        <!-- Sidebar -->
        <?php include 'menu.php'; ?>

        <!-- Content Area -->
        <main class="content-area">
         <div class="container">
          <div class="header" style="display: block; position: relative; z-index: 8; text-align: center; margin-bottom: 25px; border-radius: 20px;">
               <p>Editar Evento</p>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-line" id="progressLine"></div>
                <div class="step active" data-step="1">
                    <div class="step-number"><span>1</span></div>
                    <div class="step-title">Informações</div>
                </div>
                <div class="step" data-step="2">
                    <div class="step-number"><span>2</span></div>
                    <div class="step-title">Data e Hora</div>
                </div>
                <div class="step" data-step="3">
                    <div class="step-number"><span>3</span></div>
                    <div class="step-title">Descrição</div>
                </div>
                <div class="step" data-step="4">
                    <div class="step-number"><span>4</span></div>
                    <div class="step-title">Localização</div>
                </div>
                <div class="step" data-step="5">
                    <div class="step-number"><span>5</span></div>
                    <div class="step-title">Organizador</div>
                </div>
            </div>
          </div>

            <div class="main-content">
                <div class="form-container">
                    
                    <!-- Step 1: Informações Básicas -->
                    <div class="section-card active" data-step-content="1">
                        <div class="section-header">
                            <div class="section-number">1</div>
                            <div>
                                <div class="section-title">📦 Informações básicas</div>
                                <div class="section-subtitle">Adicione as principais informações do evento</div>
                            </div>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="eventName">Nome do evento <span class="required">*</span></label>
                            <input type="text" id="eventName" placeholder="Ex: Summit de Tecnologia 2025" required>
                        </div>

                        <!-- Imagens do evento -->
                        <div class="images-section" style="margin-top: 30px;">
                            
                            <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                                <!-- Logo do Evento -->
                                <div class="form-group">
                                    <label>Logo do Evento</label>
                                    <div class="upload-area small" onClick="document.getElementById('logoUpload').click()" style="min-height: 150px; position: relative;">
                                        <div id="logoPreviewContainer" class="preview-container">
                                            <div class="upload-icon">🎨</div>
                                            <div class="upload-text">Adicionar logo</div>
                                            <div class="upload-hint">800x200px • Fundo transparente</div>
                                        </div>
                                        <button class="btn-clear-image" id="clearLogo" style="display: none;" onclick="clearImage('logo', event)" title="Remover imagem">
                                            <span style="font-size: 12px;">✕</span>
                                        </button>
                                    </div>
                                    <input type="file" id="logoUpload" accept="image/*" style="display: none;">
                                </div>

                                <!-- Imagem de Capa Quadrada -->
                                <div class="form-group">
                                    <label>Imagem de Capa (Quadrada)</label>
                                    <div class="upload-area small" onClick="document.getElementById('capaUpload').click()" style="min-height: 150px; position: relative;">
                                        <div id="capaPreviewContainer" class="preview-container">
                                            <div class="upload-icon">🖼️</div>
                                            <div class="upload-text">Adicionar capa</div>
                                            <div class="upload-hint">450x450px • Fundo transparente</div>
                                        </div>
                                        <button class="btn-clear-image" id="clearCapa" style="display: none;" onclick="clearImage('capa', event)" title="Remover imagem">
                                            <span style="font-size: 12px;">✕</span>
                                        </button>
                                    </div>
                                    <input type="file" id="capaUpload" accept="image/*" style="display: none;">
                                </div>
                            </div>

                            <!-- Imagem de Fundo -->
                            <div class="form-group full-width" style="margin-top: 20px;">
                                <label>Imagem de Fundo</label>
                                <div class="upload-area" onClick="document.getElementById('fundoUpload').click()" style="position: relative;">
                                    <div id="fundoPreviewMain" class="upload-preview-main">
                                        <div class="upload-icon">🌄</div>
                                        <div class="upload-text">Clique para adicionar imagem de fundo</div>
                                        <div class="upload-hint">PNG, JPG até 5MB • Tamanho ideal: 1920x640px</div>
                                    </div>
                                    <button class="btn-clear-image" id="clearFundo" style="display: none;" onclick="clearImage('fundo', event)" title="Remover imagem">
                                        <span style="font-size: 14px;">✕</span>
                                    </button>
                                </div>
                                <input type="file" id="fundoUpload" accept="image/*" style="display: none;">
                            </div>
                        </div>

                        <!-- Cor de Fundo Alternativa -->
                        <div class="form-group" style="margin-top: 20px;">
                                <label for="corFundo">Cor de Fundo Alternativa</label>
                                <div class="color-picker-container">
                                    <div class="color-picker-wrapper">
                                        <input type="color" id="corFundo" value="#000000">
                                        <div class="color-preview" id="colorPreview"></div>
                                    </div>
                                    <input type="text" id="corFundoHex" placeholder="#000000" maxlength="7" class="color-hex-input">
                                    <span class="color-hint">Cor usada quando não houver imagem de fundo</span>
                                </div>
                            </div>

                        <div class="validation-message" id="validation-step-1">
                            Por favor, preencha todos os campos obrigatórios.
                        </div>

                        <div class="step-navigation">
                            <button class="nav-btn btn-back" disabled>← Voltar</button>
                            <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                            <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                        </div>
                    </div>

                    <!-- Step 2: Data e Horário -->
                    <div class="section-card" data-step-content="2">
                        <div class="section-header">
                            <div class="section-number">2</div>
                            <div>
                                <div class="section-title">📅 Data e horário</div>
                                <div class="section-subtitle">Defina quando seu evento irá acontecer</div>
                            </div>
                        </div>

                        <!-- Classificação e Categoria -->
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="classification">Classificação do evento <span class="required">*</span></label>
                                <select id="classification">
                                    <option value="">Selecione uma classificação</option>
                                    <option value="livre">Livre</option>
                                    <option value="10">10 anos</option>
                                    <option value="12">12 anos</option>
                                    <option value="14">14 anos</option>
                                    <option value="16">16 anos</option>
                                    <option value="18">18 anos</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="category">Categoria <span class="required">*</span></label>
                                <select id="category">
                                    <option value="">Selecione uma categoria</option>
                                    <?php if (empty($categorias)): ?>
                                        <option value="1">Geral</option>
                                    <?php else: ?>
                                        <?php foreach ($categorias as $categoria): ?>
                                            <option value="<?php echo $categoria['id']; ?>"><?php echo htmlspecialchars($categoria['nome']); ?></option>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </select>
                            </div>
                        </div>

                        <div class="datetime-grid">
                            <div class="form-group">
                                <label for="startDateTime">Data e hora de início <span class="required">*</span></label>
                                <input type="datetime-local" id="startDateTime" required>
                            </div>
                            <div class="form-group">
                                <label for="endDateTime">Data e hora de término</label>
                                <input type="datetime-local" id="endDateTime">
                            </div>
                        </div>

                        <div class="validation-message" id="validation-step-2">
                            Por favor, defina a data e hora de início do evento.
                        </div>

                        <div class="step-navigation">
                            <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                            <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                            <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                        </div>
                    </div>

                    <!-- Step 3: Descrição do Evento -->
                    <div class="section-card" data-step-content="3">
                        <div class="section-header">
                            <div class="section-number">3</div>
                            <div>
                                <div class="section-title">📝 Descrição do evento</div>
                                <div class="section-subtitle">Conte sobre o seu evento, inclua detalhes e formatação</div>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label>Descrição completa</label>
                            <div class="editor-toolbar">
                                <button type="button" class="editor-btn" data-command="bold" title="Negrito">
                                    <strong>B</strong>
                                </button>
                                <button type="button" class="editor-btn" data-command="italic" title="Itálico">
                                    <em>I</em>
                                </button>
                                <button type="button" class="editor-btn" data-command="underline" title="Sublinhado">
                                    <u>U</u>
                                </button>
                                <div class="editor-separator"></div>
                                <button type="button" class="editor-btn" data-command="justifyLeft" title="Alinhar à esquerda">
                                    ◀
                                </button>
                                <button type="button" class="editor-btn" data-command="justifyCenter" title="Centralizar">
                                    ▬
                                </button>
                                <button type="button" class="editor-btn" data-command="justifyRight" title="Alinhar à direita">
                                    ▶
                                </button>
                                <button type="button" class="editor-btn" data-command="justifyFull" title="Justificar">
                                    ☰
                                </button>
                                <div class="editor-separator"></div>
                                <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Lista">
                                    •
                                </button>
                                <button type="button" class="editor-btn" data-command="createLink" title="Inserir link">
                                    🔗
                                </button>
                            </div>
                            <div id="eventDescription" class="rich-editor" contenteditable="true" placeholder="Descreva detalhadamente seu evento, inclua agenda, palestrantes, benefícios..." style="resize: vertical; overflow: auto; min-height: 200px;"></div>
                            <div class="char-counter" id="charCounter">0 caracteres</div>
                        </div>
                        
                        <div class="validation-message" id="validation-step-3">
                            Por favor, preencha todos os campos obrigatórios.
                        </div>

                        <div class="step-navigation">
                            <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                            <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                            <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                        </div>
                    </div>

                    <!-- Step 4: Localização -->
                    <div class="section-card" data-step-content="4">
                        <div class="section-header">
                            <div class="section-number">4</div>
                            <div>
                                <div class="section-title">📍 Onde o seu evento vai acontecer</div>
                                <div class="section-subtitle">Local físico ou plataforma online</div>
                            </div>
                        </div>

                        <div class="switch-container">
                            <div class="switch active" id="locationTypeSwitch">
                                <div class="switch-handle"></div>
                            </div>
                            <label>Evento presencial</label>
                        </div>

                        <div class="conditional-section show" id="presentialLocation">
                            <div class="form-group full-width">
                                <label for="addressSearch">Buscar endereço</label>
                                <div class="address-input-group">
                                    <div class="address-input-wrapper">
                                        <input type="text" 
                                               id="addressSearch" 
                                               placeholder="Ex: Av Paulista 1000, São Paulo" 
                                               autocomplete="off"
                                               spellcheck="false">
                                        <div id="addressSuggestions" class="address-suggestions"></div>
                                        <div class="address-loading" id="addressLoading">
                                            <div class="spinner"></div>
                                            <span>Buscando endereços...</span>
                                        </div>
                                    </div>
                                    <button type="button" 
                                            class="btn btn-primary btn-buscar-endereco" 
                                            onclick="searchAddressManual()">
                                        🔍 Buscar
                                    </button>
                                </div>
                            </div>
                            
                            <div class="location-grid address-fields" id="addressFields" style="margin-top: 20px;">
                                <div class="form-group" style="margin-top: 15px;">
                                    <label for="venueName">Nome do Local <span class="required">*</span> - Digite um nome conhecido para o local. Ex: Estádio do Maracanã</label>
                                    <input type="text" id="venueName" placeholder="Ex: Centro de Convenções Anhembi">
                                </div>
                                <div class="form-group">
                                    <label for="cep">CEP</label>
                                    <input type="text" id="cep" placeholder="00000-000" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="street">Rua</label>
                                    <input type="text" id="street" placeholder="Nome da rua" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="number">Número</label>
                                    <input type="text" id="number" placeholder="123">
                                </div>
                                <div class="form-group">
                                    <label for="complement">Complemento</label>
                                    <input type="text" id="complement" placeholder="Sala, andar...">
                                </div>
                                <div class="form-group">
                                    <label for="neighborhood">Bairro</label>
                                    <input type="text" id="neighborhood" placeholder="Nome do bairro" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="city">Cidade</label>
                                    <input type="text" id="city" placeholder="Nome da cidade" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="state">Estado</label>
                                    <input type="text" id="state" placeholder="Estado" readonly>
                                </div>
                            </div>
                            
                            <!-- Campos hidden para latitude/longitude -->
                            <input type="hidden" id="latitude" value="">
                            <input type="hidden" id="longitude" value="">
                            
                            <div id="map" class="map-container" style="display:none;"></div>
                        </div>

                        <div class="conditional-section" id="onlineLocation">
                            <div class="form-group">
                                <label for="eventLink">Link do evento <span class="required">*</span></label>
                                <input type="url" id="eventLink" placeholder="https://zoom.us/j/123456789">
                            </div>
                        </div>

                        <div class="validation-message" id="validation-step-4">
                            Por favor, informe o local do evento.
                        </div>

                        <div class="step-navigation">
                            <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                            <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                            <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                        </div>
                    </div>

                    <!-- Step 5: Organizador e Configurações -->
                    <div class="section-card" data-step-content="5">
                        <div class="section-header">
                            <div class="section-number">5</div>
                            <div>
                                <div class="section-title">🏢 Organizador e Configurações</div>
                                <div class="section-subtitle">Defina o organizador responsável e configurações do evento</div>
                            </div>
                        </div>

                        <!-- Organizador e Visibilidade -->
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="contratante">Organizador Responsável <span class="required">*</span></label>
                                <select id="contratante" required>
                                    <option value="">Selecione o organizador</option>
                                    <?php foreach ($contratantes as $contratante): ?>
                                        <option value="<?php echo $contratante['id']; ?>"><?php echo htmlspecialchars($contratante['razao_social']); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="visibilidade">Visibilidade do Evento <span class="required">*</span></label>
                                <select id="visibilidade" required>
                                    <option value="">Selecione a visibilidade</option>
                                    <option value="publico">Público</option>
                                    <option value="privado">Privado</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-hint" style="margin-top: 30px; margin-bottom: 30px;">
                            <strong>Eventos privados</strong> não terão página pública para compra de ingressos. 
                            A página de venda somente será acessível via link privado.
                        </div>

                        <!-- Aceite de Termos (apenas para rascunhos) -->
                        <?php if ($dados_evento['status'] === 'rascunho'): ?>
                        <div class="form-group" style="margin-top: 30px;">
                            <div class="checkbox-container" style="display: flex; align-items: flex-start; gap: 10px;">
                                <input type="checkbox" id="aceitarTermos" style="margin-top: 3px;" <?php echo !empty($dados_evento['termos_aceitos']) && $dados_evento['termos_aceitos'] == 1 ? 'checked readonly onclick="return false;"' : ''; ?>>
                                <label for="aceitarTermos" style="flex: 1; line-height: 1.4;">
                                    Aceito os <a href="#" onclick="abrirTermos(); return false;">Termos de Uso</a> e 
                                    <a href="#" onclick="abrirPoliticas(); return false;">Políticas de Privacidade</a>
                                </label>
                            </div>
                        </div>

                        <!-- Status do Evento (apenas se termos aceitos) -->
                        <div class="form-group" id="statusContainer" style="margin-top: 30px; <?php echo empty($dados_evento['dados_aceite']) ? 'display: none;' : ''; ?>">
                            <label for="statusEvento">Situação do Evento</label>
                            <select id="statusEvento">
                                <option value="rascunho" <?php echo $dados_evento['status'] === 'rascunho' ? 'selected' : ''; ?>>Rascunho</option>
                                <option value="publicado" <?php echo $dados_evento['status'] === 'publicado' ? 'selected' : ''; ?>>Publicado</option>
                                <option value="pausado" <?php echo $dados_evento['status'] === 'pausado' ? 'selected' : ''; ?>>Pausado</option>
                                <option value="cancelado" <?php echo $dados_evento['status'] === 'cancelado' ? 'selected' : ''; ?>>Cancelado</option>
                                <option value="finalizado" <?php echo $dados_evento['status'] === 'finalizado' ? 'selected' : ''; ?>>Finalizado</option>
                            </select>
                        </div>
                        <?php endif; ?>

                        <div class="validation-message" id="validation-step-5">
                            Por favor, preencha todos os campos obrigatórios.
                        </div>

                        <div class="step-navigation">
                            <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                            <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                            <button class="nav-btn btn-save" id="saveButton" onClick="saveEventData()" disabled>💾 Salvar Alterações</button>
                        </div>
                    </div>

                </div>

                <!-- Preview Card -->
                <div class="preview-card">
                    <div class="preview-title">
                        👁️ Prévia do Evento
                    </div>
                    <div class="preview-image" id="previewImage">
                        <!-- Preview Proporcional da Section -->
                        <div class="hero-section-mini">
                            <!-- Container com padding proporcional E background -->
                            <div class="hero-mini-container" style="position: relative; width: 100%; height: 150px; background-size: cover; background-position: center; background-repeat: no-repeat;">
                                <div class="hero-mini-row">
                                    <!-- Coluna esquerda (66% - similar a col-lg-8) -->
                                    <div class="hero-mini-left">
                                        <!-- Logo do evento -->
                                        <div class="hero-mini-logo-area">
                                            <img id="heroLogo" class="hero-mini-logo" src="" alt="Logo" style="display: none;">
                                        </div>
                                    </div>
                                    
                                    <!-- Coluna direita (33% - similar a col-lg-4) -->
                                    <div class="hero-mini-right">
                                        <!-- Imagem capa -->
                                        <img id="heroCapa" class="hero-mini-capa" src="" alt="Capa" style="display: none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="preview-content">
                        <div class="preview-event-title" id="previewTitle">Nome do evento</div>
                        <div class="preview-description" id="previewDescription">Descrição do evento aparecerá aqui...</div>
                        <div class="preview-details">
                            <div class="preview-detail">
                                <div class="detail-icon">📅</div>
                                <span id="previewDate">Data não definida</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon">📍</div>
                                <span id="previewLocation">Local não definido</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon">🏷️</div>
                                <span id="previewCategory">Categoria não definida</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon">🌐</div>
                                <span id="previewType">Presencial</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript Integrado -->
    <script>
        // ========================================
        // CONFIGURAÇÕES GLOBAIS
        // ========================================
        
        let currentStep = 1;
        const maxSteps = 5;
        const evento_id = <?php echo $evento_id; ?>;
        let eventData = <?php echo json_encode($dados_evento); ?>;
        let isLoading = false;
        let isSaving = false;
        let isInitialLoad = true; // ✅ Flag para evitar auto-save durante carregamento
        
        // Dados da sessão PHP
        window.sessionData = {
            usuarioId: <?php echo json_encode($usuario_id); ?>,
            usuarioNome: <?php echo json_encode($usuario['nome'] ?? ''); ?>,
            usuarioEmail: <?php echo json_encode($usuario['email'] ?? ''); ?>,
            termosDefault: <?php echo json_encode($parametros['termos_eventos_default']); ?>,
            politicasDefault: <?php echo json_encode($parametros['politicas_eventos_default']); ?>
        };

        // Debug do valor original da classificacao
        console.log('=== DEBUG CLASSIFICACAO ===');
        console.log('Valor raw do PHP:', <?php echo json_encode($dados_evento['classificacao'] ?? 'NULL'); ?>);
        console.log('Tipo do valor:', typeof <?php echo json_encode($dados_evento['classificacao'] ?? 'NULL'); ?>);
        console.log('========================');

        // ========================================
        // SISTEMA DE LOADING
        // ========================================
        
        function showLoading(text = 'Carregando...', subtext = '') {
            const overlay = document.getElementById('loadingOverlay');
            const loadingText = overlay.querySelector('.loading-text');
            const subText = overlay.querySelector('.loading-subtext');
            
            loadingText.textContent = text;
            subText.textContent = subtext;
            overlay.style.display = 'flex';
            isLoading = true;
        }
        
        function hideLoading() {
            const overlay = document.getElementById('loadingOverlay');
            overlay.style.display = 'none';
            isLoading = false;
        }
        
        // ========================================
        // FUNÇÕES DE COLETA DE INFORMAÇÕES DO DISPOSITIVO
        // ========================================
        
        async function getClientIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                return data.ip;
            } catch (error) {
                console.log('Erro ao obter IP:', error);
                return 'unknown';
            }
        }
        
        function getBrowserInfo() {
            const ua = navigator.userAgent;
            let browser = 'Unknown';
            
            if (ua.includes('Chrome')) browser = 'Chrome';
            else if (ua.includes('Firefox')) browser = 'Firefox';
            else if (ua.includes('Safari')) browser = 'Safari';
            else if (ua.includes('Edge')) browser = 'Edge';
            else if (ua.includes('Opera')) browser = 'Opera';
            
            return browser;
        }
        
        async function getLocationInfo() {
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    resolve({ available: false, error: 'Geolocation not supported' });
                    return;
                }
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            available: true,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: position.timestamp
                        });
                    },
                    (error) => {
                        resolve({
                            available: false,
                            error: error.message,
                            code: error.code
                        });
                    },
                    { timeout: 5000, enableHighAccuracy: false }
                );
            });
        }
        
        // ========================================
        // FUNÇÕES DE TIMEZONE
        // ========================================
        
        function convertUTCToLocal(utcDateString) {
            if (!utcDateString) return '';
            
            // Criar data UTC
            const utcDate = new Date(utcDateString + 'Z'); // Força UTC
            
            // Converter para timezone local e formatar para datetime-local
            const year = utcDate.getFullYear();
            const month = String(utcDate.getMonth() + 1).padStart(2, '0');
            const day = String(utcDate.getDate()).padStart(2, '0');
            const hours = String(utcDate.getHours()).padStart(2, '0');
            const minutes = String(utcDate.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        
        function convertLocalToUTC(localDateString) {
            if (!localDateString) return '';
            
            // Criar date local e converter para UTC
            const localDate = new Date(localDateString);
            
            // Retornar no formato UTC para o servidor
            return localDate.toISOString().slice(0, 19).replace('T', ' ');
        }
        
        // ========================================
        // CARREGAMENTO DE DADOS (DIRETO DO PHP)
        // ========================================
        
        function loadEventData() {
            console.log('Carregando dados do evento do PHP:', eventData);
            console.log('Campo logo_evento:', eventData.logo_evento);
            console.log('Campo imagem_capa:', eventData.imagem_capa);
            console.log('Campo classificacao ORIGINAL:', eventData.classificacao);
            
            // Dados já estão carregados do PHP
            populateFormFields();
            updatePreview();
            enableSaveButton();
            
            // Liberar auto-save após carregamento
            setTimeout(() => {
                isInitialLoad = false;
                console.log('Auto-save liberado após carregamento inicial');
            }, 2000);
        }
        
        // ========================================
        // POPULAÇÃO DOS CAMPOS DO FORMULÁRIO
        // ========================================
        
        function getImageUrl(imagePath) {
            if (!imagePath) return null;
            
            console.log('getImageUrl chamada com:', imagePath);
            
            // Se já começa com http:// ou https://
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath;
            }
            
            // Se já começa com /uploads/, usar diretamente
            if (imagePath.startsWith('/uploads/')) {
                return imagePath;
            }
            
            // Se já começa com uploads/, adicionar apenas /
            if (imagePath.startsWith('uploads/')) {
                return '/' + imagePath;
            }
            
            // Caso contrário, é apenas o nome do arquivo - usar /uploads/eventos/
            const finalUrl = `/uploads/eventos/${imagePath}`;
            console.log('URL final gerada:', finalUrl);
            return finalUrl;
        }

        function populateFormFields() {
            // Etapa 1 - Informações básicas
            setFieldValue('eventName', eventData.nome);
            setFieldValue('corFundo', eventData.cor_fundo || '#000000');
            setFieldValue('corFundoHex', eventData.cor_fundo || '#000000');
            
            // Imagens - usando função auxiliar para URL
            if (eventData.logo_evento) {
                const logoUrl = getImageUrl(eventData.logo_evento);
                console.log('Logo URL montada:', logoUrl);
                showImagePreview('logo', logoUrl, eventData.logo_evento);
                // Forçar atualização do hero logo
                setTimeout(() => {
                    updateHeroLogo(logoUrl);
                }, 200);
            }
            if (eventData.imagem_capa) {
                const capaUrl = getImageUrl(eventData.imagem_capa);
                console.log('Capa URL montada:', capaUrl);
                showImagePreview('capa', capaUrl, eventData.imagem_capa);
                // Forçar atualização do hero capa
                setTimeout(() => {
                    updateHeroCapa(capaUrl);
                }, 200);
            }
            if (eventData.imagem_fundo) {
                const fundoUrl = getImageUrl(eventData.imagem_fundo);
                console.log('Fundo URL montada:', fundoUrl);
                showImagePreview('fundo', fundoUrl, eventData.imagem_fundo);
                // Forçar atualização do hero fundo
                setTimeout(() => {
                    updateHeroBackground(fundoUrl);
                }, 200);
            }
            
            // Etapa 2 - Data e horário (com conversão de timezone)
            console.log('Valor classificacao do BD:', eventData.classificacao);
            setFieldValue('classification', eventData.classificacao);
            setFieldValue('category', eventData.categoria_id);
            
            if (eventData.data_inicio) {
                const localStartDate = convertUTCToLocal(eventData.data_inicio);
                console.log('Data início UTC:', eventData.data_inicio, '-> Local:', localStartDate);
                setFieldValue('startDateTime', localStartDate);
            }
            if (eventData.data_fim) {
                const localEndDate = convertUTCToLocal(eventData.data_fim);
                console.log('Data fim UTC:', eventData.data_fim, '-> Local:', localEndDate);
                setFieldValue('endDateTime', localEndDate);
            }
            
            // Etapa 3 - Descrição
            const descElement = document.getElementById('eventDescription');
            if (descElement && eventData.descricao) {
                descElement.innerHTML = eventData.descricao;
                updateCharCounter();
            }
            
            // Etapa 4 - Localização
            if (eventData.tipo_local === 'online') {
                switchToOnlineMode();
                setFieldValue('eventLink', eventData.link_online);
            } else {
                switchToPresentialMode();
                setFieldValue('venueName', eventData.nome_local);
                setFieldValue('cep', eventData.cep);
                setFieldValue('street', eventData.rua);
                setFieldValue('number', eventData.numero);
                setFieldValue('complement', eventData.complemento);
                setFieldValue('neighborhood', eventData.bairro);
                setFieldValue('city', eventData.cidade);
                setFieldValue('state', eventData.estado);
                setFieldValue('latitude', eventData.latitude);
                setFieldValue('longitude', eventData.longitude);
            }
            
            // Etapa 5 - Organizador e Configurações
            setFieldValue('contratante', eventData.contratante_id);
            setFieldValue('visibilidade', eventData.visibilidade);
            setFieldValue('statusEvento', eventData.status);
            
            // Checkbox de termos (se termos_aceitos = 1)
            const aceitarTermosCheckbox = document.getElementById('aceitarTermos');
            if (aceitarTermosCheckbox && eventData.termos_aceitos == 1) {
                aceitarTermosCheckbox.checked = true;
                aceitarTermosCheckbox.onclick = function() { return false; };
                aceitarTermosCheckbox.style.pointerEvents = 'none';
            }
            
            console.log('Campos preenchidos com dados do evento');
        }
        
        // ========================================
        // FUNÇÕES AUXILIARES
        // ========================================
        
        function setFieldValue(fieldId, value) {
            const field = document.getElementById(fieldId);
            if (field && value !== null && value !== undefined && value !== '') {
                // Tratamento especial para classificacao
                if (fieldId === 'classification') {
                    console.log('Definindo classificacao:', value, 'tipo:', typeof value);
                    // Garantir que apenas valores válidos sejam usados
                    const validValues = ['livre', '10', '12', '14', '16', '18'];
                    if (!validValues.includes(value.toString())) {
                        console.warn('Valor inválido para classificacao:', value, 'usando "livre"');
                        value = 'livre';
                    }
                }
                
                field.value = value;
                
                // NÃO disparar auto-save durante carregamento inicial
                if (!isInitialLoad) {
                    // Trigger change event para atualizar preview
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                console.log(`Campo ${fieldId}: valor null/undefined/vazio ignorado:`, value);
            }
        }
        
        function formatDateTimeLocal(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
        }
        
        function showImagePreview(type, url, filename) {
            console.log(`showImagePreview chamada com: type=${type}, url=${url}, filename=${filename}`);
            
            // Verificar se URL é válida (não null, não vazia)
            if (!url || url === 'null' || url === 'undefined' || url === '') {
                console.log(`URL inválida para ${type}, ignorando`);
                return;
            }
            
            // Definir containers corretos para cada tipo
            let container;
            if (type === 'fundo') {
                container = document.getElementById('fundoPreviewMain');
            } else {
                container = document.getElementById(`${type}PreviewContainer`);
            }
            
            const clearBtn = document.getElementById(`clear${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            console.log(`Container ${type}:`, container);
            
            if (container && url) {
                // Debug da URL final
                console.log(`URL final da imagem ${type}:`, url);
                
                if (type === 'fundo') {
                    // Para imagem de fundo, substituir todo o conteúdo do fundoPreviewMain
                    container.innerHTML = `<img src="${url}" alt="${filename || 'Imagem'}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" onerror="console.error('Erro ao carregar imagem:', this.src); this.style.display='none';">`;
                    console.log('✅ Imagem de fundo inserida no fundoPreviewMain');
                } else {
                    container.innerHTML = `<img src="${url}" alt="${filename || 'Imagem'}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" onerror="console.error('Erro ao carregar imagem:', this.src); this.style.display='none';">`;
                }
                
                if (clearBtn) {
                    clearBtn.style.display = 'block';
                    console.log(`✅ Botão clear ${type} mostrado`);
                }
                
                // Atualizar preview hero IMEDIATAMENTE
                console.log(`🎨 Atualizando preview hero para ${type}...`);
                if (type === 'logo') {
                    updateHeroLogo(url);
                } else if (type === 'capa') {
                    updateHeroCapa(url);
                } else if (type === 'fundo') {
                    updateHeroBackground(url);
                }
                
                // NOVA FUNÇÃO: Atualizar preview hero com nova estrutura
                if (typeof window.atualizarPreviewHero === 'function') {
                    setTimeout(() => {
                        window.atualizarPreviewHero();
                    }, 500);
                }
                
                // Forçar atualização completa do preview após um pequeno delay
                setTimeout(() => {
                    updateHeroPreview();
                }, 100);
            } else {
                console.log(`❌ Container não encontrado ou URL inválida para ${type}`);
                console.log(`Tentou buscar container:`, type === 'fundo' ? 'fundoPreviewMain' : `${type}PreviewContainer`);
            }
        }
        
        function enableSaveButton() {
            const saveBtn = document.getElementById('saveButton');
            if (saveBtn) {
                saveBtn.disabled = false;
            }
        }
        
        // ========================================
        // SISTEMA DE NAVEGAÇÃO
        // ========================================
        
        function nextStep() {
            if (validateCurrentStep() && currentStep < maxSteps) {
                currentStep++;
                showStep(currentStep);
            }
        }
        
        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        }
        
        function showStep(step) {
            // Esconder todas as etapas
            document.querySelectorAll('[data-step-content]').forEach(el => {
                el.classList.remove('active');
            });
            
            // Mostrar etapa atual
            const currentStepEl = document.querySelector(`[data-step-content="${step}"]`);
            if (currentStepEl) {
                currentStepEl.classList.add('active');
            }
            
            // Atualizar indicadores de progresso
            updateProgressBar();
            updateStepIndicators();
            
            // Atualizar botões de navegação
            updateNavigationButtons();
        }
        
        function updateProgressBar() {
            const progressLine = document.getElementById('progressLine');
            if (progressLine) {
                const percentage = ((currentStep - 1) / (maxSteps - 1)) * 100;
                progressLine.style.width = percentage + '%';
            }
        }
        
        function updateStepIndicators() {
            document.querySelectorAll('.step').forEach((step, index) => {
                const stepNum = index + 1;
                step.classList.remove('active', 'completed');
                
                if (stepNum < currentStep) {
                    step.classList.add('completed');
                } else if (stepNum === currentStep) {
                    step.classList.add('active');
                }
            });
        }
        
        function updateNavigationButtons() {
            // Botão voltar
            document.querySelectorAll('.btn-back').forEach(btn => {
                btn.disabled = currentStep === 1;
            });
            
            // Botão continuar vs salvar
            document.querySelectorAll('.btn-continue').forEach(btn => {
                if (currentStep === maxSteps) {
                    btn.style.display = 'none';
                } else {
                    btn.style.display = 'inline-block';
                }
            });
            
            document.querySelectorAll('.btn-save').forEach(btn => {
                if (currentStep === maxSteps) {
                    btn.style.display = 'inline-block';
                } else {
                    btn.style.display = 'none';
                }
            });
        }
        
        // ========================================
        // VALIDAÇÃO POR ETAPA
        // ========================================
        
        function validateCurrentStep() {
            const validationMsg = document.getElementById(`validation-step-${currentStep}`);
            let isValid = true;
            let errorMessage = '';
            
            switch (currentStep) {
                case 1:
                    const eventName = document.getElementById('eventName').value.trim();
                    if (!eventName) {
                        isValid = false;
                        errorMessage = 'Por favor, preencha o nome do evento.';
                    }
                    break;
                    
                case 2:
                    const classification = document.getElementById('classification').value;
                    const category = document.getElementById('category').value;
                    const startDate = document.getElementById('startDateTime').value;
                    
                    if (!classification || !category || !startDate) {
                        isValid = false;
                        errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
                    }
                    break;
                    
                case 3:
                    const description = document.getElementById('eventDescription').innerHTML.trim();
                    if (!description || description === '<br>' || description === '') {
                        isValid = false;
                        errorMessage = 'Por favor, adicione uma descrição para o evento.';
                    }
                    break;
                    
                case 4:
                    const isOnline = !document.getElementById('locationTypeSwitch').classList.contains('active');
                    if (isOnline) {
                        const eventLink = document.getElementById('eventLink').value.trim();
                        if (!eventLink) {
                            isValid = false;
                            errorMessage = 'Por favor, informe o link do evento online.';
                        }
                    } else {
                        const venueName = document.getElementById('venueName').value.trim();
                        if (!venueName) {
                            isValid = false;
                            errorMessage = 'Por favor, informe o nome do local.';
                        }
                    }
                    break;
                    
                case 5:
                    const contratante = document.getElementById('contratante').value;
                    const visibilidade = document.getElementById('visibilidade').value;
                    
                    if (!contratante || !visibilidade) {
                        isValid = false;
                        errorMessage = 'Por favor, preencha o organizador e visibilidade.';
                    }
                    break;
            }
            
            // Mostrar/esconder mensagem de validação
            if (validationMsg) {
                if (!isValid) {
                    validationMsg.textContent = errorMessage;
                    validationMsg.style.display = 'block';
                } else {
                    validationMsg.style.display = 'none';
                }
            }
            
            return isValid;
        }
        
        // ========================================
        // FUNÇÃO SALVAR DADOS
        // ========================================
        
        async function saveEventData() {
            if (isSaving || isInitialLoad) {
                console.log('Salvamento cancelado - isSaving:', isSaving, 'isInitialLoad:', isInitialLoad);
                return;
            }
            
            try {
                isSaving = true;
                showLoading('Salvando alterações...', 'Aguarde enquanto atualizamos os dados');
                
                const formData = new FormData();
                formData.append('evento_id', evento_id);
                formData.append('action', 'update_event');
                
                // Coletar dados de todos os campos (com validação para campos numéricos)
                const fieldsToSave = [
                    'eventName', 'classification', 'corFundo', 'venueName', 'cep', 'street', 'number', 'complement',
                    'neighborhood', 'city', 'state', 'eventLink', 'visibilidade'
                ];
                
                fieldsToSave.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field && field.value.trim() !== '') {
                        console.log(`Campo ${fieldId}: "${field.value}"`);
                        formData.append(fieldId, field.value);
                    }
                });
                
                // Campos numéricos - só enviar se preenchidos
                const numericFields = [
                    { id: 'category', name: 'category' },
                    { id: 'contratante', name: 'contratante' },
                    { id: 'latitude', name: 'latitude' },
                    { id: 'longitude', name: 'longitude' }
                ];
                
                numericFields.forEach(fieldInfo => {
                    const field = document.getElementById(fieldInfo.id);
                    if (field && field.value.trim() !== '' && !isNaN(field.value)) {
                        console.log(`Campo numérico ${fieldInfo.name}: ${field.value}`);
                        formData.append(fieldInfo.name, field.value);
                    }
                });
                
                // Status do evento (se disponível)
                const statusEvento = document.getElementById('statusEvento');
                if (statusEvento && statusEvento.value) {
                    formData.append('statusEvento', statusEvento.value);
                }
                
                // Aceite de termos (se marcado e ainda não foi salvo)
                const aceitarTermos = document.getElementById('aceitarTermos');
                if (aceitarTermos && aceitarTermos.checked && !aceitarTermos.disabled) {
                    // Coletar informações do dispositivo para o JSON
                    const deviceInfo = {
                        timestamp: new Date().toISOString(),
                        ip: await getClientIP(),
                        userAgent: navigator.userAgent,
                        browser: getBrowserInfo(),
                        screen: {
                            width: screen.width,
                            height: screen.height,
                            colorDepth: screen.colorDepth,
                            pixelDepth: screen.pixelDepth
                        },
                        window: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        language: navigator.language,
                        languages: navigator.languages,
                        platform: navigator.platform,
                        cookieEnabled: navigator.cookieEnabled,
                        onLine: navigator.onLine,
                        hardwareConcurrency: navigator.hardwareConcurrency,
                        maxTouchPoints: navigator.maxTouchPoints || 0,
                        doNotTrack: navigator.doNotTrack,
                        geolocation: await getLocationInfo()
                    };
                    
                    formData.append('aceitarTermos', JSON.stringify(deviceInfo));
                }
                
                // Datas com conversão de timezone
                const startDateTime = document.getElementById('startDateTime');
                const endDateTime = document.getElementById('endDateTime');
                
                if (startDateTime && startDateTime.value) {
                    const utcStart = convertLocalToUTC(startDateTime.value);
                    console.log('Start DateTime Local:', startDateTime.value, '-> UTC:', utcStart);
                    formData.append('startDateTime', utcStart);
                }
                
                if (endDateTime && endDateTime.value) {
                    const utcEnd = convertLocalToUTC(endDateTime.value);
                    console.log('End DateTime Local:', endDateTime.value, '-> UTC:', utcEnd);
                    formData.append('endDateTime', utcEnd);
                }
                
                // Descrição do rich editor
                const description = document.getElementById('eventDescription');
                if (description) {
                    formData.append('eventDescription', description.innerHTML);
                }
                
                // Tipo de localização
                const isOnline = !document.getElementById('locationTypeSwitch').classList.contains('active');
                formData.append('locationType', isOnline ? 'online' : 'presencial');
                
                // Upload de imagens (se houver)
                const uploadFields = ['logoUpload', 'capaUpload', 'fundoUpload'];
                uploadFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field && field.files && field.files[0]) {
                        formData.append(fieldId, field.files[0]);
                    }
                });
                
                const response = await fetch('/produtor/ajax/update_event.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('Dados salvos com sucesso');
                    
                    // Atualizar URLs das imagens se necessário
                    if (result.images) {
                        if (result.images.logo) updateHeroLogo(result.images.logo);
                        if (result.images.capa) updateHeroCapa(result.images.capa);
                        if (result.images.fundo) updateHeroBackground(result.images.fundo);
                    }
                } else {
                    throw new Error(result.message || 'Erro ao salvar');
                }
                
            } catch (error) {
                console.error('Erro ao salvar:', error);
                console.error('Stack trace:', error.stack);
                alert('Erro ao salvar alterações: ' + error.message);
            } finally {
                isSaving = false;
                hideLoading();
            }
        }
        
        // ========================================
        // SISTEMA DE PREVIEW
        // ========================================
        
        function updatePreview() {
            updatePreviewTitle();
            updatePreviewDescription();
            updatePreviewDate();
            updatePreviewLocation();
            updatePreviewCategory();
            updatePreviewType();
            updateHeroPreview(); // Chamar a função completa de preview das imagens
        }
        
        function updatePreviewTitle() {
            const title = document.getElementById('eventName').value;
            const previewTitle = document.getElementById('previewTitle');
            if (previewTitle) {
                previewTitle.textContent = title || 'Nome do evento';
            }
        }
        
        function updatePreviewDescription() {
            const desc = document.getElementById('eventDescription').innerHTML;
            const previewDesc = document.getElementById('previewDescription');
            if (previewDesc) {
                const plainText = desc.replace(/<[^>]*>/g, '').trim();
                previewDesc.textContent = plainText || 'Descrição do evento aparecerá aqui...';
            }
        }
        
        function updatePreviewDate() {
            const startDate = document.getElementById('startDateTime').value;
            const previewDate = document.getElementById('previewDate');
            if (previewDate) {
                if (startDate) {
                    const date = new Date(startDate);
                    const options = { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    };
                    previewDate.textContent = date.toLocaleString('pt-BR', options);
                } else {
                    previewDate.textContent = 'Data não definida';
                }
            }
        }
        
        function updatePreviewLocation() {
            const previewLocation = document.getElementById('previewLocation');
            const isOnline = !document.getElementById('locationTypeSwitch').classList.contains('active');
            
            if (previewLocation) {
                if (isOnline) {
                    const link = document.getElementById('eventLink').value;
                    previewLocation.textContent = link || 'Link não definido';
                } else {
                    const venueName = document.getElementById('venueName').value;
                    const city = document.getElementById('city').value;
                    
                    if (venueName && city) {
                        previewLocation.textContent = `${venueName}, ${city}`;
                    } else if (venueName) {
                        previewLocation.textContent = venueName;
                    } else {
                        previewLocation.textContent = 'Local não definido';
                    }
                }
            }
        }
        
        function updatePreviewCategory() {
            const categorySelect = document.getElementById('category');
            const previewCategory = document.getElementById('previewCategory');
            if (previewCategory && categorySelect) {
                const selectedOption = categorySelect.options[categorySelect.selectedIndex];
                previewCategory.textContent = selectedOption ? selectedOption.text : 'Categoria não definida';
            }
        }
        
        function updatePreviewType() {
            const previewType = document.getElementById('previewType');
            const isOnline = !document.getElementById('locationTypeSwitch').classList.contains('active');
            if (previewType) {
                previewType.textContent = isOnline ? 'Online' : 'Presencial';
            }
        }
        
        function updateHeroLogo(url) {
            console.log('🎨 updateHeroLogo chamada com URL:', url);
            const heroLogo = document.getElementById('heroLogo');
            console.log('heroLogo element:', heroLogo);
            
            if (heroLogo && url) {
                console.log('✅ Logo aplicado:', url);
                heroLogo.src = url;
                heroLogo.style.display = 'block';
                heroLogo.style.opacity = '1';
                heroLogo.style.visibility = 'visible';
                heroLogo.style.zIndex = '999';
                heroLogo.style.position = 'relative';
                heroLogo.style.maxWidth = '200px';
                heroLogo.style.maxHeight = '80px';
                heroLogo.style.objectFit = 'contain';
                
                // Teste de carregamento da imagem
                heroLogo.onload = function() {
                    console.log('✅ Logo carregado com sucesso no hero');
                    console.log('Dimensões logo:', this.naturalWidth, 'x', this.naturalHeight);
                    console.log('Estilo computado logo display:', window.getComputedStyle(this).display);
                    console.log('Estilo computado logo opacity:', window.getComputedStyle(this).opacity);
                    console.log('Estilo computado logo visibility:', window.getComputedStyle(this).visibility);
                };
                heroLogo.onerror = function() {
                    console.log('❌ Erro ao carregar logo no hero:', url);
                };
            } else if (heroLogo) {
                console.log('❌ Logo oculto - URL vazia');
                heroLogo.style.display = 'none';
            } else {
                console.log('❌ Elemento heroLogo não encontrado');
            }
        }
        
        function updateHeroCapa(url) {
            console.log('🎨 updateHeroCapa chamada com URL:', url);
            const heroCapa = document.getElementById('heroCapa');
            console.log('heroCapa element:', heroCapa);
            
            if (heroCapa && url) {
                console.log('✅ Capa aplicada:', url);
                heroCapa.src = url;
                heroCapa.style.display = 'block';
                heroCapa.style.opacity = '1';
                heroCapa.style.visibility = 'visible';
                heroCapa.style.zIndex = '999';
                heroCapa.style.position = 'relative';
                heroCapa.style.width = '120px';
                heroCapa.style.height = '120px';
                heroCapa.style.objectFit = 'cover';
                heroCapa.style.borderRadius = '8px';
                
                // Teste de carregamento da imagem
                heroCapa.onload = function() {
                    console.log('✅ Capa carregada com sucesso no hero');
                    console.log('Dimensões capa:', this.naturalWidth, 'x', this.naturalHeight);
                    console.log('Estilo computado capa display:', window.getComputedStyle(this).display);
                    console.log('Estilo computado capa opacity:', window.getComputedStyle(this).opacity);
                    console.log('Estilo computado capa visibility:', window.getComputedStyle(this).visibility);
                };
                heroCapa.onerror = function() {
                    console.log('❌ Erro ao carregar capa no hero:', url);
                };
            } else if (heroCapa) {
                console.log('❌ Capa oculta - URL vazia');
                heroCapa.style.display = 'none';
            } else {
                console.log('❌ Elemento heroCapa não encontrado');
            }
        }
        
        // Função para atualizar preview completo - SIMPLIFICADA
        function updateHeroPreview() {
            console.log('🎨 === ATUALIZANDO PREVIEW HERO COMPLETO ===');
            
            // Usar a nova função que funciona
            if (typeof window.atualizarPreviewHero === 'function') {
                window.atualizarPreviewHero();
                console.log('✅ Preview hero atualizado via nova função');
            } else {
                console.log('❌ Função atualizarPreviewHero não encontrada');
            }
        }
                    temSrc: logoImg ? logoImg.src : 'sem img',
                    naoEhPlaceholder: logoImg ? !logoImg.src.includes('placeholder') : false,
                    srcNaoVazio: logoImg ? logoImg.src !== '' : false,
                    imagemCarregada: logoImg ? logoImg.naturalWidth > 0 : false
                });
            }
        }
        
        function updateHeroBackground(url) {
            const heroBackground = document.getElementById('heroBackground');
            if (heroBackground) {
                if (url) {
                    console.log('Aplicando imagem de fundo:', url);
                    heroBackground.style.backgroundImage = `url('${url}')`;
                    heroBackground.style.backgroundColor = '';
                } else {
                    const color = document.getElementById('corFundo').value || '#000000';
                    console.log('Aplicando cor de fundo:', color);
                    heroBackground.style.backgroundImage = '';
                    heroBackground.style.backgroundColor = color;
                }
            }
        }
        
        function updateColorPreview() {
            const color = document.getElementById('corFundo').value;
            const colorPreview = document.getElementById('colorPreview');
            const colorHex = document.getElementById('corFundoHex');
            
            if (colorPreview) {
                colorPreview.style.backgroundColor = color;
            }
            if (colorHex) {
                colorHex.value = color;
            }
            
            // Atualizar background do preview sempre (se não houver imagem de fundo)
            const heroBackground = document.getElementById('heroBackground');
            if (heroBackground) {
                // Se não há imagem de fundo definida, usar a cor
                const hasBackgroundImage = heroBackground.style.backgroundImage && 
                                         heroBackground.style.backgroundImage !== 'none' && 
                                         heroBackground.style.backgroundImage !== '';
                if (!hasBackgroundImage) {
                    console.log('Aplicando cor de fundo no preview:', color);
                    heroBackground.style.backgroundColor = color;
                }
            }
        }
        
        // ========================================
        // SISTEMA DE UPLOAD DE IMAGENS
        // ========================================
        
        function setupImageUpload(type) {
            const uploadInput = document.getElementById(`${type}Upload`);
            const clearBtn = document.getElementById(`clear${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            if (uploadInput) {
                uploadInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        // Usar createObjectURL em vez de FileReader para melhor performance
                        const url = URL.createObjectURL(file);
                        showImagePreview(type, url, file.name);
                        
                        // REMOVIDO: Auto-save - apenas atualizar preview
                        console.log(`✅ Arquivo ${type} selecionado:`, file.name);
                    }
                });
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    clearImage(type);
                });
            }
        }
        
        function clearImage(type) {
            // Definir container correto para cada tipo
            let container;
            if (type === 'fundo') {
                container = document.getElementById('fundoPreviewMain');
            } else {
                container = document.getElementById(`${type}PreviewContainer`);
            }
            
            const clearBtn = document.getElementById(`clear${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const uploadInput = document.getElementById(`${type}Upload`);
            
            if (container) {
                // Restaurar estado original
                const icons = { logo: '🎨', capa: '🖼️', fundo: '🌄' };
                const texts = { logo: 'Adicionar logo', capa: 'Adicionar capa', fundo: 'Clique para adicionar imagem de fundo' };
                const hints = { 
                    logo: '800x200px • Fundo transparente', 
                    capa: '450x450px • Fundo transparente',
                    fundo: 'PNG, JPG até 5MB • Tamanho ideal: 1920x640px'
                };
                
                container.innerHTML = `
                    <div class="upload-icon">${icons[type]}</div>
                    <div class="upload-text">${texts[type]}</div>
                    <div class="upload-hint">${hints[type]}</div>
                `;
            }
            
            if (clearBtn) {
                clearBtn.style.display = 'none';
            }
            
            if (uploadInput) {
                uploadInput.value = '';
            }
            
            // Limpar preview hero
            if (type === 'logo') {
                const heroLogo = document.getElementById('heroLogo');
                if (heroLogo) {
                    heroLogo.style.display = 'none';
                    heroLogo.style.visibility = 'hidden';
                    heroLogo.src = '';
                    console.log('✅ Logo removido do preview hero');
                }
            } else if (type === 'capa') {
                const heroCapa = document.getElementById('heroCapa');
                if (heroCapa) {
                    heroCapa.style.display = 'none';
                    heroCapa.style.visibility = 'hidden';
                    heroCapa.src = '';
                    console.log('✅ Capa removida do preview hero');
                }
            } else if (type === 'fundo') {
                // Aplicar cor de fundo no hero-mini-container quando imagem for removida
                const heroContainer = document.querySelector('.hero-mini-container');
                if (heroContainer) {
                    heroContainer.style.backgroundImage = 'none';
                    
                    // Buscar cor de fundo atual
                    const corFundo = document.getElementById('corFundo');
                    const corFundoHex = document.getElementById('corFundoHex');
                    
                    if (corFundo && corFundo.value) {
                        heroContainer.style.backgroundColor = corFundo.value;
                        console.log('✅ Fundo removido, aplicada cor:', corFundo.value);
                    } else if (corFundoHex && corFundoHex.value) {
                        heroContainer.style.backgroundColor = corFundoHex.value;
                        console.log('✅ Fundo removido, aplicada cor hex:', corFundoHex.value);
                    } else {
                        heroContainer.style.backgroundColor = '#1a1a2e';
                        console.log('✅ Fundo removido, aplicada cor padrão');
                    }
                }
            }
        }
        
        // ========================================
        // SISTEMA DE LOCALIZAÇÃO
        // ========================================
        
        function setupLocationTypeSwitch() {
            const locationSwitch = document.getElementById('locationTypeSwitch');
            if (locationSwitch) {
                locationSwitch.addEventListener('click', function() {
                    if (this.classList.contains('active')) {
                        switchToOnlineMode();
                    } else {
                        switchToPresentialMode();
                    }
                    
                    // REMOVIDO: Auto-save - apenas atualizar preview
                });
            }
        }
        
        function switchToOnlineMode() {
            const locationSwitch = document.getElementById('locationTypeSwitch');
            const presentialSection = document.getElementById('presentialLocation');
            const onlineSection = document.getElementById('onlineLocation');
            
            if (locationSwitch) locationSwitch.classList.remove('active');
            if (presentialSection) presentialSection.classList.remove('show');
            if (onlineSection) onlineSection.classList.add('show');
            
            updatePreviewType();
            updatePreviewLocation();
        }
        
        function switchToPresentialMode() {
            const locationSwitch = document.getElementById('locationTypeSwitch');
            const presentialSection = document.getElementById('presentialLocation');
            const onlineSection = document.getElementById('onlineLocation');
            
            if (locationSwitch) locationSwitch.classList.add('active');
            if (presentialSection) presentialSection.classList.add('show');
            if (onlineSection) onlineSection.classList.remove('show');
            
            updatePreviewType();
            updatePreviewLocation();
        }
        
        // Sistema de busca de endereço
        function searchAddressManual() {
            const searchInput = document.getElementById('addressSearch');
            const query = searchInput.value.trim();
            
            if (!query) {
                alert('Digite um endereço para buscar');
                return;
            }
            
            searchAddress(query);
        }
        
        async function searchAddress(query) {
            const loadingDiv = document.getElementById('addressLoading');
            const suggestionsDiv = document.getElementById('addressSuggestions');
            
            try {
                if (loadingDiv) loadingDiv.style.display = 'flex';
                if (suggestionsDiv) suggestionsDiv.innerHTML = '';
                
                // Tentar buscar por CEP primeiro
                const cepOnly = query.replace(/\D/g, '');
                if (cepOnly.length === 8) {
                    const response = await fetch(`https://viacep.com.br/ws/${cepOnly}/json/`);
                    const data = await response.json();
                    
                    if (data && !data.erro) {
                        fillAddressFields(data);
                        updatePreviewLocation();
                        saveEventData();
                    } else {
                        alert('CEP não encontrado');
                    }
                } else {
                    alert('Digite um CEP válido com 8 dígitos');
                }
                
            } catch (error) {
                console.error('Erro na busca de endereço:', error);
                alert('Erro ao buscar endereço. Tente novamente.');
            } finally {
                if (loadingDiv) loadingDiv.style.display = 'none';
            }
        }
        
        function fillAddressFields(addressData) {
            const fields = {
                'cep': addressData.cep,
                'street': addressData.logradouro,
                'neighborhood': addressData.bairro,
                'city': addressData.localidade,
                'state': addressData.uf
            };
            
            Object.keys(fields).forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && fields[fieldId]) {
                    field.value = fields[fieldId];
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }
        
        // ========================================
        // RICH EDITOR
        // ========================================
        
        function setupRichEditor() {
            const toolbar = document.querySelector('.editor-toolbar');
            const editor = document.getElementById('eventDescription');
            
            if (toolbar) {
                toolbar.addEventListener('click', function(e) {
                    const button = e.target.closest('.editor-btn');
                    if (!button) return;
                    
                    e.preventDefault();
                    const command = button.getAttribute('data-command');
                    
                    if (command === 'createLink') {
                        const url = prompt('Digite a URL:');
                        if (url) {
                            document.execCommand('createLink', false, url);
                        }
                    } else {
                        document.execCommand(command, false, null);
                    }
                    
                    if (editor) {
                        editor.focus();
                        updateCharCounter();
                        updatePreviewDescription();
                    }
                });
            }
            
            if (editor) {
                editor.addEventListener('input', function() {
                    updateCharCounter();
                    updatePreviewDescription();
                });
                
                // REMOVIDO: Auto-save no blur - apenas atualizar preview
            }
        }
        
        function updateCharCounter() {
            const editor = document.getElementById('eventDescription');
            const counter = document.getElementById('charCounter');
            
            if (editor && counter) {
                const text = editor.innerText || editor.textContent || '';
                counter.textContent = text.length + ' caracteres';
            }
        }
        
        // ========================================
        // SISTEMA DE POPUPS PARA TERMOS E POLÍTICAS
        // ========================================
        
        function abrirTermos() {
            const popup = window.open('', 'termos', 'width=800,height=600,scrollbars=yes,resizable=yes');
            popup.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Termos de Uso</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h1 { color: #333; margin-bottom: 20px; }
                        .content { max-width: 100%; }
                    </style>
                </head>
                <body>
                    <h1>Termos de Uso</h1>
                    <div class="content">
                        ${window.sessionData.termosDefault}
                    </div>
                    <br><br>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Fechar</button>
                </body>
                </html>
            `);
            popup.document.close();
        }
        
        function abrirPoliticas() {
            const popup = window.open('', 'politicas', 'width=800,height=600,scrollbars=yes,resizable=yes');
            popup.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Políticas de Privacidade</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h1 { color: #333; margin-bottom: 20px; }
                        .content { max-width: 100%; }
                    </style>
                </head>
                <body>
                    <h1>Políticas de Privacidade</h1>
                    <div class="content">
                        ${window.sessionData.politicasDefault}
                    </div>
                    <br><br>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Fechar</button>
                </body>
                </html>
            `);
            popup.document.close();
        }
        
        // ========================================
        // SISTEMA DE ACEITE DE TERMOS
        // ========================================
        
        function setupAceiteTermos() {
            const aceitarTermos = document.getElementById('aceitarTermos');
            const statusContainer = document.getElementById('statusContainer');
            
            if (aceitarTermos && statusContainer) {
                aceitarTermos.addEventListener('change', function() {
                    if (this.checked) {
                        statusContainer.style.display = 'block';
                    } else {
                        statusContainer.style.display = 'none';
                        // Resetar status para rascunho se desmarcar
                        const statusEvento = document.getElementById('statusEvento');
                        if (statusEvento) {
                            statusEvento.value = 'rascunho';
                        }
                    }
                });
            }
        }
        
        // ========================================
        // EVENT LISTENERS E INICIALIZAÇÃO
        // ========================================
        
        function setupEventListeners() {
            // Event listeners para preview em tempo real
            const previewFields = [
                'eventName', 'startDateTime', 'endDateTime', 'classification', 
                'category', 'venueName', 'city', 'eventLink'
            ];
            
            previewFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', updatePreview);
                    field.addEventListener('change', updatePreview);
                    // REMOVIDO: Auto-save automático - apenas atualizar preview
                }
            });
            
            // Color picker - incluindo clique no preview
            const corFundo = document.getElementById('corFundo');
            const corFundoHex = document.getElementById('corFundoHex');
            const colorPreview = document.getElementById('colorPreview');
            
            if (corFundo) {
                corFundo.addEventListener('input', function() {
                    updateColorPreview();
                    updatePreview();
                });
                corFundo.addEventListener('change', updatePreview);
            }
            
            if (corFundoHex) {
                corFundoHex.addEventListener('input', function() {
                    const color = this.value;
                    if (/^#[0-9A-F]{6}$/i.test(color)) {
                        if (corFundo) corFundo.value = color;
                        updateColorPreview();
                        updatePreview();
                    }
                });
                corFundoHex.addEventListener('change', updatePreview);
            }
            
            // Permitir clicar no preview da cor para abrir o color picker
            if (colorPreview && corFundo) {
                colorPreview.addEventListener('click', function() {
                    corFundo.click();
                });
            }
            
            // Setup uploads
            setupImageUpload('logo');
            setupImageUpload('capa');
            setupImageUpload('fundo');
            
            // Setup location switch
            setupLocationTypeSwitch();
            
            // Setup rich editor
            setupRichEditor();
            
            // Setup aceite de termos
            setupAceiteTermos();
            
            // Busca de endereço
            const addressSearch = document.getElementById('addressSearch');
            if (addressSearch) {
                addressSearch.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        searchAddressManual();
                    }
                });
            }
        }
        
        // ========================================
        // INICIALIZAÇÃO PRINCIPAL
        // ========================================
        
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 INÍCIO: Editando evento', evento_id);
            
            // DEBUG: Verificar se elementos existem no DOM
            setTimeout(() => {
                console.log('🔍 VERIFICANDO ELEMENTOS NO DOM:');
                console.log('heroBackground existe?', !!document.getElementById('heroBackground'));
                console.log('heroLogo existe?', !!document.getElementById('heroLogo'));
                console.log('heroCapa existe?', !!document.getElementById('heroCapa'));
                console.log('hero-mini-background existe?', !!document.querySelector('.hero-mini-background'));
                console.log('hero-mini-container existe?', !!document.querySelector('.hero-mini-container'));
                console.log('hero-mini-row existe?', !!document.querySelector('.hero-mini-row'));
                
                // Mostrar HTML atual da area preview
                const previewImage = document.getElementById('previewImage');
                if (previewImage) {
                    console.log('HTML atual do previewImage:', previewImage.innerHTML);
                } else {
                    console.log('previewImage NÃO EXISTE');
                }
            }, 2000);
            
            // Setup inicial
            setupEventListeners();
            
            // Aguardar elementos estarem disponíveis e carregar dados
            setTimeout(() => {
                loadEventData();
                // updatePreview(); // COMENTADO TEMPORARIAMENTE PARA TESTE
                updateColorPreview();
                hideLoading();
                
                // SOLUÇÃO FINAL: Trabalhar com hero-mini-container como background
                setTimeout(() => {
                    console.log('🎯 APLICANDO FUNDO NO HERO-MINI-CONTAINER...');
                    
                    // Encontrar o hero-mini-container
                    const heroContainer = document.querySelector('.hero-mini-container');
                    console.log('hero-mini-container encontrado:', !!heroContainer);
                    
                    if (heroContainer) {
                        // Aplicar imagem de fundo OU cor de fundo
                        if (eventData.imagem_fundo) {
                            const fundoUrl = getImageUrl(eventData.imagem_fundo);
                            heroContainer.style.backgroundImage = `url('${fundoUrl}')`;
                            heroContainer.style.backgroundColor = '';
                            console.log('✅ Imagem de fundo aplicada:', fundoUrl);
                        } else if (eventData.cor_fundo) {
                            heroContainer.style.backgroundImage = 'none';
                            heroContainer.style.backgroundColor = eventData.cor_fundo;
                            console.log('✅ Cor de fundo aplicada:', eventData.cor_fundo);
                        } else {
                            heroContainer.style.backgroundImage = 'none';
                            heroContainer.style.backgroundColor = '#1a1a2e';
                            console.log('✅ Cor padrão aplicada');
                        }
                        
                        // Aplicar logo se existir OU ocultar se não existir
                        const heroLogo = document.getElementById('heroLogo');
                        if (eventData.logo_evento && heroLogo) {
                            const logoUrl = getImageUrl(eventData.logo_evento);
                            heroLogo.src = logoUrl;
                            heroLogo.style.display = 'block';
                            heroLogo.style.visibility = 'visible';
                            console.log('✅ Logo aplicado:', logoUrl);
                        } else if (heroLogo) {
                            heroLogo.style.display = 'none';
                            heroLogo.style.visibility = 'hidden';
                            heroLogo.src = '';
                            console.log('✅ Logo oculto (não existe)');
                        }
                        
                        // Aplicar capa se existir OU ocultar se não existir
                        const heroCapa = document.getElementById('heroCapa');
                        if (eventData.imagem_capa && heroCapa) {
                            const capaUrl = getImageUrl(eventData.imagem_capa);
                            heroCapa.src = capaUrl;
                            heroCapa.style.display = 'block';
                            heroCapa.style.visibility = 'visible';
                            console.log('✅ Capa aplicada:', capaUrl);
                        } else if (heroCapa) {
                            heroCapa.style.display = 'none';
                            heroCapa.style.visibility = 'hidden';
                            heroCapa.src = '';
                            console.log('✅ Capa oculta (não existe)');
                        }
                        
                        console.log('✅ PREVIEW HERO CONFIGURADO CORRETAMENTE!');
                        
                    } else {
                        console.log('❌ hero-mini-container não encontrado!');
                    }
                    
                }, 2000);
                
                // FUNÇÃO PARA ATUALIZAR PREVIEW QUANDO IMAGENS FOREM SUBSTITUÍDAS
                window.atualizarPreviewHero = function() {
                    console.log('🔄 ATUALIZANDO PREVIEW HERO APÓS UPLOAD...');
                    
                    const heroContainer = document.querySelector('.hero-mini-container');
                    if (heroContainer) {
                        // Recarregar eventData atual (pode ter sido modificado por upload)
                        if (window.eventData) {
                            if (window.eventData.imagem_fundo) {
                                const fundoUrl = getImageUrl(window.eventData.imagem_fundo);
                                heroContainer.style.backgroundImage = `url('${fundoUrl}')`;
                                heroContainer.style.backgroundColor = '';
                                console.log('🔄 Nova imagem de fundo aplicada:', fundoUrl);
                            }
                            
                            const heroLogo = document.getElementById('heroLogo');
                            if (window.eventData.logo_evento && heroLogo) {
                                const logoUrl = getImageUrl(window.eventData.logo_evento);
                                heroLogo.src = logoUrl;
                                heroLogo.style.display = 'block';
                                heroLogo.style.visibility = 'visible';
                                console.log('🔄 Novo logo aplicado:', logoUrl);
                            }
                            
                            const heroCapa = document.getElementById('heroCapa');
                            if (window.eventData.imagem_capa && heroCapa) {
                                const capaUrl = getImageUrl(window.eventData.imagem_capa);
                                heroCapa.src = capaUrl;
                                heroCapa.style.display = 'block';
                                heroCapa.style.visibility = 'visible';
                                console.log('🔄 Nova capa aplicada:', capaUrl);
                            }
                        }
                    }
                };
            }, 100);
            
            // Debug dos elementos críticos
            console.log('=== DEBUG ELEMENTOS CSS ===');
            console.log('corFundo element:', document.getElementById('corFundo'));
            console.log('main-content element:', document.querySelector('.main-content'));
            console.log('preview-card element:', document.querySelector('.preview-card'));
            console.log('heroLogo element:', document.getElementById('heroLogo'));
            console.log('heroCapa element:', document.getElementById('heroCapa'));
            console.log('heroBackground element:', document.getElementById('heroBackground'));
            console.log('=========================');
            
            // TESTE SIMPLES - APLICAR IMAGENS DIRETAMENTE
            console.log('🧪 === TESTE DIRETO ===');
            
            const heroLogo = document.getElementById('heroLogo');
            const heroCapa = document.getElementById('heroCapa');
            
            if (heroLogo) {
                console.log('✅ heroLogo encontrado');
                if (eventData.logo_evento) {
                    const logoUrl = '/uploads/eventos/' + eventData.logo_evento.split('/').pop();
                    console.log('🎯 Aplicando logo DIRETO:', logoUrl);
                    heroLogo.src = logoUrl;
                    heroLogo.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important; width: 150px !important; height: auto !important; border: 3px solid red !important; z-index: 9999 !important; position: relative !important;';
                    console.log('🎯 Logo aplicado com borda vermelha');
                }
            } else {
                console.log('❌ heroLogo NÃO encontrado');
            }
            
            if (heroCapa) {
                console.log('✅ heroCapa encontrado');
                if (eventData.imagem_capa) {
                    const capaUrl = '/uploads/eventos/' + eventData.imagem_capa.split('/').pop();
                    console.log('🎯 Aplicando capa DIRETO:', capaUrl);
                    heroCapa.src = capaUrl;
                    heroCapa.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important; width: 100px !important; height: 100px !important; border: 3px solid blue !important; z-index: 9999 !important; position: relative !important;';
                    console.log('🎯 Capa aplicada com borda azul');
                }
            } else {
                console.log('❌ heroCapa NÃO encontrado');
            }
            
            console.log('🧪 === FIM TESTE DIRETO ===');
            
            // Setup inicial
            setupEventListeners();
            
            // Aguardar elementos estarem disponíveis e carregar dados
            setTimeout(() => {
                loadEventData();
                updatePreview();
                updateColorPreview();
                
                // Debug completo após carregamento
                setTimeout(() => {
                    console.log('=== DEBUG COMPLETO APÓS CARREGAMENTO ===');
                    
                    // Verificar containers
                    const logoContainer = document.getElementById('logoPreviewContainer');
                    const capaContainer = document.getElementById('capaPreviewContainer');
                    const fundoContainer = document.getElementById('fundoPreviewMain');
                    
                    console.log('logoPreviewContainer existe:', !!logoContainer);
                    console.log('capaPreviewContainer existe:', !!capaContainer);
                    console.log('fundoPreviewMain existe:', !!fundoContainer);
                    
                    if (logoContainer) {
                        console.log('logoPreviewContainer HTML:', logoContainer.innerHTML);
                        const logoImg = logoContainer.querySelector('img');
                        if (logoImg) {
                            console.log('Logo img src:', logoImg.src);
                        }
                    }
                    
                    if (capaContainer) {
                        console.log('capaPreviewContainer HTML:', capaContainer.innerHTML);
                        const capaImg = capaContainer.querySelector('img');
                        if (capaImg) {
                            console.log('Capa img src:', capaImg.src);
                        }
                    }
                    
                    if (fundoContainer) {
                        console.log('fundoPreviewMain HTML:', fundoContainer.innerHTML);
                        const fundoImg = fundoContainer.querySelector('img');
                        if (fundoImg) {
                            console.log('Fundo img src:', fundoImg.src);
                        }
                    }
                    
                    // Verificar dados do evento
                    console.log('EventData logo_evento:', eventData.logo_evento);
                    console.log('EventData imagem_capa:', eventData.imagem_capa);
                    console.log('EventData imagem_fundo:', eventData.imagem_fundo);
                    
                    console.log('=== FIM DEBUG COMPLETO ===');
                }, 200);
                
                // Forçar atualização do preview com imagens após carregamento
                setTimeout(() => {
                    console.log('🖼️ Forçando atualização de imagens no preview...');
                    
                    // Debug containers
                    console.log('=== DEBUG CONTAINERS ===');
                    console.log('logoPreviewContainer:', document.getElementById('logoPreviewContainer'));
                    console.log('capaPreviewContainer:', document.getElementById('capaPreviewContainer'));
                    console.log('fundoPreviewMain:', document.getElementById('fundoPreviewMain'));
                    
                    // FORÇAR atualização direta dos dados do evento
                    console.log('🔥 FORÇANDO APLICAÇÃO DIRETA DOS DADOS DO EVENTO...');
                    
                    // Logo - aplicar diretamente dos dados
                    if (eventData.logo_evento) {
                        const logoUrl = getImageUrl(eventData.logo_evento);
                        console.log('💪 FORÇANDO logo direto:', logoUrl);
                        updateHeroLogo(logoUrl);
                        
                        // Garantir que o elemento existe e foi aplicado
                        setTimeout(() => {
                            const heroLogo = document.getElementById('heroLogo');
                            if (heroLogo) {
                                heroLogo.src = logoUrl;
                                heroLogo.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important; width: auto !important; height: auto !important; max-width: 200px !important; max-height: 80px !important; position: relative !important; z-index: 9999 !important;';
                                console.log('💪 Logo REFORÇADO:', heroLogo.src);
                                console.log('💪 Logo cssText:', heroLogo.style.cssText);
                            }
                        }, 100);
                    }
                    
                    // Capa - aplicar diretamente dos dados
                    if (eventData.imagem_capa) {
                        const capaUrl = getImageUrl(eventData.imagem_capa);
                        console.log('💪 FORÇANDO capa direto:', capaUrl);
                        updateHeroCapa(capaUrl);
                        
                        // Garantir que o elemento existe e foi aplicado
                        setTimeout(() => {
                            const heroCapa = document.getElementById('heroCapa');
                            if (heroCapa) {
                                heroCapa.src = capaUrl;
                                heroCapa.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important; width: 120px !important; height: 120px !important; object-fit: cover !important; border-radius: 8px !important; position: relative !important; z-index: 9999 !important;';
                                console.log('💪 Capa REFORÇADA:', heroCapa.src);
                                console.log('💪 Capa cssText:', heroCapa.style.cssText);
                            }
                        }, 100);
                    }
                    
                    // Fundo - aplicar diretamente dos dados
                    if (eventData.imagem_fundo) {
                        const fundoUrl = getImageUrl(eventData.imagem_fundo);
                        console.log('💪 FORÇANDO fundo direto:', fundoUrl);
                        updateHeroBackground(fundoUrl);
                    }
                    
                    // Verificar containers também (fallback)
                    setTimeout(() => {
                        // Verificar e atualizar logo
                        const logoImg = document.querySelector('#logoPreviewContainer img');
                        console.log('Logo img encontrada:', logoImg);
                        if (logoImg && logoImg.src && logoImg.src !== window.location.href) {
                            console.log('⚡ Forçando atualização hero logo com:', logoImg.src);
                            updateHeroLogo(logoImg.src);
                        } else {
                            console.log('❌ Logo não encontrada ou sem src válido');
                            // Tentar buscar nos dados do evento
                            if (eventData.logo_evento) {
                                const logoUrl = getImageUrl(eventData.logo_evento);
                                console.log('⚡ Usando logo dos dados do evento:', logoUrl);
                                updateHeroLogo(logoUrl);
                            }
                        }
                        
                        // Verificar e atualizar capa
                        const capaImg = document.querySelector('#capaPreviewContainer img');
                        console.log('Capa img encontrada:', capaImg);
                        if (capaImg && capaImg.src && capaImg.src !== window.location.href) {
                            console.log('⚡ Forçando atualização hero capa com:', capaImg.src);
                            updateHeroCapa(capaImg.src);
                        } else {
                            console.log('❌ Capa não encontrada ou sem src válido');
                            // Tentar buscar nos dados do evento
                            if (eventData.imagem_capa) {
                                const capaUrl = getImageUrl(eventData.imagem_capa);
                                console.log('⚡ Usando capa dos dados do evento:', capaUrl);
                                updateHeroCapa(capaUrl);
                            }
                        }
                        
                        // Verificar e atualizar fundo
                        const fundoImg = document.querySelector('#fundoPreviewMain img');
                        console.log('Fundo img encontrada:', fundoImg);
                        if (fundoImg && fundoImg.src && fundoImg.src !== window.location.href) {
                            console.log('Atualizando hero fundo com:', fundoImg.src);
                            updateHeroBackground(fundoImg.src);
                        }
                        
                        // Atualizar preview completo
                        updateHeroPreview();
                        console.log('=== FIM DEBUG CONTAINERS ===');
                    }, 200);
                }, 500);
                
                hideLoading();
                
                // Forçar aplicação de CSS após carregamento
                setTimeout(() => {
                    console.log('🔧 Forçando aplicação de CSS...');
                    
                    // Forçar grid layout
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        mainContent.style.display = 'grid';
                        mainContent.style.gridTemplateColumns = '1fr 460px';
                        mainContent.style.gap = '40px';
                        console.log('✅ Grid layout aplicado');
                    }
                    
                    // Forçar preview card
                    const previewCard = document.querySelector('.preview-card');
                    if (previewCard) {
                        previewCard.style.maxWidth = '460px';
                        previewCard.style.padding = '5px';
                        previewCard.style.position = 'sticky';
                        previewCard.style.top = '0px';
                        console.log('✅ Preview card ajustado');
                    }
                    
                    // Ocultar input color
                    const corFundo = document.getElementById('corFundo');
                    if (corFundo) {
                        corFundo.style.display = 'none';
                        corFundo.style.visibility = 'hidden';
                        console.log('✅ Input color oculto');
                    }
                    
                    // Atualizar preview após carregamento das imagens
                    setTimeout(() => {
                        console.log('🔄 Forçando atualização do preview após carregamento...');
                        updateHeroPreview();
                        
                        // Verificar novamente em mais 2 segundos para imagens que demoram para carregar
                        setTimeout(() => {
                            console.log('🔄 Verificação final do preview...');
                            updateHeroPreview();
                        }, 2000);
                    }, 500);
                    
                }, 1000);
            }, 100);
        });
        
        // Prevenir perda de dados ao sair da página
        window.addEventListener('beforeunload', function(e) {
            if (isSaving) {
                e.preventDefault();
                e.returnValue = 'Salvando dados... Aguarde um momento.';
                return e.returnValue;
            }
        });

        // Funções do menu/header que podem ser necessárias
        function toggleMobileMenu() {
            console.log('Toggle mobile menu');
        }
        
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.classList.toggle('active');
                
                // Fechar dropdown se clicar fora
                document.addEventListener('click', function closeDropdown(e) {
                    if (!e.target.closest('.user-menu')) {
                        dropdown.classList.remove('active');
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }
        }
        
        function logout() {
            if (confirm('Deseja realmente sair?')) {
                window.location.href = '/produtor/logout.php';
            }
        }
        
        function closeMobileMenu() {
            console.log('Close mobile menu');
        }
        
    </script>

    <!-- Busca de endereço do novoevento.php -->
    <script language='javascript' src="/produtor/js/busca-endereco-direto.js?v=<?php echo time(); ?>"></script>
    
    <!-- Google Maps API -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDU5-cOqdusZMBI5pqbsLihQVKEI0fEO9o&libraries=places&callback=initMap" async defer></script>

</body>
</html>
