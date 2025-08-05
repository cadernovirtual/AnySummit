/**
 * PATCH: Garantir consistência na validação da etapa 8
 * Este arquivo deve ser carregado após criaevento.js para override correto
 */

console.log('🔧 [Patch Validação] Aplicando patch de validação da etapa 8...');

// Override da função validateStep se existir
if (window.validateStep) {
    const originalValidateStep = window.validateStep;
    
    window.validateStep = function(stepNumber) {
        console.log('🔧 [Patch Validação] Validando step:', stepNumber);
        
        if (stepNumber === 8) {
            // Verificar dados do evento
            const dadosEvento = window.dadosEvento || {};
            
            // Se evento já foi publicado, sempre válido
            if (dadosEvento.status === 'publicado' && dadosEvento.termosAceitos === 1) {
                console.log('🔧 [Patch Validação] Evento já publicado - step 8 válido');
                return true;
            }
            
            // Verificar checkbox
            const checkbox = document.getElementById('termsCheckbox');
            const termosAceitos = checkbox && checkbox.classList.contains('checked');
            
            console.log('🔧 [Patch Validação] Estado checkbox:', {
                checkboxEncontrado: !!checkbox,
                termosAceitos,
                classes: checkbox ? checkbox.className : 'N/A'
            });
            
            if (!termosAceitos) {
                // Mostrar mensagem de erro específica
                const validationMessage = document.getElementById('validation-step-7');
                if (validationMessage) {
                    validationMessage.textContent = 'Por favor, aceite os termos de uso para continuar.';
                    validationMessage.style.display = 'block';
                    validationMessage.classList.add('show');
                }
                
                return false;
            }
            
            return true;
        }
        
        // Para outros steps, usar validação original
        return originalValidateStep(stepNumber);
    };
}

console.log('🔧 [Patch Validação] Patch aplicado com sucesso!');