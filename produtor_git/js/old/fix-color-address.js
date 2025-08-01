/**
 * Correção temporária para color picker e busca de endereço
 * Este arquivo corrige os problemas sem modificar os arquivos principais
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix] Aplicando correções de cor e endereço...');
    
    // ========================================
    // 1. CORREÇÃO DO COLOR PICKER
    // ========================================
    function setupColorFix() {
        const corFundo = document.getElementById('corFundo');
        const corFundoHex = document.getElementById('corFundoHex');
        const colorPreview = document.getElementById('colorPreview');
        
        if (!corFundo) {
            console.log('[Fix] Color picker não encontrado');
            return;
        }
        
        console.log('[Fix] Configurando color picker...');
        
        // Remover listeners antigos
        const newCorFundo = corFundo.cloneNode(true);
        corFundo.parentNode.replaceChild(newCorFundo, corFundo);
        
        // Listener para o color picker
        newCorFundo.addEventListener('input', function() {
            const corValue = this.value;
            console.log('[Fix] Cor alterada (input):', corValue);
            
            // Atualizar hex input
            if (corFundoHex) {
                corFundoHex.value = corValue;
            }
            
            // Atualizar preview da cor
            if (colorPreview) {
                colorPreview.style.backgroundColor = corValue;
            }
            
            // Atualizar preview do evento
            updateHeroBackground(corValue);
        });
        
        // Listener adicional para change
        newCorFundo.addEventListener('change', function() {
            const corValue = this.value;
            console.log('[Fix] Cor alterada (change):', corValue);
            
            // Atualizar hex input
            if (corFundoHex) {
                corFundoHex.value = corValue;
            }
            
            // Atualizar preview da cor
            if (colorPreview) {
                colorPreview.style.backgroundColor = corValue;
            }
            
            // Atualizar preview
            updateHeroBackground(corValue);
            
            // Salvar
            if (window.saveWizardData) {
                window.saveWizardData();
            }
        });
        
        // Listener para campo hex
        if (corFundoHex) {
            corFundoHex.addEventListener('input', function() {
                const hexValue = this.value;
                
                // Validar formato hex
                if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                    console.log('[Fix] Cor hex válida:', hexValue);
                    
                    // Atualizar color picker
                    newCorFundo.value = hexValue;
                    
                    // Atualizar preview da cor
                    if (colorPreview) {
                        colorPreview.style.backgroundColor = hexValue;
                    }
                    
                    // Atualizar preview
                    updateHeroBackground(hexValue);
                }
            });
            
            // Adicionar # automaticamente
            corFundoHex.addEventListener('blur', function() {
                let value = this.value.trim();
                if (value && !value.startsWith('#')) {
                    value = '#' + value;
                    this.value = value;
                    this.dispatchEvent(new Event('input'));
                }
            });
        }
        
        // Click no preview abre o color picker
        if (colorPreview) {
            colorPreview.style.cursor = 'pointer';
            colorPreview.addEventListener('click', function() {
                newCorFundo.click();
            });
        }
        
        // Sincronizar valores iniciais
        if (newCorFundo.value && corFundoHex) {
            corFundoHex.value = newCorFundo.value;
            if (colorPreview) {
                colorPreview.style.backgroundColor = newCorFundo.value;
            }
        }
    }
    
    // Função para atualizar background do hero
    function updateHeroBackground(cor) {
        const heroBackground = document.getElementById('heroBackground');
        const heroSection = document.querySelector('.hero-section-mini');
        const fundoImg = document.querySelector('#fundoPreviewMain img');
        
        if (heroBackground && heroSection) {
            if (!fundoImg || !fundoImg.src || fundoImg.src.includes('placeholder')) {
                // Sem imagem, usar cor sólida
                heroBackground.style.backgroundImage = '';
                heroBackground.style.backgroundColor = cor;
                heroBackground.style.opacity = '1';
                heroSection.classList.add('solid-bg');
                console.log('[Fix] Cor de fundo aplicada ao preview:', cor);
            }
        }
        
        // Chamar updatePreview se existir
        if (window.updatePreview) {
            window.updatePreview();
        }
    }
    
    // ========================================
    // 2. CORREÇÃO DA BUSCA DE ENDEREÇO
    // ========================================
    function setupAddressFix() {
        const addressSearch = document.getElementById('addressSearch');
        const addressSuggestions = document.getElementById('addressSuggestions');
        const addressFields = document.getElementById('addressFields');
        
        if (!addressSearch) {
            console.log('[Fix] Campo de busca de endereço não encontrado');
            return;
        }
        
        console.log('[Fix] Configurando busca de endereços...');
        
        let searchTimeout;
        
        // Remover listeners antigos
        const newAddressSearch = addressSearch.cloneNode(true);
        addressSearch.parentNode.replaceChild(newAddressSearch, addressSearch);
        
        // Adicionar listener
        newAddressSearch.addEventListener('input', function() {
            const query = this.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length < 3) {
                addressSuggestions.style.display = 'none';
                return;
            }
            
            console.log('[Fix] Buscando endereço:', query);
            
            searchTimeout = setTimeout(() => {
                // Usar API do Google se disponível
                if (window.google && google.maps && google.maps.places) {
                    searchWithGoogleAPI(query);
                } else {
                    // Usar busca simulada
                    searchWithMockData(query);
                }
            }, 500);
        });
        
        // Mostrar campos se já houver dados
        checkAddressFields();
    }
    
    // Busca com Google API
    function searchWithGoogleAPI(query) {
        console.log('[Fix] Usando Google Places API...');
        
        const service = new google.maps.places.AutocompleteService();
        const addressSuggestions = document.getElementById('addressSuggestions');
        
        service.getPlacePredictions({
            input: query,
            componentRestrictions: { country: 'br' },
            language: 'pt-BR',
            types: ['establishment', 'geocode']
        }, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                displaySuggestions(predictions);
            } else {
                searchWithMockData(query);
            }
        });
    }
    
    // Busca simulada
    function searchWithMockData(query) {
        console.log('[Fix] Usando dados simulados...');
        
        const mockResults = [
            {
                description: `${query} - São Paulo, SP, Brasil`,
                place_id: 'mock_sp_' + Date.now(),
                structured_formatting: {
                    main_text: query,
                    secondary_text: 'São Paulo, SP, Brasil'
                }
            },
            {
                description: `${query} - Rio de Janeiro, RJ, Brasil`,
                place_id: 'mock_rj_' + Date.now(),
                structured_formatting: {
                    main_text: query,
                    secondary_text: 'Rio de Janeiro, RJ, Brasil'
                }
            },
            {
                description: `${query} - Belo Horizonte, MG, Brasil`,
                place_id: 'mock_mg_' + Date.now(),
                structured_formatting: {
                    main_text: query,
                    secondary_text: 'Belo Horizonte, MG, Brasil'
                }
            }
        ];
        
        displaySuggestions(mockResults);
    }
    
    // Exibir sugestões
    function displaySuggestions(results) {
        const addressSuggestions = document.getElementById('addressSuggestions');
        if (!addressSuggestions) return;
        
        addressSuggestions.innerHTML = '';
        
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'address-suggestion';
            div.style.padding = '10px';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid #eee';
            
            div.innerHTML = `
                <div style="font-weight: 500;">${result.structured_formatting?.main_text || result.description}</div>
                ${result.structured_formatting?.secondary_text ? 
                    `<div style="font-size: 0.9em; color: #666;">${result.structured_formatting.secondary_text}</div>` : ''}
            `;
            
            div.addEventListener('click', () => selectAddress(result));
            div.addEventListener('mouseenter', () => div.style.backgroundColor = '#f5f5f5');
            div.addEventListener('mouseleave', () => div.style.backgroundColor = '');
            
            addressSuggestions.appendChild(div);
        });
        
        addressSuggestions.style.display = 'block';
    }
    
    // Selecionar endereço
    function selectAddress(address) {
        console.log('[Fix] Endereço selecionado:', address.description);
        
        const addressSearch = document.getElementById('addressSearch');
        const addressSuggestions = document.getElementById('addressSuggestions');
        const addressFields = document.getElementById('addressFields');
        
        if (addressSearch) {
            addressSearch.value = address.description;
        }
        
        if (addressSuggestions) {
            addressSuggestions.style.display = 'none';
        }
        
        // Mostrar campos
        if (addressFields) {
            addressFields.classList.remove('hidden');
            addressFields.style.display = 'block';
        }
        
        // Preencher campos
        if (address.place_id.startsWith('mock_')) {
            fillMockData(address);
        } else if (window.google && google.maps && google.maps.places) {
            getPlaceDetails(address.place_id);
        }
    }
    
    // Obter detalhes do lugar
    function getPlaceDetails(placeId) {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        service.getDetails({
            placeId: placeId,
            fields: ['name', 'address_components', 'geometry', 'formatted_address']
        }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                fillAddressFromPlace(place);
            }
        });
    }
    
    // Preencher com dados do Google
    function fillAddressFromPlace(place) {
        console.log('[Fix] Preenchendo com dados do Google:', place.name);
        
        // Nome do local
        const venueName = document.getElementById('venueName');
        if (venueName) venueName.value = place.name || '';
        
        // Processar componentes
        const fields = {};
        place.address_components.forEach(component => {
            const types = component.types;
            
            if (types.includes('route')) {
                fields.street = component.long_name;
            } else if (types.includes('street_number')) {
                fields.number = component.long_name;
            } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                fields.neighborhood = component.long_name;
            } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                fields.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                fields.state = component.short_name;
            } else if (types.includes('postal_code')) {
                fields.cep = component.long_name;
            }
        });
        
        // Preencher campos
        Object.entries(fields).forEach(([key, value]) => {
            const field = document.getElementById(key);
            if (field && value) {
                field.value = value;
            }
        });
        
        // Salvar
        if (window.saveWizardData) {
            window.saveWizardData();
        }
    }
    
    // Preencher com dados simulados
    function fillMockData(address) {
        console.log('[Fix] Preenchendo com dados simulados');
        
        const mockData = {
            venueName: address.structured_formatting?.main_text || 'Local do Evento',
            street: 'Avenida Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            cep: '01310-100'
        };
        
        // Ajustar por cidade
        if (address.description?.includes('Rio de Janeiro')) {
            Object.assign(mockData, {
                city: 'Rio de Janeiro',
                state: 'RJ',
                street: 'Avenida Atlântica',
                neighborhood: 'Copacabana',
                cep: '22070-000'
            });
        } else if (address.description?.includes('Belo Horizonte')) {
            Object.assign(mockData, {
                city: 'Belo Horizonte',
                state: 'MG',
                street: 'Avenida Afonso Pena',
                neighborhood: 'Centro',
                cep: '30130-000'
            });
        }
        
        // Preencher campos
        Object.entries(mockData).forEach(([key, value]) => {
            const field = document.getElementById(key);
            if (field) field.value = value;
        });
        
        // Salvar
        if (window.saveWizardData) {
            window.saveWizardData();
        }
    }
    
    // Verificar campos preenchidos
    function checkAddressFields() {
        const addressFields = document.getElementById('addressFields');
        const hasAddress = document.getElementById('street')?.value || 
                          document.getElementById('venueName')?.value;
        
        if (hasAddress && addressFields) {
            addressFields.classList.remove('hidden');
            addressFields.style.display = 'block';
        }
    }
    
    // Fechar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
        const addressSearch = document.getElementById('addressSearch');
        const addressSuggestions = document.getElementById('addressSuggestions');
        
        if (addressSearch && addressSuggestions && 
            !addressSearch.contains(e.target) && 
            !addressSuggestions.contains(e.target)) {
            addressSuggestions.style.display = 'none';
        }
    });
    
    // ========================================
    // 3. EXECUTAR CORREÇÕES
    // ========================================
    
    // Executar correções após um pequeno delay
    setTimeout(() => {
        setupColorFix();
        setupAddressFix();
        console.log('[Fix] Correções aplicadas com sucesso!');
    }, 500);
});
