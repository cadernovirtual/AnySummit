<?php
echo "<h1>Teste Módulo Participante</h1>";
echo "Data: " . date('Y-m-d H:i:s') . "<br>";
echo "PHP: " . PHP_VERSION . "<br>";

try {
    include("conm/conn.php");
    echo "Conexão BD: " . ($con ? "OK" : "ERRO") . "<br>";
    
    // Teste básico
    $result = mysqli_query($con, "SELECT COUNT(*) as total FROM participantes LIMIT 1");
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        echo "Teste BD: {$row['total']} participantes<br>";
    }
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "<br>";
}
?>