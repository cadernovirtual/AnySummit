// Correções finais para combos
(function() {
    console.log('🔧 Aplicando correções finais de combos...');
    
    function aplicarCorrecoes() {
        // =============== CORREÇÃO 1: LAYOUT DO MODAL ===============
        // Mover info-banner para o header e reduzir fonte
        const modal = document.getElementById('comboTicketModal');
        if (modal) {
            const infoBanner = modal.querySelector('.info-banner');
            const modalHeader = modal.querySelector('.modal-header');
            const modalTitle = modal.querySelector('.modal-title');
            
            if (infoBanner && modalHeader && modalTitle) {
                // Criar container flex para título e descrição
                if (!modalHeader.querySelector('.title-with-description')) {
                    // Criar novo container
                    const titleContainer = document.createElement('div');
                    titleContainer.className = 'title-with-description';
                    titleContainer.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 4px;';
                    
                    // Mover título para o container
                    modalTitle.style.cssText = 'font-size: 16px; font-weight: 600; margin: 0;';
                    titleContainer.appendChild(modalTitle);
                    
                    // Criar descrição
                    const description = document.createElement('div');
                    description.className = 'modal-description';
                    description.style.cssText = 'font-size: 11px; color: #666; font-weight: normal; line-height: 1.3;';
                    description.textContent = 'Um combo agrupa múltiplos tipos de ingresso em um único produto. O comprador paga pelo combo e recebe vouchers individuais.';
                    titleContainer.appendChild(description);
                    
                    // Inserir container antes do botão fechar
                    const closeBtn = modalHeader.querySelector('.modal-close');
                    modalHeader.insertBefore(titleContainer, closeBtn);
                    
                    // Remover info-banner original
                    infoBanner.style.display = 'none';
                    
                    // Ajustar header para flex
                    modalHeader.style.cssText = 'display: flex; align-items: flex-start; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #e0e0e0;';
                }
            }
        }
        
        // =============== CORREÇÃO 2: FILTRAR COMBOS DA LISTA ===============
        // Override da função que popula o select para garantir filtro
        if (window.populateComboTicketSelectByLote) {
            const originalPopulate = window.populateComboTicketSelectByLote;
            window.populateComboTicketSelectByLote = function(loteId) {
                console.log('🔍 Populando select com filtro de combos...');
                
                const select = document.getElementById('comboTicketTypeSelect');
                if (!select) return originalPopulate.apply(this, arguments);
                
                // Chamar função original
                originalPopulate.apply(this, arguments);
                
                // Filtrar opções para remover combos
                const options = Array.from(select.options);
                options.forEach(option => {
                    if (option.value) {
                        // Verificar se é combo pelo nome ou dados
                        const ticketData = option.dataset.ticketData;
                        const optionText = option.textContent.toLowerCase();
                        
                        // Remover se contém palavras indicativas de combo
                        if (optionText.includes('combo') || 
                            optionText.includes('pacote') || 
                            optionText.includes('kit')) {
                            option.remove();
                        }
                        
                        // Verificar também pelo elemento original se possível
                        if (ticketData) {
                            try {
                                const data = JSON.parse(ticketData);
                                const ticketElement = document.querySelector(`[data-ticket-id="${data.ticketId}"]`);
                                if (ticketElement) {
                                    const isCombo = ticketElement.querySelector('.ticket-type-badge.combo') ||
                                                   ticketElement.querySelector('.ticket-title')?.textContent?.includes('📦');
                                    if (isCombo) {
                                        option.remove();
                                    }
                                }
                            } catch (e) {
                                // Ignorar erros de parse
                            }
                        }
                    }
                });
                
                // Verificar se restou alguma opção válida
                if (select.options.length <= 1) {
                    select.innerHTML = '<option value="">Nenhum ingresso individual disponível neste lote</option>';
                }
            };
        }
        
        // =============== CORREÇÃO 3: CSS ADICIONAL ===============
        if (!document.getElementById('combo-final-fixes-css')) {
            const style = document.createElement('style');
            style.id = 'combo-final-fixes-css';
            style.textContent = `
                /* Ajustar altura do modal para evitar scroll */
                #comboTicketModal .modal {
                    max-height: 85vh;
                    overflow-y: auto;
                }
                
                /* Esconder info-banner original */
                #comboTicketModal .info-banner {
                    display: none !important;
                }
                
                /* Estilo do header com descrição */
                #comboTicketModal .modal-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    padding: 15px 20px;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                #comboTicketModal .title-with-description {
                    flex: 1;
                    margin-right: 20px;
                }
                
                #comboTicketModal .modal-title {
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    margin: 0 !important;
                    line-height: 1.2 !important;
                }
                
                #comboTicketModal .modal-description {
                    font-size: 11px !important;
                    color: #666 !important;
                    font-weight: normal !important;
                    line-height: 1.3 !important;
                    margin-top: 4px !important;
                }
                
                /* Compactar form para economizar espaço */
                #comboTicketModal .form-group {
                    margin-bottom: 12px;
                }
                
                #comboTicketModal label {
                    font-size: 12px;
                    margin-bottom: 4px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // =============== CORREÇÃO 4: FILTRO ADICIONAL AO ADICIONAR ===============
        if (window.addItemToCombo) {
            const originalAdd = window.addItemToCombo;
            window.addItemToCombo = function() {
                const select = document.getElementById('comboTicketTypeSelect');
                if (select && select.value) {
                    const selectedOption = select.options[select.selectedIndex];
                    const optionText = selectedOption.textContent.toLowerCase();
                    
                    // Verificar se não é combo
                    if (optionText.includes('combo') || optionText.includes('📦')) {
                        alert('Não é possível adicionar um combo dentro de outro combo.');
                        return;
                    }
                }
                
                return originalAdd.apply(this, arguments);
            };
        }
        
        console.log('✅ Correções finais aplicadas!');
    }
    
    // Aplicar quando DOM estiver pronto
    if (document.readyState === 'complete') {
        aplicarCorrecoes();
    } else {
        window.addEventListener('load', aplicarCorrecoes);
    }
    
    // Reaplicar quando modal for aberto
    const originalOpenModal = window.openModal;
    if (originalOpenModal) {
        window.openModal = function(modalId) {
            const result = originalOpenModal.apply(this, arguments);
            if (modalId === 'comboTicketModal') {
                setTimeout(aplicarCorrecoes, 100);
            }
            return result;
        };
    }
    
    // Aplicar novamente após delays
    setTimeout(aplicarCorrecoes, 1000);
    setTimeout(aplicarCorrecoes, 2000);
    
})();