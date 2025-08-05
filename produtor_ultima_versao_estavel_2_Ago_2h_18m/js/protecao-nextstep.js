/**
 * PROTEÇÃO CONTRA CONFLITOS DE NEXTSTEP
 * Evita que múltiplos scripts sobrescrevam window.nextStep causando erros
 */

(function() {
    'use strict';
    
    console.log('🛡️ Proteção nextStep ativada');
    
    // Guardar referência da função original quando ela existir
    let nextStepOriginal = null;
    let nextStepProtegido = false;
    
    // Observer para detectar quando nextStep é definido
    let checkInterval = setInterval(() => {
        if (window.nextStep && typeof window.nextStep === 'function' && !nextStepProtegido) {
            console.log('✅ nextStep encontrado e protegido');
            nextStepOriginal = window.nextStep;
            nextStepProtegido = true;
            clearInterval(checkInterval);
            
            // Criar wrapper seguro
            window.nextStepSeguro = function() {
                if (nextStepOriginal && typeof nextStepOriginal === 'function') {
                    return nextStepOriginal.apply(this, arguments);
                } else {
                    console.error('❌ nextStep original não disponível');
                }
            };
        }
    }, 100);
    
    // Timeout de segurança
    setTimeout(() => {
        clearInterval(checkInterval);
        if (!nextStepProtegido) {
            console.warn('⚠️ nextStep não foi encontrado em 10 segundos');
        }
    }, 10000);
    
})();
