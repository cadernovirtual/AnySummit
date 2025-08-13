<?php
// Debug específico do campo mobilePhone
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 DEBUG ESPECÍFICO - Campo mobilePhone</h1>";

// Dados de teste exatamente como vêm do checkout
$compradorData = [
    'whatsapp' => '(11) 99999-9999', // Como vem do frontend
];

echo "<h2>1. Testando diferentes formatos de WhatsApp:</h2>";

$formatos = [
    '(11) 99999-9999',
    '11999999999',
    '1199999999',
    '(34) 99999-9999',
    '34992024884',
    '34 99202-4884',
    '+55 11 99999-9999',
    '011999999999',
    '5511999999999'
];

foreach ($formatos as $formato) {
    echo "<h3>Testando: '{$formato}'</h3>";
    
    // Aplicar a mesma lógica do pagamento-cartao.php
    $mobilePhone = preg_replace('/[^0-9]/', '', $formato);
    echo "Após limpeza: '{$mobilePhone}' (tamanho: " . strlen($mobilePhone) . ")<br>";
    
    if (strlen($mobilePhone) === 10) {
        // Adicionar 9 para celulares antigos: 1199999999 -> 11999999999
        $mobilePhone = substr($mobilePhone, 0, 2) . '9' . substr($mobilePhone, 2);
        echo "Após correção 10->11: '{$mobilePhone}' (tamanho: " . strlen($mobilePhone) . ")<br>";
    }
    
    if (strlen($mobilePhone) === 13 && substr($mobilePhone, 0, 2) === '55') {
        // Remover código do país: 5511999999999 -> 11999999999
        $mobilePhone = substr($mobilePhone, 2);
        echo "Após remoção país: '{$mobilePhone}' (tamanho: " . strlen($mobilePhone) . ")<br>";
    }
    
    if (strlen($mobilePhone) === 12 && substr($mobilePhone, 0, 1) === '0') {
        // Remover zero inicial: 011999999999 -> 11999999999
        $mobilePhone = substr($mobilePhone, 1);
        echo "Após remoção zero: '{$mobilePhone}' (tamanho: " . strlen($mobilePhone) . ")<br>";
    }
    
    // Validação final
    if (strlen($mobilePhone) === 11 && substr($mobilePhone, 2, 1) === '9') {
        echo "✅ <span style='color: green; font-weight: bold;'>VÁLIDO: '{$mobilePhone}'</span><br>";
        $resultado = $mobilePhone;
    } else {
        echo "❌ <span style='color: red; font-weight: bold;'>INVÁLIDO: '{$mobilePhone}' - usando padrão</span><br>";
        $resultado = '11999999999';
    }
    
    echo "🎯 <strong>Resultado final: '{$resultado}'</strong><br>";
    echo "<hr>";
}

echo "<h2>2. Testando criação de cliente com diferentes números:</h2>";

include("AsaasAPI.php");

$asaas = new AsaasAPI('production');

$numerosParaTestar = [
    '11999999999', // Padrão São Paulo
    '21999999999', // Rio de Janeiro
    '34999999999', // Uberlândia
    '11988888888', // São Paulo alternativo
    '85999999999', // Ceará
    '47999999999', // Santa Catarina
];

foreach ($numerosParaTestar as $numero) {
    echo "<h3>Testando número: {$numero}</h3>";
    
    try {
        // Criar cliente de teste com esse número
        $customerData = [
            'name' => 'TESTE MOBILE ' . substr($numero, 0, 2),
            'cpfCnpj' => '24971563792', // CPF válido de teste
            'email' => 'teste' . substr($numero, 0, 2) . '@teste.com',
            'phone' => '',
            'mobilePhone' => $numero,
            'postalCode' => '01234567',
            'address' => 'Rua Teste',
            'addressNumber' => '123',
            'complement' => '',
            'province' => 'Centro',
            'city' => 'São Paulo',
            'state' => 'SP'
        ];
        
        echo "Dados do cliente:<br>";
        echo "<pre>" . print_r($customerData, true) . "</pre>";
        
        // Primeiro verificar se já existe
        $existingCustomer = $asaas->getCustomerByCpfCnpj($customerData['cpfCnpj']);
        if ($existingCustomer) {
            echo "✅ <span style='color: green;'>Cliente já existe: " . $existingCustomer['id'] . "</span><br>";
        } else {
            $customer = $asaas->createCustomer($customerData);
            echo "✅ <span style='color: green;'>Cliente criado: " . $customer['id'] . "</span><br>";
        }
        
    } catch (Exception $e) {
        echo "❌ <span style='color: red;'>ERRO: " . $e->getMessage() . "</span><br>";
        
        // Verificar se é erro específico de mobilePhone
        if (strpos($e->getMessage(), 'invalid_mobilePhone') !== false) {
            echo "🎯 <strong>CONFIRMADO: Número '{$numero}' é inválido para o Asaas</strong><br>";
        }
    }
    
    echo "<hr>";
}

echo "<h2>3. Padrões válidos conhecidos do Asaas:</h2>";
echo "<div style='background: #f0f8ff; padding: 15px; border-left: 4px solid #007cba;'>";
echo "<h3>Formato obrigatório do Asaas para mobilePhone:</h3>";
echo "<ul>";
echo "<li>✅ Exatamente 11 dígitos</li>";
echo "<li>✅ Formato: [DDD][9][8 dígitos]</li>";
echo "<li>✅ Exemplo: 11999999999 (São Paulo)</li>";
echo "<li>✅ Exemplo: 21987654321 (Rio de Janeiro)</li>";
echo "<li>❌ Não pode: 1199999999 (10 dígitos)</li>";
echo "<li>❌ Não pode: 11899999999 (sem o 9 na 3ª posição)</li>";
echo "<li>❌ Não pode: ter formatação ((11) 99999-9999)</li>";
echo "</ul>";
echo "</div>";

echo "<h2>4. Função de validação melhorada:</h2>";
echo "<pre>";
echo 'function validarMobilePhone($whatsapp) {
    // Limpar tudo que não é número
    $numero = preg_replace("/[^0-9]/", "", $whatsapp);
    
    // Remover código do país se presente (55)
    if (strlen($numero) === 13 && substr($numero, 0, 2) === "55") {
        $numero = substr($numero, 2);
    }
    
    // Remover zero inicial se presente (0XX)
    if (strlen($numero) === 12 && substr($numero, 0, 1) === "0") {
        $numero = substr($numero, 1);
    }
    
    // Se tem 10 dígitos, adicionar 9 na 3ª posição
    if (strlen($numero) === 10) {
        $numero = substr($numero, 0, 2) . "9" . substr($numero, 2);
    }
    
    // Validar formato final
    if (strlen($numero) === 11 && substr($numero, 2, 1) === "9") {
        return $numero;
    }
    
    // Se não conseguiu validar, retornar número padrão
    return "11999999999";
}';
echo "</pre>";

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
