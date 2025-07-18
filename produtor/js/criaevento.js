    // VariÃ¡veis globais
// Escopo global para funÃ§Ãµes
(function() {
    'use strict';
    
    let currentStep = 1;
        const totalSteps = 7;
        let map;
        let geocoder;
        let marker;
        let autocompleteService;
        let placesService;
        let ticketCount = 1;
        let ticketCodes = {};

        // FunÃ§Ã£o para navegar entre steps
        function updateStepDisplay() {
            // Atualizar cards de conteÃºdo
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
            const validationMessage = document.getElementById(`validation-step-${stepNumber}`);
            let isValid = true;

            switch(stepNumber) {
                case 1:
                    const eventName = document.getElementById('eventName').value;
                    const classificationprevi = document.getElementById('classification').value;
					const categoryprevi = document.getElementById('category').value;
                    isValid = eventName.trim() !== '' && classificationprevi !== '' && categoryprevi !== '';
                    break;
                case 2:
                    const startDateTime = document.getElementById('startDateTime').value;
                    isValid = startDateTime !== '';
                    break;
                case 4:
                    const isPresential = document.getElementById('locationTypeSwitch').classList.contains('active');
                    if (isPresential) {
                        const addressSearch = document.getElementById('addressSearch').value;
						const venueNameprevi = document.getElementById('venueName').value;
                        isValid = addressSearch.trim() !== '' && venueNameprevi !== '';
                    } else {
                        const eventLink = document.getElementById('eventLink').value;
                        isValid = eventLink.trim() !== '';
                    }
                    break;
                case 7:
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

            return isValid;
        }

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

        async function publishEvent() {
            if (validateStep(currentStep)) {
                const publishBtn = document.querySelector('.btn-publish');
                publishBtn.textContent = 'Publicando evento...';
                publishBtn.disabled = true;
                
                // Chamar a funÃ§Ã£o de envio para API
                const sucesso = await enviarEventoParaAPI();
                
                if (!sucesso) {
                    publishBtn.textContent = 'âœ“ Publicar evento';
                    publishBtn.disabled = false;
                }
            }
        }

        // Modal functionality
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
                if (modalId === 'paidTicketModal') {
                    setTimeout(() => {
                        initPriceInput();
                    }, 100);
                } else if (modalId === 'comboTicketModal') {
                    setTimeout(() => {
                        initComboPriceInput();
                        populateComboTicketSelect();
                    }, 100);
                }
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        }

        // InicializaÃ§Ã£o do Google Maps
        function initMap() {
            console.log('ðŸ—ºï¸ Inicializando Google Maps...');
            
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.log('âŒ Elemento do mapa nÃ£o encontrado');
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
                mapElement.innerHTML = '<div class="map-loading">ðŸ—ºï¸ Mapa carregado - Pesquise um endereÃ§o acima</div>';
                
            } catch (error) {
                console.error('âŒ Erro ao inicializar Google Maps:', error);
                mapElement.innerHTML = '<div class="map-loading">âŒ Erro ao carregar o mapa</div>';
            }
        }

        // Todas as outras funÃ§Ãµes do arquivo original...
        // [Incluir todas as funÃ§Ãµes JavaScript do arquivo original aqui]

        // InicializaÃ§Ã£o quando DOM estiver pronto
        document.addEventListener('DOMContentLoaded', function() {
            console.log('ðŸš€ Inicializando Anysummit...');
            
            try {
                initImageUpload();
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
                
                console.log('âœ… Anysummit inicializado com sucesso');
                
                // Debug para combo
                const comboBtn = document.getElementById('addComboTicket');
                console.log('ðŸ” BotÃ£o combo encontrado:', comboBtn);
                if (comboBtn) {
                    console.log('âœ… Event listener adicionado ao botÃ£o combo');
                } else {
                    console.error('âŒ BotÃ£o combo NÃƒO encontrado!');
                }
                
            } catch (error) {
                console.error('âŒ Erro na inicializaÃ§Ã£o:', error);
            }
        });

        // [Incluir todas as demais funÃ§Ãµes JavaScript do arquivo original aqui]
        // Copie todas as funÃ§Ãµes do arquivo original, incluindo:
        // - initAddressSearch()
        // - searchAddresses()
        // - selectAddress()
        // - updatePreview()
        // - initImageUpload()
        // - initSwitches()
        // - createPaidTicket()
        // - createFreeTicket()
        // - createCodeTicket()
        // - FunÃ§Ãµes da API
        // etc...

        // FunÃ§Ã£o initImageUpload
        function initImageUpload() {
            const imageUpload = document.getElementById('imageUpload');
            const imagePreview = document.getElementById('imagePreview');
            const previewImage = document.getElementById('previewImage');

            if (!imageUpload || !previewImage) return;

            imageUpload.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (imagePreview) {
                            imagePreview.src = e.target.result;
                            imagePreview.style.display = 'block';
                        }
                        previewImage.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

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
                    document.execCommand(command, false, null);
                    updateEditorButtons();
                    richEditor.focus();
                });
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
                });
            }

            if (addFreeBtn) {
                addFreeBtn.addEventListener('click', function() {
                    openModal('freeTicketModal');
                });
            }

            if (addComboBtn) {
                addComboBtn.addEventListener('click', function() {
                    openModal('comboTicketModal');
                    populateComboTicketSelect();
                });
            }
        }

        function createPaidTicket() {
            const title = document.getElementById('paidTicketTitle')?.value;
            const quantity = document.getElementById('paidTicketQuantity')?.value;
            const price = document.getElementById('paidTicketPrice')?.value;
            const description = document.getElementById('paidTicketDescription')?.value || '';
            const saleStart = document.getElementById('paidSaleStart')?.value;
            const saleEnd = document.getElementById('paidSaleEnd')?.value;
            const minQuantity = document.getElementById('paidMinQuantity')?.value || 1;
            const maxQuantity = document.getElementById('paidMaxQuantity')?.value || 5;

            if (!title || !quantity || !price) {
                alert('Por favor, preencha todos os campos obrigatÃ³rios.');
                return;
            }

            // Verificar se estamos em modo de ediÃ§Ã£o (existe API) ou criaÃ§Ã£o
            if (window.location.pathname.includes('editar-evento.php')) {
                // Modo ediÃ§Ã£o - usar API
                const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const taxaPlataforma = cleanPrice * 0.1;
                const valorReceber = cleanPrice - taxaPlataforma;
                
                const eventoId = new URLSearchParams(window.location.search).get('eventoid');
                const data = {
                    evento_id: parseInt(eventoId),
                    tipo: 'pago',
                    titulo: title,
                    descricao: description,
                    quantidade_total: parseInt(quantity),
                    preco: cleanPrice,
                    taxa_plataforma: taxaPlataforma,
                    valor_receber: valorReceber,
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
                    console.error('âŒ Erro na requisiÃ§Ã£o:', error);
                    alert('Erro ao criar ingresso. Tente novamente.');
                });
            } else {
                // Modo criaÃ§Ã£o - usar sistema de ingressos temporÃ¡rios
                const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
                
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
                        parseInt(maxQuantity)
                    );
                } else {
                    // Fallback para funÃ§Ã£o antiga
                    addTicketToList('paid', title, quantity, price);
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

            if (!title || !quantity) {
                alert('Por favor, preencha todos os campos obrigatÃ³rios.');
                return;
            }

            // Verificar se estamos em modo de ediÃ§Ã£o (existe API)
            if (window.location.pathname.includes('editar-evento.php') && typeof fetch !== 'undefined') {
                // Modo ediÃ§Ã£o - usar API
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
                    console.error('âŒ Erro na requisiÃ§Ã£o:', error);
                    alert('Erro ao criar ingresso. Tente novamente.');
                });
            } else {
                // Modo criaÃ§Ã£o - usar sistema de ingressos temporÃ¡rios
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
                    // Fallback para funÃ§Ã£o antiga
                    addTicketToList('free', title, quantity, 'Gratuito');
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
            const category = document.getElementById('category')?.value;
            const venueName = document.getElementById('venueName')?.value;
            const eventLink = document.getElementById('eventLink')?.value;
            const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
            const description = document.getElementById('eventDescription')?.textContent || 'DescriÃ§Ã£o do evento aparecerÃ¡ aqui...';
            
            previewTitle.textContent = eventName;
           if (previewDescription) previewDescription.textContent = description.substring(0, 120);
            
            if (startDateTime && previewDate) {
                const dateObj = new Date(startDateTime);
                previewDate.textContent = dateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else if (previewDate) {
                previewDate.textContent = 'Data nÃ£o definida';
            }
            
            if (previewLocation) {
                if (isPresential) {
                    previewLocation.textContent = venueName || 'Local nÃ£o definido';
                } else {
                    previewLocation.textContent = eventLink || 'Link nÃ£o definido';
                }
            }

            if (previewType) {
                previewType.textContent = isPresential ? 'Presencial' : 'Online';
            }
            
            if (previewCategory) {
                const categoryEl = document.querySelector(`#category option[value="${category}"]`);
                const categoryText = categoryEl ? categoryEl.textContent : 'Categoria nÃ£o definida';
                previewCategory.textContent = categoryText;
            }
        }

        function initPreviewListeners() {
            const fields = ['eventName', 'startDateTime', 'category', 'venueName', 'eventLink'];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', updatePreview);
                    field.addEventListener('change', updatePreview);
                }
            });
        }

        // [Incluir todas as demais funÃ§Ãµes necessÃ¡rias do arquivo original]

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

        // [Incluir todas as funÃ§Ãµes da API do arquivo original]

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

        // [Incluir todas as demais funÃ§Ãµes necessÃ¡rias...]

        async function enviarEventoParaAPI() {
            try {
                console.log('ðŸš€ Enviando evento para PHP...');
                
                // DEBUG - verificar ingressos antes de coletar
                debugarDadosIngressos();
                
                // 1. Coletar dados (incluindo imagem base64)
                const dados = await coletarDadosFormulario();
                
                // 2. Validar
                const validacao = validarDadosObrigatorios(dados);
                if (!validacao.valido) {
                    alert('Erro de validaÃ§Ã£o:\n' + validacao.erros.join('\n'));
                    return false;
                }
                
                // 3. Debug - ver dados que serÃ£o enviados
                console.log('ðŸ“‹ Dados completos:', dados);
                console.log('ðŸ“‹ Ingressos especÃ­ficos:', dados.ingressos);
                
                // 4. Enviar TUDO para o PHP com configuraÃ§Ã£o correta
                const response = await fetch(API_CONFIG.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dados),
                    mode: 'cors'
                });
                
                // 5. Verificar se a resposta Ã© JSON vÃ¡lida
                let resultado;
                try {
                    resultado = await response.json();
                } catch (jsonError) {
                    const textResponse = await response.text();
                    console.error('âŒ Resposta nÃ£o Ã© JSON vÃ¡lida:', textResponse);
                    throw new Error('Resposta invÃ¡lida do servidor: ' + textResponse);
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
                erros.push('Nome do evento Ã© obrigatÃ³rio');
            }
            
            // Validar data de inÃ­cio
            if (!dados.evento.data_inicio) {
                erros.push('Data e hora de inÃ­cio sÃ£o obrigatÃ³rias');
            }
            
            // Validar localizaÃ§Ã£o
            if (dados.evento.tipo_local === 'presencial') {
                if (!dados.evento.busca_endereco || dados.evento.busca_endereco.trim() === '') {
                    erros.push('EndereÃ§o Ã© obrigatÃ³rio para eventos presenciais');
                }
            } else if (dados.evento.tipo_local === 'online') {
                if (!dados.evento.link_online || dados.evento.link_online.trim() === '') {
                    erros.push('Link do evento Ã© obrigatÃ³rio para eventos online');
                }
            }
            
            // Validar termos
            if (!dados.evento.termos_aceitos) {
                erros.push('Ã‰ necessÃ¡rio aceitar os termos de uso');
            }
            
            return {
                valido: erros.length === 0,
                erros: erros
            };
        }

        // =====================================================
        // COLETA DE DADOS DO FORMULÃRIO
        // =====================================================

        function obterImagemBase64() {
            return new Promise((resolve) => {
                const imagePreview = document.getElementById('imagePreview');
                
                // Se jÃ¡ tem preview, usar essa imagem
                if (imagePreview && imagePreview.src && imagePreview.style.display !== 'none') {
                    resolve(imagePreview.src);
                    return;
                }
                
                // SenÃ£o, tentar do input file
                const imageFile = document.getElementById('imageUpload')?.files[0];
                
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

        async function coletarDadosFormulario() {
            console.log('ðŸ“‹ Coletando dados do formulÃ¡rio...');
            
            // 1. INFORMAÃ‡Ã•ES BÃSICAS (incluindo imagem)
            const informacoesBasicas = {
                nome: document.getElementById('eventName')?.value || '',
                classificacao: document.getElementById('classification')?.value || '',
                categoria: document.getElementById('category')?.value || '',
                imagem_capa: await obterImagemBase64() // Aguardar base64
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
                busca_endereco: document.getElementById('addressSearch')?.value || '',
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
                
                // Verificar se Ã© combo
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
                    
                    // Extrair valor a receber (se jÃ¡ estiver calculado)
                    const receiveMatch = receivePriceText.match(/R\$\s*([\d,.]+)/);
                    if (receiveMatch) {
                        valorReceber = parseFloat(receiveMatch[1].replace(/\./g, '').replace(',', '.'));
                    }
                } else if (buyerPriceText.includes('cÃ³digo') || ticketName.toLowerCase().includes('cÃ³digo')) {
                    tipo = 'codigo';
                }
                
                // Verificar se estÃ¡ ativo
                const switchElement = item.querySelector('.switch-mini');
                const ativo = switchElement ? switchElement.classList.contains('active') : true;
                
                // Datas padrÃ£o (vocÃª pode melhorar isso coletando as datas reais dos modais)
                const agora = new Date();
                const inicioVenda = agora.toISOString().slice(0, 16);
                const fimVenda = new Date(agora.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16);
                
                const ingresso = {
                    tipo: tipo,
                    titulo: ticketName.replace(' ðŸ“¦', ''), // Remover emoji do combo
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
                
                console.log(`ðŸ“ Ingresso ${index + 1}:`, ingresso);
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
                // Redirecionar para pÃ¡gina de evento publicado
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
            // JÃ¡ estÃ¡ implementada no cÃ³digo acima, nÃ£o precisa duplicar
        }

        // =====================================================
        // FUNÃ‡Ã•ES DE BUSCA DE ENDEREÃ‡O
        // =====================================================

        function initAddressSearch() {
            const addressSearch = document.getElementById('addressSearch');
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (!addressSearch || !addressSuggestions) {
                console.log('âŒ Elementos de busca nÃ£o encontrados');
                return;
            }
            
            console.log('ðŸ” Inicializando busca de endereÃ§os...');
            
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

            console.log('âœ… Busca de endereÃ§os inicializada');
        }

        function searchAddresses(query) {
            console.log('ðŸ” Buscando endereÃ§os para:', query);
            
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
                        console.log('âš ï¸ Sem resultados da API, usando simulaÃ§Ã£o');
                        simulateAddressSearch(query);
                    }
                });
            } else {
                console.log('âš ï¸ Google Places API nÃ£o disponÃ­vel, usando simulaÃ§Ã£o');
                simulateAddressSearch(query);
            }
        }

        function simulateAddressSearch(query) {
            console.log('ðŸŽ­ Simulando busca para:', query);
            
            const mockResults = [
                {
                    description: `${query} - SÃ£o Paulo, SP, Brasil`,
                    place_id: 'mock_sp_' + Date.now(),
                    structured_formatting: {
                        main_text: query,
                        secondary_text: 'SÃ£o Paulo, SP, Brasil'
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
            console.log('ðŸ“ EndereÃ§o selecionado:', address.description);
            
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
                console.log('âš ï¸ API nÃ£o disponÃ­vel, usando simulaÃ§Ã£o');
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
                    console.log('âŒ Erro ao obter detalhes, usando simulaÃ§Ã£o');
                    fillMockAddressData('api_error');
                }
            });
        }

        function fillAddressFields(place) {
            console.log('ðŸ“ Preenchendo campos com dados da API');
            
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
                city: 'SÃ£o Paulo',
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
                console.log('âš ï¸ Mapa ou localizaÃ§Ã£o nÃ£o disponÃ­vel');
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

        function addTicketToList(type, title, quantity, price) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.ticketId = ticketCount; // Adicionar ID para ediÃ§Ã£o
            
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
                        <button class="btn-icon" onClick="editTicket(${ticketCount})" title="Editar">âœï¸</button>
                        <button class="btn-icon" onClick="removeTicket(${ticketCount})" title="Remover">ðŸ—‘ï¸</button>
                    </div>
                </div>
                <div class="ticket-details">
                    <div class="ticket-info">
                        <span>Quantidade: <strong>${quantity}</strong></span>
                        ${type === 'paid' ? `<span>PreÃ§o: <strong>${buyerPrice}</strong></span>` : ''}
                        <span>Taxa: <strong>${taxFormatted}</strong></span>
                        <span>VocÃª recebe: <strong>${receiveFormatted}</strong></span>
                    </div>
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            
            // Armazenar dados do ingresso para ediÃ§Ã£o
            ticketItem.ticketData = {
                type: type,
                title: title,
                quantity: quantity,
                price: type === 'paid' ? cleanPrice : 0
            };
        }

        function removeTicket(ticketId) {
            if (confirm('Tem certeza que deseja excluir este ingresso?')) {
                const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                if (ticketElement) {
                    ticketElement.remove();
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
                alert('Por favor, preencha todos os campos obrigatÃ³rios.');
                return;
            }

            if (quantity > 1000) {
                alert('MÃ¡ximo de 1000 cÃ³digos permitidos.');
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
                        <div class="ticket-buyer-price">Valor do comprador: <strong>Acesso via cÃ³digo</strong></div>
                        <div class="ticket-receive-amount">Tipo: <strong>CÃ³digos de acesso</strong></div>
                    </div>
                    <div class="ticket-actions-inline">
                        <div class="switch-mini active" title="Ativar/Desativar">
                            <div class="switch-mini-handle"></div>
                        </div>
                        <button class="btn-icon btn-codes" title="Listar CÃ³digos" onclick="openCodesModal('${ticketId}')">
                            ðŸ“‹
                        </button>                       
                        <button class="btn-icon btn-delete" title="Excluir" onclick="removeTicket(this)">
                            ðŸ—‘ï¸
                        </button>
                    </div>
                </div>
                <div class="ticket-details-list">
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">CÃ³digos Gerados</div>
                        <div class="ticket-detail-value">${quantity}</div>
                    </div>
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">CÃ³digos Usados</div>
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
                        <button class="btn btn-outline btn-small" onclick="copyIndividualCode('${codeData.code}')" title="Copiar cÃ³digo" style="margin-left: 8px; padding: 2px 6px; font-size: 0.7rem;">
                            ðŸ“‹
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
                            `<span class="status-unused">NÃ£o utilizado</span>`
                        }
                    </td>
                    <td>
                        <button class="btn btn-whatsapp btn-small" onclick="shareCodeWhatsApp('${codeData.code}', ${index})" title="Compartilhar via WhatsApp">
                            ðŸ“±
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="deleteCode(${index})" title="Apagar">
                            ðŸ—‘ï¸
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
            
            const message = `ðŸŽŸï¸ *Seu cÃ³digo de acesso*\n\n` +
                           `*Evento:* ${eventName}${dateText}\n\n` +
                           `*CÃ³digo:* \`${code}\`\n\n` +
                           `ðŸ“ Apresente este cÃ³digo no evento para ter acesso.\n\n` +
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
            console.log(`CÃ³digo ${index} foi encaminhado para: ${description}`);
        }

        function copyIndividualCode(code) {
            navigator.clipboard.writeText(code).then(() => {
                const notification = document.createElement('div');
                notification.textContent = 'CÃ³digo copiado!';
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
            if (confirm('Tem certeza que deseja apagar este cÃ³digo?')) {
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
                + "CÃ³digo,Email,Status\n"
                + codes.map(c => `${c.codigo},${c.email},${c.utilizado}`).join("\n");
            
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "codigos_ingresso.csv");
            link.click();
        }

        function copyAllCodes() {
            const codes = Array.from(document.querySelectorAll('.code-value')).map(el => el.textContent).join('\n');
            navigator.clipboard.writeText(codes).then(() => {
                alert('Todos os cÃ³digos foram copiados para a Ã¡rea de transferÃªncia!');
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
                console.log('ðŸ§ª Teste de conexÃ£o:', data);
                alert('ConexÃ£o OK: ' + JSON.stringify(data));
            })
            .catch(error => {
                console.error('ðŸ§ª Erro no teste:', error);
                alert('Erro na conexÃ£o: ' + error.message);
            });
        }

        // =====================================================
        // FUNÃ‡Ã•ES DO COMBO DE TIPOS DE INGRESSO
        // =====================================================

        let comboItems = [];

        function populateComboTicketSelect() {
            const select = document.getElementById('comboTicketTypeSelect');
            if (!select) return;
            
            // Limpar opÃ§Ãµes existentes
            select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
            
            // Buscar tipos de ingresso jÃ¡ criados na lista
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            if (ticketItems.length === 0) {
                select.innerHTML = '<option value="">Primeiro crie alguns tipos de ingresso</option>';
                return;
            }
            
            ticketItems.forEach((item, index) => {
                const ticketName = item.querySelector('.ticket-name')?.textContent?.trim();
                const buyerPrice = item.querySelector('.ticket-buyer-price')?.textContent;
                
                if (ticketName && !buyerPrice.includes('Combo')) {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = ticketName;
                    option.dataset.ticketData = JSON.stringify({
                        name: ticketName,
                        price: buyerPrice,
                        index: index
                    });
                    select.appendChild(option);
                }
            });
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
            
            // Verificar se jÃ¡ nÃ£o foi adicionado
            const existingItem = comboItems.find(item => item.index === ticketData.index);
            if (existingItem) {
                alert('Este tipo de ingresso jÃ¡ foi adicionado ao combo.');
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
                        <div style="font-size: 2rem; margin-bottom: 10px;">ðŸ“¦</div>
                        <div style="color: #8B95A7;">Adicione tipos de ingresso ao combo</div>
                        <div style="color: #8B95A7; font-size: 0.85rem;">Selecione os tipos jÃ¡ criados e defina quantidades</div>
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
                            ðŸ—‘ï¸
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
            console.log(`ðŸ“¦ Combo atualizado: ${comboItems.length} tipos, ${totalItems} itens totais`);
        }

        function createComboTicket() {
            const title = document.getElementById('comboTicketTitle')?.value;
            const quantity = document.getElementById('comboTicketQuantity')?.value;
            const price = document.getElementById('comboTicketPrice')?.value;
            const startDate = document.getElementById('comboSaleStart')?.value;
            const endDate = document.getElementById('comboSaleEnd')?.value;

            if (!title || !quantity || !price || !startDate || !endDate) {
                alert('Por favor, preencha todos os campos obrigatÃ³rios.');
                return;
            }

            if (comboItems.length === 0) {
                alert('Adicione pelo menos um tipo de ingresso ao combo.');
                return;
            }

            // Criar o combo
            const comboData = {
                tipo: 'combo',
                itens: comboItems.map(item => ({
                    ingresso_index: item.index,
                    quantidade: item.quantity,
                    nome: item.name
                }))
            };

            const totalItems = comboItems.reduce((sum, item) => sum + item.quantity, 0);
            const comboDescription = `Inclui: ${comboItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}`;

            addComboToList(title, quantity, price, comboData, totalItems, comboDescription);
            closeModal('comboTicketModal');
            clearComboForm();
        }

        function addComboToList(title, quantity, price, comboData, totalItems, description) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
            const tax = cleanPrice * 0.1;
            const receiveAmount = cleanPrice * 0.9;
            
            const taxFormatted = `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            const receiveFormatted = `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            
            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.ticketId = ticketCount;
            ticketItem.dataset.comboData = JSON.stringify(comboData);
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-title">
                        ${title} ðŸ“¦
                        <span class="ticket-type-badge combo">Combo</span>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onClick="editCombo(${ticketCount})" title="Editar Combo">âœï¸</button>
                        <button class="btn-icon" onClick="removeTicket(${ticketCount})" title="Remover">ðŸ—‘ï¸</button>
                    </div>
                </div>
                <div class="ticket-details">
                    <div class="ticket-info">
                        <span>Quantidade: <strong>${quantity}</strong></span>
                        <span>PreÃ§o: <strong>${price}</strong></span>
                        <span>Taxa: <strong>${taxFormatted}</strong></span>
                        <span>VocÃª recebe: <strong>${receiveFormatted}</strong></span>
                    </div>
                    ${description ? `<div class="ticket-description">${description}</div>` : ''}
                    <div class="combo-items">
                        <strong>Inclui:</strong>
                        ${comboData.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
                    </div>
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            
            // Armazenar dados do combo para ediÃ§Ã£o
            ticketItem.ticketData = {
                type: 'combo',
                title: title,
                quantity: quantity,
                price: cleanPrice,
                description: description,
                comboData: comboData
            };
        }

        function clearComboForm() {
            // Limpar campos do formulÃ¡rio
            document.getElementById('comboTicketTitle').value = '';
            document.getElementById('comboTicketQuantity').value = '';
            document.getElementById('comboTicketPrice').value = 'R$ 0,00';
            document.getElementById('comboTicketReceive').value = 'R$ 0,00';
            document.getElementById('comboSaleStart').value = '';
            document.getElementById('comboSaleEnd').value = '';
            document.getElementById('comboTicketDescription').value = '';
            
            // Limpar itens do combo
            comboItems = [];
            updateComboItemsList();
            updateComboSummary();
        }

        // Inicializar formataÃ§Ã£o de preÃ§o para combo
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

// FunÃ§Ã£o para editar ingresso existente
function editTicket(ticketId) {
    console.log('ðŸ”§ Editando ingresso:', ticketId);
    
    // Buscar os dados do ingresso na lista atual
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (!ticketElement) {
        alert('Ingresso nÃ£o encontrado');
        return;
    }
    
    // Extrair dados do elemento
    const ticketData = extractTicketDataFromElement(ticketElement);
    
    // Verificar se Ã© pago ou gratuito
    if (ticketData.tipo === 'pago') {
        populateEditPaidTicketModal(ticketData);
        document.getElementById('editPaidTicketModal').style.display = 'flex';
    } else {
        populateEditFreeTicketModal(ticketData);
        document.getElementById('editFreeTicketModal').style.display = 'flex';
    }
}

// FunÃ§Ã£o para extrair dados do ingresso do elemento HTML
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
        titulo: title.replace(/\s+(Gratuito|Pago|CÃ³digo)$/, ''),
        tipo: tipo,
        // Estes dados virÃ£o do backend quando implementarmos a busca AJAX
        quantidade_total: 100,
        preco: 0,
        inicio_venda: new Date().toISOString().slice(0, 16),
        fim_venda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        limite_min: 1,
        limite_max: 5,
        descricao: ''
    };
}

// FunÃ§Ã£o para popular modal de ediÃ§Ã£o de ingresso pago
// FunÃ§Ã£o para popular modal de ediÃ§Ã£o de ingresso pago
function populateEditPaidTicketModal(ticketData) {
    console.log('ðŸ”§ populateEditPaidTicketModal chamada - versÃ£o CORRIGIDA', ticketData);
    
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
        console.error('âŒ editTicketId nÃ£o encontrado');
    }
    
    if (editPaidTicketTitle) {
        editPaidTicketTitle.value = ticketData.titulo;
        console.log('âœ… editPaidTicketTitle definido:', ticketData.titulo);
    } else {
        console.error('âŒ editPaidTicketTitle nÃ£o encontrado');
    }
    
    if (editPaidTicketQuantity) {
        editPaidTicketQuantity.value = ticketData.quantidade_total;
        console.log('âœ… editPaidTicketQuantity definido:', ticketData.quantidade_total);
    } else {
        console.error('âŒ editPaidTicketQuantity nÃ£o encontrado');
    }
    
    if (editPaidTicketPrice) {
        editPaidTicketPrice.value = formatPrice(ticketData.preco);
        console.log('âœ… editPaidTicketPrice definido:', ticketData.preco);
    } else {
        console.error('âŒ editPaidTicketPrice nÃ£o encontrado');
    }
    
    if (editPaidTicketReceive) {
        editPaidTicketReceive.value = formatPrice(ticketData.valor_receber || 0);
        console.log('âœ… editPaidTicketReceive definido:', ticketData.valor_receber);
    } else {
        console.error('âŒ editPaidTicketReceive nÃ£o encontrado');
    }
    
    if (editPaidSaleStart) {
        editPaidSaleStart.value = ticketData.inicio_venda ? ticketData.inicio_venda.slice(0, 16) : '';
        console.log('âœ… editPaidSaleStart definido:', ticketData.inicio_venda);
    } else {
        console.error('âŒ editPaidSaleStart nÃ£o encontrado');
    }
    
    if (editPaidSaleEnd) {
        editPaidSaleEnd.value = ticketData.fim_venda ? ticketData.fim_venda.slice(0, 16) : '';
        console.log('âœ… editPaidSaleEnd definido:', ticketData.fim_venda);
    } else {
        console.error('âŒ editPaidSaleEnd nÃ£o encontrado');
    }
    
    if (editPaidMinQuantity) {
        editPaidMinQuantity.value = ticketData.limite_min || 1;
        console.log('âœ… editPaidMinQuantity definido:', ticketData.limite_min);
    } else {
        console.error('âŒ editPaidMinQuantity nÃ£o encontrado');
    }
    
    if (editPaidMaxQuantity) {
        editPaidMaxQuantity.value = ticketData.limite_max || 5;
        console.log('âœ… editPaidMaxQuantity definido:', ticketData.limite_max);
    } else {
        console.error('âŒ editPaidMaxQuantity nÃ£o encontrado');
    }
    
    if (editPaidTicketDescription) {
        editPaidTicketDescription.value = ticketData.descricao || '';
        console.log('âœ… editPaidTicketDescription definido:', ticketData.descricao);
    } else {
        console.error('âŒ editPaidTicketDescription nÃ£o encontrado');
    }
}

// FunÃ§Ã£o para popular modal de ediÃ§Ã£o de ingresso gratuito
function populateEditFreeTicketModal(ticketData) {
    console.log('ðŸ”§ populateEditFreeTicketModal chamada - versÃ£o CORRIGIDA', ticketData);
    
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
        console.error('âŒ editFreeTicketId nÃ£o encontrado');
    }
    
    if (editFreeTicketTitle) {
        editFreeTicketTitle.value = ticketData.titulo;
        console.log('âœ… editFreeTicketTitle definido:', ticketData.titulo);
    } else {
        console.error('âŒ editFreeTicketTitle nÃ£o encontrado');
    }
    
    if (editFreeTicketQuantity) {
        editFreeTicketQuantity.value = ticketData.quantidade_total;
        console.log('âœ… editFreeTicketQuantity definido:', ticketData.quantidade_total);
    } else {
        console.error('âŒ editFreeTicketQuantity nÃ£o encontrado');
    }
    
    if (editFreeSaleStart) {
        editFreeSaleStart.value = ticketData.inicio_venda ? ticketData.inicio_venda.slice(0, 16) : '';
        console.log('âœ… editFreeSaleStart definido:', ticketData.inicio_venda);
    } else {
        console.error('âŒ editFreeSaleStart nÃ£o encontrado');
    }
    
    if (editFreeSaleEnd) {
        editFreeSaleEnd.value = ticketData.fim_venda ? ticketData.fim_venda.slice(0, 16) : '';
        console.log('âœ… editFreeSaleEnd definido:', ticketData.fim_venda);
    } else {
        console.error('âŒ editFreeSaleEnd nÃ£o encontrado');
    }
    
    if (editFreeMinLimit) {
        editFreeMinLimit.value = ticketData.limite_min || 1;
        console.log('âœ… editFreeMinLimit definido:', ticketData.limite_min);
    } else {
        console.error('âŒ editFreeMinLimit nÃ£o encontrado');
    }
    
    if (editFreeMaxLimit) {
        editFreeMaxLimit.value = ticketData.limite_max || 5;
        console.log('âœ… editFreeMaxLimit definido:', ticketData.limite_max);
    } else {
        console.error('âŒ editFreeMaxLimit nÃ£o encontrado');
    }
    
    if (editFreeTicketDescription) {
        editFreeTicketDescription.value = ticketData.descricao || '';
        console.log('âœ… editFreeTicketDescription definido:', ticketData.descricao);
    } else {
        console.error('âŒ editFreeTicketDescription nÃ£o encontrado');
    }
}

