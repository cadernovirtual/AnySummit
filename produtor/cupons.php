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
            case 'save_cupom':
                handleSaveCupom($_POST, $usuario_id);
                break;
            case 'delete_cupom':
                handleDeleteCupom($_POST, $usuario_id);
                break;
            case 'toggle_ativo':
                handleToggleAtivo($_POST, $usuario_id);
                break;
            case 'toggle_uso_multiplo':
                handleToggleUsoMultiplo($_POST, $usuario_id);
                break;
            case 'get_cupom_data':
                handleGetCupomData($_POST, $usuario_id);
                break;
            case 'get_aplicacoes':
                handleGetAplicacoes($_POST, $usuario_id);
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

// Buscar cupons existentes do evento
$sql_cupons = "SELECT c.*, 
                      (SELECT COUNT(*) FROM tb_pedidos p WHERE p.cupom_id = c.id) as total_aplicacoes
               FROM cupons c 
               WHERE c.evento_id = ? 
               ORDER BY c.criado_em DESC";
$stmt_cupons = mysqli_prepare($con, $sql_cupons);
mysqli_stmt_bind_param($stmt_cupons, "i", $evento_id);
mysqli_stmt_execute($stmt_cupons);
$result_cupons = mysqli_stmt_get_result($stmt_cupons);
$cupons = mysqli_fetch_all($result_cupons, MYSQLI_ASSOC);

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

// Função para normalizar código do cupom
function normalizarCodigo($codigo) {
    // Converter para maiúscula
    $codigo = strtoupper($codigo);
    // Substituir espaços por underline
    $codigo = str_replace(' ', '_', $codigo);
    // Remover acentos e caracteres especiais
    $codigo = iconv('UTF-8', 'ASCII//TRANSLIT', $codigo);
    // Remover caracteres que não sejam letras, números ou underscore
    $codigo = preg_replace('/[^A-Z0-9_]/', '', $codigo);
    return $codigo;
}

