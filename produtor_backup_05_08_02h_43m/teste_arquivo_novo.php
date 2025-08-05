<?php
echo "=== TESTE SINTAXE ARQUIVO NOVO ===<br>";

// Testar sintaxe do arquivo recriado
$file_content = file_get_contents('organizadores.php');
if ($file_content === false) {
    echo "❌ Erro ao ler o arquivo<br>";
} else {
    echo "✅ Arquivo lido com sucesso (" . strlen($file_content) . " bytes)<br>";
    
    // Verificar se há caracteres inválidos no início
    $first_chars = substr($file_content, 0, 20);
    echo "- Primeiros 20 caracteres: " . htmlspecialchars($first_chars) . "<br>";
    
    // Verificar se termina corretamente
    $last_chars = substr($file_content, -20);
    echo "- Últimos 20 caracteres: " . htmlspecialchars($last_chars) . "<br>";
    
    // Contar chaves
    $open_braces = substr_count($file_content, '{');
    $close_braces = substr_count($file_content, '}');
    echo "- Chaves abertas: $open_braces<br>";
    echo "- Chaves fechadas: $close_braces<br>";
    
    if ($open_braces == $close_braces) {
        echo "✅ Chaves balanceadas<br>";
    } else {
        echo "❌ Chaves desbalanceadas (" . ($open_braces - $close_braces) . " diferença)<br>";
    }
    
    // Verificar se há PHP tags não fechadas
    if (substr_count($file_content, '<?php') == substr_count($file_content, '?>')) {
        echo "✅ Tags PHP balanceadas<br>";
    } else {
        echo "⚠️ Tags PHP desbalanceadas (normal se não fecha última tag)<br>";
    }
}

echo "<br>🚀 <a href='organizadores.php'>Testar organizadores.php recriado</a>";
?>
