/**
 * JavaScript específico para editar-evento.php
 * Sistema independente com carregamento e salvamento direto
 */

// Estado global do editor
window.editorState = {
    eventoId: null,
    dadosOriginais: null,
    uploadedImages: {},
    currentStep: 1,
    maxSteps: 5
};

/**
 * Inicialização quando página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Editor de evento inicializando...');
    
    // Mostrar loading logo no início
    showLoading('Iniciando editor...');
    
    // Definir ID do evento
    window.editorState.eventoId = window.dadosEvento?.id || null;
    
    if (!window.editorState.eventoId) {
        hideLoading();
        console.error('❌ ID do evento não definido');
        alert('Erro: ID do evento não encontrado. Redirecionando...');
        window.location.href = '/produtor/meuseventos.php';
        return;
    }
    
    console.log('📋 Evento ID definido:', window.editorState.eventoId);
    
    // Aguardar mais tempo para garantir que o DOM está pronto
    setTimeout(function() {
        // Inicializar interface
        inicializarInterface();
        
        // Carregar dados do evento
        carregarDadosEvento();
        
        console.log('✅ Editor inicializado com sucesso');
    }, 500); // Aumentado o delay para 500ms
});

/**
 * Inicializa todos os componentes da interface
 */
function inicializarInterface() {
    console.log('🔧 Inicializando interface...');
    
    // Verificar se elementos críticos existem
    const elementosCriticos = ['eventName', 'locationTypeSwitch', 'previewTitle'];
    const elementosNaoEncontrados = [];
    
    elementosCriticos.forEach(function(id) {
        if (!document.getElementById(id)) {
            elementosNaoEncontrados.push(id);
        }
    });
    
    if (elementosNaoEncontrados.length > 0) {
        console.warn('⚠️ Elementos não encontrados:', elementosNaoEncontrados);
        
        // Contar tentativas para evitar loop infinito
        if (!window.editorState.tentativasInicializacao) {
            window.editorState.tentativasInicializacao = 0;
        }
        
        window.editorState.tentativasInicializacao++;
        
        // Máximo de 5 tentativas para evitar loop infinito
        if (window.editorState.tentativasInicializacao < 5) {
            console.log(`🔄 Tentativa ${window.editorState.tentativasInicializacao}/5 - aguardando elementos...`);
            setTimeout(inicializarInterface, 1000); // Aumentar delay para 1s
            return;
        } else {
            console.error('❌ Elementos críticos não encontrados após 5 tentativas');
            hideLoading();
            alert('Erro: A página não foi carregada corretamente. Por favor, recarregue a página.');
            return;
        }
    }
    
    console.log('✅ Todos os elementos críticos encontrados');
    
    // Event listeners para navegação
    setupNavegacao();
    
    // Event listeners para campos que afetam preview
    setupPreviewUpdates();
    
    // Event listeners para upload de imagens
    setupImageUploads();
    
    // Event listeners para color picker
    setupColorPicker();
    
    // Event listeners para localização
    setupLocalizacao();
    
    // Event listeners para produtor
    setupProdutor();
    
    // Event listeners para menu e interface geral
    setupInterfaceGeral();
    
    // Rich text editor
    setupRichEditor();
    
    // Inicializar estado visual
    updateProgressBar();
    updateNavigationButtons();
    
    // Aguardar um pouco antes de atualizar preview
    setTimeout(updatePreview, 100);
    
    console.log('✅ Interface inicializada com sucesso');
}

/**
 * Configura navegação entre etapas
 */
function setupNavegacao() {
    // Botões de navegação são configurados em updateNavigationButtons()
    console.log('📍 Navegação configurada');
}

/**
 * Configura atualizações do preview
 */
