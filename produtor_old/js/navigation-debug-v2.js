/**
 * Debug de Navegação V2
 * Ajuda a identificar problemas na navegação entre etapas
 */
(function() {
    console.log('🐛 Sistema de debug de navegação V2 iniciado');
    
    // Debug da navegação
    window.debugNavegacao = function() {
        console.log('=== DEBUG NAVEGAÇÃO ===');
        console.log('currentStep:', window.currentStep);
        console.log('nextStep existe?', typeof window.nextStep);
        console.log('prevStep existe?', typeof window.prevStep);
        console.log('validateStep existe?', typeof window.validateStep);
        console.log('updateStepDisplay existe?', typeof window.updateStepDisplay);
        
        // Verificar steps visíveis
        console.log('\n=== STEPS VISÍVEIS ===');
        for (let i = 1; i <= 8; i++) {
            const step = document.querySelector(`[data-step-content="${i}"]`);
            if (step) {
                const isVisible = step.style.display !== 'none' && 
                                getComputedStyle(step).display !== 'none';
                console.log(`Step ${i}:`, isVisible ? '✅ VISÍVEL' : '❌ OCULTO');
            } else {
                console.log(`Step ${i}: ⚠️ NÃO ENCONTRADO`);
            }
        }
        
        // Verificar indicadores
        console.log('\n=== INDICADORES ===');
        document.querySelectorAll('.step-indicator').forEach((ind, idx) => {
            const classes = Array.from(ind.classList);
            console.log(`Indicador ${idx + 1}:`, classes.join(', '));
        });
    };
    
    // Interceptar console.error para debug
    const originalError = console.error;
    console.error = function() {
        console.log('❌ ERRO CAPTURADO:', ...arguments);
        originalError.apply(console, arguments);
    };
    
    // Monitorar mudanças de display
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.hasAttribute('data-step-content')) {
                    const stepNum = target.getAttribute('data-step-content');
                    const isVisible = target.style.display !== 'none';
                    console.log(`📍 Step ${stepNum} mudou para:`, isVisible ? 'VISÍVEL' : 'OCULTO');
                }
            }
        });
    });
    
    // Observar todos os steps
    document.querySelectorAll('[data-step-content]').forEach(step => {
        observer.observe(step, { attributes: true });
    });
    
    // Forçar navegação manual
    window.forcarProximoStep = function() {
        const atual = window.currentStep || 1;
        const proximo = atual + 1;
        
        console.log(`🔄 Forçando navegação: ${atual} → ${proximo}`);
        
        // Esconder atual
        const stepAtual = document.querySelector(`[data-step-content="${atual}"]`);
        if (stepAtual) {
            stepAtual.style.display = 'none';
            console.log(`✅ Step ${atual} ocultado`);
        }
        
        // Mostrar próximo
        const stepProximo = document.querySelector(`[data-step-content="${proximo}"]`);
        if (stepProximo) {
            stepProximo.style.display = 'block';
            console.log(`✅ Step ${proximo} exibido`);
        }
        
        window.currentStep = proximo;
    };
    
    // Auto executar debug ao carregar
    setTimeout(() => {
        console.log('💡 Execute debugNavegacao() para verificar estado');
        console.log('💡 Execute forcarProximoStep() para forçar navegação');
    }, 1000);
})();