<?php
// Teste simples para verificar se o erro é na página
session_start();

// Teste de conexão com banco
include("evento/conm/conn.php");

// Verificar se chegou o parâmetro
$hash_validacao = isset($_GET['h']) ? trim($_GET['h']) : '';

if (empty($hash_validacao)) {
    echo "Parâmetro h não informado";
    exit;
}

echo "Hash recebido: " . htmlspecialchars($hash_validacao) . "<br>";
echo "Tamanho do hash: " . strlen($hash_validacao) . "<br>";

// Teste simples de conexão
if ($con) {
    echo "Conexão com banco OK<br>";
} else {
    echo "Erro na conexão: " . mysqli_connect_error() . "<br>";
}

// Teste de query simples
try {
    $sql_test = "SELECT 1 as teste";
    $result = mysqli_query($con, $sql_test);
    if ($result) {
        echo "Query de teste OK<br>";
    } else {
        echo "Erro na query de teste: " . mysqli_error($con) . "<br>";
    }
} catch (Exception $e) {
    echo "Exception na query: " . $e->getMessage() . "<br>";
}

echo "Teste concluído - se você está vendo isso, o PHP está funcionando.";
?>
