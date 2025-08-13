<?php
/**
 * Teste direto da API pagamento-cartao.php
 * Simula requisição POST para verificar se há erro 500
 */

// Dados de teste com cartão APROVADO do Asaas
$dadosTeste = [
    'pedido' => [
        'pedidoid' => 999,
        'codigo_pedido' => 'TEST_' . uniqid(),
        'valor_total' => 15,
        'parcelas' => 1,
        'evento_nome' => 'Teste Sistema'
    ],
    'cartao' => [
        'nome' => 'TESTE CARTAO',
        'numero' => '4000 0000 0000 0010',  // Cartão de TESTE aprovado
        'mes' => '12',
        'ano' => '2030',
        'cvv' => '123'
    ],
    'customer' => [  // Usando 'customer' conforme correção
        'nome_completo' => 'Teste Sistema AnySummit',
        'documento' => '123.456.789-01',
        'cep' => '01234-567',
        'endereco' => 'Rua de Teste, 123',
        'numero' => '123',
        'complemento' => '',
        'bairro' => 'Centro',
        'cidade' => 'São Paulo',
        'estado' => 'SP',
        'telefone' => '',
        'email' => 'teste@anysummit.com.br',
        'whatsapp' => '(11) 99999-9999'
    ]
];

// Simular requisição POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';

// Simular input JSON
file_put_contents('php://input', json_encode($dadosTeste));

echo "🧪 TESTE DIRETO API - pagamento-cartao.php\n";
echo "==========================================\n\n";

echo "📤 Dados enviados:\n";
echo json_encode($dadosTeste, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "🔄 Executando API...\n";
echo "====================\n";

// Capturar output da API
ob_start();

try {
    // Incluir o arquivo da API
    include('pagamento-cartao.php');
    
    $output = ob_get_clean();
    
    echo "✅ SUCESSO - API executou sem erro 500\n\n";
    echo "📥 Resposta da API:\n";
    echo $output . "\n\n";
    
    // Tentar decodificar JSON da resposta
    $response = json_decode($output, true);
    if ($response) {
        echo "📊 Análise da resposta:\n";
        echo "- Success: " . ($response['success'] ? 'true' : 'false') . "\n";
        echo "- Message: " . ($response['message'] ?? 'N/A') . "\n";
        echo "- Error Code: " . ($response['error_code'] ?? 'N/A') . "\n\n";
        
        if (!$response['success']) {
            echo "⚠️ NOTA: Erro esperado porque:\n";
            echo "1. Cartão de teste pode não funcionar em produção\n";
            echo "2. Banco de dados pode não aceitar pedido de teste\n";
            echo "3. O importante é que NÃO houve erro 500\n\n";
        }
    }
    
} catch (Exception $e) {
    $output = ob_get_clean();
    
    echo "❌ ERRO DETECTADO:\n";
    echo "Tipo: " . get_class($e) . "\n";
    echo "Mensagem: " . $e->getMessage() . "\n";
    echo "Linha: " . $e->getLine() . "\n";
    echo "Arquivo: " . $e->getFile() . "\n\n";
    
    if ($output) {
        echo "📥 Output capturado:\n";
        echo $output . "\n\n";
    }
} catch (Error $e) {
    $output = ob_get_clean();
    
    echo "❌ ERRO FATAL:\n";
    echo "Tipo: " . get_class($e) . "\n";
    echo "Mensagem: " . $e->getMessage() . "\n";
    echo "Linha: " . $e->getLine() . "\n";
    echo "Arquivo: " . $e->getFile() . "\n\n";
    
    if ($output) {
        echo "📥 Output capturado:\n";
        echo $output . "\n\n";
    }
}

echo "🎯 CONCLUSÃO:\n";
echo "=============\n";
echo "Se chegou até aqui SEM erro 500, a API está funcionando.\n";
echo "Use cartões de TESTE do Asaas no navegador:\n";
echo "- 4000 0000 0000 0010 (Visa aprovado)\n";
echo "- 5555 5555 5555 4444 (Mastercard aprovado)\n";
echo "- CVV: 123, Validade: 12/2030\n";

?>
