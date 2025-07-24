    // Variáveis globais
// Escopo global para funçÃµes
(function() {
    'use strict';
    
    let currentStep = 1;
        const totalSteps = 8;
        let map;
        let geocoder;
        let marker;
        let autocompleteService;
        let placesService;
        let ticketCount = 1;
        let ticketCodes = {};

        // Função auxiliar para retornar o SVG do ícone de lixeira
        function getTrashIcon() {
            return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>`;
        }

        // Função para navegar entre steps
        function updateStepDisplay() {
            // Atualizar cards de conteúdo
            document.querySelectorAll('.section-card').forEach(card => {
                const stepNumber = parseInt(card.dataset.stepContent);
                if (stepNumber === currentStep) {
                    card.classList.add('active');
                    card.classList.remove('prev');
                } else if (stepNumber < currentStep) {
                    card.classList.add('prev');
                    card.classList.remove('active');
                } else {
                    card.classList.remove('active', 'prev');
                }
            });

            // Atualizar progress bar
            document.querySelectorAll('.step').forEach(step => {
                const stepNumber = parseInt(step.dataset.step);
                if (stepNumber === currentStep) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else if (stepNumber < currentStep) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });

            // Atualizar linha de progresso
            const progressLine = document.getElementById('progressLine');
            const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
            progressLine.style.width = progressPercentage + '%';

            // Scroll para o topo ao mudar de step
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function validateStep(stepNumber) {
            console.log('🔍 ValidateStep chamado para step:', stepNumber);
            const validationMessage = document.getElementById(`validation-step-${stepNumber}`);
            let isValid = true;

            switch(stepNumber) {
                case 1:
                    const eventName = document.getElementById('eventName').value;
                    const logoContainer = document.getElementById('logoPreviewContainer');
                    const capaContainer = document.getElementById('capaPreviewContainer');
                    
                    console.log('📋 Validando Step 1:', {
                        eventName: eventName,
                        logoContainer: !!logoContainer,
                        capaContainer: !!capaContainer
                    });
                    
                    // Verificar se tem imagem no logo
                    const hasLogo = logoContainer && logoContainer.querySelector('img') !== null;
                    // Verificar se tem imagem na capa
                    const hasCapa = capaContainer && capaContainer.querySelector('img') !== null;
                    
                    console.log('🖼️ Status das imagens:', {
                        hasLogo: hasLogo,
                        hasCapa: hasCapa
                    });
                    
                    // Remover classes de erro anteriores
                    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
                    
                    // Validar nome do evento
                    if (eventName.trim() === '') {
                        document.getElementById('eventName').classList.add('error-field');
                        isValid = false;
                    }
                    
                    // Validar logo
                    if (!hasLogo) {
                        const logoArea = document.querySelector('#logoUpload').closest('.upload-area');
                        if (logoArea) logoArea.classList.add('error-field');
                        isValid = false;
                    }
                    
                    // Validar capa
                    if (!hasCapa) {
                        const capaArea = document.querySelector('#capaUpload').closest('.upload-area');
                        if (capaArea) capaArea.classList.add('error-field');
                        isValid = false;
                    }
                    
                    break;
                case 2:
                    const startDateTime = document.getElementById('startDateTime').value;
                    const classificationnew = document.getElementById('classification').value;
					const categorynew = document.getElementById('category').value;
                    
                    // Remover classes de erro anteriores
                    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
                    
                    // Validar campos
                    if (startDateTime === '') {
                        document.getElementById('startDateTime').classList.add('error-field');
                        isValid = false;
                    }
                    if (classificationnew === '') {
                        document.getElementById('classification').classList.add('error-field');
                        isValid = false;
                    }
                    if (categorynew === '') {
                        document.getElementById('category').classList.add('error-field');
                        isValid = false;
                    }
                    
                    isValid = startDateTime !== '' && classificationnew !== '' && categorynew !== '';
                    break;
                case 4:
                    // Simplificado - sempre válido por enquanto
                    isValid = true;
                    break;
                case 5:
                    // Validar se há pelo menos um lote cadastrado
                    const loteCards = document.querySelectorAll('.lote-card');
                    const hasLotes = loteCards && loteCards.length > 0;
                    
                    if (!hasLotes) {
                        if (window.customDialog && window.customDialog.warning) {
                            window.customDialog.warning(
                                'Atenção',
                                'Você precisa cadastrar pelo menos 1 lote para prosseguir.'
                            );
                        } else {
                            alert('Você precisa cadastrar pelo menos 1 lote para prosseguir.');
                        }
                        
                        // Mostrar mensagem de validação
                        const validationMsg = document.querySelector('[data-step-content="5"] .validation-message');
                        if (validationMsg) {
                            validationMsg.textContent = 'Você precisa cadastrar pelo menos 1 lote para prosseguir.';
                            validationMsg.style.display = 'block';
                        }
                        
                        isValid = false;
                    } else {
                        // Validar lotes (função definida em lotes.js)
                        if (typeof validarLotes === 'function') {
                            isValid = validarLotes();
                        } else {
                            isValid = true; // Fallback se função não existir
                        }
                    }
                    break;
                case 6:
                    // Verificar se há pelo menos um ingresso cadastrado
                    const ticketList = document.getElementById('ticketList');
                    const hasTickets = ticketList && ticketList.children.length > 0;
                    
                    if (!hasTickets) {
                        if (window.customDialog && window.customDialog.warning) {
                            window.customDialog.warning(
                                'Atenção',
                                'Você precisa cadastrar pelo menos 1 Tipo de Ingresso para prosseguir.'
                            );
                        } else {
                            alert('Você precisa cadastrar pelo menos 1 Tipo de Ingresso para prosseguir.');
                        }
                        
                        // Mostrar mensagem de validação também
                        const validationMsg = document.querySelector('[data-step-content="6"] .validation-message');
                        if (validationMsg) {
                            validationMsg.textContent = 'Você precisa cadastrar pelo menos 1 Tipo de Ingresso para prosseguir.';
                            validationMsg.style.display = 'block';
                        }
                    }
                    
                    isValid = hasTickets;
                    break;
                case 8:
                    const termsAccepted = document.getElementById('termsCheckbox').classList.contains('checked');
                    isValid = termsAccepted;
                    break;
            }

            if (!isValid && validationMessage) {
                validationMessage.classList.add('show');
                setTimeout(() => {
                    validationMessage.classList.remove('show');
                }, 3000);
            }

            console.log('✅ Resultado da validação do step', stepNumber, ':', isValid);
            return isValid;
        }

        // Funções antigas comentadas - agora definidas diretamente no window
        /*
        function nextStep() {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    updateStepDisplay();
                }
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                updateStepDisplay();
            }
        }
        
        function goToStep(step) {
            if (step >= 1 && step <= totalSteps) {
                currentStep = step;
                updateStepDisplay();
            }
        }
        */

        async function publishEvent() {
            if (validateStep(currentStep)) {
                const publishBtn = document.querySelector('.btn-publish');
                publishBtn.textContent = 'Publicando evento...';
                publishBtn.disabled = true;
                
                // Chamar a função de envio para API
                const sucesso = await enviarEventoParaAPI();
                
                if (!sucesso) {
                    publishBtn.textContent = 'âœ“ Publicar evento';
                    publishBtn.disabled = false;
                }
            }
        }
        
        // Expor função publishEvent globalmente
        window.publishEvent = publishEvent;

        // Modal functionality
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
                if (modalId === 'paidTicketModal') {
                    setTimeout(() => {
                        initPriceInput();
                    }, 100);
                } else if (modalId === 'comboTicketModal') {
                    setTimeout(() => {
                        initComboPriceInput();
                        carregarLotesNoModalCombo();
                        // Limpar o select de tipos de ingresso ao abrir o modal
                        const selectTipos = document.getElementById('comboTicketTypeSelect');
                        if (selectTipos) {
                            selectTipos.innerHTML = '<option value="">Selecione um lote primeiro</option>';
                        }
                        // Garantir que o select de lote esteja resetado
                        const selectLote = document.getElementById('comboTicketLote');
                        if (selectLote) {
                            selectLote.value = '';
                        }
                    }, 100);
                }
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        }

        // Inicialização do Google Maps
        function initMap() {
            console.log('ðŸ—ºï¸ Inicializando Google Maps...');
            
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.log('âŒ Elemento do mapa não encontrado');
                return;
            }

            try {
                // Criar mapa com estilo dark
                map = new google.maps.Map(mapElement, {
                    center: { lat: -23.550520, lng: -46.633308 },
                    zoom: 13,
                    styles: [
                        {
                            "elementType": "geometry",
                            "stylers": [{"color": "#1a1a2e"}]
                        },
                        {
                            "elementType": "labels.text.stroke",
                            "stylers": [{"color": "#16213e"}]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{"color": "#725eff"}]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [{"color": "#00c2ff"}]
                        }
                    ]
                });

                geocoder = new google.maps.Geocoder();
                autocompleteService = new google.maps.places.AutocompleteService();
                placesService = new google.maps.places.PlacesService(map);

                console.log('âœ… Google Maps inicializado com sucesso');
                mapElement.innerHTML = '<div class="map-loading">Mapa carregado - Pesquise um endereço acima</div>';
                
            } catch (error) {
                console.error('âŒ Erro ao inicializar Google Maps:', error);
                mapElement.innerHTML = '<div class="map-loading">Erro ao carregar o mapa</div>';
            }
        }

        // Todas as outras funçÃµes do arquivo original...
        // [Incluir todas as funçÃµes JavaScript do arquivo original aqui]

        // Inicialização quando DOM estiver pronto
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Inicializando Anysummit...');
            
            try {
                initImageUpload();
                initAdditionalUploads();
                initSwitches();
                initProducerSelection();
                initRichEditor();
                initCheckboxes();
                initRadioButtons();
                initTicketManagement();
                initAddressSearch();
                initPreviewListeners();
                initFormSubmission();
                initPriceInput();
                initMiniSwitches();
                initCodeTicketButton();
                updatePreview();
                updateStepDisplay();
                
                console.log('✅ Anysummit inicializado com sucesso');
                
                // Verificar dados salvos APÓS tudo estar carregado
                setTimeout(() => {
                    checkAndRestoreWizardData();
                }, 100);
                
                // Debug para combo
                const comboBtn = document.getElementById('addComboTicket');
                console.log('ðŸ” Botão combo encontrado:', comboBtn);
                if (comboBtn) {
                    console.log('âœ… Event listener adicionado ao botão combo');
                } else {
                    console.error('âŒ Botão combo NÃƒO encontrado!');
                }
                
            } catch (error) {
                console.error('âŒ Erro na inicialização:', error);
            }
        });

        // [Incluir todas as demais funçÃµes JavaScript do arquivo original aqui]
        // Copie todas as funçÃµes do arquivo original, incluindo:
        // - initAddressSearch()
        // - searchAddresses()
        // - selectAddress()
        // - updatePreview()
        // - initImageUpload()
        // - initSwitches()
        // - createPaidTicket()
        // - createFreeTicket()
        // - createCodeTicket()
        // - FunçÃµes da API
        // etc...

        // Função initImageUpload - DESATIVADA (substituída por fundoUpload)
        function initImageUpload() {
            // Mantida por compatibilidade mas não faz nada
            return;
        }

        // Inicializar uploads adicionais
        function initAdditionalUploads() {
            // Logo do evento
            const logoUpload = document.getElementById('logoUpload');
            if (logoUpload) {
                logoUpload.addEventListener('change', function() {
                    handleImageUpload(this, 'logoPreviewContainer', 'logo');
                });
            }

            // Capa quadrada
            const capaUpload = document.getElementById('capaUpload');
            if (capaUpload) {
                capaUpload.addEventListener('change', function() {
                    handleImageUpload(this, 'capaPreviewContainer', 'capa');
                });
            }

            // Imagem de fundo
            const fundoUpload = document.getElementById('fundoUpload');
            if (fundoUpload) {
                fundoUpload.addEventListener('change', function() {
                    // Verificar se é o preview principal ou o container pequeno
                    const mainPreview = document.getElementById('fundoPreviewMain');
                    if (mainPreview) {
                        handleMainImageUpload(this, 'fundoPreviewMain', 'fundo');
                    } else {
                        handleImageUpload(this, 'fundoPreviewContainer', 'fundo');
                    }
                });
            }

            // Cor de fundo
            const corFundo = document.getElementById('corFundo');
            const corFundoHex = document.getElementById('corFundoHex');
            const colorPreview = document.getElementById('colorPreview');
            
            if (corFundo && corFundoHex && colorPreview) {
                // Inicializar cor
                colorPreview.style.backgroundColor = corFundo.value;
                
                // Sincronizar color picker com input text e preview
                corFundo.addEventListener('change', function() {
                    corFundoHex.value = this.value;
                    colorPreview.style.backgroundColor = this.value;
                    saveWizardData();
                    updatePreview();
                });

                corFundoHex.addEventListener('input', function() {
                    if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                        corFundo.value = this.value;
                        colorPreview.style.backgroundColor = this.value;
                        saveWizardData();
                        updatePreview();
                    }
                });
                
                // Click no preview abre o color picker
                colorPreview.addEventListener('click', function() {
                    corFundo.click();
                });
            }
        }

        // Função para processar upload de imagens adicionais
        async function handleImageUpload(input, containerId, type) {
            const file = input.files[0];
            if (!file) return;

            // Validar tipo
            if (!file.type.match('image.*')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                return;
            }

            // Mostrar preview local primeiro
            const reader = new FileReader();
            reader.onload = function(e) {
                const container = document.getElementById(containerId);
                if (container) {
                    let dimensions = '';
                    switch(type) {
                        case 'logo':
                            dimensions = '800x200px';
                            break;
                        case 'capa':
                            dimensions = '450x450px';
                            break;
                        case 'fundo':
                            dimensions = '1920x640px';
                            break;
                    }

                    container.innerHTML = `
                        <img src="${e.target.result}" alt="${type}">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">${dimensions}</div>
                    `;

                    // Mostrar botão de limpar
                    const clearButton = document.getElementById('clear' + type.charAt(0).toUpperCase() + type.slice(1));
                    if (clearButton) {
                        clearButton.style.display = 'flex';
                    }
                }
            };
            reader.readAsDataURL(file);

            // Fazer upload real para o servidor
            const formData = new FormData();
            formData.append('imagem', file);
            formData.append('tipo', type);

            try {
                const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Salvar caminho da imagem
                        if (!window.uploadedImages) {
                            window.uploadedImages = {};
                        }
                        window.uploadedImages[type] = data.image_url;
                        console.log(`✅ ${type} enviado:`, data.image_url);
                        
                        // Salvar no wizard
                        saveWizardData();
                        updatePreview();
                    } else {
                        console.error('Erro no upload:', data.message);
                    }
                } else {
                    console.error('Erro na resposta:', response.status);
                }
            } catch (error) {
                console.error('Erro ao fazer upload:', error);
            }
        }

        // Função para processar upload da imagem principal de fundo
        async function handleMainImageUpload(input, containerId, type) {
            const file = input.files[0];
            if (!file) return;

            // Validar tipo
            if (!file.type.match('image.*')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                return;
            }

            // Mostrar preview local primeiro
            const reader = new FileReader();
            reader.onload = function(e) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <img src="${e.target.result}" alt="Imagem de fundo">
                    `;

                    // Mostrar botão de limpar
                    const clearFundo = document.getElementById('clearFundo');
                    if (clearFundo) {
                        clearFundo.style.display = 'flex';
                    }

                    // Atualizar também o imagePreview para compatibilidade
                    const imagePreview = document.getElementById('imagePreview');
                    if (imagePreview) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                    }
                }
            };
            reader.readAsDataURL(file);

            // Fazer upload real para o servidor
            const formData = new FormData();
            formData.append('imagem', file);
            formData.append('tipo', type);

            try {
                const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Salvar caminho da imagem
                        if (!window.uploadedImages) {
                            window.uploadedImages = {};
                        }
                        window.uploadedImages[type] = data.image_url;
                        console.log(`✅ ${type} enviado:`, data.image_url);
                        
                        // Salvar no wizard
                        saveWizardData();
                        updatePreview();
                    } else {
                        console.error('Erro no upload:', data.message);
                    }
                } else {
                    console.error('Erro na resposta:', response.status);
                }
            } catch (error) {
                console.error('Erro ao fazer upload:', error);
            }
        }

                    // Salvar na sessão
                    saveWizardData();
                    // Atualizar preview
                    updatePreview();
                }
            };
            reader.readAsDataURL(file);
        }

        // Função para limpar imagem e remover arquivo
        function clearImage(type, event) {
            // Prevenir propagação do clique
            if (event) {
                event.stopPropagation();
            }

            let containerId;
            let inputId;
            let clearButtonId;
            let defaultContent;

            switch(type) {
                case 'logo':
                    containerId = 'logoPreviewContainer';
                    inputId = 'logoUpload';
                    clearButtonId = 'clearLogo';
                    defaultContent = `
                        <div class="upload-icon">🎨</div>
                        <div class="upload-text">Adicionar logo</div>
                        <div class="upload-hint">800x200px • Fundo transparente</div>
                    `;
                    break;
                case 'capa':
                    containerId = 'capaPreviewContainer';
                    inputId = 'capaUpload';
                    clearButtonId = 'clearCapa';
                    defaultContent = `
                        <div class="upload-icon">🖼️</div>
                        <div class="upload-text">Adicionar capa</div>
                        <div class="upload-hint">450x450px • Fundo transparente</div>
                    `;
                    break;
                case 'fundo':
                    containerId = 'fundoPreviewMain';
                    inputId = 'fundoUpload';
                    clearButtonId = 'clearFundo';
                    defaultContent = `
                        <div class="upload-icon">🌄</div>
                        <div class="upload-text">Clique para adicionar imagem de fundo</div>
                        <div class="upload-hint">PNG, JPG até 5MB • Tamanho ideal: 1920x640px</div>
                    `;
                    break;
            }

            // Restaurar conteúdo padrão
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = defaultContent;
            }

            // Limpar input file
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }

            // Esconder botão de limpar
            const clearButton = document.getElementById(clearButtonId);
            if (clearButton) {
                clearButton.style.display = 'none';
            }

            // Salvar alterações
            saveWizardData();
            updatePreview();
        }

        // Tornar a função global
        window.clearImage = clearImage;

        function initSwitch(switchId, callback) {
            const switchEl = document.getElementById(switchId);
            if (!switchEl) return;
            
            switchEl.addEventListener('click', function() {
                this.classList.toggle('active');
                if (callback) callback(this.classList.contains('active'));
            });
        }

        function initSwitches() {
            initSwitch('multiDaySwitch');
            initSwitch('locationTypeSwitch', function(isActive) {
                const presential = document.getElementById('presentialLocation');
                const online = document.getElementById('onlineLocation');
                
                if (presential && online) {
                    if (isActive) {
                        presential.classList.add('show');
                        online.classList.remove('show');
                    } else {
                        presential.classList.remove('show');
                        online.classList.add('show');
                    }
                    updatePreview();
                }
            });
            initSwitch('ticketVisibility1');
            initSwitch('absorbFeeSwitch');
        }

        function initProducerSelection() {
            const producerSelect = document.getElementById('producer');
            const newProducerFields = document.getElementById('newProducerFields');
            
            if (!producerSelect || !newProducerFields) return;

            producerSelect.addEventListener('change', function() {
                if (this.value === 'new') {
                    newProducerFields.classList.add('show');
                } else {
                    newProducerFields.classList.remove('show');
                }
            });
        }

        function initRichEditor() {
            const richEditor = document.getElementById('eventDescription');
            const editorBtns = document.querySelectorAll('.editor-btn');
            const charCounter = document.getElementById('charCounter');

            if (!richEditor) return;

            editorBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const command = this.dataset.command;
                    
                    if (command === 'createLink') {
                        const url = prompt('Digite a URL do link:');
                        if (url) {
                            document.execCommand('createLink', false, url);
                        }
                    } else {
                        document.execCommand(command, false, null);
                    }
                    
                    updateEditorButtons();
                    richEditor.focus();
                });
            });
            
            // Adicionar suporte para colar imagens
            richEditor.addEventListener('paste', async function(e) {
                const items = e.clipboardData.items;
                
                for (let item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        e.preventDefault();
                        
                        const blob = item.getAsFile();
                        const formData = new FormData();
                        formData.append('image', blob);
                        formData.append('folder', 'eventos');
                        
                        try {
                            // Por enquanto, apenas converter para base64
                            const reader = new FileReader();
                            reader.onload = function(event) {
                                document.execCommand('insertImage', false, event.target.result);
                            };
                            reader.readAsDataURL(blob);
                            
                            // TODO: Implementar upload real para /uploads/eventos
                            /*
                            const response = await fetch('/produtor/ajax/upload_image.php', {
                                method: 'POST',
                                body: formData
                            });
                            
                            if (response.ok) {
                                const data = await response.json();
                                document.execCommand('insertImage', false, data.url);
                            }
                            */
                        } catch (error) {
                            console.error('Erro ao processar imagem:', error);
                        }
                    }
                }
            });

            function updateEditorButtons() {
                editorBtns.forEach(btn => {
                    const command = btn.dataset.command;
                    if (document.queryCommandState(command)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }

            richEditor.addEventListener('keyup', function() {
                updateEditorButtons();
                updateCharCounter();
                updatePreview();
            });

            richEditor.addEventListener('mouseup', updateEditorButtons);

            function updateCharCounter() {
                if (!charCounter) return;
                const text = richEditor.textContent || richEditor.innerText || '';
                charCounter.textContent = `${text.length} caracteres`;
            }
        }

        function initCheckboxes() {
            const checkboxes = document.querySelectorAll('.checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('click', function() {
                    this.classList.toggle('checked');
                });
            });
        }

        function initRadioButtons() {
            const radioButtons = document.querySelectorAll('.radio');
            radioButtons.forEach(radio => {
                radio.addEventListener('click', function() {
                    const name = this.dataset.name;
                    if (name) {
                        document.querySelectorAll(`[data-name="${name}"]`).forEach(r => r.classList.remove('checked'));
                    } else {
                        const group = this.closest('.radio-group');
                        if (group) {
                            group.querySelectorAll('.radio').forEach(r => r.classList.remove('checked'));
                        }
                    }
                    this.classList.add('checked');
                });
            });
        }

        function initTicketManagement() {
            const addPaidBtn = document.getElementById('addPaidTicket');
            const addFreeBtn = document.getElementById('addFreeTicket');
            const addComboBtn = document.getElementById('addComboTicket');

            if (addPaidBtn) {
                addPaidBtn.addEventListener('click', function() {
                    openModal('paidTicketModal');
                    // Carregar lotes após abrir o modal
                    setTimeout(function() {
                        if (typeof carregarLotesIngressoPago === 'function') {
                            carregarLotesIngressoPago();
                            console.log('Lotes carregados via carregarLotesIngressoPago');
                        } else if (typeof carregarLotesNoModal === 'function') {
                            carregarLotesNoModal();
                            console.log('Lotes carregados via carregarLotesNoModal');
                        } else {
                            console.error('Função para carregar lotes não encontrada');
                        }
                        
                        // Calcular valores do ingresso
                        if (typeof calcularValoresIngresso === 'function') {
                            // Limpar campo de preço
                            const precoInput = document.getElementById('paidTicketPrice');
                            if (precoInput) {
                                precoInput.value = '';
                            }
                            calcularValoresIngresso();
                        }
                    }, 300);
                });
            }

            if (addFreeBtn) {
                addFreeBtn.addEventListener('click', function() {
                    console.log('Botão ingresso gratuito clicado');
                    openModal('freeTicketModal');
                    // Carregar lotes após abrir o modal
                    setTimeout(function() {
                        console.log('Tentando carregar lotes para modal gratuito...');
                        if (typeof carregarLotesNoModalFree === 'function') {
                            carregarLotesNoModalFree();
                            console.log('Função carregarLotesNoModalFree executada');
                        } else {
                            console.error('Função carregarLotesNoModalFree não encontrada');
                            // Tentar alternativa
                            if (typeof window.carregarLotesNoModalFree === 'function') {
                                window.carregarLotesNoModalFree();
                                console.log('Função window.carregarLotesNoModalFree executada');
                            }
                        }
                    }, 300);
                });
            }

            if (addComboBtn) {
                addComboBtn.addEventListener('click', function() {
                    openModal('comboTicketModal');
                });
            }
        }

        function createPaidTicket() {
            // Limpar erros anteriores
            document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
            
            const title = document.getElementById('paidTicketTitle')?.value;
            const quantity = document.getElementById('paidTicketQuantity')?.value;
            const price = document.getElementById('paidTicketPrice')?.value;
            const description = document.getElementById('paidTicketDescription')?.value || '';
            const saleStart = document.getElementById('paidSaleStart')?.value;
            const saleEnd = document.getElementById('paidSaleEnd')?.value;
            const minQuantity = document.getElementById('paidMinQuantity')?.value || 1;
            const maxQuantity = document.getElementById('paidMaxQuantity')?.value || 5;
            const loteId = document.getElementById('paidTicketLote')?.value;
            
            // Obter valores calculados
            const cobrarTaxa = document.getElementById('paidTicketTaxaServico')?.checked ? 1 : 0;
            const taxaValor = document.getElementById('paidTicketTaxaValor')?.value || 'R$ 0,00';
            const valorReceber = document.getElementById('paidTicketValorReceber')?.value || 'R$ 0,00';

            // Validação com destaque de campos
            let hasError = false;
            
            if (!title) {
                document.getElementById('paidTicketTitle').classList.add('error-field');
                hasError = true;
            }
            if (!quantity) {
                document.getElementById('paidTicketQuantity').classList.add('error-field');
                hasError = true;
            }
            if (!price || price === 'R$ 0,00') {
                document.getElementById('paidTicketPrice').classList.add('error-field');
                hasError = true;
            }
            if (!loteId) {
                document.getElementById('paidTicketLote').classList.add('error-field');
                hasError = true;
            }
            
            if (hasError) {
                alert('Por favor, preencha todos os campos obrigatórios marcados em vermelho.');
                return;
            }

            // Verificar se estamos em modo de edição (existe API) ou criação
            if (window.location.pathname.includes('editar-evento.php')) {
                // Modo edição - usar API
                const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanTaxa = parseFloat(taxaValor.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanValorReceber = parseFloat(valorReceber.replace(/[R$\s\.]/g, '').replace(',', '.'));
                
                const eventoId = new URLSearchParams(window.location.search).get('eventoid');
                const data = {
                    evento_id: parseInt(eventoId),
                    tipo: 'pago',
                    titulo: title,
                    descricao: description,
                    quantidade_total: parseInt(quantity),
                    preco: cleanPrice,
                    taxa_plataforma: cleanTaxa,
                    valor_receber: cleanValorReceber,
                    cobrar_taxa_servico: cobrarTaxa,
                    lote_id: loteId,
                    inicio_venda: saleStart || new Date().toISOString().slice(0, 16),
                    fim_venda: saleEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 16),
                    limite_min: parseInt(minQuantity),
                    limite_max: parseInt(maxQuantity),
                    disponibilidade: 'publico',
                    ativo: 1
                };

                fetch('/produtor/ajax/salvar_ingresso.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        if (typeof addTicketToEditList === 'function') {
                            addTicketToEditList(result.ingresso);
                        }
                        closeModal('paidTicketModal');
                        console.log('âœ… Ingresso pago criado com sucesso via API');
                    } else {
                        console.error('âŒ Erro ao criar ingresso:', result.message);
                    }
                })
                .catch(error => {
                    console.error('âŒ Erro na requisição:', error);
                    alert('Erro ao criar ingresso. Tente novamente.');
                });
            } else {
                // Modo criação - usar sistema de ingressos temporários
                const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanTaxa = parseFloat(taxaValor.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanValorReceber = parseFloat(valorReceber.replace(/[R$\s\.]/g, '').replace(',', '.'));
                
                if (typeof addTicketToCreationList === 'function') {
                    addTicketToCreationList(
                        'paid', 
                        title, 
                        parseInt(quantity), 
                        cleanPrice, 
                        description, 
                        saleStart, 
                        saleEnd, 
                        parseInt(minQuantity), 
                        parseInt(maxQuantity),
                        cobrarTaxa,
                        cleanTaxa,
                        cleanValorReceber,
                        loteId
                    );
                } else {
                    // Fallback para função antiga
                    addTicketToList('paid', title, quantity, price, loteId);
                }
                
                closeModal('paidTicketModal');
                
                // Limpar campos
                document.getElementById('paidTicketTitle').value = '';
                document.getElementById('paidTicketQuantity').value = '';
                document.getElementById('paidTicketPrice').value = '';
                document.getElementById('paidTicketDescription').value = '';
                document.getElementById('paidSaleStart').value = '';
                document.getElementById('paidSaleEnd').value = '';
                document.getElementById('paidMinQuantity').value = '1';
                document.getElementById('paidMaxQuantity').value = '5';
                document.getElementById('paidTicketLote').value = '';
                document.getElementById('paidTicketTaxaServico').checked = true;
                calcularValoresIngresso();
            }
        }

        function createFreeTicket() {
            const title = document.getElementById('freeTicketTitle')?.value;
            const quantity = document.getElementById('freeTicketQuantity')?.value;
            const description = document.getElementById('freeTicketDescription')?.value || '';
            const saleStart = document.getElementById('freeSaleStart')?.value;
            const saleEnd = document.getElementById('freeSaleEnd')?.value;
            const minQuantity = document.getElementById('freeMinQuantity')?.value || 1;
            const maxQuantity = document.getElementById('freeMaxQuantity')?.value || 5;
            const loteId = document.getElementById('freeTicketLote')?.value;

            if (!title || !quantity) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Verificar se estamos em modo de edição (existe API)
            if (window.location.pathname.includes('editar-evento.php') && typeof fetch !== 'undefined') {
                // Modo edição - usar API
                const eventoId = new URLSearchParams(window.location.search).get('eventoid');
                const data = {
                    evento_id: parseInt(eventoId),
                    tipo: 'gratuito',
                    titulo: title,
                    descricao: description,
                    quantidade_total: parseInt(quantity),
                    preco: 0,
                    taxa_plataforma: 0,
                    valor_receber: 0,
                    inicio_venda: saleStart || new Date().toISOString().slice(0, 16),
                    fim_venda: saleEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 16),
                    limite_min: parseInt(minQuantity),
                    limite_max: parseInt(maxQuantity),
                    disponibilidade: 'publico',
                    ativo: 1
                };

                fetch('/produtor/ajax/salvar_ingresso.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        if (typeof addTicketToEditList === 'function') {
                            addTicketToEditList(result.ingresso);
                        }
                        closeModal('freeTicketModal');
                        console.log('âœ… Ingresso gratuito criado com sucesso via API');
                    } else {
                        console.error('âŒ Erro ao criar ingresso:', result.message);
                    }
                })
                .catch(error => {
                    console.error('âŒ Erro na requisição:', error);
                    alert('Erro ao criar ingresso. Tente novamente.');
                });
            } else {
                // Modo criação - usar sistema de ingressos temporários
                if (typeof addTicketToCreationList === 'function') {
                    addTicketToCreationList(
                        'gratuito', 
                        title, 
                        parseInt(quantity), 
                        0, 
                        description, 
                        saleStart, 
                        saleEnd, 
                        parseInt(minQuantity), 
                        parseInt(maxQuantity)
                    );
                } else {
                    // Fallback para função antiga com parâmetros adicionais
                    addTicketToList('free', title, quantity, 'Gratuito', loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
                }
                
                closeModal('freeTicketModal');
                
                // Limpar campos
                document.getElementById('freeTicketTitle').value = '';
                document.getElementById('freeTicketQuantity').value = '';
                document.getElementById('freeTicketDescription').value = '';
                document.getElementById('freeSaleStart').value = '';
                document.getElementById('freeSaleEnd').value = '';
                document.getElementById('freeMinQuantity').value = '1';
                document.getElementById('freeMaxQuantity').value = '5';
            }
        }

        function updatePreview() {
            const previewTitle = document.getElementById('previewTitle');
            const previewDescription = document.getElementById('previewDescription');
            const previewDate = document.getElementById('previewDate');
            const previewLocation = document.getElementById('previewLocation');
            const previewCategory = document.getElementById('previewCategory');
            const previewType = document.getElementById('previewType');

            if (!previewTitle) return;

            const eventName = document.getElementById('eventName')?.value || 'Nome do evento';
            const startDateTime = document.getElementById('startDateTime')?.value;
            const endDateTime = document.getElementById('endDateTime')?.value;
            const category = document.getElementById('category')?.value;
            const venueName = document.getElementById('venueName')?.value;
            const eventLink = document.getElementById('eventLink')?.value;
            const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
            const description = document.getElementById('eventDescription')?.textContent || '';
            
            previewTitle.textContent = eventName;
            // Mostrar descrição apenas se existir, caso contrário deixar vazio
            if (previewDescription) {
                previewDescription.textContent = description ? description.substring(0, 120) : '';
            }
            
            // Mostrar data de início e fim
            if (startDateTime && previewDate) {
                const startDateObj = new Date(startDateTime);
                let dateText = startDateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Adicionar data de fim se existir
                if (endDateTime) {
                    const endDateObj = new Date(endDateTime);
                    dateText += ' até ' + endDateObj.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                previewDate.textContent = dateText;
            } else if (previewDate) {
                previewDate.textContent = 'Data não definida';
            }
            
            if (previewLocation) {
                if (isPresential) {
                    previewLocation.textContent = venueName || '';
                } else {
                    previewLocation.textContent = eventLink || '';
                }
            }

            if (previewType) {
                previewType.textContent = isPresential ? 'Presencial' : 'Online';
            }
            
            if (previewCategory) {
                const categoryEl = document.querySelector(`#category option[value="${category}"]`);
                const categoryText = categoryEl ? categoryEl.textContent : 'Categoria não definida';
                previewCategory.textContent = categoryText;
            }
            
            // Atualizar preview Hero
            updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential);
        }

        // Função para atualizar o preview hero
        function updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential) {
            // Atualizar imagem de fundo
            const heroBackground = document.getElementById('heroBackground');
            const heroSection = document.querySelector('.hero-section-mini');
            const fundoImg = document.querySelector('#fundoPreviewMain img');
            const corFundo = document.getElementById('corFundo')?.value || '#000000';
            
            if (heroBackground && heroSection) {
                if (fundoImg && fundoImg.src) {
                    // Tem imagem de fundo
                    heroBackground.style.backgroundImage = `url(${fundoImg.src})`;
                    heroBackground.style.backgroundColor = '';
                    heroBackground.style.opacity = '1'; // Opacidade total
                    heroSection.classList.remove('solid-bg');
                } else {
                    // Usar cor sólida
                    heroBackground.style.backgroundImage = '';
                    heroBackground.style.backgroundColor = corFundo;
                    heroBackground.style.opacity = '1';
                    heroSection.classList.add('solid-bg');
                }
            }

            // Atualizar logo
            const heroLogo = document.getElementById('heroLogo');
            const logoImg = document.querySelector('#logoPreviewContainer img');
            
            if (heroLogo && logoImg && logoImg.src) {
                heroLogo.src = logoImg.src;
                heroLogo.style.display = 'block';
            } else if (heroLogo) {
                heroLogo.style.display = 'none';
            }

            // Atualizar imagem capa quadrada
            const heroCapa = document.getElementById('heroCapa');
            const capaImg = document.querySelector('#capaPreviewContainer img');
            
            if (heroCapa && capaImg && capaImg.src) {
                heroCapa.src = capaImg.src;
                heroCapa.style.display = 'block';
            } else if (heroCapa) {
                heroCapa.style.display = 'none';
            }
        }

        // Funções de Cookie
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
                    // Tentar decodificar se necessário
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
        
        function clearAllWizardData() {
            deleteCookie('eventoWizard');
            deleteCookie('lotesData');
            
            // Limpar lotes usando a função global
            if (window.limparTodosLotes) {
                window.limparTodosLotes();
            }
            
            // Limpar também ingressos temporários
            if (window.temporaryTickets) {
                window.temporaryTickets.clear();
            }
            
            // Limpar a lista visual de ingressos
            const ticketList = document.getElementById('ticketList');
            if (ticketList) {
                ticketList.innerHTML = '';
            }
            
            // Limpar localStorage se usado
            if (typeof(Storage) !== "undefined") {
                localStorage.removeItem('temporaryTickets');
            }
            
            console.log('Todos os dados do wizard foram limpos');
        }

        // Função para coletar ingressos da lista visual
        function getTicketsFromList() {
            const tickets = [];
            const ticketElements = document.querySelectorAll('.ticket-item');
            
            ticketElements.forEach(element => {
                const ticketData = element.ticketData;
                if (ticketData) {
                    tickets.push(ticketData);
                }
                
                // Fallback para combos
                if (element.dataset.comboData) {
                    try {
                        const comboData = JSON.parse(element.dataset.comboData);
                        tickets.push({
                            type: 'combo',
                            comboData: comboData,
                            ticketId: element.dataset.ticketId
                        });
                    } catch(e) {
                        console.error('Erro ao parsear combo data:', e);
                    }
                }
            });
            
            return tickets;
        }

        // Função para salvar dados do wizard
        function saveWizardData() {
            // Debug - verificar qual elemento está sendo capturado
            const eventNameElement = document.getElementById('eventName');
            console.log('Salvando dados do wizard...');
            
            // Coletar dados de endereço completo
            const addressSearch = document.getElementById('addressSearch')?.value || '';
            
            // Coletar dados de lotes
            const lotesData = window.lotesManager ? window.lotesManager.getLotes() : {
                porData: [],
                porPercentual: []
            };
            
            // Se não tiver dados de lotes mas tiver no cookie
            const savedLotes = getCookie('lotesData');
            if (savedLotes && (!lotesData.porData.length && !lotesData.porPercentual.length)) {
                try {
                    const parsedLotes = JSON.parse(savedLotes);
                    lotesData.porData = parsedLotes.porData || [];
                    lotesData.porPercentual = parsedLotes.porPercentual || [];
                } catch (e) {
                    console.error('Erro ao parsear lotes:', e);
                }
            }
            
            // Coletar dados completos dos lotes do DOM
            const loteCards = document.querySelectorAll('.lote-card');
            const lotes = [];
            
            loteCards.forEach((card, index) => {
                const loteData = {
                    id: card.getAttribute('data-lote-id') || `lote_${index}`,
                    nome: card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`,
                    tipo: card.classList.contains('por-data') ? 'data' : 'percentual',
                    dataInicio: card.querySelector('.lote-info span:nth-child(1)')?.textContent?.replace('Início: ', '') || '',
                    dataFim: card.querySelector('.lote-info span:nth-child(2)')?.textContent?.replace('Fim: ', '') || '',
                    percentualVendido: card.querySelector('.percentual-value')?.textContent || '',
                    ativo: true
                };
                lotes.push(loteData);
            });
            
            // Coletar informações de imagens
            const logoImg = document.querySelector('#logoPreviewContainer img');
            const capaImg = document.querySelector('#capaPreviewContainer img');
            const fundoImg = document.querySelector('#fundoPreviewMain img') || document.querySelector('#fundoPreviewContainer img');
            
            // Coletar dados de ingressos temporários
            const ticketItems = document.querySelectorAll('.ticket-item');
            const tickets = [];
            
            ticketItems.forEach((item, index) => {
                // Primeiro tentar pegar dados do ticketData se existir
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
                currentStep: currentStep,
                eventName: document.getElementById('eventName')?.value || '',
                eventDescription: document.getElementById('eventDescription')?.innerHTML || '',
                classification: document.getElementById('classification')?.value || '',
                startDateTime: document.getElementById('startDateTime')?.value || '',
                endDateTime: document.getElementById('endDateTime')?.value || '',
                category: document.getElementById('category')?.value || '',
                venueName: document.getElementById('venueName')?.value || '',
                eventLink: document.getElementById('eventLink')?.value || '',
                isPresential: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
                // Campos de endereço completos
                addressSearch: addressSearch,
                street: document.getElementById('street')?.value || '',
                number: document.getElementById('number')?.value || '',
                complement: document.getElementById('complement')?.value || '',
                neighborhood: document.getElementById('neighborhood')?.value || '',
                city: document.getElementById('city')?.value || '',
                state: document.getElementById('state')?.value || '',
                cep: document.getElementById('cep')?.value || '',
                // Dados de imagens - incluir as URLs completas
                logoPath: logoImg?.src || '',
                capaPath: capaImg?.src || '',
                fundoPath: fundoImg?.src || '',
                logoUrl: window.uploadedImages?.logo || logoImg?.src || '',
                capaUrl: window.uploadedImages?.capa || capaImg?.src || '',
                fundoUrl: window.uploadedImages?.fundo || fundoImg?.src || '',
                hasLogoEvento: !!(logoImg && logoImg.src && !logoImg.src.includes('blob:')),
                hasCapaQuadrada: !!(capaImg && capaImg.src && !capaImg.src.includes('blob:')),
                hasImagemFundo: !!(fundoImg && fundoImg.src && !fundoImg.src.includes('blob:')),
                corFundo: document.getElementById('corFundo')?.value || '#000000',
                // URLs das imagens uploadadas
                uploadedImages: window.uploadedImages || {},
                // Dados completos de lotes
                lotes: lotes,
                lotesData: lotesData, // Manter compatibilidade
                // Dados do produtor
                producer: document.getElementById('producer')?.value || 'current',
                producerName: document.getElementById('producerName')?.value || '',
                displayName: document.getElementById('displayName')?.value || '',
                producerDescription: document.getElementById('producerDescription')?.value || '',
                // Dados finais
                termsAccepted: document.getElementById('termsCheckbox')?.classList.contains('checked') || false,
                visibility: document.querySelector('.radio.checked[data-value]')?.dataset.value || 'public',
                // Salvar ingressos com todos os dados incluindo lote_id
                ingressos: tickets,
                tickets: tickets, // Manter compatibilidade
                timestamp: new Date().getTime()
            };
            
            setCookie('eventoWizard', JSON.stringify(wizardData), 7);
            console.log('Dados do wizard salvos:', wizardData);
            
            // Salvar lotes separadamente também
            if (lotesData.porData.length > 0 || lotesData.porPercentual.length > 0) {
                setCookie('lotesData', JSON.stringify(lotesData), 7);
            }
            
            // Salvar ingressos separadamente
            if (tickets.length > 0) {
                setCookie('ingressosData', JSON.stringify(tickets), 7);
            }
        }

        // Função para verificar e restaurar dados do wizard
        function checkAndRestoreWizardData() {
            console.log('=== INICIANDO checkAndRestoreWizardData ===');
            console.log('Cookies disponíveis:', document.cookie);
            
            const savedData = getCookie('eventoWizard');
            console.log('Dados obtidos do cookie:', savedData);
            
            if (savedData) {
                console.log('Dados encontrados! Tentando fazer parse...');
                try {
                    const data = JSON.parse(savedData);
                    let eventName = data.eventName || 'Evento não nomeado';
                    
                    // Verificar se o nome do evento parece ser um nome de pessoa
                    const nomesPessoa = ['GUSTAVO', 'CIBIM', 'KALLAJIAN'];
                    const ehNomePessoa = nomesPessoa.some(nome => eventName.toUpperCase().includes(nome));
                    
                    if (ehNomePessoa) {
                        console.warn('Nome de evento suspeito detectado:', eventName);
                        console.log('Dados salvos completos:', data);
                        // Limpar dados corrompidos
                        clearAllWizardData();
                        return;
                    }
                    
                    // Usar dialog customizado
                    if (window.customDialog && window.customDialog.wizardRestore) {
                        console.log('Usando customDialog para perguntar ao usuário...');
                        window.customDialog.wizardRestore(eventName).then(action => {
                            console.log('Resposta do usuário:', action);
                            if (action === 'continue') {
                                restoreWizardData(data);
                            } else {
                                // Limpar dados se usuário não quiser restaurar
                                clearAllWizardData();
                            }
                        });
                    } else {
                        console.log('customDialog não disponível, usando confirm nativo');
                        // Fallback para confirm nativo se dialog não estiver disponível
                        const shouldRestore = confirm(`Você deseja continuar a configuração do evento "${eventName}" do ponto onde parou?`);
                        
                        if (shouldRestore) {
                            restoreWizardData(data);
                        } else {
                            clearAllWizardData();
                        }
                    }
                } catch (error) {
                    console.error('Erro ao recuperar dados salvos:', error);
                    clearAllWizardData();
                }
            } else {
                console.log('Nenhum dado de wizard salvo encontrado');
            }
        }

        // Função para restaurar dados do wizard
        function restoreWizardData(data) {
            // Restaurar uploadedImages se existir
            if (data.uploadedImages) {
                window.uploadedImages = data.uploadedImages;
            }
            
            // Restaurar caminhos das imagens se existirem
            if (!window.uploadedImages) {
                window.uploadedImages = {};
            }
            
            // Restaurar imagens do logo
            if (data.logoPath) {
                window.uploadedImages.logo = data.logoPath;
                const logoContainer = document.getElementById('logoPreviewContainer');
                if (logoContainer && data.logoPath) {
                    logoContainer.innerHTML = `
                        <img src="${data.logoPath}" alt="logo">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">800x200px</div>
                    `;
                    // Mostrar botão de limpar
                    const clearButton = document.getElementById('clearLogo');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Restaurar imagem de capa
            if (data.capaPath) {
                window.uploadedImages.capa = data.capaPath;
                const capaContainer = document.getElementById('capaPreviewContainer');
                if (capaContainer && data.capaPath) {
                    capaContainer.innerHTML = `
                        <img src="${data.capaPath}" alt="capa">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">450x450px</div>
                    `;
                    // Mostrar botão de limpar
                    const clearButton = document.getElementById('clearCapa');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Restaurar imagem de fundo
            if (data.fundoPath) {
                window.uploadedImages.fundo = data.fundoPath;
                const fundoContainer = document.getElementById('fundoPreviewMain');
                if (fundoContainer && data.fundoPath) {
                    fundoContainer.innerHTML = `
                        <img src="${data.fundoPath}" alt="fundo">
                    `;
                    // Mostrar botão de limpar
                    const clearButton = document.getElementById('clearFundo');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Restaurar campos básicos
            if (data.eventName && document.getElementById('eventName')) {
                document.getElementById('eventName').value = data.eventName;
            }
            if (data.eventDescription && document.getElementById('eventDescription')) {
                document.getElementById('eventDescription').innerHTML = data.eventDescription;
            }
            if (data.classification && document.getElementById('classification')) {
                document.getElementById('classification').value = data.classification;
            }
            if (data.startDateTime && document.getElementById('startDateTime')) {
                document.getElementById('startDateTime').value = data.startDateTime;
            }
            if (data.endDateTime && document.getElementById('endDateTime')) {
                document.getElementById('endDateTime').value = data.endDateTime;
            }
            if (data.category && document.getElementById('category')) {
                document.getElementById('category').value = data.category;
            }
            if (data.venueName && document.getElementById('venueName')) {
                document.getElementById('venueName').value = data.venueName;
            }
            if (data.eventLink && document.getElementById('eventLink')) {
                document.getElementById('eventLink').value = data.eventLink;
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
            
            // Restaurar campos de endereço
            if (data.addressSearch) {
                const addressSearchField = document.getElementById('addressSearch');
                if (addressSearchField) addressSearchField.value = data.addressSearch;
            }
            
            ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'cep'].forEach(fieldId => {
                if (data[fieldId] && document.getElementById(fieldId)) {
                    document.getElementById(fieldId).value = data[fieldId];
                }
            });
            
            // Restaurar switch de localização
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
            
            // Restaurar dados do produtor
            if (data.producer && document.getElementById('producer')) {
                document.getElementById('producer').value = data.producer;
                // Mostrar campos se for novo produtor
                if (data.producer === 'new') {
                    const newProducerFields = document.getElementById('newProducerFields');
                    if (newProducerFields) newProducerFields.classList.add('show');
                }
            }
            if (data.producerName && document.getElementById('producerName')) {
                document.getElementById('producerName').value = data.producerName;
            }
            if (data.displayName && document.getElementById('displayName')) {
                document.getElementById('displayName').value = data.displayName;
            }
            if (data.producerDescription && document.getElementById('producerDescription')) {
                document.getElementById('producerDescription').value = data.producerDescription;
            }
            
            // Restaurar termos e visibilidade
            if (data.termsAccepted) {
                const termsCheckbox = document.getElementById('termsCheckbox');
                if (termsCheckbox) termsCheckbox.classList.add('checked');
            }
            if (data.visibility) {
                const radioButtons = document.querySelectorAll('.radio[data-value]');
                radioButtons.forEach(radio => {
                    if (radio.dataset.value === data.visibility) {
                        radio.classList.add('checked');
                    } else {
                        radio.classList.remove('checked');
                    }
                });
            }
            
            // Restaurar lotes
            if (data.lotes) {
                // Salvar lotes no cookie para que o módulo de lotes possa carregar
                setCookie('lotesData', JSON.stringify(data.lotes), 7);
                // Chamar função para carregar lotes
                if (typeof carregarLotesDoCookie === 'function') {
                    setTimeout(() => carregarLotesDoCookie(), 100);
                }
            }
            
            // Restaurar lotes completos se existirem
            if (data.lotesCompletos && window.restaurarLotesCompletos) {
                setTimeout(() => window.restaurarLotesCompletos(data.lotesCompletos), 200);
            }
            
            // Restaurar ingressos
            if (data.tickets && data.tickets.length > 0) {
                console.log('Restaurando ingressos:', data.tickets.length);
                // Limpar lista atual
                const ticketList = document.getElementById('ticketList');
                if (ticketList) ticketList.innerHTML = '';
                
                // Restaurar cada ingresso usando as funções de criação
                data.tickets.forEach((ticket, index) => {
                    // Recriar o elemento do ingresso
                    const ticketId = ticket.id || `ticket_${Date.now()}_${index}`;
                    const ticketItem = document.createElement('div');
                    ticketItem.className = 'ticket-item';
                    ticketItem.dataset.ticketId = ticketId;
                    ticketItem.dataset.ticketType = ticket.tipo || ticket.type;
                    ticketItem.dataset.loteId = ticket.loteId;
                    
                    // Salvar dados completos
                    ticketItem.ticketData = ticket;
                    
                    // Criar HTML baseado no tipo
                    if (ticket.tipo === 'combo' || ticket.type === 'combo') {
                        const totalIngressos = (ticket.items || ticket.comboItems || []).length;
                        ticketItem.innerHTML = `
                            <div class="ticket-header">
                                <div class="ticket-info">
                                    <div class="ticket-name" style="color: #00C2FF;">${ticket.titulo || ticket.title}</div>
                                    <div class="ticket-details">
                                        <span class="ticket-detail-item">
                                            <span class="ticket-detail-label">Combo com ${totalIngressos} ingressos</span>
                                        </span>
                                        <span class="ticket-detail-item">
                                            <span class="ticket-detail-label">Quantidade:</span>
                                            <span class="ticket-detail-value">${ticket.quantidade || ticket.quantity}</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="ticket-pricing">
                                    <div class="ticket-price-item">
                                        <span class="ticket-price-label">Valor do combo:</span>
                                        <span class="ticket-buyer-price">R$ ${(parseFloat(ticket.preco) || parseFloat(ticket.price) || 0).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                                <div class="ticket-actions">
                                    <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                                </div>
                            </div>
                        `;
                    } else if (ticket.tipo === 'gratuito' || ticket.tipo === 'free' || ticket.type === 'free') {
                        ticketItem.innerHTML = `
                            <div class="ticket-header">
                                <div class="ticket-info">
                                    <div class="ticket-name">${ticket.titulo || ticket.title}</div>
                                    <div class="ticket-details">
                                        <span class="ticket-detail-item">
                                            <span class="ticket-detail-label">Quantidade:</span>
                                            <span class="ticket-detail-value">${ticket.quantidade || ticket.quantity}</span>
                                        </span>
                                        <span class="ticket-detail-item">
                                            <span class="ticket-detail-label">Lote:</span>
                                            <span class="ticket-detail-value">Lote ${ticket.loteId ? 'definido' : 'não definido'}</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="ticket-pricing">
                                    <div class="ticket-price-item">
                                        <span class="ticket-price-label">Valor:</span>
                                        <span class="ticket-buyer-price">Gratuito</span>
                                    </div>
                                </div>
                                <div class="ticket-actions">
                                    <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                                </div>
                            </div>
                        `;
                    } else {
                        // Ingresso pago
                        const preco = parseFloat(ticket.preco) || parseFloat(ticket.price) || 0;
                        const valorComprador = ticket.taxaServico ? preco + (ticket.taxaPlataforma || 0) : preco;
                        const valorReceber = ticket.valorReceber || preco;
                        
                        ticketItem.innerHTML = `
                            <div class="ticket-header">
                                <div class="ticket-info">
                                    <div class="ticket-name">${ticket.titulo || ticket.title}</div>
                                    <div class="ticket-details">
                                        <span class="ticket-detail-item">
                                            <span class="ticket-detail-label">Quantidade:</span>
                                            <span class="ticket-detail-value">${ticket.quantidade || ticket.quantity}</span>
                                        </span>
                                        <span class="ticket-detail-item">
                                            <span class="ticket-detail-label">Lote:</span>
                                            <span class="ticket-detail-value">Lote ${ticket.loteId ? 'definido' : 'não definido'}</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="ticket-pricing">
                                    <div class="ticket-price-item">
                                        <span class="ticket-price-label">Valor para o comprador:</span>
                                        <span class="ticket-buyer-price">R$ ${valorComprador.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div class="ticket-price-item">
                                        <span class="ticket-price-label">Você recebe:</span>
                                        <span class="ticket-receive-amount">R$ ${valorReceber.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                                <div class="ticket-actions">
                                    <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                                </div>
                            </div>
                        `;
                    }
                    
                    ticketList.appendChild(ticketItem);
                });
            }
            
            // Restaurar ingressos completos se existirem
            if (data.ingressosCompletos && window.restaurarIngressosCompletos) {
                setTimeout(() => window.restaurarIngressosCompletos(data.ingressosCompletos), 300);
            }
            
            // Restaurar ingressos da etapa 6
            if (data.ingressos && data.ingressos.length > 0) {
                console.log('Restaurando ingressos salvos:', data.ingressos);
                setTimeout(() => {
                    data.ingressos.forEach(ticket => {
                        // Criar o ingresso baseado no tipo
                        if (ticket.tipo === 'gratuito') {
                            if (window.createFreeTicket) {
                                window.createFreeTicket();
                            }
                        } else if (ticket.tipo === 'combo' && ticket.comboData) {
                            if (window.createComboTicket) {
                                // Criar combo com os dados salvos
                                window.comboItems = ticket.comboData;
                                window.createComboTicket();
                            }
                        } else {
                            if (window.createPaidTicket) {
                                window.createPaidTicket();
                            }
                        }
                        
                        // Aguardar um pouco e preencher os dados
                        setTimeout(() => {
                            const allTickets = document.querySelectorAll('.ticket-item');
                            const lastTicket = allTickets[allTickets.length - 1];
                            
                            if (lastTicket) {
                                // Armazenar dados no elemento
                                lastTicket.ticketData = ticket;
                                lastTicket.dataset.ticketId = ticket.id;
                                lastTicket.dataset.ticketType = ticket.tipo;
                                lastTicket.dataset.loteId = ticket.loteId || '';
                                
                                // Atualizar visualização
                                const nameElement = lastTicket.querySelector('.ticket-name');
                                if (nameElement) nameElement.textContent = ticket.titulo;
                                
                                const priceElement = lastTicket.querySelector('.ticket-buyer-price');
                                if (priceElement) priceElement.textContent = `R$ ${ticket.preco.toFixed(2).replace('.', ',')}`;
                                
                                const quantityElement = lastTicket.querySelector('.ticket-detail-value');
                                if (quantityElement) quantityElement.textContent = ticket.quantidade;
                                
                                // Se for combo, atualizar a lista de itens
                                if (ticket.tipo === 'combo' && ticket.comboData) {
                                    window.comboItems = ticket.comboData;
                                    if (window.updateComboItemsList) {
                                        window.updateComboItemsList();
                                    }
                                }
                            }
                        }, 200);
                    });
                }, 500);
            }
            
            // Ir para o step salvo
            if (data.currentStep && data.currentStep > 1) {
                setTimeout(() => goToStep(data.currentStep), 200);
            } else {
                updateStepDisplay();
            }
            
            // Atualizar preview
            setTimeout(() => updatePreview(), 300);
            
            console.log('Dados do wizard restaurados com sucesso');
        }

        // Adicionar salvamento automático ao mudar de step - MOVIDO PARA O FINAL DO ARQUIVO
        
        // Tornar validateStep global para debug
        window.validateStep = validateStep;

        function initPreviewListeners() {
            const fields = ['eventName', 'startDateTime', 'endDateTime', 'category', 'venueName', 'eventLink'];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', updatePreview);
                    field.addEventListener('change', () => {
                        updatePreview();
                        saveWizardData(); // Salvar ao mudar qualquer campo
                    });
                }
            });
            
            // Adicionar listener para descrição também
            const eventDescription = document.getElementById('eventDescription');
            if (eventDescription) {
                eventDescription.addEventListener('input', () => {
                    updatePreview();
                    saveWizardData();
                });
                // Também salvar ao perder o foco
                eventDescription.addEventListener('blur', () => {
                    saveWizardData();
                });
            }
        }

        // [Incluir todas as demais funçÃµes necessárias do arquivo original]

        window.initMap = initMap;

        // =====================================================
        // CONFIGURAÃ‡ÃƒO PARA API PHP - ANYSUMMIT
        // =====================================================

        const API_CONFIG = {
            baseUrl: 'https://anysummit.com.br/produtor/criaeventoapi.php',
            endpoints: {
                createEvent: '',
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // [Incluir todas as funçÃµes da API do arquivo original]

        function obterValorRadioSelecionado() {
            const radios = document.querySelectorAll('.radio.checked');
            if (radios.length > 0) {
                return radios[0].dataset.value || 'public';
            }
            return 'public';
        }

        function criarNotificacao(titulo, mensagem, tipo = 'info') {
            const notification = document.createElement('div');
            notification.className = `notificacao ${tipo}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem;
                border-radius: 8px;
                background-color: ${tipo === 'success' ? '#10B981' : (tipo === 'error' ? '#EF4444' : '#3B82F6')};
                color: white;
                font-weight: bold;
                z-index: 3000;
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            `;
            notification.innerHTML = `<strong>${titulo}</strong><br>${mensagem}`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
            
            return notification;
        }

        // [Incluir todas as demais funçÃµes necessárias...]

        async function enviarEventoParaAPI() {
            try {
                console.log('ðŸš€ Enviando evento para PHP...');
                
                // DEBUG - verificar ingressos antes de coletar
                debugarDadosIngressos();
                
                // 1. Coletar dados (incluindo imagem base64)
                const dados = coletarDadosFormulario();
                
                // 2. Validar
                const validacao = validarDadosObrigatorios(dados);
                if (!validacao.valido) {
                    alert('Erro de validação:\n' + validacao.erros.join('\n'));
                    return false;
                }
                
                // 3. Debug - ver dados que serão enviados
                console.log('ðŸ“‹ Dados completos:', dados);
                console.log('ðŸ“‹ Ingressos específicos:', dados.ingressos);
                
                // 4. Enviar TUDO para o PHP com configuração correta
                const response = await fetch(API_CONFIG.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dados),
                    mode: 'cors'
                });
                
                // 5. Verificar se a resposta é JSON válida
                let resultado;
                try {
                    resultado = await response.json();
                } catch (jsonError) {
                    const textResponse = await response.text();
                    console.error('âŒ Resposta não é JSON válida:', textResponse);
                    throw new Error('Resposta inválida do servidor: ' + textResponse);
                }
                
                // 6. Processar resposta
                if (!response.ok || !resultado.success) {
                    throw new Error(resultado.message || `Erro HTTP: ${response.status}`);
                }
                
                console.log('âœ… Sucesso:', resultado);
                mostrarSucesso(resultado.data);
                return true;
                
            } catch (error) {
                console.error('âŒ Erro completo:', error);
                mostrarErro(error.message);
                return false;
            }
        }

        // =====================================================
        // VALIDAÃ‡ÃƒO DE DADOS
        // =====================================================

        function validarDadosObrigatorios(dados) {
            const erros = [];
            
            // Validar nome do evento
            if (!dados.evento.nome || dados.evento.nome.trim() === '') {
                erros.push('Nome do evento é obrigatório');
            }
            
            // Validar data de início
            if (!dados.evento.data_inicio) {
                erros.push('Data e hora de início são obrigatórias');
            }
            
            // Validar localização
            if (dados.evento.tipo_local === 'presencial') {
                if (!dados.evento.busca_endereco || dados.evento.busca_endereco.trim() === '') {
                    erros.push('Endereço é obrigatório para eventos presenciais');
                }
            } else if (dados.evento.tipo_local === 'online') {
                if (!dados.evento.link_online || dados.evento.link_online.trim() === '') {
                    erros.push('Link do evento é obrigatório para eventos online');
                }
            }
            
            // Validar termos
            if (!dados.evento.termos_aceitos) {
                erros.push('Ã‰ necessário aceitar os termos de uso');
            }
            
            return {
                valido: erros.length === 0,
                erros: erros
            };
        }

        // =====================================================
        // COLETA DE DADOS DO FORMULÃRIO
        // =====================================================

        function obterImagemBase64(elementId) {
            return new Promise((resolve) => {
                let imagePreview;
                let inputFile;
                
                // Determinar elementos baseado no ID
                switch(elementId) {
                    case 'logo':
                        imagePreview = document.querySelector('#logoPreviewContainer img');
                        inputFile = document.getElementById('logoUpload');
                        break;
                    case 'capa':
                        imagePreview = document.querySelector('#capaPreviewContainer img');
                        inputFile = document.getElementById('capaUpload');
                        break;
                    case 'fundo':
                        imagePreview = document.querySelector('#fundoPreviewContainer img');
                        inputFile = document.getElementById('fundoUpload');
                        break;
                    default:
                        // Para compatibilidade com código antigo
                        imagePreview = document.getElementById('imagePreview');
                        inputFile = document.getElementById('imageUpload');
                }
                
                // Se já tem preview, usar essa imagem
                if (imagePreview && imagePreview.src && !imagePreview.src.includes('placeholder')) {
                    resolve(imagePreview.src);
                    return;
                }
                
                // Senão, tentar do input file
                const imageFile = inputFile?.files[0];
                
                if (!imageFile) {
                    resolve(''); // Sem imagem
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result); // base64
                };
                reader.onerror = function() {
                    resolve(''); // Em caso de erro
                };
                reader.readAsDataURL(imageFile);
            });
        }

        function coletarDadosFormulario() {
            console.log('ðŸ“‹ Coletando dados do formulário...');
            
            // 1. INFORMAÃ‡Ã•ES BÃSICAS (incluindo imagem)
            const informacoesBasicas = {
                nome: document.getElementById('eventName')?.value || '',
                classificacao: document.getElementById('classification')?.value || '',
                categoria: document.getElementById('category')?.value || ''
            };
            
            // 2. DATA E HORÃRIO
            const dataHorario = {
                data_inicio: document.getElementById('startDateTime')?.value || '',
                data_fim: document.getElementById('endDateTime')?.value || '',
                evento_multiplos_dias: document.getElementById('multiDaySwitch')?.classList.contains('active') || false
            };
            
            // 3. DESCRIÃ‡ÃƒO
            const descricao = {
                descricao_completa: document.getElementById('eventDescription')?.innerHTML || '',
                descricao_texto: document.getElementById('eventDescription')?.textContent || ''
            };
            
            // 4. LOCALIZAÃ‡ÃƒO
            const isPresencial = document.getElementById('locationTypeSwitch')?.classList.contains('active');
            const localizacao = {
                tipo_local: isPresencial ? 'presencial' : 'online',
                // Dados presenciais
                busca_endereco: (function() {
                    // Construir endereço completo a partir dos campos
                    const rua = document.getElementById('street')?.value || '';
                    const numero = document.getElementById('number')?.value || '';
                    const bairro = document.getElementById('neighborhood')?.value || '';
                    const cidade = document.getElementById('city')?.value || '';
                    const estado = document.getElementById('state')?.value || '';
                    
                    // Se não tiver pelo menos rua e cidade, pegar do campo de busca se existir
                    if (!rua && !cidade) {
                        return document.getElementById('addressSearch')?.value || '';
                    }
                    
                    // Montar endereço completo
                    let endereco = rua;
                    if (numero) endereco += `, ${numero}`;
                    if (bairro) endereco += ` - ${bairro}`;
                    if (cidade) endereco += `, ${cidade}`;
                    if (estado) endereco += ` - ${estado}`;
                    
                    return endereco.trim();
                })(),
                nome_local: document.getElementById('venueName')?.value || '',
                cep: document.getElementById('cep')?.value || '',
                rua: document.getElementById('street')?.value || '',
                numero: document.getElementById('number')?.value || '',
                complemento: document.getElementById('complement')?.value || '',
                bairro: document.getElementById('neighborhood')?.value || '',
                cidade: document.getElementById('city')?.value || '',
                estado: document.getElementById('state')?.value || '',
                // Dados online
                link_online: document.getElementById('eventLink')?.value || ''
            };
            
            // 5. SOBRE O PRODUTOR
            const isNovoProdutor = document.getElementById('producer')?.value === 'new';
            const produtor = {
                tipo_produtor: isNovoProdutor ? 'novo' : 'atual',
                nome_produtor: isNovoProdutor ? document.getElementById('producerName')?.value || '' : '',
                nome_exibicao: isNovoProdutor ? document.getElementById('displayName')?.value || '' : '',
                descricao_produtor: isNovoProdutor ? document.getElementById('producerDescription')?.value || '' : ''
            };
            
            // 6. CONFIGURAÃ‡Ã•ES FINAIS
            const configuracoes = {
                visibilidade: obterValorRadioSelecionado() || 'public',
                termos_aceitos: document.getElementById('termsCheckbox')?.classList.contains('checked') || false
            };
            
            // 7. INGRESSOS
            const ingressos = coletarDadosIngressos();
            
            // DADOS COMPLETOS
            const dadosCompletos = {
                evento: {
                    ...informacoesBasicas,
                    ...dataHorario,
                    ...descricao,
                    ...localizacao,
                    ...produtor,
                    ...configuracoes
                },
                ingressos: ingressos
            };
            
            console.log('âœ… Dados coletados para PHP:', dadosCompletos);
            return dadosCompletos;
        }

        function coletarDadosIngressos() {
            const ingressos = [];
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            console.log('ðŸŽŸï¸ Coletando', ticketItems.length, 'ingressos...');
            
            ticketItems.forEach((item, index) => {
                // Coletar dados do header
                const ticketName = item.querySelector('.ticket-name')?.textContent?.trim() || `Ingresso ${index + 1}`;
                const buyerPriceText = item.querySelector('.ticket-buyer-price')?.textContent || '';
                const receivePriceText = item.querySelector('.ticket-receive-amount')?.textContent || '';
                
                // Coletar dados dos detalhes
                const detailValues = item.querySelectorAll('.ticket-detail-value');
                const quantidade = detailValues[0]?.textContent?.trim() || '1';
                const taxaText = detailValues[1]?.textContent?.trim() || '0';
                const statusText = detailValues[2]?.textContent?.trim() || 'Ativo';
                
                // Determinar tipo e valores
                let tipo = 'gratuito';
                let valorComprador = 0;
                let valorReceber = 0;
                let taxaPlataforma = 0;
                let conteudoCombo = null;
                
                // Verificar se é combo
                if (ticketName.includes('ðŸ“¦') || item.dataset.comboData) {
                    tipo = 'combo';
                    
                    // Extrair valor do combo
                    const comboMatch = buyerPriceText.match(/R\$\s*([\d,.]+)/);
                    if (comboMatch) {
                        valorComprador = parseFloat(comboMatch[1].replace(/\./g, '').replace(',', '.'));
                        taxaPlataforma = valorComprador * 0.1;
                        valorReceber = valorComprador - taxaPlataforma;
                    }
                    
                    // Extrair dados do combo
                    if (item.dataset.comboData) {
                        conteudoCombo = JSON.parse(item.dataset.comboData);
                    }
                    
                } else if (buyerPriceText.includes('R$')) {
                    tipo = 'pago';
                    
                    // Extrair valor do comprador
                    const buyerMatch = buyerPriceText.match(/R\$\s*([\d,.]+)/);
                    if (buyerMatch) {
                        valorComprador = parseFloat(buyerMatch[1].replace(/\./g, '').replace(',', '.'));
                        taxaPlataforma = valorComprador * 0.1; // 10% de taxa
                        valorReceber = valorComprador - taxaPlataforma;
                    }
                    
                    // Extrair valor a receber (se já estiver calculado)
                    const receiveMatch = receivePriceText.match(/R\$\s*([\d,.]+)/);
                    if (receiveMatch) {
                        valorReceber = parseFloat(receiveMatch[1].replace(/\./g, '').replace(',', '.'));
                    }
                } else if (buyerPriceText.includes('código') || ticketName.toLowerCase().includes('código')) {
                    tipo = 'codigo';
                }
                
                // Verificar se está ativo
                const switchElement = item.querySelector('.switch-mini');
                const ativo = switchElement ? switchElement.classList.contains('active') : true;
                
                // Datas padrão (vocÃª pode melhorar isso coletando as datas reais dos modais)
                const agora = new Date();
                const inicioVenda = agora.toISOString().slice(0, 16);
                const fimVenda = new Date(agora.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16);
                
                const ingresso = {
                    tipo: tipo,
                    titulo: ticketName.replace(' 📦', ''), // Remover emoji do combo
                    descricao: '',
                    quantidade_total: parseInt(quantidade) || 1,
                    preco: valorComprador,
                    valor_receber: valorReceber,
                    taxa_plataforma: taxaPlataforma,
                    inicio_venda: inicioVenda,
                    fim_venda: fimVenda,
                    limite_min: 1,
                    limite_max: 10,
                    ativo: ativo,
                    posicao_ordem: index + 1
                };
                
                // Adicionar conteudo_combo apenas para combos
                if (conteudoCombo) {
                    ingresso.conteudo_combo = conteudoCombo;
                }
                
                console.log(`📦 Ingresso ${index + 1}:`, ingresso);
                ingressos.push(ingresso);
            });
            
            console.log('âœ… Total de ingressos coletados:', ingressos.length);
            return ingressos;
        }

        function debugarDadosIngressos() {
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            console.log('ðŸ” DEBUG - Elementos encontrados:', ticketItems.length);
            
            ticketItems.forEach((item, index) => {
                console.log(`--- Ingresso ${index + 1} ---`);
                console.log('Nome:', item.querySelector('.ticket-name')?.textContent);
                console.log('Valor comprador:', item.querySelector('.ticket-buyer-price')?.textContent);
                console.log('Valor recebe:', item.querySelector('.ticket-receive-amount')?.textContent);
                
                const detailValues = item.querySelectorAll('.ticket-detail-value');
                console.log('Quantidade:', detailValues[0]?.textContent);
                console.log('Taxa:', detailValues[1]?.textContent);
                console.log('Status:', detailValues[2]?.textContent);
                
                const switchEl = item.querySelector('.switch-mini');
                console.log('Switch ativo:', switchEl?.classList.contains('active'));
            });
        }

        // =====================================================
        // FEEDBACK VISUAL
        // =====================================================

        function mostrarSucesso(dados) {
            const publishBtn = document.querySelector('.btn-publish');
            if (publishBtn) {
                publishBtn.textContent = 'âœ… Evento Criado!';
                publishBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            }

            const eventoId = dados?.evento_id || dados?.id || 'N/A';
            const mensagem = dados?.message || 'Evento registrado.';

            criarNotificacao(
                'ðŸŽ‰ Evento criado com sucesso!',
                `ID do evento: ${eventoId}<br>${mensagem}`,
                'success'
            );

            setTimeout(() => {
                // Redirecionar para página de evento publicado
                if (eventoId && eventoId !== 'N/A') {
                    window.location = `/produtor/evento-publicado.php?eventoid=${eventoId}&novo=1`;
                } else {
                    window.location = "/produtor/meuseventos.php";
                }
            }, 2000);
        }

        function mostrarErro(mensagem) {
            const publishBtn = document.querySelector('.btn-publish');
            if (publishBtn) {
                publishBtn.textContent = 'âœ“ Publicar evento';
                publishBtn.disabled = false;
                publishBtn.style.background = '';
            }
            
            criarNotificacao(
                'âŒ Erro ao criar evento',
                mensagem,
                'error'
            );
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // =====================================================
        // INICIALIZAÃ‡ÃƒO DO FORMULÃRIO
        // =====================================================

        function initFormSubmission() {
            // Já está implementada no código acima, não precisa duplicar
        }

        // =====================================================
        // FUNÃ‡Ã•ES DE BUSCA DE ENDEREÃ‡O
        // =====================================================

        function initAddressSearch() {
            const addressSearch = document.getElementById('addressSearch');
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (!addressSearch || !addressSuggestions) {
                console.log('âŒ Elementos de busca não encontrados');
                return;
            }
            
            console.log('ðŸ” Inicializando busca de endereços...');
            
            let searchTimeout;

            addressSearch.addEventListener('input', function() {
                const query = this.value.trim();
                
                clearTimeout(searchTimeout);
                
                if (query.length < 3) {
                    addressSuggestions.style.display = 'none';
                    return;
                }

                searchTimeout = setTimeout(() => {
                    searchAddresses(query);
                }, 500);
            });

            document.addEventListener('click', function(e) {
                if (!addressSearch.contains(e.target) && !addressSuggestions.contains(e.target)) {
                    addressSuggestions.style.display = 'none';
                }
            });

            console.log('âœ… Busca de endereços inicializada');
        }

        function searchAddresses(query) {
            console.log('ðŸ” Buscando endereços para:', query);
            
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (typeof google !== 'undefined' && google.maps && google.maps.places && autocompleteService) {
                console.log('ðŸŒ Usando Google Places API...');
                
                const request = {
                    input: query,
                    componentRestrictions: { country: 'br' },
                    types: ['establishment', 'geocode']
                };

                autocompleteService.getPlacePredictions(request, function(predictions, status) {
                    console.log('ðŸ“¡ Resposta da API:', status, predictions?.length || 0, 'resultados');
                    
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                        displayAddressSuggestions(predictions);
                    } else {
                        console.log('âš ï¸ Sem resultados da API, usando simulação');
                        simulateAddressSearch(query);
                    }
                });
            } else {
                console.log('âš ï¸ Google Places API não disponível, usando simulação');
                simulateAddressSearch(query);
            }
        }

        function simulateAddressSearch(query) {
            console.log('ðŸŽ­ Simulando busca para:', query);
            
            const mockResults = [
                {
                    description: `${query} - São Paulo, SP, Brasil`,
                    place_id: 'mock_sp_' + Date.now(),
                    structured_formatting: {
                        main_text: query,
                        secondary_text: 'São Paulo, SP, Brasil'
                    }
                },
                {
                    description: `${query} - Rio de Janeiro, RJ, Brasil`, 
                    place_id: 'mock_rj_' + Date.now(),
                    structured_formatting: {
                        main_text: query,
                        secondary_text: 'Rio de Janeiro, RJ, Brasil'
                    }
                },
                {
                    description: `${query} - Belo Horizonte, MG, Brasil`,
                    place_id: 'mock_mg_' + Date.now(),
                    structured_formatting: {
                        main_text: query,
                        secondary_text: 'Belo Horizonte, MG, Brasil'
                    }
                }
            ];

            displayAddressSuggestions(mockResults);
        }

        function displayAddressSuggestions(results) {
            const addressSuggestions = document.getElementById('addressSuggestions');
            if (!addressSuggestions) return;
            
            console.log('ðŸ“‹ Exibindo', results.length, 'sugestÃµes');
            
            addressSuggestions.innerHTML = '';
            
            if (results.length === 0) {
                addressSuggestions.style.display = 'none';
                return;
            }

            results.forEach(result => {
                const suggestion = document.createElement('div');
                suggestion.className = 'address-suggestion';
                
                suggestion.innerHTML = `
                    <div class="address-suggestion-main">${result.structured_formatting?.main_text || result.description}</div>
                    <div class="address-suggestion-secondary">${result.structured_formatting?.secondary_text || ''}</div>
                `;
                
                suggestion.addEventListener('click', () => selectAddress(result));
                addressSuggestions.appendChild(suggestion);
            });

            addressSuggestions.style.display = 'block';
        }

        function selectAddress(address) {
            console.log('📦 Endereço selecionado:', address.description);
            
            const addressSearch = document.getElementById('addressSearch');
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (addressSearch) {
                addressSearch.value = address.description;
            }
            if (addressSuggestions) {
                addressSuggestions.style.display = 'none';
            }
            
            if (address.place_id.startsWith('mock_')) {
                console.log('ðŸŽ­ Usando dados simulados');
                fillMockAddressData(address.place_id);
            } else if (typeof google !== 'undefined' && google.maps && placesService) {
                console.log('ðŸŒ Buscando detalhes na API...');
                getPlaceDetails(address.place_id);
            } else {
                console.log('âš ï¸ API não disponível, usando simulação');
                fillMockAddressData('mock_default');
            }
        }

        function getPlaceDetails(placeId) {
            const request = {
                placeId: placeId,
                fields: ['address_components', 'geometry', 'name']
            };

            placesService.getDetails(request, function(place, status) {
                console.log('ðŸ“¡ Detalhes do local:', status, place);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    fillAddressFields(place);
                    updateMapLocation(place.geometry.location);
                } else {
                    console.log('âŒ Erro ao obter detalhes, usando simulação');
                    fillMockAddressData('api_error');
                }
            });
        }

        function fillAddressFields(place) {
            console.log('📦 Preenchendo campos com dados da API');
            
            const components = place.address_components || [];
            const fields = {
                cep: '',
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: ''
            };

            components.forEach(component => {
                const types = component.types;
                
                if (types.includes('postal_code')) {
                    fields.cep = component.long_name;
                } else if (types.includes('route')) {
                    fields.street = component.long_name;
                } else if (types.includes('street_number')) {
                    fields.number = component.long_name;
                } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                    fields.neighborhood = component.long_name;
                } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                    fields.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    fields.state = component.short_name;
                }
            });

            updateFormFields(fields);
        }

        function fillMockAddressData(mockType) {
            console.log('ðŸŽ­ Preenchendo com dados simulados:', mockType);
            
            let fields = {
                cep: '01310-100',
                street: 'Avenida Paulista',
                number: '1000',
                neighborhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP'
            };

            if (mockType.includes('rj')) {
                fields = {
                    cep: '22071-900',
                    street: 'Avenida AtlÃ¢ntica',
                    number: '500',
                    neighborhood: 'Copacabana',
                    city: 'Rio de Janeiro',
                    state: 'RJ'
                };
            } else if (mockType.includes('mg')) {
                fields = {
                    cep: '30112-000',
                    street: 'Avenida Afonso Pena',
                    number: '800',
                    neighborhood: 'Centro',
                    city: 'Belo Horizonte',
                    state: 'MG'
                };
            }

            updateFormFields(fields);
            
            if (map) {
                const mockLocation = { lat: -23.550520, lng: -46.633308 };
                updateMapLocation(mockLocation);
            }
        }

        function updateFormFields(fields) {
            console.log('âœï¸ Atualizando campos:', fields);
            
            Object.keys(fields).forEach(key => {
                const field = document.getElementById(key);
                if (field && fields[key]) {
                    field.value = fields[key];
                    console.log(`  âœ… ${key}: ${fields[key]}`);
                }
            });

            updatePreview();
        }

        function updateMapLocation(location) {
            if (!map || !location) {
                console.log('âš ï¸ Mapa ou localização não disponível');
                return;
            }


            console.log('ðŸ—ºï¸ Atualizando mapa:', location);

            map.setCenter(location);
            map.setZoom(16);

            if (marker) {
                marker.setMap(null);
            }

            marker = new google.maps.Marker({
                position: location,
                map: map,
                title: 'Local do evento',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#725EFF',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#00C2FF'
                }
            });

            console.log('âœ… Mapa atualizado com sucesso');
        }

        // =====================================================
        // FUNÃ‡Ã•ES DE INGRESSOS
        // =====================================================

        function formatCurrency(input) {
            let value = input.value.replace(/\D/g, '');
            
            if (value === '') {
                input.value = 'R$ 0,00';
                return;
            }
            
            value = parseInt(value) / 100;
            
            input.value = 'R$ ' + value.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function calculateReceiveAmount(inputValue) {
            const cleanValue = inputValue.replace(/[R$\s\.]/g, '').replace(',', '.');
            const numericValue = parseFloat(cleanValue);
            
            if (isNaN(numericValue)) return 'R$ 0,00';
            
            const receiveValue = numericValue * 0.9;
            
            return 'R$ ' + receiveValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function initPriceInput() {
            const priceInput = document.getElementById('paidTicketPrice');
            const receiveInput = document.getElementById('paidTicketReceive');
            
            if (!priceInput || !receiveInput) return;
            
            priceInput.value = 'R$ 0,00';
            receiveInput.value = 'R$ 0,00';
            
            priceInput.addEventListener('input', function() {
                formatCurrency(this);
                
                const receiveAmount = calculateReceiveAmount(this.value);
                receiveInput.value = receiveAmount;
                
                const smallText = receiveInput.nextElementSibling;
                if (smallText && smallText.tagName === 'SMALL') {
                    smallText.textContent = receiveAmount;
                    smallText.style.color = '#10B981';
                }
            });
            
            priceInput.addEventListener('blur', function() {
                if (this.value === 'R$ ' || this.value === '') {
                    this.value = 'R$ 0,00';
                    receiveInput.value = 'R$ 0,00';
                }
            });
            
            priceInput.addEventListener('focus', function() {
                if (this.value === 'R$ 0,00') {
                    this.value = 'R$ ';
                }
            });
        }

        function initMiniSwitches() {
            document.querySelectorAll('.switch-mini').forEach(switchEl => {
                switchEl.addEventListener('click', function() {
                    this.classList.toggle('active');
                    
                    const ticketItem = this.closest('.ticket-item');
                    const statusElement = ticketItem.querySelector('.ticket-detail-value[style*="color: #10B981"]');
                    if (statusElement) {
                        if (this.classList.contains('active')) {
                            statusElement.textContent = 'Ativo';
                            statusElement.style.color = '#10B981';
                        } else {
                            statusElement.textContent = 'Inativo';
                            statusElement.style.color = '#EF4444';
                        }
                    }
                });
            });
        }

        function addTicketToList(type, title, quantity, price, loteId = '', description = '', saleStart = '', saleEnd = '', minQuantity = 1, maxQuantity = 5) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.ticketId = ticketCount;
            
            // IMPORTANTE: Adicionar o loteId ao dataset
            if (loteId) {
                ticketItem.dataset.loteId = loteId;
            }
            
            const buyerPrice = type === 'paid' ? price : 'Gratuito';
            const cleanPrice = type === 'paid' ? parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.')) : 0;
            const tax = type === 'paid' ? cleanPrice * 0.1 : 0;
            const receiveAmount = type === 'paid' ? cleanPrice * 0.9 : 0;
            
            const taxFormatted = type === 'paid' ? `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'R$ 0,00';
            const receiveFormatted = type === 'paid' ? `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Gratuito';
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-title">
                        ${title}
                        <span class="ticket-type-badge ${type === 'paid' ? 'pago' : 'gratuito'}">
                            ${type === 'paid' ? 'Pago' : 'Gratuito'}
                        </span>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onClick="editTicket(${ticketCount})" title="Editar">✏️</button>
                        <button class="btn-icon" onClick="removeTicket(${ticketCount})" title="Remover">🗑️</button>
                    </div>
                </div>
                <div class="ticket-details">
                    <div class="ticket-info">
                        <span>Quantidade: <strong>${quantity}</strong></span>
                        ${type === 'paid' ? `<span>Preço: <strong>${buyerPrice}</strong></span>` : ''}
                        <span>Taxa: <strong>${taxFormatted}</strong></span>
                        <span>VocÃª recebe: <strong>${receiveFormatted}</strong></span>
                    </div>
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            
            // Armazenar dados do ingresso para edição
            ticketItem.ticketData = {
                type: type,
                title: title,
                quantity: quantity,
                price: type === 'paid' ? cleanPrice : 0,
                description: description,
                saleStart: saleStart,
                saleEnd: saleEnd,
                minQuantity: minQuantity,
                maxQuantity: maxQuantity,
                loteId: loteId
            };
            
            // Salvar na sessão
            saveWizardData();
        }

        function removeTicket(ticketId) {
            if (confirm('Tem certeza que deseja excluir este ingresso?')) {
                const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                if (ticketElement) {
                    ticketElement.remove();
                    // Salvar após remover
                    saveWizardData();
                }
            }
        }

        // =====================================================
        // FUNÃ‡Ã•ES DE CÃ“DIGO
        // =====================================================

        function generateRandomCode(length = 8) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        function createCodeTicket() {
            const title = document.getElementById('codeTicketTitle')?.value;
            const quantity = document.getElementById('codeTicketQuantity')?.value;
            const startDate = document.getElementById('codeSaleStart')?.value;
            const endDate = document.getElementById('codeSaleEnd')?.value;

            if (!title || !quantity || !startDate || !endDate) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            if (quantity > 1000) {
                alert('Máximo de 1000 códigos permitidos.');
                return;
            }

            const codes = [];
            const existingCodes = new Set();
            
            for (let i = 0; i < quantity; i++) {
                let code;
                do {
                    code = generateRandomCode();
                } while (existingCodes.has(code));
                
                existingCodes.add(code);
                codes.push({
                    code: code,
                    sentTo: '',
                    usedAt: null,
                    used: false
                });
            }

            const ticketId = 'codes_' + Date.now();
            ticketCodes[ticketId] = {
                title: title,
                codes: codes,
                startDate: startDate,
                endDate: endDate
            };

            addCodeTicketToList(title, quantity, ticketId);
            closeModal('codeTicketModal');
            
            document.getElementById('codeTicketTitle').value = '';
            document.getElementById('codeTicketQuantity').value = '';
            document.getElementById('codeSaleStart').value = '';
            document.getElementById('codeSaleEnd').value = '';
        }

        function addCodeTicketToList(title, quantity, ticketId) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${title}</div>
                        <div class="ticket-buyer-price">Valor do comprador: <strong>Acesso via código</strong></div>
                        <div class="ticket-receive-amount">Tipo: <strong>Códigos de acesso</strong></div>
                    </div>
                    <div class="ticket-actions-inline">
                        <div class="switch-mini active" title="Ativar/Desativar">
                            <div class="switch-mini-handle"></div>
                        </div>
                        <button class="btn-icon btn-codes" title="Listar Códigos" onclick="openCodesModal('${ticketId}')">
                            ✏️
                        </button>                       
                        <button class="btn-icon btn-delete" title="Excluir" onclick="removeTicket(this)">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="ticket-details-list">
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">Códigos Gerados</div>
                        <div class="ticket-detail-value">${quantity}</div>
                    </div>
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">Códigos Usados</div>
                        <div class="ticket-detail-value">0</div>
                    </div>
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">Status</div>
                        <div class="ticket-detail-value" style="color: #10B981;">Ativo</div>
                    </div>
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            initMiniSwitches();
        }

        function openCodesModal(ticketId) {
            const ticketData = ticketCodes[ticketId];
            if (!ticketData) return;

            document.getElementById('codesModalTitle').textContent = ticketData.title;
            populateCodesTable(ticketData.codes);
            openModal('codesListModal');
        }

        function populateCodesTable(codes) {
            const tbody = document.getElementById('codesTableBody');
            tbody.innerHTML = '';

            codes.forEach((codeData, index) => {
                const row = tbody.insertRow();
                
                row.innerHTML = `
                    <td>
                        <span class="code-value">${codeData.code}</span>
                        <button class="btn btn-outline btn-small" onclick="copyIndividualCode('${codeData.code}')" title="Copiar código" style="margin-left: 8px; padding: 2px 6px; font-size: 0.7rem;">
                            📋
                        </button>
                    </td>
                    <td>
                        <input type="text" value="${codeData.sentTo}" 
                               onchange="updateCodeRecipient(${index}, this.value)"
                               placeholder="Nome da pessoa, empresa, etc..." 
                               style="background: transparent; border: 1px solid rgba(114, 94, 255, 0.3); border-radius: 4px; padding: 4px 8px; color: #E1E5F2; width: 100%;">
                    </td>
                    <td>
                        ${codeData.used ? 
                            `<span class="status-used">${new Date(codeData.usedAt).toLocaleString('pt-BR')}</span>` : 
                            `<span class="status-unused">Não utilizado</span>`
                        }
                    </td>
                    <td>
                        <button class="btn btn-whatsapp btn-small" onclick="shareCodeWhatsApp('${codeData.code}', ${index})" title="Compartilhar via WhatsApp">
                            📱
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="deleteCode(${index})" title="Apagar">
                            🗑️
                        </button>
                    </td>
                `;
            });
        }

        function filterCodes() {
            const searchTerm = document.getElementById('searchCodes').value.toLowerCase();
            const rows = document.querySelectorAll('#codesTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        function shareCodeWhatsApp(code, index) {
            const eventName = document.getElementById('eventName')?.value || 'Evento';
            const eventDate = document.getElementById('startDateTime')?.value;
            
            let dateText = '';
            if (eventDate) {
                const date = new Date(eventDate);
                dateText = `\nðŸ“… Data: ${date.toLocaleDateString('pt-BR')} Ã s ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
            }
            
            const message = `ðŸŽŸï¸ *Seu código de acesso*\n\n` +
                           `*Evento:* ${eventName}${dateText}\n\n` +
                           `*Código:* \`${code}\`\n\n` +
                           `📦 Apresente este código no evento para ter acesso.\n\n` +
                           `_Generated by Anysummit_`;
            
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
            
            const recipientField = document.querySelector(`#codesTableBody tr:nth-child(${index + 1}) input`);
            if (!recipientField.value.trim()) {
                const now = new Date().toLocaleString('pt-BR');
                recipientField.value = `Enviado via WhatsApp - ${now}`;
                updateCodeRecipient(index, recipientField.value);
            }
        }

        function updateCodeRecipient(index, description) {
            console.log(`Código ${index} foi encaminhado para: ${description}`);
        }

        function copyIndividualCode(code) {
            navigator.clipboard.writeText(code).then(() => {
                const notification = document.createElement('div');
                notification.textContent = 'Código copiado!';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #00C2FF, #725EFF);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    z-index: 3000;
                    font-size: 0.9rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            });
        }

        function deleteCode(index) {
            if (confirm('Tem certeza que deseja apagar este código?')) {
                const row = document.querySelector(`#codesTableBody tr:nth-child(${index + 1})`);
                row.remove();
            }
        }

        function exportCodes() {
            const codes = Array.from(document.querySelectorAll('#codesTableBody tr')).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    codigo: cells[0].textContent.trim(),
                    email: cells[1].querySelector('input').value,
                    utilizado: cells[2].textContent.trim()
                };
            });
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + "Código,Email,Status\n"
                + codes.map(c => `${c.codigo},${c.email},${c.utilizado}`).join("\n");
            
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "codigos_ingresso.csv");
            link.click();
        }

        function copyAllCodes() {
            const codes = Array.from(document.querySelectorAll('.code-value')).map(el => el.textContent).join('\n');
            navigator.clipboard.writeText(codes).then(() => {
                alert('Todos os códigos foram copiados para a área de transferÃªncia!');
            });
        }

        function initCodeTicketButton() {
            const addCodeBtn = document.getElementById('addCodeTicket');
            if (addCodeBtn) {
                addCodeBtn.addEventListener('click', function() {
                    openModal('codeTicketModal');
                });
            }
        }

        // =====================================================
        // TESTE DE CONEXÃƒO
        // =====================================================

        function testarConexaoAPI() {
            const dadosTeste = {
                evento: {
                    nome: 'Evento Teste',
                    data_inicio: '2025-06-01T10:00:00',
                    data_fim: '2025-06-01T18:00:00',
                    tipo_local: 'presencial',
                    busca_endereco: 'Rua Teste, 123',
                    visibilidade: 'public',
                    termos_aceitos: true,
                    classificacao: 'livre',
                    categoria: 'tecnologia'
                },
                ingressos: [
                    {
                        tipo: 'gratuito',
                        titulo: 'Ingresso Teste',
                        quantidade_total: 100,
                        valor_comprador: 0,
                        valor_receber: 0,
                        ativo: true,
                        posicao_ordem: 1
                    }
                ]
            };
            
            fetch(API_CONFIG.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dadosTeste)
            })
            .then(response => response.json())
            .then(data => {
                console.log('ðŸ§ª Teste de conexão:', data);
                alert('Conexão OK: ' + JSON.stringify(data));
            })
            .catch(error => {
                console.error('ðŸ§ª Erro no teste:', error);
                alert('Erro na conexão: ' + error.message);
            });
        }

        // =====================================================
        // FUNÃ‡Ã•ES DO COMBO DE TIPOS DE INGRESSO
        // =====================================================

        let comboItems = [];

        // FUNÇÃO ANTIGA - SUBSTITUÍDA POR populateComboTicketSelectByLote
        function populateComboTicketSelect() {
            // Não fazer nada - usar populateComboTicketSelectByLote
            console.log('populateComboTicketSelect chamada - redirecionando para nova função');
        }

        function addItemToCombo() {
            const select = document.getElementById('comboTicketTypeSelect');
            const quantityInput = document.getElementById('comboItemQuantity');
            
            if (!select.value || !quantityInput.value) {
                alert('Selecione um tipo de ingresso e defina a quantidade.');
                return;
            }
            
            const selectedOption = select.options[select.selectedIndex];
            const ticketData = JSON.parse(selectedOption.dataset.ticketData);
            const quantity = parseInt(quantityInput.value);
            
            // Verificar se já não foi adicionado
            const existingItem = comboItems.find(item => item.index === ticketData.index);
            if (existingItem) {
                alert('Este tipo de ingresso já foi adicionado ao combo.');
                return;
            }
            
            // Adicionar ao array
            const comboItem = {
                index: ticketData.index,
                name: ticketData.name,
                price: ticketData.price,
                quantity: quantity
            };
            
            comboItems.push(comboItem);
            
            // Atualizar interface
            updateComboItemsList();
            updateComboSummary();
            
            // Limpar campos
            select.value = '';
            quantityInput.value = '';
        }

        function updateComboItemsList() {
            const container = document.getElementById('comboItemsList');
            if (!container) return;
            
            if (comboItems.length === 0) {
                container.innerHTML = `
                    <div class="combo-empty-state">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📦</div>
                        <div style="color: #8B95A7;">Adicione tipos de ingresso ao combo</div>
                        <div style="color: #8B95A7; font-size: 0.85rem;">Selecione os tipos já criados e defina quantidades</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = comboItems.map((item, index) => `
                <div class="combo-item">
                    <div class="combo-item-info">
                        <div class="combo-item-title">${item.name}</div>
                        <div class="combo-item-details">${item.price}</div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div class="combo-item-quantity">${item.quantity}x</div>
                   
						
						<button class="btn-icon btn-delete" onclick="removeComboItem(${index})" title="Remover">
    🗑️
</button>
                    </div>
                </div>
            `).join('');
        }

        function removeComboItem(index) {
            comboItems.splice(index, 1);
            updateComboItemsList();
            updateComboSummary();
        }

        function updateComboSummary() {
            const totalItems = comboItems.reduce((sum, item) => sum + item.quantity, 0);
            console.log(`📦 Combo atualizado: ${comboItems.length} tipos, ${totalItems} itens totais`);
        }

        function createComboTicket() {
            // Limpar erros anteriores
            document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
            
            const title = document.getElementById('comboTicketTitle')?.value;
            const quantity = document.getElementById('comboTicketQuantity')?.value;
            const price = document.getElementById('comboTicketPrice')?.value;
            const loteId = document.getElementById('comboTicketLote')?.value;
            const startDate = document.getElementById('comboSaleStart')?.value;
            const endDate = document.getElementById('comboSaleEnd')?.value;
            const description = document.getElementById('comboTicketDescription')?.value;
            const taxaServico = document.getElementById('comboTicketTaxaServico')?.checked;

            // Validação com destaque de campos
            let hasError = false;
            
            if (!title) {
                document.getElementById('comboTicketTitle').classList.add('error-field');
                hasError = true;
            }
            if (!quantity) {
                document.getElementById('comboTicketQuantity').classList.add('error-field');
                hasError = true;
            }
            if (!price || price === 'R$ 0,00') {
                document.getElementById('comboTicketPrice').classList.add('error-field');
                hasError = true;
            }
            if (!loteId) {
                document.getElementById('comboTicketLote').classList.add('error-field');
                hasError = true;
            }
            if (!startDate) {
                document.getElementById('comboSaleStart').classList.add('error-field');
                hasError = true;
            }
            if (!endDate) {
                document.getElementById('comboSaleEnd').classList.add('error-field');
                hasError = true;
            }

            if (hasError) {
                alert('Por favor, preencha todos os campos obrigatórios marcados em vermelho.');
                return;
            }

            if (comboItems.length === 0) {
                alert('Adicione pelo menos um tipo de ingresso ao combo.');
                // Destacar a área de composição do combo
                const comboList = document.getElementById('comboItemsList');
                if (comboList) {
                    comboList.style.border = '2px solid #ef4444';
                    setTimeout(() => {
                        comboList.style.border = '';
                    }, 3000);
                }
                return;
            }

            // Obter informações do lote selecionado
            const selectLote = document.getElementById('comboTicketLote');
            const selectedOption = selectLote.options[selectLote.selectedIndex];
            const loteNome = selectedOption.dataset.nomeSimples || selectedOption.textContent.split(' - ')[0];
            const tipoLote = selectedOption.dataset.tipoLote;

            // Criar o combo
            const comboData = {
                tipo: 'combo',
                loteId: loteId,
                loteNome: loteNome,
                tipoLote: tipoLote,
                taxaServico: taxaServico,
                itens: comboItems.map(item => ({
                    ingresso_index: item.index,
                    quantidade: item.quantity,
                    nome: item.name
                }))
            };

            const totalItems = comboItems.reduce((sum, item) => sum + item.quantity, 0);
            const comboDescription = description || `Inclui: ${comboItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}`;

            addComboToList(title, quantity, price, comboData, totalItems, comboDescription, loteId, loteNome, startDate, endDate);
            closeModal('comboTicketModal');
            clearComboForm();
        }

        function addComboToList(title, quantity, price, comboData, totalItems, description, loteId, loteNome, startDate, endDate) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
            const tax = cleanPrice * 0.1;
            const receiveAmount = cleanPrice * 0.9;
            
            const taxFormatted = `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            const receiveFormatted = `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toLocaleDateString('pt-BR') + ' ' + 
                       date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
            };
            
            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.ticketId = ticketCount;
            ticketItem.dataset.comboData = JSON.stringify(comboData);
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-title">
                        <span class="ticket-name">${title}</span>
                        <span class="ticket-type-badge combo">(Combo)</span>
                        <span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">
                            ${loteNome} - Por Data (${formatDate(startDate)} até ${formatDate(endDate)})
                        </span>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onClick="editCombo(${ticketCount})" title="Editar Combo">✏️</button>
                        <button class="btn-icon" onClick="removeTicket(${ticketCount})" title="Remover">  🗑️</button>
                    </div>
                </div>
                <div class="ticket-details">
                    <div class="ticket-info">
                        <span>Quantidade: <strong>${quantity}</strong></span>
                        <span>Preço: <strong>${price}</strong></span>
                        <span>Taxa: <strong>${taxFormatted}</strong></span>
                        <span>Você recebe: <strong>${receiveFormatted}</strong></span>
                    </div>
                    <div class="combo-items" style="margin-top: 10px; padding: 8px 12px; background: #f0f4ff; border-radius: 6px;">
                        <strong style="color: #9C27B0;">Inclui:</strong>
                        <span style="color: #555; margin-left: 5px;">
                            ${comboData.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
                        </span>
                    </div>
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            
            // Armazenar dados do combo para edição
            ticketItem.ticketData = {
                type: 'combo',
                title: title,
                quantity: quantity,
                price: cleanPrice,
                description: description,
                comboData: comboData
            };
            
            // Salvar após adicionar combo
            saveWizardData();
        }

        function clearComboForm() {
            // Limpar campos do formulário
            document.getElementById('comboTicketTitle').value = '';
            document.getElementById('comboTicketQuantity').value = '';
            document.getElementById('comboTicketPrice').value = 'R$ 0,00';
            document.getElementById('comboTicketReceive').value = 'R$ 0,00';
            document.getElementById('comboTicketLote').value = '';
            document.getElementById('comboSaleStart').value = '';
            document.getElementById('comboSaleEnd').value = '';
            document.getElementById('comboTicketDescription').value = '';
            document.getElementById('comboTicketTaxaServico').checked = true;
            
            // Limpar valores calculados
            document.getElementById('comboTicketTaxaValor').value = 'R$ 0,00';
            document.getElementById('comboTicketValorComprador').value = 'R$ 0,00';
            
            // Limpar itens do combo
            comboItems = [];
            updateComboItemsList();
            updateComboSummary();
            
            // Resetar select de tipos de ingresso
            const select = document.getElementById('comboTicketTypeSelect');
            if (select) {
                select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
            }
        }

        // Inicializar formatação de preço para combo
        function initComboPriceInput() {
            const priceInput = document.getElementById('comboTicketPrice');
            const receiveInput = document.getElementById('comboTicketReceive');
            
            if (!priceInput || !receiveInput) return;
            
            priceInput.value = 'R$ 0,00';
            receiveInput.value = 'R$ 0,00';
            
            priceInput.addEventListener('input', function() {
                formatCurrency(this);
                
                const receiveAmount = calculateReceiveAmount(this.value);
                receiveInput.value = receiveAmount;
            });
            
            priceInput.addEventListener('blur', function() {
                if (this.value === 'R$ ' || this.value === '') {
                    this.value = 'R$ 0,00';
                    receiveInput.value = 'R$ 0,00';
                }
            });
            
            priceInput.addEventListener('focus', function() {
                if (this.value === 'R$ 0,00') {
                    this.value = 'R$ ';
                }
            });
        }

// ==================== FUNÃ‡Ã•ES DE EDIÃ‡ÃƒO DE INGRESSOS ====================

// Função para editar ingresso existente
function editTicket(ticketId) {
    console.log('ðŸ”§ Editando ingresso:', ticketId);
    
    // Buscar os dados do ingresso na lista atual
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (!ticketElement) {
        alert('Ingresso não encontrado');
        return;
    }
    
    // Extrair dados do elemento
    const ticketData = extractTicketDataFromElement(ticketElement);
    
    // Verificar se é pago ou gratuito
    if (ticketData.tipo === 'pago') {
        populateEditPaidTicketModal(ticketData);
        document.getElementById('editPaidTicketModal').style.display = 'flex';
    } else {
        populateEditFreeTicketModal(ticketData);
        document.getElementById('editFreeTicketModal').style.display = 'flex';
    }
}

// Função para extrair dados do ingresso do elemento HTML
function extractTicketDataFromElement(element) {
    const titleElement = element.querySelector('.ticket-title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    // Determinar tipo baseado na classe
    let tipo = 'gratuito';
    if (titleElement && titleElement.querySelector('.pago')) {
        tipo = 'pago';
    }
    
    return {
        id: element.dataset.ticketId,
        titulo: title.replace(/\s+(Gratuito|Pago|Código)$/, ''),
        tipo: tipo,
        // Estes dados virão do backend quando implementarmos a busca AJAX
        quantidade_total: 100,
        preco: 0,
        inicio_venda: new Date().toISOString().slice(0, 16),
        fim_venda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        limite_min: 1,
        limite_max: 5,
        descricao: ''
    };
}

// Função para popular modal de edição de ingresso pago
// Função para popular modal de edição de ingresso pago
function populateEditPaidTicketModal(ticketData) {
    console.log('ðŸ”§ populateEditPaidTicketModal chamada - versão CORRIGIDA', ticketData);
    
    const editTicketId = document.getElementById('editTicketId');
    const editPaidTicketTitle = document.getElementById('editPaidTicketTitle');
    const editPaidTicketQuantity = document.getElementById('editPaidTicketQuantity');
    const editPaidTicketPrice = document.getElementById('editPaidTicketPrice');
    const editPaidTicketReceive = document.getElementById('editPaidTicketReceive');
    const editPaidSaleStart = document.getElementById('editPaidSaleStart');
    const editPaidSaleEnd = document.getElementById('editPaidSaleEnd');
    const editPaidMinQuantity = document.getElementById('editPaidMinQuantity');
    const editPaidMaxQuantity = document.getElementById('editPaidMaxQuantity');
    const editPaidTicketDescription = document.getElementById('editPaidTicketDescription');

    if (editTicketId) {
        editTicketId.value = ticketData.id;
        console.log('âœ… editTicketId definido:', ticketData.id);
    } else {
        console.error('âŒ editTicketId não encontrado');
    }
    
    if (editPaidTicketTitle) {
        editPaidTicketTitle.value = ticketData.titulo;
        console.log('âœ… editPaidTicketTitle definido:', ticketData.titulo);
    } else {
        console.error('âŒ editPaidTicketTitle não encontrado');
    }
    
    if (editPaidTicketQuantity) {
        editPaidTicketQuantity.value = ticketData.quantidade_total;
        console.log('âœ… editPaidTicketQuantity definido:', ticketData.quantidade_total);
    } else {
        console.error('âŒ editPaidTicketQuantity não encontrado');
    }
    
    if (editPaidTicketPrice) {
        editPaidTicketPrice.value = formatPrice(ticketData.preco);
        console.log('âœ… editPaidTicketPrice definido:', ticketData.preco);
    } else {
        console.error('âŒ editPaidTicketPrice não encontrado');
    }
    
    if (editPaidTicketReceive) {
        editPaidTicketReceive.value = formatPrice(ticketData.valor_receber || 0);
        console.log('âœ… editPaidTicketReceive definido:', ticketData.valor_receber);
    } else {
        console.error('âŒ editPaidTicketReceive não encontrado');
    }
    
    if (editPaidSaleStart) {
        editPaidSaleStart.value = ticketData.inicio_venda ? ticketData.inicio_venda.slice(0, 16) : '';
        console.log('âœ… editPaidSaleStart definido:', ticketData.inicio_venda);
    } else {
        console.error('âŒ editPaidSaleStart não encontrado');
    }
    
    if (editPaidSaleEnd) {
        editPaidSaleEnd.value = ticketData.fim_venda ? ticketData.fim_venda.slice(0, 16) : '';
        console.log('âœ… editPaidSaleEnd definido:', ticketData.fim_venda);
    } else {
        console.error('âŒ editPaidSaleEnd não encontrado');
    }
    
    if (editPaidMinQuantity) {
        editPaidMinQuantity.value = ticketData.limite_min || 1;
        console.log('âœ… editPaidMinQuantity definido:', ticketData.limite_min);
    } else {
        console.error('âŒ editPaidMinQuantity não encontrado');
    }
    
    if (editPaidMaxQuantity) {
        editPaidMaxQuantity.value = ticketData.limite_max || 5;
        console.log('âœ… editPaidMaxQuantity definido:', ticketData.limite_max);
    } else {
        console.error('âŒ editPaidMaxQuantity não encontrado');
    }
    
    if (editPaidTicketDescription) {
        editPaidTicketDescription.value = ticketData.descricao || '';
        console.log('âœ… editPaidTicketDescription definido:', ticketData.descricao);
    } else {
        console.error('âŒ editPaidTicketDescription não encontrado');
    }
}

// Função para popular modal de edição de ingresso gratuito
function populateEditFreeTicketModal(ticketData) {
    console.log('ðŸ”§ populateEditFreeTicketModal chamada - versão CORRIGIDA', ticketData);
    
    const editFreeTicketId = document.getElementById('editFreeTicketId');
    const editFreeTicketTitle = document.getElementById('editFreeTicketTitle');
    const editFreeTicketQuantity = document.getElementById('editFreeTicketQuantity');
    const editFreeSaleStart = document.getElementById('editFreeSaleStart');
    const editFreeSaleEnd = document.getElementById('editFreeSaleEnd');
    const editFreeMinLimit = document.getElementById('editFreeMinLimit');
    const editFreeMaxLimit = document.getElementById('editFreeMaxLimit');
    const editFreeTicketDescription = document.getElementById('editFreeTicketDescription');

    if (editFreeTicketId) {
        editFreeTicketId.value = ticketData.id;
        console.log('âœ… editFreeTicketId definido:', ticketData.id);
    } else {
        console.error('âŒ editFreeTicketId não encontrado');
    }
    
    if (editFreeTicketTitle) {
        editFreeTicketTitle.value = ticketData.titulo;
        console.log('âœ… editFreeTicketTitle definido:', ticketData.titulo);
    } else {
        console.error('âŒ editFreeTicketTitle não encontrado');
    }
    
    if (editFreeTicketQuantity) {
        editFreeTicketQuantity.value = ticketData.quantidade_total;
        console.log('âœ… editFreeTicketQuantity definido:', ticketData.quantidade_total);
    } else {
        console.error('âŒ editFreeTicketQuantity não encontrado');
    }
    
    if (editFreeSaleStart) {
        editFreeSaleStart.value = ticketData.inicio_venda ? ticketData.inicio_venda.slice(0, 16) : '';
        console.log('âœ… editFreeSaleStart definido:', ticketData.inicio_venda);
    } else {
        console.error('âŒ editFreeSaleStart não encontrado');
    }
    
    if (editFreeSaleEnd) {
        editFreeSaleEnd.value = ticketData.fim_venda ? ticketData.fim_venda.slice(0, 16) : '';
        console.log('âœ… editFreeSaleEnd definido:', ticketData.fim_venda);
    } else {
        console.error('âŒ editFreeSaleEnd não encontrado');
    }
    
    if (editFreeMinLimit) {
        editFreeMinLimit.value = ticketData.limite_min || 1;
        console.log('âœ… editFreeMinLimit definido:', ticketData.limite_min);
    } else {
        console.error('âŒ editFreeMinLimit não encontrado');
    }
    
    if (editFreeMaxLimit) {
        editFreeMaxLimit.value = ticketData.limite_max || 5;
        console.log('âœ… editFreeMaxLimit definido:', ticketData.limite_max);
    } else {
        console.error('âŒ editFreeMaxLimit não encontrado');
    }
    
    if (editFreeTicketDescription) {
        editFreeTicketDescription.value = ticketData.descricao || '';
        console.log('âœ… editFreeTicketDescription definido:', ticketData.descricao);
    } else {
        console.error('âŒ editFreeTicketDescription não encontrado');
    }
}

// Função para atualizar ingresso pago
function updatePaidTicket() {
    const ticketData = {
        id: document.getElementById('editTicketId').value,
        titulo: document.getElementById('editPaidTicketTitle').value,
        quantidade_total: parseInt(document.getElementById('editPaidTicketQuantity').value),
        preco: parseFloat(document.getElementById('editPaidTicketPrice').value.replace(/[R$\s.]/g, '').replace(',', '.')),
        inicio_venda: document.getElementById('editPaidSaleStart').value,
        fim_venda: document.getElementById('editPaidSaleEnd').value,
        limite_min: parseInt(document.getElementById('editPaidMinQuantity').value) || 1,
        limite_max: parseInt(document.getElementById('editPaidMaxQuantity').value) || 5,
        descricao: document.getElementById('editPaidTicketDescription').value
    };
    
    // ValidaçÃµes
    if (!ticketData.titulo || !ticketData.quantidade_total || !ticketData.preco) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateTicketInList(ticketData);
    
    // Fechar modal
    closeModal('editPaidTicketModal');
    
    console.log('âœ… Ingresso pago atualizado:', ticketData);
}

// Função para atualizar ingresso gratuito
function updateFreeTicket() {
    const ticketData = {
        id: document.getElementById('editFreeTicketId').value,
        titulo: document.getElementById('editFreeTicketTitle').value,
        quantidade_total: parseInt(document.getElementById('editFreeTicketQuantity').value),
        preco: 0,
        inicio_venda: document.getElementById('editFreeSaleStart').value,
        fim_venda: document.getElementById('editFreeSaleEnd').value,
        limite_min: parseInt(document.getElementById('editFreeMinLimit').value) || 1,
        limite_max: parseInt(document.getElementById('editFreeMaxLimit').value) || 5,
        descricao: document.getElementById('editFreeTicketDescription').value
    };
    
    // ValidaçÃµes
    if (!ticketData.titulo || !ticketData.quantidade_total) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateTicketInList(ticketData);
    
    // Fechar modal
    closeModal('editFreeTicketModal');
    
    console.log('âœ… Ingresso gratuito atualizado:', ticketData);
}

// Função para atualizar ingresso na lista
function updateTicketInList(ticketData) {
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketData.id}"]`);
    if (!ticketElement) return;
    
    // Atualizar título
    const titleElement = ticketElement.querySelector('.ticket-title');
    if (titleElement) {
        const badgeText = ticketData.preco > 0 ? 'Pago' : 'Gratuito';
        const badgeClass = ticketData.preco > 0 ? 'pago' : 'gratuito';
        titleElement.innerHTML = `
            ${ticketData.titulo}
            <span class="ticket-type-badge ${badgeClass}">${badgeText}</span>
        `;
    }
    
    // Atualizar detalhes
    const detailsElement = ticketElement.querySelector('.ticket-details');
    if (detailsElement) {
        let detailsHTML = `
            <div class="ticket-info">
                <span>Quantidade: <strong>${ticketData.quantidade_total}</strong></span>
        `;
        
        if (ticketData.preco > 0) {
            detailsHTML += `<span>Preço: <strong>R$ ${ticketData.preco.toFixed(2).replace('.', ',')}</strong></span>`;
        }
        
        detailsHTML += `
                <span>Vendas: ${formatDateForDisplay(ticketData.inicio_venda)} - ${formatDateForDisplay(ticketData.fim_venda)}</span>
            </div>
        `;
        
        if (ticketData.descricao) {
            detailsHTML += `
                <div class="ticket-description">
                    ${ticketData.descricao}
                </div>
            `;
        }
        
        detailsElement.innerHTML = detailsHTML;
    }
}

