<?php
/**
 * SIMULADOR DE WEBHOOK + TESTE HASH - SEM COMPRAR INGRESSO
 */

include("conm/conn.php");

function gerarHashAcesso($codigo_pedido) {
    $chave_secreta = 'AnySummit2025@#$%';
    return hash('sha256', $codigo_pedido . $chave_secreta);
}

echo "<h1>🧪 SIMULADOR DE WEBHOOK - Teste Sem Comprar</h1>";

// SIMULADOR DE WEBHOOK
if (isset($_POST['simular_webhook'])) {
    $pedido_id_teste = $_POST['pedido_id'];
    
    echo "<div style='background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
    echo "<h3>🔄 SIMULANDO WEBHOOK...</h3>";
    
    // Atualizar status do pedido para aprovado
    $sql_update = "UPDATE tb_pedidos SET status_pagamento = 'aprovado' WHERE pedidoid = ?";
    $stmt_update = $con->prepare($sql_update);
    $stmt_update->bind_param("i", $pedido_id_teste);
    
    if ($stmt_update->execute()) {
        echo "<p>✅ Status do pedido atualizado para 'aprovado'</p>";
        
        // Buscar dados do pedido atualizado
        $sql_pedido = "SELECT * FROM tb_pedidos WHERE pedidoid = ?";
        $stmt_pedido = $con->prepare($sql_pedido);
        $stmt_pedido->bind_param("i", $pedido_id_teste);
        $stmt_pedido->execute();
        $result_pedido = $stmt_pedido->get_result();
        $pedido = $result_pedido->fetch_assoc();
        
        $hash = gerarHashAcesso($pedido['codigo_pedido']);
        $link_teste = "https://anysummit.com.br/evento/pagamento-sucesso.php?h=" . $hash;
        
        echo "<p>✅ Hash gerado: $hash</p>";
        echo "<br><a href='$link_teste' target='_blank' style='background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;'>🎟️ ABRIR PÁGINA DE CONFIRMAÇÃO</a>";
        
        echo "<br><br><div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>Link completo:</strong><br>";
        echo "<code>$link_teste</code>";
        echo "</div>";
        
    } else {
        echo "<p>❌ Erro ao atualizar status: " . $con->error . "</p>";
    }
    echo "</div>";
}

// Buscar pedidos existentes
$sql_pedidos = "SELECT pedidoid, codigo_pedido, status_pagamento, comprador_nome, valor_total 
                FROM tb_pedidos 
                ORDER BY created_at DESC 
                LIMIT 10";
$result_pedidos = $con->query($sql_pedidos);

echo "<div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>📋 ESCOLHA UM PEDIDO PARA SIMULAR CONFIRMAÇÃO:</h3>";

if ($result_pedidos && $result_pedidos->num_rows > 0) {
    echo "<form method='post'>";
    echo "<table style='width: 100%; border-collapse: collapse;'>";
    echo "<thead>";
    echo "<tr style='background: #e9ecef;'>";
    echo "<th style='padding: 10px; border: 1px solid #dee2e6;'>Selecionar</th>";
    echo "<th style='padding: 10px; border: 1px solid #dee2e6;'>Código</th>";
    echo "<th style='padding: 10px; border: 1px solid #dee2e6;'>Comprador</th>";
    echo "<th style='padding: 10px; border: 1px solid #dee2e6;'>Status</th>";
    echo "</tr>";
    echo "</thead>";
    echo "<tbody>";
    
    while ($pedido = $result_pedidos->fetch_assoc()) {
        $cor_status = $pedido['status_pagamento'] === 'aprovado' ? '#28a745' : '#ffc107';
        echo "<tr>";
        echo "<td style='padding: 10px; border: 1px solid #dee2e6; text-align: center;'>";
        echo "<input type='radio' name='pedido_id' value='" . $pedido['pedidoid'] . "' required>";
        echo "</td>";
        echo "<td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($pedido['codigo_pedido']) . "</td>";
        echo "<td style='padding: 10px; border: 1px solid #dee2e6;'>" . htmlspecialchars($pedido['comprador_nome']) . "</td>";
        echo "<td style='padding: 10px; border: 1px solid #dee2e6; color: $cor_status; font-weight: bold;'>" . $pedido['status_pagamento'] . "</td>";
        echo "</tr>";
    }
    
    echo "</tbody>";
    echo "</table>";
    echo "<br>";
    echo "<button type='submit' name='simular_webhook' value='1' style='background: #dc3545; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; font-weight: bold;'>🚀 SIMULAR CONFIRMAÇÃO DE PAGAMENTO</button>";
    echo "</form>";
} else {
    echo "<p>❌ Nenhum pedido encontrado. Crie um pedido primeiro através do checkout.</p>";
}
echo "</div>";

