<?php
include("check_login.php");
include("conm/conn.php");

// Buscar dados do usuário
$usuario_id = $_SESSION['usuarioid'] ?? $_COOKIE['usuarioid'] ?? 0;
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
    <title>Painel Produtor - Anysummit</title>
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
            grid-template-columns: 1fr;
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
        
        /* Estilo para botão secundário */
        .btn-secondary {
            background: #6b7280 !important;
            color: white !important;
            border: 1px solid #4b5563 !important;
        }
        
        .btn-secondary:hover {
            background: #4b5563 !important;
        
        /* ESTILOS PARA ETAPA 5 - SETORES (DESIGN PROFISSIONAL) */
        .setores-container {
            margin-top: 25px;
        }
        
        /* Formulário para adicionar setor */
        .setor-form-container {
            background: rgba(15, 15, 35, 0.6);
            border: 1px solid rgba(184, 197, 209, 0.2);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
        }
        
        .form-group-inline {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .form-label-large {
            font-size: 1.1rem;
            font-weight: 600;
            color: #E1E5F2;
            margin-bottom: 8px;
        }
        
        .input-button-group {
            display: flex;
            gap: 15px;
            align-items: stretch;
        }
        
        .setor-input {
            flex: 1;
            padding: 12px 16px;
            background: rgba(26, 26, 46, 0.9);
            border: 1px solid rgba(184, 197, 209, 0.3);
            border-radius: 8px;
            color: #E1E5F2;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .setor-input:focus {
            outline: none;
            border-color: #00C2FF;
            box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.1);
        }
        
        .btn-add-setor {
            padding: 12px 24px;
            font-weight: 600;
            font-size: 1rem;
            white-space: nowrap;
            min-width: 160px;
        }
        
        /* Seção de setores */
        .setores-section {
            margin-top: 20px;
        }
        
        /* Grid de setores profissional */
        .setores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .setor-card {
            background: rgba(26, 26, 46, 0.9);
            border: 1px solid rgba(184, 197, 209, 0.2);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .setor-card:hover {
            border-color: rgba(0, 194, 255, 0.4);
            background: rgba(26, 26, 46, 0.95);
            transform: translateY(-2px);
        }
        
        .setor-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        
        .setor-nome-display {
            font-weight: 600;
            color: #E1E5F2;
            font-size: 1.1rem;
            line-height: 1.4;
            flex: 1;
            margin-right: 10px;
        }
        
        .setor-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
        }
        
        .setor-action-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #8B95A7;
            cursor: pointer;
            padding: 6px 8px;
            border-radius: 6px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 32px;
            height: 32px;
        }
        
        .setor-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }
        
        .setor-action-btn.edit:hover {
            color: #00C2FF;
            background: rgba(0, 194, 255, 0.1);
        }
        
        .setor-action-btn.delete:hover {
            color: #FF5252;
            background: rgba(255, 82, 82, 0.1);
        }
        
        .setor-meta {
            color: #8B95A7;
            font-size: 0.85rem;
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        /* Estado vazio simplificado */
        .setores-empty {
            text-align: center;
            padding: 40px 20px;
            background: rgba(15, 15, 35, 0.3);
            border: 2px dashed rgba(184, 197, 209, 0.3);
            border-radius: 12px;
            color: #8B95A7;
        }
        
        .setores-empty .empty-text {
            font-size: 1.1rem;
            font-weight: 500;
            margin-bottom: 8px;
            color: #B8C5D2;
        }
        
        .setores-empty .empty-hint {
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .input-button-group {
                flex-direction: column;
                gap: 12px;
            }
            
            .setores-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .setor-card {
                padding: 16px;
            }
        }
        
        @media (max-width: 1200px) {
            .setores-grid {
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            }
        }
        
        }
        
        /* CSS ADICIONAL PARA SETORES - GARANTIR APLICAÇÃO */
        #setoresGrid {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
            gap: 15px !important;
            margin-bottom: 20px !important;
        }
        
        @media (max-width: 768px) {
            #setoresGrid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
            }
        }
        
        /* ESTILOS PARA SETORES EM MODAIS DE INGRESSOS */
        .modal .setores-list {
            max-height: 100px;
            overflow-y: auto;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin-top: 5px;
        }
        
        .modal .setor-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            border-bottom: 1px solid #f0f0f0;
            background: rgba(26, 26, 46, 0.1);
            font-size: 11px;
        }
        
        .modal .setor-item:last-child {
            border-bottom: none;
        }
        
        .modal .setor-item-name {
            color: #333;
            font-weight: 500;
        }
        
        .modal .setor-item-remove {
            background: #ff4444;
            color: white;
            border: none;
            padding: 2px 6px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
            transition: all 0.3s ease;
        }
        
        .modal .setor-item-remove:hover {
            background: #cc0000;
            transform: scale(1.1);
        }
        
        /* BADGES PARA SETORES SELECIONADOS */
        .setores-badges-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 10px;
            min-height: 40px;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background: transparent;
            overflow: visible;
        }
        
        .setor-badge {
            position: relative;
            display: inline-flex;
            align-items: center;
            padding: 6px 24px 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            color: white;
            max-width: 150px;
            overflow: visible;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: all 0.3s ease;
            cursor: default;
            margin: 4px;
        }
        
        .setor-badge:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        /* Cores dos badges */
        .setor-badge.color-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .setor-badge.color-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .setor-badge.color-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .setor-badge.color-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .setor-badge.color-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .setor-badge.color-6 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }
        .setor-badge.color-7 { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; }
        .setor-badge.color-8 { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
        
        .setor-badge-remove {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(255, 68, 68, 0.9);
            color: white;
            border: 2px solid white;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            line-height: 1;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .setor-badge-remove:hover {
            background: #cc0000;
            transform: scale(1.2);
        }
        
        .setores-empty-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 40px;
            color: #8B95A7;
            font-size: 11px;
            font-style: italic;
        }
        
        /* CONTROLE NUMÉRICO COM SETINHAS MELHORADO */
        input[type="number"] {
            -webkit-appearance: none;
            -moz-appearance: textfield;
            appearance: none;
            position: relative;
        }
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: inner-spin-button;
            opacity: 1;
            height: auto;
        }
        
        /* Estilo do display de quantidade */
        .quantity-display {
            font-size: 11px;
            color: #666;
            font-style: italic;
            margin-top: 5px;
        }
        
        .quantity-display.unlimited {
            color: #00C2FF;
            font-weight: 500;
        }
        
        .quantity-display.limited {
            color: #666;
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
        console.log('📋 Dados da sessão:', window.sessionData);
    </script>
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
                    <div class="step-title">Setores</div>
                </div>
                <div class="step" data-step="6">
                    <div class="step-number"><span>6</span></div>
                    <div class="step-title">Lotes</div>
                </div>
                <div class="step" data-step="7">
                    <div class="step-number"><span>7</span></div>
                    <div class="step-title">Tipos de Ingresso</div>
                </div>
                <div class="step" data-step="8">
                    <div class="step-number"><span>8</span></div>
                    <div class="step-title">Produtor</div>
                </div>
                <div class="step" data-step="9">
                    <div class="step-number"><span>9</span></div>
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
                            <div class="section-title">Informações básicas</div>
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

                    <div class="validation-message" id="validation-step-1" style="display: none;">
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
                            <div class="section-title">Data e horário</div>
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
                            <div class="section-title">Descrição do evento</div>
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
                            <div class="section-title">Onde o seu evento vai acontecer</div>
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

                <!-- Step 5: Setores -->
                <div class="section-card" data-step-content="5">
                    <div class="section-header">
                        <div class="section-number">5</div>
                        <div>
                            <div class="section-title">Setores</div>
                            <div class="section-subtitle">Crie setores com acesso restrito dentro seu evento (ex: Restaurantes, Salas VIP etc)</div>
                        </div>
                    </div>

                    <!-- Formulário para adicionar setor -->
                    <div style="background: rgba(15, 15, 35, 0.6); border: 1px solid rgba(184, 197, 209, 0.2); border-radius: 12px; padding: 25px; margin: 25px 0 30px 0;">
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <label for="novoSetorNome" style="font-size: 1.1rem; font-weight: 600; color: #E1E5F2; margin-bottom: 8px;">Nome do Setor</label>
                            <div style="display: flex; gap: 15px; align-items: stretch;">
                                <input type="text" 
                                       id="novoSetorNome" 
                                       placeholder="Ex: Restaurante VIP, Área Premium, Camarote..." 
                                       maxlength="100"
                                       style="flex: 1; padding: 12px 16px; background: rgba(26, 26, 46, 0.9); border: 1px solid rgba(184, 197, 209, 0.3); border-radius: 8px; color: #E1E5F2; font-size: 1rem; transition: all 0.3s ease; outline: none; min-width: 0;">
                                <button type="button" 
                                        onclick="window.adicionarSetor()"
                                        style="padding: 12px 24px; font-weight: 600; font-size: 1rem; white-space: nowrap; min-width: 160px; background: linear-gradient(135deg, #00C2FF, #725EFF); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0;">
                                    + Adicionar Setor
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Grid de setores -->
                    <div style="margin-top: 20px;">
                        <div id="setoresGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;">
                            <!-- Os setores serão adicionados aqui dinamicamente -->
                        </div>
                        
                        <div id="setoresEmpty" style="text-align: center; padding: 40px 20px; background: rgba(15, 15, 35, 0.3); border: 2px dashed rgba(184, 197, 209, 0.3); border-radius: 12px; color: #8B95A7;">
                            <div style="font-size: 1.1rem; font-weight: 500; margin-bottom: 8px; color: #B8C5D2;">Nenhum setor cadastrado</div>
                            <div style="font-size: 0.9rem; line-height: 1.4;">Os setores são opcionais. Você pode pular esta etapa se não precisar de setores específicos.</div>
                        </div>
                    </div>

                    <div class="validation-message" id="validation-step-5" style="display: none;">
                        <!-- Sem validação obrigatória para setores -->
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 6: Lotes -->
                <div class="section-card" data-step-content="6">
                    <div class="section-header">
                        <div class="section-number">6</div>
                        <div>
                            <div class="section-title">Lotes</div>
                            <div class="section-subtitle">Crie lotes para automatizar o reajustes de preço com data/hora programada.</div>
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
                        </div>
                    </div>

                    <div class="validation-message" id="validation-step-6" style="display: none;">
                        Por favor, configure pelo menos um lote para continuar.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 7: Ingressos -->
                <div class="section-card" data-step-content="7">
                    <div class="section-header">
                        <div class="section-number">7</div>
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

                <!-- Step 8: Organizador -->
                <div class="section-card" data-step-content="8">
                    <div class="section-header">
                        <div class="section-number">8</div>
                        <div>
                            <div class="section-title">Organizador</div>
                            <div class="section-subtitle">Selecione o organizador responsável pelo evento</div>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="contratanteId">Organizador do Evento <span class="required">*</span></label>
                        <select id="contratanteId" required>
                            <option value="">Selecione o organizador</option>
                            <?php if (empty($contratantes)): ?>
                                <option value="">Nenhum contratante cadastrado</option>
                            <?php else: ?>
                                <?php foreach ($contratantes as $contratante): ?>
                                    <option value="<?php echo $contratante['id']; ?>"><?php echo htmlspecialchars($contratante['razao_social']); ?></option>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </select>
                        <?php if (empty($contratantes)): ?>
                            <div class="field-hint">
                                <strong>Atenção:</strong> Você precisa ter pelo menos um contratante cadastrado. 
                                <a href="/produtor/perfil.php" target="_blank">Cadastre um contratante aqui</a>.
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="validation-message" id="validation-step-8">
                        Por favor, selecione o organizador responsável pelo evento.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 9: Responsabilidades e Publicação -->
                <div class="section-card" data-step-content="9">
                    <div class="section-header">
                        <div class="section-number">9</div>
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
                        <button class="nav-btn btn-secondary" onClick="pausarEvento()">
                            💾 Salvar e Continuar Depois
                        </button>
                        <button class="nav-btn btn-publish" onClick="publicarEvento()">
                            ✓ Publicar evento
                        </button>
                    </div>
                </div>
            </div>

            <!-- Preview Card -->
            <div class="preview-card">
                <div class="preview-title">
                <div style="margin-bottom: 15px; padding-top: 10px;">
                    👁️ Preview da Página de Inscrições
                </div>
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
                
                <!-- Coluna 2: Quantidade e Descrição -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Acesso</h4>
                    
                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <label style="font-size: 12px; margin: 0;">Quantidade</label>
                            <div id="paidTicketQuantityDisplay" style="font-size: 11px; color: #00C2FF; font-weight: 500; font-style: italic;">Não limitar</div>
                        </div>
                        <input type="number" id="paidTicketQuantity" placeholder="0" min="0" value="0" oninput="handleQuantityChange(this, 'paidTicketQuantityDisplay')" style="font-size: 12px; width: 100%;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 25px;">
                        <label style="font-size: 12px;">Descrição (opcional)</label>
                        <textarea id="paidTicketDescription" rows="6" placeholder="Informações adicionais sobre este tipo de ingresso..." maxlength="200" style="font-size: 12px; width: 100%; resize: vertical;"></textarea>
                        <small style="color: #8B95A7; font-size: 10px;">Máximo 200 caracteres</small>
                    </div>
                </div>
                
                <!-- Coluna 3: Setores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Setores de Acesso</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Indique setores onde esse ingresso dará acesso (opcional)</label>
                        <div style="margin-top: 8px;">
                            <select id="paidTicketSetores" style="width: 100%; font-size: 12px;" onchange="addSetorToPaidTicket()">
                                <option value="">Selecione um setor</option>
                                <!-- Setores serão carregados dinamicamente -->
                            </select>
                        </div>
                        <div id="paidTicketSetoresList" style="margin-top: 10px;">
                            <div class="setores-empty-badge">
                                Nenhum setor selecionado
                            </div>
                        </div>
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
                
                <!-- Coluna 2: Quantidade e Descrição -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Acesso</h4>
                    
                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <label style="font-size: 12px; margin: 0;">Quantidade</label>
                            <div id="freeTicketQuantityDisplay" style="font-size: 11px; color: #00C2FF; font-weight: 500; font-style: italic;">Não limitar</div>
                        </div>
                        <input type="number" id="freeTicketQuantity" placeholder="0" min="0" value="0" oninput="handleQuantityChange(this, 'freeTicketQuantityDisplay')" style="font-size: 12px; width: 100%;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 25px;">
                        <label style="font-size: 12px;">Descrição (opcional)</label>
                        <textarea id="freeTicketDescription" rows="6" placeholder="Informações adicionais sobre este tipo de ingresso..." maxlength="200" style="font-size: 12px; width: 100%; resize: vertical;"></textarea>
                        <small style="color: #8B95A7; font-size: 10px;">Máximo 200 caracteres</small>
                    </div>
                </div>
                
                <!-- Coluna 3: Setores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Setores de Acesso</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Indique setores onde esse ingresso dará acesso (opcional)</label>
                        <div style="margin-top: 8px;">
                            <select id="freeTicketSetores" style="width: 100%; font-size: 12px;" onchange="addSetorToFreeTicket()">
                                <option value="">Selecione um setor</option>
                                <!-- Setores serão carregados dinamicamente -->
                            </select>
                        </div>
                        <div id="freeTicketSetoresList" style="margin-top: 10px;">
                            <div class="setores-empty-badge">
                                Nenhum setor selecionado
                            </div>
                        </div>
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
                <label>Lote</label>
                <input type="text" id="editPaidTicketLoteDisplay" readonly style="background-color: transparent !important; border: 1px solid #e0e0e0; cursor: not-allowed;" placeholder="Lote será carregado automaticamente">
                <input type="hidden" id="editPaidTicketLote">
                <small style="color: #8B95A7;">Não é possível alterar o lote durante a edição</small>
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
                
                <!-- Coluna 2: Quantidade e Descrição -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Acesso</h4>
                    
                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <label style="font-size: 12px; margin: 0;">Quantidade</label>
                            <div id="editPaidTicketQuantityDisplay" style="font-size: 11px; color: #00C2FF; font-weight: 500; font-style: italic;">Não limitar</div>
                        </div>
                        <input type="number" id="editPaidTicketQuantity" placeholder="0" min="0" value="0" oninput="handleQuantityChange(this, 'editPaidTicketQuantityDisplay')" style="font-size: 12px; width: 100%;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 25px;">
                        <label style="font-size: 12px;">Descrição (opcional)</label>
                        <textarea id="editPaidTicketDescription" rows="6" placeholder="Informações adicionais sobre este tipo de ingresso..." maxlength="200" style="font-size: 12px; width: 100%; resize: vertical;"></textarea>
                        <small style="color: #8B95A7; font-size: 10px;">Máximo 200 caracteres</small>
                    </div>
                </div>
                
                <!-- Coluna 3: Setores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Setores de Acesso</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Indique setores onde esse ingresso dará acesso (opcional)</label>
                        <div style="margin-top: 8px;">
                            <select id="editPaidTicketSetores" style="width: 100%; font-size: 12px;" onchange="addSetorToEditPaidTicket()">
                                <option value="">Selecione um setor</option>
                                <!-- Setores serão carregados dinamicamente -->
                            </select>
                        </div>
                        <div id="editPaidTicketSetoresList" style="margin-top: 10px;">
                            <div class="setores-empty-badge">
                                Nenhum setor selecionado
                            </div>
                        </div>
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
        <div class="modal" style="max-width: 1000px; width: 90%;">
            <div class="modal-header">
                <div class="modal-title">Editar tipo de ingresso gratuito</div>
                <button class="modal-close" onClick="closeModal('editFreeTicketModal')">&times;</button>
            </div>

            <input type="hidden" id="editFreeTicketId">

            <div class="form-group full-width">
                <label>Título do tipo de ingresso <span class="required">*</span></label>
                <input type="text" id="editFreeTicketTitle" placeholder="Tipo Estudante, Cortesia, Acesso Livre, etc." maxlength="45">
            </div>

            <div class="form-group full-width" style="margin-top: 15px;">
                <label>Lote</label>
                <input type="text" id="editFreeTicketLoteDisplay" readonly style="background-color: transparent !important; border: 1px solid #e0e0e0; cursor: not-allowed;" placeholder="Lote será carregado automaticamente">
                <input type="hidden" id="editFreeTicketLote">
                <small style="color: #8B95A7;">Não é possível alterar o lote durante a edição</small>
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
                
                <!-- Coluna 2: Quantidade e Descrição -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Configurações de Acesso</h4>
                    
                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <label style="font-size: 12px; margin: 0;">Quantidade</label>
                            <div id="editFreeTicketQuantityDisplay" style="font-size: 11px; color: #00C2FF; font-weight: 500; font-style: italic;">Não limitar</div>
                        </div>
                        <input type="number" id="editFreeTicketQuantity" placeholder="0" min="0" value="0" oninput="handleQuantityChange(this, 'editFreeTicketQuantityDisplay')" style="font-size: 12px; width: 100%;">
                    </div>
                    
                    <div class="form-group" style="margin-top: 25px;">
                        <label style="font-size: 12px;">Descrição (opcional)</label>
                        <textarea id="editFreeTicketDescription" rows="6" placeholder="Informações adicionais sobre este tipo de ingresso..." maxlength="200" style="font-size: 12px; width: 100%; resize: vertical;"></textarea>
                        <small style="color: #8B95A7; font-size: 10px;">Máximo 200 caracteres</small>
                    </div>
                </div>
                
                <!-- Coluna 3: Setores -->
                <div style="border: 1px solid #e0e0e0; padding: 10px; border-radius: 8px;">
                    <h4 style="color: #00C2FF; margin-bottom: 8px; font-size: 12px;">Setores de Acesso</h4>
                    
                    <div class="form-group">
                        <label style="font-size: 12px;">Indique setores onde esse ingresso dará acesso (opcional)</label>
                        <div style="margin-top: 8px;">
                            <select id="editFreeTicketSetores" style="width: 100%; font-size: 12px;" onchange="addSetorToEditFreeTicket()">
                                <option value="">Selecione um setor</option>
                                <!-- Setores serão carregados dinamicamente -->
                            </select>
                        </div>
                        <div id="editFreeTicketSetoresList" style="margin-top: 10px;">
                            <div class="setores-empty-badge">
                                Nenhum setor selecionado
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary" onClick="closeModal('editFreeTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="updateFreeTicket()">Salvar Alterações</button>
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
    
     <!-- Scripts principais do sistema -->
     <script language='javascript' src="/produtor/js/custom-dialogs.js"></script>
     <script language='javascript' src="/produtor/js/alert-overrides.js"></script>
     <script language='javascript' src="/produtor/js/lotes-restauracao-simples.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/lote-protection.js?v=<?php echo time(); ?>"></script>

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
     });
     </script>

     <script language='javascript' src="/produtor/js/ingressos-pagos.js" charset="UTF-8"></script>
     <script language='javascript' src="/produtor/js/criaevento.js?v=<?php echo time(); ?>" charset="UTF-8"></script>
     <script language='javascript' src="/produtor/js/spinner-carregamento.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/wizard-database.js?v=<?php echo time(); ?>"></script>
     
     <!-- Sistema de Rascunho Automático -->
     <script>
     (function() {
         'use strict';
         
         console.log('🎯 Sistema de Rascunho Automático carregado');
         
         let eventoId = null;
         
         // Verificar se tem evento_id na URL (modo edição)
         const urlParams = new URLSearchParams(window.location.search);
         const eventoIdURL = urlParams.get('evento_id');
         
         if (eventoIdURL) {
             console.log('📝 Modo edição - evento_id:', eventoIdURL);
             eventoId = eventoIdURL;
         }
         
         // Função para criar/verificar evento em rascunho
         async function iniciarEventoRascunho() {
             if (eventoId) {
                 console.log('⏩ Evento já existe, pulando criação de rascunho');
                 return;
             }
             
             console.log('🆕 Criando novo evento em rascunho...');
             
             try {
                 const response = await fetch('/produtor/ajax/wizard_evento.php', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/x-www-form-urlencoded'
                     },
                     credentials: 'same-origin',
                     body: 'action=iniciar_evento'
                 });
                 
                 // Debug da resposta
                 const responseText = await response.text();
                 console.log('📡 Raw response text:', responseText);
                 console.log('📡 Response length:', responseText.length);
                 console.log('📡 First 100 chars:', responseText.substring(0, 100));
                 
                 // Tentar parsear JSON
                 let data;
                 try {
                     data = JSON.parse(responseText);
                     console.log('📡 Parsed JSON:', data);
                 } catch (e) {
                     console.error('❌ Erro ao parsear JSON:', e);
                     console.error('❌ Response text:', responseText);
                     throw e;
                 }
                 
                 if (data.sucesso) {
                     eventoId = data.evento_id;
                     console.log('✅ Evento criado em rascunho com ID:', eventoId);
                     
                     // Atualizar URL sem recarregar a página
                     const newURL = window.location.pathname + '?evento_id=' + eventoId;
                     window.history.replaceState({}, '', newURL);
                     
                     // Armazenar globalmente para uso em outras funções
                     window.currentEventoId = eventoId;
                 } else {
                     console.error('❌ Erro ao criar evento:', data.erro);
                 }
             } catch (error) {
                 console.error('❌ Erro na requisição:', error);
             }
         }
         
         // Interceptar função nextStep para criar evento ao sair da etapa 1
         const originalNextStep = window.nextStep;
         
         window.nextStep = async function() {
             const currentStep = getCurrentStep();
             console.log('🔄 NextStep chamado, etapa atual:', currentStep);
             
             // CRIAR EVENTO AO SAIR DA ETAPA 1
             if (currentStep === 1 && !eventoId && !window.currentEventoId) {
                 console.log('🆕 CRIANDO EVENTO ao sair da etapa 1...');
                 
                 // Coletar dados da etapa 1
                 const nomeEvento = document.getElementById('nome')?.value || '';
                 const categoriaId = document.getElementById('categoria')?.value || '';
                 const descricaoEvento = document.getElementById('descricao')?.value || '';
                 
                 if (!nomeEvento.trim()) {
                     alert('Por favor, preencha o nome do evento antes de continuar.');
                     return false;
                 }
                 
                 try {
                     const response = await fetch('/produtor/ajax/wizard_evento.php', {
                         method: 'POST',
                         headers: {
                             'Content-Type': 'application/x-www-form-urlencoded'
                         },
                         credentials: 'same-origin',
                         body: `action=criar_evento_etapa1&nome=${encodeURIComponent(nomeEvento)}&categoria_id=${categoriaId}&descricao=${encodeURIComponent(descricaoEvento)}`
                     });
                     
                     const responseText = await response.text();
                     console.log('📡 Resposta criar evento:', responseText);
                     
                     const data = JSON.parse(responseText);
                     
                     if (data.sucesso) {
                         eventoId = data.evento_id;
                         window.currentEventoId = eventoId;
                         console.log('✅ Evento criado com ID:', eventoId);
                         
                         // Atualizar URL
                         const newURL = window.location.pathname + '?evento_id=' + eventoId;
                         window.history.replaceState({}, '', newURL);
                     } else {
                         console.error('❌ Erro ao criar evento:', data.erro);
                         alert('Erro ao criar evento: ' + data.erro);
                         return false;
                     }
                 } catch (error) {
                     console.error('❌ Erro na requisição:', error);
                     alert('Erro de conexão ao criar evento.');
                     return false;
                 }
             }
             
             const currentEventId = eventoId || window.currentEventoId;
             
             if (currentEventId) {
                 console.log('💾 Salvando etapa atual antes de avançar...');
                 await salvarEtapaAtual(currentEventId);
             }
             
             // Chamar função original
             if (originalNextStep) {
                 originalNextStep.call(this);
             }
         };
         
         // Função para salvar dados da etapa atual
         async function salvarEtapaAtual(eventoId) {
             // Obter etapa atual
             const currentStepElements = document.querySelectorAll('.step.active');
             let currentStep = 1;
             
             if (currentStepElements.length > 0) {
                 const stepElement = currentStepElements[0];
                 const stepData = stepElement.getAttribute('data-step');
                 if (stepData) {
                     currentStep = parseInt(stepData);
                 }
             }
             
             console.log(`📊 Salvando dados da etapa ${currentStep}...`);
             
             // Coletar dados baseado na etapa
             const dadosParaSalvar = coletarDadosEtapa(currentStep);
             
             if (Object.keys(dadosParaSalvar).length === 0) {
                 console.log('⚠️ Nenhum dado para salvar na etapa', currentStep);
                 return;
             }
             
             // Salvar no backend
             try {
                 const response = await fetch('/produtor/ajax/wizard_evento.php', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/x-www-form-urlencoded'
                     },
                     credentials: 'same-origin',
                     body: `action=salvar_etapa&evento_id=${eventoId}&etapa=${currentStep}&dados=${encodeURIComponent(JSON.stringify(dadosParaSalvar))}`
                 });
                 
                 const result = await response.json();
                 
                 if (result.sucesso) {
                     console.log(`✅ Etapa ${currentStep} salva com sucesso`);
                 } else {
                     console.error(`❌ Erro ao salvar etapa ${currentStep}:`, result.erro);
                 }
             } catch (error) {
                 console.error('❌ Erro na requisição de salvamento:', error);
             }
         }
         
         // Função para coletar dados da etapa atual
         function coletarDadosEtapa(etapa) {
             const dados = {};
             
             switch(etapa) {
                 case 1: // Informações básicas
                     const nome = document.getElementById('nome')?.value;
                     const descricao = document.getElementById('descricao')?.value;
                     const categoria = document.getElementById('categoria')?.value;
                     
                     if (nome) dados.nome = nome;
                     if (descricao) dados.descricao = descricao;
                     if (categoria) dados.categoria_id = categoria;
                     break;
                     
                 case 2: // Data e local
                     const dataInicio = document.getElementById('dataInicio')?.value;
                     const horaInicio = document.getElementById('horaInicio')?.value;
                     const dataFim = document.getElementById('dataFim')?.value;
                     const horaFim = document.getElementById('horaFim')?.value;
                     const endereco = document.getElementById('endereco')?.value;
                     
                     if (dataInicio) dados.data_inicio = dataInicio;
                     if (horaInicio) dados.hora_inicio = horaInicio;
                     if (dataFim) dados.data_fim = dataFim;
                     if (horaFim) dados.hora_fim = horaFim;
                     if (endereco) dados.endereco = endereco;
                     break;
                     
                 case 3: // Imagens
                     if (window.uploadedImages) {
                         if (window.uploadedImages.logo) dados.logo = window.uploadedImages.logo;
                         if (window.uploadedImages.capa) dados.capa = window.uploadedImages.capa;
                         if (window.uploadedImages.fundo) dados.imagem_fundo = window.uploadedImages.fundo;
                     }
                     
                     const corFundo = document.getElementById('corFundo')?.value;
                     if (corFundo) dados.cor_fundo = corFundo;
                     break;
                     
                 case 4: // Configurações
                     const configuracoes = {};
                     // Adicionar campos de configuração conforme necessário
                     if (Object.keys(configuracoes).length > 0) {
                         dados.configuracoes = configuracoes;
                     }
                     break;
                     
                 // Adicionar mais etapas conforme necessário
             }
             
             return dados;
         }
         
         // Sistema não cria evento automaticamente - apenas quando sair da etapa 1
         document.addEventListener('DOMContentLoaded', function() {
             console.log('🚀 Sistema de criação de evento na etapa 1 ativo...');
         });
         
         // Tornar disponível globalmente
         window.sistemaRascunho = {
             iniciarEvento: iniciarEventoRascunho,
             salvarEtapa: salvarEtapaAtual,
             getEventoId: () => eventoId || window.currentEventoId
         };
         
     })();
     </script>
     
     <script language='javascript' src="/produtor/js/busca-endereco-direto.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/diagnostico-google-maps.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/verificacao-final.js?v=<?php echo time(); ?>"></script>
     <!-- DESABILITADO: <script language='javascript' src="/produtor/js/fix-wizard-initialization.js?v=<?php echo time(); ?>"></script> -->
     <script language='javascript' src="/produtor/js/hide-validation-messages.js?v=<?php echo time(); ?>"></script>
     <script language='javascript' src="/produtor/js/wizard-restore-helpers.js?v=<?php echo time(); ?>"></script>
     <!-- DESABILITADO: <script language='javascript' src="/produtor/js/debug-validacoes.js?v=<?php echo time(); ?>"></script> -->
     <!-- DESABILITADO: <script language='javascript' src="/produtor/js/debug-currentstep.js?v=<?php echo time(); ?>"></script> -->
     <!-- DESABILITADO: <script language='javascript' src="/produtor/js/fix-currentstep.js?v=<?php echo time(); ?>"></script> -->
     <script language='javascript' src="/produtor/js/combo-functions.js"></script>
     <script language='javascript' src="/produtor/js/combo-override.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-pagos-edit.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-gratuitos.js"></script>
     <script language='javascript' src="/produtor/js/ingressos-gratuitos-create.js"></script>
     <script language='javascript' src="/produtor/js/modal-correto.js"></script>
     
     <!-- Google Maps API -->
     <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDU5-cOqdusZMBI5pqbsLihQVKEI0fEO9o&libraries=places&callback=initMap" async defer></script>
     
     <!-- Scripts de correção -->
     <!-- <script src="js/wizard-validation-definitive.js?v=<?php echo time(); ?>"></script> DESABILITADO: Conflito com unified-recovery -->
     <script src="js/publish-event-fix.js?v=<?php echo time(); ?>"></script>
     <script src="js/modal-fixes.js"></script>
     <script src="js/terms-privacy-handler.js"></script>
     <!-- <script src="js/wizard-debug.js"></script> DESABILITADO: Debug -->
     <!-- <script src="js/wizard-fix.js"></script> DESABILITADO: Conflito -->
     <script src="js/preview-fix.js"></script>
     <!-- <script src="js/wizard-fix-definitivo.js"></script> DESABILITADO: Conflito -->
     <script src="js/maps-fix.js"></script>
     <!-- <script src="js/restore-fix.js"></script> DESABILITADO: Conflito com unified-recovery -->
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
<!-- DESABILITADO: <script src="js/forced-fixes.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/step5-validation.js?v=<?php echo time(); ?>"></script> -->
<script src="js/edit-load-dates-fix.js?v=<?php echo time(); ?>"></script>
-->
<!-- DESABILITADO: <script src="js/consolidated-fix-v2.js?v=<?php echo time(); ?>"></script> -->
<!-- <script src="js/consolidated-fix.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/debug-lote-completo.js?v=<?php echo time(); ?>"></script> -->
<script src="js/combo-trash-icon-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/trash-icon-fix.js?v=<?php echo time(); ?>"></script>
<!-- DESABILITADO: <script src="js/test-fixes.js?v=<?php echo time(); ?>"></script> -->
<script src="js/combo-visual-fixes.js?v=<?php echo time(); ?>"></script>
<script src="js/combo-final-fixes.js?v=<?php echo time(); ?>"></script>
<script src="js/combo-fixes-v3.js?v=<?php echo time(); ?>"></script>
<script src="js/image-upload-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/color-fix.js?v=<?php echo time(); ?>"></script>
<script src="js/cleanup-after-publish.js?v=<?php echo time(); ?>"></script>
<script src="js/producer-fix.js?v=<?php echo time(); ?>"></script>

