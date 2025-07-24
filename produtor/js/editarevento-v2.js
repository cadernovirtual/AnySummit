// Editor de evento - versão simplificada
var currentStep = 1;
var totalSteps = 7;

// Função nextStep
function nextStep() {
    console.log('nextStep chamado, step atual:', currentStep);
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        updateProgress();
    }
}

// Função prevStep  
function prevStep() {
    console.log('prevStep chamado, step atual:', currentStep);
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

// Mostrar step
function showStep(step) {
    console.log('Mostrando step:', step);
    
    // Ocultar todos
    var allSteps = document.querySelectorAll('.section-card');
    for (var i = 0; i < allSteps.length; i++) {
        allSteps[i].classList.remove('active');
    }
    
    // Mostrar step atual
    var currentStepEl = document.querySelector('[data-step-content="' + step + '"]');
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
    
    updateStepIndicators();
    
    // Configurar funcionalidades específicas do step
    if (step === 6) {
        console.log('Configurando step 6 - Produtor');
        setupProducerFields();
    }
}

// Configurar campos do produtor (função separada)
function setupProducerFields() {
    var producerSelect = document.getElementById('producer');
    var newProducerFields = document.getElementById('newProducerFields');
    
    console.log('Configurando produtor - Select encontrado:', producerSelect);
    console.log('Configurando produtor - Campos encontrados:', newProducerFields);
    
    if (producerSelect && newProducerFields) {
        // Função para atualizar visibilidade
        function updateProducerFields() {
            const value = producerSelect.value;
            console.log('Atualizando campos para valor:', value);
            
            if (value === 'new') {
                newProducerFields.classList.add('show');
                newProducerFields.style.display = 'block';
                console.log('✅ Campos do produtor exibidos');
            } else {
                newProducerFields.classList.remove('show');
                newProducerFields.style.display = 'none';
                console.log('❌ Campos do produtor ocultados');
            }
        }
        
        // Remover event listener anterior se existir
        producerSelect.removeEventListener('change', updateProducerFields);
        
        // Adicionar event listener
        producerSelect.addEventListener('change', function() {
            console.log('🔄 Mudança no select produtor:', this.value);
            updateProducerFields();
        });
        
        // Verificar estado inicial
        updateProducerFields();
        
        console.log('✅ Setup do produtor concluído');
    } else {
        console.log('❌ Elementos do produtor não encontrados');
    }
}

// Atualizar indicadores
function updateStepIndicators() {
    var stepIndicators = document.querySelectorAll('.step');
    
    for (var i = 0; i < stepIndicators.length; i++) {
        var stepNumber = i + 1;
        stepIndicators[i].classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            stepIndicators[i].classList.add('completed');
        } else if (stepNumber === currentStep) {
            stepIndicators[i].classList.add('active');
        }
    }
}

// Atualizar progresso
function updateProgress() {
    var progressLine = document.getElementById('progressLine');
    if (progressLine) {
        var progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressLine.style.width = progress + '%';
    }
}

// Modal functions
function openModal(modalId) {
    console.log('Tentando abrir modal:', modalId);
    var modal = document.getElementById(modalId);
    console.log('Modal encontrado:', modal);
    
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal aberto com sucesso');
        
        // Configurar máscaras e cálculos quando abrir o modal
        setupPriceInputs(modalId);
    } else {
        console.error('Modal não encontrado:', modalId);
    }
}

// Configurar inputs de preço nos modais
function setupPriceInputs(modalId) {
    let priceInput, receiveInput;
    
    if (modalId === 'paidTicketModal') {
        priceInput = document.getElementById('paidTicketPrice');
        receiveInput = document.getElementById('paidTicketReceive');
    } else if (modalId === 'editPaidTicketModal') {
        priceInput = document.getElementById('editPaidTicketPrice');
        receiveInput = document.getElementById('editPaidTicketReceive');
    }
    
    if (priceInput && receiveInput) {
        // Aplicar máscara e calcular valor a receber
        priceInput.addEventListener('input', function() {
            // Aplicar máscara de moeda
            let value = this.value.replace(/\D/g, '');
            if (value === '') value = '0';
            
            // Converter para formato decimal
            let decimalValue = (parseInt(value) / 100).toFixed(2);
            
            // Aplicar máscara R$ 0,00
            this.value = 'R$ ' + decimalValue.replace('.', ',');
            
            // Calcular valor a receber
            calculateReceiveValue(decimalValue, receiveInput);
        });
        
        // Se o campo já tem valor, calcular o valor a receber
        if (priceInput.value) {
            let currentValue = priceInput.value.replace('R$ ', '').replace(',', '.');
            calculateReceiveValue(currentValue, receiveInput);
        }
    }
}

