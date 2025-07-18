<?php
// Teste básico para identificar o erro
// D:\sites\anysummit\evento\teste-simples.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Teste de Erro 500</h1>";

// Teste 1: PHP básico
echo "<h2>1. PHP Básico</h2>";
echo "✅ PHP funcionando<br>";

// Teste 2: Conexão
echo "<h2>2. Teste de Conexão</h2>";
try {
    include("conm/conn.php");
    if (isset($con)) {
        echo "✅ Conexão OK<br>";
    } else {
        echo "❌ Variável \$con não definida<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro na conexão: " . $e->getMessage() . "<br>";
}

// Teste 3: Consulta simples
echo "<h2>3. Teste de Consulta</h2>";
try {
    $sql = "SELECT COUNT(*) as total FROM eventos";
    $result = $con->query($sql);
    if ($result) {
        $row = $result->fetch_assoc();
        echo "✅ Consulta OK - Total eventos: " . $row['total'] . "<br>";
    } else {
        echo "❌ Erro na consulta: " . $con->error . "<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "<br>";
}

// Teste 4: JSON encode
echo "<h2>4. Teste JSON</h2>";
$teste_array = [['id' => 1, 'nome' => 'teste']];
$json = json_encode($teste_array);
if ($json) {
    echo "✅ JSON OK<br>";
} else {
    echo "❌ Erro no JSON<br>";
}

echo "<h2>5. Próximo Passo</h2>";
echo "<p>Se todos os testes acima passaram, o problema pode ser:</p>";
echo "<ul>";
echo "<li>Erro de sintaxe no index.php</li>";
echo "<li>Limite de memória PHP</li>";
echo "<li>Timeout do servidor</li>";
echo "<li>Caracteres inválidos no código</li>";
echo "</ul>";
?>
