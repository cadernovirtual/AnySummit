// Fix para corrigir erro de JSON e garantir que o dialog apareça
console.log('🔧 Aplicando fix de JSON e recuperação...');

(function() {
    // Sobrescrever função getCookie para debug
    window.getCookie = function(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const cookieValue = parts.pop().split(';').shift();
            console.log(`🍪 Cookie ${name}:`, cookieValue);
            return cookieValue;
        }
        return null;
    };
    
    // Função para escapar strings para JSON
    function escapeJsonString(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }
    
    // Sobrescrever saveWizardData original para corrigir problema de JSON
    const originalSaveWizardData = window.saveWizardData;
    
    window.saveWizardData = function() {
        console.log('🔧 [FIX] Interceptando saveWizardData...');
        
        try {
            // Coletar dados do wizard com escape adequado
            const wizardData = {
                currentStep: window.wizardState ? window.wizardState.currentStep : 1,
                eventName: escapeJsonString(document.getElementById('eventName')?.value || ''),
                classification: document.getElementById('classification')?.value || '',
                category: document.getElementById('category')?.value || '',
                startDateTime: document.getElementById('startDateTime')?.value || '',
                endDateTime: document.getElementById('endDateTime')?.value || '',
                eventDescription: escapeJsonString(document.getElementById('eventDescription')?.innerText || ''),
                locationTypeSwitch: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
                venueName: escapeJsonString(document.getElementById('venueName')?.value || ''),
                addressSearch: escapeJsonString(document.getElementById('addressSearch')?.value || ''),
                eventLink: escapeJsonString(document.getElementById('eventLink')?.value || ''),
                producer: document.getElementById('producer')?.value || '',
                producerName: escapeJsonString(document.getElementById('producerName')?.value || ''),
                displayName: escapeJsonString(document.getElementById('displayName')?.value || ''),
                producerDescription: escapeJsonString(document.getElementById('producerDescription')?.value || ''),
                termsAccepted: document.getElementById('termsCheckbox')?.classList.contains('checked')
            };
            
            // Converter para JSON de forma segura
            const jsonString = JSON.stringify(wizardData);
            
            // Salvar no cookie
            document.cookie = `eventoWizard=${encodeURIComponent(jsonString)}; path=/; max-age=86400`;
            
            console.log('✅ [FIX] Dados salvos com sucesso no cookie');
            
            // Chamar função original se existir
            if (originalSaveWizardData && originalSaveWizardData !== window.saveWizardData) {
                try {
                    originalSaveWizardData();
                } catch (e) {
                    console.log('⚠️ Erro na função original, mas dados foram salvos:', e);
                }
            }
            
        } catch (error) {
            console.error('❌ [FIX] Erro ao salvar:', error);
        }
    };
    
    // Verificar dados salvos ao carregar a página
    setTimeout(() => {
        console.log('🔍 [FIX] Verificando dados salvos para recuperação...');
        const savedData = getCookie('eventoWizard');
        
        if (savedData) {
            console.log('✅ [FIX] Cookie encontrado, tentando decodificar...');
            try {
                const data = JSON.parse(decodeURIComponent(savedData));
                const eventName = data.eventName || 'Evento não nomeado';
                const currentStep = data.currentStep || 1;
                
                console.log('📋 [FIX] Dados decodificados com sucesso:', { eventName, currentStep });
                
                // Mostrar dialog IMEDIATAMENTE
                const message = `🔄 RECUPERAR CADASTRO?\n\nEvento: "${eventName}"\nEtapa: ${currentStep} de 8\n\nDeseja continuar de onde parou?`;
                
                // Usar setTimeout para garantir que o dialog apareça
                setTimeout(() => {
                    if (confirm(message)) {
                        console.log('✅ Usuário escolheu continuar');
                        
                        // Restaurar dados
                        if (window.restoreWizardData) {
                            window.restoreWizardData(data);
                        } else {
                            // Restaurar manualmente alguns campos
                            if (data.eventName) {
                                const field = document.getElementById('eventName');
                                if (field) field.value = data.eventName;
                            }
                            if (window.wizardState && data.currentStep) {
                                window.wizardState.currentStep = data.currentStep;
                                if (window.updateStepDisplay) {
                                    window.updateStepDisplay();
                                }
                            }
                        }
                    } else {
                        console.log('❌ Usuário escolheu começar novo');
                        // Limpar cookie
                        document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        location.reload();
                    }
                }, 100); // Pequeno delay para garantir que o dialog apareça
                
            } catch (e) {
                console.error('❌ [FIX] Erro ao processar dados salvos:', e);
                console.log('Cookie raw:', savedData);
                // Limpar cookie corrompido
                document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        } else {
            console.log('📝 [FIX] Nenhum dado salvo encontrado');
        }
    }, 1000); // Reduzir para 1 segundo
    
    console.log('✅ [FIX] Fix de JSON e recuperação aplicado');
})();