// FunÃ§Ã£o para atualizar ingresso pago
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
    
    // ValidaÃ§Ãµes
    if (!ticketData.titulo || !ticketData.quantidade_total || !ticketData.preco) {
        alert('Por favor, preencha todos os campos obrigatÃ³rios');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateTicketInList(ticketData);
    
    // Fechar modal
    closeModal('editPaidTicketModal');
    
    console.log('âœ… Ingresso pago atualizado:', ticketData);
}

// FunÃ§Ã£o para atualizar ingresso gratuito
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
    
    // ValidaÃ§Ãµes
    if (!ticketData.titulo || !ticketData.quantidade_total) {
        alert('Por favor, preencha todos os campos obrigatÃ³rios');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateTicketInList(ticketData);
    
    // Fechar modal
    closeModal('editFreeTicketModal');
    
    console.log('âœ… Ingresso gratuito atualizado:', ticketData);
}

// FunÃ§Ã£o para atualizar ingresso na lista
function updateTicketInList(ticketData) {
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketData.id}"]`);
    if (!ticketElement) return;
    
    // Atualizar tÃ­tulo
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
            detailsHTML += `<span>PreÃ§o: <strong>R$ ${ticketData.preco.toFixed(2).replace('.', ',')}</strong></span>`;
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

