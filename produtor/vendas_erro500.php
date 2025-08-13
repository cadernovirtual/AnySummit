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

// Parâmetros de filtro
$search_comprador = isset($_GET['search_comprador']) ? trim($_GET['search_comprador']) : '';
$search_pedido = isset($_GET['search_pedido']) ? trim($_GET['search_pedido']) : '';
$filter_data_inicio = isset($_GET['filter_data_inicio']) ? $_GET['filter_data_inicio'] : '';
$filter_data_fim = isset($_GET['filter_data_fim']) ? $_GET['filter_data_fim'] : '';
$filter_pagamento = isset($_GET['filter_pagamento']) ? $_GET['filter_pagamento'] : '';
$filter_status_pagamento = isset($_GET['filter_status_pagamento']) ? $_GET['filter_status_pagamento'] : ''; // NOVO FILTRO
$sort_column = isset($_GET['sort']) ? $_GET['sort'] : 'created_at';
$sort_direction = isset($_GET['dir']) ? strtoupper($_GET['dir']) : 'DESC';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;

// Validar ordenação
$valid_columns = ['codigo_pedido', 'comprador_nome', 'created_at', 'valor_total', 'metodo_pagamento', 'status_pagamento'];
if (!in_array($sort_column, $valid_columns)) {
    $sort_column = 'created_at';
}
if (!in_array(strtoupper($sort_direction), ['ASC', 'DESC'])) {
    $sort_direction = 'DESC';
}

// Mapear colunas para evitar ambiguidade no SQL
$column_mapping = [
    'codigo_pedido' => 'p.codigo_pedido',
    'comprador_nome' => 'c.nome',
    'created_at' => 'p.created_at',
    'valor_total' => 'p.valor_total',
    'metodo_pagamento' => 'p.metodo_pagamento',
    'status_pagamento' => 'p.status_pagamento'
];
$sql_sort_column = $column_mapping[$sort_column] ?? 'p.created_at';

// Buscar estatísticas gerais
$sql_stats = "SELECT 
                COUNT(DISTINCT p.pedidoid) as total_pedidos,
                COUNT(DISTINCT c.id) as total_compradores,
                COUNT(DISTINCT ii.id) as total_ingressos,
                COALESCE(SUM(p.valor_total), 0) as faturamento_total,
                COUNT(DISTINCT CASE WHEN p.status_pagamento = 'pago' THEN p.pedidoid END) as pedidos_pagos,
                COUNT(DISTINCT CASE WHEN p.status_pagamento = 'pendente' THEN p.pedidoid END) as pedidos_pendentes,
                COUNT(DISTINCT CASE WHEN p.status_pagamento = 'cancelado' THEN p.pedidoid END) as pedidos_cancelados,
                COUNT(DISTINCT CASE WHEN ii.utilizado = 1 THEN ii.id END) as ingressos_utilizados,
                COUNT(DISTINCT CASE WHEN ii.participanteid IS NOT NULL THEN ii.id END) as ingressos_identificados,
                COUNT(DISTINCT CASE WHEN ii.participanteid IS NULL THEN ii.id END) as ingressos_nao_identificados
              FROM tb_pedidos p
              LEFT JOIN compradores c ON p.compradorid = c.id
              LEFT JOIN tb_ingressos_individuais ii ON p.pedidoid = ii.pedidoid
              WHERE p.eventoid = ?";

$stmt = mysqli_prepare($con, $sql_stats);
if ($stmt) {
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $stats = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
} else {
    error_log("Erro na consulta de estatísticas: " . mysqli_error($con));
    $stats = [
        'total_pedidos' => 0,
        'total_compradores' => 0,
        'total_ingressos' => 0,
        'faturamento_total' => 0,
        'pedidos_pagos' => 0,
        'pedidos_pendentes' => 0,
        'pedidos_cancelados' => 0,
        'ingressos_utilizados' => 0,
        'ingressos_identificados' => 0,
        'ingressos_nao_identificados' => 0
    ];
}

