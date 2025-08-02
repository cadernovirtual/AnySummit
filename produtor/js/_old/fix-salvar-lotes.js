/**
 * Fix para salvar lotes ao sair da etapa
 * Intercepta mudanças de step e salva lotes
 */

(function() {
    'use strict';
    
    console.log('💾 Fix de salvamento de lotes iniciando...');
    
    // Função para salvar lotes
    function salvarLotes() {
        console.log('💾 Salvando lotes...');
        
        // Coletar dados do step 5
        if (window.coletarDadosStepAtual) {
            window.coletarDadosStepAtual(5);
        }
        
        // Salvar no cookie
        if (window.salvarLotesNoCookie) {
            window.salvarLotesNoCookie();
            console.log('🍪 Lotes salvos no cookie');
        }
        
        // Garantir que está no localStorage
        if (window.WizardDataCollector) {
            localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
            console.log('💾 WizardDataCollector salvo');
        }
    }
    
    // Observer para detectar quando SAI do step 5
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                // Se step 5 perdeu a classe active
                if (target.dataset && target.dataset.step === '5' && !target.classList.contains('active')) {
                    console.log('📤 Saindo do step 5 - salvando lotes');
                    salvarLotes();
                }
                
                // Se content 5 perdeu a classe active
                if (target.dataset && target.dataset.stepContent === '5' && !target.classList.contains('active')) {
                    console.log('📤 Saindo do content 5 - salvando lotes');
                    salvarLotes();
                }
            }
        });
    });
    
    // Interceptar nextStep quando estiver no step 5
    setTimeout(() => {
        const originalNextStep = window.nextStep;
        if (originalNextStep) {
            window.nextStep = function() {
                const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
                
                // Se está no step 5, salvar lotes antes de avançar
                if (currentStep === 5) {
                    console.log('➡️ Avançando do step 5 - salvando lotes primeiro');
                    salvarLotes();
                }
                
                return originalNextStep.apply(this, arguments);
            };
        }
    }, 2000);
    
    // Interceptar prevStep quando estiver no step 5
    setTimeout(() => {
        const originalPrevStep = window.prevStep;
        if (originalPrevStep) {
            window.prevStep = function() {
                const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
                
                // Se está no step 5, salvar lotes antes de voltar
                if (currentStep === 5) {
                    console.log('⬅️ Voltando do step 5 - salvando lotes primeiro');
                    salvarLotes();
                }
                
                return originalPrevStep.apply(this, arguments);
            };
        }
    }, 2000);
    
    // Interceptar funções de adicionar/editar lotes
    ['adicionarLotePorData', 'adicionarLotePorPercentual', 'salvarEdicaoLoteData', 'salvarEdicaoLotePercentual'].forEach(funcName => {
        setTimeout(() => {
            if (window[funcName]) {
                const original = window[funcName];
                window[funcName] = function() {
                    console.log(`📦 ${funcName} interceptado`);
                    
                    // Chamar original
                    const result = original.apply(this, arguments);
                    
                    // Salvar após operação
                    setTimeout(() => {
                        salvarLotes();
                    }, 300);
                    
                    return result;
                };
            }
        }, 1500);
    });
    
    // Observar DOM quando carregar
    document.addEventListener('DOMContentLoaded', function() {
        // Observar steps
        document.querySelectorAll('[data-step]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
        
        // Observar contents
        document.querySelectorAll('[data-step-content]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
    });
    
    // Comando para salvar manualmente
    window.salvarLotesManual = salvarLotes;
    
    console.log('✅ Fix de salvamento de lotes carregado!');
    console.log('💡 Use salvarLotesManual() para salvar manualmente');
    
})();