function setupPreviewUpdates() {
    const camposPreview = [
        'eventName', 'startDateTime', 'classification', 
        'category', 'venueName', 'city', 'eventLink'
    ];
    
    camposPreview.forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updatePreview);
            field.addEventListener('change', updatePreview);
        }
    });
    
    // Rich editor precisa de listener especial
    const richEditor = document.getElementById('eventDescription');
    if (richEditor) {
        richEditor.addEventListener('input', updatePreview);
        richEditor.addEventListener('keyup', updatePreview);
    }
    
    console.log('🎨 Preview updates configurados');
}

/**
 * Configura uploads de imagem
 */
function setupImageUploads() {
    const tiposImagem = ['logo', 'capa', 'fundo'];
    
    tiposImagem.forEach(function(tipo) {
        const input = document.getElementById(tipo + 'Upload');
        if (input) {
            input.addEventListener('change', function() {
                handleImageUpload(this, tipo);
            });
        }
    });
    
    console.log('📷 Image uploads configurados');
}

/**
 * Configura color picker
 */
function setupColorPicker() {
    const colorInput = document.getElementById('corFundo');
    const hexInput = document.getElementById('corFundoHex');
    const preview = document.getElementById('colorPreview');
    
    if (colorInput) {
        colorInput.addEventListener('change', function() {
            if (hexInput) hexInput.value = this.value;
            if (preview) preview.style.backgroundColor = this.value;
            updatePreview();
        });
    }
    
    if (hexInput) {
        hexInput.addEventListener('input', function() {
            if (this.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                if (colorInput) colorInput.value = this.value;
                if (preview) preview.style.backgroundColor = this.value;
                updatePreview();
            }
        });
    }
    
    console.log('🎨 Color picker configurado');
}

/**
 * Configura campos de localização
 */
function setupLocalizacao() {
    const locationSwitch = document.getElementById('locationTypeSwitch');
    const presentialSection = document.getElementById('presentialLocation');
    const onlineSection = document.getElementById('onlineLocation');
    
    if (locationSwitch) {
        locationSwitch.addEventListener('click', function() {
            this.classList.toggle('active');
            
            if (presentialSection && onlineSection) {
                if (this.classList.contains('active')) {
                    presentialSection.classList.add('show');
                    onlineSection.classList.remove('show');
                } else {
                    presentialSection.classList.remove('show');
                    onlineSection.classList.add('show');
                }
            }
            
            updatePreview();
        });
    }
    
    console.log('📍 Localização configurada');
}

/**
 * Configura seleção de produtor
 */
function setupProdutor() {
    const producerSelect = document.getElementById('producer');
    const newProducerFields = document.getElementById('newProducerFields');
    
    if (producerSelect && newProducerFields) {
        producerSelect.addEventListener('change', function() {
            if (this.value === 'new') {
                newProducerFields.style.display = 'block';
            } else {
                newProducerFields.style.display = 'none';
            }
        });
    }
    
    console.log('👤 Produtor configurado');
}

/**
 * Configura interface geral (menus, dropdowns, etc.)
 */
function setupInterfaceGeral() {
    // Close dropdowns quando clicar fora
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (userMenu && dropdown && !userMenu.contains(event.target)) {
            dropdown.classList.remove('active');
        }
        
        if (window.innerWidth <= 768 && 
            sidebar && menuToggle &&
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            closeMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    // Mouse particles effect
    document.addEventListener('mousemove', function(e) {
        const particles = document.querySelectorAll('.particle');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 0.5;
            const x = mouseX * speed;
            const y = mouseY * speed;
            
            particle.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        });
    });
    
    console.log('⚙️ Interface geral configurada');
}

/**
 * Configura rich text editor
 */
function setupRichEditor() {
    const editor = document.getElementById('eventDescription');
    if (!editor) return;
    
    // Toolbar buttons
    const toolbarButtons = document.querySelectorAll('.editor-btn');
    toolbarButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const command = this.getAttribute('data-command');
            
            if (command === 'createLink') {
                const url = prompt('Digite o URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }
            
            editor.focus();
        });
    });
    
    // Character counter
    const charCounter = document.getElementById('charCounter');
    if (charCounter) {
        editor.addEventListener('input', function() {
            const text = this.textContent || this.innerText || '';
            charCounter.textContent = text.length + ' caracteres';
        });
    }
    
    console.log('📝 Rich editor configurado');
}

