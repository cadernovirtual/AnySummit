<?php
// Teste de configuração PHP
echo "<h1>Teste de Configuração PHP</h1>";

// Informações PHP
echo "<h2>Informações PHP:</h2>";
echo "Versão PHP: " . phpversion() . "<br>";
echo "SAPI: " . php_sapi_name() . "<br>";

// Testar headers
echo "<h2>Headers:</h2>";
echo "Content-Type definido: ";
if (headers_sent()) {
    echo "Headers já enviados<br>";
} else {
    header('Content-Type: text/html; charset=UTF-8');
    echo "✅ Headers definidos corretamente<br>";
}

// Testar extensões
echo "<h2>Extensões Importantes:</h2>";
echo "MySQLi: " . (extension_loaded('mysqli') ? '✅ Ativo' : '❌ Inativo') . "<br>";
echo "Session: " . (extension_loaded('session') ? '✅ Ativo' : '❌ Inativo') . "<br>";
echo "GD: " . (extension_loaded('gd') ? '✅ Ativo' : '❌ Inativo') . "<br>";

// Testar include path
echo "<h2>Caminhos:</h2>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script Path: " . $_SERVER['SCRIPT_FILENAME'] . "<br>";
echo "Current Dir: " . getcwd() . "<br>";

// Testar arquivo específico
echo "<h2>Teste Arquivo meuseventos.php:</h2>";
$file_path = $_SERVER['DOCUMENT_ROOT'] . '/produtor/meuseventos.php';
if (file_exists($file_path)) {
    echo "✅ Arquivo existe<br>";
    echo "Tamanho: " . filesize($file_path) . " bytes<br>";
    echo "Permissões: " . substr(sprintf('%o', fileperms($file_path)), -4) . "<br>";
    
    // Verificar se o arquivo é legível
    if (is_readable($file_path)) {
        echo "✅ Arquivo legível<br>";
        
        // Ler primeiras linhas
        $handle = fopen($file_path, 'r');
        $first_lines = '';
        for ($i = 0; $i < 5 && !feof($handle); $i++) {
            $first_lines .= fgets($handle);
        }
        fclose($handle);
        
        echo "Primeiras linhas:<br>";
        echo "<pre>" . htmlspecialchars($first_lines) . "</pre>";
    } else {
        echo "❌ Arquivo não legível<br>";
    }
} else {
    echo "❌ Arquivo não encontrado em: " . $file_path . "<br>";
}

// Teste de inclusão
echo "<h2>Teste de Inclusão:</h2>";
try {
    ob_start();
    include_once($file_path);
    $output = ob_get_clean();
    echo "✅ Inclusão bem-sucedida<br>";
    echo "Tamanho da saída: " . strlen($output) . " caracteres<br>";
} catch (Exception $e) {
    echo "❌ Erro na inclusão: " . $e->getMessage() . "<br>";
}

echo "<h2>Configurações do Servidor:</h2>";
echo "SERVER_SOFTWARE: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Não definido') . "<br>";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'Não definido') . "<br>";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'Não definido') . "<br>";

phpinfo();
?>