// Construir consulta de pedidos com filtros
$where_conditions = ["p.eventoid = ?"];
$params = [$evento_id];
$param_types = "i";

// Filtros de busca - MELHORADO PARA INCLUIR CPF
if (!empty($search_comprador)) {
    $where_conditions[] = "(c.nome LIKE ? OR c.email LIKE ? OR c.cpf LIKE ? OR c.documento LIKE ?)";
    $search_term = "%{$search_comprador}%";
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $param_types .= "ssss";
}

if (!empty($search_pedido)) {
    $where_conditions[] = "p.codigo_pedido LIKE ?";
    $params[] = "%{$search_pedido}%";
    $param_types .= "s";
}

if (!empty($filter_data_inicio)) {
    $where_conditions[] = "DATE(p.created_at) >= ?";
    $params[] = $filter_data_inicio;
    $param_types .= "s";
}

if (!empty($filter_data_fim)) {
    $where_conditions[] = "DATE(p.created_at) <= ?";
    $params[] = $filter_data_fim;
    $param_types .= "s";
}

if (!empty($filter_pagamento)) {
    $where_conditions[] = "p.metodo_pagamento = ?";
    $params[] = $filter_pagamento;
    $param_types .= "s";
}

// NOVO FILTRO POR STATUS DE PAGAMENTO
if (!empty($filter_status_pagamento)) {
    $where_conditions[] = "p.status_pagamento = ?";
    $params[] = $filter_status_pagamento;
    $param_types .= "s";
}

$where_clause = implode(" AND ", $where_conditions);

// Paginação
$limit = 15;
$offset = ($page - 1) * $limit;

// Consulta principal de pedidos
$sql_pedidos = "SELECT p.*,
                       c.nome as comprador_nome,
                       c.email as comprador_email,
                       c.celular as comprador_celular,
                       c.cpf as comprador_cpf,
                       c.tipo_documento,
                       (SELECT COUNT(*) FROM tb_ingressos_individuais WHERE pedidoid = p.pedidoid) as qtd_ingressos
                FROM tb_pedidos p
                LEFT JOIN compradores c ON p.compradorid = c.id
                WHERE {$where_clause}
                ORDER BY {$sql_sort_column} {$sort_direction}
                LIMIT ? OFFSET ?";

$stmt = mysqli_prepare($con, $sql_pedidos);
if ($stmt) {
    if (!empty($params)) {
        $all_params = array_merge($params, [$limit, $offset]);
        $all_types = $param_types . "ii";
        mysqli_stmt_bind_param($stmt, $all_types, ...$all_params);
    } else {
        mysqli_stmt_bind_param($stmt, "iii", $evento_id, $limit, $offset);
    }
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $pedidos = mysqli_fetch_all($result, MYSQLI_ASSOC);
    mysqli_stmt_close($stmt);
} else {
    $pedidos = [];
    error_log("Erro na consulta de pedidos: " . mysqli_error($con));
}

// Contar total de pedidos para paginação
$sql_count = "SELECT COUNT(*) as total FROM tb_pedidos p
              LEFT JOIN compradores c ON p.compradorid = c.id
              WHERE {$where_clause}";
$stmt = mysqli_prepare($con, $sql_count);
if ($stmt) {
    if (!empty($params)) {
        mysqli_stmt_bind_param($stmt, $param_types, ...$params);
    } else {
        mysqli_stmt_bind_param($stmt, "i", $evento_id);
    }
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $total_count = mysqli_fetch_assoc($result)['total'];
    mysqli_stmt_close($stmt);
} else {
    $total_count = 0;
    error_log("Erro na consulta de contagem: " . mysqli_error($con));
}

$total_pages = ceil($total_count / $limit);