<!-- CORREÇÃO DEFINITIVA FINAL - USA window.customDialog -->
<script src="js/fixes/correcao-definitiva-final.js?v=<?php echo time(); ?>"></script>
<!-- Correção para exclusão de lotes -->
<script src="js/lote-exclusao-fix.js?v=<?php echo time(); ?>"></script>

<!-- CORREÇÃO FINAL ABSOLUTA - DEVE SER O ÚLTIMO SCRIPT -->
<!-- <script src="js/correcao-exclusao-final.js?v=<?php echo time(); ?>"></script> REMOVIDO: Usa callback errado -->
<!-- CORREÇÃO DEFINITIVA COM PROMISE -->
<script src="js/correcao-lote-promise.js?v=<?php echo time(); ?>"></script>
<!-- CORREÇÃO DEFINITIVA DE ASSOCIAÇÃO LOTES/INGRESSOS -->
<script src="js/correcao-associacao-definitiva.js?v=<?php echo time(); ?>"></script>
<!-- CORREÇÃO URGENTE - RENDERIZAÇÃO DE LOTES -->
<script src="js/correcao-urgente-lotes.js?v=<?php echo time(); ?>"></script>
<!-- GARANTIA FINAL - FORÇA ATUALIZAÇÃO -->
<script src="js/garantia-final-lotes.js?v=<?php echo time(); ?>"></script>
<!-- VERIFICAÇÃO DE INGRESSOS EM LOTES -->
<script src="js/verificacao-ingressos-final.js?v=<?php echo time(); ?>"></script>
<!-- CORREÇÃO DO ENVIO DO EVENTO -->
<script src="js/correcao-envio-evento.js?v=<?php echo time(); ?>"></script>
<!-- DEBUG DO ENVIO -->
<!-- DESABILITADO: <script src="js/debug-envio-api.js?v=<?php echo time(); ?>"></script> -->
<!-- Correção de performance na descrição -->
<script src="js/descricao-performance-fix.js?v=<?php echo time(); ?>"></script>
<!-- Debug melhorado -->
<script src="js/debug-wizard-data.js?v=<?php echo time(); ?>"></script>
<!-- Correção dos checkboxes de termos -->
<!-- CORREÇÃO DE BUSCA DE ENDEREÇOS -->
<script src="js/maps-fix.js?v=<?php echo time(); ?>"></script>

