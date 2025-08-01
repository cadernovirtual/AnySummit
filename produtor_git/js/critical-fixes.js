// =====================================================
// CORREÇÕES CRÍTICAS - ANYSUMMIT
// =====================================================

console.log('🚨 Aplicando correções críticas...');

// =====================================================
// 1. CORRIGIR RESTAURAÇÃO DE DADOS DO WIZARD
// =====================================================

// Sobrescrever a função de restauração para garantir que funcione
if (window.AnySummit && window.AnySummit.Storage) {
    
    // Backup da função original
    window.AnySummit.Storage._originalRestoreWizardData = window.AnySummit.Storage.restoreWizardData;
    
    // Nova função de restauração completa
    window.AnySummit.Storage.restoreWizardData = function() {
        console.log('[CRÍTICO] Restaurando dados do wizard...');
        
        const savedData = this.getCookie('eventoWizard');
        if (!savedData) {
            console.log('[CRÍTICO] Nenhum dado salvo encontrado');
            return false;
        }
        
        try {
            const data = JSON.parse(savedData);
            console.log('[CRÍTICO] Dados encontrados:', data);
            
            // STEP 1 - Informações básicas
            if (data.eventName) {
                const eventNameField = document.getElementById('eventName');
                if (eventNameField) eventNameField.value = data.eventName;
            }
            if (data.classification) {
                const classField = document.getElementById('classification');
                if (classField) classField.value = data.classification;
            }
            if (data.category) {
                const catField = document.getElementById('category');
                if (catField) catField.value = data.category;
            }
            
            // STEP 2 - Imagens
            if (data.logoPath || data.logoUrl) {
                const logoContainer = document.getElementById('logoPreviewContainer');
                if (logoContainer) {
                    const imgSrc = data.logoPath || data.logoUrl;
                    logoContainer.innerHTML = `
                        <img src="${imgSrc}" alt="logo">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    `;
                    const clearBtn = document.getElementById('clearLogo');
                    if (clearBtn) clearBtn.style.display = 'flex';
                }
            }
            
            if (data.capaPath || data.capaUrl) {
                const capaContainer = document.getElementById('capaPreviewContainer');
                if (capaContainer) {
                    const imgSrc = data.capaPath || data.capaUrl;
                    capaContainer.innerHTML = `
                        <img src="${imgSrc}" alt="capa">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    `;
                    const clearBtn = document.getElementById('clearCapa');
                    if (clearBtn) clearBtn.style.display = 'flex';
                }
            }
            
            if (data.fundoPath || data.fundoUrl) {
                const fundoContainer = document.getElementById('fundoPreviewMain');
                if (fundoContainer) {
                    const imgSrc = data.fundoPath || data.fundoUrl;
                    fundoContainer.innerHTML = `<img src="${imgSrc}" alt="fundo">`;
                    const clearBtn = document.getElementById('clearFundo');
                    if (clearBtn) clearBtn.style.display = 'flex';
                }
            }
            
            if (data.corFundo) {
                const corFundo = document.getElementById('corFundo');
                const corFundoHex = document.getElementById('corFundoHex');
                const colorPreview = document.getElementById('colorPreview');
                if (corFundo) corFundo.value = data.corFundo;
                if (corFundoHex) corFundoHex.value = data.corFundo;
                if (colorPreview) colorPreview.style.backgroundColor = data.corFundo;
            }
            
            // STEP 3 - Datas
            if (data.startDateTime) {
                const startField = document.getElementById('startDateTime');
                if (startField) startField.value = data.startDateTime;
            }
            if (data.endDateTime) {
                const endField = document.getElementById('endDateTime');
                if (endField) endField.value = data.endDateTime;
            }
            
            // STEP 4 - Local
            if (data.isPresential !== undefined) {
                const locationSwitch = document.getElementById('locationTypeSwitch');
                const presential = document.getElementById('presentialLocation');
                const online = document.getElementById('onlineLocation');
                
                if (locationSwitch) {
                    if (data.isPresential) {
                        locationSwitch.classList.add('active');
                        if (presential) presential.classList.add('show');
                        if (online) online.classList.remove('show');
                    } else {
                        locationSwitch.classList.remove('active');
                        if (presential) presential.classList.remove('show');
                        if (online) online.classList.add('show');
                    }
                }
            }
            
            // Campos de endereço
            const addressFields = ['venueName', 'eventLink', 'addressSearch', 'street', 'number', 
                                 'complement', 'neighborhood', 'city', 'state', 'cep'];
            
            addressFields.forEach(fieldName => {
                if (data[fieldName]) {
                    const field = document.getElementById(fieldName);
                    if (field) field.value = data[fieldName];
                }
            });
            
            // STEP 7 - Descrição
            if (data.eventDescription) {
                const descField = document.getElementById('eventDescription');
                if (descField) descField.innerHTML = data.eventDescription;
            }
            
            // STEP 8 - Configurações
            if (data.acceptTerms) {
                const termsCheck = document.getElementById('acceptTerms');
                if (termsCheck) termsCheck.checked = true;
            }
            
            // Restaurar step atual
            if (data.currentStep && data.currentStep > 1) {
                setTimeout(() => {
                    if (window.goToStep) {
                        window.goToStep(data.currentStep);
                    }
                }, 500);
            }
            
            // Atualizar preview
            if (window.updatePreview) {
                setTimeout(() => window.updatePreview(), 300);
            }
            
            console.log('✅ [CRÍTICO] Dados restaurados com sucesso!');
            return true;
            
        } catch (error) {
            console.error('[CRÍTICO] Erro ao restaurar dados:', error);
            return false;
        }
    };
}

