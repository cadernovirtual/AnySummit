<?php
// =====================================================
// API PHP COMPLETA - ANYSUMMIT
// Recebe dados do formulário e salva no MySQL
// =====================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://webtoyou.com.br');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =====================================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// =====================================================

class Database {
    private $host = 'anysummit.com.br';
    private $username = 'anysummit_user';
    private $password = 'Miran@Janyne@Gustavo';
    private $database = 'anysummit_db';
    private $pdo;
    
    public function __construct() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            
            // Forçar collation compatível
            $this->pdo->exec("SET character_set_client=utf8mb4");
            $this->pdo->exec("SET character_set_connection=utf8mb4");
            $this->pdo->exec("SET character_set_results=utf8mb4");
            $this->pdo->exec("SET collation_connection=utf8mb4_unicode_ci");
            
        } catch (PDOException $e) {
            $this->sendError('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
        }
    }
    
    public function getPDO() {
        return $this->pdo;
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
}

// =====================================================
// CLASSE PRINCIPAL DA API
// =====================================================

class AnysummitAPI {
    private $db;
    private $uploadDir = 'uploads/capas/';
    
    public function __construct() {
        $this->db = new Database();
        
        // Criar diretório de uploads se não existir
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    public function processarRequisicao() {
         try {
        // Verificar método
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendError('Método não permitido. Use POST.', 405);
        }
        
        // Obter dados JSON
        $jsonData = file_get_contents('php://input');
        $dados = json_decode($jsonData, true);
        
        // DEBUG - Salvar dados recebidos em arquivo
        file_put_contents('debug_ingressos.txt', 
            date('Y-m-d H:i:s') . " - Dados recebidos:\n" . 
            print_r($dados, true) . "\n\n", 
            FILE_APPEND
        );
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->sendError('JSON inválido: ' . json_last_error_msg());
            }
            
            // Validar estrutura básica
            if (!isset($dados['evento']) || !isset($dados['ingressos'])) {
                $this->sendError('Estrutura de dados inválida. Faltam "evento" ou "ingressos".');
            }
            
            // Processar e salvar
            $eventoId = $this->salvarEvento($dados);
            
            $this->sendSuccess([
                'evento_id' => $eventoId,
                'message' => 'Evento criado com sucesso!',
                'url' => "https://webtoyou.com.br/evento/{$eventoId}"
            ]);
            
        } catch (Exception $e) {
            $this->sendError('Erro interno: ' . $e->getMessage(), 500);
        }
    }
    
    // =====================================================
    // SALVAR EVENTO NO BANCO
    // =====================================================
    
   private function salvarEvento($dados) {
    $pdo = $this->db->getPDO();
    
    try {
        $pdo->beginTransaction();
        
        // DEBUG - Log início
        file_put_contents('debug_ingressos.txt', 
            "=== INICIANDO SALVAMENTO ===\n" . 
            date('Y-m-d H:i:s') . "\n" .
            "Quantidade de ingressos recebidos: " . count($dados['ingressos']) . "\n\n", 
            FILE_APPEND
        );
        
        // 1. PROCESSAR IMAGEM
        $imagemUrl = $this->processarImagem($dados['evento']['imagem_capa'] ?? '');
        
        // 2. INSERIR EVENTO
        $eventoId = $this->inserirEvento($dados['evento'], $imagemUrl);
        
        file_put_contents('debug_ingressos.txt', 
            "Evento inserido com ID: " . $eventoId . "\n\n", 
            FILE_APPEND
        );
        
        // 3. INSERIR INGRESSOS - COM DEBUG
        if (!empty($dados['ingressos'])) {
            file_put_contents('debug_ingressos.txt', 
                "=== INICIANDO INSERÇÃO DE INGRESSOS ===\n", 
                FILE_APPEND
            );
            
            foreach ($dados['ingressos'] as $index => $ingresso) {
                file_put_contents('debug_ingressos.txt', 
                    "Processando ingresso " . ($index + 1) . ":\n" . 
                    print_r($ingresso, true) . "\n", 
                    FILE_APPEND
                );
                
                $ingressoId = $this->inserirIngresso($eventoId, $ingresso);
                
                file_put_contents('debug_ingressos.txt', 
                    "Ingresso inserido com ID: " . $ingressoId . "\n\n", 
                    FILE_APPEND
                );
            }
        } else {
            file_put_contents('debug_ingressos.txt', 
                "NENHUM INGRESSO PARA INSERIR!\n\n", 
                FILE_APPEND
            );
        }
        
        $pdo->commit();
        
        file_put_contents('debug_ingressos.txt', 
            "=== TRANSAÇÃO COMMITADA COM SUCESSO ===\n\n", 
            FILE_APPEND
        );
        
        return $eventoId;
        
    } catch (Exception $e) {
        $pdo->rollBack();
        
        file_put_contents('debug_ingressos.txt', 
            "=== ERRO NA TRANSAÇÃO ===\n" . 
            $e->getMessage() . "\n" . 
            $e->getTraceAsString() . "\n\n", 
            FILE_APPEND
        );
        
        throw $e;
    }
}
    
    // =====================================================
    // PROCESSAR IMAGEM BASE64
    // =====================================================
    
    private function processarImagem($imagemBase64) {
        if (empty($imagemBase64) || !str_contains($imagemBase64, 'data:image')) {
            return null;
        }
        
        try {
            // Extrair dados da imagem base64
            list($type, $data) = explode(';', $imagemBase64);
            list(, $data) = explode(',', $data);
            
            // Decodificar
            $imageData = base64_decode($data);
            
            if (!$imageData) {
                return null;
            }
            
            // Determinar extensão
            $extension = 'jpg';
            if (str_contains($type, 'png')) $extension = 'png';
            if (str_contains($type, 'gif')) $extension = 'gif';
            if (str_contains($type, 'webp')) $extension = 'webp';
            
            // Gerar nome único
            $filename = 'evento_' . uniqid() . '_' . time() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;
            
            // Salvar arquivo
            if (file_put_contents($filepath, $imageData)) {
                return $filepath;
            }
            
            return null;
            
        } catch (Exception $e) {
            // Log do erro mas continuar sem imagem
            error_log('Erro ao processar imagem: ' . $e->getMessage());
            return null;
        }
    }
    
    // =====================================================
    // INSERIR EVENTO
    // =====================================================
    
    private function inserirEvento($evento, $imagemUrl) {
        $pdo = $this->db->getPDO();
        
        // Preparar dados do evento
        $slug = $this->gerarSlug($evento['nome']);
        
       $sql = "
    INSERT INTO eventos (
        contratante_id, usuario_id, categoria_id,
        nome, descricao, imagem_capa, classificacao, slug,
        data_inicio, data_fim, evento_multiplos_dias,
        tipo_local, busca_endereco, nome_local,
        cep, rua, numero, complemento, bairro, cidade, estado, pais,
        link_online,
        produtor_selecionado, nome_produtor, nome_exibicao_produtor, descricao_produtor,
        visibilidade, termos_aceitos, status,
        criado_em
    ) VALUES (
        :contratante_id, :usuario_id, :categoria_id,
        :nome, :descricao, :imagem_capa, :classificacao, :slug,
        :data_inicio, :data_fim, :evento_multiplos_dias,
        :tipo_local, :busca_endereco, :nome_local,
        :cep, :rua, :numero, :complemento, :bairro, :cidade, :estado, :pais,
        :link_online,
        :produtor_selecionado, :nome_produtor, :nome_exibicao_produtor, :descricao_produtor,
        :visibilidade, :termos_aceitos, :status,
        NOW()
    )
";
        
        $stmt = $pdo->prepare($sql);
        
        // Buscar categoria_id
        $categoriaId = $this->obterCategoriaId($evento['categoria']);
        
        $params = [
            'contratante_id' => null, // ou verificar se existe
    'usuario_id' => null, // ou verificar se existe  
    'categoria_id' => $categoriaId,
            'nome' => $evento['nome'],
            'descricao' => $evento['descricao_completa'] ?? '',
            'imagem_capa' => $imagemUrl,
            'classificacao' => $evento['classificacao'] ?: 'livre',
            'slug' => $slug,
            'data_inicio' => $this->formatarDataHora($evento['data_inicio']),
            'data_fim' => $this->formatarDataHora($evento['data_fim']),
            'evento_multiplos_dias' => $evento['evento_multiplos_dias'] ? 1 : 0,
            'tipo_local' => $evento['tipo_local'] === 'presencial' ? 'presencial' : 'online',
            'busca_endereco' => $evento['busca_endereco'] ?? '',
            'nome_local' => $evento['nome_local'] ?? '',
            'cep' => $evento['cep'] ?? '',
            'rua' => $evento['rua'] ?? '',
            'numero' => $evento['numero'] ?? '',
            'complemento' => $evento['complemento'] ?? '',
            'bairro' => $evento['bairro'] ?? '',
            'cidade' => $evento['cidade'] ?? '',
            'estado' => $evento['estado'] ?? '',
            'pais' => 'Brasil',
            'link_online' => $evento['link_online'] ?? '',
            'produtor_selecionado' => $evento['tipo_produtor'] === 'novo' ? 'novo' : 'atual',
            'nome_produtor' => $evento['nome_produtor'] ?? '',
            'nome_exibicao_produtor' => $evento['nome_exibicao'] ?? '',
            'descricao_produtor' => $evento['descricao_produtor'] ?? '',
            'visibilidade' => $evento['visibilidade'] === 'private' ? 'privado' : 'publico',
            'termos_aceitos' => $evento['termos_aceitos'] ? 1 : 0,
            'status' => 'publicado'
        ];
        
        $stmt->execute($params);
        return $pdo->lastInsertId();
    }
    
    // =====================================================
    // INSERIR INGRESSOS
    // =====================================================
    