/**
 * Carrega dados do evento do servidor
 */
function carregarDadosEvento() {
    if (!window.editorState.eventoId) {
        hideLoading();
        console.error('❌ ID do evento não disponível para carregamento');
        return;
    }
    
    console.log('📡 Carregando dados do evento:', window.editorState.eventoId);
    
    // Mostrar loading específico para carregamento
    showLoading('Carregando dados do evento...');
    
    fetch('/produtor/ajax/editar_evento_backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'carregar_dados_edicao',
            evento_id: window.editorState.eventoId
        })
    })
    .then(response => {
        console.log('📡 Status da resposta:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('📡 Resposta em texto:', text);
        try {
            const data = JSON.parse(text);
            if (data.sucesso && data.evento) {
                console.log('✅ Dados carregados:', data.evento);
                window.editorState.dadosOriginais = data.evento;
                showLoading('Preenchendo formulário...');
                
                // Aguardar um pouco antes de preencher para suavizar a transição
                setTimeout(() => {
                    preencherFormularioCompleto(data.evento);
                    hideLoading();
                }, 300);
            } else {
                console.error('❌ Erro nos dados:', data.erro || 'Dados inválidos');
                showError('Erro ao carregar dados: ' + (data.erro || 'Dados não encontrados'));
                hideLoading();
            }
        } catch (e) {
            console.error('❌ Erro JSON:', e);
            console.log('❌ Resposta que causou erro:', text);
            showError('Erro ao processar dados do servidor');
            hideLoading();
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
        showError('Erro de conexão ao carregar dados');
        hideLoading();
    });
}

/**
 * Preenche o formulário com dados carregados
 */
function preencherFormularioCompleto(dados) {
    console.log('📝 Preenchendo formulário com:', dados);
    
    // Etapa 1 - Informações básicas
    if (dados.nome) {
        const eventName = document.getElementById('eventName');
        if (eventName) eventName.value = dados.nome;
    }
    
    if (dados.cor_fundo_alternativa) {
        const corFundo = dados.cor_fundo_alternativa;
        const colorInput = document.getElementById('corFundo');
        const hexInput = document.getElementById('corFundoHex');
        const preview = document.getElementById('colorPreview');
        
        if (colorInput) colorInput.value = corFundo;
        if (hexInput) hexInput.value = corFundo;
        if (preview) preview.style.backgroundColor = corFundo;
    }
    
    // Carregar imagens
    if (dados.logo_path) carregarImagemExistente('logo', dados.logo_path);
    if (dados.capa_path) carregarImagemExistente('capa', dados.capa_path);
    if (dados.fundo_path) carregarImagemExistente('fundo', dados.fundo_path);
    
    // Etapa 2 - Data e horário
    if (dados.classificacao_etaria) {
        const classification = document.getElementById('classification');
        if (classification) classification.value = dados.classificacao_etaria;
    }
    
    if (dados.categoria_id) {
        const category = document.getElementById('category');
        if (category) category.value = dados.categoria_id;
    }
    
    if (dados.data_inicio) {
        const startDateTime = document.getElementById('startDateTime');
        if (startDateTime) {
            const dataInicio = new Date(dados.data_inicio);
            startDateTime.value = formatDateTimeLocal(dataInicio);
        }
    }
    
    if (dados.data_fim) {
        const endDateTime = document.getElementById('endDateTime');
        if (endDateTime) {
            const dataFim = new Date(dados.data_fim);
            endDateTime.value = formatDateTimeLocal(dataFim);
        }
    }
    
    // Etapa 3 - Descrição
    if (dados.descricao) {
        const eventDescription = document.getElementById('eventDescription');
        if (eventDescription) {
            eventDescription.innerHTML = dados.descricao;
            
            // Atualizar contador de caracteres
            const charCounter = document.getElementById('charCounter');
            if (charCounter) {
                const text = eventDescription.textContent || eventDescription.innerText || '';
                charCounter.textContent = text.length + ' caracteres';
            }
        }
    }
    
    // Etapa 4 - Localização
    const locationSwitch = document.getElementById('locationTypeSwitch');
    const presentialLocation = document.getElementById('presentialLocation');
    const onlineLocation = document.getElementById('onlineLocation');
    
    if (dados.link_transmissao && dados.link_transmissao.trim()) {
        // Evento online
        if (locationSwitch) locationSwitch.classList.remove('active');
        if (presentialLocation) presentialLocation.classList.remove('show');
        if (onlineLocation) onlineLocation.classList.add('show');
        
        const eventLink = document.getElementById('eventLink');
        if (eventLink) eventLink.value = dados.link_transmissao;
    } else {
        // Evento presencial (padrão)
        if (locationSwitch) locationSwitch.classList.add('active');
        if (presentialLocation) presentialLocation.classList.add('show');
        if (onlineLocation) onlineLocation.classList.remove('show');
        
        // Preencher campos do endereço
        const camposEndereco = {
            'venueName': 'nome_local',
            'cep': 'cep',
            'street': 'endereco',
            'number': 'numero',
            'complement': 'complemento',
            'neighborhood': 'bairro',
            'city': 'cidade',
            'state': 'estado'
        };
        
        Object.keys(camposEndereco).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const dataKey = camposEndereco[fieldId];
            if (field && dados[dataKey]) {
                field.value = dados[dataKey];
            }
        });
        
        // Campos hidden de localização
        if (dados.latitude) {
            const latitude = document.getElementById('latitude');
            if (latitude) latitude.value = dados.latitude;
        }
        
        if (dados.longitude) {
            const longitude = document.getElementById('longitude');
            if (longitude) longitude.value = dados.longitude;
        }
    }
    
    // Etapa 5 - Produtor (normalmente é o usuário atual)
    // Já configurado como padrão no HTML
    
    // Atualizar preview após carregar dados
    setTimeout(() => {
        updatePreview();
    }, 500);
    
    console.log('✅ Formulário preenchido com sucesso');
}

