// ============================================
// WIZARD ESSENTIAL FIXES - CORREÇÕES MÍNIMAS
// ============================================
// Este arquivo contém APENAS as correções essenciais
// sem quebrar funcionalidades existentes

// ====================
// 1. VALIDAÇÃO DAS ETAPAS
// ====================

// Sobrescrever a função validateStep com uma versão funcional
if (typeof window.validateStep !== 'undefined') {
    const originalValidateStep = window.validateStep;
    
    window.validateStep = function(stepNumber) {
        console.log('🔍 ValidateStep (FIXED) chamado para step:', stepNumber);
        let isValid = true;
        let message = '';

        switch(stepNumber) {
            case 1:
                // Validar nome, logo e capa
                const eventName = document.getElementById('eventName')?.value?.trim();
                const logoImg = document.querySelector('#logoPreviewContainer img, #logoPreview img');
                const capaImg = document.querySelector('#capaPreviewContainer img, #capaPreview img');
                
                if (!eventName) {
                    message = 'Por favor, preencha o nome do evento.';
                    isValid = false;
                } else if (!logoImg || !logoImg.src || logoImg.src.includes('placeholder')) {
                    message = 'Por favor, adicione o logo do evento.';
                    isValid = false;
                } else if (!capaImg || !capaImg.src || capaImg.src.includes('placeholder')) {
                    message = 'Por favor, adicione a capa do evento.';
                    isValid = false;
                }
                break;

            case 2:
                // Validar data, classificação e categoria
                const eventDate = document.getElementById('eventDate')?.value;
                const eventTime = document.getElementById('eventTime')?.value;
                const eventClassification = document.getElementById('eventClassification')?.value;
                const eventCategory = document.getElementById('eventCategory')?.value;
                
                if (!eventDate || !eventTime || !eventClassification || !eventCategory) {
                    message = 'Por favor, preencha todos os campos obrigatórios.';
                    isValid = false;
                }
                break;

            case 3:
                // Validar descrição
                const eventDescription = document.getElementById('eventDescription')?.value?.trim();
                if (!eventDescription || eventDescription.length < 10) {
                    message = 'Por favor, adicione uma descrição do evento (mínimo 10 caracteres).';
                    isValid = false;
                }
                break;

            case 4:
                // Validar endereço/link baseado no tipo de evento
                const isOnline = document.getElementById('onlineEvent')?.checked;
                if (isOnline) {
                    const eventLink = document.getElementById('eventLink')?.value?.trim();
                    if (!eventLink) {
                        message = 'Por favor, adicione o link do evento online.';
                        isValid = false;
                    }
                } else {
                    const endereco = document.getElementById('endereco')?.value?.trim();
                    const numero = document.getElementById('numero')?.value?.trim();
                    if (!endereco || !numero) {
                        message = 'Por favor, preencha o endereço completo do evento.';
                        isValid = false;
                    }
                }
                break;

            case 5:
                // Validar lotes - verificar arrays globais E elementos DOM
                const hasLotesDOM = document.querySelectorAll('.lote-card').length > 0;
                const hasLotesArray = (window.lotes && window.lotes.length > 0) || 
                                    (window.lotesData && window.lotesData.length > 0);
                
                if (!hasLotesDOM && !hasLotesArray) {
                    message = 'Por favor, crie pelo menos um lote.';
                    isValid = false;
                }
                break;

            case 6:
                // Validar ingressos
                const hasIngressosDOM = document.querySelectorAll('.ticket-card').length > 0;
                const hasIngressosArray = (window.ingressos && window.ingressos.length > 0) || 
                                        (window.ingressosData && window.ingressosData.length > 0);
                
                if (!hasIngressosDOM && !hasIngressosArray) {
                    message = 'Por favor, crie pelo menos um ingresso.';
                    isValid = false;
                }
                break;

            case 7:
                // Step 7 sempre válido (produtor)
                isValid = true;
                break;

            case 8:
                // Validar aceite dos termos
                const termsAccepted = document.getElementById('acceptTerms')?.checked;
                if (!termsAccepted) {
                    message = 'Por favor, aceite os termos de uso e política de privacidade.';
                    isValid = false;
                }
                break;
        }

        // Mostrar mensagem de validação
        if (!isValid && message) {
            // Mostrar mensagem
            showValidationMessage(stepNumber, message);
        }

        console.log('✅ Validação step', stepNumber, ':', isValid);
        return isValid;
    };
}

