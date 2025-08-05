/**
 * SCRIPT DE TESTE - VERIFICAÇÃO DA CORREÇÃO FINAL
 * Use no console do navegador para verificar se as correções estão funcionando
 */

window.testeCorrecaoCompleta = function() {
    console.clear();
    console.log('🧪 === TESTE COMPLETO DA CORREÇÃO FINAL ===');
    
    // 1. Verificar se as funções estão carregadas
    console.log('\n📋 1. VERIFICANDO FUNÇÕES:');
    console.log('excluirLoteData:', typeof window.excluirLoteData);
    console.log('excluirLotePercentual:', typeof window.excluirLotePercentual);
    console.log('atualizarTelaLotes:', typeof window.atualizarTelaLotes);
    console.log('editarLote:', typeof window.editarLote);
    
    // 2. Verificar dados dos lotes
    console.log('\n📊 2. DADOS DOS LOTES:');
    console.log('window.lotesData:', window.lotesData);
    if (window.lotesData) {
        console.log('Lotes por data:', window.lotesData.porData?.length || 0);
        console.log('Lotes por percentual:', window.lotesData.porPercentual?.length || 0);
    }
    
    // 3. Verificar elementos DOM
    console.log('\n🖼️ 3. ELEMENTOS DOM:');
    const containerData = document.getElementById('lotesPorDataList');
    const containerPercentual = document.getElementById('lotesPorPercentualList');
    console.log('Container por data:', containerData ? 'EXISTS' : 'NOT FOUND');
    console.log('Container por percentual:', containerPercentual ? 'EXISTS' : 'NOT FOUND');
    
    if (containerData) {
        const loteItems = containerData.querySelectorAll('.lote-item');
        console.log('Lotes renderizados por data:', loteItems.length);
        
        loteItems.forEach((item, idx) => {
            const actions = item.querySelector('.lote-item-actions');
            const editBtn = item.querySelector('button[onclick*="editarLote"]');
            const deleteBtn = item.querySelector('button[onclick*="excluir"]');
            
            console.log(`  Lote ${idx + 1}:`, {
                hasActions: !!actions,
                hasEditBtn: !!editBtn,
                hasDeleteBtn: !!deleteBtn
            });
        });
    }
    
    if (containerPercentual) {
        const loteItems = containerPercentual.querySelectorAll('.lote-item');
        console.log('Lotes renderizados por percentual:', loteItems.length);
        
        loteItems.forEach((item, idx) => {
            const actions = item.querySelector('.lote-item-actions');
            const editBtn = item.querySelector('button[onclick*="editarLote"]');
            const deleteBtn = item.querySelector('button[onclick*="excluir"]');
            
            console.log(`  Lote ${idx + 1}:`, {
                hasActions: !!actions,
                hasEditBtn: !!editBtn,
                hasDeleteBtn: !!deleteBtn
            });
        });
    }
    
    // 4. Teste de atualização da interface
    console.log('\n🔄 4. TESTANDO ATUALIZAÇÃO DA INTERFACE:');
    try {
        if (window.atualizarTelaLotes) {
            window.atualizarTelaLotes();
            console.log('✅ atualizarTelaLotes() executada com sucesso');
        } else {
            console.log('❌ atualizarTelaLotes() não encontrada');
        }
    } catch (error) {
        console.log('❌ Erro ao executar atualizarTelaLotes():', error);
    }
    
    // 5. Verificar evento_id
    console.log('\n🆔 5. VERIFICANDO EVENTO_ID:');
    const eventoId = window.getEventoId?.() || 
                   new URLSearchParams(window.location.search).get('evento_id') ||
                   window.eventoAtual?.id;
    console.log('Evento ID encontrado:', eventoId);
    
    // 6. Resultado final
    console.log('\n🎯 === RESULTADO DO TESTE ===');
    
    const temFuncoes = typeof window.excluirLoteData === 'function' && 
                      typeof window.atualizarTelaLotes === 'function';
    
    const temContainers = !!containerData && !!containerPercentual;
    
    const temEventoId = !!eventoId;
    
    console.log('✅ Funções carregadas:', temFuncoes ? 'SIM' : 'NÃO');
    console.log('✅ Containers DOM:', temContainers ? 'SIM' : 'NÃO');
    console.log('✅ Evento ID:', temEventoId ? 'SIM' : 'NÃO');
    
    if (temFuncoes && temContainers && temEventoId) {
        console.log('🎉 CORREÇÃO FINAL FUNCIONANDO CORRETAMENTE!');
        console.log('💡 Você pode testar excluindo um lote para verificar se remove do MySQL');
    } else {
        console.log('⚠️ ALGUNS PROBLEMAS ENCONTRADOS - VERIFIQUE OS LOGS ACIMA');
    }
    
    console.log('\n🛠️ COMANDOS ÚTEIS:');
    console.log('testarCorrecaoFinal() - Força atualização da interface');
    console.log('window.lotesData - Ver dados dos lotes');
    console.log('testeCorrecaoCompleta() - Executar este teste novamente');
};

// Auto-executar se estiver na etapa 5
setTimeout(() => {
    if (window.currentStep === 5 || document.querySelector('.step-content.active[data-step="5"]')) {
        console.log('🚀 Auto-teste da correção final...');
        window.testeCorrecaoCompleta();
    }
}, 2000);

console.log('✅ Script de teste carregado');
console.log('💡 Use testeCorrecaoCompleta() para verificar se tudo está funcionando');
