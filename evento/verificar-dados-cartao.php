<?php
/**
 * Script para verificar se os dados do cartão estão sendo enviados corretamente
 * Ajuda a identificar se o problema está no frontend ou backend
 */

echo "<h2>🧪 Verificação dos Dados do Cartão - Frontend vs Backend</h2>";

echo "<h3>1. Verificação da correção implementada...</h3>";

$arquivo_api = __DIR__ . '/api/pagamento-cartao.php';
if (file_exists($arquivo_api)) {
    $conteudo = file_get_contents($arquivo_api);
    
    echo "<div style='border: 1px solid #ccc; margin: 10px 0; padding: 10px; border-radius: 5px;'>";
    echo "<strong>Arquivo:</strong> /evento/api/pagamento-cartao.php<br>";
    
    // Verificar se a correção foi aplicada
    if (strpos($conteudo, '$cartaoData[\'nome\']') !== false && 
        strpos($conteudo, 'creditCardHolderInfo') !== false) {
        
        // Verificar se ambos os campos usam o mesmo valor
        if (preg_match_all('/\'holderName\'\s*=>\s*\$cartaoData\[\'nome\'\]/', $conteudo) >= 1 &&
            preg_match_all('/\'name\'\s*=>\s*\$cartaoData\[\'nome\'\]/', $conteudo) >= 1) {
            echo "✅ <strong>CORREÇÃO APLICADA:</strong> Ambos os campos usam \$cartaoData['nome']<br>";
        } else {
            echo "⚠️ <strong>VERIFICAR:</strong> Campos podem estar usando valores diferentes<br>";
        }
        
        // Verificar se há logs de debug
        if (strpos($conteudo, 'CORREÇÃO APLICADA') !== false) {
            echo "✅ Logs de debug implementados<br>";
        }
    } else {
        echo "❌ Correção não encontrada no arquivo<br>";
    }
    
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 5px;'>";
    echo "❌ Arquivo pagamento-cartao.php não encontrado<br>";
    echo "</div>";
}

echo "<h3>2. Estrutura esperada dos dados...</h3>";

echo "<div style='background: #e2f3ff; border: 1px solid #b8daff; padding: 15px; border-radius: 5px;'>";
echo "<strong>📋 Estrutura de dados esperada do frontend:</strong><br><br>";

echo "<strong>Dados do cartão (\$cartaoData):</strong><br>";
echo "<code>{\n";
echo "  'nome': 'GUSTAVO C KALLAJIAN',     // ← Campo #card-name (nome NO cartão)\n";
echo "  'numero': '1234567890123456',\n";
echo "  'mes': '03',\n";
echo "  'ano': '2030',\n";
echo "  'cvv': '123'\n";
echo "}</code><br><br>";

echo "<strong>Dados do comprador (\$customerData):</strong><br>";
echo "<code>{\n";
echo "  'nome_completo': 'GUSTAVO CIBIM KALLAJIAN',  // ← Campo #nome_completo (nome do comprador)\n";
echo "  'documento': '123.456.789-00',\n";
echo "  'email': 'email@exemplo.com',\n";
echo "  // ... outros dados do comprador\n";
echo "}</code><br><br>";

echo "<strong>✅ Resultado após correção:</strong><br>";
echo "<code>{\n";
echo "  'creditCard': {\n";
echo "    'holderName': 'GUSTAVO C KALLAJIAN'  // ← Agora usa \$cartaoData['nome']\n";
echo "  },\n";
echo "  'creditCardHolderInfo': {\n";
echo "    'name': 'GUSTAVO C KALLAJIAN'        // ← Também usa \$cartaoData['nome']\n";
echo "  }\n";
echo "}</code><br>";

echo "</div>";

echo "<h3>3. Como verificar se está funcionando...</h3>";

echo "<div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;'>";
echo "<strong>🔍 Para verificar se a correção está funcionando:</strong><br><br>";

echo "<strong>1. Verificar logs do PHP:</strong><br>";
echo "• Procure por: <code>CORREÇÃO APLICADA: holderName e creditCardHolderInfo.name agora usam o mesmo valor</code><br>";
echo "• Confirme que: <code>holderName = creditCardHolderInfo.name: SIM</code><br><br>";

