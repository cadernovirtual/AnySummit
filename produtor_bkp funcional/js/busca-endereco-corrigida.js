/**
 * Implementação correta da busca de endereços baseada no produtor_old
 */

(function() {
    'use strict';
    
    console.log('🔍 Sistema de busca de endereços carregado');
    
    // Função principal de busca manual
    window.searchAddressManual = function() {
        console.log('🔍 Buscando endereço manualmente...');
        
        const addressInput = document.getElementById('addressSearch');
        const address = addressInput?.value?.trim();
        
        if (!address || address.length < 3) {
            alert('Por favor, digite pelo menos 3 caracteres para buscar.');
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
                console.error('❌ Google Maps não está carregado');
                if (loadingDiv) loadingDiv.style.display = 'none';
                alert('Erro ao carregar Google Maps. Por favor, recarregue a página.');
                return;
            }
        }
        
        // Fazer geocoding
        window.geocoder.geocode({ address: address + ', Brasil' }, function(results, status) {
            // Esconder loading
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
            
            if (status === 'OK' && results.length > 0) {
                const place = results[0];
                console.log('✅ Endereço encontrado:', place);
                
                // Preencher campos
                preencherCamposEndereco(place);
                
                // Atualizar mapa se existir
                if (window.map && window.marker) {
                    window.map.setCenter(place.geometry.location);
                    window.marker.setPosition(place.geometry.location);
                    
                    // Mostrar o mapa
                    const mapContainer = document.getElementById('map');
                    if (mapContainer) {
                        mapContainer.style.display = 'block';
                        
                        setTimeout(() => {
                            google.maps.event.trigger(window.map, 'resize');
                            window.map.setCenter(place.geometry.location);
                        }, 300);
                    }
                }
                
                // Salvar coordenadas
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                
                const latInput = document.getElementById('latitude');
                const lngInput = document.getElementById('longitude');
                
                if (latInput) latInput.value = lat;
                if (lngInput) lngInput.value = lng;
                
            } else {
                console.error('❌ Endereço não encontrado:', status);
                alert('Endereço não encontrado. Tente ser mais específico.');
            }
        });
    };
    
    // Função para preencher campos com dados do endereço
    function preencherCamposEndereco(place) {
        const addressData = {
            cep: '',
            rua: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: ''
        };
        
        // Processar componentes do endereço
        if (place.address_components) {
            place.address_components.forEach(component => {
                const types = component.types;
                
                if (types.includes('postal_code')) {
                    addressData.cep = component.long_name;
                } else if (types.includes('route')) {
                    addressData.rua = component.long_name;
                } else if (types.includes('street_number')) {
                    addressData.numero = component.long_name;
                } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                    addressData.bairro = component.long_name;
                } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
                    addressData.cidade = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    addressData.estado = component.short_name;
                }
            });
        }
        
        // Preencher campos do formulário
        const campos = {
            cep: addressData.cep,
            street: addressData.rua,
            number: addressData.numero,
            neighborhood: addressData.bairro,
            city: addressData.cidade,
            state: addressData.estado
        };
        
        Object.keys(campos).forEach(id => {
            const campo = document.getElementById(id);
            if (campo && campos[id]) {
                campo.value = campos[id];
            }
        });
        
        // Preencher nome do local se vazio
        const venueNameInput = document.getElementById('venueName');
        if (venueNameInput && !venueNameInput.value) {
            venueNameInput.value = place.name || place.formatted_address.split(',')[0];
        }
        
        console.log('✅ Campos preenchidos:', addressData);
    }
    
    // Adicionar listeners ao carregar a página
    document.addEventListener('DOMContentLoaded', function() {
        const addressInput = document.getElementById('addressSearch');
        
        if (addressInput) {
            // Remover readonly
            addressInput.removeAttribute('readonly');
            
            // Buscar ao pressionar Enter
            addressInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.searchAddressManual();
                }
            });
            
            console.log('✅ Listeners de busca configurados');
        }
    });
    
})();
