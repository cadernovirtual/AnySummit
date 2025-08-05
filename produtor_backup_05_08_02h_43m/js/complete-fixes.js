// Correções para imagens, restauração e botões de ingresso
console.log('🔧 Carregando correções completas do wizard...');

// 1. CORREÇÃO DA PERSISTÊNCIA E RESTAURAÇÃO DAS IMAGENS
// =====================================================

// Melhorar a função saveWizardData
window.saveWizardData = function() {
    console.log('💾 Salvando dados do wizard...');
    
    // Verificar se temos currentStep
    const currentStep = window.wizardState?.currentStep || 1;
    
    // Coletar URLs das imagens
    const logoImg = document.querySelector('#logoPreviewContainer img');
    const capaImg = document.querySelector('#capaPreviewContainer img');
    const fundoImg = document.querySelector('#fundoPreviewMain img');
    
    const wizardData = {
        currentStep: currentStep,
        eventName: document.getElementById('eventName')?.value || '',
        classification: document.getElementById('classification')?.value || '',
        category: document.getElementById('category')?.value || '',
        startDateTime: document.getElementById('startDateTime')?.value || '',
        endDateTime: document.getElementById('endDateTime')?.value || '',
        eventDescription: document.getElementById('eventDescription')?.innerHTML || '',
        
        // Localização
        venueName: document.getElementById('venueName')?.value || '',
        addressSearch: document.getElementById('addressSearch')?.value || '',
        cep: document.getElementById('cep')?.value || '',
        street: document.getElementById('street')?.value || '',
        number: document.getElementById('number')?.value || '',
        complement: document.getElementById('complement')?.value || '',
        neighborhood: document.getElementById('neighborhood')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        eventLink: document.getElementById('eventLink')?.value || '',
        isPresential: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
        
        // IMPORTANTE: Salvar URLs das imagens
        logoUrl: logoImg?.src || window.uploadedImages?.logo || '',
        capaUrl: capaImg?.src || window.uploadedImages?.capa || '',
        fundoUrl: fundoImg?.src || window.uploadedImages?.fundo || '',
        corFundo: document.getElementById('corFundo')?.value || '#000000',
        
        // Dados do produtor
        producer: document.getElementById('producer')?.value || 'current',
        producerName: document.getElementById('producerName')?.value || '',
        displayName: document.getElementById('displayName')?.value || '',
        producerDescription: document.getElementById('producerDescription')?.value || '',
        
        // Configurações finais
        termsAccepted: document.getElementById('termsCheckbox')?.classList.contains('checked') || false,
        visibility: document.querySelector('.radio.checked[data-value]')?.dataset.value || 'public',
        
        timestamp: new Date().getTime()
    };
    
    // Salvar no cookie
    document.cookie = `eventoWizard=${JSON.stringify(wizardData)}; path=/; max-age=${7*24*60*60}`;
    console.log('✅ Dados salvos:', wizardData);
};

// 2. CORREÇÃO DA RESTAURAÇÃO SEMPRE NA ETAPA 1
// =====================================================

// Sobrescrever a função de restauração
window.restoreWizardData = function(data) {
    console.log('📥 Restaurando dados do wizard...', data);
    
    try {
        // SEMPRE voltar para etapa 1
        if (window.wizardState) {
            window.wizardState.currentStep = 1;
        }
        if (window.setCurrentStep) {
            window.setCurrentStep(1);
        }
        
        // Restaurar todos os campos
        const campos = {
            'eventName': data.eventName,
            'classification': data.classification,
            'category': data.category,
            'startDateTime': data.startDateTime,
            'endDateTime': data.endDateTime,
            'venueName': data.venueName,
            'addressSearch': data.addressSearch,
            'cep': data.cep,
            'street': data.street,
            'number': data.number,
            'complement': data.complement,
            'neighborhood': data.neighborhood,
            'city': data.city,
            'state': data.state,
            'eventLink': data.eventLink,
            'producer': data.producer,
            'producerName': data.producerName,
            'displayName': data.displayName,
            'producerDescription': data.producerDescription,
            'corFundo': data.corFundo || '#000000'
        };
        
        // Preencher campos
        Object.keys(campos).forEach(id => {
            const element = document.getElementById(id);
            if (element && campos[id]) {
                element.value = campos[id];
            }
        });
        
        // Restaurar descrição (contentEditable)
        if (data.eventDescription) {
            const descElement = document.getElementById('eventDescription');
            if (descElement) {
                descElement.innerHTML = data.eventDescription;
            }
        }
        
        // IMPORTANTE: Restaurar imagens
        restaurarImagens(data);
        
        // Atualizar displays
        if (window.updateStepDisplay) {
            window.updateStepDisplay();
        }
        if (window.updatePreview) {
            window.updatePreview();
        }
        
        console.log('✅ Dados restaurados com sucesso na etapa 1!');
        
        // Mostrar mensagem
        showSuccessMessage('Dados restaurados! Todos os campos foram preenchidos.');
        
    } catch (error) {
        console.error('❌ Erro ao restaurar dados:', error);
    }
};