// Função para formatar data para exibição
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// Função para formatar preço
function formatPrice(value) {
    if (typeof value === 'number') {
        return 'R$ ' + value.toFixed(2).replace('.', ',');
    }
    return value || 'R$ 0,00';
}

// ==================== FUNÃ‡Ã•ES DE EDIÃ‡ÃƒO DE COMBOS ====================

// Função para editar combo existente
function editCombo(comboId) {
    console.log('ðŸ”§ Editando combo:', comboId);
    
    // Buscar os dados do combo na lista atual
    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
    if (!comboElement) {
        alert('Combo não encontrado');
        return;
    }
    
    // Extrair dados do elemento
    const comboData = extractComboDataFromElement(comboElement);
    
    // Popular modal de edição
    populateEditComboModal(comboData);
    
    // Abrir modal
    document.getElementById('editComboModal').style.display = 'flex';
    
    // Popular select de tipos de ingresso
    populateEditComboTicketSelect();
}

// Função para extrair dados do combo do elemento HTML
function extractComboDataFromElement(element) {
    const titleElement = element.querySelector('.ticket-title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    return {
        id: element.dataset.ticketId,
        titulo: title.replace(/\s+ðŸ“¦/, '').replace(/\s+(Combo)$/, ''),
        tipo: 'combo',
        // Estes dados virão do backend quando implementarmos a busca AJAX
        quantidade_total: 50,
        preco: 0,
        valor_receber: 0,
        inicio_venda: new Date().toISOString().slice(0, 16),
        fim_venda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        descricao: '',
        conteudo_combo: []
    };
}

