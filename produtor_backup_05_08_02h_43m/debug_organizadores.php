<?php
// Debug do arquivo organizadores.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Início do debug...<br>";

try {
    include("check_login.php");
    echo "check_login.php incluído com sucesso<br>";
} catch (Exception $e) {
    echo "Erro ao incluir check_login.php: " . $e->getMessage() . "<br>";
}

try {
    include("conm/conn.php");
    echo "conn.php incluído com sucesso<br>";
} catch (Exception $e) {
    echo "Erro ao incluir conn.php: " . $e->getMessage() . "<br>";
}

echo "Sessão: ";
var_dump($_SESSION);
echo "<br>";

echo "GET: ";
var_dump($_GET);
echo "<br>";

echo "Debug concluído.<br>";
?>