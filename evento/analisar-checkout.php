<?php
// Script para analisar problemas no checkout.php
$arquivo = 'checkout.php';

echo "=== ANÁLISE DO ARQUIVO $arquivo ===\n\n";

// 1. Verificar se arquivo existe
if (!file_exists($arquivo)) {
    die("❌ Arquivo não encontrado!\n");
}

echo "✅ Arquivo existe\n";

// 2. Verificar tamanho
$tamanho = filesize($arquivo);
echo "📏 Tamanho: " . number_format($tamanho) . " bytes\n";

// 3. Verificar permissões
$perms = fileperms($arquivo);
echo "🔒 Permissões: " . substr(sprintf('%o', $perms), -4) . "\n";

// 4. Verificar se é legível
if (!is_readable($arquivo)) {
    die("❌ Arquivo não é legível!\n");
}

echo "✅ Arquivo é legível\n";

// 5. Tentar ler o conteúdo
echo "\n🔄 Tentando ler conteúdo...\n";

try {
    $conteudo = file_get_contents($arquivo);
    if ($conteudo === false) {
        die("❌ Falha ao ler conteúdo!\n");
    }
    
    echo "✅ Conteúdo lido com sucesso\n";
    echo "📊 Tamanho do conteúdo: " . strlen($conteudo) . " caracteres\n";
    
    // 6. Verificar linhas
    $linhas = explode("\n", $conteudo);
    echo "📄 Número de linhas: " . count($linhas) . "\n";
    
    // 7. Verificar encoding
    $encoding = mb_detect_encoding($conteudo, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
    echo "🔤 Encoding detectado: " . ($encoding ?: 'Desconhecido') . "\n";
    
    // 8. Verificar primeiras e últimas linhas
    echo "\n📝 Primeiras 3 linhas:\n";
    for ($i = 0; $i < min(3, count($linhas)); $i++) {
        echo ($i + 1) . ": " . substr($linhas[$i], 0, 100) . "\n";
    }
    
    echo "\n📝 Últimas 3 linhas:\n";
    $total_linhas = count($linhas);
    for ($i = max(0, $total_linhas - 3); $i < $total_linhas; $i++) {
        echo ($i + 1) . ": " . substr($linhas[$i], 0, 100) . "\n";
    }
    
    // 9. Verificar se termina corretamente
    $ultima_linha = trim(end($linhas));
    echo "\n🔚 Última linha (trimmed): '" . $ultima_linha . "'\n";
    
    if ($ultima_linha === '</html>') {
        echo "✅ Arquivo termina corretamente com </html>\n";
    } else {
        echo "⚠️ Arquivo não termina com </html>\n";
    }
    
    // 10. Verificar sintaxe PHP
    echo "\n🔍 Verificando sintaxe PHP...\n";
    
    // Criar arquivo temporário para teste
    $temp_file = tempnam(sys_get_temp_dir(), 'checkout_test');
    file_put_contents($temp_file, $conteudo);
    
    $output = [];
    $return_code = 0;
    
    // Simular verificação (sem executar o php -l diretamente)
    // Vamos procurar por problemas comuns
    
    // Verificar parênteses, chaves e colchetes
    $abertos = substr_count($conteudo, '(');
    $fechados = substr_count($conteudo, ')');
    echo "🔧 Parênteses: $abertos abertos, $fechados fechados ";
    echo ($abertos === $fechados ? "✅" : "❌") . "\n";
    
    $chaves_abertas = substr_count($conteudo, '{');
    $chaves_fechadas = substr_count($conteudo, '}');
    echo "🔧 Chaves: $chaves_abertas abertas, $chaves_fechadas fechadas ";
    echo ($chaves_abertas === $chaves_fechadas ? "✅" : "❌") . "\n";
    
    $colchetes_abertos = substr_count($conteudo, '[');
    $colchetes_fechados = substr_count($conteudo, ']');
    echo "🔧 Colchetes: $colchetes_abertos abertos, $colchetes_fechados fechados ";
    echo ($colchetes_abertos === $colchetes_fechados ? "✅" : "❌") . "\n";
    
    // Verificar tags PHP
    $php_open = substr_count($conteudo, '<?php');
    $php_close = substr_count($conteudo, '?>');
    echo "🔧 Tags PHP: $php_open abertas, $php_close fechadas\n";
    
    // Procurar por caracteres problemáticos
    if (strpos($conteudo, "\0") !== false) {
        echo "⚠️ Arquivo contém caracteres nulos\n";
    }
    
    // Verificar BOM
    if (substr($conteudo, 0, 3) === "\xEF\xBB\xBF") {
        echo "⚠️ Arquivo contém BOM UTF-8\n";
    }
    
    unlink($temp_file);
    
} catch (Exception $e) {
    echo "❌ Erro ao analisar: " . $e->getMessage() . "\n";
}

echo "\n=== FIM DA ANÁLISE ===\n";
?>
