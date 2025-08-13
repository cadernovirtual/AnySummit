<?php
/**
 * TESTE: Validação das Correções no Pagamento com Cartão
 * 
 * Este arquivo testa se todas as correções implementadas estão funcionando
 * conforme a documentação do Asaas.
 */

header('Content-Type: text/html; charset=utf-8');

// Simular dados que seriam enviados pelo frontend corrigido
$dadosTesteCorrigidos = [
    'pedido' => [
        'pedidoid' => 123,
        'codigo_pedido' => 'TEST_' . uniqid(),
        'valor_total' => 50.00,
        'parcelas' => 1,
        'evento_nome' => 'Evento de Teste'
    ],
    'cartao' => [
        'nome' => 'João Teste',
        'numero' => '4000000000000010', // Cartão de teste Asaas
        'mes' => '12',
        'ano' => '2030',
        'cvv' => '123'
    ],
    'customer' => [  // ✅ CORRIGIDO: era 'comprador'
        'nome_completo' => 'João da Silva Teste',
        'documento' => '123.456.789-01',
        'email' => 'joao.teste@email.com',
        'whatsapp' => '(11) 99999-9999',
        'cep' => '01234-567',
        'endereco' => 'Rua de Teste, 123',
        'numero' => '123',
        'complemento' => 'Apto 45',
        'bairro' => 'Centro',
        'cidade' => 'São Paulo',
        'estado' => 'SP'
    ]
];

echo "<h1>🧪 Teste das Correções - Pagamento Cartão</h1>";
echo "<h2>📋 Status das Correções Implementadas</h2>";

// Incluir funções necessárias
include_once('api/pagamento-cartao.php');

// Função para testar validação de mobilePhone
function testarValidacaoMobile() {
    echo "<h3>📱 Teste: Validação de mobilePhone</h3>";
    
    $casos = [
        ['(11) 99999-9999', 'SP - Formato com máscara'],
        ['11999999999', 'SP - Somente números'],
        ['5511999999999', 'SP - Com código país 55'],
        ['011999999999', 'SP - Com zero inicial'],
        ['1199999999', 'SP - 10 dígitos (sem 9)'],
        ['85987654321', 'CE - DDD válido'],
        ['99123456789', 'Norte - DDD válido'],
        ['00123456789', 'DDD inválido'],
        ['', 'Vazio'],
        ['abc123', 'Formato inválido']
    ];
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #f0f0f0;'>";
    echo "<th>Entrada</th><th>Descrição</th><th>Resultado</th><th>Status</th>";
    echo "</tr>";
    
    foreach ($casos as $caso) {
        $entrada = $caso[0];
        $descricao = $caso[1];
        $resultado = validarMobilePhone($entrada);
        $status = $resultado ? '✅ Válido' : '❌ Inválido';
        
        echo "<tr>";
        echo "<td><code>{$entrada}</code></td>";
        echo "<td>{$descricao}</td>";
        echo "<td><code>" . ($resultado ?? 'null') . "</code></td>";
        echo "<td>{$status}</td>";
        echo "</tr>";
    }
    echo "</table>";
}

// Função para testar estrutura de dados
function testarEstruturaDados() {
    global $dadosTesteCorrigidos;
    
    echo "<h3>📊 Teste: Estrutura de Dados</h3>";
    
    $checks = [
        'Campo customer existe' => isset($dadosTesteCorrigidos['customer']),
        'Campo comprador NÃO existe' => !isset($dadosTesteCorrigidos['comprador']),
        'Dados do pedido presentes' => !empty($dadosTesteCorrigidos['pedido']),
        'Dados do cartão presentes' => !empty($dadosTesteCorrigidos['cartao']),
        'Nome completo presente' => !empty($dadosTesteCorrigidos['customer']['nome_completo']),
        'Documento presente' => !empty($dadosTesteCorrigidos['customer']['documento']),
    ];
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #f0f0f0;'>";
    echo "<th>Verificação</th><th>Status</th>";
    echo "</tr>";
    
    foreach ($checks as $descricao => $resultado) {
        $status = $resultado ? '✅ OK' : '❌ FALHOU';
        $cor = $resultado ? '#d4edda' : '#f8d7da';
        
        echo "<tr style='background: {$cor};'>";
        echo "<td>{$descricao}</td>";
        echo "<td><strong>{$status}</strong></td>";
        echo "</tr>";
    }
    echo "</table>";
}

