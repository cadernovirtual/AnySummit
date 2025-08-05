/**
 * Implementação correta da busca de endereço baseada no produtor_old
 */

(function() {
    'use strict';
    
    console.log('🔍 Implementação correta de busca de endereço');
    
    // Função global searchAddressManual
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
        if (!window.geocoder && typeof google !== 'undefined' && google.maps) {
            window.geocoder = new google.maps.Geocoder();
        }
        
        if (window.geocoder) {
            // Usar Geocoder do Google
            window.geocoder.geocode({ address: address }, function(results, status) {
                // Esconder loading
                if (loadingDiv) {
                    loadingDiv.style.display = 'none';
                }
                
                if (status === 'OK' && results.length > 0) {
                    const place = results[0];
                    console.log('📍 Endereço encontrado:', place);
                    
                    // Preencher campos
                    preencherCamposEndereco(place);
                    
                    // Atualizar mapa se existir
                    if (window.map && place.geometry) {
                        window.map.setCenter(place.geometry.location);
                        if (window.marker) {
                            window.marker.setPosition(place.geometry.location);
                        } else {
                            window.marker = new google.maps.Marker({
                                position: place.geometry.location,
                                map: window.map,
                                title: address
                            });
                        }
                    }
                } else {
                    console.error('❌ Nenhum endereço encontrado');
                    alert('Endereço não encontrado. Tente novamente com mais detalhes.');
                }
            });
        } else if (window.searchAddresses) {
            // Fallback para searchAddresses
            window.searchAddresses(address);
        } else {
            // Fallback manual
            console.log('⚠️ Usando preenchimento manual');
            preencherEnderecoManual(address);
        }
    };
    
    // Função para preencher campos com dados do Google
    function preencherCamposEndereco(place) {
        const addressData = {
            cep: '',
            rua: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: ''
        };
        
        // Extrair componentes do endereço
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
        if (document.getElementById('cep')) document.getElementById('cep').value = addressData.cep;
        if (document.getElementById('street')) document.getElementById('street').value = addressData.rua;
        if (document.getElementById('number')) document.getElementById('number').value = addressData.numero;
        if (document.getElementById('neighborhood')) document.getElementById('neighborhood').value = addressData.bairro;
        if (document.getElementById('city')) document.getElementById('city').value = addressData.cidade;
        if (document.getElementById('state')) document.getElementById('state').value = addressData.estado;
        
        // Preencher nome do local se vazio
        const venueInput = document.getElementById('venueName');
        if (venueInput && !venueInput.value) {
            venueInput.value = place.name || place.formatted_address.split(',')[0];
        }
        
        // Salvar coordenadas
        if (place.geometry && place.geometry.location) {
            const lat = typeof place.geometry.location.lat === 'function' 
                ? place.geometry.location.lat() 
                : place.geometry.location.lat;
            const lng = typeof place.geometry.location.lng === 'function' 
                ? place.geometry.location.lng() 
                : place.geometry.location.lng;
                
            if (document.getElementById('latitude')) document.getElementById('latitude').value = lat;
            if (document.getElementById('longitude')) document.getElementById('longitude').value = lng;
            
            window.selectedLocation = { lat, lng };
        }
        
        console.log('✅ Campos preenchidos:', addressData);
    }
    
    // Fallback para preenchimento manual
    function preencherEnderecoManual(address) {
        // Simular preenchimento básico
        const parts = address.split(',').map(p => p.trim());
        
        if (parts[0] && document.getElementById('street')) {
            document.getElementById('street').value = parts[0];
        }
        if (parts[1] && document.getElementById('neighborhood')) {
            document.getElementById('neighborhood').value = parts[1];
        }
        if (parts[2] && document.getElementById('city')) {
            document.getElementById('city').value = parts[2];
        }
        
        console.log('📝 Endereço preenchido manualmente');
    }
    
    // Configurar listeners
    document.addEventListener('DOMContentLoaded', function() {
        const addressInput = document.getElementById('addressSearch');
        
        if (addressInput) {
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
