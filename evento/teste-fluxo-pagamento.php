<?php
// Teste de fluxo de pagamento
include("conm/conn.php");

echo "<h3>Teste do Fluxo de Pagamento</h3>";

// Verificar pedidos no banco
$sql = "SELECT codigo_pedido, status_pagamento, valor_total, data_pedido FROM tb_pedidos ORDER BY data_pedido DESC LIMIT 10";
$result = $con->query($sql);

echo "<h4>Últimos 10 pedidos:</h4>";
echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
echo "<tr><th>Código</th><th>Status</th><th>Valor</th><th>Data</th><th>Teste Link</th></tr>";

while ($row = $result->fetch_assoc()) {
    $statusColor = '';
    switch ($row['status_pagamento']) {
        case 'pago':
        case 'aprovado':
            $statusColor = 'green';
            break;
        case 'pendente':
            $statusColor = 'orange';
            break;
        case 'cancelado':
        case 'recusado':
            $statusColor = 'red';
            break;
    }
    
    echo "<tr>";
    echo "<td>" . htmlspecialchars($row['codigo_pedido']) . "</td>";
    echo "<td style='color: $statusColor;'><strong>" . htmlspecialchars($row['status_pagamento']) . "</strong></td>";
    echo "<td>R$ " . number_format($row['valor_total'], 2, ',', '.') . "</td>";
    echo "<td>" . date('d/m/Y H:i', strtotime($row['data_pedido'])) . "</td>";
    echo "<td><a href='pagamento-sucesso.php?pedido_id=" . urlencode($row['codigo_pedido']) . "' target='_blank'>Testar</a></td>";
    echo "</tr>";
}

echo "</table>";

echo "<h4>Teste de Validação:</h4>";
echo "<p>✅ <strong>Pedidos PAGOS/APROVADOS</strong> - Devem mostrar a página normalmente</p>";
echo "<p>⚠️ <strong>Pedidos PENDENTES/OUTROS</strong> - Devem mostrar aviso de desenvolvimento</p>";
echo "<p>❌ <strong>Em produção</strong> - Pedidos não pagos devem ser redirecionados</p>";
?>