// Interceptar a função checkAndRestoreWizardData
window._originalCheckAndRestore = window.checkAndRestoreWizardData;
window.checkAndRestoreWizardData = function() {
    console.log('🔄 [CRÍTICO] Verificando dados salvos...');
    
    const savedData = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
    
    if (savedData) {
        try {
            const cookieValue = savedData.split('=')[1];
            const data = JSON.parse(decodeURIComponent(cookieValue));
            const eventName = data.eventName || 'Evento não nomeado';
            
            console.log('📋 [CRÍTICO] Evento encontrado:', eventName);
            
            // Usar confirm nativo primeiro
            const shouldRestore = confirm(`Você tem um evento em andamento: "${eventName}"\n\nDeseja continuar de onde parou?`);
            
            if (shouldRestore) {
                // Aguardar DOM carregar completamente
                setTimeout(() => {
                    if (window.AnySummit && window.AnySummit.Storage) {
                        window.AnySummit.Storage.restoreWizardData();
                    }
                }, 100);
            } else {
                // Limpar dados
                if (window.clearAllWizardData) {
                    window.clearAllWizardData();
                }
            }
        } catch (error) {
            console.error('[CRÍTICO] Erro ao processar dados salvos:', error);
        }
    }
};

// =====================================================
// 2. CORRIGIR CÁLCULO DE DATA +1 MINUTO
// =====================================================
window.calcularDataInicioLote = function() {
    console.log('📅 [CRÍTICO] Calculando data de início do próximo lote...');
    
    const lotes = [];
    
    // Coletar TODAS as datas de lotes existentes
    document.querySelectorAll('.lote-card').forEach(card => {
        const tipo = card.classList.contains('por-data') ? 'data' : 'percentual';
        
        if (tipo === 'data') {
            // Extrair datas do texto
            const spans = card.querySelectorAll('.lote-info span');
            spans.forEach(span => {
                const text = span.textContent;
                if (text.includes('Fim:')) {
                    const dataFimStr = text.replace('Fim:', '').trim();
                    
                    // Converter formato DD/MM/YYYY HH:MM para Date
                    const match = dataFimStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
                    if (match) {
                        const [_, dia, mes, ano, hora, minuto] = match;
                        const dataObj = new Date(ano, mes - 1, dia, hora, minuto);
                        lotes.push({
                            tipo: 'fim',
                            data: dataObj,
                            original: dataFimStr
                        });
                    }
                }
            });
        }
    });
    
    console.log('📅 Datas encontradas:', lotes);
    
    let novaDataInicio;
    
    if (lotes.length > 0) {
        // Encontrar a data mais recente
        const ultimaData = lotes.reduce((max, lote) => {
            return lote.data > max ? lote.data : max;
        }, new Date(0));
        
        // Adicionar 1 minuto
        novaDataInicio = new Date(ultimaData.getTime() + 60000);
        console.log('📅 Última data:', ultimaData);
        console.log('📅 Nova data (+1 min):', novaDataInicio);
    } else {
        // Usar data/hora atual se não houver lotes
        novaDataInicio = new Date();
    }
    
    // Formatar para input datetime-local
    const formatarData = (date) => {
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        const hora = String(date.getHours()).padStart(2, '0');
        const minuto = String(date.getMinutes()).padStart(2, '0');
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    };
    
    const dataFormatada = formatarData(novaDataInicio);
    
    // Atualizar campos
    const campos = ['loteDataInicio', 'lotePercentualInicio'];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = dataFormatada;
            console.log(`✅ Campo ${id} atualizado:`, dataFormatada);
        }
    });
    
    return dataFormatada;
};

