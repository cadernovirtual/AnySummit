<?php
include("check_login.php");
include("conm/conn.php");

// Verificar se evento_id foi passado
$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;

if (!$evento_id) {
    header("Location: meuseventos.php");
    exit;
}

// Processar requisições AJAX
if (isset($_POST['ajax_action'])) {
    header('Content-Type: application/json');
    
    $action = $_POST['ajax_action'];
    $usuario_id = $_COOKIE['usuarioid'] ?? 0;
    
    if (!$usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
        exit;
    }
    
    try {
        switch ($action) {
            case 'save_lote':
                handleSaveLote($_POST, $usuario_id);
                break;
            case 'delete_lote':
                handleDeleteLote($_POST, $usuario_id);
                break;
            case 'toggle_divulgar':
                handleToggleDivulgar($_POST, $usuario_id);
                break;
            case 'get_lote_data':
                handleGetLoteData($_POST, $usuario_id);
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Ação inválida']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    }
    exit;
}

// Buscar dados do evento
$sql_evento = "SELECT e.*, u.nome as produtor_nome 
               FROM eventos e 
               INNER JOIN usuarios u ON e.usuario_id = u.id 
               WHERE e.id = ? AND e.usuario_id = ?";
$stmt_evento = mysqli_prepare($con, $sql_evento);
mysqli_stmt_bind_param($stmt_evento, "ii", $evento_id, $_COOKIE['usuarioid']);
mysqli_stmt_execute($stmt_evento);
$result_evento = mysqli_stmt_get_result($stmt_evento);
$evento = mysqli_fetch_assoc($result_evento);

if (!$evento) {
    header("Location: meuseventos.php");
    exit;
}

// Buscar lotes existentes do evento
$sql_lotes = "SELECT l.*, 
                     (SELECT COUNT(*) FROM ingressos i WHERE i.lote_id = l.id) as total_ingressos
              FROM lotes l 
              WHERE l.evento_id = ? 
              ORDER BY l.data_inicio ASC";
$stmt_lotes = mysqli_prepare($con, $sql_lotes);
mysqli_stmt_bind_param($stmt_lotes, "i", $evento_id);
mysqli_stmt_execute($stmt_lotes);
$result_lotes = mysqli_stmt_get_result($stmt_lotes);
$lotes = mysqli_fetch_all($result_lotes, MYSQLI_ASSOC);

// Buscar dados do usuário para o header
$usuario_id = $_COOKIE['usuarioid'] ?? 0;
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

// Funções AJAX
function handleSaveLote($data, $usuario_id) {
    global $con;
    
    $evento_id = intval($data['evento_id'] ?? 0);
    $lote_id = intval($data['lote_id'] ?? 0);
    $nome = trim($data['nome'] ?? '');
    $data_inicio = $data['data_inicio'] ?? '';
    $data_fim = $data['data_fim'] ?? '';
    $divulgar_criterio = intval($data['divulgar_criterio'] ?? 0);
    
    // Validações
    if (!$evento_id || !$nome || !$data_inicio || !$data_fim) {
        echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos']);
        return;
    }
    
    // Verificar se o evento pertence ao usuário
    $sql_evento = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt_evento = mysqli_prepare($con, $sql_evento);
    mysqli_stmt_bind_param($stmt_evento, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt_evento);
    
    if (mysqli_stmt_get_result($stmt_evento)->num_rows == 0) {
        echo json_encode(['success' => false, 'message' => 'Evento não encontrado']);
        return;
    }
    
    // Validar datas
    $dt_inicio = new DateTime($data_inicio);
    $dt_fim = new DateTime($data_fim);
    
    if ($dt_fim <= $dt_inicio) {
        echo json_encode(['success' => false, 'message' => 'Data de fim deve ser posterior à data de início']);
        return;
    }
    
    // Verificar intersecções de datas com outros lotes
    $sql_intersecao = "SELECT id, nome FROM lotes 
                       WHERE evento_id = ? 
                         AND id != ? 
                         AND (
                           (data_inicio <= ? AND data_fim >= ?) OR
                           (data_inicio <= ? AND data_fim >= ?) OR
                           (data_inicio >= ? AND data_fim <= ?)
                         )";
    $stmt_intersecao = mysqli_prepare($con, $sql_intersecao);
    mysqli_stmt_bind_param($stmt_intersecao, "iissssss", 
        $evento_id, $lote_id,
        $data_inicio, $data_inicio,
        $data_fim, $data_fim,
        $data_inicio, $data_fim
    );
    mysqli_stmt_execute($stmt_intersecao);
    $result_intersecao = mysqli_stmt_get_result($stmt_intersecao);
    
    if (mysqli_num_rows($result_intersecao) > 0) {
        $lote_conflito = mysqli_fetch_assoc($result_intersecao);
        echo json_encode([
            'success' => false, 
            'message' => 'As datas informadas se sobrepõem com o lote "' . $lote_conflito['nome'] . '"'
        ]);
        return;
    }
    
    // Salvar ou atualizar lote
    if ($lote_id) {
        // Atualizar lote existente
        $sql = "UPDATE lotes SET 
                nome = ?, 
                data_inicio = ?, 
                data_fim = ?, 
                divulgar_criterio = ?,
                atualizado_em = NOW()
                WHERE id = ? AND evento_id = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "sssiii", $nome, $data_inicio, $data_fim, $divulgar_criterio, $lote_id, $evento_id);
    } else {
        // Criar novo lote
        $sql = "INSERT INTO lotes (evento_id, nome, data_inicio, data_fim, divulgar_criterio, criado_em, atualizado_em) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "isssi", $evento_id, $nome, $data_inicio, $data_fim, $divulgar_criterio);
    }
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Lote salvo com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar lote']);
    }
}

