/**
 * SISTEMA DE AUTOCOMPLETAR INCREMENTAL DE ENDEREÇOS
 * Busca em tempo real conforme o usuário digita
 */

console.log('🔍 Carregando autocompletar de endereços...');

// NÃO remover - a função básica já foi definida em definir-funcao-busca.js
console.log('Função searchAddressManual atual:', typeof window.searchAddressManual);

// Variáveis globais
window.map = null;
window.geocoder = null;
window.autocompleteService = null;
let currentSuggestions = [];
let selectedIndex = -1;
let searchTimeout = null;

// Callback obrigatório do Google Maps
window.initMap = function() {
    console.log('🗺️ Google Maps API carregada');
    
    // Inicializar serviços
    window.geocoder = new google.maps.Geocoder();
    window.autocompleteService = new google.maps.places.AutocompleteService();
    
    console.log('✅ Serviços inicializados');
    
    // Inicializar autocompletar após pequeno delay
    setTimeout(inicializarAutocompletar, 500);
};

function inicializarAutocompletar() {
    console.log('🚀 Inicializando autocompletar...');
    
    const addressInput = document.getElementById('addressSearch');
    const suggestionsContainer = document.getElementById('addressSuggestions');
    const loadingDiv = document.getElementById('addressLoading');
    
    if (!addressInput) {
        console.error('❌ Campo addressSearch não encontrado');
        return;
    }
    
    console.log('✅ Elementos encontrados');
    
    // EVENTO PRINCIPAL - DIGITAR NO CAMPO
    addressInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        // Limpar timeout anterior
        clearTimeout(searchTimeout);
        
        // Limpar seleção
        selectedIndex = -1;
        
        if (query.length < 2) {
            esconderSugestoes();
            return;
        }
        
        console.log('🔍 Buscando para:', query);
        mostrarLoading(true);
        
        // Aguardar 300ms antes de buscar (debounce)
        searchTimeout = setTimeout(() => {
            buscarSugestoes(query);
        }, 300);
    });
    
    // NAVEGAÇÃO COM TECLADO
    addressInput.addEventListener('keydown', function(e) {
        if (!suggestionsContainer || suggestionsContainer.style.display === 'none') {
            return;
        }
        
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                atualizarSelecao(items);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                atualizarSelecao(items);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    selecionarSugestao(currentSuggestions[selectedIndex]);
                } else {
                    searchAddressManual();
                }
                break;
                
            case 'Escape':
                esconderSugestoes();
                break;
        }
    });
    
    // BUSCA MANUAL MELHORADA (substitui a função básica)
    window.searchAddressManual = function() {
        console.log('🎯 Busca manual MELHORADA iniciada');
        
        const query = addressInput.value.trim();
        if (!query) {
            alert('Digite um endereço para buscar');
            addressInput.focus();
            return;
        }
        
        esconderSugestoes();
        mostrarLoading(true);
        
        console.log('📡 Geocoding:', query);
        
        window.geocoder.geocode({
            address: query,
            componentRestrictions: { country: 'BR' }
        }, function(results, status) {
            mostrarLoading(false);
            
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                console.log('✅ Endereço encontrado (versão melhorada)');
                preencherCamposEndereco(results[0]);
                alert('✅ Endereço encontrado e campos preenchidos!');
            } else {
                console.error('❌ Erro:', status);
                alert('Endereço não encontrado. Tente ser mais específico.');
            }
        });
    };
    
    console.log('✅ Função searchAddressManual MELHORADA definida');
    
    console.log('✅ Autocompletar configurado');
}

// Buscar sugestões do Google Places
function buscarSugestoes(query) {
    if (!window.autocompleteService) {
        console.error('❌ AutocompleteService não disponível');
        mostrarLoading(false);
        return;
    }
    
    window.autocompleteService.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'br' },
        language: 'pt-BR',
        types: ['address', 'establishment', 'geocode']
    }, function(predictions, status) {
        mostrarLoading(false);
        
        console.log('📋 Status:', status, 'Resultados:', predictions?.length || 0);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            currentSuggestions = predictions;
            mostrarSugestoes(predictions);
        } else {
            currentSuggestions = [];
            mostrarMensagemSemResultados();
        }
    });
}

