// Override definitivo de saveWizardData
console.log('🔧 Aplicando override definitivo de saveWizardData...');

// Aguardar um pouco para garantir que tudo carregou
setTimeout(() => {
    // Substituir completamente a função
    window.saveWizardData = function() {
        console.log('💾 [OVERRIDE] Salvando dados do wizard...');
        
        try {
            // Coletar dados básicos primeiro
            const basicData = {
                currentStep: window.wizardState ? window.wizardState.currentStep : 1,
                eventName: document.getElementById('eventName')?.value || '',
                classification: document.getElementById('classification')?.value || '',
                category: document.getElementById('category')?.value || '',
                startDateTime: document.getElementById('startDateTime')?.value || '',
                endDateTime: document.getElementById('endDateTime')?.value || '',
                venueName: document.getElementById('venueName')?.value || '',
                addressSearch: document.getElementById('addressSearch')?.value || '',
                eventLink: document.getElementById('eventLink')?.value || '',
                producer: document.getElementById('producer')?.value || 'current',
                timestamp: Date.now()
            };
            
            // Converter para JSON com segurança
            const jsonString = JSON.stringify(basicData);
            const encoded = encodeURIComponent(jsonString);
            
            // Salvar cookie
            document.cookie = `eventoWizard=${encoded}; path=/; max-age=86400`;
            
            console.log('✅ [OVERRIDE] Cookie salvo com sucesso!');
            console.log('📊 Dados:', basicData);
            
            // Verificar se foi salvo
            const cookies = document.cookie.split(';');
            const saved = cookies.find(c => c.trim().startsWith('eventoWizard='));
            
            if (saved) {
                console.log('✅ [OVERRIDE] Cookie verificado - OK!');
            } else {
                console.log('❌ [OVERRIDE] ERRO: Cookie não foi salvo!');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ [OVERRIDE] Erro ao salvar:', error);
            return false;
        }
    };
    
    // Interceptar nextStep para salvar automaticamente
    const originalNextStep = window.nextStep;
    if (originalNextStep) {
        window.nextStep = function() {
            console.log('➡️ [OVERRIDE] nextStep chamado...');
            
            // Executar função original
            const result = originalNextStep.apply(this, arguments);
            
            // Salvar após mudar de step
            setTimeout(() => {
                console.log('💾 [OVERRIDE] Salvando após mudar de step...');
                window.saveWizardData();
            }, 500);
            
            return result;
        };
    }
    
    // Salvar ao mudar campos importantes
    const campos = ['eventName', 'startDateTime', 'classification', 'category'];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            // Remover listeners antigos
            const newCampo = campo.cloneNode(true);
            campo.parentNode.replaceChild(newCampo, campo);
            
            // Adicionar novo listener
            newCampo.addEventListener('change', () => {
                console.log(`📝 [OVERRIDE] Campo ${id} alterado`);
                setTimeout(() => {
                    window.saveWizardData();
                }, 500);
            });
        }
    });
    
    console.log('✅ [OVERRIDE] Sistema de salvamento substituído com sucesso!');
    
    // Salvar dados atuais
    window.saveWizardData();
    
}, 3000); // Aguardar 3 segundos para garantir que tudo carregou