// FunÃ§Ã£o para formatar data para exibiÃ§Ã£o
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// FunÃ§Ã£o para formatar preÃ§o
function formatPrice(value) {
    if (typeof value === 'number') {
        return 'R$ ' + value.toFixed(2).replace('.', ',');
    }
    return value || 'R$ 0,00';
}

// ==================== FUNÃ‡Ã•ES DE EDIÃ‡ÃƒO DE COMBOS ====================

// FunÃ§Ã£o para editar combo existente
function editCombo(comboId) {
    console.log('ðŸ”§ Editando combo:', comboId);
    
    // Buscar os dados do combo na lista atual
    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
    if (!comboElement) {
        alert('Combo nÃ£o encontrado');
        return;
    }
    
    // Extrair dados do elemento
    const comboData = extractComboDataFromElement(comboElement);
    
    // Popular modal de ediÃ§Ã£o
    populateEditComboModal(comboData);
    
    // Abrir modal
    document.getElementById('editComboModal').style.display = 'flex';
    
    // Popular select de tipos de ingresso
    populateEditComboTicketSelect();
}

// FunÃ§Ã£o para extrair dados do combo do elemento HTML
function extractComboDataFromElement(element) {
    const titleElement = element.querySelector('.ticket-title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    return {
        id: element.dataset.ticketId,
        titulo: title.replace(/\s+ðŸ“¦/, '').replace(/\s+(Combo)$/, ''),
        tipo: 'combo',
        // Estes dados virÃ£o do backend quando implementarmos a busca AJAX
        quantidade_total: 50,
        preco: 0,
        valor_receber: 0,
        inicio_venda: new Date().toISOString().slice(0, 16),
        fim_venda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        descricao: '',
        conteudo_combo: []
    };
}

