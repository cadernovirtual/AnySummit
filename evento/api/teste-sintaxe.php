<?php
// Teste de sintaxe para pagamento-cartao.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testando sintaxe do arquivo pagamento-cartao.php...\n";

// Tentar incluir o arquivo para detectar erros de sintaxe
try {
    // Simular variáveis globais necessárias
    $_SERVER['REQUEST_METHOD'] = 'GET'; // Para não executar o POST
    
    // Buffer de saída para capturar erros
    ob_start();
    include('pagamento-cartao.php');
    $output = ob_get_clean();
    
    echo "✅ Arquivo carregado sem erros de sintaxe.\n";
    
} catch (ParseError $e) {
    echo "❌ ERRO DE SINTAXE: " . $e->getMessage() . "\n";
    echo "Linha: " . $e->getLine() . "\n";
} catch (Error $e) {
    echo "❌ ERRO FATAL: " . $e->getMessage() . "\n";
    echo "Linha: " . $e->getLine() . "\n";
} catch (Exception $e) {
    echo "⚠️ EXCEÇÃO: " . $e->getMessage() . "\n";
}

echo "Teste concluído.\n";
?>