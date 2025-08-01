// =====================================================
// CORREÇÕES FINAIS COMPLETAS - ANYSUMMIT
// =====================================================

console.log('🔧 Aplicando correções finais completas...');

// =====================================================
// 1. CORRIGIR PREVIEW DO EVENTO
// =====================================================

window.updatePreview = function() {
    console.log('🖼️ Atualizando preview...');
    
    // Nome do evento
    const eventName = document.getElementById('eventName')?.value || 'Nome do Evento';
    const previewTitle = document.querySelector('.preview-event-title');
    if (previewTitle) previewTitle.textContent = eventName;
    
    // Data e hora
    const startDate = document.getElementById('startDateTime')?.value;
    const endDate = document.getElementById('endDateTime')?.value;
    
    if (startDate) {
        const date = new Date(startDate);
        const dateStr = date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        const timeStr = date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const previewDate = document.querySelector('.preview-date');
        if (previewDate) previewDate.textContent = dateStr;
        
        const previewTime = document.querySelector('.preview-time');
        if (previewTime) previewTime.textContent = timeStr;
    }
    
    // Categoria
    const category = document.getElementById('category')?.value;
    if (category) {
        const categoryText = document.querySelector('#category option:checked')?.textContent || category;
        const previewCategory = document.querySelector('.preview-category');
        if (previewCategory) previewCategory.textContent = categoryText;
    }
    
    // Local
    const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
    const locationIcon = document.querySelector('.preview-location-icon');
    const locationText = document.querySelector('.preview-location-text');
    
    if (isPresential) {
        const venue = document.getElementById('venueName')?.value || '';
        const address = document.getElementById('addressSearch')?.value || '';
        if (locationIcon) locationIcon.textContent = '📍';
        if (locationText) locationText.textContent = venue || address || 'Local a definir';
    } else {
        const link = document.getElementById('eventLink')?.value || '';
        if (locationIcon) locationIcon.textContent = '💻';
        if (locationText) locationText.textContent = link ? 'Evento Online' : 'Link a definir';
    }
    
    // Descrição
    const description = document.getElementById('eventDescription')?.innerHTML || '';
    const previewDesc = document.querySelector('.preview-description');
    if (previewDesc) previewDesc.innerHTML = description || 'Descrição do evento...';
    
    // Imagem de fundo
    const fundoImg = document.querySelector('#fundoPreviewMain img');
    const previewBg = document.querySelector('.preview-event-bg');
    if (previewBg && fundoImg) {
        previewBg.style.backgroundImage = `url(${fundoImg.src})`;
    }
    
    // Cor de fundo
    const corFundo = document.getElementById('corFundo')?.value;
    if (corFundo && previewBg) {
        previewBg.style.backgroundColor = corFundo;
    }
};

// Adicionar listeners para atualizar preview
document.addEventListener('DOMContentLoaded', function() {
    const camposPreview = ['eventName', 'startDateTime', 'endDateTime', 'category', 'venueName', 'addressSearch', 'eventLink'];
    
    camposPreview.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', updatePreview);
            campo.addEventListener('change', updatePreview);
        }
    });
    
    // Atualizar preview inicial
    setTimeout(updatePreview, 500);
});

// =====================================================
// 2. CORRIGIR BUSCA DE ENDEREÇOS
// =====================================================

window.buscarEnderecosCorrigido = function(query) {
    console.log('🔍 Buscando endereço:', query);
    
    const addressSuggestions = document.getElementById('addressSuggestions');
    if (!addressSuggestions) return;
    
    // Usar AutocompleteService (API antiga que ainda funciona)
    if (window.google && google.maps && google.maps.places && google.maps.places.AutocompleteService) {
        const service = new google.maps.places.AutocompleteService();
        
        const request = {
            input: query + ', Brasil',
            componentRestrictions: { country: 'br' },
            language: 'pt-BR',
            types: ['geocode', 'establishment']
        };
        
        service.getPlacePredictions(request, function(predictions, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                addressSuggestions.innerHTML = '';
                addressSuggestions.style.display = 'block';
                
                predictions.slice(0, 5).forEach(pred => {
                    const div = document.createElement('div');
                    div.className = 'address-item';
                    div.textContent = pred.description;
                    div.style.cursor = 'pointer';
                    
                    div.addEventListener('click', function() {
                        document.getElementById('addressSearch').value = pred.description;
                        addressSuggestions.style.display = 'none';
                        
                        // Tentar extrair componentes do endereço
                        if (pred.place_id) {
                            obterDetalhesEndereco(pred.place_id);
                        }
                        
                        // Atualizar preview
                        updatePreview();
                    });
                    
                    addressSuggestions.appendChild(div);
                });
            } else {
                // Fallback - busca por CEP se tiver
                const cepMatch = query.match(/\d{5}-?\d{3}/);
                if (cepMatch) {
                    buscarPorCEP(cepMatch[0]);
                }
            }
        });
    }
};

