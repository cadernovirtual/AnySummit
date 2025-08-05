/**
 * Debug e garantia de nextStep disponível
 */

(function() {
    'use strict';
    
    console.log('🔧 Debug nextStep iniciando...');
    
    // Verificar periodicamente se nextStep está disponível
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        
        if (window.nextStep) {
            console.log('✅ nextStep encontrado após', checkCount, 'tentativas');
            console.log('Tipo:', typeof window.nextStep);
            console.log('Função:', window.nextStep);
            clearInterval(checkInterval);
        } else if (checkCount > 20) {
            console.error('❌ nextStep não encontrado após 20 tentativas');
            console.log('Criando nextStep de emergência...');
            
            // Criar função de emergência
            window.nextStep = function() {
                console.warn('⚠️ nextStep de emergência executado');
                
                // Tentar encontrar elementos necessários
                const currentStepEl = document.querySelector('[data-step].active');
                if (currentStepEl) {
                    const currentStep = parseInt(currentStepEl.dataset.step);
                    const nextStepEl = document.querySelector(`[data-step="${currentStep + 1}"]`);
                    
                    if (nextStepEl) {
                        // Remover active do atual
                        currentStepEl.classList.remove('active');
                        document.querySelector(`[data-step-content="${currentStep}"]`)?.classList.remove('active');
                        
                        // Adicionar active ao próximo
                        nextStepEl.classList.add('active');
                        document.querySelector(`[data-step-content="${currentStep + 1}"]`)?.classList.add('active');
                        
                        console.log('✅ Avançou para step', currentStep + 1);
                    }
                }
            };
            
            clearInterval(checkInterval);
        }
    }, 100);
    
    // Adicionar ao evento de clique dos botões como backup
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            // Encontrar todos os botões de próximo
            const nextButtons = document.querySelectorAll('button[onclick*="nextStep"]');
            console.log('🔍 Botões de próximo encontrados:', nextButtons.length);
            
            nextButtons.forEach((button, index) => {
                console.log(`Botão ${index + 1}:`, button.textContent.trim());
                
                // Adicionar listener de backup
                button.addEventListener('click', function(e) {
                    if (!window.nextStep) {
                        console.error('❌ nextStep ainda não definido no clique!');
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Tentar chamar função de emergência
                        if (window.nextStep) {
                            window.nextStep();
                        }
                    }
                });
            });
        }, 1000);
    });
    
    console.log('✅ Debug nextStep configurado');
    
})();
