<?php
/**
 * API para gerenciar salvamento por etapas do wizard de criação de eventos
 * 
 * Este arquivo gerencia:
 * - Criação de novo evento em rascunho
 * - Salvamento de cada etapa do wizard
 * - Retomada de evento em rascunho
 * - Publicação final do evento
 */

// Iniciar buffer de output para evitar headers já enviados
ob_start();

// Configurar relatório de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../conm/conn.php';
session_start();

// Headers para CORS e JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar se usuário está logado
if (!isset($_SESSION['usuarioid'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não autenticado']);
    exit;
}

$usuario_id = $_SESSION['usuarioid'];
$contratante_id = $_SESSION['contratanteid'] ?? null;
$action = $_POST['action'] ?? $_GET['action'] ?? '';

error_log("wizard_evento.php - Action: $action, Usuario: $usuario_id");

switch ($action) {
    case 'verificar_rascunho':
        verificarRascunho($con, $usuario_id);
        break;
        
    case 'excluir_rascunho':
        excluirRascunho($con, $usuario_id);
        break;
        
    case 'iniciar_evento':
        iniciarEvento($con, $usuario_id, $contratante_id);
        break;
        
    case 'retomar_evento':
        retomarEvento($con, $usuario_id);
        break;
        
    case 'salvar_etapa':
        salvarEtapa($con, $usuario_id);
        break;
        
    case 'publicar_evento':
        publicarEvento($con, $usuario_id);
        break;
        
    case 'obter_tipo_lote':
        obterTipoLote($con, $usuario_id);
        break;
        
    case 'obter_datas_lote':
        obterDatasLote($con, $usuario_id);
        break;
        
    case 'obter_dados_ingresso':
        obterDadosIngresso($con, $usuario_id);
        break;
        
    case 'obter_dados_lote':
        obterDadosLote($con, $usuario_id);
        break;
        
    case 'pausar_evento':
        pausarEvento($con, $usuario_id);
        break;
        
    case 'salvar_ingresso_individual':
        salvarIngressoIndividual($con, $usuario_id);
        break;
        
    case 'excluir_ingresso':
        excluirIngresso($con, $usuario_id);
        break;
        
    case 'verificar_referencia_combo':
        verificarReferenciaCombo($con, $usuario_id);
        break;
        
    case 'salvar_lote_individual':
        salvarLoteIndividual($con, $usuario_id);
        break;
        
    case 'salvar_lote':
        salvarLote($con, $usuario_id);
        break;
        
    case 'excluir_lote':
        excluirLote($con, $usuario_id);
        break;
        
    case 'verificar_ingressos_lote':
        verificarIngressosLote($con, $usuario_id);
        break;
        
    case 'listar_ingressos_para_combo':
        listarIngressosParaCombo($con, $usuario_id);
        break;
        
    case 'recuperar_evento':
        recuperarDadosCompletos($con, $usuario_id);
        break;
        
    case 'buscar_lote':
        buscarLoteEspecifico($con, $usuario_id);
        break;
    
    case 'atualizar_lote':
        atualizarLoteEspecifico($con, $usuario_id);
        break;
    
    case 'excluir_lotes_quantidade':
        excluirLotesQuantidade($con, $usuario_id);
        break;
    
    case 'excluir_lote_especifico':
        excluirLoteEspecifico($con, $usuario_id);
        break;
    
    case 'salvar_limite_vendas':
        salvarLimiteVendas($con, $usuario_id);
        break;
    
    case 'carregar_limite_vendas':
        carregarLimiteVendas($con, $usuario_id);
        break;
    
    case 'carregar_lotes_quantidade':
        carregarLotesQuantidade($con, $usuario_id);
        break;
    
    case 'criar_lote_data':
        criarLoteData($con, $usuario_id);
        break;
    
    case 'criar_lote_percentual':
        criarLotePercentual($con, $usuario_id);
        break;
        
    case 'criar_lotes_percentual':
        criarLotesPercentual($con, $usuario_id);
        break;
    
    case 'criar_lote_data_com_renomeacao':
        criarLoteDataComRenomeacao($con, $usuario_id);
        break;
    
    case 'criar_lote_quantidade_com_renomeacao':
        criarLoteQuantidadeComRenomeacao($con, $usuario_id);
        break;
    
    case 'recuperar_evento_simples':
        recuperarEventoSimples($con, $usuario_id);
        break;
    
    case 'atualizar_lote_especifico':
        atualizarLoteEspecificoCompleto($con, $usuario_id);
        break;
    
    case 'buscar_lote_especifico':
        buscarLoteEspecificoCompleto($con, $usuario_id);
        break;
    
    case 'recuperar_evento':
        recuperarDadosEventoCompleto($con, $usuario_id);
        break;
        
    case 'renomear_lotes_sequencial':
        renomearLotesSequencial($con, $usuario_id);
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['erro' => 'Ação não reconhecida']);
}

/**
 * Inicia um novo evento em rascunho ou retorna um existente
 */
function iniciarEvento($con, $usuario_id, $contratante_id) {
    // Verificar se já existe um rascunho não finalizado
    $sql = "SELECT id, nome FROM eventos 
            WHERE usuario_id = ? 
            AND status = 'rascunho' 
            ORDER BY criado_em DESC 
            LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        // Já existe um rascunho, retornar ele
        echo json_encode([
            'sucesso' => true,
            'evento_id' => $row['id'],
            'nome' => $row['nome'],
            'mensagem' => 'Evento em rascunho encontrado'
        ]);
    } else {
        // Criar novo evento em rascunho
        $nome_temp = "Novo Evento - " . date('d/m/Y H:i');
        $slug_temp = "evento-" . $usuario_id . "-" . time();
        
        $sql = "INSERT INTO eventos (
                    usuario_id, 
                    contratante_id, 
                    nome, 
                    slug, 
                    status, 
                    criado_em,
                    data_inicio
                ) VALUES (?, ?, ?, ?, 'rascunho', NOW(), NOW())";
        
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "iiss", $usuario_id, $contratante_id, $nome_temp, $slug_temp);
        
        if (mysqli_stmt_execute($stmt)) {
            $evento_id = mysqli_insert_id($con);
            echo json_encode([
                'sucesso' => true,
                'evento_id' => $evento_id,
                'mensagem' => 'Novo evento criado em rascunho'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar evento: ' . mysqli_error($con)]);
        }
    }
}

/**
 * Retoma um evento específico em rascunho
 */
function retomarEvento($con, $usuario_id) {
    $evento_id = $_POST['evento_id'] ?? 0;
    
    $sql = "SELECT * FROM eventos 
            WHERE id = ? 
            AND usuario_id = ? 
            AND status IN ('rascunho', 'pausado')";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($evento = mysqli_fetch_assoc($result)) {
        // Buscar lotes
        $sql_lotes = "SELECT * FROM lotes WHERE evento_id = ? ORDER BY id";
        $stmt_lotes = mysqli_prepare($con, $sql_lotes);
        mysqli_stmt_bind_param($stmt_lotes, "i", $evento_id);
        mysqli_stmt_execute($stmt_lotes);
        $lotes = mysqli_fetch_all(mysqli_stmt_get_result($stmt_lotes), MYSQLI_ASSOC);
        
        // Buscar ingressos
        $sql_ingressos = "SELECT * FROM ingressos WHERE evento_id = ? ORDER BY posicao_ordem, id";
        $stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
        mysqli_stmt_bind_param($stmt_ingressos, "i", $evento_id);
        mysqli_stmt_execute($stmt_ingressos);
        $ingressos = mysqli_fetch_all(mysqli_stmt_get_result($stmt_ingressos), MYSQLI_ASSOC);
        
        echo json_encode([
            'sucesso' => true,
            'evento' => $evento,
            'lotes' => $lotes,
            'ingressos' => $ingressos
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['erro' => 'Evento não encontrado ou sem permissão']);
    }
}

/**
 * Salva dados de uma etapa específica
 */
function salvarEtapa($con, $usuario_id) {
    $evento_id = $_POST['evento_id'] ?? 0;
    $etapa = $_POST['etapa'] ?? 0;
    
    // Verificar permissão
    if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Sem permissão para editar este evento']);
        return;
    }
    
    mysqli_begin_transaction($con);
    
    try {
        switch ($etapa) {
            case 1:
                salvarEtapa1($con, $evento_id);
                break;
            case 2:
                salvarEtapa2($con, $evento_id);
                break;
            case 3:
                salvarEtapa3($con, $evento_id);
                break;
            case 4:
                salvarEtapa4($con, $evento_id);
                break;
            case 5:
                salvarEtapa5($con, $evento_id);
                break;
            case 6:
                salvarEtapa6($con, $evento_id);
                break;
            case 7:
                salvarEtapa7($con, $evento_id);
                break;
            case 8:
                salvarEtapa8($con, $evento_id);
                break;
            default:
                throw new Exception('Etapa inválida');
        }
        
        mysqli_commit($con);
        echo json_encode(['sucesso' => true, 'mensagem' => "Etapa $etapa salva com sucesso"]);
        
    } catch (Exception $e) {
        mysqli_rollback($con);
        error_log("ERRO na salvarEtapa: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode(['erro' => $e->getMessage()]);
    }
}

/**
 * Etapa 1: Informações básicas
 */
function salvarEtapa1($con, $evento_id) {
    $nome = $_POST['nome'] ?? '';
    $cor_fundo = $_POST['cor_fundo'] ?? '#000000';
    $logo_evento = $_POST['logo_evento'] ?? '';
    $imagem_capa = $_POST['imagem_capa'] ?? '';
    $imagem_fundo = $_POST['imagem_fundo'] ?? '';
    
    $sql = "UPDATE eventos SET 
            nome = ?,
            cor_fundo = ?,
            logo_evento = ?,
            imagem_capa = ?,
            imagem_fundo = ?,
            slug = ?,
            atualizado_em = NOW()
            WHERE id = ?";
    
    // Gerar slug a partir do nome
    $slug = gerarSlug($nome) . '-' . $evento_id;
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ssssssi",
        $nome, $cor_fundo,
        $logo_evento, $imagem_capa, $imagem_fundo, $slug, $evento_id
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao salvar etapa 1: ' . mysqli_error($con));
    }
}

/**
 * Etapa 2: Data e horário
 */
function salvarEtapa2($con, $evento_id) {
    $categoria_id = $_POST['categoria_id'] ?? null;
    $classificacao = $_POST['classificacao'] ?? 'livre';
    $data_inicio = $_POST['data_inicio'] ?? '';
    $data_fim = $_POST['data_fim'] ?? $data_inicio;
    $evento_multiplos_dias = ($data_inicio != $data_fim) ? 1 : 0;
    
    $sql = "UPDATE eventos SET 
            categoria_id = ?,
            classificacao = ?,
            data_inicio = ?,
            data_fim = ?,
            evento_multiplos_dias = ?,
            atualizado_em = NOW()
            WHERE id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "isssii",
        $categoria_id, $classificacao, $data_inicio, $data_fim, $evento_multiplos_dias, $evento_id
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao salvar etapa 2: ' . mysqli_error($con));
    }
}

/**
 * Etapa 3: Descrição
 */
function salvarEtapa3($con, $evento_id) {
    $descricao = $_POST['descricao'] ?? '';
    
    $sql = "UPDATE eventos SET 
            descricao = ?,
            atualizado_em = NOW()
            WHERE id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "si", $descricao, $evento_id);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao salvar etapa 3: ' . mysqli_error($con));
    }
}

/**
 * Etapa 4: Localização
 */
function salvarEtapa4($con, $evento_id) {
    $tipo_local = $_POST['tipo_local'] ?? 'presencial';
    
    if ($tipo_local == 'online') {
        $sql = "UPDATE eventos SET 
                tipo_local = 'online',
                link_online = ?,
                nome_local = NULL,
                busca_endereco = NULL,
                cep = NULL,
                rua = NULL,
                numero = NULL,
                complemento = NULL,
                bairro = NULL,
                cidade = NULL,
                estado = NULL,
                latitude = NULL,
                longitude = NULL,
                atualizado_em = NOW()
                WHERE id = ?";
        
        $link_online = $_POST['link_online'] ?? '';
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "si", $link_online, $evento_id);
    } else {
        $sql = "UPDATE eventos SET 
                tipo_local = 'presencial',
                link_online = NULL,
                nome_local = ?,
                busca_endereco = ?,
                cep = ?,
                rua = ?,
                numero = ?,
                complemento = ?,
                bairro = ?,
                cidade = ?,
                estado = ?,
                latitude = ?,
                longitude = ?,
                atualizado_em = NOW()
                WHERE id = ?";
        
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "sssssssssddi", 
            $_POST['nome_local'],
            $_POST['busca_endereco'],
            $_POST['cep'],
            $_POST['rua'],
            $_POST['numero'],
            $_POST['complemento'],
            $_POST['bairro'],
            $_POST['cidade'],
            $_POST['estado'],
            $_POST['latitude'],
            $_POST['longitude'],
            $evento_id
        );
    }
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao salvar etapa 4: ' . mysqli_error($con));
    }
}

