<?php
session_start();

// Simular dados de sessão para teste
if (!isset($_SESSION['usuarioid'])) {
    $_SESSION['usuarioid'] = 1; // Coloque um ID de usuário válido aqui
}

// Fazer a requisição para a API
$postdata = http_build_query(['action' => 'verificar_rascunho']);

$opts = array('http' =>
    array(
        'method'  => 'POST',
        'header'  => 'Content-Type: application/x-www-form-urlencoded',
        'content' => $postdata
    )
);

$context = stream_context_create($opts);
$url = 'https://www.anysummit.com.br/produtor/ajax/wizard_evento.php';

echo "<h1>Teste da API verificar_rascunho</h1>";
echo "<p><strong>URL:</strong> $url</p>";
echo "<p><strong>POST data:</strong> $postdata</p>";
echo "<hr>";

$result = file_get_contents($url, false, $context);

echo "<h2>Resposta Raw:</h2>";
echo "<pre>" . htmlspecialchars($result) . "</pre>";

echo "<h2>Análise:</h2>";
echo "<p><strong>Tamanho da resposta:</strong> " . strlen($result) . " caracteres</p>";

// Tentar decodificar JSON
$json = json_decode($result, true);
if ($json === null) {
    echo "<p><strong>❌ Erro JSON:</strong> " . json_last_error_msg() . "</p>";
    
    // Mostrar os primeiros 200 caracteres
    echo "<p><strong>Primeiros 200 caracteres:</strong></p>";
    echo "<pre>" . htmlspecialchars(substr($result, 0, 200)) . "</pre>";
    
    // Procurar por caracteres não-JSON
    $first_brace = strpos($result, '{');
    if ($first_brace > 0) {
        echo "<p><strong>❌ Há " . $first_brace . " caracteres antes do JSON:</strong></p>";
        echo "<pre>" . htmlspecialchars(substr($result, 0, $first_brace)) . "</pre>";
    }
} else {
    echo "<p><strong>✅ JSON válido:</strong></p>";
    echo "<pre>" . json_encode($json, JSON_PRETTY_PRINT) . "</pre>";
}
?>
