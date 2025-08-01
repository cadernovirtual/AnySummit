/**
 * Correções diretas e simples para color picker e upload
 */

// Aguardar o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // 1. CORREÇÃO DO COLOR PICKER
    // ========================================
    setTimeout(() => {
        console.log('[FIX] Aplicando correções de cor...');
        
        const corFundo = document.getElementById('corFundo');
        const corFundoHex = document.getElementById('corFundoHex');
        const colorPreview = document.getElementById('colorPreview');
        
        if (corFundo) {
            // Evento direto no color picker
            corFundo.oninput = function() {
                const cor = this.value;
                console.log('[FIX] Cor alterada:', cor);
                
                // Atualizar campo hex
                if (corFundoHex) {
                    corFundoHex.value = cor;
                }
                
                // Atualizar preview pequeno
                if (colorPreview) {
                    colorPreview.style.backgroundColor = cor;
                }
                
                // Atualizar preview do evento
                const heroBackground = document.getElementById('heroBackground');
                if (heroBackground) {
                    const fundoImg = document.querySelector('#fundoPreviewMain img');
                    if (!fundoImg || !fundoImg.src || fundoImg.src.includes('placeholder')) {
                        heroBackground.style.backgroundColor = cor;
                        console.log('[FIX] Cor aplicada ao preview');
                    }
                }
            };
        }
        
        if (corFundoHex) {
            // Evento no campo hex
            corFundoHex.oninput = function() {
                const hex = this.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    console.log('[FIX] Hex válido:', hex);
                    
                    if (corFundo) {
                        corFundo.value = hex;
                    }
                    
                    if (colorPreview) {
                        colorPreview.style.backgroundColor = hex;
                    }
                    
                    // Atualizar preview
                    const heroBackground = document.getElementById('heroBackground');
                    if (heroBackground) {
                        const fundoImg = document.querySelector('#fundoPreviewMain img');
                        if (!fundoImg || !fundoImg.src || fundoImg.src.includes('placeholder')) {
                            heroBackground.style.backgroundColor = hex;
                        }
                    }
                }
            };
        }
        
    }, 1000);
    
    // ========================================
    // 2. CORREÇÃO DO UPLOAD
    // ========================================
    setTimeout(() => {
        console.log('[FIX] Aplicando correções de upload...');
        
        // Upload de logo
        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            logoUpload.onchange = function() {
                handleImageUpload(this, 'logoPreviewContainer', 'logo');
            };
        }
        
        // Upload de capa
        const capaUpload = document.getElementById('capaUpload');
        if (capaUpload) {
            capaUpload.onchange = function() {
                handleImageUpload(this, 'capaPreviewContainer', 'capa');
            };
        }
        
        // Upload de fundo
        const fundoUpload = document.getElementById('fundoUpload');
        if (fundoUpload) {
            fundoUpload.onchange = function() {
                handleImageUpload(this, 'fundoPreviewMain', 'fundo');
            };
        }
        
    }, 1000);
    
    // ========================================
    // 3. LISTENERS PARA ATUALIZAR PREVIEW
    // ========================================
    setTimeout(() => {
        console.log('[FIX] Configurando listeners de preview...');
        
        // Nome do evento
        const eventName = document.getElementById('eventName');
        if (eventName) {
            eventName.addEventListener('input', function() {
                updatePreviewSimple();
            });
        }
        
        // Data e hora
        const startDateTime = document.getElementById('startDateTime');
        if (startDateTime) {
            startDateTime.addEventListener('change', function() {
                updatePreviewSimple();
            });
        }
        
        const endDateTime = document.getElementById('endDateTime');
        if (endDateTime) {
            endDateTime.addEventListener('change', function() {
                updatePreviewSimple();
            });
        }
        
        // Categoria
        const category = document.getElementById('category');
        if (category) {
            category.addEventListener('change', function() {
                updatePreviewSimple();
            });
        }
        
        // Local/Link
        const venueName = document.getElementById('venueName');
        if (venueName) {
            venueName.addEventListener('input', function() {
                updatePreviewSimple();
            });
        }
        
        const eventLink = document.getElementById('eventLink');
        if (eventLink) {
            eventLink.addEventListener('input', function() {
                updatePreviewSimple();
            });
        }
        
        // Descrição
        const eventDescription = document.getElementById('eventDescription');
        if (eventDescription) {
            // Para editor rich text
            if (eventDescription.contentEditable === 'true') {
                eventDescription.addEventListener('input', function() {
                    updatePreviewSimple();
                });
                eventDescription.addEventListener('keyup', function() {
                    updatePreviewSimple();
                });
            } else {
                // Para textarea normal
                eventDescription.addEventListener('input', function() {
                    updatePreviewSimple();
                });
            }
        }
        
        // Switch de tipo de evento
        const locationSwitch = document.getElementById('locationTypeSwitch');
        if (locationSwitch) {
            locationSwitch.addEventListener('click', function() {
                setTimeout(updatePreviewSimple, 100);
            });
        }
        
        // Atualizar preview inicial
        updatePreviewSimple();
        
    }, 1500);
    
});

