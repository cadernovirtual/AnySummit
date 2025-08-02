/**
 * FIX URGENTE - GARANTIR SALVAMENTO
 * Restaura salvamento automático no nextStep
 */

(function() {
    'use strict';
    
    console.log('🚨 FIX URGENTE - Restaurando salvamento automático...');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // Verificar se nextStep existe
        if (window.nextStep) {
            const originalNextStep = window.nextStep;
            
            // Override para SEMPRE salvar
            window.nextStep = function() {
                console.log('🔥 nextStep INTERCEPTADO - SALVANDO DADOS!');
                
                // SALVAR DADOS - MÚLTIPLAS FORMAS PARA GARANTIR
                
                // 1. saveWizardData se existir
                if (window.saveWizardData) {
                    console.log('💾 Salvando com saveWizardData...');
                    window.saveWizardData();
                }
                
                // 2. Forçar coleta e salvamento
                if (window.WizardDataCollector && window.forcarColetaCompleta) {
                    console.log('💾 Forçando coleta completa...');
                    window.forcarColetaCompleta();
                }
                
                // 3. Chamar função original
                const result = originalNextStep.apply(this, arguments);
                
                // 4. Salvar novamente após mudança
                setTimeout(() => {
                    if (window.saveWizardData) {
                        console.log('💾 Salvando após mudança de step...');
                        window.saveWizardData();
                    }
                }, 100);
                
                return result;
            };
            
            console.log('✅ Override de emergência aplicado!');
        } else {
            console.error('❌ nextStep ainda não existe!');
        }
        
        // Também interceptar cliques diretos nos botões
        document.addEventListener('click', function(e) {
            // Se clicou em botão de próximo
            if (e.target.textContent && e.target.textContent.includes('Próximo')) {
                console.log('🎯 Clique em botão Próximo detectado!');
                
                // Forçar salvamento
                setTimeout(() => {
                    if (window.saveWizardData) {
                        window.saveWizardData();
                    }
                    if (window.forcarColetaCompleta) {
                        window.forcarColetaCompleta();
                    }
                }, 50);
            }
        }, true);
        
    }, 500);
    
    console.log('✅ Fix urgente carregado!');
    
})();
