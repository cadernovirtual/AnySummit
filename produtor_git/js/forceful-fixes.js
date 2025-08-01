// =====================================================
// CORREÇÕES CRÍTICAS FORÇADAS - ANYSUMMIT
// =====================================================

console.log('🔥🔥🔥 APLICANDO CORREÇÕES FORÇADAS 🔥🔥🔥');

// =====================================================
// FORÇA CORREÇÕES A CADA 500MS
// =====================================================
let intervalId = setInterval(() => {
    console.log('⚡ Aplicando correções...');
    aplicarTodasCorrecoes();
}, 500);

// Parar após 10 segundos
setTimeout(() => {
    clearInterval(intervalId);
    console.log('✅ Correções aplicadas, monitoramento encerrado');
}, 10000);

function aplicarTodasCorrecoes() {
    
    // =====================================================
    // 1. FORÇAR ESTILO DE CAMPOS READONLY
    // =====================================================
    const readonlyInputs = document.querySelectorAll('input[readonly]');
    readonlyInputs.forEach(input => {
        input.style.backgroundColor = '#2d2d3d';
        input.style.color = '#e0e0e0';
        input.style.opacity = '0.8';
    });
    
    // =====================================================
    // 2. FORÇAR CÁLCULO DE DATA
    // =====================================================
    if (!window._dataCalculoFixado) {
        window._dataCalculoFixado = true;
        
        window.calcularDataInicioLote = function() {
            console.log('📅 [FORÇADO] Calculando data com +1 minuto...');
            
            let ultimaDataFim = null;
            
            // Buscar TODAS as datas de fim
            document.querySelectorAll('.lote-card').forEach(card => {
                const spans = card.querySelectorAll('.lote-info span');
                spans.forEach(span => {
                    const text = span.textContent || '';
                    if (text.includes('Fim:')) {
                        const dataStr = text.replace('Fim:', '').trim();
                        // Formato: DD/MM/YYYY HH:MM
                        const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
                        if (match) {
                            const [_, dia, mes, ano, hora, minuto] = match;
                            const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
                            
                            if (!ultimaDataFim || data > ultimaDataFim) {
                                ultimaDataFim = data;
                            }
                        }
                    }
                });
            });
            
            let novaData;
            if (ultimaDataFim) {
                // Adicionar EXATAMENTE 1 minuto
                novaData = new Date(ultimaDataFim.getTime() + 60000);
                console.log('📅 Última data fim:', ultimaDataFim);
                console.log('📅 Nova data (+1 min):', novaData);
            } else {
                novaData = new Date();
            }
            
            // Formatar para datetime-local
            const ano = novaData.getFullYear();
            const mes = String(novaData.getMonth() + 1).padStart(2, '0');
            const dia = String(novaData.getDate()).padStart(2, '0');
            const hora = String(novaData.getHours()).padStart(2, '0');
            const minuto = String(novaData.getMinutes()).padStart(2, '0');
            
            const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
            
            // Forçar atualização dos campos
            const campo1 = document.getElementById('loteDataInicio');
            const campo2 = document.getElementById('lotePercentualInicio');
            
            if (campo1) {
                campo1.value = dataFormatada;
                console.log('✅ loteDataInicio atualizado:', dataFormatada);
            }
            if (campo2) {
                campo2.value = dataFormatada;
                console.log('✅ lotePercentualInicio atualizado:', dataFormatada);
            }
            
            return dataFormatada;
        };
    }
    
    // =====================================================
    // 3. REMOVER QUADROS PERCENTUAIS
    // =====================================================
    const percentualSummary = document.getElementById('percentualSummary');
    if (percentualSummary) {
        percentualSummary.style.display = 'none';
    }
    
    const summaryBoxes = document.querySelectorAll('.lote-summary-box');
    summaryBoxes.forEach(box => {
        box.style.display = 'none';
    });
    
    // =====================================================
    // 4. FORÇAR VALIDAÇÃO 100%
    // =====================================================
    if (!window._validacaoForcada) {
        window._validacaoForcada = true;
        
        // Guardar referência da função original
        window._validateStepBackup = window.validateStep;
        
        // Sobrescrever com nossa validação
        window.validateStep = function(stepNumber) {
            console.log('🔍 [FORÇADO] Validando step:', stepNumber);
            
            if (stepNumber === 5) {
                // Verificar lotes
                const temLotes = document.querySelectorAll('.lote-card').length > 0;
                if (!temLotes) {
                    alert('É necessário criar pelo menos um lote!');
                    return false;
                }
                
                // Verificar lotes percentuais
                const lotesPercentuais = document.querySelectorAll('.lote-card.por-percentual');
                if (lotesPercentuais.length > 0) {
                    let tem100 = false;
                    
                    lotesPercentuais.forEach(lote => {
                        const texto = lote.textContent || '';
                        if (texto.includes('100%')) {
                            tem100 = true;
                        }
                    });
                    
                    if (!tem100) {
                        alert('⚠️ ATENÇÃO: É obrigatório ter pelo menos um lote com 100% de vendas!');
                        return false;
                    }
                }
                
                return true;
            }
            
            // Outros steps - usar validação original se existir
            if (window._validateStepBackup) {
                return window._validateStepBackup(stepNumber);
            }
            
            return true;
        };
    }
    
    // =====================================================
    // 5. FORÇAR CARREGAMENTO DE LOTES NO COMBO
    // =====================================================
    if (!window._comboLotesForcado) {
        window._comboLotesForcado = true;
        
        // Guardar função original
        window._abrirModalComboBackup = window.abrirModalIngressoCombo;
        
        // Nova função
        window.abrirModalIngressoCombo = function() {
            console.log('🎫 [FORÇADO] Abrindo modal combo com lotes...');
            
            const modal = document.getElementById('comboTicketModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
                
                // Forçar carregamento de lotes após delay
                setTimeout(() => {
                    const selectLote = document.getElementById('comboTicketLote');
                    if (selectLote) {
                        selectLote.innerHTML = '<option value="">Selecione um lote</option>';
                        
                        const loteCards = document.querySelectorAll('.lote-card');
                        loteCards.forEach((card, index) => {
                            const loteId = card.getAttribute('data-lote-id') || `lote_${index + 1}`;
                            const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
                            
                            const option = document.createElement('option');
                            option.value = loteId;
                            option.textContent = loteNome;
                            selectLote.appendChild(option);
                        });
                        
                        console.log(`✅ [FORÇADO] ${loteCards.length} lotes carregados no combo`);
                    }
                }, 300);
            }
        };
    }
}

