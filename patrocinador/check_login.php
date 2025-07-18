<?php
// Arquivo para verificar se o staff está logado
// Inclua este arquivo em páginas que precisam de autenticação

session_start();

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['participante_logado']) && $_COOKIE['participante_logado'] == '1') {
        // Restaura as sessões a partir dos cookies
        $_SESSION['participante_logado'] = true;
        $_SESSION['participanteid'] = isset($_COOKIE['participanteid']) ? $_COOKIE['participanteid'] : '';
        $_SESSION['participante_nome'] = isset($_COOKIE['participante_nome']) ? $_COOKIE['participante_nome'] : '';
        $_SESSION['participante_email'] = isset($_COOKIE['participante_email']) ? $_COOKIE['participante_email'] : '';
        $_SESSION['eventoid'] = isset($_COOKIE['eventoid']) ? $_COOKIE['eventoid'] : '';
        return true;
    }
    return false;
}

// Verifica se está logado via sessão ou cookie
if (!isset($_SESSION['participante_logado']) || $_SESSION['participante_logado'] !== true) {
    // Tenta verificar via cookie
    if (!verificarLoginCookie()) {
        // Não está logado, redireciona para login
        header("Location: /patrocinador/index.php");
        exit();
    }
}

// Função para fazer logout
function logout() {
    // Remove sessões
    session_destroy();
    
    // Remove cookies
    $expire = time() - 3600; // 1 hora atrás
    setcookie('participante_logado', '', $expire, "/");
    setcookie('participanteid', '', $expire, "/");
    setcookie('participante_nome', '', $expire, "/");
    setcookie('participante_email', '', $expire, "/");
    setcookie('eventoid', '', $expire, "/");
    
    // Redireciona para login
    header("Location: /patrocinador/index.php");
    exit();
}

// Disponibiliza as informações do staff logado
$staff_id = $_SESSION['participanteid'];
$staff_nome = $_SESSION['participante_nome'];
$staff_email = $_SESSION['participante_email'];
$evento_id = $_SESSION['eventoid'];
?>
