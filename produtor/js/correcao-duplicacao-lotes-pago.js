/**
 * CORREÇÃO ESPECÍFICA PARA DUPLICAÇÃO DE LOTES NO MODAL DE INGRESSO PAGO
 * Problema: Ao selecionar um lote e cancelar, na próxima abertura os lotes aparecem duplicados
 */

(function() {
    'use strict';
    
    console.log('🔧 Aplicando correção para duplicação de lotes no modal pago...');
    
    // Estado do select para controle
    let selectEstadoLimpo = true;
    
    /**
     * Limpar completamente o select de lotes
     */
    function limparSelectLotesPago() {
        const select = document.getElementById('paidTicketLote');
        if (select) {
            // Remover todos os options exceto o primeiro (placeholder)
            const opcoes = select.querySelectorAll('option');
            opcoes.forEach((option, index) => {
                if (index > 0) { // Manter apenas o primeiro option (placeholder)
                    option.remove();
                }
            });
            
            // Resetar valor
            select.value = '';
            select.selectedIndex = 0;
            
            console.log('🧹 Select de lotes pago limpo');
        }
    }
    
    /**
     * Interceptar função de abrir modal de ingresso pago
     */
    const originalOpenPaidTicketModal = window.openPaidTicketModal;
    window.openPaidTicketModal = function() {
        console.log('🎯 Interceptando abertura do modal de ingresso pago...');
        
        // Limpar select ANTES de abrir o modal
        limparSelectLotesPago();
        selectEstadoLimpo = true;
        
        // Chamar função original
        if (typeof originalOpenPaidTicketModal === 'function') {
            return originalOpenPaidTicketModal.apply(this, arguments);
        }
    };
    
    /**
     * Interceptar função de fechar modal
     */
    const originalCloseModal = window.closeModal;
    window.closeModal = function(modalId) {
        console.log(`🎯 Interceptando fechamento do modal: ${modalId}`);
        
        // Se está fechando o modal de ingresso pago, limpar o select
        if (modalId === 'paidTicketModal') {
            console.log('🧹 Limpando select de lotes ao fechar modal pago');
            limparSelectLotesPago();
            selectEstadoLimpo = true;
        }
        
        // Chamar função original
        if (typeof originalCloseModal === 'function') {
            return originalCloseModal.apply(this, arguments);
        }
    };
    
    /**
     * Interceptar carregamento de lotes para modal de criação
     */
    const originalCarregarLotesParaSelect = window.carregarLotesParaSelect;
    window.carregarLotesParaSelect = function(selectId) {
        console.log(`🎯 Interceptando carregamento de lotes para: ${selectId}`);
        
        // Se é o select de ingresso pago, limpar antes de carregar
        if (selectId === 'paidTicketLote') {
            if (!selectEstadoLimpo) {
                console.log('🧹 Limpando select antes de carregar (estado sujo detectado)');
                limparSelectLotesPago();
            }
            selectEstadoLimpo = false; // Marcar como "carregado"
        }
        
        // Chamar função original
        if (typeof originalCarregarLotesParaSelect === 'function') {
            return originalCarregarLotesParaSelect.apply(this, arguments);
        }
    };
    
    /**
     * Observar mudanças no select para detectar quando foi alterado
     */
    function observarSelectLotes() {
        const select = document.getElementById('paidTicketLote');
        if (select) {
            select.addEventListener('change', function() {
                console.log('📝 Select de lotes foi alterado');
                selectEstadoLimpo = false;
            });
        }
    }
    
    /**
     * Interceptar todas as funções que podem carregar lotes
     */
    function interceptarFuncoesCarregamento() {
        const funcoesCarregamento = [
            'carregarTodosOsLotes',
            'carregarLotesComTipo', 
            'carregarLotesUnificado',
            'carregarLotesParaModal',
            'loadLotesForSelect'
        ];
        
        funcoesCarregamento.forEach(nomeFuncao => {
            const funcaoOriginal = window[nomeFuncao];
            if (typeof funcaoOriginal === 'function') {
                window[nomeFuncao] = function(...args) {
                    // Se o primeiro argumento é 'paidTicketLote', limpar antes
                    if (args[0] === 'paidTicketLote') {
                        console.log(`🧹 Limpando antes de ${nomeFuncao}(${args[0]})`);
                        limparSelectLotesPago();
                    }
                    
                    return funcaoOriginal.apply(this, arguments);
                };
            }
        });
    }
    
    // Aplicar interceptações quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            observarSelectLotes();
            interceptarFuncoesCarregamento();
        });
    } else {
        observarSelectLotes();
        interceptarFuncoesCarregamento();
    }
    
    console.log('✅ Correção de duplicação de lotes aplicada!');
})();

/**
 * FUNÇÃO GLOBAL PARA FORÇAR LIMPEZA MANUAL
 */
window.forcarLimpezaLotesPago = function() {
    const select = document.getElementById('paidTicketLote');
    if (select) {
        const opcoes = select.querySelectorAll('option');
        opcoes.forEach((option, index) => {
            if (index > 0) {
                option.remove();
            }
        });
        select.value = '';
        select.selectedIndex = 0;
        console.log('🧹 Limpeza manual de lotes pago executada');
    }
};

console.log('✅ Sistema anti-duplicação de lotes carregado!');