// FunÃ§Ã£o para popular modal de ediÃ§Ã£o de combo
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

// FunÃ§Ã£o para popular select de tipos de ingresso para ediÃ§Ã£o de combo
function populateEditComboTicketSelect() {
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    // Buscar tipos de ingresso jÃ¡ existentes na pÃ¡gina
    const ticketItems = document.querySelectorAll('#ticketList .ticket-item');
    
    if (ticketItems.length === 0) {
        select.innerHTML = '<option value="">Primeiro crie alguns tipos de ingresso</option>';
        return;
    }
    
    ticketItems.forEach((item, index) => {
        const ticketTitle = item.querySelector('.ticket-title')?.textContent?.trim();
        
        if (ticketTitle && !ticketTitle.includes('ðŸ“¦')) {
            const option = document.createElement('option');
            option.value = item.dataset.ticketId || index;
            option.textContent = ticketTitle.replace(/\s+(Gratuito|Pago|CÃ³digo)$/, '');
            select.appendChild(option);
        }
    });
}

// VariÃ¡vel para itens do combo em ediÃ§Ã£o
let editComboItems = [];

// FunÃ§Ã£o para adicionar item ao combo em ediÃ§Ã£o
function addItemToEditCombo() {
    const select = document.getElementById('editComboTicketTypeSelect');
    const quantityInput = document.getElementById('editComboItemQuantity');
    
    if (!select.value || !quantityInput.value) {
        alert('Selecione um tipo de ingresso e defina a quantidade.');
        return;
    }
    
    const ticketName = select.options[select.selectedIndex].textContent;
    const quantity = parseInt(quantityInput.value);
    
    // Verificar se jÃ¡ existe
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
    
    // Limpar formulÃ¡rio
    select.value = '';
    quantityInput.value = '';
}

