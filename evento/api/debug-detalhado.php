<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Log muito detalhado
error_log("=== DEBUG ESPECÍFICO ERRO 500 ===");
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'não definido'));
error_log("REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'não definido'));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("ERRO: Método não é POST");
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Capturar dados brutos primeiro
$raw_input = file_get_contents('php://input');
error_log("Raw input length: " . strlen($raw_input));
error_log("Raw input: " . $raw_input);

if (empty($raw_input)) {
    error_log("ERRO: Input vazio");
    echo json_encode(['success' => false, 'message' => 'Nenhum dado recebido']);
    exit;
}

// Tentar decode
$input = json_decode($raw_input, true);
$json_error = json_last_error();

if ($json_error !== JSON_ERROR_NONE) {
    error_log("ERRO JSON: " . json_last_error_msg());
    echo json_encode([
        'success' => false, 
        'message' => 'Erro JSON: ' . json_last_error_msg(),
        'json_error_code' => $json_error
    ]);
    exit;
}

if (!$input || !is_array($input)) {
    error_log("ERRO: Input não é array válido");
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

// Log dos dados estruturados
error_log("=== DADOS RECEBIDOS ===");
error_log("Carrinho presente: " . (isset($input['carrinho']) ? 'SIM' : 'NÃO'));
error_log("Participante presente: " . (isset($input['participante']) ? 'SIM' : 'NÃO'));
error_log("Comprador presente: " . (isset($input['comprador']) ? 'SIM' : 'NÃO'));
error_log("Pagamento presente: " . (isset($input['pagamento']) ? 'SIM' : 'NÃO'));

if (isset($input['carrinho'])) {
    error_log("Carrinho: " . json_encode($input['carrinho']));
}
if (isset($input['participante'])) {
    error_log("Participante: " . json_encode($input['participante']));
}
if (isset($input['comprador'])) {
    error_log("Comprador: " . json_encode($input['comprador']));
}
if (isset($input['pagamento'])) {
    error_log("Pagamento: " . json_encode($input['pagamento']));
}

// Incluir conexão e testar
error_log("=== TESTANDO CONEXÃO BD ===");
try {
    include("../conm/conn.php");
    if ($con) {
        error_log("✅ Conexão BD bem-sucedida");
        
        // Testar query simples
        $test_query = $con->query("SELECT 1 as test");
        if ($test_query) {
            error_log("✅ Query teste bem-sucedida");
        } else {
            error_log("❌ Erro na query teste: " . $con->error);
        }
    } else {
        error_log("❌ Falha na conexão BD");
    }
} catch (Exception $e) {
    error_log("❌ Exceção na conexão: " . $e->getMessage());
}

echo json_encode([
    'success' => true,
    'message' => 'Debug completado - veja logs para detalhes',
    'data_received' => $input
]);
?>