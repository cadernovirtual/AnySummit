// Correção para restauração de dados do wizard
console.log('🔄 Carregando correções de restauração do wizard...');

// Garantir que a função checkAndRestoreWizardData funcione corretamente
window.checkAndRestoreWizardData = function() {
    console.log('=== VERIFICANDO DADOS SALVOS DO WIZARD ===');
    console.log('Cookies disponíveis:', document.cookie);
    
    // Função auxiliar para obter cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }
    
    const savedData = getCookie('eventoWizard');
    console.log('Dados obtidos do cookie:', savedData ? 'SIM' : 'NÃO');
    
    if (savedData) {
        console.log('✅ Dados encontrados! Tentando fazer parse...');
        try {
            const data = JSON.parse(savedData);
            let eventName = data.eventName || 'Evento não nomeado';
            
            console.log('Nome do evento salvo:', eventName);
            console.log('Step salvo:', data.currentStep);
            
            // Verificar se o nome do evento parece válido
            if (!eventName || eventName.trim() === '' || eventName === 'Evento não nomeado') {
                console.warn('⚠️ Nome de evento inválido, limpando dados...');
                clearAllWizardData();
                return;
            }
            
            // Criar dialog de confirmação
            createRestoreDialog(eventName, data);
            
        } catch (error) {
            console.error('❌ Erro ao recuperar dados salvos:', error);
            clearAllWizardData();
        }
    } else {
        console.log('ℹ️ Nenhum dado de wizard salvo encontrado');
    }
};

// Função para criar dialog de restauração
function createRestoreDialog(eventName, data) {
    console.log('📋 Criando dialog de restauração...');
    
    // Verificar se já existe um dialog
    if (document.getElementById('restoreWizardDialog')) {
        return;
    }
    
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'restoreWizardOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Criar dialog
    const dialog = document.createElement('div');
    dialog.id = 'restoreWizardDialog';
    dialog.style.cssText = `
        background: #1a1a2e;
        border: 1px solid rgba(114, 94, 255, 0.3);
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideIn 0.3s ease;
        color: #E1E5F2;
    `;
    
    dialog.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔄</div>
            <h2 style="color: #E1E5F2; margin: 0 0 10px 0; font-size: 24px;">
                Continuar Criação de Evento?
            </h2>
        </div>
        
        <div style="margin-bottom: 25px; text-align: center;">
            <p style="font-size: 16px; color: #8B95A7; margin-bottom: 15px;">
                Encontramos dados salvos do evento:
            </p>
            <div style="
                background: rgba(0, 194, 255, 0.1);
                border: 1px solid rgba(0, 194, 255, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
            ">
                <strong style="color: #00C2FF; font-size: 18px;">${eventName}</strong>
            </div>
            <p style="font-size: 14px; color: #8B95A7;">
                Você estava na etapa ${data.currentStep || 1} de 8
            </p>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="restoreYes" style="
                background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                ✅ Continuar de onde parei
            </button>
            <button id="restoreNo" style="
                background: #6b7280;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                🆕 Começar novo evento
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        #restoreYes:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(114, 94, 255, 0.3); }
        #restoreNo:hover { background: #4b5563; }
    `;
    document.head.appendChild(style);
    
    // Event listeners
    document.getElementById('restoreYes').addEventListener('click', function() {
        console.log('✅ Usuário escolheu continuar');
        overlay.remove();
        restoreWizardData(data);
    });
    
    document.getElementById('restoreNo').addEventListener('click', function() {
        console.log('🆕 Usuário escolheu começar novo');
        overlay.remove();
        clearAllWizardData();
    });
}

// Função melhorada para restaurar dados
window.restoreWizardData = function(data) {
    console.log('📥 Restaurando dados do wizard...', data);
    
    try {
        // Restaurar step atual
        if (data.currentStep && window.wizardState) {
            window.wizardState.currentStep = data.currentStep;
            if (window.setCurrentStep) {
                window.setCurrentStep(data.currentStep);
            }
        }
        
        // Restaurar dados do formulário
        const campos = {
            'eventName': data.eventName,
            'classification': data.classification,
            'category': data.category,
            'startDateTime': data.startDateTime,
            'endDateTime': data.endDateTime,
            'eventDescription': data.eventDescription,
            'venueName': data.venueName,
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
                if (id === 'eventDescription' && element.contentEditable === 'true') {
                    element.innerHTML = campos[id];
                } else {
                    element.value = campos[id];
                }
            }
        });
        
        // Restaurar imagens
        if (data.uploadedImages || data.logoPath || data.capaPath || data.fundoPath) {
            console.log('🖼️ Restaurando imagens...');
            
            // Logo
            if (data.logoPath || data.uploadedImages?.logo) {
                const logoPath = data.logoPath || data.uploadedImages.logo;
                const logoContainer = document.getElementById('logoPreviewContainer');
                if (logoContainer) {
                    logoContainer.innerHTML = `
                        <img src="${logoPath}" alt="logo">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    `;
                    const clearButton = document.getElementById('clearLogo');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Capa
            if (data.capaPath || data.uploadedImages?.capa) {
                const capaPath = data.capaPath || data.uploadedImages.capa;
                const capaContainer = document.getElementById('capaPreviewContainer');
                if (capaContainer) {
                    capaContainer.innerHTML = `
                        <img src="${capaPath}" alt="capa">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    `;
                    const clearButton = document.getElementById('clearCapa');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Fundo
            if (data.fundoPath || data.uploadedImages?.fundo) {
                const fundoPath = data.fundoPath || data.uploadedImages.fundo;
                const fundoContainer = document.getElementById('fundoPreviewMain');
                if (fundoContainer) {
                    fundoContainer.innerHTML = `
                        <img src="${fundoPath}" alt="fundo">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    `;
                    const clearButton = document.getElementById('clearFundo');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
        }
        
        // Atualizar displays
        if (window.updateStepDisplay) {
            window.updateStepDisplay();
        }
        if (window.updatePreview) {
            window.updatePreview();
        }
        
        console.log('✅ Dados restaurados com sucesso!');
        
        // Mostrar mensagem de sucesso
        showSuccessMessage('Dados restaurados! Você pode continuar de onde parou.');
        
    } catch (error) {
        console.error('❌ Erro ao restaurar dados:', error);
        alert('Erro ao restaurar dados. Por favor, comece novamente.');
    }
};

// Função para mostrar mensagem de sucesso
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

// Função para limpar dados
window.clearAllWizardData = function() {
    console.log('🗑️ Limpando todos os dados do wizard...');
    
    const cookies = ['eventoWizard', 'lotesData', 'ingressosData'];
    cookies.forEach(cookie => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    console.log('✅ Dados limpos');
};

// Verificar dados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - aguardando para verificar dados salvos...');
    
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        if (typeof window.checkAndRestoreWizardData === 'function') {
            window.checkAndRestoreWizardData();
        }
    }, 1000);
});

console.log('✅ Correções de restauração do wizard carregadas');