/**
 * Carrega imagem existente no preview
 */
function carregarImagemExistente(tipo, caminho) {
    if (!caminho) return;
    
    console.log('🖼️ Carregando imagem:', tipo, caminho);
    
    const containerMap = {
        'logo': 'logoPreviewContainer',
        'capa': 'capaPreviewContainer', 
        'fundo': 'fundoPreviewMain'
    };
    
    const containerId = containerMap[tipo];
    const container = document.getElementById(containerId);
    const clearBtnId = 'clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const clearBtn = document.getElementById(clearBtnId);
    
    if (!container) {
        console.warn('⚠️ Container não encontrado:', containerId);
        return;
    }
    
    // Criar imagem
    const img = document.createElement('img');
    img.src = caminho;
    img.alt = tipo;
    img.style.maxWidth = '100%';
    img.style.maxHeight = tipo === 'fundo' ? '200px' : '120px';
    img.style.objectFit = 'contain';
    
    // Substituir conteúdo do container
    container.innerHTML = '';
    container.appendChild(img);
    
    // Mostrar botão de limpar
    if (clearBtn) clearBtn.style.display = 'block';
    
    // Salvar no estado
    if (!window.editorState.uploadedImages) {
        window.editorState.uploadedImages = {};
    }
    window.editorState.uploadedImages[tipo] = caminho;
    
    console.log('✅ Imagem carregada:', tipo);
}

/**
 * Manipula upload de nova imagem
 */