/**
 * Etapa 5: Lotes
 */
function salvarEtapa5($con, $evento_id) {
    error_log("=== SALVANDO ETAPA 5 ===");
    error_log("POST data: " . print_r($_POST, true));
    
    $lotes = json_decode($_POST['lotes'] ?? '[]', true);
    
    error_log("Lotes decodificados: " . print_r($lotes, true));
    
    // ⚠️ IMPORTANTE: Só deletar lotes existentes se há novos lotes para inserir
    // Isso previne a exclusão acidental de lotes quando não há dados para salvar
    if (empty($lotes)) {
        error_log("⚠️ Nenhum lote fornecido - não excluindo lotes existentes");
        return; // Não fazer nada se não há lotes
    }
    
    error_log("📦 Processando " . count($lotes) . " lotes - excluindo existentes primeiro");
    
    // OBTER LOTES EXISTENTES PARA FAZER UPDATE/INSERT CORRETO
    $sql = "SELECT id, nome FROM lotes WHERE evento_id = ? ORDER BY id";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $lotes_existentes = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $lotes_existentes[] = $row['id'];
    }
    
    error_log("Lotes existentes no banco: " . print_r($lotes_existentes, true));
    
    // Processar cada lote (UPDATE ou INSERT)
    foreach ($lotes as $index => $lote) {
        error_log("--- Processando lote " . ($index + 1) . " ---");
        error_log("Dados do lote: " . print_r($lote, true));
        
        // Preparar valores conforme o tipo de lote
        $data_inicio = null;
        $data_fim = null;
        $percentual_venda = null;
        
        if ($lote['tipo'] == 'data') {
            $data_inicio = $lote['data_inicio'] ?? null;
            $data_fim = $lote['data_fim'] ?? null;
            if (empty($data_inicio)) {
                $data_inicio = '0000-00-00 00:00:00';
            }
            if (empty($data_fim)) {
                $data_fim = '0000-00-00 00:00:00';
            }
        } else if ($lote['tipo'] == 'percentual') {
            $percentual_venda = $lote['percentual_vendido'] ?? null;
            $data_inicio = '0000-00-00 00:00:00';
            $data_fim = '0000-00-00 00:00:00';
        }
        
        $divulgar = isset($lote['divulgar']) ? (int)$lote['divulgar'] : 0;
        
        // Verificar se é UPDATE ou INSERT
        $lote_existente_id = $lotes_existentes[$index] ?? null;
        
        if ($lote_existente_id) {
            // UPDATE do lote existente
            error_log("🔄 Atualizando lote existente ID: $lote_existente_id");
            
            $sql = "UPDATE lotes SET 
                        nome = ?, tipo = ?, data_inicio = ?, data_fim = ?,
                        percentual_venda = ?, divulgar_criterio = ?, atualizado_em = NOW()
                    WHERE id = ? AND evento_id = ?";
            
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ssssidii", 
                $lote['nome'], $lote['tipo'], $data_inicio, $data_fim, 
                $percentual_venda, $divulgar, $lote_existente_id, $evento_id
            );
            
            if (mysqli_stmt_execute($stmt)) {
                error_log("✅ Lote atualizado ID: $lote_existente_id");
            } else {
                error_log("❌ Erro ao atualizar lote: " . mysqli_error($con));
            }
            
        } else {
            // INSERT de novo lote
            error_log("➕ Inserindo novo lote");
            
            $sql = "INSERT INTO lotes (
                        evento_id, nome, tipo, data_inicio, data_fim,
                        percentual_venda, divulgar_criterio, criado_em
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "issssii", 
                $evento_id, $lote['nome'], $lote['tipo'], $data_inicio, $data_fim, 
                $percentual_venda, $divulgar
            );
            
            if (!mysqli_stmt_execute($stmt)) {
                error_log("ERRO ao executar INSERT: " . mysqli_error($con));
                throw new Exception('Erro ao salvar lote: ' . mysqli_error($con));
            }
            
            error_log("✅ Lote inserido com sucesso!");
        }
    }
    
    // Remover lotes excedentes (se houver menos lotes agora)
    if (count($lotes_existentes) > count($lotes)) {
        $lotes_para_remover = array_slice($lotes_existentes, count($lotes));
        foreach ($lotes_para_remover as $id_remover) {
            $sql = "DELETE FROM lotes WHERE id = ? AND evento_id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ii", $id_remover, $evento_id);
            mysqli_stmt_execute($stmt);
            error_log("🗑️ Removido lote excedente ID: $id_remover");
        }
    }
    
    error_log("=== ETAPA 5 SALVA COM SUCESSO ===");
}

/**
 * Etapa 6: Ingressos
 */
function salvarEtapa6($con, $evento_id) {
    error_log("=== INICIANDO SALVAR ETAPA 6 ===");
    error_log("Evento ID: " . $evento_id);
    error_log("Dados POST ingressos: " . ($_POST['ingressos'] ?? 'VAZIO'));
    
    $ingressos = json_decode($_POST['ingressos'] ?? '[]', true);
    error_log("Ingressos decodificados: " . print_r($ingressos, true));
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Erro ao decodificar JSON dos ingressos: ' . json_last_error_msg());
    }
    
    if (empty($ingressos)) {
        error_log("⚠️ Nenhum ingresso para salvar");
        return; // Não é erro, apenas não há ingressos
    }
    
    // Obter lotes para mapear
    $sql = "SELECT id, nome, tipo FROM lotes WHERE evento_id = ? ORDER BY id";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $lotes_map = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $lotes_map[$row['nome']] = [
            'id' => $row['id'],
            'tipo' => $row['tipo']
        ];
    }
    error_log("Lotes disponíveis: " . print_r($lotes_map, true));
    
    // Obter ingressos existentes
    $sql = "SELECT id, posicao_ordem FROM ingressos WHERE evento_id = ? ORDER BY posicao_ordem";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $ingressos_existentes = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $ingressos_existentes[$row['posicao_ordem']] = $row['id'];
    }
    error_log("Ingressos existentes: " . print_r($ingressos_existentes, true));
    
    // Processar cada ingresso (UPDATE ou INSERT)
    $posicao = 0;
    foreach ($ingressos as $index => $ingresso) {
        error_log("--- Processando ingresso " . ($index + 1) . " ---");
        error_log("Dados do ingresso: " . print_r($ingresso, true));
        
        // Determinar lote_id e se é lote por data
        $lote_id = null;
        $lote_eh_por_data = false;
        
        error_log("🔍 Processando lote do ingresso:");
        error_log("  - lote_id direto: " . ($ingresso['lote_id'] ?? 'VAZIO'));
        error_log("  - lote_nome fornecido: '" . ($ingresso['lote_nome'] ?? 'VAZIO') . "'");
        
        // Priorizar lote_id se fornecido diretamente
        if (!empty($ingresso['lote_id']) && is_numeric($ingresso['lote_id'])) {
            $lote_id = intval($ingresso['lote_id']);
            
            // Buscar tipo do lote
            $sql_tipo = "SELECT tipo FROM lotes WHERE id = ? AND evento_id = ?";
            $stmt_tipo = mysqli_prepare($con, $sql_tipo);
            mysqli_stmt_bind_param($stmt_tipo, "ii", $lote_id, $evento_id);
            mysqli_stmt_execute($stmt_tipo);
            $result_tipo = mysqli_stmt_get_result($stmt_tipo);
            $row_tipo = mysqli_fetch_assoc($result_tipo);
            
            if ($row_tipo) {
                $lote_eh_por_data = ($row_tipo['tipo'] === 'data');
                error_log("✅ Lote_id usado diretamente: ID $lote_id (tipo: " . $row_tipo['tipo'] . ")");
            } else {
                error_log("⚠️ Lote_id $lote_id não existe no banco");
                $lote_id = null;
            }
        }
        // Fallback para mapeamento por nome (compatibilidade)
        else if (!empty($ingresso['lote_nome']) && isset($lotes_map[$ingresso['lote_nome']])) {
            $lote_id = $lotes_map[$ingresso['lote_nome']]['id'];
            $lote_eh_por_data = ($lotes_map[$ingresso['lote_nome']]['tipo'] === 'data');
            error_log("✅ Lote mapeado por nome: " . $ingresso['lote_nome'] . " -> ID " . $lote_id);
        } else {
            error_log("⚠️ Nenhum lote especificado ou encontrado");
        }
        
        // Preparar dados para inserção/atualização
        $tipo = $ingresso['tipo'] ?? 'paid';
        $titulo = $ingresso['titulo'] ?? 'Ingresso sem título';
        $descricao = $ingresso['descricao'] ?? '';
        $quantidade = intval($ingresso['quantidade'] ?? 100);
        $preco = floatval($ingresso['preco'] ?? 0);
        $taxa_plataforma = floatval($ingresso['taxa_plataforma'] ?? 0);
        $valor_receber = floatval($ingresso['valor_receber'] ?? $preco);
        
        // Para lotes por data, usar as datas do lote. Para outros casos, usar as datas do ingresso
        $inicio_venda = null;
        $fim_venda = null;
        
        if ($lote_eh_por_data && $lote_id) {
            // Buscar datas do lote
            $sql_lote = "SELECT data_inicio, data_fim FROM lotes WHERE id = ?";
            $stmt_lote = mysqli_prepare($con, $sql_lote);
            mysqli_stmt_bind_param($stmt_lote, "i", $lote_id);
            mysqli_stmt_execute($stmt_lote);
            $result_lote = mysqli_stmt_get_result($stmt_lote);
            $lote_data = mysqli_fetch_assoc($result_lote);
            
            if ($lote_data) {
                $inicio_venda = $lote_data['data_inicio'];
                $fim_venda = $lote_data['data_fim'];
                error_log("📅 Usando datas do lote por data: {$inicio_venda} até {$fim_venda}");
            }
        } else {
            // Usar datas do ingresso (se fornecidas)
            if (!empty($ingresso['inicio_venda'])) {
                $inicio_venda = $ingresso['inicio_venda'];
            }
            if (!empty($ingresso['fim_venda'])) {
                $fim_venda = $ingresso['fim_venda'];
            }
            error_log("🎫 Usando datas do ingresso: {$inicio_venda} até {$fim_venda}");
        }
        
        $limite_min = intval($ingresso['limite_min'] ?? 1);
        $limite_max = intval($ingresso['limite_max'] ?? 5);
        
        // Garantir que lote_id seja null se não especificado
        if ($lote_id === null || $lote_id === 0 || $lote_id === '') {
            $lote_id = null;
        }
        
        $conteudo_combo = null;
        if ($tipo == 'combo' && isset($ingresso['conteudo_combo']) && !empty($ingresso['conteudo_combo'])) {
            $conteudo_combo = json_encode($ingresso['conteudo_combo']);
        }
        
        error_log("Dados preparados:");
        error_log("  - Tipo: $tipo");
        error_log("  - Título: $titulo");
        error_log("  - Quantidade: $quantidade");
        error_log("  - Preço: $preco");
        error_log("  - Taxa: $taxa_plataforma");
        error_log("  - Valor receber: $valor_receber");
        error_log("  - Início venda: " . ($inicio_venda ?? 'NULL'));
        error_log("  - Fim venda: " . ($fim_venda ?? 'NULL'));
        error_log("  - Lote ID: " . ($lote_id ?? 'NULL'));
        error_log("  - Lote é por data: " . ($lote_eh_por_data ? 'SIM' : 'NÃO'));
        error_log("  - Conteúdo combo: " . ($conteudo_combo ?? 'NULL'));
        error_log("  - Posição: $posicao");
        
        // Verificar se deve fazer UPDATE ou INSERT
        $ingresso_existente_id = $ingressos_existentes[$posicao] ?? null;
        
        if ($ingresso_existente_id) {
            // UPDATE do ingresso existente
            error_log("🔄 Atualizando ingresso existente ID: $ingresso_existente_id");
            
            $sql = "UPDATE ingressos SET 
                        tipo = ?, titulo = ?, descricao = ?,
                        quantidade_total = ?, preco = ?, taxa_plataforma = ?,
                        valor_receber = ?, inicio_venda = ?, fim_venda = ?,
                        limite_min = ?, limite_max = ?, lote_id = ?,
                        conteudo_combo = ?, atualizado_em = NOW()
                    WHERE id = ? AND evento_id = ?";
            
            $stmt = mysqli_prepare($con, $sql);
            if (!$stmt) {
                throw new Exception('Erro ao preparar statement UPDATE: ' . mysqli_error($con));
            }
            
            $bind_result = mysqli_stmt_bind_param($stmt, "sssiiddssiisiii", 
                $tipo, $titulo, $descricao, $quantidade, $preco, $taxa_plataforma,
                $valor_receber, $inicio_venda, $fim_venda, $limite_min, $limite_max,
                $lote_id, $conteudo_combo, $ingresso_existente_id, $evento_id
            );
            
        } else {
            // INSERT de novo ingresso
            error_log("➕ Inserindo novo ingresso na posição: $posicao");
            
            $sql = "INSERT INTO ingressos (
                        evento_id, tipo, titulo, descricao,
                        quantidade_total, preco, taxa_plataforma,
                        valor_receber, inicio_venda, fim_venda,
                        limite_min, limite_max, lote_id,
                        conteudo_combo, posicao_ordem, criado_em
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $stmt = mysqli_prepare($con, $sql);
            if (!$stmt) {
                throw new Exception('Erro ao preparar statement INSERT: ' . mysqli_error($con));
            }
            
            $bind_result = mysqli_stmt_bind_param($stmt, "isssidddssiisii", 
                $evento_id, $tipo, $titulo, $descricao, $quantidade, $preco, $taxa_plataforma,
                $valor_receber, $inicio_venda, $fim_venda, $limite_min, $limite_max,
                $lote_id, $conteudo_combo, $posicao
            );
        }
        
        if (!$bind_result) {
            throw new Exception('Erro ao fazer bind dos parâmetros: ' . mysqli_erro($con));
        }
        
        if (!mysqli_stmt_execute($stmt)) {
            $error_msg = 'Erro ao executar statement: ' . mysqli_error($con);
            error_log("❌ " . $error_msg);
            throw new Exception($error_msg);
        }
        
        if ($ingresso_existente_id) {
            error_log("✅ Ingresso atualizado ID: " . $ingresso_existente_id);
        } else {
            $inserted_id = mysqli_insert_id($con);
            error_log("✅ Ingresso inserido com ID: " . $inserted_id);
        }
        
        $posicao++;
    }
    
    // Remover ingressos excedentes (se houver menos ingressos agora)
    if (count($ingressos_existentes) > count($ingressos)) {
        $positions_to_remove = array_slice(array_keys($ingressos_existentes), count($ingressos));
        foreach ($positions_to_remove as $pos) {
            $id_to_remove = $ingressos_existentes[$pos];
            $sql = "DELETE FROM ingressos WHERE id = ? AND evento_id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ii", $id_to_remove, $evento_id);
            mysqli_stmt_execute($stmt);
            error_log("🗑️ Removido ingresso excedente ID: $id_to_remove");
        }
    }
    
    error_log("=== ETAPA 6 SALVA COM SUCESSO ===");
}

