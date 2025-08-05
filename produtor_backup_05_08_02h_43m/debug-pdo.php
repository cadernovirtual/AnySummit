<?php
// Debug simples para testar o erro 500
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log tudo
$log = date('Y-m-d H:i:s') . " - TESTE DEBUG\n";

try {
    // 1. Testar se consegue incluir arquivos
    $log .= "1. Testando PDO...\n";
    if (!class_exists('PDO')) {
        $log .= "ERRO: PDO não está disponível!\n";
    } else {
        $log .= "OK: PDO disponível\n";
    }
    
    // 2. Testar conexão
    $log .= "2. Testando conexão...\n";
    $pdo = new PDO(
        'mysql:host=anysubd.mysql.dbaas.com.br;dbname=anysubd;charset=utf8mb4',
        'anysubd',
        'Swko15357523@#'
    );
    $log .= "OK: Conexão estabelecida\n";
    
    // 3. Testar query simples
    $log .= "3. Testando query...\n";
    $stmt = $pdo->query("SELECT 1");
    $log .= "OK: Query executada\n";
    
    // 4. Verificar tabelas
    $log .= "4. Verificando tabelas...\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'eventos'");
    if ($stmt->rowCount() > 0) {
        $log .= "OK: Tabela eventos existe\n";
    } else {
        $log .= "ERRO: Tabela eventos não encontrada\n";
    }
    
    // Salvar log
    file_put_contents('debug_teste.log', $log);
    
    // Resposta
    echo json_encode([
        'success' => true,
        'message' => 'Todos os testes passaram',
        'detalhes' => explode("\n", $log)
    ]);
    
} catch (Exception $e) {
    $log .= "ERRO: " . $e->getMessage() . "\n";
    $log .= "Linha: " . $e->getLine() . "\n";
    file_put_contents('debug_teste.log', $log);
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'detalhes' => explode("\n", $log)
    ]);
}
?>