// Funções AJAX
function handleSaveCupom($data, $usuario_id) {
    global $con, $evento_id;
    
    // Log para debug
    error_log("handleSaveCupom - Data recebida: " . print_r($data, true));
    
    $cupom_id = intval($data['cupom_id'] ?? 0);
    $codigo = trim($data['codigo'] ?? '');
    $tipo_desconto = $data['tipo_desconto'] ?? 'percentual';
    $percentual_desconto = floatval($data['percentual_desconto'] ?? 0);
    $valor_desconto = floatval($data['valor_desconto'] ?? 0);
    $data_inicio = $data['data_inicio'] ?? '';
    $data_fim = $data['data_fim'] ?? '';
    $limite_uso = !empty($data['limite_uso']) && intval($data['limite_uso']) > 0 ? intval($data['limite_uso']) : 0;
    $uso_multiplo = intval($data['uso_multiplo'] ?? 1);
    
    // Validações
    if (!$codigo || !$data_inicio || !$data_fim) {
        echo json_encode(['success' => false, 'message' => 'Código, data de início e data de fim são obrigatórios']);
        return;
    }
    
    // Normalizar código
    $codigo_normalizado = normalizarCodigo($codigo);
    
    if (!$codigo_normalizado) {
        echo json_encode(['success' => false, 'message' => 'Código inválido após normalização']);
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
    
    // Verificar se código já existe no evento (exceto para o próprio cupom se editando)
    $sql_codigo = "SELECT id FROM cupons WHERE evento_id = ? AND codigo = ? AND id != ?";
    $stmt_codigo = mysqli_prepare($con, $sql_codigo);
    mysqli_stmt_bind_param($stmt_codigo, "isi", $evento_id, $codigo_normalizado, $cupom_id);
    mysqli_stmt_execute($stmt_codigo);
    
    if (mysqli_stmt_get_result($stmt_codigo)->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Já existe um cupom com este código neste evento']);
        return;
    }
    
    // Validar valores de desconto
    if ($tipo_desconto === 'percentual') {
        if ($percentual_desconto <= 0 || $percentual_desconto > 100) {
            echo json_encode(['success' => false, 'message' => 'Percentual de desconto deve estar entre 1% e 100%']);
            return;
        }
        $valor_desconto = 0.00; // Usar 0.00 para o valor_desconto
    } else {
        if ($valor_desconto <= 0) {
            echo json_encode(['success' => false, 'message' => 'Valor de desconto deve ser maior que zero']);
            return;
        }
        $percentual_desconto = 0.00; // Usar 0.00 para o percentual_desconto
    }
    
    // Salvar ou atualizar cupom
    if ($cupom_id) {
        // Atualizar cupom existente
        if ($limite_uso == 0) {
            $sql = "UPDATE cupons SET 
                    codigo = ?, 
                    tipo_desconto = ?, 
                    percentual_desconto = ?,
                    valor_desconto = ?,
                    data_inicio = ?, 
                    data_fim = ?, 
                    limite_uso = NULL,
                    uso_multiplo = ?
                    WHERE id = ? AND evento_id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ssddssiii", 
                $codigo_normalizado, $tipo_desconto, $percentual_desconto, $valor_desconto,
                $data_inicio, $data_fim, $uso_multiplo, $cupom_id, $evento_id);
        } else {
            $sql = "UPDATE cupons SET 
                    codigo = ?, 
                    tipo_desconto = ?, 
                    percentual_desconto = ?,
                    valor_desconto = ?,
                    data_inicio = ?, 
                    data_fim = ?, 
                    limite_uso = ?,
                    uso_multiplo = ?
                    WHERE id = ? AND evento_id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ssddssiiii", 
                $codigo_normalizado, $tipo_desconto, $percentual_desconto, $valor_desconto,
                $data_inicio, $data_fim, $limite_uso, $uso_multiplo, $cupom_id, $evento_id);
        }
        error_log("UPDATE - Params: codigo=$codigo_normalizado, tipo=$tipo_desconto, perc=$percentual_desconto, val=$valor_desconto, inicio=$data_inicio, fim=$data_fim, limite=$limite_uso, multiplo=$uso_multiplo, id=$cupom_id, evento=$evento_id");
    } else {
        // Criar novo cupom
        if ($limite_uso == 0) {
            $sql = "INSERT INTO cupons (evento_id, codigo, tipo_desconto, percentual_desconto, valor_desconto, 
                    data_inicio, data_fim, limite_uso, uso_multiplo, ativo, criado_em) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, 1, NOW())";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "issddssi", 
                $evento_id, $codigo_normalizado, $tipo_desconto, $percentual_desconto, $valor_desconto,
                $data_inicio, $data_fim, $uso_multiplo);
        } else {
            $sql = "INSERT INTO cupons (evento_id, codigo, tipo_desconto, percentual_desconto, valor_desconto, 
                    data_inicio, data_fim, limite_uso, uso_multiplo, ativo, criado_em) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "issddssii", 
                $evento_id, $codigo_normalizado, $tipo_desconto, $percentual_desconto, $valor_desconto,
                $data_inicio, $data_fim, $limite_uso, $uso_multiplo);
        }
        error_log("INSERT - Params: evento=$evento_id, codigo=$codigo_normalizado, tipo=$tipo_desconto, perc=$percentual_desconto, val=$valor_desconto, inicio=$data_inicio, fim=$data_fim, limite=$limite_uso, multiplo=$uso_multiplo");
    }
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Cupom salvo com sucesso']);
    } else {
        $error_message = mysqli_error($con);
        $stmt_error = mysqli_stmt_error($stmt);
        error_log("Erro ao salvar cupom - MySQL Error: $error_message, Stmt Error: $stmt_error");
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar cupom: ' . $error_message]);
    }
}

function handleDeleteCupom($data, $usuario_id) {
    global $con;
    
    $cupom_id = intval($data['cupom_id'] ?? 0);
    
    if (!$cupom_id) {
        echo json_encode(['success' => false, 'message' => 'ID do cupom é obrigatório']);
        return;
    }
    
    // Verificar se o cupom existe e pertence ao usuário
    $sql_verificar = "SELECT c.id, c.codigo, e.usuario_id,
                             (SELECT COUNT(*) FROM tb_pedidos p WHERE p.cupom_id = c.id) as total_aplicacoes
                      FROM cupons c 
                      INNER JOIN eventos e ON c.evento_id = e.id 
                      WHERE c.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $cupom_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $cupom = mysqli_fetch_assoc($result_verificar);
    
    if (!$cupom || $cupom['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Cupom não encontrado ou acesso negado']);
        return;
    }
    
    // Verificar se há pedidos que referenciam este cupom
    if ($cupom['total_aplicacoes'] > 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Não é possível excluir cupons que foram utilizados em pedidos. Use a opção "Inativar" em vez de excluir.'
        ]);
        return;
    }
    
    // Excluir cupom
    $sql_delete = "DELETE FROM cupons WHERE id = ?";
    $stmt_delete = mysqli_prepare($con, $sql_delete);
    mysqli_stmt_bind_param($stmt_delete, "i", $cupom_id);
    
    if (mysqli_stmt_execute($stmt_delete)) {
        echo json_encode(['success' => true, 'message' => 'Cupom excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir cupom']);
    }
}

