// Validação para impedir exclusão de lotes com ingressos
// Este arquivo deve ser incluído após lotes.js

(function() {
    console.log('🔧 Aplicando proteção para exclusão de lotes com ingressos...');
    
    // Função para verificar se lote tem ingressos associados
    window.loteTemIngressos = function(loteId) {
        console.log('🔍 Verificando ingressos do lote:', loteId);
        
        // Buscar todos os ingressos no DOM
        const ticketItems = document.querySelectorAll('.ticket-item');
        let temIngressos = false;
        
        ticketItems.forEach(item => {
            if (item.dataset.loteId === loteId) {
                temIngressos = true;
            }
        });
        
        // Também verificar dados persistidos no cookie/localStorage
        const savedData = getCookie('eventoWizard');
        if (savedData) {
            try {
                const wizardData = JSON.parse(savedData);
                if (wizardData.ingressos && Array.isArray(wizardData.ingressos)) {
                    wizardData.ingressos.forEach(ingresso => {
                        if (ingresso.loteId === loteId) {
                            temIngressos = true;
                        }
                    });
                }
            } catch (e) {
                console.error('Erro ao verificar dados salvos:', e);
            }
        }
        
        console.log(`Lote ${loteId} tem ingressos:`, temIngressos);
        return temIngressos;
    };
    
    // Override da função excluirLoteData
    const originalExcluirLoteData = window.excluirLoteData;
    if (originalExcluirLoteData) {
        window.excluirLoteData = function(id) {
            console.log('Tentando excluir lote por data:', id);
            
            // Verificar se lote tem ingressos
            if (window.loteTemIngressos(id)) {
                if (window.customDialog && window.customDialog.warning) {
                    window.customDialog.warning(
                        'Não é possível excluir',
                        'Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.'
                    );
                } else {
                    alert('Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.');
                }
                return false;
            }
            
            // Se não tem ingressos, chamar função original
            return originalExcluirLoteData.apply(this, arguments);
        };
    }
    
    // Override da função excluirLotePercentual
    const originalExcluirLotePercentual = window.excluirLotePercentual;
    if (originalExcluirLotePercentual) {
        window.excluirLotePercentual = function(id) {
            console.log('Tentando excluir lote percentual:', id);
            
            // Verificar se lote tem ingressos
            if (window.loteTemIngressos(id)) {
                if (window.customDialog && window.customDialog.warning) {
                    window.customDialog.warning(
                        'Não é possível excluir',
                        'Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.'
                    );
                } else {
                    alert('Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.');
                }
                return false;
            }
            
            // Se não tem ingressos, chamar função original
            return originalExcluirLotePercentual.apply(this, arguments);
        };
    }
    
    console.log('✅ Proteção de lotes aplicada com sucesso!');
})();