// Função para popular modal de edição de combo
function populateEditComboModal(comboData) {
    document.getElementById('editComboId').value = comboData.id;
    document.getElementById('editComboTitle').value = comboData.titulo;
    document.getElementById('editComboQuantity').value = comboData.quantidade_total;
    document.getElementById('editComboPrice').value = formatPrice(comboData.preco);
    document.getElementById('editComboReceive').value = formatPrice(comboData.valor_receber);
    document.getElementById('editComboSaleStart').value = comboData.inicio_venda;
    document.getElementById('editComboSaleEnd').value = comboData.fim_venda;
    document.getElementById('editComboDescription').value = comboData.descricao || '';
    
    // Carregar itens do combo
    editComboItems = comboData.conteudo_combo || [];
    renderEditComboItems();
}

// Função para popular select de tipos de ingresso para edição de combo
function populateEditComboTicketSelect() {
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    // Buscar tipos de ingresso já existentes na página
    const ticketItems = document.querySelectorAll('#ticketList .ticket-item');
    
    if (ticketItems.length === 0) {
        select.innerHTML = '<option value="">Primeiro crie alguns tipos de ingresso</option>';
        return;
    }
    
    ticketItems.forEach((item, index) => {
        const ticketTitle = item.querySelector('.ticket-title')?.textContent?.trim();
        
        if (ticketTitle && !ticketTitle.includes('📦')) {
            const option = document.createElement('option');
            option.value = item.dataset.ticketId || index;
            option.textContent = ticketTitle.replace(/\s+(Gratuito|Pago|Código)$/, '');
            select.appendChild(option);
        }
    });
}

