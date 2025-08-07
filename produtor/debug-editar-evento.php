<?php
// Arquivo de teste mínimo para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "1. Iniciando teste<br>";

// Teste de include
echo "2. Carregando check_login.php<br>";
include("check_login.php");
echo "3. check_login.php carregado<br>";

echo "4. Carregando conn.php<br>";  
include("conm/conn.php");
echo "5. conn.php carregado<br>";

// Teste de variáveis
echo "6. Testando GET: ";
print_r($_GET);
echo "<br>";

echo "7. Testando COOKIE: ";
print_r($_COOKIE);
echo "<br>";

$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;
echo "8. evento_id: $evento_id<br>";

$usuario_id = $_COOKIE['usuarioid'] ?? 0;  
echo "9. usuario_id: $usuario_id<br>";

echo "10. Testando conexão: ";
if (isset($con) && $con) {
    echo "✅ Conexão OK<br>";
} else {
    echo "❌ Conexão falhou<br>";
}

echo "11. Teste concluído - se chegou até aqui, PHP básico funciona<br>";
?>
