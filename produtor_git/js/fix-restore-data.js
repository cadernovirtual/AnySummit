// =====================================================
// CORREÇÃO DEFINITIVA - RECUPERAÇÃO DE DADOS
// =====================================================

console.log('🔧 Correção de recuperação de dados iniciada');

// Desabilitar TODOS os outros sistemas de recuperação
window._jaRestaurou = true; // Previne forceful-fixes
window._originalCheckAndRestore = null; // Desabilita critical-fixes
window.checkAndRestoreWizardData = function() {
    console.log('✅ checkAndRestoreWizardData interceptado e desabilitado');
};

// Sistema único de recuperação
setTimeout(() => {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
    
    if (cookie && !window._recuperacaoExecutada) {
        window._recuperacaoExecutada = true;
        
        try {
            const value = cookie.split('=')[1];
            const data = JSON.parse(decodeURIComponent(value));
            
            if (data.eventName) {
                console.log('📋 Dados salvos encontrados:', data);
                
                // Usar o dialog customizado se existir, senão confirm
                if (window.customDialog && window.customDialog.wizardRestore) {
                    window.customDialog.wizardRestore(data.eventName).then(action => {
                        if (action === 'continue') {
                            restaurarDadosCompletos(data);
                        } else {
                            limparDadosWizard();
                        }
                    });
                } else {
                    if (confirm(`Deseja continuar o evento "${data.eventName}"?`)) {
                        restaurarDadosCompletos(data);
                    } else {
                        limparDadosWizard();
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao processar cookie:', error);
        }
    }
}, 1500);

function restaurarDadosCompletos(data) {
    console.log('🔄 Restaurando dados completos...');
    
    // Step 1 - Básicos
    restaurarCampo('eventName', data.eventName);
    restaurarCampo('classification', data.classification);
    restaurarCampo('category', data.category);
    
    // Step 2 - Imagens
    if (data.logoPath || data.logoUrl) {
        restaurarImagem('logoPreviewContainer', data.logoPath || data.logoUrl, 'logo');
    }
    if (data.capaPath || data.capaUrl) {
        restaurarImagem('capaPreviewContainer', data.capaPath || data.capaUrl, 'capa');
    }
    if (data.fundoPath || data.fundoUrl) {
        restaurarImagem('fundoPreviewMain', data.fundoPath || data.fundoUrl, 'fundo');
    }
    
    // Cor de fundo
    if (data.corFundo) {
        restaurarCampo('corFundo', data.corFundo);
        restaurarCampo('corFundoHex', data.corFundo);
        const preview = document.getElementById('colorPreview');
        if (preview) preview.style.backgroundColor = data.corFundo;
    }
    
    // Step 3 - Datas
    restaurarCampo('startDateTime', data.startDateTime);
    restaurarCampo('endDateTime', data.endDateTime);
    
    // Step 4 - Local
    if (data.isPresential !== undefined) {
        const locationSwitch = document.getElementById('locationTypeSwitch');
        const presential = document.getElementById('presentialLocation');
        const online = document.getElementById('onlineLocation');
        
        if (locationSwitch) {
            if (data.isPresential) {
                locationSwitch.classList.add('active');
                if (presential) presential.classList.add('show');
                if (online) online.classList.remove('show');
            } else {
                locationSwitch.classList.remove('active');
                if (presential) presential.classList.remove('show');
                if (online) online.classList.add('show');
            }
        }
    }
    
    // Campos de endereço
    ['venueName', 'eventLink', 'addressSearch', 'street', 'number', 
     'complement', 'neighborhood', 'city', 'state', 'cep'].forEach(field => {
        restaurarCampo(field, data[field]);
    });
    
    // Step 7 - Descrição
    if (data.eventDescription) {
        const desc = document.getElementById('eventDescription');
        if (desc) desc.innerHTML = data.eventDescription;
    }
    
    // Step 8 - Termos
    if (data.acceptTerms) {
        const terms = document.getElementById('acceptTerms');
        if (terms) terms.checked = true;
    }
    
    // Ir para o step salvo
    if (data.currentStep && data.currentStep > 1) {
        setTimeout(() => {
            if (window.goToStep) {
                window.goToStep(data.currentStep);
            }
        }, 500);
    }
    
    console.log('✅ Dados restaurados com sucesso!');
}

function restaurarCampo(id, valor) {
    if (valor) {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = valor;
            console.log(`✅ ${id} = ${valor}`);
        }
    }
}

function restaurarImagem(containerId, src, tipo) {
    const container = document.getElementById(containerId);
    if (container && src) {
        container.innerHTML = `
            <img src="${src}" alt="${tipo}">
            <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
        `;
        
        // Mostrar botão de limpar
        const clearBtn = document.getElementById('clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
        if (clearBtn) clearBtn.style.display = 'flex';
    }
}

function limparDadosWizard() {
    document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    document.cookie = 'ingressosData=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    console.log('🗑️ Dados do wizard limpos');
}

console.log('✅ Sistema de recuperação único configurado');