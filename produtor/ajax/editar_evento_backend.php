<?php
/**
 * Backend específico para a edição de eventos
 * Criado para funcionar de forma independente com carregamento e salvamento direto
 */

ob_start();
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

require_once '../conm/conn.php';
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
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
$action = $_POST['action'] ?? $_GET['action'] ?? '';

error_log("editar_evento_backend.php - Action: $action, Usuario: $usuario_id");

switch ($action) {
    case 'carregar_dados_edicao':
        carregarDadosEdicao($con, $usuario_id);
        break;
        
    case 'salvar_edicao':
        salvarEdicao($con, $usuario_id);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['erro' => 'Ação não reconhecida']);
}

/**
 * Carrega dados completos do evento para edição
 */
function carregarDadosEdicao($con, $usuario_id) {
    $evento_id = $_POST['evento_id'] ?? $_GET['evento_id'] ?? 0;
    
    if (!$evento_id) {
        http_response_code(400);
        echo json_encode(['erro' => 'ID do evento é obrigatório']);
        return;
    }
    
    error_log("=== CARREGANDO DADOS DO EVENTO $evento_id ===");
    
    // Verificar permissão
    $sql = "SELECT * FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$evento = mysqli_fetch_assoc($result)) {
        http_response_code(404);
        echo json_encode(['erro' => 'Evento não encontrado ou sem permissão']);
        return;
    }
    
    // Transformar dados para formato esperado pelo frontend
    $dadosProcessados = [
        'id' => $evento['id'],
        'nome' => $evento['nome'],
        'classificacao_etaria' => $evento['classificacao'],
        'categoria_id' => $evento['categoria_id'],
        'data_inicio' => $evento['data_inicio'],
        'data_fim' => $evento['data_fim'],
        'descricao' => $evento['descricao'],
        'cor_fundo_alternativa' => $evento['cor_fundo'] ?? '#000000',
        'tipo_local' => $evento['tipo_local'] ?? 'presencial',
        'nome_local' => $evento['nome_local'],
        'cep' => $evento['cep'],
        'endereco' => $evento['rua'],
        'numero' => $evento['numero'],
        'complemento' => $evento['complemento'],
        'bairro' => $evento['bairro'],
        'cidade' => $evento['cidade'],
        'estado' => $evento['estado'],
        'latitude' => $evento['latitude'],
        'longitude' => $evento['longitude'],
        'link_transmissao' => $evento['link_online']
    ];
    
    // Processar caminhos das imagens
    if (!empty($evento['logo_evento'])) {
        $dadosProcessados['logo_path'] = processarCaminhoImagem($evento['logo_evento']);
    }
    if (!empty($evento['imagem_capa'])) {
        $dadosProcessados['capa_path'] = processarCaminhoImagem($evento['imagem_capa']);
    }
    if (!empty($evento['imagem_fundo'])) {
        $dadosProcessados['fundo_path'] = processarCaminhoImagem($evento['imagem_fundo']);
    }
    
    error_log("✅ Dados do evento carregados com sucesso");
    echo json_encode([
        'sucesso' => true,
        'evento' => $dadosProcessados
    ]);
}

/**
 * Salva dados completos do evento editado
 */