/**
 * Obter tipo do lote
 */
function obterTipoLote($con, $usuario_id) {
    $lote_id = $_POST['lote_id'] ?? 0;
    $evento_id = $_POST['evento_id'] ?? 0;
    
    if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Sem permissão']);
        return;
    }
    
    $sql = "SELECT tipo FROM lotes WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    
    if ($row) {
        echo json_encode(['tipo' => $row['tipo']]);
    } else {
        echo json_encode(['tipo' => 'desconhecido']);
    }
}

/**
 * Obter datas do lote
 */
function obterDatasLote($con, $usuario_id) {
    $lote_id = $_POST['lote_id'] ?? 0;
    $evento_id = $_POST['evento_id'] ?? 0;
    
    if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Sem permissão']);
        return;
    }
    
    $sql = "SELECT data_inicio, data_fim FROM lotes WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    
    if ($row) {
        echo json_encode([
            'data_inicio' => $row['data_inicio'],
            'data_fim' => $row['data_fim']
        ]);
    } else {
        echo json_encode(['erro' => 'Lote não encontrado']);
    }
}

/**
 * Obter dados completos do ingresso do banco
 */
function obterDadosIngresso($con, $usuario_id) {
    $ingresso_id = $_POST['ingresso_id'] ?? 0;
    $evento_id = $_POST['evento_id'] ?? 0;
    
    error_log("=== BUSCANDO DADOS DO INGRESSO ===");
    error_log("Ingresso ID: $ingresso_id");
    error_log("Evento ID: $evento_id");
    
    if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Sem permissão']);
        return;
    }
    
    $sql = "SELECT * FROM ingressos WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $ingresso_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    
    if ($row) {
        error_log("✅ Dados do ingresso encontrados: " . print_r($row, true));
        echo json_encode([
            'sucesso' => true,
            'ingresso' => $row
        ]);
    } else {
        error_log("❌ Ingresso não encontrado");
        echo json_encode(['erro' => 'Ingresso não encontrado']);
    }
}

/**
 * Obter dados completos do lote do banco
 */
function obterDadosLote($con, $usuario_id) {
    $lote_id = $_POST['lote_id'] ?? 0;
    $evento_id = $_POST['evento_id'] ?? 0;
    
    error_log("=== BUSCANDO DADOS DO LOTE ===");
    error_log("Lote ID: $lote_id");
    error_log("Evento ID: $evento_id");
    
    if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Sem permissão']);
        return;
    }
    
    $sql = "SELECT * FROM lotes WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    
    if ($row) {
        error_log("✅ Dados do lote encontrados: " . print_r($row, true));
        echo json_encode([
            'sucesso' => true,
            'lote' => $row
        ]);
    } else {
        error_log("❌ Lote não encontrado");
        echo json_encode(['erro' => 'Lote não encontrado']);
    }
}

/**
 * Etapa 7: Produtor
 */
function salvarEtapa7($con, $evento_id) {
    $sql = "UPDATE eventos SET 
            produtor_selecionado = ?,
            nome_produtor = ?,
            nome_exibicao_produtor = ?,
            descricao_produtor = ?,
            atualizado_em = NOW()
            WHERE id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ssssi", 
        $_POST['produtor_selecionado'],
        $_POST['nome_produtor'],
        $_POST['nome_exibicao_produtor'],
        $_POST['descricao_produtor'],
        $evento_id
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao salvar etapa 7: ' . mysqli_error($con));
    }
}

/**
 * Etapa 8: Termos e visibilidade
 */
function salvarEtapa8($con, $evento_id) {
    $sql = "UPDATE eventos SET 
            visibilidade = ?,
            termos_aceitos = ?,
            dados_aceite = ?,
            atualizado_em = NOW()
            WHERE id = ?";
    
    $dados_aceite = json_encode([
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
    $termos_aceitos = ($_POST['termos_aceitos'] ?? false) ? 1 : 0;
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "sisi", 
        $_POST['visibilidade'],
        $termos_aceitos,
        $dados_aceite,
        $evento_id
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao salvar etapa 8: ' . mysqli_error($con));
    }
}

/**
 * Publicar evento (mudar status de rascunho para publicado)
 */
function publicarEvento($con, $usuario_id) {
    $evento_id = $_POST['evento_id'] ?? 0;
    
    if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Sem permissão para publicar este evento']);
        return;
    }
    
    // Verificar se todos os campos obrigatórios estão preenchidos
    $sql = "SELECT nome, data_inicio, tipo_local, 
            (CASE WHEN tipo_local = 'online' THEN link_online ELSE nome_local END) as local_info
            FROM eventos WHERE id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $evento = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    
    if (empty($evento['nome']) || empty($evento['data_inicio']) || empty($evento['local_info'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Campos obrigatórios não preenchidos']);
        return;
    }
    
    // Verificar se tem pelo menos um lote e um ingresso
    $sql = "SELECT COUNT(*) as total FROM lotes WHERE evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $lotes = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    
    if ($lotes['total'] == 0) {
        http_response_code(400);
        echo json_encode(['erro' => 'É necessário criar pelo menos um lote']);
        return;
    }
    
    $sql = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $ingressos = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    
    if ($ingressos['total'] == 0) {
        http_response_code(400);
        echo json_encode(['erro' => 'É necessário criar pelo menos um tipo de ingresso']);
        return;
    }
    
    // Publicar evento
    $sql = "UPDATE eventos SET 
            status = 'publicado',
            publicado_em = NOW(),
            atualizado_em = NOW()
            WHERE id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Evento publicado com sucesso']);
    } else {
        http_response_code(500);
        echo json_encode(['erro' => 'Erro ao publicar evento']);
    }
}

/**
 * Pausar evento (mudar status para pausado)
 */
function pausarEvento($con, $usuario_id) {
    $evento_id = $_POST['evento_id'] ?? 0;
    
    if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Sem permissão para pausar este evento']);
        return;
    }
    
    $sql = "UPDATE eventos SET 
            status = 'pausado',
            atualizado_em = NOW()
            WHERE id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Evento pausado com sucesso']);
    } else {
        http_response_code(500);
        echo json_encode(['erro' => 'Erro ao pausar evento']);
    }
}

/**
 * Verificar se o usuário tem permissão para editar o evento
 */
function verificarPermissaoEvento($con, $evento_id, $usuario_id) {
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    return mysqli_num_rows($result) > 0;
}

/**
 * Gerar slug a partir do nome
 */
function gerarSlug($texto) {
    $texto = preg_replace('/[áàãâä]/ui', 'a', $texto);
    $texto = preg_replace('/[éèêë]/ui', 'e', $texto);
    $texto = preg_replace('/[íìîï]/ui', 'i', $texto);
    $texto = preg_replace('/[óòõôö]/ui', 'o', $texto);
    $texto = preg_replace('/[úùûü]/ui', 'u', $texto);
    $texto = preg_replace('/[ç]/ui', 'c', $texto);
    $texto = preg_replace('/[^a-z0-9]/i', '-', $texto);
    $texto = preg_replace('/-+/', '-', $texto);
    $texto = strtolower(trim($texto, '-'));
    
    return $texto;
}

/**
 * Verificar se existe rascunho para o usuário
 */
function verificarRascunho($con, $usuario_id) {
    $sql = "SELECT id, nome, criado_em, atualizado_em 
            FROM eventos 
            WHERE usuario_id = ? 
            AND status = 'rascunho' 
            ORDER BY atualizado_em DESC 
            LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode([
            'existe_rascunho' => true,
            'evento_id' => $row['id'],
            'nome' => $row['nome'],
            'criado_em' => date('d/m/Y H:i', strtotime($row['criado_em'])),
            'atualizado_em' => date('d/m/Y H:i', strtotime($row['atualizado_em']))
        ]);
    } else {
        echo json_encode(['existe_rascunho' => false]);
    }
}

/**
 * Excluir rascunho existente
 */
function excluirRascunho($con, $usuario_id) {
    $evento_id = $_POST['evento_id'] ?? 0;
    
    // Verificar se o rascunho pertence ao usuário
    $sql = "SELECT id FROM eventos 
            WHERE id = ? 
            AND usuario_id = ? 
            AND status = 'rascunho'";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) > 0) {
        mysqli_begin_transaction($con);
        
        try {
            // Excluir ingressos
            $sql = "DELETE FROM ingressos WHERE evento_id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "i", $evento_id);
            mysqli_stmt_execute($stmt);
            
            // Excluir lotes
            $sql = "DELETE FROM lotes WHERE evento_id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "i", $evento_id);
            mysqli_stmt_execute($stmt);
            
            // Excluir evento
            $sql = "DELETE FROM eventos WHERE id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "i", $evento_id);
            mysqli_stmt_execute($stmt);
            
            mysqli_commit($con);
            echo json_encode(['sucesso' => true]);
            
        } catch (Exception $e) {
            mysqli_rollback($con);
            echo json_encode(['erro' => 'Erro ao excluir rascunho']);
        }
    } else {
        echo json_encode(['erro' => 'Rascunho não encontrado ou sem permissão']);
    }
}

