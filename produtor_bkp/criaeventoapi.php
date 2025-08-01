<?php
/**
 * API para criação de eventos - AnySummit
 * Versão corrigida baseada na estrutura real do banco
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// Tratamento de OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir conexão com banco
require_once 'conm/conn.php';

// Iniciar sessão se necessário
session_start();

// Função para responder com JSON
function responderJSON($sucesso, $mensagem, $dados = null) {
    echo json_encode([
        'success' => $sucesso,
        'message' => $mensagem,
        'data' => $dados
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJSON(false, 'Método não permitido');
}

// Receber dados JSON
$dadosJSON = file_get_contents('php://input');
$dados = json_decode($dadosJSON, true);

// Debug - salvar dados recebidos em arquivo de log
$log_file = 'logs/api_debug_' . date('Y-m-d_H-i-s') . '.log';
if (!file_exists('logs')) {
    mkdir('logs', 0777, true);
}
file_put_contents($log_file, "=== DADOS RECEBIDOS ===\n" . print_r($dados, true) . "\n", FILE_APPEND);
file_put_contents($log_file, "=== SESSÃO ===\n" . print_r($_SESSION, true) . "\n", FILE_APPEND);
file_put_contents($log_file, "=== COOKIES ===\n" . print_r($_COOKIE, true) . "\n", FILE_APPEND);

if (!$dados) {
    responderJSON(false, 'Dados inválidos');
}

// Verificar se usuário está logado
file_put_contents($log_file, "=== VERIFICAÇÃO DE SESSÃO ===\nusuarioid está definido? " . (isset($_SESSION['usuarioid']) ? 'SIM' : 'NÃO') . "\n", FILE_APPEND);
if (!isset($_SESSION['usuarioid'])) {
    file_put_contents($log_file, "ERRO: Usuário não autenticado\n", FILE_APPEND);
    responderJSON(false, 'Usuário não autenticado');
}

$usuario_id = $_SESSION['usuarioid'];
$contratante_id = $_SESSION['contratanteid'] ?? null;

try {
    // Iniciar transação
    mysqli_begin_transaction($con);
    
    // ================ PASSO 1: INSERIR EVENTO ================
    
    // Preparar dados do evento
    $nome = mysqli_real_escape_string($con, $dados['nome']);
    $descricao = mysqli_real_escape_string($con, $dados['descricao_completa']);
    $classificacao = mysqli_real_escape_string($con, $dados['classificacao']);
    $categoria_id = intval($dados['categoria']);
    
    // Datas
    $data_inicio = $dados['data_inicio'];
    $data_fim = $dados['data_fim'] ?: $dados['data_inicio'];
    $evento_multiplos_dias = $dados['evento_multiplos_dias'] ? 1 : 0;
    
    // Localização
    $tipo_local = $dados['tipo_local'] == 'online' ? 'online' : 'presencial';
    $busca_endereco = mysqli_real_escape_string($con, $dados['busca_endereco']);
    $nome_local = mysqli_real_escape_string($con, $dados['nome_local']);
    $rua = mysqli_real_escape_string($con, $dados['endereco']); // IMPORTANTE: campo é 'rua' no banco
    $numero = mysqli_real_escape_string($con, $dados['numero']);
    $complemento = mysqli_real_escape_string($con, $dados['complemento']);
    $bairro = mysqli_real_escape_string($con, $dados['bairro']);
    $cidade = mysqli_real_escape_string($con, $dados['cidade']);
    $estado = mysqli_real_escape_string($con, $dados['estado']);
    $cep = mysqli_real_escape_string($con, $dados['cep']);
    $pais = mysqli_real_escape_string($con, $dados['pais'] ?: 'Brasil');
    $latitude = !empty($dados['latitude']) ? floatval($dados['latitude']) : 'NULL';
    $longitude = !empty($dados['longitude']) ? floatval($dados['longitude']) : 'NULL';
    $link_online = mysqli_real_escape_string($con, $dados['link_transmissao']);
    
    // Cor de fundo
    $cor_fundo = mysqli_real_escape_string($con, $dados['cor_fundo'] ?: '#000000');
    
    // Produtor
    $produtor_selecionado = $dados['tipo_produtor'] == 'new' ? 'novo' : 'atual';
    
    // Se produtor atual, buscar dados do contratante
    if ($produtor_selecionado == 'atual' && $contratante_id) {
        $query_contratante = mysqli_query($con, "SELECT nome_fantasia, razao_social FROM contratantes WHERE id = $contratante_id");
        if ($contratante = mysqli_fetch_assoc($query_contratante)) {
            $nome_produtor = mysqli_real_escape_string($con, $contratante['nome_fantasia']);
            $nome_exibicao_produtor = mysqli_real_escape_string($con, $contratante['razao_social'] ?: $contratante['nome_fantasia']);
            $descricao_produtor = mysqli_real_escape_string($con, ''); // Contratante não tem campo descrição
        } else {
            // Fallback se não encontrar
            $nome_produtor = mysqli_real_escape_string($con, $dados['nome_produtor']);
            $nome_exibicao_produtor = mysqli_real_escape_string($con, $dados['nome_exibicao']);
            $descricao_produtor = mysqli_real_escape_string($con, $dados['descricao_produtor']);
        }
    } else {
        $nome_produtor = mysqli_real_escape_string($con, $dados['nome_produtor']);
        $nome_exibicao_produtor = mysqli_real_escape_string($con, $dados['nome_exibicao']);
        $descricao_produtor = mysqli_real_escape_string($con, $dados['descricao_produtor']);
    }
    
    // Visibilidade - converter valores do frontend
    $visibilidade_frontend = $dados['visibilidade'];
    $visibilidade = 'publico'; // padrão
    $senha_acesso = null;
    
    if ($visibilidade_frontend == 'private') {
        $visibilidade = 'privado';
    } elseif ($visibilidade_frontend == 'password') {
        $visibilidade = 'privado';
        $senha_acesso = password_hash($dados['senha'], PASSWORD_DEFAULT);
    }
    
    // Termos
    $termos_aceitos = $dados['aceita_termos'] ? 1 : 0;
    
    // Buscar políticas e termos padrão
    $politicas = '';
    $termos = '';
    $query_params = mysqli_query($con, "SELECT politicas_eventos_default, termos_eventos_default FROM parametros LIMIT 1");
    if ($params = mysqli_fetch_assoc($query_params)) {
        $politicas = mysqli_real_escape_string($con, $params['politicas_eventos_default'] ?: '');
        $termos = mysqli_real_escape_string($con, $params['termos_eventos_default'] ?: '');
    }
    
    // Dados de aceite
    $dados_aceite = json_encode($dados['dados_aceite'] ?: [], JSON_UNESCAPED_UNICODE);
    $dados_aceite = mysqli_real_escape_string($con, $dados_aceite);
    
    // Gerar slug único
    $slug_base = preg_replace('/[^a-z0-9]+/', '-', strtolower($nome));
    $slug_base = trim($slug_base, '-');
    $slug = $slug_base;
    $contador = 1;
    
    while (true) {
        $check_slug = mysqli_query($con, "SELECT id FROM eventos WHERE slug = '$slug'");
        if (mysqli_num_rows($check_slug) == 0) break;
        $slug = $slug_base . '-' . $contador++;
    }
    
    // Processar imagens (já são URLs, não base64)
    $imagem_capa_path = '';
    $logo_evento_path = '';
    $imagem_fundo_path = '';
    
    // Imagem de capa
    if (!empty($dados['imagem_capa'])) {
        if (strpos($dados['imagem_capa'], 'http') === 0) {
            // É uma URL completa
            $imagem_capa_path = str_replace('https://anysummit.com.br', '', $dados['imagem_capa']);
        } elseif (strpos($dados['imagem_capa'], 'data:image') === 0) {
            // É base64, processar
            $imagem_capa_path = processarImagemBase64($dados['imagem_capa'], 'capa');
        }
    }
    
    // Logo do evento
    if (!empty($dados['logo_evento'])) {
        if (strpos($dados['logo_evento'], 'http') === 0) {
            $logo_evento_path = str_replace('https://anysummit.com.br', '', $dados['logo_evento']);
        } elseif (strpos($dados['logo_evento'], 'data:image') === 0) {
            $logo_evento_path = processarImagemBase64($dados['logo_evento'], 'logo');
        }
    }
    
    // Imagem de fundo
    if (!empty($dados['imagem_fundo'])) {
        if (strpos($dados['imagem_fundo'], 'http') === 0) {
            $imagem_fundo_path = str_replace('https://anysummit.com.br', '', $dados['imagem_fundo']);
        } elseif (strpos($dados['imagem_fundo'], 'data:image') === 0) {
            $imagem_fundo_path = processarImagemBase64($dados['imagem_fundo'], 'fundo');
        }
    }
    
    // Função auxiliar para processar base64
    function processarImagemBase64($base64, $tipo) {
        $parts = explode(',', $base64);
        $data = base64_decode($parts[1] ?? '');
        if ($data) {
            $nome = $tipo . '_' . uniqid() . '_' . time() . '.jpg';
            $dir = '../../uploads/eventos/';
            if (!file_exists($dir)) mkdir($dir, 0777, true);
            if (file_put_contents($dir . $nome, $data)) {
                return '/uploads/eventos/' . $nome;
            }
        }
        return '';
    }
    
    // Inserir evento
    $sql_evento = "INSERT INTO eventos (
        contratante_id, usuario_id, categoria_id, nome, descricao, imagem_capa,
        imagem_fundo, logo_evento, classificacao, slug, data_inicio, data_fim, 
        evento_multiplos_dias, tipo_local, link_online, busca_endereco, nome_local, 
        cep, rua, numero, complemento, bairro, cidade, estado, pais, latitude, longitude,
        produtor_selecionado, nome_produtor, nome_exibicao_produtor, descricao_produtor,
        visibilidade, termos_aceitos, status, publicado_em, criado_em, 
        politicas, termos, dados_aceite, cor_fundo
    ) VALUES (
        " . ($contratante_id ?: 'NULL') . ", 
        $usuario_id, 
        $categoria_id, 
        '$nome', 
        '$descricao', 
        '$imagem_capa_path',
        '$imagem_fundo_path',
        '$logo_evento_path',
        '$classificacao', 
        '$slug', 
        '$data_inicio', 
        '$data_fim', 
        $evento_multiplos_dias,
        '$tipo_local', 
        '$link_online', 
        '$busca_endereco', 
        '$nome_local', 
        '$cep', 
        '$rua', 
        '$numero',
        '$complemento', 
        '$bairro', 
        '$cidade', 
        '$estado', 
        '$pais', 
        $latitude, 
        $longitude,
        '$produtor_selecionado', 
        '$nome_produtor', 
        '$nome_exibicao_produtor', 
        '$descricao_produtor',
        '$visibilidade', 
        $termos_aceitos, 
        'publicado', 
        NOW(),
        NOW(),
        '$politicas',
        '$termos',
        '$dados_aceite',
        '$cor_fundo'
    )";
    
    if (!mysqli_query($con, $sql_evento)) {
        throw new Exception('Erro ao criar evento: ' . mysqli_error($con));
    }
    
    $evento_id = mysqli_insert_id($con);
    
    // Log do evento criado
    file_put_contents($log_file, "=== EVENTO CRIADO ===\nID: $evento_id\nSlug: $slug\n\n", FILE_APPEND);
    
    // Salvar senha se houver
    if ($senha_acesso) {
        // Verificar se coluna existe
        $check_column = mysqli_query($con, "SHOW COLUMNS FROM eventos LIKE 'senha_acesso'");
        if (mysqli_num_rows($check_column) == 0) {
            mysqli_query($con, "ALTER TABLE eventos ADD COLUMN senha_acesso VARCHAR(255) NULL AFTER visibilidade");
        }
        
        $sql_senha = "UPDATE eventos SET senha_acesso = '$senha_acesso' WHERE id = $evento_id";
        mysqli_query($con, $sql_senha);
    }
    
    // ================ PASSO 2: INSERIR LOTES ================
    
    $mapa_lotes = []; // Mapear IDs temporários para IDs reais do banco
    
    if (!empty($dados['lotes'])) {
        foreach ($dados['lotes'] as $lote) {
            $lote_nome = mysqli_real_escape_string($con, $lote['nome']);
            $lote_tipo = mysqli_real_escape_string($con, $lote['tipo']);
            $divulgar_criterio = isset($lote['divulgar_criterio']) ? 1 : 0;
            
            if ($lote_tipo == 'data' || $lote_tipo == 'por data') {
                $lote_data_inicio = $lote['data_inicio'];
                $lote_data_fim = $lote['data_fim'];
                $percentual_venda = 'NULL';
            } else { // por quantidade
                $lote_data_inicio = $data_inicio; // Usar data do evento
                $lote_data_fim = $data_fim;
                $percentual_venda = intval($lote['percentual'] ?: $lote['percentual_venda']);
            }
            
            $sql_lote = "INSERT INTO lotes (
                evento_id, nome, tipo, data_inicio, data_fim, 
                percentual_venda, divulgar_criterio, criado_em
            ) VALUES (
                $evento_id, 
                '$lote_nome', 
                '$lote_tipo', 
                '$lote_data_inicio', 
                '$lote_data_fim',
                $percentual_venda, 
                $divulgar_criterio, 
                NOW()
            )";
            
            if (!mysqli_query($con, $sql_lote)) {
                throw new Exception('Erro ao criar lote: ' . mysqli_error($con));
            }
            
            $lote_id_banco = mysqli_insert_id($con);
            $mapa_lotes[$lote['id']] = $lote_id_banco;
            
            // Log do lote criado
            file_put_contents($log_file, "Lote criado: ID=$lote_id_banco, Nome=$lote_nome, Tipo=$lote_tipo\n", FILE_APPEND);
        }
    }
    
    // ================ PASSO 3: INSERIR INGRESSOS (não combos) ================
    
    $mapa_ingressos = []; // Mapear IDs temporários para IDs reais do banco
    $combos_para_processar = []; // Guardar combos para processar depois
    
    if (!empty($dados['ingressos'])) {
        foreach ($dados['ingressos'] as $ingresso) {
            // Verificar se é um combo que veio no array errado
            if ($ingresso['tipo'] === 'combo' || 
                (isset($ingresso['id']) && strpos($ingresso['id'], 'combo_') !== false) ||
                (isset($ingresso['items']) && is_array($ingresso['items']))) {
                
                file_put_contents($log_file, "Combo encontrado no array de ingressos: " . $ingresso['titulo'] . "\n", FILE_APPEND);
                $combos_para_processar[] = $ingresso;
                continue; // Pular para o próximo
            }
            
            $titulo = mysqli_real_escape_string($con, $ingresso['titulo']);
            $descricao_ing = mysqli_real_escape_string($con, $ingresso['descricao']);
            
            // Converter tipo do frontend para backend
            $tipo_frontend = $ingresso['tipo'];
            $tipo = 'pago'; // padrão
            if ($tipo_frontend == 'free') {
                $tipo = 'gratuito';
            } elseif ($tipo_frontend == 'paid') {
                $tipo = 'pago';
            }
            
            $preco = floatval($ingresso['preco']);
            $quantidade_total = intval($ingresso['quantidade_total']);
            $limite_min = intval($ingresso['quantidade_por_pessoa_min'] ?: 1);
            $limite_max = intval($ingresso['quantidade_por_pessoa_max'] ?: 5);
            
            // Mapear lote_id
            $lote_id_frontend = $ingresso['lote_id'];
            $lote_id_banco = isset($mapa_lotes[$lote_id_frontend]) ? $mapa_lotes[$lote_id_frontend] : 'NULL';
            
            $inicio_venda = $ingresso['inicio_vendas'] ?: null;
            $fim_venda = $ingresso['fim_vendas'] ?: null;
            
            // Se não tem datas de venda, usar as do lote
            if (!$inicio_venda && $lote_id_banco !== 'NULL') {
                // Buscar datas do lote
                $sql_lote = "SELECT data_inicio, data_fim FROM lotes WHERE id = $lote_id_banco";
                $result_lote = mysqli_query($con, $sql_lote);
                if ($result_lote && $row_lote = mysqli_fetch_assoc($result_lote)) {
                    $inicio_venda = $row_lote['data_inicio'];
                    $fim_venda = $row_lote['data_fim'];
                }
            }
            
            // Se ainda não tem datas, usar as do evento
            if (!$inicio_venda) {
                $inicio_venda = $data_inicio;
            }
            if (!$fim_venda) {
                $fim_venda = $data_fim;
            }
            
            // Calcular taxas
            $cobra_taxa = isset($ingresso['cobra_taxa']) && $ingresso['cobra_taxa'] ? 1 : 0;
            if ($cobra_taxa && $tipo == 'pago') {
                $taxa_plataforma = $preco * 0.10; // 10%
                $valor_receber = $preco;
            } else {
                $taxa_plataforma = 0;
                $valor_receber = $preco;
            }
            
            $sql_ingresso = "INSERT INTO ingressos (
                evento_id, tipo, titulo, descricao, quantidade_total, preco,
                taxa_plataforma, valor_receber, inicio_venda, fim_venda,
                limite_min, limite_max, lote_id, ativo, criado_em
            ) VALUES (
                $evento_id, 
                '$tipo', 
                '$titulo', 
                '$descricao_ing', 
                $quantidade_total, 
                $preco,
                $taxa_plataforma, 
                $valor_receber, 
                '$inicio_venda', 
                '$fim_venda',
                $limite_min, 
                $limite_max, 
                $lote_id_banco, 
                1,
                NOW()
            )";
            
            if (!mysqli_query($con, $sql_ingresso)) {
                throw new Exception('Erro ao criar ingresso: ' . mysqli_error($con));
            }
            
            $ingresso_id_banco = mysqli_insert_id($con);
            $mapa_ingressos[$ingresso['id']] = $ingresso_id_banco;
            
            // Log do ingresso criado
            file_put_contents($log_file, "Ingresso criado: ID=$ingresso_id_banco, Titulo=$titulo, Tipo=$tipo, Lote=$lote_id_banco\n", FILE_APPEND);
        }
    }
    
    // ================ PASSO 4: INSERIR COMBOS ================
    
    // Adicionar combos que vieram no array de ingressos ao array de combos
    if (!empty($combos_para_processar)) {
        if (!isset($dados['combos'])) {
            $dados['combos'] = [];
        }
        $dados['combos'] = array_merge($dados['combos'], $combos_para_processar);
        file_put_contents($log_file, "Movidos " . count($combos_para_processar) . " combos do array de ingressos\n", FILE_APPEND);
    }
    
    if (!empty($dados['combos'])) {
        file_put_contents($log_file, "\n=== PROCESSANDO COMBOS ===\n", FILE_APPEND);
        file_put_contents($log_file, "Total de combos: " . count($dados['combos']) . "\n", FILE_APPEND);
        
        foreach ($dados['combos'] as $idx => $combo) {
            file_put_contents($log_file, "\nCombo $idx:\n", FILE_APPEND);
            file_put_contents($log_file, "Estrutura do combo: " . json_encode($combo, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
            
            $titulo = mysqli_real_escape_string($con, $combo['titulo']);
            $descricao_combo = mysqli_real_escape_string($con, $combo['descricao']);
            $preco = floatval($combo['preco']);
            $quantidade_total = intval($combo['quantidade_total']);
            
            // Mapear lote_id
            $lote_id_frontend = $combo['lote_id'];
            $lote_id_banco = isset($mapa_lotes[$lote_id_frontend]) ? $mapa_lotes[$lote_id_frontend] : 'NULL';
            
            $inicio_venda = $combo['inicio_vendas'] ?: null;
            $fim_venda = $combo['fim_vendas'] ?: null;
            
            // Se não tem datas de venda, usar as do lote
            if (!$inicio_venda && $lote_id_banco !== 'NULL') {
                // Buscar datas do lote
                $sql_lote = "SELECT data_inicio, data_fim FROM lotes WHERE id = $lote_id_banco";
                $result_lote = mysqli_query($con, $sql_lote);
                if ($result_lote && $row_lote = mysqli_fetch_assoc($result_lote)) {
                    $inicio_venda = $row_lote['data_inicio'];
                    $fim_venda = $row_lote['data_fim'];
                }
            }
            
            // Se ainda não tem datas, usar as do evento
            if (!$inicio_venda) {
                $inicio_venda = $data_inicio;
            }
            if (!$fim_venda) {
                $fim_venda = $data_fim;
            }
            
            // Preparar conteúdo do combo com IDs reais do banco
            $conteudo_combo = [];
            
            file_put_contents($log_file, "Itens do combo antes do mapeamento:\n", FILE_APPEND);
            file_put_contents($log_file, "Mapa de ingressos disponível: " . json_encode($mapa_ingressos) . "\n", FILE_APPEND);
            
            // Tentar diferentes formas de acessar os itens
            $itens = null;
            if (isset($combo['itens'])) {
                $itens = $combo['itens'];
            } elseif (isset($combo['items'])) {
                $itens = $combo['items'];
            } elseif (isset($combo['comboData'])) {
                $itens = $combo['comboData'];
            }
            
            if ($itens && is_array($itens)) {
                foreach ($itens as $item) {
                    file_put_contents($log_file, "  - Item: " . json_encode($item) . "\n", FILE_APPEND);
                    
                    // Tentar diferentes campos para o ID
                    $ticket_id_frontend = null;
                    if (isset($item['ticket_id'])) {
                        $ticket_id_frontend = $item['ticket_id'];
                    } elseif (isset($item['ticketId'])) {
                        $ticket_id_frontend = $item['ticketId'];
                    } elseif (isset($item['id'])) {
                        $ticket_id_frontend = $item['id'];
                    }
                    
                    file_put_contents($log_file, "    Frontend ID encontrado: $ticket_id_frontend\n", FILE_APPEND);
                    
                    $ticket_id_banco = isset($mapa_ingressos[$ticket_id_frontend]) ? $mapa_ingressos[$ticket_id_frontend] : null;
                    
                    file_put_contents($log_file, "    Frontend ID: $ticket_id_frontend => Banco ID: $ticket_id_banco\n", FILE_APPEND);
                    
                    if ($ticket_id_banco) {
                        // Tentar diferentes campos para quantidade
                        $quantidade = 1;
                        if (isset($item['quantidade'])) {
                            $quantidade = intval($item['quantidade']);
                        } elseif (isset($item['quantity'])) {
                            $quantidade = intval($item['quantity']);
                        }
                        
                        $conteudo_combo[] = [
                            'ingresso_id' => $ticket_id_banco,
                            'quantidade' => $quantidade
                        ];
                    } else {
                        file_put_contents($log_file, "    AVISO: ID não encontrado no mapa!\n", FILE_APPEND);
                    }
                }
            } else {
                file_put_contents($log_file, "ERRO: Nenhum item encontrado no combo!\n", FILE_APPEND);
            }
            
            file_put_contents($log_file, "Conteúdo final do combo: " . json_encode($conteudo_combo) . "\n", FILE_APPEND);
            
            if (empty($conteudo_combo)) {
                throw new Exception('Combo sem itens válidos: ' . $titulo);
            }
            
            $conteudo_json = mysqli_real_escape_string($con, json_encode($conteudo_combo, JSON_UNESCAPED_UNICODE));
            file_put_contents($log_file, "JSON que será salvo: $conteudo_json\n", FILE_APPEND);
            
            // Combo é salvo como tipo 'combo' na tabela ingressos
            $sql_combo = "INSERT INTO ingressos (
                evento_id, tipo, titulo, descricao, quantidade_total, preco,
                taxa_plataforma, valor_receber, inicio_venda, fim_venda,
                lote_id, conteudo_combo, ativo, criado_em
            ) VALUES (
                $evento_id, 
                'combo', 
                '$titulo', 
                '$descricao_combo', 
                $quantidade_total, 
                $preco,
                0, 
                $preco, 
                '$inicio_venda', 
                '$fim_venda',
                $lote_id_banco, 
                '$conteudo_json', 
                1,
                NOW()
            )";
            
            if (!mysqli_query($con, $sql_combo)) {
                throw new Exception('Erro ao criar combo: ' . mysqli_error($con));
            }
        }
    }
    
    // Commit da transação
    mysqli_commit($con);
    
    // Log final
    file_put_contents($log_file, "\n=== SUCESSO ===\nEvento ID: $evento_id\nLotes: " . count($mapa_lotes) . "\nIngressos: " . count($mapa_ingressos) . "\nCombos: " . (!empty($dados['combos']) ? count($dados['combos']) : 0) . "\n", FILE_APPEND);
    
    // Responder sucesso
    responderJSON(true, 'Evento publicado com sucesso!', [
        'evento_id' => $evento_id,
        'slug' => $slug,
        'url' => '/evento/' . $slug,
        'lotes_criados' => count($mapa_lotes),
        'ingressos_criados' => count($mapa_ingressos),
        'combos_criados' => !empty($dados['combos']) ? count($dados['combos']) : 0,
        'log_file' => $log_file
    ]);
    
} catch (Exception $e) {
    // Rollback em caso de erro
    mysqli_rollback($con);
    
    // Log do erro
    file_put_contents($log_file, "\n=== ERRO ===\n" . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
    
    error_log('Erro ao criar evento: ' . $e->getMessage());
    error_log('SQL Error: ' . mysqli_error($con));
    responderJSON(false, 'Erro ao criar evento: ' . $e->getMessage());
}
?>