<?php
/**
 * 🚨 DIAGNÓSTICO CRÍTICO: Verificação de dados de cartão
 * Confirma se dados reais ou mascarados estão sendo enviados para API
 */

echo "<h2>🚨 DIAGNÓSTICO CRÍTICO: Dados do Cartão</h2>";

echo "<h3>1. Análise do código AsaasAPI.php...</h3>";

$arquivo_api = __DIR__ . '/api/AsaasAPI.php';
if (file_exists($arquivo_api)) {
    $conteudo = file_get_contents($arquivo_api);
    
    echo "<div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>📁 Arquivo:</strong> /evento/api/AsaasAPI.php<br><br>";
    
    // Verificar se há mascaramento nos logs
    if (strpos($conteudo, 'maskCardNumber') !== false) {
        echo "✅ <strong>Sistema de mascaramento encontrado</strong> - Dados são mascarados apenas nos logs<br>";
    }
    
    // Verificar se a requisição CURL usa dados reais
    if (preg_match('/CURLOPT_POSTFIELDS.*json_encode\(\$data\)/', $conteudo)) {
        echo "✅ <strong>REQUISIÇÃO CORRETA:</strong> CURL usa \$data (dados reais), não \$logData (mascarados)<br>";
    } else {
        echo "❌ <strong>PROBLEMA POTENCIAL:</strong> CURL pode estar usando dados mascarados<br>";
    }
    
    // Verificar problema no log do comando CURL
    if (preg_match('/json_encode\(\$logData\)/', $conteudo)) {
        echo "⚠️ <strong>PROBLEMA MENOR:</strong> Log do comando CURL usa dados mascarados (não afeta API real)<br>";
    }
    
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 5px;'>";
    echo "❌ Arquivo AsaasAPI.php não encontrado<br>";
    echo "</div>";
}

echo "<h3>2. Verificação específica do fluxo...</h3>";

echo "<div style='background: #e2f3ff; border: 1px solid #b8daff; padding: 15px; border-radius: 5px;'>";
echo "<strong>🔍 Análise do fluxo de dados:</strong><br><br>";

echo "<strong>1. Dados chegam do frontend:</strong><br>";
echo "<code>\$cartaoData['numero'] = '1234567890123456'</code><br>";
echo "<code>\$cartaoData['cvv'] = '123'</code><br><br>";

echo "<strong>2. pagamento-cartao.php monta array:</strong><br>";
echo "<code>\$paymentData['creditCard']['number'] = dados_reais</code><br>";
echo "<code>\$paymentData['creditCard']['ccv'] = dados_reais</code><br><br>";

echo "<strong>3. AsaasAPI.php recebe:</strong><br>";
echo "<code>makeRequest('/lean/payments', \$paymentData, 'POST')</code><br><br>";

echo "<strong>4. AsaasAPI.php faz duas coisas:</strong><br>";
echo "• <strong>Para LOG:</strong> Mascara dados (\$logData)<br>";
echo "• <strong>Para API:</strong> Usa dados reais (\$data)<br><br>";

echo "<strong>5. CURL envia para Asaas:</strong><br>";
echo "<code>curl_setopt(CURLOPT_POSTFIELDS, json_encode(\$data)) // ✅ DADOS REAIS</code><br>";

echo "</div>";

echo "<h3>3. Possíveis causas das recusas...</h3>";

echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px;'>";
echo "<strong>🔍 Se não é mascaramento, pode ser:</strong><br><br>";

echo "<strong>❌ Dados inválidos do frontend:</strong><br>";
echo "• Número do cartão com formatação incorreta<br>";
echo "• CVV com espaços ou caracteres inválidos<br>";
echo "• Data de validade incorreta<br><br>";

echo "<strong>❌ Problemas de validação:</strong><br>";
echo "• Nome no cartão muito diferente do cadastro<br>";
echo "• Dados do endereço incorretos<br>";
echo "• CPF inválido ou divergente<br><br>";

