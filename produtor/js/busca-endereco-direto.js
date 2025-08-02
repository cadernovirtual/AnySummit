/**
 * BUSCA INCREMENTAL DE ENDEREÇOS - DROPDOWN COM SUGESTÕES
 * Mostra sugestões conforme digita + lista maior ao buscar
 */

console.log('🔍 Carregando busca incremental de endereços...');

// Variáveis globais
window.autocompleteService = null;
window.geocoder = null;
window.map = null;
window.marker = null;
let searchTimeout = null;
let isDropdownVisible = false;

// CALLBACK OBRIGATÓRIO DO GOOGLE MAPS
window.initMap = function() {
    console.log('🗺️ Google Maps API carregada via callback initMap');
    
    // Verificar se Places API está disponível
    if (!google.maps.places) {
        console.error('❌ Places API não carregada!');
        alert('Erro: Google Places API não foi carregada. Verifique a configuração.');
        return;
    }
    
    try {
        // Inicializar serviços
        window.geocoder = new google.maps.Geocoder();
        window.autocompleteService = new google.maps.places.AutocompleteService();
        
        // Inicializar mapa
        inicializarMapa();
        
        console.log('✅ Geocoder inicializado');
        console.log('✅ AutocompleteService inicializado');
        console.log('✅ Mapa inicializado');
        
        // Configurar busca incremental
        setTimeout(configurarBuscaIncremental, 500);
        
    } catch (error) {
        console.error('❌ Erro ao inicializar serviços:', error);
        alert('Erro ao inicializar Google Maps. Recarregue a página.');
    }
};

// Inicializar mapa
function inicializarMapa() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.warn('⚠️ Container do mapa não encontrado');
        return;
    }
    
    // Configuração inicial do mapa (centro no Brasil)
    const mapOptions = {
        zoom: 10,
        center: { lat: -23.5505, lng: -46.6333 }, // São Paulo como padrão
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ color: '#1e1e2e' }]
            },
            {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#e1e5f2' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{ color: '#00C2FF' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry.fill',
                stylers: [{ color: '#2d2d44' }]
            }
        ]
    };
    
    window.map = new google.maps.Map(mapContainer, mapOptions);
    console.log('✅ Mapa criado');
}

function configurarBuscaIncremental() {
    console.log('🚀 Configurando busca incremental...');
    
    const addressInput = document.getElementById('addressSearch');
    const suggestionsContainer = document.getElementById('addressSuggestions');
    
    if (!addressInput || !suggestionsContainer) {
        console.error('❌ Elementos não encontrados');
        return;
    }
    
    // EVENTO PRINCIPAL - DIGITAR (busca incremental)
    addressInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            esconderDropdown();
            return;
        }
        
        console.log('🔍 Busca incremental para:', query);
        
        // Debounce - aguardar 400ms antes de buscar
        searchTimeout = setTimeout(() => {
            buscarSugestoesIncrementais(query, 6); // Máximo 6 sugestões
        }, 400);
    });
    
    // NAVEGAÇÃO COM TECLADO
    addressInput.addEventListener('keydown', function(e) {
        if (!isDropdownVisible) return;
        
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        let selectedIndex = -1;
        
        // Encontrar item selecionado atual
        items.forEach((item, index) => {
            if (item.classList.contains('selected')) {
                selectedIndex = index;
            }
        });
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                atualizarSelecao(items, selectedIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                atualizarSelecao(items, selectedIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                } else {
                    // Se não há seleção, executar busca manual
                    window.searchAddressManual();
                }
                break;
                
            case 'Escape':
                esconderDropdown();
                break;
        }
    });
    
    console.log('✅ Busca incremental configurada');
}

// BUSCA MANUAL (botão) - lista maior
window.searchAddressManual = function() {
    console.log('🎯 Busca manual - lista expandida');
    
    const addressInput = document.getElementById('addressSearch');
    const query = addressInput.value.trim();
    
    if (!query) {
        alert('Digite um endereço para buscar');
        addressInput.focus();
        return;
    }
    
    if (query.length < 2) {
        alert('Digite pelo menos 2 caracteres');
        return;
    }
    
    // VERIFICAR SE GOOGLE MAPS ESTÁ DISPONÍVEL
    if (typeof google === 'undefined' || !google.maps) {
        console.warn('❌ Google Maps não carregado');
        alert('Aguarde o Google Maps carregar e tente novamente.');
        return;
    }
    
    // INICIALIZAR SERVIÇOS SE NECESSÁRIO
    if (!window.autocompleteService) {
        console.log('🔧 Inicializando AutocompleteService...');
        try {
            window.autocompleteService = new google.maps.places.AutocompleteService();
            console.log('✅ AutocompleteService criado');
        } catch (error) {
            console.error('❌ Erro ao criar AutocompleteService:', error);
            alert('Erro ao inicializar serviço de busca. Recarregue a página.');
            return;
        }
    }
    
    if (!window.geocoder) {
        console.log('🔧 Inicializando Geocoder...');
        window.geocoder = new google.maps.Geocoder();
    }
    
    console.log('📡 Buscando lista expandida para:', query);
    mostrarLoading(true);
    
    // Buscar lista maior (15 sugestões)
    buscarSugestoesIncrementais(query, 15);
};

