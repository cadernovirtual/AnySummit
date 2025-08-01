// Correções para Google Maps e busca de endereço
console.log('🗺️ Carregando correções do Google Maps...');

// Variáveis globais necessárias
window.map = null;
window.geocoder = null;
window.marker = null;
window.autocompleteService = null;
window.placesService = null;

// Função initMap corrigida
window.initMap = function() {
    console.log('🗺️ Inicializando Google Maps...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.log('⚠️ Elemento do mapa não encontrado - será criado quando necessário');
        return;
    }

    try {
        // Verificar se a API do Google Maps está carregada
        if (typeof google === 'undefined' || !google.maps) {
            console.error('❌ API do Google Maps não carregada');
            return;
        }

        // Criar mapa com estilo dark
        window.map = new google.maps.Map(mapElement, {
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

        window.geocoder = new google.maps.Geocoder();
        window.autocompleteService = new google.maps.places.AutocompleteService();
        window.placesService = new google.maps.places.PlacesService(window.map);

        console.log('✅ Google Maps inicializado com sucesso');
        mapElement.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Google Maps:', error);
        if (mapElement) {
            mapElement.innerHTML = '<div class="map-loading">Erro ao carregar o mapa</div>';
        }
    }
};

// Função searchAddressManual
window.searchAddressManual = function() {
    console.log('🔍 Buscando endereço manualmente...');
    
    const addressInput = document.getElementById('addressSearch');
    const address = addressInput?.value?.trim();
    
    if (!address) {
        alert('Por favor, digite um endereço para buscar.');
        return;
    }
    
    // Mostrar loading
    const loadingDiv = document.getElementById('addressLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    }
    
    // Verificar se geocoder está disponível
    if (!window.geocoder) {
        if (typeof google !== 'undefined' && google.maps) {
            window.geocoder = new google.maps.Geocoder();
        } else {
            console.error('❌ Geocoder não disponível');
            alert('Erro: Serviço de busca de endereços não disponível.');
            if (loadingDiv) loadingDiv.style.display = 'none';
            return;
        }
    }
    
    // Buscar endereço
    window.geocoder.geocode({ address: address }, function(results, status) {
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        if (status === 'OK' && results[0]) {
            console.log('✅ Endereço encontrado:', results[0]);
            preencherCamposEndereco(results[0]);
            
            // Mostrar no mapa se disponível
            if (window.map && results[0].geometry) {
                window.map.setCenter(results[0].geometry.location);
                window.map.setZoom(17);
                
                // Adicionar marcador
                if (window.marker) {
                    window.marker.setMap(null);
                }
                
                window.marker = new google.maps.Marker({
                    map: window.map,
                    position: results[0].geometry.location,
                    animation: google.maps.Animation.DROP
                });
                
                // Mostrar mapa se estiver oculto
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    mapElement.style.display = 'block';
                }
            }
        } else {
            console.error('❌ Erro na busca:', status);
            let mensagem = 'Endereço não encontrado. ';
            
            switch(status) {
                case 'ZERO_RESULTS':
                    mensagem += 'Tente ser mais específico.';
                    break;
                case 'OVER_QUERY_LIMIT':
                    mensagem += 'Muitas buscas. Aguarde um momento.';
                    break;
                case 'REQUEST_DENIED':
                    mensagem += 'Serviço negado. Verifique a configuração da API.';
                    break;
                default:
                    mensagem += 'Tente novamente.';
            }
            
            alert(mensagem);
        }
    });
};

// Função para preencher campos do endereço
function preencherCamposEndereco(place) {
    console.log('📝 Preenchendo campos do endereço...');
    
    const components = place.address_components || [];
    const addressData = {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        cep: ''
    };
    
    // Processar componentes do endereço
    components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
            addressData.number = component.long_name;
        }
        if (types.includes('route')) {
            addressData.street = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
            addressData.neighborhood = component.long_name;
        }
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            addressData.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            addressData.state = component.short_name;
        }
        if (types.includes('postal_code')) {
            addressData.cep = component.long_name;
        }
    });
    
    // Preencher os campos
    if (document.getElementById('street')) document.getElementById('street').value = addressData.street;
    if (document.getElementById('number')) document.getElementById('number').value = addressData.number;
    if (document.getElementById('neighborhood')) document.getElementById('neighborhood').value = addressData.neighborhood;
    if (document.getElementById('city')) document.getElementById('city').value = addressData.city;
    if (document.getElementById('state')) document.getElementById('state').value = addressData.state;
    if (document.getElementById('cep')) document.getElementById('cep').value = addressData.cep;
    
    // Preencher nome do local se vazio
    const venueNameInput = document.getElementById('venueName');
    if (venueNameInput && !venueNameInput.value) {
        venueNameInput.value = place.name || place.formatted_address.split(',')[0];
    }
    
    console.log('✅ Campos preenchidos:', addressData);
    
    // Salvar dados do wizard
    if (typeof window.saveWizardData === 'function') {
        window.saveWizardData();
    }
}

// Configurar busca automática ao sair do campo
document.addEventListener('DOMContentLoaded', function() {
    const addressInput = document.getElementById('addressSearch');
    
    if (addressInput) {
        // Buscar ao pressionar Enter
        addressInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchAddressManual();
            }
        });
        
        // Buscar ao sair do campo (com delay)
        let searchTimeout;
        addressInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value && value.length > 5) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchAddressManual();
                }, 500);
            }
        });
        
        console.log('✅ Listeners de busca de endereço configurados');
    }
});

console.log('✅ Correções do Google Maps carregadas');
