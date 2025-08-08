<?php
include("check_login.php");
include("conm/conn.php");

// Tentar incluir arquivo de helpers, se não conseguir, criar função local
if (file_exists("../includes/imagem-helpers.php")) {
    include("../includes/imagem-helpers.php");
} else {
    // Função helper local como fallback
    function normalizarCaminhoImagem($imagePath) {
        if (empty($imagePath)) {
            return '';
        }
        
        // Se já é um caminho correto, retorna como está
        if ($imagePath === '/uploads/capas/' . basename($imagePath)) {
            return $imagePath;
        }
        
        // Casos de caminhos antigos ou incorretos
        if (strpos($imagePath, '/produtor/uploads/eventos/') !== false) {
            // Remove /produtor/uploads/eventos/ e adiciona /uploads/capas/
            $nomeArquivo = basename($imagePath);
            return '/uploads/capas/' . $nomeArquivo;
        }
        
        if (strpos($imagePath, '/uploads/eventos/') !== false) {
            // Remove /uploads/eventos/ e adiciona /uploads/capas/
            $nomeArquivo = basename($imagePath);
            return '/uploads/capas/' . $nomeArquivo;
        }
        
        if (strpos($imagePath, 'uploads/capas/') !== false) {
            // Adiciona / inicial se não tiver
            if (substr($imagePath, 0, 1) !== '/') {
                return '/' . $imagePath;
            }
            return $imagePath;
        }
        
        // Se é apenas o nome do arquivo, adiciona o caminho completo
        if (strpos($imagePath, '/') === false) {
            return '/uploads/capas/' . $imagePath;
        }
        
        // Fallback: extrair nome do arquivo e criar caminho correto
        $nomeArquivo = basename($imagePath);
        return '/uploads/capas/' . $nomeArquivo;
    }
}

// Pegar dados do usuário logado
// Removido $contratante_id = $_COOKIE['contratanteid'] ?? 0; pois não existe mais
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Buscar dados do usuário para o header
$usuario = null;
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

// Inicializar array de eventos
$eventos = [];

 