// =====================================================
// 3. CORRIGIR VALIDAÇÃO DO LOTE 100%
// =====================================================
window.validarLotes100Porcento = function() {
    console.log('🔍 [CRÍTICO] Validando lotes percentuais...');
    
    // Buscar APENAS lotes por percentual
    const lotesPercentuais = document.querySelectorAll('.lote-card.por-percentual');
    
    if (lotesPercentuais.length === 0) {
        console.log('✅ Nenhum lote percentual, validação OK');
        return true;
    }
    
    let tem100 = false;
    let percentuais = [];
    
    lotesPercentuais.forEach((lote, index) => {
        // Buscar o valor percentual de várias formas
        let percentual = 0;
        
        // Tentar encontrar no texto
        const textoPercentual = lote.textContent;
        const matchPercent = textoPercentual.match(/(\d+)%/);
        if (matchPercent) {
            percentual = parseInt(matchPercent[1]);
        }
        
        // Tentar encontrar em elementos específicos
        const percentualElement = lote.querySelector('.percentual-value, .lote-percentual, [data-percentual]');
        if (percentualElement) {
            const texto = percentualElement.textContent || percentualElement.getAttribute('data-percentual');
            const num = parseInt(texto.replace('%', ''));
            if (!isNaN(num)) percentual = num;
        }
        
        percentuais.push(percentual);
        if (percentual === 100) tem100 = true;
        
        console.log(`Lote ${index + 1}: ${percentual}%`);
    });
    
    console.log('📊 Percentuais encontrados:', percentuais);
    
    if (!tem100) {
        alert('⚠️ ATENÇÃO: É obrigatório ter pelo menos um lote com 100% de vendas!\n\nConfigure um lote para ativar quando 100% dos ingressos forem vendidos.');
        return false;
    }
    
    console.log('✅ Validação OK - Existe lote 100%');
    return true;
};

// Sobrescrever validateStep mais uma vez
window._validateStepOriginal = window.validateStep;
window.validateStep = function(stepNumber) {
    console.log('🔍 [CRÍTICO] Validando step:', stepNumber);
    
    if (stepNumber === 5) {
        // Verificar se tem lotes
        const temLotes = document.querySelectorAll('.lote-card').length > 0;
        
        if (!temLotes) {
            alert('É necessário criar pelo menos um lote!');
            return false;
        }
        
        // Verificar se tem lote 100%
        if (!window.validarLotes100Porcento()) {
            return false;
        }
        
        return true;
    }
    
    // Usar validação original para outros steps
    if (window._validateStepOriginal) {
        return window._validateStepOriginal(stepNumber);
    }
    
    return true;
};

// =====================================================
// 4. CORRIGIR BUSCA DE ENDEREÇOS
// =====================================================
window.searchAddresses = function(query) {
    console.log('🔍 [CRÍTICO] Buscando endereços para:', query);
    
    const addressSuggestions = document.getElementById('addressSuggestions');
    if (!addressSuggestions) return;
    
    // Adicionar "Brasil" se não tiver país
    if (!query.toLowerCase().includes('brasil') && !query.toLowerCase().includes('brazil')) {
        query += ', Brasil';
    }
    
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        const service = new google.maps.places.AutocompleteService();
        
        const request = {
            input: query,
            componentRestrictions: { country: 'br' },
            types: ['geocode', 'establishment'],
            language: 'pt-BR'
        };
        
        service.getPlacePredictions(request, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                addressSuggestions.innerHTML = '';
                addressSuggestions.style.display = 'block';
                
                predictions.slice(0, 5).forEach(prediction => {
                    const item = document.createElement('div');
                    item.className = 'address-item';
                    item.textContent = prediction.description;
                    item.dataset.placeId = prediction.place_id;
                    
                    item.addEventListener('click', () => {
                        selectAddress(prediction.place_id, prediction.description);
                        addressSuggestions.style.display = 'none';
                    });
                    
                    addressSuggestions.appendChild(item);
                });
            } else {
                // Fallback para busca alternativa
                console.log('Usando busca alternativa...');
                buscarEnderecoViaCEP(query);
            }
        });
    } else {
        // Sem Google Maps, usar ViaCEP
        buscarEnderecoViaCEP(query);
    }
};

