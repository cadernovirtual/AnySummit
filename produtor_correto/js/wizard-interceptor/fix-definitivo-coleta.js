/**
 * FIX DEFINITIVO - Força coleta após CADA mudança de step
 * Garante que SEMPRE salva, não importa como
 */

(function() {
    'use strict';
    
    console.log('💪 Fix definitivo de coleta carregando...');
    
    // Esperar tudo carregar
    window.addEventListener('load', function() {
        
        // 1. Override AGRESSIVO do nextStep
        setInterval(() => {
            if (window.nextStep && !window.nextStep._fixDefinitivo) {
                const original = window.nextStep;
                window.nextStep = function() {
                    console.log('🎯 [FIX DEFINITIVO] nextStep interceptado!');
                    
                    // Pegar step ANTES de mudar
                    const stepAntes = window.getCurrentStep ? window.getCurrentStep() : 1;
                    
                    // Chamar original
                    const result = original.apply(this, arguments);
                    
                    // Esperar mudança acontecer
                    setTimeout(() => {
                        // Coletar dados do step ANTERIOR (que acabou de sair)
                        console.log(`📊 [FIX DEFINITIVO] Coletando dados do step ${stepAntes}`);
                        
                        if (window.coletarDadosStepAtual) {
                            window.coletarDadosStepAtual(stepAntes);
                        }
                        
                        // Forçar salvamento
                        if (window.WizardDataCollector) {
                            const dados = JSON.stringify(window.WizardDataCollector);
                            localStorage.setItem('wizardDataCollector', dados);
                            console.log(`💾 [FIX DEFINITIVO] Salvou ${dados.length} caracteres`);
                        }
                        
                        // Também salvar com saveWizardData
                        if (window.saveWizardData) {
                            window.saveWizardData();
                        }
                        
                    }, 300); // Aguardar DOM atualizar
                    
                    return result;
                };
                window.nextStep._fixDefinitivo = true;
                console.log('✅ [FIX DEFINITIVO] Override aplicado!');
            }
        }, 500);
        
        // 2. Observar mudanças no DOM dos steps
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    // Se é um step ficando ativo
                    if (target.dataset && target.dataset.step && target.classList.contains('active')) {
                        const novoStep = parseInt(target.dataset.step);
                        const stepAnterior = novoStep - 1;
                        
                        if (stepAnterior > 0) {
                            console.log(`🔄 [FIX DEFINITIVO] Mudança detectada: saindo do step ${stepAnterior}`);
                            
                            // Coletar dados do step anterior
                            setTimeout(() => {
                                if (window.coletarDadosStepAtual) {
                                    window.coletarDadosStepAtual(stepAnterior);
                                    
                                    // Salvar
                                    if (window.WizardDataCollector) {
                                        localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
                                        console.log(`💾 [FIX DEFINITIVO] Dados do step ${stepAnterior} salvos via DOM`);
                                    }
                                }
                            }, 200);
                        }
                    }
                }
            });
        });
        
        // Observar todos os elementos com data-step
        document.querySelectorAll('[data-step]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
        
        console.log('👁️ [FIX DEFINITIVO] Observando mudanças no DOM');
        
        // 3. Salvar ao sair do campo (blur) em campos importantes
        const camposImportantes = [
            'startDateTime', 'endDateTime', 'eventDescription', 
            'venueName', 'addressSearch', 'street', 'number'
        ];
        
        camposImportantes.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.addEventListener('blur', () => {
                    console.log(`📝 [FIX DEFINITIVO] Campo ${id} perdeu foco, salvando...`);
                    
                    const step = window.getCurrentStep ? window.getCurrentStep() : 1;
                    if (window.coletarDadosStepAtual) {
                        window.coletarDadosStepAtual(step);
                        
                        if (window.WizardDataCollector) {
                            localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
                        }
                    }
                });
            }
        });
        
        console.log('✅ [FIX DEFINITIVO] Sistema de coleta definitivo ativo!');
        
    });
    
})();
