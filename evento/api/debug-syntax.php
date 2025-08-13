<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Teste básico OK\n";

// Teste de sintaxe básica do arquivo
$file = 'pagamento-cartao.php';
$content = file_get_contents($file);

if ($content === false) {
    echo "Erro ao ler arquivo\n";
    exit;
}

// Verificar se há problemas de sintaxe básicos
if (substr_count($content, '<?php') != substr_count($content, '?>') + 1) {
    echo "Possível problema com tags PHP\n";
}

echo "Tags PHP OK\n";

// Tentar incluir o arquivo para ver erro específico
try {
    include_once($file);
    echo "Include OK\n";
} catch (Throwable $e) {
    echo "Erro no include: " . $e->getMessage() . "\n";
    echo "Linha: " . $e->getLine() . "\n";
}
?>