<?php
echo "Teste de sintaxe PHP...\n";

// Testar se o arquivo pode ser incluído sem erro
$file_path = 'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\vendas.php';

// Verificar se o arquivo existe
if (file_exists($file_path)) {
    echo "Arquivo existe.\n";
    
    // Verificar sintaxe
    $output = [];
    $return_var = 0;
    
    // Simular verificação básica lendo o conteúdo
    $content = file_get_contents($file_path);
    
    // Verificar algumas coisas básicas
    $php_open_count = substr_count($content, '<?php');
    $php_close_count = substr_count($content, '?>');
    
    echo "Tags PHP abertas: $php_open_count\n";
    echo "Tags PHP fechadas: $php_close_count\n";
    
    // Verificar chaves
    $open_braces = substr_count($content, '{');
    $close_braces = substr_count($content, '}');
    
    echo "Chaves abertas: $open_braces\n";
    echo "Chaves fechadas: $close_braces\n";
    
    if ($open_braces == $close_braces) {
        echo "✓ Chaves balanceadas\n";
    } else {
        echo "✗ Chaves desbalanceadas\n";
    }
    
    echo "Teste concluído.\n";
} else {
    echo "Arquivo não encontrado: $file_path\n";
}
?>