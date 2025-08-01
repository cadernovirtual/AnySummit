// Fix para recuperação do wizard COM O DIALOG BONITO
(function() {
    console.log('🔧 Corrigindo recuperação do wizard com dialog customizado...');
    
    // Garantir que a função checkAndRestoreWizardData use o dialog bonito
    window.checkAndRestoreWizardDataFixed = function() {
        console.log('=== VERIFICANDO DADOS DO WIZARD ===');
        
        const savedData = getCookie('eventoWizard');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Verificar se tem dados significativos
                if (!data.currentStep || data.currentStep <= 1) {
                    console.log('Dados não significativos, ignorando...');
                    return;
                }
                
                let eventName = data.eventName || 'Evento não nomeado';
                
                // USAR O DIALOG BONITO!
                if (window.customDialog && window.customDialog.wizardRestore) {
                    console.log('✅ Usando dialog customizado bonito!');
                    
                    window.customDialog.wizardRestore(eventName).then(action => {
                        console.log('Resposta do usuário:', action);
                        
                        if (action === 'continue') {
                            console.log('Restaurando dados...');
                            restoreWizardDataCompleto(data);
                        } else {
                            console.log('Limpando dados...');
                            clearAllWizardData();
                        }
                    });
                } else {
                    console.error('❌ customDialog não disponível!');
                    
                    // Tentar carregar novamente após um delay
                    setTimeout(() => {
                        if (window.customDialog && window.customDialog.wizardRestore) {
                            window.customDialog.wizardRestore(eventName).then(action => {
                                if (action === 'continue') {
                                    restoreWizardDataCompleto(data);
                                } else {
                                    clearAllWizardData();
                                }
                            });
                        }
                    }, 500);
                }
                
            } catch (error) {
                console.error('Erro ao recuperar dados:', error);
                clearAllWizardData();
            }
        }
    };
    
    // Função completa de restauração
    window.restoreWizardDataCompleto = function(data) {
        console.log('🔄 Restaurando TODOS os dados do wizard...');
        
        // 1. Restaurar imagens
        if (data.uploadedImages) {
            window.uploadedImages = data.uploadedImages;
        }
        
        // Restaurar logo
        if (data.logoUrl || data.logoPath) {
            const logoUrl = data.logoUrl || data.logoPath;
            const logoContainer = document.getElementById('logoPreviewContainer');
            if (logoContainer) {
                logoContainer.innerHTML = `
                    <img src="${logoUrl}" alt="logo">
                    <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                `;
                const clearButton = document.getElementById('clearLogo');
                if (clearButton) clearButton.style.display = 'flex';
            }
        }
        
        // Restaurar capa
        if (data.capaUrl || data.capaPath) {
            const capaUrl = data.capaUrl || data.capaPath;
            const capaContainer = document.getElementById('capaPreviewContainer');
            if (capaContainer) {
                capaContainer.innerHTML = `
                    <img src="${capaUrl}" alt="capa">
                    <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                `;
                const clearButton = document.getElementById('clearCapa');
                if (clearButton) clearButton.style.display = 'flex';
            }
        }
        
        // Restaurar fundo
        if (data.fundoUrl || data.fundoPath) {
            const fundoUrl = data.fundoUrl || data.fundoPath;
            const fundoContainer = document.getElementById('fundoPreviewMain');
            if (fundoContainer) {
                fundoContainer.innerHTML = `<img src="${fundoUrl}" alt="fundo">`;
                const clearButton = document.getElementById('clearFundo');
                if (clearButton) clearButton.style.display = 'flex';
            }
        }
        
        // 2. Restaurar campos do formulário
        const campos = {
            'eventName': data.eventName,
            'eventLink': data.eventLink,
            'eventDescription': data.eventDescription,
            'classification': data.classification,
            'category': data.category,
            'startDateTime': data.startDateTime,
            'endDateTime': data.endDateTime,
            'addressSearch': data.addressSearch,
            'street': data.street,
            'number': data.number,
            'complement': data.complement,
            'neighborhood': data.neighborhood,
            'city': data.city,
            'state': data.state,
            'cep': data.cep,
            'venueName': data.venueName,
            'producer': data.producer,
            'producerName': data.producerName,
            'displayName': data.displayName,
            'producerDescription': data.producerDescription
        };
        
        Object.entries(campos).forEach(([id, valor]) => {
            if (valor && document.getElementById(id)) {
                document.getElementById(id).value = valor;
            }
        });
        
        // 3. Restaurar cor de fundo
        if (data.corFundo) {
            const corFundo = document.getElementById('corFundo');
            const corFundoHex = document.getElementById('corFundoHex');
            const colorPreview = document.getElementById('colorPreview');
            if (corFundo) corFundo.value = data.corFundo;
            if (corFundoHex) corFundoHex.value = data.corFundo;
            if (colorPreview) colorPreview.style.backgroundColor = data.corFundo;
        }
        
        // 4. Restaurar lotes
        if (data.lotesData && window.lotesManager) {
            try {
                window.lotesManager.restaurar(data.lotesData);
            } catch(e) {
                console.error('Erro ao restaurar lotes:', e);
            }
        }
        
        // 5. Restaurar ingressos
        if (data.ingressosSalvos && data.ingressosSalvos.length > 0) {
            const ticketsList = document.getElementById('ticketsList');
            if (ticketsList) {
                ticketsList.innerHTML = ''; // Limpar primeiro
                
                data.ingressosSalvos.forEach(ticket => {
                    if (typeof addTicketToList === 'function') {
                        addTicketToList(ticket);
                    }
                });
            }
        }
        
        // 6. Ir para o step correto
        if (data.currentStep && data.currentStep > 1) {
            currentStep = data.currentStep;
            updateStepDisplay();
        }
        
        // 7. Atualizar preview
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
        
        console.log('✅ Dados restaurados com sucesso!');
    };
    
    // Substituir a função original
    if (typeof checkAndRestoreWizardData !== 'undefined') {
        window.checkAndRestoreWizardData = checkAndRestoreWizardDataFixed;
    }
    
    // Garantir que seja chamada quando apropriado
    document.addEventListener('DOMContentLoaded', function() {
        // Aguardar um pouco para garantir que customDialog esteja carregado
        setTimeout(() => {
            // Só verificar se estamos no passo 1
            const stepAtual = document.querySelector('[data-step].active');
            if (stepAtual && stepAtual.dataset.step === '1') {
                checkAndRestoreWizardDataFixed();
            }
        }, 1000);
    });
    
    console.log('✅ Fix de recuperação com dialog bonito aplicado!');
})();