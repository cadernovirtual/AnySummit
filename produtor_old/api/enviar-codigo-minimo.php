<?php
// Versão MÍNIMA - sem conexão com banco
error_reporting(0);
ini_set('display_errors', 0);

// Limpar qualquer saída anterior
if (ob_get_level()) ob_clean();

// Headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Se for OPTIONS (preflight), retornar OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inicializar resposta
$response = array(
    'success' => false,
    'message' => '',
    'debug' => array()
);

try {
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    // Pegar dados
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email']) || !isset($input['nome'])) {
        throw new Exception('Dados inválidos');
    }
    
    $email = $input['email'];
    $nome = $input['nome'];
    
    // Gerar código
    $codigo = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    
    // Por enquanto, apenas retornar sucesso com o código
    // Sem banco de dados, sem email real
    $response['success'] = true;
    $response['message'] = 'Código gerado com sucesso';
    $response['debug'] = array(
        'codigo' => $codigo,
        'email' => $email,
        'nome' => $nome,
        'metodo' => 'memoria'
    );
    
    // Salvar em arquivo temporário como alternativa ao banco
    $temp_file = sys_get_temp_dir() . '/anysummit_code_' . md5($email) . '.txt';
    $data = array(
        'codigo' => $codigo,
        'email' => $email,
        'expires' => time() + 600
    );
    file_put_contents($temp_file, json_encode($data));
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

// Garantir que apenas JSON seja enviado
echo json_encode($response);
exit();
?>