// Função para gerar URL com parâmetros mantidos
function buildUrl($new_params = []) {
    global $evento_id, $search_comprador, $search_pedido, $filter_data_inicio, $filter_data_fim, $filter_pagamento, $filter_status_pagamento, $sort_column, $sort_direction, $page;
    
    $current_params = [
        'eventoid' => $evento_id,
        'search_comprador' => $search_comprador ?? '',
        'search_pedido' => $search_pedido ?? '',
        'filter_data_inicio' => $filter_data_inicio ?? '',
        'filter_data_fim' => $filter_data_fim ?? '',
        'filter_pagamento' => $filter_pagamento ?? '',
        'filter_status_pagamento' => $filter_status_pagamento ?? '', // NOVO
        'sort' => $sort_column ?? 'created_at',
        'dir' => $sort_direction ?? 'DESC',
        'page' => $page ?? 1
    ];
    
    $params = array_merge($current_params, $new_params);
    $params = array_filter($params, function($value) {
        return $value !== '' && $value !== null;
    }); // Remove valores vazios
    
    return '?' . http_build_query($params);
}
// Função para gerar ícone de ordenação
function getSortIcon($column) {
    global $sort_column, $sort_direction;
    if (($sort_column ?? '') === $column) {
        return ($sort_direction ?? 'DESC') === 'ASC' ? ' ↑' : ' ↓';
    }
    return ' ↕';
}

