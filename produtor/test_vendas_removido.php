<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Teste 1: Início do script<br>";

// Testar includes
include("check_login.php");
echo "Teste 2: check_login.php incluído<br>";

include("conm/conn.php");
echo "Teste 3: conn.php incluído<br>";

// Verificar se foi informado um evento_id
$evento_id = $_GET['eventoid'] ?? 0;
echo "Teste 4: evento_id = $evento_id<br>";

if (!$evento_id) {
    echo "Teste 5: Evento ID não fornecido - redirecionando<br>";
    header("Location: meuseventos.php");
    exit;
}

echo "Teste 6: Evento ID válido - continuando<br>";

// Pegar dados do usuário logado
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

echo "Teste 7: Contratante ID = $contratante_id, Usuario ID = $usuario_id<br>";

echo "Teste 8: Script executou sem erros até aqui!<br>";
?>