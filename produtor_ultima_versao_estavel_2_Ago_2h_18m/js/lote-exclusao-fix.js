/**
 * Correção para exclusão de lotes usando window.customDialog
 * AnySummit - Sistema de Gestão de Eventos
 */

(function() {
    console.log('🔧 Iniciando correção de exclusão de lotes...');
    
    // Aguardar carregamento do DOM e dos scripts necessários
    function initLoteExclusaoFix() {
        // Verificar se window.customDialog está disponível
        if (!window.customDialog || !window.customDialog.confirm) {
            console.warn('⏳ window.customDialog ainda não está disponível, aguardando...');
            setTimeout(initLoteExclusaoFix, 100);
            return;
        }
        
        console.log('✅ window.customDialog disponível, aplicando correções...');
        
        // Sobrescrever função de exclusão de lote por data
        window.excluirLoteData = function(id) {
            console.log('🗑️ Tentando excluir lote por data:', id);
            
            // Verificar se há ingressos associados a este lote
            const lote = window.lotesData.porData.find(l => l.id === id);
            if (lote && window.verificarIngressosNoLote && window.verificarIngressosNoLote(lote.id)) {
                window.customDialog.alert('Não é possível excluir este lote pois existem ingressos associados a ele. Exclua os ingressos primeiro.', 'error');
                return;
            }
            
            // Usar window.customDialog.confirm
            window.customDialog.confirm(
                'Tem certeza que deseja excluir este lote?',
                function() {
                    // Callback de confirmação
                    window.lotesData.porData = window.lotesData.porData.filter(function(l) { 
                        return l.id !== id; 
                    });
                    
                    // Renomear lotes
                    if (window.renomearLotesAutomaticamente) {
                        window.renomearLotesAutomaticamente();
                    }
                    
                    // Atualizar visualização
                    if (window.renderizarLotesPorData) {
                        window.renderizarLotesPorData();
                    }
                    
                    // Salvar no cookie
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                    
                    // Mostrar mensagem de sucesso
                    window.customDialog.alert('Lote excluído com sucesso!', 'success');
                    
                    console.log('✅ Lote por data excluído:', id);
                }
            );
        };
        
        // Sobrescrever função de exclusão de lote por percentual
        window.excluirLotePercentual = function(id) {
            console.log('🗑️ Tentando excluir lote por percentual:', id);
            
            // Verificar se há ingressos associados a este lote
            const lote = window.lotesData.porPercentual.find(l => l.id === id);
            if (lote && window.verificarIngressosNoLote && window.verificarIngressosNoLote(lote.id)) {
                window.customDialog.alert('Não é possível excluir este lote pois existem ingressos associados a ele. Exclua os ingressos primeiro.', 'error');
                return;
            }
            
            // Usar window.customDialog.confirm
            window.customDialog.confirm(
                'Tem certeza que deseja excluir este lote?',
                function() {
                    // Callback de confirmação
                    window.lotesData.porPercentual = window.lotesData.porPercentual.filter(function(l) { 
                        return l.id !== id; 
                    });
                    
                    // Renomear lotes
                    if (window.renomearLotesAutomaticamente) {
                        window.renomearLotesAutomaticamente();
                    }
                    
                    // Atualizar visualização
                    if (window.renderizarLotesPorPercentual) {
                        window.renderizarLotesPorPercentual();
                    }
                    
                    // Atualizar summary
                    if (window.atualizarSummaryPercentual) {
                        window.atualizarSummaryPercentual();
                    }
                    
                    // Salvar no cookie
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                    
                    // Mostrar mensagem de sucesso
                    window.customDialog.alert('Lote excluído com sucesso!', 'success');
                    
                    console.log('✅ Lote por percentual excluído:', id);
                }
            );
        };
        
        console.log('✅ Funções de exclusão de lotes corrigidas com sucesso!');
    }
    
    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoteExclusaoFix);
    } else {
        // DOM já carregado
        initLoteExclusaoFix();
    }
})();