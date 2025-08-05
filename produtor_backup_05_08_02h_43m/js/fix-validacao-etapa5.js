/**
 * FIX: Remover validação prematura na etapa 5
 * A mensagem "Todos os campos obrigatórios precisam ser preenchidos!" 
 * não deve aparecer ao ENTRAR na etapa 5, apenas ao tentar SAIR dela
 */

(function() {
    'use strict';
    
    console.log('🔧 Aplicando fix para validação prematura da etapa 5...');
    
    // Aguardar elementos carregarem
    setTimeout(function() {
        
        // Interceptar a função validateStep se ela existir
        const originalValidateStep = window.validateStep;
        if (originalValidateStep) {
            window.validateStep = function(stepNumber) {
                console.log(`🔍 validateStep chamado para etapa ${stepNumber}`);
                
                // Se é etapa 5 e não está tentando avançar, não validar
                if (stepNumber === 5 && !window.tentandoAvancar) {
                    console.log('🚫 Validação da etapa 5 suprimida - usuário apenas entrou na etapa');
                    return true;
                }
                
                // Chamar validação original para outros casos
                return originalValidateStep.call(this, stepNumber);
            };
            
            console.log('✅ validateStep interceptada para etapa 5');
        }
        
        // Interceptar nextStep para marcar quando está tentando avançar
        const originalNextStep = window.nextStep;
        if (originalNextStep) {
            window.nextStep = function() {
                console.log('🎯 nextStep chamado - marcando tentativa de avanço');
                
                // Marcar que está tentando avançar
                window.tentandoAvancar = true;
                
                // Chamar função original
                const result = originalNextStep.call(this);
                
                // Limpar flag após um tempo
                setTimeout(() => {
                    window.tentandoAvancar = false;
                }, 1000);
                
                return result;
            };
            
            console.log('✅ nextStep interceptado para controlar validação');
        }
        
        // Também interceptar showStep para garantir que mensagens não apareçam ao entrar
        const originalShowStep = window.showStep;
        if (originalShowStep) {
            window.showStep = function(stepNumber) {
                console.log(`🎯 showStep chamado para etapa ${stepNumber}`);
                
                // Esconder mensagens de validação ao entrar na etapa
                const validationMessage = document.getElementById(`validation-step-${stepNumber}`);
                if (validationMessage && stepNumber === 5) {
                    validationMessage.style.display = 'none';
                    validationMessage.classList.remove('show');
                    console.log('🚫 Mensagem de validação da etapa 5 escondida ao entrar');
                }
                
                // Chamar função original
                return originalShowStep.call(this, stepNumber);
            };
            
            console.log('✅ showStep interceptado para limpar validações');
        }
        
        // Esconder imediatamente qualquer mensagem de validação da etapa 5 que esteja aparecendo
        const validationStep5 = document.getElementById('validation-step-5');
        if (validationStep5) {
            validationStep5.style.display = 'none';
            validationStep5.classList.remove('show');
            console.log('🧹 Mensagem de validação da etapa 5 limpa imediatamente');
        }
        
        console.log('✅ Fix de validação prematura da etapa 5 aplicado');
        
    }, 1000);
    
})();
