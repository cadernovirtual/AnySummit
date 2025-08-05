<?php
// Teste mínimo da API
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers
header('Content-Type: application/json; charset=utf-8');

// Teste simples
try {
    // 1. Testar se pode receber dados
    $input = file_get_contents('php://input');
    $tamanho = strlen($input);
    
    // 2. Testar JSON parse
    $dados = json_decode($input, true);
    $jsonOk = (json_last_error() === JSON_ERROR_NONE);
    
    // 3. Testar conexão BD
    $bdOk = false;
    try {
        $pdo = new PDO(
            'mysql:host=anysubd.mysql.dbaas.com.br;dbname=anysubd;charset=utf8mb4',
            'anysubd',
            'Swko15357523@#'
        );
        $bdOk = true;
    } catch (Exception $e) {
        $bdErro = $e->getMessage();
    }
    
    // Resposta
    echo json_encode([
        'success' => true,
        'testes' => [
            'tamanho_dados' => $tamanho,
            'json_parse_ok' => $jsonOk,
            'banco_dados_ok' => $bdOk,
            'banco_erro' => $bdErro ?? null,
            'tem_evento' => isset($dados['evento']),
            'tem_ingressos' => isset($dados['ingressos'])
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine()
    ]);
}
?>
