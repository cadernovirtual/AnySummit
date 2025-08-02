// Fix para Dialog de Recuperação do Wizard e Validação de Lotes
console.log('🔧 Aplicando fix de recuperação e lotes...');

document.addEventListener('DOMContentLoaded', function() {
    
    // FIX 1: Garantir que checkAndRestoreWizardData seja chamada
    setTimeout(() => {
        console.log('🔍 Tentando recuperar dados do wizard...');
        
        // Verificar se há cookie salvo
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };
        
        const savedData = getCookie('eventoWizard');
        console.log('Cookie encontrado:', !!savedData);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                const eventName = data.eventName || 'Evento não nomeado';
                
                console.log('📋 Dados encontrados para:', eventName);
                
                // Se customDialog não estiver disponível, usar confirm nativo
                const message = `Encontramos dados salvos do evento "${eventName}". Deseja continuar de onde parou?`;
                
                if (window.customDialog && window.customDialog.wizardRestore) {
                    console.log('Usando customDialog');
                    window.customDialog.wizardRestore(eventName).then(action => {
                        if (action === 'continue' && window.restoreWizardData) {
                            window.restoreWizardData(data);
                        } else if (window.clearAllWizardData) {
                            window.clearAllWizardData();
                        }
                    });
                } else {
                    console.log('Usando confirm nativo');
                    if (confirm(message)) {
                        if (window.restoreWizardData) {
                            window.restoreWizardData(data);
                        } else {
                            console.error('restoreWizardData não encontrada');
                        }
                    } else {
                        if (window.clearAllWizardData) {
                            window.clearAllWizardData();
                        }
                    }
                }
            } catch (e) {
                console.error('Erro ao processar cookie:', e);
            }
        }
    }, 1000);
    
    // FIX 2: Override da validação de lotes para aceitar arrays globais
    const originalValidateStep = window.validateStep;
    
    window.validateStep = function(stepNumber) {
        console.log('🔍 [FIX] ValidateStep interceptado para step:', stepNumber);
        
        if (stepNumber === 5) {
            // Verificar arrays globais de lotes
            let temLotes = false;
            
            // Verificar window.lotesPorData
            if (window.lotesPorData && Array.isArray(window.lotesPorData) && window.lotesPorData.length > 0) {
                console.log('✅ Lotes por data encontrados:', window.lotesPorData.length);
                temLotes = true;
            }
            
            // Verificar window.lotesPorQuantidade  
            if (window.lotesPorQuantidade && Array.isArray(window.lotesPorQuantidade) && window.lotesPorQuantidade.length > 0) {
                console.log('✅ Lotes por quantidade encontrados:', window.lotesPorQuantidade.length);
                temLotes = true;
            }
            
            // Verificar window.lotes (array geral)
            if (window.lotes && Array.isArray(window.lotes) && window.lotes.length > 0) {
                console.log('✅ Lotes gerais encontrados:', window.lotes.length);
                temLotes = true;
            }
            
            if (temLotes) {
                console.log('✅ [FIX] Step 5 validado - lotes encontrados');
                // Continuar com outras validações se houver
                const result = originalValidateStep ? originalValidateStep.call(this, stepNumber) : true;
                
                // Se a validação original falhou mas temos lotes, forçar sucesso
                if (!result && temLotes) {
                    console.log('⚠️ Forçando validação de lotes como verdadeira');
                    return true;
                }
                return result;
            }
        }
        
        // Para outros steps, usar validação original
        return originalValidateStep ? originalValidateStep.call(this, stepNumber) : true;
    };
    
    console.log('✅ Fix de recuperação e lotes aplicado');
});