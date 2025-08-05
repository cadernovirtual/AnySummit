<?php
// Teste para verificar se a correção está funcionando

include("../conm/conn.php");

// Listar alguns eventos e seus status
$sql = "SELECT id, nome, status, termos_aceitos, publicado_em FROM eventos ORDER BY id DESC LIMIT 10";
$result = mysqli_query($con, $sql);

echo "<h2>Status dos eventos no banco:</h2>";
echo "<table border='1'>";
echo "<tr><th>ID</th><th>Nome</th><th>Status</th><th>Termos Aceitos</th><th>Publicado Em</th></tr>";

while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . htmlspecialchars($row['nome']) . "</td>";
    echo "<td>" . $row['status'] . "</td>";
    echo "<td>" . ($row['termos_aceitos'] ? 'Sim' : 'Não') . "</td>";
    echo "<td>" . ($row['publicado_em'] ?: 'Não publicado') . "</td>";
    echo "</tr>";
}

echo "</table>";

// Testar também se há problema com a estrutura do banco
echo "<h2>Estrutura do campo termos_aceitos:</h2>";
$sql = "SHOW COLUMNS FROM eventos LIKE 'termos_aceitos'";
$result = mysqli_query($con, $sql);
$column = mysqli_fetch_assoc($result);
echo "<pre>";
print_r($column);
echo "</pre>";
?>