echo "<strong>2. Verificar dados enviados ao Asaas:</strong><br>";
echo "• Procure por: <code>=== DADOS DO PAGAMENTO FINAL ===</code><br>";
echo "• Confirme que ambos os campos têm o mesmo valor do campo #card-name<br><br>";

echo "<strong>3. Teste no frontend:</strong><br>";
echo "• Preencha o campo 'Nome no cartão' com um valor diferente do 'Nome completo'<br>";
echo "• Faça um pagamento de teste<br>";
echo "• Verifique nos logs se ambos os campos usam o valor do 'Nome no cartão'<br>";

echo "</div>";

echo "<h3>4. JavaScript para debug no frontend...</h3>";

echo "<div style='background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 5px;'>";
echo "<strong>💻 Código JavaScript para verificar dados antes do envio:</strong><br><br>";

echo "<textarea readonly style='width: 100%; height: 200px; font-family: monospace; font-size: 12px;'>";
echo "// Adicione este código no checkout para verificar os dados antes do envio\n";
echo "function debugDadosCartao() {\n";
echo "    const nomeCartao = document.getElementById('card-name').value;\n";
echo "    const nomeCompleto = document.getElementById('nome_completo').value;\n";
echo "    \n";
echo "    console.log('=== DEBUG DADOS CARTÃO ===');\n";
echo "    console.log('Nome no cartão (#card-name):', nomeCartao);\n";
echo "    console.log('Nome completo (#nome_completo):', nomeCompleto);\n";
echo "    console.log('São diferentes?', nomeCartao !== nomeCompleto);\n";
echo "    \n";
echo "    // Verificar se os dados estão sendo montados corretamente\n";
echo "    const dadosCartao = {\n";
echo "        nome: nomeCartao,  // Deve usar #card-name\n";
echo "        // ... outros dados\n";
echo "    };\n";
echo "    \n";
echo "    const dadosComprador = {\n";
echo "        nome_completo: nomeCompleto,  // Deve usar #nome_completo\n";
echo "        // ... outros dados\n";
echo "    };\n";
echo "    \n";
echo "    console.log('Dados do cartão:', dadosCartao);\n";
echo "    console.log('Dados do comprador:', dadosComprador);\n";
echo "}\n";
echo "\n";
echo "// Chame esta função antes de enviar os dados para a API\n";
echo "debugDadosCartao();";
echo "</textarea>";

echo "</div>";

echo "<h3>5. Resumo da correção...</h3>";

echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px;'>";
echo "<strong>🎯 CORREÇÃO IMPLEMENTADA:</strong><br><br>";

echo "<strong>✅ Problema corrigido:</strong><br>";
echo "• ANTES: <code>creditCard.holderName</code> usava \$cartaoData['nome'] mas <code>creditCardHolderInfo.name</code> usava \$customerData['nome_completo']<br>";
echo "• AGORA: Ambos os campos usam \$cartaoData['nome'] (valor do campo #card-name)<br><br>";

echo "<strong>✅ Resultado esperado:</strong><br>";
echo "• <code>creditCard.holderName</code> = \"GUSTAVO C KALLAJIAN\"<br>";
echo "• <code>creditCardHolderInfo.name</code> = \"GUSTAVO C KALLAJIAN\"<br>";
echo "• Ambos valores vêm do campo #card-name do frontend<br><br>";

echo "<strong>✅ Benefícios:</strong><br>";
echo "• Cartões não serão mais recusados por divergência de nomes<br>";
echo "• Dados consistentes enviados para o Asaas<br>";
echo "• Logs detalhados para debugging<br>";

echo "</div>";

echo "<h3>6. Próximos passos...</h3>";

echo "<div style='background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px;'>";
echo "<strong>📋 Para validar a correção:</strong><br><br>";

echo "1. ✅ <strong>Correção aplicada</strong> - Arquivo pagamento-cartao.php corrigido<br>";
echo "2. 🧪 <strong>Teste necessário</strong> - Fazer pagamento com nomes diferentes<br>";
echo "3. 📊 <strong>Verificar logs</strong> - Confirmar que ambos campos têm mesmo valor<br>";
echo "4. ✅ <strong>Validar aprovação</strong> - Cartões devem ser aprovados normalmente<br>";

echo "</div>";
?>