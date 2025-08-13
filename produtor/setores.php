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
            case 'save_setor':
                handleSaveSetor($_POST, $usuario_id);
                break;
            case 'delete_setor':
                handleDeleteSetor($_POST, $usuario_id);
                break;
            case 'get_setor_data':
                handleGetSetorData($_POST, $usuario_id);
                break;
            case 'get_setor_info':
                handleGetSetorInfo($_POST, $usuario_id);
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

// Buscar setores existentes do evento
$sql_setores = "SELECT s.*, 
                      (SELECT COUNT(*) FROM ingressos i 
                       WHERE JSON_EXTRACT(i.setores, CONCAT('$[*].setor_id')) LIKE CONCAT('%', s.setor_id, '%') 
                       AND i.evento_id = s.evento_id) as total_ingressos_vinculados
               FROM setores s 
               WHERE s.evento_id = ? 
               ORDER BY s.nome ASC";
$stmt_setores = mysqli_prepare($con, $sql_setores);
mysqli_stmt_bind_param($stmt_setores, "i", $evento_id);
mysqli_stmt_execute($stmt_setores);
$result_setores = mysqli_stmt_get_result($stmt_setores);
$setores = mysqli_fetch_all($result_setores, MYSQLI_ASSOC);

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
function handleSaveSetor($data, $usuario_id) {
    global $con;
    
    $evento_id = intval($data['evento_id'] ?? 0);
    $setor_id = intval($data['setor_id'] ?? 0);
    $nome = trim($data['nome'] ?? '');
    
    // Validações
    if (!$evento_id || !$nome) {
        echo json_encode(['success' => false, 'message' => 'Nome do setor é obrigatório']);
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
    
    // Verificar se já existe setor com o mesmo nome
    $sql_nome_duplicado = "SELECT setor_id FROM setores 
                           WHERE evento_id = ? AND nome = ? AND setor_id != ?";
    $stmt_nome_duplicado = mysqli_prepare($con, $sql_nome_duplicado);
    mysqli_stmt_bind_param($stmt_nome_duplicado, "isi", $evento_id, $nome, $setor_id);
    mysqli_stmt_execute($stmt_nome_duplicado);
    
    if (mysqli_stmt_get_result($stmt_nome_duplicado)->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Já existe um setor com este nome']);
        return;
    }
    
    // Salvar ou atualizar setor
    if ($setor_id) {
        // Atualizar setor existente
        $sql = "UPDATE setores SET nome = ? WHERE setor_id = ? AND evento_id = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "sii", $nome, $setor_id, $evento_id);
    } else {
        // Criar novo setor
        $sql = "INSERT INTO setores (evento_id, nome) VALUES (?, ?)";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "is", $evento_id, $nome);
    }
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Setor salvo com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar setor']);
    }
}

function handleDeleteSetor($data, $usuario_id) {
    global $con;
    
    $setor_id = intval($data['setor_id'] ?? 0);
    
    if (!$setor_id) {
        echo json_encode(['success' => false, 'message' => 'ID do setor é obrigatório']);
        return;
    }
    
    // Verificar se o setor existe e pertence ao usuário
    $sql_verificar = "SELECT s.setor_id, s.nome, e.usuario_id
                      FROM setores s 
                      INNER JOIN eventos e ON s.evento_id = e.id 
                      WHERE s.setor_id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $setor_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $setor = mysqli_fetch_assoc($result_verificar);
    
    if (!$setor || $setor['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Setor não encontrado ou acesso negado']);
        return;
    }
    
    // Verificar se há ingressos associados ao setor (busca no JSON)
    $sql_ingressos = "SELECT COUNT(*) as total
                      FROM ingressos 
                      WHERE JSON_EXTRACT(setores, CONCAT('$[*].setor_id')) LIKE CONCAT('%', ?, '%')
                      AND evento_id = (SELECT evento_id FROM setores WHERE setor_id = ?)";
    $stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
    mysqli_stmt_bind_param($stmt_ingressos, "ii", $setor_id, $setor_id);
    mysqli_stmt_execute($stmt_ingressos);
    $result_ingressos = mysqli_stmt_get_result($stmt_ingressos);
    $total_ingressos = mysqli_fetch_assoc($result_ingressos)['total'];
    
    if ($total_ingressos > 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Não é possível excluir setores que possuem ingressos associados'
        ]);
        return;
    }
    
    // Excluir setor
    $sql_delete = "DELETE FROM setores WHERE setor_id = ?";
    $stmt_delete = mysqli_prepare($con, $sql_delete);
    mysqli_stmt_bind_param($stmt_delete, "i", $setor_id);
    
    if (mysqli_stmt_execute($stmt_delete)) {
        echo json_encode(['success' => true, 'message' => 'Setor excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir setor']);
    }
}

