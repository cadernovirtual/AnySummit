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
                console.log('✅ currentStep forçado para 1');
            } else {
                window.currentStep = 1;
                console.log('✅ currentStep definido diretamente como 1');
            }
        }
        
        // Executar em diferentes momentos
        setTimeout(forcarStep1Retomada, 100);
        setTimeout(forcarStep1Retomada, 500);
        setTimeout(forcarStep1Retomada, 1000);
        
        // Interceptar nextStep para garantir que use o step correto
        setTimeout(() => {
            console.log('🔍 Verificando se nextStep existe...');
            
            if (!window.nextStep) {
                console.warn('⚠️ nextStep não existe! Aguardando...');
                setTimeout(arguments.callee, 500);
                return;
            }
            
            console.log('✅ nextStep encontrado, interceptando...');
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
                    return; // Não prosseguir no primeiro clique
                }
                
                // Chamar função original
                return originalNextStep.apply(this, arguments);
            };
            
            console.log('✅ nextStep interceptado com sucesso');
        }, 1000);
    }
    
})();
