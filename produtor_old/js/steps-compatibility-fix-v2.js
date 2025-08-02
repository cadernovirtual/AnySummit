/**
 * Fix de Compatibilidade de Steps V2
 * Garante que a navegação funcione com ambos os seletores
 */
(function() {
    console.log('🔧 Fix de compatibilidade de steps iniciado');
    
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // Verificar se existem section-cards e data-step-content
        const sectionCards = document.querySelectorAll('.section-card');
        const dataSteps = document.querySelectorAll('[data-step-content]');
        
        console.log(`📊 Section cards: ${sectionCards.length}, Data steps: ${dataSteps.length}`);
        
        // Se ambos existem, sincronizar
        if (sectionCards.length > 0 && dataSteps.length > 0) {
            console.log('🔄 Sincronizando seletores de steps...');
            
            // Adicionar data-step-content aos section-cards se não tiverem
            sectionCards.forEach(card => {
                if (!card.hasAttribute('data-step-content')) {
                    const stepNum = card.dataset.stepContent || card.dataset.step;
                    if (stepNum) {
                        card.setAttribute('data-step-content', stepNum);
                        console.log(`✅ Adicionado data-step-content="${stepNum}" ao section-card`);
                    }
                }
            });
        }
        
        // Sobrescrever updateStepDisplay para funcionar com ambos
        const originalUpdateStepDisplay = window.updateStepDisplay;
        
        window.updateStepDisplay = function() {
            console.log('🎨 updateStepDisplay chamado (compatibilidade)');
            
            const currentStep = window.currentStep || 1;
            
            // Chamar original se existir
            if (originalUpdateStepDisplay && typeof originalUpdateStepDisplay === 'function') {
                try {
                    originalUpdateStepDisplay();
                } catch (e) {
                    console.error('Erro no updateStepDisplay original:', e);
                }
            }
            
            // Garantir que funcione com data-step-content também
            document.querySelectorAll('[data-step-content]').forEach(element => {
                const stepNum = parseInt(element.getAttribute('data-step-content'));
                
                if (stepNum === currentStep) {
                    element.style.display = 'block';
                    element.classList.add('active');
                    element.classList.remove('prev');
                } else {
                    element.style.display = 'none';
                    
                    if (stepNum < currentStep) {
                        element.classList.add('prev');
                        element.classList.remove('active');
                    } else {
                        element.classList.remove('active', 'prev');
                    }
                }
            });
            
            // Atualizar indicadores
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                indicator.classList.remove('active', 'completed');
                
                if (index < currentStep - 1) {
                    indicator.classList.add('completed');
                } else if (index === currentStep - 1) {
                    indicator.classList.add('active');
                }
            });
            
            // Atualizar botão voltar
            const backBtn = document.querySelector('.btn-back');
            if (backBtn) {
                backBtn.disabled = currentStep === 1;
            }
            
            console.log(`✅ Display atualizado para step ${currentStep}`);
        };
    }
    
    console.log('✅ Fix de compatibilidade instalado');
})();