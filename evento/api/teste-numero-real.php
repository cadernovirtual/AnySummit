<?php
// Teste usando exatamente o número que aparece nos logs
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 TESTE COM NÚMERO REAL DOS LOGS</h1>";

include("AsaasAPI.php");

try {
    $asaas = new AsaasAPI('production');
    
    // Usar exatamente os dados que aparecem nos logs
    $numeroDoLog = '34992024884';
    $cpfDoLog = '16786744869';
    
    echo "<h2>Testando com dados reais dos logs:</h2>";
    echo "mobilePhone: {$numeroDoLog}<br>";
    echo "CPF: {$cpfDoLog}<br>";
    
    // Primeiro, verificar se o cliente já existe
    echo "<h3>1. Verificando se cliente já existe</h3>";
    $existingCustomer = $asaas->getCustomerByCpfCnpj($cpfDoLog);
    
    if ($existingCustomer) {
        echo "✅ Cliente já existe: " . $existingCustomer['id'] . "<br>";
        echo "Nome: " . $existingCustomer['name'] . "<br>";
        if (isset($existingCustomer['mobilePhone'])) {
            echo "mobilePhone atual: " . $existingCustomer['mobilePhone'] . "<br>";
        }
        echo "<hr>";
    } else {
        echo "Cliente não existe, tentando criar...<br>";
        
        // Tentar criar cliente com dados básicos
        echo "<h3>2. Criando cliente</h3>";
        
        $customerData = [
            'name' => 'GUSTAVO CIBIM KALLAJIAN',
            'cpfCnpj' => $cpfDoLog,
            'email' => 'gustavo@cadernovirtual.com.br',
            'mobilePhone' => $numeroDoLog,
            'postalCode' => '74093250',
            'address' => 'Avenida 136',
            'addressNumber' => '123',
            'province' => 'Setor Sul',
            'city' => 'Goiânia',
            'state' => 'GO'
        ];
        
        echo "Dados do cliente:<br>";
        echo "<pre>" . print_r($customerData, true) . "</pre>";
        
        try {
            $customer = $asaas->createCustomer($customerData);
            echo "✅ <span style='color: green;'>Cliente criado com sucesso: " . $customer['id'] . "</span><br>";
        } catch (Exception $e) {
            echo "❌ <span style='color: red;'>Erro ao criar cliente: " . $e->getMessage() . "</span><br>";
            
            // Se deu erro de mobilePhone, testar sem ele
            if (strpos($e->getMessage(), 'invalid_mobilePhone') !== false) {
                echo "<h4>Tentando sem mobilePhone...</h4>";
                unset($customerData['mobilePhone']);
                
                try {
                    $customer = $asaas->createCustomer($customerData);
                    echo "✅ <span style='color: green;'>Cliente criado SEM mobilePhone: " . $customer['id'] . "</span><br>";
                } catch (Exception $e2) {
                    echo "❌ <span style='color: red;'>Erro mesmo sem mobilePhone: " . $e2->getMessage() . "</span><br>";
                }
            }
        }
    }
    
    echo "<hr>";
    
    // Teste de diferentes formatos do mesmo número
    echo "<h2>3. Testando diferentes formatos do número {$numeroDoLog}</h2>";
    
    $formatos = [
        $numeroDoLog,                    // 34992024884
        '0' . $numeroDoLog,             // 034992024884
        '55' . $numeroDoLog,            // 5534992024884
        substr($numeroDoLog, 0, 2) . substr($numeroDoLog, 3), // 34992024884 sem o 9
        '11' . substr($numeroDoLog, 2), // 11992024884 (mudando DDD)
    ];
    
    foreach ($formatos as $index => $formato) {
        echo "<h4>Formato {$index}: {$formato}</h4>";
        
        $cpfTeste = '1234567890' . $index; // CPF único para cada teste
        
        try {
            $testData = [
                'name' => 'TESTE FORMATO ' . $index,
                'cpfCnpj' => $cpfTeste,
                'mobilePhone' => $formato
            ];
            
            $testCustomer = $asaas->createCustomer($testData);
            echo "✅ <span style='color: green;'>Formato válido: {$formato}</span><br>";
            
        } catch (Exception $e) {
            echo "❌ <span style='color: red;'>Formato inválido: {$formato} - " . $e->getMessage() . "</span><br>";
        }
    }
    
    echo "<hr>";
    
    // Verificar se o problema atual é mesmo mobilePhone
    echo "<h2>4. Verificação do erro atual</h2>";
    echo "<p>Pelos logs mais recentes, o erro mudou de <code>invalid_mobilePhone</code> para <code>invalid_creditCard</code>.</p>";
    echo "<p>Isso sugere que:</p>";
    echo "<ul>";
    echo "<li>✅ O problema do mobilePhone foi resolvido</li>";
    echo "<li>❌ Agora o problema é com os dados do cartão</li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<div style='background: red; color: white; padding: 20px;'>";
    echo "<h2>ERRO GERAL:</h2>";
    echo $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