// Função para calcular valor a receber
function calculateReceiveValue(price, receiveInput) {
    const numericPrice = parseFloat(price);
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
        receiveInput.value = 'R$ 0,00';
        return;
    }
    
    // Calcular taxa da plataforma (exemplo: 10% + R$ 1,00)
    const feePercentage = 0.10; // 10%
    const fixedFee = 1.00; // R$ 1,00
    
    const platformFee = (numericPrice * feePercentage) + fixedFee;
    const receiveValue = Math.max(0, numericPrice - platformFee);
    
    receiveInput.value = 'R$ ' + receiveValue.toFixed(2).replace('.', ',');
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Limpar campos quando fechar
        clearModalFields(modalId);
    }
}

// Função para limpar campos do modal
function clearModalFields(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Limpar todos os inputs exceto os de número que têm valores padrão
    const inputs = modal.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
        if (!input.id.includes('MinQuantity') && !input.id.includes('MaxQuantity')) {
            input.value = '';
        }
    });
    
    // Restaurar valores padrão para campos numéricos
    const minInputs = modal.querySelectorAll('input[id*="MinQuantity"]');
    const maxInputs = modal.querySelectorAll('input[id*="MaxQuantity"]');
    
    minInputs.forEach(input => input.value = '1');
    maxInputs.forEach(input => input.value = '5');
}

// Função updateEvent - implementação completa
function updateEvent() {
    console.log('Iniciando salvamento do evento...');
    
    // Validar campos obrigatórios
    if (!validateAllSteps()) {
        alert('Por favor, verifique todos os campos obrigatórios.');
        return;
    }
    
    // Coletar dados do evento
    const eventData = collectEventData();
    
    // Mostrar loading
    const saveButton = document.querySelector('.btn-publish');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Salvando...';
    saveButton.disabled = true;
    
    // Enviar dados para o servidor
    fetch('ajax/atualizar_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        return response.text().then(text => {
            console.log('Resposta bruta salvamento:', text);
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Resposta não é JSON válido:', text);
                throw new Error('Servidor retornou erro HTML: ' + text.substring(0, 100));
            }
        });
    })
    .then(data => {
        if (data.success) {
            alert('Evento atualizado com sucesso!');
            
            // Se há imagem para fazer upload, fazer o upload
            const imageFile = getSelectedImageFile();
            if (imageFile) {
                uploadEventImage(data.evento_id || eventoId, imageFile);
            } else {
                // Redirecionar para meus eventos se não há imagem para upload
                window.location.href = 'meuseventos.php';
            }
        } else {
            alert('Erro ao atualizar evento: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro completo:', error);
        alert('Erro ao atualizar evento: ' + error.message);
    })
    .finally(() => {
        saveButton.textContent = originalText;
        saveButton.disabled = false;
    });
}

// Validar todos os steps
function validateAllSteps() {
    console.log('Validando todos os steps...');
    
    // Step 1: Informações básicas
    const eventName = document.getElementById('eventName').value.trim();
    const classification = document.getElementById('classification').value;
    const category = document.getElementById('category').value;
    
    if (!eventName || !classification || !category) {
        alert('Passo 1: Por favor, preencha o nome, classificação e categoria do evento.');
        currentStep = 1;
        showStep(1);
        return false;
    }
    
    // Step 2: Data e horário
    const startDateTime = document.getElementById('startDateTime').value;
    if (!startDateTime) {
        alert('Passo 2: Por favor, defina a data e hora de início do evento.');
        currentStep = 2;
        showStep(2);
        return false;
    }
    
    const startDate = new Date(startDateTime);
    const now = new Date();
    if (startDate <= now) {
        alert('Passo 2: A data de início deve ser no futuro.');
        currentStep = 2;
        showStep(2);
        return false;
    }
    
    // Step 4: Localização
    const locationSwitch = document.getElementById('locationTypeSwitch');
    const isPresencial = locationSwitch && locationSwitch.classList.contains('active');
    
    if (isPresencial) {
        const venueName = document.getElementById('venueName').value.trim();
        if (!venueName) {
            alert('Passo 4: Por favor, informe o nome do local.');
            currentStep = 4;
            showStep(4);
            return false;
        }
    } else {
        const eventLink = document.getElementById('eventLink').value.trim();
        if (!eventLink) {
            alert('Passo 4: Por favor, informe o link do evento online.');
            currentStep = 4;
            showStep(4);
            return false;
        }
    }
    
    // Step 6: Produtor
    const producer = document.getElementById('producer').value;
    if (producer === 'new') {
        const producerName = document.getElementById('producerName').value.trim();
        if (!producerName) {
            alert('Passo 6: Por favor, informe o nome do produtor.');
            currentStep = 6;
            showStep(6);
            return false;
        }
    }
    
    console.log('✅ Validação concluída com sucesso');
    return true;
}

