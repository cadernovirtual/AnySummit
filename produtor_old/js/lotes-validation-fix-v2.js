/**
 * Fix para validação da etapa 5 (Lotes)
 * Garante que a validação encontre os lotes corretamente
 */
(function() {
    console.log('🔧 Fix de validação de lotes iniciado');
    
    // Sobrescrever ou complementar a validação da etapa 5
    const originalValidateStep = window.validateStep;
    
    window.validateStep = function(stepNumber) {
        console.log(`🔍 Validando step ${stepNumber}`);
        
        if (stepNumber === 5) {
            console.log('📦 Validação especial para step 5 (Lotes)');
            
            // Verificar múltiplos seletores possíveis
            let loteCards = document.querySelectorAll('.lote-card');
            console.log('Lotes encontrados com .lote-card:', loteCards.length);
            
            if (loteCards.length === 0) {
                // Tentar outros seletores
                loteCards = document.querySelectorAll('[data-lote-id]');
                console.log('Lotes encontrados com [data-lote-id]:', loteCards.length);
            }
            
            if (loteCards.length === 0) {
                // Verificar containers
                const lotesPorData = document.getElementById('lotesPorData');
                const lotesPorPercentual = document.getElementById('lotesPorPercentual');
                
                const lotesDataCount = lotesPorData ? lotesPorData.children.length : 0;
                const lotesPercCount = lotesPorPercentual ? lotesPorPercentual.children.length : 0;
                
                console.log('Lotes por data:', lotesDataCount);
                console.log('Lotes por percentual:', lotesPercCount);
                
                if (lotesDataCount > 0 || lotesPercCount > 0) {
                    console.log('✅ Lotes encontrados nos containers');
                    return true;
                }
            }
            
            // Verificar window.lotesData
            if (window.lotesData) {
                const totalLotes = (window.lotesData.porData?.length || 0) + 
                                 (window.lotesData.porPercentual?.length || 0);
                console.log('Total de lotes em window.lotesData:', totalLotes);
                
                if (totalLotes > 0) {
                    console.log('✅ Lotes encontrados em window.lotesData');
                    return true;
                }
            }
            
            // Se encontrou lotes
            if (loteCards.length > 0) {
                console.log('✅ Validação do step 5 passou');
                return true;
            } else {
                console.log('❌ Nenhum lote cadastrado');
                
                // Mostrar mensagem de erro
                const validationMessage = document.getElementById('step5ValidationMessage') || 
                                        document.querySelector('[data-step="5"] .validation-message');
                if (validationMessage) {
                    validationMessage.textContent = 'É necessário cadastrar pelo menos 1 lote';
                    validationMessage.style.display = 'block';
                    validationMessage.classList.add('show');
                }
                
                return false;
            }
        }
        
        // Para outros steps, usar validação original
        if (originalValidateStep) {
            return originalValidateStep(stepNumber);
        }
        
        return true;
    };
    
    // Debug: verificar estado dos lotes
    window.debugLotes = function() {
        console.log('=== DEBUG LOTES ===');
        console.log('Lotes .lote-card:', document.querySelectorAll('.lote-card').length);
        console.log('Lotes [data-lote-id]:', document.querySelectorAll('[data-lote-id]').length);
        console.log('Container lotesPorData:', document.getElementById('lotesPorData')?.children.length);
        console.log('Container lotesPorPercentual:', document.getElementById('lotesPorPercentual')?.children.length);
        console.log('window.lotesData:', window.lotesData);
        
        // Verificar se os containers existem
        const step5Content = document.querySelector('[data-step-content="5"]');
        if (step5Content) {
            console.log('Step 5 visível:', step5Content.style.display !== 'none');
            console.log('HTML do step 5:', step5Content.innerHTML.substring(0, 200) + '...');
        }
    };
    
    console.log('✅ Fix de validação de lotes instalado');
    console.log('💡 Use debugLotes() para verificar estado');
})();