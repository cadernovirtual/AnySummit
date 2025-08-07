<?php
// Arquivo: /admin/logout.php
// Logout do sistema admin

require_once 'conm/conn.php';

// Log de logout
if (isset($_SESSION['admin_usuarioid'])) {
    error_log("Admin logout: ID " . $_SESSION['admin_usuarioid'] . " - " . date('Y-m-d H:i:s'));
}

// Fazer logout
logoutAdmin();
?>