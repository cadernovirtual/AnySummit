    // Variáveis globais
        let currentStep = 1;
        const totalSteps = 7;
        let map;
        let geocoder;
        let marker;
        let autocompleteService;
        let placesService;
        let ticketCount = 1;
        let ticketCodes = {};

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
                
                // Chamar a função de envio para API
                const sucesso = await enviarEventoParaAPI();
                
                if (!sucesso) {
                    publishBtn.textContent = '✓ Publicar evento';
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
                }
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
            }
        }

        // Inicialização do Google Maps
        function initMap() {
            console.log('🗺️ Inicializando Google Maps...');
            
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.log('❌ Elemento do mapa não encontrado');
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

                console.log('✅ Google Maps inicializado com sucesso');
                mapElement.innerHTML = '<div class="map-loading">🗺️ Mapa carregado - Pesquise um endereço acima</div>';
                
            } catch (error) {
                console.error('❌ Erro ao inicializar Google Maps:', error);
                mapElement.innerHTML = '<div class="map-loading">❌ Erro ao carregar o mapa</div>';
            }
        }

        // Todas as outras funções do arquivo original...
        // [Incluir todas as funções JavaScript do arquivo original aqui]

        // Inicialização quando DOM estiver pronto
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Inicializando Anysummit...');
            
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
                
                console.log('✅ Anysummit inicializado com sucesso');
            } catch (error) {
                console.error('❌ Erro na inicialização:', error);
            }
        });

        // [Incluir todas as demais funções JavaScript do arquivo original aqui]
        // Copie todas as funções do arquivo original, incluindo:
        // - initAddressSearch()
        // - searchAddresses()
        // - selectAddress()
        // - updatePreview()
        // - initImageUpload()
        // - initSwitches()
        // - createPaidTicket()
        // - createFreeTicket()
        // - createCodeTicket()
        // - Funções da API
        // etc...

        // Função initImageUpload
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
        }

        function createPaidTicket() {
            const title = document.getElementById('paidTicketTitle')?.value;
            const quantity = document.getElementById('paidTicketQuantity')?.value;
            const price = document.getElementById('paidTicketPrice')?.value;

            if (!title || !quantity || !price) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            addTicketToList('paid', title, quantity, price);
            closeModal('paidTicketModal');
        }

        function createFreeTicket() {
            const title = document.getElementById('freeTicketTitle')?.value;
            const quantity = document.getElementById('freeTicketQuantity')?.value;

            if (!title || !quantity) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            addTicketToList('free', title, quantity, 'Gratuito');
            closeModal('freeTicketModal');
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
            const description = document.getElementById('eventDescription')?.textContent || 'Descrição do evento aparecerá aqui...';
            
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
                previewDate.textContent = 'Data não definida';
            }
            
            if (previewLocation) {
                if (isPresential) {
                    previewLocation.textContent = venueName || 'Local não definido';
                } else {
                    previewLocation.textContent = eventLink || 'Link não definido';
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

        // [Incluir todas as demais funções necessárias do arquivo original]

        window.initMap = initMap;

        // =====================================================
        // CONFIGURAÇÃO PARA API PHP - ANYSUMMIT
        // =====================================================

        const API_CONFIG = {
            baseUrl: 'https://anysummit1.websiteseguro.com/criaeventoapi.php',
            endpoints: {
                createEvent: '',
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // [Incluir todas as funções da API do arquivo original]

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

        // [Incluir todas as demais funções necessárias...]

        async function enviarEventoParaAPI() {
            try {
                console.log('🚀 Enviando evento para PHP...');
                
                // DEBUG - verificar ingressos antes de coletar
                debugarDadosIngressos();
                
                // 1. Coletar dados (incluindo imagem base64)
                const dados = await coletarDadosFormulario();
                
                // 2. Validar
                const validacao = validarDadosObrigatorios(dados);
                if (!validacao.valido) {
                    alert('Erro de validação:\n' + validacao.erros.join('\n'));
                    return false;
                }
                
                // 3. Debug - ver dados que serão enviados
                console.log('📋 Dados completos:', dados);
                console.log('📋 Ingressos específicos:', dados.ingressos);
                
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
                    console.error('❌ Resposta não é JSON válida:', textResponse);
                    throw new Error('Resposta inválida do servidor: ' + textResponse);
                }
                
                // 6. Processar resposta
                if (!response.ok || !resultado.success) {
                    throw new Error(resultado.message || `Erro HTTP: ${response.status}`);
                }
                
                console.log('✅ Sucesso:', resultado);
                mostrarSucesso(resultado.data);
                return true;
                
            } catch (error) {
                console.error('❌ Erro completo:', error);
                mostrarErro(error.message);
                return false;
            }
        }

        // =====================================================
        // VALIDAÇÃO DE DADOS
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
                erros.push('É necessário aceitar os termos de uso');
            }
            
            return {
                valido: erros.length === 0,
                erros: erros
            };
        }

        // =====================================================
        // COLETA DE DADOS DO FORMULÁRIO
        // =====================================================

        function obterImagemBase64() {
            return new Promise((resolve) => {
                const imagePreview = document.getElementById('imagePreview');
                
                // Se já tem preview, usar essa imagem
                if (imagePreview && imagePreview.src && imagePreview.style.display !== 'none') {
                    resolve(imagePreview.src);
                    return;
                }
                
                // Senão, tentar do input file
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
            console.log('📋 Coletando dados do formulário...');
            
            // 1. INFORMAÇÕES BÁSICAS (incluindo imagem)
            const informacoesBasicas = {
                nome: document.getElementById('eventName')?.value || '',
                classificacao: document.getElementById('classification')?.value || '',
                categoria: document.getElementById('category')?.value || '',
                imagem_capa: await obterImagemBase64() // Aguardar base64
            };
            
            // 2. DATA E HORÁRIO
            const dataHorario = {
                data_inicio: document.getElementById('startDateTime')?.value || '',
                data_fim: document.getElementById('endDateTime')?.value || '',
                evento_multiplos_dias: document.getElementById('multiDaySwitch')?.classList.contains('active') || false
            };
            
            // 3. DESCRIÇÃO
            const descricao = {
                descricao_completa: document.getElementById('eventDescription')?.innerHTML || '',
                descricao_texto: document.getElementById('eventDescription')?.textContent || ''
            };
            
            // 4. LOCALIZAÇÃO
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
            
            // 6. CONFIGURAÇÕES FINAIS
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
            
            console.log('✅ Dados coletados para PHP:', dadosCompletos);
            return dadosCompletos;
        }

        function coletarDadosIngressos() {
            const ingressos = [];
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            console.log('🎟️ Coletando', ticketItems.length, 'ingressos...');
            
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
                
                if (buyerPriceText.includes('R$')) {
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
                
                // Datas padrão (você pode melhorar isso coletando as datas reais dos modais)
                const agora = new Date();
                const inicioVenda = agora.toISOString().slice(0, 16);
                const fimVenda = new Date(agora.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16);
                
                const ingresso = {
                    tipo: tipo,
                    titulo: ticketName,
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
                
                console.log(`📝 Ingresso ${index + 1}:`, ingresso);
                ingressos.push(ingresso);
            });
            
            console.log('✅ Total de ingressos coletados:', ingressos.length);
            return ingressos;
        }

        function debugarDadosIngressos() {
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            console.log('🔍 DEBUG - Elementos encontrados:', ticketItems.length);
            
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
                publishBtn.textContent = '✅ Evento Criado!';
                publishBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            }

            const eventoId = dados?.evento_id || dados?.id || 'N/A';
            const mensagem = dados?.message || 'Evento registrado.';

            criarNotificacao(
                '🎉 Evento criado com sucesso!',
                `ID do evento: ${eventoId}<br>${mensagem}`,
                'success'
            );

            setTimeout(() => {
                const opcoes = confirm(
                    'Evento criado com sucesso!\n\n' +
                    'Clique OK para criar outro evento\n' +
                    'Clique Cancelar para permanecer nesta página'
                );

                if (opcoes) {
                    window.location.reload();
                }
            }, 2000);
        }

        function mostrarErro(mensagem) {
            const publishBtn = document.querySelector('.btn-publish');
            if (publishBtn) {
                publishBtn.textContent = '✓ Publicar evento';
                publishBtn.disabled = false;
                publishBtn.style.background = '';
            }
            
            criarNotificacao(
                '❌ Erro ao criar evento',
                mensagem,
                'error'
            );
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // =====================================================
        // INICIALIZAÇÃO DO FORMULÁRIO
        // =====================================================

        function initFormSubmission() {
            // Já está implementada no código acima, não precisa duplicar
        }

        // =====================================================
        // FUNÇÕES DE BUSCA DE ENDEREÇO
        // =====================================================

        function initAddressSearch() {
            const addressSearch = document.getElementById('addressSearch');
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (!addressSearch || !addressSuggestions) {
                console.log('❌ Elementos de busca não encontrados');
                return;
            }
            
            console.log('🔍 Inicializando busca de endereços...');
            
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

            console.log('✅ Busca de endereços inicializada');
        }

        function searchAddresses(query) {
            console.log('🔍 Buscando endereços para:', query);
            
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (typeof google !== 'undefined' && google.maps && google.maps.places && autocompleteService) {
                console.log('🌐 Usando Google Places API...');
                
                const request = {
                    input: query,
                    componentRestrictions: { country: 'br' },
                    types: ['establishment', 'geocode']
                };

                autocompleteService.getPlacePredictions(request, function(predictions, status) {
                    console.log('📡 Resposta da API:', status, predictions?.length || 0, 'resultados');
                    
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                        displayAddressSuggestions(predictions);
                    } else {
                        console.log('⚠️ Sem resultados da API, usando simulação');
                        simulateAddressSearch(query);
                    }
                });
            } else {
                console.log('⚠️ Google Places API não disponível, usando simulação');
                simulateAddressSearch(query);
            }
        }

        function simulateAddressSearch(query) {
            console.log('🎭 Simulando busca para:', query);
            
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
            
            console.log('📋 Exibindo', results.length, 'sugestões');
            
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
            console.log('📍 Endereço selecionado:', address.description);
            
            const addressSearch = document.getElementById('addressSearch');
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (addressSearch) {
                addressSearch.value = address.description;
            }
            if (addressSuggestions) {
                addressSuggestions.style.display = 'none';
            }
            
            if (address.place_id.startsWith('mock_')) {
                console.log('🎭 Usando dados simulados');
                fillMockAddressData(address.place_id);
            } else if (typeof google !== 'undefined' && google.maps && placesService) {
                console.log('🌐 Buscando detalhes na API...');
                getPlaceDetails(address.place_id);
            } else {
                console.log('⚠️ API não disponível, usando simulação');
                fillMockAddressData('mock_default');
            }
        }

        function getPlaceDetails(placeId) {
            const request = {
                placeId: placeId,
                fields: ['address_components', 'geometry', 'name']
            };

            placesService.getDetails(request, function(place, status) {
                console.log('📡 Detalhes do local:', status, place);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    fillAddressFields(place);
                    updateMapLocation(place.geometry.location);
                } else {
                    console.log('❌ Erro ao obter detalhes, usando simulação');
                    fillMockAddressData('api_error');
                }
            });
        }

        function fillAddressFields(place) {
            console.log('📝 Preenchendo campos com dados da API');
            
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
            console.log('🎭 Preenchendo com dados simulados:', mockType);
            
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
                    street: 'Avenida Atlântica',
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
            console.log('✏️ Atualizando campos:', fields);
            
            Object.keys(fields).forEach(key => {
                const field = document.getElementById(key);
                if (field && fields[key]) {
                    field.value = fields[key];
                    console.log(`  ✅ ${key}: ${fields[key]}`);
                }
            });

            updatePreview();
        }

        function updateMapLocation(location) {
            if (!map || !location) {
                console.log('⚠️ Mapa ou localização não disponível');
                return;
            }


            console.log('🗺️ Atualizando mapa:', location);

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

            console.log('✅ Mapa atualizado com sucesso');
        }

        // =====================================================
        // FUNÇÕES DE INGRESSOS
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
            
            const buyerPrice = type === 'paid' ? price : 'Gratuito';
            const cleanPrice = type === 'paid' ? parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.')) : 0;
            const tax = type === 'paid' ? cleanPrice * 0.1 : 0;
            const receiveAmount = type === 'paid' ? cleanPrice * 0.9 : 0;
            
            const taxFormatted = type === 'paid' ? `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'R$ 0,00';
            const receiveFormatted = type === 'paid' ? `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Gratuito';
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${title}</div>
                        <div class="ticket-buyer-price">Valor do comprador: <strong>${buyerPrice}</strong></div>
                        <div class="ticket-receive-amount">Você recebe: <strong>${receiveFormatted}</strong></div>
                    </div>
                    <div class="ticket-actions-inline">
                        <div class="switch-mini active" title="Ativar/Desativar">
                            <div class="switch-mini-handle"></div>
                        </div>
                        <button class="btn-icon btn-delete" title="Excluir" onclick="removeTicket(this)">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="ticket-details-list">
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">Quantidade</div>
                        <div class="ticket-detail-value">${quantity}</div>
                    </div>
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">Taxa</div>
                        <div class="ticket-detail-value">${taxFormatted}</div>
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

        function removeTicket(button) {
            if (confirm('Tem certeza que deseja excluir este ingresso?')) {
                const ticketItem = button.closest('.ticket-item');
                ticketItem.remove();
            }
        }

        // =====================================================
        // FUNÇÕES DE CÓDIGO
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
                            📋
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
                dateText = `\n📅 Data: ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
            }
            
            const message = `🎟️ *Seu código de acesso*\n\n` +
                           `*Evento:* ${eventName}${dateText}\n\n` +
                           `*Código:* \`${code}\`\n\n` +
                           `📝 Apresente este código no evento para ter acesso.\n\n` +
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
                alert('Todos os códigos foram copiados para a área de transferência!');
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
        // TESTE DE CONEXÃO
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
                console.log('🧪 Teste de conexão:', data);
                alert('Conexão OK: ' + JSON.stringify(data));
            })
            .catch(error => {
                console.error('🧪 Erro no teste:', error);
                alert('Erro na conexão: ' + error.message);
            });
        }