// FunÃ§Ã£o para renderizar itens do combo em ediÃ§Ã£o
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
            <button class="btn-icon" onClick="removeEditComboItem(${index})" title="Remover">ðŸ—‘ï¸</button>
        </div>
    `).join('');
}

// FunÃ§Ã£o para remover item do combo em ediÃ§Ã£o
function removeEditComboItem(index) {
    editComboItems.splice(index, 1);
    renderEditComboItems();
}

// FunÃ§Ã£o para atualizar combo
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
    
    // ValidaÃ§Ãµes
    if (!comboData.titulo || !comboData.quantidade_total || !comboData.preco) {
        alert('Por favor, preencha todos os campos obrigatÃ³rios');
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

// FunÃ§Ã£o para atualizar combo na lista
function updateComboInList(comboData) {
    const comboElement = document.querySelector(`[data-ticket-id="${comboData.id}"]`);
    if (!comboElement) return;
    
    // Atualizar tÃ­tulo
    const titleElement = comboElement.querySelector('.ticket-title');
    if (titleElement) {
        titleElement.innerHTML = `
            ${comboData.titulo} ðŸ“¦
            <span class="ticket-type-badge combo">Combo</span>
        `;
    }
    
    // Atualizar detalhes
    const detailsElement = comboElement.querySelector('.ticket-details');
    if (detailsElement) {
        let detailsHTML = `
            <div class="ticket-info">
                <span>Quantidade: <strong>${comboData.quantidade_total}</strong></span>
                <span>PreÃ§o: <strong>R$ ${comboData.preco.toFixed(2).replace('.', ',')}</strong></span>
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

// FunÃ§Ã£o para fechar modal especÃ­fico para ediÃ§Ã£o
function closeEditModal() {
    const modals = ['editPaidTicketModal', 'editFreeTicketModal', 'editComboModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    });
}

console.log('âœ… FunÃ§Ãµes de ediÃ§Ã£o de ingressos carregadas');

// Expor funÃ§Ãµes para escopo global
window.nextStep = nextStep;
window.prevStep = prevStep;
window.initMap = initMap;
window.createFreeTicket = createFreeTicket;
window.createPaidTicket = createPaidTicket;
window.validateStep = validateStep;
window.editTicket = editTicket;
window.removeTicket = removeTicket;
window.openModal = openModal;
window.closeModal = closeModal;

})(); // Fechar escopo IIFE
