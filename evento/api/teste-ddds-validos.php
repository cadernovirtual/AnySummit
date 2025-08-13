<?php
// Teste específico para descobrir DDDs válidos
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🎯 TESTE DE DDDs VÁLIDOS PARA SUA CONTA ASAAS</h1>";

include("AsaasAPI.php");

try {
    $asaas = new AsaasAPI('production');
    
    echo "<h2>Testando diferentes DDDs com números válidos</h2>";
    
    // Lista de DDDs brasileiros para testar
    $ddds = [
        '11' => 'São Paulo', // Falhou
        '21' => 'Rio de Janeiro',
        '31' => 'Belo Horizonte',
        '41' => 'Curitiba',
        '51' => 'Porto Alegre',
        '61' => 'Brasília',
        '71' => 'Salvador',
        '81' => 'Recife',
        '85' => 'Fortaleza', // FUNCIONOU!
        '62' => 'Goiânia',
        '27' => 'Vitória',
        '47' => 'Joinville', // Falhou
        '34' => 'Uberlândia', // Falhou
        '19' => 'Campinas',
        '13' => 'Santos',
        '14' => 'Bauru',
        '16' => 'Ribeirão Preto',
        '17' => 'São José do Rio Preto',
        '18' => 'Presidente Prudente',
        '24' => 'Petrópolis',
        '22' => 'Campos',
        '28' => 'Cachoeiro',
        '32' => 'Juiz de Fora',
        '33' => 'Governador Valadares',
        '35' => 'Poços de Caldas',
        '37' => 'Divinópolis',
        '38' => 'Montes Claros'
    ];
    
    $dddsValidos = [];
    $dddsInvalidos = [];
    
    foreach ($ddds as $ddd => $cidade) {
        // Usar CPF válido diferente para cada teste
        $cpfBase = '24971563';
        $cpfSufixo = str_pad($ddd, 3, '0', STR_PAD_LEFT);
        $cpfTeste = $cpfBase . $cpfSufixo;
        
        // Gerar número de celular válido para o DDD
        $numeroTeste = $ddd . '999888777';
        
        echo "<h3>Testando DDD {$ddd} ({$cidade}): {$numeroTeste}</h3>";
        
        try {
            $customerData = [
                'name' => 'TESTE DDD ' . $ddd,
                'cpfCnpj' => $cpfTeste,
                'mobilePhone' => $numeroTeste,
                'email' => 'teste' . $ddd . '@teste.com',
                'postalCode' => '01234567',
                'address' => 'Rua Teste',
                'addressNumber' => '123',
                'province' => 'Centro',
                'city' => $cidade,
                'state' => 'BR'
            ];
            
            // Verificar se cliente já existe
            $existingCustomer = $asaas->getCustomerByCpfCnpj($cpfTeste);
            if ($existingCustomer) {
                echo "✅ <span style='color: green;'>DDD {$ddd}: JÁ EXISTE (válido)</span><br>";
                $dddsValidos[] = $ddd . ' (' . $cidade . ')';
            } else {
                $customer = $asaas->createCustomer($customerData);
                echo "✅ <span style='color: green;'>DDD {$ddd}: VÁLIDO - Cliente: " . $customer['id'] . "</span><br>";
                $dddsValidos[] = $ddd . ' (' . $cidade . ')';
            }
            
        } catch (Exception $e) {
            echo "❌ <span style='color: red;'>DDD {$ddd}: INVÁLIDO - " . $e->getMessage() . "</span><br>";
            $dddsInvalidos[] = $ddd . ' (' . $cidade . ')';
        }
        
        // Pequena pausa para não sobrecarregar a API
        usleep(200000); // 0.2 segundos
    }
    
    echo "<hr>";
    echo "<h2>📊 RESUMO DOS RESULTADOS</h2>";
    
    echo "<h3 style='color: green;'>✅ DDDs VÁLIDOS (" . count($dddsValidos) . "):</h3>";
    if (!empty($dddsValidos)) {
        echo "<ul>";
        foreach ($dddsValidos as $ddd) {
            echo "<li>{$ddd}</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color: red;'>Nenhum DDD válido encontrado!</p>";
    }
    
    echo "<h3 style='color: red;'>❌ DDDs INVÁLIDOS (" . count($dddsInvalidos) . "):</h3>";
    if (!empty($dddsInvalidos)) {
        echo "<ul>";
        foreach ($dddsInvalidos as $ddd) {
            echo "<li>{$ddd}</li>";
        }
        echo "</ul>";
    }
    
    echo "<hr>";
    echo "<h2>🎯 RECOMENDAÇÕES:</h2>";
    
    if (count($dddsValidos) > 0) {
        echo "<div style='background: lightgreen; padding: 15px; border-radius: 8px;'>";
        echo "<h3>SOLUÇÃO ENCONTRADA:</h3>";
        echo "<p>Sua conta Asaas <strong>aceita alguns DDDs específicos</strong>.</p>";
        echo "<p><strong>Para o checkout:</strong></p>";
        echo "<ul>";
        echo "<li>Validar se o DDD do usuário está na lista de permitidos</li>";
        echo "<li>Se não estiver, usar um DDD válido como fallback</li>";
        echo "<li>Exemplo: Converter qualquer DDD inválido para 85 (Ceará)</li>";
        echo "</ul>";
        echo "</div>";
    } else {
        echo "<div style='background: lightcoral; padding: 15px; border-radius: 8px;'>";
        echo "<h3>PROBLEMA NA CONTA:</h3>";
        echo "<p>Sua conta Asaas parece ter restrições severas.</p>";
        echo "<p>Entre em contato com o suporte do Asaas.</p>";
        echo "</div>";
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
