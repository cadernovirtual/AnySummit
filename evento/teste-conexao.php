<?php
// Teste de conexão simples
include("conm/conn.php");

echo "<h1>Teste de Conexão</h1>";

if (!$con) {
    echo "<p style='color: red;'>Erro de conexão: " . mysqli_connect_error() . "</p>";
} else {
    echo "<p style='color: green;'>Conexão OK!</p>";
    
    // Testar uma query simples
    $result = mysqli_query($con, "SELECT COUNT(*) as total FROM tb_pedidos");
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        echo "<p>Total de pedidos no banco: " . $row['total'] . "</p>";
    } else {
        echo "<p style='color: red;'>Erro na query: " . mysqli_error($con) . "</p>";
    }
}
?>
