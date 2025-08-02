// Gestão do Wizard - Verificação ANTES de limpar
console.log('🔍 Iniciando verificação do wizard SEM limpar dados...');

(function() {
    // Função para obter cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Função para limpar dados
    function limparDadosDoWizard() {
        console.log('🗑️ Limpando dados do wizard...');
        
        // Limpar cookies do wizard
        document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Limpar localStorage
        localStorage.removeItem('eventoWizard');
        localStorage.removeItem('wizardData');
        
        // Limpar variáveis globais
        if (window.wizardState) window.wizardState.currentStep = 1;
        if (window.ticketList) window.ticketList = [];
        if (window.lotesPorData) window.lotesPorData = [];
        if (window.lotesPorQuantidade) window.lotesPorQuantidade = [];
        
        console.log('✅ Dados do wizard limpos');
    }
    
    // VERIFICAR PRIMEIRO, SEM LIMPAR
    console.log('📋 Verificando dados salvos...');
    const savedData = getCookie('eventoWizard');
    
    if (savedData) {
        console.log('✅ Cookie eventoWizard encontrado!');
        
        try {
            // IMPORTANTE: Decodificar antes de fazer parse!
            const decodedData = decodeURIComponent(savedData);
            const data = JSON.parse(decodedData);
            const eventName = data.eventName || 'Evento não nomeado';
            const currentStep = data.currentStep || 1;
            
            console.log('📊 Dados do wizard:', {
                evento: eventName,
                etapa: currentStep
            });
            
            // Aguardar um momento e perguntar
            setTimeout(() => {
                const mensagem = `🔄 CONTINUAR CADASTRO ANTERIOR?\n\nEvento: "${eventName}"\nEtapa: ${currentStep} de 8\n\nDeseja continuar de onde parou?`;
                
                if (confirm(mensagem)) {
                    console.log('✅ Usuário escolheu CONTINUAR');
                    
                    // Restaurar dados
                    if (window.restoreWizardData) {
                        window.restoreWizardData(data);
                    } else {
                        // Tentar restaurar manualmente
                        if (window.wizardState) {
                            window.wizardState.currentStep = currentStep;
                        }
                        if (data.eventName && document.getElementById('eventName')) {
                            document.getElementById('eventName').value = data.eventName;
                        }
                        if (window.updateStepDisplay) {
                            window.updateStepDisplay();
                        }
                    }
                } else {
                    console.log('❌ Usuário escolheu NOVO - limpando dados...');
                    limparDadosDoWizard();
                    location.reload();
                }
            }, 500);
            
        } catch (e) {
            console.error('Erro ao processar cookie:', e);
            console.log('Cookie raw:', savedData);
            console.log('Tentando limpar cookie corrompido...');
            limparDadosDoWizard();
        }
    } else {
        console.log('📝 Nenhum dado de wizard salvo');
    }
    
    // Expor função de limpeza
    window.limparDadosDoWizard = limparDadosDoWizard;
})();