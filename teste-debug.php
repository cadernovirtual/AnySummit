<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testando includes...<br>";

// Teste 1: Include do arquivo de conexão
echo "1. Incluindo arquivo de conexão...<br>";
include("evento/conm/conn.php");

if (isset($con) && $con) {
    echo "✅ Conexão com banco OK<br>";
} else {
    echo "❌ Erro na conexão com banco<br>";
}

// Teste 2: Query simples
echo "2. Testando query simples...<br>";
$result = mysqli_query($con, "SELECT 1 as teste");
if ($result) {
    echo "✅ Query de teste OK<br>";
} else {
    echo "❌ Erro na query: " . mysqli_error($con) . "<br>";
}

// Teste 3: Verificar se session_start funciona
echo "3. Testando session_start...<br>";
session_start();
echo "✅ Session iniciada<br>";

// Teste 4: Verificar parâmetro GET
echo "4. Testando parâmetro GET...<br>";
$hash = $_GET['h'] ?? 'não informado';
echo "Hash recebido: " . htmlspecialchars($hash) . "<br>";

echo "<br>Todos os testes básicos passaram!";
?>