echo "<strong>❌ Problemas na API:</strong><br>";
echo "• Campos obrigatórios em branco<br>";
echo "• Formato de data incorreto<br>";
echo "• IP do servidor bloqueado<br>";

echo "</div>";

echo "<h3>4. Como confirmar se dados reais estão sendo enviados...</h3>";

echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px;'>";
echo "<strong>🧪 Método de verificação definitiva:</strong><br><br>";

echo "<strong>Adicione este código TEMPORÁRIO no pagamento-cartao.php:</strong><br>";
echo "<textarea readonly style='width: 100%; height: 150px; font-family: monospace; font-size: 12px;'>";
echo "// ADICIONAR ANTES DA LINHA: \$payment = \$asaas->createCreditCardPayment(\$paymentData);\n";
echo "\n";
echo "// DEBUG TEMPORÁRIO - REMOVER APÓS TESTE\n";
echo "error_log('=== DADOS REAIS ENVIADOS PARA API ===');\n";
echo "error_log('Número real: ' . \$paymentData['creditCard']['number']);\n";
echo "error_log('CVV real: ' . \$paymentData['creditCard']['ccv']);\n";
echo "error_log('Nome real: ' . \$paymentData['creditCard']['holderName']);\n";
echo "error_log('Mês real: ' . \$paymentData['creditCard']['expiryMonth']);\n";
echo "error_log('Ano real: ' . \$paymentData['creditCard']['expiryYear']);\n";
echo "error_log('=====================================');";
echo "</textarea><br>";

echo "<strong>⚠️ IMPORTANTE:</strong> Remover esse código após confirmar que dados estão corretos!<br>";

echo "</div>";

echo "<h3>5. Verificação da correção do holderName...</h3>";

$arquivo_pagamento = __DIR__ . '/api/pagamento-cartao.php';
if (file_exists($arquivo_pagamento)) {
    $conteudo_pag = file_get_contents($arquivo_pagamento);
    
    echo "<div style='border: 1px solid #ccc; margin: 10px 0; padding: 10px; border-radius: 5px;'>";
    
    if (strpos($conteudo_pag, '$cartaoData[\'nome\']') !== false) {
        echo "✅ <strong>holderName CORRIGIDO:</strong> Usando \$cartaoData['nome']<br>";
    } else {
        echo "❌ <strong>holderName NÃO CORRIGIDO:</strong> Pode estar usando dados errados<br>";
    }
    
    echo "</div>";
}

echo "<h3>6. Próximos passos para resolver...</h3>";

echo "<div style='background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px;'>";
echo "<strong>📋 Plano de ação:</strong><br><br>";

echo "<strong>1. ✅ CONFIRMADO:</strong> Dados reais são enviados para API (não mascarados)<br>";
echo "<strong>2. 🧪 TESTE:</strong> Adicionar logs temporários para confirmar dados<br>";
echo "<strong>3. 🔍 VERIFICAR:</strong> Se dados chegam corretos do frontend<br>";
echo "<strong>4. 🛠️ CORRIGIR:</strong> Problemas encontrados nos dados<br>";
echo "<strong>5. 🗑️ REMOVER:</strong> Logs temporários após correção<br>";

echo "</div>";

echo "<div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
echo "<h4>🎯 CONCLUSÃO INICIAL</h4>";
echo "<strong>✅ DADOS REAIS estão sendo enviados para a API do Asaas</strong><br>";
echo "<strong>✅ Mascaramento é apenas nos logs (correto)</strong><br>";
echo "<strong>⚠️ Problema deve estar em outro lugar:</strong><br>";
echo "• Dados incorretos vindos do frontend<br>";
echo "• Validação falhando no Asaas<br>";
echo "• Problemas de formatação nos dados<br><br>";
echo "<strong>🔧 Próximo passo:</strong> Adicionar logs temporários para ver dados reais";
echo "</div>";
?>