/**
 * Garantia de Funções do Wizard
 * Garante que nextStep e prevStep existam SEMPRE
 */
(function() {
    console.log('🔧 Garantindo funções do wizard...');
    
    // Criar funções imediatamente no window
    if (typeof window.nextStep !== 'function') {
        window.nextStep = function() {
            console.log('⏳ nextStep temporário - aguardando função real...');
            
            // Tentar chamar a função real se ela existir depois
            setTimeout(function() {
                if (window.nextStepReal && typeof window.nextStepReal === 'function') {
                    window.nextStepReal();
                } else {
                    console.error('❌ Função nextStep real não encontrada!');
                    alert('Erro ao avançar. Por favor, recarregue a página.');
                }
            }, 100);
        };
    }
    
    if (typeof window.prevStep !== 'function') {
        window.prevStep = function() {
            console.log('⏳ prevStep temporário - aguardando função real...');
            
            setTimeout(function() {
                if (window.prevStepReal && typeof window.prevStepReal === 'function') {
                    window.prevStepReal();
                } else {
                    console.error('❌ Função prevStep real não encontrada!');
                }
            }, 100);
        };
    }
    
    // Quando o DOM carregar, substituir pelas funções reais
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📍 DOM carregado, verificando funções...');
        
        // Aguardar um pouco para os scripts carregarem
        let tentativas = 0;
        const maxTentativas = 20;
        
        function verificarFuncoes() {
            tentativas++;
            console.log(`🔍 Verificação ${tentativas}/${maxTentativas}`);
            
            // Se encontrou as funções reais no criaevento.js
            if (window.nextStep && window.nextStep.toString().includes('validateStep')) {
                console.log('✅ Funções reais encontradas!');
                window.nextStepReal = window.nextStep;
                window.prevStepReal = window.prevStep;
                
                // Manter referência mas permitir interceptação
                return;
            }
            
            if (tentativas < maxTentativas) {
                setTimeout(verificarFuncoes, 500);
            } else {
                console.error('❌ Funções não encontradas após máximo de tentativas');
                
                // Criar implementação de emergência
                window.nextStep = function() {
                    console.log('🚨 Usando nextStep de emergência');
                    
                    const currentStep = window.currentStep || 1;
                    const nextStepNum = currentStep + 1;
                    
                    // Esconder atual
                    const atual = document.querySelector(`[data-step-content="${currentStep}"]`) ||
                                 document.querySelector(`.section-card[data-step-content="${currentStep}"]`);
                    if (atual) atual.style.display = 'none';
                    
                    // Mostrar próximo
                    const proximo = document.querySelector(`[data-step-content="${nextStepNum}"]`) ||
                                   document.querySelector(`.section-card[data-step-content="${nextStepNum}"]`);
                    if (proximo) proximo.style.display = 'block';
                    
                    window.currentStep = nextStepNum;
                    
                    // Scroll
                    window.scrollTo(0, 0);
                };
                
                window.prevStep = function() {
                    console.log('🚨 Usando prevStep de emergência');
                    
                    const currentStep = window.currentStep || 1;
                    if (currentStep > 1) {
                        const prevStepNum = currentStep - 1;
                        
                        // Esconder atual
                        const atual = document.querySelector(`[data-step-content="${currentStep}"]`) ||
                                     document.querySelector(`.section-card[data-step-content="${currentStep}"]`);
                        if (atual) atual.style.display = 'none';
                        
                        // Mostrar anterior
                        const anterior = document.querySelector(`[data-step-content="${prevStepNum}"]`) ||
                                        document.querySelector(`.section-card[data-step-content="${prevStepNum}"]`);
                        if (anterior) anterior.style.display = 'block';
                        
                        window.currentStep = prevStepNum;
                        
                        // Scroll
                        window.scrollTo(0, 0);
                    }
                };
            }
        }
        
        verificarFuncoes();
    });
    
    console.log('✅ Funções temporárias criadas');
})();