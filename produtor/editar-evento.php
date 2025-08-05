<?php
// Debug inicial
error_log("=== EDITAR EVENTO - INÍCIO ===");
error_log("REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'undefined'));
error_log("GET params: " . print_r($_GET, true));

include("check_login.php");
include("conm/conn.php");

// Buscar dados do usuário para o header
$usuario = null;
$usuario_id = $_SESSION['usuarioid'];
if ($usuario_id) {
    $sql_usuario = "SELECT id, nome, email, foto_perfil FROM usuarios WHERE id = ?";
    $stmt_usuario = mysqli_prepare($con, $sql_usuario);
    if ($stmt_usuario) {
        mysqli_stmt_bind_param($stmt_usuario, "i", $usuario_id);
        mysqli_stmt_execute($stmt_usuario);
        $result_usuario = mysqli_stmt_get_result($stmt_usuario);
        $usuario = mysqli_fetch_assoc($result_usuario);
        mysqli_stmt_close($stmt_usuario);
    }
}

// Debug - verificar parâmetros da URL
error_log("=== DEBUG EDITAR EVENTO ===");
error_log("GET parameters: " . print_r($_GET, true));
error_log("REQUEST_URI: " . $_SERVER['REQUEST_URI']);

// Verificar se está editando um evento existente
$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;
$dados_evento = null;

error_log("Evento ID capturado: $evento_id");
error_log("Usuario ID da sessão: $usuario_id");

if ($evento_id > 0) {
    // Verificar se o evento pertence ao usuário
    $sql_evento = "SELECT * FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql_evento);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        $dados_evento = $row;
        error_log("✅ Evento encontrado: " . $row['nome']);
    } else {
        error_log("❌ Evento não encontrado ou sem permissão");
        
        // Verificar se evento existe (debug)
        $sql_check = "SELECT id, nome, usuario_id FROM eventos WHERE id = ?";
        $stmt_check = mysqli_prepare($con, $sql_check);
        mysqli_stmt_bind_param($stmt_check, "i", $evento_id);
        mysqli_stmt_execute($stmt_check);
        $result_check = mysqli_stmt_get_result($stmt_check);
        
        if ($row_check = mysqli_fetch_assoc($result_check)) {
            error_log("Evento existe mas pertence ao usuário: " . $row_check['usuario_id']);
        } else {
            error_log("Evento não existe no banco de dados");
        }
        
        // Redirecionar com mensagem de erro
        header("Location: /produtor/meuseventos.php?erro=evento_nao_encontrado");
        exit();
    }
} else {
    error_log("❌ ID do evento não fornecido na URL");
    header("Location: /produtor/meuseventos.php?erro=id_obrigatorio");
    exit();
}

