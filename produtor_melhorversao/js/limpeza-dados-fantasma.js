/**
 * LIMPEZA DE DADOS FANTASMA - SISTEMA MYSQL
 * 
 * Remove dados de lotes que não existem no banco mas aparecem na interface
 */

console.log('🧹 LIMPEZA-DADOS-FANTASMA.JS CARREGANDO...');

/**
 * Limpar todos os dados fantasma de lotes
 */
window.limparDadosFantasmaLotes = function() {
    console.log('🧹 Limpando dados fantasma de lotes...');
    
    try {
        // Limpar variáveis globais que podem conter dados falsos
        if (window.lotesData) {
            delete window.lotesData;
            console.log('🗑️ window.lotesData removido');
        }
        
        if (window.lotesTemporarios) {
            delete window.lotesTemporarios;
            console.log('🗑️ window.lotesTemporarios removido');
        }
        
        // Limpar cookies de lotes
        document.cookie = 'lotes_por_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'lotes_por_percentual=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log('🍪 Cookies de lotes limpos');
        
        // Limpar localStorage se houver dados de lotes
        if (localStorage.getItem('lotes_data')) {
            localStorage.removeItem('lotes_data');
            console.log('💾 localStorage de lotes limpo');
        }
        
        if (localStorage.getItem('lotes_percentual')) {
            localStorage.removeItem('lotes_percentual');
            console.log('💾 localStorage de percentual limpo');
        }
        
        // Invalidar cache do sistema MySQL
        if (window.lotesCache) {
            window.lotesCache.data = null;
            window.lotesCache.timestamp = 0;
            console.log('🗄️ Cache MySQL invalidado');
        }
        
        // Limpar interface visual
        const containerData = document.getElementById('lotesPorDataList');
        if (containerData) {
            containerData.innerHTML = '';
        }
        
        const containerPercentual = document.getElementById('lotesPorPercentualList');
        if (containerPercentual) {
            containerPercentual.innerHTML = '';
        }
        
        // Mostrar empty states
        const emptyData = document.getElementById('loteDataEmpty');
        if (emptyData) {
            emptyData.style.display = 'block';
        }
        
        const emptyPercentual = document.getElementById('lotePercentualEmpty');
        if (emptyPercentual) {
            emptyPercentual.style.display = 'block';
        }
        
        console.log('✅ Limpeza de dados fantasma concluída');
        
    } catch (error) {
        console.error('❌ Erro na limpeza de dados fantasma:', error);
    }
};

/**
 * Forçar carregamento apenas do MySQL
 */
window.forcarCarregamentoMySQL = async function() {
    console.log('🔄 Forçando carregamento apenas do MySQL...');
    
    try {
        // Primeiro limpar dados fantasma
        window.limparDadosFantasmaLotes();
        
        // Aguardar um momento
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Carregar do banco
        if (typeof window.carregarLotesDoBanco === 'function') {
            const lotes = await window.carregarLotesDoBanco();
            console.log(`📦 ${lotes.length} lotes carregados do MySQL`);
            
            // Renderizar interface limpa
            if (typeof window.renderizarLotesNaInterface === 'function') {
                await window.renderizarLotesNaInterface();
            }
        }
        
        console.log('✅ Carregamento MySQL forçado concluído');
        
    } catch (error) {
        console.error('❌ Erro no carregamento MySQL forçado:', error);
    }
};

/**
 * Executar limpeza automaticamente ao carregar
 */
function executarLimpezaAutomatica() {
    console.log('🚀 Executando limpeza automática...');
    
    // Executar após outros scripts carregarem
    setTimeout(() => {
        window.limparDadosFantasmaLotes();
        
        // Se estamos na etapa 5, forçar carregamento do MySQL
        const etapaAtual = window.currentStep || 1;
        if (etapaAtual === 5) {
            setTimeout(() => {
                window.forcarCarregamentoMySQL();
            }, 500);
        }
    }, 1000);
}

// Auto-executar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', executarLimpezaAutomatica);
} else {
    executarLimpezaAutomatica();
}

console.log('✅ LIMPEZA-DADOS-FANTASMA.JS CARREGADO!');
console.log('🔧 Funções disponíveis:');
console.log('  - limparDadosFantasmaLotes()');
console.log('  - forcarCarregamentoMySQL()');