// Função simples de upload
function handleImageUpload(input, containerId, tipo) {
    const file = input.files[0];
    if (!file) return;
    
    // Validações básicas
    if (!file.type.match('image.*')) {
        alert('Por favor, selecione apenas imagens');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
    }
    
    // Preview local
    const reader = new FileReader();
    reader.onload = function(e) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="margin-top: 10px;">
                    <button type="button" class="btn btn-sm btn-danger" onclick="clearImage('${tipo}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            `;
            
            // Salvar URL
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages[tipo] = e.target.result;
            
            console.log('[FIX] Imagem carregada:', tipo);
            
            // Atualizar preview
            updateHeroImages();
        }
    };
    reader.readAsDataURL(file);
}

// Função para atualizar imagens no hero
function updateHeroImages() {
    // Logo
    const heroLogo = document.getElementById('heroLogo');
    const logoImg = document.querySelector('#logoPreviewContainer img');
    if (heroLogo && logoImg && logoImg.src) {
        heroLogo.src = logoImg.src;
        heroLogo.style.display = 'block';
    } else if (heroLogo) {
        heroLogo.style.display = 'none';
    }
    
    // Capa
    const heroCapa = document.getElementById('heroCapa');
    const capaImg = document.querySelector('#capaPreviewContainer img');
    if (heroCapa && capaImg && capaImg.src) {
        heroCapa.src = capaImg.src;
        heroCapa.style.display = 'block';
    } else if (heroCapa) {
        heroCapa.style.display = 'none';
    }
    
    // Fundo
    const heroBackground = document.getElementById('heroBackground');
    const fundoImg = document.querySelector('#fundoPreviewMain img');
    if (heroBackground) {
        if (fundoImg && fundoImg.src && !fundoImg.src.includes('placeholder')) {
            heroBackground.style.backgroundImage = `url(${fundoImg.src})`;
            heroBackground.style.backgroundColor = '';
        } else {
            // Usar cor de fundo
            const corFundo = document.getElementById('corFundo');
            if (corFundo) {
                heroBackground.style.backgroundImage = '';
                heroBackground.style.backgroundColor = corFundo.value || '#000000';
            }
        }
    }
}