// Função para restaurar imagens
function restaurarImagens(data) {
    console.log('🖼️ Restaurando imagens...', {
        logo: data.logoUrl,
        capa: data.capaUrl,
        fundo: data.fundoUrl
    });
    
    // Restaurar Logo
    if (data.logoUrl && !data.logoUrl.includes('blob:')) {
        const logoContainer = document.getElementById('logoPreviewContainer');
        if (logoContainer) {
            logoContainer.innerHTML = `
                <img src="${data.logoUrl}" alt="logo" style="max-width: 100%; max-height: 120px;">
                <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                <div class="upload-hint">800x200px • Fundo transparente</div>
            `;
            const clearButton = document.getElementById('clearLogo');
            if (clearButton) clearButton.style.display = 'flex';
            
            // Salvar no window.uploadedImages
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages.logo = data.logoUrl;
        }
    }
    
    // Restaurar Capa
    if (data.capaUrl && !data.capaUrl.includes('blob:')) {
        const capaContainer = document.getElementById('capaPreviewContainer');
        if (capaContainer) {
            capaContainer.innerHTML = `
                <img src="${data.capaUrl}" alt="capa" style="max-width: 100%; max-height: 120px;">
                <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                <div class="upload-hint">450x450px • Fundo transparente</div>
            `;
            const clearButton = document.getElementById('clearCapa');
            if (clearButton) clearButton.style.display = 'flex';
            
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages.capa = data.capaUrl;
        }
    }
    
    // Restaurar Fundo
    if (data.fundoUrl && !data.fundoUrl.includes('blob:')) {
        const fundoContainer = document.getElementById('fundoPreviewMain');
        if (fundoContainer) {
            fundoContainer.innerHTML = `
                <img src="${data.fundoUrl}" alt="fundo" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
            `;
            const clearButton = document.getElementById('clearFundo');
            if (clearButton) clearButton.style.display = 'flex';
            
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages.fundo = data.fundoUrl;
        }
    }
    
    // Restaurar cor de fundo
    if (data.corFundo) {
        const corFundo = document.getElementById('corFundo');
        const corFundoHex = document.getElementById('corFundoHex');
        const colorPreview = document.getElementById('colorPreview');
        
        if (corFundo) corFundo.value = data.corFundo;
        if (corFundoHex) corFundoHex.value = data.corFundo;
        if (colorPreview) colorPreview.style.backgroundColor = data.corFundo;
    }
}

// 3. CORREÇÃO DOS BOTÕES DE INGRESSO NA ETAPA 6
// =====================================================

// Aguardar DOM carregar e configurar botões
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎟️ Configurando botões de ingresso...');
    
    // Configurar botão de ingresso pago
    const btnPaidTicket = document.getElementById('addPaidTicket');
    if (btnPaidTicket) {
        btnPaidTicket.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('💰 Abrindo modal de ingresso pago...');
            
            // Verificar se openModal existe
            if (typeof window.openModal === 'function') {
                window.openModal('paidTicketModal');
            } else if (typeof openModal === 'function') {
                openModal('paidTicketModal');
            } else {
                // Fallback - abrir modal manualmente
                const modal = document.getElementById('paidTicketModal');
                if (modal) {
                    modal.style.display = 'flex';
                    modal.classList.add('show');
                }
            }
        });
        console.log('✅ Botão ingresso pago configurado');
    }
    
    // Configurar botão de ingresso gratuito
    const btnFreeTicket = document.getElementById('addFreeTicket');
    if (btnFreeTicket) {
        btnFreeTicket.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🆓 Abrindo modal de ingresso gratuito...');
            
            if (typeof window.openModal === 'function') {
                window.openModal('freeTicketModal');
            } else if (typeof openModal === 'function') {
                openModal('freeTicketModal');
            } else {
                const modal = document.getElementById('freeTicketModal');
                if (modal) {
                    modal.style.display = 'flex';
                    modal.classList.add('show');
                }
            }
        });
        console.log('✅ Botão ingresso gratuito configurado');
    }
    
    // Configurar botão de combo
    const btnComboTicket = document.getElementById('addComboTicket');
    if (btnComboTicket) {
        btnComboTicket.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📦 Abrindo modal de combo...');
            
            if (typeof window.openModal === 'function') {
                window.openModal('comboTicketModal');
            } else if (typeof openModal === 'function') {
                openModal('comboTicketModal');
            } else {
                const modal = document.getElementById('comboTicketModal');
                if (modal) {
                    modal.style.display = 'flex';
                    modal.classList.add('show');
                }
            }
        });
        console.log('✅ Botão combo configurado');
    }
    
    // Salvar dados ao fazer upload de imagens
    configurarSalvamentoImagens();
});

// Configurar salvamento automático ao fazer upload
function configurarSalvamentoImagens() {
    const uploadInputs = ['logoUpload', 'capaUpload', 'fundoUpload'];
    
    uploadInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Remover listeners antigos
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Adicionar novo listener
            newInput.addEventListener('change', function() {
                console.log(`📸 Upload detectado: ${inputId}`);
                
                // Aguardar um pouco para o upload processar
                setTimeout(() => {
                    if (typeof window.saveWizardData === 'function') {
                        window.saveWizardData();
                    }
                }, 1000);
            });
        }
    });
}

// Função auxiliar para mostrar mensagem de sucesso
function showSuccessMessage(message) {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;
    msg.textContent = '✅ ' + message;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

// Garantir que openModal esteja disponível globalmente
if (typeof window.openModal === 'undefined') {
    window.openModal = function(modalId) {
        console.log('🪟 Abrindo modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            
            // Se for modal de ingresso, popular selects de lotes
            if (modalId === 'paidTicketModal' && typeof populatePaidTicketLote === 'function') {
                populatePaidTicketLote();
            } else if (modalId === 'freeTicketModal' && typeof populateFreeTicketLote === 'function') {
                populateFreeTicketLote();
            } else if (modalId === 'comboTicketModal' && typeof populateComboTicketLote === 'function') {
                populateComboTicketLote();
            }
        }
    };
}

console.log('✅ Correções completas do wizard carregadas!');
