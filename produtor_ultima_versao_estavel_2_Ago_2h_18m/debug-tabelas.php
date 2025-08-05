<?php
/**
 * DEBUG: Verificar estrutura da tabela ingressos e dados salvos
 */

include("../conm/conn.php");

echo "<h2>Estrutura da tabela ingressos:</h2>";
$result = mysqli_query($con, "DESCRIBE ingressos");
echo "<table border='1'>";
echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>";
    echo "<td>" . $row['Field'] . "</td>";
    echo "<td>" . $row['Type'] . "</td>";
    echo "<td>" . $row['Null'] . "</td>";
    echo "<td>" . $row['Key'] . "</td>";
    echo "<td>" . $row['Default'] . "</td>";
    echo "<td>" . $row['Extra'] . "</td>";
    echo "</tr>";
}
echo "</table>";

echo "<h2>Últimos ingressos inseridos (evento 49):</h2>";
$result = mysqli_query($con, "SELECT * FROM ingressos WHERE evento_id = 49 ORDER BY id DESC LIMIT 5");
echo "<table border='1'>";
if (mysqli_num_rows($result) > 0) {
    // Cabeçalho
    $first_row = mysqli_fetch_assoc($result);
    echo "<tr>";
    foreach ($first_row as $key => $value) {
        echo "<th>$key</th>";
    }
    echo "</tr>";
    
    // Primeira linha
    echo "<tr>";
    foreach ($first_row as $key => $value) {
        echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
    }
    echo "</tr>";
    
    // Outras linhas
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        foreach ($row as $key => $value) {
            echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
        }
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='100%'>Nenhum ingresso encontrado</td></tr>";
}
echo "</table>";

echo "<h2>Lotes do evento 49:</h2>";
$result = mysqli_query($con, "SELECT * FROM lotes WHERE evento_id = 49 ORDER BY id DESC");
echo "<table border='1'>";
if (mysqli_num_rows($result) > 0) {
    // Cabeçalho
    $first_row = mysqli_fetch_assoc($result);
    echo "<tr>";
    foreach ($first_row as $key => $value) {
        echo "<th>$key</th>";
    }
    echo "</tr>";
    
    // Primeira linha
    echo "<tr>";
    foreach ($first_row as $key => $value) {
        echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
    }
    echo "</tr>";
    
    // Outras linhas
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        foreach ($row as $key => $value) {
            echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
        }
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='100%'>❌ NENHUM LOTE ENCONTRADO - PROBLEMA!</td></tr>";
}
echo "</table>";

mysqli_close($con);
?>
