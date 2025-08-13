<?php
/**
 * Teste de Ambientes Asaas - Produção vs Sandbox
 * Para identificar qual ambiente usar para testes
 */
header('Content-Type: text/plain; charset=utf-8');

include_once('AsaasAPI.php');

echo "🧪 TESTE DE AMBIENTES ASAAS\n";
echo "===========================\n\n";

// Testar ambiente de produção
echo "1️⃣ TESTANDO PRODUÇÃO:\n";
echo "=====================\n";
try {
    $asaasProd = new AsaasAPI('production');
    echo "✅ Token de produção: Configurado\n";
    echo "🔗 URL: https://api.asaas.com/v3\n";
    echo "🏦 Aceita: Cartões REAIS apenas\n";
    echo "❌ Rejeita: Cartões de teste (4000 0000 0000 0010)\n\n";
} catch (Exception $e) {
    echo "❌ Erro na produção: " . $e->getMessage() . "\n\n";
}

// Testar ambiente de sandbox
echo "2️⃣ TESTANDO SANDBOX:\n";
echo "====================\n";
try {
    $asaasSandbox = new AsaasAPI('sandbox');
    echo "⚠️ Token de sandbox: " . (strpos($asaasSandbox->access_token ?? '', 'sandbox') !== false ? "Específico" : "Usando token de produção") . "\n";
    echo "🔗 URL: https://sandbox.asaas.com/api/v3\n";
    echo "✅ Aceita: Cartões de TESTE (4000 0000 0000 0010)\n";
    echo "❌ Rejeita: Cartões reais\n\n";
} catch (Exception $e) {
    echo "❌ Erro no sandbox: " . $e->getMessage() . "\n\n";
}

echo "🎯 DIAGNÓSTICO:\n";
echo "===============\n";
echo "PROBLEMA: Você está usando token de PRODUÇÃO com cartões de TESTE\n\n";

echo "📋 SOLUÇÕES:\n";
echo "============\n\n";

echo "🔸 SOLUÇÃO 1 - Usar Sandbox (Recomendado para testes):\n";
echo "------------------------------------------------------\n";
echo "1. Obter token de sandbox no Asaas\n";
echo "2. Atualizar AsaasAPI.php com token sandbox\n";
echo "3. Usar cartões de teste: 4000 0000 0000 0010\n";
echo "4. Testar todas as funcionalidades\n";
echo "5. Depois voltar para produção\n\n";

echo "🔸 SOLUÇÃO 2 - Testar em Produção (Não recomendado):\n";
echo "-----------------------------------------------------\n";
echo "1. Usar cartão real com valor baixo (R$ 5,00)\n";
echo "2. Verificar se transação é aprovada\n";
echo "3. Risco: cobranças reais no cartão\n\n";

echo "🔸 SOLUÇÃO 3 - Configuração Dinâmica:\n";
echo "-------------------------------------\n";
echo "1. Adicionar parâmetro para escolher ambiente\n";
echo "2. Sandbox para desenvolvimento\n";
echo "3. Produção para clientes reais\n\n";

echo "💡 RECOMENDAÇÃO ATUAL:\n";
echo "======================\n";
echo "1. Temporariamente mudei para 'sandbox' no código\n";
echo "2. Se você TEM token de sandbox, teste agora\n";
echo "3. Se NÃO tem token de sandbox, vou reverter para produção\n";
echo "4. Para produção, use cartão real com valor mínimo\n\n";

echo "🧪 PRÓXIMO TESTE:\n";
echo "=================\n";
echo "1. Teste agora no navegador\n";
echo "2. Use cartão: 4000 0000 0000 0010\n";
echo "3. Se der erro 'ambiente sandbox', você não tem token sandbox\n";
echo "4. Se funcionar, ótimo! Depois configuramos produção\n\n";

echo "🔄 Status atual: TEMPORARIAMENTE em SANDBOX\n";
echo "📞 Me informe o resultado do teste!\n";
?>
