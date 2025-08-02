/**
 * Sistema unificado de recuperação do wizard
 * Garante que apenas um dialog de recuperação apareça
 */

(function() {
    'use strict';
    
    console.log('🛡️ Sistema unificado de recuperação iniciando...');
    console.log('📍 Script carregado em:', new Date().toLocaleTimeString());
    
    // Flag global para evitar múltiplas execuções
    window._recoveryDialogShown = false;
    window._recoveryInProgress = false;
    
    // Função auxiliar para obter cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Nova função unificada de recuperação
    window.checkAndRestoreWizardDataUnified = function() {
        console.log('🔍 checkAndRestoreWizardDataUnified chamada');
        console.log('Cookies disponíveis:', document.cookie);
        
        // Se já foi mostrado ou está em progresso, não fazer nada
        if (window._recoveryDialogShown || window._recoveryInProgress) {
            console.log('⏭️ Dialog já mostrado ou em progresso, ignorando...');
            return;
        }
        
        // Marcar como em progresso
        window._recoveryInProgress = true;
        
        try {
            const savedData = getCookie('eventoWizard');
            console.log('📦 Dados salvos encontrados:', savedData ? 'SIM' : 'NÃO');
            
            if (!savedData) {
                console.log('📝 Nenhum dado salvo encontrado');
                window._recoveryInProgress = false;
                return;
            }
            
            // Decodificar dados
            const data = JSON.parse(decodeURIComponent(savedData));
            console.log('📋 Dados decodificados:', data);
            
            // Verificar se há dados válidos
            const hasValidData = data.eventName || data.classification || data.category ||
                               data.startDateTime || data.venueName || data.addressSearch ||
                               data.corFundo || data.eventDescription || 
                               (data.currentStep && data.currentStep > 1);
            
            if (!hasValidData) {
                console.log('📝 Nenhum dado relevante para recuperar');
                window._recoveryInProgress = false;
                return;
            }
            
            // Marcar que o dialog será mostrado
            window._recoveryDialogShown = true;
            
            // Mostrar dialog
            const eventName = data.eventName || 'Cadastro não finalizado';
            const step = data.currentStep || 1;
            
            if (window.customDialog && window.customDialog.confirm) {
                window.customDialog.confirm({
                    title: '🔄 Recuperar Cadastro Anterior?',
                    message: `Foi encontrado um cadastro em andamento:<br><br>` +
                            `<strong>Evento:</strong> ${eventName}<br>` +
                            `<strong>Progresso:</strong> Etapa ${step} de 8<br><br>` +
                            `Deseja continuar de onde parou?`,
                    confirmText: 'Continuar Cadastro',
                    cancelText: 'Começar Novo',
                    onConfirm: () => {
                        console.log('✅ Continuando cadastro anterior');
                        
                        // Restaurar dados
                        if (window.restoreWizardData) {
                            window.restoreWizardData(data);
                            
                            // Ir para o step salvo
                            if (data.currentStep && window.setCurrentStep) {
                                window.setCurrentStep(data.currentStep);
                                if (window.updateStepDisplay) {
                                    window.updateStepDisplay();
                                }
                            }
                        }
                        
                        window._recoveryInProgress = false;
                    },
                    onCancel: () => {
                        console.log('❌ Começando novo cadastro - limpando TODOS os dados');
                        
                        // Usar função de limpeza completa
                        if (window.limparTodosOsDadosDoWizard) {
                            window.limparTodosOsDadosDoWizard();
                        } else {
                            // Fallback se a função não estiver disponível
                            document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            if (window.clearAllWizardData) {
                                window.clearAllWizardData();
                            }
                        }
                        
                        window._recoveryInProgress = false;
                        
                        // Recarregar a página para garantir limpeza total
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                });
            } else {
                // Fallback para confirm nativo
                const continuar = confirm(`Foi encontrado um cadastro em andamento:\n\n` +
                                        `Evento: ${eventName}\n` +
                                        `Progresso: Etapa ${step} de 8\n\n` +
                                        `Deseja continuar de onde parou?`);
                
                if (continuar) {
                    if (window.restoreWizardData) {
                        window.restoreWizardData(data);
                    }
                } else {
                    document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.reload();
                }
                
                window._recoveryInProgress = false;
            }
            
        } catch (e) {
            console.error('❌ Erro ao processar dados de recuperação:', e);
            window._recoveryInProgress = false;
            window._recoveryDialogShown = false;
        }
    };
    
    // Substituir todas as chamadas existentes
    window.checkAndRestoreWizardData = window.checkAndRestoreWizardDataUnified;
    
    // Garantir que seja chamada apenas uma vez quando o DOM carregar
    let domLoaded = false;
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔄 DOMContentLoaded - unified-recovery');
        
        if (!domLoaded) {
            domLoaded = true;
            
            // Aguardar um pouco para garantir que tudo esteja carregado
            setTimeout(() => {
                console.log('🕐 Timeout executado - verificando recuperação...');
                
                // Só verificar se estamos no step 1
                const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
                console.log('📍 Step atual:', currentStep);
                
                if (currentStep === 1) {
                    console.log('✅ No step 1 - chamando checkAndRestoreWizardDataUnified');
                    window.checkAndRestoreWizardDataUnified();
                } else {
                    console.log('⏭️ Não está no step 1, pulando verificação');
                }
            }, 1500);
        }
    });
    
    console.log('✅ Sistema unificado de recuperação configurado!');
    console.log('💡 Para testar manualmente, use: checkAndRestoreWizardDataUnified()');
    
    // Expor função para teste manual
    window.testarRecuperacao = function() {
        window._recoveryDialogShown = false;
        window._recoveryInProgress = false;
        window.checkAndRestoreWizardDataUnified();
    };
    
})();
