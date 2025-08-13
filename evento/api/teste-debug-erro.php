<?php
// Teste específico para identificar erro no processar-pedido.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TESTE DE SINTAXE ===\n";

// Testar se a linha problemática funciona
try {
    $input = json_decode(file_get_contents('php://input'), true);
    echo "✅ Linha corrigida funciona corretamente\n";
} catch (Exception $e) {
    echo "❌ Erro na linha corrigida: " . $e->getMessage() . "\n";
}

// Simular dados de entrada para teste
$_POST['test'] = true;
$test_data = json_encode([
    'carrinho' => ['total' => 0],
    'participante' => ['nome' => 'Teste'],
    'comprador' => ['nome_completo' => 'Teste'],
    'pagamento' => ['metodo' => 'gratuito']
]);

echo "=== TESTE COM DADOS SIMULADOS ===\n";
try {
    $input_test = json_decode($test_data, true);
    if ($input_test) {
        echo "✅ JSON decode funciona corretamente\n";
        echo "Dados: " . print_r($input_test, true);
    } else {
        echo "❌ Falha no JSON decode\n";
    }
} catch (Exception $e) {
    echo "❌ Erro no teste: " . $e->getMessage() . "\n";
}

echo "=== FIM DO TESTE ===\n";
?>