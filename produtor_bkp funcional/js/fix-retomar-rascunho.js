/**
 * Correção específica para quando está retomando um rascunho
 * Garante que o currentStep seja 1 e não 5
 */

(function() {
    'use strict';
    
    console.log('🔧 Correção para retomar rascunho ativada');
    
    // Verificar se está retomando um evento (tem evento_id na URL)
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (eventoId) {
        console.log('📋 Retomando evento ID:', eventoId);
        
        // Forçar currentStep = 1 várias vezes
        function forcarStep1Retomada() {
            if (window.setCurrentStep) {
                window.setCurrentStep(1);
                console.log('✅ CurrentStep forçado para 1 (retomada)');
            }
            
            // Forçar visualmente também
            document.querySelectorAll('.section-card').forEach((card) => {
                const step = parseInt(card.getAttribute('data-step-content'));
                if (step === 1) {
                    card.classList.add('active');
                    card.classList.remove('prev');
                } else {
                    card.classList.remove('active', 'prev');
                }
            });
            
            // Resetar progress bar
            document.querySelectorAll('.step').forEach((step) => {
                const stepNum = parseInt(step.getAttribute('data-step'));
                if (stepNum === 1) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Atualizar linha de progresso
            const progressLine = document.getElementById('progressLine');
            if (progressLine) {
                progressLine.style.width = '0%';
            }
        }
        
        // Executar em diferentes momentos
        setTimeout(forcarStep1Retomada, 100);
        setTimeout(forcarStep1Retomada, 500);
        setTimeout(forcarStep1Retomada, 1000);
        
        // Interceptar nextStep para garantir que use o step correto
        setTimeout(() => {
            const originalNextStep = window.nextStep;
            let primeiroNext = true;
            
            window.nextStep = function() {
                if (primeiroNext && eventoId) {
                    primeiroNext = false;
                    
                    // Forçar currentStep = 1
                    if (window.setCurrentStep) {
                        window.setCurrentStep(1);
                    }
                    
                    console.log('🚀 Primeiro nextStep após retomar - forçando step 1');
                }
                
                return originalNextStep.apply(this, arguments);
            };
        }, 1500);
    }
    
})();
