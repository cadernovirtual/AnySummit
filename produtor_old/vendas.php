<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("check_login.php");
include("conm/conn.php");

// Verificar se foi informado um evento_id
$evento_id = $_GET['eventoid'] ?? 0;

if (!$evento_id) {
    header("Location: meuseventos.php");
    exit;
}

// Pegar dados do usuário logado
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Verificar se o evento pertence ao usuário
$sql_evento = "SELECT e.*, 
                     COALESCE(cat.nome, 'Sem categoria') as categoria_nome
              FROM eventos e 
              LEFT JOIN categorias_evento cat ON e.categoria_id = cat.id
              WHERE e.id = ?";

$stmt = mysqli_prepare($con, $sql_evento);
mysqli_stmt_bind_param($stmt, "i", $evento_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$evento = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$evento) {
    header("Location: meuseventos.php");
    exit;
}

// Buscar estatísticas gerais
$sql_stats = "SELECT 
                COUNT(DISTINCT p.pedidoid) as total_pedidos,
                COUNT(DISTINCT c.id) as total_compradores,
                COUNT(DISTINCT ii.id) as total_ingressos,
                COALESCE(SUM(p.valor_total), 0) as faturamento_total,
                COUNT(DISTINCT CASE WHEN p.status_pagamento = 'pago' THEN p.pedidoid END) as pedidos_pagos,
                COUNT(DISTINCT CASE WHEN p.status_pagamento = 'pendente' THEN p.pedidoid END) as pedidos_pendentes,
                COUNT(DISTINCT CASE WHEN p.status_pagamento = 'cancelado' THEN p.pedidoid END) as pedidos_cancelados,
                COUNT(DISTINCT CASE WHEN ii.utilizado = 1 THEN ii.id END) as ingressos_utilizados
              FROM tb_pedidos p
              LEFT JOIN compradores c ON p.compradorid = c.id
              LEFT JOIN tb_ingressos_individuais ii ON p.pedidoid = ii.pedidoid
              WHERE p.eventoid = ?";

