/**
 * =====================================================
 * WIZARD CONSOLIDADO - PARTE 1: CORE + NAVEGAÇÃO
 * =====================================================
 * Consolidação das funções essenciais do sistema AnySummit
 * Criado em: 29/01/2025
 * 
 * Este arquivo consolida:
 * - Sistema de navegação do wizard
 * - Validações unificadas
 * - Sistema de modais único
 * - Salvamento e recuperação de dados
 * 
 * Elimina duplicações e conflitos entre múltiplas versões
 * =====================================================
 */

// =====================================================
// 1. NAMESPACE E INICIALIZAÇÃO
// =====================================================

window.AnySummit = window.AnySummit || {};
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
// 2. SISTEMA DE VALIDAÇÃO UNIFICADO
// =====================================================

/**
 * Valida os campos de cada step do wizard
 * Versão consolidada de wizard-essential-fixes.js (melhor implementação encontrada)
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
// 3. SISTEMA DE NAVEGAÇÃO UNIFICADO
// =====================================================

/**
 * Atualiza a exibição do step atual
 * Versão de criaevento.js (mais completa)
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
 * Versão consolidada com validação e salvamento
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
// 4. SISTEMA DE MODAIS ÚNICO
// =====================================================

/**
 * Abre um modal
 * Versão consolidada de modal-correto.js e criaevento.js
 */
window.AnySummit.Wizard.Modal.open = function(modalId) {
    console.log('🔓 Abrindo modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal não encontrado:', modalId);
        return;
    }
    
    // Remover style inline primeiro
    modal.style.display = '';
    
    // Adicionar classe show (CSS fará display: flex)
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Configurações específicas por tipo de modal
    switch(modalId) {
        case 'paidTicketModal':
            setTimeout(() => {
                if (typeof initPriceInput === 'function') initPriceInput();
            }, 100);
            break;
            
        case 'comboTicketModal':
            setTimeout(() => {
                if (typeof initComboPriceInput === 'function') initComboPriceInput();
                if (typeof carregarLotesNoModalCombo === 'function') carregarLotesNoModalCombo();
                
                // Limpar selects
                const selectTipos = document.getElementById('comboTicketTypeSelect');
                if (selectTipos) {
                    selectTipos.innerHTML = '<option value="">Selecione um lote primeiro</option>';
                }
                
                const selectLote = document.getElementById('comboTicketLote');
                if (selectLote) {
                    selectLote.value = '';
                }
            }, 100);
            break;
            
        case 'loteDataModal':
            setTimeout(() => {
                if (typeof configurarCamposLoteDataAposAbrir === 'function') {
                    configurarCamposLoteDataAposAbrir();
                }
            }, 100);
            break;
    }
    
    console.log('✅ Modal aberto:', modalId);
};

/**
 * Fecha um modal
 * Versão unificada
 */
window.AnySummit.Wizard.Modal.close = function(modalId) {
    console.log('🔒 Fechando modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Remover style inline para voltar ao CSS padrão
        modal.style.display = '';
    }
};

// =====================================================
// 5. SALVAMENTO E RECUPERAÇÃO
// =====================================================

/**
 * Funções auxiliares de cookie
 * De criaevento.js
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

/**
 * Salva todos os dados do wizard
 * Versão mais completa de criaevento.js
 */