function handleToggleAtivo($data, $usuario_id) {
    global $con;
    
    $cupom_id = intval($data['cupom_id'] ?? 0);
    $ativo = intval($data['ativo'] ?? 0);
    
    if (!$cupom_id) {
        echo json_encode(['success' => false, 'message' => 'ID do cupom é obrigatório']);
        return;
    }
    
    // Verificar se o cupom existe e pertence ao usuário
    $sql_verificar = "SELECT c.id, e.usuario_id 
                      FROM cupons c 
                      INNER JOIN eventos e ON c.evento_id = e.id 
                      WHERE c.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $cupom_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $cupom = mysqli_fetch_assoc($result_verificar);
    
    if (!$cupom || $cupom['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Cupom não encontrado ou acesso negado']);
        return;
    }
    
    // Atualizar status ativo
    $sql_update = "UPDATE cupons SET ativo = ? WHERE id = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt_update, "ii", $ativo, $cupom_id);
    
    if (mysqli_stmt_execute($stmt_update)) {
        echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar status']);
    }
}

function handleToggleUsoMultiplo($data, $usuario_id) {
    global $con;
    
    $cupom_id = intval($data['cupom_id'] ?? 0);
    $uso_multiplo = intval($data['uso_multiplo'] ?? 0);
    
    if (!$cupom_id) {
        echo json_encode(['success' => false, 'message' => 'ID do cupom é obrigatório']);
        return;
    }
    
    // Verificar se o cupom existe e pertence ao usuário
    $sql_verificar = "SELECT c.id, e.usuario_id 
                      FROM cupons c 
                      INNER JOIN eventos e ON c.evento_id = e.id 
                      WHERE c.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $cupom_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $cupom = mysqli_fetch_assoc($result_verificar);
    
    if (!$cupom || $cupom['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Cupom não encontrado ou acesso negado']);
        return;
    }
    
    // Atualizar uso múltiplo
    $sql_update = "UPDATE cupons SET uso_multiplo = ? WHERE id = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt_update, "ii", $uso_multiplo, $cupom_id);
    
    if (mysqli_stmt_execute($stmt_update)) {
        echo json_encode(['success' => true, 'message' => 'Configuração atualizada com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar configuração']);
    }
}

function handleGetCupomData($data, $usuario_id) {
    global $con, $evento_id;
    
    $cupom_id = intval($data['cupom_id'] ?? 0);
    
    if (!$cupom_id) {
        echo json_encode(['success' => false, 'message' => 'ID do cupom é obrigatório']);
        return;
    }
    
    // Buscar dados do cupom
    $sql = "SELECT c.*, e.usuario_id 
            FROM cupons c 
            INNER JOIN eventos e ON c.evento_id = e.id 
            WHERE c.id = ? AND e.id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $cupom_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $cupom = mysqli_fetch_assoc($result);
    
    if (!$cupom || $cupom['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Cupom não encontrado']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $cupom]);
}

