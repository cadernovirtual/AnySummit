<?php
// Forçar headers PHP explicitamente
if (!headers_sent()) {
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
}

// Verificar se PHP está funcionando
if (!defined('PHP_VERSION')) {
    die('PHP não está funcionando corretamente');
}

// Debug para verificar se chegamos até aqui
error_log('meuseventos-teste.php: Iniciando execução');

// Incluir arquivos necessários
include("check_login.php");
include("conm/conn.php");

// Verificar se a conexão com o banco está funcionando
if (!$con) {
    die('Erro de conexão com o banco de dados: ' . mysqli_connect_error());
}

// Se chegamos até aqui, o PHP está funcionando
echo "<!DOCTYPE html>";
echo "<html>";
echo "<head><title>Teste - Meus Eventos</title></head>";
echo "<body>";
echo "<h1>✅ PHP está funcionando corretamente!</h1>";
echo "<p>Este é um teste do arquivo meuseventos.php</p>";
echo "<p>Versão PHP: " . PHP_VERSION . "</p>";
echo "<p>Conexão BD: " . ($con ? 'Conectado' : 'Erro') . "</p>";

// Incluir o conteúdo real do meuseventos.php
echo "<h2>Carregando conteúdo original...</h2>";

// Capturar qualquer saída do arquivo original
ob_start();
try {
    include('meuseventos.php');
    $content = ob_get_clean();
    echo $content;
} catch (Exception $e) {
    ob_end_clean();
    echo "<p style='color: red;'>Erro ao carregar meuseventos.php: " . $e->getMessage() . "</p>";
}

echo "</body></html>";
?>