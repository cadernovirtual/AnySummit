<?php
echo "=== TESTE SINTAXE CORRIGIDA ===<br>";

// Testar include do arquivo corrigido
$errors = [];
ob_start();
$result = include('organizadores.php');
$output = ob_get_clean();

if ($result === false) {
    echo "❌ Erro ao incluir organizadores.php<br>";
} else {
    echo "✅ organizadores.php incluído sem erros de sintaxe<br>";
    echo "📏 Tamanho do output: " . strlen($output) . " bytes<br>";
    
    if (strpos($output, 'Fatal error') !== false) {
        echo "❌ Fatal error detectado no output<br>";
    } elseif (strpos($output, 'Parse error') !== false) {
        echo "❌ Parse error detectado no output<br>";
    } else {
        echo "✅ Nenhum erro detectado no output<br>";
        echo "🎉 ARQUIVO CORRIGIDO COM SUCESSO!<br>";
    }
}

echo "<br><a href='organizadores.php'>🚀 Testar organizadores.php corrigido</a>";
?>