// Busca alternativa via CEP
function buscarEnderecoViaCEP(query) {
    const cepMatch = query.match(/\d{5}-?\d{3}/);
    if (cepMatch) {
        const cep = cepMatch[0].replace('-', '');
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                    
                    const addressSuggestions = document.getElementById('addressSuggestions');
                    addressSuggestions.innerHTML = `
                        <div class="address-item" onclick="selectAddressViaCEP('${data.logradouro}', '${data.bairro}', '${data.localidade}', '${data.uf}', '${cep}')">
                            ${endereco}
                        </div>
                    `;
                    addressSuggestions.style.display = 'block';
                }
            });
    }
}

// Selecionar endereço do ViaCEP
window.selectAddressViaCEP = function(rua, bairro, cidade, estado, cep) {
    document.getElementById('street').value = rua;
    document.getElementById('neighborhood').value = bairro;
    document.getElementById('city').value = cidade;
    document.getElementById('state').value = estado;
    document.getElementById('cep').value = cep;
    document.getElementById('addressSearch').value = `${rua}, ${bairro}, ${cidade} - ${estado}`;
    document.getElementById('addressSuggestions').style.display = 'none';
    
    // Salvar dados
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
};

// =====================================================
// 5. CORRIGIR CARREGAMENTO DE LOTES NO COMBO
// =====================================================
window.carregarLotesCombo = function() {
    console.log('📋 [CRÍTICO] Carregando lotes para combo...');
    
    const selectLote = document.getElementById('comboTicketLote');
    if (!selectLote) {
        console.error('Select de lotes do combo não encontrado!');
        return;
    }
    
    // Limpar e adicionar opção padrão
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Buscar todos os lotes
    const loteCards = document.querySelectorAll('.lote-card');
    
    if (loteCards.length === 0) {
        selectLote.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
        return;
    }
    
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index + 1}`;
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = loteNome;
        selectLote.appendChild(option);
    });
    
    console.log(`✅ ${loteCards.length} lotes carregados no combo`);
    
    // Disparar evento change para atualizar tipos de ingresso
    selectLote.dispatchEvent(new Event('change'));
};

// Sobrescrever função de abrir modal combo
window._abrirModalComboOriginal = window.abrirModalIngressoCombo;
window.abrirModalIngressoCombo = function() {
    console.log('🎫 [CRÍTICO] Abrindo modal de combo...');
    
    const modal = document.getElementById('comboTicketModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // Aguardar modal abrir e carregar lotes
        setTimeout(() => {
            window.carregarLotesCombo();
            
            // Inicializar outras coisas do combo
            if (typeof initComboPriceInput === 'function') {
                initComboPriceInput();
            }
            
            // Limpar lista de itens
            window.comboItems = [];
            if (window.updateComboItemsList) {
                window.updateComboItemsList();
            }
        }, 200);
    }
};

// =====================================================
// INICIALIZAÇÃO CRÍTICA
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 [CRÍTICO] Aplicando correções críticas...');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // Reconfigurar eventos dos modais de lote
        const btnLoteData = document.querySelector('button[onclick*="loteDataModal"]');
        if (btnLoteData) {
            btnLoteData.removeAttribute('onclick');
            btnLoteData.addEventListener('click', function() {
                openModal('loteDataModal');
                setTimeout(calcularDataInicioLote, 100);
            });
        }
        
        const btnLotePercentual = document.querySelector('button[onclick*="lotePercentualModal"]');
        if (btnLotePercentual) {
            btnLotePercentual.removeAttribute('onclick');
            btnLotePercentual.addEventListener('click', function() {
                openModal('lotePercentualModal');
                setTimeout(calcularDataInicioLote, 100);
            });
        }
        
        // Reconfigurar busca de endereços
        const addressSearch = document.getElementById('addressSearch');
        if (addressSearch) {
            let searchTimeout;
            
            // Remover listeners antigos
            const newAddressSearch = addressSearch.cloneNode(true);
            addressSearch.parentNode.replaceChild(newAddressSearch, addressSearch);
            
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
                }, 500);
            });
        }
        
        // Verificar dados salvos após tudo carregar
        if (window.checkAndRestoreWizardData) {
            window.checkAndRestoreWizardData();
        }
        
    }, 1000);
    
    console.log('✅ [CRÍTICO] Correções críticas aplicadas!');
});

// Exportar funções globalmente
window.calcularDataInicioLote = calcularDataInicioLote;
window.validarLotes100Porcento = validarLotes100Porcento;
window.carregarLotesCombo = carregarLotesCombo;