<script src="js/terms-checkbox-fix.js?v=<?php echo time(); ?>"></script>
<!-- CORREÇÃO COMPLETA CHECKBOX E DEBUG -->
<script src="js/correcao-checkbox-debug.js?v=<?php echo time(); ?>"></script>
<!-- CORREÇÃO PARA CHECKBOX CUSTOMIZADO (DIV) -->
<script src="js/checkbox-customizado-fix.js?v=<?php echo time(); ?>"></script>
<!-- OVERRIDE TOTAL - FORÇA PUBLICAÇÃO -->
<script src="js/override-total-publicacao.js?v=<?php echo time(); ?>"></script>
<!-- DEBUG COMPLETO DA API -->
<!-- DESABILITADO: <script src="js/debug-api-completo.js?v=<?php echo time(); ?>"></script> -->
<!-- CORREÇÃO DE COLETA DE DADOS v3 -->
<script src="js/correcao-coleta-dados-v3.js?v=<?php echo time(); ?>"></script>
<!-- TESTE API MÍNIMA -->
<script src="js/teste-api-minima.js?v=<?php echo time(); ?>"></script>

<!-- CORREÇÃO FORÇADA DO STEP 1 - DEVE SER O ÚLTIMO SCRIPT -->
<!-- DESABILITADO: <script src="js/force-step1-fix.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/fix-retomar-rascunho.js?v=<?php echo time(); ?>"></script> -->
<script src="js/fix-restaurar-imagens.js?v=<?php echo time(); ?>"></script>
<script src="js/debug-functions.js?v=<?php echo time(); ?>"></script>
<!-- DESABILITADO: <script src="js/debug-wizard-envio.js?v=<?php echo time(); ?>"></script> -->
<script src="js/debug-restauracao-completo.js?v=<?php echo time(); ?>"></script>
<!-- DESABILITADO: <script src="js/debug-lotes.js?v=<?php echo time(); ?>"></script> -->
<script src="js/debug-carregamento-lotes.js?v=<?php echo time(); ?>"></script>
<!-- DESABILITADO: <script src="js/correcao-carregamento-lotes-etapa5.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/correcao-exibicao-lotes.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/correcao-atualizacao-etapa5.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/fix-validacao-etapa5.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/teste-restaurar-lotes.js?v=<?php echo time(); ?>"></script> -->
<!-- DESABILITADO: <script src="js/debug-etapa6.js?v=<?php echo time(); ?>"></script> -->
<script src="js/teste-etapa6-corrigida.js?v=<?php echo time(); ?>"></script>
<!-- DESABILITADO: <script src="js/debug-campos-ingresso.js?v=<?php echo time(); ?>"></script> -->
<script src="js/teste-salvamento-lotes.js?v=<?php echo time(); ?>"></script>
<script src="js/controle-campos-ingresso.js?v=<?php echo time(); ?>"></script>
<script src="js/controle-campos-ingresso-especifico.js?v=<?php echo time(); ?>"></script>
<script src="js/teste-coleta-ingressos.js?v=<?php echo time(); ?>"></script>
<script src="js/teste-lote-id.js?v=<?php echo time(); ?>"></script>
<script src="js/ingressos-correcao-completa.js?v=<?php echo time(); ?>"></script>
<script src="js/patch-coleta-modais.js?v=<?php echo time(); ?>"></script>
<script src="js/correcao-definitiva-ingressos.js?v=<?php echo time(); ?>"></script>
<!-- DESABILITADO: <script src="js/debug-envio-final.js?v=<?php echo time(); ?>"></script> -->
<script src="js/correcao-ultra-definitiva.js?v=<?php echo time(); ?>"></script>
<script src="js/correcao-final-ingressos.js?v=<?php echo time(); ?>"></script>
<script src="js/bloqueio-simplificado.js?v=<?php echo time(); ?>"></script>

