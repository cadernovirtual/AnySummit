<?php
// Arquivo para simular sessão de usuário logado
session_start();
$_SESSION['usuario_id'] = 1;
$_SESSION['contratante_id'] = 1;

// Redirecionar para página de teste
header('Location: teste-criar-evento.html');
exit();
?>