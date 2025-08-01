<?php
/**
 * Script de teste direto para criação de evento
 * Execute via linha de comando: php teste-criar-evento-cli.php
 */

// Configurar ambiente
error_reporting(E_ALL);
ini_set('display_errors', 1);
date_default_timezone_set('America/Sao_Paulo');

// Incluir conexão
require_once 'conm/conn.php';

// Simular sessão
session_start();
$_SESSION['usuario_id'] = 1;
$_SESSION['contratante_id'] = 1;

echo "=== TESTE DE CRIAÇÃO DE EVENTO ===\n\n";

// Função para formatar data
function formatDate($days_ahead = 30) {
    return date('Y-m-d H:i:s', strtotime("+$days_ahead days"));
}

// Dados de teste
$dados = [
    // Informações básicas
    'nome' => 'Evento de Teste CLI ' . date('Y-m-d H:i:s'),
    'classificacao' => 'livre',
    'categoria' => '1',
    'imagem_capa' => '',
    
    // Data e horário
    'data_inicio' => formatDate(30),
    'data_fim' => formatDate(30, 2), // 2 horas depois
    'evento_multiplos_dias' => false,
    
    // Descrição
    'descricao_completa' => '<p>Teste de criação via CLI</p>',
    'descricao_texto' => 'Teste de criação via CLI',
    
    // Localização
    'tipo_local' => 'presencial',
    'busca_endereco' => 'Av. Teste, 123',
    'nome_local' => 'Local de Teste',
    'endereco' => 'Av. Teste',
    'numero' => '123',
    'complemento' => '',
    'bairro' => 'Centro',
    'cidade' => 'São Paulo',
    'estado' => 'SP',
    'cep' => '01000-000',
    'pais' => 'Brasil',
    'latitude' => -23.5629,
    'longitude' => -46.6544,
    'link_transmissao' => '',
    'instrucoes_acesso' => '',
    
    // Lotes
    'lotes' => [
        [
            'id' => 'lote_1',
            'nome' => 'Primeiro Lote',
            'tipo' => 'data',
            'ordem' => 1,
            'data_inicio' => date('Y-m-d H:i:s'),
            'data_fim' => formatDate(25),
            'percentual' => null,
            'quantidade' => null
        ],
        [
            'id' => 'lote_2',
            'nome' => 'Segundo Lote',
            'tipo' => 'percentual',
            'ordem' => 2,
            'data_inicio' => null,
            'data_fim' => null,
            'percentual' => 50,
            'quantidade' => 100
        ]
    ],
    
    // Ingressos
    'ingressos' => [
        [
            'id' => 'ing_1',
            'titulo' => 'Ingresso Pista',
            'descricao' => 'Acesso geral',
            'tipo' => 'paid',
            'preco' => 50.00,
            'quantidade_total' => 200,
            'quantidade_por_pessoa_min' => 1,
            'quantidade_por_pessoa_max' => 4,
            'lote_id' => 'lote_1',
            'inicio_vendas' => date('Y-m-d H:i:s'),
            'fim_vendas' => formatDate(30),
            'cobra_taxa' => true,
            'valor_taxa' => 5.00
        ],
        [
            'id' => 'ing_2',
            'titulo' => 'Ingresso VIP',
            'descricao' => 'Acesso VIP',
            'tipo' => 'paid',
            'preco' => 100.00,
            'quantidade_total' => 50,
            'quantidade_por_pessoa_min' => 1,
            'quantidade_por_pessoa_max' => 2,
            'lote_id' => 'lote_2',
            'inicio_vendas' => date('Y-m-d H:i:s'),
            'fim_vendas' => formatDate(30),
            'cobra_taxa' => true,
            'valor_taxa' => 10.00
        ]
    ],
    
    // Combos
    'combos' => [
        [
            'id' => 'combo_1',
            'titulo' => 'Combo Duplo',
            'descricao' => '1 Pista + 1 VIP',
            'preco' => 130.00,
            'quantidade_total' => 30,
            'lote_id' => 'lote_2',
            'inicio_vendas' => date('Y-m-d H:i:s'),
            'fim_vendas' => formatDate(30),
            'itens' => [
                ['ticket_id' => 'ing_1', 'quantidade' => 1],
                ['ticket_id' => 'ing_2', 'quantidade' => 1]
            ]
        ]
    ],
    
    // Produtor
    'tipo_produtor' => 'current',
    'nome_produtor' => 'Produtor Teste',
    'nome_exibicao' => 'Produtor Teste',
    'descricao_produtor' => 'Descrição do produtor',
    
    // Configurações
    'visibilidade' => 'public',
    'senha' => '',
    'aceita_termos' => true,
    'aceita_privacidade' => true
];

echo "Dados preparados. Iniciando teste...\n\n";

// Simular POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = $dados;

// Capturar saída
ob_start();

// Definir input simulado
$input = json_encode($dados);
stream_wrapper_unregister("php");
stream_wrapper_register("php", "MockPhpStream");
file_put_contents('php://input', $input);

// Incluir API
require 'criaeventoapi.php';

$output = ob_get_clean();

// Decodificar resposta
$resposta = json_decode($output, true);

echo "RESPOSTA DA API:\n";
echo "================\n";
print_r($resposta);

// Verificar no banco
if ($resposta && $resposta['success']) {
    echo "\n\nVERIFICANDO NO BANCO:\n";
    echo "=====================\n";
    
    $evento_id = $resposta['data']['evento_id'];
    
    // Verificar evento
    $query = mysqli_query($con, "SELECT id, nome, slug FROM eventos WHERE id = $evento_id");
    if ($evento = mysqli_fetch_assoc($query)) {
        echo "✓ Evento criado: ID={$evento['id']}, Nome={$evento['nome']}, Slug={$evento['slug']}\n";
    }
    
    // Verificar lotes
    $query = mysqli_query($con, "SELECT * FROM lotes WHERE evento_id = $evento_id");
    echo "\n✓ Lotes criados:\n";
    while ($lote = mysqli_fetch_assoc($query)) {
        echo "  - {$lote['nome']} (ID={$lote['id']}, Tipo={$lote['tipo']})\n";
    }
    
    // Verificar ingressos
    $query = mysqli_query($con, "SELECT * FROM ingressos WHERE evento_id = $evento_id");
    echo "\n✓ Ingressos/Combos criados:\n";
    while ($ingresso = mysqli_fetch_assoc($query)) {
        echo "  - {$ingresso['titulo']} (ID={$ingresso['id']}, Tipo={$ingresso['tipo']}";
        if ($ingresso['tipo'] == 'combo') {
            echo ", Conteúdo=" . $ingresso['conteudo_combo'];
        }
        echo ")\n";
    }
}

// Mock para php://input
class MockPhpStream {
    private $data = '';
    private $position = 0;
    
    public function stream_open($path, $mode, $options, &$opened_path) {
        return true;
    }
    
    public function stream_read($count) {
        $result = substr($this->data, $this->position, $count);
        $this->position += strlen($result);
        return $result;
    }
    
    public function stream_write($data) {
        $this->data = $data;
        return strlen($data);
    }
    
    public function stream_tell() {
        return $this->position;
    }
    
    public function stream_eof() {
        return $this->position >= strlen($this->data);
    }
    
    public function stream_seek($offset, $whence) {
        switch ($whence) {
            case SEEK_SET:
                $this->position = $offset;
                break;
            case SEEK_CUR:
                $this->position += $offset;
                break;
            case SEEK_END:
                $this->position = strlen($this->data) + $offset;
                break;
        }
        return true;
    }
    
    public function stream_stat() {
        return ['size' => strlen($this->data)];
    }
}
?>