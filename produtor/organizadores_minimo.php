<?php
include("check_login.php");
include_once('conm/conn.php');

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    header('Location: /produtor/index.php');
    exit;
}

// Usar a variável correta do sistema
$usuario_id = $_SESSION['usuarioid'];

echo "DEBUG: Chegou até aqui. Usuario ID: " . $usuario_id;
?>
