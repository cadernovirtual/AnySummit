// Script definitivo de recuperação usando dialog customizado
console.log('🎯 Script de recuperação com dialog customizado iniciado');

// Aguardar 3 segundos para garantir que tudo carregou
setTimeout(function() {
    console.log('🔍 Verificando dados salvos...');
    
    // Buscar cookie
    const cookies = document.cookie.split(';');
    let wizardData = null;
    
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith('eventoWizard=')) {
            wizardData = trimmed.substring(13);
            break;
        }
    }
    
    if (wizardData) {
        console.log('✅ Cookie encontrado!');
        
        try {
            // Decodificar e fazer parse
            const decoded = decodeURIComponent(wizardData);
            const data = JSON.parse(decoded);
            
            console.log('📋 Dados decodificados:', data);
            
            // Preparar informações
            const eventName = data.eventName || 'Cadastro não finalizado';
            const step = data.currentStep || 1;
            
            // Verificar se há algum dado preenchido (além do step)
            const hasData = data.eventName || data.classification || data.category || 
                           data.startDateTime || data.venueName || data.addressSearch;
            
            if (!hasData && step === 1) {
                console.log('📝 Nenhum dado relevante para recuperar');
                return;
            }
            
            // Usar o dialog customizado se disponível
            if (window.customDialog && window.customDialog.confirm) {
                console.log('🎨 Usando dialog customizado...');
                
                window.customDialog.confirm({
                    title: '🔄 Recuperar Cadastro Anterior?',
                    message: `Foi encontrado um cadastro em andamento:\n\n` +
                            `<strong>Evento:</strong> ${eventName}\n` +
                            `<strong>Progresso:</strong> Etapa ${step} de 8\n\n` +
                            `Deseja continuar de onde parou?`,
                    confirmText: 'Continuar Cadastro',
                    cancelText: 'Começar Novo',
                    onConfirm: () => {
                        console.log('✅ Continuando cadastro anterior');
                        
                        // Restaurar dados
                        if (window.restoreWizardData) {
                            // Garantir que não seja limpo por nome vazio
                            if (!data.eventName) {
                                data.eventName = ' '; // Espaço para evitar limpeza
                            }
                            window.restoreWizardData(data);
                            
                            // Limpar campo se estava vazio
                            setTimeout(() => {
                                const eventField = document.getElementById('eventName');
                                if (eventField && eventField.value === ' ') {
                                    eventField.value = '';
                                }
                            }, 500);
                        }
                    },
                    onCancel: () => {
                        console.log('❌ Começando novo cadastro');
                        document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        window.location.reload();
                    }
                });
                
            } else {
                console.log('⚠️ Dialog customizado não disponível, usando nativo');
                
                // Fallback para confirm nativo
                const continuar = window.confirm(
                    `🔄 RECUPERAR CADASTRO ANTERIOR?\n\n` +
                    `Evento: "${eventName}"\n` +
                    `Etapa: ${step} de 8\n\n` +
                    `OK = Continuar cadastro\n` +
                    `CANCELAR = Começar novo`
                );
                
                if (continuar) {
                    console.log('✅ Continuando cadastro');
                    if (window.restoreWizardData) {
                        if (!data.eventName) data.eventName = ' ';
                        window.restoreWizardData(data);
                        
                        setTimeout(() => {
                            const eventField = document.getElementById('eventName');
                            if (eventField && eventField.value === ' ') {
                                eventField.value = '';
                            }
                        }, 500);
                    }
                } else {
                    console.log('❌ Começando novo');
                    document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.reload();
                }
            }
            
        } catch (e) {
            console.error('❌ Erro ao processar dados:', e);
        }
    } else {
        console.log('📝 Nenhum cookie encontrado');
    }
}, 3000); // Aguardar 3 segundos para garantir que customDialog esteja disponível