// Coletar dados do evento
function collectEventData() {
    console.log('Coletando dados do evento...');
    
    const locationSwitch = document.getElementById('locationTypeSwitch');
    const isPresencial = locationSwitch && locationSwitch.classList.contains('active');
    
    const visibilityRadio = document.querySelector('.radio.checked[data-value]');
    const visibility = visibilityRadio ? (visibilityRadio.dataset.value === 'public' ? 'publico' : 'privado') : 'publico';
    
    const producer = document.getElementById('producer').value;
    
    const eventData = {
        evento_id: eventoId,
        nome: document.getElementById('eventName').value.trim(),
        categoria_id: document.getElementById('category').value,
        classificacao: document.getElementById('classification').value,
        descricao: document.getElementById('eventDescription').innerHTML || document.getElementById('eventDescription').textContent || '',
        data_inicio: document.getElementById('startDateTime').value,
        data_fim: document.getElementById('endDateTime').value || null,
        tipo_local: isPresencial ? 'presencial' : 'online',
        link_online: isPresencial ? null : document.getElementById('eventLink').value,
        busca_endereco: isPresencial ? document.getElementById('addressSearch').value : null,
        nome_local: isPresencial ? document.getElementById('venueName').value : null,
        cep: isPresencial ? document.getElementById('cep').value : null,
        rua: isPresencial ? document.getElementById('street').value : null,
        numero: isPresencial ? document.getElementById('number').value : null,
        complemento: isPresencial ? document.getElementById('complement').value : null,
        bairro: isPresencial ? document.getElementById('neighborhood').value : null,
        cidade: isPresencial ? document.getElementById('city').value : null,
        estado: isPresencial ? document.getElementById('state').value : null,
        produtor_selecionado: producer === 'new' ? 'personalizado' : 'usuario',
        nome_produtor: producer === 'new' ? document.getElementById('producerName').value : null,
        nome_exibicao_produtor: producer === 'new' ? document.getElementById('displayName').value : null,
        descricao_produtor: producer === 'new' ? document.getElementById('producerDescription').value : null,
        visibilidade: visibility
    };
    
    console.log('Dados coletados:', eventData);
    return eventData;
}

// Obter arquivo de imagem selecionado
function getSelectedImageFile() {
    const imageUpload = document.getElementById('imageUpload');
    return imageUpload && imageUpload.files[0] ? imageUpload.files[0] : null;
}

// Upload da imagem do evento
function uploadEventImage(eventoId, imageFile) {
    console.log('Fazendo upload da imagem...');
    
    const formData = new FormData();
    formData.append('evento_id', eventoId);
    formData.append('imagem', imageFile);
    
    fetch('ajax/upload_imagem_evento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Imagem uploaded com sucesso');
            // Não mostrar alerta adicional
        } else {
            console.log('❌ Erro no upload da imagem:', data.message);
            alert('Evento atualizado, mas houve erro no upload da imagem: ' + data.message);
        }
        window.location.href = 'meuseventos.php';
    })
    .catch(error => {
        console.error('Erro no upload da imagem:', error);
        alert('Evento atualizado, mas houve erro no upload da imagem.');
        window.location.href = 'meuseventos.php';
    });
}