/**
 * Salvar ingresso individual (para edição imediata)
 */
function salvarIngressoIndividual($con, $usuario_id) {
    error_log("=== SALVANDO INGRESSO INDIVIDUAL ===");
    
    $evento_id = intval($_POST['evento_id']);
    $ingresso_data = json_decode($_POST['ingresso'], true);
    
    error_log("Evento ID: $evento_id");
    error_log("Dados do ingresso: " . print_r($ingresso_data, true));
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    $tipo = $ingresso_data['tipo'];
    $titulo = $ingresso_data['titulo'];
    $descricao = $ingresso_data['descricao'] ?? '';
    $quantidade = intval($ingresso_data['quantidade_total']);
    $preco = floatval($ingresso_data['preco']);
    $taxa_plataforma = floatval($ingresso_data['taxa_plataforma'] ?? 0);
    $valor_receber = floatval($ingresso_data['valor_receber'] ?? 0);
    $inicio_venda = $ingresso_data['inicio_venda'] ?? null;
    $fim_venda = $ingresso_data['fim_venda'] ?? null;
    $limite_min = intval($ingresso_data['limite_min']);
    $limite_max = intval($ingresso_data['limite_max']);
    $lote_id = !empty($ingresso_data['lote_id']) ? intval($ingresso_data['lote_id']) : null;
    
    // Tratar conteudo_combo corretamente para JSON
    $conteudo_combo = $ingresso_data['conteudo_combo'] ?? '';
    if (empty($conteudo_combo) || $conteudo_combo === '') {
        $conteudo_combo = null;  // NULL para ingressos não-combo
    }
    
    if (isset($ingresso_data['id']) && !empty($ingresso_data['id'])) {
        // UPDATE
        $ingresso_id = intval($ingresso_data['id']);
        
        $sql = "UPDATE ingressos SET 
                tipo = ?, titulo = ?, descricao = ?, quantidade_total = ?, 
                preco = ?, taxa_plataforma = ?, valor_receber = ?,
                inicio_venda = ?, fim_venda = ?, limite_min = ?, limite_max = ?,
                lote_id = ?, conteudo_combo = ?, atualizado_em = NOW()
                WHERE id = ? AND evento_id = ?";
        
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "sssidddssiiisii", 
            $tipo, $titulo, $descricao, $quantidade,
            $preco, $taxa_plataforma, $valor_receber,
            $inicio_venda, $fim_venda, $limite_min, $limite_max,
            $lote_id, $conteudo_combo, $ingresso_id, $evento_id
        );
        
        if (mysqli_stmt_execute($stmt)) {
            error_log("✅ Ingresso $ingresso_id atualizado com sucesso");
            echo json_encode(['sucesso' => true, 'ingresso_id' => $ingresso_id]);
        } else {
            error_log("❌ Erro ao atualizar ingresso: " . mysqli_error($con));
            echo json_encode(['erro' => 'Erro ao atualizar ingresso']);
        }
    } else {
        // INSERT
        $sql = "INSERT INTO ingressos 
                (evento_id, tipo, titulo, descricao, quantidade_total, preco, 
                 taxa_plataforma, valor_receber, inicio_venda, fim_venda, 
                 limite_min, limite_max, lote_id, conteudo_combo, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "isssidddssiiis",
            $evento_id, $tipo, $titulo, $descricao, $quantidade,
            $preco, $taxa_plataforma, $valor_receber,
            $inicio_venda, $fim_venda, $limite_min, $limite_max,
            $lote_id, $conteudo_combo
        );
        
        if (mysqli_stmt_execute($stmt)) {
            $ingresso_id = mysqli_insert_id($con);
            error_log("✅ Ingresso $ingresso_id criado com sucesso");
            echo json_encode(['sucesso' => true, 'ingresso_id' => $ingresso_id]);
        } else {
            error_log("❌ Erro ao criar ingresso: " . mysqli_error($con));
            echo json_encode(['erro' => 'Erro ao criar ingresso']);
        }
    }
}

/**
 * Excluir ingresso individual
 */
function excluirIngresso($con, $usuario_id) {
    error_log("=== EXCLUINDO INGRESSO ===");
    
    $evento_id = intval($_POST['evento_id']);
    $ingresso_id = intval($_POST['ingresso_id']);
    
    error_log("Evento ID: $evento_id, Ingresso ID: $ingresso_id");
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    // Excluir ingresso
    $sql = "DELETE FROM ingressos WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $ingresso_id, $evento_id);
    
    if (mysqli_stmt_execute($stmt)) {
        error_log("✅ Ingresso $ingresso_id excluído com sucesso");
        echo json_encode(['sucesso' => true]);
    } else {
        error_log("❌ Erro ao excluir ingresso: " . mysqli_error($con));
        echo json_encode(['erro' => 'Erro ao excluir ingresso']);
    }
}

/**
 * Verificar se ingresso está referenciado em combos
 */
function verificarReferenciaCombo($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    $ingresso_id = intval($_POST['ingresso_id']);
    
    error_log("Verificando referência em combos - Evento: $evento_id, Ingresso: $ingresso_id");
    
    // Buscar ingressos tipo combo que podem referenciar este ingresso
    $sql = "SELECT conteudo_combo FROM ingressos 
            WHERE evento_id = ? AND tipo = 'combo' AND conteudo_combo IS NOT NULL AND conteudo_combo != ''";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $tem_referencia = false;
    
    while ($row = mysqli_fetch_assoc($result)) {
        $combo_data = json_decode($row['conteudo_combo'], true);
        
        if (is_array($combo_data)) {
            foreach ($combo_data as $item) {
                if (isset($item['ingresso_id']) && $item['ingresso_id'] == $ingresso_id) {
                    $tem_referencia = true;
                    break 2;
                }
            }
        }
    }
    
    error_log("Tem referência em combo: " . ($tem_referencia ? 'SIM' : 'NÃO'));
    echo json_encode(['sucesso' => true, 'tem_referencia' => $tem_referencia]);
}

/**
 * Salvar lote individual (para edição imediata)
 */
function salvarLoteIndividual($con, $usuario_id) {
    error_log("=== SALVANDO LOTE INDIVIDUAL ===");
    
    $evento_id = intval($_POST['evento_id']);
    $lote_data = json_decode($_POST['lote'], true);
    
    error_log("Evento ID: $evento_id");
    error_log("Dados do lote: " . print_r($lote_data, true));
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    $nome = $lote_data['nome'];
    $tipo = $lote_data['tipo'];
    $divulgar_criterio = intval($lote_data['divulgar_criterio']);
    
    if (isset($lote_data['id']) && !empty($lote_data['id'])) {
        // UPDATE
        $lote_id = intval($lote_data['id']);
        
        if ($tipo === 'data') {
            $data_inicio = $lote_data['data_inicio'];
            $data_fim = $lote_data['data_fim'];
            
            $sql = "UPDATE lotes SET 
                    nome = ?, tipo = ?, data_inicio = ?, data_fim = ?, 
                    divulgar_criterio = ?, atualizado_em = NOW()
                    WHERE id = ? AND evento_id = ?";
            
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "sssssii", 
                $nome, $tipo, $data_inicio, $data_fim, $divulgar_criterio, $lote_id, $evento_id
            );
        } else {
            $percentual_venda = intval($lote_data['percentual_venda']);
            
            $sql = "UPDATE lotes SET 
                    nome = ?, tipo = ?, percentual_venda = ?, 
                    divulgar_criterio = ?, atualizado_em = NOW()
                    WHERE id = ? AND evento_id = ?";
            
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ssiiii", 
                $nome, $tipo, $percentual_venda, $divulgar_criterio, $lote_id, $evento_id
            );
        }
        
        if (mysqli_stmt_execute($stmt)) {
            error_log("✅ Lote $lote_id atualizado com sucesso");
            echo json_encode(['sucesso' => true, 'lote_id' => $lote_id]);
        } else {
            error_log("❌ Erro ao atualizar lote: " . mysqli_error($con));
            echo json_encode(['erro' => 'Erro ao atualizar lote']);
        }
    } else {
        echo json_encode(['erro' => 'ID do lote é obrigatório para edição']);
    }
}

/**
 * Excluir lote individual
 */
function excluirLote($con, $usuario_id) {
    error_log("=== EXCLUINDO LOTE - INÍCIO ===");
    
    // Log de entrada
    error_log("POST data: " . print_r($_POST, true));
    error_log("Usuario ID: $usuario_id");
    
    if (!isset($_POST['evento_id']) || !isset($_POST['lote_id'])) {
        error_log("❌ Parâmetros faltando - evento_id ou lote_id");
        echo json_encode(['erro' => 'Parâmetros obrigatórios faltando']);
        return;
    }
    
    $evento_id = intval($_POST['evento_id']);
    $lote_id = intval($_POST['lote_id']);
    
    error_log("Evento ID: $evento_id, Lote ID: $lote_id");
    
    if ($evento_id <= 0 || $lote_id <= 0) {
        error_log("❌ IDs inválidos - evento_id: $evento_id, lote_id: $lote_id");
        echo json_encode(['erro' => 'IDs inválidos']);
        return;
    }
    
    // Verificar se evento pertence ao usuário
    error_log("🔍 Verificando se evento pertence ao usuário...");
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        error_log("❌ Evento não encontrado ou não pertence ao usuário");
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    error_log("✅ Evento verificado, prosseguindo com exclusão...");
    
    // Verificar se lote existe antes de excluir
    $sql = "SELECT id, nome FROM lotes WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $lote_info = mysqli_fetch_assoc($result);
    
    if (!$lote_info) {
        error_log("❌ Lote não encontrado - ID: $lote_id, Evento: $evento_id");
        echo json_encode(['erro' => 'Lote não encontrado']);
        return;
    }
    
    error_log("📦 Lote encontrado: " . print_r($lote_info, true));
    
    // Excluir lote
    error_log("🗑️ Executando DELETE...");
    $sql = "DELETE FROM lotes WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $evento_id);
    
    if (mysqli_stmt_execute($stmt)) {
        $affected_rows = mysqli_stmt_affected_rows($stmt);
        error_log("✅ DELETE executado - Linhas afetadas: $affected_rows");
        
        if ($affected_rows > 0) {
            error_log("✅ Lote $lote_id ({$lote_info['nome']}) excluído com sucesso");
            echo json_encode(['sucesso' => true, 'lote_excluido' => $lote_info['nome']]);
        } else {
            error_log("⚠️ DELETE executado mas nenhuma linha foi afetada");
            echo json_encode(['erro' => 'Lote não foi excluído (nenhuma linha afetada)']);
        }
    } else {
        error_log("❌ Erro ao excluir lote: " . mysqli_error($con));
        echo json_encode(['erro' => 'Erro ao excluir lote']);
    }
}

/**
 * Verificar se lote tem ingressos associados
 */
function verificarIngressosLote($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    $lote_id = intval($_POST['lote_id']);
    
    error_log("Verificando ingressos do lote - Evento: $evento_id, Lote: $lote_id");
    
    // Contar ingressos associados ao lote
    $sql = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = ? AND lote_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $lote_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    
    $tem_ingressos = $row['total'] > 0;
    
    error_log("Tem ingressos associados: " . ($tem_ingressos ? 'SIM' : 'NÃO') . " (total: {$row['total']})");
    echo json_encode(['sucesso' => true, 'tem_ingressos' => $tem_ingressos]);
}

/**
 * Listar ingressos disponíveis para compor combo
 */
function listarIngressosParaCombo($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    
    error_log("Listando ingressos para combo - Evento: $evento_id");
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    // Buscar ingressos não-combo do evento
    $sql = "SELECT id, titulo, preco, tipo FROM ingressos 
            WHERE evento_id = ? AND tipo != 'combo' 
            ORDER BY titulo";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $ingressos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $ingressos[] = $row;
    }
    
    error_log("Ingressos encontrados para combo: " . count($ingressos));
    echo json_encode(['sucesso' => true, 'ingressos' => $ingressos]);
}

/**
 * Recuperar dados completos do evento (lotes e ingressos)
 * Para carregamento inicial da etapa 6
 */
