// Script simples para garantir que o dialog apareça
console.log('🎯 Script de recuperação simples iniciado');

// Executar após 2 segundos
setTimeout(function() {
    console.log('🔍 Verificando cookie eventoWizard...');
    
    // Buscar cookie manualmente
    const cookies = document.cookie.split(';');
    let wizardData = null;
    
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith('eventoWizard=')) {
            wizardData = trimmed.substring(13); // Remove "eventoWizard="
            break;
        }
    }
    
    if (wizardData) {
        console.log('✅ Cookie encontrado!');
        
        try {
            // Decodificar e fazer parse
            const decoded = decodeURIComponent(wizardData);
            const data = JSON.parse(decoded);
            
            console.log('📋 Dados:', data);
            
            // FORÇAR O DIALOG A APARECER
            const eventName = data.eventName || 'Evento não nomeado';
            const step = data.currentStep || 1;
            
            const continuar = window.confirm(
                `🔄 RECUPERAR CADASTRO ANTERIOR?\n\n` +
                `Evento: "${eventName}"\n` +
                `Etapa: ${step} de 8\n\n` +
                `Clique OK para continuar de onde parou\n` +
                `Clique CANCELAR para começar novo`
            );
            
            if (continuar) {
                console.log('✅ Continuando cadastro anterior');
                // Tentar restaurar
                if (window.restoreWizardData) {
                    window.restoreWizardData(data);
                } else if (window.wizardState) {
                    window.wizardState.currentStep = step;
                    if (window.updateStepDisplay) {
                        window.updateStepDisplay();
                    }
                }
            } else {
                console.log('❌ Começando novo cadastro');
                document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.reload();
            }
            
        } catch (e) {
            console.error('❌ Erro ao processar cookie:', e);
        }
    } else {
        console.log('📝 Nenhum cookie eventoWizard encontrado');
    }
}, 2000);