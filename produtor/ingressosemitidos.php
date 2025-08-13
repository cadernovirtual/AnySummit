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

// Parâmetros de filtro para ingressos
$search_comprador = isset($_GET['search_comprador']) ? trim($_GET['search_comprador']) : '';
$search_participante = isset($_GET['search_participante']) ? trim($_GET['search_participante']) : '';
$filter_com_participante = isset($_GET['filter_com_participante']) ? $_GET['filter_com_participante'] : '';
$filter_gratuito_pago = isset($_GET['filter_gratuito_pago']) ? $_GET['filter_gratuito_pago'] : '';
$filter_setor = isset($_GET['filter_setor']) ? $_GET['filter_setor'] : '';
$filter_lote = isset($_GET['filter_lote']) ? $_GET['filter_lote'] : '';
$sort_column = isset($_GET['sort']) ? $_GET['sort'] : 'ii.id';
$sort_direction = isset($_GET['dir']) ? strtoupper($_GET['dir']) : 'DESC';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;

// Validar ordenação
$valid_columns = ['codigo_ingresso', 'titulo_ingresso', 'comprador_nome', 'participante_nome', 'data_associacao'];
if (!in_array($sort_column, $valid_columns)) {
    $sort_column = 'ii.id';
}
if (!in_array(strtoupper($sort_direction), ['ASC', 'DESC'])) {
    $sort_direction = 'DESC';
}

// Mapear colunas para evitar ambiguidade no SQL
$column_mapping = [
    'codigo_ingresso' => 'ii.codigo_ingresso',
    'titulo_ingresso' => 'ii.titulo_ingresso',
    'comprador_nome' => 'c.nome',
    'participante_nome' => 'u.nome',
    'data_associacao' => 'ii.data_vinculacao'
];
$sql_sort_column = $column_mapping[$sort_column] ?? 'ii.id';

// Buscar dados dos setores disponíveis
$sql_setores = "SELECT setor_id, nome FROM setores WHERE evento_id = ? ORDER BY nome";
$stmt_setores = mysqli_prepare($con, $sql_setores);
$setores = [];
if ($stmt_setores) {
    mysqli_stmt_bind_param($stmt_setores, "i", $evento_id);
    mysqli_stmt_execute($stmt_setores);
    $result_setores = mysqli_stmt_get_result($stmt_setores);
    $setores = mysqli_fetch_all($result_setores, MYSQLI_ASSOC);
    mysqli_stmt_close($stmt_setores);
}

// Buscar dados dos lotes disponíveis
$sql_lotes = "SELECT id, nome FROM lotes WHERE evento_id = ? ORDER BY nome";
$stmt_lotes = mysqli_prepare($con, $sql_lotes);
$lotes = [];
if ($stmt_lotes) {
    mysqli_stmt_bind_param($stmt_lotes, "i", $evento_id);
    mysqli_stmt_execute($stmt_lotes);
    $result_lotes = mysqli_stmt_get_result($stmt_lotes);
    $lotes = mysqli_fetch_all($result_lotes, MYSQLI_ASSOC);
    mysqli_stmt_close($stmt_lotes);
}
// Buscar estatísticas de ingressos - APENAS APROVADOS
$sql_stats = "SELECT 
                COUNT(DISTINCT ii.id) as total_ingressos,
                COUNT(DISTINCT CASE WHEN ii.participanteid IS NOT NULL THEN ii.id END) as ingressos_com_titular,
                COUNT(DISTINCT CASE WHEN ii.participanteid IS NULL THEN ii.id END) as ingressos_sem_titular,
                COUNT(DISTINCT ii.id) as ingressos_pagos,
                COUNT(DISTINCT CASE WHEN i.preco = 0 OR i.preco IS NULL THEN ii.id END) as ingressos_gratuitos
              FROM tb_ingressos_individuais ii
              LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
              LEFT JOIN ingressos i ON ii.ingresso_id = i.id
              WHERE ii.eventoid = ? AND p.status_pagamento = 'aprovado'";

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
        'total_ingressos' => 0,
        'ingressos_com_titular' => 0,
        'ingressos_sem_titular' => 0,
        'ingressos_pagos' => 0,
        'ingressos_gratuitos' => 0
    ];
}