function recuperarDadosCompletos($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    
    error_log("=== RECUPERANDO DADOS COMPLETOS DO EVENTO ===");
    error_log("Evento ID: $evento_id");
    error_log("Usuario ID: $usuario_id");
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT * FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $evento = mysqli_fetch_assoc($result);
    
    if (!$evento) {
        http_response_code(404);
        echo json_encode(['erro' => 'Evento não encontrado ou sem permissão']);
        return;
    }
    
    // Buscar lotes
    $sql_lotes = "SELECT * FROM lotes WHERE evento_id = ? ORDER BY tipo, data_inicio, percentual_venda";
    $stmt_lotes = mysqli_prepare($con, $sql_lotes);
    mysqli_stmt_bind_param($stmt_lotes, "i", $evento_id);
    mysqli_stmt_execute($stmt_lotes);
    $lotes = mysqli_fetch_all(mysqli_stmt_get_result($stmt_lotes), MYSQLI_ASSOC);
    
    // Buscar ingressos
    $sql_ingressos = "SELECT * FROM ingressos WHERE evento_id = ? ORDER BY posicao_ordem, id";
    $stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
    mysqli_stmt_bind_param($stmt_ingressos, "i", $evento_id);
    mysqli_stmt_execute($stmt_ingressos);
    $ingressos = mysqli_fetch_all(mysqli_stmt_get_result($stmt_ingressos), MYSQLI_ASSOC);
    
    error_log("Lotes encontrados: " . count($lotes));
    error_log("Ingressos encontrados: " . count($ingressos));
    
    echo json_encode([
        'sucesso' => true,
        'evento' => $evento,
        'lotes' => $lotes,
        'ingressos' => $ingressos
    ]);
}

/**
 * Buscar dados específicos de um lote
 */
