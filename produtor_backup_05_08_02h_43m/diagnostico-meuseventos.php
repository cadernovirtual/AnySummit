<?php
// Script para diagnosticar problemas com meuseventos.php

echo "<h1>Diagnóstico do arquivo meuseventos.php</h1>";

$file_path = __DIR__ . '/meuseventos.php';

echo "<h2>Informações do arquivo:</h2>";
echo "Caminho: " . $file_path . "<br>";
echo "Existe: " . (file_exists($file_path) ? 'Sim' : 'Não') . "<br>";

if (file_exists($file_path)) {
    $content = file_get_contents($file_path);
    
    echo "Tamanho: " . strlen($content) . " bytes<br>";
    echo "Encoding: " . mb_detect_encoding($content) . "<br>";
    
    // Verificar BOM
    $bom = substr($content, 0, 3);
    if ($bom === "\xEF\xBB\xBF") {
        echo "⚠️ Arquivo contém BOM UTF-8<br>";
    } else {
        echo "✅ Sem BOM<br>";
    }
    
    // Verificar primeiros caracteres
    $first_chars = substr($content, 0, 10);
    echo "Primeiros 10 bytes (hex): " . bin2hex($first_chars) . "<br>";
    echo "Primeiros 10 caracteres: " . htmlspecialchars($first_chars) . "<br>";
    
    // Verificar se começa com <?php
    if (substr($content, 0, 5) === '<?php') {
        echo "✅ Inicia corretamente com &lt;?php<br>";
    } else {
        echo "❌ Não inicia com &lt;?php<br>";
    }
    
    // Verificar sintaxe PHP
    $check = php_check_syntax($file_path);
    if ($check) {
        echo "✅ Sintaxe PHP válida<br>";
    } else {
        echo "❌ Erro de sintaxe PHP<br>";
    }
    
    // Verificar permissões
    echo "Permissões: " . substr(sprintf('%o', fileperms($file_path)), -4) . "<br>";
    echo "Proprietário pode ler: " . (is_readable($file_path) ? 'Sim' : 'Não') . "<br>";
    
    // Tentar executar o arquivo
    echo "<h2>Teste de execução:</h2>";
    try {
        ob_start();
        include($file_path);
        $output = ob_get_clean();
        
        echo "✅ Arquivo executado sem erros<br>";
        echo "Tamanho da saída: " . strlen($output) . " caracteres<br>";
        
        if (strlen($output) > 0) {
            echo "Primeiros 200 caracteres da saída:<br>";
            echo "<pre>" . htmlspecialchars(substr($output, 0, 200)) . "</pre>";
        }
        
    } catch (Throwable $e) {
        echo "❌ Erro na execução: " . $e->getMessage() . "<br>";
        echo "Arquivo: " . $e->getFile() . "<br>";
        echo "Linha: " . $e->getLine() . "<br>";
    }
}

// Verificar configuração do servidor
echo "<h2>Configuração do servidor:</h2>";
echo "MIME type para .php: ";
$mime = mime_content_type($file_path);
echo $mime . "<br>";

echo "Headers enviados: " . (headers_sent() ? 'Sim' : 'Não') . "<br>";

// Verificar se mod_rewrite está interferindo
echo "<h2>Verificar URL atual:</h2>";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "<br>";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "<br>";
echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "<br>";
?>