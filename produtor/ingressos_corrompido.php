<?php
include("check_login.php");
include("conm/conn.php");

// Verificar se lote_id e evento_id foram passados
$lote_id = isset($_GET['lote_id']) ? intval($_GET['lote_id']) : 0;
$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;

if (!$lote_id || !$evento_id) {
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
            case 'save_ingresso':
                handleSaveIngresso($_POST, $usuario_id);
                break;
            case 'delete_ingresso':
                handleDeleteIngresso($_POST, $usuario_id);
                break;
            case 'get_ingresso_data':
                handleGetIngressoData($_POST, $usuario_id);
                break;
            case 'toggle_ativo':
                handleToggleAtivo($_POST, $usuario_id);
                break;
            case 'update_ordem':
                handleUpdateOrdem($_POST, $usuario_id);
                break;
            case 'get_ingressos_combo':
                handleGetIngressosCombo($_POST, $usuario_id);
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Ação inválida']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    }
    exit;
}

// Verificar se o lote pertence ao usuário
$sql_verificar = "SELECT l.id, l.nome, l.data_inicio, l.data_fim, l.evento_id, e.nome as evento_nome, e.usuario_id 
                  FROM lotes l 
                  INNER JOIN eventos e ON l.evento_id = e.id 
                  WHERE l.id = ? AND e.id = ? AND e.usuario_id = ?";
$stmt_verificar = mysqli_prepare($con, $sql_verificar);
mysqli_stmt_bind_param($stmt_verificar, "iii", $lote_id, $evento_id, $_COOKIE['usuarioid']);
mysqli_stmt_execute($stmt_verificar);
$result_verificar = mysqli_stmt_get_result($stmt_verificar);
$lote = mysqli_fetch_assoc($result_verificar);

if (!$lote) {
    header("Location: meuseventos.php");
    exit;
}

// Buscar ingressos do lote
$sql_ingressos = "SELECT i.*, 
                         (SELECT COUNT(*) FROM tb_ingressos_individuais ii WHERE ii.ingresso_id = i.id) as vendidos,
                         (SELECT COUNT(*) FROM ingressos i2 WHERE i2.tipo = 'combo' AND JSON_SEARCH(i2.conteudo_combo, 'one', i.id, NULL, '$[*].ingresso_id') IS NOT NULL) as usado_em_combos
                  FROM ingressos i 
                  WHERE i.lote_id = ?
                  ORDER BY i.posicao_ordem ASC, i.id ASC";
$stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
mysqli_stmt_bind_param($stmt_ingressos, "i", $lote_id);
mysqli_stmt_execute($stmt_ingressos);
$result_ingressos = mysqli_stmt_get_result($stmt_ingressos);
$ingressos = mysqli_fetch_all($result_ingressos, MYSQLI_ASSOC);

