<?php
echo "=== DEBUG ORGANIZADORES ===<br>";

// 1. Verificar se o arquivo existe
echo "1. Arquivo organizadores.php existe: " . (file_exists('organizadores.php') ? 'SIM' : 'NÃO') . "<br>";

// 2. Testar include básico
echo "2. Testando includes básicos...<br>";

try {
    // Testar check_login.php
    if (file_exists('check_login.php')) {
        echo "- check_login.php existe<br>";
    } else {
        echo "- check_login.php NÃO EXISTE<br>";
    }
    
    // Testar conn.php
    if (file_exists('conm/conn.php')) {
        echo "- conm/conn.php existe<br>";
    } else {
        echo "- conm/conn.php NÃO EXISTE<br>";
    }
    
    // Testar menu.php
    if (file_exists('menu.php')) {
        echo "- menu.php existe<br>";
    } else {
        echo "- menu.php NÃO EXISTE<br>";
    }
    
} catch (Exception $e) {
    echo "ERRO nos includes: " . $e->getMessage() . "<br>";
}

// 3. Testar conexão com banco
echo "3. Testando conexão com banco...<br>";
try {
    include_once('conm/conn.php');
    if (isset($con) && $con) {
        echo "- Conexão com banco: OK<br>";
        
        // Testar query simples
        $result = mysqli_query($con, "SELECT 1 as teste");
        if ($result) {
            echo "- Query teste: OK<br>";
        } else {
            echo "- Query teste: ERRO - " . mysqli_error($con) . "<br>";
        }
        
        // Verificar se tabela contratantes existe
        $result = mysqli_query($con, "SHOW TABLES LIKE 'contratantes'");
        if ($result && mysqli_num_rows($result) > 0) {
            echo "- Tabela contratantes: OK<br>";
        } else {
            echo "- Tabela contratantes: NÃO ENCONTRADA<br>";
        }
        
    } else {
        echo "- Conexão com banco: FALHOU<br>";
    }
} catch (Exception $e) {
    echo "ERRO na conexão: " . $e->getMessage() . "<br>";
}

// 4. Verificar versão PHP
echo "4. Versão PHP: " . phpversion() . "<br>";

// 5. Verificar limite de memória
echo "5. Limite de memória: " . ini_get('memory_limit') . "<br>";

// 6. Verificar se há erros de sintaxe no organizadores.php
echo "6. Verificando sintaxe do organizadores.php...<br>";
$file_content = file_get_contents('organizadores.php');
if ($file_content === false) {
    echo "- ERRO: Não foi possível ler o arquivo<br>";
} else {
    echo "- Arquivo lido com sucesso (" . strlen($file_content) . " bytes)<br>";
    
    // Verificar se há caracteres inválidos no início
    $first_chars = substr($file_content, 0, 10);
    echo "- Primeiros 10 caracteres: " . htmlspecialchars($first_chars) . "<br>";
    
    // Verificar se há BOM
    if (substr($file_content, 0, 3) === "\xEF\xBB\xBF") {
        echo "- AVISO: Arquivo tem BOM UTF-8<br>";
    }
}

// 7. Testar parsing PHP
echo "7. Testando sintaxe PHP...<br>";
$syntax_check = shell_exec('php -l organizadores.php 2>&1');
if ($syntax_check) {
    echo "- Resultado: " . htmlspecialchars($syntax_check) . "<br>";
}

echo "=== FIM DEBUG ===";
?>
