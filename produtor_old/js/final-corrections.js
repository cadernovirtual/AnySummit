// Arquivo para garantir que todas as correções sejam aplicadas
// Deve ser carregado por último

(function() {
    console.log('🚀 Aplicando todas as correções finais...');
    
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(function() {
        // 1. Verificar e re-aplicar proteção de lotes se necessário
        if (typeof window.loteTemIngressos !== 'function') {
            console.warn('⚠️ Função loteTemIngressos não encontrada, criando...');
            
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
                
                // Também verificar dados persistidos
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
                
                return temIngressos;
            };
        }
        
        // 2. Re-aplicar override de editTicket para datas
        if (window.editTicket && typeof window.applyLoteDatesToTicket === 'function') {
            const originalEditTicket = window.editTicket;
            window.editTicket = function(ticketId) {
                console.log('📝 [FINAL] Editando ingresso:', ticketId);
                
                // Chamar função original
                const result = originalEditTicket.apply(this, arguments);
                
                // Aplicar correções após delay
                setTimeout(function() {
                    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                    if (ticketElement) {
                        const loteId = ticketElement.dataset.loteId;
                        const ticketType = ticketElement.dataset.ticketType;
                        
                        let modal;
                        if (ticketType === 'free' || ticketType === 'gratuito') {
                            modal = document.getElementById('editFreeTicketModal');
                        } else if (ticketType === 'paid' || ticketType === 'pago') {
                            modal = document.getElementById('editPaidTicketModal');
                        }
                        
                        if (modal && loteId) {
                            console.log('Aplicando datas do lote:', loteId);
                            window.applyLoteDatesToTicket(loteId, modal);
                        }
                        
                        // Calcular valores para ingresso pago
                        if ((ticketType === 'paid' || ticketType === 'pago') && 
                            typeof window.calculateEditPaidTicketValues === 'function') {
                            window.calculateEditPaidTicketValues();
                        }
                    }
                }, 500);
                
                return result;
            };
        }
        
        // 3. Re-aplicar override de editCombo
        if (window.editCombo && typeof window.applyLoteDatesToTicket === 'function') {
            const originalEditCombo = window.editCombo;
            window.editCombo = function(comboId) {
                console.log('📝 [FINAL] Editando combo:', comboId);
                
                // Chamar função original
                const result = originalEditCombo.apply(this, arguments);
                
                // Aplicar correções após delay
                setTimeout(function() {
                    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
                    if (comboElement) {
                        const loteId = comboElement.dataset.loteId;
                        const modal = document.getElementById('editComboModal');
                        
                        if (modal && loteId) {
                            console.log('Aplicando datas do lote ao combo:', loteId);
                            window.applyLoteDatesToTicket(loteId, modal);
                        }
                        
                        // Calcular valores do combo
                        if (typeof window.calculateEditComboValues === 'function') {
                            window.calculateEditComboValues();
                        }
                    }
                }, 500);
                
                return result;
            };
        }
        
        console.log('✅ Todas as correções finais aplicadas!');
        
        // Mostrar status final
        console.log('Status Final:');
        console.log('- loteTemIngressos:', typeof window.loteTemIngressos);
        console.log('- applyLoteDatesToTicket:', typeof window.applyLoteDatesToTicket);
        console.log('- calculateEditComboValues:', typeof window.calculateEditComboValues);
        console.log('- validateStep:', typeof window.validateStep);
        
    }, 1000);
})();
