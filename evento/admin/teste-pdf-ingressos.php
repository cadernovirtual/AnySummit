<?php
// Página de teste para gerar PDF de ingressos
include("../conm/conn.php");

echo "<h2>Teste do Gerador de PDF de Ingressos</h2>";

// Buscar pedidos que têm ingressos individuais
$sql = "SELECT DISTINCT p.pedidoid, p.codigo_pedido, COUNT(ii.id) as total_ingressos
        FROM tb_pedidos p 
        INNER JOIN tb_ingressos_individuais ii ON p.pedidoid = ii.pedidoid
        GROUP BY p.pedidoid, p.codigo_pedido
        ORDER BY p.pedidoid DESC
        LIMIT 10";

$result = $con->query($sql);

if ($result->num_rows > 0) {
    echo "<p>Pedidos com ingressos individuais disponíveis:</p>";
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>ID do Pedido</th><th>Código do Pedido</th><th>Total de Ingressos</th><th>Ação</th></tr>";
    
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['pedidoid'] . "</td>";
        echo "<td>" . htmlspecialchars($row['codigo_pedido']) . "</td>";
        echo "<td>" . $row['total_ingressos'] . "</td>";
        echo "<td>";
        echo "<a href='../api/gerar-ingressos-pdf.php?pedido_id=" . $row['pedidoid'] . "' target='_blank' class='btn' style='background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;'>Gerar PDF</a>";
        echo "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<br><h3>Como Testar:</h3>";
    echo "<ol>";
    echo "<li>Clique em 'Gerar PDF' em qualquer pedido da lista acima</li>";
    echo "<li>Uma nova aba deve abrir com os ingressos formatados</li>";
    echo "<li>O navegador deve automaticamente tentar imprimir a página</li>";
    echo "<li>Você pode salvar como PDF usando Ctrl+P</li>";
    echo "</ol>";
    
} else {
    echo "<p style='color: orange;'>⚠️ Nenhum pedido com ingressos individuais encontrado.</p>";
    echo "<p>Para testar:</p>";
    echo "<ol>";
    echo "<li>Faça um pedido pelo sistema</li>";
    echo "<li>Verifique se os ingressos individuais foram gerados na tabela tb_ingressos_individuais</li>";
    echo "<li>Volte aqui para testar o PDF</li>";
    echo "</ol>";
}

// Verificar se existem ingressos individuais na tabela
$count_ingressos = $con->query("SELECT COUNT(*) as total FROM tb_ingressos_individuais");
$total_ingressos = $count_ingressos->fetch_assoc()['total'];

echo "<br><h3>Status do Sistema:</h3>";
echo "<p>Total de ingressos individuais no banco: <strong>$total_ingressos</strong></p>";

if ($total_ingressos == 0) {
    echo "<p style='color: red;'>❌ Nenhum ingresso individual encontrado. Faça um pedido primeiro!</p>";
} else {
    echo "<p style='color: green;'>✅ Sistema funcionando - há ingressos cadastrados!</p>";
}

// Testar URL de exemplo
if ($total_ingressos > 0) {
    $primeiro_pedido = $con->query("SELECT DISTINCT pedidoid FROM tb_ingressos_individuais ORDER BY id LIMIT 1");
    if ($primeiro_pedido && $primeiro_pedido->num_rows > 0) {
        $pedido_id = $primeiro_pedido->fetch_assoc()['pedidoid'];
        echo "<br><p><strong>Teste Rápido:</strong></p>";
        echo "<p><a href='../api/gerar-ingressos-pdf.php?pedido_id=$pedido_id' target='_blank' style='background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>🎫 Gerar PDF do Primeiro Pedido</a></p>";
    }
}
?>