// Buscar categorias ativas
$sql_categorias = "SELECT id, nome FROM categorias_evento WHERE ativo = 1 ORDER BY nome";
$result_categorias = mysqli_query($con, $sql_categorias);
$categorias = [];
while ($row = mysqli_fetch_assoc($result_categorias)) {
    $categorias[] = $row;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Evento - Anysummit</title>
    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner.umd.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-0.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/produtor/css/criaevento.css" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/busca-endereco.css" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/iphone-switch.css" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/custom-dialogs.css" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/combo-styles.css" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/form-alignment.css" />
    <link rel="stylesheet" type="text/css" href="/produtor/css/sistema-ingressos-etapa6.css" />
  
    <style>
        .btn-cancel {
            background: #6b7280 !important;
            color: white !important;
        }
        
        .btn-cancel:hover {
            background: #4b5563 !important;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 51px;
            height: 31px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 27px;
            width: 27px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
        }
        
        input:checked + .slider {
            background-color: #4CD964;
        }
        
        input:checked + .slider:before {
            transform: translateX(20px);
        }
        
        .slider.round {
            border-radius: 31px;
        }
        
        .slider.round:before {
            border-radius: 50%;
        }
        
        .form-group + .form-group {
            margin-top: 10px;
        }
        
        .modal .form-group label {
            margin-bottom: 3px;
        }
        
        .error-field {
            border: 2px solid #ef4444 !important;
            animation: shake 0.3s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .upload-area.small {
            min-height: 150px;
            padding: 20px;
        }
        
        .preview-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .preview-container img {
            max-width: 100%;
            max-height: 120px;
            object-fit: contain;
            margin-bottom: 10px;
        }
        
        .images-section h3 {
            color: #1f2937;
            font-weight: 600;
        }
        
        .btn-clear-image {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            color: #666;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10;
        }
        
        .btn-clear-image:hover {
            background: #ff4444;
            color: white;
            border-color: #ff4444;
            transform: scale(1.1);
        }
        
        .upload-area {
            position: relative;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            align-items: start;
        }
        
        .form-grid .form-group {
            margin-bottom: 0;
        }
        
        [data-step-content="5"] .form-grid {
            row-gap: 35px;
        }
        
        [data-step-content="5"] .conditional-section {
            margin-top: 30px;
        }
        
        [data-step-content="5"] .form-group.full-width {
            margin-top: 20px;
        }
        
        .color-picker-container {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .color-picker-wrapper {
            position: relative;
            width: 60px;
            height: 40px;
        }
        
        #corFundo {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }
        
        .color-preview {
            width: 100%;
            height: 100%;
            border: 2px solid #ddd;
            border-radius: 6px;
            background-color: #000000;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .color-preview:hover {
            border-color: #00C2FF;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .color-hex-input {
            width: 100px;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
        }
        
        .color-hint {
            color: #666;
            font-size: 0.9rem;
        }
        
        .upload-preview-main {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .upload-preview-main img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .preview-image {
            width: 426px;
            height: 200px;
            margin: 0 auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .hero-section-mini {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
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
        
        .hero-mini-container {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 20px;
            display: flex;
            align-items: center;
            background: transparent;
        }
        
        .hero-mini-row {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .hero-mini-left {
            flex: 0 0 66%;
            height: 100%;
            display: flex;
            align-items: center;
            padding-right: 10px;
        }
        
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
        
        .hero-mini-right {
            flex: 0 0 33%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        
        .hero-mini-capa {
            width: 100%;
            max-width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .editor-separator {
            width: 1px;
            height: 20px;
            background: #ddd;
            margin: 0 5px;
            display: inline-block;
            vertical-align: middle;
        }
        
        .rich-editor {
            resize: vertical !important;
            overflow: auto !important;
            min-height: 200px !important;
            max-height: 500px !important;
        }
        
        body .main-content {
            display: grid !important;
            grid-template-columns: 1fr 460px !important;
            gap: 40px !important;
            align-items: start !important;
            width: 100% !important;
            max-width: 100% !important;
        }
        
        body .form-container {
            grid-column: 1 !important;
            width: 100% !important;
            min-width: 0 !important;
        }
        
        body .preview-card {
            grid-column: 2 !important;
            width: 100% !important;
            position: sticky !important;
            top: 20px !important;
        }
        
        @media (max-width: 1199px) {
            .main-content {
                grid-template-columns: 1fr !important;
                gap: 30px !important;
            }
        }
        
        .preview-card {
            width: 100%;
            max-width: 460px;
            padding: 5px !important;
            position: sticky;
            top: 20px;
        }
        
        .form-container {
            width: 100%;
        }
        
        .preview-image {
            margin: 15px auto 20px auto;
            background: transparent !important;
        }
        
        .btn-secondary {
            background: #6b7280 !important;
            color: white !important;
            border: 1px solid #4b5563 !important;
        }
        
        .btn-secondary:hover {
            background: #4b5563 !important;
        }
    </style>
    
    <script>
        // Dados da sessão PHP para JavaScript
        window.sessionData = {
            usuarioId: <?php echo json_encode($_SESSION['usuarioid'] ?? null); ?>,
            contratanteId: <?php echo json_encode($_SESSION['contratanteid'] ?? null); ?>,
            usuarioNome: <?php echo json_encode($_SESSION['usuario_nome'] ?? ''); ?>,
            usuarioEmail: <?php echo json_encode($_SESSION['usuario_email'] ?? ''); ?>
        };
        
        // Dados do evento para carregar estado
        window.dadosEvento = {
            id: <?php echo json_encode($evento_id); ?>,
            controlarLimiteVendas: <?php echo json_encode($dados_evento ? intval($dados_evento['controlar_limite_vendas'] ?? 0) : 0); ?>,
            limiteVendas: <?php echo json_encode($dados_evento ? intval($dados_evento['limite_vendas'] ?? 0) : 0); ?>,
            status: <?php echo json_encode($dados_evento ? $dados_evento['status'] : 'rascunho'); ?>,
            termosAceitos: <?php echo json_encode($dados_evento ? intval($dados_evento['termos_aceitos'] ?? 0) : 0); ?>
        };
        
        // Configurar para modo edição
        window.isEditMode = true;
        window.maxSteps = 5;
        
        console.log('📋 Dados da sessão:', window.sessionData);
        console.log('🎯 Dados do evento:', window.dadosEvento);
        
        // Debug adicional
        console.log('🔍 URL atual:', window.location.href);
        console.log('🔍 URL parameters:', new URLSearchParams(window.location.search).toString());
        console.log('🔍 Evento ID do JavaScript:', window.dadosEvento.id);
        
        // Verificar se URL tem parâmetro
        const urlParams = new URLSearchParams(window.location.search);
        const eventoIdUrl = urlParams.get('evento_id');
        console.log('🔍 Evento ID da URL:', eventoIdUrl);
        
        if (!window.dadosEvento.id && eventoIdUrl) {
            console.warn('⚠️ Evento ID não foi passado do PHP para JavaScript, mas existe na URL');
            window.dadosEvento.id = parseInt(eventoIdUrl);
            console.log('🔧 Corrigido evento ID:', window.dadosEvento.id);
        }
    </script>
</head>
<body>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <!-- Header -->
    <header class="header">
        <div class="logo-section">
          <img src="/produtor/img/logohori.png" style="width:100%; max-width:200px;">
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
        <?php include 'menu.php'?>

        <!-- Content Area -->
        <main class="content-area">
     <div class="container">
      <div class="header" style="display: block; position: relative; z-index: 8; text-align: center; margin-bottom: 25px; border-radius: 20px;">
            <p>Editar evento</p>
        </div>

        <!-- Progress Bar (apenas 5 etapas agora) -->
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
                    <div class="step-title">Produtor</div>
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
                    
                    <!-- Botão de teste para debug -->
                    <div style="margin: 20px 0; padding: 15px; background: #f0f8ff; border: 1px solid #007bff; border-radius: 5px;">
                        <h4 style="color: #007bff; margin: 0 0 10px 0;">🔧 Debug Tools</h4>
                        <button type="button" onclick="testarCarregamento()" style="margin-right: 10px; padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
                            📡 Testar Carregamento
                        </button>
                        <button type="button" onclick="testarSalvamento()" style="margin-right: 10px; padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">
                            💾 Testar Salvamento
                        </button>
                        <button type="button" onclick="verificarDados()" style="padding: 8px 15px; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer;">
                            🔍 Verificar Dados
                        </button>
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
                                <label for="venueName">Nome do Local <span class="required">*</span></label>
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

                <!-- Step 5: Sobre o Produtor (renumerado de 7 para 5) -->
                <div class="section-card" data-step-content="5">
                    <div class="section-header">
                        <div class="section-number">5</div>
                        <div>
                            <div class="section-title">🧑‍💼 Sobre o produtor</div>
                            <div class="section-subtitle">Informações sobre quem está organizando o evento</div>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="producer">Selecionar produtor</label>
                            <select id="producer">
                                <option value="current">Você (<?php echo isset($_SESSION['usuario_nome']) ? htmlspecialchars($_SESSION['usuario_nome']) : 'Usuário Atual'; ?>)</option>
                                <option value="new">Novo produtor</option>
                            </select>
                        </div>
                    </div>

                    <div class="conditional-section" id="newProducerFields" style="display: none;">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="producerName">Nome do produtor <span class="required">*</span></label>
                                <input type="text" id="producerName" placeholder="Nome completo ou empresa">
                            </div>
                            <div class="form-group">
                                <label for="displayName">Nome de exibição</label>
                                <input type="text" id="displayName" placeholder="Como aparecerá no evento">
                            </div>
                        </div>
                        <div class="form-group full-width">
                            <label for="producerDescription">Descrição do produtor (opcional)</label>
                            <textarea id="producerDescription" rows="4" placeholder="Conte um pouco sobre você ou sua empresa..."></textarea>
                        </div>
                    </div>
                    
                    <div class="validation-message" id="validation-step-5">
                        Por favor, preencha todos os campos obrigatórios.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-secondary" onClick="salvarEvento()">
                            💾 Salvar Alterações
                        </button>
                        <button class="nav-btn btn-continue" onClick="salvarEvento()">
                            ✓ Salvar evento
                        </button>
                    </div>
                </div>
            </div>

            <!-- Preview Card -->
            <div class="preview-card">
                <div class="preview-title">
                    👁️ Prévia do Evento
                </div>
                <div class="preview-image" id="previewImage">
                    <div class="hero-section-mini">
                        <div class="hero-mini-background" id="heroBackground"></div>
                        <div class="hero-mini-container">
                            <div class="hero-mini-row">
                                <div class="hero-mini-left">
                                    <div class="hero-mini-logo-area">
                                        <img id="heroLogo" class="hero-mini-logo" src="" alt="Logo" style="display: none;">
                                    </div>
                                </div>
                                <div class="hero-mini-right">
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
                                <div class="detail-icon"></div>
                                <span id="previewDate">Data não definida</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon"></div>
                                <span id="previewLocation">Local não definido</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon"></div>
                                <span id="previewCategory">Categoria não definida</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon"></div>
                                <span id="previewType">Presencial</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    </div>
    
    <script>
        // Dados do usuário para JavaScript
        window.currentUserName = '<?php echo isset($_SESSION['usuario_nome']) ? addslashes($_SESSION['usuario_nome']) : 'Usuário Atual'; ?>';
        window.currentUserId = '<?php echo isset($_SESSION['usuarioid']) ? $_SESSION['usuarioid'] : ''; ?>';
        
        // Navegação entre etapas
        let currentStep = 1;
        
        function getCurrentStep() {
            return currentStep;
        }
        
        function nextStep() {
            if (validateCurrentStep() && currentStep < 5) {
                currentStep++;
                showStep(currentStep);
                updateProgressBar();
            }
        }
        
        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
                updateProgressBar();
            }
        }
        
        function showStep(step) {
            document.querySelectorAll('.section-card').forEach(card => {
                card.classList.remove('active');
            });
            
            const currentCard = document.querySelector('[data-step-content="' + step + '"]');
            if (currentCard) {
                currentCard.classList.add('active');
            }
            
            updateNavigationButtons();
        }
        
        function updateProgressBar() {
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('active', 'completed');
            });
            
            for (let i = 1; i <= 5; i++) {
                const stepElement = document.querySelector('[data-step="' + i + '"]');
                if (stepElement) {
                    if (i < currentStep) {
                        stepElement.classList.add('completed');
                    } else if (i === currentStep) {
                        stepElement.classList.add('active');
                    }
                }
            }
            
            const progressLine = document.getElementById('progressLine');
            const progressPercent = ((currentStep - 1) / 4) * 100;
            progressLine.style.width = progressPercent + '%';
        }
        
        function updateNavigationButtons() {
            const backBtn = document.querySelector('.nav-btn.btn-back');
            const continueBtn = document.querySelector('.nav-btn.btn-continue');
            
            if (backBtn) {
                backBtn.disabled = currentStep === 1;
            }
            
            if (continueBtn) {
                if (currentStep === 5) {
                    continueBtn.textContent = '✓ Salvar evento';
                    continueBtn.onclick = salvarEvento;
                } else {
                    continueBtn.textContent = 'Avançar →';
                    continueBtn.onclick = nextStep;
                }
            }
        }
        
        // Validações básicas para cada etapa
        function validateCurrentStep() {
            const step = getCurrentStep();
            
            switch(step) {
                case 1:
                    return validateStep1();
                case 2:
                    return validateStep2();
                case 3:
                    return validateStep3();
                case 4:
                    return validateStep4();
                case 5:
                    return validateStep5();
                default:
                    return true;
            }
        }
        
        function validateStep1() {
            const eventName = document.getElementById('eventName').value.trim();
            return eventName.length > 0;
        }
        
        function validateStep2() {
            const classification = document.getElementById('classification').value;
            const category = document.getElementById('category').value;
            const startDateTime = document.getElementById('startDateTime').value;
            
            return classification && category && startDateTime;
        }
        
        function validateStep3() {
            const description = document.getElementById('eventDescription').textContent.trim();
            return description.length > 0;
        }
        
        function validateStep4() {
            const isPresential = document.getElementById('locationTypeSwitch').classList.contains('active');
            
            if (isPresential) {
                const venueName = document.getElementById('venueName').value.trim();
                return venueName.length > 0;
            } else {
                const eventLink = document.getElementById('eventLink').value.trim();
                return eventLink.length > 0;
            }
        }
        
        function validateStep5() {
            const producer = document.getElementById('producer').value;
            
            if (producer === 'new') {
                const producerName = document.getElementById('producerName').value.trim();
                return producerName.length > 0;
            }
            
            return true;
        }
        
        // Função para salvar evento
        function salvarEvento() {
            console.log('💾 Iniciando salvamento do evento...');
            
            if (!validateCurrentStep()) {
                alert('Por favor, preencha todos os campos obrigatórios antes de salvar.');
                return;
            }
            
            if (!window.dadosEvento.id) {
                alert('Erro: ID do evento não encontrado. Verifique se você acessou a página corretamente.');
                return;
            }
            
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Salvando...';
            btn.disabled = true;
            
            const dadosEvento = coletarDadosFormulario();
            console.log('📋 Dados coletados para salvamento:', dadosEvento);
            
            const payload = {
                action: 'salvar_edicao',
                evento_id: window.dadosEvento.id,
                dados: JSON.stringify(dadosEvento)
            };
            
            console.log('📡 Enviando payload:', payload);
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(payload)
            })
            .then(response => {
                console.log('📡 Resposta do servidor:', response.status, response.statusText);
                return response.text();
            })
            .then(text => {
                console.log('📡 Resposta em texto:', text);
                try {
                    const data = JSON.parse(text);
                    if (data.sucesso) {
                        alert('Evento salvo com sucesso!');
                        console.log('✅ Salvamento realizado:', data);
                        window.location.href = '/produtor/meuseventos.php';
                    } else {
                        alert('Erro ao salvar evento: ' + (data.erro || 'Erro desconhecido'));
                        console.error('❌ Erro no salvamento:', data);
                    }
                } catch (e) {
                    console.error('❌ Erro ao fazer parse JSON:', e);
                    console.log('❌ Resposta que causou erro:', text);
                    alert('Erro ao processar resposta do servidor');
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição:', error);
                alert('Erro ao salvar evento. Tente novamente.');
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
        }
        
        // Função para coletar dados do formulário
        function coletarDadosFormulario() {
            const isPresential = document.getElementById('locationTypeSwitch').classList.contains('active');
            const producerType = document.getElementById('producer').value;
            
            return {
                nome: document.getElementById('eventName').value.trim(),
                logo: window.uploadedImages && window.uploadedImages.logo ? window.uploadedImages.logo : '',
                capa: window.uploadedImages && window.uploadedImages.capa ? window.uploadedImages.capa : '',
                fundo: window.uploadedImages && window.uploadedImages.fundo ? window.uploadedImages.fundo : '',
                cor_fundo: document.getElementById('corFundo').value || '#000000',
                classificacao: document.getElementById('classification').value,
                categoria_id: document.getElementById('category').value,
                data_inicio: document.getElementById('startDateTime').value,
                data_fim: document.getElementById('endDateTime').value || null,
                descricao: document.getElementById('eventDescription').innerHTML,
                tipo_local: isPresential ? 'presencial' : 'online',
                nome_local: isPresential ? document.getElementById('venueName').value.trim() : null,
                cep: isPresential ? document.getElementById('cep').value : null,
                endereco: isPresential ? document.getElementById('street').value : null,
                numero: isPresential ? document.getElementById('number').value : null,
                complemento: isPresential ? document.getElementById('complement').value : null,
                bairro: isPresential ? document.getElementById('neighborhood').value : null,
                cidade: isPresential ? document.getElementById('city').value : null,
                estado: isPresential ? document.getElementById('state').value : null,
                latitude: isPresential ? document.getElementById('latitude').value : null,
                longitude: isPresential ? document.getElementById('longitude').value : null,
                link_evento: !isPresential ? document.getElementById('eventLink').value.trim() : null,
                tipo_produtor: producerType,
                nome_produtor: producerType === 'new' ? document.getElementById('producerName').value.trim() : null,
                nome_exibicao: producerType === 'new' ? document.getElementById('displayName').value.trim() : null,
                descricao_produtor: producerType === 'new' ? document.getElementById('producerDescription').value.trim() : null
            };
        }
        
        // Função para carregar dados do evento existente (baseada em criaevento.js)
        function carregarDadosEvento() {
            if (!window.dadosEvento.id) {
                console.warn('❌ ID do evento não disponível para carregamento');
                return;
            }
            
            console.log('📡 Carregando dados do evento ID:', window.dadosEvento.id);
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    action: 'carregar_dados_edicao',
                    evento_id: window.dadosEvento.id
                })
            })
            .then(response => {
                console.log('📡 Resposta recebida:', response.status, response.statusText);
                return response.text();
            })
            .then(text => {
                console.log('📡 Resposta em texto:', text);
                try {
                    const data = JSON.parse(text);
                    if (data.sucesso && data.evento) {
                        console.log('✅ Dados do evento carregados:', data.evento);
                        preencherFormularioCompleto(data.evento);
                    } else {
                        console.error('❌ Erro ao carregar dados:', data.erro || 'Dados não encontrados');
                        console.log('❌ Dados completos da resposta:', data);
                    }
                } catch (e) {
                    console.error('❌ Erro ao fazer parse JSON:', e);
                    console.log('❌ Resposta que causou erro:', text);
                }
            })
            .catch(error => {
                console.error('❌ Erro ao carregar dados do evento:', error);
            });
        }
        
        // Função para preencher formulário com dados existentes (baseada em restoreWizardData)
        function preencherFormularioCompleto(dados) {
            console.log('📝 Preenchendo formulário com dados:', dados);
            
            // Etapa 1 - Informações básicas
            if (dados.nome) {
                document.getElementById('eventName').value = dados.nome;
            }
            
            if (dados.cor_fundo_alternativa) {
                const corFundo = dados.cor_fundo_alternativa;
                document.getElementById('corFundo').value = corFundo;
                document.getElementById('corFundoHex').value = corFundo;
                document.getElementById('colorPreview').style.backgroundColor = corFundo;
            }
            
            // Carregar imagens
            if (dados.logo_path) carregarImagemExistente('logo', dados.logo_path);
            if (dados.capa_path) carregarImagemExistente('capa', dados.capa_path);
            if (dados.fundo_path) carregarImagemExistente('fundo', dados.fundo_path);
            
            // Etapa 2 - Data e horário
            if (dados.classificacao_etaria) {
                document.getElementById('classification').value = dados.classificacao_etaria;
            }
            if (dados.categoria_id) {
                document.getElementById('category').value = dados.categoria_id;
            }
            if (dados.data_inicio) {
                // Converter formato de data para datetime-local
                const dataInicio = new Date(dados.data_inicio);
                document.getElementById('startDateTime').value = formatDateTimeLocal(dataInicio);
            }
            if (dados.data_fim) {
                const dataFim = new Date(dados.data_fim);
                document.getElementById('endDateTime').value = formatDateTimeLocal(dataFim);
            }
            
            // Etapa 3 - Descrição
            if (dados.descricao) {
                document.getElementById('eventDescription').innerHTML = dados.descricao;
            }
            
            // Etapa 4 - Localização
            if (dados.link_transmissao) {
                // Evento online
                document.getElementById('locationTypeSwitch').classList.remove('active');
                document.getElementById('presentialLocation').classList.remove('show');
                document.getElementById('onlineLocation').classList.add('show');
                document.getElementById('eventLink').value = dados.link_transmissao;
            } else {
                // Evento presencial (padrão)
                if (dados.nome_local) document.getElementById('venueName').value = dados.nome_local;
                if (dados.cep) document.getElementById('cep').value = dados.cep;
                if (dados.endereco) document.getElementById('street').value = dados.endereco;
                if (dados.numero) document.getElementById('number').value = dados.numero;
                if (dados.complemento) document.getElementById('complement').value = dados.complemento;
                if (dados.bairro) document.getElementById('neighborhood').value = dados.bairro;
                if (dados.cidade) document.getElementById('city').value = dados.cidade;
                if (dados.estado) document.getElementById('state').value = dados.estado;
                if (dados.latitude) document.getElementById('latitude').value = dados.latitude;
                if (dados.longitude) document.getElementById('longitude').value = dados.longitude;
            }
            
            // Etapa 5 - Produtor
            // Para eventos existentes, normalmente é o usuário atual
            // Caso tenha dados específicos de produtor, implementar aqui
            
            // Atualizar preview após carregar dados
            setTimeout(() => {
                updatePreview();
            }, 300);
        }
        
        // Função auxiliar para formatar data para datetime-local
        function formatDateTimeLocal(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
        }
        
        // Função para carregar imagem existente
        function carregarImagemExistente(tipo, caminho) {
            console.log('🖼️ Carregando imagem:', tipo, caminho);
            
            const container = document.getElementById(tipo + 'PreviewContainer');
            const clearBtn = document.getElementById('clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
            
            if (container && caminho) {
                container.innerHTML = '<img src="' + caminho + '" alt="' + tipo + '" style="max-width: 100%; max-height: 120px; object-fit: contain;">';
                if (clearBtn) clearBtn.style.display = 'block';
                
                if (!window.uploadedImages) window.uploadedImages = {};
                window.uploadedImages[tipo] = caminho;
            }
        }
        
        // Funções de upload de imagem
        function clearImage(tipo, event) {
            event.stopPropagation();
            
            const container = document.getElementById(tipo + 'PreviewContainer');
            const clearBtn = document.getElementById('clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
            const input = document.getElementById(tipo + 'Upload');
            
            const icons = {
                logo: '🎨',
                capa: '🖼️',
                fundo: '🌄'
            };
            
            const hints = {
                logo: '800x200px • Fundo transparente',
                capa: '450x450px • Fundo transparente',
                fundo: 'PNG, JPG até 5MB • Tamanho ideal: 1920x640px'
            };
            
            const texts = {
                logo: 'Adicionar logo',
                capa: 'Adicionar capa',
                fundo: 'Clique para adicionar imagem de fundo'
            };
            
            container.innerHTML = '<div class="upload-icon">' + icons[tipo] + '</div>' +
                                '<div class="upload-text">' + texts[tipo] + '</div>' +
                                '<div class="upload-hint">' + hints[tipo] + '</div>';
            
            clearBtn.style.display = 'none';
            input.value = '';
            
            if (window.uploadedImages) {
                delete window.uploadedImages[tipo];
            }
            
            updatePreview();
        }
        
        // Preview do evento
        function updatePreview() {
            const eventName = document.getElementById('eventName').value || 'Nome do evento';
            const description = document.getElementById('eventDescription').textContent || 'Descrição do evento aparecerá aqui...';
            
            document.getElementById('previewTitle').textContent = eventName;
            document.getElementById('previewDescription').textContent = description;
            
            const heroLogo = document.getElementById('heroLogo');
            const heroCapa = document.getElementById('heroCapa');
            const heroBackground = document.getElementById('heroBackground');
            
            if (window.uploadedImages && window.uploadedImages.logo) {
                heroLogo.src = window.uploadedImages.logo;
                heroLogo.style.display = 'block';
            } else {
                heroLogo.style.display = 'none';
            }
            
            if (window.uploadedImages && window.uploadedImages.capa) {
                heroCapa.src = window.uploadedImages.capa;
                heroCapa.style.display = 'block';
            } else {
                heroCapa.style.display = 'none';
            }
            
            if (window.uploadedImages && window.uploadedImages.fundo) {
                heroBackground.style.backgroundImage = 'url(' + window.uploadedImages.fundo + ')';
            } else {
                const corFundo = document.getElementById('corFundo').value || '#000000';
                heroBackground.style.backgroundColor = corFundo;
                heroBackground.style.backgroundImage = 'none';
            }
            
            updatePreviewDetails();
        }
        
        function updatePreviewDetails() {
            const startDateTime = document.getElementById('startDateTime').value;
            const category = document.getElementById('category').selectedOptions[0] ? document.getElementById('category').selectedOptions[0].text : '';
            const isPresential = document.getElementById('locationTypeSwitch').classList.contains('active');
            
            if (startDateTime) {
                const date = new Date(startDateTime);
                const dateStr = date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                document.getElementById('previewDate').textContent = dateStr;
            }
            
            if (isPresential) {
                const venueName = document.getElementById('venueName').value;
                const city = document.getElementById('city').value;
                let locationText = 'Local não definido';
                if (venueName && city) {
                    locationText = venueName + ', ' + city;
                } else if (venueName) {
                    locationText = venueName;
                }
                document.getElementById('previewLocation').textContent = locationText;
                document.getElementById('previewType').textContent = 'Presencial';
            } else {
                document.getElementById('previewLocation').textContent = 'Evento online';
                document.getElementById('previewType').textContent = 'Online';
            }
            
            if (category) {
                document.getElementById('previewCategory').textContent = category;
            }
        }
        
        // Função para upload de imagem
        function handleImageUpload(input, tipo) {
            const file = input.files[0];
            if (!file) return;
            
            if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
                alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WebP).');
                input.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                input.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const container = document.getElementById(tipo + 'PreviewContainer');
                const clearBtn = document.getElementById('clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
                
                container.innerHTML = '<img src="' + e.target.result + '" alt="Preview" style="max-width: 100%; max-height: 120px; object-fit: contain;">';
                clearBtn.style.display = 'block';
                
                if (!window.uploadedImages) window.uploadedImages = {};
                window.uploadedImages[tipo] = e.target.result;
                
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
        
        // Funções de teste para debug
        function testarCarregamento() {
            console.log('🧪 TESTE: Carregamento de dados');
            console.log('🔍 ID do evento:', window.dadosEvento.id);
            
            if (!window.dadosEvento.id) {
                alert('❌ ID do evento não disponível. Verifique a URL.');
                return;
            }
            
            console.log('📡 Fazendo requisição de teste...');
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    action: 'carregar_dados_edicao',
                    evento_id: window.dadosEvento.id
                })
            })
            .then(response => {
                console.log('📡 Status da resposta:', response.status);
                return response.text();
            })
            .then(text => {
                console.log('📡 Resposta em texto:', text);
                try {
                    const data = JSON.parse(text);
                    if (data.sucesso) {
                        alert('✅ Teste de carregamento: SUCESSO!');
                        console.log('✅ Dados carregados:', data.evento);
                    } else {
                        alert('❌ Teste falhou: ' + data.erro);
                    }
                } catch (e) {
                    alert('❌ Erro no parse JSON: ' + e.message);
                    console.error('Resposta que causou erro:', text);
                }
            })
            .catch(error => {
                console.error('❌ Erro no teste:', error);
                alert('❌ Erro na requisição: ' + error.message);
            });
        }
        
        function testarSalvamento() {
            console.log('🧪 TESTE: Salvamento de dados');
            
            // Preencher alguns dados de teste
            document.getElementById('eventName').value = 'Teste de Evento - ' + new Date().toLocaleString();
            
            const dadosTest = coletarDadosFormulario();
            console.log('📋 Dados de teste coletados:', dadosTest);
            
            // Simular salvamento
            const payload = {
                action: 'salvar_edicao',
                evento_id: window.dadosEvento.id,
                dados: JSON.stringify(dadosTest)
            };
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(payload)
            })
            .then(response => response.text())
            .then(text => {
                console.log('📡 Resposta do teste:', text);
                try {
                    const data = JSON.parse(text);
                    alert('✅ Teste de salvamento: ' + (data.sucesso ? 'SUCESSO' : 'FALHOU - ' + data.erro));
                } catch (e) {
                    alert('❌ Erro no parse JSON: ' + e.message);
                    console.error('Resposta que causou erro:', text);
                }
            })
            .catch(error => {
                console.error('❌ Erro no teste:', error);
                alert('❌ Erro na requisição: ' + error.message);
            });
        }
        
        function verificarDados() {
            console.log('🧪 VERIFICAÇÃO: Estado atual dos dados');
            console.log('🔍 URL:', window.location.href);
            console.log('🔍 Parâmetros URL:', new URLSearchParams(window.location.search).toString());
            console.log('🔍 Session Data:', window.sessionData);
            console.log('🔍 Dados Evento:', window.dadosEvento);
            console.log('🔍 Upload Images:', window.uploadedImages);
            
            // Verificar campos do formulário
            const campos = {
                eventName: document.getElementById('eventName').value,
                classification: document.getElementById('classification').value,
                category: document.getElementById('category').value,
                startDateTime: document.getElementById('startDateTime').value,
                venueName: document.getElementById('venueName').value
            };
            
            console.log('🔍 Campos atuais:', campos);
            
            alert('🔍 Verificação completa - veja o console para detalhes');
        }
        
        // Funções de menu mobile
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            menuToggle.classList.toggle('active');
        }

        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Página de edição carregada');
            
            // Carregar dados do evento se estiver editando
            if (window.dadosEvento.id) {
                console.log('📡 Iniciando carregamento dos dados do evento...');
                carregarDadosEvento();
            }
            
            // Event listeners para campos que afetam o preview
            document.getElementById('eventName').addEventListener('input', updatePreview);
            document.getElementById('eventDescription').addEventListener('input', updatePreview);
            document.getElementById('startDateTime').addEventListener('change', updatePreview);
            document.getElementById('classification').addEventListener('change', updatePreview);
            document.getElementById('category').addEventListener('change', updatePreview);
            document.getElementById('venueName').addEventListener('input', updatePreview);
            document.getElementById('city').addEventListener('input', updatePreview);
            document.getElementById('eventLink').addEventListener('input', updatePreview);
            
            // Color picker
            document.getElementById('corFundo').addEventListener('change', function() {
                document.getElementById('corFundoHex').value = this.value;
                document.getElementById('colorPreview').style.backgroundColor = this.value;
                updatePreview();
            });
            
            document.getElementById('corFundoHex').addEventListener('input', function() {
                if (this.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    document.getElementById('corFundo').value = this.value;
                    document.getElementById('colorPreview').style.backgroundColor = this.value;
                    updatePreview();
                }
            });
            
            // Upload de imagens
            ['logo', 'capa', 'fundo'].forEach(function(tipo) {
                const input = document.getElementById(tipo + 'Upload');
                if (input) {
                    input.addEventListener('change', function() {
                        handleImageUpload(this, tipo);
                    });
                }
            });
            
            // Switch de localização
            document.getElementById('locationTypeSwitch').addEventListener('click', function() {
                this.classList.toggle('active');
                const presential = document.getElementById('presentialLocation');
                const online = document.getElementById('onlineLocation');
                
                if (this.classList.contains('active')) {
                    presential.classList.add('show');
                    online.classList.remove('show');
                } else {
                    presential.classList.remove('show');
                    online.classList.add('show');
                }
                updatePreview();
            });
            
            // Select de produtor
            document.getElementById('producer').addEventListener('change', function() {
                const newProducerFields = document.getElementById('newProducerFields');
                if (this.value === 'new') {
                    newProducerFields.style.display = 'block';
                } else {
                    newProducerFields.style.display = 'none';
                }
            });
            
            // Close dropdown quando clicar fora
            document.addEventListener('click', function(event) {
                const userMenu = document.querySelector('.user-menu');
                const dropdown = document.getElementById('userDropdown');
                const sidebar = document.querySelector('.sidebar');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (!userMenu.contains(event.target)) {
                    dropdown.classList.remove('active');
                }
                
                if (window.innerWidth <= 768 && 
                    !sidebar.contains(event.target) && 
                    !menuToggle.contains(event.target)) {
                    closeMobileMenu();
                }
            });

            // Handle window resize
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    closeMobileMenu();
                }
            });

            // Mouse particles
            document.addEventListener('mousemove', function(e) {
                const particles = document.querySelectorAll('.particle');
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;
                
                particles.forEach((particle, index) => {
                    const speed = (index + 1) * 0.5;
                    const x = mouseX * speed;
                    const y = mouseY * speed;
                    
                    particle.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                });
            });
            
            // Inicializar color preview
            document.getElementById('colorPreview').style.backgroundColor = document.getElementById('corFundo').value;
            
            // Inicializar interface
            updateProgressBar();
            updateNavigationButtons();
            updatePreview();
            
            console.log('✅ Página de edição inicializada com sucesso');
        });
        
        // Função auxiliar para inicializar Google Maps (se necessário)
        function initMap() {
            // Placeholder para Google Maps - implementar se necessário
            console.log('🗺️ Google Maps inicializado');
        }
        
        // Tornar função global para Google Maps callback
        window.initMap = initMap;
    </script>

    <!-- Scripts de busca de endereço -->
    <script src="/produtor/js/busca-endereco-direto.js?v=<?php echo time(); ?>"></script>
    
    <!-- Google Maps API -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDU5-cOqdusZMBI5pqbsLihQVKEI0fEO9o&libraries=places&callback=initMap" async defer></script>

</body>
</html>