// Google Maps - função global (EXATAMENTE como no novoevento.php)
function initMap() {
    console.log('🗺️ Inicializando Google Maps...');
    
    const mapElement = document.getElementById('map');
    if (mapElement) {
        // Criar mapa básico se existir elemento
        const map = new google.maps.Map(mapElement, {
            center: { lat: -23.550520, lng: -46.633308 },
            zoom: 13
        });
    }
    
    // Configurar autocomplete
    const addressSearch = document.getElementById('addressSearch');
    if (addressSearch) {
        console.log('✅ Configurando autocomplete...');
        
        const autocomplete = new google.maps.places.Autocomplete(addressSearch, {
            componentRestrictions: { country: 'br' },
            fields: ['place_id', 'name', 'formatted_address', 'address_components', 'geometry']
        });
        
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            console.log('📍 Local selecionado:', place);
            
            if (!place.geometry) {
                console.log('❌ Nenhum detalhe disponível para este local');
                return;
            }
            
            // Preencher campos
            fillAddressFields(place);
        });
        
        console.log('✅ Autocomplete configurado com sucesso');
    } else {
        console.log('❌ Campo addressSearch não encontrado');
    }
}

// Função para preencher campos (igual ao novoevento.php)
function fillAddressFields(place) {
    console.log('✏️ Preenchendo campos...');
    
    // Nome do local
    const venueName = document.getElementById('venueName');
    if (venueName && place.name) {
        venueName.value = place.name;
    }
    
    // Processar componentes do endereço
    const addressComponents = place.address_components || [];
    const addressMap = {
        street_number: '',
        route: '',
        sublocality_level_1: '',
        administrative_area_level_2: '',
        administrative_area_level_1: '',
        country: '',
        postal_code: ''
    };
    
    addressComponents.forEach(component => {
        const type = component.types[0];
        if (addressMap.hasOwnProperty(type)) {
            addressMap[type] = component.long_name;
        }
    });
    
    // Preencher campos específicos
    const fields = {
        'street': addressMap.route,
        'number': addressMap.street_number,
        'neighborhood': addressMap.sublocality_level_1,
        'city': addressMap.administrative_area_level_2,
        'state': addressMap.administrative_area_level_1,
        'cep': addressMap.postal_code
    };
    
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && fields[fieldId]) {
            field.value = fields[fieldId];
        }
    });
    
    console.log('✅ Campos preenchidos:', fields);
}

// Inicialização quando página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, inicializando...');
    
    // Verificar se há um step na URL
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    
    if (stepParam) {
        currentStep = parseInt(stepParam);
        console.log('Indo para step:', currentStep);
        showStep(currentStep);
    }
    
    updateProgress();
    
    // Configurar upload de imagem
    setupImageUpload();
    
    // Verificar se Google Maps já está carregado
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        console.log('Google Maps já disponível, configurando busca...');
        setupAddressSearch();
    } else {
        console.log('Aguardando Google Maps carregar...');
    }
    
    // Event listeners
    var addPaidBtn = document.getElementById('addPaidTicket');
    var addFreeBtn = document.getElementById('addFreeTicket');
    
    if (addPaidBtn) {
        addPaidBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clique no botão pago');
            openModal('paidTicketModal');
            // Carregar lotes após abrir o modal
            setTimeout(function() {
                if (typeof carregarLotesIngressoPago === 'function') {
                    carregarLotesIngressoPago();
                } else if (typeof carregarLotesNoModal === 'function') {
                    carregarLotesNoModal();
                } else {
                    console.error('Função para carregar lotes não encontrada');
                }
            }, 300);
        });
    }
    
    if (addFreeBtn) {
        addFreeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clique no botão gratuito');
            openModal('freeTicketModal');
        });
    }
    
    // Configurar produtor se estiver no step 6
    if (currentStep === 6) {
        setupProducerFields();
    }
});