// Variável para itens do combo em edição
let editComboItems = [];

// Função para adicionar item ao combo em edição
function addItemToEditCombo() {
    const select = document.getElementById('editComboTicketTypeSelect');
    const quantityInput = document.getElementById('editComboItemQuantity');
    
    if (!select.value || !quantityInput.value) {
        alert('Selecione um tipo de ingresso e defina a quantidade.');
        return;
    }
    
    const ticketName = select.options[select.selectedIndex].textContent;
    const quantity = parseInt(quantityInput.value);
    
    // Verificar se já existe
    const existingIndex = editComboItems.findIndex(item => item.ticket_id === select.value);
    
    if (existingIndex !== -1) {
        // Atualizar quantidade
        editComboItems[existingIndex].quantidade = quantity;
    } else {
        // Adicionar novo item
        editComboItems.push({
            ticket_id: select.value,
            ticket_name: ticketName,
            quantidade: quantity
        });
    }
    
    // Renderizar lista
    renderEditComboItems();
    
    // Limpar formulário
    select.value = '';
    quantityInput.value = '';
}

// Função para renderizar itens do combo em edição
function renderEditComboItems() {
    const container = document.getElementById('editComboItemsList');
    if (!container) return;
    
    if (editComboItems.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum tipo de ingresso adicionado</p>';
        return;
    }
    
    container.innerHTML = editComboItems.map((item, index) => `
        <div class="combo-item">
            <div class="combo-item-info">
                <strong>${item.ticket_name}</strong>
                <span>Quantidade: ${item.quantidade}</span>
            </div>
            <button class="btn-icon btn-delete" onClick="removeEditComboItem(${index})" title="Remover">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Função para remover item do combo em edição
function removeEditComboItem(index) {
    editComboItems.splice(index, 1);
    renderEditComboItems();
}

// Função para atualizar combo
function updateComboTicket() {
    const comboData = {
        id: document.getElementById('editComboId').value,
        titulo: document.getElementById('editComboTitle').value,
        quantidade_total: parseInt(document.getElementById('editComboQuantity').value),
        preco: parseFloat(document.getElementById('editComboPrice').value.replace(/[R$\s.]/g, '').replace(',', '.')),
        inicio_venda: document.getElementById('editComboSaleStart').value,
        fim_venda: document.getElementById('editComboSaleEnd').value,
        descricao: document.getElementById('editComboDescription').value,
        conteudo_combo: editComboItems
    };
    
    // ValidaçÃµes
    if (!comboData.titulo || !comboData.quantidade_total || !comboData.preco) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    if (editComboItems.length === 0) {
        alert('Adicione pelo menos um tipo de ingresso ao combo');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateComboInList(comboData);
    
    // Fechar modal
    closeModal('editComboModal');
    
    console.log('âœ… Combo atualizado:', comboData);
}

// Função para atualizar combo na lista
function updateComboInList(comboData) {
    const comboElement = document.querySelector(`[data-ticket-id="${comboData.id}"]`);
    if (!comboElement) return;
    
    // Atualizar título
    const titleElement = comboElement.querySelector('.ticket-title');
    if (titleElement) {
        titleElement.innerHTML = `
            ${comboData.titulo} 📦
            <span class="ticket-type-badge combo">Combo</span>
        `;
    }
    
    // Atualizar detalhes
    const detailsElement = comboElement.querySelector('.ticket-details');
    if (detailsElement) {
        let detailsHTML = `
            <div class="ticket-info">
                <span>Quantidade: <strong>${comboData.quantidade_total}</strong></span>
                <span>Preço: <strong>R$ ${comboData.preco.toFixed(2).replace('.', ',')}</strong></span>
                <span>Vendas: ${formatDateForDisplay(comboData.inicio_venda)} - ${formatDateForDisplay(comboData.fim_venda)}</span>
            </div>
        `;
        
        if (comboData.descricao) {
            detailsHTML += `
                <div class="ticket-description">
                    ${comboData.descricao}
                </div>
            `;
        }
        
        // Mostrar itens do combo
        if (comboData.conteudo_combo && comboData.conteudo_combo.length > 0) {
            detailsHTML += `
                <div class="combo-items">
                    <strong>Inclui:</strong>
                    ${comboData.conteudo_combo.map(item => `${item.quantidade}x ${item.ticket_name}`).join(', ')}
                </div>
            `;
        }
        
        detailsElement.innerHTML = detailsHTML;
    }
}

// Função para fechar modal específico para edição
function closeEditModal() {
    const modals = ['editPaidTicketModal', 'editFreeTicketModal', 'editComboModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    });
}

console.log('✅ Funções de edição de ingressos carregadas');

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initTicketManagement();
        console.log('✅ Gestão de ingressos inicializada via DOMContentLoaded');
    });
} else {
    // DOM já está pronto
    initTicketManagement();
    console.log('✅ Gestão de ingressos inicializada diretamente');
}

// Expor funções e variáveis para escopo global
window.wizardState = {
    currentStep: currentStep,
    totalSteps: totalSteps
};

// Funções que precisam acessar currentStep
window.getCurrentStep = function() { return currentStep; };
window.setCurrentStep = function(step) { 
    currentStep = step; 
    window.wizardState.currentStep = step; 
};

window.nextStep = function() {
    console.log('nextStep chamado - currentStep:', currentStep);
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            window.wizardState.currentStep = currentStep;
            updateStepDisplay();
            console.log('✅ Avançou para step:', currentStep);
        }
    }
};

window.prevStep = function() {
    if (currentStep > 1) {
        currentStep--;
        window.wizardState.currentStep = currentStep;
        updateStepDisplay();
    }
};

window.goToStep = function(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        window.wizardState.currentStep = currentStep;
        updateStepDisplay();
    }
};

window.updateStepDisplay = updateStepDisplay;
window.validateStep = validateStep; = validateStep;
window.initMap = initMap;
window.createFreeTicket = createFreeTicket;
window.createPaidTicket = createPaidTicket; = validateStep;
window.editTicket = editTicket;
window.removeTicket = removeTicket;
window.openModal = openModal;
window.closeModal = closeModal;
window.addItemToCombo = addItemToCombo;
window.removeComboItem = removeComboItem;
window.createComboTicket = createComboTicket;
window.updateComboItemsList = updateComboItemsList;
window.getTrashIcon = getTrashIcon;
window.editCombo = editCombo;
window.saveWizardData = saveWizardData;
window.checkAndRestoreWizardData = checkAndRestoreWizardData;
window.deleteCookie = deleteCookie;
window.clearAllWizardData = clearAllWizardData;
window.addTicketToList = addTicketToList;
window.updatePreview = updatePreview;

})(); // Fechar escopo IIFE

// Verificar se as funções foram exportadas
console.log('criaevento.js carregado. nextStep disponível:', typeof window.nextStep);

// Função de debug para testar manualmente
window.debugWizardCookie = function() {
    console.log('=== DEBUG WIZARD COOKIE ===');
    console.log('Todos os cookies:', document.cookie);
    const wizardData = getCookie('eventoWizard');
    console.log('Cookie eventoWizard:', wizardData);
    if (wizardData) {
        try {
            const parsed = JSON.parse(wizardData);
            console.log('Dados parseados:', parsed);
        } catch(e) {
            console.error('Erro ao fazer parse:', e);
            console.log('Cookie corrompido! Use limparCookieCorrempido() para limpar.');
        }
    }
    console.log('customDialog disponível?', window.customDialog ? 'SIM' : 'NÃO');
    console.log('checkAndRestoreWizardData disponível?', window.checkAndRestoreWizardData ? 'SIM' : 'NÃO');
};

// Função para limpar cookie corrompido
window.limparCookieCorrempido = function() {
    console.log('Limpando cookie corrompido...');
    deleteCookie('eventoWizard');
    console.log('Cookie limpo! Recarregue a página e tente novamente.');
};

console.log('Para debugar, execute: debugWizardCookie()');
console.log('Para limpar cookie corrompido, execute: limparCookieCorrempido()');

// Adicionar salvamento automático ao mudar de step (APÓS funções serem expostas)
if (window.nextStep && window.saveWizardData) {
    const originalNextStep = window.nextStep;
    window.nextStep = function() {
        console.log('NextStep chamado - salvando dados do wizard');
        if (window.saveWizardData) {
            window.saveWizardData();
        }
        return originalNextStep.apply(this, arguments);
    };
    console.log('Override de nextStep configurado com sucesso');
} else {
    console.error('Não foi possível configurar override de nextStep - funções não encontradas');
}