$stmt = mysqli_prepare($con, $sql_stats);
mysqli_stmt_bind_param($stmt, "i", $evento_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$stats = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

// Buscar pedidos com paginação
$page = $_GET['page'] ?? 1;
$limit = 15;
$offset = ($page - 1) * $limit;

$sql_pedidos = "SELECT p.*,
                       c.nome as comprador_nome,
                       c.email as comprador_email,
                       c.celular as comprador_celular,
                       c.tipo_documento,
                       (SELECT COUNT(*) FROM tb_ingressos_individuais WHERE pedidoid = p.pedidoid) as qtd_ingressos
                FROM tb_pedidos p
                LEFT JOIN compradores c ON p.compradorid = c.id
                WHERE p.eventoid = ?
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?";

$stmt = mysqli_prepare($con, $sql_pedidos);
mysqli_stmt_bind_param($stmt, "iii", $evento_id, $limit, $offset);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$pedidos = mysqli_fetch_all($result, MYSQLI_ASSOC);
mysqli_stmt_close($stmt);

// Contar total de pedidos para paginação
$sql_count = "SELECT COUNT(*) as total FROM tb_pedidos WHERE eventoid = ?";
$stmt = mysqli_prepare($con, $sql_count);
mysqli_stmt_bind_param($stmt, "i", $evento_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$total_count = mysqli_fetch_assoc($result)['total'];
mysqli_stmt_close($stmt);

$total_pages = ceil($total_count / $limit);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendas - <?php echo htmlspecialchars($evento['nome']); ?> - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js"></script>
    <style>
        .vendas-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .vendas-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .header-info h1 {
            color: #FFFFFF;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-info .evento-name {
            color: #B8B8C8;
            font-size: 16px;
            margin-bottom: 4px;
        }

        .header-info .evento-date {
            color: #888899;
            font-size: 14px;
        }

        .back-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .back-btn:hover {
            background: rgba(0, 194, 255, 0.2);
            border-color: rgba(0, 194, 255, 0.3);
            transform: translateY(-1px);
        }

        /* Cards de estatísticas */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
        }

        .stat-icon {
            font-size: 28px;
            margin-bottom: 12px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 12px;
            color: #B8B8C8;
            text-transform: uppercase;
            font-weight: 500;
        }

        .stat-money .stat-value {
            color: #00C851;
        }

        .stat-pending .stat-value {
            color: #FFC107;
        }

        .stat-cancelled .stat-value {
            color: #FF5252;
        }

        /* Tabela de pedidos */
        .pedidos-section {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-header {
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #FFFFFF;
            margin: 0;
        }

        .pedidos-table {
            width: 100%;
            border-collapse: collapse;
            overflow: visible;
        }

        .pedidos-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pedidos-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
            position: relative;
            font-size: 14px;
        }

        .pedidos-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .pedidos-table tr:last-child td {
            border-bottom: none;
        }

        /* Status badges */
        .status-badge {
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-pago {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
        }

        .status-pendente {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }

        .status-cancelado {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
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
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
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
            min-width: 180px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 999999;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            backdrop-filter: blur(20px);
            margin-top: 4px;
        }

        .dropdown-content.show {
            display: block;
        }

        .dropdown-item {
            color: #FFFFFF;
            padding: 10px 14px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: background 0.3s ease;
            font-size: 13px;
        }

        .dropdown-item:hover {
            background: rgba(0, 194, 255, 0.1);
        }

        /* Paginação */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin: 20px 0;
        }

        .pagination a,
        .pagination span {
            padding: 8px 12px;
            border-radius: 8px;
            text-decoration: none;
            color: #FFFFFF;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .pagination a:hover {
            background: rgba(0, 194, 255, 0.2);
            border-color: rgba(0, 194, 255, 0.3);
        }

        .pagination .current {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border-color: transparent;
        }

        /* Modal */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 999999;
            backdrop-filter: blur(4px);
        }

        .modal-overlay.show {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .modal-content {
            background: rgba(42, 42, 56, 0.98);
            border-radius: 20px;
            padding: 20px;
            width: 100%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            animation: modalSlideUp 0.3s ease;
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

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
            color: #FFFFFF;
        }

        .modal-close {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #FFFFFF;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
        }

        /* Responsivo */
        @media (max-width: 768px) {
            .vendas-container {
                padding: 15px;
            }

            .vendas-header {
                flex-direction: column;
                align-items: stretch;
            }

            .header-info h1 {
                font-size: 24px;
                text-align: center;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }

            .pedidos-table {
                font-size: 12px;
            }

            .pedidos-table th,
            .pedidos-table td {
                padding: 10px 8px;
            }

            .modal-content {
                margin: 10px;
                max-width: calc(100% - 20px);
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
        <?php include 'menu.php'; ?>

        <!-- Content Area -->
        <main class="content-area">
            <div class="vendas-container">
                <div class="vendas-header">
                    <div class="header-info">
                        <h1>💰 Acompanhamento de Vendas</h1>
                        <div class="evento-name"><?php echo htmlspecialchars($evento['nome']); ?></div>
                        <div class="evento-date">
                            <?php 
                            $data_inicio = new DateTime($evento['data_inicio']);
                            echo $data_inicio->format('d/m/Y H:i');
                            if ($evento['evento_multiplos_dias']) {
                                $data_fim = new DateTime($evento['data_fim']);
                                echo ' até ' . $data_fim->format('d/m/Y H:i');
                            }
                            ?>
                        </div>
                    </div>
                    <a href="meuseventos.php" class="back-btn">
                        ← Voltar aos Eventos
                    </a>
                </div>

                <!-- Estatísticas -->
                <div class="stats-grid">
                    <div class="stat-card stat-money">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">R$ <?php echo number_format($stats['faturamento_total'], 2, ',', '.'); ?></div>
                        <div class="stat-label">Faturamento Total</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value"><?php echo number_format($stats['total_pedidos']); ?></div>
                        <div class="stat-label">Total de Pedidos</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-value"><?php echo number_format($stats['total_compradores']); ?></div>
                        <div class="stat-label">Compradores</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🎫</div>
                        <div class="stat-value"><?php echo number_format($stats['total_ingressos']); ?></div>
                        <div class="stat-label">Ingressos Vendidos</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value"><?php echo number_format($stats['pedidos_pagos']); ?></div>
                        <div class="stat-label">Pedidos Pagos</div>
                    </div>
                    
                    <div class="stat-card stat-pending">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-value"><?php echo number_format($stats['pedidos_pendentes']); ?></div>
                        <div class="stat-label">Pendentes</div>
                    </div>
                    
                    <div class="stat-card stat-cancelled">
                        <div class="stat-icon">❌</div>
                        <div class="stat-value"><?php echo number_format($stats['pedidos_cancelados']); ?></div>
                        <div class="stat-label">Cancelados</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🔖</div>
                        <div class="stat-value"><?php echo number_format($stats['ingressos_utilizados']); ?></div>
                        <div class="stat-label">Check-ins Realizados</div>
                    </div>
                </div>

                <!-- Lista de Pedidos -->
                <div class="pedidos-section">
                    <div class="section-header">
                        <h2 class="section-title">Pedidos Realizados</h2>
                        <div style="color: #B8B8C8; font-size: 14px;">
                            Total: <?php echo number_format($total_count); ?> pedidos
                        </div>
                    </div>
                    
                    <?php if (empty($pedidos)): ?>
                        <div style="text-align: center; padding: 40px; color: #B8B8C8;">
                            <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
                            <h3 style="color: #E0E0E8; margin-bottom: 8px;">Nenhum pedido encontrado</h3>
                            <p>Os pedidos aparecerão aqui conforme as vendas aconteçam.</p>
                        </div>
                    <?php else: ?>
                        <table class="pedidos-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Comprador</th>
                                    <th>Data</th>
                                    <th>Valor</th>
                                    <th>Pagamento</th>
                                    <th>Ingressos</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($pedidos as $pedido): ?>
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #00C2FF;">
                                            <?php echo htmlspecialchars($pedido['codigo_pedido']); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 500; margin-bottom: 2px;">
                                            <?php echo htmlspecialchars($pedido['comprador_nome']); ?>
                                        </div>
                                        <div style="font-size: 12px; color: #B8B8C8;">
                                            <?php echo htmlspecialchars($pedido['comprador_email']); ?>
                                        </div>
                                        <?php if ($pedido['comprador_celular']): ?>
                                        <div style="font-size: 12px; color: #B8B8C8;">
                                            📱 <?php echo htmlspecialchars($pedido['comprador_celular']); ?>
                                        </div>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php 
                                        $data_pedido = new DateTime($pedido['created_at']);
                                        echo $data_pedido->format('d/m/Y H:i');
                                        ?>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600; color: #00C851; font-size: 15px;">
                                            R$ <?php echo number_format($pedido['valor_total'], 2, ',', '.'); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="text-transform: capitalize;">
                                            <?php if ($pedido['metodo_pagamento'] === 'pix'): ?>
                                                🔷 PIX
                                            <?php elseif ($pedido['metodo_pagamento'] === 'cartao'): ?>
                                                💳 Cartão
                                                <?php if ($pedido['parcelas'] > 1): ?>
                                                    <br><small style="color: #B8B8C8;"><?php echo $pedido['parcelas']; ?>x</small>
                                                <?php endif; ?>
                                            <?php else: ?>
                                                <?php echo htmlspecialchars($pedido['metodo_pagamento']); ?>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="text-align: center; font-weight: 600;">
                                            <?php echo number_format($pedido['qtd_ingressos']); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo str_replace(' ', '-', strtolower($pedido['status_pagamento'])); ?>">
                                            <?php echo ucfirst($pedido['status_pagamento']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="actions-dropdown">
                                            <button class="actions-btn" onclick="toggleDropdown(this)">
                                                ⋮
                                            </button>
                                            <div class="dropdown-content">
                                                <div class="dropdown-item" onclick="verDetalhes(<?php echo $pedido['pedidoid']; ?>)">
                                                    👁️ Ver Detalhes
                                                </div>
                                                <div class="dropdown-item" onclick="verIngressos(<?php echo $pedido['pedidoid']; ?>)">
                                                    🎫 Ver Ingressos
                                                </div>
                                                <div class="dropdown-item" onclick="verItens(<?php echo $pedido['pedidoid']; ?>)">
                                                    📋 Itens do Pedido
                                                </div>
                                                <?php if ($pedido['status_pagamento'] === 'pendente'): ?>
                                                <div class="dropdown-item" onclick="confirmarPagamento(<?php echo $pedido['pedidoid']; ?>)">
                                                    ✅ Confirmar Pagamento
                                                </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        
                        <!-- Paginação -->
                        <?php if ($total_pages > 1): ?>
                        <div class="pagination">
                            <?php if ($page > 1): ?>
                                <a href="?eventoid=<?php echo $evento_id; ?>&page=<?php echo $page - 1; ?>">← Anterior</a>
                            <?php endif; ?>
                            
                            <?php for ($i = max(1, $page - 2); $i <= min($total_pages, $page + 2); $i++): ?>
                                <?php if ($i == $page): ?>
                                    <span class="current"><?php echo $i; ?></span>
                                <?php else: ?>
                                    <a href="?eventoid=<?php echo $evento_id; ?>&page=<?php echo $i; ?>"><?php echo $i; ?></a>
                                <?php endif; ?>
                            <?php endfor; ?>
                            
                            <?php if ($page < $total_pages): ?>
                                <a href="?eventoid=<?php echo $evento_id; ?>&page=<?php echo $page + 1; ?>">Próxima →</a>
                            <?php endif; ?>
                        </div>
                        <?php endif; ?>
                        
                    <?php endif; ?>
                </div>
            </div>
        </main>
    </div>

    <!-- Modal para detalhes -->
    <div class="modal-overlay" id="detalhesModal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="modalTitle">Detalhes</div>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div id="modalBody">
                <!-- Conteúdo será carregado aqui -->
            </div>
        </div>
    </div>

    <script>
        // Toggle dropdown
        function toggleDropdown(button) {
            const dropdown = button.nextElementSibling;
            const isOpen = dropdown.classList.contains('show');
            
            // Fechar todos os dropdowns
            document.querySelectorAll('.dropdown-content').forEach(d => {
                d.classList.remove('show');
            });
            
            // Abrir o dropdown clicado se não estava aberto
            if (!isOpen) {
                dropdown.classList.add('show');
                
                // Fechar dropdown ao clicar fora
                setTimeout(() => {
                    document.addEventListener('click', function closeDropdown(e) {
                        if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                            dropdown.classList.remove('show');
                            document.removeEventListener('click', closeDropdown);
                        }
                    });
                }, 10);
            }
        }

        // Funções dos modais
        function verDetalhes(pedidoId) {
            document.getElementById('modalTitle').textContent = 'Detalhes do Pedido';
            document.getElementById('modalBody').innerHTML = '<div style="text-align: center; padding: 20px;"><div style="font-size: 24px;">⏳</div><br>Carregando...</div>';
            document.getElementById('detalhesModal').classList.add('show');
            
            fetch(`ajax/pedido-detalhes.php?id=${pedidoId}`)
                .then(response => response.text())
                .then(html => {
                    document.getElementById('modalBody').innerHTML = html;
                })
                .catch(error => {
                    document.getElementById('modalBody').innerHTML = '<div style="color: #FF5252; text-align: center;">Erro ao carregar detalhes</div>';
                });
        }

        function verIngressos(pedidoId) {
            document.getElementById('modalTitle').textContent = 'Ingressos do Pedido';
            document.getElementById('modalBody').innerHTML = '<div style="text-align: center; padding: 20px;"><div style="font-size: 24px;">⏳</div><br>Carregando...</div>';
            document.getElementById('detalhesModal').classList.add('show');
            
            fetch(`ajax/pedido-ingressos.php?id=${pedidoId}`)
                .then(response => response.text())
                .then(html => {
                    document.getElementById('modalBody').innerHTML = html;
                })
                .catch(error => {
                    document.getElementById('modalBody').innerHTML = '<div style="color: #FF5252; text-align: center;">Erro ao carregar ingressos</div>';
                });
        }

        function verItens(pedidoId) {
            document.getElementById('modalTitle').textContent = 'Itens do Pedido';
            document.getElementById('modalBody').innerHTML = '<div style="text-align: center; padding: 20px;"><div style="font-size: 24px;">⏳</div><br>Carregando...</div>';
            document.getElementById('detalhesModal').classList.add('show');
            
            fetch(`ajax/pedido-itens.php?id=${pedidoId}`)
                .then(response => response.text())
                .then(html => {
                    document.getElementById('modalBody').innerHTML = html;
                })
                .catch(error => {
                    document.getElementById('modalBody').innerHTML = '<div style="color: #FF5252; text-align: center;">Erro ao carregar itens</div>';
                });
        }

        function confirmarPagamento(pedidoId) {
            if (confirm('Tem certeza que deseja confirmar o pagamento deste pedido?')) {
                fetch(`ajax/confirmar-pagamento.php?id=${pedidoId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Pagamento confirmado com sucesso!');
                            location.reload();
                        } else {
                            alert('Erro ao confirmar pagamento: ' + data.message);
                        }
                    })
                    .catch(error => {
                        alert('Erro ao confirmar pagamento');
                    });
            }
        }

        function closeModal() {
            document.getElementById('detalhesModal').classList.remove('show');
        }

        // Fechar modal ao clicar fora
        document.getElementById('detalhesModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>