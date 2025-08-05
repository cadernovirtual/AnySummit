/**
 * Fix temporário para validação do step 4
 */

// Override da validação do step 4
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('Aplicando fix de validação do step 4...');
        
        // Sobrescrever validateStep se existir
        if (window.validateStep) {
            const originalValidateStep = window.validateStep;
            
            window.validateStep = function(stepNumber) {
                console.log(`Validando step ${stepNumber}`);
                
                if (stepNumber === 4) {
                    const validationMessage = document.getElementById('validation-step-4');
                    const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
                    
                    let isValid = false;
                    
                    if (isPresential) {
                        // SIMPLIFICADO: Apenas verificar se nome do local está preenchido
                        const venueName = document.getElementById('venueName');
                        isValid = venueName && venueName.value && venueName.value.trim() !== '';
                        
                        console.log('Fix - Validação presencial:', {
                            venueName: venueName?.value,
                            isValid: isValid
                        });
                    } else {
                        const eventLink = document.getElementById('eventLink');
                        isValid = eventLink && eventLink.value && eventLink.value.trim() !== '';
                        
                        console.log('Fix - Validação online:', {
                            eventLink: eventLink?.value,
                            isValid: isValid
                        });
                    }
                    
                    if (!isValid && validationMessage) {
                        validationMessage.classList.add('show');
                        setTimeout(() => {
                            validationMessage.classList.remove('show');
                        }, 3000);
                    }
                    
                    return isValid;
                }
                
                // Para outros steps, usar validação original
                return originalValidateStep.call(this, stepNumber);
            };
            
            console.log('Fix de validação aplicado com sucesso');
        } else {
            console.error('validateStep não encontrada!');
        }
    }, 2000); // Aguardar 2 segundos para garantir que tudo carregou
});

console.log('Fix de validação do step 4 carregado');