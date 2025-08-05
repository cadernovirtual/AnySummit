<?php
// Arquivo para verificar se o staff está logado
// Inclua este arquivo em páginas que precisam de autenticação

session_start();

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['usuario_logado']) && $_COOKIE['usuario_logado'] == '1') {
        // Restaura as sessões a partir dos cookies
        $_SESSION['usuario_logado'] = true;
        $_SESSION['usuarioid'] = isset($_COOKIE['usuarioid']) ? $_COOKIE['usuarioid'] : '';
        $_SESSION['usuario_nome'] = isset($_COOKIE['usuario_nome']) ? $_COOKIE['usuario_nome'] : '';
        $_SESSION['usuario_email'] = isset($_COOKIE['usuario_email']) ? $_COOKIE['usuario_email'] : '';
        $_SESSION['contratanteid'] = isset($_COOKIE['contratanteid']) ? $_COOKIE['contratanteid'] : '';
        return true;
    }
    return false;
}

// Verifica se está logado via sessão ou cookie
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    // Tenta verificar via cookie
    if (!verificarLoginCookie()) {
        // Não está logado, redireciona para login
        header("Location: /produtor/index.php");
        exit();
    }
}

// Função para fazer logout
function logout() {
    // Remove sessões
    session_destroy();
    
    // Remove cookies
    $expire = time() - 3600; // 1 hora atrás
    setcookie('usuario_logado', '', $expire, "/");
    setcookie('usuarioid', '', $expire, "/");
    setcookie('usuario_nome', '', $expire, "/");
    setcookie('usuario_email', '', $expire, "/");
    setcookie('contratanteid', '', $expire, "/");
    
    // Redireciona para login
    header("Location: /produtor/index.php");
    exit();
}

// Disponibiliza as informações do staff logado
$usuarioid = $_SESSION['usuarioid'];
$participante_nome = $_SESSION['participante_nome'] ?? '';
$participante_email = $_SESSION['participante_email'] ?? '';
$eventoid = $_SESSION['eventoid'] ?? null;
?>