function obterDetalhesEndereco(placeId) {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    service.getDetails({ placeId: placeId }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Preencher campos
            place.address_components.forEach(component => {
                const types = component.types;
                
                if (types.includes('street_number')) {
                    document.getElementById('number').value = component.long_name;
                } else if (types.includes('route')) {
                    document.getElementById('street').value = component.long_name;
                } else if (types.includes('sublocality') || types.includes('neighborhood')) {
                    document.getElementById('neighborhood').value = component.long_name;
                } else if (types.includes('locality')) {
                    document.getElementById('city').value = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    document.getElementById('state').value = component.short_name;
                } else if (types.includes('postal_code')) {
                    document.getElementById('cep').value = component.long_name;
                }
            });
        }
    });
}

function buscarPorCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    
    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById('street').value = data.logradouro;
                document.getElementById('neighborhood').value = data.bairro;
                document.getElementById('city').value = data.localidade;
                document.getElementById('state').value = data.uf;
                document.getElementById('cep').value = cepLimpo;
                
                const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                document.getElementById('addressSearch').value = endereco;
                
                updatePreview();
            }
        });
}

// Substituir listener de busca
document.addEventListener('DOMContentLoaded', function() {
    const addressSearch = document.getElementById('addressSearch');
    if (addressSearch) {
        let timeout;
        addressSearch.addEventListener('input', function() {
            clearTimeout(timeout);
            const query = this.value.trim();
            
            if (query.length >= 3) {
                timeout = setTimeout(() => {
                    buscarEnderecosCorrigido(query);
                }, 500);
            } else {
                document.getElementById('addressSuggestions').style.display = 'none';
            }
        });
    }
});

// =====================================================
// 3. CORRIGIR NOMENCLATURA DOS LOTES
// =====================================================

// Sobrescrever renomeação automática
window.renomearLotesAutomaticamente = function() {
    console.log('🔢 Renomeando lotes...');
    
    // Renomear lotes por data
    if (window.lotesData.porData) {
        window.lotesData.porData.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
        window.lotesData.porData.forEach((lote, index) => {
            lote.nome = `${index + 1}º Lote`;
        });
    }
    
    // Renomear lotes por percentual (INDEPENDENTE)
    if (window.lotesData.porPercentual) {
        window.lotesData.porPercentual.sort((a, b) => a.percentual - b.percentual);
        window.lotesData.porPercentual.forEach((lote, index) => {
            lote.nome = `${index + 1}º Lote`;
        });
    }
};

// =====================================================
// 4. CORRIGIR BOTÕES DOS LOTES
// =====================================================

// CSS para corrigir visual dos botões
const style = document.createElement('style');
style.textContent = `
    .lote-actions {
        display: flex;
        gap: 8px;
    }
    
    .lote-actions .btn-icon {
        background: transparent;
        border: 1px solid #dee2e6;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    }
    
    .lote-actions .btn-icon:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
    }
    
    .lote-actions .btn-icon.delete {
        color: #dc3545;
        border-color: #dc3545;
    }
    
    .lote-actions .btn-icon.delete:hover {
        background: #dc3545;
        color: white;
    }
`;
document.head.appendChild(style);

// Garantir que excluir funcione
window.excluirLote = function(loteId, tipo) {
    console.log('🗑️ Excluindo lote:', loteId, tipo);
    
    if (!confirm('Tem certeza que deseja excluir este lote?')) {
        return;
    }
    
    if (tipo === 'data') {
        window.lotesData.porData = window.lotesData.porData.filter(l => l.id !== loteId);
    } else {
        window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id !== loteId);
    }
    
    // Renomear e atualizar
    renomearLotesAutomaticamente();
    atualizarVisualizacaoLotes();
    
    // Salvar
    const dados = JSON.stringify(window.lotesData);
    document.cookie = `lotesData=${encodeURIComponent(dados)};path=/;max-age=${7*24*60*60}`;
    
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
};

// =====================================================
// 5. CORRIGIR RECUPERAÇÃO DE DADOS
// =====================================================

