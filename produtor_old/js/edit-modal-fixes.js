// Correções adicionais para edição de ingressos
// Garante que datas e cálculos funcionem ao abrir modais de edição

(function() {
    console.log('🔧 Aplicando correções para modais de edição...');
    
    // Aguardar carregamento completo do DOM e das funções
    function initEditModalFixes() {
        console.log('🚀 Iniciando correções de modais de edição...');
        
        // Override da função editTicket para aplicar datas do lote
        const originalEditTicket = window.editTicket;
        if (originalEditTicket) {
            window.editTicket = function(ticketId) {
                console.log('📝 Editando ingresso:', ticketId);
                
                // Chamar função original
                const result = originalEditTicket.apply(this, arguments);
                
                // Buscar dados do ticket
                const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                if (ticketElement) {
                    const loteId = ticketElement.dataset.loteId;
                    const ticketType = ticketElement.dataset.ticketType;
                    
                    console.log('Dados do ticket:', { loteId, ticketType });
                    
                    // Aplicar datas do lote após abrir modal
                    setTimeout(function() {
                        let modal;
                        if (ticketType === 'free' || ticketType === 'gratuito') {
                            modal = document.getElementById('editFreeTicketModal');
                        } else if (ticketType === 'paid' || ticketType === 'pago') {
                            modal = document.getElementById('editPaidTicketModal');
                        }
                        
                        if (modal && loteId && window.applyLoteDatesToTicket) {
                            console.log('Aplicando datas do lote ao modal:', modal.id);
                            window.applyLoteDatesToTicket(loteId, modal);
                        }
                        
                        // Para ingresso pago, calcular valores
                        if (ticketType === 'paid' || ticketType === 'pago') {
                            calculateEditPaidTicketValues();
                        }
                    }, 300);
                }
                
                return result;
            };
            console.log('✅ Override de editTicket aplicado');
        }
        
        // Override da função editCombo
        const originalEditCombo = window.editCombo;
        if (originalEditCombo) {
            window.editCombo = function(comboId) {
                console.log('📝 Editando combo:', comboId);
                
                // Chamar função original
                const result = originalEditCombo.apply(this, arguments);
                
                // Buscar dados do combo
                const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
                if (comboElement) {
                    const loteId = comboElement.dataset.loteId;
                    
                    console.log('Lote do combo:', loteId);
                    
                    // Aplicar datas e calcular valores após abrir modal
                    setTimeout(function() {
                        const modal = document.getElementById('editComboModal');
                        
                        if (modal && loteId && window.applyLoteDatesToTicket) {
                            console.log('Aplicando datas do lote ao modal de combo');
                            window.applyLoteDatesToTicket(loteId, modal);
                        }
                        
                        // Calcular valores do combo
                        if (window.calculateEditComboValues) {
                            window.calculateEditComboValues();
                        }
                    }, 300);
                }
                
                return result;
            };
            console.log('✅ Override de editCombo aplicado');
        }
        
        // Função para calcular valores do ingresso pago editado
        window.calculateEditPaidTicketValues = function() {
            console.log('💰 Calculando valores do ingresso pago editado...');
            
            const priceInput = document.getElementById('editPaidTicketPrice');
            const taxaCheckbox = document.getElementById('editPaidTicketServiceTax');
            const receiveSpan = document.getElementById('editPaidTicketReceiveAmount');
            const taxSpan = document.getElementById('editPaidTicketTaxAmount');
            
            if (!priceInput) {
                console.warn('Campo de preço não encontrado');
                return;
            }
            
            const price = parseFloat(priceInput.value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            const taxaAtiva = taxaCheckbox ? taxaCheckbox.checked : true;
            
            let valorReceber = price;
            let valorTaxa = 0;
            
            if (taxaAtiva && price > 0) {
                valorTaxa = price * 0.10;
                valorReceber = price - valorTaxa;
            }
            
            if (receiveSpan) {
                receiveSpan.textContent = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
            }
            
            if (taxSpan) {
                taxSpan.textContent = `R$ ${valorTaxa.toFixed(2).replace('.', ',')}`;
            }
            
            console.log('Valores calculados:', { price, valorTaxa, valorReceber });
        };
        
        // Adicionar listeners para recalcular valores na edição
        const editPriceInput = document.getElementById('editPaidTicketPrice');
        if (editPriceInput) {
            editPriceInput.addEventListener('input', window.calculateEditPaidTicketValues);
            editPriceInput.addEventListener('blur', window.calculateEditPaidTicketValues);
        }
        
        // Listener para checkbox de taxa
        const editTaxCheckbox = document.getElementById('editPaidTicketServiceTax');
        if (editTaxCheckbox) {
            editTaxCheckbox.addEventListener('change', window.calculateEditPaidTicketValues);
        }
        
        console.log('✅ Correções para modais de edição aplicadas!');
    }
    
    // Aguardar DOM e funções necessárias
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initEditModalFixes, 500);
        });
    } else {
        setTimeout(initEditModalFixes, 500);
    }
})();