// =====================================================
// INTERCEPTAR ABERTURA DE MODAIS DE LOTE
// =====================================================
document.addEventListener('click', function(e) {
    // Verificar se clicou em botão de adicionar lote
    if (e.target.textContent && (e.target.textContent.includes('Adicionar lote por data') || 
                                  e.target.textContent.includes('Adicionar lote por %'))) {
        console.log('🎯 Clique em botão de lote detectado');
        setTimeout(() => {
            window.calcularDataInicioLote();
        }, 300);
    }
    
    // Verificar se clicou em adicionar combo
    if (e.target.textContent && e.target.textContent.includes('Adicionar Combo')) {
        console.log('🎯 Clique em combo detectado');
        // Função já foi sobrescrita acima
    }
}, true);

// =====================================================
// RESTAURAÇÃO DE DADOS FORÇADA
// =====================================================
setTimeout(() => {
    console.log('🔄 Verificando dados salvos...');
    
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
    if (cookie && !window._jaRestaurou) {
        window._jaRestaurou = true;
        
        try {
            const value = cookie.split('=')[1];
            const data = JSON.parse(decodeURIComponent(value));
            
            if (data.eventName) {
                console.log('📋 Evento salvo encontrado:', data.eventName);
                
                // Perguntar apenas uma vez
                if (confirm(`Você tem um evento em andamento: "${data.eventName}"\n\nDeseja continuar de onde parou?`)) {
                    console.log('✅ Restaurando dados...');
                    
                    // Restaurar campos básicos
                    if (data.eventName) {
                        const field = document.getElementById('eventName');
                        if (field) field.value = data.eventName;
                    }
                    
                    if (data.classification) {
                        const field = document.getElementById('classification');
                        if (field) field.value = data.classification;
                    }
                    
                    if (data.category) {
                        const field = document.getElementById('category');
                        if (field) field.value = data.category;
                    }
                    
                    // Restaurar datas
                    if (data.startDateTime) {
                        const field = document.getElementById('startDateTime');
                        if (field) field.value = data.startDateTime;
                    }
                    
                    if (data.endDateTime) {
                        const field = document.getElementById('endDateTime');
                        if (field) field.value = data.endDateTime;
                    }
                    
                    // Restaurar endereços
                    const addressFields = ['venueName', 'eventLink', 'addressSearch', 'street', 
                                         'number', 'complement', 'neighborhood', 'city', 'state', 'cep'];
                    
                    addressFields.forEach(fieldName => {
                        if (data[fieldName]) {
                            const field = document.getElementById(fieldName);
                            if (field) field.value = data[fieldName];
                        }
                    });
                    
                    console.log('✅ Dados restaurados!');
                }
            }
        } catch (error) {
            console.error('Erro ao restaurar:', error);
        }
    }
}, 2000);

// =====================================================
// BUSCA DE ENDEREÇOS FORÇADA
// =====================================================
let addressSearchConfigured = false;

setInterval(() => {
    if (!addressSearchConfigured) {
        const addressSearch = document.getElementById('addressSearch');
        if (addressSearch) {
            addressSearchConfigured = true;
            
            console.log('🔍 Configurando busca de endereços...');
            
            let searchTimeout;
            addressSearch.addEventListener('input', function() {
                const query = this.value.trim();
                clearTimeout(searchTimeout);
                
                if (query.length < 3) {
                    const suggestions = document.getElementById('addressSuggestions');
                    if (suggestions) suggestions.style.display = 'none';
                    return;
                }
                
                searchTimeout = setTimeout(() => {
                    console.log('🔍 Buscando:', query);
                    
                    // Forçar busca com API do Google
                    if (window.google && google.maps && google.maps.places) {
                        const service = new google.maps.places.AutocompleteService();
                        
                        service.getPlacePredictions({
                            input: query + ', Brasil',
                            componentRestrictions: { country: 'br' },
                            types: ['geocode', 'establishment']
                        }, (predictions, status) => {
                            const suggestions = document.getElementById('addressSuggestions');
                            if (!suggestions) return;
                            
                            suggestions.innerHTML = '';
                            
                            if (predictions && predictions.length > 0) {
                                suggestions.style.display = 'block';
                                
                                predictions.slice(0, 5).forEach(pred => {
                                    const div = document.createElement('div');
                                    div.className = 'address-item';
                                    div.textContent = pred.description;
                                    div.onclick = () => {
                                        addressSearch.value = pred.description;
                                        suggestions.style.display = 'none';
                                        
                                        // Tentar preencher campos se tiver selectAddress
                                        if (window.selectAddress) {
                                            window.selectAddress(pred.place_id, pred.description);
                                        }
                                    };
                                    suggestions.appendChild(div);
                                });
                            }
                        });
                    }
                }, 500);
            });
        }
    }
}, 1000);

console.log('✅ CORREÇÕES FORÇADAS ATIVADAS!');

// Aplicar correções imediatamente
aplicarTodasCorrecoes();