function handleImageUpload(input, tipo) {
    const file = input.files[0];
    if (!file) return;
    
    // Validações
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WebP).');
        input.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const containerMap = {
            'logo': 'logoPreviewContainer',
            'capa': 'capaPreviewContainer', 
            'fundo': 'fundoPreviewMain'
        };
        
        const containerId = containerMap[tipo];
        const container = document.getElementById(containerId);
        const clearBtnId = 'clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const clearBtn = document.getElementById(clearBtnId);
        
        if (container) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';
            img.style.maxWidth = '100%';
            img.style.maxHeight = tipo === 'fundo' ? '200px' : '120px';
            img.style.objectFit = 'contain';
            
            container.innerHTML = '';
            container.appendChild(img);
            
            if (clearBtn) clearBtn.style.display = 'block';
            
            if (!window.editorState.uploadedImages) {
                window.editorState.uploadedImages = {};
            }
            window.editorState.uploadedImages[tipo] = e.target.result;
            
            updatePreview();
        }
    };
    
    reader.readAsDataURL(file);
}

/**
 * Limpa imagem do preview
 */
function clearImage(tipo, event) {
    if (event) event.stopPropagation();
    
    const containerMap = {
        'logo': 'logoPreviewContainer',
        'capa': 'capaPreviewContainer', 
        'fundo': 'fundoPreviewMain'
    };
    
    const containerId = containerMap[tipo];
    const container = document.getElementById(containerId);
    const clearBtnId = 'clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const clearBtn = document.getElementById(clearBtnId);
    const inputId = tipo + 'Upload';
    const input = document.getElementById(inputId);
    
    if (container) {
        // Restaurar conteúdo original
        const originalContent = {
            'logo': '<div class="upload-icon">🎨</div><div class="upload-text">Adicionar logo</div><div class="upload-hint">800x200px • Fundo transparente</div>',
            'capa': '<div class="upload-icon">🖼️</div><div class="upload-text">Adicionar capa</div><div class="upload-hint">450x450px • Fundo transparente</div>',
            'fundo': '<div class="upload-icon">🌄</div><div class="upload-text">Clique para adicionar imagem de fundo</div><div class="upload-hint">PNG, JPG até 5MB • Tamanho ideal: 1920x640px</div>'
        };
        
        container.innerHTML = originalContent[tipo] || '';
    }
    
    if (clearBtn) clearBtn.style.display = 'none';
    if (input) input.value = '';
    
    // Remover do estado
    if (window.editorState.uploadedImages) {
        delete window.editorState.uploadedImages[tipo];
    }
    
    updatePreview();
}

/**
 * Navega para próxima etapa
 */
function nextStep() {
    if (validateCurrentStep() && window.editorState.currentStep < window.editorState.maxSteps) {
        window.editorState.currentStep++;
        showStep(window.editorState.currentStep);
        updateProgressBar();
    }
}

/**
 * Navega para etapa anterior
 */
function prevStep() {
    if (window.editorState.currentStep > 1) {
        window.editorState.currentStep--;
        showStep(window.editorState.currentStep);
        updateProgressBar();
    }
}

/**
 * Mostra etapa específica
 */
function showStep(step) {
    // Ocultar todas as etapas
    document.querySelectorAll('.section-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Mostrar etapa atual
    const currentCard = document.querySelector('[data-step-content="' + step + '"]');
    if (currentCard) {
        currentCard.classList.add('active');
    }
    
    updateNavigationButtons();
}

/**
 * Atualiza barra de progresso
 */
function updateProgressBar() {
    // Limpar estado atual
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    // Marcar etapas
    for (let i = 1; i <= window.editorState.maxSteps; i++) {
        const stepElement = document.querySelector('[data-step="' + i + '"]');
        if (stepElement) {
            if (i < window.editorState.currentStep) {
                stepElement.classList.add('completed');
            } else if (i === window.editorState.currentStep) {
                stepElement.classList.add('active');
            }
        }
    }
    
    // Atualizar linha de progresso
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        const progressPercent = ((window.editorState.currentStep - 1) / (window.editorState.maxSteps - 1)) * 100;
        progressLine.style.width = progressPercent + '%';
    }
}

/**
 * Atualiza botões de navegação
 */
