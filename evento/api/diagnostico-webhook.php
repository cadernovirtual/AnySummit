<?php
// Script para verificar e configurar webhook no ASAAS
header('Content-Type: text/html; charset=UTF-8');

include("../conm/conn.php");
include("AsaasAPI.php");

echo "<h1>Diagnóstico PIX + Webhook ASAAS</h1>";

try {
    $asaas = new AsaasAPI('production');
    
    echo "<h2>1. Verificando Webhooks Configurados</h2>";
    
    try {
        $webhooks = $asaas->getWebhooks();
        echo "<h3>Webhooks Atuais:</h3>";
        echo "<pre>" . json_encode($webhooks, JSON_PRETTY_PRINT) . "</pre>";
        
        // Verificar se nosso webhook está configurado
        $webhook_url = "https://anysummit.com.br/evento/api/webhook-asaas.php";
        $webhook_existe = false;
        
        if (isset($webhooks['data'])) {
            foreach ($webhooks['data'] as $webhook) {
                if (isset($webhook['url']) && $webhook['url'] === $webhook_url) {
                    $webhook_existe = true;
                    echo "<p style='color: green;'><strong>✅ Webhook encontrado!</strong></p>";
                    echo "<p>Status: " . ($webhook['enabled'] ? 'Ativo' : 'Inativo') . "</p>";
                    echo "<p>Eventos: " . implode(', ', $webhook['events'] ?? []) . "</p>";
                    break;
                }
            }
        }
        
        if (!$webhook_existe) {
            echo "<p style='color: red;'><strong>❌ Webhook NÃO configurado!</strong></p>";
            echo "<p>URL necessária: <strong>$webhook_url</strong></p>";
            
            // Tentar criar o webhook automaticamente
            echo "<h3>Tentando criar webhook automaticamente...</h3>";
            
            $webhook_data = [
                'name' => 'AnySummit Webhook',
                'url' => $webhook_url, // URL SEM token - ASAAS enviará automaticamente
                'email' => 'gustavo@cadernovirtual.com.br',
                'enabled' => true,
                'interrupted' => false,
                'events' => [
                    'PAYMENT_CONFIRMED',
                    'PAYMENT_RECEIVED', 
                    'PAYMENT_OVERDUE',
                    'PAYMENT_CANCELLED',
                    'PAYMENT_REFUNDED'
                ]
            ];
            
            try {
                $new_webhook = $asaas->createWebhook($webhook_data);
                echo "<p style='color: green;'><strong>✅ Webhook criado com sucesso!</strong></p>";
                echo "<pre>" . json_encode($new_webhook, JSON_PRETTY_PRINT) . "</pre>";
            } catch (Exception $e) {
                echo "<p style='color: red;'><strong>❌ Erro ao criar webhook: " . $e->getMessage() . "</strong></p>";
                echo "<p>Você precisa criar manualmente no painel do ASAAS.</p>";
            }
        }
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>Erro ao verificar webhooks: " . $e->getMessage() . "</p>";
    }
    
    echo "<h2>2. Teste de Conectividade do Webhook</h2>";
    
    $webhook_url = "https://anysummit.com.br/evento/api/webhook-asaas.php";
    
    // Teste GET
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 10
        ]
    ]);
    
    $response = @file_get_contents($webhook_url, false, $context);
    
    if ($response !== false) {
        echo "<p style='color: green;'>✅ URL do webhook está acessível</p>";
    } else {
        echo "<p style='color: red;'>❌ URL do webhook NÃO está acessível</p>";
        echo "<p>Verifique se o arquivo webhook-asaas.php existe e está funcionando.</p>";
    }
    
    echo "<h2>3. Últimos Pagamentos PIX</h2>";
    
    $sql = "SELECT p.pedidoid, p.codigo_pedido, p.asaas_payment_id, p.status_pagamento, 
                   p.valor_total, p.created_at, p.updated_at
            FROM tb_pedidos p 
            WHERE p.metodo_pagamento = 'pix' 
            ORDER BY p.created_at DESC 
            LIMIT 10";
    
    $result = $con->query($sql);
    
    if ($result->num_rows > 0) {
        echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
        echo "<tr style='background: #f0f0f0;'>";
        echo "<th>Pedido ID</th><th>Código</th><th>ASAAS ID</th><th>Status Local</th>";
        echo "<th>Valor</th><th>Criado</th><th>Status ASAAS</th><th>Ações</th>";
        echo "</tr>";
        
        while ($pedido = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $pedido['pedidoid'] . "</td>";
            echo "<td>" . $pedido['codigo_pedido'] . "</td>";
            echo "<td>" . $pedido['asaas_payment_id'] . "</td>";
            echo "<td>" . $pedido['status_pagamento'] . "</td>";
            echo "<td>R$ " . number_format($pedido['valor_total'], 2, ',', '.') . "</td>";
            echo "<td>" . date('d/m/Y H:i', strtotime($pedido['created_at'])) . "</td>";
            
            // Verificar status no ASAAS
            if (!empty($pedido['asaas_payment_id'])) {
                try {
                    $payment = $asaas->getPaymentStatus($pedido['asaas_payment_id']);
                    $status_asaas = $payment['status'];
                    
                    $cor = 'red';
                    if ($status_asaas === 'CONFIRMED' || $status_asaas === 'RECEIVED') {
                        $cor = 'green';
                    } elseif ($status_asaas === 'PENDING') {
                        $cor = 'orange';
                    }
                    
                    echo "<td style='color: $cor; font-weight: bold;'>" . $status_asaas . "</td>";
                    
                    // Botão para sincronizar se houver discrepância
                    $status_local = strtoupper($pedido['status_pagamento']);
                    if ($status_asaas !== $status_local && ($status_asaas === 'CONFIRMED' || $status_asaas === 'RECEIVED')) {
                        echo "<td><button onclick=\"sincronizar(" . $pedido['pedidoid'] . ", '" . $pedido['asaas_payment_id'] . "')\">Sincronizar</button></td>";
                    } else {
                        echo "<td>-</td>";
                    }
                    
                } catch (Exception $e) {
                    echo "<td style='color: red;'>Erro</td>";
                    echo "<td>-</td>";
                }
            } else {
                echo "<td>Sem ID ASAAS</td>";
                echo "<td>-</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>Nenhum pagamento PIX encontrado</p>";
    }
    
    echo "<h2>4. Instruções Manuais</h2>";
    echo "<div style='background: #f9f9f9; padding: 15px; border-left: 4px solid #007cba;'>";
    echo "<h3>Se o webhook não foi criado automaticamente:</h3>";
    echo "<ol>";
    echo "<li>Acesse o painel do ASAAS</li>";
    echo "<li>Vá em <strong>Configurações > Integrações > Webhooks</strong></li>";
    echo "<li>Clique em <strong>Novo Webhook</strong></li>";
    echo "<li>Configure:</li>";
    echo "<ul>";
    echo "<li><strong>Nome:</strong> AnySummit Webhook</li>";
    echo "<li><strong>URL:</strong> https://anysummit.com.br/evento/api/webhook-asaas.php (SEM token na URL)</li>";
    echo "<li><strong>Eventos:</strong> PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_CANCELLED, PAYMENT_REFUNDED</li>";
    echo "<li><strong>Status:</strong> Ativo</li>";
    echo "</ul>";
    echo "<li>Salve a configuração</li>";
    echo "</ol>";
    echo "<p><strong>NOTA:</strong> O ASAAS enviará automaticamente o token de segurança no header da requisição.</p>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Erro geral: " . $e->getMessage() . "</p>";
}

?>

<script>
function sincronizar(pedidoId, asaasId) {
    if (confirm('Sincronizar pagamento ' + pedidoId + '?')) {
        fetch('/evento/api/sincronizar-pagamento.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({pedido_id: pedidoId, asaas_id: asaasId})
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) location.reload();
        })
        .catch(error => alert('Erro: ' + error));
    }
}
</script>