/**
 * =====================================================
 * WIZARD FINAL COMPLETO - SISTEMA CONSOLIDADO
 * =====================================================
 * Sistema unificado do wizard AnySummit
 * Combina todas as funcionalidades essenciais
 * Elimina duplicações e conflitos
 * 
 * Estrutura:
 * 1. Configurações e Estado Global
 * 2. Navegação
 * 3. Validação
 * 4. Storage
 * 5. Sistema de Upload
 * 6. Sistema de Diálogos
 * 7. Utilidades
 * 8. Lotes
 * 9. Ingressos
 * 10. Combos
 * 11. Compatibilidade
 * 12. Inicialização
 * 13. Funções de Recuperação
 * =====================================================
 */

// Criar namespace principal
window.AnySummit = window.AnySummit || {};

// =====================================================
// 1. CONFIGURAÇÕES E ESTADO GLOBAL
// =====================================================

window.AnySummit.Wizard = {
    currentStep: 1,
    totalSteps: 8,
    config: {
        taxaServico: 8.00,
        api: {
            baseUrl: 'https://anysummit.com.br/produtor/criaeventoapi.php'
        }
    },
    
    // Métodos públicos do wizard
    nextStep: null,
    prevStep: null,
    goToStep: null,
    validateStep: null,
    updateStepDisplay: null,
    saveWizardData: null,
    clearAllWizardData: null,
    checkAndShowRecoveryDialog: null,
    
    // Sistema de modais
    Modal: {
        open: null,
        close: null
    }
};
// =====================================================
// 2. NAVEGAÇÃO
// =====================================================

/**
 * Atualiza a exibição do step atual
 */