function handleDeleteLote($data, $usuario_id) {
    global $con;
    
    $lote_id = intval($data['lote_id'] ?? 0);
    
    if (!$lote_id) {
        echo json_encode(['success' => false, 'message' => 'ID do lote é obrigatório']);
        return;
    }
    
    // Verificar se o lote existe e pertence ao usuário
    $sql_verificar = "SELECT l.id, l.nome, e.usuario_id,
                             (SELECT COUNT(*) FROM ingressos i WHERE i.lote_id = l.id) as total_ingressos
                      FROM lotes l 
                      INNER JOIN eventos e ON l.evento_id = e.id 
                      WHERE l.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $lote_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $lote = mysqli_fetch_assoc($result_verificar);
    
    if (!$lote || $lote['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado ou acesso negado']);
        return;
    }
    
    // Verificar se há ingressos associados ao lote
    if ($lote['total_ingressos'] > 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Não é possível excluir lotes que possuem ingressos associados'
        ]);
        return;
    }
    
    // Excluir lote
    $sql_delete = "DELETE FROM lotes WHERE id = ?";
    $stmt_delete = mysqli_prepare($con, $sql_delete);
    mysqli_stmt_bind_param($stmt_delete, "i", $lote_id);
    
    if (mysqli_stmt_execute($stmt_delete)) {
        echo json_encode(['success' => true, 'message' => 'Lote excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir lote']);
    }
}

function handleToggleDivulgar($data, $usuario_id) {
    global $con;
    
    $lote_id = intval($data['lote_id'] ?? 0);
    $divulgar_criterio = intval($data['divulgar_criterio'] ?? 0);
    
    if (!$lote_id) {
        echo json_encode(['success' => false, 'message' => 'ID do lote é obrigatório']);
        return;
    }
    
    // Verificar se o lote existe e pertence ao usuário
    $sql_verificar = "SELECT l.id, e.usuario_id 
                      FROM lotes l 
                      INNER JOIN eventos e ON l.evento_id = e.id 
                      WHERE l.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $lote_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $lote = mysqli_fetch_assoc($result_verificar);
    
    if (!$lote || $lote['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado ou acesso negado']);
        return;
    }
    
    // Atualizar divulgar_criterio
    $sql_update = "UPDATE lotes SET divulgar_criterio = ?, atualizado_em = NOW() WHERE id = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt_update, "ii", $divulgar_criterio, $lote_id);
    
    if (mysqli_stmt_execute($stmt_update)) {
        echo json_encode(['success' => true, 'message' => 'Configuração atualizada com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar configuração']);
    }
}

