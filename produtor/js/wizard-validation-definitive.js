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
    window.validateStep = async function(stepNumber) {
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
                // Validação aprimorada de lotes com regras específicas
                const lotesValidos = await validarLotesComRegrasEspecificas(camposInvalidos);
                if (!lotesValidos) {
                    isValid = false;
                }
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
                // Organizador (Contratante) - verificar se um foi selecionado
                const contratanteSelect = document.getElementById('contratante');
                if (!contratanteSelect || contratanteSelect.value === '') {
                    if (contratanteSelect) contratanteSelect.classList.add('error-field');
                    camposInvalidos.push('Organizador');
                    isValid = false;
                }
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
    window.nextStep = async function() {
        console.log('🚀 [DEFINITIVO] nextStep - step atual:', window.wizardState.currentStep);
        
        const currentStep = window.wizardState.currentStep;
        const isValid = await window.validateStep(currentStep);
        
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
        
        // CORREÇÃO PROBLEMA 2: Atualizar DOM quando entrar na etapa 5
        if (currentStep === 5) {
            console.log('🎨 Entrando na etapa 5 - atualizando DOM dos lotes...');
            setTimeout(async () => {
                if (typeof window.renderizarLotesUnificado === 'function') {
                    console.log('🔄 Forçando atualização dos lotes na etapa 5...');
                    await window.renderizarLotesUnificado();
                    console.log('✅ DOM dos lotes atualizado na etapa 5');
                } else {
                    console.warn('⚠️ Função renderizarLotesUnificado não disponível');
                }
            }, 200);
        }
        
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
    
    /**
     * Validação específica de lotes com regras de negócio
     */
    async function validarLotesComRegrasEspecificas(camposInvalidos) {
        console.log('🔍 [VALIDAÇÃO] Verificando lotes com regras específicas...');
        
        try {
            // CORREÇÃO PROBLEMA 3: Carregar lotes diretamente do banco via API
            let lotes = [];
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (eventoId && typeof window.fazerRequisicaoAPI === 'function') {
                console.log('📡 Carregando lotes via API para validação...');
                try {
                    const resultado = await window.fazerRequisicaoAPI('recuperar_evento_simples');
                    lotes = resultado.evento?.lotes || [];
                    console.log('📦 Lotes carregados via API:', lotes);
                } catch (apiError) {
                    console.warn('⚠️ Erro na API, tentando função global:', apiError);
                    // Fallback para função global
                    if (typeof window.carregarLotesDoBanco === 'function') {
                        lotes = await window.carregarLotesDoBanco();
                    }
                }
            } else if (typeof window.carregarLotesDoBanco === 'function') {
                console.log('📦 Carregando lotes via função global...');
                lotes = await window.carregarLotesDoBanco();
            } else {
                console.warn('⚠️ Nenhuma função de carregamento disponível');
                lotes = [];
            }
            
            console.log('📦 Lotes finais para validação:', lotes);
            console.log('📊 Quantidade total de lotes:', lotes.length);
            
            // REGRA 1: Verificar se há pelo menos 1 lote
            if (lotes.length === 0) {
                console.log('❌ Nenhum lote encontrado');
                camposInvalidos.push('É necessário criar pelo menos 1 lote para prosseguir');
                return false;
            }
            
            console.log('✅ Pelo menos 1 lote encontrado');
            
            // REGRA 2: Se há lotes por quantidade, um deles deve ter 100%
            const lotesPorQuantidade = lotes.filter(l => {
                const tipo = l.tipo;
                return tipo === 'quantidade' || tipo === 'percentual';
            });
            
            console.log(`📊 Lotes por quantidade encontrados: ${lotesPorQuantidade.length}`);
            lotesPorQuantidade.forEach(l => {
                console.log(`  - ${l.nome}: ${l.percentual_venda || l.percentual}% (tipo: ${l.tipo})`);
            });
            
            if (lotesPorQuantidade.length > 0) {
                console.log(`📊 Verificando se algum lote tem 100%...`);
                
                const temLote100 = lotesPorQuantidade.some(l => {
                    const percentual = l.percentual_venda || l.percentual;
                    console.log(`  - Verificando ${l.nome}: ${percentual}%`);
                    return parseInt(percentual) === 100;
                });
                
                if (!temLote100) {
                    console.log('❌ Nenhum lote por quantidade tem 100%');
                    const nomesLotes = lotesPorQuantidade.map(l => `${l.nome} (${l.percentual_venda || l.percentual}%)`).join(', ');
                    camposInvalidos.push(`Se existir lote por quantidade, um deles deve ter 100%. Lotes atuais: ${nomesLotes}`);
                    return false;
                }
                
                console.log('✅ Existe pelo menos um lote com 100% de quantidade');
            }
            
            console.log('✅ Todas as regras de validação de lotes foram atendidas');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na validação de lotes:', error);
            camposInvalidos.push('Erro ao validar lotes - tente novamente');
            return false;
        }
    }
    
    // Exportar função para uso global
    window.validarLotesComRegrasEspecificas = validarLotesComRegrasEspecificas;
    
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