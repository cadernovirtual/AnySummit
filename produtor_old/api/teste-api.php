<?php
// Teste básico de funcionamento
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Forçar saída como texto para debug
header('Content-Type: text/plain; charset=UTF-8');

echo "=== TESTE DE API ===\n\n";

// Teste 1: PHP funcionando
echo "1. PHP está funcionando: OK\n";
echo "   Versão: " . phpversion() . "\n\n";

// Teste 2: Método
echo "2. Método da requisição: " . $_SERVER['REQUEST_METHOD'] . "\n\n";

// Teste 3: Dados recebidos
echo "3. Dados brutos recebidos:\n";
$input_raw = file_get_contents('php://input');
echo "   " . $input_raw . "\n\n";

// Teste 4: JSON decode
echo "4. Tentando decodificar JSON:\n";
$input = json_decode($input_raw, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "   JSON válido!\n";
    echo "   Email: " . (isset($input['email']) ? $input['email'] : 'não encontrado') . "\n";
    echo "   Nome: " . (isset($input['nome']) ? $input['nome'] : 'não encontrado') . "\n\n";
} else {
    echo "   Erro JSON: " . json_last_error_msg() . "\n\n";
}

// Teste 5: Arquivo de conexão
echo "5. Verificando arquivo de conexão:\n";
$conn_file = '../conm/conn.php';
if (file_exists($conn_file)) {
    echo "   Arquivo existe: SIM\n";
    echo "   Caminho absoluto: " . realpath($conn_file) . "\n";
    echo "   Permissões: " . substr(sprintf('%o', fileperms($conn_file)), -4) . "\n\n";
} else {
    echo "   Arquivo existe: NÃO\n";
    echo "   Diretório atual: " . __DIR__ . "\n";
    echo "   Procurando em: " . realpath('../conm/') . "\n\n";
}

// Teste 6: Tentar incluir conexão
echo "6. Tentando incluir arquivo de conexão:\n";
try {
    if (file_exists($conn_file)) {
        require_once $conn_file;
        echo "   Inclusão: OK\n";
        
        // Verificar se variáveis existem
        echo "   \$host definido: " . (isset($host) ? 'SIM' : 'NÃO') . "\n";
        echo "   \$user definido: " . (isset($user) ? 'SIM' : 'NÃO') . "\n";
        echo "   \$db definido: " . (isset($db) ? 'SIM' : 'NÃO') . "\n";
        echo "   \$con definido: " . (isset($con) ? 'SIM' : 'NÃO') . "\n\n";
        
        if (isset($con)) {
            echo "7. Testando conexão com banco:\n";
            if (mysqli_ping($con)) {
                echo "   Conexão ativa: SIM\n";
                
                // Testar query simples
                $result = mysqli_query($con, "SELECT 1");
                if ($result) {
                    echo "   Query teste: OK\n";
                } else {
                    echo "   Query teste: ERRO - " . mysqli_error($con) . "\n";
                }
            } else {
                echo "   Conexão ativa: NÃO\n";
                echo "   Erro: " . mysqli_error($con) . "\n";
            }
        }
    } else {
        echo "   ERRO: Arquivo não encontrado\n";
    }
} catch (Exception $e) {
    echo "   ERRO: " . $e->getMessage() . "\n";
}

// Teste 8: Informações do servidor
echo "\n8. Informações do servidor:\n";
echo "   Sistema: " . PHP_OS . "\n";
echo "   Servidor: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "   Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "   Script: " . $_SERVER['SCRIPT_FILENAME'] . "\n";

echo "\n=== FIM DO TESTE ===\n";
?>