function updateNavigationButtons() {
    // Encontrar botões na etapa atual
    const currentCard = document.querySelector('[data-step-content="' + window.editorState.currentStep + '"]');
    if (!currentCard) return;
    
    const backBtn = currentCard.querySelector('.nav-btn.btn-back');
    const continueBtn = currentCard.querySelector('.nav-btn.btn-continue');
    
    // Atualizar botão voltar
    if (backBtn) {
        backBtn.disabled = window.editorState.currentStep === 1;
        backBtn.onclick = prevStep;
    }
    
    // Atualizar botão avançar/salvar
    if (continueBtn) {
        if (window.editorState.currentStep === window.editorState.maxSteps) {
            continueBtn.textContent = '✓ Salvar evento';
            continueBtn.onclick = salvarEvento;
        } else {
            continueBtn.textContent = 'Avançar →';
            continueBtn.onclick = nextStep;
        }
    }
}

/**
 * Valida etapa atual
 */
function validateCurrentStep() {
    const step = window.editorState.currentStep;
    
    switch(step) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        case 4:
            return validateStep4();
        case 5:
            return validateStep5();
        default:
            return true;
    }
}

/**
 * Validações específicas por etapa
 */
function validateStep1() {
    const eventName = document.getElementById('eventName');
    if (!eventName || !eventName.value.trim()) {
        showValidationError('O nome do evento é obrigatório');
        return false;
    }
    return true;
}

function validateStep2() {
    const classification = document.getElementById('classification');
    const category = document.getElementById('category');
    const startDateTime = document.getElementById('startDateTime');
    
    if (!classification || !classification.value) {
        showValidationError('Selecione a classificação do evento');
        return false;
    }
    
    if (!category || !category.value) {
        showValidationError('Selecione a categoria do evento');
        return false;
    }
    
    if (!startDateTime || !startDateTime.value) {
        showValidationError('Defina a data e hora de início do evento');
        return false;
    }
    
    return true;
}

function validateStep3() {
    const description = document.getElementById('eventDescription');
    if (!description || !description.textContent.trim()) {
        showValidationError('Adicione uma descrição para o evento');
        return false;
    }
    return true;
}

function validateStep4() {
    const isPresential = document.getElementById('locationTypeSwitch').classList.contains('active');
    
    if (isPresential) {
        const venueName = document.getElementById('venueName');
        if (!venueName || !venueName.value.trim()) {
            showValidationError('Informe o nome do local do evento');
            return false;
        }
    } else {
        const eventLink = document.getElementById('eventLink');
        if (!eventLink || !eventLink.value.trim()) {
            showValidationError('Informe o link do evento online');
            return false;
        }
    }
    
    return true;
}

function validateStep5() {
    const producer = document.getElementById('producer');
    
    if (producer && producer.value === 'new') {
        const producerName = document.getElementById('producerName');
        if (!producerName || !producerName.value.trim()) {
            showValidationError('Informe o nome do produtor');
            return false;
        }
    }
    
    return true;
}

/**
 * Coleta todos os dados do formulário
 */
function coletarDadosFormulario() {
    const isPresential = document.getElementById('locationTypeSwitch').classList.contains('active');
    const producerType = document.getElementById('producer').value;
    
    return {
        nome: getValue('eventName'),
        logo: window.editorState.uploadedImages?.logo || '',
        capa: window.editorState.uploadedImages?.capa || '',
        fundo: window.editorState.uploadedImages?.fundo || '',
        cor_fundo: getValue('corFundo') || '#000000',
        classificacao: getValue('classification'),
        categoria_id: getValue('category'),
        data_inicio: getValue('startDateTime'),
        data_fim: getValue('endDateTime') || null,
        descricao: document.getElementById('eventDescription')?.innerHTML || '',
        tipo_local: isPresential ? 'presencial' : 'online',
        nome_local: isPresential ? getValue('venueName') : null,
        cep: isPresential ? getValue('cep') : null,
        endereco: isPresential ? getValue('street') : null,
        numero: isPresential ? getValue('number') : null,
        complemento: isPresential ? getValue('complement') : null,
        bairro: isPresential ? getValue('neighborhood') : null,
        cidade: isPresential ? getValue('city') : null,
        estado: isPresential ? getValue('state') : null,
        latitude: isPresential ? getValue('latitude') : null,
        longitude: isPresential ? getValue('longitude') : null,
        link_evento: !isPresential ? getValue('eventLink') : null,
        tipo_produtor: producerType,
        nome_produtor: producerType === 'new' ? getValue('producerName') : null,
        nome_exibicao: producerType === 'new' ? getValue('displayName') : null,
        descricao_produtor: producerType === 'new' ? getValue('producerDescription') : null
    };
}

