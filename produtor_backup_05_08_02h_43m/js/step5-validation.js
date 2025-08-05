// Validação da Etapa 5 - Lotes devem existir para avançar
(function() {
    console.log('🔧 Aplicando validação da etapa 5 (Lotes)...');
    
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(function() {
        // Salvar referência da função original
        const originalNextStep = window.nextStep;
        
        if (!originalNextStep) {
            console.error('❌ Função nextStep não encontrada!');
            return;
        }
        
        // Override da função nextStep
        window.nextStep = function() {
            console.log('📋 Verificando avanço de etapa. Etapa atual:', window.currentStep);
            
            // Verificar apenas quando estiver saindo da etapa 5
            if (window.currentStep === 5) {
                console.log('🔍 Validando lotes na etapa 5...');
                
                // Verificar lotes no DOM
                const loteCards = document.querySelectorAll('.lote-card');
                const lotesCount = loteCards.length;
                
                console.log(`Lotes encontrados no DOM: ${lotesCount}`);
                
                // Verificar também dados salvos
                let temLotesSalvos = false;
                const savedData = getCookie('eventoWizard');
                if (savedData) {
                    try {
                        const wizardData = JSON.parse(savedData);
                        if (wizardData.lotes && wizardData.lotes.length > 0) {
                            temLotesSalvos = true;
                            console.log(`Lotes salvos no cookie: ${wizardData.lotes.length}`);
                        }
                        
                        // Verificar também lotesData (compatibilidade)
                        if (wizardData.lotesData) {
                            const lotesData = wizardData.lotesData;
                            if ((lotesData.porData && lotesData.porData.length > 0) || 
                                (lotesData.porPercentual && lotesData.porPercentual.length > 0)) {
                                temLotesSalvos = true;
                                console.log('Lotes encontrados em lotesData');
                            }
                        }
                    } catch (e) {
                        console.error('Erro ao verificar lotes salvos:', e);
                    }
                }
                
                // Se não há lotes nem no DOM nem salvos, bloquear
                if (lotesCount === 0 && !temLotesSalvos) {
                    console.log('❌ Bloqueando avanço: Nenhum lote cadastrado');
                    
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Atenção',
                            'É necessário cadastrar pelo menos um lote antes de prosseguir.'
                        );
                    } else {
                        alert('É necessário cadastrar pelo menos um lote antes de prosseguir.');
                    }
                    
                    return false;
                }
                
                console.log('✅ Validação passou: Lotes encontrados');
            }
            
            // Chamar função original
            return originalNextStep.apply(this, arguments);
        };
        
        console.log('✅ Validação da etapa 5 aplicada com sucesso!');
    }, 1000);
})();
