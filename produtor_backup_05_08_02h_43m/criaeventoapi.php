<?php
/**
 * API para criação de eventos - AnySummit
 * Atualizado para suportar lotes e combos
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
require_once '../conm/conn.php';

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

if (!$dados) {
    responderJSON(false, 'Dados inválidos');
}

// Verificar se usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    responderJSON(false, 'Usuário não autenticado');
}

$usuario_id = $_SESSION['usuario_id'];
$contratante_id = $_SESSION['contratante_id'] ?? null;

try {
    // Iniciar transação
    mysqli_begin_transaction($con);
    
    // 1. PREPARAR DADOS DO EVENTO
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
    $rua = mysqli_real_escape_string($con, $dados['endereco']); // Campo é 'rua' no banco
    $numero = mysqli_real_escape_string($con, $dados['numero']);
    $complemento = mysqli_real_escape_string($con, $dados['complemento']);
    $bairro = mysqli_real_escape_string($con, $dados['bairro']);
    $cidade = mysqli_real_escape_string($con, $dados['cidade']);
    $estado = mysqli_real_escape_string($con, $dados['estado']);
    $cep = mysqli_real_escape_string($con, $dados['cep']);
    $pais = mysqli_real_escape_string($con, $dados['pais'] ?: 'Brasil');
    $latitude = floatval($dados['latitude']) ?: null;
    $longitude = floatval($dados['longitude']) ?: null;
    $link_online = mysqli_real_escape_string($con, $dados['link_transmissao']);
    
    // Produtor
    $produtor_selecionado = $dados['tipo_produtor'] == 'new' ? 'novo' : 'atual';
    $nome_produtor = mysqli_real_escape_string($con, $dados['nome_produtor']);
    $nome_exibicao_produtor = mysqli_real_escape_string($con, $dados['nome_exibicao']);
    $descricao_produtor = mysqli_real_escape_string($con, $dados['descricao_produtor']);
    
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
    
    // Gerar slug único
    $slug_base = preg_replace('/[^a-z0-9]+/', '-', strtolower($nome));
    $slug = $slug_base;
    $contador = 1;
    
    while (true) {
        $check = mysqli_query($con, "SELECT id FROM eventos WHERE slug = '$slug'");
        if (mysqli_num_rows($check) == 0) break;
        $slug = $slug_base . '-' . $contador++;
    }
    
    // 2. SALVAR IMAGEM SE HOUVER
    $imagem_capa_path = '';
    if (!empty($dados['imagem_capa']) && strpos($dados['imagem_capa'], 'data:image') === 0) {
        // Extrair base64
        $imagem_parts = explode(',', $dados['imagem_capa']);
        $imagem_base64 = $imagem_parts[1] ?? '';
        
        if ($imagem_base64) {
            $imagem_data = base64_decode($imagem_base64);
            $imagem_nome = 'evento_' . time() . '_' . rand(1000, 9999) . '.jpg';
            $imagem_path = '../../uploads/eventos/' . $imagem_nome;
            
            // Criar diretório se não existir
            if (!file_exists('../../uploads/eventos/')) {
                mkdir('../../uploads/eventos/', 0777, true);
            }
            
            // Salvar arquivo
            if (file_put_contents($imagem_path, $imagem_data)) {
                $imagem_capa_path = '/uploads/eventos/' . $imagem_nome;
            }
        }
    }
    
    // 3. INSERIR EVENTO
    $sql_evento = "INSERT INTO eventos (
        contratante_id, usuario_id, categoria_id, nome, descricao, imagem_capa,
        classificacao, slug, data_inicio, data_fim, evento_multiplos_dias,
        tipo_local, link_online, busca_endereco, nome_local, cep, rua, numero,
        complemento, bairro, cidade, estado, pais, latitude, longitude,
        produtor_selecionado, nome_produtor, nome_exibicao_produtor, descricao_produtor,
        visibilidade, termos_aceitos, status, publicado_em
    ) VALUES (
        " . ($contratante_id ?: 'NULL') . ", $usuario_id, $categoria_id, '$nome', '$descricao', '$imagem_capa_path',
        '$classificacao', '$slug', '$data_inicio', '$data_fim', $evento_multiplos_dias,
        '$tipo_local', '$link_online', '$busca_endereco', '$nome_local', '$cep', '$rua', '$numero',
        '$complemento', '$bairro', '$cidade', '$estado', '$pais', 
        " . ($latitude ?: 'NULL') . ", " . ($longitude ?: 'NULL') . ",
        '$produtor_selecionado', '$nome_produtor', '$nome_exibicao_produtor', '$descricao_produtor',
        '$visibilidade', $termos_aceitos, 'publicado', NOW()
    )";
    
    if (!mysqli_query($con, $sql_evento)) {
        throw new Exception('Erro ao criar evento: ' . mysqli_error($con));
    }
    
    $evento_id = mysqli_insert_id($con);
    
    // 4. SALVAR SENHA SE HOUVER
    if ($senha_acesso) {
        // Verificar se coluna existe, senão criar
        $check_column = mysqli_query($con, "SHOW COLUMNS FROM eventos LIKE 'senha_acesso'");
        if (mysqli_num_rows($check_column) == 0) {
            mysqli_query($con, "ALTER TABLE eventos ADD COLUMN senha_acesso VARCHAR(255) NULL AFTER visibilidade");
        }
        
        mysqli_query($con, "UPDATE eventos SET senha_acesso = '$senha_acesso' WHERE id = $evento_id");
    }
    
    // 5. INSERIR LOTES
    if (!empty($dados['lotes'])) {
        foreach ($dados['lotes'] as $lote) {
            $lote_nome = mysqli_real_escape_string($con, $lote['nome']);
            $lote_tipo = mysqli_real_escape_string($con, $lote['tipo']);
            $lote_ordem = intval($lote['ordem']);
            
            if ($lote_tipo == 'data') {
                $lote_data_inicio = $lote['data_inicio'];
                $lote_data_fim = $lote['data_fim'];
                $percentual_venda = 'NULL';
                $quantidade = 'NULL';
            } else {
                $lote_data_inicio = $data_inicio; // Usar data do evento
                $lote_data_fim = $data_fim;
                $percentual_venda = intval($lote['percentual']);
                $quantidade = intval($lote['quantidade']);
            }
            
            $sql_lote = "INSERT INTO lotes (
                evento_id, nome, tipo, data_inicio, data_fim, 
                percentual_venda, quantidade, ordem, criado_em
            ) VALUES (
                $evento_id, '$lote_nome', '$lote_tipo', '$lote_data_inicio', '$lote_data_fim',
                $percentual_venda, $quantidade, $lote_ordem, NOW()
            )";
            
            if (!mysqli_query($con, $sql_lote)) {
                throw new Exception('Erro ao criar lote: ' . mysqli_error($con));
            }
            
            // Guardar ID do lote para mapear com ingressos
            $lote['id_banco'] = mysqli_insert_id($con);
            $mapa_lotes[$lote['id']] = $lote['id_banco'];
        }
    }
    
    // 6. INSERIR INGRESSOS
    if (!empty($dados['ingressos'])) {
        foreach ($dados['ingressos'] as $ingresso) {
            $titulo = mysqli_real_escape_string($con, $ingresso['titulo']);
            $descricao_ing = mysqli_real_escape_string($con, $ingresso['descricao']);
            
            // Converter tipo
            $tipo_frontend = $ingresso['tipo'];
            $tipo = 'pago'; // padrão
            if ($tipo_frontend == 'free') $tipo = 'gratuito';
            elseif ($tipo_frontend == 'paid') $tipo = 'pago';
            
            $preco = floatval($ingresso['preco']);
            $quantidade_total = intval($ingresso['quantidade_total']);
            $limite_min = intval($ingresso['quantidade_por_pessoa_min'] ?: 1);
            $limite_max = intval($ingresso['quantidade_por_pessoa_max'] ?: 5);
            $lote_id = isset($mapa_lotes[$ingresso['lote_id']]) ? $mapa_lotes[$ingresso['lote_id']] : 'NULL';
            $inicio_venda = $ingresso['inicio_vendas'] ?: $data_inicio;
            $fim_venda = $ingresso['fim_vendas'] ?: $data_fim;
            $cobra_taxa = $ingresso['cobra_taxa'] ? 1 : 0;
            $valor_taxa = floatval($ingresso['valor_taxa']);
            
            // Calcular valor a receber
            $valor_receber = $preco;
            if ($cobra_taxa) {
                $taxa_plataforma = $preco * 0.10; // 10%
            } else {
                $taxa_plataforma = 0;
            }
            
            $sql_ingresso = "INSERT INTO ingressos (
                evento_id, tipo, titulo, descricao, quantidade_total, preco,
                taxa_plataforma, valor_receber, inicio_venda, fim_venda,
                limite_min, limite_max, lote_id, ativo
            ) VALUES (
                $evento_id, '$tipo', '$titulo', '$descricao_ing', $quantidade_total, $preco,
                $taxa_plataforma, $valor_receber, '$inicio_venda', '$fim_venda',
                $limite_min, $limite_max, $lote_id, 1
            )";
            
            if (!mysqli_query($con, $sql_ingresso)) {
                throw new Exception('Erro ao criar ingresso: ' . mysqli_error($con));
            }
            
            // Guardar ID para combos
            $ingresso['id_banco'] = mysqli_insert_id($con);
            $mapa_ingressos[$ingresso['id']] = $ingresso['id_banco'];
        }
    }
    
    // 7. INSERIR COMBOS
    if (!empty($dados['combos'])) {
        foreach ($dados['combos'] as $combo) {
            $titulo = mysqli_real_escape_string($con, $combo['titulo']);
            $descricao_combo = mysqli_real_escape_string($con, $combo['descricao']);
            $preco = floatval($combo['preco']);
            $quantidade_total = intval($combo['quantidade_total']);
            $lote_id = isset($mapa_lotes[$combo['lote_id']]) ? $mapa_lotes[$combo['lote_id']] : 'NULL';
            $inicio_venda = $combo['inicio_vendas'] ?: $data_inicio;
            $fim_venda = $combo['fim_vendas'] ?: $data_fim;
            
            // Preparar conteúdo do combo
            $conteudo_combo = [];
            foreach ($combo['itens'] as $item) {
                $ticket_id_banco = $mapa_ingressos[$item['ticket_id']] ?? null;
                if ($ticket_id_banco) {
                    $conteudo_combo[] = [
                        'ticket_id' => $ticket_id_banco,
                        'ticket_name' => $item['ticket_name'],
                        'quantidade' => intval($item['quantidade'])
                    ];
                }
            }
            
            $conteudo_json = json_encode($conteudo_combo, JSON_UNESCAPED_UNICODE);
            
            $sql_combo = "INSERT INTO ingressos (
                evento_id, tipo, titulo, descricao, quantidade_total, preco,
                taxa_plataforma, valor_receber, inicio_venda, fim_venda,
                lote_id, conteudo_combo, ativo
            ) VALUES (
                $evento_id, 'combo', '$titulo', '$descricao_combo', $quantidade_total, $preco,
                0, $preco, '$inicio_venda', '$fim_venda',
                $lote_id, '$conteudo_json', 1
            )";
            
            if (!mysqli_query($con, $sql_combo)) {
                throw new Exception('Erro ao criar combo: ' . mysqli_error($con));
            }
        }
    }
    
    // Commit da transação
    mysqli_commit($con);
    
    // Responder sucesso
    responderJSON(true, 'Evento publicado com sucesso!', [
        'evento_id' => $evento_id,
        'slug' => $slug,
        'url' => '/evento/' . $slug
    ]);
    
} catch (Exception $e) {
    // Rollback em caso de erro
    mysqli_rollback($con);
    error_log('Erro ao criar evento: ' . $e->getMessage());
    responderJSON(false, 'Erro ao criar evento: ' . $e->getMessage());
}
?>