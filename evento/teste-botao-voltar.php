<?php
// Teste do botão voltar
include("conm/conn.php");

$pedido_id = 'PED_20250702_6864a82e402dd'; // ID de teste

echo "<h3>Teste do Botão Voltar</h3>";

// Simular a lógica da página
$sql_pedido = "SELECT eventoid FROM tb_pedidos WHERE codigo_pedido = ? LIMIT 1";
$stmt_pedido = $con->prepare($sql_pedido);
$stmt_pedido->bind_param("s", $pedido_id);
$stmt_pedido->execute();
$result_pedido = $stmt_pedido->get_result();

if ($result_pedido->num_rows > 0) {
    $pedido_data = $result_pedido->fetch_assoc();
    echo "<p><strong>Evento ID do pedido:</strong> " . $pedido_data['eventoid'] . "</p>";
    
    // Buscar slug do evento
    if ($pedido_data['eventoid']) {
        $sql_evento = "SELECT slug FROM eventos WHERE id = ? LIMIT 1";
        $stmt_evento = $con->prepare($sql_evento);
        $stmt_evento->bind_param("i", $pedido_data['eventoid']);
        $stmt_evento->execute();
        $result_evento = $stmt_evento->get_result();
        
        if ($result_evento->num_rows > 0) {
            $evento_data = $result_evento->fetch_assoc();
            echo "<p><strong>Slug do evento:</strong> " . $evento_data['slug'] . "</p>";
            
            $url_voltar = '/evento/' . $evento_data['slug'];
            echo "<p><strong>URL que seria gerada:</strong> $url_voltar</p>";
            echo "<p><strong>URL completa:</strong> https://anysummit.com.br$url_voltar</p>";
        } else {
            echo "<p>Evento não encontrado!</p>";
        }
    }
} else {
    echo "<p>Pedido não encontrado!</p>";
}
?>
