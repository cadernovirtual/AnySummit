<?php
/**
 * API Debug - Versão de teste para criação de eventos
 */

// Debug habilitado
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// Log de debug
$debug = [];
$debug['timestamp'] = date('Y-m-d H:i:s');
$debug['method'] = $_SERVER['REQUEST_METHOD'];

// Tratamento de OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir conexão com banco
$debug['include_start'] = true;
require_once 'conm/conn.php';
$debug['include_success'] = true;

// Verificar conexão
if (!$con) {
    die(json_encode([
        'success' => false,
        'message' => 'Erro na conexão com banco de dados',
        'debug' => $debug
    ]));
}
$debug['connection'] = 'OK';

// Iniciar sessão
session_start();
$debug['session_id'] = session_id();

// Para testes, aceitar usuário via parâmetro ou usar padrão
if (!isset($_SESSION['usuario_id'])) {
    $_SESSION['usuario_id'] = 1; // Usuário de teste
    $_SESSION['contratante_id'] = 1; // Contratante de teste
    $debug['session_created'] = true;
}

$debug['usuario_id'] = $_SESSION['usuario_id'];
$debug['contratante_id'] = $_SESSION['contratante_id'] ?? null;

// Função para responder com JSON
function responderJSON($sucesso, $mensagem, $dados = null, $debug = null) {
    $response = [
        'success' => $sucesso,
        'message' => $mensagem,
        'data' => $dados
    ];
    
    if ($debug) {
        $response['debug'] = $debug;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJSON(false, 'Método não permitido. Use POST.', null, $debug);
}

// Receber dados JSON
$dadosJSON = file_get_contents('php://input');
$debug['input_length'] = strlen($dadosJSON);

if (empty($dadosJSON)) {
    responderJSON(false, 'Nenhum dado recebido', null, $debug);
}

$dados = json_decode($dadosJSON, true);
if (!$dados) {
    $debug['json_error'] = json_last_error_msg();
    responderJSON(false, 'Dados JSON inválidos', null, $debug);
}

$debug['dados_recebidos'] = [
    'nome' => $dados['nome'] ?? 'não informado',
    'lotes' => count($dados['lotes'] ?? []),
    'ingressos' => count($dados['ingressos'] ?? []),
    'combos' => count($dados['combos'] ?? [])
];

// Executar a lógica principal
try {
    // Chamar a API original
    $_SERVER['REQUEST_METHOD'] = 'POST'; // Garantir método
    ob_start();
    include 'criaeventoapi.php';
    $output = ob_get_clean();
    
    // Se chegou aqui sem output, algo deu errado
    if (empty($output)) {
        throw new Exception("API não retornou resposta");
    }
    
    echo $output;
    
} catch (Exception $e) {
    $debug['error'] = $e->getMessage();
    $debug['trace'] = $e->getTraceAsString();
    responderJSON(false, 'Erro ao processar: ' . $e->getMessage(), null, $debug);
}
?>