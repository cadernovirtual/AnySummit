/**
 * Melhorias para o sistema de endereço
 * Adiciona spinner e gerenciamento de campos
 * Copiado exatamente de produtor_git/js/address-improvements.js
 */

// Override da função initAddressSearch
const originalInitAddressSearch = window.initAddressSearch;

window.initAddressSearch = function() {
    const addressSearch = document.getElementById('addressSearch');
    const addressSuggestions = document.getElementById('addressSuggestions');
    const addressLoading = document.getElementById('addressLoading');
    const addressFields = document.getElementById('addressFields');
    
    if (!addressSearch) {
        console.error('Campo addressSearch não encontrado');
        return;
    }
    
    console.log('🔍 Inicializando busca de endereços with melhorias...');
    console.log('addressFields encontrado:', !!addressFields);
    
    let searchTimeout;
    
    // Mostrar campos quando houver valor preenchido
    function checkAddressFields() {
        const hasAddress = document.getElementById('street')?.value || 
                          document.getElementById('venueName')?.value;
        
        console.log('Verificando campos de endereço:', { hasAddress, addressFields: !!addressFields });
        
        if (hasAddress && addressFields) {
            console.log('Mostrando campos de endereço');
            addressFields.classList.remove('hidden');
            addressFields.style.display = 'block'; // Forçar display
        }
    }
    
    // Verificar no carregamento
    setTimeout(checkAddressFields, 500);

    addressSearch.addEventListener('input', function() {
        const query = this.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 3) {
            addressSuggestions.style.display = 'none';
            return;
        }
        
        // Mostrar loading
        if (addressLoading) {
            addressLoading.classList.add('active');
        }
        
        searchTimeout = setTimeout(() => {
            searchAddress(query);
        }, 500);
    });
    
    // Função de busca modificada
    async function searchAddress(query) {
        try {
            const service = new google.maps.places.AutocompleteService();
            
            service.getPlacePredictions({
                input: query,
                componentRestrictions: { country: 'br' },
                language: 'pt-BR'
            }, (predictions, status) => {
                // Esconder loading
                if (addressLoading) {
                    addressLoading.classList.remove('active');
                }
                
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    displaySuggestions(predictions);
                } else {
                    addressSuggestions.style.display = 'none';
                }
            });
        } catch (error) {
            console.error('Erro na busca:', error);
            if (addressLoading) {
                addressLoading.classList.remove('active');
            }
        }
    }
    
    // Função para exibir sugestões
    function displaySuggestions(predictions) {
        addressSuggestions.innerHTML = '';
        
        predictions.forEach(prediction => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = prediction.description;
            div.addEventListener('click', () => selectAddress(prediction));
            addressSuggestions.appendChild(div);
        });
        
        addressSuggestions.style.display = 'block';
    }
    
    // Função para selecionar endereço
    function selectAddress(prediction) {
        addressSearch.value = prediction.description;
        addressSuggestions.style.display = 'none';
        
        // Mostrar loading enquanto busca detalhes
        if (addressLoading) {
            addressLoading.classList.add('active');
        }
        
        // Buscar detalhes do local
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        service.getDetails({
            placeId: prediction.place_id,
            fields: ['name', 'formatted_address', 'address_components', 'geometry']
        }, (place, status) => {
            if (addressLoading) {
                addressLoading.classList.remove('active');
            }
            
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                fillAddressFields(place);
                
                // Mostrar campos após preencher
                if (addressFields) {
                    console.log('Mostrando campos após seleção de endereço');
                    addressFields.classList.remove('hidden');
                    addressFields.style.display = 'block'; // Forçar display
                    
                    // Garantir que a grid esteja visível
                    const locationGrid = document.querySelector('.location-grid');
                    if (locationGrid) {
                        locationGrid.style.display = 'grid';
                    }
                }
            }
        });
    }
    
    // Função para preencher campos
    function fillAddressFields(place) {
        console.log('Preenchendo campos com dados do lugar:', place.name);
        
        // Nome do local
        if (document.getElementById('venueName')) {
            document.getElementById('venueName').value = place.name || '';
        }
        
        // Processar componentes do endereço
        place.address_components.forEach(component => {
            const types = component.types;
            
            if (types.includes('postal_code')) {
                if (document.getElementById('cep')) {
                    document.getElementById('cep').value = component.long_name;
                }
            }
            
            if (types.includes('route')) {
                if (document.getElementById('street')) {
                    document.getElementById('street').value = component.long_name;
                }
            }
            
            if (types.includes('street_number')) {
                if (document.getElementById('number')) {
                    document.getElementById('number').value = component.long_name;
                }
            }
            
            if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                if (document.getElementById('neighborhood')) {
                    document.getElementById('neighborhood').value = component.long_name;
                }
            }
            
            if (types.includes('administrative_area_level_2') || types.includes('locality')) {
                if (document.getElementById('city')) {
                    document.getElementById('city').value = component.long_name;
                }
            }
            
            if (types.includes('administrative_area_level_1')) {
                if (document.getElementById('state')) {
                    document.getElementById('state').value = component.short_name;
                }
            }
        });
        
        // Disparar eventos de change para garantir que validações sejam atualizadas
        ['venueName', 'street', 'city'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        // Atualizar preview
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
        
        console.log('Campos preenchidos com sucesso');
    }
    
    // Fechar sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!addressSearch.contains(e.target) && !addressSuggestions.contains(e.target)) {
            addressSuggestions.style.display = 'none';
        }
    });
};

console.log('Melhorias do sistema de endereço carregadas');
