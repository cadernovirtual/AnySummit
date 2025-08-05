/**
 * Debug helper para verificar lotes no wizard
 */

(function() {
    console.log('🔍 Debug Lotes carregado');
    
    // Função para verificar estado dos lotes
    window.debugLotes = function() {
        console.log('🔍 Verificando lotes...');
        
        // Verificar window.lotesData
        if (window.lotesData) {
            console.log('✅ window.lotesData encontrado:', window.lotesData);
            console.log('📅 Lotes por data:', window.lotesData.porData?.length || 0);
            console.log('📊 Lotes por percentual:', window.lotesData.porPercentual?.length || 0);
            
            if (window.lotesData.porData?.length > 0) {
                console.log('Detalhes dos lotes por data:', window.lotesData.porData);
            }
            
            if (window.lotesData.porPercentual?.length > 0) {
                console.log('Detalhes dos lotes por percentual:', window.lotesData.porPercentual);
            }
        } else {
            console.warn('❌ window.lotesData não encontrado!');
        }
        
        // Verificar elementos DOM (antigo sistema)
        const loteItems = document.querySelectorAll('.lote-item');
        console.log('Elementos .lote-item no DOM:', loteItems.length);
        
        // Verificar container de lotes
        const lotesContainer = document.getElementById('lotesPorDataList');
        console.log('Container de lotes por data:', lotesContainer);
        
        const lotesPercentualContainer = document.getElementById('lotesPorPercentualList');
        console.log('Container de lotes por percentual:', lotesPercentualContainer);
        
        // Tentar coletar dados usando a nova função
        if (typeof coletarDadosLotes === 'function') {
            const dados = coletarDadosLotes();
            console.log('Dados coletados pela função coletarDadosLotes:', dados);
        }
    };
    
    // Monitorar quando lotes são adicionados
    document.addEventListener('DOMContentLoaded', function() {
        // Observer para detectar mudanças no container de lotes
        const containers = [
            document.getElementById('lotesPorDataList'),
            document.getElementById('lotesPorPercentualList')
        ];
        
        containers.forEach(container => {
            if (container) {
                const observer = new MutationObserver(function(mutations) {
                    console.log('🔄 Mudança detectada em', container.id);
                    console.log('Número de lotes no container:', container.children.length);
                });
                
                observer.observe(container, {
                    childList: true,
                    subtree: true
                });
            }
        });
        
        // Verificar estado inicial
        setTimeout(() => {
            console.log('🚀 Estado inicial dos lotes:');
            debugLotes();
        }, 1000);
    });
    
    // Interceptar funções de criação de lotes
    const originalCriarLoteData = window.criarLoteData;
    if (originalCriarLoteData) {
        window.criarLoteData = function() {
            console.log('🎯 criarLoteData chamada');
            const result = originalCriarLoteData.apply(this, arguments);
            setTimeout(() => {
                console.log('📋 Estado após criar lote por data:');
                debugLotes();
            }, 100);
            return result;
        };
    }
    
    const originalCriarLotePercentual = window.criarLotePercentual;
    if (originalCriarLotePercentual) {
        window.criarLotePercentual = function() {
            console.log('🎯 criarLotePercentual chamada');
            const result = originalCriarLotePercentual.apply(this, arguments);
            setTimeout(() => {
                console.log('📋 Estado após criar lote por percentual:');
                debugLotes();
            }, 100);
            return result;
        };
    }
})();
