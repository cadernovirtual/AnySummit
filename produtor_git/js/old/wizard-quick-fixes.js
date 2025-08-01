// ============================================
// WIZARD QUICK FIXES - CORREÇÕES RÁPIDAS
// ============================================

console.log('🚀 Carregando correções rápidas do wizard...');

// ====================
// 1. CORRIGIR FUNÇÃO nextStep
// ====================
if (typeof window.nextStep === 'undefined') {
    window.nextStep = function() {
        console.log('🔄 nextStep chamado - step atual:', window.currentStep);
        
        // Validar etapa atual
        if (typeof window.validateStep === 'function') {
            if (!window.validateStep(window.currentStep)) {
                console.log('❌ Validação falhou para step:', window.currentStep);
                return false;
            }
        }
        
        // Avançar para próxima etapa
        if (window.currentStep < 8) {
            window.currentStep++;
            if (typeof window.goToStep === 'function') {
                window.goToStep(window.currentStep);
            }
            
            // Salvar dados
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
        }
    };
    console.log('✅ Função nextStep criada');
}

// ====================
// 2. CORRIGIR FUNÇÃO populateComboTicketSelect
// ====================
if (typeof window.populateComboTicketSelect === 'undefined') {
    window.populateComboTicketSelect = function() {
        console.log('📋 Populando select de ingressos para combo...');
        
        const select = document.getElementById('comboTicketType');
        if (!select) {
            console.error('Select de ingressos não encontrado');
            return;
        }
        
        // Limpar opções existentes
        select.innerHTML = '<option value="">Selecione um tipo de ingresso</option>';
        
        // Buscar ingressos disponíveis
        const ticketCards = document.querySelectorAll('.ticket-card');
        const ingressos = window.ingressos || [];
        const temporaryTickets = window.temporaryTickets || [];
        
        // Adicionar ingressos do DOM
        ticketCards.forEach(card => {
            const nome = card.querySelector('.ticket-title')?.textContent || '';
            const id = card.dataset.ticketId || '';
            if (nome && id) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = nome;
                select.appendChild(option);
            }
        });
        
        // Adicionar ingressos do array se não estiverem no DOM
        [...ingressos, ...temporaryTickets].forEach(ingresso => {
            if (ingresso && ingresso.nome) {
                const exists = select.querySelector(`option[value="${ingresso.id || ingresso.nome}"]`);
                if (!exists) {
                    const option = document.createElement('option');
                    option.value = ingresso.id || ingresso.nome;
                    option.textContent = ingresso.nome;
                    select.appendChild(option);
                }
            }
        });
        
        console.log('✅ Select populado com', select.options.length - 1, 'ingressos');
    };
}

// ====================
// 3. CORRIGIR FUNÇÃO initMap
// ====================
if (typeof window.initMap === 'undefined') {
    window.initMap = function() {
        console.log('🗺️ Inicializando Google Maps...');
        
        const addressInput = document.getElementById('endereco');
        if (addressInput && window.google && window.google.maps) {
            try {
                const autocomplete = new google.maps.places.Autocomplete(addressInput, {
                    componentRestrictions: { country: 'br' },
                    fields: ['address_components', 'geometry', 'name']
                });
                
                autocomplete.addListener('place_changed', function() {
                    const place = autocomplete.getPlace();
                    console.log('📍 Local selecionado:', place);
                    
                    // Preencher campos de endereço
                    if (place.address_components) {
                        place.address_components.forEach(component => {
                            const types = component.types;
                            
                            if (types.includes('street_number')) {
                                const numeroInput = document.getElementById('numero');
                                if (numeroInput) numeroInput.value = component.long_name;
                            }
                            
                            if (types.includes('route')) {
                                const enderecoInput = document.getElementById('endereco');
                                if (enderecoInput) enderecoInput.value = component.long_name;
                            }
                            
                            if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                                const bairroInput = document.getElementById('bairro');
                                if (bairroInput) bairroInput.value = component.long_name;
                            }
                            
                            if (types.includes('administrative_area_level_2') || types.includes('locality')) {
                                const cidadeInput = document.getElementById('cidade');
                                if (cidadeInput) cidadeInput.value = component.long_name;
                            }
                            
                            if (types.includes('administrative_area_level_1')) {
                                const estadoInput = document.getElementById('estado');
                                if (estadoInput) estadoInput.value = component.short_name;
                            }
                            
                            if (types.includes('postal_code')) {
                                const cepInput = document.getElementById('cep');
                                if (cepInput) cepInput.value = component.long_name;
                            }
                        });
                    }
                });
                
                console.log('✅ Google Maps autocomplete configurado');
            } catch (error) {
                console.error('❌ Erro ao configurar Google Maps:', error);
            }
        }
    };
}

