<?php
// Teste simples de salvamento
header('Content-Type: application/json; charset=utf-8');

// Captura todos os erros
ob_start();

try {
    echo "INICIO DO TESTE\n";
    
    // Inclui arquivos
    include("check_login.php");
    echo "Login check OK\n";
    
    include("conm/conn.php");
    echo "Conexão OK\n";
    
    // Testa conexão
    if (!$con) {
        throw new Exception("Erro na conexão: " . mysqli_connect_error());
    }
    
    echo "Conexão validada\n";
    
    // Mostra dados recebidos
    echo "POST data: " . print_r($_POST, true) . "\n";
    
    // Teste simples de query
    $result = mysqli_query($con, "SELECT 1 as teste");
    if ($result) {
        echo "Query teste OK\n";
    } else {
        echo "Erro na query teste: " . mysqli_error($con) . "\n";
    }
    
    echo "FIM DO TESTE\n";
    
    // Limpa o buffer e retorna JSON
    $debug_output = ob_get_clean();
    
    $response = [
        'success' => true,
        'message' => 'Teste concluído',
        'debug' => $debug_output
    ];
    
} catch (Exception $e) {
    $debug_output = ob_get_clean();
    
    $response = [
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => $debug_output
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>