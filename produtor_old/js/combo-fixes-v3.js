// Correções finais V3 - Layout, detalhes e publicação
(function() {
    console.log('🔧 Aplicando correções finais V3...');
    
    function aplicarCorrecoes() {
        // =============== CORREÇÃO 1: LAYOUT DO MODAL COMBO ===============
        const modalCombo = document.querySelector('#comboTicketModal .modal');
        if (modalCombo) {
            // Aumentar altura mínima e ajustar padding
            modalCombo.style.minHeight = '90vh';
            modalCombo.style.maxHeight = '95vh';
            
            // Reduzir espaço após header
            const modalBody = modalCombo.querySelector('.modal-header + *');
            if (modalBody) {
                modalBody.style.marginTop = '10px'; // Reduzir de 20px para 10px
            }
            
            // Ajustar primeiro form-group
            const firstFormGroup = modalCombo.querySelector('.form-group.full-width');
            if (firstFormGroup) {
                firstFormGroup.style.marginTop = '5px';
            }
        }
        
        // =============== CORREÇÃO 2: ESCONDER COMBO-ITEM-DETAILS ===============
        // CSS para esconder todos os combo-item-details
        if (!document.getElementById('hide-combo-details-css')) {
            const style = document.createElement('style');
            style.id = 'hide-combo-details-css';
            style.textContent = `
                /* Esconder detalhes do combo (geralmente o preço 0) */
                .combo-item-details {
                    display: none !important;
                }
                
                /* Ajustes adicionais no modal */
                #comboTicketModal .modal {
                    min-height: 90vh !important;
                    max-height: 95vh !important;
                    overflow-y: auto;
                }
                
                #comboTicketModal .modal-header + * {
                    margin-top: 10px !important;
                }
                
                #comboTicketModal .form-group.full-width:first-of-type {
                    margin-top: 5px !important;
                }
                
                /* Compactar ainda mais o form */
                #comboTicketModal .form-group {
                    margin-bottom: 10px !important;
                }
                
                #comboTicketModal .form-group label {
                    margin-bottom: 3px !important;
                    font-size: 12px !important;
                }
                
                /* Ajustar padding do modal */
                #comboTicketModal .modal {
                    padding: 15px 20px !important;
                }
                
                /* Garantir que não há margens extras */
                #comboTicketModal .info-banner {
                    display: none !important;
                    margin: 0 !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Aplicar também via JavaScript para garantir
        document.querySelectorAll('.combo-item-details').forEach(el => {
            el.style.display = 'none';
        });
        
        // =============== CORREÇÃO 3: FUNÇÃO PUBLISHEVENT ===============
        // Garantir que publishEvent está disponível globalmente
        if (!window.publishEvent && window.publishEvent !== undefined) {
            console.log('⚠️ publishEvent não encontrada, criando fallback...');
            
            window.publishEvent = async function() {
                console.log('🚀 Publicando evento...');
                
                // Tentar encontrar a função no contexto
                if (typeof validateStep === 'function' && typeof enviarEventoParaAPI === 'function') {
                    if (validateStep(8)) { // Step 8 é o último
                        const publishBtn = document.querySelector('.btn-publish');
                        if (publishBtn) {
                            publishBtn.textContent = 'Publicando evento...';
                            publishBtn.disabled = true;
                        }
                        
                        const sucesso = await enviarEventoParaAPI();
                        
                        if (!sucesso && publishBtn) {
                            publishBtn.textContent = '✓ Publicar evento';
                            publishBtn.disabled = false;
                        }
                    }
                } else {
                    // Fallback simples
                    alert('Preparando para publicar o evento...\nPor favor, verifique se todos os campos foram preenchidos corretamente.');
                    
                    // Tentar chamar função de validação se existir
                    if (typeof validateStep === 'function') {
                        validateStep(8);
                    }
                }
            };
        }
        
        // =============== CORREÇÃO 4: OBSERVER PARA NOVOS ELEMENTOS ===============
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    // Esconder novos combo-item-details
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && node.classList.contains('combo-item-details')) {
                                node.style.display = 'none';
                            }
                            // Procurar dentro do node também
                            const details = node.querySelectorAll ? node.querySelectorAll('.combo-item-details') : [];
                            details.forEach(el => el.style.display = 'none');
                        }
                    });
                }
            });
        });
        
        // Observar body para mudanças
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log('✅ Correções V3 aplicadas!');
    }
    
    // Aplicar imediatamente
    aplicarCorrecoes();
    
    // Aplicar quando DOM estiver pronto
    if (document.readyState !== 'loading') {
        aplicarCorrecoes();
    } else {
        document.addEventListener('DOMContentLoaded', aplicarCorrecoes);
    }
    
    // Garantir que publishEvent existe após carregamento
    window.addEventListener('load', function() {
        aplicarCorrecoes();
        
        // Verificar publishEvent especificamente
        if (!window.publishEvent) {
            console.error('❌ publishEvent ainda não está definida após load!');
            
            // Forçar criação
            window.publishEvent = function() {
                console.log('📤 publishEvent chamada (fallback forçado)');
                
                // Buscar currentStep se existir
                const currentStep = window.currentStep || 8;
                
                // Validar step atual
                if (typeof window.validateStep === 'function') {
                    if (window.validateStep(currentStep)) {
                        console.log('✅ Validação OK, prosseguindo...');
                        
                        // Buscar função de envio
                        if (typeof window.enviarEventoParaAPI === 'function') {
                            window.enviarEventoParaAPI();
                        } else {
                            alert('Função de publicação não encontrada. Por favor, recarregue a página e tente novamente.');
                        }
                    }
                } else {
                    alert('Sistema de validação não encontrado. Por favor, recarregue a página.');
                }
            };
        }
    });
    
    // Aplicar quando modal abrir
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
    
})();