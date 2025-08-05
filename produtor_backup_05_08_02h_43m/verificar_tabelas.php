<?php
include("conm/conn.php");

echo "<h2>Verificando tabelas do banco de dados:</h2>";

// Listar todas as tabelas
$result = mysqli_query($con, "SHOW TABLES");
if ($result) {
    echo "<h3>Tabelas existentes:</h3><ul>";
    while ($row = mysqli_fetch_array($result)) {
        echo "<li>" . $row[0] . "</li>";
    }
    echo "</ul>";
} else {
    echo "Erro ao listar tabelas: " . mysqli_error($con);
}

// Verificar tabelas específicas
$tabelas_necessarias = ['eventos', 'categorias', 'ingressos', 'usuarios', 'contratantes'];

echo "<h3>Status das tabelas necessárias:</h3><ul>";
foreach ($tabelas_necessarias as $tabela) {
    $check = mysqli_query($con, "SHOW TABLES LIKE '$tabela'");
    if (mysqli_num_rows($check) > 0) {
        echo "<li style='color: green;'>✓ $tabela - EXISTE</li>";
    } else {
        echo "<li style='color: red;'>✗ $tabela - NÃO EXISTE</li>";
    }
}
echo "</ul>";
?>
