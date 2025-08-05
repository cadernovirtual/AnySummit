// Correções forçadas - executar após tudo carregar
console.log('🔧 Aplicando correções forçadas...');

// 1. CORRIGIR VALIDAÇÃO DA ETAPA 5
(function() {
    // Aguardar nextStep original
    const interval = setInterval(function() {
        if (window.nextStep) {
            clearInterval(interval);
            
            const originalNextStep = window.nextStep;
            window.nextStep = function() {
                console.log('🚀 nextStep interceptado - step atual:', window.getCurrentStep ? window.getCurrentStep() : 'unknown');
                
                // Se estiver na etapa 5, validar lotes
                const currentStep = window.getCurrentStep ? window.getCurrentStep() : 
                                   (window.wizardState ? window.wizardState.currentStep : 1);
                
                if (currentStep === 5) {
                    const loteCards = document.querySelectorAll('.lote-card');
                    console.log('Lotes encontrados:', loteCards.length);
                    
                    if (!loteCards || loteCards.length === 0) {
                        // Mostrar mensagem
                        const validationMsg = document.getElementById('validation-step-5');
                        if (validationMsg) {
                            validationMsg.style.display = 'block';
                            validationMsg.classList.add('show');
                            setTimeout(() => {
                                validationMsg.classList.remove('show');
                            }, 3000);
                        }
                        
                        if (window.customDialog && window.customDialog.warning) {
                            window.customDialog.warning(
                                'Atenção',
                                'Você precisa cadastrar pelo menos 1 lote para prosseguir.'
                            );
                        } else {
                            alert('Você precisa cadastrar pelo menos 1 lote para prosseguir.');
                        }
                        
                        console.log('❌ Bloqueado - sem lotes');
                        return false;
                    }
                }
                
                // Chamar original
                return originalNextStep.apply(this, arguments);
            };
            
            console.log('✅ Validação de lote na etapa 5 aplicada');
        }
    }, 100);
})();

// 2. CORRIGIR PROTEÇÃO DE LOTES
(function() {
    window.loteTemIngressos = function(loteId) {
        console.log('🔍 [FORCED] Verificando ingressos do lote:', loteId);
        
        // Verificar no DOM
        const ticketItems = document.querySelectorAll('.ticket-item');
        let count = 0;
        
        ticketItems.forEach(item => {
            if (item.dataset.loteId === loteId) {
                count++;
            }
        });
        
        // Verificar dados salvos
        try {
            const savedData = getCookie('eventoWizard');
            if (savedData) {
                const wizardData = JSON.parse(savedData);
                if (wizardData.ingressos) {
                    wizardData.ingressos.forEach(ingresso => {
                        if (ingresso.loteId === loteId) {
                            count++;
                        }
                    });
                }
                if (wizardData.tickets) {
                    wizardData.tickets.forEach(ticket => {
                        if (ticket.loteId === loteId) {
                            count++;
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Erro ao verificar dados salvos:', e);
        }
        
        console.log(`Lote ${loteId} tem ${count} ingressos`);
        return count > 0;
    };
    
    // Interceptar excluirLoteData
    const interval2 = setInterval(function() {
        if (window.excluirLoteData) {
            clearInterval(interval2);
            
            const original = window.excluirLoteData;
            window.excluirLoteData = function(id) {
                console.log('🗑️ Tentando excluir lote data:', id);
                
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
                
                return original.apply(this, arguments);
            };
            
            console.log('✅ Proteção de lote por data aplicada');
        }
    }, 100);
    
    // Interceptar excluirLotePercentual
    const interval3 = setInterval(function() {
        if (window.excluirLotePercentual) {
            clearInterval(interval3);
            
            const original = window.excluirLotePercentual;
            window.excluirLotePercentual = function(id) {
                console.log('🗑️ Tentando excluir lote percentual:', id);
                
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
                
                return original.apply(this, arguments);
            };
            
            console.log('✅ Proteção de lote percentual aplicada');
        }
    }, 100);
})();

// 3. FORÇAR DATAS NA EDIÇÃO
(function() {
    // Garantir que a função existe
    if (!window.applyLoteDatesToTicket) {
        window.applyLoteDatesToTicket = function(loteId, modal) {
            console.log('📅 [FORCED] Aplicando datas do lote:', loteId);
            
            if (!loteId || !modal) return;
            
            const loteCard = document.querySelector(`[data-lote-id="${loteId}"]`);
            if (!loteCard) return;
            
            if (loteCard.classList.contains('por-data')) {
                // Extrair datas
                const dataInicioEl = loteCard.querySelector('.lote-data-inicio');
                const dataFimEl = loteCard.querySelector('.lote-data-fim');
                
                if (dataInicioEl && dataFimEl) {
                    const dataInicio = dataInicioEl.textContent;
                    const dataFim = dataFimEl.textContent;
                    
                    console.log('Datas encontradas:', { dataInicio, dataFim });
                    
                    // Converter para datetime-local
                    const convertDate = (dateText) => {
                        const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
                        if (match) {
                            const [_, dia, mes, ano, hora, minuto] = match;
                            return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
                        }
                        return '';
                    };
                    
                    const dataInicioFormatted = convertDate(dataInicio);
                    const dataFimFormatted = convertDate(dataFim);
                    
                    // Aplicar em todos os campos possíveis
                    const startInputs = modal.querySelectorAll('[id*="SaleStart"], [id*="sale-start"]');
                    const endInputs = modal.querySelectorAll('[id*="SaleEnd"], [id*="sale-end"]');
                    
                    startInputs.forEach(input => {
                        if (dataInicioFormatted) {
                            input.value = dataInicioFormatted;
                            input.readOnly = true;
                            input.style.backgroundColor = '#f5f5f5';
                            console.log('✅ Data início aplicada em:', input.id);
                        }
                    });
                    
                    endInputs.forEach(input => {
                        if (dataFimFormatted) {
                            input.value = dataFimFormatted;
                            input.readOnly = true;
                            input.style.backgroundColor = '#f5f5f5';
                            console.log('✅ Data fim aplicada em:', input.id);
                        }
                    });
                }
            }
        };
    }
    
    // Re-interceptar editTicket
    const interval4 = setInterval(function() {
        if (window.editTicket) {
            clearInterval(interval4);
            
            const original = window.editTicket;
            window.editTicket = function(ticketId) {
                console.log('📝 [FORCED] Editando ticket:', ticketId);
                
                const result = original.apply(this, arguments);
                
                // Forçar aplicação de datas
                setTimeout(function() {
                    const ticketEl = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                    if (ticketEl) {
                        const loteId = ticketEl.dataset.loteId;
                        const type = ticketEl.dataset.ticketType;
                        
                        let modalId = '';
                        if (type === 'free' || type === 'gratuito') {
                            modalId = 'editFreeTicketModal';
                        } else if (type === 'paid' || type === 'pago') {
                            modalId = 'editPaidTicketModal';
                        }
                        
                        const modal = document.getElementById(modalId);
                        if (modal && loteId) {
                            window.applyLoteDatesToTicket(loteId, modal);
                        }
                    }
                }, 800);
                
                return result;
            };
            
            console.log('✅ Edit ticket interceptado');
        }
    }, 100);
})();

console.log('✅ Correções forçadas aplicadas!');