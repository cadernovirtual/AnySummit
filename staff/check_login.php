<?php
// Arquivo para verificar se o staff está logado
// Inclua este arquivo em páginas que precisam de autenticação

session_start();

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['staff_logado']) && $_COOKIE['staff_logado'] == '1') {
        // Restaura as sessões a partir dos cookies
        $_SESSION['staff_logado'] = true;
        $_SESSION['staffid'] = isset($_COOKIE['staffid']) ? $_COOKIE['staffid'] : '';
        $_SESSION['staff_nome'] = isset($_COOKIE['staff_nome']) ? $_COOKIE['staff_nome'] : '';
        $_SESSION['staff_email'] = isset($_COOKIE['staff_email']) ? $_COOKIE['staff_email'] : '';
        $_SESSION['eventoid'] = isset($_COOKIE['eventoid']) ? $_COOKIE['eventoid'] : '';
        return true;
    }
    return false;
}

// Verifica se está logado via sessão ou cookie
if (!isset($_SESSION['staff_logado']) || $_SESSION['staff_logado'] !== true) {
    // Tenta verificar via cookie
    if (!verificarLoginCookie()) {
        // Não está logado, redireciona para login
        header("Location: /staff/index.php");
        exit();
    }
}

// Função para fazer logout
function logout() {
    // Remove sessões
    session_destroy();
    
    // Remove cookies
    $expire = time() - 3600; // 1 hora atrás
    setcookie('staff_logado', '', $expire, "/");
    setcookie('staffid', '', $expire, "/");
    setcookie('staff_nome', '', $expire, "/");
    setcookie('staff_email', '', $expire, "/");
    setcookie('eventoid', '', $expire, "/");
    
    // Redireciona para login
    header("Location: /staff/index.php");
    exit();
}

// Disponibiliza as informações do staff logado
$staff_id = $_SESSION['staffid'];
$staff_nome = $_SESSION['staff_nome'];
$staff_email = $_SESSION['staff_email'];
$evento_id = $_SESSION['eventoid'];
?>
