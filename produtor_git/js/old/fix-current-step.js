// ============================================
// FIX URGENTE - CURRENT STEP
// ============================================

console.log('🚨 Aplicando correção urgente de currentStep...');

// Inicializar currentStep se não existir
if (typeof window.currentStep === 'undefined') {
    window.currentStep = 1;
    console.log('✅ currentStep inicializado com 1');
}

// Garantir que updateStepDisplay use window.currentStep
if (typeof window.updateStepDisplay !== 'undefined') {
    const originalUpdateStepDisplay = window.updateStepDisplay;
    window.updateStepDisplay = function() {
        // Garantir que currentStep global esteja sincronizado
        if (typeof currentStep !== 'undefined') {
            window.currentStep = currentStep;
        }
        return originalUpdateStepDisplay.apply(this, arguments);
    };
}

// Garantir que currentStep sempre tenha um valor válido
document.addEventListener('DOMContentLoaded', function() {
    // Verificar qual step está visível
    const stepsVisíveis = document.querySelectorAll('[data-step-content]');
    let stepAtual = 1;
    
    stepsVisíveis.forEach(step => {
        if (step.style.display !== 'none') {
            stepAtual = parseInt(step.getAttribute('data-step-content'));
        }
    });
    
    window.currentStep = stepAtual;
    console.log('✅ currentStep definido como:', window.currentStep);
    
    // Garantir que goToStep funcione
    if (typeof window.goToStep === 'undefined') {
        window.goToStep = function(step) {
            console.log('📍 Indo para step:', step);
            
            // Esconder todos os steps
            document.querySelectorAll('[data-step-content]').forEach(el => {
                el.style.display = 'none';
            });
            
            // Mostrar step específico
            const stepElement = document.querySelector(`[data-step-content="${step}"]`);
            if (stepElement) {
                stepElement.style.display = 'block';
            }
            
            // Atualizar indicadores
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                if (index + 1 < step) {
                    indicator.classList.add('completed');
                    indicator.classList.remove('active');
                } else if (index + 1 === step) {
                    indicator.classList.add('active');
                    indicator.classList.remove('completed');
                } else {
                    indicator.classList.remove('active', 'completed');
                }
            });
            
            // Atualizar currentStep
            window.currentStep = step;
            
            // Chamar updateStepDisplay se existir
            if (typeof window.updateStepDisplay === 'function') {
                window.updateStepDisplay();
            }
            
            // Scroll para o topo
            window.scrollTo(0, 0);
        };
    }
    
    // Sobrescrever nextStep com versão corrigida
    window.nextStep = function() {
        console.log('🔄 nextStep chamado - currentStep:', window.currentStep);
        
        // Garantir que currentStep tem valor
        if (!window.currentStep) {
            window.currentStep = 1;
        }
        
        // Validar step atual
        if (typeof window.validateStep === 'function') {
            if (!window.validateStep(window.currentStep)) {
                console.log('❌ Validação falhou para step:', window.currentStep);
                return false;
            }
        }
        
        // Avançar para próximo step
        if (window.currentStep < 8) {
            window.currentStep++;
            console.log('✅ Avançando para step:', window.currentStep);
            
            if (typeof window.goToStep === 'function') {
                window.goToStep(window.currentStep);
            } else if (typeof window.updateStepDisplay === 'function') {
                // Fallback: usar updateStepDisplay diretamente
                window.updateStepDisplay();
            }
            
            // Salvar dados
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
        }
    };
    
    // Sobrescrever prevStep também
    window.prevStep = function() {
        if (!window.currentStep) {
            window.currentStep = 1;
        }
        
        if (window.currentStep > 1) {
            window.currentStep--;
            console.log('⬅️ Voltando para step:', window.currentStep);
            
            if (typeof window.goToStep === 'function') {
                window.goToStep(window.currentStep);
            } else if (typeof window.updateStepDisplay === 'function') {
                // Fallback: usar updateStepDisplay diretamente
                window.updateStepDisplay();
            }
        }
    };
});

console.log('✅ Correção de currentStep aplicada!');