// Buscar sugestões do Google Places
function buscarSugestoesIncrementais(query, maxResultados) {
    console.log(`🔍 buscarSugestoesIncrementais chamada - query: "${query}", max: ${maxResultados}`);
    
    // VERIFICAR NOVAMENTE SE SERVIÇOS ESTÃO DISPONÍVEIS
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.error('❌ Google Maps Places API não disponível');
        mostrarLoading(false);
        alert('Google Maps não carregou corretamente. Recarregue a página.');
        return;
    }
    
    // CRIAR AUTOCOMPLETE SERVICE SE NÃO EXISTIR
    if (!window.autocompleteService) {
        console.log('🔧 Criando AutocompleteService dentro da função...');
        try {
            window.autocompleteService = new google.maps.places.AutocompleteService();
            console.log('✅ AutocompleteService criado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar AutocompleteService:', error);
            mostrarLoading(false);
            alert('Erro ao inicializar busca. Verifique sua conexão.');
            return;
        }
    }
    
    console.log('🔍 Executando getPlacePredictions...');
    
    window.autocompleteService.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'br' },
        language: 'pt-BR',
        types: ['address', 'establishment', 'geocode']
    }, function(predictions, status) {
        console.log(`📋 Callback executado - Status: ${status}`);
        console.log(`📋 Predictions:`, predictions);
        
        mostrarLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log(`✅ ${predictions.length} resultados encontrados`);
            // Limitar ao número máximo de resultados
            const limitedPredictions = predictions.slice(0, maxResultados);
            mostrarDropdownSugestoes(limitedPredictions, maxResultados > 10);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.warn('⚠️ Nenhum resultado encontrado');
            mostrarMensagemSemResultados();
        } else {
            console.error('❌ Erro na busca:', status);
            // Fallback: tentar geocoding direto
            console.log('🔄 Tentando fallback com Geocoder...');
            tentarGeocodingFallback(query);
        }
    });
}

// Fallback usando Geocoder quando AutocompleteService falha
function tentarGeocodingFallback(query) {
    console.log('🔄 Tentando geocoding fallback para:', query);
    
    if (!window.geocoder) {
        window.geocoder = new google.maps.Geocoder();
    }
    
    window.geocoder.geocode({
        address: query,
        componentRestrictions: { country: 'BR' }
    }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            console.log('✅ Geocoding fallback bem-sucedido');
            
            // Converter resultados do geocoder para formato de sugestões
            const suggestions = results.slice(0, 10).map((result, index) => ({
                description: result.formatted_address,
                place_id: result.place_id,
                types: result.types,
                geometry: result.geometry
            }));
            
            mostrarDropdownSugestoes(suggestions, true);
        } else {
            console.error('❌ Geocoding fallback também falhou:', status);
            mostrarMensagemSemResultados();
        }
    });
}

