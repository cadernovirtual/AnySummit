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

// Funções AJAX
function handleSaveIngresso($data, $usuario_id) {
    global $con, $lote_id, $evento_id;
    
    try {
        error_log("handleSaveIngresso iniciado - Dados recebidos: " . print_r($data, true));
        
        $ingresso_id = intval($data['ingresso_id'] ?? 0);
        $titulo = trim($data['titulo'] ?? '');
        $descricao = trim($data['descricao'] ?? '');
        $tipo = $data['tipo'] ?? '';
        $controlar_limite = intval($data['controlar_limite'] ?? 0);
        $quantidade_total = $controlar_limite ? intval($data['quantidade_total'] ?? 0) : 0;
        $preco = trim($data['preco'] ?? '0');
        $disponibilidade = $data['disponibilidade'] ?? 'publico';
        $setores_json = $data['setores'] ?? '[]';
        $conteudo_combo = $data['conteudo_combo'] ?? '[]';
        $posicao_ordem = intval($data['posicao_ordem'] ?? 0);
        
        error_log("Valores processados - titulo: $titulo, tipo: $tipo, preco: $preco, controlar_limite: $controlar_limite, quantidade_total: $quantidade_total");
        
        // Validações básicas
        if (!$titulo) {
            echo json_encode(['success' => false, 'message' => 'Título é obrigatório']);
            return;
        }
        
        if (!$tipo) {
            echo json_encode(['success' => false, 'message' => 'Tipo é obrigatório']);
            return;
        }
        
        if (!in_array($tipo, ['pago', 'gratuito', 'combo'])) {
            echo json_encode(['success' => false, 'message' => 'Tipo de ingresso inválido']);
            return;
        }
        
        // Validar quantidade se controle estiver ativo
        if ($controlar_limite) {
            if ($quantidade_total <= 0) {
                echo json_encode(['success' => false, 'message' => 'Quantidade deve ser maior que zero quando limite estiver ativo']);
                return;
            }
        } else {
            // Se controle não estiver ativo, força quantidade = 0
            $quantidade_total = 0;
        }
        
        // Validar e limpar valores monetários
        if ($tipo === 'pago' || $tipo === 'combo') {
            $preco = floatval($preco);
            if ($preco <= 0) {
                echo json_encode(['success' => false, 'message' => 'Preço deve ser maior que zero']);
                return;
            }
        } else {
            // Gratuito
            $preco = 0;
        }
    
    // Verificar se o lote pertence ao usuário e buscar dados do evento
    $sql_verificar_lote = "SELECT l.id, l.data_inicio, l.data_fim, e.contratante_id, e.repassar_taxa_para_comprador 
                           FROM lotes l 
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
    
    // Buscar taxa da plataforma do contratante
    $taxa_plataforma = 0;
    $valor_receber = 0;
    
    if (($tipo === 'pago' || $tipo === 'combo') && $lote_data['contratante_id']) {
        $sql_taxa = "SELECT taxa_plataforma FROM contratantes WHERE id = ?";
        $stmt_taxa = mysqli_prepare($con, $sql_taxa);
        mysqli_stmt_bind_param($stmt_taxa, "i", $lote_data['contratante_id']);
        mysqli_stmt_execute($stmt_taxa);
        $result_taxa = mysqli_stmt_get_result($stmt_taxa);
        $contratante = mysqli_fetch_assoc($result_taxa);
        
        if ($contratante) {
            $preco_float = floatval($preco);
            $taxa_percentual = floatval($contratante['taxa_plataforma']);
            $taxa_plataforma = ($preco_float * $taxa_percentual) / 100;
            
            // Calcular valor a receber baseado na configuração do evento
            if ($lote_data['repassar_taxa_para_comprador'] == 1) {
                $valor_receber = $preco_float; // Comprador paga a taxa
            } else {
                $valor_receber = $preco_float - $taxa_plataforma; // Vendedor absorve a taxa
            }
        }
    }
    
    // Ajustar valores para ingressos gratuitos
    if ($tipo === 'gratuito') {
        $preco = '0.00';
        $taxa_plataforma = '0.00';
        $valor_receber = '0.00';
    } else if ($tipo === 'pago' || $tipo === 'combo') {
        $preco = floatval($preco);
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
        
        // Verificar se há vendas realizadas (apenas para edição)
        if ($ingresso_id > 0) {
            $sql_check_vendas = "SELECT COUNT(*) as vendas FROM tb_itens_pedido WHERE ingresso_id = ?";
            $stmt_check_vendas = mysqli_prepare($con, $sql_check_vendas);
            mysqli_stmt_bind_param($stmt_check_vendas, "i", $ingresso_id);
            mysqli_stmt_execute($stmt_check_vendas);
            $result_vendas = mysqli_stmt_get_result($stmt_check_vendas);
            $vendas_data = mysqli_fetch_assoc($result_vendas);
            
            if ($vendas_data['vendas'] > 0) {
                echo json_encode(['success' => false, 'message' => 'Não é possível alterar combos que já possuem vendas realizadas']);
                return;
            }
        }
        
        // Verificar duplicatas e se os ingressos existem no mesmo lote
        $ingressos_ids = [];
        foreach ($combo_array as $item) {
            if (!isset($item['ingresso_id']) || !isset($item['quantidade'])) {
                echo json_encode(['success' => false, 'message' => 'Formato do combo inválido']);
                return;
            }
            
            $ingresso_combo_id = intval($item['ingresso_id']);
            
            // Verificar duplicata
            if (in_array($ingresso_combo_id, $ingressos_ids)) {
                echo json_encode(['success' => false, 'message' => 'O mesmo ingresso não pode ser duplicado no combo']);
                return;
            }
            $ingressos_ids[] = $ingresso_combo_id;
            
            // Verificar se ingresso existe no mesmo lote e não é combo
            $sql_check_ingresso = "SELECT tipo FROM ingressos WHERE id = ? AND lote_id = ?";
            $stmt_check_ingresso = mysqli_prepare($con, $sql_check_ingresso);
            mysqli_stmt_bind_param($stmt_check_ingresso, "ii", $ingresso_combo_id, $lote_id);
            mysqli_stmt_execute($stmt_check_ingresso);
            $result_check_ingresso = mysqli_stmt_get_result($stmt_check_ingresso);
            $ingresso_check = mysqli_fetch_assoc($result_check_ingresso);
            
            if (!$ingresso_check) {
                echo json_encode(['success' => false, 'message' => 'Ingresso do combo não encontrado no mesmo lote']);
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
        error_log("Atualizando ingresso ID: $ingresso_id");
        // Atualizar ingresso existente
        $sql = "UPDATE ingressos SET 
                titulo = ?, descricao = ?, tipo = ?, quantidade_total = ?, 
                preco = ?, taxa_plataforma = ?, valor_receber = ?,
                inicio_venda = ?, fim_venda = ?, limite_min = 1, limite_max = 5,
                disponibilidade = ?, meia_entrada = 0, nomenclatura_personalizada = '',
                setores = ?, conteudo_combo = ?, posicao_ordem = ?, atualizado_em = NOW()
                WHERE id = ? AND lote_id = ?";
        $stmt = mysqli_prepare($con, $sql);
        
        if (!$stmt) {
            error_log("Erro ao preparar UPDATE: " . mysqli_error($con));
            echo json_encode(['success' => false, 'message' => 'Erro ao preparar consulta UPDATE']);
            return;
        }
        
        mysqli_stmt_bind_param($stmt, "sssidddsssssiii", 
            $titulo, $descricao, $tipo, $quantidade_total,
            $preco, $taxa_plataforma, $valor_receber,
            $inicio_venda, $fim_venda,
            $disponibilidade,
            $setores_json, $conteudo_combo, $posicao_ordem, $ingresso_id, $lote_id
        );
    } else {
        error_log("Criando novo ingresso");
        // Criar novo ingresso
        $sql = "INSERT INTO ingressos (
                    evento_id, lote_id, titulo, descricao, tipo, quantidade_total,
                    preco, taxa_plataforma, valor_receber, inicio_venda, fim_venda,
                    limite_min, limite_max, disponibilidade, meia_entrada,
                    nomenclatura_personalizada, setores, conteudo_combo, posicao_ordem,
                    criado_em, atualizado_em
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5, ?, 0, '', ?, ?, ?, NOW(), NOW())";
        $stmt = mysqli_prepare($con, $sql);
        
        if (!$stmt) {
            error_log("Erro ao preparar INSERT: " . mysqli_error($con));
            echo json_encode(['success' => false, 'message' => 'Erro ao preparar consulta INSERT']);
            return;
        }
        
        mysqli_stmt_bind_param($stmt, "iisssidddsssssi", 
            $evento_id, $lote_id, $titulo, $descricao, $tipo, $quantidade_total,
            $preco, $taxa_plataforma, $valor_receber, $inicio_venda, $fim_venda,
            $disponibilidade, $setores_json, $conteudo_combo, $posicao_ordem
        );
    }
    
    if (mysqli_stmt_execute($stmt)) {
        error_log("Ingresso salvo com sucesso - ID: " . ($ingresso_id ?: mysqli_insert_id($con)));
        echo json_encode(['success' => true, 'message' => 'Ingresso salvo com sucesso']);
    } else {
        $error = mysqli_error($con);
        error_log("Erro ao executar SQL: " . $error);
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar ingresso: ' . $error]);
    }
    
    } catch (Exception $e) {
        error_log("Exception em handleSaveIngresso: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
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
        error_log("Erro AJAX: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    }
    exit;
}

// Verificar se o lote pertence ao usuário
$sql_verificar = "SELECT l.id, l.nome, l.data_inicio, l.data_fim, l.evento_id, e.nome as evento_nome, e.usuario_id, 
                         e.contratante_id, e.repassar_taxa_para_comprador, c.taxa_plataforma 
                  FROM lotes l 
                  INNER JOIN eventos e ON l.evento_id = e.id 
                  LEFT JOIN contratantes c ON e.contratante_id = c.id
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

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #B8B8C8;
        }

        .empty-state h3 {
            font-size: 24px;
            margin-bottom: 12px;
            color: #E0E0E8;
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: none;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .modal-overlay.show {
            display: flex;
        }

        .modal-container {
            background: rgba(42, 42, 56, 0.98);
            border-radius: 20px;
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            position: relative;
        }

        /* Barra de rolagem customizada para modais */
        .modal-container::-webkit-scrollbar {
            width: 8px;
        }

        .modal-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            margin: 20px 0;
        }

        .modal-container::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }

        .modal-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #00A8E6, #5B4BCC);
            box-shadow: 0 2px 10px rgba(0, 194, 255, 0.3);
        }

        .modal-container::-webkit-scrollbar-thumb:active {
            background: linear-gradient(135deg, #0094CC, #4A3BB3);
        }

        /* Para Firefox */
        .modal-container {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 194, 255, 0.7) rgba(255, 255, 255, 0.05);
        }

        .modal-header {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            padding: 20px 30px;
            border-radius: 20px 20px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            color: white;
            font-size: 20px;
            font-weight: 700;
            margin: 0;
        }

        .modal-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }

        .modal-body {
            padding: 30px;
        }

        .form-grid {
            display: grid;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .form-label {
            color: #E0E0E8;
            font-weight: 600;
            font-size: 14px;
        }

        .form-label.required::after {
            content: " *";
            color: #FF5252;
        }

        .form-input, .form-textarea, .form-select {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px 16px;
            color: #FFFFFF;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .form-select option {
            background: rgba(42, 42, 56, 0.98);
            color: #FFFFFF;
            padding: 8px;
        }

        .form-select optgroup {
            background: rgba(42, 42, 56, 0.98);
            color: #00C2FF;
            font-weight: 600;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
            outline: none;
            border-color: #00C2FF;
            box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.1);
        }

        .form-input:disabled, .form-select:disabled {
            background: rgba(255, 255, 255, 0.02) !important;
            border-color: rgba(255, 255, 255, 0.05) !important;
            color: #888899 !important;
            cursor: not-allowed;
        }

        .form-input:disabled::placeholder {
            color: #666677;
        }

        .form-textarea {
            resize: vertical;
            min-height: 80px;
        }

        .form-checkbox-group {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
        }

        .form-checkbox {
            width: 18px;
            height: 18px;
            accent-color: #00C2FF;
        }

        .tipo-section {
            display: none;
            padding: 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            margin-top: 20px;
        }

        .tipo-section.active {
            display: block;
        }

        .tipo-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tipo-tab {
            background: none;
            border: none;
            color: #B8B8C8;
            padding: 12px 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
        }

        .tipo-tab.active {
            color: #00C2FF;
            border-bottom-color: #00C2FF;
        }

        .setores-container {
            margin-top: 20px;
        }

        .setores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
            margin-top: 12px;
        }

        .setor-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .setor-item:hover {
            background: rgba(0, 194, 255, 0.1);
        }

        .setor-item.selected {
            background: rgba(0, 194, 255, 0.2);
            border: 1px solid rgba(0, 194, 255, 0.3);
        }

        .setores-selecionados {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
            min-height: 40px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            border: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .setor-badge {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .setor-badge .remove-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .combo-container {
            margin-top: 20px;
        }

        .combo-items {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 12px;
        }

        .combo-item {
            display: grid;
            grid-template-columns: 2fr 120px 100px;
            gap: 12px;
            align-items: center;
            padding: 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }

        .combo-item:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 193, 7, 0.3);
        }

        .combo-item .combo-select {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 8px 12px;
            color: #FFFFFF;
            font-size: 14px;
        }

        .combo-item .combo-select option {
            background: rgba(42, 42, 56, 0.98);
            color: #FFFFFF;
            padding: 8px;
        }

        .combo-item .combo-qty {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 8px 12px;
            color: #FFFFFF;
            font-size: 14px;
            text-align: center;
        }

        .combo-remove {
            background: rgba(255, 82, 82, 0.15);
            border: 1px solid rgba(255, 82, 82, 0.3);
            color: #FF5252;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            white-space: nowrap;
            transition: all 0.3s ease;
            text-align: center;
        }

        .combo-remove:hover {
            background: rgba(255, 82, 82, 0.25);
            transform: translateY(-1px);
        }

        .combo-add {
            background: rgba(255, 193, 7, 0.15);
            border: 1px solid rgba(255, 193, 7, 0.3);
            color: #FFC107;
            padding: 12px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            width: fit-content;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .combo-add:hover {
            background: rgba(255, 193, 7, 0.25);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
        }

        .combo-empty {
            text-align: center;
            padding: 30px 20px;
            border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #B8B8C8;
            background: rgba(255, 255, 255, 0.02);
        }

        .combo-resumo {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-top: 16px;
        }

        .combo-resumo h4 {
            color: #FFC107;
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
        }

        .combo-resumo-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 14px;
            color: #E0E0E8;
        }

        .combo-resumo-total {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            margin-top: 8px;
            border-top: 1px solid rgba(255, 193, 7, 0.2);
            font-weight: 600;
            color: #FFC107;
        }

        .combo-item-error {
            border-color: rgba(255, 82, 82, 0.5) !important;
            background: rgba(255, 82, 82, 0.05) !important;
        }

        .combo-item-error .combo-select,
        .combo-item-error .combo-qty {
            border-color: rgba(255, 82, 82, 0.3);
        }

        /* Sistema de Notificação */
        .notification-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: none;
            justify-content: center;
            align-items: center;
        }

        .notification-overlay.show {
            display: flex;
        }

        .notification-dialog {
            background: rgba(42, 42, 56, 0.98);
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            text-align: center;
        }

        .notification-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .notification-icon.success {
            color: #00C851;
        }

        .notification-icon.error {
            color: #FF5252;
        }

        .notification-icon.warning {
            color: #FFC107;
        }

        .notification-title {
            color: #FFFFFF;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .notification-message {
            color: #B8B8C8;
            font-size: 16px;
            margin-bottom: 24px;
            line-height: 1.5;
        }

        .notification-button {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .notification-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .modal-footer {
            padding: 20px 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #FFFFFF;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .btn-primary {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .help-text {
            color: #B8B8C8;
            font-size: 12px;
            margin-top: 4px;
        }

        .price-preview {
            background: rgba(0, 194, 255, 0.1);
            border: 1px solid rgba(0, 194, 255, 0.2);
            border-radius: 8px;
            padding: 12px;
            margin-top: 12px;
        }

        .price-preview h4 {
            color: #00C2FF;
            margin: 0 0 8px 0;
            font-size: 14px;
        }

        .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 14px;
        }

        .price-row.total {
            border-top: 1px solid rgba(0, 194, 255, 0.2);
            padding-top: 8px;
            margin-top: 8px;
            font-weight: 600;
            color: #00C2FF;
        }

        @media (max-width: 768px) {
            .modal-container {
                margin: 10px;
                max-width: none;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .setores-grid {
                grid-template-columns: 1fr;
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
                            <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">🎫</div>
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
                                    <th>Ativo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="ingressos-tbody">
                                <?php foreach ($ingressos as $index => $ingresso): ?>
                                <tr data-ingresso-id="<?php echo $ingresso['id']; ?>">
                                    <td>
                                        <span style="color: #888899; font-size: 12px;">
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
                                        <?php else: ?>
                                            <div style="font-size: 14px;">
                                                <strong>R$ <?php echo number_format($ingresso['preco'], 2, ',', '.'); ?></strong>
                                                <?php if ($ingresso['tipo'] === 'combo'): ?>
                                                    <div style="color: #FFC107; font-size: 12px; margin-top: 2px;">
                                                        📦 Combo
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        <?php endif; ?>
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

    <!-- Modal de Ingresso -->
    <div class="modal-overlay" id="modalIngresso">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitle">Novo Ingresso</h2>
                <button class="modal-close" onclick="fecharModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="formIngresso">
                    <input type="hidden" id="ingresso_id" name="ingresso_id">
                    
                    <!-- Informações Básicas -->
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label required">Título do Ingresso</label>
                            <input type="text" id="titulo" name="titulo" class="form-input" 
                                   placeholder="Ex: Ingresso Individual, VIP, Estudante..." required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Descrição</label>
                            <textarea id="descricao" name="descricao" class="form-textarea" 
                                      placeholder="Descrição detalhada do ingresso (opcional)"></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Tipo de Ingresso</label>
                                <select id="tipo" name="tipo" class="form-select" onchange="alterarTipoIngresso()" required>
                                    <option value="">Selecione o tipo</option>
                                    <option value="pago">💰 Pago</option>
                                    <option value="gratuito">🆓 Gratuito</option>
                                    <option value="combo">📦 Combo</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Disponibilidade</label>
                                <select id="disponibilidade" name="disponibilidade" class="form-select" onchange="alterarDisponibilidade()">
                                    <option value="publico">🌍 Disponível na Página de Vendas</option>
                                    <option value="convidados">👥 Exclusivo para Convidados/Cortesias</option>
                                </select>
                            </div>
                        </div>

                        <!-- Controle de Limite de Vendas -->
                        <div class="form-group">
                            <label class="form-label">Controle de Quantidade</label>
                            <div class="limite-switch-container" style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                                <label class="switch">
                                    <input type="checkbox" id="controlar_limite" name="controlar_limite" onchange="toggleLimiteQuantidade()">
                                    <span class="slider"></span>
                                </label>
                                <span style="color: #E0E0E8; font-size: 14px;">Limitar quantidade à venda</span>
                            </div>
                            <div class="help-text">Quando desativado, não há limite para a quantidade de vendas</div>
                        </div>

                        <div class="form-group" id="quantidade-container" style="display: none;">
                            <label class="form-label required">Quantidade Total</label>
                            <input type="number" id="quantidade_total" name="quantidade_total" class="form-input" 
                                   min="1" placeholder="100">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Posição de Ordenação</label>
                            <input type="number" id="posicao_ordem" name="posicao_ordem" class="form-input" 
                                   min="0" placeholder="0 = automático">
                            <div class="help-text">Deixe 0 para ordenação automática</div>
                        </div>
                    </div>

                    <!-- Seção: Ingresso Pago -->
                    <div id="secao-pago" class="tipo-section">
                        <h3 style="color: #00C851; margin-bottom: 20px;">💰 Configurações de Ingresso Pago</h3>
                        
                        <div class="form-group">
                            <label class="form-label required">Preço (R$)</label>
                            <input type="number" id="preco" name="preco" class="form-input" 
                                   step="0.01" min="0.01" placeholder="50.00" onchange="calcularValores()">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Taxa da Plataforma (R$)</label>
                                <input type="number" id="taxa_plataforma" name="taxa_plataforma" class="form-input" 
                                       step="0.01" min="0" readonly>
                                <div class="help-text">Calculado automaticamente baseado na configuração do contratante</div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Valor a Receber (R$)</label>
                                <input type="number" id="valor_receber" name="valor_receber" class="form-input" 
                                       step="0.01" min="0" readonly>
                                <div class="help-text">Calculado automaticamente baseado na configuração do evento</div>
                            </div>
                        </div>
                    </div>

                    <!-- Seção: Ingresso Gratuito -->
                    <div id="secao-gratuito" class="tipo-section">
                        <h3 style="color: #2196F3; margin-bottom: 20px;">🆓 Configurações de Ingresso Gratuito</h3>
                        <div style="background: rgba(33, 150, 243, 0.1); border: 1px solid rgba(33, 150, 243, 0.2); border-radius: 8px; padding: 16px; color: #2196F3;">
                            <strong>ℹ️ Informação:</strong> Ingressos gratuitos não possuem valores monetários. Todos os campos de preço serão automaticamente definidos como R$ 0,00.
                        </div>
                    </div>

                    <!-- Seção: Combo -->
                    <div id="secao-combo" class="tipo-section">
                        <h3 style="color: #FFC107; margin-bottom: 20px;">📦 Configurações de Combo</h3>
                        
                        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 8px; padding: 16px; color: #FFC107; margin-bottom: 20px;">
                            <strong>ℹ️ Sobre Combos:</strong> Combos agrupam diferentes ingressos do mesmo lote em um pacote. O preço deve ser definido independentemente dos itens inclusos.
                        </div>

                        <!-- Campos de preço para combo -->
                        <div class="form-group">
                            <label class="form-label required">Preço do Combo (R$)</label>
                            <input type="number" id="preco_combo" name="preco" class="form-input" 
                                   step="0.01" min="0.01" placeholder="100.00" onchange="calcularValoresCombo()">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Taxa da Plataforma (R$)</label>
                                <input type="number" id="taxa_plataforma_combo" name="taxa_plataforma" class="form-input" 
                                       step="0.01" min="0" readonly>
                                <div class="help-text">Calculado automaticamente baseado na configuração do contratante</div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Valor a Receber (R$)</label>
                                <input type="number" id="valor_receber_combo" name="valor_receber" class="form-input" 
                                       step="0.01" min="0" readonly>
                                <div class="help-text">Calculado automaticamente baseado na configuração do evento</div>
                            </div>
                        </div>

                        <div class="combo-container">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; margin-top: 20px;">
                                <label class="form-label required">Ingressos Inclusos no Combo</label>
                                <button type="button" class="combo-add" onclick="adicionarItemCombo()">
                                    ➕ Adicionar Ingresso
                                </button>
                            </div>
                            
                            <div id="combo-items" class="combo-items">
                                <!-- Items serão adicionados dinamicamente -->
                            </div>
                        </div>
                    </div>

                    <!-- Seção: Setores -->
                    <div class="setores-container">
                        <label class="form-label">Setores (Opcional)</label>
                        <div class="help-text">Selecione os setores onde este ingresso é válido</div>
                        
                        <div class="setores-grid" id="setores-grid">
                            <?php foreach ($setores as $setor): ?>
                            <div class="setor-item" data-setor-id="<?php echo $setor['setor_id']; ?>" 
                                 onclick="toggleSetor(<?php echo $setor['setor_id']; ?>, '<?php echo htmlspecialchars($setor['nome']); ?>')">
                                <input type="checkbox" class="setor-checkbox">
                                <span><?php echo htmlspecialchars($setor['nome']); ?></span>
                            </div>
                            <?php endforeach; ?>
                        </div>

                        <div class="setores-selecionados" id="setores-selecionados">
                            <div style="color: #B8B8C8; font-size: 14px; width: 100%; text-align: center; padding: 8px;">
                                Nenhum setor selecionado
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                <button type="button" class="btn-primary" onclick="salvarIngresso()" id="btn-salvar">
                    Salvar Ingresso
                </button>
            </div>
        </div>
    </div>

    <!-- Sistema de Notificação -->
    <div class="notification-overlay" id="notificationOverlay">
        <div class="notification-dialog">
            <div class="notification-icon" id="notificationIcon">ℹ️</div>
            <div class="notification-title" id="notificationTitle">Informação</div>
            <div class="notification-message" id="notificationMessage">Mensagem aqui</div>
            <button class="notification-button" onclick="fecharNotificacao()">OK</button>
        </div>
    </div>

    <script>
        // Variáveis globais
        const LOTE_ID = <?php echo $lote_id; ?>;
        const EVENTO_ID = <?php echo $evento_id; ?>;
        let setoresSelecionados = [];
        let ingressosCombo = [];
        let isEditMode = false;
        
        // Estado do modal
        let modalState = {
            setores: [],
            comboItems: [],
            ingressosDisponiveis: []
        };

        // === SISTEMA DE NOTIFICAÇÃO ===
        
        function mostrarNotificacao(tipo, titulo, mensagem) {
            const overlay = document.getElementById('notificationOverlay');
            const icon = document.getElementById('notificationIcon');
            const titleEl = document.getElementById('notificationTitle');
            const messageEl = document.getElementById('notificationMessage');
            
            // Definir ícone e estilo baseado no tipo
            switch(tipo) {
                case 'success':
                    icon.textContent = '✅';
                    icon.className = 'notification-icon success';
                    break;
                case 'error':
                    icon.textContent = '❌';
                    icon.className = 'notification-icon error';
                    break;
                case 'warning':
                    icon.textContent = '⚠️';
                    icon.className = 'notification-icon warning';
                    break;
                default:
                    icon.textContent = 'ℹ️';
                    icon.className = 'notification-icon';
            }
            
            titleEl.textContent = titulo;
            messageEl.textContent = mensagem;
            overlay.classList.add('show');
        }
        
        function fecharNotificacao() {
            document.getElementById('notificationOverlay').classList.remove('show');
        }
        
        // Substituir todos os alerts
        function alert(mensagem) {
            mostrarNotificacao('warning', 'Atenção', mensagem);
        }

        // Toggle dropdown
        function toggleDropdown(button) {
            const dropdown = button.nextElementSibling;
            document.querySelectorAll('.dropdown-content').forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });
            dropdown.classList.toggle('show');
        }

        // Toggle ativo
        function toggleAtivo(ingressoId, checked) {
            fetch('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `ajax_action=toggle_ativo&ingresso_id=${ingressoId}&ativo=${checked ? 1 : 0}`
            })
            .then(response => response.json())
            .then(result => {
                if (!result.success) {
                    mostrarNotificacao('error', 'Erro', result.message || 'Erro ao alterar status');
                    event.target.checked = !checked;
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                mostrarNotificacao('error', 'Erro', 'Erro de comunicação com o servidor');
                event.target.checked = !checked;
            });
        }

        // === FUNÇÕES DO MODAL ===

        // Abrir modal para novo ingresso
        function abrirModalIngresso() {
            isEditMode = false;
            document.getElementById('modalTitle').textContent = 'Novo Ingresso';
            document.getElementById('btn-salvar').textContent = 'Criar Ingresso';
            
            // Limpar formulário
            limparFormulario();
            
            // Mostrar modal
            document.getElementById('modalIngresso').classList.add('show');
            
            // Carregar ingressos para combo
            carregarIngressosCombo();
        }

        // Toggle do controle de limite
        function toggleLimiteQuantidade() {
            const checkbox = document.getElementById('controlar_limite');
            const container = document.getElementById('quantidade-container');
            const quantidadeInput = document.getElementById('quantidade_total');
            
            if (checkbox.checked) {
                container.style.display = 'block';
                quantidadeInput.required = true;
                quantidadeInput.value = quantidadeInput.value || 100;
            } else {
                container.style.display = 'none';
                quantidadeInput.required = false;
                quantidadeInput.value = '';
            }
        }

        // Editar ingresso existente
        function editarIngresso(id) {
            isEditMode = true;
            document.getElementById('modalTitle').textContent = 'Editar Ingresso';
            document.getElementById('btn-salvar').textContent = 'Salvar Alterações';
            
            // Buscar dados do ingresso
            fetch('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `ajax_action=get_ingresso_data&ingresso_id=${id}`
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    preencherFormulario(result.data);
                    document.getElementById('modalIngresso').classList.add('show');
                    carregarIngressosCombo();
                } else {
                    mostrarNotificacao('error', 'Erro', result.message || 'Erro ao carregar dados do ingresso');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                mostrarNotificacao('error', 'Erro', 'Erro de comunicação com o servidor');
            });
        }

        // Fechar modal
        function fecharModal() {
            document.getElementById('modalIngresso').classList.remove('show');
            limparFormulario();
        }

        // Limpar formulário
        function limparFormulario() {
            document.getElementById('formIngresso').reset();
            document.getElementById('ingresso_id').value = '';
            
            // Reabilitar campos para nova criação
            const tipoSelect = document.getElementById('tipo');
            const disponibilidadeSelect = document.getElementById('disponibilidade');
            
            tipoSelect.disabled = false;
            disponibilidadeSelect.disabled = false;
            
            // Remover estilos de campos desabilitados
            tipoSelect.style.background = '';
            tipoSelect.style.borderColor = '';
            tipoSelect.style.color = '';
            
            disponibilidadeSelect.style.background = '';
            disponibilidadeSelect.style.borderColor = '';
            disponibilidadeSelect.style.color = '';
            
            // Resetar controle de limite
            document.getElementById('controlar_limite').checked = false;
            document.getElementById('quantidade-container').style.display = 'none';
            document.getElementById('quantidade_total').required = false;
            
            // Resetar setores
            setoresSelecionados = [];
            document.querySelectorAll('.setor-item').forEach(item => {
                item.classList.remove('selected');
                item.querySelector('.setor-checkbox').checked = false;
            });
            atualizarSetoresSelecionados();
            
            // Resetar seções de tipo
            document.querySelectorAll('.tipo-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Limpar combo
            modalState.comboItems = [];
            atualizarComboItems();
        }

        // Preencher formulário com dados existentes
        function preencherFormulario(data) {
            document.getElementById('ingresso_id').value = data.id;
            document.getElementById('titulo').value = data.titulo || '';
            document.getElementById('descricao').value = data.descricao || '';
            document.getElementById('tipo').value = data.tipo || '';
            document.getElementById('disponibilidade').value = data.disponibilidade || 'publico';
            document.getElementById('posicao_ordem').value = data.posicao_ordem || '';
            
            // Desabilitar mudança de tipo e disponibilidade na edição
            document.getElementById('tipo').disabled = true;
            document.getElementById('disponibilidade').disabled = true;
            
            // Adicionar indicação visual para campos desabilitados
            document.getElementById('tipo').style.background = 'rgba(255, 255, 255, 0.02)';
            document.getElementById('tipo').style.borderColor = 'rgba(255, 255, 255, 0.05)';
            document.getElementById('tipo').style.color = '#888899';
            
            document.getElementById('disponibilidade').style.background = 'rgba(255, 255, 255, 0.02)';
            document.getElementById('disponibilidade').style.borderColor = 'rgba(255, 255, 255, 0.05)';
            document.getElementById('disponibilidade').style.color = '#888899';
            
            // Configurar controle de limite
            const temLimite = data.quantidade_total > 0;
            document.getElementById('controlar_limite').checked = temLimite;
            
            if (temLimite) {
                document.getElementById('quantidade-container').style.display = 'block';
                document.getElementById('quantidade_total').required = true;
                document.getElementById('quantidade_total').value = data.quantidade_total;
            } else {
                document.getElementById('quantidade-container').style.display = 'none';
                document.getElementById('quantidade_total').required = false;
            }
            
            // Preencher campos de preço se for pago ou combo
            if (data.tipo === 'pago') {
                document.getElementById('preco').value = parseFloat(data.preco || 0).toFixed(2);
                document.getElementById('taxa_plataforma').value = parseFloat(data.taxa_plataforma || 0).toFixed(2);
                document.getElementById('valor_receber').value = parseFloat(data.valor_receber || 0).toFixed(2);
            } else if (data.tipo === 'combo') {
                document.getElementById('preco_combo').value = parseFloat(data.preco || 0).toFixed(2);
                document.getElementById('taxa_plataforma_combo').value = parseFloat(data.taxa_plataforma || 0).toFixed(2);
                document.getElementById('valor_receber_combo').value = parseFloat(data.valor_receber || 0).toFixed(2);
            }
            
            // Processar setores
            if (data.setores) {
                try {
                    const setores = JSON.parse(data.setores);
                    setoresSelecionados = setores;
                    
                    // Marcar setores selecionados
                    setores.forEach(setor => {
                        const setorElement = document.querySelector(`[data-setor-id="${setor.setor_id}"]`);
                        if (setorElement) {
                            setorElement.classList.add('selected');
                            setorElement.querySelector('.setor-checkbox').checked = true;
                        }
                    });
                    
                    atualizarSetoresSelecionados();
                } catch (e) {
                    console.error('Erro ao processar setores:', e);
                }
            }
            
            // Processar combo
            if (data.tipo === 'combo' && data.conteudo_combo) {
                try {
                    const comboItems = JSON.parse(data.conteudo_combo);
                    modalState.comboItems = comboItems;
                } catch (e) {
                    console.error('Erro ao processar combo:', e);
                }
            }
            
            // Mostrar seção apropriada do tipo
            alterarTipoIngresso();
            
            // Aplicar regras de disponibilidade
            alterarDisponibilidade();
        }

        // Alterar tipo de ingresso
        function alterarTipoIngresso() {
            const tipo = document.getElementById('tipo').value;
            const disponibilidade = document.getElementById('disponibilidade').value;
            
            // Ocultar todas as seções
            document.querySelectorAll('.tipo-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Verificar se é para convidados/cortesias - força tipo gratuito
            if (disponibilidade === 'convidados' && tipo !== 'gratuito') {
                document.getElementById('tipo').value = 'gratuito';
                alterarTipoIngresso(); // Recursiva para aplicar a mudança
                return;
            }
            
            // Mostrar seção específica
            if (tipo) {
                const secao = document.getElementById(`secao-${tipo}`);
                if (secao) {
                    secao.classList.add('active');
                }
                
                // Se for combo, carregar items
                if (tipo === 'combo') {
                    atualizarComboItems();
                    calcularValoresCombo();
                }
                
                // Se for pago, calcular valores
                if (tipo === 'pago') {
                    calcularValores();
                }
            }
        }

        // Alterar disponibilidade
        function alterarDisponibilidade() {
            const disponibilidade = document.getElementById('disponibilidade').value;
            const tipoSelect = document.getElementById('tipo');
            
            if (disponibilidade === 'convidados') {
                // Força tipo gratuito para convidados/cortesias
                tipoSelect.value = 'gratuito';
                
                // Desabilita as opções pago e combo
                const opcoes = tipoSelect.querySelectorAll('option');
                opcoes.forEach(opcao => {
                    if (opcao.value === 'pago' || opcao.value === 'combo') {
                        opcao.disabled = true;
                        opcao.style.color = '#888899';
                    } else {
                        opcao.disabled = false;
                        opcao.style.color = '';
                    }
                });
                
                // Desabilita o próprio select para impedir mudanças
                tipoSelect.disabled = true;
                
                // Aplica a mudança de tipo
                alterarTipoIngresso();
                
                // Adiciona uma indicação visual
                tipoSelect.style.background = 'rgba(33, 150, 243, 0.1)';
                tipoSelect.style.borderColor = 'rgba(33, 150, 243, 0.3)';
                
            } else {
                // Habilita o select novamente
                tipoSelect.disabled = false;
                
                // Habilita todas as opções novamente
                const opcoes = tipoSelect.querySelectorAll('option');
                opcoes.forEach(opcao => {
                    opcao.disabled = false;
                    opcao.style.color = '';
                });
                
                // Remove a indicação visual
                tipoSelect.style.background = '';
                tipoSelect.style.borderColor = '';
            }
        }

        // Calcular valores para ingresso pago
        function calcularValores() {
            const preco = parseFloat(document.getElementById('preco').value) || 0;
            
            if (preco > 0) {
                // Buscar dados do evento via PHP (disponível globalmente)
                const taxaPercentual = <?php echo $lote['taxa_plataforma'] ? floatval($lote['taxa_plataforma']) : 10; ?>;
                const repassarTaxa = <?php echo $lote['repassar_taxa_para_comprador'] ? 1 : 0; ?>;
                
                const taxa = (preco * taxaPercentual) / 100;
                const valor_receber = repassarTaxa ? preco : (preco - taxa);
                
                document.getElementById('taxa_plataforma').value = taxa.toFixed(2);
                document.getElementById('valor_receber').value = valor_receber.toFixed(2);
            } else {
                document.getElementById('taxa_plataforma').value = '0.00';
                document.getElementById('valor_receber').value = '0.00';
            }
        }

        // Calcular valores para combo
        function calcularValoresCombo() {
            const preco = parseFloat(document.getElementById('preco_combo').value) || 0;
            
            if (preco > 0) {
                // Buscar dados do evento via PHP (disponível globalmente)
                const taxaPercentual = <?php echo $lote['taxa_plataforma'] ? floatval($lote['taxa_plataforma']) : 10; ?>;
                const repassarTaxa = <?php echo $lote['repassar_taxa_para_comprador'] ? 1 : 0; ?>;
                
                const taxa = (preco * taxaPercentual) / 100;
                const valor_receber = repassarTaxa ? preco : (preco - taxa);
                
                document.getElementById('taxa_plataforma_combo').value = taxa.toFixed(2);
                document.getElementById('valor_receber_combo').value = valor_receber.toFixed(2);
            } else {
                document.getElementById('taxa_plataforma_combo').value = '0.00';
                document.getElementById('valor_receber_combo').value = '0.00';
            }
        }

        // === GESTÃO DE SETORES ===

        function toggleSetor(setorId, setorNome) {
            const setorElement = document.querySelector(`[data-setor-id="${setorId}"]`);
            const checkbox = setorElement.querySelector('.setor-checkbox');
            
            if (setorElement.classList.contains('selected')) {
                // Remover setor
                setorElement.classList.remove('selected');
                checkbox.checked = false;
                setoresSelecionados = setoresSelecionados.filter(s => s.setor_id != setorId);
            } else {
                // Adicionar setor
                setorElement.classList.add('selected');
                checkbox.checked = true;
                setoresSelecionados.push({
                    setor_id: setorId,
                    nome: setorNome
                });
            }
            
            atualizarSetoresSelecionados();
        }

        function atualizarSetoresSelecionados() {
            const container = document.getElementById('setores-selecionados');
            
            if (setoresSelecionados.length === 0) {
                container.innerHTML = `
                    <div style="color: #B8B8C8; font-size: 14px; width: 100%; text-align: center; padding: 8px;">
                        Nenhum setor selecionado
                    </div>
                `;
            } else {
                container.innerHTML = setoresSelecionados.map(setor => `
                    <div class="setor-badge">
                        ${setor.nome}
                        <button type="button" class="remove-btn" onclick="removerSetor(${setor.setor_id})">&times;</button>
                    </div>
                `).join('');
            }
        }

        function removerSetor(setorId) {
            setoresSelecionados = setoresSelecionados.filter(s => s.setor_id != setorId);
            
            const setorElement = document.querySelector(`[data-setor-id="${setorId}"]`);
            if (setorElement) {
                setorElement.classList.remove('selected');
                setorElement.querySelector('.setor-checkbox').checked = false;
            }
            
            atualizarSetoresSelecionados();
        }

        // === GESTÃO DE COMBOS ===

        function carregarIngressosCombo() {
            fetch('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'ajax_action=get_ingressos_combo'
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    modalState.ingressosDisponiveis = result.ingressos;
                    atualizarComboItems();
                }
            })
            .catch(error => {
                console.error('Erro ao carregar ingressos:', error);
            });
        }

        function adicionarItemCombo() {
            modalState.comboItems.push({
                ingresso_id: '',
                quantidade: 1
            });
            atualizarComboItems();
        }

        function removerItemCombo(index) {
            modalState.comboItems.splice(index, 1);
            atualizarComboItems();
        }

        function atualizarComboItems() {
            const container = document.getElementById('combo-items');
            
            if (modalState.comboItems.length === 0) {
                container.innerHTML = `
                    <div class="combo-empty">
                        <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">📦</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Nenhum ingresso no combo</div>
                        <div style="font-size: 14px;">Adicione ingressos para formar seu combo</div>
                    </div>
                `;
                return;
            }
            
            // Obter IDs já selecionados para excluir das opções
            const idsJaSelecionados = modalState.comboItems
                .map(item => item.ingresso_id)
                .filter(id => id); // Remover valores vazios
            
            container.innerHTML = modalState.comboItems.map((item, index) => {
                const ingressoSelecionado = modalState.ingressosDisponiveis.find(ing => ing.id == item.ingresso_id);
                const isDuplicado = idsJaSelecionados.filter(id => id == item.ingresso_id).length > 1;
                
                // Filtrar ingressos disponíveis (excluir os já selecionados, exceto o atual)
                const ingressosParaExibir = modalState.ingressosDisponiveis.filter(ing => {
                    return !idsJaSelecionados.includes(ing.id) || ing.id == item.ingresso_id;
                });
                
                return `
                    <div class="combo-item ${isDuplicado ? 'combo-item-error' : ''}">
                        <select class="combo-select" onchange="modalState.comboItems[${index}].ingresso_id = this.value; atualizarComboItems();" required>
                            <option value="">Selecione o ingresso</option>
                            ${ingressosParaExibir.map(ing => `
                                <option value="${ing.id}" ${ing.id == item.ingresso_id ? 'selected' : ''}>
                                    ${ing.titulo} ${ing.tipo === 'pago' ? `(R$ ${parseFloat(ing.preco).toFixed(2).replace('.', ',')})` : '(Gratuito)'}
                                </option>
                            `).join('')}
                        </select>
                        <input type="number" class="combo-qty" min="1" value="${item.quantidade}" 
                               onchange="modalState.comboItems[${index}].quantidade = parseInt(this.value);"
                               placeholder="Qtd" required>
                        <button type="button" class="combo-remove" onclick="removerItemCombo(${index})">
                            🗑️ Remover
                        </button>
                    </div>
                    ${isDuplicado ? '<div style="color: #FF5252; font-size: 12px; margin-top: 4px; margin-left: 16px;">⚠️ Ingresso duplicado</div>' : ''}
                `;
            }).join('');
        }

        // === SALVAR INGRESSO ===

        function salvarIngresso() {
            // Validações
            if (!validarFormulario()) {
                return;
            }
            
            // Preparar dados sem usar FormData para evitar duplicações
            const dados = prepararDados();
            
            // Enviar dados
            const btnSalvar = document.getElementById('btn-salvar');
            btnSalvar.disabled = true;
            btnSalvar.textContent = 'Salvando...';
            
            fetch('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: dados
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    mostrarNotificacao('success', 'Sucesso', 'Ingresso salvo com sucesso!');
                    setTimeout(() => {
                        fecharModal();
                        location.reload();
                    }, 1500);
                } else {
                    mostrarNotificacao('error', 'Erro', result.message || 'Erro ao salvar ingresso');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                mostrarNotificacao('error', 'Erro', 'Erro de comunicação com o servidor');
            })
            .finally(() => {
                btnSalvar.disabled = false;
                btnSalvar.textContent = isEditMode ? 'Salvar Alterações' : 'Criar Ingresso';
            });
        }

        function validarFormulario() {
            const titulo = document.getElementById('titulo').value.trim();
            const tipoElement = document.getElementById('tipo');
            const tipo = tipoElement.value;
            const controlarLimite = document.getElementById('controlar_limite').checked;
            const quantidade = parseInt(document.getElementById('quantidade_total').value);
            
            if (!titulo) {
                alert('Título é obrigatório');
                return false;
            }
            
            // Só validar tipo se não estiver disabled (modo edição)
            if (!tipoElement.disabled && !tipo) {
                alert('Tipo de ingresso é obrigatório');
                return false;
            }
            
            // Validar quantidade se controle estiver ativo
            if (controlarLimite && (!quantidade || quantidade <= 0)) {
                alert('Quantidade deve ser maior que zero quando limite estiver ativo');
                return false;
            }
            
            if (tipo === 'pago') {
                const preco = parseFloat(document.getElementById('preco').value);
                if (!preco || preco <= 0) {
                    alert('Preço deve ser maior que zero para ingressos pagos');
                    return false;
                }
            }
            
            if (tipo === 'combo') {
                const precoCombo = parseFloat(document.getElementById('preco_combo').value);
                if (!precoCombo || precoCombo <= 0) {
                    alert('Preço deve ser maior que zero para combos');
                    return false;
                }
                
                if (modalState.comboItems.length === 0) {
                    alert('Combo deve ter pelo menos um ingresso');
                    return false;
                }
                
                // Verificar duplicatas
                const idsUsados = [];
                for (let item of modalState.comboItems) {
                    if (!item.ingresso_id || !item.quantidade || item.quantidade <= 0) {
                        alert('Todos os itens do combo devem ter ingresso e quantidade válidos');
                        return false;
                    }
                    
                    if (idsUsados.includes(item.ingresso_id)) {
                        alert('O mesmo ingresso não pode ser duplicado no combo');
                        return false;
                    }
                    idsUsados.push(item.ingresso_id);
                }
            }
            
            return true;
        }

        function prepararDados(formData) {
            const params = new URLSearchParams();
            params.append('ajax_action', 'save_ingresso');
            
            const tipo = document.getElementById('tipo').value;
            
            // Campos básicos sempre incluídos
            const camposBasicos = [
                'ingresso_id', 'titulo', 'descricao', 'disponibilidade', 
                'posicao_ordem'
            ];
            
            camposBasicos.forEach(campo => {
                const elemento = document.getElementById(campo);
                if (elemento) {
                    params.append(campo, elemento.value || '');
                }
            });
            
            // Controle de limite - converter checkbox para valor numérico
            const controlarLimite = document.getElementById('controlar_limite').checked;
            params.append('controlar_limite', controlarLimite ? '1' : '0');
            
            // Quantidade total - só enviar se controle estiver ativo
            if (controlarLimite) {
                const quantidade = document.getElementById('quantidade_total').value;
                params.append('quantidade_total', quantidade || '0');
            } else {
                params.append('quantidade_total', '0');
            }
            
            // Adicionar tipo sempre
            params.append('tipo', tipo);
            
            // Campos específicos por tipo
            if (tipo === 'pago') {
                params.append('preco', document.getElementById('preco').value || '0');
                params.append('taxa_plataforma', document.getElementById('taxa_plataforma').value || '0');
                params.append('valor_receber', document.getElementById('valor_receber').value || '0');
            } else if (tipo === 'combo') {
                params.append('preco', document.getElementById('preco_combo').value || '0');
                params.append('taxa_plataforma', document.getElementById('taxa_plataforma_combo').value || '0');
                params.append('valor_receber', document.getElementById('valor_receber_combo').value || '0');
            } else if (tipo === 'gratuito') {
                params.append('preco', '0');
                params.append('taxa_plataforma', '0');
                params.append('valor_receber', '0');
            }
            
            // Setores
            params.append('setores', JSON.stringify(setoresSelecionados));
            
            // Combo
            if (tipo === 'combo') {
                params.append('conteudo_combo', JSON.stringify(modalState.comboItems));
            } else {
                params.append('conteudo_combo', '[]');
            }
            
            // Debug: log dos dados enviados
            console.log('Dados sendo enviados:', params.toString());
            
            return params.toString();
        }

        function excluirIngresso(id) {
            mostrarNotificacao('warning', 'Confirmar Exclusão', 'Tem certeza que deseja excluir este ingresso?');
            
            // Modificar o botão da notificação para confirmar
            const notificationButton = document.querySelector('.notification-button');
            notificationButton.textContent = 'Confirmar';
            notificationButton.onclick = function() {
                fecharNotificacao();
                
                fetch('', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `ajax_action=delete_ingresso&ingresso_id=${id}`
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        mostrarNotificacao('success', 'Sucesso', 'Ingresso excluído com sucesso!');
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        mostrarNotificacao('error', 'Erro', result.message || 'Erro ao excluir ingresso');
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    mostrarNotificacao('error', 'Erro', 'Erro de comunicação com o servidor');
                });
            };
        }

        // Fechar modal ao clicar fora
        document.getElementById('modalIngresso').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModal();
            }
        });

        // Funções do header
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

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.actions-dropdown')) {
                document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
            }
        });
    </script>
</body>
</html>
