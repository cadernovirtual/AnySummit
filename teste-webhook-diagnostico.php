<?php
/**
 * Teste direto do webhook N8N para diagnóstico
 */

// Configurar para mostrar erros
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

echo "<h1>Diagnóstico Webhook N8N</h1>";

$webhook_url = 'https://n8n.webtoyou.com.br/webhook/3e669a00-7990-46b4-a6c7-58018270428a';

// Dados de teste
$dados_teste = [
    'teste_direto' => true,
    'timestamp' => date('c'),
    'origem' => 'diagnostico-anysummit',
    'acao' => 'teste_envio_email',
    'ingresso' => [
        'id' => 999999,
        'codigo' => 'TESTE-' . date('YmdHis'),
        'titulo' => 'Ingresso de Teste',
        'preco' => 50.00,
        'status' => 'ativo',
        'hash_validacao' => 'hash_teste_' . uniqid(),
        'link_validacao' => 'https://anysummit.com.br/validar-ingresso.php?h=hash_teste_' . uniqid()
    ],
    'destinatario' => [
        'nome' => 'Teste Diagnóstico',
        'email' => 'gustavo@cadernovirtual.com.br', // Seu email para teste
        'whatsapp' => '',
        'mensagem' => 'Este é um teste do webhook N8N para diagnóstico'
    ],
    'evento' => [
        'id' => 999,
        'nome' => 'Evento de Teste',
        'data_inicio' => date('Y-m-d H:i:s'),
        'local' => 'Local de Teste',
        'endereco' => 'Endereço de Teste'
    ],
    'pedido' => [
        'id' => 999999,
        'codigo' => 'PED_TESTE_' . date('YmdHis')
    ],
    'remetente' => [
        'nome' => 'Sistema AnySummit',
        'email' => 'noreply@anysummit.com.br'
    ]
];

echo "<h2>🔗 URL do Webhook:</h2>";
echo "<code>$webhook_url</code><br><br>";

echo "<h2>📦 Dados sendo enviados:</h2>";
echo "<pre>" . json_encode($dados_teste, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";

echo "<h2>🚀 Enviando requisição...</h2>";

$start_time = microtime(true);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhook_url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados_teste));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'User-Agent: AnySummit-Diagnostico/1.0'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_VERBOSE, false);

// Capturar informações da resposta
$info_antes = curl_getinfo($ch);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
$info_completa = curl_getinfo($ch);

curl_close($ch);

$end_time = microtime(true);
$tempo_resposta = round(($end_time - $start_time) * 1000, 2); // em milissegundos

echo "<h2>📊 Resultado:</h2>";

echo "<div style='background: " . ($http_code == 200 ? '#d4edda' : '#f8d7da') . "; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<strong>Status HTTP:</strong> $http_code<br>";
echo "<strong>Tempo de resposta:</strong> {$tempo_resposta}ms<br>";

if ($curl_error) {
    echo "<strong style='color: red;'>Erro cURL:</strong> $curl_error<br>";
}

echo "<strong>Tamanho da resposta:</strong> " . strlen($response) . " bytes<br>";
echo "</div>";

echo "<h3>📨 Resposta do webhook:</h3>";
if ($response) {
    // Tentar decodificar JSON
    $response_json = json_decode($response, true);
    if ($response_json) {
        echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;'>";
        echo json_encode($response_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        echo "</pre>";
    } else {
        echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 300px; overflow-y: auto;'>";
        echo "<strong>Resposta (texto):</strong><br>";
        echo "<code>" . htmlspecialchars($response) . "</code>";
        echo "</div>";
    }
} else {
    echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px;'>";
    echo "⚠️ Nenhuma resposta recebida do webhook";
    echo "</div>";
}

echo "<h3>🔧 Informações técnicas:</h3>";
echo "<details><summary>Clique para ver detalhes técnicos</summary>";
echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px; font-size: 12px;'>";
foreach ($info_completa as $key => $value) {
    echo sprintf("%-20s: %s\n", $key, is_array($value) ? json_encode($value) : $value);
}
echo "</pre></details>";

echo "<h2>📋 Diagnóstico:</h2>";

if ($http_code == 200) {
    echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px;'>";
    echo "✅ <strong>Webhook N8N está funcionando!</strong><br>";
    echo "O webhook respondeu corretamente. Se os emails não estão chegando, o problema pode estar:<br>";
    echo "• Na configuração do N8N para envio de emails<br>";
    echo "• No provedor de email configurado no N8N<br>";
    echo "• Na caixa de spam do destinatário<br>";
    echo "</div>";
} elseif ($http_code >= 400 && $http_code < 500) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;'>";
    echo "❌ <strong>Erro do cliente (4xx)</strong><br>";
    echo "O webhook rejeitou a requisição. Possíveis causas:<br>";
    echo "• Dados no formato incorreto<br>";
    echo "• Webhook desabilitado ou URL incorreta<br>";
    echo "• Autenticação necessária<br>";
    echo "</div>";
} elseif ($http_code >= 500) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;'>";
    echo "❌ <strong>Erro do servidor (5xx)</strong><br>";
    echo "Problema no servidor N8N. Possíveis causas:<br>";
    echo "• Servidor N8N fora do ar<br>";
    echo "• Erro interno no workflow<br>";
    echo "• Sobrecarga do servidor<br>";
    echo "</div>";
} elseif ($curl_error) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;'>";
    echo "❌ <strong>Erro de conexão</strong><br>";
    echo "Não foi possível conectar ao webhook. Possíveis causas:<br>";
    echo "• Problemas de rede<br>";
    echo "• URL incorreta<br>";
    echo "• Firewall bloqueando<br>";
    echo "• Servidor N8N indisponível<br>";
    echo "</div>";
} else {
    echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px;'>";
    echo "⚠️ <strong>Status indefinido</strong><br>";
    echo "Resposta inesperada do webhook.<br>";
    echo "</div>";
}

echo "<hr>";
echo "<h2>🔄 Próximos passos:</h2>";
echo "<ol>";
echo "<li><strong>Se webhook funcionou:</strong> Verificar configuração de email no N8N</li>";
echo "<li><strong>Se webhook falhou:</strong> Verificar se o backup de email funciona</li>";
echo "<li><strong>Testar função mail() PHP:</strong> <a href='teste-email-diagnostico.php' target='_blank'>Abrir teste de email direto</a></li>";
echo "</ol>";

echo "<small>Teste executado em: " . date('Y-m-d H:i:s') . "</small>";
?>