// Buscar setores do evento
$sql_setores = "SELECT setor_id, nome FROM setores WHERE evento_id = ? ORDER BY nome";
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
function handleSaveIngresso($data, $usuario_id) {
    global $con, $lote_id, $evento_id;
    
    $ingresso_id = intval($data['ingresso_id'] ?? 0);
    $titulo = trim($data['titulo'] ?? '');
    $descricao = trim($data['descricao'] ?? '');
    $tipo = $data['tipo'] ?? '';
    $quantidade_total = intval($data['quantidade_total'] ?? 0);
    $preco = $data['preco'] ?? '';
    $taxa_plataforma = $data['taxa_plataforma'] ?? '';
    $valor_receber = $data['valor_receber'] ?? '';
    $limite_min = intval($data['limite_min'] ?? 1);
    $limite_max = intval($data['limite_max'] ?? 5);
    $disponibilidade = $data['disponibilidade'] ?? 'publico';
    $meia_entrada = intval($data['meia_entrada'] ?? 0);
    $nomenclatura_personalizada = trim($data['nomenclatura_personalizada'] ?? '');
    $setores_json = $data['setores'] ?? '[]';
    $conteudo_combo = $data['conteudo_combo'] ?? '[]';
    $posicao_ordem = intval($data['posicao_ordem'] ?? 0);
    
    // Validações básicas
    if (!$titulo || !$tipo || $quantidade_total <= 0) {
        echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos']);
        return;
    }
    
    if (!in_array($tipo, ['pago', 'gratuito', 'combo'])) {
        echo json_encode(['success' => false, 'message' => 'Tipo de ingresso inválido']);
        return;
    }
    
    // Verificar se o lote pertence ao usuário
    $sql_verificar_lote = "SELECT l.id, l.data_inicio, l.data_fim FROM lotes l 
                           INNER JOIN eventos e ON l.evento_id = e.id 
                           WHERE l.id = ? AND e.usuario_id = ?";
    $stmt_verificar_lote = mysqli_prepare($con, $sql_verificar_lote);
    mysqli_stmt_bind_param($stmt_verificar_lote, "ii", $lote_id, $usuario_id);
    mysqli_stmt_execute($stmt_verificar_lote);
    $result_verificar_lote = mysqli_stmt_get_result($stmt_verificar_lote);
    $lote_data = mysqli_fetch_assoc($result_verificar_lote);
    
    if (!$lote_data) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado']);
        return;
    }
    
    // Ajustar valores para ingressos gratuitos
    if ($tipo === 'gratuito') {
        $preco = '0.00';
        $taxa_plataforma = '0.00';
        $valor_receber = '0.00';
    } else {
        $preco = floatval($preco);
        $taxa_plataforma = floatval($taxa_plataforma);
        $valor_receber = floatval($valor_receber);
    }
    
    // Validar JSON dos setores
    $setores_array = json_decode($setores_json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'Dados de setores inválidos']);
        return;
    }
    
    // Validar JSON do combo
    if ($tipo === 'combo') {
        $combo_array = json_decode($conteudo_combo, true);
        if (json_last_error() !== JSON_ERROR_NONE || empty($combo_array)) {
            echo json_encode(['success' => false, 'message' => 'Conteúdo do combo é obrigatório']);
            return;
        }
        
        // Verificar se os ingressos do combo existem e não são combos
        foreach ($combo_array as $item) {
            if (!isset($item['ingresso_id']) || !isset($item['quantidade'])) {
                echo json_encode(['success' => false, 'message' => 'Formato do combo inválido']);
                return;
            }
            
            $sql_check_ingresso = "SELECT tipo FROM ingressos WHERE id = ? AND lote_id = ?";
            $stmt_check_ingresso = mysqli_prepare($con, $sql_check_ingresso);
            mysqli_stmt_bind_param($stmt_check_ingresso, "ii", $item['ingresso_id'], $lote_id);
            mysqli_stmt_execute($stmt_check_ingresso);
            $result_check_ingresso = mysqli_stmt_get_result($stmt_check_ingresso);
            $ingresso_check = mysqli_fetch_assoc($result_check_ingresso);
            
            if (!$ingresso_check) {
                echo json_encode(['success' => false, 'message' => 'Ingresso do combo não encontrado']);
                return;
            }
            
            if ($ingresso_check['tipo'] === 'combo') {
                echo json_encode(['success' => false, 'message' => 'Combos não podem conter outros combos']);
                return;
            }
        }
    }
    
    // Definir posição se não informada
    if ($posicao_ordem <= 0) {
        $sql_max_posicao = "SELECT COALESCE(MAX(posicao_ordem), 0) + 1 as nova_posicao FROM ingressos WHERE lote_id = ?";
        $stmt_max_posicao = mysqli_prepare($con, $sql_max_posicao);
        mysqli_stmt_bind_param($stmt_max_posicao, "i", $lote_id);
        mysqli_stmt_execute($stmt_max_posicao);
        $result_max_posicao = mysqli_stmt_get_result($stmt_max_posicao);
        $posicao_ordem = mysqli_fetch_assoc($result_max_posicao)['nova_posicao'];
    }
    
    // Usar as datas do lote
    $inicio_venda = $lote_data['data_inicio'];
    $fim_venda = $lote_data['data_fim'];
    
    // Salvar ou atualizar ingresso
    if ($ingresso_id) {
        // Atualizar ingresso existente
        $sql = "UPDATE ingressos SET 
                titulo = ?, descricao = ?, tipo = ?, quantidade_total = ?, 
                preco = ?, taxa_plataforma = ?, valor_receber = ?,
                inicio_venda = ?, fim_venda = ?, limite_min = ?, limite_max = ?,
                disponibilidade = ?, meia_entrada = ?, nomenclatura_personalizada = ?,
                setores = ?, conteudo_combo = ?, posicao_ordem = ?, atualizado_em = NOW()
                WHERE id = ? AND lote_id = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "sssidddssiissssiii", 
            $titulo, $descricao, $tipo, $quantidade_total,
            $preco, $taxa_plataforma, $valor_receber,
            $inicio_venda, $fim_venda, $limite_min, $limite_max,
            $disponibilidade, $meia_entrada, $nomenclatura_personalizada,
            $setores_json, $conteudo_combo, $posicao_ordem, $ingresso_id, $lote_id
        );
    } else {
        // Criar novo ingresso
        $sql = "INSERT INTO ingressos (
                    evento_id, lote_id, titulo, descricao, tipo, quantidade_total,
                    preco, taxa_plataforma, valor_receber, inicio_venda, fim_venda,
                    limite_min, limite_max, disponibilidade, meia_entrada,
                    nomenclatura_personalizada, setores, conteudo_combo, posicao_ordem,
                    criado_em, atualizado_em
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "iisssidddssiisssssi", 
            $evento_id, $lote_id, $titulo, $descricao, $tipo, $quantidade_total,
            $preco, $taxa_plataforma, $valor_receber, $inicio_venda, $fim_venda,
            $limite_min, $limite_max, $disponibilidade, $meia_entrada,
            $nomenclatura_personalizada, $setores_json, $conteudo_combo, $posicao_ordem
        );
    }
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Ingresso salvo com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar ingresso: ' . mysqli_error($con)]);
    }
}

function handleDeleteIngresso($data, $usuario_id) {
    global $con;
    
    $ingresso_id = intval($data['ingresso_id'] ?? 0);
    
    if (!$ingresso_id) {
        echo json_encode(['success' => false, 'message' => 'ID do ingresso é obrigatório']);
        return;
    }
    
    // Verificar se o ingresso existe e pertence ao usuário
    $sql_verificar = "SELECT i.id, i.titulo, e.usuario_id,
                             (SELECT COUNT(*) FROM tb_ingressos_individuais ii WHERE ii.ingresso_id = i.id) as vendidos,
                             (SELECT COUNT(*) FROM ingressos i2 WHERE i2.tipo = 'combo' AND JSON_SEARCH(i2.conteudo_combo, 'one', i.id, NULL, '$[*].ingresso_id') IS NOT NULL) as usado_em_combos
                      FROM ingressos i 
                      INNER JOIN eventos e ON i.evento_id = e.id 
                      WHERE i.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $ingresso_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $ingresso = mysqli_fetch_assoc($result_verificar);
    
    if (!$ingresso || $ingresso['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado ou acesso negado']);
        return;
    }
    
    // Verificar se há vendas ou uso em combos
    if ($ingresso['vendidos'] > 0 || $ingresso['usado_em_combos'] > 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Não é possível excluir ingressos que já foram vendidos ou fazem parte de combos. Desative o ingresso em vez de excluir.'
        ]);
        return;
    }
    
    // Excluir ingresso
    $sql_delete = "DELETE FROM ingressos WHERE id = ?";
    $stmt_delete = mysqli_prepare($con, $sql_delete);
    mysqli_stmt_bind_param($stmt_delete, "i", $ingresso_id);
    
    if (mysqli_stmt_execute($stmt_delete)) {
        echo json_encode(['success' => true, 'message' => 'Ingresso excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir ingresso']);
    }
}