private function inserirIngressos($eventoId, $ingressos) {
    file_put_contents('debug_ingressos.txt', 
        "=== FUNÇÃO inserirIngressos() CHAMADA ===\n" .
        "Evento ID: " . $eventoId . "\n" .
        "Quantidade de ingressos: " . count($ingressos) . "\n\n", 
        FILE_APPEND
    );
    
    $pdo = $this->db->getPDO();
    
    foreach ($ingressos as $ingresso) {
        file_put_contents('debug_ingressos.txt', 
            "Inserindo ingresso individual:\n" . 
            print_r($ingresso, true) . "\n", 
            FILE_APPEND
        );
        
        // Inserir ingresso
        $ingressoId = $this->inserirIngresso($eventoId, $ingresso);
        
        // Se for ingresso por código, inserir códigos
        if ($ingresso['tipo'] === 'codigo' && isset($ingresso['codigos'])) {
            $this->inserirCodigos($ingressoId, $ingresso['codigos']);
        }
    }
}
    
private function inserirIngresso($eventoId, $ingresso) {
    $pdo = $this->db->getPDO();
    
    // DEBUG - Ver dados do ingresso
    file_put_contents('debug_ingressos.txt', 
        "=== INSERINDO INGRESSO ===\n" . 
        "Evento ID: " . $eventoId . "\n" .
        "Dados do ingresso:\n" . 
        print_r($ingresso, true) . "\n", 
        FILE_APPEND
    );
    
    try {
        // PRIMEIRO: Inserir apenas os campos básicos
        $sql1 = "
            INSERT INTO ingressos (
                evento_id, tipo, titulo, descricao,
                quantidade_total, preco, disponibilidade, ativo, posicao_ordem, criado_em
            ) VALUES (
                :evento_id, :tipo, :titulo, :descricao,
                :quantidade_total, :preco, :disponibilidade, :ativo, :posicao_ordem, NOW()
            )
        ";
        
        $params1 = [
            'evento_id' => $eventoId,
            'tipo' => $ingresso['tipo'],
            'titulo' => $ingresso['titulo'],
            'descricao' => $ingresso['descricao'] ?? '',
            'quantidade_total' => $ingresso['quantidade_total'],
            'preco' => $ingresso['preco'] ?? 0,
            'disponibilidade' => 'publico',
            'ativo' => $ingresso['ativo'] ? 1 : 0,
            'posicao_ordem' => $ingresso['posicao_ordem'] ?? 1
        ];
        
        $stmt1 = $pdo->prepare($sql1);
        $result1 = $stmt1->execute($params1);
        $ingressoId = $pdo->lastInsertId();
        
        file_put_contents('debug_ingressos.txt', 
            "Primeira inserção - ID: " . $ingressoId . "\n", 
            FILE_APPEND
        );
        
        // SEGUNDO: Fazer UPDATE dos campos problemáticos
        $sql2 = "
            UPDATE ingressos 
            SET taxa_plataforma = :taxa_plataforma, 
                valor_receber = :valor_receber,
                inicio_venda = :inicio_venda,
                fim_venda = :fim_venda,
                limite_min = :limite_min,
                limite_max = :limite_max
            WHERE id = :ingresso_id
        ";
        
        $params2 = [
            'taxa_plataforma' => floatval($ingresso['taxa_plataforma'] ?? 0),
            'valor_receber' => floatval($ingresso['valor_receber'] ?? 0),
            'inicio_venda' => $this->formatarDataHora($ingresso['inicio_venda']),
            'fim_venda' => $this->formatarDataHora($ingresso['fim_venda']),
            'limite_min' => $ingresso['limite_min'] ?? 1,
            'limite_max' => $ingresso['limite_max'] ?? 5,
            'ingresso_id' => $ingressoId
        ];
        
        $stmt2 = $pdo->prepare($sql2);
        $result2 = $stmt2->execute($params2);
        
        file_put_contents('debug_ingressos.txt', 
            "Segunda atualização - Linhas afetadas: " . $stmt2->rowCount() . "\n" .
            "Parâmetros UPDATE:\n" . print_r($params2, true) . "\n\n", 
            FILE_APPEND
        );
        
        return $ingressoId;
        
    } catch (Exception $e) {
        file_put_contents('debug_ingressos.txt', 
            "ERRO SQL: " . $e->getMessage() . "\n\n", 
            FILE_APPEND
        );
        throw $e;
    }
}
 
    private function inserirCodigos($ingressoId, $codigos) {
        if (empty($codigos)) return;
        
        $pdo = $this->db->getPDO();
        
        $sql = "
            INSERT INTO codigos_ingresso (
                ingresso_id, codigo, enviado_para, utilizado, utilizado_em, criado_em
            ) VALUES (
                :ingresso_id, :codigo, :enviado_para, :utilizado, :utilizado_em, NOW()
            )
        ";
        
        $stmt = $pdo->prepare($sql);
        
        foreach ($codigos as $codigo) {
            $params = [
                'ingresso_id' => $ingressoId,
                'codigo' => $codigo['codigo'],
                'enviado_para' => $codigo['enviado_para'] ?? '',
                'utilizado' => $codigo['utilizado'] ? 1 : 0,
                'utilizado_em' => $codigo['utilizado_em'] ? date('Y-m-d H:i:s', strtotime($codigo['utilizado_em'])) : null
            ];
            
            $stmt->execute($params);
        }
    }
    
    // =====================================================
    // FUNÇÕES AUXILIARES
    // =====================================================
    
    private function obterCategoriaId($categoriaNome) {
        if (empty($categoriaNome)) return null;
        
        $pdo = $this->db->getPDO();
        
        $sql = "SELECT id FROM categorias_evento WHERE slug = :slug LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['slug' => $categoriaNome]);
        
        $result = $stmt->fetch();
        return $result ? $result['id'] : null;
    }
    
    private function gerarSlug($nome) {
        $slug = strtolower($nome);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // Verificar se já existe
        $pdo = $this->db->getPDO();
        $originalSlug = $slug;
        $counter = 1;
        
        while (true) {
            $sql = "SELECT id FROM eventos WHERE slug = :slug LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['slug' => $slug]);
            
            if (!$stmt->fetch()) {
                break;
            }
            
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
    
    private function formatarDataHora($dataHora) {
        if (empty($dataHora)) return null;
        
        try {
            return date('Y-m-d H:i:s', strtotime($dataHora));
        } catch (Exception $e) {
            return null;
        }
    }
    
    // =====================================================
    // RESPOSTA JSON
    // =====================================================
    
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
}

// =====================================================
// EXECUTAR API
// =====================================================

try {
    $api = new AnysummitAPI();
    $api->processarRequisicao();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

// =====================================================
// EXEMPLO DE RESPOSTA DE SUCESSO
// =====================================================

/*
RESPOSTA DE SUCESSO:
{
  "success": true,
  "data": {
    "evento_id": 123,
    "message": "Evento criado com sucesso!",
    "url": "https://webtoyou.com.br/evento/123"
  },
  "timestamp": "2025-01-27 10:30:00"
}

RESPOSTA DE ERRO:
{
  "success": false,
  "message": "Erro de validação: Nome do evento é obrigatório",
  "timestamp": "2025-01-27 10:30:00"
}
*/

// =====================================================
// LOGS DE DEBUG (OPCIONAL)
// =====================================================

/*
Para debugar, adicione estas linhas no início da função processarRequisicao():

// Debug - salvar dados recebidos
file_put_contents('debug_log.txt', 
    date('Y-m-d H:i:s') . " - Dados recebidos:\n" . 
    print_r($dados, true) . "\n\n", 
    FILE_APPEND
);
*/

if (isset($_GET['debug']) && $_GET['debug'] === 'log') {
    if (file_exists('debug_ingressos.txt')) {
        header('Content-Type: text/plain');
        echo file_get_contents('debug_ingressos.txt');
    } else {
        echo "Arquivo de debug não encontrado.";
    }
    exit();
}

?>