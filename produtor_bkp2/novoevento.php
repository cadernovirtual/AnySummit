<?php
include("check_login.php");
include("conm/conn.php");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Produtor - Anysummit</title>
        <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner.umd.min.js"></script>
      <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
      <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-0.css">
         <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="/produtor/css/criaevento.css" />
        <link rel="stylesheet" type="text/css" href="/produtor/css/iphone-switch.css" />
        <link rel="stylesheet" type="text/css" href="/produtor/css/custom-dialogs.css" />
        <link rel="stylesheet" type="text/css" href="/produtor/css/combo-styles.css" />
        <link rel="stylesheet" type="text/css" href="/produtor/css/form-alignment.css" />
  
    <style>
        /* Estilo para botão cancelar */
        .btn-cancel {
            background: #6b7280 !important;
            color: white !important;
        }
        
        .btn-cancel:hover {
            background: #4b5563 !important;
        }
        
        /* Switch estilo iPhone caso não esteja no arquivo CSS */
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
        
        /* Estilo para campos readonly no modal de ingresso */
        #paidTicketModal input[readonly] {
            background-color: transparent !important;
            border: 1px solid #e0e0e0;
            cursor: not-allowed;
        }
        
        #paidTicketModal input[readonly]:focus {
            background-color: transparent !important;
            border-color: #e0e0e0;
            outline: none;
        }
        
        /* Estilo para campos readonly no modal de edição de ingresso */
        #editPaidTicketModal input[readonly] {
            background-color: transparent !important;
            border: 1px solid #e0e0e0;
            cursor: not-allowed;
        }
        
        #editPaidTicketModal input[readonly]:focus {
            background-color: transparent !important;
            border-color: #e0e0e0;
            outline: none;
        }
        
        /* Estilo para campos readonly no modal de ingresso gratuito */
        #freeTicketModal input[readonly] {
            background-color: transparent !important;
            border: 1px solid #e0e0e0;
            cursor: not-allowed;
        }
        
        #freeTicketModal input[readonly]:focus {
            background-color: transparent !important;
            border-color: #e0e0e0;
            outline: none;
        }
        
        /* Espaçamento padrão entre form-groups */
        .form-group + .form-group {
            margin-top: 10px;
        }
        
        .modal .form-group label {
            margin-bottom: 3px;
        }
        
        /* Estilo para campos com erro */
        .error-field {
            border: 2px solid #ef4444 !important;
            animation: shake 0.3s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Estilos para seção de lotes */
        .lotes-container {
            width: 100%;
            margin: 20px 0;
        }
        
        .lotes-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 20px;
        }
        
        .lote-section {
            background: rgba(26, 26, 46, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(114, 94, 255, 0.3);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .lote-section:hover {
            border-color: rgba(0, 194, 255, 0.4);
            box-shadow: 0 12px 40px rgba(0, 194, 255, 0.1);
        }
        
        .lote-section-header {
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(114, 94, 255, 0.2);
            padding-bottom: 16px;
        }
        
        .lote-section-header h3 {
            margin: 0 0 8px 0;
            color: #E1E5F2;
            font-size: 1.2rem;
            font-weight: 600;
            background: linear-gradient(135deg, #00C2FF 0%, #725EFF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .lote-section-header p {
            margin: 0;
            color: #8B95A7;
            font-size: 0.9rem;
        }
        
        .lotes-list {
            min-height: 140px;
            margin-bottom: 20px;
        }
        
        .lote-empty-state {
            text-align: center;
            padding: 32px 20px;
            color: #6B7280;
            background: rgba(15, 15, 35, 0.3);
            border-radius: 12px;
            border: 2px dashed rgba(114, 94, 255, 0.2);
        }
        
        .lote-item {
            background: rgba(15, 15, 35, 0.6);
            border: 1px solid rgba(114, 94, 255, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .lote-item:hover {
            border-color: rgba(0, 194, 255, 0.4);
            background: rgba(15, 15, 35, 0.8);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.1);
        }
        
        .lote-item-info {
            flex: 1;
        }
        
        .lote-item-name {
            font-weight: 600;
            color: #E1E5F2;
            margin-bottom: 6px;
            font-size: 1rem;
        }
        
        .lote-item-details {
            font-size: 0.875rem;
            color: #8B95A7;
            line-height: 1.4;
        }
        
        .lote-item-actions {
            display: flex;
            gap: 8px;
            margin-left: 16px;
        }
        
        .btn-icon {
            background: rgba(114, 94, 255, 0.1);
            border: 1px solid rgba(114, 94, 255, 0.3);
            padding: 8px;
            cursor: pointer;
            border-radius: 8px;
            color: #8B95A7;
            transition: all 0.3s ease;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        
        .btn-icon:hover {
            background: rgba(0, 194, 255, 0.1);
            border-color: rgba(0, 194, 255, 0.4);
            color: #00C2FF;
            transform: scale(1.1);
        }
        
        .btn-icon.delete:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.4);
            color: #EF4444;
        }
        
        .percentual-summary {
            background: rgba(15, 15, 35, 0.4);
            border: 1px solid rgba(114, 94, 255, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
            backdrop-filter: blur(5px);
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: #E1E5F2;
            font-size: 0.9rem;
        }
        
        .summary-item:last-child {
            margin-bottom: 0;
            font-weight: 600;
            padding-top: 8px;
            border-top: 1px solid rgba(114, 94, 255, 0.2);
        }
        
        .switch-container {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 12px 0;
        }
        
        .switch-container label {
            font-size: 0.9rem;
            color: #E1E5F2;
            margin: 0;
            cursor: pointer;
        }
        
        /* Botões dos lotes */
        .lote-section .btn {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
            border: none;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
            margin-top: 8px;
        }
        
        .lote-section .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(114, 94, 255, 0.3);
        }
        
        /* Responsivo */
        @media (max-width: 768px) {
            .lotes-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .lote-section {
                padding: 20px;
            }
            
            .lote-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            
            .lote-item-actions {
                margin-left: 0;
                align-self: flex-end;
            }
        }
        
        /* CSS para nome do ticket em azul */
        .ticket-name {
            color: #00C2FF;
            font-weight: 600;
        }
        
        /* CSS para upload de imagens */
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
        
        /* Botão de limpar imagem */
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
        
        /* Correção de alinhamento dos form-grid */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            align-items: start;
        }
        
        .form-grid .form-group {
            margin-bottom: 0;
        }
        
        /* Espaçamento adicional para etapa 7 */
        [data-step-content="7"] .form-grid {
            row-gap: 35px;
        }
        
        [data-step-content="7"] .conditional-section {
            margin-top: 30px;
        }
        
        [data-step-content="7"] .form-group.full-width {
            margin-top: 20px;
        }
        
        /* Melhorias no seletor de cor */
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
        
        /* Preview da imagem de fundo principal */
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
        
        /* CSS para Preview Hero Proporcional */
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
            /* Removido background que estava sobrepondo a imagem */
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
            opacity: 1; /* 100% opaco - imagem sem transparência */
        }
        
        /* Container principal */
        .hero-mini-container {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 20px; /* Proporcional ao padding original */
            display: flex;
            align-items: center;
            /* Garantir que não há background sobrepondo */
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
            height: 60px; /* Proporcional a max-height: 120px no original */
            display: flex;
            align-items: center;
        }
        
        .hero-mini-logo {
            max-height: 100%;
            max-width: 200px; /* Proporcional */
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
            max-width: 120px; /* Proporcional ao container */
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        /* Caso não tenha imagem de fundo, usar cor sólida */
        .hero-section-mini.solid-bg .hero-mini-background {
            opacity: 1;
        }
        
        .hero-section-mini.solid-bg .hero-mini-container {
            /* Ajustar contraste quando for cor sólida */
            filter: brightness(1.1);
        }
        
        /* Editor rico melhorado */
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
        
        /* Remover bullets dos preview details */
        .preview-details {
            list-style: none !important;
        }
        
        .preview-detail {
            list-style: none !important;
        }
        
        .detail-icon {
            display: none !important;
        }
        
        /* Garantir alinhamento correto dos form-groups */
        .form-grid .form-group {
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .form-grid {
            align-items: start !important;
        }
        
        /* FORÇAR LAYOUT CORRETO - IMPORTANTE */
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
        
        /* Ajustes de largura para acomodar preview de 426px */
        .main-content {
            display: grid !important;
            grid-template-columns: 1fr 460px !important;
            gap: 40px !important;
            align-items: start !important;
        }
        
        @media (min-width: 1200px) {
            .main-content {
                grid-template-columns: 1fr 460px !important; /* Aumentado de 380px */
            }
        }
        
        @media (max-width: 1199px) {
            .main-content {
                grid-template-columns: 1fr !important;
                gap: 30px !important;
            }
        }
        
        .preview-card {
            width: 100%;
            max-width: 460px; /* Espaço para padding interno */
            padding: 5px !important; /* Reduzido de 25px para 5px */
            position: sticky;
            top: 20px;
        }
        
        .form-container {
            width: 100%;
        }
        
        .preview-image {
            margin: 15px auto 20px auto; /* Centralizar horizontalmente e espaço abaixo */
            background: transparent !important; /* Remover background que estava sobrepondo */
        }
        
        /* Garantir que o preview não quebre em telas menores */
        @media (max-width: 1199px) {
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
        
        @media (max-width: 768px) {
            .preview-image {
                width: 100%;
                max-width: 426px;
            }
            
            .hero-section-mini {
                transform: scale(0.8);
            }
        }
    </style>
</head>
<body>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <!-- Header -->
    <header class="header">
        <div class="logo-section">
          <img src="img/logohori.png" style="width:100%; max-width:200px;">
        </div>
        
        <div class="header-right">
            <div class="menu-toggle" onClick="toggleMobileMenu()">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>
            <div class="user-menu">
                <div class="user-icon" onClick="toggleUserDropdown()">👤</div>
                <div class="user-dropdown" id="userDropdown">
                    
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
      <div class="header" style="display: block;    position: relative;    z-index: 8;    text-align: center;    margin-bottom: 25px;    border-radius: 20px;">
               
            <p>Criar novo evento</p>
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
                    <div class="step-title">Lotes</div>
                </div>
                <div class="step" data-step="6">
                    <div class="step-number"><span>6</span></div>
                    <div class="step-title">Tipos de Ingresso</div>
                </div>
                <div class="step" data-step="7">
                    <div class="step-number"><span>7</span></div>
                    <div class="step-title">Produtor</div>
                </div>
                <div class="step" data-step="8">
                    <div class="step-number"><span>8</span></div>
                    <div class="step-title">Publicar</div>
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
                                <option value="tecnologia">Tecnologia</option>
                                <option value="negocios">Negócios</option>
                                <option value="educacao">Educação</option>
                                <option value="entretenimento">Entretenimento</option>
                                <option value="esportes">Esportes</option>
                                <option value="arte-cultura">Arte e Cultura</option>
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

                 <!--   <div class="switch-container">
                        <div class="switch" id="multiDaySwitch">
                            <div class="switch-handle"></div>
                        </div>
                        <label>Evento com duração em dias diferentes?</label>
                    </div>-->

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

                <!--    <div class="info-box">
                        <div class="info-box-title">📋 Política de cancelamento</div>
                        <div class="info-box-text">
                            Você pode cancelar ou reagendar seu evento até 7 dias antes da data de realização. 
                            Cancelamentos realizados com menos de 7 dias de antecedência podem estar sujeitos a taxas. 
                            <a href="#" style="color: #00C2FF;">Saiba mais sobre nossa política</a>
                        </div>
                    </div>-->
                    
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
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="addressSearch" placeholder="Digite o endereço completo ou nome do local" style="flex: 1;">
                                <button type="button" class="btn btn-primary" onclick="searchAddressManual()" style="white-space: nowrap;">
                                    🔍 Buscar Endereço
                                </button>
                            </div>
                            <div id="addressSuggestions" class="address-suggestions"></div>
                            <div class="address-loading" id="addressLoading">
                                <div class="spinner"></div>
                                <span>Carregando endereço...</span>
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

                <!-- Step 5: Lotes -->
                <div class="section-card" data-step-content="5">
                    <div class="section-header">
                        <div class="section-number">5</div>
                        <div>
                            <div class="section-title">📋 Lotes</div>
                            <div class="section-subtitle">Configure os lotes para controlar vendas e preços</div>
                        </div>
                    </div>

                    <div class="lotes-container">
                        <div class="lotes-grid">
                            <!-- Quadro 1: Lotes por Data -->
                            <div class="lote-section">
                                <div class="lote-section-header">
                                    <h3>📅 Lotes por Data</h3>
                                    <p>Controle vendas por período específico</p>
                                </div>
                                
                                <div class="lotes-list" id="lotesPorDataList">
                                    <div class="lote-empty-state" id="loteDataEmpty">
                                        <div style="font-size: 2rem; margin-bottom: 10px;">📅</div>
                                        <div style="color: #8B95A7;">Nenhum lote por data criado</div>
                                        <div style="color: #8B95A7; font-size: 0.85rem;">Clique em "Adicionar" para criar</div>
                                    </div>
                                </div>
                                
                                <button class="btn btn-outline btn-small" type="button" onclick="adicionarLotePorData()">
                                    ➕ Adicionar Lote por Data
                                </button>
                            </div>

                            <!-- Quadro 2: Lotes por Percentual -->
                            <div class="lote-section">
                                <div class="lote-section-header">
                                    <h3>📊 Lotes por Quantidade de Venda</h3>
                                    <p>Controle vendas por percentual atingido</p>
                                </div>
                                
                                <div class="lotes-list" id="lotesPorPercentualList">
                                    <div class="lote-empty-state" id="lotePercentualEmpty">
                                        <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                                        <div style="color: #8B95A7;">Nenhum lote por percentual criado</div>
                                        <div style="color: #8B95A7; font-size: 0.85rem;">Clique em "Adicionar" para criar</div>
                                    </div>
                                </div>
                                
                                <div class="percentual-summary" id="percentualSummary" style="display: none;">
                                    <div class="summary-item">
                                        <span>Total configurado:</span>
                                        <span id="totalPercentual">0%</span>
                                    </div>
                                    <div class="summary-item">
                                        <span>Restante:</span>
                                        <span id="restantePercentual">100%</span>
                                    </div>
                                </div>
                                
                                <button class="btn btn-outline btn-small" type="button" onclick="adicionarLotePorPercentual()">
                                    ➕ Adicionar Lote por Percentual
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="validation-message" id="validation-step-5">
                        Por favor, configure pelo menos um lote para continuar.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 6: Ingressos -->
                <div class="section-card" data-step-content="6">
                    <div class="section-header">
                        <div class="section-number">6</div>
                        <div>
                            <div class="section-title">🎟️ Tipos de Ingresso</div>
                            <div class="section-subtitle">Configure os tipos de ingresso e valores</div>
                        </div>
                    </div>

                    <div class="ticket-list" id="ticketList"></div>

                    <div class="ticket-actions">
                        <button class="btn btn-outline" type="button" id="addPaidTicket">
                            ➕ Tipo de Ingresso Pago
                        </button>
                        <button class="btn btn-outline" type="button" id="addFreeTicket">
                            🆓 Tipo de Ingresso Gratuito
                        </button>
                        <button class="btn btn-outline" type="button" id="addComboTicket">
                            📦 Combo de Tipos de Ingresso
                        </button>
                    </div>
                    
                    <div class="validation-message" id="validation-step-6">
                        Por favor, preencha todos os campos obrigatórios.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 7: Sobre o Produtor -->
                <div class="section-card" data-step-content="7">
                    <div class="section-header">
                        <div class="section-number">7</div>
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
                    
                    <!-- Passar dados do usuário para JavaScript -->
                    <script>
                        window.currentUserName = '<?php echo isset($_SESSION['usuario_nome']) ? addslashes($_SESSION['usuario_nome']) : 'Usuário Atual'; ?>';
                        window.currentUserId = '<?php echo isset($_SESSION['usuarioid']) ? $_SESSION['usuarioid'] : ''; ?>';
                    </script>
                    
                    <div class="validation-message" id="validation-step-7">
                        Por favor, preencha todos os campos obrigatórios.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 8: Responsabilidades e Publicação -->
                <div class="section-card" data-step-content="8">
                    <div class="section-header">
                        <div class="section-number">8</div>
                        <div>
                            <div class="section-title">📜 Responsabilidades e publicação</div>
                            <div class="section-subtitle">Configurações finais e termos de uso</div>
                        </div>
                    </div>

                    <div class="checkbox-group">
                        <div class="checkbox" id="termsCheckbox"></div>
                        <label for="termsCheckbox">
                            Concordo com os <a href="#" onclick="showTerms(event)" style="color: #00C2FF;">Termos de uso</a> e 
                            <a href="#" onclick="showPrivacy(event)" style="color: #00C2FF;">Políticas de privacidade</a> da plataforma
                        </label>
                    </div>

                    <div class="form-group">
                        <label>Visibilidade do evento</label>
                        <div class="radio-group">
                            <div class="radio-item">
                                <div class="radio checked" data-value="public"></div>
                                <div>
                                    <div style="font-weight: 500;">Público</div>
                                    <div style="font-size: 0.85rem; color: #8B95A7;">Qualquer pessoa pode encontrar e se inscrever no seu evento</div>
                                </div>
                            </div>
                            <div class="radio-item">
                                <div class="radio" data-value="private"></div>
                                <div>
                                    <div style="font-weight: 500;">Privado</div>
                                    <div style="font-size: 0.85rem; color: #8B95A7;">Apenas pessoas com convite ou link direto podem acessar</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="validation-message" id="validation-step-7">
                        Por favor, aceite os termos de uso para publicar o evento.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-publish" onClick="publishEvent()">
                            ✓ Publicar evento
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
                    <!-- Preview Proporcional da Section -->
                    <div class="hero-section-mini">
                        <!-- Background -->
                        <div class="hero-mini-background" id="heroBackground"></div>
                        
                        <!-- Container com padding proporcional -->
                        <div class="hero-mini-container">
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
        <!-- Fecha main-content -->
    </main>
    </div>
    
     <!-- Modal para Criar Ingresso Pago -->
    <div class="modal-overlay" id="paidTicketModal">
        <div class="modal" style="max-width: 1000px; width: 90%;">
            <div class="modal-header">
                <div class="modal-title">Criar tipo de ingresso pago</div>
                <button class="modal-close" onClick="closeModal('paidTicketModal')">&times;</button>
            </div>
            
            <div class="form-group full-width">
                <label>Título do tipo de ingresso <span class="required">*</span></label>
                <input type="text" id="paidTicketTitle" placeholder="Tipo VIP, Meia-Entrada, Premium, etc." maxlength="45">
            </div>

            <div class="form-group full-width" style="margin-top: 10px;">
                <label>Lote <span class="required">*</span></label>
                <select id="paidTicketLote" class="form-control" onchange="updatePaidTicketDates()">
                    <option value="">Selecione um lote</option>
                </select>
            </div>

            <div class="form-grid" style="margin-top: 10px; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <!-- Coluna 1: Cálculo de Valores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Cálculo de Valores</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Preço de Venda <span class="required">*</span></label>
                        <input type="text" id="paidTicketPrice" placeholder="R$ 0,00" maxlength="15" oninput="aplicarMascaraMonetaria(this)">
                    </div>
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                            <span>Cobrar Taxa de Serviço</span>
                            <label class="switch">
                                <input type="checkbox" id="paidTicketTaxaServico" checked onchange="calcularValoresIngresso()">
                                <span class="slider round"></span>
                            </label>
                        </label>
                    </div>
                    
                    <hr style="border: 1px dashed #e0e0e0; margin: 12px 0;">
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="font-size: 11px;">Taxa de Serviço (<span id="taxaPercentual">8</span>%)</label>
                        <input type="text" id="paidTicketTaxaValor" readonly value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; font-size: 11px;">Valor a Cobrar do Comprador</label>
                        <input type="text" id="paidTicketValorComprador" readonly style="font-weight: 600;" value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; color: #28a745; font-size: 11px;">Valor Líquido a Receber</label>
                        <input type="text" id="paidTicketValorReceber" readonly style="font-weight: 600; color: #28a745;" value="R$ 0,00">
                    </div>
                </div>
                
                <!-- Coluna 2: Quantidade e Datas -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Venda</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Quantidade <span class="required">*</span></label>
                        <input type="number" id="paidTicketQuantity" placeholder="Ex. 100" min="1" oninput="calcularQuantidadeLote()">
                    </div>
                    
                    <div class="form-group" id="quantidadeLoteContainer" style="margin-top: 15px; display: none;">
                        <label style="font-size: 11px;">Esse lote vai encerrar após a venda de:</label>
                        <input type="text" id="paidTicketQuantidadeLote" readonly value="0 ingressos">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label id="paidTicketPeriodTitle" style="font-size: 11px; font-weight: 600;">Período das vendas</label>
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Início <span class="required">*</span></label>
                        <input type="datetime-local" id="paidSaleStart" readonly style="font-size: 12px;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Término <span class="required">*</span></label>
                        <input type="datetime-local" id="paidSaleEnd" readonly style="font-size: 12px;">
                    </div>
                </div>
                
                <!-- Coluna 3: Quantidade por Compra e Descrição -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Detalhes Adicionais</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 11px;">Quantidade Mínima por Compra</label>
                        <input type="number" id="paidMinQuantity" value="1" min="1">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Quantidade Máxima por Compra</label>
                        <input type="number" id="paidMaxQuantity" value="5" min="1">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label style="font-size: 11px;">Descrição (opcional)</label>
                        <textarea id="paidTicketDescription" rows="3" placeholder="Informações adicionais..." maxlength="100" style="font-size: 12px;"></textarea>
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary" onClick="closeModal('paidTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createPaidTicket()">Criar Tipo de Ingresso</button>
            </div>
        </div>
    </div>

    <!-- Modal para Criar Ingresso Gratuito -->
    <div class="modal-overlay" id="freeTicketModal">
        <div class="modal" style="max-width: 1000px; width: 90%;">
            <div class="modal-header">
                <div class="modal-title">Criar tipo de ingresso gratuito</div>
                <button class="modal-close" onClick="closeModal('freeTicketModal')">&times;</button>
            </div>

            <div class="form-group full-width">
                <label>Título do tipo de ingresso <span class="required">*</span></label>
                <input type="text" id="freeTicketTitle" placeholder="Tipo Estudante, Cortesia, Acesso Livre, etc." maxlength="45">
            </div>

            <div class="form-group full-width" style="margin-top: 10px;">
                <label>Lote <span class="required">*</span></label>
                <select id="freeTicketLote" class="form-control" onchange="updateFreeTicketDates()">
                    <option value="">Selecione um lote</option>
                </select>
            </div>

            <div class="form-grid" style="margin-top: 10px; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <!-- Coluna 1: Tipo Gratuito -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Tipo de Ingresso Gratuito</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Preço de Venda</label>
                        <input type="text" value="R$ 0,00" readonly style="font-weight: 600;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="font-size: 11px;">Taxa de Serviço</label>
                        <input type="text" value="R$ 0,00" readonly>
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; font-size: 11px;">Valor a Cobrar do Comprador</label>
                        <input type="text" value="Gratuito" readonly style="font-weight: 600;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; color: #28a745; font-size: 11px;">Valor Líquido a Receber</label>
                        <input type="text" value="R$ 0,00" readonly style="font-weight: 600; color: #28a745;">
                    </div>
                </div>
                
                <!-- Coluna 2: Quantidade e Datas -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Venda</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Quantidade <span class="required">*</span></label>
                        <input type="number" id="freeTicketQuantity" placeholder="Ex. 100" min="1" oninput="calcularQuantidadeLoteFree()">
                    </div>
                    
                    <div class="form-group" id="freeQuantidadeLoteContainer" style="margin-top: 15px; display: none;">
                        <label style="font-size: 11px;">Esse lote vai encerrar após a venda de:</label>
                        <input type="text" id="freeTicketQuantidadeLote" readonly value="0 ingressos">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label id="freeTicketPeriodTitle" style="font-size: 11px; font-weight: 600;">Período das vendas</label>
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Início <span class="required">*</span></label>
                        <input type="datetime-local" id="freeSaleStart" readonly style="font-size: 12px;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Término <span class="required">*</span></label>
                        <input type="datetime-local" id="freeSaleEnd" readonly style="font-size: 12px;">
                    </div>
                </div>
                
                <!-- Coluna 3: Quantidade por Compra e Descrição -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Detalhes Adicionais</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 11px;">Quantidade Mínima por Compra</label>
                        <input type="number" id="freeMinQuantity" value="1" min="1">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Quantidade Máxima por Compra</label>
                        <input type="number" id="freeMaxQuantity" value="5" min="1">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label style="font-size: 11px;">Descrição (opcional)</label>
                        <textarea id="freeTicketDescription" rows="3" placeholder="Informações adicionais..." maxlength="100" style="font-size: 12px;"></textarea>
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary" onClick="closeModal('freeTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createFreeTicket()">Criar Tipo de Ingresso</button>
            </div>
        </div>
    </div>

    <!-- Modal para Criar Ingresso Códigos -->
    <div class="modal-overlay" id="codeTicketModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Criar tipo de ingresso por códigos</div>
                <button class="modal-close" onClick="closeModal('codeTicketModal')">&times;</button>
            </div>

            <div class="info-banner">
                Os códigos serão gerados automaticamente e poderão ser compartilhados individualmente com os participantes
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do tipo de ingresso <span class="required">*</span></label>
                    <input type="text" id="codeTicketTitle" placeholder="Convite VIP, Acesso Restrito, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade de códigos <span class="required">*</span></label>
                    <input type="number" id="codeTicketQuantity" placeholder="Ex. 50" min="1" max="1000">
                    <small style="color: #8B95A7;">Máximo 1000 códigos</small>
                </div>
            </div>

            <div class="form-group">
                <label>Valor do ingresso</label>
                <input type="text" value="Acesso via código" readonly style="background: rgba(139, 149, 167, 0.1);">
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período de validade dos códigos:</h4>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Data de Início <span class="required">*</span></label>
                        <input type="datetime-local" id="codeSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Término <span class="required">*</span></label>
                        <input type="datetime-local" id="codeSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>
            </div>

            <hr class="section-divider">

            <div class="form-group full-width">
                <label>Descrição do Tipo de Ingresso (opcional):</label>
                <textarea id="codeTicketDescription" rows="3" placeholder="Informações sobre este tipo de acesso especial..." maxlength="100"></textarea>
                <small style="color: #8B95A7;">100 caracteres restantes</small>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('codeTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createCodeTicket()">Gerar Códigos</button>
            </div>
        </div>
    </div>

    <!-- Modal para Criar Combo de Tipos de Ingresso -->
    <div class="modal-overlay" id="comboTicketModal">
        <div class="modal" style="max-width: 1200px; width: 95%;">
            <div class="modal-header">
                <div class="modal-title">Criar combo de tipos de ingresso</div>
                <button class="modal-close" onClick="closeModal('comboTicketModal')">&times;</button>
            </div>

            <div class="info-banner">
                Um combo agrupa múltiplos tipos de ingresso em um único produto. O comprador paga pelo combo e recebe vouchers individuais de cada tipo incluído.
            </div>

            <div class="form-group full-width">
                <label>Título do combo <span class="required">*</span></label>
                <input type="text" id="comboTicketTitle" placeholder="Combo Família, Pacote Premium, etc." maxlength="45">
            </div>

            <div class="form-group full-width" style="margin-top: 10px;">
                <label>Lote <span class="required">*</span></label>
                <select id="comboTicketLote" class="form-control" onchange="updateComboTicketDates()">
                    <option value="">Selecione um lote</option>
                </select>
            </div>

            <div class="form-grid" style="margin-top: 10px; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <!-- Coluna 1: Cálculo de Valores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Cálculo de Valores</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Preço do Combo <span class="required">*</span></label>
                        <input type="text" id="comboTicketPrice" placeholder="R$ 0,00" maxlength="15" oninput="aplicarMascaraMonetaria(this); calcularValoresCombo()">
                    </div>
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                            <span>Cobrar Taxa de Serviço</span>
                            <label class="switch">
                                <input type="checkbox" id="comboTicketTaxaServico" checked onchange="calcularValoresCombo()">
                                <span class="slider round"></span>
                            </label>
                        </label>
                    </div>
                    
                    <hr style="border: 1px dashed #e0e0e0; margin: 12px 0;">
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="font-size: 11px;">Taxa de Serviço (<span id="comboTaxaPercentual">8</span>%)</label>
                        <input type="text" id="comboTicketTaxaValor" readonly value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; font-size: 11px;">Valor a Cobrar do Comprador</label>
                        <input type="text" id="comboTicketValorComprador" readonly style="font-weight: 600;" value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; color: #28a745; font-size: 11px;">Valor Líquido a Receber</label>
                        <input type="text" id="comboTicketReceive" readonly style="font-weight: 600; color: #28a745;" value="R$ 0,00">
                    </div>
                </div>
                
                <!-- Coluna 2: Quantidade e Datas -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Venda</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Quantidade de Combos <span class="required">*</span></label>
                        <input type="number" id="comboTicketQuantity" placeholder="Ex. 50" min="1" oninput="calcularQuantidadeLoteCombo()">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label id="comboTicketPeriodTitle" style="font-size: 11px; font-weight: 600;">Período das vendas</label>
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Início <span class="required">*</span></label>
                        <input type="datetime-local" id="comboSaleStart" style="font-size: 12px;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Término <span class="required">*</span></label>
                        <input type="datetime-local" id="comboSaleEnd" style="font-size: 12px;">
                    </div>
                </div>
                
                <!-- Coluna 3: Composição do Combo -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Composição do Combo</h4>
                    
                    <div id="comboItemsList" class="combo-items-list" style="max-height: 120px; overflow-y: auto; margin-bottom: 10px;">
                        <div class="combo-empty-state">
                            <div style="font-size: 1.2rem; margin-bottom: 5px;">+</div>
                            <div style="color: #8B95A7; font-size: 11px;">Adicione tipos de ingresso</div>
                        </div>
                    </div>

                    <div class="form-grid" style="gap: 8px;">
                        <div class="form-group">
                            <label style="font-size: 11px;">Tipo de ingresso</label>
                            <select id="comboTicketTypeSelect" style="font-size: 12px;">
                                <option value="">Selecione um lote primeiro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-size: 11px;">Qtd</label>
                            <input type="number" id="comboItemQuantity" placeholder="1" min="1" max="10" style="font-size: 12px;">
                        </div>
                    </div>
                    <button class="btn btn-outline" type="button" onclick="addItemToCombo()" style="font-size: 11px; padding: 6px 12px;">➕ Adicionar</button>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label style="font-size: 11px;">Descrição (opcional)</label>
                        <textarea id="comboTicketDescription" rows="2" placeholder="Benefícios do combo..." maxlength="200" style="font-size: 12px;"></textarea>
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary" onClick="closeModal('comboTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createComboTicket()">Criar Combo</button>
            </div>
        </div>
    </div>

    <!-- Modal para Listar Códigos -->
    <div class="modal-overlay" id="codesListModal">
        <div class="modal" style="max-width: 900px;">
            <div class="modal-header">
                <div class="modal-title">Gerenciar Códigos - <span id="codesModalTitle">Nome do Ingresso</span></div>
                <button class="modal-close" onClick="closeModal('codesListModal')">&times;</button>
            </div>

            <div class="codes-actions">
                <button class="btn btn-outline btn-small" onClick="exportCodes()">📋 Exportar todos</button>
                <button class="btn btn-outline btn-small" onClick="copyAllCodes()">📄 Copiar todos</button>
                <button class="btn btn-secondary btn-small" onClick="regenerateUsedCodes()">🔄 Regenerar usados</button>
            </div>

            <input type="text" class="search-codes" id="searchCodes" placeholder="Buscar por código, email ou status..." onKeyUp="filterCodes()">

            <div style="max-height: 400px; overflow-y: auto;">
                <table class="codes-table" id="codesTable">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Encaminhado para</th>
                            <th>Utilizado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="codesTableBody">
                        <!-- Códigos serão inseridos aqui via JavaScript -->
                    </tbody>
                </table>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('codesListModal')">Fechar</button>
            </div>
        </div>
    </div>

    <script>
        // Toggle mobile menu
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            menuToggle.classList.toggle('active');
        }

        // Close mobile menu
        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
        }

        // Toggle user dropdown
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        // Close dropdown and mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            
            // Close user dropdown
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('active');
            }
            
            // Close mobile menu if clicking outside sidebar and menu toggle
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

        // Set active menu item
        function setActiveMenu(element, section) {
            // Remove active class from all menu items
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            element.classList.add('active');
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
            
            // Update content area (placeholder for now)
            updateContentArea(section);
        }

       
        // Settings function
        function openSettings() {
            document.getElementById('userDropdown').classList.remove('active');
            alert('Abrindo configurações...');
        }

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
                // Aqui você adicionaria a lógica real de logout
            }
        }

        // Mouse interaction with particles
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

        // Add smooth interactions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 4px 20px rgba(0, 194, 255, 0.2)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.boxShadow = 'none';
            });
        });
    </script>
    
    <!-- ==================== MODAIS DE EDIÇÃO ==================== -->
    <!-- Modal para Editar Ingresso Pago -->
    <div class="modal-overlay" id="editPaidTicketModal">
        <div class="modal" style="max-width: 1000px; width: 90%;">
            <div class="modal-header">
                <div class="modal-title">Editar tipo de ingresso pago</div>
                <button class="modal-close" onClick="closeModal('editPaidTicketModal')">&times;</button>
            </div>

            <input type="hidden" id="editTicketId">

            <div class="form-group full-width">
                <label>Título do tipo de ingresso <span class="required">*</span></label>
                <input type="text" id="editPaidTicketTitle" placeholder="Tipo VIP, Meia-Entrada, Premium, etc." maxlength="45">
            </div>

            <div class="form-group full-width" style="margin-top: 15px;">
                <label>Lote <span class="required">*</span></label>
                <select id="editPaidTicketLote" class="form-control" onchange="updateEditPaidTicketDates()">
                    <option value="">Selecione um lote</option>
                </select>
            </div>

            <div class="form-grid" style="margin-top: 10px; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <!-- Coluna 1: Cálculo de Valores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Cálculo de Valores</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Preço de Venda <span class="required">*</span></label>
                        <input type="text" id="editPaidTicketPrice" placeholder="R$ 0,00" maxlength="15" oninput="aplicarMascaraMonetariaEdit(this)">
                    </div>
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                            <span>Cobrar Taxa de Serviço</span>
                            <label class="switch">
                                <input type="checkbox" id="editPaidTicketTaxaServico" checked onchange="calcularValoresIngressoEdit()">
                                <span class="slider round"></span>
                            </label>
                        </label>
                    </div>
                    
                    <hr style="border: 1px dashed #e0e0e0; margin: 12px 0;">
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="font-size: 11px;">Taxa de Serviço (<span id="editTaxaPercentual">8</span>%)</label>
                        <input type="text" id="editPaidTicketTaxaValor" readonly value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; font-size: 11px;">Valor a Cobrar do Comprador</label>
                        <input type="text" id="editPaidTicketValorComprador" readonly style="font-weight: 600;" value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; color: #28a745; font-size: 11px;">Valor Líquido a Receber</label>
                        <input type="text" id="editPaidTicketValorReceber" readonly style="font-weight: 600; color: #28a745;" value="R$ 0,00">
                    </div>
                </div>
                
                <!-- Coluna 2: Quantidade e Datas -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Venda</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Quantidade <span class="required">*</span></label>
                        <input type="number" id="editPaidTicketQuantity" placeholder="Ex. 100" min="1" oninput="calcularQuantidadeLoteEdit()">
                    </div>
                    
                    <div class="form-group" id="editQuantidadeLoteContainer" style="margin-top: 15px; display: none;">
                        <label style="font-size: 11px;">Esse lote vai encerrar após a venda de:</label>
                        <input type="text" id="editPaidTicketQuantidadeLote" readonly value="0 ingressos">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label id="editPaidTicketPeriodTitle" style="font-size: 11px; font-weight: 600;">Período das vendas</label>
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Início <span class="required">*</span></label>
                        <input type="datetime-local" id="editPaidSaleStart" readonly style="font-size: 12px;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Término <span class="required">*</span></label>
                        <input type="datetime-local" id="editPaidSaleEnd" readonly style="font-size: 12px;">
                    </div>
                </div>
                
                <!-- Coluna 3: Quantidade por Compra e Descrição -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Detalhes Adicionais</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 11px;">Quantidade Mínima por Compra</label>
                        <input type="number" id="editPaidMinLimit" value="1" min="1">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Quantidade Máxima por Compra</label>
                        <input type="number" id="editPaidMaxLimit" value="5" min="1">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label style="font-size: 11px;">Descrição (opcional)</label>
                        <textarea id="editPaidTicketDescription" rows="3" placeholder="Informações adicionais..." maxlength="100" style="font-size: 12px;"></textarea>
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary" onClick="closeModal('editPaidTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="updatePaidTicket()">Salvar Alterações</button>
            </div>
        </div>
    </div>

    <!-- Modal para Editar Ingresso Gratuito -->
    <div class="modal-overlay" id="editFreeTicketModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar ingresso gratuito</div>
                <button class="modal-close" onClick="closeModal('editFreeTicketModal')">&times;</button>
            </div>

            <input type="hidden" id="editFreeTicketId">

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do ingresso <span class="required">*</span></label>
                    <input type="text" id="editFreeTicketTitle" placeholder="Ingresso único, Meia-Entrada, VIP, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade <span class="required">*</span></label>
                    <input type="number" id="editFreeTicketQuantity" placeholder="Ex. 100" min="1">
                </div>
            </div>
            
            <div class="form-group full-width">
                <label>Lote <span class="required">*</span></label>
                <select id="editFreeTicketLote" class="form-control">
                    <option value="">Selecione um lote</option>
                </select>
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período das vendas deste ingresso:</h4>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Data de Início das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editFreeSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Fim das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editFreeSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Limite mínimo por compra</label>
                        <input type="number" id="editFreeMinLimit" placeholder="1" min="1">
                    </div>
                    <div class="form-group">
                        <label>Limite máximo por compra</label>
                        <input type="number" id="editFreeMaxLimit" placeholder="5" min="1">
                    </div>
                </div>

                <div class="form-group">
                    <label>Descrição do ingresso</label>
                    <textarea id="editFreeTicketDescription" placeholder="Descrição detalhada do ingresso..." rows="3"></textarea>
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('editFreeTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="updateFreeTicket()">Salvar alterações</button>
            </div>
        </div>
    </div>

    <!-- Modal para Editar Combo -->
    <div class="modal-overlay" id="editComboModal">
        <div class="modal" style="max-width: 1000px; width: 90%;">
            <div class="modal-header">
                <div class="modal-title">Editar combo de tipos de ingresso</div>
                <button class="modal-close" onClick="closeModal('editComboModal')">&times;</button>
            </div>

            <input type="hidden" id="editComboId">

            <div class="form-group full-width">
                <label>Título do combo <span class="required">*</span></label>
                <input type="text" id="editComboTitle" placeholder="Combo Família, Pacote Premium, etc." maxlength="45">
            </div>

            <div class="form-group full-width" style="margin-top: 10px;">
                <label>Lote <span class="required">*</span></label>
                <select id="editComboLote" class="form-control" onchange="updateEditComboTicketDates()">
                    <option value="">Selecione um lote</option>
                </select>
            </div>

            <div class="form-grid" style="margin-top: 10px; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <!-- Coluna 1: Cálculo de Valores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Cálculo de Valores</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Preço do Combo <span class="required">*</span></label>
                        <input type="text" id="editComboPrice" placeholder="R$ 0,00" maxlength="15" oninput="aplicarMascaraMonetaria(this); calcularValoresEditCombo()">
                    </div>
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                            <span>Cobrar Taxa de Serviço</span>
                            <label class="switch">
                                <input type="checkbox" id="editComboTaxaServico" checked onchange="calcularValoresEditCombo()">
                                <span class="slider round"></span>
                            </label>
                        </label>
                    </div>
                    
                    <hr style="border: 1px dashed #e0e0e0; margin: 12px 0;">
                    
                    <div class="form-group" style="margin-top: 12px;">
                        <label style="font-size: 11px;">Taxa de Serviço (<span id="editComboTaxaPercentual">8</span>%)</label>
                        <input type="text" id="editComboTaxaValor" readonly value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; font-size: 11px;">Valor a Cobrar do Comprador</label>
                        <input type="text" id="editComboValorComprador" readonly style="font-weight: 600;" value="R$ 0,00">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-weight: 600; color: #28a745; font-size: 11px;">Valor Líquido a Receber</label>
                        <input type="text" id="editComboReceive" readonly style="font-weight: 600; color: #28a745;" value="R$ 0,00">
                    </div>
                </div>
                
                <!-- Coluna 2: Quantidade e Datas -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Venda</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Quantidade de Combos <span class="required">*</span></label>
                        <input type="number" id="editComboQuantity" placeholder="Ex. 50" min="1" oninput="calcularQuantidadeLoteEditCombo()">
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label id="editComboTicketPeriodTitle" style="font-size: 11px; font-weight: 600;">Período das vendas</label>
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Início <span class="required">*</span></label>
                        <input type="datetime-local" id="editComboSaleStart" style="font-size: 12px;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 11px;">Data de Término <span class="required">*</span></label>
                        <input type="datetime-local" id="editComboSaleEnd" style="font-size: 12px;">
                    </div>
                </div>
                
                <!-- Coluna 3: Composição do Combo -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Composição do Combo</h4>
                    
                    <div id="editComboItemsList" class="combo-items-list" style="max-height: 120px; overflow-y: auto; margin-bottom: 10px;">
                        <div class="combo-empty-state">
                            <div style="font-size: 1.2rem; margin-bottom: 5px;">+</div>
                            <div style="color: #8B95A7; font-size: 11px;">Adicione tipos de ingresso</div>
                        </div>
                    </div>

                    <div class="form-grid" style="gap: 8px;">
                        <div class="form-group">
                            <label style="font-size: 11px;">Tipo de ingresso</label>
                            <select id="editComboTicketTypeSelect" style="font-size: 12px;">
                                <option value="">Selecione um lote primeiro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-size: 11px;">Qtd</label>
                            <input type="number" id="editComboItemQuantity" placeholder="1" min="1" max="10" style="font-size: 12px;">
                        </div>
                    </div>
                    <button class="btn btn-outline" type="button" onclick="addItemToEditCombo()" style="font-size: 11px; padding: 6px 12px;">➕ Adicionar</button>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label style="font-size: 11px;">Descrição (opcional)</label>
                        <textarea id="editComboDescription" rows="2" placeholder="Benefícios do combo..." maxlength="200" style="font-size: 12px;"></textarea>
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary" onClick="closeModal('editComboModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="updateComboTicket()">Salvar alterações</button>
            </div>
        </div>
    </div>
    
    <!-- ==================== FIM DOS MODAIS DE EDIÇÃO ==================== -->
    
    <!-- ==================== MODAIS DE LOTES ==================== -->
    <!-- Modal para Criar Lote por Data -->
    <div class="modal-overlay" id="loteDataModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Criar lote por data</div>
                <button class="modal-close" onClick="closeModal('loteDataModal')">&times;</button>
            </div>
            
            <div class="info-banner">
                Este lote será ativo durante o período especificado. Os ingressos só poderão ser vendidos dentro dessas datas.
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Data de Início das Vendas <span class="required">*</span></label>
                    <input type="datetime-local" id="loteDataInicio">
                    <small style="color: #8B95A7;">Horário de Brasília</small>
                </div>
                <div class="form-group">
                    <label>Data de Término das Vendas <span class="required">*</span></label>
                    <input type="datetime-local" id="loteDataFim">
                    <small style="color: #8B95A7;">Horário de Brasília</small>
                </div>
            </div>

            <div class="switch-container">
                <label class="iphone-switch">
                    <input type="checkbox" id="loteDataDivulgar">
                    <span class="iphone-switch-slider"></span>
                </label>
                <label for="loteDataDivulgar">Divulgar critério ao público</label>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('loteDataModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="criarLoteData()">Criar Lote</button>
            </div>
        </div>
    </div>

    <!-- Modal para Criar Lote por Percentual -->
    <div class="modal-overlay" id="lotePercentualModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Criar lote por percentual de vendas</div>
                <button class="modal-close" onClick="closeModal('lotePercentualModal')">&times;</button>
            </div>
            
            <div class="info-banner">
                Este lote será encerrado automaticamente quando o percentual de vendas for atingido.
            </div>

            <div class="form-group">
                <label>Percentual de vendas para encerramento <span class="required">*</span></label>
                <input type="number" id="lotePercentualValor" placeholder="Ex: 75" min="1" max="100">
                <small style="color: #8B95A7;">De 1% a 100%</small>
            </div>

            <div class="switch-container">
                <label class="iphone-switch">
                    <input type="checkbox" id="lotePercentualDivulgar">
                    <span class="iphone-switch-slider"></span>
                </label>
                <label for="lotePercentualDivulgar">Divulgar critério ao público</label>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('lotePercentualModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="criarLotePercentual()">Criar Lote</button>
            </div>
        </div>
    </div>

    <!-- Modal para Editar Lote por Data -->
    <div class="modal-overlay" id="editLoteDataModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar lote por data</div>
                <button class="modal-close" onClick="closeModal('editLoteDataModal')">&times;</button>
            </div>
            
            <input type="hidden" id="editLoteDataId">

            <div class="form-grid">
                <div class="form-group">
                    <label>Data de Início das Vendas <span class="required">*</span></label>
                    <input type="datetime-local" id="editLoteDataInicio">
                </div>
                <div class="form-group">
                    <label>Data de Término das Vendas <span class="required">*</span></label>
                    <input type="datetime-local" id="editLoteDataFim">
                </div>
            </div>

            <div class="switch-container">
                <label class="iphone-switch">
                    <input type="checkbox" id="editLoteDataDivulgar">
                    <span class="iphone-switch-slider"></span>
                </label>
                <label for="editLoteDataDivulgar">Divulgar critério ao público</label>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('editLoteDataModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="salvarLoteData()">Salvar Alterações</button>
            </div>
        </div>
    </div>

    <!-- Modal para Editar Lote por Percentual -->
    <div class="modal-overlay" id="editLotePercentualModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar lote por percentual</div>
                <button class="modal-close" onClick="closeModal('editLotePercentualModal')">&times;</button>
            </div>
            
            <input type="hidden" id="editLotePercentualId">

            <div class="form-group">
                <label>Percentual de vendas <span class="required">*</span></label>
                <input type="number" id="editLotePercentualValor" min="1" max="100">
            </div>

            <div class="switch-container">
                <label class="iphone-switch">
                    <input type="checkbox" id="editLotePercentualDivulgar">
                    <span class="iphone-switch-slider"></span>
                </label>
                <label for="editLotePercentualDivulgar">Divulgar critério ao público</label>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('editLotePercentualModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="salvarLotePercentual()">Salvar Alterações</button>
            </div>
        </div>
    </div>
    <!-- ==================== FIM DOS MODAIS DE LOTES ==================== -->
    
     <!-- Scripts de recuperação e salvamento -->
     <script language='javascript' src="/produtor/js/save-fix.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/custom-recovery.js?v=<?php echo time(); ?>"></script>
     
     <!-- Scripts anteriores desabilitados temporariamente
     <script language='javascript' src="/produtor/js/json-recovery-fix.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/wizard-management.js?v=<?php echo time(); ?>"></script>
     -->
     
     <script language='javascript' src="/produtor/js/custom-dialogs.js"></script>
     <script language='javascript' src="/produtor/js/alert-overrides.js"></script>
     <script language='javascript' src="/produtor/js/temporary-tickets.js"></script>
     <script language='javascript' src="/produtor/js/lotes.js"></script>
     <script language='javascript' src="/produtor/js/lote-protection.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/ingressos-pagos.js"></script>
     <script language='javascript' src="/produtor/js/criaevento.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/debug-validacoes.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/combo-functions.js"></script>
     <script language='javascript' src="/produtor/js/combo-override.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-pagos-edit.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-gratuitos.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-gratuitos-create.js"></script>
     <script language='javascript' src="/produtor/js/address-improvements.js"></script>
     <script language='javascript' src="/produtor/js/modal-correto.js"></script>

     <!-- Modal para Termos de Uso -->
     <div class="modal-overlay" id="termsModal">
         <div class="modal" style="max-width: 800px; width: 90%; max-height: 80vh;">
             <div class="modal-header">
                 <div class="modal-title">📜 Termos de Uso da Plataforma</div>
                 <button class="modal-close" onClick="closeModal('termsModal')">&times;</button>
             </div>
             <div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 20px;">
                 <div id="termsContent" style="line-height: 1.6;">
                     Carregando termos...
                 </div>
             </div>
             <div class="modal-actions">
                 <button class="btn btn-primary" onClick="closeModal('termsModal')">Entendi</button>
             </div>
         </div>
     </div>

     <!-- Modal para Política de Privacidade -->
     <div class="modal-overlay" id="privacyModal">
         <div class="modal" style="max-width: 800px; width: 90%; max-height: 80vh;">
             <div class="modal-header">
                 <div class="modal-title">🔒 Política de Privacidade</div>
                 <button class="modal-close" onClick="closeModal('privacyModal')">&times;</button>
             </div>
             <div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 20px;">
                 <div id="privacyContent" style="line-height: 1.6;">
                     Carregando política de privacidade...
                 </div>
             </div>
             <div class="modal-actions">
                 <button class="btn btn-primary" onClick="closeModal('privacyModal')">Entendi</button>
             </div>
         </div>
     </div>

     <!-- Script de Teste para Debug do Combo -->
     <script>
         // Teste adicional para debug
         window.addEventListener('load', function() {
             console.log('🧪 Teste de debug carregado');
             
             const comboBtn = document.getElementById('addComboTicket');
             console.log('🔍 Botão encontrado:', comboBtn);
             
             if (typeof openModal === 'function') {
                 console.log('✅ Função openModal existe');
             } else {
                 console.error('❌ Função openModal NÃO existe');
             }
             
             if (typeof populateComboTicketSelect === 'function') {
                 console.log('✅ Função populateComboTicketSelect existe');
             } else {
                 console.error('❌ Função populateComboTicketSelect NÃO existe');
             }
             
             // Teste direto no botão
             if (comboBtn) {
                 comboBtn.addEventListener('click', function() {
                     console.log('🎯 Clique detectado no botão combo!');
                 });
             }
         });
     </script>

     <!-- Fix para o ícone da lixeira -->
     <script>
     document.addEventListener('DOMContentLoaded', function() {
         // Sobrescrever a função updateComboItemsList com versão corrigida
         window.updateComboItemsList = function() {
             const container = document.getElementById('comboItemsList');
             if (!container) return;
             
             if (comboItems.length === 0) {
                 container.innerHTML = `
                     <div class="combo-empty-state">
                         <div style="font-size: 2rem; margin-bottom: 10px;">📦</div>
                         <div style="color: #8B95A7;">Adicione tipos de ingresso ao combo</div>
                         <div style="color: #8B95A7; font-size: 0.85rem;">Selecione os tipos já criados e defina quantidades</div>
                     </div>
                 `;
                 return;
             }
             
             container.innerHTML = comboItems.map((item, index) => `
                 <div class="combo-item">
                     <div class="combo-item-info">
                         <div class="combo-item-title">${item.name}</div>
                         <div class="combo-item-details">${item.price}</div>
                     </div>
                     <div style="display: flex; align-items: center;">
                         <div class="combo-item-quantity">${item.quantity}x</div>
                         <button class="btn-icon btn-delete" onclick="removeComboItem(${index})" title="Remover">
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                 <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                 <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                             </svg>
                         </button>
                     </div>
                 </div>
             `).join('');
         };
         console.log('✅ Função updateComboItemsList corrigida com ícone SVG');
     });
     </script>

       <!-- Scripts principais do sistema -->
     <script language='javascript' src="/produtor/js/custom-dialogs.js"></script>
     <script language='javascript' src="/produtor/js/alert-overrides.js"></script>
     <script language='javascript' src="/produtor/js/temporary-tickets.js"></script>
     <script language='javascript' src="/produtor/js/lotes.js"></script>
     <script language='javascript' src="/produtor/js/lote-protection.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/ingressos-pagos.js"></script>
     <script language='javascript' src="/produtor/js/criaevento.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/debug-validacoes.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/combo-functions.js"></script>
     <script language='javascript' src="/produtor/js/combo-override.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-pagos-edit.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-gratuitos.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-gratuitos-create.js"></script>
     <script language='javascript' src="/produtor/js/address-improvements.js"></script>
     <script language='javascript' src="/produtor/js/modal-correto.js"></script>
     
     <!-- Google Maps API -->
     <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDU5-cOqdusZMBI5pqbsLihQVKEI0fEO9o&libraries=places&callback=initMap" async defer></script>
     
     <!-- Scripts de correção -->
     <script src="js/wizard-validation-definitive.js?v=<?php echo time(); ?>"></script>
     <script src="js/publish-event-fix.js?v=<?php echo time(); ?>"></script>
     <script src="js/modal-fixes.js"></script>
     <script src="js/terms-privacy-handler.js"></script>
     <!-- <script src="js/wizard-debug.js"></script> DESABILITADO: Debug -->
     <!-- <script src="js/wizard-fix.js"></script> DESABILITADO: Conflito -->
     <script src="js/preview-fix.js"></script>
     <!-- <script src="js/wizard-fix-definitivo.js"></script> DESABILITADO: Conflito -->
     <script src="js/maps-fix.js"></script>
     <script src="js/restore-fix.js"></script>
     <script src="js/complete-fixes.js"></script>
<script src="js/ticket-functions-fix.js"></script>
<script src="js/lote-ticket-functions.js"></script>
    <script src="js/edit-combo-fixes.js"></script>
<script src="js/edit-combo-functions.js"></script>
<script src="js/correcoes-definitivas.js"></script>
<script src="js/lote-edit-free-fix.js"></script>
<!-- <script src="js/lotes-ingressos-persistence.js"></script> DESABILITADO: causando erro de JSON -->
<script src="js/combo-complete-fix.js?v=<?php echo time(); ?>"></script> 
<script src="js/combo-tax-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/lote-dates-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/edit-modal-fixes.js?v=<?php echo time(); ?>"></script>
<script src="js/preview-update-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/debug-load.js?v=<?php echo time(); ?>"></script>
<script src="js/final-corrections.js?v=<?php echo time(); ?>"></script>
<!-- Scripts de correção anteriores comentados para evitar conflitos
<script src="js/forced-fixes.js?v=<?php echo time(); ?>"></script>
<script src="js/step5-validation.js?v=<?php echo time(); ?>"></script>
<script src="js/edit-load-dates-fix.js?v=<?php echo time(); ?>"></script>
-->
<script src="js/consolidated-fix-v2.js?v=<?php echo time(); ?>"></script>
<!-- <script src="js/consolidated-fix.js?v=<?php echo time(); ?>"></script> -->
<script src="js/debug-lote-completo.js?v=<?php echo time(); ?>"></script>
<script src="js/combo-trash-icon-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/trash-icon-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/test-fixes.js?v=<?php echo time(); ?>"></script>
<script src="js/combo-visual-fixes.js?v=<?php echo time(); ?>"></script>
<script src="js/combo-final-fixes.js?v=<?php echo time(); ?>"></script>
<script src="js/combo-fixes-v3.js?v=<?php echo time(); ?>"></script>
<script src="js/image-upload-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/color-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/cleanup-after-publish.js?v=<?php echo time(); ?>"></script>
<script src="js/producer-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/test-recovery.js?v=<?php echo time(); ?>"></script>
<script src="js/force-save.js?v=<?php echo time(); ?>"></script>
<script src="js/cookie-monitor.js?v=<?php echo time(); ?>"></script>
<script src="js/override-save.js?v=<?php echo time(); ?>"></script>
<script src="js/diagnostico.js?v=<?php echo time(); ?>"></script>
<!-- Remover todos os scripts de validação anteriores -->
</body>
</html>