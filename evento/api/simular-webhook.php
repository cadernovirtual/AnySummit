<?php
/**
 * SIMULADOR DE WEBHOOK - TESTE COMPLETO
 * Permite testar o fluxo completo sem comprar ingresso
 */

include("../conm/conn.php");

// Função para gerar hash de acesso
function gerarHashAcesso($codigo_pedido) {
    $chave_secreta = 'AnySummit2025@#$%';
    return hash('sha256', $codigo_pedido . $chave_secreta);
}

echo "<h1>🧪 SIMULADOR DE WEBHOOK - TESTE COMPLETO</h1>";

// Verificar se foi solicitado para simular webhook
if (isset($_POST['simular_webhook'])) {
    $pedido_id = $_POST['pedido_id'];
    
    echo "<div style='background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
    echo "<h3>🔄 SIMULANDO WEBHOOK PARA PEDIDO: $pedido_id</h3>";
    
    // Simular aprovação do pagamento
    $sql_update = "UPDATE tb_pedidos SET status_pagamento = 'aprovado' WHERE codigo_pedido = ?";
    $stmt_update = $con->prepare($sql_update);
    $stmt_update->bind_param("s", $pedido_id);
    
    if ($stmt_update->execute()) {
        echo "<p>✅ Status do pedido alterado para 'aprovado'</p>";
        
        // Gerar hash e link
        $hash = gerarHashAcesso($pedido_id);
        $link_confirmacao = "https://anysummit.com.br/evento/pagamento-sucesso.php?h=" . $hash;
        
        echo "<p>✅ Hash gerado: $hash</p>";
        echo "<p>✅ Link de confirmação criado</p>";
        
        echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<h4>🎯 TESTE AGORA:</h4>";
        echo "<a href='$link_confirmacao' target='_blank' style='background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>";
        echo "🎟️ ABRIR PÁGINA DE CONFIRMAÇÃO";
        echo "</a>";
        echo "<p style='margin-top: 10px; font-size: 14px; color: #6c757d;'>Deve abrir SEM pedir login!</p>";
        echo "</div>";
        
    } else {
        echo "<p>❌ Erro ao atualizar pedido: " . $con->error . "</p>";
    }
    echo "</div>";
}

// Buscar pedidos para teste
$sql_pedidos = "SELECT codigo_pedido, status_pagamento, valor_total, comprador_nome, data_pedido 
                FROM tb_pedidos 
                ORDER BY data_pedido DESC 
                LIMIT 10";
$result_pedidos = $con->query($sql_pedidos);

echo "<div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>📋 PEDIDOS DISPONÍVEIS PARA TESTE:</h3>";

if ($result_pedidos && $result_pedidos->num_rows > 0) {
    echo "<table style='width: 100%; border-collapse: collapse;'>";
    echo "<tr style='background: #e9ecef;'>";
    echo "<th style='padding: 10px; border: 1px solid #ddd;'>Código do Pedido</th>";
    echo "<th style='padding: 10px; border: 1px solid #ddd;'>Status</th>";
    echo "<th style='padding: 10px; border: 1px solid #ddd;'>Valor</th>";
    echo "<th style='padding: 10px; border: 1px solid #ddd;'>Comprador</th>";
    echo "<th style='padding: 10px; border: 1px solid #ddd;'>Ação</th>";
    echo "</tr>";
    
    while ($pedido = $result_pedidos->fetch_assoc()) {
        echo "<tr>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>" . $pedido['codigo_pedido'] . "</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>";
        if ($pedido['status_pagamento'] == 'aprovado') {
            echo "<span style='color: green; font-weight: bold;'>✅ " . $pedido['status_pagamento'] . "</span>";
        } else {
            echo "<span style='color: orange;'>⏳ " . $pedido['status_pagamento'] . "</span>";
        }
        echo "</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>R$ " . number_format($pedido['valor_total'], 2, ',', '.') . "</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($pedido['comprador_nome']) . "</td>";
        echo "<td style='padding: 10px; border: 1px solid #ddd;'>";
        
        if ($pedido['status_pagamento'] == 'aprovado') {
            // Se já aprovado, mostrar link direto
            $hash = gerarHashAcesso($pedido['codigo_pedido']);
            $link = "https://anysummit.com.br/evento/pagamento-sucesso.php?h=" . $hash;
            echo "<a href='$link' target='_blank' style='background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; font-size: 12px;'>🔗 VER CONFIRMAÇÃO</a>";
        } else {
            // Se não aprovado, mostrar botão para simular
            echo "<form method='POST' style='display: inline;'>";
            echo "<input type='hidden' name='pedido_id' value='" . $pedido['codigo_pedido'] . "'>";
            echo "<button type='submit' name='simular_webhook' style='background: #28a745; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;'>⚡ SIMULAR WEBHOOK</button>";
            echo "</form>";
        }
        
        echo "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>Nenhum pedido encontrado. Crie um pedido primeiro através do checkout.</p>";
}
echo "</div>";

// Seção de teste manual
echo "<div style='background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>🔧 TESTE MANUAL:</h3>";
echo "<form method='POST'>";
echo "<p>Se você souber o código de um pedido específico:</p>";
echo "<input type='text' name='pedido_id' placeholder='PED_20250810_123456' style='padding: 8px; width: 300px; margin-right: 10px;'>";
echo "<button type='submit' name='simular_webhook' style='background: #ffc107; color: black; padding: 8px 16px; border: none; border-radius: 3px; cursor: pointer;'>⚡ SIMULAR WEBHOOK</button>";
echo "</form>";
echo "</div>";

// Informações de debug
echo "<div style='background: #f1f3f4; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>🔍 INFORMAÇÕES DE DEBUG:</h3>";
echo "<ul>";
echo "<li><strong>Database:</strong> Conectado ✅</li>";
echo "<li><strong>Função Hash:</strong> Implementada ✅</li>";
echo "<li><strong>URL Base:</strong> https://anysummit.com.br</li>";
echo "<li><strong>Página de Confirmação:</strong> /evento/pagamento-sucesso.php</li>";
echo "</ul>";
echo "</div>";

?>
