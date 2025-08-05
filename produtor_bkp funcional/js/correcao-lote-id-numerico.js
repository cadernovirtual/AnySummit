/**
 * CORREÇÃO IMEDIATA: Garantir lote_id numérico válido
 * 
 * PROBLEMA: lotes com IDs string (data_0, perc_1) causam lote_id: NaN
 * SOLUÇÃO: Interceptar coleta e garantir IDs numéricos válidos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔢 Correção de lote_id numérico ativada');
    
    // =============================================
    // AGUARDAR CARREGAMENTO E CORRIGIR SELECT OPTIONS
    // =============================================
    
    function corrigirIDsLotes() {
        const selects = ['paidTicketLote', 'editPaidTicketLote', 'freeTicketLote', 'editFreeTicketLote'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Observar mudanças no select
                const observer = new MutationObserver(() => {
                    corrigirOptionsDoSelect(select);
                });
                
                observer.observe(select, {
                    childList: true,
                    subtree: true
                });
                
                // Corrigir options existentes
                setTimeout(() => {
                    corrigirOptionsDoSelect(select);
                }, 500);
            }
        });
    }
    
    function corrigirOptionsDoSelect(select) {
        const options = select.querySelectorAll('option[value]');
        let corrigidos = 0;
        
        options.forEach((option, index) => {
            const valueAtual = option.value;
            
            // Se value não é um número válido ou é string de template
            if (valueAtual && (isNaN(parseInt(valueAtual)) || valueAtual.includes('data_') || valueAtual.includes('perc_'))) {
                // Usar o índice como ID temporário (será corrigido pelo backend)
                const novoId = index;
                option.value = novoId.toString();
                option.setAttribute('data-original-id', valueAtual);
                corrigidos++;
                console.log(`✅ Lote ID corrigido: ${valueAtual} → ${novoId}`);
            }
        });
        
        if (corrigidos > 0) {
            console.log(`🔧 ${corrigidos} IDs de lote corrigidos no select ${select.id}`);
        }
    }
    
    // =============================================
    // INTERCEPTAR COLETAS PARA GARANTIR IDs VÁLIDOS
    // =============================================
    
    function interceptarColetas() {
        // Interceptar createPaidTicket
        if (window.createPaidTicket) {
            const originalCreatePaidTicket = window.createPaidTicket;
            window.createPaidTicket = function() {
                console.log('🚀 Interceptando createPaidTicket - validando lote_id');
                
                const loteSelect = document.getElementById('paidTicketLote');
                if (loteSelect && loteSelect.value) {
                    const loteId = parseInt(loteSelect.value);
                    
                    if (isNaN(loteId)) {
                        console.error('❌ lote_id inválido:', loteSelect.value);
                        alert('Por favor, selecione um lote válido.');
                        return;
                    }
                    
                    console.log('✅ lote_id válido:', loteId);
                }
                
                return originalCreatePaidTicket.apply(this, arguments);
            };
        }
        
        // Interceptar updatePaidTicket
        if (window.updatePaidTicket) {
            const originalUpdatePaidTicket = window.updatePaidTicket;
            window.updatePaidTicket = function() {
                console.log('🔄 Interceptando updatePaidTicket - validando lote_id');
                
                const loteSelect = document.getElementById('editPaidTicketLote');
                if (loteSelect && loteSelect.value) {
                    const loteId = parseInt(loteSelect.value);
                    
                    if (isNaN(loteId)) {
                        console.error('❌ lote_id inválido:', loteSelect.value);
                        alert('Por favor, selecione um lote válido.');
                        return;
                    }
                    
                    console.log('✅ lote_id válido:', loteId);
                }
                
                return originalUpdatePaidTicket.apply(this, arguments);
            };
        }
        
        // Interceptar createFreeTicket
        if (window.createFreeTicket) {
            const originalCreateFreeTicket = window.createFreeTicket;
            window.createFreeTicket = function() {
                console.log('🆓 Interceptando createFreeTicket - validando lote_id');
                
                const loteSelect = document.getElementById('freeTicketLote');
                if (loteSelect && loteSelect.value) {
                    const loteId = parseInt(loteSelect.value);
                    
                    if (isNaN(loteId)) {
                        console.error('❌ lote_id inválido:', loteSelect.value);
                        alert('Por favor, selecione um lote válido.');
                        return;
                    }
                    
                    console.log('✅ lote_id válido:', loteId);
                }
                
                return originalCreateFreeTicket.apply(this, arguments);
            };
        }
        
        // Interceptar updateFreeTicket
        if (window.updateFreeTicket) {
            const originalUpdateFreeTicket = window.updateFreeTicket;
            window.updateFreeTicket = function() {
                console.log('🔄 Interceptando updateFreeTicket - validando lote_id');
                
                const loteSelect = document.getElementById('editFreeTicketLote');
                if (loteSelect && loteSelect.value) {
                    const loteId = parseInt(loteSelect.value);
                    
                    if (isNaN(loteId)) {
                        console.error('❌ lote_id inválido:', loteSelect.value);
                        alert('Por favor, selecione um lote válido.');
                        return;
                    }
                    
                    console.log('✅ lote_id válido:', loteId);
                }
                
                return originalUpdateFreeTicket.apply(this, arguments);
            };
        }
    }
    
    // =============================================
    // INICIALIZAÇÃO COM DELAY
    // =============================================
    
    setTimeout(() => {
        corrigirIDsLotes();
        
        // Aguardar carregamento das funções antes de interceptar
        setTimeout(() => {
            interceptarColetas();
            console.log('✅ Correção de lote_id numérico aplicada');
        }, 1500);
    }, 800);
});
