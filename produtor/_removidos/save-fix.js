// Fix para garantir que dados sejam salvos mesmo com campos vazios
console.log('💾 Aplicando fix de salvamento...');

(function() {
    // Aguardar um pouco para garantir que outras funções foram carregadas
    setTimeout(() => {
        // Interceptar saveWizardData para garantir salvamento
        const originalSaveWizardData = window.saveWizardData;
        
        window.saveWizardData = function() {
            console.log('💾 [FIX-SAVE] Salvando dados do wizard...');
            
            try {
                // Coletar dados atuais
                const wizardData = {
                    currentStep: window.wizardState ? window.wizardState.currentStep : 1,
                    eventName: document.getElementById('eventName')?.value || '',
                    classification: document.getElementById('classification')?.value || '',
                    category: document.getElementById('category')?.value || '',
                    startDateTime: document.getElementById('startDateTime')?.value || '',
                    endDateTime: document.getElementById('endDateTime')?.value || '',
                    eventDescription: document.getElementById('eventDescription')?.innerText || '',
                    locationTypeSwitch: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
                    venueName: document.getElementById('venueName')?.value || '',
                    addressSearch: document.getElementById('addressSearch')?.value || '',
                    eventLink: document.getElementById('eventLink')?.value || '',
                    producer: document.getElementById('producer')?.value || 'current',
                    producerName: document.getElementById('producerName')?.value || '',
                    displayName: document.getElementById('displayName')?.value || '',
                    producerDescription: document.getElementById('producerDescription')?.value || '',
                    termsAccepted: document.getElementById('termsCheckbox')?.classList.contains('checked'),
                    timestamp: Date.now()
                };
                
                // Salvar no cookie (mesmo com campos vazios)
                const jsonString = JSON.stringify(wizardData);
                const encoded = encodeURIComponent(jsonString);
                document.cookie = `eventoWizard=${encoded}; path=/; max-age=86400`;
                
                console.log('✅ [FIX-SAVE] Dados salvos no cookie');
                
                // Chamar função original se existir
                if (originalSaveWizardData && originalSaveWizardData !== window.saveWizardData) {
                    try {
                        originalSaveWizardData();
                    } catch (e) {
                        console.log('⚠️ Erro na função original:', e);
                    }
                }
                
            } catch (error) {
                console.error('❌ [FIX-SAVE] Erro ao salvar:', error);
            }
        };
        
        // Salvar automaticamente a cada mudança de step
        const originalNextStep = window.nextStep;
        if (originalNextStep) {
            window.nextStep = function() {
                const result = originalNextStep.apply(this, arguments);
                // Salvar após mudar de step
                setTimeout(() => {
                    if (window.saveWizardData) {
                        window.saveWizardData();
                    }
                }, 500);
                return result;
            };
        }
        
        console.log('✅ [FIX-SAVE] Fix de salvamento aplicado');
    }, 2000);
})();