function handleGetLoteData($data, $usuario_id) {
    global $con;
    
    $lote_id = intval($data['lote_id'] ?? 0);
    $evento_id = intval($data['evento_id'] ?? 0);
    
    if (!$lote_id) {
        echo json_encode(['success' => false, 'message' => 'ID do lote é obrigatório']);
        return;
    }
    
    // Buscar dados do lote
    $sql = "SELECT l.*, e.usuario_id 
            FROM lotes l 
            INNER JOIN eventos e ON l.evento_id = e.id 
            WHERE l.id = ? AND e.id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $lote = mysqli_fetch_assoc($result);
    
    if (!$lote || $lote['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado']);
        return;
    }
    
    // Verificar se é o primeiro lote (data_inicio mais antiga)
    $sql_primeiro = "SELECT MIN(data_inicio) as primeira_data FROM lotes WHERE evento_id = ?";
    $stmt_primeiro = mysqli_prepare($con, $sql_primeiro);
    mysqli_stmt_bind_param($stmt_primeiro, "i", $evento_id);
    mysqli_stmt_execute($stmt_primeiro);
    $result_primeiro = mysqli_stmt_get_result($stmt_primeiro);
    $primeira_data = mysqli_fetch_assoc($result_primeiro)['primeira_data'];
    
    $lote['eh_primeiro_lote'] = ($lote['data_inicio'] === $primeira_data);
    
    echo json_encode(['success' => true, 'data' => $lote]);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Lotes - <?php echo htmlspecialchars($evento['nome']); ?> - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .lotes-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            color: #B8B8C8;
        }

        .breadcrumb a {
            color: #00C2FF;
            text-decoration: none;
        }

        .breadcrumb a:hover {
            text-decoration: underline;
        }

        .page-title {
            color: #FFFFFF;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .page-subtitle {
            color: #B8B8C8;
            font-size: 16px;
        }

        .actions-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .info-section {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .novo-lote-btn {
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

        .novo-lote-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .lotes-table-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: visible;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lotes-table {
            width: 100%;
            border-collapse: collapse;
            overflow: visible;
        }

        .lotes-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lotes-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
            position: relative;
            overflow: visible;
        }

        .lotes-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .lotes-table tr:last-child td {
            border-bottom: none;
        }

        .switch-container {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
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
            background-color: #404058;
            transition: .4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }

        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-ativo {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
        }

        .status-futuro {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }

        .status-expirado {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
        }

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
            min-width: 180px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 999;
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

        /* Modal Styles */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            backdrop-filter: blur(4px);
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        }

        .modal-overlay.show {
            display: flex;
        }

        .modal-content {
            background: rgba(42, 42, 56, 0.95);
            border-radius: 20px;
            padding: 0;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow: hidden;
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
            padding: 24px 32px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 194, 255, 0.1);
        }

        .modal-title {
            font-size: 24px;
            font-weight: 700;
            color: #FFFFFF;
            margin: 0;
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

        .modal-body {
            padding: 32px;
            max-height: 60vh;
            overflow-y: auto;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            display: block;
            color: #E0E0E8;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #FFFFFF;
            font-size: 16px;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .form-input:focus {
            outline: none;
            border-color: #00C2FF;
            background: rgba(0, 194, 255, 0.1);
            box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.2);
        }

        .form-input:readonly {
            background: rgba(255, 255, 255, 0.02);
            border-color: rgba(255, 255, 255, 0.05);
            color: #888899;
            cursor: not-allowed;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .form-help {
            font-size: 12px;
            color: #B8B8C8;
            margin-top: 4px;
            line-height: 1.4;
        }

        .modal-actions {
            display: flex;
            gap: 16px;
            justify-content: flex-end;
            padding: 24px 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.02);
        }

        .btn {
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
            border: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
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
            .lotes-container {
                padding: 15px;
            }

            .actions-bar {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }

            .info-section {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
                text-align: center;
            }

            .lotes-table-container {
                overflow-x: auto;
            }

            .lotes-table {
                min-width: 800px;
            }

            .form-row {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .modal-actions {
                flex-direction: column;
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
            <div class="lotes-container">
                <div class="page-header">
                    <nav class="breadcrumb">
                        <a href="meuseventos.php">📋 Meus Eventos</a>
                        <span>›</span>
                        <span>🏷️ Lotes e Ingressos</span>
                    </nav>
                    <h1 class="page-title">Gestão de Lotes</h1>
                    <p class="page-subtitle">
                        Evento: <strong><?php echo htmlspecialchars($evento['nome']); ?></strong>
                    </p>
                </div>

                <div class="actions-bar">
                    <div class="info-section">
                        <a href="meuseventos.php" class="btn btn-secondary" style="margin-right: 20px;">
                            ← Voltar aos Eventos
                        </a>
                        <span style="color: #B8B8C8;">
                            Total de lotes: <strong style="color: #00C2FF;"><?php echo count($lotes); ?></strong>
                        </span>
                    </div>
                    <button onclick="abrirModalLote()" class="novo-lote-btn">
                        ➕ Novo Lote
                    </button>
                </div>

                <?php if (empty($lotes)): ?>
                    <div class="lotes-table-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">🏷️</div>
                            <h3>Nenhum lote criado</h3>
                            <p>Organize as vendas do seu evento criando lotes com diferentes preços e períodos de disponibilidade.</p>
                            <button onclick="abrirModalLote()" class="novo-lote-btn">
                                🚀 Criar Primeiro Lote
                            </button>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="lotes-table-container">
                        <table class="lotes-table">
                            <thead>
                                <tr>
                                    <th>Nome do Lote</th>
                                    <th>Período</th>
                                    <th>Status</th>
                                    <th>Ingressos</th>
                                    <th>Divulgar Critério</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($lotes as $lote): ?>
                                <?php
                                    $agora = new DateTime();
                                    $data_inicio = new DateTime($lote['data_inicio']);
                                    $data_fim = new DateTime($lote['data_fim']);
                                    
                                    if ($agora < $data_inicio) {
                                        $status = 'futuro';
                                        $status_texto = 'Futuro';
                                    } elseif ($agora > $data_fim) {
                                        $status = 'expirado';
                                        $status_texto = 'Expirado';
                                    } else {
                                        $status = 'ativo';
                                        $status_texto = 'Ativo';
                                    }
                                ?>
                                <tr>
                                    <td>
                                        <div style="font-weight: 600;">
                                            <?php echo htmlspecialchars($lote['nome']); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-size: 13px;">
                                            <strong>Início:</strong> <?php echo $data_inicio->format('d/m/Y H:i'); ?><br>
                                            <strong>Fim:</strong> <?php echo $data_fim->format('d/m/Y H:i'); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo $status; ?>">
                                            <?php echo $status_texto; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <span style="color: #00C2FF; font-weight: 600;">
                                            <?php echo $lote['total_ingressos']; ?> ingresso(s)
                                        </span>
                                    </td>
                                    <td>
                                        <div class="switch-container">
                                            <label class="switch">
                                                <input type="checkbox" 
                                                       <?php echo $lote['divulgar_criterio'] ? 'checked' : ''; ?>
                                                       onchange="toggleDivulgarCriterio(<?php echo $lote['id']; ?>, this.checked)">
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="actions-dropdown">
                                            <button class="actions-btn" onclick="toggleDropdown(this)">
                                                ⋮ Opções
                                            </button>
                                            <div class="dropdown-content">
                                                <div class="dropdown-item" onclick="editarLote(<?php echo $lote['id']; ?>)">
                                                    ✏️ Editar
                                                </div>
                                                <div class="dropdown-item" onclick="window.location.href='ingressos.php?lote_id=<?php echo $lote['id']; ?>&evento_id=<?php echo $evento_id; ?>'">
                                                    🎫 Ingressos
                                                </div>
                                                <?php if ($lote['total_ingressos'] == 0): ?>
                                                <div class="dropdown-item danger" onclick="excluirLote(<?php echo $lote['id']; ?>)">
                                                    🗑️ Excluir
                                                </div>
                                                <?php else: ?>
                                                <div class="dropdown-item" style="color: #888899; cursor: not-allowed;" 
                                                     title="Não é possível excluir lotes com ingressos associados">
                                                    🚫 Não excluível
                                                </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <!-- Modal para Criar/Editar Lote -->
    <div class="modal-overlay" id="modalLote">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitulo">Novo Lote</h2>
                <button class="modal-close" onclick="fecharModalLote()">×</button>
            </div>
            <div class="modal-body">
                <form id="formLote">
                    <input type="hidden" name="evento_id" value="<?php echo $evento_id; ?>">
                    <input type="hidden" name="lote_id" value="" id="inputLoteId">
                    <input type="hidden" name="ajax_action" value="save_lote">

                    <div class="form-group">
                        <label class="form-label" for="inputNome">Nome do Lote *</label>
                        <input type="text" 
                               id="inputNome" 
                               name="nome" 
                               class="form-input" 
                               placeholder="Ex: Primeiro Lote, Promoção Natal, etc."
                               required>
                        <div class="form-help">
                            Escolha um nome descritivo para identificar este lote
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="inputDataInicio">Data e Hora de Início *</label>
                            <input type="datetime-local" 
                                   id="inputDataInicio" 
                                   name="data_inicio" 
                                   class="form-input" 
                                   required>
                            <div class="form-help" id="helpDataInicio">
                                Data e hora em que este lote estará disponível
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputDataFim">Data e Hora de Fim *</label>
                            <input type="datetime-local" 
                                   id="inputDataFim" 
                                   name="data_fim" 
                                   class="form-input" 
                                   required>
                            <div class="form-help">
                                Data e hora em que este lote expirará
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 12px; padding: 16px 0;">
                            <label class="switch">
                                <input type="checkbox" 
                                       id="inputDivulgarCriterio" 
                                       name="divulgar_criterio" 
                                       value="1">
                                <span class="slider"></span>
                            </label>
                            <label for="inputDivulgarCriterio" class="form-label" style="margin: 0; cursor: pointer;">
                                Divulgar datas de virada de lote para os compradores
                            </label>
                        </div>
                        <div class="form-help">
                            Quando ativado, os compradores verão quando este lote termina e o próximo inicia
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="fecharModalLote()">
                    Cancelar
                </button>
                <button type="button" class="btn btn-primary" onclick="salvarLote()">
                    💾 Salvar Lote
                </button>
            </div>
        </div>
    </div>

    <script>
        // Variáveis globais
        const EVENTO_ID = <?php echo $evento_id; ?>;
        const LOTES_EXISTENTES = <?php echo json_encode($lotes); ?>;
        
        // Toggle dropdown
        function toggleDropdown(button) {
            const dropdown = button.nextElementSibling;
            
            // Fechar todos os outros dropdowns
            document.querySelectorAll('.dropdown-content').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('show');
                }
            });
            
            dropdown.classList.toggle('show');
        }

        // Fechar dropdown ao clicar fora
        window.addEventListener('click', function(event) {
            if (!event.target.matches('.actions-btn')) {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Abrir modal para novo lote
        function abrirModalLote() {
            const modal = document.getElementById('modalLote');
            const titulo = document.getElementById('modalTitulo');
            const form = document.getElementById('formLote');
            
            // Limpar formulário
            form.reset();
            document.getElementById('inputLoteId').value = '';
            titulo.textContent = 'Novo Lote';
            
            // Configurar datas para primeiro lote
            if (LOTES_EXISTENTES.length === 0) {
                // Primeiro lote - data atual + 7 dias
                const agora = new Date();
                const daqui7Dias = new Date();
                daqui7Dias.setDate(daqui7Dias.getDate() + 7);
                
                document.getElementById('inputDataInicio').value = formatarDataTimeLocal(agora);
                document.getElementById('inputDataFim').value = formatarDataTimeLocal(daqui7Dias);
                document.getElementById('inputDataInicio').readOnly = false;
                document.getElementById('helpDataInicio').textContent = 'Data e hora em que este lote estará disponível';
            } else {
                // Lotes subsequentes - calcular próxima data
                const ultimaDataFim = getUltimaDataFim();
                const proximaDataInicio = new Date(ultimaDataFim.getTime() + 60000); // +1 minuto
                
                document.getElementById('inputDataInicio').value = formatarDataTimeLocal(proximaDataInicio);
                document.getElementById('inputDataInicio').readOnly = true;
                document.getElementById('helpDataInicio').textContent = 'Data calculada automaticamente (1 minuto após o lote anterior)';
                
                // Limpar data fim para forçar preenchimento
                document.getElementById('inputDataFim').value = '';
            }
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        // Editar lote
        function editarLote(loteId) {
            const modal = document.getElementById('modalLote');
            const titulo = document.getElementById('modalTitulo');
            
            titulo.textContent = 'Editar Lote';
            
            // Buscar dados do lote via AJAX
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=get_lote_data&lote_id=${loteId}&evento_id=${EVENTO_ID}`
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const lote = result.data;
                    
                    // Preencher formulário
                    document.getElementById('inputLoteId').value = lote.id;
                    document.getElementById('inputNome').value = lote.nome;
                    document.getElementById('inputDataInicio').value = formatarDataTimeLocal(new Date(lote.data_inicio));
                    document.getElementById('inputDataFim').value = formatarDataTimeLocal(new Date(lote.data_fim));
                    document.getElementById('inputDivulgarCriterio').checked = lote.divulgar_criterio == 1;
                    
                    // Configurar readonly baseado se é primeiro lote
                    if (lote.eh_primeiro_lote) {
                        document.getElementById('inputDataInicio').readOnly = false;
                        document.getElementById('helpDataInicio').textContent = 'Data e hora em que este lote estará disponível';
                    } else {
                        document.getElementById('inputDataInicio').readOnly = true;
                        document.getElementById('helpDataInicio').textContent = 'Data calculada automaticamente (não editável)';
                    }
                    
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                } else {
                    alert('Erro ao carregar dados do lote: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Fechar modal
        function fecharModalLote() {
            const modal = document.getElementById('modalLote');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }

        // Salvar lote
        function salvarLote() {
            const form = document.getElementById('formLote');
            const formData = new FormData(form);
            
            // Validar datas
            const dataInicio = new Date(formData.get('data_inicio'));
            const dataFim = new Date(formData.get('data_fim'));
            
            if (dataFim <= dataInicio) {
                alert('A data de fim deve ser posterior à data de início');
                return;
            }
            
            // Ajustar checkbox
            if (!document.getElementById('inputDivulgarCriterio').checked) {
                formData.set('divulgar_criterio', '0');
            }
            
            // Enviar dados
            fetch('', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    location.reload();
                } else {
                    alert('Erro ao salvar lote: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Excluir lote
        function excluirLote(loteId) {
            if (confirm('Tem certeza que deseja excluir este lote?')) {
                fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `ajax_action=delete_lote&lote_id=${loteId}`
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        location.reload();
                    } else {
                        alert('Erro ao excluir lote: ' + result.message);
                    }
                })
                .catch(error => {
                    alert('Erro de comunicação: ' + error);
                });
            }
        }

        // Toggle divulgar critério
        function toggleDivulgarCriterio(loteId, checked) {
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=toggle_divulgar&lote_id=${loteId}&divulgar_criterio=${checked ? 1 : 0}`
            })
            .then(response => response.json())
            .then(result => {
                if (!result.success) {
                    alert('Erro ao atualizar configuração: ' + result.message);
                    // Reverter o switch em caso de erro
                    event.target.checked = !checked;
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
                // Reverter o switch em caso de erro
                event.target.checked = !checked;
            });
        }

        // Funções auxiliares
        function formatarDataTimeLocal(date) {
            const ano = date.getFullYear();
            const mes = String(date.getMonth() + 1).padStart(2, '0');
            const dia = String(date.getDate()).padStart(2, '0');
            const hora = String(date.getHours()).padStart(2, '0');
            const minuto = String(date.getMinutes()).padStart(2, '0');
            
            return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
        }

        function getUltimaDataFim() {
            let ultimaData = new Date();
            
            LOTES_EXISTENTES.forEach(lote => {
                const dataFim = new Date(lote.data_fim);
                if (dataFim > ultimaData) {
                    ultimaData = dataFim;
                }
            });
            
            return ultimaData;
        }

        // Fechar modal ao clicar no overlay
        document.getElementById('modalLote').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalLote();
            }
        });

        // Fechar modal ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                fecharModalLote();
            }
        });

        // Funções do header e menu (copiadas do arquivo original)
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

        // Mouse interaction with particles
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
    </script>
</body>
</html>
