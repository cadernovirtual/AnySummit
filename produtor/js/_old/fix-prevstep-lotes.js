/**
 * Fix para prevStep e verificação de lotes
 */

(function() {
    'use strict';
    
    console.log('🔧 Fix prevStep e lotes iniciando...');
    
    // 1. Garantir que prevStep existe
    let checkCount = 0;
    const checkPrevStep = setInterval(() => {
        checkCount++;
        
        if (window.prevStep) {
            console.log('✅ prevStep encontrado após', checkCount, 'tentativas');
            clearInterval(checkPrevStep);
        } else if (checkCount > 20) {
            console.error('❌ prevStep não encontrado, criando...');
            
            // Criar função de emergência
            window.prevStep = function() {
                console.log('⬅️ prevStep de emergência executado');
                
                const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
                if (currentStep > 1) {
                    // Salvar dados do step atual antes de voltar
                    if (window.coletarDadosStepAtual) {
                        window.coletarDadosStepAtual(currentStep);
                    }
                    
                    const novoStep = currentStep - 1;
                    
                    // Atualizar estado
                    if (window.setCurrentStep) {
                        window.setCurrentStep(novoStep);
                    }
                    
                    // Atualizar display manualmente
                    // Remover active do atual
                    document.querySelector(`[data-step="${currentStep}"]`)?.classList.remove('active');
                    document.querySelector(`[data-step-content="${currentStep}"]`)?.classList.remove('active');
                    
                    // Adicionar active ao anterior
                    document.querySelector(`[data-step="${novoStep}"]`)?.classList.add('active');
                    document.querySelector(`[data-step-content="${novoStep}"]`)?.classList.add('active');
                    
                    // Atualizar navegação
                    const prevBtn = document.querySelector('.prev-btn');
                    const nextBtn = document.querySelector('.next-btn');
                    
                    if (prevBtn) prevBtn.style.display = novoStep > 1 ? 'flex' : 'none';
                    if (nextBtn) nextBtn.textContent = novoStep === 8 ? 'Finalizar' : 'Próximo';
                    
                    // Forçar atualização do display
                    if (window.updateStepDisplay) {
                        window.updateStepDisplay();
                    }
                    
                    console.log(`✅ Voltou do step ${currentStep} para ${novoStep}`);
                }
            };
            
            clearInterval(checkPrevStep);
        }
    }, 100);
    
    // 2. Override do prevStep para salvar antes de voltar
    setTimeout(() => {
        if (window.prevStep) {
            const originalPrevStep = window.prevStep;
            window.prevStep = function() {
                console.log('⬅️ prevStep interceptado - salvando dados');
                
                // Salvar dados do step atual
                const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
                if (window.coletarDadosStepAtual) {
                    window.coletarDadosStepAtual(currentStep);
                }
                
                // Chamar original
                return originalPrevStep.apply(this, arguments);
            };
        }
    }, 2000);
    
    // 3. Monitor específico para lotes
    window.monitorarLotes = function() {
        console.log('=== MONITOR DE LOTES ===');
        console.log('window.lotesData:', window.lotesData);
        
        // Verificar cookie
        const loteCookie = getCookie('lotesData');
        if (loteCookie) {
            console.log('Cookie lotesData:', JSON.parse(loteCookie));
        }
        
        // Verificar localStorage
        const saved = localStorage.getItem('wizardDataCollector');
        if (saved) {
            const data = JSON.parse(saved);
            console.log('Lotes no wizardDataCollector:', data.dados.lotes);
        }
        
        // Verificar DOM
        console.log('Lotes por data no DOM:', document.querySelectorAll('#lotesDataList .lote-card').length);
        console.log('Lotes por percentual no DOM:', document.querySelectorAll('#lotesPercentualList .lote-card').length);
    };
    
    // 4. Interceptar criação de lotes
    ['adicionarLotePorData', 'adicionarLotePorPercentual'].forEach(funcName => {
        if (window[funcName]) {
            const original = window[funcName];
            window[funcName] = function() {
                console.log(`📦 ${funcName} interceptado`);
                
                // Chamar original
                const result = original.apply(this, arguments);
                
                // Forçar salvamento
                setTimeout(() => {
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                    if (window.coletarDadosStepAtual) {
                        window.coletarDadosStepAtual(5);
                    }
                    console.log('💾 Lote salvo!');
                }, 300);
                
                return result;
            };
        }
    });
    
    // 5. Garantir renderização ao entrar no step 5
    document.addEventListener('DOMContentLoaded', function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.dataset && target.dataset.stepContent === '5' && target.classList.contains('active')) {
                        console.log('📍 Entrou no step 5 - renderizando lotes');
                        setTimeout(() => {
                            if (window.renderizarLotesPorData) {
                                window.renderizarLotesPorData();
                            }
                            if (window.renderizarLotesPorPercentual) {
                                window.renderizarLotesPorPercentual();
                            }
                            
                            // Também atualizar selects de lotes nos ingressos
                            if (window.atualizarSelectsLotes) {
                                window.atualizarSelectsLotes();
                            }
                        }, 200);
                    }
                }
            });
        });
        
        // Observar mudanças no step content
        document.querySelectorAll('[data-step-content]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
    });
    
    // Função helper
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    console.log('✅ Fix prevStep e lotes carregado!');
    console.log('💡 Use monitorarLotes() para debug');
    
})();