function salvarEdicao($con, $usuario_id) {
    $evento_id = $_POST['evento_id'] ?? 0;
    $dados_json = $_POST['dados'] ?? '';
    
    if (!$evento_id) {
        http_response_code(400);
        echo json_encode(['erro' => 'ID do evento é obrigatório']);
        return;
    }
    
    if (empty($dados_json)) {
        http_response_code(400);
        echo json_encode(['erro' => 'Dados do evento são obrigatórios']);
        return;
    }
    
    $dados = json_decode($dados_json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['erro' => 'Dados JSON inválidos: ' . json_last_error_msg()]);
        return;
    }
    
    error_log("=== SALVANDO EVENTO $evento_id ===");
    error_log("Dados recebidos: " . print_r($dados, true));
    
    // Verificar permissão
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Evento não encontrado ou sem permissão']);
        return;
    }
    
    mysqli_begin_transaction($con);
    
    try {
        // Processar upload de imagens se necessário
        $logo_path = processarImagemUpload($dados['logo'] ?? '', 'logo');
        $capa_path = processarImagemUpload($dados['capa'] ?? '', 'capa');
        $fundo_path = processarImagemUpload($dados['fundo'] ?? '', 'fundo');
        
        // Gerar slug se necessário
        $slug = !empty($dados['nome']) ? gerarSlug($dados['nome'] . '-' . $evento_id) : null;
        
        // Preparar dados para o banco
        $campos_update = [];
        $valores = [];
        $tipos = '';
        
        // Campos básicos
        if (!empty($dados['nome'])) {
            $campos_update[] = "nome = ?";
            $valores[] = $dados['nome'];
            $tipos .= 's';
        }
        
        if (!empty($slug)) {
            $campos_update[] = "slug = ?";
            $valores[] = $slug;
            $tipos .= 's';
        }
        
        if (!empty($dados['classificacao'])) {
            $campos_update[] = "classificacao = ?";
            $valores[] = $dados['classificacao'];
            $tipos .= 's';
        }
        
        if (!empty($dados['categoria_id'])) {
            $campos_update[] = "categoria_id = ?";
            $valores[] = $dados['categoria_id'];
            $tipos .= 'i';
        }
        
        if (!empty($dados['data_inicio'])) {
            $campos_update[] = "data_inicio = ?";
            $valores[] = $dados['data_inicio'];
            $tipos .= 's';
        }
        
        if (!empty($dados['data_fim'])) {
            $campos_update[] = "data_fim = ?";
            $valores[] = $dados['data_fim'];
            $tipos .= 's';
        }
        
        if (isset($dados['descricao'])) {
            $campos_update[] = "descricao = ?";
            $valores[] = $dados['descricao'];
            $tipos .= 's';
        }
        
        if (!empty($dados['cor_fundo'])) {
            $campos_update[] = "cor_fundo = ?";
            $valores[] = $dados['cor_fundo'];
            $tipos .= 's';
        }
        
        // Imagens
        if ($logo_path) {
            $campos_update[] = "logo_evento = ?";
            $valores[] = $logo_path;
            $tipos .= 's';
        }
        
        if ($capa_path) {
            $campos_update[] = "imagem_capa = ?";
            $valores[] = $capa_path;
            $tipos .= 's';
        }
        
        if ($fundo_path) {
            $campos_update[] = "imagem_fundo = ?";
            $valores[] = $fundo_path;
            $tipos .= 's';
        }
        
        // Localização
        if (isset($dados['tipo_local'])) {
            $campos_update[] = "tipo_local = ?";
            $valores[] = $dados['tipo_local'];
            $tipos .= 's';
            
            if ($dados['tipo_local'] === 'online') {
                // Evento online
                $campos_update[] = "link_online = ?";
                $valores[] = $dados['link_evento'] ?? '';
                $tipos .= 's';
                
                // Limpar campos presenciais
                $campos_update[] = "nome_local = NULL, cep = NULL, rua = NULL, numero = NULL, complemento = NULL, bairro = NULL, cidade = NULL, estado = NULL, latitude = NULL, longitude = NULL";
            } else {
                // Evento presencial
                $campos_update[] = "link_online = NULL";
                
                if (isset($dados['nome_local'])) {
                    $campos_update[] = "nome_local = ?";
                    $valores[] = $dados['nome_local'];
                    $tipos .= 's';
                }
                
                if (isset($dados['cep'])) {
                    $campos_update[] = "cep = ?";
                    $valores[] = $dados['cep'];
                    $tipos .= 's';
                }
                
                if (isset($dados['endereco'])) {
                    $campos_update[] = "rua = ?";
                    $valores[] = $dados['endereco'];
                    $tipos .= 's';
                }
                
                if (isset($dados['numero'])) {
                    $campos_update[] = "numero = ?";
                    $valores[] = $dados['numero'];
                    $tipos .= 's';
                }
                
                if (isset($dados['complemento'])) {
                    $campos_update[] = "complemento = ?";
                    $valores[] = $dados['complemento'];
                    $tipos .= 's';
                }
                
                if (isset($dados['bairro'])) {
                    $campos_update[] = "bairro = ?";
                    $valores[] = $dados['bairro'];
                    $tipos .= 's';
                }
                
                if (isset($dados['cidade'])) {
                    $campos_update[] = "cidade = ?";
                    $valores[] = $dados['cidade'];
                    $tipos .= 's';
                }
                
                if (isset($dados['estado'])) {
                    $campos_update[] = "estado = ?";
                    $valores[] = $dados['estado'];
                    $tipos .= 's';
                }
                
                if (isset($dados['latitude'])) {
                    $campos_update[] = "latitude = ?";
                    $valores[] = $dados['latitude'];
                    $tipos .= 'd';
                }
                
                if (isset($dados['longitude'])) {
                    $campos_update[] = "longitude = ?";
                    $valores[] = $dados['longitude'];
                    $tipos .= 'd';
                }
            }
        }
        
        // Adicionar timestamp de atualização
        $campos_update[] = "atualizado_em = NOW()";
        
        // Adicionar ID do evento para WHERE
        $valores[] = $evento_id;
        $tipos .= 'i';
        
        // Montar SQL
        $sql = "UPDATE eventos SET " . implode(', ', $campos_update) . " WHERE id = ?";
        
        error_log("SQL de update: $sql");
        error_log("Valores: " . print_r($valores, true));
        error_log("Tipos: $tipos");
        
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, $tipos, ...$valores);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Erro ao atualizar evento: ' . mysqli_error($con));
        }
        
        mysqli_commit($con);
        
        error_log("✅ Evento salvo com sucesso");
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Evento atualizado com sucesso'
        ]);
        
    } catch (Exception $e) {
        mysqli_rollback($con);
        error_log("❌ Erro ao salvar evento: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['erro' => $e->getMessage()]);
    }
}

