// Correção definitiva do wizard
console.log('🔧 Iniciando correção definitiva do wizard...');

// Garantir que o wizardState existe
if (!window.wizardState) {
    window.wizardState = {
        currentStep: 1,
        totalSteps: 8
    };
    console.log('✅ wizardState criado:', window.wizardState);
}

// Sobrescrever nextStep com versão funcional
window.nextStep = function() {
    console.log('🚀 nextStep executado - step atual:', window.wizardState.currentStep);
    
    // Obter o step atual
    const currentStep = window.wizardState.currentStep;
    
    // Validar o step atual
    if (typeof window.validateStep === 'function') {
        const isValid = window.validateStep(currentStep);
        console.log('📋 Validação do step', currentStep, ':', isValid);
        
        if (isValid) {
            // Avançar para próximo step
            if (currentStep < window.wizardState.totalSteps) {
                window.wizardState.currentStep = currentStep + 1;
                
                // Atualizar display
                if (typeof window.updateStepDisplay === 'function') {
                    window.updateStepDisplay();
                    console.log('✅ Avançou para step:', window.wizardState.currentStep);
                } else {
                    // Função updateStepDisplay manual se não existir
                    updateStepDisplayManual();
                }
                
                // Salvar dados se a função existir
                if (typeof window.saveWizardData === 'function') {
                    window.saveWizardData();
                }
            } else {
                console.log('⚠️ Já está no último step');
            }
        } else {
            console.log('❌ Validação falhou - permanece no step:', currentStep);
        }
    } else {
        console.error('❌ Função validateStep não encontrada!');
    }
};

// Função manual para atualizar display se necessário
function updateStepDisplayManual() {
    const currentStep = window.wizardState.currentStep;
    console.log('📊 Atualizando display manual para step:', currentStep);
    
    // Atualizar cards de conteúdo
    document.querySelectorAll('.section-card').forEach(card => {
        const stepNumber = parseInt(card.dataset.stepContent);
        if (stepNumber === currentStep) {
            card.classList.add('active');
            card.classList.remove('prev');
        } else if (stepNumber < currentStep) {
            card.classList.add('prev');
            card.classList.remove('active');
        } else {
            card.classList.remove('active', 'prev');
        }
    });

    // Atualizar progress bar
    document.querySelectorAll('.step').forEach(step => {
        const stepNumber = parseInt(step.dataset.step);
        if (stepNumber === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    // Atualizar linha de progresso
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        const progressPercentage = ((currentStep - 1) / (window.wizardState.totalSteps - 1)) * 100;
        progressLine.style.width = progressPercentage + '%';
    }

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Garantir que updateStepDisplay existe
if (typeof window.updateStepDisplay !== 'function') {
    window.updateStepDisplay = updateStepDisplayManual;
    console.log('✅ updateStepDisplay definido manualmente');
}

// Verificar se validateStep existe, senão criar versão básica
if (typeof window.validateStep !== 'function') {
    window.validateStep = function(stepNumber) {
        console.log('🔍 validateStep básico para step:', stepNumber);
        
        // Validação básica para step 1
        if (stepNumber === 1) {
            const eventName = document.getElementById('eventName')?.value;
            const hasLogo = document.querySelector('#logoPreviewContainer img') !== null;
            const hasCapa = document.querySelector('#capaPreviewContainer img') !== null;
            
            console.log('Validação Step 1:', { eventName, hasLogo, hasCapa });
            
            const isValid = eventName && eventName.trim() !== '' && hasLogo && hasCapa;
            
            if (!isValid) {
                const validationMessage = document.getElementById('validation-step-1');
                if (validationMessage) {
                    validationMessage.classList.add('show');
                    setTimeout(() => {
                        validationMessage.classList.remove('show');
                    }, 3000);
                }
            }
            
            return isValid;
        }
        
        // Para outros steps, retornar true por enquanto
        return true;
    };
    console.log('✅ validateStep básico criado');
}

// Sobrescrever prevStep também
window.prevStep = function() {
    const currentStep = window.wizardState.currentStep;
    if (currentStep > 1) {
        window.wizardState.currentStep = currentStep - 1;
        window.updateStepDisplay();
        console.log('⬅️ Voltou para step:', window.wizardState.currentStep);
    }
};

console.log('✅ Correção definitiva do wizard aplicada!');
console.log('Estado atual:', {
    wizardState: window.wizardState,
    nextStep: typeof window.nextStep,
    prevStep: typeof window.prevStep,
    validateStep: typeof window.validateStep,
    updateStepDisplay: typeof window.updateStepDisplay
});