// Mostrar dropdown com sugestões
function mostrarDropdownSugestoes(predictions, isListaExpandida) {
    const container = document.getElementById('addressSuggestions');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Cabeçalho se for lista expandida
    if (isListaExpandida && predictions.length > 0) {
        const header = document.createElement('div');
        header.className = 'suggestions-header';
        header.innerHTML = `
            <div style="padding: 12px 15px; background: #f8f9ff; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #333;">
                📍 ${predictions.length} endereços encontrados
            </div>
        `;
        container.appendChild(header);
    }
    
    // Criar items de sugestão
    predictions.forEach((prediction, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        // Separar endereço em partes
        const parts = prediction.description.split(',');
        const mainAddress = parts[0].trim();
        const details = parts.slice(1).join(',').trim();
        
        // Determinar ícone baseado no tipo
        let icon = '📍';
        if (prediction.types.includes('establishment')) {
            icon = '🏢';
        } else if (prediction.types.includes('street_address')) {
            icon = '🏠';
        }
        
        item.innerHTML = `
            <div class="suggestion-icon">${icon}</div>
            <div class="suggestion-content">
                <div class="suggestion-main">${mainAddress}</div>
                ${details ? `<div class="suggestion-details">${details}</div>` : ''}
            </div>
            <div class="suggestion-arrow">→</div>
        `;
        
        // Evento de clique
        item.addEventListener('click', function(e) {
            e.preventDefault();
            selecionarEndereco(prediction);
        });
        
        // Hover
        item.addEventListener('mouseenter', function() {
            // Remover seleção anterior
            container.querySelectorAll('.suggestion-item').forEach(i => i.classList.remove('selected'));
            // Adicionar seleção atual
            this.classList.add('selected');
        });
        
        container.appendChild(item);
    });
    
    // Mostrar container
    container.style.display = 'block';
    container.classList.add('show');
    isDropdownVisible = true;
    
    console.log(`✅ ${predictions.length} sugestões exibidas${isListaExpandida ? ' (lista expandida)' : ''}`);
}

// Mostrar mensagem quando não há resultados
function mostrarMensagemSemResultados() {
    const container = document.getElementById('addressSuggestions');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <div class="no-results-text">Nenhum endereço encontrado</div>
            <div class="no-results-hint">Tente usar termos como "Rua", "Avenida" ou nome da cidade</div>
        </div>
    `;
    
    container.style.display = 'block';
    container.classList.add('show');
    isDropdownVisible = true;
    
    // Esconder após 3 segundos
    setTimeout(esconderDropdown, 3000);
}

// Selecionar um endereço da lista
function selecionarEndereco(prediction) {
    console.log('🎯 Endereço selecionado:', prediction.description);
    
    const addressInput = document.getElementById('addressSearch');
    addressInput.value = prediction.description;
    
    esconderDropdown();
    mostrarLoading(true);
    
    // Buscar detalhes completos usando Places API
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    service.getDetails({
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'address_components', 'geometry', 'types']
    }, function(place, status) {
        mostrarLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            console.log('✅ Detalhes obtidos:', place.formatted_address);
            preencherCamposEndereco(place);
            
            // Mostrar confirmação
            setTimeout(() => {
                alert(`✅ Endereço selecionado:\n${place.formatted_address}\n\nCampos preenchidos automaticamente!`);
            }, 500);
        } else {
            console.error('❌ Erro ao obter detalhes:', status);
            alert('Erro ao obter detalhes do endereço. Tente novamente.');
        }
    });
}

// Atualizar seleção com teclado
function atualizarSelecao(items, selectedIndex) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Esconder dropdown
function esconderDropdown() {
    const container = document.getElementById('addressSuggestions');
    if (container) {
        container.style.display = 'none';
        container.classList.remove('show');
        container.innerHTML = '';
    }
    isDropdownVisible = false;
}

// Mostrar/esconder loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('addressLoading');
    if (loading) {
        if (mostrar) {
            loading.style.display = 'flex';
            loading.classList.add('active');
        } else {
            loading.style.display = 'none';
            loading.classList.remove('active');
        }
    }
}

// Preencher campos do endereço
function preencherCamposEndereco(place) {
    console.log('📝 Preenchendo campos:', place.formatted_address);
    
    const components = place.address_components || [];
    const dados = {};
    
    // Extrair coordenadas
    let latitude = null;
    let longitude = null;
    
    if (place.geometry && place.geometry.location) {
        if (typeof place.geometry.location.lat === 'function') {
            latitude = place.geometry.location.lat();
            longitude = place.geometry.location.lng();
        } else {
            latitude = place.geometry.location.lat;
            longitude = place.geometry.location.lng;
        }
        
        console.log('📍 Coordenadas:', latitude, longitude);
        
        // Atualizar mapa
        atualizarMapa(latitude, longitude, place.formatted_address);
    }
    
    // Extrair componentes
    components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
            dados.number = component.long_name;
        }
        if (types.includes('route')) {
            dados.street = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
            dados.neighborhood = component.long_name;
        }
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            dados.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            dados.state = component.short_name;
        }
        if (types.includes('postal_code')) {
            dados.cep = component.long_name;
        }
    });
    
    // Preencher campos
    preencherCampo('street', dados.street);
    preencherCampo('number', dados.number);
    preencherCampo('neighborhood', dados.neighborhood);
    preencherCampo('city', dados.city);
    preencherCampo('state', dados.state);
    preencherCampo('cep', dados.cep);
    
    // LIMPAR campo complemento ao autocompletar
    preencherCampo('complement', '');
    console.log('🧹 Campo complemento limpo no autocompletar');
    
    // Preencher coordenadas (campos ocultos)
    preencherCampo('latitude', latitude);
    preencherCampo('longitude', longitude);
    
    // Salvar coordenadas globalmente para uso posterior
    window.eventoLatitude = latitude;
    window.eventoLongitude = longitude;
    
    // Nome do local
    const venueField = document.getElementById('venueName');
    if (venueField && !venueField.value.trim()) {
        venueField.value = place.name || dados.street || place.formatted_address.split(',')[0];
    }
    
    // Mostrar campos
    const addressFields = document.getElementById('addressFields');
    if (addressFields) {
        addressFields.style.display = 'block';
        addressFields.classList.remove('hidden');
    }
    
    // Adicionar indicador de localização encontrada
    mostrarIndicadorLocalizacao(place.formatted_address);
    
    console.log('✅ Campos preenchidos com coordenadas:', { latitude, longitude });
}

// Atualizar mapa com nova localização
function atualizarMapa(lat, lng, endereco) {
    if (!window.map) {
        console.warn('⚠️ Mapa não inicializado');
        return;
    }
    
    const position = { lat: lat, lng: lng };
    
    // Centralizar mapa na nova posição
    window.map.setCenter(position);
    window.map.setZoom(16);
    
    // Remover marcador anterior se existir
    if (window.marker) {
        window.marker.setMap(null);
    }
    
    // Criar novo marcador
    window.marker = new google.maps.Marker({
        position: position,
        map: window.map,
        title: endereco,
        animation: google.maps.Animation.DROP,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#00C2FF" stroke="#FFFFFF" stroke-width="3"/>
                    <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
                    <text x="20" y="25" text-anchor="middle" fill="#00C2FF" font-size="12">📍</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
        }
    });
    
    // Mostrar InfoWindow com endereço
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 8px; font-family: Inter, sans-serif;">
                <div style="font-weight: 600; color: #333; margin-bottom: 4px;">📍 Local do Evento</div>
                <div style="color: #666; font-size: 14px;">${endereco}</div>
                <div style="color: #999; font-size: 12px; margin-top: 4px;">
                    Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}
                </div>
            </div>
        `
    });
    
    // Mostrar InfoWindow
    infoWindow.open(window.map, window.marker);
    
    // Mostrar container do mapa se estiver oculto
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.display = 'block';
        mapContainer.style.height = '300px';
        
        // Reajustar mapa após mostrar
        setTimeout(() => {
            google.maps.event.trigger(window.map, 'resize');
            window.map.setCenter(position);
        }, 100);
    }
    
    console.log('🗺️ Mapa atualizado:', endereco, { lat, lng });
}