// ====================
// 4. GARANTIR CARREGAMENTO DE IMAGENS
// ====================
document.addEventListener('DOMContentLoaded', function() {
    // Corrigir IDs dos containers de preview
    const fixes = [
        { from: 'logoPreview', to: 'logoPreviewContainer' },
        { from: 'capaPreview', to: 'capaPreviewContainer' },
        { from: 'fundoPreview', to: 'fundoPreviewMain' }
    ];
    
    fixes.forEach(fix => {
        const oldElement = document.getElementById(fix.from);
        const newElement = document.getElementById(fix.to);
        
        if (oldElement && !newElement) {
            oldElement.id = fix.to;
            console.log(`✅ ID corrigido: ${fix.from} → ${fix.to}`);
        }
    });
    
    // Garantir que os inputs de upload funcionem
    const uploads = ['logoUpload', 'capaUpload', 'fundoUpload'];
    uploads.forEach(uploadId => {
        const input = document.getElementById(uploadId);
        if (input) {
            // Remover listeners antigos
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Adicionar novo listener
            newInput.addEventListener('change', function(e) {
                console.log(`📸 Upload detectado em ${uploadId}`);
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const containerId = uploadId.replace('Upload', 'PreviewContainer');
                        const container = document.getElementById(containerId);
                        if (container) {
                            container.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                            console.log(`✅ Imagem carregada em ${containerId}`);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
});

// ====================
// 5. GARANTIR VALIDAÇÕES
// ====================
// Sobrescrever validateStep com versão funcional
window.validateStep = function(stepNumber) {
    console.log('🔍 Validando step:', stepNumber);
    
    switch(stepNumber) {
        case 1:
            const eventName = document.getElementById('eventName')?.value?.trim();
            if (!eventName) {
                alert('Por favor, preencha o nome do evento.');
                return false;
            }
            break;
            
        case 2:
            const eventDate = document.getElementById('eventDate')?.value;
            const eventTime = document.getElementById('eventTime')?.value;
            if (!eventDate || !eventTime) {
                alert('Por favor, preencha a data e hora do evento.');
                return false;
            }
            break;
            
        case 3:
            const eventDescription = document.getElementById('eventDescription')?.value?.trim();
            if (!eventDescription) {
                alert('Por favor, adicione uma descrição do evento.');
                return false;
            }
            break;
            
        case 4:
            const isOnline = document.getElementById('onlineEvent')?.checked;
            if (isOnline) {
                const eventLink = document.getElementById('eventLink')?.value?.trim();
                if (!eventLink) {
                    alert('Por favor, adicione o link do evento online.');
                    return false;
                }
            } else {
                const endereco = document.getElementById('endereco')?.value?.trim();
                if (!endereco) {
                    alert('Por favor, preencha o endereço do evento.');
                    return false;
                }
            }
            break;
            
        case 5:
            const hasLotes = document.querySelectorAll('.lote-card').length > 0 || 
                           (window.lotes && window.lotes.length > 0);
            if (!hasLotes) {
                alert('Por favor, crie pelo menos um lote.');
                return false;
            }
            break;
            
        case 6:
            const hasIngressos = document.querySelectorAll('.ticket-card').length > 0 || 
                               (window.ingressos && window.ingressos.length > 0);
            if (!hasIngressos) {
                alert('Por favor, crie pelo menos um ingresso.');
                return false;
            }
            break;
            
        case 8:
            const termsAccepted = document.getElementById('acceptTerms')?.checked;
            if (!termsAccepted) {
                alert('Por favor, aceite os termos de uso.');
                return false;
            }
            break;
    }
    
    console.log('✅ Validação passou para step:', stepNumber);
    return true;
};

console.log('✅ Correções rápidas do wizard carregadas com sucesso!');