/**
 * Processa caminho de imagem para exibição
 */
function processarCaminhoImagem($caminho) {
    if (empty($caminho)) return '';
    
    // Se já é um caminho completo, retornar como está
    if (strpos($caminho, '/') === 0 || strpos($caminho, 'http') === 0) {
        return $caminho;
    }
    
    // Assumir que é relativo ao uploads/eventos
    return '/uploads/eventos/' . $caminho;
}

/**
 * Processa upload de imagem se for base64
 */
function processarImagemUpload($dadosImagem, $tipo) {
    if (empty($dadosImagem)) return null;
    
    // Se não é base64, não processar
    if (strpos($dadosImagem, 'data:image/') !== 0) {
        return null;
    }
    
    try {
        // Extrair extensão do mime type
        preg_match('/data:image\/([a-zA-Z0-9]+);base64,/', $dadosImagem, $matches);
        $extensao = $matches[1] ?? 'png';
        
        // Remover cabeçalho base64
        $imagemData = preg_replace('/^data:image\/[^;]+;base64,/', '', $dadosImagem);
        $imagemData = base64_decode($imagemData);
        
        if ($imagemData === false) {
            throw new Exception('Dados de imagem inválidos');
        }
        
        // Gerar nome único
        $nomeArquivo = $tipo . '_' . time() . '_' . uniqid() . '.' . $extensao;
        $caminhoCompleto = $_SERVER['DOCUMENT_ROOT'] . '/uploads/eventos/' . $nomeArquivo;
        
        // Criar diretório se não existir
        $diretorio = dirname($caminhoCompleto);
        if (!is_dir($diretorio)) {
            mkdir($diretorio, 0755, true);
        }
        
        // Salvar arquivo
        if (file_put_contents($caminhoCompleto, $imagemData) === false) {
            throw new Exception('Erro ao salvar imagem');
        }
        
        return '/uploads/eventos/' . $nomeArquivo;
        
    } catch (Exception $e) {
        error_log("Erro ao processar upload de imagem: " . $e->getMessage());
        return null;
    }
}

/**
 * Gera slug a partir do nome
 */
function gerarSlug($texto) {
    // Converter para minúsculas
    $slug = strtolower($texto);
    
    // Remover acentos
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT', $slug);
    
    // Manter apenas letras, números e hífens
    $slug = preg_replace('/[^a-z0-9\-]/', '-', $slug);
    
    // Remover múltiplos hífens consecutivos
    $slug = preg_replace('/-+/', '-', $slug);
    
    // Remover hífens do início e fim
    $slug = trim($slug, '-');
    
    return $slug;
}
?>