// Mostrar indicador de localização encontrada
function mostrarIndicadorLocalizacao(endereco) {
    // Remover indicador anterior se existir
    const indicadorAnterior = document.querySelector('.location-found-indicator');
    if (indicadorAnterior) {
        indicadorAnterior.remove();
    }
    
    // Criar novo indicador
    const indicador = document.createElement('div');
    indicador.className = 'location-found-indicator';
    indicador.innerHTML = `Localização confirmada: ${endereco}`;
    
    // Adicionar após o campo de busca
    const addressWrapper = document.querySelector('.address-input-wrapper');
    if (addressWrapper) {
        addressWrapper.appendChild(indicador);
        
        // Animar entrada
        setTimeout(() => {
            indicador.style.opacity = '1';
            indicador.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Preencher campo individual
function preencherCampo(id, valor) {
    const campo = document.getElementById(id);
    if (campo) {
        // Se o valor é vazio, limpar o campo
        campo.value = valor || '';
        campo.dispatchEvent(new Event('change', { bubbles: true }));
        campo.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', function(e) {
    const addressInput = document.getElementById('addressSearch');
    const suggestions = document.getElementById('addressSuggestions');
    
    if (addressInput && suggestions &&
        !addressInput.contains(e.target) &&
        !suggestions.contains(e.target)) {
        esconderDropdown();
    }
});

// Função de teste
window.testarBuscaIncremental = function() {
    console.log('🧪 Teste da busca incremental...');
    
    const campo = document.getElementById('addressSearch');
    if (campo) {
        campo.value = 'Av Paulista';
        console.log('🎯 Simulando digitação...');
        campo.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.error('Campo não encontrado');
    }
};

console.log('✅ Busca incremental configurada. Use testarBuscaIncremental() para testar.');
