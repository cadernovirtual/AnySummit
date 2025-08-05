/**
 * Correção da inicialização do wizard
 * Garante que:
 * 1. O wizard sempre comece na etapa 1
 * 2. O evento seja criado apenas quando o usuário começar a preencher
 */

(function() {
    'use strict';
    
    console.log('🚀 Correção de inicialização do wizard iniciada');
    
    // Flag para controlar se o evento já foi criado
    let eventoJaCriado = false;
    
    // Aguardar carregamento completo
    window.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM carregado - aplicando correções');
        
        // Aplicar correções após um pequeno delay para garantir que outros scripts foram carregados
        setTimeout(() => {
            // 1. Forçar currentStep = 1
            if (window.setCurrentStep) {
                console.log('✅ Forçando currentStep = 1');
                window.setCurrentStep(1);
            }
            
            // 2. Garantir que apenas a primeira etapa esteja visível
            document.querySelectorAll('.section-card').forEach((card, index) => {
                const stepNumber = parseInt(card.getAttribute('data-step-content'));
                if (stepNumber === 1) {
                    card.classList.add('active');
                    card.classList.remove('prev');
                } else {
                    card.classList.remove('active', 'prev');
                }
            });
            
            // 3. Atualizar o progress bar
            document.querySelectorAll('.step').forEach((step, index) => {
                const stepNumber = parseInt(step.getAttribute('data-step'));
                if (stepNumber === 1) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // 4. Resetar linha de progresso
            const progressLine = document.getElementById('progressLine');
            if (progressLine) {
                progressLine.style.width = '0%';
            }
            
            // 5. Forçar updateStepDisplay
            if (window.updateStepDisplay) {
                window.updateStepDisplay();
            }
            
            console.log('✅ Wizard resetado para etapa 1');
            
        }, 300);
    });
    
    // Interceptar o nextStep para criar o evento quando necessário
    if (window.nextStep) {
        const originalNextStep = window.nextStep;
        window.nextStep = function() {
            const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
            
            // Se está na etapa 1 e não criou o evento ainda
            if (currentStep === 1 && !eventoJaCriado && !window.getEventoId || !window.getEventoId()) {
                console.log('🆕 Criando evento ao avançar da etapa 1...');
                
                // Validar primeiro
                if (!window.validateStep || !window.validateStep(1)) {
                    console.log('❌ Validação da etapa 1 falhou');
                    return;
                }
                
                // Salvar etapa 1 (isso criará o evento)
                if (window.salvarEtapaAtual) {
                    window.salvarEtapaAtual(1);
                    eventoJaCriado = true;
                }
            }
            
            // Chamar função original
            return originalNextStep.apply(this, arguments);
        };
    }
    
    // Adicionar listener para campos da etapa 1
    setTimeout(() => {
        const camposEtapa1 = ['eventName', 'logoUpload', 'capaUpload'];
        
        camposEtapa1.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.addEventListener('change', function() {
                    // Se não tem evento ainda e o campo foi preenchido
                    if (!eventoJaCriado && !window.getEventoId || !window.getEventoId()) {
                        console.log(`📝 Campo ${campoId} alterado - preparando para criar evento`);
                        // O evento será criado quando o usuário clicar em "Avançar"
                    }
                });
            }
        });
    }, 500);
    
    console.log('✅ Correção de inicialização aplicada');
    
})();
