<?php
include("AsaasAPI.php");

// Verificar pagamentos recentes
try {
    $asaas = new AsaasAPI('production');
    
    // Fazer requisição usando o método público
    $endpoint = '/payments?limit=10&dateCreated[ge]=' . date('Y-m-d', strtotime('-1 day'));
    
    // Como o método makeRequest é privado, vou fazer a requisição manualmente
    $url = 'https://api.asaas.com/v3' . $endpoint;
    $access_token = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjcyYmVjMTY3LTE1ZjAtNGU4NS04OGVhLTQ3YjYxZmY1ZjAzYjo6JGFhY2hfMTZmYzFlODQtMzYyZi00ZGE3LTgzYzYtZTQxMTFmN2Y1Mzg5';
    
    $headers = [
        'Content-Type: application/json',
        'access_token: ' . $access_token,
        'User-Agent: AsaasAPI-PHP'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception('Erro cURL: ' . $error);
    }
    
    if ($http_code >= 400) {
        throw new Exception('Erro HTTP ' . $http_code . ': ' . $response);
    }
    
    $payments = json_decode($response, true);
    
    echo "<h2>Pagamentos Recentes (últimas 24h)</h2>";
    echo "<p>Status da requisição: HTTP $http_code</p>";
    
    if (!$payments) {
        echo "<p>Erro ao decodificar resposta JSON</p>";
        echo "<pre>" . htmlspecialchars($response) . "</pre>";
        exit;
    }
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #f0f0f0;'>";
    echo "<th style='padding: 8px;'>ID</th>";
    echo "<th style='padding: 8px;'>Valor</th>";
    echo "<th style='padding: 8px;'>Status</th>";
    echo "<th style='padding: 8px;'>Cliente</th>";
    echo "<th style='padding: 8px;'>Data</th>";
    echo "<th style='padding: 8px;'>Referência</th>";
    echo "</tr>";
    
    if (isset($payments['data']) && is_array($payments['data'])) {
        foreach ($payments['data'] as $payment) {
            echo "<tr>";
            echo "<td style='padding: 8px;'>" . htmlspecialchars($payment['id'] ?? 'N/A') . "</td>";
            echo "<td style='padding: 8px;'>R$ " . number_format($payment['value'] ?? 0, 2, ',', '.') . "</td>";
            echo "<td style='padding: 8px;'>" . htmlspecialchars($payment['status'] ?? 'N/A') . "</td>";
            echo "<td style='padding: 8px;'>" . htmlspecialchars($payment['customer'] ?? 'N/A') . "</td>";
            echo "<td style='padding: 8px;'>" . htmlspecialchars($payment['dateCreated'] ?? 'N/A') . "</td>";
            echo "<td style='padding: 8px;'>" . htmlspecialchars($payment['externalReference'] ?? 'N/A') . "</td>";
            echo "</tr>";
        }
    } else {
        echo "<tr><td colspan='6' style='padding: 8px; text-align: center;'>Nenhum pagamento encontrado</td></tr>";
    }
    echo "</table>";
    
    // Mostrar resposta bruta para debug
    echo "<h3>Resposta Completa da API (Debug)</h3>";
    echo "<pre style='background: #f5f5f5; padding: 10px; max-height: 400px; overflow: auto;'>";
    echo htmlspecialchars(json_encode($payments, JSON_PRETTY_PRINT));
    echo "</pre>";
    
} catch (Exception $e) {
    echo "<h2>Erro ao consultar pagamentos</h2>";
    echo "<p style='color: red;'>Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
    
    // Informações adicionais de debug
    echo "<h3>Informações de Debug</h3>";
    echo "<p><strong>URL da API:</strong> " . htmlspecialchars($url ?? 'N/A') . "</p>";
    echo "<p><strong>Data de consulta:</strong> " . date('Y-m-d H:i:s') . "</p>";
}
?>