/**
 * Debug para rastrear mudanças no currentStep
 */

(function() {
    'use strict';
    
    console.log('🔍 Debug currentStep iniciado');
    
    // Interceptar mudanças no currentStep
    let _currentStep = 1;
    
    Object.defineProperty(window, '_debugCurrentStep', {
        get: function() {
            return _currentStep;
        },
        set: function(value) {
            console.trace(`⚠️ currentStep mudando de ${_currentStep} para ${value}`);
            _currentStep = value;
        }
    });
    
    // Verificar o estado inicial
    setTimeout(() => {
        console.log('📊 Estado inicial do wizard:');
        console.log('- getCurrentStep():', window.getCurrentStep ? window.getCurrentStep() : 'não definido');
        console.log('- wizardState:', window.wizardState);
        console.log('- Etapa ativa no DOM:', document.querySelector('.section-card.active')?.getAttribute('data-step-content'));
        
        // Verificar se há alguma etapa 5 visível
        const step5 = document.querySelector('[data-step-content="5"]');
        if (step5) {
            console.log('- Etapa 5 classes:', step5.className);
            console.log('- Etapa 5 visível?', step5.classList.contains('active'));
        }
        
        // Forçar currentStep para 1
        if (window.setCurrentStep) {
            console.log('🔧 Forçando currentStep = 1');
            window.setCurrentStep(1);
        }
    }, 100);
    
    // Monitorar cliques nos botões
    document.addEventListener('click', function(e) {
        if (e.target.matches('.nav-btn')) {
            console.log(`🖱️ Botão clicado: ${e.target.textContent.trim()}`);
            console.log('- currentStep antes do clique:', window.getCurrentStep ? window.getCurrentStep() : 'não definido');
        }
    }, true);
    
})();