window.AnySummit.Wizard.saveWizardData = function() {
    console.log('💾 Salvando dados do wizard...');
    
    // Coletar dados de imagens
    const logoImg = document.querySelector('#logoPreviewContainer img');
    const capaImg = document.querySelector('#capaPreviewContainer img');
    const fundoImg = document.querySelector('#fundoPreviewMain img') || 
                    document.querySelector('#fundoPreviewContainer img');
    
    // Coletar dados de lotes
    const lotesData = window.lotesData || { porData: [], porPercentual: [] };
    
    // Coletar dados de ingressos
    const ticketItems = document.querySelectorAll('.ticket-item');
    const tickets = [];
    
    ticketItems.forEach((item, index) => {
        const savedTicketData = item.ticketData || {};
        
        const ticketData = {
            id: item.dataset.ticketId || `ticket_${index}`,
            tipo: savedTicketData.type || item.dataset.ticketType || 'pago',
            titulo: savedTicketData.title || item.querySelector('.ticket-name')?.textContent?.trim() || '',
            preco: savedTicketData.price || parseFloat(item.querySelector('.ticket-buyer-price')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
            quantidade: parseInt(savedTicketData.quantity) || parseInt(item.querySelector('.ticket-detail-value')?.textContent) || 1,
            loteId: savedTicketData.loteId || item.dataset.loteId || '',
            descricao: savedTicketData.description || item.dataset.description || '',
            minQuantity: parseInt(savedTicketData.minQuantity) || parseInt(item.dataset.minQuantity) || 1,
            maxQuantity: parseInt(savedTicketData.maxQuantity) || parseInt(item.dataset.maxQuantity) || 5,
            saleStart: savedTicketData.saleStart || item.dataset.saleStart || '',
            saleEnd: savedTicketData.saleEnd || item.dataset.saleEnd || '',
            taxaServico: savedTicketData.taxaServico !== undefined ? savedTicketData.taxaServico : (item.dataset.taxaServico === '1'),
            valorReceber: savedTicketData.valorReceber || parseFloat(item.querySelector('.ticket-receive-amount')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
            taxaPlataforma: savedTicketData.taxaPlataforma || 0,
            comboData: savedTicketData.items || (item.dataset.comboData ? JSON.parse(item.dataset.comboData) : null)
        };
        tickets.push(ticketData);
    });
    
    const wizardData = {
        currentStep: window.AnySummit.Wizard.currentStep,
        
        // Step 1
        eventName: document.getElementById('eventName')?.value || '',
        logoPath: logoImg?.src || '',
        capaPath: capaImg?.src || '',
        fundoPath: fundoImg?.src || '',
        corFundo: document.getElementById('corFundo')?.value || '#000000',
        uploadedImages: window.uploadedImages || {},
        
        // Step 2
        startDateTime: document.getElementById('startDateTime')?.value || '',
        endDateTime: document.getElementById('endDateTime')?.value || '',
        classification: document.getElementById('classification')?.value || '',
        category: document.getElementById('category')?.value || '',
        
        // Step 3
        eventDescription: document.getElementById('eventDescription')?.innerHTML || '',
        
        // Step 4
        isPresential: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
        venueName: document.getElementById('venueName')?.value || '',
        eventLink: document.getElementById('eventLink')?.value || '',
        addressSearch: document.getElementById('addressSearch')?.value || '',
        street: document.getElementById('street')?.value || '',
        number: document.getElementById('number')?.value || '',
        complement: document.getElementById('complement')?.value || '',
        neighborhood: document.getElementById('neighborhood')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        cep: document.getElementById('cep')?.value || '',
        
        // Step 5
        lotesData: lotesData,
        
        // Step 6
        ingressos: tickets,
        
        // Step 7
        producer: document.getElementById('producer')?.value || 'current',
        producerName: document.getElementById('producerName')?.value || '',
        displayName: document.getElementById('displayName')?.value || '',
        producerDescription: document.getElementById('producerDescription')?.value || '',
        
        // Step 8
        termsAccepted: document.getElementById('termsCheckbox')?.classList.contains('checked') || false,
        visibility: document.querySelector('.radio.checked[data-value]')?.dataset.value || 'public',
        
        // Metadata
        timestamp: new Date().getTime()
    };
    
    // Salvar em cookie e localStorage
    setCookie('eventoWizard', JSON.stringify(wizardData), 7);
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('wizardData', JSON.stringify(wizardData));
    }
    
    // Salvar dados separados também
    if (lotesData.porData.length > 0 || lotesData.porPercentual.length > 0) {
        setCookie('lotesData', JSON.stringify(lotesData), 7);
    }
    
    if (tickets.length > 0) {
        setCookie('ingressosData', JSON.stringify(tickets), 7);
    }
    
    console.log('✅ Dados salvos:', wizardData);
};

/**
 * Limpa todos os dados do wizard
 * Versão melhorada de wizard-essential-fixes.js
 */
window.AnySummit.Wizard.clearAllWizardData = function() {
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
    if (window.lotesData) window.lotesData = { porData: [], porPercentual: [] };
    if (window.ingressos) window.ingressos = [];
    if (window.temporaryTickets) window.temporaryTickets.clear();
    if (window.comboItems) window.comboItems = [];
    
    // Limpar DOM
    const ticketList = document.getElementById('ticketList');
    if (ticketList) ticketList.innerHTML = '';
    
    const lotesList = document.querySelector('.lotes-list');
    if (lotesList) lotesList.innerHTML = '';
    
    // Voltar ao step 1
    window.AnySummit.Wizard.currentStep = 1;
    window.AnySummit.Wizard.updateStepDisplay();
    
    console.log('✅ Dados do wizard limpos com sucesso');
};

/**
 * Verifica e mostra dialog de recuperação
 * Versão melhorada de criaevento.js
 */
window.AnySummit.Wizard.checkAndShowRecoveryDialog = function() {
    console.log('🔍 Verificando dados salvos...');
    
    const savedData = getCookie('eventoWizard');
    if (!savedData) {
        console.log('Nenhum dado salvo encontrado');
        return;
    }
    
    try {
        const data = JSON.parse(savedData);
        const eventName = data.eventName || 'Evento não nomeado';
        
        // Verificar se é um nome válido
        const nomesSuspeitos = ['GUSTAVO', 'CIBIM', 'KALLAJIAN'];
        const ehNomeSuspeito = nomesSuspeitos.some(nome => 
            eventName.toUpperCase().includes(nome)
        );
        
        if (ehNomeSuspeito) {
            console.warn('Nome de evento suspeito detectado:', eventName);
            window.AnySummit.Wizard.clearAllWizardData();
            return;
        }
        
        // Mostrar dialog de recuperação
        if (window.customDialog && window.customDialog.wizardRestore) {
            window.customDialog.wizardRestore(eventName).then(action => {
                if (action === 'continue') {
                    restoreWizardData(data);
                } else {
                    window.AnySummit.Wizard.clearAllWizardData();
                }
            });
        } else {
            // Fallback para confirm nativo
            const shouldRestore = confirm(`Você deseja continuar a configuração do evento "${eventName}" do ponto onde parou?`);
            
            if (shouldRestore) {
                restoreWizardData(data);
            } else {
                window.AnySummit.Wizard.clearAllWizardData();
            }
        }
    } catch (error) {
        console.error('Erro ao recuperar dados salvos:', error);
        window.AnySummit.Wizard.clearAllWizardData();
    }
};

/**
 * Restaura dados salvos do wizard
 * Função interna, não exposta no namespace público
 */
function restoreWizardData(data) {
    console.log('♻️ Restaurando dados do wizard...');
    
    // Restaurar step atual
    if (data.currentStep) {
        window.AnySummit.Wizard.currentStep = data.currentStep;
    }
    
    // Restaurar campos básicos
    const fields = [
        'eventName', 'startDateTime', 'endDateTime', 'classification', 
        'category', 'venueName', 'eventLink', 'addressSearch', 'street', 
        'number', 'complement', 'neighborhood', 'city', 'state', 'cep',
        'producer', 'producerName', 'displayName', 'producerDescription',
        'corFundo'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && data[fieldId]) {
            field.value = data[fieldId];
        }
    });
    
    // Restaurar descrição (pode ser innerHTML)
    const eventDescription = document.getElementById('eventDescription');
    if (eventDescription && data.eventDescription) {
        if (eventDescription.tagName === 'TEXTAREA') {
            eventDescription.value = data.eventDescription;
        } else {
            eventDescription.innerHTML = data.eventDescription;
        }
    }
    
    // Restaurar imagens
    if (data.uploadedImages) {
        window.uploadedImages = data.uploadedImages;
    }
    
    // Restaurar preview de imagens
    const imageRestores = [
        { path: data.logoPath, containerId: 'logoPreviewContainer', type: 'logo' },
        { path: data.capaPath, containerId: 'capaPreviewContainer', type: 'capa' },
        { path: data.fundoPath, containerId: 'fundoPreviewContainer', type: 'fundo' }
    ];
    
    imageRestores.forEach(({ path, containerId, type }) => {
        if (path) {
            const container = document.getElementById(containerId);
            if (container) {
                let dimensions = '';
                switch(type) {
                    case 'logo': dimensions = '800x200px'; break;
                    case 'capa': dimensions = '450x450px'; break;
                    case 'fundo': dimensions = '1920x640px'; break;
                }
                
                container.innerHTML = `
                    <img src="${path}" alt="${type}">
                    <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    <div class="upload-hint">${dimensions}</div>
                `;
                
                // Mostrar botão de limpar
                const clearButton = document.getElementById('clear' + type.charAt(0).toUpperCase() + type.slice(1));
                if (clearButton) clearButton.style.display = 'flex';
            }
        }
    });
    
    // Restaurar tipo de evento (presencial/online)
    if (data.isPresential !== undefined) {
        const locationSwitch = document.getElementById('locationTypeSwitch');
        if (locationSwitch) {
            if (data.isPresential) {
                locationSwitch.classList.add('active');
            } else {
                locationSwitch.classList.remove('active');
            }
        }
    }
    
    // Restaurar lotes
    if (data.lotesData) {
        window.lotesData = data.lotesData;
        
        // Renderizar lotes se houver função disponível
        if (typeof renderizarLotesPorData === 'function' && data.lotesData.porData?.length > 0) {
            setTimeout(() => renderizarLotesPorData(), 100);
        }
        if (typeof renderizarLotesPorPercentual === 'function' && data.lotesData.porPercentual?.length > 0) {
            setTimeout(() => renderizarLotesPorPercentual(), 100);
        }
    }
    
    // Restaurar ingressos
    if (data.ingressos && data.ingressos.length > 0) {
        console.log('Restaurando ingressos:', data.ingressos);
        // Implementação da restauração de ingressos será na parte 2
    }
    
    // Restaurar checkboxes/radios
    if (data.termsAccepted) {
        const termsCheckbox = document.getElementById('termsCheckbox');
        if (termsCheckbox) termsCheckbox.classList.add('checked');
    }
    
    if (data.visibility) {
        const visibilityRadio = document.querySelector(`.radio[data-value="${data.visibility}"]`);
        if (visibilityRadio) {
            document.querySelectorAll('.radio').forEach(r => r.classList.remove('checked'));
            visibilityRadio.classList.add('checked');
        }
    }
    
    // Navegar para o step salvo
    setTimeout(() => {
        window.AnySummit.Wizard.goToStep(data.currentStep || 1);
        
        // Atualizar preview se houver função
        if (typeof updatePreview === 'function') updatePreview();
    }, 200);
    
    console.log('✅ Dados restaurados com sucesso');
}

