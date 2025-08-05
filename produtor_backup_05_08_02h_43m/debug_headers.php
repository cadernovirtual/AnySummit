<?php
// Capturar qualquer output antes do PHP
ob_start();

echo "=== DIAGNÓSTICO OUTPUT HEADERS ===<br>";

// Verificar se já foram enviados headers
if (headers_sent($file, $line)) {
    echo "❌ HEADERS JÁ ENVIADOS!<br>";
    echo "Arquivo: $file<br>";
    echo "Linha: $line<br>";
} else {
    echo "✅ Headers ainda não enviados<br>";
}

// Capturar conteúdo do buffer
$buffer_content = ob_get_contents();
if (!empty($buffer_content)) {
    echo "⚠️ Conteúdo no buffer: " . strlen($buffer_content) . " bytes<br>";
    echo "Primeiro conteúdo: " . htmlspecialchars(substr($buffer_content, 0, 100)) . "<br>";
}

echo "<br>Testando includes um por um...<br>";

// Teste 1: check_login.php
echo "1. Testando check_login.php:<br>";
ob_start();
include("check_login.php");
$check_login_output = ob_get_contents();
ob_end_clean();

if (!empty($check_login_output)) {
    echo "❌ check_login.php tem output: " . strlen($check_login_output) . " bytes<br>";
    echo "Conteúdo: " . htmlspecialchars(substr($check_login_output, 0, 200)) . "<br>";
} else {
    echo "✅ check_login.php sem output<br>";
}

// Teste 2: conn.php
echo "2. Testando conn.php:<br>";
ob_start();
include_once('conm/conn.php');
$conn_output = ob_get_contents();
ob_end_clean();

if (!empty($conn_output)) {
    echo "❌ conn.php tem output: " . strlen($conn_output) . " bytes<br>";
    echo "Conteúdo: " . htmlspecialchars(substr($conn_output, 0, 200)) . "<br>";
} else {
    echo "✅ conn.php sem output<br>";
}

// Verificar novamente headers após includes
echo "<br>3. Status headers após includes:<br>";
if (headers_sent($file, $line)) {
    echo "❌ Headers enviados após includes!<br>";
    echo "Arquivo: $file<br>";
    echo "Linha: $line<br>";
} else {
    echo "✅ Headers ainda OK após includes<br>";
}

// Verificar primeiro caractere dos arquivos
echo "<br>4. Verificando início dos arquivos:<br>";

$check_login_content = file_get_contents('check_login.php');
$first_chars = substr($check_login_content, 0, 10);
echo "check_login.php primeiros 10 chars: '" . $first_chars . "'<br>";

if (substr($check_login_content, 0, 3) === "\xEF\xBB\xBF") {
    echo "❌ check_login.php tem BOM UTF-8!<br>";
} else {
    echo "✅ check_login.php sem BOM<br>";
}

$conn_content = file_get_contents('conm/conn.php');
$first_chars_conn = substr($conn_content, 0, 10);
echo "conn.php primeiros 10 chars: '" . $first_chars_conn . "'<br>";

if (substr($conn_content, 0, 3) === "\xEF\xBB\xBF") {
    echo "❌ conn.php tem BOM UTF-8!<br>";
} else {
    echo "✅ conn.php sem BOM<br>";
}

// Verificar organizadores.php
echo "<br>5. Verificando organizadores.php:<br>";
$org_content = file_get_contents('organizadores.php');
$first_chars_org = substr($org_content, 0, 20);
echo "organizadores.php primeiros 20 chars: '" . htmlspecialchars($first_chars_org) . "'<br>";

if (substr($org_content, 0, 3) === "\xEF\xBB\xBF") {
    echo "❌ organizadores.php tem BOM UTF-8!<br>";
} else {
    echo "✅ organizadores.php sem BOM<br>";
}

// Procurar espaços ou newlines antes de <?php
if (strpos($org_content, '<?php') > 0) {
    $before_php = substr($org_content, 0, strpos($org_content, '<?php'));
    echo "❌ Conteúdo antes de <?php: '" . htmlspecialchars($before_php) . "'<br>";
} else {
    echo "✅ <?php está no início do arquivo<br>";
}

echo "<br>=== FIM DIAGNÓSTICO ===<br>";
?>
