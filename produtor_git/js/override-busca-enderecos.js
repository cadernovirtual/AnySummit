// =====================================================
// OVERRIDE FORÇADO - BUSCA DE ENDEREÇOS
// =====================================================

console.log('🚨 FORÇANDO CORREÇÃO DA BUSCA DE ENDEREÇOS...');

// Aguardar um pouco para garantir que outros scripts carregaram
setTimeout(() => {
    
    // FORÇAR SUBSTITUIÇÃO DA FUNÇÃO searchAddresses
    window.searchAddresses = function(query) {
        console.log('✅ [OVERRIDE] Buscando endereço:', query);
        
        const addressSuggestions = document.getElementById('addressSuggestions');
        if (!addressSuggestions) return;
        
        // USAR APENAS AUTOCOMPLETESERVICE
        if (window.google && google.maps && google.maps.places && google.maps.places.AutocompleteService) {
            const service = new google.maps.places.AutocompleteService();
            
            service.getPlacePredictions({
                input: query,
                componentRestrictions: { country: 'br' },
                language: 'pt-BR'
            }, function(predictions, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    addressSuggestions.innerHTML = '';
                    addressSuggestions.style.display = 'block';
                    
                    predictions.forEach(pred => {
                        const div = document.createElement('div');
                        div.className = 'address-item';
                        div.textContent = pred.description;
                        div.style.cursor = 'pointer';
                        
                        div.onclick = function() {
                            document.getElementById('addressSearch').value = pred.description;
                            addressSuggestions.style.display = 'none';
                            
                            // Extrair componentes se possível
                            if (pred.place_id && window.google.maps.places.PlacesService) {
                                const service = new google.maps.places.PlacesService(document.createElement('div'));
                                service.getDetails({ placeId: pred.place_id }, function(place, status) {
                                    if (status === 'OK' && place.address_components) {
                                        place.address_components.forEach(comp => {
                                            const types = comp.types;
                                            if (types.includes('street_number')) {
                                                document.getElementById('number').value = comp.long_name;
                                            } else if (types.includes('route')) {
                                                document.getElementById('street').value = comp.long_name;
                                            } else if (types.includes('neighborhood')) {
                                                document.getElementById('neighborhood').value = comp.long_name;
                                            } else if (types.includes('locality')) {
                                                document.getElementById('city').value = comp.long_name;
                                            } else if (types.includes('administrative_area_level_1')) {
                                                document.getElementById('state').value = comp.short_name;
                                            } else if (types.includes('postal_code')) {
                                                document.getElementById('cep').value = comp.long_name;
                                            }
                                        });
                                    }
                                });
                            }
                        };
                        
                        addressSuggestions.appendChild(div);
                    });
                } else {
                    addressSuggestions.innerHTML = '<div class="address-item">Nenhum endereço encontrado</div>';
                }
            });
        } else {
            console.error('❌ Google Maps API não carregada!');
        }
    };
    
    // REMOVER LISTENERS ANTIGOS E ADICIONAR NOVO
    const addressSearch = document.getElementById('addressSearch');
    if (addressSearch) {
        // Clonar para remover listeners
        const newAddressSearch = addressSearch.cloneNode(true);
        addressSearch.parentNode.replaceChild(newAddressSearch, addressSearch);
        
        let searchTimeout;
        
        // Adicionar novo listener
        newAddressSearch.addEventListener('input', function() {
            const query = this.value.trim();
            clearTimeout(searchTimeout);
            
            if (query.length < 3) {
                document.getElementById('addressSuggestions').style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                window.searchAddresses(query);
            }, 300);
        });
        
        console.log('✅ Listener de busca substituído');
    }
    
    // SUBSTITUIR BOTÃO DE BUSCA TAMBÉM
    const searchButton = document.querySelector('.search-address-btn');
    if (searchButton) {
        const newButton = searchButton.cloneNode(true);
        searchButton.parentNode.replaceChild(newButton, searchButton);
        
        newButton.onclick = function() {
            const query = document.getElementById('addressSearch').value;
            if (query) {
                window.searchAddresses(query);
            }
        };
        
        console.log('✅ Botão de busca substituído');
    }
    
}, 1000);

// GARANTIR QUE O MAPA SEJA INICIALIZADO
window.initMap = function() {
    console.log('✅ Google Maps inicializado');
};

console.log('✅ Override de busca de endereços carregado');