/**
 * DEBUG ESPECÍFICO - EDIÇÃO DE LOTES
 * Analisa o problema "Lote não encontrado"
 */

window.debugEdicaoLotes = function() {
    console.clear();
    console.log('🔍 === DEBUG EDIÇÃO DE LOTES ===');
    
    console.log('\n📊 1. ESTADO ATUAL DOS DADOS:');
    console.log('window.lotesData:', window.lotesData);
    
    if (window.lotesData) {
        console.log('\n📅 2. LOTES POR DATA:');
        if (window.lotesData.porData && window.lotesData.porData.length > 0) {
            window.lotesData.porData.forEach((lote, index) => {
                console.log(`  Lote ${index}:`, {
                    id: lote.id,
                    id_type: typeof lote.id,
                    nome: lote.nome,
                    dataInicio: lote.dataInicio,
                    dataFim: lote.dataFim,
                    divulgar: lote.divulgar
                });
            });
        } else {
            console.log('  ❌ Nenhum lote por data encontrado');
        }
        
        console.log('\n📊 3. LOTES POR PERCENTUAL:');
        if (window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
            window.lotesData.porPercentual.forEach((lote, index) => {
                console.log(`  Lote ${index}:`, {
                    id: lote.id,
                    id_type: typeof lote.id,
                    nome: lote.nome,
                    percentual: lote.percentual,
                    divulgar: lote.divulgar
                });
            });
        } else {
            console.log('  ❌ Nenhum lote por percentual encontrado');
        }
    } else {
        console.log('  ❌ window.lotesData não existe');
    }
    
    console.log('\n🖼️ 4. LOTES NA INTERFACE:');
    const containerData = document.getElementById('lotesPorDataList');
    const containerPercentual = document.getElementById('lotesPorPercentualList');
    
    if (containerData) {
        const lotesData = containerData.querySelectorAll('.lote-item');
        console.log(`📅 Lotes por data na interface: ${lotesData.length}`);
        lotesData.forEach((item, index) => {
            const id = item.getAttribute('data-id');
            const nome = item.querySelector('.lote-item-name')?.textContent?.trim();
            const editBtn = item.querySelector('button[onclick*="editarLote"]');
            console.log(`  Interface Lote ${index}:`, {
                data_id: id,
                data_id_type: typeof id,
                nome: nome,
                tem_botao_editar: !!editBtn,
                onclick_editar: editBtn?.getAttribute('onclick')
            });
        });
    }
    
    if (containerPercentual) {
        const lotesPercentual = containerPercentual.querySelectorAll('.lote-item');
        console.log(`📊 Lotes por percentual na interface: ${lotesPercentual.length}`);
        lotesPercentual.forEach((item, index) => {
            const id = item.getAttribute('data-id');
            const nome = item.querySelector('.lote-item-name')?.textContent?.trim();
            const editBtn = item.querySelector('button[onclick*="editarLote"]');
            console.log(`  Interface Lote ${index}:`, {
                data_id: id,
                data_id_type: typeof id,
                nome: nome,
                tem_botao_editar: !!editBtn,
                onclick_editar: editBtn?.getAttribute('onclick')
            });
        });
    }
    
    console.log('\n🔧 5. FUNÇÕES DISPONÍVEIS:');
    console.log('editarLoteBasico:', typeof window.editarLoteBasico);
    console.log('editarLoteData:', typeof window.editarLoteData);
    console.log('editarLotePercentual:', typeof window.editarLotePercentual);
    console.log('openModal:', typeof window.openModal);
    
    console.log('\n🧪 6. TESTE DE BUSCA:');
    if (window.lotesData?.porData?.length > 0) {
        const primeiroLote = window.lotesData.porData[0];
        console.log('Testando busca do primeiro lote por data:');
        console.log('  Lote original:', primeiroLote);
        
        // Teste com diferentes tipos de comparação
        const foundEqual = window.lotesData.porData.find(l => l.id === primeiroLote.id);
        const foundLoose = window.lotesData.porData.find(l => l.id == primeiroLote.id);
        const foundString = window.lotesData.porData.find(l => String(l.id) === String(primeiroLote.id));
        
        console.log('  Encontrado com ===:', !!foundEqual);
        console.log('  Encontrado com ==:', !!foundLoose);
        console.log('  Encontrado com String():', !!foundString);
    }
    
    if (window.lotesData?.porPercentual?.length > 0) {
        const primeiroLote = window.lotesData.porPercentual[0];
        console.log('Testando busca do primeiro lote percentual:');
        console.log('  Lote original:', primeiroLote);
        
        const foundEqual = window.lotesData.porPercentual.find(l => l.id === primeiroLote.id);
        const foundLoose = window.lotesData.porPercentual.find(l => l.id == primeiroLote.id);
        const foundString = window.lotesData.porPercentual.find(l => String(l.id) === String(primeiroLote.id));
        
        console.log('  Encontrado com ===:', !!foundEqual);
        console.log('  Encontrado com ==:', !!foundLoose);
        console.log('  Encontrado com String():', !!foundString);
    }
    
    console.log('\n💡 COMANDOS PARA TESTAR:');
    console.log('testarEdicaoComPrimeiroLote() - Testa edição com primeiro lote encontrado');
    console.log('testarEdicaoComId(ID) - Testa edição com ID específico');
};

window.testarEdicaoComPrimeiroLote = function() {
    console.log('🧪 Testando edição com primeiro lote...');
    
    if (window.lotesData?.porData?.length > 0) {
        const lote = window.lotesData.porData[0];
        console.log('📅 Testando lote por data:', lote);
        try {
            window.editarLoteBasico(lote.id, 'data');
        } catch (error) {
            console.error('❌ Erro ao testar:', error);
        }
    }
    
    if (window.lotesData?.porPercentual?.length > 0) {
        const lote = window.lotesData.porPercentual[0];
        console.log('📊 Testando lote percentual:', lote);
        try {
            window.editarLoteBasico(lote.id, 'percentual');
        } catch (error) {
            console.error('❌ Erro ao testar:', error);
        }
    }
};

window.testarEdicaoComId = function(id) {
    console.log('🧪 Testando edição com ID específico:', id);
    
    // Tentar como data
    console.log('📅 Tentando como lote por data...');
    try {
        window.editarLoteBasico(id, 'data');
    } catch (error) {
        console.error('❌ Erro ao testar como data:', error);
    }
    
    // Tentar como percentual
    console.log('📊 Tentando como lote percentual...');
    try {
        window.editarLoteBasico(id, 'percentual');
    } catch (error) {
        console.error('❌ Erro ao testar como percentual:', error);
    }
};

console.log('✅ Debug de edição carregado');
console.log('💡 Use debugEdicaoLotes() para analisar o problema');
