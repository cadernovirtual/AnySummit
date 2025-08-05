/**
 * Correção FORÇADA para garantir que o wizard comece na etapa 1
 * Este arquivo DEVE ser carregado APÓS todos os outros scripts
 */

(function() {
    'use strict';
    
    console.log('🔨 FORÇANDO wizard para etapa 1');
    
    let eventoJaCriado = false;
    
    // Função para forçar etapa 1
    function forcarEtapa1() {
        console.log('🎯 Forçando currentStep = 1');
        
        // 1. Forçar currentStep = 1 de todas as formas possíveis
        if (window.setCurrentStep) {
            window.setCurrentStep(1);
        }
        
        // 2. Forçar diretamente nas variáveis globais
        if (window.wizardState) {
            window.wizardState.currentStep = 1;
        }
        
        // 3. Forçar visualmente
        document.querySelectorAll('.section-card').forEach((card) => {
            const step = parseInt(card.getAttribute('data-step-content'));
            if (step === 1) {
                card.classList.add('active');
                card.classList.remove('prev');
            } else {
                card.classList.remove('active', 'prev');
            }
        });
        
        // 4. Resetar progress bar
        document.querySelectorAll('.step').forEach((step) => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            if (stepNum === 1) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // 5. Atualizar linha de progresso
        const progressLine = document.getElementById('progressLine');
        if (progressLine) {
            progressLine.style.width = '0%';
        }
        
        // 6. Chamar updateStepDisplay
        if (window.updateStepDisplay) {
            window.updateStepDisplay();
        }
        
        console.log('✅ Etapa forçada para 1 - currentStep:', window.getCurrentStep ? window.getCurrentStep() : 'não definido');
    }
    
    // Função para interceptar nextStep
    function interceptarNextStep() {
        if (!window.nextStep) {
            console.log('⏳ nextStep ainda não existe, tentando novamente...');
            setTimeout(interceptarNextStep, 100);
            return;
        }
        
        const originalNextStep = window.nextStep;
        
        window.nextStep = function() {
            const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
            console.log('🚀 nextStep interceptado - currentStep:', currentStep);
            
            // CORREÇÃO: Verificar se realmente está na etapa 1 visualmente
            const etapaAtivaDOM = document.querySelector('.section-card.active');
            const etapaAtivaNumero = etapaAtivaDOM ? parseInt(etapaAtivaDOM.getAttribute('data-step-content')) : 1;
            
            console.log('📊 Etapa ativa no DOM:', etapaAtivaNumero);
            
            // Se está na etapa 1 (verificando DOM) e ainda não criou evento
            if (etapaAtivaNumero === 1 && !eventoJaCriado) {
                const eventoId = window.getEventoId ? window.getEventoId() : null;
                
                if (!eventoId) {
                    console.log('📝 Criando evento antes de avançar...');
                    
                    // Validar etapa 1
                    if (window.validateStep && !window.validateStep(1)) {
                        console.log('❌ Validação da etapa 1 falhou');
                        return false;
                    }
                    
                    // Salvar etapa 1 (cria o evento)
                    if (window.salvarEtapaAtual) {
                        console.log('💾 Chamando salvarEtapaAtual(1)');
                        window.salvarEtapaAtual(1);
                        eventoJaCriado = true;
                        
                        // Aguardar um pouco antes de avançar
                        setTimeout(() => {
                            // Forçar currentStep correto antes de avançar
                            if (window.setCurrentStep) {
                                window.setCurrentStep(1);
                            }
                            originalNextStep.apply(this, arguments);
                        }, 500);
                        
                        return; // Não avançar ainda
                    } else {
                        console.error('❌ salvarEtapaAtual não está disponível!');
                    }
                }
            }
            
            // Caso contrário, chamar função original
            return originalNextStep.apply(this, arguments);
        };
        
        console.log('✅ nextStep interceptado com sucesso');
    }
    
    // Executar correções em diferentes momentos
    
    // 1. Assim que o script carregar
    setTimeout(forcarEtapa1, 50);
    
    // 2. Quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(forcarEtapa1, 100);
            setTimeout(interceptarNextStep, 200);
        });
    } else {
        // DOM já está pronto
        setTimeout(forcarEtapa1, 100);
        setTimeout(interceptarNextStep, 200);
    }
    
    // 3. Quando tudo estiver carregado (fallback)
    window.addEventListener('load', function() {
        setTimeout(forcarEtapa1, 300);
    });
    
})();
