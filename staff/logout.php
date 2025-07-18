<?php
session_start();

// Remove todas as sessões
session_destroy();

// Remove todos os cookies relacionados ao login
$expire = time() - 3600; // 1 hora atrás para garantir a remoção
setcookie('staff_logado', '', $expire, "/");
setcookie('staffid', '', $expire, "/");
setcookie('staff_nome', '', $expire, "/");
setcookie('staff_email', '', $expire, "/");
setcookie('eventoid', '', $expire, "/");

// Redireciona para a página de login
header("Location: index.php");
exit();
?>