try {
    // Query para buscar eventos do usuário (incluindo rascunhos)
    $sql = "SELECT e.*, 
                   COALESCE(cat.nome, 'Sem categoria') as categoria_nome,
                   MIN(ing.preco) as preco_min,
                   MAX(ing.preco) as preco_max,
                   COUNT(DISTINCT ing.id) as total_ingressos
            FROM eventos e 
            LEFT JOIN categorias_evento cat ON e.categoria_id = cat.id AND cat.ativo = 1
            LEFT JOIN ingressos ing ON e.id = ing.evento_id AND ing.ativo = 1
            WHERE e.usuario_id = ?
            GROUP BY e.id
            ORDER BY e.criado_em DESC";

    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "i", $usuario_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $eventos = mysqli_fetch_all($result, MYSQLI_ASSOC);
        mysqli_stmt_close($stmt);
        
        // Debug: Mostrar quantos eventos foram encontrados
        error_log("Eventos encontrados: " . count($eventos) . " para usuário $usuario_id");
    } else {
        error_log("Erro ao preparar query: " . mysqli_error($con));
    }
} catch (Exception $e) {
    error_log("Erro ao buscar eventos: " . $e->getMessage());
    $eventos = [];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Eventos - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .eventos-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .eventos-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .eventos-header h1 {
            color: #FFFFFF;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .novo-evento-btn {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .novo-evento-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        /* Tabela de eventos - Desktop */
        .eventos-table-container {
            display: block;
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: visible; /* Mudança aqui para permitir dropdown sair da tabela */
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            position: relative;
        }

        .eventos-table {
            width: 100%;
            border-collapse: collapse;
            overflow: visible; /* Permitir conteúdo sair da tabela */
        }

        .eventos-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .eventos-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
            position: relative; /* Importante para o dropdown */
        }

        .eventos-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .eventos-table tr:last-child td {
            border-bottom: none;
        }

        /* Imagem da tabela */
        .table-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
            background: linear-gradient(135deg, #1A1A2E, #16213E);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888899;
            font-size: 24px;
        }

        .evento-title {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        /* Status badges */
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-publicado {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
        }

        .status-rascunho {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }

        .status-cancelado {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
        }

        /* Visibilidade badges */
        .visibility-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }

        .visibility-publico {
            background: rgba(0, 194, 255, 0.2);
            color: #00C2FF;
        }

        .visibility-privado {
            background: rgba(114, 94, 255, 0.2);
            color: #725EFF;
        }

        /* Preço */
        .preco-range {
            font-weight: 600;
            color: #00C851;
        }

        .preco-gratuito {
            color: #FFC107;
        }

        /* Dropdown de ações */
        .actions-dropdown {
            position: relative;
            display: inline-block;
        }

        .actions-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #FFFFFF;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .actions-btn:hover {
            background: rgba(0, 194, 255, 0.2);
            border-color: rgba(0, 194, 255, 0.3);
        }

        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background: rgba(42, 42, 56, 0.98);
            min-width: 200px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 999999; /* Z-index extremamente alto */
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            backdrop-filter: blur(20px);
            margin-top: 4px;
        }

        .dropdown-content.show {
            display: block;
            z-index: 999999 !important; /* Forçar z-index muito alto */
        }

        .dropdown-item {
            color: #FFFFFF;
            padding: 12px 16px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: background 0.3s ease;
            font-size: 14px;
        }

        .dropdown-item:hover {
            background: rgba(0, 194, 255, 0.1);
        }

        .dropdown-item.danger:hover {
            background: rgba(255, 82, 82, 0.1);
            color: #FF5252;
        }

        /* Remover o comportamento de dropdown para cima */
        /* Comentado para sempre abrir para baixo 
        .eventos-table tbody tr:last-child .dropdown-content {
            top: auto;
            bottom: 100%;
            margin-top: 0;
            margin-bottom: 4px;
        }
        */

        /* Grid de cards para mobile */
        .eventos-grid-mobile {
            display: none; /* Escondido no desktop */
        }

        /* Ajustes para mobile */
        @media (max-width: 768px) {
            .dropdown-content {
                display: none !important; /* Esconder dropdown tradicional no mobile */
            }

            /* Modal overlay */
            .modal-overlay {
                display: none; /* Remover !important */
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 999999;
                backdrop-filter: blur(4px);
            }

            .modal-overlay.show {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            /* Modal content */
            .modal-content {
                background: rgba(42, 42, 56, 0.98);
                border-radius: 20px;
                padding: 16px;
                width: 100%;
                max-width: 280px; /* Diminuir largura */
                max-height: 70vh; /* Limitar altura */
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                animation: modalSlideUp 0.3s ease;
                overflow: hidden; /* Para controlar scroll interno */
            }

            @keyframes modalSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            /* Modal header */
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .modal-title {
                font-size: 16px;
                font-weight: 600;
                color: #FFFFFF;
            }

            .modal-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: #FFFFFF;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: all 0.3s ease;
            }

            .modal-close:hover {
                background: rgba(255, 82, 82, 0.2);
                color: #FF5252;
            }

            /* Modal options */
            .modal-options {
                display: flex;
                flex-direction: column;
                gap: 2px;
                max-height: 50vh; /* Altura máxima para scroll */
                overflow-y: auto; /* Scroll vertical */
                padding-right: 4px; /* Espaço para a scrollbar */
            }

            /* Custom scrollbar */
            .modal-options::-webkit-scrollbar {
                width: 4px;
            }

            .modal-options::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
            }

            .modal-options::-webkit-scrollbar-thumb {
                background: rgba(0, 194, 255, 0.5);
                border-radius: 2px;
            }

            .modal-options::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 194, 255, 0.8);
            }

            .modal-option {
                color: #FFFFFF;
                padding: 12px 16px;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                border-radius: 10px;
                border: 1px solid transparent;
            }

            .modal-option:hover {
                background: rgba(0, 194, 255, 0.1);
                border-color: rgba(0, 194, 255, 0.2);
                transform: translateX(2px);
            }

            .modal-option.danger:hover {
                background: rgba(255, 82, 82, 0.1);
                border-color: rgba(255, 82, 82, 0.2);
                color: #FF5252;
            }

            .modal-option-icon {
                font-size: 16px;
                width: 20px;
                text-align: center;
                flex-shrink: 0;
            }

            .eventos-container {
                padding: 15px;
            }

            .eventos-header {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }

            .eventos-header h1 {
                font-size: 24px;
                text-align: center;
            }

            /* Esconder tabela no mobile */
            .eventos-table-container {
                display: none !important;
            }

            /* Mostrar cards no mobile */
            .eventos-grid-mobile {
                display: block !important;
            }

            /* Ajustar posicionamento do dropdown no mobile */
            .actions-dropdown {
                position: static;
            }

            .evento-card-mobile {
                position: relative;
                overflow: visible;
            }

            /* Itens do dropdown menores no mobile */
            .dropdown-item {
                padding: 10px 14px;
                font-size: 13px;
            }
        }

        .evento-card-mobile {
            background: rgba(42, 42, 56, 0.9);
            border-radius: 16px;
            overflow: visible; /* Permitir dropdown sair do card */
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 20px;
            position: relative;
            z-index: 1; /* Z-index baixo para o card */
        }

        /* Z-index especial quando dropdown está ativo */
        .evento-card-mobile.dropdown-active {
            z-index: 99998 !important; /* Menor que o dropdown mas maior que outros cards */
        }

        /* Garantir que outros cards fiquem atrás */
        .evento-card-mobile:not(.dropdown-active) {
            z-index: 1; /* Z-index baixo para cards sem dropdown ativo */
        }

        .evento-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .evento-card-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
            background: linear-gradient(135deg, #1A1A2E, #16213E);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888899;
            font-size: 24px;
            flex-shrink: 0;
        }

        .evento-card-title-area {
            flex: 1;
            min-width: 0;
        }

        .evento-card-title {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 4px;
            word-wrap: break-word;
        }

        .evento-card-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .evento-card-content {
            padding: 16px;
        }

        .evento-card-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
        }

        .info-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-label {
            font-size: 11px;
            color: #888899;
            text-transform: uppercase;
            font-weight: 500;
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 13px;
            color: #FFFFFF;
            font-weight: 500;
        }

        .evento-card-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-status-area {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #B8B8C8;
        }

        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 20px;
            opacity: 0.5;
        }

        .empty-state h3 {
            font-size: 24px;
            margin-bottom: 12px;
            color: #E0E0E8;
        }

        .empty-state p {
            font-size: 16px;
            margin-bottom: 24px;
            line-height: 1.5;
        }

        @media (max-width: 768px) {
            .eventos-header {
                flex-direction: column;
                align-items: stretch;
            }

            .eventos-header h1 {
                font-size: 24px;
                text-align: center;
            }

            .eventos-container {
                padding: 15px;
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
            <div class="eventos-container">
                <div class="eventos-header">
                    <h1>Meus Eventos</h1>
                    <button onclick="criarNovoEvento()" class="novo-evento-btn">
                        ➕ Novo Evento
                    </button>
                </div>

                <?php if (empty($eventos)): ?>
                    <div class="empty-state">
                        <div class="empty-state-icon">🎪</div>
                        <h3>Nenhum evento encontrado</h3>
                        <p>Comece criando seu primeiro evento e transforme suas ideias em realidade!</p>
                       <button onclick="criarNovoEvento()" class="novo-evento-btn">
                            🚀 Criar Primeiro Evento
                       </button>
                        
                        <div style="margin-top: 20px; padding: 15px; background: rgba(255, 193, 7, 0.1); border-radius: 12px; border: 1px solid rgba(255, 193, 7, 0.3);">
                            <p style="color: #FFC107; font-size: 14px;">
                                <strong>Debug:</strong> Usuário ID: <?php echo $usuario_id; ?>
                                <!-- Removido Contratante ID pois não existe mais -->
                            </p>
                        </div>
                    </div>
                <?php else: ?>
                    
                    <!-- Tabela para Desktop -->
                    <div class="eventos-table-container">
                        <table class="eventos-table">
                            <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Categoria</th>
                                    <th>Data</th>
                                    <th>Local</th>
                                    <th>Preço</th>
                                    <th>Status</th>
                                    <th>Criado</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($eventos as $evento): ?>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <?php 
                                            if (!empty($evento['imagem_capa'])) {
                                                $imagem_normalizada = normalizarCaminhoImagem($evento['imagem_capa']);
                                                echo '<img src="' . htmlspecialchars($imagem_normalizada) . '" alt="Capa" class="table-image">';
                                            } else {
                                                echo '<div class="table-image">🖼️</div>';
                                            }
                                            ?>
                                            <div>
                                                <div class="evento-title" style="font-size: 14px; margin-bottom: 4px;">
                                                    <a href="evento-publicado.php?eventoid=<?php echo $evento['id']; ?>" 
                                                       style="color: #E1E5F2; text-decoration: none; cursor: pointer;">
                                                        <?php echo htmlspecialchars($evento['nome']); ?>
                                                    </a>
                                                </div>
                                                <span class="visibility-badge visibility-<?php echo $evento['visibilidade']; ?>">
                                                    <?php echo ucfirst($evento['visibilidade']); ?>
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><?php echo htmlspecialchars($evento['categoria_nome']); ?></td>
                                    <td>
                                        <div style="font-size: 13px;">
                                            <?php 
                                            $data_inicio = new DateTime($evento['data_inicio']);
                                            $data_fim = new DateTime($evento['data_fim']);
                                            echo $data_inicio->format('d/m/Y H:i');
                                            if ($evento['evento_multiplos_dias']) {
                                                echo '<br><small style="color: #B8B8C8;">até ' . $data_fim->format('d/m/Y H:i') . '</small>';
                                            }
                                            ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-size: 13px;">
                                            <?php if ($evento['tipo_local'] === 'presencial'): ?>
                                                📍 <?php echo htmlspecialchars($evento['nome_local'] ?: $evento['cidade']); ?>
                                            <?php else: ?>
                                                💻 Online
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <?php if ($evento['preco_min'] === null): ?>
                                            <span class="preco-gratuito">Gratuito</span>
                                        <?php elseif ($evento['preco_min'] == $evento['preco_max']): ?>
                                            <span class="preco-range">R$ <?php echo number_format($evento['preco_min'], 2, ',', '.'); ?></span>
                                        <?php else: ?>
                                            <span class="preco-range">
                                                R$ <?php echo number_format($evento['preco_min'], 2, ',', '.'); ?> - 
                                                R$ <?php echo number_format($evento['preco_max'], 2, ',', '.'); ?>
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo $evento['status']; ?>">
                                            <?php echo ucfirst($evento['status']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php 
                                        $criado = new DateTime($evento['criado_em']);
                                        echo $criado->format('d/m/Y');
                                        ?>
                                    </td>
                                    <td>
                                        <div class="actions-dropdown">
                                            <button class="actions-btn" onClick="toggleDropdown(this)">
                                                ⋮ Opções
                                            </button>
                                            <div class="dropdown-content">
                                                <a href="/produtor/editar-evento.php?evento_id=<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    ✏️ Editar
                                                </a>
                                                <a href="/produtor/personalizar-evento/<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    🎨 Personalizar
                                                </a>
                                                <a href="/produtor/whatsapp-config/<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    📱 Config. WhatsApp
                                                </a>
                                                <a href="/produtor/gerar-codigos/<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    🎫 Gerar Códigos
                                                </a>
                                                <a href="/produtor/patrocinadores/<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    🤝 Patrocinadores
                                                </a>
                                                <a href="/produtor/equipe/<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    👥 Equipe
                                                </a>
                                                <a href="/produtor/participantes/<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    👤 Participantes
                                                </a>
                                                <a href="/produtor/vendas.php?eventoid=<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    💰 Vendas
                                                </a>
                                                <a href="/produtor/dados-bancarios/<?php echo $evento['id']; ?>" class="dropdown-item">
                                                    🏦 Dados Bancários
                                                </a>
                                                <div class="dropdown-item" onClick="desativarEvento(<?php echo $evento['id']; ?>)">
                                                    ⏸️ Desativar
                                                </div>
                                                <div class="dropdown-item danger" onClick="excluirEvento(<?php echo $evento['id']; ?>)">
                                                    🗑️ Excluir
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>

                    <!-- Cards para Mobile -->
                    <div class="eventos-grid-mobile">
                        <?php foreach ($eventos as $evento): ?>
                        <div class="evento-card-mobile">
                            <div class="evento-card-header">
                                <?php if (!empty($evento['imagem_capa']) && file_exists($evento['imagem_capa'])): ?>
                                    <img src="<?php echo htmlspecialchars($evento['imagem_capa']); ?>" 
                                         alt="Capa" class="evento-card-image">
                                <?php else: ?>
                                    <div class="evento-card-image">🖼️</div>
                                <?php endif; ?>
                                
                                <div class="evento-card-title-area">
                                    <div class="evento-card-title">
                                        <a href="evento-publicado.php?eventoid=<?php echo $evento['id']; ?>" 
                                           style="color: #E1E5F2; text-decoration: none; cursor: pointer;">
                                            <?php echo htmlspecialchars($evento['nome']); ?>
                                        </a>
                                    </div>
                                    <div class="evento-card-badges">
                                        <span class="visibility-badge visibility-<?php echo $evento['visibilidade']; ?>">
                                            <?php echo ucfirst($evento['visibilidade']); ?>
                                        </span>
                                        <span class="status-badge status-<?php echo $evento['status']; ?>">
                                            <?php echo ucfirst($evento['status']); ?>
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="actions-dropdown">
                                    <button class="actions-btn" onclick="toggleDropdown(this)">⋮</button>
                                    <div class="dropdown-content">
                                        <a href="/produtor/editar-evento.php?evento_id=<?php echo $evento['id']; ?>" class="dropdown-item">
                                            ✏️ Editar
                                        </a>
                                        <a href="/produtor/personalizar-evento/<?php echo $evento['id']; ?>" class="dropdown-item">
                                            🎨 Personalizar
                                        </a>
                                        <a href="/produtor/whatsapp-config/<?php echo $evento['id']; ?>" class="dropdown-item">
                                            📱 Config. WhatsApp
                                        </a>
                                        <a href="/produtor/gerar-codigos/<?php echo $evento['id']; ?>" class="dropdown-item">
                                            🎫 Gerar Códigos
                                        </a>
                                        <a href="/produtor/patrocinadores/<?php echo $evento['id']; ?>" class="dropdown-item">
                                            🤝 Patrocinadores
                                        </a>
                                        <a href="/produtor/equipe/<?php echo $evento['id']; ?>" class="dropdown-item">
                                            👥 Equipe
                                        </a>
                                        <a href="/produtor/participantes/<?php echo $evento['id']; ?>" class="dropdown-item">
                                            👤 Participantes
                                        </a>
                                        <a href="/produtor/vendas.php?eventoid=<?php echo $evento['id']; ?>" class="dropdown-item">
                                            💰 Vendas
                                        </a>
                                        <a href="/produtor/dados-bancarios/<?php echo $evento['id']; ?>" class="dropdown-item">
                                            🏦 Dados Bancários
                                        </a>
                                        <div class="dropdown-item" onclick="desativarEvento(<?php echo $evento['id']; ?>)">
                                            ⏸️ Desativar
                                        </div>
                                        <div class="dropdown-item danger" onclick="excluirEvento(<?php echo $evento['id']; ?>)">
                                            🗑️ Excluir
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="evento-card-content">
                                <div class="evento-card-info">
                                    <div class="info-item">
                                        <div class="info-label">Categoria</div>
                                        <div class="info-value"><?php echo htmlspecialchars($evento['categoria_nome']); ?></div>
                                    </div>
                                    
                                    <div class="info-item">
                                        <div class="info-label">Data</div>
                                        <div class="info-value">
                                            <?php 
                                            $data_inicio = new DateTime($evento['data_inicio']);
                                            echo $data_inicio->format('d/m/Y H:i');
                                            ?>
                                        </div>
                                    </div>
                                    
                                    <div class="info-item">
                                        <div class="info-label">Local</div>
                                        <div class="info-value">
                                            <?php if ($evento['tipo_local'] === 'presencial'): ?>
                                                📍 <?php echo htmlspecialchars($evento['nome_local'] ?: $evento['cidade']); ?>
                                            <?php else: ?>
                                                💻 Online
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    
                                    <div class="info-item">
                                        <div class="info-label">Preço</div>
                                        <div class="info-value">
                                            <?php if ($evento['preco_min'] === null): ?>
                                                <span class="preco-gratuito">Gratuito</span>
                                            <?php elseif ($evento['preco_min'] == $evento['preco_max']): ?>
                                                <span class="preco-range">R$ <?php echo number_format($evento['preco_min'], 2, ',', '.'); ?></span>
                                            <?php else: ?>
                                                <span class="preco-range">
                                                    R$ <?php echo number_format($evento['preco_min'], 2, ',', '.'); ?> - 
                                                    R$ <?php echo number_format($evento['preco_max'], 2, ',', '.'); ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="text-align: center; padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                                    <div class="info-label">Criado em</div>
                                    <div class="info-value">
                                        <?php 
                                        $criado = new DateTime($evento['criado_em']);
                                        echo $criado->format('d/m/Y \à\s H:i');
                                        ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    
                <?php endif; ?>
            </div>
        </main>
    </div>

    <!-- Modal para ações no mobile -->
    <div class="modal-overlay" id="actionsModal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Ações do Evento</div>
                <button class="modal-close" onclick="closeActionsModal()">×</button>
            </div>
            <div class="modal-options" id="modalOptions">
                <!-- Opções serão inseridas aqui via JavaScript -->
            </div>
        </div>
    </div>

    <script>
        // Garantir que o modal inicie fechado
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('actionsModal');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
                document.getElementById('modalOptions').innerHTML = '';
            }
        });

        // Toggle dropdown
        function toggleDropdown(button) {
            const dropdown = button.nextElementSibling;
            const card = button.closest('.evento-card-mobile') || button.closest('tr');
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // No mobile, abrir modal em vez de dropdown
                openActionsModal(button);
                return;
            }
            
            // Desktop - comportamento normal do dropdown
            // Fechar todos os outros dropdowns
            document.querySelectorAll('.dropdown-content').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('show');
                    const otherCard = d.closest('.evento-card-mobile') || d.closest('tr');
                    if (otherCard) {
                        otherCard.classList.remove('dropdown-active');
                    }
                }
            });
            
            dropdown.classList.toggle('show');
            
            if (dropdown.classList.contains('show')) {
                if (card) {
                    card.classList.add('dropdown-active');
                }
                
                // No desktop, usar absolute normal
                dropdown.style.position = 'absolute';
                dropdown.style.zIndex = '999999';
                dropdown.style.top = '100%';
                dropdown.style.bottom = 'auto';
                dropdown.style.marginTop = '4px';
                dropdown.style.marginBottom = '0';
                dropdown.style.right = '0';
                dropdown.style.left = 'auto';
                
                setTimeout(() => {
                    const dropdownRect = dropdown.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    
                    if (dropdownRect.bottom > viewportHeight) {
                        const scrollAmount = dropdownRect.bottom - viewportHeight + 20;
                        window.scrollBy({
                            top: scrollAmount,
                            behavior: 'smooth'
                        });
                    }
                }, 50);
            } else {
                if (card) {
                    card.classList.remove('dropdown-active');
                }
            }
        }

        // Abrir modal de ações (mobile)
        function openActionsModal(button) {
            const dropdown = button.nextElementSibling;
            const modal = document.getElementById('actionsModal');
            const modalOptions = document.getElementById('modalOptions');
            
            // Copiar opções do dropdown para o modal
            const options = dropdown.querySelectorAll('.dropdown-item');
            modalOptions.innerHTML = '';
            
            options.forEach(option => {
                const modalOption = document.createElement('div');
                modalOption.className = 'modal-option';
                
                if (option.classList.contains('danger')) {
                    modalOption.classList.add('danger');
                }
                
                // Copiar ícone e texto
                const iconMatch = option.textContent.match(/^[^\w\s]+/);
                const icon = iconMatch ? iconMatch[0] : '•';
                const text = option.textContent.replace(/^[^\w\s]+\s*/, '');
                
                modalOption.innerHTML = `
                    <span class="modal-option-icon">${icon}</span>
                    <span>${text}</span>
                `;
                
                // Copiar evento de clique
                if (option.href) {
                    modalOption.onclick = () => {
                        closeActionsModal();
                        window.location.href = option.href;
                    };
                } else if (option.onclick) {
                    modalOption.onclick = () => {
                        closeActionsModal();
                        option.onclick();
                    };
                }
                
                modalOptions.appendChild(modalOption);
            });
            
            // Mostrar modal
            modal.style.display = 'flex';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevenir scroll
        }

        // Fechar modal de ações
        function closeActionsModal() {
            const modal = document.getElementById('actionsModal');
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restaurar scroll
            document.getElementById('modalOptions').innerHTML = ''; // Limpar opções
        }

        // Fechar modal ao clicar no overlay
        document.getElementById('actionsModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeActionsModal();
            }
        });

        // Fechar dropdown ao clicar fora (apenas desktop)
        window.addEventListener('click', function(event) {
            if (window.innerWidth > 768 && !event.target.matches('.actions-btn')) {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    if (dropdown.classList.contains('show')) {
                        dropdown.classList.remove('show');
                        const card = dropdown.closest('.evento-card-mobile') || dropdown.closest('tr');
                        if (card) {
                            card.classList.remove('dropdown-active');
                        }
                    }
                });
            }
        });

        // Fechar modal ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeActionsModal();
            }
        });

        // Função para desativar evento
        function desativarEvento(eventoId) {
            if (confirm('Tem certeza que deseja desativar este evento?')) {
                fetch(`/produtor/ajax/desativar-evento.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ evento_id: eventoId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Erro ao desativar evento: ' + data.message);
                    }
                })
                .catch(error => {
                    alert('Erro ao desativar evento');
                });
            }
        }

        // Função para excluir evento
        function excluirEvento(eventoId) {
            if (confirm('ATENÇÃO: Esta ação é irreversível! Tem certeza que deseja excluir este evento?')) {
                if (confirm('Todos os dados do evento, incluindo ingressos e participantes, serão perdidos. Confirma a exclusão?')) {
                    fetch(`/produtor/ajax/excluir-evento.php`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ evento_id: eventoId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload();
                        } else {
                            alert('Erro ao excluir evento: ' + data.message);
                        }
                    })
                    .catch(error => {
                        alert('Erro ao excluir evento');
                    });
                }
            }
        }
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

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
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

        // Função para criar novo evento (sempre do zero)
        function criarNovoEvento() {
            // Redirecionar direto para a página de novo evento, sempre iniciando do zero
            window.location.href = '/produtor/novoevento.php';
        }
    </script>
    
    <!-- Scripts para gerenciar criação de novos eventos - DESATIVADOS TEMPORARIAMENTE -->
    <!-- <script src="/produtor/js/modal-rascunho.js"></script> -->
    <!-- <script src="/produtor/js/gerenciar-rascunhos.js"></script> -->
    
</body>
</html>