window.AnySummit.Wizard.updateStepDisplay = function() {
    const stepAtual = window.AnySummit.Wizard.currentStep;
    
    // Atualizar cards de conteúdo
    document.querySelectorAll('.section-card').forEach(card => {
        const stepNumber = parseInt(card.dataset.stepContent);
        if (stepNumber === stepAtual) {
            card.classList.add('active');
            card.classList.remove('prev');
        } else if (stepNumber < stepAtual) {
            card.classList.add('prev');
            card.classList.remove('active');
        } else {
            card.classList.remove('active', 'prev');
        }
    });

    // Atualizar progress bar
    document.querySelectorAll('.step').forEach(step => {
        const stepNumber = parseInt(step.dataset.step);
        if (stepNumber === stepAtual) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else if (stepNumber < stepAtual) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    // Atualizar linha de progresso
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        const progressPercentage = ((stepAtual - 1) / (window.AnySummit.Wizard.totalSteps - 1)) * 100;
        progressLine.style.width = progressPercentage + '%';
    }

    // Scroll para o topo ao mudar de step
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Salvar estado atual
    window.AnySummit.Wizard.saveWizardData();
};

/**
 * Avança para o próximo step
 */
window.AnySummit.Wizard.nextStep = function() {
    const currentStep = window.AnySummit.Wizard.currentStep;
    
    if (window.AnySummit.Wizard.validateStep(currentStep)) {
        if (currentStep < window.AnySummit.Wizard.totalSteps) {
            window.AnySummit.Wizard.currentStep++;
            window.AnySummit.Wizard.updateStepDisplay();
        }
    }
};

/**
 * Volta para o step anterior
 */
window.AnySummit.Wizard.prevStep = function() {
    if (window.AnySummit.Wizard.currentStep > 1) {
        window.AnySummit.Wizard.currentStep--;
        window.AnySummit.Wizard.updateStepDisplay();
    }
};

/**
 * Navega para um step específico
 */
window.AnySummit.Wizard.goToStep = function(step) {
    if (step >= 1 && step <= window.AnySummit.Wizard.totalSteps) {
        window.AnySummit.Wizard.currentStep = step;
        window.AnySummit.Wizard.updateStepDisplay();
    }
};
// =====================================================
// 3. VALIDAÇÃO
// =====================================================

/**
 * Valida os campos de cada step do wizard
 */
window.AnySummit.Wizard.validateStep = function(stepNumber) {
    console.log('🔍 ValidateStep chamado para step:', stepNumber);
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
            const startDateTime = document.getElementById('startDateTime')?.value;
            const endDateTime = document.getElementById('endDateTime')?.value;
            const classification = document.getElementById('classification')?.value;
            const category = document.getElementById('category')?.value;
            
            if (!startDateTime || !classification || !category) {
                message = 'Por favor, preencha todos os campos obrigatórios (data início, classificação e categoria).';
                isValid = false;
            }
            
            // Validar que data fim seja posterior à data início se preenchida
            if (endDateTime && new Date(endDateTime) <= new Date(startDateTime)) {
                message = 'A data de término deve ser posterior à data de início.';
                isValid = false;
            }
            break;

        case 3:
            // Validar descrição
            const eventDescription = document.getElementById('eventDescription')?.textContent?.trim() || 
                                   document.getElementById('eventDescription')?.value?.trim();
            if (!eventDescription || eventDescription.length < 10) {
                message = 'Por favor, adicione uma descrição do evento (mínimo 10 caracteres).';
                isValid = false;
            }
            break;
        case 4:
            // Validar endereço/link baseado no tipo de evento
            const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
            
            if (!isPresential) {
                // Evento online
                const eventLink = document.getElementById('eventLink')?.value?.trim();
                if (!eventLink) {
                    message = 'Por favor, adicione o link do evento online.';
                    isValid = false;
                }
            } else {
                // Evento presencial
                const venueName = document.getElementById('venueName')?.value?.trim();
                const addressSearch = document.getElementById('addressSearch')?.value?.trim();
                const street = document.getElementById('street')?.value?.trim();
                const number = document.getElementById('number')?.value?.trim();
                
                if (!venueName || !addressSearch || (!street && !number)) {
                    message = 'Por favor, preencha o nome do local e endereço completo do evento.';
                    isValid = false;
                }
            }
            break;

        case 5:
            // Validar lotes - verificar múltiplas fontes
            const loteCards = document.querySelectorAll('.lote-card');
            const hasLotesDOM = loteCards && loteCards.length > 0;
            const hasLotesArray = (window.lotesData?.porData?.length > 0) || 
                                (window.lotesData?.porPercentual?.length > 0);
            
            if (!hasLotesDOM && !hasLotesArray) {
                message = 'Por favor, crie pelo menos um lote.';
                isValid = false;
            }
            break;
        case 6:
            // Validar ingressos - verificar múltiplas fontes
            const ticketItems = document.querySelectorAll('.ticket-item');
            const hasIngressosDOM = ticketItems && ticketItems.length > 0;
            const hasIngressosTemp = window.temporaryTickets && window.temporaryTickets.size > 0;
            const hasIngressosArray = (window.ingressos?.length > 0) || 
                                    (window.ingressosData?.length > 0);
            
            if (!hasIngressosDOM && !hasIngressosTemp && !hasIngressosArray) {
                message = 'Por favor, crie pelo menos um ingresso.';
                isValid = false;
            }
            break;

        case 7:
            // Step 7 sempre válido (seleção de produtor)
            isValid = true;
            break;

        case 8:
            // Validar aceite dos termos
            const termsCheckbox = document.getElementById('termsCheckbox');
            const termsAccepted = termsCheckbox?.classList.contains('checked') || 
                                 document.getElementById('acceptTerms')?.checked;
            
            if (!termsAccepted) {
                message = 'Por favor, aceite os termos de uso e política de privacidade.';
                isValid = false;
            }
            break;
    }

    // Mostrar mensagem de validação se houver erro
    if (!isValid && message) {
        if (window.customDialog) {
            window.customDialog.alert(message, 'Atenção');
        } else {
            alert(message);
        }
    }

    console.log('✅ Resultado da validação do step', stepNumber, ':', isValid);
    return isValid;
};
// =====================================================
// 4. STORAGE
// =====================================================

/**
 * Funções auxiliares de cookie
 */
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            let value = c.substring(nameEQ.length, c.length);
            try {
                return decodeURIComponent(value);
            } catch(e) {
                return value;
            }
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}