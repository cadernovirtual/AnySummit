<?php
session_start();

// Remove todas as sessões
session_destroy();

// Remove todos os cookies relacionados ao login
$expire = time() - 3600; // 1 hora atrás para garantir a remoção
setcookie('participante_logado', '', $expire, "/");
setcookie('participanteid', '', $expire, "/");
setcookie('participante_nome', '', $expire, "/");
setcookie('participante_email', '', $expire, "/");
setcookie('eventoid', '', $expire, "/");

// Redireciona para a página de login
header("Location: index.php");
exit();
?>
