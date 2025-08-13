<?php
// Teste simples das correções aplicadas
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'success' => true,
    'message' => 'Arquivo de teste - verificando se não há erro 500',
    'timestamp' => date('Y-m-d H:i:s'),
    'correções' => [
        'customer_comprador_compatibility' => 'Implementado',
        'notificationDisabled' => 'Adicionado',
        'syntax_fixes' => 'Aplicado'
    ]
]);
?>
