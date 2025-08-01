// SOLUÇÃO DEFINITIVA - VALIDAÇÃO DO WIZARD
console.log('🎯 Iniciando solução definitiva de validação...');

// Aguardar o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - configurando validação...');
    
    // Inicializar funcionalidades do criaevento.js se existirem
    if (typeof initImageUpload === 'function') {
        console.log('🖼️ Inicializando upload de imagens...');
        initImageUpload();
    }
    
    if (typeof initAdditionalUploads === 'function') {
        console.log('🖼️ Inicializando uploads adicionais...');
        initAdditionalUploads();
    }
    
    // Inicializar outras funcionalidades necessárias
    const functionsToInit = [
        'initSwitches',
        'initProducerSelection',
        'initRichEditor',
        'initCheckboxes',
        'initRadioButtons',
        'initTicketManagement',
        'initAddressSearch',
        'initPreviewListeners',
        'initFormSubmission',
        'initPriceInput',
        'initMiniSwitches',
        'initCodeTicketButton'
    ];
    
    functionsToInit.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ Inicializando ${funcName}...`);
            window[funcName]();
        }
    });
    
    // Verificar funções críticas
    console.log('🔍 Verificando funções disponíveis:');
    console.log('- handleImageUpload:', typeof window.handleImageUpload);
    console.log('- updatePreview:', typeof window.updatePreview);
    console.log('- saveWizardData:', typeof window.saveWizardData);
    
    // Se handleImageUpload não existir, verificar em 1 segundo
    if (typeof window.handleImageUpload !== 'function') {
        console.warn('⚠️ handleImageUpload não encontrada, tentando novamente em 1s...');
        setTimeout(() => {
            if (typeof window.handleImageUpload === 'function') {
                console.log('✅ handleImageUpload encontrada após delay');
                // Re-inicializar uploads
                if (typeof initAdditionalUploads === 'function') {
                    initAdditionalUploads();
                }
            }
        }, 1000);
    }
    
    // Criar wizardState se não existir
    if (!window.wizardState) {
        window.wizardState = {
            currentStep: 1,
            totalSteps: 8
        };
    }
    
    // Função de validação completa
    window.validateStep = function(stepNumber) {
        console.log('🔍 Validando step:', stepNumber);
        const validationMessage = document.getElementById(`validation-step-${stepNumber}`);
        let isValid = true;
        let camposInvalidos = [];

        // Remover classes de erro anteriores
        document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));

        switch(stepNumber) {
            case 1:
                // Nome do evento
                const eventName = document.getElementById('eventName');
                if (!eventName || eventName.value.trim() === '') {
                    if (eventName) eventName.classList.add('error-field');
                    camposInvalidos.push('Nome do evento');
                    isValid = false;
                }
                
                // Logo
                const hasLogo = document.querySelector('#logoPreviewContainer img') !== null;
                if (!hasLogo) {
                    const logoArea = document.querySelector('#logoUpload')?.closest('.upload-area');
                    if (logoArea) logoArea.classList.add('error-field');
                    camposInvalidos.push('Logo do evento');
                    isValid = false;
                }
                
                // Capa
                const hasCapa = document.querySelector('#capaPreviewContainer img') !== null;
                if (!hasCapa) {
                    const capaArea = document.querySelector('#capaUpload')?.closest('.upload-area');
                    if (capaArea) capaArea.classList.add('error-field');
                    camposInvalidos.push('Imagem de capa');
                    isValid = false;
                }
                break;
                
            case 2:
                // Data início
                const startDateTime = document.getElementById('startDateTime');
                if (!startDateTime || startDateTime.value === '') {
                    if (startDateTime) startDateTime.classList.add('error-field');
                    camposInvalidos.push('Data e hora de início');
                    isValid = false;
                }
                
                // Classificação
                const classification = document.getElementById('classification');
                if (!classification || classification.value === '') {
                    if (classification) classification.classList.add('error-field');
                    camposInvalidos.push('Classificação');
                    isValid = false;
                }
                
                // Categoria
                const category = document.getElementById('category');
                if (!category || category.value === '') {
                    if (category) category.classList.add('error-field');
                    camposInvalidos.push('Categoria');
                    isValid = false;
                }
                break;
                
            case 3:
                // Descrição do evento
                const eventDescription = document.getElementById('eventDescription');
                const descriptionText = eventDescription ? 
                    (eventDescription.innerText || eventDescription.textContent || '').trim() : '';
                
                if (descriptionText === '' || descriptionText === 'Digite a descrição do seu evento aqui...') {
                    if (eventDescription) eventDescription.classList.add('error-field');
                    camposInvalidos.push('Descrição do evento');
                    isValid = false;
                }
                break;
                
            case 4:
                // Verificar se é presencial ou online
                const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
                
                if (isPresential) {
                    // Validar endereço para evento presencial
                    const addressSearch = document.getElementById('addressSearch');
                    const venueName = document.getElementById('venueName');
                    
                    if (!addressSearch || addressSearch.value.trim() === '') {
                        if (addressSearch) addressSearch.classList.add('error-field');
                        camposInvalidos.push('Endereço do evento');
                        isValid = false;
                    }
                    
                    if (!venueName || venueName.value.trim() === '') {
                        if (venueName) venueName.classList.add('error-field');
                        camposInvalidos.push('Nome do local');
                        isValid = false;
                    }
                } else {
                    // Validar link para evento online
                    const eventLink = document.getElementById('eventLink');
                    if (!eventLink || eventLink.value.trim() === '') {
                        if (eventLink) eventLink.classList.add('error-field');
                        camposInvalidos.push('Link do evento online');
                        isValid = false;
                    }
                }
                break;
                
            case 5:
                // Validar se há pelo menos um lote cadastrado (por data OU por quantidade)
                const lotesPorData = document.getElementById('lotesPorDataList');
                const lotesPorQuantidade = document.getElementById('lotesPorQuantidadeList');
                
                console.log('🔍 Debug Lotes:', {
                    lotesPorData: !!lotesPorData,
                    lotesPorQuantidade: !!lotesPorQuantidade
                });
                
                let temLotes = false;
                let lotesDataCount = 0;
                let lotesQtdCount = 0;
                
                // Verificar lotes por data - procurar por qualquer elemento que indique lote
                if (lotesPorData) {
                    // Tentar várias classes possíveis
                    const lotesData = lotesPorData.querySelectorAll('.lote-card, .lote-item, [class*="lote"]:not(.lote-empty-state)');
                    lotesDataCount = lotesData.length;
                    
                    // Verificar se não está mostrando o estado vazio
                    const emptyState = lotesPorData.querySelector('.lote-empty-state');
                    const hasEmptyState = emptyState && emptyState.style.display !== 'none';
                    
                    if (lotesDataCount > 0 && !hasEmptyState) {
                        temLotes = true;
                    }
                    
                    console.log('📅 Lotes por Data:', {
                        elementos: lotesDataCount,
                        emptyState: hasEmptyState,
                        innerHTML: lotesPorData.innerHTML.substring(0, 200)
                    });
                }
                
                // Verificar lotes por quantidade
                if (!temLotes && lotesPorQuantidade) {
                    const lotesQtd = lotesPorQuantidade.querySelectorAll('.lote-card, .lote-item, [class*="lote"]:not(.lote-empty-state)');
                    lotesQtdCount = lotesQtd.length;
                    
                    const emptyState = lotesPorQuantidade.querySelector('.lote-empty-state');
                    const hasEmptyState = emptyState && emptyState.style.display !== 'none';
                    
                    if (lotesQtdCount > 0 && !hasEmptyState) {
                        temLotes = true;
                    }
                    
                    console.log('📊 Lotes por Quantidade:', {
                        elementos: lotesQtdCount,
                        emptyState: hasEmptyState,
                        innerHTML: lotesPorQuantidade.innerHTML.substring(0, 200)
                    });
                }
                
                // Verificar também se há dados nos arrays globais
                if (!temLotes && window.lotesPorData && window.lotesPorData.length > 0) {
                    temLotes = true;
                    console.log('✅ Lotes encontrados no array global lotesPorData:', window.lotesPorData.length);
                }
                
                if (!temLotes && window.lotesPorQuantidade && window.lotesPorQuantidade.length > 0) {
                    temLotes = true;
                    console.log('✅ Lotes encontrados no array global lotesPorQuantidade:', window.lotesPorQuantidade.length);
                }
                
                if (!temLotes) {
                    camposInvalidos.push('Pelo menos 1 lote (por data ou quantidade)');
                    isValid = false;
                }
                
                console.log('✅ Resultado validação lotes:', {
                    temLotes: temLotes,
                    lotesDataCount: lotesDataCount,
                    lotesQtdCount: lotesQtdCount,
                    isValid: isValid
                });
                break;
                
            case 6:
                // Verificar se há pelo menos um ingresso cadastrado
                const ticketList = document.getElementById('ticketList');
                const hasTickets = ticketList && ticketList.children.length > 0;
                
                if (!hasTickets) {
                    camposInvalidos.push('Pelo menos 1 tipo de ingresso');
                    isValid = false;
                }
                break;
                
            case 7:
                // Produtor - geralmente sempre válido pois usa o produtor atual por padrão
                isValid = true;
                break;
                
            case 8:
                // Termos de uso
                const termsCheckbox = document.getElementById('termsCheckbox');
                const termsAccepted = termsCheckbox && termsCheckbox.classList.contains('checked');
                
                if (!termsAccepted) {
                    camposInvalidos.push('Aceitar os termos de uso');
                    isValid = false;
                }
                break;
                
            default:
                // Se o step não está definido, permite passar (temporário)
                console.warn('⚠️ Validação não definida para step:', stepNumber);
                isValid = true;
        }

        // Mostrar mensagem de erro
        if (!isValid && validationMessage) {
            validationMessage.textContent = 'Preencha todos os campos obrigatórios: ' + camposInvalidos.join(', ');
            validationMessage.style.display = 'block';
            validationMessage.classList.add('show');
            
            setTimeout(() => {
                validationMessage.classList.remove('show');
            }, 5000);
        } else if (validationMessage) {
            validationMessage.style.display = 'none';
            validationMessage.classList.remove('show');
        }

        console.log('✅ Resultado da validação:', isValid, camposInvalidos);
        return isValid;
    };
    
    // Função nextStep definitiva
    window.nextStep = function() {
        console.log('🚀 [DEFINITIVO] nextStep - step atual:', window.wizardState.currentStep);
        
        const currentStep = window.wizardState.currentStep;
        const isValid = window.validateStep(currentStep);
        
        if (isValid) {
            if (currentStep < window.wizardState.totalSteps) {
                window.wizardState.currentStep++;
                updateDisplay();
                
                // Salvar dados se função existir
                if (typeof window.saveWizardData === 'function') {
                    window.saveWizardData();
                }
                
                console.log('✅ Avançou para step:', window.wizardState.currentStep);
            }
        } else {
            console.log('❌ Validação falhou - permanece no step:', currentStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    // Função prevStep (botão voltar)
    window.prevStep = function() {
        console.log('⬅️ [DEFINITIVO] prevStep - step atual:', window.wizardState.currentStep);
        
        if (window.wizardState.currentStep > 1) {
            window.wizardState.currentStep--;
            updateDisplay();
            
            // Salvar dados se função existir
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
            
            console.log('✅ Voltou para step:', window.wizardState.currentStep);
        } else {
            console.log('⚠️ Já está no primeiro step');
        }
    };
    
    // Função para atualizar display
    function updateDisplay() {
        const currentStep = window.wizardState.currentStep;
        
        // Atualizar cards
        document.querySelectorAll('.section-card').forEach(card => {
            const step = parseInt(card.dataset.stepContent);
            card.classList.toggle('active', step === currentStep);
            card.classList.toggle('prev', step < currentStep);
        });
        
        // Atualizar steps
        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });
        
        // Atualizar barra de progresso
        const progressLine = document.getElementById('progressLine');
        if (progressLine) {
            const progress = ((currentStep - 1) / 7) * 100;
            progressLine.style.width = progress + '%';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Garantir que updateStepDisplay existe
    if (!window.updateStepDisplay) {
        window.updateStepDisplay = updateDisplay;
    }
    
    console.log('✅ Validação definitiva configurada com sucesso!');
    console.log('📊 Estado:', {
        validateStep: typeof window.validateStep,
        nextStep: typeof window.nextStep,
        wizardState: window.wizardState
    });
    
    // Verificar dados salvos para restauração
    setTimeout(() => {
        if (typeof window.checkAndRestoreWizardData === 'function') {
            console.log('🔍 Verificando dados salvos do wizard...');
            window.checkAndRestoreWizardData();
        } else {
            console.log('⚠️ checkAndRestoreWizardData não encontrada');
        }
    }, 500);
});