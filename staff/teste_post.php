<?php
// Simula a mesma requisição que o JavaScript faz

$data = [
    'search' => '091.346.246-27',
    'eventoid' => 19
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://anysummit.com.br/staff/buscar_participante.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Cookie: ' . $_SERVER['HTTP_COOKIE'] // Envia os cookies
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

header('Content-Type: text/plain');
echo "Status HTTP: $http_code\n";
echo "Resposta:\n";
echo $response;
?>