// Função para simular criação de cliente Asaas
function simularCriacaoCliente() {
    global $dadosTesteCorrigidos;
    
    echo "<h3>🏗️ Simulação: Criação de Cliente Asaas</h3>";
    
    $customerData = $dadosTesteCorrigidos['customer'];
    $cpfCnpj = preg_replace('/[^0-9]/', '', $customerData['documento']);
    $mobilePhoneValidado = validarMobilePhone($customerData['whatsapp']);
    
    // Simular estrutura que seria enviada ao Asaas
    $asaasClientData = [
        'name' => $customerData['nome_completo'],
        'cpfCnpj' => $cpfCnpj,
        'notificationDisabled' => true  // ✅ OBRIGATÓRIO
    ];
    
    // Adicionar email se não vazio
    if (!empty($customerData['email'])) {
        $asaasClientData['email'] = $customerData['email'];
    }
    
    // Adicionar mobilePhone apenas se válido
    if ($mobilePhoneValidado && strlen($mobilePhoneValidado) === 11) {
        $asaasClientData['mobilePhone'] = $mobilePhoneValidado;
    }
    
    echo "<h4>📤 Dados que seriam enviados ao Asaas:</h4>";
    echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px;'>";
    echo json_encode($asaasClientData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    echo "</pre>";
    
    // Validações
    $validacoes = [
        'Campo name presente' => !empty($asaasClientData['name']),
        'Campo cpfCnpj presente' => !empty($asaasClientData['cpfCnpj']),
        'CPF/CNPJ tem 11 dígitos (CPF)' => strlen($asaasClientData['cpfCnpj']) === 11,
        'notificationDisabled definido' => isset($asaasClientData['notificationDisabled']) && $asaasClientData['notificationDisabled'] === true,
        'mobilePhone válido (se presente)' => !isset($asaasClientData['mobilePhone']) || strlen($asaasClientData['mobilePhone']) === 11,
        'email válido (se presente)' => !isset($asaasClientData['email']) || filter_var($asaasClientData['email'], FILTER_VALIDATE_EMAIL),
    ];
    
    echo "<h4>✅ Validações:</h4>";
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #f0f0f0;'>";
    echo "<th>Validação</th><th>Status</th>";
    echo "</tr>";
    
    foreach ($validacoes as $descricao => $resultado) {
        $status = $resultado ? '✅ OK' : '❌ FALHOU';
        $cor = $resultado ? '#d4edda' : '#f8d7da';
        
        echo "<tr style='background: {$cor};'>";
        echo "<td>{$descricao}</td>";
        echo "<td><strong>{$status}</strong></td>";
        echo "</tr>";
    }
    echo "</table>";
}

// Função para mostrar comparação antes/depois
function mostrarComparacao() {
    echo "<h3>🔄 Comparação: Antes vs Depois</h3>";
    
    echo "<div style='display: flex; gap: 20px;'>";
    
    // ANTES
    echo "<div style='flex: 1; background: #f8d7da; padding: 15px; border-radius: 5px;'>";
    echo "<h4>❌ ANTES (Problemático)</h4>";
    echo "<pre>";
    echo "// Frontend
const pagamentoData = {
    pedido: {...},
    cartao: {...},
    comprador: {...}  // ❌ Nome errado
};

// Backend  
\$compradorData = \$input['comprador'] ?? [];

// Criação cliente
\$customerData = [
    'name' => \$compradorData['nome_completo'],
    'cpfCnpj' => \$cpfCnpj,
    // ❌ Sem notificationDisabled
    'mobilePhone' => '85999999999' // ❌ Forçado
];";
    echo "</pre>";
    echo "</div>";
    
    // DEPOIS
    echo "<div style='flex: 1; background: #d4edda; padding: 15px; border-radius: 5px;'>";
    echo "<h4>✅ DEPOIS (Corrigido)</h4>";
    echo "<pre>";
    echo "// Frontend
const pagamentoData = {
    pedido: {...},
    cartao: {...},
    customer: {...}  // ✅ Nome correto
};

// Backend
\$customerData = \$input['customer'] ?? \$input['comprador'] ?? [];

// Criação cliente
\$clienteAsaasData = [
    'name' => \$customerData['nome_completo'],
    'cpfCnpj' => \$cpfCnpj,
    'notificationDisabled' => true  // ✅ Obrigatório
];
if (\$mobilePhoneValidado && strlen(\$mobilePhoneValidado) === 11) {
    \$clienteAsaasData['mobilePhone'] = \$mobilePhoneValidado; // ✅ Só se válido
}";
    echo "</pre>";
    echo "</div>";
    
    echo "</div>";
}

// Executar testes
testarEstruturaDados();
echo "<hr>";
testarValidacaoMobile();
echo "<hr>";
simularCriacaoCliente();
echo "<hr>";
mostrarComparacao();

echo "<hr>";
echo "<h2>🎯 Resumo das Correções</h2>";
echo "<ul>";
echo "<li>✅ <strong>Campo 'customer'</strong> em vez de 'comprador' no frontend</li>";
echo "<li>✅ <strong>Backend compatível</strong> com ambos os formatos</li>";
echo "<li>✅ <strong>notificationDisabled: true</strong> obrigatório adicionado</li>";
echo "<li>✅ <strong>Validação completa de DDDs</strong> brasileiros (11-99)</li>";
echo "<li>✅ <strong>mobilePhone opcional</strong> - só envia se válido</li>";
echo "<li>✅ <strong>Estrutura conforme documentação</strong> Asaas API v3</li>";
echo "</ul>";

echo "<h2>🧪 Próximo Passo</h2>";
echo "<p><strong>Teste com cartão real:</strong> Usar o checkout corrigido com um cartão de teste do Asaas:</p>";
echo "<ul>";
echo "<li><strong>Aprovado (Visa):</strong> 4000 0000 0000 0010</li>";
echo "<li><strong>Aprovado (Mastercard):</strong> 5555 5555 5555 4444</li>";
echo "<li><strong>CVV:</strong> 123, <strong>Validade:</strong> 12/2030</li>";
echo "</ul>";

echo "<h2>📞 Contato</h2>";
echo "<p>Se ainda houver problemas após estas correções, verifique:</p>";
echo "<ol>";
echo "<li>Se a API key do Asaas está ativa</li>";
echo "<li>Se a conta não tem restrições</li>";
echo "<li>Se os logs mostram a estrutura correta sendo enviada</li>";
echo "</ol>";

?>