// =====================================================
// 6. COMPATIBILIDADE COM CÓDIGO LEGADO
// =====================================================

// Expor funções principais no window para compatibilidade
window.nextStep = window.AnySummit.Wizard.nextStep;
window.prevStep = window.AnySummit.Wizard.prevStep;
window.goToStep = window.AnySummit.Wizard.goToStep;
window.validateStep = window.AnySummit.Wizard.validateStep;
window.updateStepDisplay = window.AnySummit.Wizard.updateStepDisplay;
window.saveWizardData = window.AnySummit.Wizard.saveWizardData;
window.clearAllWizardData = window.AnySummit.Wizard.clearAllWizardData;
window.openModal = window.AnySummit.Wizard.Modal.open;
window.closeModal = window.AnySummit.Wizard.Modal.close;

// Sincronizar currentStep legado
Object.defineProperty(window, 'currentStep', {
    get: function() { return window.AnySummit.Wizard.currentStep; },
    set: function(value) { window.AnySummit.Wizard.currentStep = value; }
});

// =====================================================
// 7. INICIALIZAÇÃO
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Wizard Core Consolidado - Parte 1 iniciado');
    
    // Verificar e restaurar dados salvos após 100ms
    setTimeout(() => {
        window.AnySummit.Wizard.checkAndShowRecoveryDialog();
    }, 100);
    
    // Atualizar display inicial
    window.AnySummit.Wizard.updateStepDisplay();
});

console.log('✅ wizard-final-parte1.js carregado com sucesso');
