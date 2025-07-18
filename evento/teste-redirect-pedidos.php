<?php
// Teste de redirecionamento para pedidos não pagos
include("conm/conn.php");

echo "<h3>Teste de Redirecionamento - Pedidos Não Pagos</h3>";

// Buscar pedidos com diferentes status
$sql = "SELECT p.codigo_pedido, p.status_pagamento, p.eventoid, e.slug, e.nome 
        FROM tb_pedidos p 
        LEFT JOIN eventos e ON p.eventoid = e.id 
        ORDER BY p.data_pedido DESC LIMIT 10";

$result = $con->query($sql);

echo "<h4>Teste dos Redirecionamentos:</h4>";
echo "<table border='1' style='border-collapse: collapse; width: 100%; margin-bottom: 20px;'>";
echo "<tr style='background: #f0f0f0;'>";
echo "<th>Código Pedido</th><th>Status</th><th>Evento</th><th>Ação</th><th>Resultado Esperado</th>";
echo "</tr>";

while ($row = $result->fetch_assoc()) {
    $statusColor = '';
    $acao = '';
    $resultado = '';
    
    switch ($row['status_pagamento']) {
        case 'pago':
        case 'aprovado':
            $statusColor = 'green';
            $acao = "Mostrar página de sucesso";
            $resultado = "✅ Acesso liberado";
            break;
        case 'pendente':
            $statusColor = 'orange';
            $acao = "Redirecionar para evento";
            $resultado = "🔄 Redirect para /evento/" . ($row['slug'] ?: 'home');
            break;
        case 'cancelado':
        case 'recusado':
            $statusColor = 'red';
            $acao = "Redirecionar para evento";
            $resultado = "🔄 Redirect para /evento/" . ($row['slug'] ?: 'home');
            break;
        default:
            $statusColor = 'gray';
            $acao = "Redirecionar para evento";
            $resultado = "🔄 Redirect para /evento/" . ($row['slug'] ?: 'home');
    }
    
    echo "<tr>";
    echo "<td style='font-family: monospace;'>" . htmlspecialchars($row['codigo_pedido']) . "</td>";
    echo "<td style='color: $statusColor; font-weight: bold;'>" . htmlspecialchars($row['status_pagamento']) . "</td>";
    echo "<td>" . htmlspecialchars($row['nome'] ?: 'N/A') . "</td>";
    echo "<td>" . $acao . "</td>";
    echo "<td>" . $resultado . "</td>";
    echo "</tr>";
}

echo "</table>";

echo "<h4>Links de Teste:</h4>";
echo "<p>Clique nos links abaixo para testar o comportamento:</p>";

// Reset e buscar novamente para os links
$result = $con->query($sql);
while ($row = $result->fetch_assoc()) {
    $testUrl = "pagamento-sucesso.php?pedido_id=" . urlencode($row['codigo_pedido']);
    $status = $row['status_pagamento'];
    
    if ($status === 'pago' || $status === 'aprovado') {
        echo "<p>✅ <a href='$testUrl' target='_blank'>" . htmlspecialchars($row['codigo_pedido']) . "</a> (Status: $status) - Deve mostrar página de sucesso</p>";
    } else {
        $eventSlug = $row['slug'] ?: 'home';
        echo "<p>🔄 <a href='$testUrl' target='_blank'>" . htmlspecialchars($row['codigo_pedido']) . "</a> (Status: $status) - Deve redirecionar para /evento/$eventSlug</p>";
    }
}

echo "<hr>";
echo "<h4>Como Funciona Agora:</h4>";
echo "<ul>";
echo "<li><strong>Pedido PAGO/APROVADO:</strong> Mostra página de sucesso com funcionalidades de vincular</li>";
echo "<li><strong>Pedido PENDENTE/CANCELADO/OUTROS:</strong> Redireciona para página do evento com ?status=payment_pending</li>";
echo "<li><strong>Sem evento associado:</strong> Redireciona para home (/)</li>";
echo "</ul>";
?>