// Função auxiliar para mostrar mensagem de validação
function showValidationMessage(stepNumber, message) {
    // Tentar usar customDialog se disponível
    if (typeof window.customDialog !== 'undefined') {
        window.customDialog('error', message);
    } else {
        alert(message);
    }
}

// ====================
// 2. LIMPEZA DE DADOS APÓS PUBLICAÇÃO
// ====================

// Função melhorada para limpar todos os dados
function clearAllWizardData() {
    console.log('🧹 Limpando todos os dados do wizard...');
    
    // Limpar cookies
    const cookiesToClear = [
        'eventoWizard',
        'lotesData',
        'ingressosData',
        'ingressosSalvos',
        'ingressosTemporarios',
        'temporaryTickets',
        'combosData'
    ];
    
    cookiesToClear.forEach(cookieName => {
        // Deletar em múltiplos paths para garantir
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/produtor;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/produtor/;`;
    });
    
    // Limpar localStorage
    const localStorageKeys = [
        'wizardData',
        'lotesData',
        'ingressosData',
        'temporaryTickets',
        'combosData',
        'eventWizardData'
    ];
    
    localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Limpar variáveis globais
    if (window.lotes) window.lotes = [];
    if (window.ingressos) window.ingressos = [];
    if (window.combos) window.combos = [];
    if (window.temporaryTickets) window.temporaryTickets = [];
    
    console.log('✅ Dados do wizard limpos com sucesso');
}

// Interceptar a função mostrarSucesso para limpar dados
if (typeof window.mostrarSucesso !== 'undefined') {
    const originalMostrarSucesso = window.mostrarSucesso;
    
    window.mostrarSucesso = function() {
        console.log('🎉 Evento publicado com sucesso! Limpando dados...');
        
        // Limpar todos os dados
        clearAllWizardData();
        
        // Chamar a função original
        if (originalMostrarSucesso) {
            return originalMostrarSucesso.apply(this, arguments);
        }
    };
}

// ====================
// 3. DIALOG DE RECUPERAÇÃO
// ====================

// Verificar e mostrar dialog de recuperação ao carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(function() {
        checkAndShowRecoveryDialog();
    }, 500);
});

function checkAndShowRecoveryDialog() {
    // Verificar se existe cookie de wizard salvo
    const wizardCookie = getCookie('eventoWizard');
    
    if (wizardCookie && wizardCookie.length > 10) {
        console.log('🔄 Cookie de wizard encontrado, mostrando dialog de recuperação');
        
        // Usar customDialog se disponível, senão usar confirm nativo
        const message = 'Você tem um evento não finalizado. Deseja continuar de onde parou?';
        
        if (typeof window.customDialog !== 'undefined') {
            window.customDialog('confirm', message, function(confirmed) {
                if (confirmed) {
                    recoverWizardData();
                } else {
                    clearAllWizardData();
                }
            });
        } else {
            if (confirm(message)) {
                recoverWizardData();
            } else {
                clearAllWizardData();
            }
        }
    }
}

// Função para recuperar dados do wizard
function recoverWizardData() {
    console.log('📥 Recuperando dados do wizard...');
    
    const wizardData = getCookie('eventoWizard');
    if (wizardData) {
        try {
            const data = JSON.parse(decodeURIComponent(wizardData));
            
            // Restaurar dados nos campos
            if (data.eventName) document.getElementById('eventName').value = data.eventName;
            if (data.eventDate) document.getElementById('eventDate').value = data.eventDate;
            if (data.eventTime) document.getElementById('eventTime').value = data.eventTime;
            // ... outros campos conforme necessário
            
            // Ir para o último step salvo
            if (data.currentStep && typeof window.goToStep === 'function') {
                window.goToStep(data.currentStep);
            }
            
            console.log('✅ Dados recuperados com sucesso');
        } catch (e) {
            console.error('❌ Erro ao recuperar dados:', e);
        }
    }
}

// Sobrescrever saveWizardData para salvar também no banco
if (typeof window.saveWizardData !== 'undefined') {
    const originalSaveWizardData = window.saveWizardData;
    
    window.saveWizardData = function() {
        // Chamar função original
        if (originalSaveWizardData) {
            originalSaveWizardData.apply(this, arguments);
        }
        
        // Salvar também no banco de dados (via AJAX)
        const wizardData = collectWizardData();
        if (wizardData) {
            saveWizardToDatabase(wizardData);
        }
    };
}

// Função para salvar wizard no banco de dados
function saveWizardToDatabase(data) {
    // Criar uma cópia dos dados para enviar
    const dataToSend = {
        dados_wizard: JSON.stringify(data),
        step_atual: data.currentStep || 1
    };
    
    // Enviar para o servidor
    fetch('ajax/salvar_wizard_rascunho.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            console.log('✅ Wizard salvo no banco de dados');
        }
    })
    .catch(error => {
        console.error('❌ Erro ao salvar wizard no banco:', error);
    });
}

// Função para coletar dados do wizard
function collectWizardData() {
    try {
        return {
            currentStep: window.currentStep || 1,
            eventName: document.getElementById('eventName')?.value || '',
            eventDate: document.getElementById('eventDate')?.value || '',
            eventTime: document.getElementById('eventTime')?.value || '',
            eventClassification: document.getElementById('eventClassification')?.value || '',
            eventCategory: document.getElementById('eventCategory')?.value || '',
            eventDescription: document.getElementById('eventDescription')?.value || '',
            // Adicionar mais campos conforme necessário
        };
    } catch (e) {
        console.error('Erro ao coletar dados:', e);
        return null;
    }
}

// Função auxiliar para obter cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return '';
}

// ====================
// 4. CORREÇÃO DOS BOTÕES AVANÇAR
// ====================

// Garantir que os botões "Avançar" chamem nextStep corretamente
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar carregar tudo
    setTimeout(function() {
        // Encontrar todos os botões "Avançar"
        const nextButtons = document.querySelectorAll('button[onclick*="nextStep"], .btn-primary[onclick*="nextStep"]');
        
        nextButtons.forEach(button => {
            // Remover onclick inline
            button.removeAttribute('onclick');
            
            // Adicionar event listener
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof window.nextStep === 'function') {
                    window.nextStep();
                } else {
                    console.error('❌ Função nextStep não encontrada');
                }
            });
        });
        
        console.log('✅ Botões "Avançar" corrigidos:', nextButtons.length);
    }, 1000);
});

// ====================
// 5. LIMPAR DADOS AO INICIAR NOVO WIZARD
// ====================

// Se não estamos retomando, limpar dados antigos
if (!window.location.search.includes('retomar=1')) {
    // Limpar dados antigos ao iniciar
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🆕 Iniciando novo wizard - limpando dados antigos');
        clearAllWizardData();
    });
}

// ====================
// 6. SALVAMENTO AUTOMÁTICO PERIÓDICO
// ====================

// Salvar automaticamente a cada 30 segundos
let autoSaveInterval;

function startAutoSave() {
    // Limpar intervalo anterior se existir
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    // Salvar a cada 30 segundos
    autoSaveInterval = setInterval(function() {
        if (typeof window.saveWizardData === 'function') {
            console.log('💾 Salvamento automático...');
            window.saveWizardData();
        }
    }, 30000); // 30 segundos
}

// Iniciar salvamento automático quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    startAutoSave();
});

// Parar salvamento automático ao publicar
if (typeof window.publishEvent !== 'undefined') {
    const originalPublishEvent = window.publishEvent;
    
    window.publishEvent = function() {
        // Parar salvamento automático
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
        }
        
        // Chamar função original
        if (originalPublishEvent) {
            return originalPublishEvent.apply(this, arguments);
        }
    };
}

console.log('✅ Wizard Essential Fixes carregado com sucesso');