// TESTE DIRETO COM CÓDIGO
echo "<div style='background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>🔗 TESTE DIRETO COM CÓDIGO DE PEDIDO:</h3>";
echo "<form method='get' action='pagamento-sucesso.php' target='_blank'>";
echo "<input type='text' name='codigo_pedido' placeholder='Digite código do pedido (PED_...)' style='width: 400px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;'>";
echo "<button type='submit' style='background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-left: 10px;'>🎯 TESTAR ACESSO DIRETO</button>";
echo "</form>";
echo "<p><small>💡 Este método usa o fallback que aceita codigo_pedido diretamente</small></p>";
echo "</div>";

// TESTE MANUAL DE HASH
echo "<div style='background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>🔧 TESTE MANUAL DE GERAÇÃO DE HASH:</h3>";

if (isset($_GET['test_codigo'])) {
    $codigo_teste = $_GET['test_codigo'];
    $hash_teste = gerarHashAcesso($codigo_teste);
    $link_manual = "https://anysummit.com.br/evento/pagamento-sucesso.php?h=" . $hash_teste;
    
    echo "<p><strong>Código:</strong> $codigo_teste</p>";
    echo "<p><strong>Hash Gerado:</strong> $hash_teste</p>";
    echo "<p><strong>Link de Teste:</strong></p>";
    echo "<a href='$link_manual' target='_blank' style='background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>🔗 TESTAR LINK COM HASH</a>";
}

echo "<form method='get'>";
echo "<input type='text' name='test_codigo' placeholder='Digite qualquer código para gerar hash' style='width: 300px; padding: 8px; border: 1px solid #ccc; border-radius: 5px;'>";
echo "<button type='submit' style='background: #6c757d; color: white; padding: 8px 15px; border: none; border-radius: 5px; margin-left: 10px;'>Gerar Hash</button>";
echo "</form>";
echo "</div>";

echo "<div style='background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>📝 COMO TESTAR SEM COMPRAR INGRESSO:</h3>";
echo "<ol>";
echo "<li><strong>Método 1 (Webhook):</strong> Escolha um pedido na tabela e clique 'Simular Confirmação'</li>";
echo "<li><strong>Método 2 (Direto):</strong> Digite um código de pedido existente no campo acima</li>";
echo "<li><strong>Método 3 (Hash):</strong> Gere hash manualmente e teste o link</li>";
echo "<li><strong>Verificar:</strong> A página deve abrir SEM pedir login</li>";
echo "<li><strong>Confirmar:</strong> Deve mostrar detalhes do pedido e permitir vincular participantes</li>";
echo "</ol>";
echo "</div>";

echo "<div style='background: #f1f3f4; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>🔍 LINKS ÚTEIS PARA TESTE:</h3>";
echo "<ul>";
echo "<li><a href='api/gerar-hash-acesso.php' target='_blank'>🔧 API de Geração de Hash</a></li>";
echo "<li><a href='../validar-ingresso.php' target='_blank'>🎫 Sistema de Validação de Ingressos (referência)</a></li>";
echo "<li><a href='checkout.php' target='_blank'>🛒 Checkout para Criar Novo Pedido</a></li>";
echo "</ul>";
echo "</div>";

?>

<script>
// Auto-refresh da página a cada 30 segundos se não houver seleção
setTimeout(function() {
    const radioSelecionado = document.querySelector('input[type="radio"]:checked');
    if (!radioSelecionado) {
        location.reload();
    }
}, 30000);
</script>