function handleGetIngressoData($data, $usuario_id) {
    global $con;
    
    $ingresso_id = intval($data['ingresso_id'] ?? 0);
    
    if (!$ingresso_id) {
        echo json_encode(['success' => false, 'message' => 'ID do ingresso é obrigatório']);
        return;
    }
    
    // Buscar dados do ingresso
    $sql = "SELECT i.*, e.usuario_id 
            FROM ingressos i 
            INNER JOIN eventos e ON i.evento_id = e.id 
            WHERE i.id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $ingresso_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $ingresso = mysqli_fetch_assoc($result);
    
    if (!$ingresso || $ingresso['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $ingresso]);
}

function handleToggleAtivo($data, $usuario_id) {
    global $con;
    
    $ingresso_id = intval($data['ingresso_id'] ?? 0);
    $ativo = intval($data['ativo'] ?? 0);
    
    if (!$ingresso_id) {
        echo json_encode(['success' => false, 'message' => 'ID do ingresso é obrigatório']);
        return;
    }
    
    // Verificar se o ingresso existe e pertence ao usuário
    $sql_verificar = "SELECT i.id, e.usuario_id 
                      FROM ingressos i 
                      INNER JOIN eventos e ON i.evento_id = e.id 
                      WHERE i.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $ingresso_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $ingresso = mysqli_fetch_assoc($result_verificar);
    
    if (!$ingresso || $ingresso['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado ou acesso negado']);
        return;
    }
    
    // Atualizar status ativo
    $sql_update = "UPDATE ingressos SET ativo = ?, atualizado_em = NOW() WHERE id = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt_update, "ii", $ativo, $ingresso_id);
    
    if (mysqli_stmt_execute($stmt_update)) {
        echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar status']);
    }
}

function handleUpdateOrdem($data, $usuario_id) {
    global $con;
    
    $ingresso_id = intval($data['ingresso_id'] ?? 0);
    $posicao_ordem = intval($data['posicao_ordem'] ?? 0);
    
    if (!$ingresso_id || $posicao_ordem < 0) {
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        return;
    }
    
    // Verificar se o ingresso existe e pertence ao usuário
    $sql_verificar = "SELECT i.id, e.usuario_id 
                      FROM ingressos i 
                      INNER JOIN eventos e ON i.evento_id = e.id 
                      WHERE i.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $ingresso_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $ingresso = mysqli_fetch_assoc($result_verificar);
    
    if (!$ingresso || $ingresso['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Ingresso não encontrado ou acesso negado']);
        return;
    }
    
    // Atualizar posição
    $sql_update = "UPDATE ingressos SET posicao_ordem = ?, atualizado_em = NOW() WHERE id = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt_update, "ii", $posicao_ordem, $ingresso_id);
    
    if (mysqli_stmt_execute($stmt_update)) {
        echo json_encode(['success' => true, 'message' => 'Ordem atualizada com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar ordem']);
    }
}