// Configurar upload de imagem
function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.querySelector('.upload-area');
    const currentImage = document.getElementById('currentImage');
    const imagePreview = document.getElementById('imagePreview');
    
    console.log('Configurando upload de imagem...');
    console.log('imageUpload:', imageUpload);
    console.log('uploadArea:', uploadArea);
    
    if (imageUpload && uploadArea) {
        // Event listener para mudança de arquivo
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            console.log('Arquivo selecionado:', file);
            
            if (!file) return;
            
            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem (PNG, JPG, GIF, WebP).');
                return;
            }
            
            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                return;
            }
            
            // Ler e exibir a imagem
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('Imagem carregada, atualizando preview...');
                
                // Atualizar área de upload
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;">
                    <div class="upload-text" style="margin-top: 10px;">Clique para alterar a imagem</div>
                    <div class="upload-hint">PNG, JPG até 5MB • Tamanho mínimo: 1200x600px</div>
                `;
                
                // Atualizar preview no card lateral se existir
                const previewImage = document.getElementById('previewImage');
                if (previewImage) {
                    previewImage.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                }
                
                console.log('✅ Preview da imagem atualizado');
            };
            
            reader.onerror = function() {
                console.error('Erro ao ler arquivo');
                alert('Erro ao carregar a imagem. Tente novamente.');
            };
            
            reader.readAsDataURL(file);
        });
        
        // Event listener para clique na área de upload
        uploadArea.addEventListener('click', function() {
            console.log('Clique na área de upload');
            imageUpload.click();
        });
        
        // Estilo para cursor pointer
        uploadArea.style.cursor = 'pointer';
        
        console.log('✅ Upload de imagem configurado');
    } else {
        console.log('❌ Elementos de upload não encontrados');
    }
}

// Função para criar ingresso pago
function createPaidTicket() {
    // Validar campos obrigatórios
    const title = document.getElementById('paidTicketTitle').value.trim();
    const quantity = document.getElementById('paidTicketQuantity').value;
    const price = document.getElementById('paidTicketPrice').value;
    const saleStart = document.getElementById('paidSaleStart').value;
    const saleEnd = document.getElementById('paidSaleEnd').value;
    
    if (!title || !quantity || !price || !saleStart || !saleEnd) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const formData = {
        evento_id: eventoId,
        tipo: 'pago',
        titulo: title,
        quantidade: quantity,
        preco: price.replace('R$ ', '').replace(',', '.'),
        inicio_venda: saleStart,
        fim_venda: saleEnd,
        limite_min: document.getElementById('paidMinQuantity').value,
        limite_max: document.getElementById('paidMaxQuantity').value,
        descricao: document.getElementById('paidTicketDescription').value
    };
    
    // Enviar para o servidor
    fetch('ajax/criar_ingresso.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        return response.text().then(text => {
            console.log('Resposta bruta:', text);
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Resposta não é JSON válido:', text);
                throw new Error('Servidor retornou erro: ' + text.substring(0, 100));
            }
        });
    })
    .then(data => {
        if (data.success) {
            alert('Ingresso criado com sucesso!');
            window.location.href = 'editar-evento.php?eventoid=' + eventoId + '&step=5';
        } else {
            alert('Erro ao criar ingresso: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar ingresso: ' + error.message);
    });
}

// Função para criar ingresso gratuito
function createFreeTicket() {
    // Validar campos obrigatórios
    const title = document.getElementById('freeTicketTitle').value.trim();
    const quantity = document.getElementById('freeTicketQuantity').value;
    const saleStart = document.getElementById('freeSaleStart').value;
    const saleEnd = document.getElementById('freeSaleEnd').value;
    
    if (!title || !quantity || !saleStart || !saleEnd) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const formData = {
        evento_id: eventoId,
        tipo: 'gratuito',
        titulo: title,
        quantidade: quantity,
        preco: '0.00',
        inicio_venda: saleStart,
        fim_venda: saleEnd,
        limite_min: document.getElementById('freeMinQuantity').value,
        limite_max: document.getElementById('freeMaxQuantity').value,
        descricao: document.getElementById('freeTicketDescription').value
    };
    
    // Enviar para o servidor
    fetch('ajax/criar_ingresso.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        return response.text().then(text => {
            console.log('Resposta bruta:', text);
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Resposta não é JSON válido:', text);
                throw new Error('Servidor retornou erro: ' + text.substring(0, 100));
            }
        });
    })
    .then(data => {
        if (data.success) {
            alert('Ingresso criado com sucesso!');
            window.location.href = 'editar-evento.php?eventoid=' + eventoId + '&step=5';
        } else {
            alert('Erro ao criar ingresso: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar ingresso: ' + error.message);
    });
}

console.log('Arquivo editarevento-v2.js carregado com sucesso');