// Mostrar sugestões na interface
function mostrarSugestoes(predictions) {
    const container = document.getElementById('addressSuggestions');
    if (!container) return;
    
    container.innerHTML = '';
    selectedIndex = -1;
    
    predictions.forEach((prediction, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        // Separar endereço principal dos detalhes
        const parts = prediction.description.split(',');
        const main = parts[0];
        const details = parts.slice(1).join(',').trim();
        
        item.innerHTML = `
            <div class="suggestion-icon">📍</div>
            <div class="suggestion-text">
                <div class="suggestion-main">${main}</div>
                ${details ? `<div class="suggestion-detail">${details}</div>` : ''}
            </div>
        `;
        
        // Clique na sugestão
        item.addEventListener('click', () => {
            selecionarSugestao(prediction);
        });
        
        // Hover
        item.addEventListener('mouseenter', () => {
            selectedIndex = index;
            atualizarSelecaoVisual();
        });
        
        container.appendChild(item);
    });
    
    container.style.display = 'block';
    container.classList.add('show');
    
    console.log(`✅ ${predictions.length} sugestões exibidas`);
}

// Mostrar mensagem quando não há resultados
function mostrarMensagemSemResultados() {
    const container = document.getElementById('addressSuggestions');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-results">
            <div>Nenhum endereço encontrado</div>
            <div style="font-size: 12px; margin-top: 5px;">Tente ser mais específico</div>
        </div>
    `;
    
    container.style.display = 'block';
    container.classList.add('show');
}

// Selecionar uma sugestão
function selecionarSugestao(prediction) {
    console.log('🎯 Selecionando:', prediction.description);
    
    const addressInput = document.getElementById('addressSearch');
    addressInput.value = prediction.description;
    
    esconderSugestoes();
    mostrarLoading(true);
    
    // Buscar detalhes completos do local
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    service.getDetails({
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'address_components', 'geometry']
    }, function(place, status) {
        mostrarLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            console.log('✅ Detalhes obtidos');
            preencherCamposEndereco(place);
        } else {
            console.error('❌ Erro ao obter detalhes:', status);
            // Fallback: tentar geocoding direto
            searchAddressManual();
        }
    });
}

// Atualizar seleção com teclado
function atualizarSelecao(items) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('highlighted');
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// Atualizar seleção visual
function atualizarSelecaoVisual() {
    const items = document.querySelectorAll('.suggestion-item');
    atualizarSelecao(items);
}

// Esconder sugestões
function esconderSugestoes() {
    const container = document.getElementById('addressSuggestions');
    if (container) {
        container.style.display = 'none';
        container.classList.remove('show');
        container.innerHTML = '';
    }
    currentSuggestions = [];
    selectedIndex = -1;
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
    
    console.log('✅ Campos preenchidos');
}

// Preencher campo individual
function preencherCampo(id, valor) {
    const campo = document.getElementById(id);
    if (campo && valor) {
        campo.value = valor;
        campo.dispatchEvent(new Event('change', { bubbles: true }));
        campo.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Fechar sugestões ao clicar fora
document.addEventListener('click', function(e) {
    const addressInput = document.getElementById('addressSearch');
    const suggestions = document.getElementById('addressSuggestions');
    
    if (addressInput && suggestions &&
        !addressInput.contains(e.target) &&
        !suggestions.contains(e.target)) {
        esconderSugestoes();
    }
});

// Função de teste
window.testarAutocompletar = function() {
    console.log('🧪 TESTE AUTOCOMPLETAR:');
    console.log('- Google Maps:', typeof google);
    console.log('- AutocompleteService:', !!window.autocompleteService);
    console.log('- Geocoder:', !!window.geocoder);
    console.log('- Campo:', !!document.getElementById('addressSearch'));
    
    const campo = document.getElementById('addressSearch');
    if (campo) {
        campo.value = 'Av Paulista';
        campo.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('🎯 Simulando digitação...');
    }
};

console.log('📋 Autocompletar carregado. Aguardando Google Maps...');
