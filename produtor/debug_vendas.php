<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Teste básico de PHP funcionando<br>";

// Teste de inclusão de arquivos
if (file_exists("check_login.php")) {
    echo "check_login.php existe<br>";
} else {
    echo "check_login.php NÃO existe<br>";
}

if (file_exists("conm/conn.php")) {
    echo "conm/conn.php existe<br>";
} else {
    echo "conm/conn.php NÃO existe<br>";
}

// Teste básico de variáveis
$evento_id = $_GET['eventoid'] ?? 0;
echo "Evento ID recebido: $evento_id<br>";

echo "Script executado sem erros!";
?>