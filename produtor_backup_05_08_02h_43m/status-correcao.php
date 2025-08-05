<?php
echo "<h1>Status da Correção</h1>";

// Teste 1: Verificar se PHP está funcionando
echo "<h2>1. PHP Funcionando:</h2>";
echo "✅ Versão: " . phpversion() . "<br>";

// Teste 2: Verificar handler
echo "<h2>2. Handler PHP:</h2>";
echo "SAPI: " . php_sapi_name() . "<br>";

// Teste 3: Verificar arquivo meuseventos.php
echo "<h2>3. Arquivo meuseventos.php:</h2>";
$file = __DIR__ . '/meuseventos.php';
if (file_exists($file)) {
    echo "✅ Arquivo existe<br>";
    echo "Tamanho: " . filesize($file) . " bytes<br>";
    
    // Verificar se consegue ler o arquivo
    $content = file_get_contents($file, false, null, 0, 100);
    if ($content && substr($content, 0, 5) === '<?php') {
        echo "✅ Arquivo PHP válido<br>";
    } else {
        echo "❌ Problema com formato do arquivo<br>";
    }
} else {
    echo "❌ Arquivo não encontrado<br>";
}

// Teste 4: Headers
echo "<h2>4. Headers:</h2>";
if (!headers_sent()) {
    echo "✅ Headers ainda não enviados (normal)<br>";
} else {
    echo "⚠️ Headers já enviados<br>";
}

// Teste 5: Testar links
echo "<h2>5. Links de Teste:</h2>";
echo "<a href='/produtor/meuseventos.php' target='_blank'>Acesso direto: /produtor/meuseventos.php</a><br>";
echo "<a href='/produtor/meuseventos' target='_blank'>URL amigável: /produtor/meuseventos</a><br>";
echo "<a href='/produtor/meuseventos-teste.php' target='_blank'>Versão de teste: /produtor/meuseventos-teste.php</a><br>";

echo "<h2>6. Instruções:</h2>";
echo "<p>1. Teste primeiro o link de acesso direto<br>";
echo "2. Se funcionar, teste a URL amigável<br>";
echo "3. Se não funcionar, use a versão de teste</p>";

echo "<h2>7. Status:</h2>";
echo "<p style='color: green;'>✅ Correções aplicadas ao .htaccess</p>";
echo "<p>- Handler PHP corrigido<br>";
echo "- Regras de rewrite otimizadas<br>";
echo "- Condições para arquivos PHP existentes<br>";
echo "- .htaccess específico na pasta /produtor</p>";
?>