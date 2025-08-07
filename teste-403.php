<?php
echo "Teste de conexão - " . date('Y-m-d H:i:s');
echo "<br>PHP funcionando: " . PHP_VERSION;
echo "<br>Timezone: " . date_default_timezone_get();

// Teste básico de banco
try {
    include("evento/conm/conn.php");
    echo "<br>Conexão BD: " . ($con ? "OK" : "ERRO");
} catch (Exception $e) {
    echo "<br>Erro BD: " . $e->getMessage();
}
?>