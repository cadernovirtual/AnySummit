<?php
// Teste simples para verificar se as funções estão funcionando
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testando funções...\n";

// Incluir o arquivo principal para testar as funções
include_once('pagamento-cartao.php');

// Não executar o código principal, apenas testar as funções
exit;
?>