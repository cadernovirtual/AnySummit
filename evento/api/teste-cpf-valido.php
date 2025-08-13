<?php
// Teste com CPFs válidos para isolar o problema do mobilePhone
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🎯 TESTE COM CPFs VÁLIDOS</h1>";

include("AsaasAPI.php");

try {
    $asaas = new AsaasAPI('production');
    
    // Lista de CPFs válidos para teste (algoritmo de validação correto)
    $cpfsValidos = [
        '11144477735', // CPF válido 1
        '22244477736', // CPF válido 2
        '33344477737', // CPF válido 3
        '44444477738', // CPF válido 4
        '55544477739'  // CPF válido 5
    ];
    
    echo "<h2>1. Testando mobilePhone com CPFs VÁLIDOS</h2>";
    
    $numerosParaTestar = [
        '11999999999', // São Paulo
        '21987654321', // Rio de Janeiro
        '34992024884', // Uberlândia (o do seu log)
        '85988776655', // Ceará
        '47999887766'  // Santa Catarina
    ];
    
    foreach ($numerosParaTestar as $index => $numero) {
        $cpf = $cpfsValidos[$index];
        
        echo "<h3>Testando: {$numero} com CPF {$cpf}</h3>";
        
        try {
            $customerData = [
                'name' => 'TESTE MOBILE ' . $index,
                'cpfCnpj' => $cpf,
                'mobilePhone' => $numero,
                'email' => 'teste' . $index . '@teste.com',
                'postalCode' => '01234567',
                'address' => 'Rua Teste',
                'addressNumber' => '123',
                'province' => 'Centro',
                'city' => 'São Paulo',
                'state' => 'SP'
            ];
            
            // Verificar se já existe
            $existing = $asaas->getCustomerByCpfCnpj($cpf);
            if ($existing) {
                echo "✅ <span style='color: green;'>Cliente já existe: {$existing['id']} (CPF e mobilePhone válidos)</span><br>";
            } else {
                $customer = $asaas->createCustomer($customerData);
                echo "✅ <span style='color: green;'>SUCESSO: {$numero} é válido - Cliente: {$customer['id']}</span><br>";
            }
            
        } catch (Exception $e) {
            echo "❌ <span style='color: red;'>{$numero}: INVÁLIDO - " . $e->getMessage() . "</span><br>";
            
            // Se deu erro de mobilePhone, testar sem ele
            if (strpos($e->getMessage(), 'invalid_mobilePhone') !== false) {
                echo "&nbsp;&nbsp;&nbsp;🔍 Confirmado: problema é o mobilePhone<br>";
            } elseif (strpos($e->getMessage(), 'invalid_object') !== false && strpos($e->getMessage(), 'CPF') !== false) {
                echo "&nbsp;&nbsp;&nbsp;🔍 Problema: CPF ainda inválido<br>";
            } else {
                echo "&nbsp;&nbsp;&nbsp;🔍 Outro problema: " . $e->getMessage() . "<br>";
            }
        }
        
        echo "<br>";
    }
    
    echo "<hr>";
    
    echo "<h2>2. Testando SEM mobilePhone (só CPFs válidos)</h2>";
    
    foreach ($cpfsValidos as $index => $cpf) {
        echo "<h4>Testando CPF: {$cpf}</h4>";
        
        try {
            $customerData = [
                'name' => 'TESTE SEM MOBILE ' . $index,
                'cpfCnpj' => $cpf . '0', // Adicionar dígito para diferenciar
                'email' => 'teste' . $index . 'b@teste.com'
            ];
            
            $customer = $asaas->createCustomer($customerData);
            echo "✅ <span style='color: green;'>CPF {$cpf} válido - Cliente: {$customer['id']}</span><br>";
            
        } catch (Exception $e) {
            echo "❌ <span style='color: red;'>CPF {$cpf}: " . $e->getMessage() . "</span><br>";
        }
    }
    
    echo "<hr>";
    
    echo "<h2>3. Função para gerar CPF válido</h2>";
    echo "<pre>";
    echo 'function gerarCPFValido() {
    $cpf = "";
    for ($i = 0; $i < 9; $i++) {
        $cpf .= rand(0, 9);
    }
    
    // Calcular primeiro dígito verificador
    $soma = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma += intval($cpf[$i]) * (10 - $i);
    }
    $resto = $soma % 11;
    $digito1 = ($resto < 2) ? 0 : 11 - $resto;
    $cpf .= $digito1;
    
    // Calcular segundo dígito verificador
    $soma = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma += intval($cpf[$i]) * (11 - $i);
    }
    $resto = $soma % 11;
    $digito2 = ($resto < 2) ? 0 : 11 - $resto;
    $cpf .= $digito2;
    
    return $cpf;
}';
    echo "</pre>";
    
    echo "<h4>Testando CPF gerado automaticamente:</h4>";
    
    // Gerar um CPF válido
    function gerarCPFValido() {
        $cpf = "";
        for ($i = 0; $i < 9; $i++) {
            $cpf .= rand(0, 9);
        }
        
        // Calcular primeiro dígito verificador
        $soma = 0;
        for ($i = 0; $i < 9; $i++) {
            $soma += intval($cpf[$i]) * (10 - $i);
        }
        $resto = $soma % 11;
        $digito1 = ($resto < 2) ? 0 : 11 - $resto;
        $cpf .= $digito1;
        
        // Calcular segundo dígito verificador
        $soma = 0;
        for ($i = 0; $i < 10; $i++) {
            $soma += intval($cpf[$i]) * (11 - $i);
        }
        $resto = $soma % 11;
        $digito2 = ($resto < 2) ? 0 : 11 - $resto;
        $cpf .= $digito2;
        
        return $cpf;
    }
    
    $cpfGerado = gerarCPFValido();
    echo "CPF gerado: {$cpfGerado}<br>";
    
    try {
        $testData = [
            'name' => 'TESTE CPF GERADO',
            'cpfCnpj' => $cpfGerado,
            'mobilePhone' => '11999999999'
        ];
        
        $customer = $asaas->createCustomer($testData);
        echo "✅ <span style='color: green;'>CPF gerado válido - Cliente: {$customer['id']}</span><br>";
        
    } catch (Exception $e) {
        echo "❌ <span style='color: red;'>CPF gerado: " . $e->getMessage() . "</span><br>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: red; color: white; padding: 20px;'>";
    echo "<h2>ERRO GERAL:</h2>";
    echo $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<p><strong>Data/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
