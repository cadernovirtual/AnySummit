<?php
// Versão de debug para verificar dados disponíveis
include("../conm/conn.php");

$pedido_id = isset($_GET['pedido_id']) ? intval($_GET['pedido_id']) : 20;

echo "<h2>Debug - Dados do Pedido $pedido_id</h2>";

try {
    // Verificar dados do pedido
    $sql_pedido = "SELECT * FROM tb_pedidos WHERE pedidoid = ?";
    $stmt = $con->prepare($sql_pedido);
    $stmt->bind_param("i", $pedido_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo "<h3>✅ Dados do Pedido:</h3>";
        $pedido = $result->fetch_assoc();
        foreach ($pedido as $campo => $valor) {
            echo "<p><strong>$campo:</strong> " . htmlspecialchars($valor) . "</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ Pedido $pedido_id não encontrado</p>";
        exit;
    }
    
    // Verificar ingressos individuais
    $sql_ingressos = "SELECT * FROM tb_ingressos_individuais WHERE pedidoid = ?";
    $stmt2 = $con->prepare($sql_ingressos);
    $stmt2->bind_param("i", $pedido_id);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    
    if ($result2->num_rows > 0) {
        echo "<h3>✅ Ingressos Individuais:</h3>";
        while ($ingresso = $result2->fetch_assoc()) {
            echo "<div style='border: 1px solid #ccc; padding: 10px; margin: 10px 0;'>";
            foreach ($ingresso as $campo => $valor) {
                echo "<p><strong>$campo:</strong> " . htmlspecialchars($valor) . "</p>";
            }
            echo "</div>";
        }
    } else {
        echo "<p style='color: red;'>❌ Nenhum ingresso individual encontrado para o pedido $pedido_id</p>";
    }
    
    // Verificar dados do evento
    if (isset($pedido['eventoid'])) {
        $eventoid = $pedido['eventoid'];
        $sql_evento = "SELECT * FROM eventos WHERE id = ?";
        $stmt3 = $con->prepare($sql_evento);
        $stmt3->bind_param("i", $eventoid);
        $stmt3->execute();
        $result3 = $stmt3->get_result();
        
        if ($result3->num_rows > 0) {
            echo "<h3>✅ Dados do Evento (ID: $eventoid):</h3>";
            $evento = $result3->fetch_assoc();
            foreach ($evento as $campo => $valor) {
                echo "<p><strong>$campo:</strong> " . htmlspecialchars($valor) . "</p>";
            }
        } else {
            echo "<p style='color: orange;'>⚠️ Evento com ID $eventoid não encontrado</p>";
        }
    }
    
    echo "<br><h3>🔧 Teste do PDF:</h3>";
    echo "<p><a href='gerar-ingressos-pdf.php?pedido_id=$pedido_id' target='_blank' style='background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Gerar PDF Novamente</a></p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Erro: " . $e->getMessage() . "</p>";
}
?>