<!-- GARANTIR RESTAURAÇÃO DE IMAGENS - DEVE SER O ÚLTIMO -->
<script src="js/garantir-restauracao.js?v=<?php echo time(); ?>"></script>
<script src="js/solucao-definitiva-imagens.js?v=<?php echo time(); ?>"></script>
<script src="js/correcoes-finais.js?v=<?php echo time(); ?>"></script>

<!-- DEBUG DE VALIDAÇÃO DE CAMPOS -->
<script src="js/debug-validacao-campos.js?v=<?php echo time(); ?>"></script>

<!-- CORREÇÃO DE LOTE_ID NUMÉRICO -->
<script src="js/correcao-lote-id-numerico.js?v=<?php echo time(); ?>"></script>

<!-- FIX ESPECÍFICO PARA PROBLEMAS DOS MODAIS -->
<script src="js/fix-modal-problemas-especificos.js?v=<?php echo time(); ?>"></script>

<!-- CORREÇÃO AGRESSIVA FINAL - DEVE SER ABSOLUTAMENTE O ÚLTIMO SCRIPT -->
<script src="js/patch-super-agressivo.js?v=<?php echo time(); ?>"></script>
<!-- DESABILITADO: <script src="js/correcao-agressiva-final.js?v=<?php echo time(); ?>"></script> -->
<script src="js/sistema-edicao-imediata-ingressos.js?v=<?php echo time(); ?>"></script>
<script src="js/sistema-edicao-imediata-lotes.js?v=<?php echo time(); ?>"></script>
<script src="js/sistema-insert-corrigido.js?v=<?php echo time(); ?>"></script>
<script src="js/botoes-lotes-funcionais.js?v=<?php echo time(); ?>"></script>

<!-- COMBO: REGRAS DE LOTE E SALVAMENTO -->
<script src="js/combo-regras-lote.js?v=<?php echo time(); ?>"></script>
<script src="js/combo-salvamento-completo.js?v=<?php echo time(); ?>"></script>

<!-- EDIÇÃO COM DADOS DO BANCO -->
<script src="js/edicao-dados-banco.js?v=<?php echo time(); ?>"></script>

<!-- PADRONIZAÇÃO DEFINITIVA - SOBRESCREVE TUDO -->
<script src="js/padronizacao-definitiva.js?v=<?php echo time(); ?>"></script>
<script src="js/padronizacao-lotes.js?v=<?php echo time(); ?>"></script>

<!-- CONSOLIDAÇÃO FINAL - REMOVE CONFLITOS E LOOPS -->
<!-- DESABILITADO TEMPORARIAMENTE: <script src="js/consolidacao-final.js?v=<?php echo time(); ?>"></script> -->

<!-- CORREÇÃO SIMPLIFICADA PARA PROBLEMAS DE INGRESSOS - DEVE SER O ÚLTIMO -->
<script src="js/correcao-simplificada-ingressos.js?v=<?php echo time(); ?>"></script>