function handleGetSetorData($data, $usuario_id) {
    global $con;
    
    $setor_id = intval($data['setor_id'] ?? 0);
    $evento_id = intval($data['evento_id'] ?? 0);
    
    if (!$setor_id) {
        echo json_encode(['success' => false, 'message' => 'ID do setor é obrigatório']);
        return;
    }
    
    // Buscar dados do setor
    $sql = "SELECT s.*, e.usuario_id 
            FROM setores s 
            INNER JOIN eventos e ON s.evento_id = e.id 
            WHERE s.setor_id = ? AND e.id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $setor_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $setor = mysqli_fetch_assoc($result);
    
    if (!$setor || $setor['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Setor não encontrado']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $setor]);
}

function handleGetSetorInfo($data, $usuario_id) {
    global $con;
    
    $setor_id = intval($data['setor_id'] ?? 0);
    
    if (!$setor_id) {
        echo json_encode(['success' => false, 'message' => 'ID do setor é obrigatório']);
        return;
    }
    
    // Buscar informações do setor
    $sql_setor = "SELECT s.*, e.usuario_id, e.nome as evento_nome
                  FROM setores s 
                  INNER JOIN eventos e ON s.evento_id = e.id 
                  WHERE s.setor_id = ?";
    $stmt_setor = mysqli_prepare($con, $sql_setor);
    mysqli_stmt_bind_param($stmt_setor, "i", $setor_id);
    mysqli_stmt_execute($stmt_setor);
    $result_setor = mysqli_stmt_get_result($stmt_setor);
    $setor = mysqli_fetch_assoc($result_setor);
    
    if (!$setor || $setor['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Setor não encontrado']);
        return;
    }
    
    // Buscar ingressos associados ao setor
    $sql_ingressos = "SELECT i.id, i.titulo, i.tipo, i.preco, i.quantidade_total, i.ativo
                      FROM ingressos i 
                      WHERE JSON_EXTRACT(i.setores, CONCAT('$[*].setor_id')) LIKE CONCAT('%', ?, '%')
                      AND i.evento_id = ?
                      ORDER BY i.titulo";
    $stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
    mysqli_stmt_bind_param($stmt_ingressos, "ii", $setor_id, $setor['evento_id']);
    mysqli_stmt_execute($stmt_ingressos);
    $result_ingressos = mysqli_stmt_get_result($stmt_ingressos);
    $ingressos = mysqli_fetch_all($result_ingressos, MYSQLI_ASSOC);
    
    // Buscar quantidade de ingressos vendidos para cada tipo de ingresso
    foreach ($ingressos as &$ingresso) {
        $sql_vendidos = "SELECT COUNT(*) as vendidos
                         FROM tb_ingressos_individuais 
                         WHERE ingresso_id = ? AND status = 'ativo'";
        $stmt_vendidos = mysqli_prepare($con, $sql_vendidos);
        mysqli_stmt_bind_param($stmt_vendidos, "i", $ingresso['id']);
        mysqli_stmt_execute($stmt_vendidos);
        $result_vendidos = mysqli_stmt_get_result($stmt_vendidos);
        $ingresso['vendidos'] = mysqli_fetch_assoc($result_vendidos)['vendidos'];
    }
    
    // Contar total de ingressos vendidos para o setor
    $total_vendidos = 0;
    foreach ($ingressos as $ingresso) {
        $total_vendidos += $ingresso['vendidos'];
    }
    
    echo json_encode([
        'success' => true, 
        'data' => [
            'setor' => $setor,
            'ingressos' => $ingressos,
            'total_vendidos' => $total_vendidos
        ]
    ]);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Setores - <?php echo htmlspecialchars($evento['nome']); ?> - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .setores-container {
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

        .novo-setor-btn {
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

        .novo-setor-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .setores-table-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: visible;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .setores-table {
            width: 100%;
            border-collapse: collapse;
            overflow: visible;
        }

        .setores-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .setores-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
            position: relative;
            overflow: visible;
        }

        .setores-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .setores-table tr:last-child td {
            border-bottom: none;
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

        .info-link {
            color: #00C2FF;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .info-link:hover {
            text-decoration: underline;
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

        .modal-content.large {
            max-width: 800px;
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

        /* Info Modal Styles */
        .info-section {
            margin-bottom: 24px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-title {
            color: #00C2FF;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .info-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .info-list li:last-child {
            border-bottom: none;
        }

        .ingresso-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ingresso-info {
            flex-grow: 1;
        }

        .ingresso-nome {
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        .ingresso-detalhes {
            font-size: 12px;
            color: #B8B8C8;
        }

        .ingresso-stats {
            text-align: right;
            font-size: 14px;
        }

        .stat-vendidos {
            color: #00C851;
            font-weight: 600;
        }

        .stat-total {
            color: #B8B8C8;
        }

        .tipo-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .tipo-pago {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
        }

        .tipo-gratuito {
            background: rgba(0, 194, 255, 0.2);
            color: #00C2FF;
        }

        .tipo-combo {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }

        .no-ingressos {
            text-align: center;
            color: #B8B8C8;
            font-style: italic;
            padding: 20px;
        }

        @media (max-width: 768px) {
            .setores-container {
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

            .setores-table-container {
                overflow-x: auto;
            }

            .setores-table {
                min-width: 600px;
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
            <div class="setores-container">
                <div class="page-header">
                    <nav class="breadcrumb">
                        <a href="meuseventos.php">📋 Meus Eventos</a>
                        <span>›</span>
                        <span>🏢 Setores</span>
                    </nav>
                    <h1 class="page-title">Gestão de Setores</h1>
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
                            Total de setores: <strong style="color: #00C2FF;"><?php echo count($setores); ?></strong>
                        </span>
                    </div>
                    <button onclick="abrirModalSetor()" class="novo-setor-btn">
                        ➕ Novo Setor
                    </button>
                </div>

                <?php if (empty($setores)): ?>
                    <div class="setores-table-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">🏢</div>
                            <h3>Nenhum setor criado</h3>
                            <p>Organize seu evento criando setores para classificar e gerenciar seus ingressos.</p>
                            <button onclick="abrirModalSetor()" class="novo-setor-btn">
                                🚀 Criar Primeiro Setor
                            </button>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="setores-table-container">
                        <table class="setores-table">
                            <thead>
                                <tr>
                                    <th>Nome do Setor</th>
                                    <th>Ingressos Vinculados</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($setores as $setor): ?>
                                <tr>
                                    <td>
                                        <div style="font-weight: 600;">
                                            <?php echo htmlspecialchars($setor['nome']); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <?php if ($setor['total_ingressos_vinculados'] > 0): ?>
                                            <a href="#" onclick="verInfoSetor(<?php echo $setor['setor_id']; ?>)" class="info-link">
                                                📊 <?php echo $setor['total_ingressos_vinculados']; ?> ingresso(s)
                                            </a>
                                        <?php else: ?>
                                            <span style="color: #888899;">Nenhum ingresso</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <div class="actions-dropdown">
                                            <button class="actions-btn" onclick="toggleDropdown(this)">
                                                ⋮ Opções
                                            </button>
                                            <div class="dropdown-content">
                                                <div class="dropdown-item" onclick="editarSetor(<?php echo $setor['setor_id']; ?>)">
                                                    ✏️ Editar
                                                </div>
                                                <?php if ($setor['total_ingressos_vinculados'] > 0): ?>
                                                    <div class="dropdown-item" onclick="verInfoSetor(<?php echo $setor['setor_id']; ?>)">
                                                        📊 Ver Informações
                                                    </div>
                                                <?php endif; ?>
                                                <?php if ($setor['total_ingressos_vinculados'] == 0): ?>
                                                <div class="dropdown-item danger" onclick="excluirSetor(<?php echo $setor['setor_id']; ?>)">
                                                    🗑️ Excluir
                                                </div>
                                                <?php else: ?>
                                                <div class="dropdown-item" style="color: #888899; cursor: not-allowed;" 
                                                     title="Não é possível excluir setores com ingressos associados">
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

    <!-- Modal para Criar/Editar Setor -->
    <div class="modal-overlay" id="modalSetor">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitulo">Novo Setor</h2>
                <button class="modal-close" onclick="fecharModalSetor()">×</button>
            </div>
            <div class="modal-body">
                <form id="formSetor">
                    <input type="hidden" name="evento_id" value="<?php echo $evento_id; ?>">
                    <input type="hidden" name="setor_id" value="" id="inputSetorId">
                    <input type="hidden" name="ajax_action" value="save_setor">

                    <div class="form-group">
                        <label class="form-label" for="inputNome">Nome do Setor *</label>
                        <input type="text" 
                               id="inputNome" 
                               name="nome" 
                               class="form-input" 
                               placeholder="Ex: Pista, Camarote, Arquibancada, etc."
                               required>
                        <div class="form-help">
                            Escolha um nome descritivo para identificar este setor
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="fecharModalSetor()">
                    Cancelar
                </button>
                <button type="button" class="btn btn-primary" onclick="salvarSetor()">
                    💾 Salvar Setor
                </button>
            </div>
        </div>
    </div>

    <!-- Modal de Informações do Setor -->
    <div class="modal-overlay" id="modalInfoSetor">
        <div class="modal-content large">
            <div class="modal-header">
                <h2 class="modal-title" id="modalInfoTitulo">Informações do Setor</h2>
                <button class="modal-close" onclick="fecharModalInfoSetor()">×</button>
            </div>
            <div class="modal-body" id="modalInfoBody">
                <!-- Conteúdo será carregado via AJAX -->
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="fecharModalInfoSetor()">
                    Fechar
                </button>
            </div>
        </div>
    </div>

    <script>
        // Variáveis globais
        const EVENTO_ID = <?php echo $evento_id; ?>;
        
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

        // Abrir modal para novo setor
        function abrirModalSetor() {
            const modal = document.getElementById('modalSetor');
            const titulo = document.getElementById('modalTitulo');
            const form = document.getElementById('formSetor');
            
            // Limpar formulário
            form.reset();
            document.getElementById('inputSetorId').value = '';
            titulo.textContent = 'Novo Setor';
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        // Editar setor
        function editarSetor(setorId) {
            const modal = document.getElementById('modalSetor');
            const titulo = document.getElementById('modalTitulo');
            
            titulo.textContent = 'Editar Setor';
            
            // Buscar dados do setor via AJAX
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=get_setor_data&setor_id=${setorId}&evento_id=${EVENTO_ID}`
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const setor = result.data;
                    
                    // Preencher formulário
                    document.getElementById('inputSetorId').value = setor.setor_id;
                    document.getElementById('inputNome').value = setor.nome;
                    
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                } else {
                    alert('Erro ao carregar dados do setor: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Fechar modal
        function fecharModalSetor() {
            const modal = document.getElementById('modalSetor');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }

        // Salvar setor
        function salvarSetor() {
            const form = document.getElementById('formSetor');
            const formData = new FormData(form);
            
            // Validar nome
            const nome = formData.get('nome').trim();
            if (!nome) {
                alert('Nome do setor é obrigatório');
                return;
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
                    alert('Erro ao salvar setor: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Excluir setor
        function excluirSetor(setorId) {
            if (confirm('Tem certeza que deseja excluir este setor?')) {
                fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `ajax_action=delete_setor&setor_id=${setorId}`
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        location.reload();
                    } else {
                        alert('Erro ao excluir setor: ' + result.message);
                    }
                })
                .catch(error => {
                    alert('Erro de comunicação: ' + error);
                });
            }
        }

        // Ver informações do setor
        function verInfoSetor(setorId) {
            const modal = document.getElementById('modalInfoSetor');
            const titulo = document.getElementById('modalInfoTitulo');
            const body = document.getElementById('modalInfoBody');
            
            titulo.textContent = 'Carregando...';
            body.innerHTML = '<div style="text-align: center; padding: 40px;"><span style="color: #B8B8C8;">Carregando informações...</span></div>';
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Buscar informações via AJAX
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=get_setor_info&setor_id=${setorId}`
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const data = result.data;
                    titulo.textContent = `Setor: ${data.setor.nome}`;
                    
                    let html = '';
                    
                    // Seção de resumo
                    html += `
                        <div class="info-section">
                            <div class="info-title">📊 Resumo</div>
                            <ul class="info-list">
                                <li>
                                    <span>Total de tipos de ingressos:</span>
                                    <strong style="color: #00C2FF;">${data.ingressos.length}</strong>
                                </li>
                                <li>
                                    <span>Total de ingressos vendidos:</span>
                                    <strong style="color: #00C851;">${data.total_vendidos}</strong>
                                </li>
                            </ul>
                        </div>
                    `;
                    
                    // Seção de ingressos
                    html += `
                        <div class="info-section">
                            <div class="info-title">🎫 Ingressos Associados</div>
                    `;
                    
                    if (data.ingressos.length > 0) {
                        data.ingressos.forEach(ingresso => {
                            const tipoClass = `tipo-${ingresso.tipo}`;
                            const precoFormatado = ingresso.tipo === 'gratuito' ? 'GRATUITO' : 
                                                 `R$ ${parseFloat(ingresso.preco).toFixed(2).replace('.', ',')}`;
                            const statusAtivo = ingresso.ativo == 1 ? '✅ Ativo' : '❌ Inativo';
                            
                            html += `
                                <div class="ingresso-item">
                                    <div class="ingresso-info">
                                        <div class="ingresso-nome">${ingresso.titulo}</div>
                                        <div class="ingresso-detalhes">
                                            <span class="tipo-badge ${tipoClass}">${ingresso.tipo.toUpperCase()}</span>
                                            ${precoFormatado} • ${statusAtivo}
                                        </div>
                                    </div>
                                    <div class="ingresso-stats">
                                        <div class="stat-vendidos">${ingresso.vendidos} vendidos</div>
                                        <div class="stat-total">de ${ingresso.quantidade_total} total</div>
                                    </div>
                                </div>
                            `;
                        });
                    } else {
                        html += '<div class="no-ingressos">Nenhum ingresso associado a este setor</div>';
                    }
                    
                    html += '</div>';
                    
                    body.innerHTML = html;
                } else {
                    titulo.textContent = 'Erro';
                    body.innerHTML = `<div style="text-align: center; padding: 40px; color: #FF5252;">${result.message}</div>`;
                }
            })
            .catch(error => {
                titulo.textContent = 'Erro';
                body.innerHTML = `<div style="text-align: center; padding: 40px; color: #FF5252;">Erro de comunicação: ${error}</div>`;
            });
        }

        // Fechar modal de informações
        function fecharModalInfoSetor() {
            const modal = document.getElementById('modalInfoSetor');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }

        // Fechar modal ao clicar no overlay
        document.getElementById('modalSetor').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalSetor();
            }
        });

        document.getElementById('modalInfoSetor').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalInfoSetor();
            }
        });

        // Fechar modal ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                fecharModalSetor();
                fecharModalInfoSetor();
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
