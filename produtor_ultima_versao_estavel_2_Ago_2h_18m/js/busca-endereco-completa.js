/**
 * Sistema completo de busca de endereços para o wizard
 * Baseado na implementação do produtor_old
 */

(function() {
    'use strict';
    
    console.log('🗺️ Sistema de busca de endereços iniciado');
    
    // Variáveis globais necessárias
    window.geocoder = null;
    window.autocompleteService = null;
    window.placesService = null;
    window.selectedLocation = null;
    
    // Função para inicializar o Google Maps (chamada quando a API carrega)
    window.initMap = function() {
        console.log('🌍 Inicializando Google Maps...');
        
        try {
            // Criar instâncias dos serviços
            window.geocoder = new google.maps.Geocoder();
            window.autocompleteService = new google.maps.places.AutocompleteService();
            
            // Criar um mapa invisível para o PlacesService
            const mapDiv = document.createElement('div');
            mapDiv.style.display = 'none';
            document.body.appendChild(mapDiv);
            const map = new google.maps.Map(mapDiv, {
                center: { lat: -23.550520, lng: -46.633308 },
                zoom: 13
            });
            window.placesService = new google.maps.places.PlacesService(map);
            
            console.log('✅ Google Maps inicializado com sucesso');
            
            // Inicializar sistema de busca
            initAddressSearch();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Google Maps:', error);
        }
    };
    
    // Função para inicializar o sistema de busca
    function initAddressSearch() {
        console.log('🔍 Inicializando sistema de busca de endereços...');
        
        const addressInput = document.getElementById('addressSearch');
        const addressSuggestions = document.getElementById('addressSuggestions');
        
        if (!addressInput || !addressSuggestions) {
            console.warn('⚠️ Elementos de busca não encontrados');
            return;
        }
        
        let searchTimeout;
        
        // Autocompletar ao digitar
        addressInput.addEventListener('input', function() {
            const query = this.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length < 3) {
                addressSuggestions.style.display = 'none';
                addressSuggestions.innerHTML = '';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                searchAddresses(query);
            }, 300);
        });
        
        // Fechar sugestões ao clicar fora
        document.addEventListener('click', function(e) {
            if (!addressInput.contains(e.target) && !addressSuggestions.contains(e.target)) {
                addressSuggestions.style.display = 'none';
            }
        });
        
        console.log('✅ Sistema de busca inicializado');
    }
    
    // Função para buscar endereços
    function searchAddresses(query) {
        console.log('🔍 Buscando endereços:', query);
        
        const addressSuggestions = document.getElementById('addressSuggestions');
        const loadingDiv = document.getElementById('addressLoading');
        
        // Mostrar loading
        if (loadingDiv) {
            loadingDiv.style.display = 'flex';
        }
        
        if (window.autocompleteService) {
            const request = {
                input: query + ', Brasil',
                componentRestrictions: { country: 'br' },
                types: ['establishment', 'geocode']
            };
            
            window.autocompleteService.getPlacePredictions(request, function(predictions, status) {
                // Esconder loading
                if (loadingDiv) {
                    loadingDiv.style.display = 'none';
                }
                
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                    displayAddressSuggestions(predictions);
                } else {
                    addressSuggestions.innerHTML = '<div class="no-results">Nenhum endereço encontrado</div>';
                    addressSuggestions.style.display = 'block';
                }
            });
        } else {
            console.warn('⚠️ AutocompleteService não disponível');
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
        }
    }
    
    // Função para exibir sugestões
    function displayAddressSuggestions(predictions) {
        const addressSuggestions = document.getElementById('addressSuggestions');
        
        addressSuggestions.innerHTML = '';
        
        predictions.forEach(prediction => {
            const suggestion = document.createElement('div');
            suggestion.className = 'address-suggestion';
            suggestion.innerHTML = `
                <div class="address-suggestion-main">${prediction.structured_formatting.main_text}</div>
                <div class="address-suggestion-secondary">${prediction.structured_formatting.secondary_text}</div>
            `;
            
            suggestion.addEventListener('click', () => selectAddress(prediction));
            addressSuggestions.appendChild(suggestion);
        });
        
        addressSuggestions.style.display = 'block';
    }
    
    // Função para selecionar um endereço
    function selectAddress(prediction) {
        console.log('📍 Endereço selecionado:', prediction.description);
        
        const addressInput = document.getElementById('addressSearch');
        const addressSuggestions = document.getElementById('addressSuggestions');
        
        // Preencher campo de busca
        if (addressInput) {
            addressInput.value = prediction.description;
        }
        
        // Esconder sugestões
        if (addressSuggestions) {
            addressSuggestions.style.display = 'none';
        }
        
        // Buscar detalhes do local
        if (window.placesService) {
            getPlaceDetails(prediction.place_id);
        }
    }
    
    // Função para buscar detalhes do local
    function getPlaceDetails(placeId) {
        const loadingDiv = document.getElementById('addressLoading');
        
        // Mostrar loading
        if (loadingDiv) {
            loadingDiv.style.display = 'flex';
        }
        
        const request = {
            placeId: placeId,
            fields: ['address_components', 'geometry', 'name', 'formatted_address']
        };
        
        window.placesService.getDetails(request, function(place, status) {
            // Esconder loading
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
            
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                fillAddressFields(place);
                
                // Salvar coordenadas
                if (place.geometry && place.geometry.location) {
                    window.selectedLocation = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    console.log('📍 Coordenadas salvas:', window.selectedLocation);
                }
            } else {
                console.error('❌ Erro ao obter detalhes do local:', status);
            }
        });
    }
    
    // Função para preencher os campos do formulário
    function fillAddressFields(place) {
        console.log('📝 Preenchendo campos do formulário...');
        
        const addressData = {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            cep: ''
        };
        
        // Processar componentes do endereço
        if (place.address_components) {
            place.address_components.forEach(component => {
                const types = component.types;
                
                if (types.includes('route')) {
                    addressData.street = component.long_name;
                }
                if (types.includes('street_number')) {
                    addressData.number = component.long_name;
                }
                if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                    addressData.neighborhood = component.long_name;
                }
                if (types.includes('administrative_area_level_2') || types.includes('locality')) {
                    addressData.city = component.long_name;
                }
                if (types.includes('administrative_area_level_1')) {
                    addressData.state = component.short_name;
                }
                if (types.includes('postal_code')) {
                    addressData.cep = component.long_name;
                }
            });
        }
        
        // Preencher campos
        const campos = {
            'street': addressData.street,
            'number': addressData.number,
            'neighborhood': addressData.neighborhood,
            'city': addressData.city,
            'state': addressData.state,
            'cep': addressData.cep
        };
        
        Object.keys(campos).forEach(id => {
            const campo = document.getElementById(id);
            if (campo && campos[id]) {
                campo.value = campos[id];
                // Remover readonly se existir
                campo.removeAttribute('readonly');
            }
        });
        
        // Preencher nome do local
        const venueNameInput = document.getElementById('venueName');
        if (venueNameInput && place.name) {
            venueNameInput.value = place.name;
        }
        
        console.log('✅ Campos preenchidos:', addressData);
    }
    
    // Função para busca manual (botão)
    window.searchAddressManual = function() {
        const addressInput = document.getElementById('addressSearch');
        const query = addressInput ? addressInput.value.trim() : '';
        
        if (query.length < 3) {
            alert('Por favor, digite pelo menos 3 caracteres para buscar.');
            return;
        }
        
        console.log('🔍 Busca manual iniciada:', query);
        
        // Se tiver geocoder, usar para busca direta
        if (window.geocoder) {
            const loadingDiv = document.getElementById('addressLoading');
            
            if (loadingDiv) {
                loadingDiv.style.display = 'flex';
            }
            
            window.geocoder.geocode({ address: query + ', Brasil' }, function(results, status) {
                if (loadingDiv) {
                    loadingDiv.style.display = 'none';
                }
                
                if (status === 'OK' && results[0]) {
                    const place = results[0];
                    
                    // Criar objeto compatível com fillAddressFields
                    const placeData = {
                        address_components: place.address_components,
                        geometry: place.geometry,
                        name: place.formatted_address.split(',')[0],
                        formatted_address: place.formatted_address
                    };
                    
                    fillAddressFields(placeData);
                    
                    // Salvar coordenadas
                    if (place.geometry && place.geometry.location) {
                        window.selectedLocation = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        };
                    }
                } else {
                    alert('Endereço não encontrado. Tente ser mais específico.');
                }
            });
        } else {
            // Se não tiver geocoder, disparar busca por autocomplete
            searchAddresses(query);
        }
    };
    
    // Verificar se Google Maps já está carregado
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof google !== 'undefined' && google.maps) {
            console.log('Google Maps já carregado, inicializando...');
            initMap();
        } else {
            console.log('Aguardando Google Maps carregar...');
            // O initMap será chamado automaticamente quando a API carregar
        }
    });
    
})();
