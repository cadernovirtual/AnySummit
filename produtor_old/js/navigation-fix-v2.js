/**
 * Fix de Navegação V2
 * Garante que as funções nextStep e prevStep funcionem corretamente
 */
(function() {
    console.log('🔧 Fix de navegação V2 iniciado');
    
    // Garantir que validateStep existe
    if (typeof window.validateStep !== 'function') {
        window.validateStep = function(stepNumber) {
            console.log(`📋 Validação básica do step ${stepNumber}`);
            
            switch(stepNumber) {
                case 1:
                    const eventName = document.getElementById('eventName');
                    if (!eventName || !eventName.value.trim()) {
                        console.log('❌ Nome do evento vazio');
                        return false;
                    }
                    break;
                    
                case 5:
                    // Validação especial para lotes
                    const loteCards = document.querySelectorAll('.lote-card');
                    const lotesPorData = document.getElementById('lotesPorData');
                    const lotesPorPercentual = document.getElementById('lotesPorPercentual');
                    
                    const totalLotes = loteCards.length + 
                                     (lotesPorData ? lotesPorData.children.length : 0) +
                                     (lotesPorPercentual ? lotesPorPercentual.children.length : 0);
                    
                    if (totalLotes === 0) {
                        console.log('❌ Nenhum lote cadastrado');
                        
                        // Mostrar mensagem
                        const msg = document.querySelector('[data-step="5"] .validation-message') ||
                                   document.getElementById('step5ValidationMessage');
                        if (msg) {
                            msg.textContent = 'É necessário cadastrar pelo menos 1 lote';
                            msg.style.display = 'block';
                        }
                        return false;
                    }
                    break;
                    
                case 6:
                    const ticketList = document.getElementById('ticketList');
                    if (!ticketList || ticketList.children.length === 0) {
                        console.log('❌ Nenhum ingresso cadastrado');
                        return false;
                    }
                    break;
                    
                case 8:
                    const termsCheckbox = document.getElementById('termsCheckbox');
                    const termsAccepted = termsCheckbox?.classList.contains('checked') || 
                                        window.termsState?.accepted || false;
                    if (!termsAccepted) {
                        console.log('❌ Termos não aceitos');
                        return false;
                    }
                    break;
            }
            
            console.log(`✅ Step ${stepNumber} válido`);
            return true;
        };
    }
    
    // Garantir que updateStepDisplay existe
    if (typeof window.updateStepDisplay !== 'function') {
        window.updateStepDisplay = function() {
            const currentStep = window.currentStep || 1;
            console.log(`🎨 Atualizando display para step ${currentStep}`);
            
            // Esconder todos os steps
            document.querySelectorAll('[data-step-content]').forEach(step => {
                step.style.display = 'none';
            });
            
            // Mostrar step atual
            const currentStepEl = document.querySelector(`[data-step-content="${currentStep}"]`);
            if (currentStepEl) {
                currentStepEl.style.display = 'block';
            }
            
            // Atualizar indicadores
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                indicator.classList.remove('active', 'completed');
                
                if (index < currentStep - 1) {
                    indicator.classList.add('completed');
                } else if (index === currentStep - 1) {
                    indicator.classList.add('active');
                }
            });
            
            // Atualizar botões
            const backBtn = document.querySelector('.btn-back');
            if (backBtn) {
                backBtn.disabled = currentStep === 1;
            }
            
            // Scroll para o topo
            window.scrollTo(0, 0);
        };
    }
    
    console.log('✅ Fix de navegação instalado');
})();