<!-- VALIDAÇÕES OBRIGATÓRIAS IMPLEMENTADAS -->
<script>
// Adicionar validações obrigatórias específicas por etapa
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Implementando validações obrigatórias...');
    
    // Controle de navegação automática
    let wizardCurrentStep = 1; // Inicializar sempre em 1
    let validationEnabled = true;
    
    // DESABILITAR VALIDAÇÃO AUTOMÁTICA NA CARGA
    // A validação só deve ocorrer quando o usuário clicar em "Avançar"
    console.log('🚫 Validação automática na carga DESABILITADA - validação apenas no botão Avançar');
    
    // FORÇAR ETAPA 1 NO CARREGAMENTO
    setTimeout(() => {
        console.log('🎯 Forçando wizard para etapa 1');
        wizardCurrentStep = 1;
        
        // Garantir que apenas a etapa 1 esteja ativa
        document.querySelectorAll('.section-card').forEach(card => {
            const stepNumber = parseInt(card.dataset.stepContent);
            if (stepNumber === 1) {
                card.classList.add('active');
                card.classList.remove('prev');
            } else {
                card.classList.remove('active', 'prev');
            }
        });
        
        // Resetar progress bar
        document.querySelectorAll('.step').forEach(step => {
            const stepNumber = parseInt(step.dataset.step);
            if (stepNumber === 1) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // Resetar linha de progresso
        const progressLine = document.getElementById('progressLine');
        if (progressLine) {
            progressLine.style.width = '0%';
        }
        
        console.log('✅ Wizard forçado para etapa 1');
    }, 100);
    
    // Prevenir navegação automática
    if (typeof showStep === 'function') {
        showStep(1);
    }
    
    // Função para detectar step atual dinamicamente
    function getCurrentStep() {
        // CORREÇÃO: Tentar detectar pela etapa ativa visível
        const activeStep = document.querySelector('.section-card.active[data-step-content]');
        if (activeStep) {
            const stepNum = parseInt(activeStep.getAttribute('data-step-content'));
            if (!isNaN(stepNum)) {
                wizardCurrentStep = stepNum;
                console.log(`📍 getCurrentStep: Detectado etapa ${stepNum} como ativa no DOM`);
                return stepNum;
            }
        }
        
        // Fallback para variável global existente
        if (typeof window.currentStep !== 'undefined') {
            wizardCurrentStep = window.currentStep;
            console.log(`📍 getCurrentStep: Usando window.currentStep = ${window.currentStep}`);
            return window.currentStep;
        }
        
        console.log(`📍 getCurrentStep: Usando wizardCurrentStep = ${wizardCurrentStep}`);
        return wizardCurrentStep;
    }
    
    // Expor função globalmente para debug
    window.getCurrentStep = getCurrentStep;
    window.setCurrentStep = function(step) {
        console.log(`🔧 setCurrentStep: Definindo etapa ${step}`);
        wizardCurrentStep = step;
        
        // Atualizar DOM também
        document.querySelectorAll('.section-card').forEach(card => {
            const stepNumber = parseInt(card.dataset.stepContent);
            if (stepNumber === step) {
                card.classList.add('active');
                card.classList.remove('prev');
            } else if (stepNumber < step) {
                card.classList.add('prev');
                card.classList.remove('active');
            } else {
                card.classList.remove('active', 'prev');
            }
        });
    };
    
    // Sobrescrever função nextStep se existir
    if (typeof window.nextStep === 'function') {
        window.originalNextStep = window.nextStep;
    }
    
    // Implementar validação por etapas - VERSÃO LIMPA
    window.nextStep = function() {
        const currentStepNum = getCurrentStep();
        console.log(`🔍 Validando etapa ${currentStepNum}`);
        
        if (!validationEnabled) {
            console.log('⚠️ Validação desabilitada - usando função simples');
            avançarParaProximaEtapa(currentStepNum);
            return;
        }
        
        // Esconder mensagens anteriores
        hideValidationMessages();
        
        let isValid = false;
        
        try {
            switch(currentStepNum) {
                case 1:
                    isValid = validateStep1();
                    break;
                case 2:
                    isValid = validateStep2();
                    break;
                case 3:
                    isValid = validateStep3();
                    break;
                case 4:
                    isValid = validateStep4();
                    break;
                case 5:
                    isValid = validateStep5();
                    break;
                case 6:
                    isValid = validateStep6();
                    break;
                case 7:
                    isValid = validateStep7();
                    break;
                default:
                    console.log(`⚠️ Etapa ${currentStepNum} não requer validação específica`);
                    isValid = true;
            }
        } catch (error) {
            console.error('❌ Erro na validação:', error);
            console.log('🔧 Permitindo avanço devido ao erro');
            isValid = true; // Em caso de erro, permitir avanço
        }
        
        if (isValid) {
            console.log(`✅ Validação passou - avançando da etapa ${currentStepNum}`);
            avançarParaProximaEtapa(currentStepNum);
        } else {
            console.log(`❌ Validação falhou na etapa ${currentStepNum} - não avançando`);
        }
    };
    
    // Função para avançar de etapa sem dependências externas
    function avançarParaProximaEtapa(currentStepNum) {
        if (currentStepNum < 9) {
            const proximaEtapa = currentStepNum + 1;
            wizardCurrentStep = proximaEtapa;
            
            console.log(`📈 Avançando de ${currentStepNum} para ${proximaEtapa}`);
            
            // Atualizar visualmente
            document.querySelectorAll('.section-card').forEach(card => {
                const stepNumber = parseInt(card.dataset.stepContent);
                if (stepNumber === proximaEtapa) {
                    card.classList.add('active');
                    card.classList.remove('prev');
                } else if (stepNumber < proximaEtapa) {
                    card.classList.add('prev');
                    card.classList.remove('active');
                } else {
                    card.classList.remove('active', 'prev');
                }
            });
            
            // Atualizar progress bar
            document.querySelectorAll('.step').forEach(step => {
                const stepNumber = parseInt(step.dataset.step);
                if (stepNumber === proximaEtapa) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else if (stepNumber < proximaEtapa) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Atualizar linha de progresso
            const progressLine = document.getElementById('progressLine');
            if (progressLine) {
                const progressPercentage = ((proximaEtapa - 1) / 8) * 100;
                progressLine.style.width = progressPercentage + '%';
            }
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            console.log(`✅ Navegação completa para etapa ${proximaEtapa}`);
        }
    }
    
    // Implementar função prevStep()
    window.prevStep = function() {
        const currentStepNum = getCurrentStep();
        console.log(`🔙 prevStep chamado - etapa atual: ${currentStepNum}`);
        
        if (currentStepNum > 1) {
            const etapaAnterior = currentStepNum - 1;
            wizardCurrentStep = etapaAnterior;
            
            console.log(`📉 Voltando de ${currentStepNum} para ${etapaAnterior}`);
            
            // Atualizar visualmente
            document.querySelectorAll('.section-card').forEach(card => {
                const stepNumber = parseInt(card.dataset.stepContent);
                if (stepNumber === etapaAnterior) {
                    card.classList.add('active');
                    card.classList.remove('prev');
                } else if (stepNumber < etapaAnterior) {
                    card.classList.add('prev');
                    card.classList.remove('active');
                } else {
                    card.classList.remove('active', 'prev');
                }
            });
            
            // Atualizar progress bar
            document.querySelectorAll('.step').forEach(step => {
                const stepNumber = parseInt(step.dataset.step);
                if (stepNumber === etapaAnterior) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else if (stepNumber < etapaAnterior) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Atualizar linha de progresso
            const progressLine = document.getElementById('progressLine');
            if (progressLine) {
                const progressPercentage = ((etapaAnterior - 1) / 8) * 100;
                progressLine.style.width = progressPercentage + '%';
            }
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            console.log(`✅ Navegação completa para etapa ${etapaAnterior}`);
        } else {
            console.log('⚠️ Já está na primeira etapa, não pode voltar mais');
        }
    };
    
    // Funções de validação por etapa
    function validateStep1() {
        const errors = [];
        
        // Nome do evento
        const eventName = document.getElementById('eventName');
        if (!eventName || !eventName.value.trim()) {
            errors.push('Nome do evento');
            highlightField('eventName');
        }
        
        // Logo - verificar se há imagem no preview ou no upload
        const logoContainer = document.getElementById('logoPreviewContainer');
        const logoUpload = document.getElementById('logoUpload');
        const hasLogo = (logoContainer && logoContainer.querySelector('img')) || 
                       (logoUpload && logoUpload.files.length > 0) ||
                       (window.uploadedImages && window.uploadedImages.logo);
        
        if (!hasLogo) {
            errors.push('Logo do evento');
            highlightField('logoUpload');
        }
        
        // Capa - verificar se há imagem no preview ou no upload
        const capaContainer = document.getElementById('capaPreviewContainer');
        const capaUpload = document.getElementById('capaUpload');
        const hasCapa = (capaContainer && capaContainer.querySelector('img')) || 
                       (capaUpload && capaUpload.files.length > 0) ||
                       (window.uploadedImages && window.uploadedImages.capa);
        
        if (!hasCapa) {
            errors.push('Imagem de capa');
            highlightField('capaUpload');
        }
        
        if (errors.length > 0) {
            showValidationMessage(1, 'Campos obrigatórios: ' + errors.join(', '));
            return false;
        }
        
        return true;
    }
    
    function validateStep2() {
        const errors = [];
        
        // Classificação
        const classification = document.getElementById('classification');
        if (!classification || !classification.value) {
            errors.push('Classificação');
            highlightField('classification');
        }
        
        // Categoria
        const category = document.getElementById('category');
        if (!category || !category.value) {
            errors.push('Categoria');
            highlightField('category');
        }
        
        // Data de início
        const startDateTime = document.getElementById('startDateTime');
        if (!startDateTime || !startDateTime.value) {
            errors.push('Data e hora de início');
            highlightField('startDateTime');
        }
        
        if (errors.length > 0) {
            showValidationMessage(2, 'Campos obrigatórios: ' + errors.join(', '));
            return false;
        }
        
        return true;
    }
    
    function validateStep3() {
        const description = document.getElementById('eventDescription');
        
        if (!description) {
            console.log('⚠️ Campo eventDescription não encontrado, permitindo avanço');
            return true;
        }
        
        // Para editor rico (div contenteditable)
        let text = '';
        if (description.contentEditable === 'true' || description.getAttribute('contenteditable') === 'true') {
            // Editor rico - usar textContent para texto limpo
            text = description.textContent || description.innerText || '';
        } else {
            // Textarea ou input
            text = description.value || '';
        }
        
        // Limpar o texto
        text = text.trim();
        
        console.log(`📝 ETAPA 3 DEBUG:`);
        console.log(`- Elemento encontrado:`, description);
        console.log(`- contentEditable:`, description.contentEditable);
        console.log(`- textContent:`, description.textContent);
        console.log(`- innerText:`, description.innerText);
        console.log(`- Texto final (${text.length} caracteres):`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        
        // TEMPORÁRIO: Permitir avanço mesmo sem texto para debug
        if (!text) {
            console.log('⚠️ TEMPORÁRIO: Texto vazio, mas permitindo avanço para teste');
            showValidationMessage(3, 'Aviso: Descrição vazia (temporariamente permitindo avanço)');
            return true; // Temporário: permitir avanço
        }
        
        if (text.length < 50) {
            console.log('⚠️ TEMPORÁRIO: Texto curto (' + text.length + ' chars), mas permitindo avanço para teste');
            showValidationMessage(3, 'Aviso: Descrição com ' + text.length + ' caracteres (mínimo: 50) - temporariamente permitindo avanço');
            return true; // Temporário: permitir avanço
        }
        
        console.log('✅ Validação da etapa 3 passou completamente');
        return true;
    }
    
    function validateStep4() {
        const errors = [];
        
        // Verificar se é evento online ou presencial
        const locationTypeSwitch = document.getElementById('locationTypeSwitch');
        const isOnline = locationTypeSwitch && !locationTypeSwitch.classList.contains('active');
        
        if (isOnline) {
            // Para eventos online, validar apenas o eventLink
            const eventLink = document.getElementById('eventLink');
            if (!eventLink || !eventLink.value.trim()) {
                errors.push('Link do evento');
                highlightField('eventLink');
            } else {
                // Validar se é uma URL válida
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                if (!urlPattern.test(eventLink.value.trim())) {
                    errors.push('Link do evento deve ser uma URL válida');
                    highlightField('eventLink');
                }
            }
        } else {
            // Para eventos presenciais, validar os campos de localização
            const fields = [
                { id: 'venueName', name: 'Nome do local' },
                { id: 'cep', name: 'CEP' },
                { id: 'street', name: 'Rua' },
                { id: 'number', name: 'Número' },
                { id: 'neighborhood', name: 'Bairro' },
                { id: 'city', name: 'Cidade' },
                { id: 'state', name: 'Estado' }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (!element || !element.value.trim()) {
                    errors.push(field.name);
                    highlightField(field.id);
                }
            });
        }
        
        if (errors.length > 0) {
            const eventType = isOnline ? 'online' : 'presencial';
            showValidationMessage(4, `Campos obrigatórios para evento ${eventType}: ` + errors.join(', '));
            return false;
        }
        
        return true;
    }
    
    function validateStep5() {
        // Etapa 5: Setores - Sem validação obrigatória
        console.log('🏢 Validando etapa 5 - Setores (opcional)');
        return true; // Setores são opcionais
    }
    
    function validateStep6() {
        console.log('🔍 Validando etapa 6 - Lotes');
        
        // Verificar se há lotes cadastrados (apenas lotes por data)
        const lotesPorDataList = document.getElementById('lotesPorDataList');
        
        let hasLotes = false;
        let totalLotes = 0;
        
        if (lotesPorDataList && lotesPorDataList.children.length > 0) {
            // Verificar se há lotes reais (não apenas empty state)
            const realLotes = Array.from(lotesPorDataList.children).filter(child => 
                !child.classList.contains('lote-empty-state') && 
                child.classList.contains('lote-item')
            );
            if (realLotes.length > 0) {
                hasLotes = true;
                totalLotes += realLotes.length;
            }
            console.log(`📅 Lotes por data encontrados: ${realLotes.length}`);
        }
        
        console.log(`📋 Total de lotes: ${totalLotes}`);
        
        if (!hasLotes || totalLotes === 0) {
            showValidationMessage(6, 'É necessário cadastrar pelo menos um lote para prosseguir');
            return false;
        }
        
        console.log('✅ Validação da etapa 6 passou');
        return true;
    }
    
    function validateStep7() {
        // Verificar se há ingressos cadastrados
        const ticketList = document.getElementById('ticketList');
        
        if (!ticketList || ticketList.children.length === 0) {
            showValidationMessage(7, 'É necessário cadastrar pelo menos um tipo de ingresso');
            return false;
        }
        
        return true;
    }
    
    function validateStep8() {
        const contratanteId = document.getElementById('contratanteId');
        
        if (!contratanteId || !contratanteId.value) {
            showValidationMessage(8, 'Selecione o organizador responsável pelo evento');
            highlightField('contratanteId');
            return false;
        }
        
        return true;
    }
    
    
    // FUNÇÕES GLOBAIS PARA GERENCIAMENTO DE SETORES (ETAPA 5)
    
    // Variável global para armazenar setores temporariamente até salvamento final
    window.setoresTemporarios = [];
    
    // Função global para adicionar setor
    window.adicionarSetor = function() {
        const nomeInput = document.getElementById('novoSetorNome');
        const nome = nomeInput.value.trim().toUpperCase(); // Converter para maiúscula
        
        if (!nome) {
            alert('Digite o nome do setor');
            nomeInput.focus();
            return;
        }
        
        if (nome.length > 100) {
            alert('Nome do setor deve ter no máximo 100 caracteres');
            return;
        }
        
        // Verificar se já existe
        if (window.setoresTemporarios.some(s => s.nome.toLowerCase() === nome.toLowerCase())) {
            alert('Já existe um setor com este nome');
            return;
        }
        
        // Adicionar ao array temporário
        const novoSetor = {
            id: Date.now(), // ID temporário
            nome: nome,
            isNew: true
        };
        
        window.setoresTemporarios.push(novoSetor);
        
        // Limpar input
        nomeInput.value = '';
        
        // Atualizar lista
        window.renderizarSetores();
        
        console.log('🏢 Setor adicionado temporariamente:', novoSetor);
        console.log('🏢 Total de setores temporários:', window.setoresTemporarios.length);
    };
    
    // Função global para renderizar setores
    window.renderizarSetores = function() {
        const setoresGrid = document.getElementById('setoresGrid');
        const setoresEmpty = document.getElementById('setoresEmpty');
        
        if (!setoresGrid || !setoresEmpty) {
            console.error('❌ Elementos setoresGrid ou setoresEmpty não encontrados');
            return;
        }
        
        if (window.setoresTemporarios.length === 0) {
            setoresEmpty.style.display = 'block';
            setoresGrid.innerHTML = '';
            return;
        }
        
        setoresEmpty.style.display = 'none';
        
        // Limpar grid
        setoresGrid.innerHTML = '';
        
        // Adicionar cada setor como card
        window.setoresTemporarios.forEach((setor, index) => {
            const setorCard = window.criarSetorCard(setor, index);
            setoresGrid.appendChild(setorCard);
        });
        
        console.log(`🏢 Renderizados ${window.setoresTemporarios.length} setores em grid profissional`);
    };
    
    // Função global para criar card de setor
    window.criarSetorCard = function(setor, index) {
        const card = document.createElement('div');
        card.dataset.setorId = setor.id;
        
        // Estilo inline para garantir aplicação
        card.style.cssText = `
            background: rgba(26, 26, 46, 0.9);
            border: 1px solid rgba(184, 197, 209, 0.2);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            position: relative;
        `;
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="font-weight: 600; color: #E1E5F2; font-size: 1.1rem; line-height: 1.4; flex: 1; margin-right: 10px;">${setor.nome}</div>
                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                    <button onclick="window.editarSetor(${index})" title="Editar setor"
                            style="background: rgba(255, 255, 255, 0.1); border: none; color: #8B95A7; cursor: pointer; padding: 6px 8px; border-radius: 6px; font-size: 0.9rem; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; min-width: 32px; height: 32px;">
                        ✏️
                    </button>
                    <button onclick="window.excluirSetor(${index})" title="Excluir setor"
                            style="background: rgba(255, 255, 255, 0.1); border: none; color: #8B95A7; cursor: pointer; padding: 6px 8px; border-radius: 6px; font-size: 0.9rem; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; min-width: 32px; height: 32px;">
                        🗑️
                    </button>
                </div>
            </div>
            <div style="color: #8B95A7; font-size: 0.85rem; margin-top: 8px; display: flex; align-items: center; gap: 6px;">
                <span>Setor ${index + 1}</span>
                <span>•</span>
                <span>${setor.nome.length} caracteres</span>
            </div>
        `;
        
        // Adicionar hover effects via JavaScript
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = 'rgba(0, 194, 255, 0.4)';
            this.style.background = 'rgba(26, 26, 46, 0.95)';
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(184, 197, 209, 0.2)';
            this.style.background = 'rgba(26, 26, 46, 0.9)';
            this.style.transform = 'translateY(0)';
        });
        
        // Hover effects para botões
        const buttons = card.querySelectorAll('button');
        buttons.forEach((btn, i) => {
            btn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 255, 255, 0.2)';
                this.style.transform = 'scale(1.1)';
                if (i === 0) { // Edit button
                    this.style.color = '#00C2FF';
                    this.style.background = 'rgba(0, 194, 255, 0.1)';
                } else { // Delete button
                    this.style.color = '#FF5252';
                    this.style.background = 'rgba(255, 82, 82, 0.1)';
                }
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255, 255, 255, 0.1)';
                this.style.transform = 'scale(1)';
                this.style.color = '#8B95A7';
            });
        });
        
        return card;
    };
    
    // Função global para editar setor
    window.editarSetor = function(index) {
        const setor = window.setoresTemporarios[index];
        if (!setor) return;
        
        window.setorEditandoIndex = index;
        window.mostrarModalEditarSetor(setor.nome);
    };
    
    // Função para mostrar modal de edição personalizado
    window.mostrarModalEditarSetor = function(nomeAtual) {
        // Criar modal se não existir
        let modal = document.getElementById('modalEditarSetor');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalEditarSetor';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            `;
            
            modal.innerHTML = `
                <div style="background: rgba(26, 26, 46, 0.95); border: 1px solid rgba(184, 197, 209, 0.3); border-radius: 16px; padding: 30px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
                    <h3 style="color: #E1E5F2; margin: 0 0 20px 0; font-size: 1.3rem; font-weight: 600;">Editar Nome do Setor</h3>
                    <input type="text" id="inputEditarSetor" style="width: 100%; padding: 12px 16px; background: rgba(15, 15, 35, 0.6); border: 1px solid rgba(184, 197, 209, 0.3); border-radius: 8px; color: #E1E5F2; font-size: 1rem; margin-bottom: 20px; box-sizing: border-box; outline: none;" maxlength="100">
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button onclick="window.cancelarEdicaoSetor()" style="padding: 10px 20px; background: rgba(139, 149, 167, 0.3); color: #E1E5F2; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">Cancelar</button>
                        <button onclick="window.confirmarEdicaoSetor()" style="padding: 10px 20px; background: linear-gradient(135deg, #00C2FF, #725EFF); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Salvar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
        
        // Mostrar modal e definir valor
        const input = document.getElementById('inputEditarSetor');
        input.value = nomeAtual;
        modal.style.display = 'flex';
        
        // Focar no input e selecionar texto
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
        
        // Enter para salvar
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.confirmarEdicaoSetor();
            }
        });
    };
    
    window.cancelarEdicaoSetor = function() {
        document.getElementById('modalEditarSetor').style.display = 'none';
    };
    
    window.confirmarEdicaoSetor = function() {
        const input = document.getElementById('inputEditarSetor');
        const novoNome = input.value.trim().toUpperCase(); // Converter para maiúscula
        
        if (!novoNome) {
            alert('Nome não pode estar vazio');
            input.focus();
            return;
        }
        
        if (novoNome.length > 100) {
            alert('Nome deve ter no máximo 100 caracteres');
            input.focus();
            return;
        }
        
        // Verificar se já existe outro setor com este nome
        const index = window.setorEditandoIndex;
        if (window.setoresTemporarios.some((s, i) => i !== index && s.nome.toLowerCase() === novoNome.toLowerCase())) {
            alert('Já existe um setor com este nome');
            input.focus();
            return;
        }
        
        // Atualizar
        window.setoresTemporarios[index].nome = novoNome;
        window.renderizarSetores();
        
        // Fechar modal
        document.getElementById('modalEditarSetor').style.display = 'none';
        
        console.log('🏢 Setor editado:', window.setoresTemporarios[index]);
    };
    
    // Função global para excluir setor
    window.excluirSetor = function(index) {
        const setor = window.setoresTemporarios[index];
        if (!setor) return;
        
        // Excluir direto sem confirmação
        window.setoresTemporarios.splice(index, 1);
        window.renderizarSetores();
        console.log('🏢 Setor excluído:', setor.nome);
    };
    
    // Função para salvar todos os setores quando o evento for criado
    window.salvarSetoresNoEvento = async function(eventoId) {
        if (!window.setoresTemporarios || window.setoresTemporarios.length === 0) {
            console.log('🏢 Nenhum setor temporário para salvar');
            return true;
        }
        
        console.log('🏢 Salvando', window.setoresTemporarios.length, 'setores no evento', eventoId);
        
        let sucessos = 0;
        let erros = 0;
        
        for (const setor of window.setoresTemporarios) {
            try {
                const response = await fetch('/produtor/ajax/salvar_setor.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        evento_id: eventoId,
                        nome: setor.nome
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    sucessos++;
                    console.log('✅ Setor salvo:', setor.nome);
                } else {
                    erros++;
                    console.error('❌ Erro ao salvar setor:', setor.nome, result.error);
                }
            } catch (error) {
                erros++;
                console.error('❌ Erro na requisição de salvar setor:', setor.nome, error);
            }
        }
        
        console.log(`🏢 Setores salvos: ${sucessos} sucessos, ${erros} erros`);
        
        // Limpar setores temporários após salvamento
        window.setoresTemporarios = [];
        
        return erros === 0;
    };
    
    // Inicializar event listeners para setores
    document.addEventListener('DOMContentLoaded', function() {
        // Event listener para Enter no input de setor
        setTimeout(() => {
            const novoSetorInput = document.getElementById('novoSetorNome');
            if (novoSetorInput) {
                novoSetorInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        window.adicionarSetor();
                    }
                });
                
                // Hover effects para o input e formatação maiúscula
                novoSetorInput.addEventListener('focus', function() {
                    this.style.borderColor = '#00C2FF';
                    this.style.boxShadow = '0 0 0 3px rgba(0, 194, 255, 0.1)';
                });
                
                novoSetorInput.addEventListener('blur', function() {
                    this.style.borderColor = 'rgba(184, 197, 209, 0.3)';
                    this.style.boxShadow = 'none';
                });
                
                // Converter para maiúscula em tempo real
                novoSetorInput.addEventListener('input', function() {
                    const cursorPos = this.selectionStart;
                    this.value = this.value.toUpperCase();
                    this.setSelectionRange(cursorPos, cursorPos);
                });
                
                console.log('✅ Event listeners para setores configurados');
            }
        }, 1000);
    });
    
    // Funções auxiliares
    function highlightField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error-field');
            setTimeout(() => field.classList.remove('error-field'), 3000);
        }
    }
    
    function showValidationMessage(step, message) {
        const msgEl = document.getElementById(`validation-step-${step}`);
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.style.display = 'block';
            msgEl.classList.add('show');
        }
    }
    
    function hideValidationMessages() {
        const allMessages = document.querySelectorAll('.validation-message');
        allMessages.forEach(msg => {
            msg.classList.remove('show');
            msg.style.display = 'none';
        });
    }
    
    console.log('✅ Validações obrigatórias implementadas');
    
    // Debug: Adicionar listener para monitorar cliques nos botões
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-continue') || e.target.textContent.includes('Avançar')) {
            console.log('🖱️ Clique no botão avançar detectado');
            console.log('Etapa atual detectada:', getCurrentStep());
        }
    });
    
    // Debug: Verificar se há conflitos de currentStep
    if (typeof window.currentStep !== 'undefined') {
        console.log('⚠️ Variável window.currentStep já existe:', window.currentStep);
    }
    
    // Função global para desabilitar validação em caso de problemas
    window.disableValidation = function() {
        validationEnabled = false;
        console.log('🔧 Validação desabilitada - wizard funcionará normalmente');
    };
    
    window.enableValidation = function() {
        validationEnabled = true;
        console.log('🔧 Validação habilitada');
    };
    
    // Implementar contador de caracteres para o editor rico
    function initializeCharCounter() {
        const description = document.getElementById('eventDescription');
        const charCounter = document.getElementById('charCounter');
        
        if (description && charCounter) {
            function updateCounter() {
                const text = description.textContent || description.innerText || '';
                const cleanText = text.trim();
                charCounter.textContent = cleanText.length + ' caracteres';
                
                // Mudar cor baseado no mínimo
                if (cleanText.length < 50) {
                    charCounter.style.color = '#ef4444';
                } else {
                    charCounter.style.color = '#10b981';
                }
            }
            
            // Atualizar contador em tempo real
            description.addEventListener('input', updateCounter);
            description.addEventListener('keyup', updateCounter);
            description.addEventListener('paste', function() {
                setTimeout(updateCounter, 100); // Delay para processar o paste
            });
            
            // Atualizar inicialmente
            updateCounter();
            
            console.log('✅ Contador de caracteres inicializado');
        }
    }
    
    // Inicializar contador após DOM carregar
    initializeCharCounter();
    
    // Implementar preenchimento automático de datas nos modais de ingresso
    function initializeLoteDateFilling() {
        console.log('🔄 Inicializando preenchimento automático de datas dos lotes');
        
        // Monitor para modal de ingresso pago
        const paidLoteSelect = document.getElementById('paidTicketLote');
        if (paidLoteSelect) {
            paidLoteSelect.addEventListener('change', function() {
                fillLoteDatesForPaidTicket(this.value);
            });
        }
        
        // Monitor para modal de ingresso gratuito
        const freeLoteSelect = document.getElementById('freeTicketLote');
        if (freeLoteSelect) {
            freeLoteSelect.addEventListener('change', function() {
                fillLoteDatesForFreeTicket(this.value);
            });
        }
    }
    
    function fillLoteDatesForPaidTicket(loteId) {
        console.log('🗓️ Preenchendo datas para ingresso pago, lote:', loteId);
        
        if (!loteId) return;
        
        // Buscar dados do lote selecionado
        const loteData = findLoteData(loteId);
        if (loteData && loteData.tipo === 'data') {
            const startField = document.getElementById('paidSaleStart');
            const endField = document.getElementById('paidSaleEnd');
            
            if (startField && endField) {
                startField.value = loteData.inicio;
                startField.readOnly = true;
                startField.style.backgroundColor = '#f3f4f6';
                
                endField.value = loteData.fim;
                endField.readOnly = true;
                endField.style.backgroundColor = '#f3f4f6';
                
                console.log('✅ Datas preenchidas automaticamente:', loteData.inicio, 'até', loteData.fim);
            }
        } else {
            // Se não for lote por data, liberar campos
            const startField = document.getElementById('paidSaleStart');
            const endField = document.getElementById('paidSaleEnd');
            
            if (startField && endField) {
                startField.readOnly = false;
                startField.style.backgroundColor = '';
                endField.readOnly = false;
                endField.style.backgroundColor = '';
            }
        }
    }
    
    function fillLoteDatesForFreeTicket(loteId) {
        console.log('🗓️ Preenchendo datas para ingresso gratuito, lote:', loteId);
        
        if (!loteId) return;
        
        // Buscar dados do lote selecionado
        const loteData = findLoteData(loteId);
        if (loteData && loteData.tipo === 'data') {
            const startField = document.getElementById('freeSaleStart');
            const endField = document.getElementById('freeSaleEnd');
            
            if (startField && endField) {
                startField.value = loteData.inicio;
                startField.readOnly = true;
                startField.style.backgroundColor = '#f3f4f6';
                
                endField.value = loteData.fim;
                endField.readOnly = true;
                endField.style.backgroundColor = '#f3f4f6';
                
                console.log('✅ Datas preenchidas automaticamente:', loteData.inicio, 'até', loteData.fim);
            }
        } else {
            // Se não for lote por data, liberar campos
            const startField = document.getElementById('freeSaleStart');
            const endField = document.getElementById('freeSaleEnd');
            
            if (startField && endField) {
                startField.readOnly = false;
                startField.style.backgroundColor = '';
                endField.readOnly = false;
                endField.style.backgroundColor = '';
            }
        }
    }
    
    function findLoteData(loteId) {
        // Buscar nos arrays globais de lotes se existirem
        if (typeof window.lotesPorData !== 'undefined') {
            const lote = window.lotesPorData.find(l => l.id == loteId);
            if (lote) return { ...lote, tipo: 'data' };
        }
        
        if (typeof window.lotesPorPercentual !== 'undefined') {
            const lote = window.lotesPorPercentual.find(l => l.id == loteId);
            if (lote) return { ...lote, tipo: 'percentual' };
        }
        
        // Buscar no DOM como fallback
        const loteElement = document.querySelector(`[data-lote-id="${loteId}"]`);
        if (loteElement) {
            return {
                id: loteId,
                tipo: loteElement.getAttribute('data-lote-tipo'),
                inicio: loteElement.getAttribute('data-lote-inicio'),
                fim: loteElement.getAttribute('data-lote-fim')
            };
        }
        
        console.log('⚠️ Lote não encontrado:', loteId);
        return null;
    }
    
    // Inicializar preenchimento de datas
    setTimeout(initializeLoteDateFilling, 1000); // Delay para garantir que os modais estão carregados
    
    console.log('💡 Para desabilitar validação temporariamente, execute: disableValidation()');
    console.log('💡 Para habilitar validação novamente, execute: enableValidation()');
});

// ========== PROTEÇÃO CONTRA BACKGROUND INCORRETO NO LOGO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Função para proteger logoPreviewContainer contra background incorreto
    function protectLogoContainer() {
        const logoContainer = document.getElementById('logoPreviewContainer');
        if (logoContainer) {
            // Criar um MutationObserver para monitorar mudanças de estilo
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const target = mutation.target;
                        // Verificar se foi aplicado background-image incorretamente
                        if (target.style.backgroundImage && target.style.backgroundImage !== 'none') {
                            console.log('🛡️ Removendo background-image incorreto do logoPreviewContainer');
                            target.style.backgroundImage = '';
                            target.style.background = '';
                        }
                    }
                });
            });
            
            // Observar mudanças de atributos no container
            observer.observe(logoContainer, {
                attributes: true,
                attributeFilter: ['style']
            });
            
            // Verificação inicial
            if (logoContainer.style.backgroundImage && logoContainer.style.backgroundImage !== 'none') {
                console.log('🛡️ Limpando background-image inicial do logoPreviewContainer');
                logoContainer.style.backgroundImage = '';
                logoContainer.style.background = '';
            }
        }
    }
    
    // Inicializar proteção
    setTimeout(protectLogoContainer, 500);
    
    console.log('🛡️ Proteção do logoPreviewContainer ativada');
});

// ========== FUNCIONALIDADES DOS SETORES E QUANTIDADE ==========
document.addEventListener('DOMContentLoaded', function() {
    
    // Arrays para armazenar setores selecionados por modal
    window.paidTicketSetores = [];
    window.freeTicketSetores = [];
    window.editPaidTicketSetores = [];
    window.editFreeTicketSetores = [];
    
    // Função para lidar com mudança na quantidade (exibe "Não limitar" quando zero)
    window.handleQuantityChange = function(input, displayId) {
        const value = parseInt(input.value) || 0;
        const display = document.getElementById(displayId);
        
        if (display) {
            if (value === 0) {
                display.textContent = 'Não limitar';
                display.style.color = '#00C2FF';
                display.style.fontWeight = '500';
                display.style.fontStyle = 'italic';
            } else {
                display.textContent = value + ' ingresso' + (value > 1 ? 's' : '');
                display.style.color = '#666';
                display.style.fontWeight = '500';
                display.style.fontStyle = 'normal';
            }
        }
    };
    
    // Função para carregar setores nos selects
    function loadSetoresIntoSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Limpar options existentes (exceto o primeiro)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Carregar setores temporários da etapa 5 
        if (window.setoresTemporarios && window.setoresTemporarios.length > 0) {
            window.setoresTemporarios.forEach(setor => {
                const option = document.createElement('option');
                option.value = setor.id; // Usar ID temporário criado na etapa 5
                option.textContent = setor.nome;
                select.appendChild(option);
            });
            console.log(`✅ Carregados ${window.setoresTemporarios.length} setores temporários no select ${selectId}`);
        } else {
            // Se não há setores temporários, buscar no DOM como fallback
            const setoresGrid = document.getElementById('setoresGrid');
            if (setoresGrid) {
                const setorCards = setoresGrid.querySelectorAll('[data-setor-id]');
                setorCards.forEach(card => {
                    const setorNome = card.querySelector('[style*="font-weight: 600"]')?.textContent?.trim();
                    const setorId = card.getAttribute('data-setor-id');
                    
                    if (setorNome && setorId) {
                        const option = document.createElement('option');
                        option.value = setorId;
                        option.textContent = setorNome;
                        select.appendChild(option);
                    }
                });
                console.log(`✅ Carregados setores do DOM no select ${selectId}`);
            }
        }
    }
    
    // Função para adicionar setor ao ingresso pago
    window.addSetorToPaidTicket = function() {
        const select = document.getElementById('paidTicketSetores');
        const listContainer = document.getElementById('paidTicketSetoresList');
        
        if (select.value && select.selectedOptions[0]) {
            const setorId = select.value;
            const setorNome = select.selectedOptions[0].text;
            
            // Verificar se já foi adicionado
            if (!window.paidTicketSetores.find(s => s.setor_id == setorId)) {
                window.paidTicketSetores.push({ setor_id: parseInt(setorId), nome: setorNome });
                updateSetoresList('paidTicketSetoresList', window.paidTicketSetores, 'paidTicketSetores');
            }
            
            select.value = '';
        }
    };
    
    // Função para adicionar setor ao ingresso gratuito
    window.addSetorToFreeTicket = function() {
        const select = document.getElementById('freeTicketSetores');
        
        if (select.value && select.selectedOptions[0]) {
            const setorId = select.value;
            const setorNome = select.selectedOptions[0].text;
            
            if (!window.freeTicketSetores.find(s => s.setor_id == setorId)) {
                window.freeTicketSetores.push({ setor_id: parseInt(setorId), nome: setorNome });
                updateSetoresList('freeTicketSetoresList', window.freeTicketSetores, 'freeTicketSetores');
            }
            
            select.value = '';
        }
    };
    
    // Função para adicionar setor ao ingresso pago (edição)
    window.addSetorToEditPaidTicket = function() {
        const select = document.getElementById('editPaidTicketSetores');
        
        if (select.value && select.selectedOptions[0]) {
            const setorId = select.value;
            const setorNome = select.selectedOptions[0].text;
            
            if (!window.editPaidTicketSetores.find(s => s.setor_id == setorId)) {
                window.editPaidTicketSetores.push({ setor_id: parseInt(setorId), nome: setorNome });
                updateSetoresList('editPaidTicketSetoresList', window.editPaidTicketSetores, 'editPaidTicketSetores');
            }
            
            select.value = '';
        }
    };
    
    // Função para adicionar setor ao ingresso gratuito (edição)
    window.addSetorToEditFreeTicket = function() {
        const select = document.getElementById('editFreeTicketSetores');
        
        if (select.value && select.selectedOptions[0]) {
            const setorId = select.value;
            const setorNome = select.selectedOptions[0].text;
            
            if (!window.editFreeTicketSetores.find(s => s.setor_id == setorId)) {
                window.editFreeTicketSetores.push({ setor_id: parseInt(setorId), nome: setorNome });
                updateSetoresList('editFreeTicketSetoresList', window.editFreeTicketSetores, 'editFreeTicketSetores');
            }
            
            select.value = '';
        }
    };
    
    // Função para atualizar a lista visual de setores (agora em formato de badges)
    function updateSetoresList(containerId, setoresArray, arrayName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Encontrar ou criar o container de badges
        let badgesContainer = container.querySelector('.setores-badges-container');
        if (!badgesContainer) {
            badgesContainer = document.createElement('div');
            badgesContainer.className = 'setores-badges-container';
            container.appendChild(badgesContainer);
        }
        
        if (setoresArray.length === 0) {
            badgesContainer.innerHTML = `
                <div class="setores-empty-badge">
                    Nenhum setor selecionado
                </div>
            `;
        } else {
            badgesContainer.innerHTML = setoresArray.map((setor, index) => {
                const colorClass = `color-${(index % 8) + 1}`; // Rotacionar entre 8 cores
                return `
                    <div class="setor-badge ${colorClass}" title="${setor.nome}">
                        ${setor.nome}
                        <div class="setor-badge-remove" onclick="removeSetorFromList('${arrayName}', ${index}, '${containerId}')" title="Remover setor">
                            ×
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Função para remover setor da lista
    window.removeSetorFromList = function(arrayName, index, containerId) {
        const array = window[arrayName];
        if (array && array.length > index) {
            array.splice(index, 1);
            updateSetoresList(containerId, array, arrayName);
        }
    };
    
    // Carregar setores quando modais são abertos
    document.addEventListener('click', function(e) {
        if (e.target.id === 'addPaidTicket') {
            setTimeout(() => {
                loadSetoresIntoSelect('paidTicketSetores');
                // Resetar quantidade para 0
                const quantityInput = document.getElementById('paidTicketQuantity');
                if (quantityInput) {
                    quantityInput.value = 0;
                    handleQuantityChange(quantityInput, 'paidTicketQuantityDisplay');
                }
                // Limpar setores
                window.paidTicketSetores = [];
                updateSetoresList('paidTicketSetoresList', window.paidTicketSetores, 'paidTicketSetores');
            }, 100);
        }
        
        if (e.target.id === 'addFreeTicket') {
            setTimeout(() => {
                loadSetoresIntoSelect('freeTicketSetores');
                // Resetar quantidade para 0
                const quantityInput = document.getElementById('freeTicketQuantity');
                if (quantityInput) {
                    quantityInput.value = 0;
                    handleQuantityChange(quantityInput, 'freeTicketQuantityDisplay');
                }
                // Limpar setores
                window.freeTicketSetores = [];
                updateSetoresList('freeTicketSetoresList', window.freeTicketSetores, 'freeTicketSetores');
            }, 100);
        }
        
        // Event listeners para modais de edição
        if (e.target && e.target.onclick && e.target.onclick.toString().includes('editPaidTicket')) {
            setTimeout(() => {
                loadSetoresIntoSelect('editPaidTicketSetores');
                // Manter quantidade existente e atualizar display
                const quantityInput = document.getElementById('editPaidTicketQuantity');
                if (quantityInput) {
                    handleQuantityChange(quantityInput, 'editPaidTicketQuantityDisplay');
                }
            }, 200);
        }
        
        if (e.target && e.target.onclick && e.target.onclick.toString().includes('editFreeTicket')) {
            setTimeout(() => {
                loadSetoresIntoSelect('editFreeTicketSetores');
                // Manter quantidade existente e atualizar display
                const quantityInput = document.getElementById('editFreeTicketQuantity');
                if (quantityInput) {
                    handleQuantityChange(quantityInput, 'editFreeTicketQuantityDisplay');
                }
            }, 200);
        }
    });
    
    // Função para obter setores como JSON
    window.getSetoresAsJSON = function(arrayName) {
        const array = window[arrayName] || [];
        return JSON.stringify(array);
    };
    
    console.log('✅ Funcionalidades de setores e quantidade carregadas');
});

</script>
</body>
</html>