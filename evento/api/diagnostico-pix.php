<?php
// Diagnóstico completo do sistema PIX + ASAAS
header('Content-Type: application/json');

include("../conm/conn.php");
include("AsaasAPI.php");

try {
    $asaas = new AsaasAPI('production');
    
    // 1. Verificar webhooks configurados
    echo "<h2>1. Webhooks Configurados</h2>";
    try {
        $webhooks = $asaas->getWebhooks();
        echo "<pre>" . json_encode($webhooks, JSON_PRETTY_PRINT) . "</pre>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>Erro ao buscar webhooks: " . $e->getMessage() . "</p>";
    }
    
    // 2. URL do webhook que deveria estar configurada
    echo "<h2>2. URL do Webhook Necessária</h2>";
    echo "<p><strong>https://anysummit.com.br/evento/api/webhook-asaas.php</strong></p>";
    
    // 3. Eventos que devem estar configurados
    echo "<h2>3. Eventos Necessários</h2>";
    $eventos_necessarios = [
        'PAYMENT_CONFIRMED',
        'PAYMENT_RECEIVED',
        'PAYMENT_OVERDUE',
        'PAYMENT_CANCELLED',
        'PAYMENT_REFUNDED'
    ];
    echo "<ul>";
    foreach ($eventos_necessarios as $evento) {
        echo "<li>$evento</li>";
    }
    echo "</ul>";
    
    // 4. Verificar últimos pedidos PIX
    echo "<h2>4. Últimos Pedidos PIX</h2>";
    $sql = "SELECT pedidoid, codigo_pedido, asaas_payment_id, status_pagamento, created_at 
            FROM tb_pedidos 
            WHERE metodo_pagamento = 'pix' 
            ORDER BY created_at DESC 
            LIMIT 5";
    $result = $con->query($sql);
    
    if ($result->num_rows > 0) {
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>Pedido ID</th><th>Código</th><th>ASAAS ID</th><th>Status</th><th>Data</th><th>Status ASAAS</th></tr>";
        
        while ($pedido = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $pedido['pedidoid'] . "</td>";
            echo "<td>" . $pedido['codigo_pedido'] . "</td>";
            echo "<td>" . $pedido['asaas_payment_id'] . "</td>";
            echo "<td>" . $pedido['status_pagamento'] . "</td>";
            echo "<td>" . $pedido['created_at'] . "</td>";
            
            // Verificar status no ASAAS
            if (!empty($pedido['asaas_payment_id'])) {
                try {
                    $payment = $asaas->getPaymentStatus($pedido['asaas_payment_id']);
                    $status_asaas = $payment['status'];
                    $cor = ($status_asaas === 'CONFIRMED' || $status_asaas === 'RECEIVED') ? 'green' : 'red';
                    echo "<td style='color: $cor;'>" . $status_asaas . "</td>";
                } catch (Exception $e) {
                    echo "<td style='color: red;'>Erro: " . $e->getMessage() . "</td>";
                }
            } else {
                echo "<td>-</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>Nenhum pedido PIX encontrado</p>";
    }
    
    // 5. Instruções para configurar webhook
    echo "<h2>5. Como Configurar Webhook no ASAAS</h2>";
    echo "<ol>";
    echo "<li>Acesse o painel do ASAAS</li>";
    echo "<li>Vá em Configurações > Integrações > Webhooks</li>";
    echo "<li>Adicione a URL: <strong>https://anysummit.com.br/evento/api/webhook-asaas.php</strong></li>";
    echo "<li>Selecione os eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_CANCELLED, PAYMENT_REFUNDED</li>";
    echo "<li>Salve a configuração</li>";
    echo "</ol>";
    
    // 6. Teste do webhook
    echo "<h2>6. Teste de Conectividade</h2>";
    $webhook_url = "https://anysummit.com.br/evento/api/webhook-asaas.php";
    $teste_ping = @file_get_contents($webhook_url);
    if ($teste_ping !== false) {
        echo "<p style='color: green;'>✅ URL do webhook está acessível</p>";
    } else {
        echo "<p style='color: red;'>❌ URL do webhook não está acessível</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Erro: " . $e->getMessage() . "</p>";
}
?>