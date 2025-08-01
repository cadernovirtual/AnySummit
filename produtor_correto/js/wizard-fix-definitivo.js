// Correção definitiva do wizard
console.log('🔧 Iniciando correção definitiva do wizard...');

// Função para aguardar validateStep estar disponível
function waitForValidateStep(callback, attempts = 0) {
    if (typeof window.validateStep === 'function') {
        console.log('✅ validateStep encontrada após', attempts, 'tentativas');
        callback();
    } else if (attempts < 20) { // Máximo 2 segundos (20 * 100ms)
        console.log('⏳ Aguardando validateStep... tentativa', attempts + 1);
        setTimeout(() => waitForValidateStep(callback, attempts + 1), 100);
    } else {
        console.error('❌ validateStep não foi carregada após 2 segundos!');
        console.log('Funções disponíveis no window:', Object.keys(window).filter(k => typeof window[k] === 'function'));
    }
}

// Aguardar validateStep e então configurar o wizard
waitForValidateStep(() => {
    console.log('🎯 Configurando wizard com validateStep disponível');
    
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
            // Fazer scroll para o topo para mostrar os erros
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
    console.log('Estado final:', {
        wizardState: window.wizardState,
        nextStep: typeof window.nextStep,
        prevStep: typeof window.prevStep,
        validateStep: typeof window.validateStep,
        updateStepDisplay: typeof window.updateStepDisplay
    });
});

// Log inicial
console.log('🔍 Estado inicial - validateStep:', typeof window.validateStep);