/**
 * BRIDGE - Conecta saveWizardData com WizardDataCollector
 * Garante que ambos os sistemas salvem juntos
 */

(function() {
    'use strict';
    
    console.log('🌉 Bridge de persistência iniciando...');
    
    // Aguardar carregamento
    setTimeout(() => {
        // Se saveWizardData existir, fazer override
        if (window.saveWizardData) {
            const originalSaveWizardData = window.saveWizardData;
            
            window.saveWizardData = function() {
                console.log('🔗 saveWizardData interceptado - salvando em AMBOS sistemas!');
                
                // 1. Chamar original
                const result = originalSaveWizardData.apply(this, arguments);
                
                // 2. Também coletar para WizardDataCollector
                if (window.coletarDadosStepAtual) {
                    const stepAtual = window.getCurrentStep ? window.getCurrentStep() : 
                                     (window.wizardState ? window.wizardState.currentStep : 1);
                    console.log('📊 Coletando dados do step', stepAtual, 'para WizardDataCollector...');
                    window.coletarDadosStepAtual(stepAtual);
                    
                    // Salvar no localStorage
                    if (window.WizardDataCollector) {
                        localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
                        console.log('💾 WizardDataCollector salvo no localStorage!');
                    }
                }
                
                return result;
            };
            
            console.log('✅ Bridge configurado - saveWizardData agora salva em ambos!');
        }
        
        // Também interceptar mudanças de step
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.dataset && target.dataset.step && target.classList.contains('active')) {
                        console.log('🔄 Mudança de step detectada via DOM!');
                        
                        // Forçar coleta
                        setTimeout(() => {
                            if (window.forcarColetaCompleta) {
                                window.forcarColetaCompleta();
                            }
                        }, 100);
                    }
                }
            });
        });
        
        // Observar mudanças nos steps
        const stepsContainer = document.querySelector('.wizard-steps');
        if (stepsContainer) {
            observer.observe(stepsContainer, {
                attributes: true,
                subtree: true,
                attributeFilter: ['class']
            });
            console.log('👁️ Observando mudanças de step no DOM');
        }
        
    }, 1000);
    
    console.log('✅ Bridge de persistência carregado!');
    
})();
