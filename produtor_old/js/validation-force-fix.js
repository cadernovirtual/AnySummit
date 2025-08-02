// Força a aplicação das correções de validação
console.log('🔨 Forçando correção de validação do wizard...');

// Variável para armazenar se já aplicamos a correção final
let finalCorrectionApplied = false;

// Função para forçar override imediato
function forceOverrideNextStep() {
    console.log('⚡ Aplicando override temporário de nextStep');
    
    // Salvar referência da função atual para debug
    const oldNextStep = window.nextStep;
    console.log('Função nextStep anterior:', oldNextStep ? oldNextStep.toString().substring(0, 100) + '...' : 'undefined');
    
    // Override temporário que tenta aplicar a correção final
    window.nextStep = function() {
        console.log('🚀 [TEMPORÁRIO] nextStep executado');
        
        // Se a correção final já foi aplicada, não fazer nada aqui
        if (finalCorrectionApplied) {
            console.log('❌ Função temporária chamada mas correção final já foi aplicada!');
            return;
        }
        
        console.log('⏸️ Aguardando validateStep para aplicar validação...');
        
        // Tentar aplicar a correção final imediatamente
        if (typeof window.validateStep === 'function') {
            console.log('✅ validateStep encontrada! Aplicando correção final agora...');
            applyFinalCorrection();
            // Chamar a nova função
            if (window.nextStep && window.nextStep !== arguments.callee) {
                window.nextStep();
            }
        }
    };
}

// Aplicar override temporário
forceOverrideNextStep();

// Função para aplicar a correção final
function applyFinalCorrection() {
    if (finalCorrectionApplied) return;
    
    console.log('🎯 Aplicando correção final de validação...');
    
    // Garantir wizardState
    if (!window.wizardState) {
        const currentStepElement = document.querySelector('.step.active');
        const currentStepNumber = currentStepElement ? 
            parseInt(currentStepElement.dataset.step) : 1;
            
        window.wizardState = {
            currentStep: currentStepNumber,
            totalSteps: 8
        };
        console.log('✅ wizardState criado:', window.wizardState);
    }
    
    // Salvar referência da função validateStep
    const originalValidateStep = window.validateStep;
    
    // Override final do nextStep
    window.nextStep = function() {
        console.log('🚀 [FORÇADO] nextStep executado - step atual:', window.wizardState.currentStep);
        
        const currentStep = window.wizardState.currentStep;
        
        // Usar a validateStep original
        const isValid = originalValidateStep(currentStep);
        console.log('📋 [FORÇADO] Validação do step', currentStep, ':', isValid);
        
        if (isValid) {
            if (currentStep < window.wizardState.totalSteps) {
                window.wizardState.currentStep = currentStep + 1;
                
                // Atualizar display
                if (typeof window.updateStepDisplay === 'function') {
                    window.updateStepDisplay();
                } else {
                    updateStepDisplayForced();
                }
                
                console.log('✅ [FORÇADO] Avançou para step:', window.wizardState.currentStep);
                
                // Salvar dados
                if (typeof window.saveWizardData === 'function') {
                    window.saveWizardData();
                }
            }
        } else {
            console.log('❌ [FORÇADO] Validação falhou - permanece no step:', currentStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    finalCorrectionApplied = true;
    console.log('✅ Correção final aplicada com sucesso!');
}

// Aguardar um momento para garantir que todos os scripts foram carregados
setTimeout(() => {
    console.log('🔍 Verificando estado atual:');
    console.log('- validateStep existe?', typeof window.validateStep);
    console.log('- wizardState existe?', typeof window.wizardState);
    console.log('- nextStep existe?', typeof window.nextStep);
    
    // Função para aguardar validateStep
    function waitForValidateStep(callback, attempts = 0) {
        if (typeof window.validateStep === 'function') {
            console.log('✅ validateStep encontrada após', attempts, 'tentativas');
            callback();
        } else if (attempts < 30) { // 3 segundos
            setTimeout(() => waitForValidateStep(callback, attempts + 1), 100);
        } else {
            console.error('❌ validateStep não foi encontrada após 3 segundos!');
            // Tentar encontrar em outros lugares
            console.log('🔍 Procurando validateStep em outros locais...');
            if (typeof validateStep === 'function') {
                window.validateStep = validateStep;
                console.log('✅ validateStep encontrada no escopo local e exposta!');
                callback();
            }
        }
    }
    
    // Aplicar correções
    waitForValidateStep(() => {
        applyFinalCorrection();
    });
    
}, 1000); // Aguardar 1 segundo para garantir que tudo carregou

// Função para atualizar display forçadamente
function updateStepDisplayForced() {
    const currentStep = window.wizardState.currentStep;
    console.log('📊 [FORÇADO] Atualizando display para step:', currentStep);
    
    // Atualizar cards
    document.querySelectorAll('.section-card').forEach(card => {
        const stepNumber = parseInt(card.dataset.stepContent);
        card.classList.toggle('active', stepNumber === currentStep);
        card.classList.toggle('prev', stepNumber < currentStep);
    });
    
    // Atualizar steps
    document.querySelectorAll('.step').forEach(step => {
        const stepNumber = parseInt(step.dataset.step);
        step.classList.toggle('active', stepNumber === currentStep);
        step.classList.toggle('completed', stepNumber < currentStep);
    });
    
    // Atualizar linha de progresso
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        const progressPercentage = ((currentStep - 1) / 7) * 100;
        progressLine.style.width = progressPercentage + '%';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}