// Sistema definitivo de recuperação
window.recuperarDadosWizard = function() {
    console.log('🔄 Iniciando recuperação de dados...');
    
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
    
    if (!cookie) {
        console.log('❌ Nenhum cookie encontrado');
        return;
    }
    
    try {
        const value = decodeURIComponent(cookie.split('=')[1]);
        const data = JSON.parse(value);
        
        console.log('📋 Dados encontrados:', data);
        
        // Restaurar TODOS os campos
        Object.entries({
            'eventName': data.eventName,
            'classification': data.classification,
            'category': data.category,
            'startDateTime': data.startDateTime,
            'endDateTime': data.endDateTime,
            'venueName': data.venueName,
            'eventLink': data.eventLink,
            'addressSearch': data.addressSearch,
            'street': data.street,
            'number': data.number,
            'complement': data.complement,
            'neighborhood': data.neighborhood,
            'city': data.city,
            'state': data.state,
            'cep': data.cep
        }).forEach(([id, value]) => {
            if (value) {
                const campo = document.getElementById(id);
                if (campo) {
                    campo.value = value;
                    console.log(`✅ Restaurado: ${id} = ${value}`);
                }
            }
        });
        
        // Descrição
        if (data.eventDescription) {
            const desc = document.getElementById('eventDescription');
            if (desc) desc.innerHTML = data.eventDescription;
        }
        
        // Imagens
        if (data.logoUrl || data.logoPath) {
            const container = document.getElementById('logoPreviewContainer');
            if (container) {
                container.innerHTML = `<img src="${data.logoUrl || data.logoPath}" alt="logo">`;
            }
        }
        
        if (data.capaUrl || data.capaPath) {
            const container = document.getElementById('capaPreviewContainer');
            if (container) {
                container.innerHTML = `<img src="${data.capaUrl || data.capaPath}" alt="capa">`;
            }
        }
        
        if (data.fundoUrl || data.fundoPath) {
            const container = document.getElementById('fundoPreviewMain');
            if (container) {
                container.innerHTML = `<img src="${data.fundoUrl || data.fundoPath}" alt="fundo">`;
            }
        }
        
        // Cor
        if (data.corFundo) {
            document.getElementById('corFundo').value = data.corFundo;
            document.getElementById('corFundoHex').value = data.corFundo;
            const preview = document.getElementById('colorPreview');
            if (preview) preview.style.backgroundColor = data.corFundo;
        }
        
        // Switch de localização
        if (data.isPresential !== undefined) {
            const locationSwitch = document.getElementById('locationTypeSwitch');
            const presential = document.getElementById('presentialLocation');
            const online = document.getElementById('onlineLocation');
            
            if (data.isPresential) {
                locationSwitch.classList.add('active');
                presential.classList.add('show');
                online.classList.remove('show');
            } else {
                locationSwitch.classList.remove('active');
                presential.classList.remove('show');
                online.classList.add('show');
            }
        }
        
        // Termos
        if (data.acceptTerms) {
            const terms = document.getElementById('acceptTerms');
            if (terms) terms.checked = true;
        }
        
        // Lotes
        if (data.lotesData || data.lotes) {
            window.lotesData = data.lotesData || { porData: [], porPercentual: [] };
            if (window.atualizarVisualizacaoLotes) {
                window.atualizarVisualizacaoLotes();
            }
        }
        
        // Step
        if (data.currentStep > 1) {
            setTimeout(() => {
                if (window.goToStep) {
                    window.goToStep(data.currentStep);
                }
            }, 1000);
        }
        
        // Atualizar preview
        updatePreview();
        
        console.log('✅ Recuperação completa!');
        
    } catch (error) {
        console.error('❌ Erro na recuperação:', error);
    }
};

// Desabilitar outros sistemas de recuperação
window._jaRestaurou = true;
window._recuperacaoExecutada = true;
window._dadosJaRestaurados = true;

// Executar recuperação única
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar 2 segundos para garantir que tudo carregou
    setTimeout(() => {
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
        
        if (cookie && !window._recuperacaoRealizada) {
            window._recuperacaoRealizada = true;
            
            try {
                const value = decodeURIComponent(cookie.split('=')[1]);
                const data = JSON.parse(value);
                
                if (data.eventName) {
                    if (confirm(`Deseja continuar o evento "${data.eventName}"?`)) {
                        recuperarDadosWizard();
                    } else {
                        // Limpar cookies
                        document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
                        document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
                    }
                }
            } catch (e) {
                console.error('Erro:', e);
            }
        }
    }, 2000);
});

console.log('✅ Correções finais completas carregadas');