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
        
    case 'excluir_lote':
        excluirLote($con, $usuario_id);
        break;
        
    case 'verificar_ingressos_lote':
        verificarIngressosLote($con, $usuario_id);
        break;
        
    case 'listar_ingressos_para_combo':
        listarIngressosParaCombo($con, $usuario_id);
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
    $taxa_plataforma = floatval($ingresso_data['taxa_plataforma']);
    $valor_receber = floatval($ingresso_data['valor_receber']);
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
    error_log("=== EXCLUINDO LOTE ===");
    
    $evento_id = intval($_POST['evento_id']);
    $lote_id = intval($_POST['lote_id']);
    
    error_log("Evento ID: $evento_id, Lote ID: $lote_id");
    
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
    
    // Excluir lote
    $sql = "DELETE FROM lotes WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $lote_id, $evento_id);
    
    if (mysqli_stmt_execute($stmt)) {
        error_log("✅ Lote $lote_id excluído com sucesso");
        echo json_encode(['sucesso' => true]);
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

mysqli_close($con);
?>
