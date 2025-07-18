<?php
// Exemplo de como consultar ingressos individuais gerados

include("../conm/conn.php");

// Consultar ingressos de um pedido específico
$pedido_id = 20; // Substitua pelo ID do pedido

$sql = "SELECT 
    ii.id,
    ii.codigo_ingresso,
    ii.titulo_ingresso,
    ii.preco_unitario,
    ii.status,
    ii.participante_nome,
    ii.participante_email,
    ii.utilizado,
    ii.data_utilizacao,
    ii.criado_em,
    p.codigo_pedido,
    c.nome as comprador_nome,
    e.titulo as evento_titulo
FROM tb_ingressos_individuais ii
LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
LEFT JOIN compradores c ON ii.compradorid = c.id
LEFT JOIN eventos e ON ii.eventoid = e.id
WHERE ii.pedidoid = $pedido_id
ORDER BY ii.id";

$result = $con->query($sql);

echo "<h2>Ingressos do Pedido #$pedido_id</h2>";

if ($result->num_rows > 0) {
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr>
        <th>Código</th>
        <th>Tipo</th>
        <th>Preço</th>
        <th>Status</th>
        <th>Participante</th>
        <th>Utilizado</th>
        <th>Criado</th>
    </tr>";
    
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row['codigo_ingresso']) . "</td>";
        echo "<td>" . htmlspecialchars($row['titulo_ingresso']) . "</td>";
        echo "<td>R$ " . number_format($row['preco_unitario'], 2, ',', '.') . "</td>";
        echo "<td>" . htmlspecialchars($row['status']) . "</td>";
        echo "<td>" . htmlspecialchars($row['participante_nome'] ?: 'Não vinculado') . "</td>";
        echo "<td>" . ($row['utilizado'] ? 'Sim' : 'Não') . "</td>";
        echo "<td>" . date('d/m/Y H:i', strtotime($row['criado_em'])) . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
} else {
    echo "<p>Nenhum ingresso encontrado para este pedido.</p>";
}
?>