function buscarLoteEspecifico($con, $usuario_id) {
    $lote_id = intval($_POST['lote_id']);
    $evento_id = intval($_POST['evento_id']);
    
    if (!$lote_id || !$evento_id) {
        echo json_encode(['erro' => 'Parâmetros inválidos']);
        return;
    }
    
    try {
        // Verificar se o evento pertence ao usuário
        $sql = "SELECT COUNT(*) FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt = $con->prepare($sql);
        $stmt->bind_param("ii", $evento_id, $usuario_id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        
        if ($count == 0) {
            echo json_encode(['erro' => 'Evento não encontrado']);
            return;
        }
        
        // Buscar dados do lote - INCLUINDO divulgar_criterio
        $sql = "SELECT id, nome, tipo, data_inicio, data_fim, percentual_venda, divulgar_criterio 
                FROM lotes 
                WHERE id = ? AND evento_id = ?";
        $stmt = $con->prepare($sql);
        $stmt->bind_param("ii", $lote_id, $evento_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($lote = $result->fetch_assoc()) {
            // CORREÇÃO: Garantir que divulgar_criterio seja booleano
            $lote['divulgar_criterio'] = (bool)$lote['divulgar_criterio'];
            
            echo json_encode([
                'sucesso' => true,
                'lote' => $lote
            ]);
        } else {
            echo json_encode(['erro' => 'Lote não encontrado']);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Erro ao buscar lote: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Exclui todos os lotes por quantidade (percentual) e seus ingressos
 */
function excluirLotesQuantidade($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Verificar se o evento pertence ao usuário
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        error_log("Excluindo lotes por quantidade do evento $evento_id");
        
        mysqli_begin_transaction($con);
        
        // Excluir ingressos dos lotes por percentual E quantidade
        $sql_ingressos = "DELETE i FROM ingressos i 
                         INNER JOIN lotes l ON i.lote_id = l.id 
                         WHERE l.evento_id = ? AND l.tipo IN ('percentual', 'quantidade')";
        $stmt_ingressos = $con->prepare($sql_ingressos);
        $stmt_ingressos->bind_param("i", $evento_id);
        $stmt_ingressos->execute();
        $ingressos_excluidos = $stmt_ingressos->affected_rows;
        $stmt_ingressos->close();
        
        // Excluir lotes por percentual E quantidade
        $sql_lotes = "DELETE FROM lotes WHERE evento_id = ? AND tipo IN ('percentual', 'quantidade')";
        $stmt_lotes = $con->prepare($sql_lotes);
        $stmt_lotes->bind_param("i", $evento_id);
        $stmt_lotes->execute();
        $lotes_excluidos = $stmt_lotes->affected_rows;
        $stmt_lotes->close();
        
        mysqli_commit($con);
        
        error_log("Exclusão concluída: $lotes_excluidos lotes e $ingressos_excluidos ingressos excluídos");
        
        echo json_encode([
            'sucesso' => true,
            'lotes_excluidos' => $lotes_excluidos,
            'ingressos_excluidos' => $ingressos_excluidos
        ]);
        
    } catch (Exception $e) {
        mysqli_rollback($con);
        error_log("Erro ao excluir lotes por quantidade: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro ao excluir lotes por quantidade']);
    }
}

/**
 * Salva a configuração de limite de vendas do evento
 * CORREÇÃO: Se limite_vendas não for enviado, não alterar valor no banco
 */
function salvarLimiteVendas($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $controlar_limite = intval($_POST['controlar_limite_vendas'] ?? 0);
        $limite_enviado = isset($_POST['limite_vendas']);
        $limite_vendas = intval($_POST['limite_vendas'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Verificar se o evento pertence ao usuário
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        error_log("Salvando limite de vendas: evento=$evento_id, controlar=$controlar_limite, limite=" . ($limite_enviado ? $limite_vendas : 'NÃO_ENVIADO'));
        
        // Verificar se as colunas existem, se não, criá-las
        $result = $con->query("SHOW COLUMNS FROM eventos LIKE 'controlar_limite_vendas'");
        if ($result->num_rows == 0) {
            $con->query("ALTER TABLE eventos ADD COLUMN controlar_limite_vendas TINYINT(1) DEFAULT 0");
            error_log("Coluna controlar_limite_vendas criada");
        }
        
        $result = $con->query("SHOW COLUMNS FROM eventos LIKE 'limite_vendas'");
        if ($result->num_rows == 0) {
            $con->query("ALTER TABLE eventos ADD COLUMN limite_vendas INT DEFAULT 0");
            error_log("Coluna limite_vendas criada");
        }
        
        // CORREÇÃO: Se limite_vendas não foi enviado, não alterar no banco
        if ($limite_enviado) {
            $sql = "UPDATE eventos SET 
                    controlar_limite_vendas = ?, 
                    limite_vendas = ?, 
                    atualizado_em = NOW() 
                    WHERE id = ? AND usuario_id = ?";
            
            $stmt = $con->prepare($sql);
            $stmt->bind_param("iiii", $controlar_limite, $limite_vendas, $evento_id, $usuario_id);
            
            error_log("✅ Atualizando AMBOS os campos: controlar=$controlar_limite, limite=$limite_vendas");
        } else {
            $sql = "UPDATE eventos SET 
                    controlar_limite_vendas = ?, 
                    atualizado_em = NOW() 
                    WHERE id = ? AND usuario_id = ?";
            
            $stmt = $con->prepare($sql);
            $stmt->bind_param("iii", $controlar_limite, $evento_id, $usuario_id);
            
            error_log("✅ Atualizando APENAS controlar_limite_vendas=$controlar_limite (limite_vendas mantido)");
        }
        
        if ($stmt->execute()) {
            echo json_encode([
                'sucesso' => true,
                'dados' => [
                    'controlar_limite_vendas' => $controlar_limite,
                    'limite_vendas' => $limite_enviado ? $limite_vendas : 'mantido'
                ]
            ]);
        } else {
            echo json_encode(['erro' => 'Erro ao salvar configuração']);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Erro ao salvar limite de vendas: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Carrega a configuração de limite de vendas do evento
 */
function carregarLimiteVendas($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Verificar se o evento pertence ao usuário
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        error_log("Carregando limite de vendas do evento $evento_id");
        
        // Verificar se as colunas existem
        $result = $con->query("SHOW COLUMNS FROM eventos LIKE 'controlar_limite_vendas'");
        $tem_coluna_controlar = $result->num_rows > 0;
        
        $result = $con->query("SHOW COLUMNS FROM eventos LIKE 'limite_vendas'");
        $tem_coluna_limite = $result->num_rows > 0;
        
        if (!$tem_coluna_controlar || !$tem_coluna_limite) {
            // Colunas não existem ainda, retornar valores padrão
            echo json_encode([
                'sucesso' => true,
                'dados' => [
                    'controlar_limite_vendas' => 0,
                    'limite_vendas' => 0
                ]
            ]);
            return;
        }
        
        $sql = "SELECT controlar_limite_vendas, limite_vendas 
                FROM eventos 
                WHERE id = ? AND usuario_id = ?";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("ii", $evento_id, $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($dados = $result->fetch_assoc()) {
            // CORREÇÃO: Ler os valores reais do banco, não forçar zero
            $controlar_limite = intval($dados['controlar_limite_vendas'] ?? 0);
            $limite_vendas = intval($dados['limite_vendas'] ?? 0);
            
            error_log("✅ Valores lidos do banco: controlar=$controlar_limite, limite=$limite_vendas");
            
            echo json_encode([
                'sucesso' => true,
                'dados' => [
                    'controlar_limite_vendas' => $controlar_limite,
                    'limite_vendas' => $limite_vendas
                ]
            ]);
        } else {
            echo json_encode(['erro' => 'Evento não encontrado']);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Erro ao carregar limite de vendas: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Verificar se existem lotes por quantidade no evento
 */
function verificarLotesQuantidade($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Verificar se o evento pertence ao usuário
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        error_log("Verificando lotes por quantidade do evento $evento_id");
        
        $sql = "SELECT COUNT(*) as quantidade FROM lotes WHERE evento_id = ? AND tipo = 'percentual'";
        $stmt = $con->prepare($sql);
        $stmt->bind_param("i", $evento_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $quantidade = intval($row['quantidade']);
            
            echo json_encode([
                'sucesso' => true,
                'quantidade' => $quantidade,
                'tem_lotes' => $quantidade > 0
            ]);
            
            error_log("Resultado: $quantidade lotes por quantidade encontrados");
        } else {
            echo json_encode([
                'sucesso' => true,
                'quantidade' => 0,
                'tem_lotes' => false
            ]);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Erro ao verificar lotes por quantidade: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * CORREÇÃO PROBLEMA 2: Criar lote por percentual diretamente no banco
 */
function criarLotePercentual($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $nome = $_POST['nome'] ?? '';
        $percentual_venda = intval($_POST['percentual_venda'] ?? 0);
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if (!$nome || !$percentual_venda) {
            echo json_encode(['erro' => 'Nome e percentual são obrigatórios']);
            return;
        }
        
        // Verificar se o evento pertence ao usuário
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        error_log("Criando lote por percentual: evento=$evento_id, nome=$nome, percentual=$percentual_venda");
        
        // Verificar se já existe lote com o mesmo percentual
        $sql_verifica = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'percentual' AND percentual_venda = ?";
        $stmt_verifica = $con->prepare($sql_verifica);
        $stmt_verifica->bind_param("ii", $evento_id, $percentual_venda);
        $stmt_verifica->execute();
        $result_verifica = $stmt_verifica->get_result();
        
        if ($result_verifica->num_rows > 0) {
            echo json_encode(['erro' => 'Já existe um lote com este percentual']);
            return;
        }
        
        // Criar o lote
        $sql = "INSERT INTO lotes (
                    evento_id, nome, tipo, percentual_venda, 
                    divulgar_criterio, data_inicio, data_fim, criado_em
                ) VALUES (?, ?, 'percentual', ?, ?, '0000-00-00 00:00:00', '0000-00-00 00:00:00', NOW())";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("isii", $evento_id, $nome, $percentual_venda, $divulgar_criterio);
        
        if ($stmt->execute()) {
            $lote_id = $con->insert_id;
            
            echo json_encode([
                'sucesso' => true,
                'lote_id' => $lote_id,
                'mensagem' => 'Lote por percentual criado com sucesso'
            ]);
            
            error_log("✅ Lote por percentual criado com ID: $lote_id");
        } else {
            echo json_encode(['erro' => 'Erro ao criar lote: ' . $con->error]);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Erro ao criar lote por percentual: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * CORREÇÃO: Criar múltiplos lotes por percentual de vendas
 * Usa estrutura EXISTENTE da tabela lotes
 */
function criarLotesPercentual($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $lotes_json = $_POST['lotes'] ?? '';
        $limite_total = intval($_POST['limite_total'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if (!$lotes_json) {
            echo json_encode(['erro' => 'Dados dos lotes são obrigatórios']);
            return;
        }
        
        if ($limite_total <= 0) {
            echo json_encode(['erro' => 'Limite total deve ser maior que zero']);
            return;
        }
        
        // Verificar permissão do evento
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        $lotes = json_decode($lotes_json, true);
        if (!$lotes || !is_array($lotes)) {
            echo json_encode(['erro' => 'Formato inválido dos dados dos lotes']);
            return;
        }
        
        error_log("🚀 Criando " . count($lotes) . " lotes por percentual para evento $evento_id");
        error_log("📊 Limite total: $limite_total");
        
        $con->begin_transaction();
        $lotes_criados = [];
        
        try {
            // Remover lotes existentes de quantidade deste evento
            $sql_delete = "DELETE FROM lotes WHERE evento_id = ? AND tipo = 'quantidade'";
            $stmt_delete = $con->prepare($sql_delete);
            $stmt_delete->bind_param("i", $evento_id);
            $stmt_delete->execute();
            $stmt_delete->close();
            
            error_log("🗑️ Lotes de quantidade existentes removidos");
            
            // Inserir cada lote usando campos existentes  
            $sql_insert = "INSERT INTO lotes (
                evento_id, nome, tipo, percentual_venda, 
                divulgar_criterio, criado_em
            ) VALUES (?, ?, 'quantidade', ?, ?, NOW())";
            
            $stmt_insert = $con->prepare($sql_insert);
            
            if (!$stmt_insert) {
                throw new Exception("Erro ao preparar INSERT: " . $con->error);
            }
            
            foreach ($lotes as $index => $lote) {
                $nome = $lote['nome'] ?? "Lote " . ($index + 1);
                $percentual = intval($lote['percentual_venda'] ?? 0);
                $divulgar = intval($lote['divulgar_criterio'] ?? 0);
                $quantidade = intval($lote['quantidade'] ?? 0);
                
                // Validações
                if ($percentual <= 0 || $percentual > 100) {
                    throw new Exception("Percentual inválido para lote '$nome': $percentual%");
                }
                
                if ($quantidade <= 0) {
                    throw new Exception("Quantidade inválida para lote '$nome': $quantidade");
                }
                
                // CORREÇÃO: Inserir usando bind correto
                $stmt_insert->bind_param("isii", 
                    $evento_id, $nome, $percentual, $divulgar
                );
                
                error_log("📝 Inserindo lote: evento=$evento_id, nome='$nome', percentual=$percentual, divulgar=$divulgar");
                
                if (!$stmt_insert->execute()) {
                    throw new Exception("Erro ao inserir lote '$nome': " . $stmt_insert->error);
                }
                
                $lote_id = $con->insert_id;
                error_log("✅ Lote inserido com ID: $lote_id");
                
                // Adicionar à lista de criados
                $lotes_criados[] = [
                    'id' => $lote_id,
                    'nome' => $nome,
                    'tipo' => 'quantidade',
                    'percentual_venda' => $percentual,
                    'quantidade' => $quantidade,
                    'divulgar_criterio' => $divulgar,
                    'evento_id' => $evento_id
                ];
            }
            
            $stmt_insert->close();
            $con->commit();
            
            error_log("🎉 Todos os " . count($lotes_criados) . " lotes criados com sucesso!");
            
            echo json_encode([
                'sucesso' => true,
                'lotes_criados' => $lotes_criados,
                'total_lotes' => count($lotes_criados),
                'limite_total' => $limite_total,
                'mensagem' => count($lotes_criados) . ' lotes criados com sucesso'
            ]);
            
        } catch (Exception $e) {
            $con->rollback();
            throw $e;
        }
        
    } catch (Exception $e) {
        error_log("❌ Erro ao criar lotes por percentual: " . $e->getMessage());
        echo json_encode(['erro' => $e->getMessage()]);
    }
}

/**
 * Exclui um lote específico por ID
 */
function excluirLoteEspecifico($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $lote_id = intval($_POST['lote_id'] ?? 0);
        
        if (!$evento_id || !$lote_id) {
            echo json_encode(['erro' => 'ID do evento e lote são obrigatórios']);
            return;
        }
        
        // Verificar permissão
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        error_log("Excluindo lote específico: evento=$evento_id, lote=$lote_id");
        
        mysqli_begin_transaction($con);
        
        // 1. Excluir ingressos relacionados ao lote
        $sql_ingressos = "DELETE FROM ingressos WHERE lote_id = ? AND evento_id = ?";
        $stmt_ingressos = $con->prepare($sql_ingressos);
        $stmt_ingressos->bind_param("ii", $lote_id, $evento_id);
        $ingressos_deletados = $stmt_ingressos->execute();
        
        $ingressos_afetados = $con->affected_rows;
        error_log("Ingressos excluídos: $ingressos_afetados");
        
        // 2. Excluir o lote
        $sql_lote = "DELETE FROM lotes WHERE id = ? AND evento_id = ?";
        $stmt_lote = $con->prepare($sql_lote);
        $stmt_lote->bind_param("ii", $lote_id, $evento_id);
        $lote_deletado = $stmt_lote->execute();
        
        $lotes_afetados = $con->affected_rows;
        error_log("Lotes excluídos: $lotes_afetados");
        
        if ($lote_deletado && $lotes_afetados > 0) {
            mysqli_commit($con);
            
            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Lote excluído com sucesso',
                'ingressos_excluidos' => $ingressos_afetados,
                'lotes_excluidos' => $lotes_afetados
            ]);
        } else {
            mysqli_rollback($con);
            echo json_encode(['erro' => 'Lote não encontrado ou já excluído']);
        }
        
    } catch (Exception $e) {
        mysqli_rollback($con);
        error_log("❌ Erro ao excluir lote específico: " . $e->getMessage());
        echo json_encode(['erro' => $e->getMessage()]);
    }
}

/**
 * Carrega lotes por quantidade/percentual existentes
 */
function carregarLotesQuantidade($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Verificar permissão
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        error_log("Carregando lotes por quantidade do evento $evento_id");
        
        // Buscar lotes por quantidade (tipo percentual ou quantidade)
        $sql = "SELECT id, nome, tipo, data_inicio, data_fim, percentual_venda, divulgar_criterio 
                FROM lotes 
                WHERE evento_id = ? AND tipo IN ('percentual', 'quantidade')
                ORDER BY percentual_venda ASC, id ASC";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("i", $evento_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $lotes = [];
        while ($row = $result->fetch_assoc()) {
            $lotes[] = [
                'id' => $row['id'],
                'nome' => $row['nome'],
                'tipo' => $row['tipo'],
                'data_inicio' => $row['data_inicio'],
                'data_fim' => $row['data_fim'], 
                'percentual_venda' => intval($row['percentual_venda']),
                'divulgar_criterio' => (bool)$row['divulgar_criterio']
            ];
        }
        
        error_log("✅ Encontrados " . count($lotes) . " lotes por quantidade");
        
        echo json_encode([
            'sucesso' => true,
            'lotes' => $lotes,
            'total' => count($lotes)
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Erro ao carregar lotes por quantidade: " . $e->getMessage());
        echo json_encode(['erro' => $e->getMessage()]);
    }
}

/**
 * Atualizar lote específico
 */
function atualizarLoteEspecifico($con, $usuario_id) {
    try {
        $lote_id = intval($_POST['lote_id'] ?? 0);
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $percentual_venda = intval($_POST['percentual_venda'] ?? 0);
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        
        if (!$lote_id || !$evento_id) {
            echo json_encode(['erro' => 'ID do lote e evento são obrigatórios']);
            return;
        }
        
        if ($percentual_venda < 1 || $percentual_venda > 100) {
            echo json_encode(['erro' => 'Percentual deve estar entre 1 e 100%']);
            return;
        }
        
        // Verificar se o lote pertence ao usuário
        $sql_verificar = "SELECT l.id FROM lotes l 
                         INNER JOIN eventos e ON l.evento_id = e.id 
                         WHERE l.id = ? AND e.usuario_id = ?";
        $stmt_verificar = $con->prepare($sql_verificar);
        $stmt_verificar->bind_param("ii", $lote_id, $usuario_id);
        $stmt_verificar->execute();
        $result_verificar = $stmt_verificar->get_result();
        
        if ($result_verificar->num_rows == 0) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para editar este lote']);
            return;
        }
        
        error_log("Atualizando lote $lote_id: percentual=$percentual_venda%, divulgar=$divulgar_criterio");
        
        // Atualizar apenas percentual e divulgação
        $sql_atualizar = "UPDATE lotes SET 
                         percentual_venda = ?, 
                         divulgar_criterio = ?,
                         atualizado_em = NOW()
                         WHERE id = ?";
        
        $stmt_atualizar = $con->prepare($sql_atualizar);
        $stmt_atualizar->bind_param("iii", $percentual_venda, $divulgar_criterio, $lote_id);
        
        if ($stmt_atualizar->execute()) {
            error_log("✅ Lote $lote_id atualizado com sucesso");
            
            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Lote atualizado com sucesso',
                'lote_id' => $lote_id
            ]);
        } else {
            error_log("❌ Erro ao atualizar lote: " . $con->error);
            echo json_encode(['erro' => 'Erro ao atualizar lote no banco de dados']);
        }
        
    } catch (Exception $e) {
        error_log("❌ Erro ao atualizar lote: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Salvar lote (CREATE/UPDATE)
 */
function salvarLote($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $id = intval($_POST['id'] ?? 0); // Para UPDATE
        $nome = trim($_POST['nome'] ?? '');
        $tipo = trim($_POST['tipo'] ?? '');
        $data_inicio = $_POST['data_inicio'] ?? '';
        $data_fim = $_POST['data_fim'] ?? '';
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        
        error_log("=== SALVANDO LOTE ===");
        error_log("Evento ID: $evento_id");
        error_log("Lote ID: $id");
        error_log("Nome: $nome");
        error_log("Tipo: $tipo");
        error_log("Data início: $data_inicio");
        error_log("Data fim: $data_fim");
        error_log("Divulgar: $divulgar_criterio");
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if (empty($nome) || empty($tipo)) {
            echo json_encode(['erro' => 'Nome e tipo são obrigatórios']);
            return;
        }
        
        // Verificar se o evento pertence ao usuário
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        if ($id > 0) {
            // UPDATE - Editar lote existente
            if ($tipo === 'data') {
                if (empty($data_inicio) || empty($data_fim)) {
                    echo json_encode(['erro' => 'Datas de início e fim são obrigatórias para lotes por data']);
                    return;
                }
                
                $sql = "UPDATE lotes SET 
                        nome = ?, 
                        tipo = ?, 
                        data_inicio = ?, 
                        data_fim = ?, 
                        divulgar_criterio = ?,
                        atualizado_em = NOW()
                        WHERE id = ? AND evento_id = ?";
                
                $stmt = $con->prepare($sql);
                $stmt->bind_param("ssssiii", $nome, $tipo, $data_inicio, $data_fim, $divulgar_criterio, $id, $evento_id);
            } else {
                // Outros tipos de lote
                $sql = "UPDATE lotes SET 
                        nome = ?, 
                        tipo = ?, 
                        divulgar_criterio = ?,
                        atualizado_em = NOW()
                        WHERE id = ? AND evento_id = ?";
                
                $stmt = $con->prepare($sql);
                $stmt->bind_param("ssiii", $nome, $tipo, $divulgar_criterio, $id, $evento_id);
            }
            
            if ($stmt->execute()) {
                error_log("✅ Lote $id atualizado com sucesso");
                echo json_encode([
                    'sucesso' => true,
                    'mensagem' => 'Lote atualizado com sucesso',
                    'lote_id' => $id
                ]);
            } else {
                error_log("❌ Erro ao atualizar lote: " . $con->error);
                echo json_encode(['erro' => 'Erro ao atualizar lote']);
            }
            
        } else {
            // CREATE - Criar novo lote
            if ($tipo === 'data') {
                if (empty($data_inicio) || empty($data_fim)) {
                    echo json_encode(['erro' => 'Datas de início e fim são obrigatórias para lotes por data']);
                    return;
                }
                
                $sql = "INSERT INTO lotes (evento_id, nome, tipo, data_inicio, data_fim, divulgar_criterio, criado_em, atualizado_em) 
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
                
                $stmt = $con->prepare($sql);
                $stmt->bind_param("issssi", $evento_id, $nome, $tipo, $data_inicio, $data_fim, $divulgar_criterio);
            } else {
                $sql = "INSERT INTO lotes (evento_id, nome, tipo, divulgar_criterio, criado_em, atualizado_em) 
                        VALUES (?, ?, ?, ?, NOW(), NOW())";
                
                $stmt = $con->prepare($sql);
                $stmt->bind_param("issi", $evento_id, $nome, $tipo, $divulgar_criterio);
            }
            
            if ($stmt->execute()) {
                $novo_id = $con->insert_id;
                error_log("✅ Novo lote criado com ID: $novo_id");
                echo json_encode([
                    'sucesso' => true,
                    'mensagem' => 'Lote criado com sucesso',
                    'lote_id' => $novo_id
                ]);
            } else {
                error_log("❌ Erro ao criar lote: " . $con->error);
                echo json_encode(['erro' => 'Erro ao criar lote']);
            }
        }
        
    } catch (Exception $e) {
        error_log("❌ Erro ao salvar lote: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Criar lote por data diretamente no banco
 */
function criarLoteData($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $nome = $_POST['nome'] ?? '';
        $data_inicio = $_POST['data_inicio'] ?? '';
        $data_fim = $_POST['data_fim'] ?? '';
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        
        error_log("=== CRIANDO LOTE POR DATA ===");
        error_log("evento_id: $evento_id");
        error_log("nome: $nome");
        error_log("data_inicio: $data_inicio");
        error_log("data_fim: $data_fim");
        error_log("divulgar_criterio: $divulgar_criterio");
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if (!$nome || !$data_inicio || !$data_fim) {
            echo json_encode(['erro' => 'Nome e datas são obrigatórios']);
            return;
        }
        
        // Verificar se o evento pertence ao usuário
        if (!verificarPermissaoEvento($con, $evento_id, $usuario_id)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para este evento']);
            return;
        }
        
        // Verificar sobreposições de data
        $sql_verifica = "SELECT id, nome FROM lotes WHERE evento_id = ? AND tipo = 'data' 
                        AND ((data_inicio <= ? AND data_fim >= ?) OR 
                             (data_inicio <= ? AND data_fim >= ?) OR 
                             (data_inicio >= ? AND data_fim <= ?))";
        $stmt_verifica = $con->prepare($sql_verifica);
        $stmt_verifica->bind_param("issssss", $evento_id, $data_inicio, $data_inicio, $data_fim, $data_fim, $data_inicio, $data_fim);
        $stmt_verifica->execute();
        $result_verifica = $stmt_verifica->get_result();
        
        if ($result_verifica->num_rows > 0) {
            $lote_conflitante = $result_verifica->fetch_assoc();
            echo json_encode(['erro' => 'Há sobreposição de datas com o lote: ' . $lote_conflitante['nome']]);
            return;
        }
        
        // Criar o lote
        $sql = "INSERT INTO lotes (
                    evento_id, nome, tipo, data_inicio, data_fim, 
                    divulgar_criterio, percentual_venda, criado_em
                ) VALUES (?, ?, 'data', ?, ?, ?, 0, NOW())";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("isssi", $evento_id, $nome, $data_inicio, $data_fim, $divulgar_criterio);
        
        if ($stmt->execute()) {
            $lote_id = $con->insert_id;
            error_log("✅ Lote por data criado com ID: $lote_id");
            
            echo json_encode([
                'sucesso' => true,
                'lote_id' => $lote_id,
                'mensagem' => 'Lote por data criado com sucesso'
            ]);
        } else {
            error_log("❌ Erro ao criar lote por data: " . $con->error);
            echo json_encode(['erro' => 'Erro ao criar lote por data']);
        }
        
    } catch (Exception $e) {
        error_log("❌ Exception ao criar lote por data: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * API COMPLETA PARA SISTEMA DE LOTES MYSQL
 * Implementa todas as operações necessárias seguindo regras de negócio
 */

/**
 * Atualizar lote específico (versão completa)
 */
function atualizarLoteEspecificoCompleto($con, $usuario_id) {
    try {
        $lote_id = intval($_POST['lote_id'] ?? 0);
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $nome = trim($_POST['nome'] ?? '');
        $data_inicio = $_POST['data_inicio'] ?? '';
        $data_fim = $_POST['data_fim'] ?? '';
        $percentual_venda = intval($_POST['percentual_venda'] ?? 0);
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        $percentual_aumento_valor = intval($_POST['percentual_aumento_valor'] ?? 0);
        
        error_log("=== ATUALIZANDO LOTE ESPECÍFICO ===");
        error_log("lote_id: $lote_id, evento_id: $evento_id");
        error_log("nome: '$nome', data_inicio: '$data_inicio', data_fim: '$data_fim'");
        error_log("percentual_venda: $percentual_venda, divulgar: $divulgar_criterio");
        
        if (!$lote_id) {
            echo json_encode(['erro' => 'ID do lote é obrigatório']);
            return;
        }
        
        // Verificar se o lote pertence ao usuário
        $sql_verificar = "SELECT l.*, e.usuario_id FROM lotes l 
                         INNER JOIN eventos e ON l.evento_id = e.id 
                         WHERE l.id = ?";
        $stmt_verificar = $con->prepare($sql_verificar);
        $stmt_verificar->bind_param("i", $lote_id);
        $stmt_verificar->execute();
        $result_verificar = $stmt_verificar->get_result();
        
        if ($result_verificar->num_rows == 0) {
            echo json_encode(['erro' => 'Lote não encontrado']);
            return;
        }
        
        $lote_atual = $result_verificar->fetch_assoc();
        
        if ($lote_atual['usuario_id'] != $usuario_id) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para editar este lote']);
            return;
        }
        
        // Montar query de UPDATE baseado no tipo de lote
        $campos_update = [];
        $valores = [];
        $tipos = '';
        
        if (!empty($nome)) {
            $campos_update[] = "nome = ?";
            $valores[] = $nome;
            $tipos .= 's';
        }
        
        if (!empty($data_inicio)) {
            $campos_update[] = "data_inicio = ?";
            $valores[] = $data_inicio;
            $tipos .= 's';
        }
        
        if (!empty($data_fim)) {
            $campos_update[] = "data_fim = ?";
            $valores[] = $data_fim;
            $tipos .= 's';
        }
        
        if ($percentual_venda > 0) {
            $campos_update[] = "percentual_venda = ?";
            $valores[] = $percentual_venda;
            $tipos .= 'i';
        }
        
        $campos_update[] = "divulgar_criterio = ?";
        $valores[] = $divulgar_criterio;
        $tipos .= 'i';
        
        $campos_update[] = "percentual_aumento_valor = ?";
        $valores[] = $percentual_aumento_valor;
        $tipos .= 'i';
        
        $campos_update[] = "atualizado_em = NOW()";
        
        // Adicionar ID do lote no final
        $valores[] = $lote_id;
        $tipos .= 'i';
        
        $sql_update = "UPDATE lotes SET " . implode(", ", $campos_update) . " WHERE id = ?";
        
        error_log("SQL UPDATE: $sql_update");
        error_log("Valores: " . print_r($valores, true));
        
        $stmt_update = $con->prepare($sql_update);
        $stmt_update->bind_param($tipos, ...$valores);
        
        if ($stmt_update->execute()) {
            error_log("✅ Lote $lote_id atualizado com sucesso");
            
            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Lote atualizado com sucesso',
                'lote_id' => $lote_id
            ]);
        } else {
            error_log("❌ Erro ao atualizar lote: " . $con->error);
            echo json_encode(['erro' => 'Erro ao atualizar lote no banco de dados']);
        }
        
    } catch (Exception $e) {
        error_log("❌ Erro ao atualizar lote específico: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Buscar lote específico com todos os dados
 */
function buscarLoteEspecificoCompleto($con, $usuario_id) {
    try {
        $lote_id = intval($_POST['lote_id'] ?? 0);
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$lote_id) {
            echo json_encode(['erro' => 'ID do lote é obrigatório']);
            return;
        }
        
        // Buscar lote com verificação de permissão
        $sql = "SELECT l.*, e.usuario_id FROM lotes l 
                INNER JOIN eventos e ON l.evento_id = e.id 
                WHERE l.id = ?";
        
        if ($evento_id) {
            $sql .= " AND l.evento_id = ?";
        }
        
        $stmt = $con->prepare($sql);
        
        if ($evento_id) {
            $stmt->bind_param("ii", $lote_id, $evento_id);
        } else {
            $stmt->bind_param("i", $lote_id);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            echo json_encode(['erro' => 'Lote não encontrado']);
            return;
        }
        
        $lote = $result->fetch_assoc();
        
        if ($lote['usuario_id'] != $usuario_id) {
            http_response_code(403);
            echo json_encode(['erro' => 'Sem permissão para acessar este lote']);
            return;
        }
        
        // Remover dados sensíveis
        unset($lote['usuario_id']);
        
        echo json_encode([
            'sucesso' => true,
            'lote' => $lote
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Erro ao buscar lote específico: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Recuperar dados completos do evento (incluindo lotes)
 */
function recuperarDadosEventoCompleto($con, $usuario_id) {
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Buscar evento
        $sql_evento = "SELECT * FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt_evento = $con->prepare($sql_evento);
        $stmt_evento->bind_param("ii", $evento_id, $usuario_id);
        $stmt_evento->execute();
        $result_evento = $stmt_evento->get_result();
        
        if ($result_evento->num_rows == 0) {
            echo json_encode(['erro' => 'Evento não encontrado']);
            return;
        }
        
        $evento = $result_evento->fetch_assoc();
        
        // Buscar lotes do evento
        $sql_lotes = "SELECT * FROM lotes WHERE evento_id = ? ORDER BY 
                     CASE WHEN tipo = 'data' THEN data_inicio ELSE percentual_venda END";
        $stmt_lotes = $con->prepare($sql_lotes);
        $stmt_lotes->bind_param("i", $evento_id);
        $stmt_lotes->execute();
        $result_lotes = $stmt_lotes->get_result();
        
        $lotes = [];
        while ($lote = $result_lotes->fetch_assoc()) {
            $lotes[] = $lote;
        }
        
        $evento['lotes'] = $lotes;
        
        echo json_encode([
            'sucesso' => true,
            'evento' => $evento
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Erro ao recuperar dados do evento: " . $e->getMessage());
        echo json_encode(['erro' => 'Erro interno do servidor']);
    }
}

/**
 * Função simples para recuperar evento (para debug)
 */
function recuperarEventoSimples($con, $usuario_id) {
    // Limpar qualquer output anterior
    if (ob_get_level()) ob_clean();
    
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Buscar apenas evento
        $sql = "SELECT * FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt = $con->prepare($sql);
        $stmt->bind_param("ii", $evento_id, $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'Evento não encontrado']);
            return;
        }
        
        $evento = $result->fetch_assoc();
        
        // Buscar lotes separadamente
        $sql_lotes = "SELECT * FROM lotes WHERE evento_id = ? ORDER BY id";
        $stmt_lotes = $con->prepare($sql_lotes);
        $stmt_lotes->bind_param("i", $evento_id);
        $stmt_lotes->execute();
        $result_lotes = $stmt_lotes->get_result();
        
        $lotes = [];
        while ($lote = $result_lotes->fetch_assoc()) {
            $lotes[] = $lote;
        }
        
        $evento['lotes'] = $lotes;
        
        echo json_encode([
            'sucesso' => true,
            'evento' => $evento
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Erro ao recuperar evento simples: " . $e->getMessage());
        echo json_encode(['sucesso' => false, 'erro' => 'Erro interno do servidor']);
    }
}

// Adicionar casos no switch principal (seria feito no início do arquivo)
// Para compatibilidade, vamos criar aliases para as funções

// Adicionar aliases para as novas funções
if ($action === 'recuperar_evento_simples') {
    recuperarEventoSimples($con, $usuario_id);
    exit;
}

if ($action === 'atualizar_lote_especifico') {
    atualizarLoteEspecificoCompleto($con, $usuario_id);
    exit;
}

if ($action === 'buscar_lote_especifico') {
    buscarLoteEspecificoCompleto($con, $usuario_id);
    exit;
}

if ($action === 'recuperar_evento') {
    recuperarDadosEventoCompleto($con, $usuario_id);
    exit;
}

/**
 * Criar lote por data com renomeação automática
 */
function criarLoteDataComRenomeacao($con, $usuario_id) {
    // Limpar output anterior
    if (ob_get_level()) ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $data_inicio = $_POST['data_inicio'] ?? '';
        $data_fim = $_POST['data_fim'] ?? '';
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        $percentual_aumento_valor = intval($_POST['percentual_aumento_valor'] ?? 0);
        
        error_log("=== CRIANDO LOTE POR DATA COM RENOMEAÇÃO ===");
        error_log("evento_id: $evento_id");
        error_log("data_inicio: $data_inicio");
        error_log("data_fim: $data_fim");
        
        if (!$evento_id) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if (!$data_inicio || !$data_fim) {
            echo json_encode(['sucesso' => false, 'erro' => 'Datas de início e fim são obrigatórias']);
            return;
        }
        
        // Verificar permissão do evento
        $sql_permissao = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt_permissao = $con->prepare($sql_permissao);
        $stmt_permissao->bind_param("ii", $evento_id, $usuario_id);
        $stmt_permissao->execute();
        $result_permissao = $stmt_permissao->get_result();
        
        if ($result_permissao->num_rows == 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'Evento não encontrado ou sem permissão']);
            return;
        }
        
        // Calcular nome automaticamente baseado na quantidade de lotes por data existentes
        $sql_contar = "SELECT COUNT(*) as total FROM lotes WHERE evento_id = ? AND tipo = 'data'";
        $stmt_contar = $con->prepare($sql_contar);
        $stmt_contar->bind_param("i", $evento_id);
        $stmt_contar->execute();
        $result_contar = $stmt_contar->get_result();
        $row_count = $result_contar->fetch_assoc();
        
        $proximoNumero = $row_count['total'] + 1;
        $nome_automatico = "Lote $proximoNumero";
        
        error_log("Nome automático calculado: $nome_automatico (posição $proximoNumero)");
        
        // Verificar sobreposições de data
        $sql_verifica = "SELECT id, nome FROM lotes WHERE evento_id = ? AND tipo = 'data' 
                        AND ((data_inicio <= ? AND data_fim >= ?) OR 
                             (data_inicio <= ? AND data_fim >= ?) OR 
                             (data_inicio >= ? AND data_fim <= ?))";
        $stmt_verifica = $con->prepare($sql_verifica);
        $stmt_verifica->bind_param("issssss", $evento_id, $data_inicio, $data_inicio, $data_fim, $data_fim, $data_inicio, $data_fim);
        $stmt_verifica->execute();
        $result_verifica = $stmt_verifica->get_result();
        
        if ($result_verifica->num_rows > 0) {
            $lote_conflitante = $result_verifica->fetch_assoc();
            echo json_encode(['sucesso' => false, 'erro' => 'Há sobreposição de datas com o lote: ' . $lote_conflitante['nome']]);
            return;
        }
        
        // Criar o lote
        $sql = "INSERT INTO lotes (
                    evento_id, nome, tipo, data_inicio, data_fim, 
                    divulgar_criterio, percentual_aumento_valor, criado_em
                ) VALUES (?, ?, 'data', ?, ?, ?, ?, NOW())";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("isssii", $evento_id, $nome_automatico, $data_inicio, $data_fim, $divulgar_criterio, $percentual_aumento_valor);
        
        if ($stmt->execute()) {
            $lote_id = $con->insert_id;
            error_log("✅ Lote por data criado com ID: $lote_id e nome: $nome_automatico");
            
            // Renomear todos os lotes por data para manter sequência
            renomearLotesPorTipo($con, $evento_id, 'data');
            
            echo json_encode([
                'sucesso' => true,
                'lote_id' => $lote_id,
                'nome' => $nome_automatico,
                'mensagem' => 'Lote por data criado com sucesso'
            ]);
        } else {
            error_log("❌ Erro ao criar lote por data: " . $con->error);
            echo json_encode(['sucesso' => false, 'erro' => 'Erro ao criar lote por data']);
        }
        
    } catch (Exception $e) {
        error_log("❌ Exception ao criar lote por data: " . $e->getMessage());
        echo json_encode(['sucesso' => false, 'erro' => 'Erro interno do servidor']);
    }
}

/**
 * Criar lote por quantidade com renomeação automática
 */
function criarLoteQuantidadeComRenomeacao($con, $usuario_id) {
    // Limpar output anterior
    if (ob_get_level()) ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        $percentual_venda = intval($_POST['percentual_venda'] ?? 0);
        $divulgar_criterio = intval($_POST['divulgar_criterio'] ?? 0);
        $percentual_aumento_valor = intval($_POST['percentual_aumento_valor'] ?? 0);
        
        error_log("=== CRIANDO LOTE POR QUANTIDADE COM RENOMEAÇÃO ===");
        error_log("evento_id: $evento_id");
        error_log("percentual_venda: $percentual_venda");
        
        if (!$evento_id) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        if ($percentual_venda < 1 || $percentual_venda > 100) {
            echo json_encode(['sucesso' => false, 'erro' => 'Percentual deve estar entre 1 e 100']);
            return;
        }
        
        // Verificar permissão do evento
        $sql_permissao = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt_permissao = $con->prepare($sql_permissao);
        $stmt_permissao->bind_param("ii", $evento_id, $usuario_id);
        $stmt_permissao->execute();
        $result_permissao = $stmt_permissao->get_result();
        
        if ($result_permissao->num_rows == 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'Evento não encontrado ou sem permissão']);
            return;
        }
        
        // Verificar se percentual já existe
        $sql_verifica_perc = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'quantidade' AND percentual_venda = ?";
        $stmt_verifica_perc = $con->prepare($sql_verifica_perc);
        $stmt_verifica_perc->bind_param("ii", $evento_id, $percentual_venda);
        $stmt_verifica_perc->execute();
        $result_verifica_perc = $stmt_verifica_perc->get_result();
        
        if ($result_verifica_perc->num_rows > 0) {
            echo json_encode(['sucesso' => false, 'erro' => "Já existe um lote com $percentual_venda% de vendas"]);
            return;
        }
        
        // Calcular nome automaticamente baseado na quantidade de lotes por quantidade existentes
        $sql_contar = "SELECT COUNT(*) as total FROM lotes WHERE evento_id = ? AND tipo = 'quantidade'";
        $stmt_contar = $con->prepare($sql_contar);
        $stmt_contar->bind_param("i", $evento_id);
        $stmt_contar->execute();
        $result_contar = $stmt_contar->get_result();
        $row_count = $result_contar->fetch_assoc();
        
        $proximoNumero = $row_count['total'] + 1;
        $nome_automatico = "Lote $proximoNumero";
        
        error_log("Nome automático calculado: $nome_automatico (posição $proximoNumero)");
        
        // Criar o lote
        $sql = "INSERT INTO lotes (
                    evento_id, nome, tipo, percentual_venda, 
                    divulgar_criterio, percentual_aumento_valor, criado_em
                ) VALUES (?, ?, 'quantidade', ?, ?, ?, NOW())";
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("isiii", $evento_id, $nome_automatico, $percentual_venda, $divulgar_criterio, $percentual_aumento_valor);
        
        if ($stmt->execute()) {
            $lote_id = $con->insert_id;
            error_log("✅ Lote por quantidade criado com ID: $lote_id e nome: $nome_automatico");
            
            // Renomear todos os lotes por quantidade para manter sequência
            renomearLotesPorTipo($con, $evento_id, 'quantidade');
            
            echo json_encode([
                'sucesso' => true,
                'lote_id' => $lote_id,
                'nome' => $nome_automatico,
                'mensagem' => 'Lote por quantidade criado com sucesso'
            ]);
        } else {
            error_log("❌ Erro ao criar lote por quantidade: " . $con->error);
            echo json_encode(['sucesso' => false, 'erro' => 'Erro ao criar lote por quantidade']);
        }
        
    } catch (Exception $e) {
        error_log("❌ Exception ao criar lote por quantidade: " . $e->getMessage());
        echo json_encode(['sucesso' => false, 'erro' => 'Erro interno do servidor']);
    }
}

/**
 * Renomear lotes por tipo para manter sequência
 */
function renomearLotesPorTipo($con, $evento_id, $tipo) {
    try {
        error_log("=== RENOMEANDO LOTES TIPO: $tipo ===");
        
        if ($tipo === 'data') {
            // Ordenar por data_inicio
            $sql = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'data' ORDER BY data_inicio ASC";
        } else {
            // Ordenar por percentual_venda
            $sql = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'quantidade' ORDER BY percentual_venda ASC";
        }
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param("i", $evento_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $contador = 1;
        while ($row = $result->fetch_assoc()) {
            $novo_nome = "Lote $contador";
            
            $sql_update = "UPDATE lotes SET nome = ? WHERE id = ?";
            $stmt_update = $con->prepare($sql_update);
            $stmt_update->bind_param("si", $novo_nome, $row['id']);
            $stmt_update->execute();
            
            error_log("✅ Lote ID {$row['id']} renomeado para: $novo_nome");
            $contador++;
        }
        
        error_log("✅ Renomeação concluída para tipo: $tipo");
        
    } catch (Exception $e) {
        error_log("❌ Erro na renomeação: " . $e->getMessage());
    }
}

/**
 * Renomear lotes sequencialmente após exclusão
 */
function renomearLotesSequencial($con, $usuario_id) {
    // Limpar output anterior
    if (ob_get_level()) ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $evento_id = intval($_POST['evento_id'] ?? 0);
        
        if (!$evento_id) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID do evento é obrigatório']);
            return;
        }
        
        // Verificar permissão do evento
        $sql_permissao = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
        $stmt_permissao = $con->prepare($sql_permissao);
        $stmt_permissao->bind_param("ii", $evento_id, $usuario_id);
        $stmt_permissao->execute();
        $result_permissao = $stmt_permissao->get_result();
        
        if ($result_permissao->num_rows == 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'Evento não encontrado ou sem permissão']);
            return;
        }
        
        error_log("=== RENOMEANDO LOTES SEQUENCIALMENTE ===");
        error_log("evento_id: $evento_id");
        
        // Renomear lotes por data (ordenados por data_inicio)
        $sql_data = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'data' ORDER BY data_inicio ASC";
        $stmt_data = $con->prepare($sql_data);
        $stmt_data->bind_param("i", $evento_id);
        $stmt_data->execute();
        $result_data = $stmt_data->get_result();
        
        $contador_data = 1;
        while ($row_data = $result_data->fetch_assoc()) {
            $novo_nome = "Lote $contador_data";
            
            $sql_update_data = "UPDATE lotes SET nome = ? WHERE id = ?";
            $stmt_update_data = $con->prepare($sql_update_data);
            $stmt_update_data->bind_param("si", $novo_nome, $row_data['id']);
            $stmt_update_data->execute();
            
            error_log("✅ Lote por data ID {$row_data['id']} renomeado para: $novo_nome");
            $contador_data++;
        }
        
        // Renomear lotes por quantidade (ordenados por percentual_venda)
        $sql_quantidade = "SELECT id FROM lotes WHERE evento_id = ? AND tipo = 'quantidade' ORDER BY percentual_venda ASC";
        $stmt_quantidade = $con->prepare($sql_quantidade);
        $stmt_quantidade->bind_param("i", $evento_id);
        $stmt_quantidade->execute();
        $result_quantidade = $stmt_quantidade->get_result();
        
        $contador_quantidade = 1;
        while ($row_quantidade = $result_quantidade->fetch_assoc()) {
            $novo_nome = "Lote $contador_quantidade";
            
            $sql_update_quantidade = "UPDATE lotes SET nome = ? WHERE id = ?";
            $stmt_update_quantidade = $con->prepare($sql_update_quantidade);
            $stmt_update_quantidade->bind_param("si", $novo_nome, $row_quantidade['id']);
            $stmt_update_quantidade->execute();
            
            error_log("✅ Lote por quantidade ID {$row_quantidade['id']} renomeado para: $novo_nome");
            $contador_quantidade++;
        }
        
        error_log("✅ Renomeação sequencial concluída");
        
        echo json_encode([
            'sucesso' => true,
            'lotes_data_renomeados' => $contador_data - 1,
            'lotes_quantidade_renomeados' => $contador_quantidade - 1,
            'mensagem' => 'Lotes renomeados sequencialmente com sucesso'
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Exception na renomeação sequencial: " . $e->getMessage());
        echo json_encode(['sucesso' => false, 'erro' => 'Erro interno do servidor']);
    }
}

mysqli_close($con);
?>