function handleGetIngressosCombo($data, $usuario_id) {
    global $con, $lote_id;
    
    // Buscar ingressos disponíveis para combo (não podem ser combos nem inativos)
    $sql = "SELECT i.id, i.titulo, i.preco, i.tipo 
            FROM ingressos i 
            INNER JOIN eventos e ON i.evento_id = e.id 
            WHERE i.lote_id = ? AND i.tipo != 'combo' AND i.ativo = 1 AND e.usuario_id = ?
            ORDER BY i.titulo";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $ingressos = mysqli_fetch_all($result, MYSQLI_ASSOC);
    
    echo json_encode(['success' => true, 'ingressos' => $ingressos]);
}

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Ingressos - <?php echo htmlspecialchars($lote['nome']); ?> - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .ingressos-container {
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

        .btn-voltar {
            background: rgba(255, 255, 255, 0.1);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.2);
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

        .btn-voltar:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .novo-ingresso-btn {
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

        .novo-ingresso-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .ingressos-table-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: visible;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ingressos-table {
            width: 100%;
            border-collapse: collapse;
            overflow: visible;
        }

        .ingressos-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ingressos-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
            position: relative;
            overflow: visible;
        }

        .ingressos-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .ingressos-table tr:last-child td {
            border-bottom: none;
        }

        .tipo-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .tipo-pago {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
        }

        .tipo-gratuito {
            background: rgba(33, 150, 243, 0.2);
            color: #2196F3;
        }

        .tipo-combo {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }

        .disponibilidade-badge {
            padding: 4px 8px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
        }

        .disponibilidade-publico {
            background: rgba(76, 175, 80, 0.2);
            color: #4CAF50;
        }

        .disponibilidade-convidados {
            background: rgba(156, 39, 176, 0.2);
            color: #9C27B0;
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

        .dropdown-item.disabled {
            color: #888899;
            cursor: not-allowed;
        }

        .dropdown-item.disabled:hover {
            background: none;
            color: #888899;
        }

        .setor-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .setor-badge {
            background: rgba(114, 94, 255, 0.2);
            color: #725EFF;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
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

        .drag-handle {
            cursor: move;
            color: #888899;
            font-size: 16px;
        }

        .drag-handle:hover {
            color: #00C2FF;
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
            max-width: 800px;
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

        .form-input:disabled {
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

        .form-row-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
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
            box-shadow: 0 8px 25px
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .setores-container {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.02);
        }

        .setores-selected {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
            min-height: 32px;
        }

        .setor-selected {
            background: rgba(114, 94, 255, 0.3);
            color: #FFFFFF;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .setor-remove {
            background: rgba(255, 82, 82, 0.3);
            border: none;
            color: #FF5252;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }

        .setor-remove:hover {
            background: rgba(255, 82, 82, 0.5);
        }

        .combo-container {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.02);
        }

        .combo-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .combo-remove {
            background: rgba(255, 82, 82, 0.3);
            border: none;
            color: #FF5252;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
        }

        .combo-add-btn {
            background: rgba(0, 194, 255, 0.2);
            border: 1px solid rgba(0, 194, 255, 0.3);
            color: #00C2FF;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .combo-add-btn:hover {
            background: rgba(0, 194, 255, 0.3);
        }

        @media (max-width: 768px) {
            .ingressos-container {
                padding: 15px;
            }

            .actions-bar {
                flex-direction: column;
                align-items: stretch;
            }

            .ingressos-table-container {
                overflow-x: auto;
            }

            .ingressos-table {
                min-width: 1000px;
            }

            .form-row, .form-row-3 {
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
            <div class="ingressos-container">
                <div class="page-header">
                    <nav class="breadcrumb">
                        <a href="meuseventos.php">📋 Meus Eventos</a>
                        <span>›</span>
                        <a href="lotes.php?evento_id=<?php echo $evento_id; ?>">🏷️ Lotes</a>
                        <span>›</span>
                        <span>🎫 Ingressos</span>
                    </nav>
                    <h1 class="page-title">Gestão de Ingressos</h1>
                    <p class="page-subtitle">
                        Lote: <strong><?php echo htmlspecialchars($lote['nome']); ?></strong><br>
                        Evento: <strong><?php echo htmlspecialchars($lote['evento_nome']); ?></strong>
                    </p>
                </div>

                <div class="actions-bar">
                    <a href="lotes.php?evento_id=<?php echo $evento_id; ?>" class="btn-voltar">
                        ← Voltar aos Lotes
                    </a>
                    <div class="info-section">
                        <span style="color: #B8B8C8;">
                            Total de ingressos: <strong style="color: #00C2FF;"><?php echo count($ingressos); ?></strong>
                        </span>
                    </div>
                    <button onclick="abrirModalIngresso()" class="novo-ingresso-btn">
                        ➕ Novo Ingresso
                    </button>
                </div>

                <?php if (empty($ingressos)): ?>
                    <div class="ingressos-table-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">🎫</div>
                            <h3>Nenhum ingresso criado</h3>
                            <p>Crie diferentes tipos de ingressos para este lote com preços e configurações específicas.</p>
                            <button onclick="abrirModalIngresso()" class="novo-ingresso-btn">
                                🚀 Criar Primeiro Ingresso
                            </button>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="ingressos-table-container">
                        <table class="ingressos-table">
                            <thead>
                                <tr>
                                    <th width="30">Ordem</th>
                                    <th>Título</th>
                                    <th>Tipo</th>
                                    <th>Quantidade</th>
                                    <th>Preço</th>
                                    <th>Disponibilidade</th>
                                    <th>Setores</th>
                                    <th>Ativo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="ingressos-tbody">
                                <?php foreach ($ingressos as $index => $ingresso): ?>
                                <tr data-ingresso-id="<?php echo $ingresso['id']; ?>">
                                    <td>
                                        <span class="drag-handle" title="Arrastar para reordenar">⋮⋮</span>
                                        <span style="margin-left: 8px; color: #888899; font-size: 12px;">
                                            #<?php echo $ingresso['posicao_ordem']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600;">
                                            <?php echo htmlspecialchars($ingresso['titulo']); ?>
                                        </div>
                                        <?php if (!empty($ingresso['descricao'])): ?>
                                        <div style="font-size: 12px; color: #B8B8C8; margin-top: 4px;">
                                            <?php echo htmlspecialchars(substr($ingresso['descricao'], 0, 80)) . (strlen($ingresso['descricao']) > 80 ? '...' : ''); ?>
                                        </div>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="tipo-badge tipo-<?php echo $ingresso['tipo']; ?>">
                                            <?php echo ucfirst($ingresso['tipo']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div style="font-size: 14px;">
                                            <strong><?php echo $ingresso['quantidade_total']; ?></strong> total<br>
                                            <span style="color: #FF5252; font-size: 12px;">
                                                <?php echo $ingresso['vendidos']; ?> vendidos
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <?php if ($ingresso['tipo'] === 'gratuito'): ?>
                                            <span style="color: #2196F3; font-weight: 600;">GRATUITO</span>
                                        <?php elseif ($ingresso['tipo'] === 'combo'): ?>
                                            <span style="color: #FFC107; font-weight: 600;">COMBO</span>
                                        <?php else: ?>
                                            <div style="font-size: 14px;">
                                                <strong>R$ <?php echo number_format($ingresso['preco'], 2, ',', '.'); ?></strong>
                                                <?php if ($ingresso['taxa_plataforma'] > 0): ?>
                                                <br><span style="font-size: 11px; color: #888899;">
                                                    + Taxa: R$ <?php echo number_format($ingresso['taxa_plataforma'], 2, ',', '.'); ?>
                                                </span>
                                                <?php endif; ?>
                                            </div>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="disponibilidade-badge disponibilidade-<?php echo $ingresso['disponibilidade']; ?>">
                                            <?php echo $ingresso['disponibilidade'] === 'publico' ? 'Página de Vendas' : 'Exclusivo/Cortesias'; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="setor-badges">
                                            <?php 
                                            $setores_ingresso = json_decode($ingresso['setores'], true);
                                            if (!empty($setores_ingresso)):
                                                foreach ($setores_ingresso as $setor):
                                            ?>
                                            <span class="setor-badge">
                                                <?php echo htmlspecialchars($setor['nome']); ?>
                                            </span>
                                            <?php 
                                                endforeach;
                                            else:
                                            ?>
                                            <span style="color: #888899; font-size: 12px;">-</span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="switch-container">
                                            <label class="switch">
                                                <input type="checkbox" 
                                                       <?php echo $ingresso['ativo'] ? 'checked' : ''; ?>
                                                       onchange="toggleAtivo(<?php echo $ingresso['id']; ?>, this.checked)">
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
                                                <div class="dropdown-item" onclick="editarIngresso(<?php echo $ingresso['id']; ?>)">
                                                    ✏️ Editar
                                                </div>
                                                <?php 
                                                $pode_excluir = ($ingresso['vendidos'] == 0 && $ingresso['usado_em_combos'] == 0);
                                                if ($pode_excluir): 
                                                ?>
                                                <div class="dropdown-item danger" onclick="excluirIngresso(<?php echo $ingresso['id']; ?>)">
                                                    🗑️ Excluir
                                                </div>
                                                <?php else: ?>
                                                <div class="dropdown-item disabled" 
                                                     title="Não é possível excluir ingressos vendidos ou usados em combos">
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


    <!-- Modal para Criar/Editar Ingresso -->
    <div class="modal-overlay" id="modalIngresso">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitulo">Novo Ingresso</h2>
                <button class="modal-close" onclick="fecharModalIngresso()">×</button>
            </div>
            <div class="modal-body">
                <form id="formIngresso">
                    <input type="hidden" name="lote_id" value="<?php echo $lote_id; ?>">
                    <input type="hidden" name="evento_id" value="<?php echo $evento_id; ?>">
                    <input type="hidden" name="ingresso_id" value="" id="inputIngressoId">
                    <input type="hidden" name="ajax_action" value="save_ingresso">

                    <div class="form-group">
                        <label class="form-label" for="inputTitulo">Título do Ingresso *</label>
                        <input type="text" 
                               id="inputTitulo" 
                               name="titulo" 
                               class="form-input" 
                               placeholder="Ex: Entrada Geral, VIP, Estudante..."
                               required>
                        <div class="form-help">
                            Nome que aparecerá na página de vendas
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="inputDescricao">Descrição</label>
                        <textarea id="inputDescricao" 
                                  name="descricao" 
                                  class="form-input" 
                                  rows="3"
                                  placeholder="Descrição opcional dos benefícios ou características do ingresso"></textarea>
                        <div class="form-help">
                            Informações adicionais sobre o ingresso (opcional)
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="inputTipo">Tipo do Ingresso *</label>
                            <select id="inputTipo" name="tipo" class="form-input" required onchange="tipoChanged()">
                                <option value="">Selecione o tipo</option>
                                <option value="pago">Pago</option>
                                <option value="gratuito">Gratuito</option>
                                <option value="combo">Combo</option>
                            </select>
                            <div class="form-help">
                                Tipo de cobrança do ingresso
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputQuantidade">Quantidade Total *</label>
                            <input type="number" 
                                   id="inputQuantidade" 
                                   name="quantidade_total" 
                                   class="form-input" 
                                   min="1"
                                   placeholder="Ex: 100"
                                   required>
                            <div class="form-help">
                                Quantidade total disponível para venda
                            </div>
                        </div>
                    </div>

                    <!-- Seção de Preços (apenas para pagos) -->
                    <div id="secaoPrecos" style="display: none;">
                        <div class="form-row-3">
                            <div class="form-group">
                                <label class="form-label" for="inputPreco">Preço (R$) *</label>
                                <input type="number" 
                                       id="inputPreco" 
                                       name="preco" 
                                       class="form-input" 
                                       step="0.01"
                                       min="0"
                                       placeholder="0,00">
                                <div class="form-help">
                                    Valor do ingresso
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="inputTaxa">Taxa Plataforma (R$)</label>
                                <input type="number" 
                                       id="inputTaxa" 
                                       name="taxa_plataforma" 
                                       class="form-input" 
                                       step="0.01"
                                       min="0"
                                       placeholder="0,00">
                                <div class="form-help">
                                    Taxa adicional cobrada
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="inputValorReceber">Valor a Receber (R$)</label>
                                <input type="number" 
                                       id="inputValorReceber" 
                                       name="valor_receber" 
                                       class="form-input" 
                                       step="0.01"
                                       min="0"
                                       placeholder="0,00">
                                <div class="form-help">
                                    Valor líquido que você receberá
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Seção de Combo (apenas para combos) -->
                    <div id="secaoCombo" style="display: none;">
                        <div class="form-group">
                            <label class="form-label">Conteúdo do Combo *</label>
                            <div class="combo-container">
                                <div id="comboItens">
                                    <!-- Itens do combo serão adicionados aqui -->
                                </div>
                                <button type="button" class="combo-add-btn" onclick="adicionarItemCombo()">
                                    ➕ Adicionar Ingresso ao Combo
                                </button>
                            </div>
                            <div class="form-help">
                                Selecione os ingressos que farão parte deste combo
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="inputLimiteMin">Limite Mínimo por Compra</label>
                            <input type="number" 
                                   id="inputLimiteMin" 
                                   name="limite_min" 
                                   class="form-input" 
                                   min="1"
                                   value="1">
                            <div class="form-help">
                                Quantidade mínima que pode ser comprada
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputLimiteMax">Limite Máximo por Compra</label>
                            <input type="number" 
                                   id="inputLimiteMax" 
                                   name="limite_max" 
                                   class="form-input" 
                                   min="1"
                                   value="5">
                            <div class="form-help">
                                Quantidade máxima que pode ser comprada
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="inputDisponibilidade">Disponibilidade</label>
                            <select id="inputDisponibilidade" name="disponibilidade" class="form-input">
                                <option value="publico">Disponível na Página de Vendas</option>
                                <option value="convidados">Exclusivo para Convidados/Cortesias</option>
                            </select>
                            <div class="form-help">
                                Como este ingresso será disponibilizado
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="inputPosicao">Posição na Ordenação</label>
                            <input type="number" 
                                   id="inputPosicao" 
                                   name="posicao_ordem" 
                                   class="form-input" 
                                   min="0"
                                   placeholder="Auto">
                            <div class="form-help">
                                Ordem de exibição (deixe em branco para automático)
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 12px; padding: 16px 0;">
                            <label class="switch">
                                <input type="checkbox" 
                                       id="inputMeiaEntrada" 
                                       name="meia_entrada" 
                                       value="1">
                                <span class="slider"></span>
                            </label>
                            <label for="inputMeiaEntrada" class="form-label" style="margin: 0; cursor: pointer;">
                                Permitir Meia Entrada
                            </label>
                        </div>
                        <div class="form-help">
                            Permite a compra com desconto de meia entrada
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="inputNomenclatura">Nomenclatura Personalizada</label>
                        <input type="text" 
                               id="inputNomenclatura" 
                               name="nomenclatura_personalizada" 
                               class="form-input" 
                               placeholder="Ex: Credencial, Pulseira, Voucher...">
                        <div class="form-help">
                            Nome alternativo para o tipo de ingresso (opcional)
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Setores (Opcional)</label>
                        <div class="setores-container">
                            <div class="setores-selected" id="setoresSelected">
                                <!-- Setores selecionados aparecerão aqui -->
                            </div>
                            <select id="selectSetor" class="form-input" onchange="adicionarSetor()">
                                <option value="">Selecione um setor para adicionar</option>
                                <?php foreach ($setores as $setor): ?>
                                <option value="<?php echo $setor['setor_id']; ?>" data-nome="<?php echo htmlspecialchars($setor['nome']); ?>">
                                    <?php echo htmlspecialchars($setor['nome']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-help">
                                Selecione os setores onde este ingresso é válido
                            </div>
                        </div>
                        <input type="hidden" name="setores" id="inputSetores" value="[]">
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="fecharModalIngresso()">
                    Cancelar
                </button>
                <button type="button" class="btn btn-primary" onclick="salvarIngresso()">
                    💾 Salvar Ingresso
                </button>
            </div>
        </div>
    </div>

    <script>
        // Variáveis globais
        const LOTE_ID = <?php echo $lote_id; ?>;
        const EVENTO_ID = <?php echo $evento_id; ?>;
        const SETORES_DISPONIVEIS = <?php echo json_encode($setores); ?>;
        
        let setoresSelecionados = [];
        let comboItens = [];
        let ingressosDisponiveis = [];

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

        // Mudança no tipo de ingresso
        function tipoChanged() {
            const tipo = document.getElementById('inputTipo').value;
            const secaoPrecos = document.getElementById('secaoPrecos');
            const secaoCombo = document.getElementById('secaoCombo');
            
            // Ocultar todas as seções específicas
            secaoPrecos.style.display = 'none';
            secaoCombo.style.display = 'none';
            
            if (tipo === 'pago') {
                secaoPrecos.style.display = 'block';
            } else if (tipo === 'combo') {
                secaoCombo.style.display = 'block';
                carregarIngressosCombo();
            }
        }

        // Carregar ingressos disponíveis para combo
        function carregarIngressosCombo() {
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'ajax_action=get_ingressos_combo'
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    ingressosDisponiveis = result.ingressos;
                } else {
                    console.error('Erro ao carregar ingressos:', result.message);
                }
            })
            .catch(error => {
                console.error('Erro de comunicação:', error);
            });
        }

        // Adicionar item ao combo
        function adicionarItemCombo() {
            if (ingressosDisponiveis.length === 0) {
                alert('Não há ingressos disponíveis para adicionar ao combo. Crie ingressos simples primeiro.');
                return;
            }

            const container = document.getElementById('comboItens');
            const itemIndex = comboItens.length;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'combo-item';
            itemDiv.setAttribute('data-index', itemIndex);
            
            let selectOptions = '<option value="">Selecione um ingresso</option>';
            ingressosDisponiveis.forEach(ingresso => {
                selectOptions += `<option value="${ingresso.id}">${ingresso.titulo} - R$ ${parseFloat(ingresso.preco).toFixed(2)}</option>`;
            });
            
            itemDiv.innerHTML = `
                <select class="form-input" style="flex: 1;" onchange="updateComboItem(${itemIndex}, 'ingresso_id', this.value)">
                    ${selectOptions}
                </select>
                <input type="number" class="form-input" style="width: 120px;" min="1" value="1" 
                       placeholder="Qtd" onchange="updateComboItem(${itemIndex}, 'quantidade', this.value)">
                <button type="button" class="combo-remove" onclick="removerItemCombo(${itemIndex})">×</button>
            `;
            
            container.appendChild(itemDiv);
            
            // Adicionar item ao array
            comboItens.push({
                ingresso_id: '',
                quantidade: 1
            });
        }

        // Atualizar item do combo
        function updateComboItem(index, field, value) {
            if (comboItens[index]) {
                comboItens[index][field] = field === 'quantidade' ? parseInt(value) : value;
            }
        }

        // Remover item do combo
        function removerItemCombo(index) {
            const itemDiv = document.querySelector(`[data-index="${index}"]`);
            if (itemDiv) {
                itemDiv.remove();
                comboItens.splice(index, 1);
                
                // Reindexar os itens restantes
                document.querySelectorAll('.combo-item').forEach((item, newIndex) => {
                    item.setAttribute('data-index', newIndex);
                    
                    // Atualizar os eventos dos elementos
                    const select = item.querySelector('select');
                    const input = item.querySelector('input');
                    const button = item.querySelector('button');
                    
                    if (select) select.setAttribute('onchange', `updateComboItem(${newIndex}, 'ingresso_id', this.value)`);
                    if (input) input.setAttribute('onchange', `updateComboItem(${newIndex}, 'quantidade', this.value)`);
                    if (button) button.setAttribute('onclick', `removerItemCombo(${newIndex})`);
                });
            }
        }

        // Adicionar setor
        function adicionarSetor() {
            const select = document.getElementById('selectSetor');
            const setorId = select.value;
            const setorNome = select.selectedOptions[0]?.getAttribute('data-nome');
            
            if (!setorId || !setorNome) return;
            
            // Verificar se já não foi adicionado
            if (setoresSelecionados.find(s => s.setor_id == setorId)) {
                alert('Este setor já foi adicionado');
                return;
            }
            
            // Adicionar ao array
            setoresSelecionados.push({
                setor_id: parseInt(setorId),
                nome: setorNome
            });
            
            // Atualizar interface
            atualizarSetoresInterface();
            
            // Limpar seleção
            select.value = '';
        }

        // Remover setor
        function removerSetor(setorId) {
            setoresSelecionados = setoresSelecionados.filter(s => s.setor_id != setorId);
            atualizarSetoresInterface();
        }

        // Atualizar interface dos setores
        function atualizarSetoresInterface() {
            const container = document.getElementById('setoresSelected');
            const input = document.getElementById('inputSetores');
            
            container.innerHTML = '';
            
            setoresSelecionados.forEach(setor => {
                const setorDiv = document.createElement('div');
                setorDiv.className = 'setor-selected';
                setorDiv.innerHTML = `
                    ${setor.nome}
                    <button type="button" class="setor-remove" onclick="removerSetor(${setor.setor_id})">×</button>
                `;
                container.appendChild(setorDiv);
            });
            
            // Atualizar input hidden
            input.value = JSON.stringify(setoresSelecionados);
        }

        // Abrir modal para novo ingresso
        function abrirModalIngresso() {
            const modal = document.getElementById('modalIngresso');
            const titulo = document.getElementById('modalTitulo');
            const form = document.getElementById('formIngresso');
            
            // Limpar formulário
            form.reset();
            document.getElementById('inputIngressoId').value = '';
            titulo.textContent = 'Novo Ingresso';
            
            // Limpar arrays
            setoresSelecionados = [];
            comboItens = [];
            
            // Atualizar interfaces
            atualizarSetoresInterface();
            document.getElementById('comboItens').innerHTML = '';
            
            // Ocultar seções específicas
            document.getElementById('secaoPrecos').style.display = 'none';
            document.getElementById('secaoCombo').style.display = 'none';
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        // Editar ingresso
        function editarIngresso(ingressoId) {
            const modal = document.getElementById('modalIngresso');
            const titulo = document.getElementById('modalTitulo');
            
            titulo.textContent = 'Editar Ingresso';
            
            // Buscar dados do ingresso via AJAX
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=get_ingresso_data&ingresso_id=${ingressoId}`
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const ingresso = result.data;
                    
                    // Preencher formulário
                    document.getElementById('inputIngressoId').value = ingresso.id;
                    document.getElementById('inputTitulo').value = ingresso.titulo;
                    document.getElementById('inputDescricao').value = ingresso.descricao || '';
                    document.getElementById('inputTipo').value = ingresso.tipo;
                    document.getElementById('inputQuantidade').value = ingresso.quantidade_total;
                    document.getElementById('inputPreco').value = ingresso.preco;
                    document.getElementById('inputTaxa').value = ingresso.taxa_plataforma;
                    document.getElementById('inputValorReceber').value = ingresso.valor_receber;
                    document.getElementById('inputLimiteMin').value = ingresso.limite_min;
                    document.getElementById('inputLimiteMax').value = ingresso.limite_max;
                    document.getElementById('inputDisponibilidade').value = ingresso.disponibilidade;
                    document.getElementById('inputMeiaEntrada').checked = ingresso.meia_entrada == 1;
                    document.getElementById('inputNomenclatura').value = ingresso.nomenclatura_personalizada || '';
                    document.getElementById('inputPosicao').value = ingresso.posicao_ordem;
                    
                    // Processar setores
                    try {
                        setoresSelecionados = JSON.parse(ingresso.setores || '[]');
                        atualizarSetoresInterface();
                    } catch (e) {
                        setoresSelecionados = [];
                        atualizarSetoresInterface();
                    }
                    
                    // Processar combo se for do tipo combo
                    if (ingresso.tipo === 'combo') {
                        try {
                            comboItens = JSON.parse(ingresso.conteudo_combo || '[]');
                            carregarIngressosCombo().then(() => {
                                preencherComboInterface();
                            });
                        } catch (e) {
                            comboItens = [];
                        }
                    }
                    
                    // Configurar seções visíveis
                    tipoChanged();
                    
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                } else {
                    alert('Erro ao carregar dados do ingresso: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Preencher interface do combo com dados existentes
        function preencherComboInterface() {
            const container = document.getElementById('comboItens');
            container.innerHTML = '';
            
            comboItens.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'combo-item';
                itemDiv.setAttribute('data-index', index);
                
                let selectOptions = '<option value="">Selecione um ingresso</option>';
                ingressosDisponiveis.forEach(ingresso => {
                    const selected = ingresso.id == item.ingresso_id ? 'selected' : '';
                    selectOptions += `<option value="${ingresso.id}" ${selected}>${ingresso.titulo} - R$ ${parseFloat(ingresso.preco).toFixed(2)}</option>`;
                });
                
                itemDiv.innerHTML = `
                    <select class="form-input" style="flex: 1;" onchange="updateComboItem(${index}, 'ingresso_id', this.value)">
                        ${selectOptions}
                    </select>
                    <input type="number" class="form-input" style="width: 120px;" min="1" value="${item.quantidade}" 
                           placeholder="Qtd" onchange="updateComboItem(${index}, 'quantidade', this.value)">
                    <button type="button" class="combo-remove" onclick="removerItemCombo(${index})">×</button>
                `;
                
                container.appendChild(itemDiv);
            });
        }

        // Fechar modal
        function fecharModalIngresso() {
            const modal = document.getElementById('modalIngresso');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }

        // Salvar ingresso
        function salvarIngresso() {
            const form = document.getElementById('formIngresso');
            const formData = new FormData(form);
            
            // Validações básicas
            const titulo = formData.get('titulo').trim();
            const tipo = formData.get('tipo');
            const quantidade = parseInt(formData.get('quantidade_total'));
            
            if (!titulo || !tipo || quantidade <= 0) {
                alert('Preencha todos os campos obrigatórios');
                return;
            }
            
            // Validações específicas por tipo
            if (tipo === 'pago') {
                const preco = parseFloat(formData.get('preco') || 0);
                if (preco <= 0) {
                    alert('O preço deve ser maior que zero para ingressos pagos');
                    return;
                }
            } else if (tipo === 'combo') {
                if (comboItens.length === 0) {
                    alert('Adicione pelo menos um ingresso ao combo');
                    return;
                }
                
                // Verificar se todos os itens do combo foram preenchidos
                for (let item of comboItens) {
                    if (!item.ingresso_id || !item.quantidade || item.quantidade <= 0) {
                        alert('Todos os itens do combo devem ter ingresso e quantidade válidos');
                        return;
                    }
                }
                
                formData.set('conteudo_combo', JSON.stringify(comboItens));
            }
            
            // Ajustar checkboxes
            if (!document.getElementById('inputMeiaEntrada').checked) {
                formData.set('meia_entrada', '0');
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
                    alert('Erro ao salvar ingresso: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicação: ' + error);
            });
        }

        // Excluir ingresso
        function excluirIngresso(ingressoId) {
            if (confirm('Tem certeza que deseja excluir este ingresso?')) {
                fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `ajax_action=delete_ingresso&ingresso_id=${ingressoId}`
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        location.reload();
                    } else {
                        alert('Erro ao excluir ingresso: ' + result.message);
                    }
                })
                .catch(error => {
                    alert('Erro de comunicação: ' + error);
                });
            }
        }

        // Toggle ativo
        function toggleAtivo(ingressoId, checked) {
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ajax_action=toggle_ativo&ingresso_id=${ingressoId}&ativo=${checked ? 1 : 0}`
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

        // Reordenação por drag and drop (simplificado)
        let draggedElement = null;

        // Adicionar eventos de drag and drop
        document.addEventListener('DOMContentLoaded', function() {
            const tbody = document.getElementById('ingressos-tbody');
            if (tbody) {
                tbody.addEventListener('dragstart', function(e) {
                    if (e.target.classList.contains('drag-handle')) {
                        draggedElement = e.target.closest('tr');
                        e.dataTransfer.effectAllowed = 'move';
                    }
                });

                tbody.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });

                tbody.addEventListener('drop', function(e) {
                    e.preventDefault();
                    const targetRow = e.target.closest('tr');
                    
                    if (draggedElement && targetRow && draggedElement !== targetRow) {
                        const allRows = Array.from(tbody.querySelectorAll('tr'));
                        const draggedIndex = allRows.indexOf(draggedElement);
                        const targetIndex = allRows.indexOf(targetRow);
                        
                        if (draggedIndex < targetIndex) {
                            targetRow.parentNode.insertBefore(draggedElement, targetRow.nextSibling);
                        } else {
                            targetRow.parentNode.insertBefore(draggedElement, targetRow);
                        }
                        
                        // Atualizar posições no servidor
                        atualizarOrdemIngressos();
                    }
                    
                    draggedElement = null;
                });

                // Tornar as linhas arrastáveis
                tbody.querySelectorAll('.drag-handle').forEach(handle => {
                    handle.closest('tr').draggable = true;
                });
            }
        });

        // Atualizar ordem dos ingressos no servidor
        function atualizarOrdemIngressos() {
            const rows = document.querySelectorAll('#ingressos-tbody tr');
            const updates = [];
            
            rows.forEach((row, index) => {
                const ingressoId = row.getAttribute('data-ingresso-id');
                if (ingressoId) {
                    updates.push({
                        ingresso_id: ingressoId,
                        posicao_ordem: index + 1
                    });
                }
            });
            
            // Enviar atualizações para o servidor
            updates.forEach(update => {
                fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `ajax_action=update_ordem&ingresso_id=${update.ingresso_id}&posicao_ordem=${update.posicao_ordem}`
                })
                .catch(error => {
                    console.error('Erro ao atualizar ordem:', error);
                });
            });
        }

        // Fechar modal ao clicar no overlay
        document.getElementById('modalIngresso').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalIngresso();
            }
        });

        // Fechar modal ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                fecharModalIngresso();
            }
        });

        // Funções do header e menu
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