// Função simples para atualizar preview
function updatePreviewSimple() {
    console.log('[FIX] Atualizando preview...');
    
    // Título
    const previewTitle = document.getElementById('previewTitle');
    const eventName = document.getElementById('eventName');
    if (previewTitle && eventName) {
        previewTitle.textContent = eventName.value || 'Nome do evento';
    }
    
    // Descrição
    const previewDescription = document.getElementById('previewDescription');
    const eventDescription = document.getElementById('eventDescription');
    if (previewDescription && eventDescription) {
        let descText = '';
        if (eventDescription.contentEditable === 'true') {
            descText = eventDescription.textContent || '';
        } else {
            descText = eventDescription.value || '';
        }
        previewDescription.textContent = descText.substring(0, 120) || '';
    }
    
    // Data
    const previewDate = document.getElementById('previewDate');
    const startDateTime = document.getElementById('startDateTime');
    const endDateTime = document.getElementById('endDateTime');
    
    if (previewDate && startDateTime && startDateTime.value) {
        const startDate = new Date(startDateTime.value);
        let dateText = startDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (endDateTime && endDateTime.value) {
            const endDate = new Date(endDateTime.value);
            dateText += ' até ' + endDate.toLocaleDateString('pt-BR', {
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
    
    // Local
    const previewLocation = document.getElementById('previewLocation');
    const locationSwitch = document.getElementById('locationTypeSwitch');
    const venueName = document.getElementById('venueName');
    const eventLink = document.getElementById('eventLink');
    
    if (previewLocation) {
        const isPresential = locationSwitch?.classList.contains('active');
        if (isPresential) {
            previewLocation.textContent = venueName?.value || '';
        } else {
            previewLocation.textContent = eventLink?.value || '';
        }
    }
    
    // Tipo
    const previewType = document.getElementById('previewType');
    if (previewType && locationSwitch) {
        const isPresential = locationSwitch.classList.contains('active');
        previewType.textContent = isPresential ? 'Presencial' : 'Online';
    }
    
    // Categoria
    const previewCategory = document.getElementById('previewCategory');
    const category = document.getElementById('category');
    if (previewCategory && category && category.value) {
        const selectedOption = category.options[category.selectedIndex];
        previewCategory.textContent = selectedOption?.text || 'Categoria não definida';
    }
    
    // Atualizar imagens também
    updateHeroImages();
}

// Função para limpar imagem
window.clearImage = function(tipo) {
    let containerId, inputId;
    
    switch(tipo) {
        case 'logo':
            containerId = 'logoPreviewContainer';
            inputId = 'logoUpload';
            break;
        case 'capa':
            containerId = 'capaPreviewContainer';
            inputId = 'capaUpload';
            break;
        case 'fundo':
            containerId = 'fundoPreviewMain';
            inputId = 'fundoUpload';
            break;
    }
    
    // Limpar input
    const input = document.getElementById(inputId);
    if (input) input.value = '';
    
    // Limpar container
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<p class="text-muted">Nenhuma imagem selecionada</p>';
    }
    
    // Remover da memória
    if (window.uploadedImages) {
        delete window.uploadedImages[tipo];
    }
    
    // Atualizar preview
    updateHeroImages();
    
    console.log('[FIX] Imagem removida:', tipo);
};

console.log('[FIX] Arquivo de correções simples carregado');

// ADICIONAR A FUNÇÃO DE BUSCA DE ENDEREÇO QUE ESTÁ FALTANDO
window.searchAddressManual = function() {
    console.log('[FIX] Busca manual de endereço iniciada');
    
    const addressSearch = document.getElementById('addressSearch');
    if (!addressSearch) {
        console.error('[FIX] Campo addressSearch não encontrado');
        return;
    }
    
    const query = addressSearch.value.trim();
    console.log('[FIX] Query:', query);
    
    if (query.length < 3) {
        alert('Digite pelo menos 3 caracteres para buscar.');
        return;
    }
    
    // Verificar se a função de busca do Address existe
    if (window.AnySummit && window.AnySummit.Address && window.AnySummit.Address.searchAddresses) {
        console.log('[FIX] Chamando AnySummit.Address.searchAddresses');
        window.AnySummit.Address.searchAddresses(query);
    } else {
        console.log('[FIX] Tentando disparar evento de input');
        // Tentar disparar evento de input
        const event = new Event('input', { bubbles: true });
        addressSearch.dispatchEvent(event);
        
        // Se ainda não funcionar, tentar forçar um keyup
        setTimeout(() => {
            const keyEvent = new KeyboardEvent('keyup', { bubbles: true });
            addressSearch.dispatchEvent(keyEvent);
        }, 100);
    }
};

// ADICIONAR A FUNÇÃO DO COMBO QUE ESTÁ FALTANDO
window.populateComboTicketSelect = function(loteId) {
    console.log('[FIX] populateComboTicketSelect chamado com loteId:', loteId);
    // Função vazia por enquanto - apenas para não dar erro
};