// Buscar estatísticas por setor se existirem setores - SIMPLIFICADO
$stats_setores = [];
// Como os setores estão em JSON na tabela ingressos, vamos manter vazio por enquanto
// Construir consulta de ingressos com filtros - APENAS APROVADOS
$where_conditions = ["ii.eventoid = ?", "p.status_pagamento = 'aprovado'"];
$params = [$evento_id];
$param_types = "i";

// Filtros de busca
if (!empty($search_comprador)) {
    $where_conditions[] = "(c.nome LIKE ? OR c.email LIKE ? OR c.cpf LIKE ?)";
    $search_term = "%{$search_comprador}%";
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $param_types .= "sss";
}

if (!empty($search_participante)) {
    $where_conditions[] = "(part.Nome LIKE ? OR part.email LIKE ? OR part.CPF LIKE ?)";
    $search_term = "%{$search_participante}%";
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $param_types .= "sss";
}

if (!empty($filter_com_participante)) {
    if ($filter_com_participante === 'com') {
        $where_conditions[] = "ii.participanteid IS NOT NULL";
    } elseif ($filter_com_participante === 'sem') {
        $where_conditions[] = "ii.participanteid IS NULL";
    }
}

if (!empty($filter_gratuito_pago)) {
    if ($filter_gratuito_pago === 'gratuito') {
        $where_conditions[] = "(i.preco = 0 OR i.preco IS NULL)";
    } elseif ($filter_gratuito_pago === 'pago') {
        $where_conditions[] = "i.preco > 0";
    }
}

if (!empty($filter_setor)) {
    $where_conditions[] = "JSON_CONTAINS(i.setores, ?)";
    $params[] = '"' . $filter_setor . '"';
    $param_types .= "s";
}

if (!empty($filter_lote)) {
    $where_conditions[] = "i.lote_id = ?";
    $params[] = $filter_lote;
    $param_types .= "i";
}

$where_clause = implode(" AND ", $where_conditions);
// Paginação
$limit = 15;
$offset = ($page - 1) * $limit;

// Consulta principal de ingressos
$sql_ingressos = "SELECT ii.*,
                         c.nome as comprador_nome,
                         c.email as comprador_email,
                         part.Nome as participante_nome,
                         part.email as participante_email,
                         part.CPF as participante_cpf,
                         p.status_pagamento,
                         i.preco as preco_ingresso,
                         l.nome as lote_nome
                  FROM tb_ingressos_individuais ii
                  LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
                  LEFT JOIN compradores c ON p.compradorid = c.id
                  LEFT JOIN participantes part ON ii.participanteid = part.participanteid
                  LEFT JOIN ingressos i ON ii.ingresso_id = i.id
                  LEFT JOIN lotes l ON i.lote_id = l.id
                  WHERE {$where_clause}
                  ORDER BY {$sql_sort_column} {$sort_direction}
                  LIMIT ? OFFSET ?";