function handleGetAplicacoes($data, $usuario_id) {
    global $con;
    
    $cupom_id = intval($data['cupom_id'] ?? 0);
    
    if (!$cupom_id) {
        echo json_encode(['success' => false, 'message' => 'ID do cupom é obrigatório']);
        return;
    }
    
    // Verificar se o cupom existe e pertence ao usuário
    $sql_verificar = "SELECT c.id, c.codigo, e.usuario_id 
                      FROM cupons c 
                      INNER JOIN eventos e ON c.evento_id = e.id 
                      WHERE c.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $cupom_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $cupom = mysqli_fetch_assoc($result_verificar);
    
    if (!$cupom || $cupom['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Cupom não encontrado ou acesso negado']);
        return;
    }
    
    // Buscar aplicações do cupom
    $sql_aplicacoes = "SELECT p.pedidoid, p.comprador_nome, p.comprador_documento, p.valor_total, 
                              p.desconto_cupom, p.data_pedido, p.status_pagamento,
                              com.email as comprador_email
                       FROM tb_pedidos p
                       LEFT JOIN compradores com ON p.compradorid = com.id
                       WHERE p.cupom_id = ?
                       ORDER BY p.data_pedido DESC";
    $stmt_aplicacoes = mysqli_prepare($con, $sql_aplicacoes);
    mysqli_stmt_bind_param($stmt_aplicacoes, "i", $cupom_id);
    mysqli_stmt_execute($stmt_aplicacoes);
    $result_aplicacoes = mysqli_stmt_get_result($stmt_aplicacoes);
    $aplicacoes = mysqli_fetch_all($result_aplicacoes, MYSQLI_ASSOC);
    
    echo json_encode([
        'success' => true, 
        'cupom' => $cupom,
        'aplicacoes' => $aplicacoes
    ]);
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Cupons - <?php echo htmlspecialchars($evento['nome']); ?> - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .cupons-container {
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

        .novo-cupom-btn {
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

        .novo-cupom-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .cupons-table-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: visible;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cupons-table {
            width: 100%;
            border-collapse: collapse;
            overflow: visible;
        }

        .cupons-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cupons-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
            position: relative;
            overflow: visible;
        }

        .cupons-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .cupons-table tr:last-child td {
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

        .status-inativo {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
        }

        .status-expirado {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }

        .tipo-desconto {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }

        .tipo-percentual {
            background: rgba(0, 194, 255, 0.2);
            color: #00C2FF;
        }

        .tipo-valor {
            background: rgba(114, 94, 255, 0.2);
            color: #725EFF;
        }

        .codigo-cupom {
            font-family: 'Courier New', monospace;
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
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
            min-width: 200px;
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

        .form-select {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #FFFFFF;
            font-size: 16px;
            transition: all 0.3s ease;
            box-sizing: border-box;
            cursor: pointer;
        }

        .form-select:focus {
            outline: none;
            border-color: #00C2FF;
            background: rgba(0, 194, 255, 0.1);
            box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.2);
        }

        .form-select option {
            background: #2A2A38;
            color: #FFFFFF;
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

        .aplicacoes-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .aplicacoes-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .aplicacoes-table td {
            padding: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            font-size: 13px;
        }

        .aplicacoes-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        @media (max-width: 768px) {
            .cupons-container {
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

            .cupons-table-container {
                overflow-x: auto;
            }

            .cupons-table {
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

        .campo-condicional {
            display: none;
        }

        .campo-condicional.ativo {
            display: block;
        }
    </style>
</head>
<body>    <div class="particle"></div>
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
            <div class="cupons-container">
                <div class="page-header">
                    <nav class="breadcrumb">
                        <a href="meuseventos.php">📋 Meus Eventos</a>
                        <span>›</span>
                        <span>🎟️ Cupons de Desconto</span>
                    </nav>
                    <h1 class="page-title">Gestão de Cupons</h1>
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
                            Total de cupons: <strong style="color: #00C2FF;"><?php echo count($cupons); ?></strong>
                        </span>
                    </div>
                    <button onclick="abrirModalCupom()" class="novo-cupom-btn">
                        ➕ Novo Cupom
                    </button>
                </div>

                <?php if (empty($cupons)): ?>
                    <div class="cupons-table-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">🎟️</div>
                            <h3>Nenhum cupom criado</h3>
                            <p>Crie cupons de desconto para atrair mais participantes e impulsionar as vendas do seu evento.</p>
                            <button onclick="abrirModalCupom()" class="novo-cupom-btn">
                                🚀 Criar Primeiro Cupom
                            </button>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="cupons-table-container">
                        <table class="cupons-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Tipo de Desconto</th>
                                    <th>Valor</th>
                                    <th>Período</th>
                                    <th>Uso</th>
                                    <th>Status</th>
                                    <th>Ativo</th>
                                    <th>Uso Múltiplo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($cupons as $cupom): ?>
                                <?php
                                    $agora = new DateTime();
                                    $data_inicio = new DateTime($cupom['data_inicio']);
                                    $data_fim = new DateTime($cupom['data_fim']);
                                    
                                    if (!$cupom['ativo']) {
                                        $status = 'inativo';
                                        $status_texto = 'Inativo';
                                    } elseif ($agora < $data_inicio) {
                                        $status = 'futuro';
                                        $status_texto = 'Futuro';
                                    } elseif ($agora > $data_fim) {
                                        $status = 'expirado';
                                        $status_texto = 'Expirado';
                                    } else {
                                        $status = 'ativo';
                                        $status_texto = 'Ativo';
                                    }
                                    
                                    // Verificar limite de uso
                                    $limite_atingido = false;
                                    if ($cupom['limite_uso'] && $cupom['usado'] >= $cupom['limite_uso']) {
                                        $limite_atingido = true;
                                        $status = 'expirado';
                                        $status_texto = 'Limite Atingido';
                                    }
                                ?>
                                <tr>
                                    <td>
                                        <span class="codigo-cupom"><?php echo htmlspecialchars($cupom['codigo']); ?></span>
                                    </td>
                                    <td>
                                        <span class="tipo-desconto tipo-<?php echo $cupom['tipo_desconto']; ?>">
                                            <?php echo ucfirst($cupom['tipo_desconto']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php if ($cupom['tipo_desconto'] === 'percentual'): ?>
                                            <strong><?php echo number_format($cupom['percentual_desconto'], 0); ?>%</strong>
                                        <?php else: ?>
                                            <strong>R$ <?php echo number_format($cupom['valor_desconto'], 2, ',', '.'); ?></strong>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <div style="font-size: 13px;">
                                            <strong>Início:</strong> <?php echo $data_inicio->format('d/m/Y H:i'); ?><br>
                                            <strong>Fim:</strong> <?php echo $data_fim->format('d/m/Y H:i'); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-size: 13px;">
                                            <strong>Usado:</strong> <?php echo $cupom['usado']; ?> vez(es)<br>
                                            <?php if ($cupom['limite_uso']): ?>
                                                <strong>Limite:</strong> <?php echo $cupom['limite_uso']; ?>
                                            <?php else: ?>
                                                <span style="color: #B8B8C8;">Sem limite</span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo $status; ?>">
                                            <?php echo $status_texto; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="switch-container">
                                            <label class="switch">
                                                <input type="checkbox" 
                                                       <?php echo $cupom['ativo'] ? 'checked' : ''; ?>
                                                       onchange="toggleAtivo(<?php echo $cupom['id']; ?>, this.checked)">
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="switch-container">
                                            <label class="switch">
                                                <input type="checkbox" 
                                                       <?php echo $cupom['uso_multiplo'] ? 'checked' : ''; ?>
                                                       onchange="toggleUsoMultiplo(<?php echo $cupom['id']; ?>, this.checked)">
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
                                                <div class="dropdown-item" onclick="editarCupom(<?php echo $cupom['id']; ?>)">
                                                    ✏️ Editar
                                                </div>
                                                <div class="dropdown-item" onclick="verAplicacoes(<?php echo $cupom['id']; ?>)">
                                                    👁️ Ver Aplicações
                                                </div>
                                                <?php if ($cupom['total_aplicacoes'] == 0): ?>
                                                <div class="dropdown-item danger" onclick="excluirCupom(<?php echo $cupom['id']; ?>)">
                                                    🗑️ Excluir
                                                </div>
                                                <?php else: ?>
                                                <div class="dropdown-item" style="color: #888899; cursor: not-allowed;" 
                                                     title="Não é possível excluir cupons que foram utilizados em pedidos">
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
    <!-- Modal para Criar/Editar Cupom -->
    <div class="modal-overlay" id="modalCupom">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitulo">Novo Cupom</h2>
                <button class="modal-close" onclick="fecharModalCupom()">×</button>
            </div>
            <div class="modal-body">
                <form id="formCupom">
                    <input type="hidden" name="evento_id" value="<?php echo $evento_id; ?>">
                    <input type="hidden" name="cupom_id" value="" id="inputCupomId">
                    <input type="hidden" name="ajax_action" value="save_cupom">

                    <div class="form-group">
                        <label class="form-label" for="inputCodigo">Código do Cupom *</label>
                        <input type="text" 
                               id="inputCodigo" 
                               name="codigo" 
                               class="form-input" 
                               placeholder="Ex: DESCONTO10, PROMOCAO_NATAL"
                               required
                               oninput="normalizarCodigoInput(this)"
                               onblur="normalizarCodigoFinal(this)">
                        <div class="form-help">
                            O código será convertido automaticamente para maiúsculas, espaços viram underline e acentos são removidos
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="inputTipoDesconto">Tipo de Desconto *</label>
                        <select id="inputTipoDesconto" 
                                name="tipo_desconto" 
                                class="form-select" 
                                required
                                onchange="alterarTipoDesconto(this.value)">
                            <option value="percentual">Percentual (%)</option>
                            <option value="valor">Valor Fixo (R$)</option>
                        </select>
                    </div>

                    <div class="form-row">
                        <div class="form-group campo-condicional ativo" id="campoPercentual">
                            <label class="form-label" for="inputPercentualDesconto">Percentual de Desconto *</label>
                            <input type="number" 
                                   id="inputPercentualDesconto" 
                                   name="percentual_desconto" 
                                   class="form-input" 
                                   min="1" 
                                   max="100" 
                                   step="0.01"
                                   placeholder="Ex: 10">
                            <div class="form-help">Percentual de desconto (1% a 100%)</div>
                        </div>

                        <div class="form-group campo-condicional" id="campoValor">
                            <label class="form-label" for="inputValorDesconto">Valor do Desconto *</label>
                            <input type="number" 
                                   id="inputValorDesconto" 
                                   name="valor_desconto" 
                                   class="form-input" 
                                   min="0.01" 
                                   step="0.01"
                                   placeholder="Ex: 25.00">
                            <div class="form-help">Valor fixo em reais para o desconto</div>
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
                            <div class="form-help">Quando o cupom ficará disponível para uso</div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputDataFim">Data e Hora de Fim *</label>
                            <input type="datetime-local" 
                                   id="inputDataFim" 
                                   name="data_fim" 
                                   class="form-input" 
                                   required>
                            <div class="form-help">Quando o cupom expirará</div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="inputLimiteUso">Limite de Uso (opcional)</label>
                        <input type="number" 
                               id="inputLimiteUso" 
                               name="limite_uso" 
                               class="form-input" 
                               min="1"
                               placeholder="Ex: 100">
                        <div class="form-help">Quantas vezes o cupom pode ser utilizado (deixe vazio para ilimitado)</div>
                    </div>

                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 12px; padding: 16px 0;">
                            <label class="switch">
                                <input type="checkbox" 
                                       id="inputUsoMultiplo" 
                                       name="uso_multiplo" 
                                       value="1"
                                       checked>
                                <span class="slider"></span>
                            </label>
                            <label for="inputUsoMultiplo" class="form-label" style="margin: 0; cursor: pointer;">
                                Permitir uso múltiplo pelo mesmo comprador
                            </label>
                        </div>
                        <div class="form-help">
                            Quando ativado, o mesmo comprador pode usar este cupom várias vezes
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="fecharModalCupom()">
                    Cancelar
                </button>
                <button type="button" class="btn btn-primary" onclick="salvarCupom()">
                    💾 Salvar Cupom
                </button>
            </div>
        </div>
    </div>

    <!-- Modal para Ver Aplicações -->
    <div class="modal-overlay" id="modalAplicacoes">
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h2 class="modal-title">Aplicações do Cupom</h2>
                <button class="modal-close" onclick="fecharModalAplicacoes()">×</button>
            </div>
            <div class="modal-body">
                <div id="aplicacoesContent">
                    <!-- Conteúdo será carregado via AJAX -->
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="fecharModalAplicacoes()">
                    Fechar
                </button>
            </div>
        </div>
    </div>

    <script>
        // Variáveis globais
        const EVENTO_ID = <?php echo $evento_id; ?>;
        
        // Função para normalizar código durante digitação
        function normalizarCodigoInput(input) {
            let valor = input.value;
            // Converter para maiúscula em tempo real
            valor = valor.toUpperCase();
            // Substituir espaços por underscore
            valor = valor.replace(/ /g, '_');
            input.value = valor;
        }

        // Função para normalizar código final (quando sair do campo)
        function normalizarCodigoFinal(input) {
            let valor = input.value;
            // Converter para maiúscula
            valor = valor.toUpperCase();
            // Substituir espaços por underscore
            valor = valor.replace(/ /g, '_');
            // Remover acentos usando regex mais simples
            valor = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            // Remover caracteres especiais, manter apenas letras, números e underscore
            valor = valor.replace(/[^A-Z0-9_]/g, '');
            input.value = valor;
        }

        // Função para alterar tipo de desconto
        function alterarTipoDesconto(tipo) {
            const campoPercentual = document.getElementById('campoPercentual');
            const campoValor = document.getElementById('campoValor');
            const inputPercentual = document.getElementById('inputPercentualDesconto');
            const inputValor = document.getElementById('inputValorDesconto');

            if (tipo === 'percentual') {
                campoPercentual.classList.add('ativo');
                campoValor.classList.remove('ativo');
                inputPercentual.required = true;
                inputValor.required = false;
                inputValor.value = '';
            } else {
                campoPercentual.classList.remove('ativo');
                campoValor.classList.add('ativo');
                inputPercentual.required = false;
                inputValor.required = true;
                inputPercentual.value = '';
            }
        }

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

        // Abrir modal para novo cupom
        function abrirModalCupom() {
            const modal = document.getElementById('modalCupom');
            const titulo = document.getElementById('modalTitulo');
            const form = document.getElementById('formCupom');
            
            // Limpar formulário
            form.reset();
            document.getElementById('inputCupomId').value = '';
            titulo.textContent = 'Novo Cupom';
            
            // Configurar datas padrão
            const agora = new Date();
            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            
            document.getElementById('inputDataInicio').value = formatarDataTimeLocal(agora);
            document.getElementById('inputDataFim').value = formatarDataTimeLocal(amanha);
            
            // Resetar campos condicionais
            alterarTipoDesconto('percentual');
            document.getElementById('inputTipoDesconto').value = 'percentual';
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        // Editar cupom
        function editarCupom(cupomId) {
            const modal = document.getElementById('modalCupom');
            const titulo = document.getElementById('modalTitulo');
            
            titulo.textContent = 'Editar Cupom';
            
            // Buscar dados do cupom via AJAX
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=get_cupom_data&cupom_id=${cupomId}&evento_id=${EVENTO_ID}`
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const cupom = result.data;
                    
                    // Preencher formulário
                    document.getElementById('inputCupomId').value = cupom.id;
                    document.getElementById('inputCodigo').value = cupom.codigo;
                    document.getElementById('inputTipoDesconto').value = cupom.tipo_desconto;
                    document.getElementById('inputPercentualDesconto').value = cupom.percentual_desconto;
                    document.getElementById('inputValorDesconto').value = cupom.valor_desconto;
                    document.getElementById('inputDataInicio').value = formatarDataTimeLocal(new Date(cupom.data_inicio));
                    document.getElementById('inputDataFim').value = formatarDataTimeLocal(new Date(cupom.data_fim));
                    document.getElementById('inputLimiteUso').value = cupom.limite_uso || '';
                    document.getElementById('inputUsoMultiplo').checked = cupom.uso_multiplo == 1;
                    
                    // Configurar campos condicionais
                    alterarTipoDesconto(cupom.tipo_desconto);
                    
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                } else {
                    alert('Erro ao carregar dados do cupom: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Fechar modal cupom
        function fecharModalCupom() {
            const modal = document.getElementById('modalCupom');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }

        // Salvar cupom
        function salvarCupom() {
            const form = document.getElementById('formCupom');
            const formData = new FormData(form);
            
            // Validar datas
            const dataInicio = new Date(formData.get('data_inicio'));
            const dataFim = new Date(formData.get('data_fim'));
            
            if (dataFim <= dataInicio) {
                alert('A data de fim deve ser posterior à data de início');
                return;
            }
            
            // Validar código
            const codigo = formData.get('codigo').trim();
            if (!codigo) {
                alert('O código do cupom é obrigatório');
                return;
            }
            
            // Validar valores de desconto
            const tipoDesconto = formData.get('tipo_desconto');
            if (tipoDesconto === 'percentual') {
                const percentual = parseFloat(formData.get('percentual_desconto'));
                if (!percentual || percentual <= 0 || percentual > 100) {
                    alert('O percentual de desconto deve estar entre 1% e 100%');
                    return;
                }
            } else {
                const valor = parseFloat(formData.get('valor_desconto'));
                if (!valor || valor <= 0) {
                    alert('O valor de desconto deve ser maior que zero');
                    return;
                }
            }
            
            // Ajustar checkbox
            if (!document.getElementById('inputUsoMultiplo').checked) {
                formData.set('uso_multiplo', '0');
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
                    alert('Erro ao salvar cupom: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Excluir cupom
        function excluirCupom(cupomId) {
            if (confirm('Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.')) {
                fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `ajax_action=delete_cupom&cupom_id=${cupomId}`
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        location.reload();
                    } else {
                        alert('Erro ao excluir cupom: ' + result.message);
                    }
                })
                .catch(error => {
                    alert('Erro de comunicação: ' + error);
                });
            }
        }

        // Toggle ativo
        function toggleAtivo(cupomId, checked) {
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=toggle_ativo&cupom_id=${cupomId}&ativo=${checked ? 1 : 0}`
            })
            .then(response => response.json())
            .then(result => {
                if (!result.success) {
                    alert('Erro ao atualizar status: ' + result.message);
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

        // Toggle uso múltiplo
        function toggleUsoMultiplo(cupomId, checked) {
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=toggle_uso_multiplo&cupom_id=${cupomId}&uso_multiplo=${checked ? 1 : 0}`
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

        // Ver aplicações do cupom
        function verAplicacoes(cupomId) {
            const modal = document.getElementById('modalAplicacoes');
            const content = document.getElementById('aplicacoesContent');
            
            // Mostrar loading
            content.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="color: #B8B8C8;">Carregando aplicações...</div></div>';
            
            // Buscar aplicações via AJAX
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=get_aplicacoes&cupom_id=${cupomId}`
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const cupom = result.cupom;
                    const aplicacoes = result.aplicacoes;
                    
                    let html = `
                        <div style="margin-bottom: 20px; padding: 16px; background: rgba(0, 194, 255, 0.1); border-radius: 12px;">
                            <h3 style="color: #00C2FF; margin: 0 0 8px 0;">Cupom: ${cupom.codigo}</h3>
                            <p style="color: #B8B8C8; margin: 0;">Total de aplicações: <strong style="color: #FFFFFF;">${aplicacoes.length}</strong></p>
                        </div>
                    `;
                    
                    if (aplicacoes.length > 0) {
                        html += `
                            <table class="aplicacoes-table">
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Comprador</th>
                                        <th>E-mail</th>
                                        <th>Documento</th>
                                        <th>Valor Total</th>
                                        <th>Desconto</th>
                                        <th>Status</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;
                        
                        aplicacoes.forEach(aplicacao => {
                            const dataFormatada = new Date(aplicacao.data_pedido).toLocaleString('pt-BR');
                            html += `
                                <tr>
                                    <td>#${aplicacao.pedidoid}</td>
                                    <td>${aplicacao.comprador_nome}</td>
                                    <td>${aplicacao.comprador_email || '-'}</td>
                                    <td>${aplicacao.comprador_documento}</td>
                                    <td>R$ ${parseFloat(aplicacao.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                    <td style="color: #00C851; font-weight: 600;">-R$ ${parseFloat(aplicacao.desconto_cupom).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                    <td>
                                        <span class="status-badge ${aplicacao.status_pagamento === 'CONFIRMED' ? 'status-ativo' : 'status-inativo'}">
                                            ${aplicacao.status_pagamento}
                                        </span>
                                    </td>
                                    <td>${dataFormatada}</td>
                                </tr>
                            `;
                        });
                        
                        html += `
                                </tbody>
                            </table>
                        `;
                    } else {
                        html += `
                            <div class="empty-state">
                                <div class="empty-state-icon">📋</div>
                                <h3>Nenhuma aplicação encontrada</h3>
                                <p>Este cupom ainda não foi utilizado por nenhum comprador.</p>
                            </div>
                        `;
                    }
                    
                    content.innerHTML = html;
                } else {
                    content.innerHTML = `<div style="text-align: center; padding: 40px; color: #FF5252;">Erro ao carregar aplicações: ${result.message}</div>`;
                }
            })
            .catch(error => {
                content.innerHTML = `<div style="text-align: center; padding: 40px; color: #FF5252;">Erro de comunicação: ${error}</div>`;
            });
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        // Fechar modal aplicações
        function fecharModalAplicacoes() {
            const modal = document.getElementById('modalAplicacoes');
            modal.classList.remove('show');
            document.body.style.overflow = '';
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

        // Fechar modal ao clicar no overlay
        document.getElementById('modalCupom').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalCupom();
            }
        });

        document.getElementById('modalAplicacoes').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalAplicacoes();
            }
        });

        // Fechar modal ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                fecharModalCupom();
                fecharModalAplicacoes();
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