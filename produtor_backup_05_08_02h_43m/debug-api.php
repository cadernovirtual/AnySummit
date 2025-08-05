<?php
// Debug temporário para verificar erro 500
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://webtoyou.com.br');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Testar conexão com banco
    $host = 'anysubd.mysql.dbaas.com.br';
    $username = 'anysubd';
    $password = 'Swko15357523@#';
    $database = 'anysubd';
    
    $dsn = "mysql:host={$host};dbname={$database};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    
    // Receber dados
    $jsonData = file_get_contents('php://input');
    $dados = json_decode($jsonData, true);
    
    // Debug
    $debug = [
        'conexao_bd' => 'OK',
        'metodo' => $_SERVER['REQUEST_METHOD'],
        'dados_recebidos' => !empty($dados),
        'quantidade_dados' => count($dados),
        'cookies' => $_COOKIE,
        'php_version' => phpversion(),
        'pdo_drivers' => PDO::getAvailableDrivers()
    ];
    
    echo json_encode([
        'success' => true,
        'debug' => $debug,
        'message' => 'Debug completo'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