/**
 * Helper para obter valor de campo
 */
function getValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value.trim() : '';
}

/**
 * Salva o evento no servidor
 */
function salvarEvento() {
    console.log('💾 Iniciando salvamento...');
    
    if (!validateCurrentStep()) {
        showValidationError('Por favor, preencha todos os campos obrigatórios antes de salvar.');
        return;
    }
    
    if (!window.editorState.eventoId) {
        showError('Erro: ID do evento não encontrado.');
        return;
    }
    
    showLoading('Salvando alterações...');
    
    const dadosEvento = coletarDadosFormulario();
    console.log('📋 Dados para salvamento:', dadosEvento);
    
    const payload = {
        action: 'salvar_edicao',
        evento_id: window.editorState.eventoId,
        dados: JSON.stringify(dadosEvento)
    };
    
    fetch('/produtor/ajax/editar_evento_backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(payload)
    })
    .then(response => {
        console.log('📡 Status da resposta:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('📡 Resposta:', text);
        try {
            const data = JSON.parse(text);
            if (data.sucesso) {
                showSuccess('Evento salvo com sucesso!');
                console.log('✅ Salvamento realizado');
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = '/produtor/meuseventos.php';
                }, 2000);
            } else {
                showError('Erro ao salvar: ' + (data.erro || 'Erro desconhecido'));
                console.error('❌ Erro no salvamento:', data);
            }
        } catch (e) {
            console.error('❌ Erro JSON:', e);
            console.log('❌ Resposta que causou erro:', text);
            showError('Erro ao processar resposta do servidor');
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
        showError('Erro de conexão. Tente novamente.');
    })
    .finally(() => {
        hideLoading();
    });
}

/**
 * Atualiza preview do evento
 */
function updatePreview() {
    // Verificar se elementos existem antes de usar
    const previewTitle = document.getElementById('previewTitle');
    const previewDescription = document.getElementById('previewDescription');
    
    if (previewTitle) {
        const eventName = getValue('eventName') || 'Nome do evento';
        previewTitle.textContent = eventName;
    }
    
    if (previewDescription) {
        const description = document.getElementById('eventDescription');
        if (description) {
            const text = description.textContent || description.innerText || 'Descrição do evento aparecerá aqui...';
            previewDescription.textContent = text.substring(0, 100) + (text.length > 100 ? '...' : '');
        }
    }
    
    // Hero section
    updateHeroPreview();
    
    // Detalhes do preview
    updatePreviewDetails();
}

/**
 * Atualiza hero section do preview
 */
function updateHeroPreview() {
    const heroLogo = document.getElementById('heroLogo');
    const heroCapa = document.getElementById('heroCapa');
    const heroBackground = document.getElementById('heroBackground');
    
    // Logo
    if (heroLogo) {
        const logoSrc = window.editorState.uploadedImages?.logo;
        if (logoSrc) {
            heroLogo.src = logoSrc;
            heroLogo.style.display = 'block';
        } else {
            heroLogo.style.display = 'none';
        }
    }
    
    // Capa
    if (heroCapa) {
        const capaSrc = window.editorState.uploadedImages?.capa;
        if (capaSrc) {
            heroCapa.src = capaSrc;
            heroCapa.style.display = 'block';
        } else {
            heroCapa.style.display = 'none';
        }
    }
    
    // Background
    if (heroBackground) {
        const fundoSrc = window.editorState.uploadedImages?.fundo;
        if (fundoSrc) {
            heroBackground.style.backgroundImage = 'url(' + fundoSrc + ')';
            heroBackground.style.backgroundColor = '';
        } else {
            const corFundo = getValue('corFundo') || '#000000';
            heroBackground.style.backgroundImage = 'none';
            heroBackground.style.backgroundColor = corFundo;
        }
    }
}

