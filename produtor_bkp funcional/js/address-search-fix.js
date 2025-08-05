/**
 * Melhorias para busca de endereço e coordenadas
 */

(function() {
    'use strict';
    
    // Função para buscar endereço manualmente
    window.searchAddressManual = function() {
        const addressInput = document.getElementById('addressSearch');
        const query = addressInput ? addressInput.value.trim() : '';
        
        if (query.length < 3) {
            alert('Digite pelo menos 3 caracteres para buscar');
            return;
        }
        
        console.log('🔍 Busca manual de endereço:', query);
        
        // Chamar a função de busca existente
        if (window.searchAddresses) {
            window.searchAddresses(query);
        } else if (window.searchAddress) {
            window.searchAddress(query);
        } else {
            console.error('Função searchAddresses não encontrada');
        }
    };
    
    // Melhorar a função selectAddress para salvar coordenadas
    const originalSelectAddress = window.selectAddress;
    if (originalSelectAddress) {
        window.selectAddress = function(prediction) {
            console.log('📍 Endereço selecionado:', prediction);
            
            // Chamar função original
            originalSelectAddress.apply(this, arguments);
            
            // Se temos place_id, buscar detalhes completos
            if (prediction.place_id && window.placesService) {
                const request = {
                    placeId: prediction.place_id,
                    fields: ['geometry', 'address_components', 'formatted_address']
                };
                
                window.placesService.getDetails(request, function(place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        
                        console.log('📍 Coordenadas obtidas:', lat, lng);
                        
                        // Salvar em campos hidden
                        const latInput = document.getElementById('latitude');
                        const lngInput = document.getElementById('longitude');
                        
                        if (latInput) latInput.value = lat;
                        if (lngInput) lngInput.value = lng;
                        
                        // Salvar também em variável global
                        window.selectedLocation = {
                            lat: lat,
                            lng: lng
                        };
                        
                        // Atualizar mapa se existir
                        if (window.map && window.marker) {
                            const position = new google.maps.LatLng(lat, lng);
                            window.map.setCenter(position);
                            window.marker.setPosition(position);
                            
                            // Mostrar o mapa
                            const mapContainer = document.getElementById('map');
                            if (mapContainer) {
                                mapContainer.style.display = 'block';
                                
                                // Forçar redimensionamento do mapa
                                setTimeout(() => {
                                    google.maps.event.trigger(window.map, 'resize');
                                    window.map.setCenter(position);
                                }, 300);
                            }
                        }
                    }
                });
            }
        };
    }
    
    // Garantir que campos de endereço não fiquem com "undefined"
    document.addEventListener('DOMContentLoaded', function() {
        const camposEndereco = ['cep', 'street', 'neighborhood', 'city', 'state'];
        
        camposEndereco.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo && campo.value === 'undefined') {
                campo.value = '';
            }
        });
    });
    
    console.log('✅ Melhorias de busca de endereço carregadas');
    
})();
