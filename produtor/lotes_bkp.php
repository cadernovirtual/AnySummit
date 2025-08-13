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