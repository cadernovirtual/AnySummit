<?php
// Teste super simples - força campos um por um
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 TESTE CAMPO POR CAMPO</h1>";

include("AsaasAPI.php");

try {
    $asaas = new AsaasAPI('production');
    
    echo "<h2>1. Testando criação de cliente com diferentes combinações</h2>";
    
    // Teste 1: Só com campos obrigatórios + mobilePhone válido
    echo "<h3>TESTE 1: Campos mínimos + mobilePhone</h3>";
    try {
        $customerData1 = [
            'name' => 'TESTE MINIMO',
            'cpfCnpj' => '24971563792',
            'mobilePhone' => '11999999999'
        ];
        
        echo "Dados: <pre>" . print_r($customerData1, true) . "</pre>";
        
        // Tentar criar
        $customer1 = $asaas->createCustomer($customerData1);
        echo "✅ <span style='color: green;'>SUCESSO: " . $customer1['id'] . "</span><br>";
        
    } catch (Exception $e) {
        echo "❌ <span style='color: red;'>ERRO: " . $e->getMessage() . "</span><br>";
    }
    
    echo "<hr>";
    
    // Teste 2: Sem mobilePhone
    echo "<h3>TESTE 2: Sem mobilePhone</h3>";
    try {
        $customerData2 = [
            'name' => 'TESTE SEM MOBILE',
            'cpfCnpj' => '12345678901'
        ];
        
        echo "Dados: <pre>" . print_r($customerData2, true) . "</pre>";
        
        $customer2 = $asaas->createCustomer($customerData2);
        echo "✅ <span style='color: green;'>SUCESSO SEM MOBILE: " . $customer2['id'] . "</span><br>";
        
    } catch (Exception $e) {
        echo "❌ <span style='color: red;'>ERRO SEM MOBILE: " . $e->getMessage() . "</span><br>";
    }
    
    echo "<hr>";
    
    // Teste 3: Só phone, sem mobilePhone
    echo "<h3>TESTE 3: Só phone, sem mobilePhone</h3>";
    try {
        $customerData3 = [
            'name' => 'TESTE SO PHONE',
            'cpfCnpj' => '98765432100',
            'phone' => '11999999999'
        ];
        
        echo "Dados: <pre>" . print_r($customerData3, true) . "</pre>";
        
        $customer3 = $asaas->createCustomer($customerData3);
        echo "✅ <span style='color: green;'>SUCESSO SÓ PHONE: " . $customer3['id'] . "</span><br>";
        
    } catch (Exception $e) {
        echo "❌ <span style='color: red;'>ERRO SÓ PHONE: " . $e->getMessage() . "</span><br>";
    }
    
    echo "<hr>";
    
    // Teste 4: mobilePhone vazio
    echo "<h3>TESTE 4: mobilePhone vazio</h3>";
    try {
        $customerData4 = [
            'name' => 'TESTE MOBILE VAZIO',
            'cpfCnpj' => '11122233344',
            'mobilePhone' => ''
        ];
        
        echo "Dados: <pre>" . print_r($customerData4, true) . "</pre>";
        
        $customer4 = $asaas->createCustomer($customerData4);
        echo "✅ <span style='color: green;'>SUCESSO MOBILE VAZIO: " . $customer4['id'] . "</span><br>";
        
    } catch (Exception $e) {
        echo "❌ <span style='color: red;'>ERRO MOBILE VAZIO: " . $e->getMessage() . "</span><br>";
    }
    
    echo "<hr>";
    
    // Teste 5: Números específicos
    echo "<h3>TESTE 5: Diferentes números de celular</h3>";
    
    $numerosParaTestar = [
        '11999999999', // São Paulo
        '21987654321', // Rio de Janeiro
        '85988776655', // Ceará
        '47999887766', // Santa Catarina
        '11988887777', // São Paulo alternativo
        '34992024884', // Uberlândia (o que estava no erro anterior)
    ];
    
    foreach ($numerosParaTestar as $index => $numero) {
        echo "<h4>Testando: {$numero}</h4>";
        
        try {
            $customerDataTeste = [
                'name' => 'TESTE NUMERO ' . $index,
                'cpfCnpj' => '2497156379' . $index, // CPF único para cada teste
                'mobilePhone' => $numero
            ];
            
            $customerTeste = $asaas->createCustomer($customerDataTeste);
            echo "✅ <span style='color: green;'>{$numero}: VÁLIDO</span><br>";
            
        } catch (Exception $e) {
            echo "❌ <span style='color: red;'>{$numero}: INVÁLIDO - " . $e->getMessage() . "</span><br>";
        }
    }
    
    echo "<hr>";
    
    echo "<h2>2. Verificando logs do error_log</h2>";
    echo "<p>Verifique o arquivo error_log para ver os dados exatos sendo enviados.</p>";
    echo "<p>Caminho: /evento/api/error_log</p>";
    
} catch (Exception $e) {
    echo "<div style='background: red; color: white; padding: 20px;'>";
    echo "<h2>ERRO GERAL:</h2>";
    echo $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
