<?php
// Teste direto da API de vinculação
header('Content-Type: text/html; charset=utf-8');

// Dados de teste
$dados_teste = [
    'ingresso_id' => 9, // ID do ingresso ativo que encontramos
    'participante_nome' => 'João Teste',
    'participante_email' => 'joao@teste.com',
    'participante_documento' => '123.456.789-00',
    'participante_celular' => '(11) 99999-9999'
];

echo "<h3>Teste da API de Vinculação</h3>";
echo "<p><strong>Dados de teste:</strong></p>";
echo "<pre>" . json_encode($dados_teste, JSON_PRETTY_PRINT) . "</pre>";

// Fazer requisição para a API
$url = 'http://localhost/evento/api/vincular-participante.php';
$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($dados_teste)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "<p><strong>Resposta da API:</strong></p>";
echo "<pre>" . $result . "</pre>";

if ($result) {
    $response = json_decode($result, true);
    if ($response && isset($response['success'])) {
        if ($response['success']) {
            echo "<p style='color: green;'><strong>✅ SUCESSO!</strong></p>";
        } else {
            echo "<p style='color: red;'><strong>❌ ERRO: " . $response['message'] . "</strong></p>";
        }
    }
}
?>