// Função para gerar URL de ordenação
function getSortUrl($column) {
    global $sort_column, $sort_direction;
    $current_column = $sort_column ?? 'created_at';
    $current_direction = $sort_direction ?? 'DESC';
    $new_direction = ($current_column === $column && $current_direction === 'ASC') ? 'DESC' : 'ASC';
    return buildUrl(['sort' => $column, 'dir' => $new_direction, 'page' => 1]);
}
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

        /* Filtros */
        .filters-section {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .filter-label {
            color: #E0E0E8;
            font-size: 13px;
            font-weight: 500;
        }

        .filter-input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #FFFFFF;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .filter-input:focus {
            outline: none;
            border-color: rgba(0, 194, 255, 0.5);
            background: rgba(0, 194, 255, 0.1);
        }

        .filter-input::placeholder {
            color: #B8B8C8;
        }

        .filters-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }

        .btn-filter {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-filter:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(0, 194, 255, 0.3);
        }

        .btn-clear {
            background: rgba(255, 255, 255, 0.1);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .btn-clear:hover {
            background: rgba(255, 82, 82, 0.2);
            border-color: rgba(255, 82, 82, 0.3);
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
            cursor: pointer;
            user-select: none;
            transition: background 0.3s ease;
        }

        .pedidos-table th:hover {
            background: rgba(0, 194, 255, 0.2);
        }

        .pedidos-table th.sortable {
            position: relative;
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

        .dropdown-item.email-2via {
            color: #00C851;
        }

        .dropdown-item.email-2via:hover {
            background: rgba(0, 200, 81, 0.1);
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
            max-width: 700px;
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

            .filters-grid {
                grid-template-columns: 1fr;
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
                    
                    <div class="stat-card">
                        <div class="stat-icon">👤</div>
                        <div class="stat-value"><?php echo number_format($stats['ingressos_identificados']); ?></div>
                        <div class="stat-label">Ingressos Identificados</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">❓</div>
                        <div class="stat-value"><?php echo number_format($stats['ingressos_nao_identificados']); ?></div>
                        <div class="stat-label">Ingressos Não Identificados</div>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="filters-section">
                    <form method="GET" action="">
                        <input type="hidden" name="eventoid" value="<?php echo $evento_id; ?>">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label class="filter-label">Buscar Comprador</label>
                                <input type="text" name="search_comprador" class="filter-input" 
                                       placeholder="Nome, e-mail ou CPF do comprador..." 
                                       value="<?php echo htmlspecialchars($search_comprador); ?>">
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Buscar Pedido</label>
                                <input type="text" name="search_pedido" class="filter-input" 
                                       placeholder="Código do pedido..." 
                                       value="<?php echo htmlspecialchars($search_pedido); ?>">
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Status do Pagamento</label>
                                <select name="filter_status_pagamento" class="filter-input">
                                    <option value="">Todos os status</option>
                                    <option value="pago" <?php echo $filter_status_pagamento === 'pago' ? 'selected' : ''; ?>>✅ Pago</option>
                                    <option value="pendente" <?php echo $filter_status_pagamento === 'pendente' ? 'selected' : ''; ?>>⏳ Pendente</option>
                                    <option value="cancelado" <?php echo $filter_status_pagamento === 'cancelado' ? 'selected' : ''; ?>>❌ Cancelado</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Data Início</label>
                                <input type="date" name="filter_data_inicio" class="filter-input" 
                                       value="<?php echo htmlspecialchars($filter_data_inicio); ?>">
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Data Fim</label>
                                <input type="date" name="filter_data_fim" class="filter-input" 
                                       value="<?php echo htmlspecialchars($filter_data_fim); ?>">
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Tipo de Pagamento</label>
                                <select name="filter_pagamento" class="filter-input">
                                    <option value="">Todos os tipos</option>
                                    <option value="pix" <?php echo $filter_pagamento === 'pix' ? 'selected' : ''; ?>>PIX</option>
                                    <option value="cartao" <?php echo $filter_pagamento === 'cartao' ? 'selected' : ''; ?>>Cartão</option>
                                    <option value="boleto" <?php echo $filter_pagamento === 'boleto' ? 'selected' : ''; ?>>Boleto</option>
                                </select>
                            </div>
                        </div>
                        <div class="filters-actions">
                            <a href="<?php echo buildUrl(['search_comprador' => '', 'search_pedido' => '', 'filter_data_inicio' => '', 'filter_data_fim' => '', 'filter_pagamento' => '', 'filter_status_pagamento' => '', 'page' => 1]); ?>" class="btn-clear">
                                🗑️ Limpar
                            </a>
                            <button type="submit" class="btn-filter">
                                🔍 Filtrar
                            </button>
                        </div>
                    </form>
                </div>
                <!-- Lista de Pedidos -->
                <div class="pedidos-section">
                    <div class="section-header">
                        <h2 class="section-title">Pedidos Realizados</h2>
                        <div style="color: #B8B8C8; font-size: 14px;">
                            <?php if ($total_count !== count($pedidos) && (!empty($search_comprador) || !empty($search_pedido) || !empty($filter_data_inicio) || !empty($filter_data_fim) || !empty($filter_pagamento) || !empty($filter_status_pagamento))): ?>
                                Mostrando <?php echo count($pedidos); ?> de <?php echo number_format($total_count); ?> pedidos filtrados
                            <?php else: ?>
                                Total: <?php echo number_format($total_count); ?> pedidos
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <?php if (empty($pedidos)): ?>
                        <div style="text-align: center; padding: 40px; color: #B8B8C8;">
                            <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
                            <h3 style="color: #E0E0E8; margin-bottom: 8px;">Nenhum pedido encontrado</h3>
                            <p>
                                <?php if (!empty($search_comprador) || !empty($search_pedido) || !empty($filter_data_inicio) || !empty($filter_data_fim) || !empty($filter_pagamento) || !empty($filter_status_pagamento)): ?>
                                    Tente ajustar os filtros para encontrar os pedidos desejados.
                                <?php else: ?>
                                    Os pedidos aparecerão aqui conforme as vendas aconteçam.
                                <?php endif; ?>
                            </p>
                        </div>
                    <?php else: ?>
                        <table class="pedidos-table">
                            <thead>
                                <tr>
                                    <th class="sortable">
                                        <a href="<?php echo getSortUrl('codigo_pedido'); ?>" style="color: inherit; text-decoration: none;">
                                            Código<?php echo getSortIcon('codigo_pedido'); ?>
                                        </a>
                                    </th>
                                    <th class="sortable">
                                        <a href="<?php echo getSortUrl('comprador_nome'); ?>" style="color: inherit; text-decoration: none;">
                                            Comprador<?php echo getSortIcon('comprador_nome'); ?>
                                        </a>
                                    </th>
                                    <th class="sortable">
                                        <a href="<?php echo getSortUrl('created_at'); ?>" style="color: inherit; text-decoration: none;">
                                            Data<?php echo getSortIcon('created_at'); ?>
                                        </a>
                                    </th>
                                    <th class="sortable">
                                        <a href="<?php echo getSortUrl('valor_total'); ?>" style="color: inherit; text-decoration: none;">
                                            Valor Recebido<?php echo getSortIcon('valor_total'); ?>
                                        </a>
                                    </th>
                                    <th class="sortable">
                                        <a href="<?php echo getSortUrl('metodo_pagamento'); ?>" style="color: inherit; text-decoration: none;">
                                            Pagamento<?php echo getSortIcon('metodo_pagamento'); ?>
                                        </a>
                                    </th>
                                    <th>Itens Pedido</th>
                                    <th class="sortable">
                                        <a href="<?php echo getSortUrl('status_pagamento'); ?>" style="color: inherit; text-decoration: none;">
                                            Status<?php echo getSortIcon('status_pagamento'); ?>
                                        </a>
                                    </th>
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
                                        <?php if ($pedido['comprador_cpf']): ?>
                                        <div style="font-size: 12px; color: #B8B8C8;">
                                            🆔 <?php echo htmlspecialchars($pedido['comprador_cpf']); ?>
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
                                            <?php elseif ($pedido['metodo_pagamento'] === 'cartao' || $pedido['metodo_pagamento'] === 'credit'): ?>
                                                💳 Cartão
                                                <?php if ($pedido['parcelas'] > 1): ?>
                                                    <br><small style="color: #B8B8C8;"><?php echo $pedido['parcelas']; ?>x</small>
                                                <?php endif; ?>
                                            <?php elseif ($pedido['metodo_pagamento'] === 'boleto'): ?>
                                                📄 Boleto
                                            <?php else: ?>
                                                <?php 
                                                // Transformar outros termos conhecidos
                                                $metodo_display = $pedido['metodo_pagamento'];
                                                if (strtolower($metodo_display) === 'credit') {
                                                    $metodo_display = 'Cartão';
                                                }
                                                echo htmlspecialchars($metodo_display); 
                                                ?>
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
                                                <?php if ($pedido['status_pagamento'] === 'pago'): ?>
                                                <div class="dropdown-item email-2via" onclick="enviarSegundaVia(<?php echo $pedido['pedidoid']; ?>)">
                                                    📧 Enviar 2a. Via por e-mail
                                                </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>                        console.error('Erro ao confirmar pagamento:', error);
                        alert('Erro ao confirmar pagamento: ' + error.message);
                    });
            }
        }

        // NOVA FUNÇÃO: Enviar 2ª via do email de confirmação
        function enviarSegundaVia(pedidoId) {
            if (confirm('Tem certeza que deseja reenviar o email de confirmação de pagamento para o comprador?')) {
                // Mostrar loading
                const loadingMsg = document.createElement('div');
                loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(42, 42, 56, 0.95); color: white; padding: 20px; border-radius: 10px; z-index: 999999; border: 1px solid rgba(255, 255, 255, 0.1);';
                loadingMsg.innerHTML = '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 10px;">📧</div>Enviando email...</div>';
                document.body.appendChild(loadingMsg);
                
                fetch(`/produtor/ajax/enviar-segunda-via.php?id=${pedidoId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        document.body.removeChild(loadingMsg);
                        
                        if (data.success) {
                            alert('✅ Email reenviado com sucesso!\n\nO comprador receberá novamente o email de confirmação de pagamento.');
                        } else {
                            alert('❌ Erro ao reenviar email: ' + (data.message || 'Erro desconhecido'));
                        }
                    })
                    .catch(error => {
                        document.body.removeChild(loadingMsg);
                        console.error('Erro ao reenviar email:', error);
                        alert('❌ Erro ao reenviar email: ' + error.message);
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