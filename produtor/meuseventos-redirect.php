<?php
// Arquivo de redirecionamento para meuseventos.php
// Este arquivo serve como workaround para problemas de interpretação PHP

// Verificar se estamos sendo acessados diretamente
if (basename($_SERVER['PHP_SELF']) === 'meuseventos-redirect.php') {
    // Headers apropriados
    header('Content-Type: text/html; charset=UTF-8');
    
    // Incluir o arquivo real
    include_once(__DIR__ . '/meuseventos.php');
    exit;
}
?>