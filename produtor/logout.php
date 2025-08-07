<?php
// Iniciar sessão para poder destruí-la
session_start();

// Opcional: Salvar log de logout antes de limpar dados
// Removido log baseado em contratanteid pois não existe mais
if (isset($_SESSION['usuarioid'])) {
    include_once("conm/conn.php");
    $usuario_id = $_SESSION['usuarioid'] ?? 0;
    if (function_exists('salvarLog')) {
        salvarLog($con, "Logout realizado", $usuario_id, "Usuário fez logout do sistema");
    }
}

// Limpar todas as variáveis de sessão
$_SESSION = array();

// Destruir os cookies de sessão se existirem
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time()-42000, '/');
}

// Limpar cookies específicos do sistema AnySummit
$cookies_to_clear = [
    'usuario_logado',
    'usuarioid', 
    'usuario_nome',
    'usuario_email',
    // Removido 'contratanteid' pois não existe mais
    'participante_logado',
    'participanteid',
    'login_token',
    'remember_token'
];

foreach ($cookies_to_clear as $cookie_name) {
    if (isset($_COOKIE[$cookie_name])) {
        // Limpar cookie com diferentes paths para garantir remoção completa
        setcookie($cookie_name, '', time()-3600, '/');
        setcookie($cookie_name, '', time()-3600, '/produtor/');
        setcookie($cookie_name, '', time()-3600, '/', $_SERVER['HTTP_HOST']);
        
        // Remover da superglobal também
        unset($_COOKIE[$cookie_name]);
    }
}

// Destruir a sessão
session_destroy();

// Redirecionar para a página de login dos produtores
header("Location: /produtor/index.php");
exit();
?>

