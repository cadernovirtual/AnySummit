<?php
// Teste de debug mínimo para identificar o erro 500
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: application/json');

echo json_encode([
    'success' => true, 
    'message' => 'Teste básico funcionando',
    'php_version' => PHP_VERSION,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>