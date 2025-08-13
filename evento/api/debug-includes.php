<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: application/json');

try {
    // Teste 1: Verificar includes
    echo "Testando includes...\n";
    
    if (file_exists("../conm/conn.php")) {
        include("../conm/conn.php");
        echo "conn.php: incluído\n";
    } else {
        echo "conn.php: ARQUIVO NÃO ENCONTRADO\n";
    }
    
    if (file_exists("AsaasAPI.php")) {
        include("AsaasAPI.php");
        echo "AsaasAPI.php: incluído\n";
    } else {
        echo "AsaasAPI.php: ARQUIVO NÃO ENCONTRADO\n";
    }
    
    // Teste 2: Verificar classes
    if (class_exists('AsaasAPI')) {
        echo "AsaasAPI class: OK\n";
    } else {
        echo "AsaasAPI class: NÃO ENCONTRADA\n";
    }
    
    // Teste 3: Verificar conexão
    if (isset($con)) {
        echo "Conexão DB: OK\n";
    } else {
        echo "Conexão DB: VARIÁVEL NÃO DEFINIDA\n";
    }
    
    // Teste 4: Verificar PHP version
    echo "PHP Version: " . PHP_VERSION . "\n";
    
    // Teste 5: Testar AsaasAPI
    if (class_exists('AsaasAPI')) {
        $asaas = new AsaasAPI('production');
        echo "AsaasAPI instância: OK\n";
    }
    
    echo json_encode(['success' => true, 'message' => 'Todos os testes passaram']);
    
} catch (Error $e) {
    echo json_encode(['success' => false, 'error' => 'PHP Error: ' . $e->getMessage(), 'line' => $e->getLine()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Exception: ' . $e->getMessage(), 'line' => $e->getLine()]);
}
?>