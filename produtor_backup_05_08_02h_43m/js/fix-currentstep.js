/**
 * Correção forçada do currentStep
 * Garante que o wizard sempre comece na etapa 1
 */

(function() {
    'use strict';
    
    console.log('🔧 Aplicando correção do currentStep');
    
    // Aguardar carregamento completo
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            // Forçar currentStep = 1
            if (window.setCurrentStep) {
                console.log('✅ Forçando currentStep = 1');
                window.setCurrentStep(1);
            }
            
            // Garantir que apenas a primeira etapa esteja ativa
            document.querySelectorAll('.section-card').forEach((card, index) => {
                if (index === 0) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
            
            // Atualizar indicadores
            updateStepIndicator(1);
            
            console.log('✅ Correção aplicada - currentStep:', window.getCurrentStep ? window.getCurrentStep() : 'não definido');
        }, 200);
    });
    
    // Função auxiliar para atualizar indicadores
    function updateStepIndicator(step) {
        // Atualizar breadcrumb
        document.querySelectorAll('.step').forEach((el, index) => {
            if (index < step) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else if (index === step - 1) {
                el.classList.add('active');
            } else {
                el.classList.remove('active', 'completed');
            }
        });
        
        // Atualizar cards
        document.querySelectorAll('.section-card').forEach((card) => {
            const cardStep = parseInt(card.getAttribute('data-step-content'));
            if (cardStep === step) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
    
})();