/**
 * Atualiza detalhes do preview
 */
function updatePreviewDetails() {
    // Data e hora
    const startDateTime = getValue('startDateTime');
    const previewDate = document.getElementById('previewDate');
    if (previewDate) {
        if (startDateTime) {
            const date = new Date(startDateTime);
            const dateStr = date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
            previewDate.textContent = dateStr;
        } else {
            previewDate.textContent = 'Data não definida';
        }
    }
    
    // Localização
    const locationSwitch = document.getElementById('locationTypeSwitch');
    const previewLocation = document.getElementById('previewLocation');
    const previewType = document.getElementById('previewType');
    
    if (locationSwitch && previewLocation && previewType) {
        const isPresential = locationSwitch.classList.contains('active');
        
        if (isPresential) {
            const venueName = getValue('venueName');
            const city = getValue('city');
            
            let locationText = 'Local não definido';
            if (venueName && city) {
                locationText = venueName + ', ' + city;
            } else if (venueName) {
                locationText = venueName;
            }
            
            previewLocation.textContent = locationText;
            previewType.textContent = 'Presencial';
        } else {
            previewLocation.textContent = 'Evento online';
            previewType.textContent = 'Online';
        }
    }
    
    // Categoria
    const categorySelect = document.getElementById('category');
    const previewCategory = document.getElementById('previewCategory');
    if (categorySelect && previewCategory) {
        const selectedOption = categorySelect.selectedOptions[0];
        if (selectedOption) {
            previewCategory.textContent = selectedOption.text;
        } else {
            previewCategory.textContent = 'Categoria não definida';
        }
    }
}

/**
 * Utilitários para mensagens e loading
 */
function showLoading(message = 'Carregando...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    
    if (overlay && text) {
        text.textContent = message;
        overlay.classList.add('show');
    }
    
    console.log('⏳ Loading:', message);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    
    if (overlay) {
        overlay.classList.remove('show');
    }
    
    console.log('✅ Loading concluído');
}

function showError(message) {
    alert('❌ ' + message);
    console.error('❌', message);
}

function showSuccess(message) {
    alert('✅ ' + message);
    console.log('✅', message);
}

function showValidationError(message) {
    alert('⚠️ ' + message);
    console.warn('⚠️', message);
}

/**
 * Utilitários de data
 */
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}

/**
 * Funções de menu mobile (para compatibilidade)
 */
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    if (menuToggle) menuToggle.classList.toggle('active');
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        window.location = 'logout.php';
    }
}

/**
 * Funções de teste/debug
 */
function testarCarregamento() {
    console.log('🧪 TESTE: Carregamento de dados');
    carregarDadosEvento();
}

function testarSalvamento() {
    console.log('🧪 TESTE: Salvamento de dados');
    salvarEvento();
}

function verificarDados() {
    console.log('🧪 VERIFICAÇÃO: Estado atual');
    console.log('📋 Editor State:', window.editorState);
    console.log('📋 Dados do formulário:', coletarDadosFormulario());
    console.log('📋 Imagens carregadas:', window.editorState.uploadedImages);
    alert('🔍 Verificação completa - veja o console para detalhes');
}

// Exportar funções globais necessárias
window.nextStep = nextStep;
window.prevStep = prevStep;
window.salvarEvento = salvarEvento;
window.clearImage = clearImage;
window.testarCarregamento = testarCarregamento;
window.testarSalvamento = testarSalvamento;
window.verificarDados = verificarDados;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toggleUserDropdown = toggleUserDropdown;
window.logout = logout;
