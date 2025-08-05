/**
 * Debug para carregamento de lotes ao retomar evento
 */

(function() {
    console.log('🔍 Debug de carregamento de lotes iniciado');
    
    // Verificar se as funções necessárias existem
    setTimeout(() => {
        console.log('=== VERIFICAÇÃO DE FUNÇÕES DE LOTES ===');
        console.log('window.lotesData:', window.lotesData);
        console.log('window.restaurarLotes:', typeof window.restaurarLotes);
        console.log('window.limparTodosLotes:', typeof window.limparTodosLotes);
        console.log('window.adicionarLotePorData:', typeof window.adicionarLotePorData);
        console.log('window.adicionarLotePorPercentual:', typeof window.adicionarLotePorPercentual);
        console.log('window.renderizarLotesPorData:', typeof window.renderizarLotesPorData);
        console.log('window.renderizarLotesPorPercentual:', typeof window.renderizarLotesPorPercentual);
    }, 2000);
    
    // Interceptar chamada de restaurarLotes
    const originalRestaurarLotes = window.restaurarLotes;
    if (originalRestaurarLotes) {
        window.restaurarLotes = function(lotes) {
            console.log('🎯 restaurarLotes chamada com:', lotes);
            return originalRestaurarLotes.apply(this, arguments);
        };
    }
    
    // Monitorar quando um evento é retomado
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (eventoId) {
        console.log('📋 Evento sendo retomado, ID:', eventoId);
        
        // Verificar periodicamente se os lotes foram carregados
        let checkCount = 0;
        const checkInterval = setInterval(() => {
            checkCount++;
            console.log(`🔄 Verificação ${checkCount} - Lotes carregados:`, {
                porData: window.lotesData?.porData?.length || 0,
                porPercentual: window.lotesData?.porPercentual?.length || 0
            });
            
            // Verificar elementos DOM
            const lotesPorDataList = document.getElementById('lotesPorDataList');
            const lotesPorPercentualList = document.getElementById('lotesPorPercentualList');
            
            console.log('📦 Elementos DOM:', {
                lotesPorDataList: lotesPorDataList?.children.length || 0,
                lotesPorPercentualList: lotesPorPercentualList?.children.length || 0
            });
            
            if (checkCount >= 10) {
                clearInterval(checkInterval);
                console.log('⏹️ Parando verificação após 10 tentativas');
            }
        }, 1000);
    }
})();