$stmt = mysqli_prepare($con, $sql_ingressos);
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
    $ingressos = mysqli_fetch_all($result, MYSQLI_ASSOC);
    mysqli_stmt_close($stmt);
} else {
    $ingressos = [];
    error_log("Erro na consulta de ingressos: " . mysqli_error($con));
}
// Contar total de ingressos para paginação
$sql_count = "SELECT COUNT(*) as total FROM tb_ingressos_individuais ii
              LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
              LEFT JOIN compradores c ON p.compradorid = c.id
              LEFT JOIN participantes part ON ii.participanteid = part.participanteid
              LEFT JOIN ingressos i ON ii.ingresso_id = i.id
              LEFT JOIN lotes l ON i.lote_id = l.id
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
    global $evento_id, $search_comprador, $search_participante, $filter_com_participante, 
           $filter_gratuito_pago, $filter_setor, $filter_lote, $sort_column, $sort_direction, $page;
    
    $current_params = [
        'eventoid' => $evento_id,
        'search_comprador' => $search_comprador ?? '',
        'search_participante' => $search_participante ?? '',
        'filter_com_participante' => $filter_com_participante ?? '',
        'filter_gratuito_pago' => $filter_gratuito_pago ?? '',
        'filter_setor' => $filter_setor ?? '',
        'filter_lote' => $filter_lote ?? '',
        'sort' => $sort_column ?? 'ii.id',
        'dir' => $sort_direction ?? 'DESC',
        'page' => $page ?? 1
    ];
    
    $params = array_merge($current_params, $new_params);
    $params = array_filter($params, function($value) {
        return $value !== '' && $value !== null;
    }); // Remove valores vazios
    
    return '?' . http_build_query($params);
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ingressos Emitidos - <?php echo htmlspecialchars($evento['nome']); ?> - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    
    <style>
        .ingressos-container { padding: 20px; max-width: 1400px; margin: 0 auto; }
        .ingressos-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .header-info h1 { color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; background: linear-gradient(135deg, #00C2FF, #725EFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .header-info .evento-name { color: #B8B8C8; font-size: 16px; margin-bottom: 4px; }
        .header-info .evento-date { color: #888899; font-size: 14px; }
        .back-btn { background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .back-btn:hover { background: rgba(0, 194, 255, 0.2); border-color: rgba(0, 194, 255, 0.3); transform: translateY(-1px); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: rgba(42, 42, 56, 0.8); border-radius: 16px; padding: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); text-align: center; }
        .stat-icon { font-size: 28px; margin-bottom: 12px; }
        .stat-value { font-size: 24px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #B8B8C8; text-transform: uppercase; font-weight: 500; }
        .stat-primary .stat-value { color: #00C2FF; }
        .stat-success .stat-value { color: #00C851; }
        .stat-warning .stat-value { color: #FFC107; }
        .setores-stats { background: rgba(42, 42, 56, 0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); }
        .setores-title { font-size: 16px; font-weight: 600; color: #FFFFFF; margin-bottom: 15px; }
        .setores-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .setor-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 15px; border: 1px solid rgba(255, 255, 255, 0.1); text-align: center; }
        .setor-name { font-size: 14px; font-weight: 600; color: #FFFFFF; margin-bottom: 5px; }
        .setor-count { font-size: 18px; font-weight: 700; color: #00C2FF; }
        .filters-section { background: rgba(42, 42, 56, 0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); }
        .filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 15px; }
        .filter-group { display: flex; flex-direction: column; gap: 5px; }
        .filter-label { color: #E0E0E8; font-size: 13px; font-weight: 500; }
        .filter-input { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #FFFFFF; padding: 10px 12px; border-radius: 8px; font-size: 14px; transition: all 0.3s ease; }
        .filter-input:focus { outline: none; border-color: rgba(0, 194, 255, 0.5); background: rgba(0, 194, 255, 0.1); }
        .filter-input::placeholder { color: #B8B8C8; }
        .filter-input option { background: rgba(42, 42, 56, 0.95); color: #FFFFFF; }
        .filters-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .btn-filter { background: linear-gradient(135deg, #00C2FF, #725EFF); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; }
        .btn-filter:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0, 194, 255, 0.3); }
        .btn-clear { background: rgba(255, 255, 255, 0.1); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; text-decoration: none; }
        .btn-clear:hover { background: rgba(255, 82, 82, 0.2); border-color: rgba(255, 82, 82, 0.3); }
        .ingressos-section { background: rgba(42, 42, 56, 0.8); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); }
        .section-header { padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; }
        .section-title { font-size: 18px; font-weight: 600; color: #FFFFFF; margin: 0; }
        .ingressos-table { width: 100%; border-collapse: collapse; overflow: visible; }
        .ingressos-table th { background: rgba(0, 194, 255, 0.1); color: #E0E0E8; padding: 16px 12px; text-align: left; font-weight: 600; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; user-select: none; transition: background 0.3s ease; }
        .ingressos-table th:hover { background: rgba(0, 194, 255, 0.2); }
        .ingressos-table td { padding: 16px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #FFFFFF; vertical-align: middle; position: relative; font-size: 14px; }
        .ingressos-table tr:hover { background: rgba(0, 194, 255, 0.05); }
        .status-badge { padding: 4px 10px; border-radius: 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .status-aprovado { background: rgba(0, 200, 81, 0.2); color: #00C851; }
        .status-pendente { background: rgba(255, 193, 7, 0.2); color: #FFC107; }
        .status-cancelado { background: rgba(255, 82, 82, 0.2); color: #FF5252; }
        .btn-email { background: linear-gradient(135deg, #00C851, #4CAF50); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; }
        .btn-email:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0, 200, 81, 0.3); }
        .btn-email:disabled { background: rgba(255, 255, 255, 0.1); color: #888899; cursor: not-allowed; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 10px; margin: 20px 0; }
        .pagination a, .pagination span { padding: 8px 12px; border-radius: 8px; text-decoration: none; color: #FFFFFF; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; }
        .pagination a:hover { background: rgba(0, 194, 255, 0.2); border-color: rgba(0, 194, 255, 0.3); }
        .pagination .current { background: linear-gradient(135deg, #00C2FF, #725EFF); border-color: transparent; }
        
        /* Notificações */
        .notification { position: fixed; top: 20px; right: 20px; background: rgba(42, 42, 56, 0.98); color: #FFFFFF; padding: 16px 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); z-index: 999999; transform: translateX(400px); transition: all 0.3s ease; backdrop-filter: blur(20px); max-width: 350px; }
        .notification.show { transform: translateX(0); }
        .notification.success { border-left: 4px solid #00C851; }
        .notification.error { border-left: 4px solid #FF5252; }
        .notification-content { display: flex; align-items: flex-start; gap: 12px; }
        .notification-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .notification-text { flex: 1; }
        .notification-title { font-weight: 600; margin-bottom: 4px; }
        .notification-message { font-size: 14px; color: #B8B8C8; }
        .notification-close { background: none; border: none; color: #B8B8C8; cursor: pointer; padding: 0; margin-left: 8px; font-size: 18px; line-height: 1; }
        .notification-close:hover { color: #FFFFFF; }
    </style>
</head><body>
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
            <div class="ingressos-container">
                <div class="ingressos-header">
                    <div class="header-info">
                        <h1>🎫 Ingressos Emitidos</h1>
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
                                <label class="filter-label">Buscar Participante</label>
                                <input type="text" name="search_participante" class="filter-input" 
                                       placeholder="Nome, e-mail ou CPF do participante..." 
                                       value="<?php echo htmlspecialchars($search_participante); ?>">
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Com Participante</label>
                                <select name="filter_com_participante" class="filter-input">
                                    <option value="">Todos</option>
                                    <option value="com" <?php echo $filter_com_participante === 'com' ? 'selected' : ''; ?>>✅ Com Participante</option>
                                    <option value="sem" <?php echo $filter_com_participante === 'sem' ? 'selected' : ''; ?>>❌ Sem Participante</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Tipo de Ingresso</label>
                                <select name="filter_gratuito_pago" class="filter-input">
                                    <option value="">Todos os tipos</option>
                                    <option value="gratuito" <?php echo $filter_gratuito_pago === 'gratuito' ? 'selected' : ''; ?>>🆓 Gratuito</option>
                                    <option value="pago" <?php echo $filter_gratuito_pago === 'pago' ? 'selected' : ''; ?>>💰 Pago</option>
                                </select>
                            </div>
                            <?php if (!empty($setores)): ?>
                            <div class="filter-group">
                                <label class="filter-label">Setor</label>
                                <select name="filter_setor" class="filter-input">
                                    <option value="">Todos os setores</option>
                                    <?php foreach ($setores as $setor): ?>
                                        <option value="<?php echo $setor['setor_id']; ?>" <?php echo $filter_setor == $setor['setor_id'] ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($setor['nome']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <?php endif; ?>
                            <?php if (!empty($lotes)): ?>
                            <div class="filter-group">
                                <label class="filter-label">Lote</label>
                                <select name="filter_lote" class="filter-input">
                                    <option value="">Todos os lotes</option>
                                    <?php foreach ($lotes as $lote): ?>
                                        <option value="<?php echo $lote['id']; ?>" <?php echo $filter_lote == $lote['id'] ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($lote['nome']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <?php endif; ?>
                        </div>
                        <div class="filters-actions">
                            <button type="submit" class="btn-filter">🔍 Filtrar</button>
                            <a href="?eventoid=<?php echo $evento_id; ?>" class="btn-clear">🗑️ Limpar</a>
                        </div>
                    </form>
                </div>
                <!-- Estatísticas dos ingressos -->
                <div class="stats-grid">
                    <div class="stat-card stat-primary">
                        <div class="stat-icon">🎫</div>
                        <div class="stat-value"><?php echo number_format($stats['total_ingressos']); ?></div>
                        <div class="stat-label">Ingressos Emitidos</div>
                    </div>
                    
                    <div class="stat-card stat-success">
                        <div class="stat-icon">👤</div>
                        <div class="stat-value"><?php echo number_format($stats['ingressos_com_titular']); ?></div>
                        <div class="stat-label">Ingressos com Titular</div>
                    </div>
                    
                    <div class="stat-card stat-warning">
                        <div class="stat-icon">❓</div>
                        <div class="stat-value"><?php echo number_format($stats['ingressos_sem_titular']); ?></div>
                        <div class="stat-label">Ingressos sem Titular</div>
                    </div>
                    
                    <div class="stat-card stat-success">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value"><?php echo number_format($stats['ingressos_pagos']); ?></div>
                        <div class="stat-label">Ingressos Pagos</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🆓</div>
                        <div class="stat-value"><?php echo number_format($stats['ingressos_gratuitos']); ?></div>
                        <div class="stat-label">Ingressos Gratuitos</div>
                    </div>
                </div>

                <!-- Lista de Ingressos -->
                <div class="ingressos-section">
                    <div class="section-header">
                        <h3 class="section-title">📋 Lista de Ingressos (<?php echo number_format($total_count); ?> total)</h3>
                    </div>
                    
                    <?php if (empty($ingressos)): ?>
                        <div style="padding: 40px; text-align: center; color: #B8B8C8;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🎫</div>
                            <h3>Nenhum ingresso encontrado</h3>
                            <p>Não há ingressos que correspondam aos filtros aplicados.</p>
                        </div>
                    <?php else: ?>
                    <table class="ingressos-table">
                        <thead>
                            <tr>
                                <th onclick="sortTable('codigo_ingresso')" style="cursor: pointer;">
                                    Código do Ingresso 
                                    <?php if ($sort_column === 'codigo_ingresso'): ?>
                                        <?php echo $sort_direction === 'ASC' ? '↑' : '↓'; ?>
                                    <?php endif; ?>
                                </th>
                                <th onclick="sortTable('titulo_ingresso')" style="cursor: pointer;">
                                    Título do Ingresso
                                    <?php if ($sort_column === 'titulo_ingresso'): ?>
                                        <?php echo $sort_direction === 'ASC' ? '↑' : '↓'; ?>
                                    <?php endif; ?>
                                </th>
                                <th onclick="sortTable('comprador_nome')" style="cursor: pointer;">
                                    Comprador
                                    <?php if ($sort_column === 'comprador_nome'): ?>
                                        <?php echo $sort_direction === 'ASC' ? '↑' : '↓'; ?>
                                    <?php endif; ?>
                                </th>
                                <th onclick="sortTable('participante_nome')" style="cursor: pointer;">
                                    Participante
                                    <?php if ($sort_column === 'participante_nome'): ?>
                                        <?php echo $sort_direction === 'ASC' ? '↑' : '↓'; ?>
                                    <?php endif; ?>
                                </th>
                                <th onclick="sortTable('data_associacao')" style="cursor: pointer;">
                                    Data da Associação
                                    <?php if ($sort_column === 'data_associacao'): ?>
                                        <?php echo $sort_direction === 'ASC' ? '↑' : '↓'; ?>
                                    <?php endif; ?>
                                </th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>                            <?php foreach ($ingressos as $ingresso): ?>
                            <tr>
                                <td>
                                    <strong><?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></strong>
                                </td>
                                <td>
                                    <?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?>
                                    <?php if (!empty($ingresso['lote_nome'])): ?>
                                        <br><small style="color: #B8B8C8;">🏷️ <?php echo htmlspecialchars($ingresso['lote_nome']); ?></small>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div><?php echo htmlspecialchars($ingresso['comprador_nome']); ?></div>
                                    <small style="color: #B8B8C8;"><?php echo htmlspecialchars($ingresso['comprador_email']); ?></small>
                                    <?php if ($ingresso['preco_ingresso'] == 0): ?>
                                        <br><small style="color: #FFC107;">🆓 Gratuito</small>
                                    <?php else: ?>
                                        <br><small style="color: #00C851;">💰 R$ <?php echo number_format($ingresso['preco_ingresso'], 2, ',', '.'); ?></small>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($ingresso['participante_nome'])): ?>
                                        <div style="font-weight: bold; color: #FFFFFF;"><?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                                        <?php if (!empty($ingresso['participante_email'])): ?>
                                            <small style="color: #B8B8C8;">📧 <?php echo htmlspecialchars($ingresso['participante_email']); ?></small><br>
                                        <?php endif; ?>
                                        <?php if (!empty($ingresso['participante_cpf'])): ?>
                                            <small style="color: #B8B8C8;">🆔 <?php echo htmlspecialchars($ingresso['participante_cpf']); ?></small>
                                        <?php endif; ?>
                                    <?php else: ?>
                                        <span style="color: #888899;">❓ Não associado</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($ingresso['data_vinculacao'])): ?>
                                        <?php 
                                        $data_assoc = new DateTime($ingresso['data_vinculacao']);
                                        echo $data_assoc->format('d/m/Y H:i');
                                        ?>
                                    <?php else: ?>
                                        <span style="color: #888899;">—</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($ingresso['participanteid'])): ?>
                                        <button class="btn-email" onclick="enviarSegundaVia(<?php echo $ingresso['id']; ?>)">
                                            📧 Enviar 2ª Via
                                        </button>
                                    <?php else: ?>
                                        <button class="btn-email" disabled title="Ingresso sem participante associado">
                                            📧 2ª Via
                                        </button>
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    
                    <!-- Paginação -->
                    <?php if ($total_pages > 1): ?>
                    <div class="pagination">
                        <?php if ($page > 1): ?>
                            <a href="<?php echo buildUrl(['page' => $page - 1]); ?>">← Anterior</a>
                        <?php endif; ?>
                        
                        <?php
                        $start_page = max(1, $page - 2);
                        $end_page = min($total_pages, $page + 2);
                        
                        for ($i = $start_page; $i <= $end_page; $i++):
                        ?>
                            <?php if ($i == $page): ?>
                                <span class="current"><?php echo $i; ?></span>
                            <?php else: ?>
                                <a href="<?php echo buildUrl(['page' => $i]); ?>"><?php echo $i; ?></a>
                            <?php endif; ?>
                        <?php endfor; ?>
                        
                        <?php if ($page < $total_pages): ?>
                            <a href="<?php echo buildUrl(['page' => $page + 1]); ?>">Próxima →</a>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>
                    <?php endif; ?>
                </div>
            </div>
        </main>
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

        // Close dropdown when clicking outside
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

        // Função para ordenar tabela
        function sortTable(column) {
            const currentSort = '<?php echo $sort_column; ?>';
            const currentDir = '<?php echo $sort_direction; ?>';
            
            let newDir = 'ASC';
            if (column === currentSort && currentDir === 'ASC') {
                newDir = 'DESC';
            }
            
            const url = new URL(window.location);
            url.searchParams.set('sort', column);
            url.searchParams.set('dir', newDir);
            url.searchParams.set('page', '1'); // Reset para primeira página
            
            window.location.href = url.toString();
        }

        // Sistema de notificações
        function showNotification(type, title, message) {
            // Remove notificação existente se houver
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">${type === 'success' ? '✅' : '❌'}</div>
                    <div class="notification-text">
                        <div class="notification-title">${title}</div>
                        <div class="notification-message">${message}</div>
                    </div>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Mostrar notificação
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            // Auto remover após 5 segundos
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (document.body.contains(notification)) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }

        // Função para enviar segunda via do ingresso
        function enviarSegundaVia(ingressoId) {
            // Desabilitar botão temporariamente
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '⏳ Enviando...';
            
            fetch('ajax/enviar_segunda_via_ingresso.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingresso_id: ingressoId,
                    evento_id: <?php echo $evento_id; ?>
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('success', 'Email Enviado!', data.message);
                } else {
                    showNotification('error', 'Erro ao Enviar', data.message || 'Erro desconhecido');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showNotification('error', 'Erro de Conexão', 'Não foi possível enviar o email. Tente novamente.');
            })
            .finally(() => {
                // Reabilitar botão
                btn.disabled = false;
                btn.innerHTML = originalText;
            });
        }
    </script>
</body>
</html>