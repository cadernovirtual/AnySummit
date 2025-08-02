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

// Listeners de busca removidos - implementados em busca-endereco-novo.js

console.log('✅ Correções do Google Maps carregadas');
