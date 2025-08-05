/**
 * Sistema de Coleta de Dados do Wizard
 * Intercepta os botões de avanço para coletar dados sem impactar o funcionamento
 */

// CRIAR WIZARDDATACOLLECTOR NO ESCOPO GLOBAL
if (!window.WizardDataCollector) {
    window.WizardDataCollector = {
        step_atual: 1,
        dados: {
            // Step 1 - Informações básicas
            nome: '',
            classificacao: '',
            categoria: '',
            cor_fundo: '',
            logo_url: '',
            capa_url: '',
            fundo_url: '',
            
            // Step 2 - Data e Local
            data_inicio: '',
            data_fim: '',
            nome_local: '',
            cep: '',
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            
            // Step 3 - Descrição
            descricao: '',
            
            // Step 4 - Produtor
            tipo_produtor: '',
            nome_produtor: '',
            email_produtor: '',
            
            // Step 5 - Lotes
            lotes: [],
            
            // Step 6 - Ingressos
            ingressos: [],
            
            // Step 8 - Termos
            termos_aceitos: false,
            timestamp_aceite: ''
        }
    };
}

(function() {
    'use strict';
    
    console.log('🔧 Wizard Data Collector iniciando...');
    
    // Função para coletar dados do Step 1
    function coletarStep1() {
        console.log('📊 Coletando dados do Step 1...');
        
        const dados = window.WizardDataCollector.dados;
        
        // Nome do evento
        const eventName = document.getElementById('eventName');
        if (eventName) dados.nome = eventName.value || '';
        
        // Classificação (está no step 2 mas vamos verificar)
        const classification = document.getElementById('classification');
        if (classification) dados.classificacao = classification.value || '';
        
        // Categoria
        const category = document.getElementById('category');
        if (category) dados.categoria = category.value || '';
        
        // Cor de fundo
        const bgColorInput = document.getElementById('corFundo');
        if (bgColorInput) dados.cor_fundo = bgColorInput.value || '';
        
        // URLs das imagens - verificar window.uploadedImages
        if (window.uploadedImages) {
            if (window.uploadedImages.logo) dados.logo_url = window.uploadedImages.logo;
            if (window.uploadedImages.capa) dados.capa_url = window.uploadedImages.capa;
            if (window.uploadedImages.fundo) dados.fundo_url = window.uploadedImages.fundo;
        }
        
        // Tentar também pegar das imagens no DOM (apenas URLs /uploads/)
        const logoImg = document.querySelector('#logoPreviewContainer img');
        if (!dados.logo_url && logoImg && logoImg.src) {
            // Verificar se é uma URL de upload válida
            if (logoImg.src.includes('/uploads/')) {
                const match = logoImg.src.match(/(\/?uploads\/eventos\/[^"']+)/);
                if (match) {
                    dados.logo_url = match[1];
                }
            }
        }
        
        const capaImg = document.querySelector('#capaPreviewContainer img');
        if (!dados.capa_url && capaImg && capaImg.src) {
            if (capaImg.src.includes('/uploads/')) {
                const match = capaImg.src.match(/(\/?uploads\/eventos\/[^"']+)/);
                if (match) {
                    dados.capa_url = match[1];
                }
            }
        }
        
        const fundoImg = document.querySelector('#fundoPreviewMain img');
        if (!dados.fundo_url && fundoImg && fundoImg.src) {
            if (fundoImg.src.includes('/uploads/')) {
                const match = fundoImg.src.match(/(\/?uploads\/eventos\/[^"']+)/);
                if (match) {
                    dados.fundo_url = match[1];
                }
            }
        }
        
        console.log('✅ Dados do Step 1 coletados:', dados);
    }
    
    // Função para coletar dados do Step 2
    function coletarStep2() {
        console.log('📊 Coletando dados do Step 2...');
        
        const dados = window.WizardDataCollector.dados;
        
        // Classificação e categoria (podem estar aqui também)
        const classification = document.getElementById('classification');
        if (classification) dados.classificacao = classification.value || '';
        
        const category = document.getElementById('category');
        if (category) dados.categoria = category.value || '';
        
        // Data e horário
        const startDateTime = document.getElementById('startDateTime');
        if (startDateTime) dados.data_inicio = startDateTime.value || '';
        
        const endDateTime = document.getElementById('endDateTime');
        if (endDateTime) dados.data_fim = endDateTime.value || '';
        
        // Local do evento
        const venueName = document.getElementById('venueName');
        if (venueName) dados.nome_local = venueName.value || '';
        
        const cep = document.getElementById('cep');
        if (cep) dados.cep = cep.value || '';
        
        const street = document.getElementById('street');
        if (street) dados.rua = street.value || '';
        
        const number = document.getElementById('number');
        if (number) dados.numero = number.value || '';
        
        const complement = document.getElementById('complement');
        if (complement) dados.complemento = complement.value || '';
        
        const neighborhood = document.getElementById('neighborhood');
        if (neighborhood) dados.bairro = neighborhood.value || '';
        
        const city = document.getElementById('city');
        if (city) dados.cidade = city.value || '';
        
        const state = document.getElementById('state');
        if (state) dados.estado = state.value || '';
        
        console.log('✅ Dados do Step 2 coletados:', dados);
    }
    
    // Função para coletar dados do Step 3
    function coletarStep3() {
        console.log('📊 Coletando dados do Step 3...');
        
        const dados = window.WizardDataCollector.dados;
        
        // Descrição do evento
        const eventDescription = document.getElementById('eventDescription');
        if (eventDescription) {
            dados.descricao = eventDescription.innerHTML || '';
        }
        
        console.log('✅ Dados do Step 3 coletados:', dados);
    }
    
    // Função para coletar dados do Step 4 (Localização)
    function coletarStep4() {
        console.log('📊 Coletando dados do Step 4 (Localização)...');
        
        const dados = window.WizardDataCollector.dados;
        
        // Verificar se é presencial ou online
        const locationTypeSwitch = document.getElementById('locationTypeSwitch');
        const isPresencial = locationTypeSwitch ? locationTypeSwitch.classList.contains('active') : true;
        
        if (isPresencial) {
            // Coletar todos os campos de endereço
            const venueName = document.getElementById('venueName');
            if (venueName) dados.nome_local = venueName.value || '';
            
            const cep = document.getElementById('cep');
            if (cep) dados.cep = cep.value || '';
            
            const street = document.getElementById('street');
            if (street) dados.rua = street.value || '';
            
            const number = document.getElementById('number');
            if (number) dados.numero = number.value || '';
            
            const complement = document.getElementById('complement');
            if (complement) dados.complemento = complement.value || '';
            
            const neighborhood = document.getElementById('neighborhood');
            if (neighborhood) dados.bairro = neighborhood.value || '';
            
            const city = document.getElementById('city');
            if (city) dados.cidade = city.value || '';
            
            const state = document.getElementById('state');
            if (state) dados.estado = state.value || '';
        } else {
            // Se for online, limpar campos de endereço
            dados.nome_local = '';
            dados.cep = '';
            dados.rua = '';
            dados.numero = '';
            dados.complemento = '';
            dados.bairro = '';
            dados.cidade = '';
            dados.estado = '';
        }
        
        console.log('✅ Dados do Step 4 coletados:', dados);
    }
    
    // Função para coletar dados do Step 5 (Lotes)
    function coletarStep5() {
        console.log('📊 Coletando dados do Step 5...');
        
        const dados = window.WizardDataCollector.dados;
        dados.lotes = [];
        
        // Verificar se existe window.lotesData
        if (window.lotesData) {
            console.log('🔍 window.lotesData encontrado:', window.lotesData);
            
            // Lotes por data
            if (window.lotesData.porData && Array.isArray(window.lotesData.porData)) {
                window.lotesData.porData.forEach((lote, index) => {
                    dados.lotes.push({
                        id: lote.id || `lote_data_${index + 1}`,
                        nome: lote.nome || '',
                        tipo: 'data',
                        data_inicio: lote.dataInicio || '',
                        data_fim: lote.dataFim || '',
                        divulgar: lote.divulgar || false
                    });
                });
                console.log(`✅ ${window.lotesData.porData.length} lotes por data coletados`);
            }
            
            // Lotes por percentual
            if (window.lotesData.porPercentual && Array.isArray(window.lotesData.porPercentual)) {
                window.lotesData.porPercentual.forEach((lote, index) => {
                    dados.lotes.push({
                        id: lote.id || `lote_perc_${index + 1}`,
                        nome: lote.nome || '',
                        tipo: 'percentual',
                        percentual: lote.percentual || '',
                        divulgar: lote.divulgar || false
                    });
                });
                console.log(`✅ ${window.lotesData.porPercentual.length} lotes por percentual coletados`);
            }
        } else {
            console.log('⚠️ window.lotesData não encontrado');
            
            // Tentar buscar do cookie como fallback
            try {
                const lotesDataCookie = getCookie('lotesData');
                if (lotesDataCookie) {
                    const lotesFromCookie = JSON.parse(lotesDataCookie);
                    console.log('🍪 Lotes encontrados no cookie:', lotesFromCookie);
                    
                    // Processar lotes do cookie
                    if (lotesFromCookie.porData) {
                        lotesFromCookie.porData.forEach((lote, index) => {
                            dados.lotes.push({
                                id: lote.id || `lote_data_${index + 1}`,
                                nome: lote.nome || '',
                                tipo: 'data',
                                data_inicio: lote.dataInicio || '',
                                data_fim: lote.dataFim || '',
                                divulgar: lote.divulgar || false
                            });
                        });
                    }
                    
                    if (lotesFromCookie.porPercentual) {
                        lotesFromCookie.porPercentual.forEach((lote, index) => {
                            dados.lotes.push({
                                id: lote.id || `lote_perc_${index + 1}`,
                                nome: lote.nome || '',
                                tipo: 'percentual',
                                percentual: lote.percentual || '',
                                divulgar: lote.divulgar || false
                            });
                        });
                    }
                }
            } catch (e) {
                console.error('Erro ao buscar lotes do cookie:', e);
            }
        }
        
        console.log('✅ Dados do Step 5 coletados:', dados.lotes);
    }
    
    // Função helper para buscar cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Função para coletar dados do Step 6 (Ingressos)
    function coletarStep6() {
        console.log('📊 Coletando dados do Step 6...');
        
        const dados = window.WizardDataCollector.dados;
        dados.ingressos = [];
        
        // Mapeamento de tipos
        const TYPE_MAP = {
            'paid': 'pago',
            'free': 'gratuito',
            'combo': 'combo',
            'pago': 'pago',
            'gratuito': 'gratuito'
        };
        
        // Primeiro tentar coletar de window.temporaryTickets (Map)
        if (window.temporaryTickets && window.temporaryTickets instanceof Map) {
            console.log('🎫 Coletando de window.temporaryTickets (Map)');
            
            window.temporaryTickets.forEach((ingresso, key) => {
                const ingressoData = {
                    id: ingresso.id || key,
                    tipo: TYPE_MAP[ingresso.type] || ingresso.type || 'pago',
                    nome: ingresso.title || ingresso.nome || '', // IMPORTANTE: nome do ingresso
                    descricao: ingresso.description || '',
                    valor: (ingresso.price || 0).toString(),
                    taxa: (ingresso.taxaPlataforma || 0).toString(),
                    quantidade: (ingresso.quantity || 0).toString(),
                    qtd_minima_por_pessoa: (ingresso.minLimit || 1).toString(),
                    qtd_maxima_por_pessoa: (ingresso.maxLimit || 5).toString(),
                    lote_id: ingresso.loteId || '',
                    conteudo_combo: {} // SEMPRE incluir, mesmo vazio
                };
                
                // Se for combo, preencher conteudo_combo
                if (ingressoData.tipo === 'combo') {
                    // Tentar pegar de window.comboItems primeiro
                    if (window.comboItems && Array.isArray(window.comboItems)) {
                        window.comboItems.forEach(item => {
                            if (item.ticketId && item.quantity) {
                                ingressoData.conteudo_combo[item.ticketId] = item.quantity;
                            }
                        });
                    }
                    // Se não tiver, tentar de ingresso.comboData
                    else if (ingresso.comboData && Array.isArray(ingresso.comboData)) {
                        ingresso.comboData.forEach(item => {
                            if (item.ticketId && item.quantity) {
                                ingressoData.conteudo_combo[item.ticketId] = item.quantity;
                            }
                        });
                    }
                    // Tentar de ingresso.items
                    else if (ingresso.items) {
                        if (Array.isArray(ingresso.items)) {
                            ingresso.items.forEach(item => {
                                if (item.ticketId && item.quantity) {
                                    ingressoData.conteudo_combo[item.ticketId] = item.quantity;
                                }
                            });
                        } else if (typeof ingresso.items === 'object') {
                            // Se items for objeto direto
                            ingressoData.conteudo_combo = ingresso.items;
                        }
                    }
                }
                
                dados.ingressos.push(ingressoData);
            });
        }
        // Fallback: coletar da lista visual
        else {
            console.log('⚠️ temporaryTickets não é Map, coletando da lista visual');
            
            const ticketElements = document.querySelectorAll('.ticket-item');
            ticketElements.forEach((element, index) => {
                // Tentar pegar dados salvos no elemento
                const ticketData = element.ticketData || {};
                
                const tipo = TYPE_MAP[ticketData.type] || 
                           TYPE_MAP[element.dataset.ticketType] || 
                           'pago';
                
                const ingressoData = {
                    id: element.dataset.ticketId || `ing_${index + 1}`,
                    tipo: tipo,
                    nome: ticketData.title || 
                          element.querySelector('.ticket-title')?.textContent || 
                          element.querySelector('.ticket-name')?.textContent || '',
                    descricao: ticketData.description || '',
                    valor: (ticketData.price || 0).toString(),
                    taxa: (ticketData.taxaPlataforma || 0).toString(),
                    quantidade: (ticketData.quantity || 0).toString(),
                    qtd_minima_por_pessoa: (ticketData.minQuantity || ticketData.minLimit || 1).toString(),
                    qtd_maxima_por_pessoa: (ticketData.maxQuantity || ticketData.maxLimit || 5).toString(),
                    lote_id: ticketData.loteId || element.dataset.loteId || '',
                    conteudo_combo: {} // SEMPRE incluir, mesmo vazio
                };
                
                // Se for combo, preencher conteudo_combo
                if (tipo === 'combo') {
                    if (ticketData.comboData) {
                        if (Array.isArray(ticketData.comboData)) {
                            ticketData.comboData.forEach(item => {
                                if (item.ticketId && item.quantity) {
                                    ingressoData.conteudo_combo[item.ticketId] = item.quantity;
                                }
                            });
                        }
                    } else if (ticketData.items) {
                        if (Array.isArray(ticketData.items)) {
                            ticketData.items.forEach(item => {
                                if (item.ticketId && item.quantity) {
                                    ingressoData.conteudo_combo[item.ticketId] = item.quantity;
                                }
                            });
                        } else if (typeof ticketData.items === 'object') {
                            ingressoData.conteudo_combo = ticketData.items;
                        }
                    }
                    
                    // Se ainda estiver vazio, tentar buscar de window.comboItems
                    if (Object.keys(ingressoData.conteudo_combo).length === 0 && window.comboItems) {
                        window.comboItems.forEach(item => {
                            if (item.ticketId && item.quantity) {
                                ingressoData.conteudo_combo[item.ticketId] = item.quantity;
                            }
                        });
                    }
                }
                
                dados.ingressos.push(ingressoData);
            });
        }
        
        // Também verificar se há dados salvos no cookie
        try {
            const savedData = getCookie('eventoWizard');
            if (savedData) {
                const wizardData = JSON.parse(savedData);
                if (wizardData.ingressos && wizardData.ingressos.length > 0 && dados.ingressos.length === 0) {
                    console.log('📋 Usando ingressos do cookie como fallback');
                    dados.ingressos = wizardData.ingressos;
                }
            }
        } catch (e) {
            console.error('Erro ao buscar ingressos do cookie:', e);
        }
        
        console.log('✅ Dados do Step 6 coletados:', dados.ingressos);
    }
    
    // Função para coletar dados do Step 7 (Produtor)
    function coletarStep7() {
        console.log('📊 Coletando dados do Step 7 (Produtor)...');
        
        const dados = window.WizardDataCollector.dados;
        
        // Tipo de produtor
        const producerRadios = document.querySelectorAll('input[name="producer"]');
        producerRadios.forEach(radio => {
            if (radio.checked) {
                dados.tipo_produtor = radio.value || '';
            }
        });
        
        // Se não encontrar por radio, tentar pelo ID
        if (!dados.tipo_produtor) {
            const producerInput = document.getElementById('producer');
            if (producerInput) dados.tipo_produtor = producerInput.value || 'current';
        }
        
        // Sempre coletar os campos, mesmo se estiverem escondidos
        const producerName = document.getElementById('producerName');
        if (producerName) dados.nome_produtor = producerName.value || '';
        
        const displayName = document.getElementById('displayName');
        if (displayName) dados.nome_exibicao = displayName.value || '';
        
        const producerDescription = document.getElementById('producerDescription');
        if (producerDescription) dados.descricao_produtor = producerDescription.value || '';
        
        // Email do produtor (se existir)
        const producerEmail = document.getElementById('producerEmail');
        if (producerEmail) dados.email_produtor = producerEmail.value || '';
        
        console.log('✅ Dados do Step 7 coletados:', dados);
    }
    
    // Função para coletar dados do Step 8 (Termos)
    function coletarStep8() {
        console.log('📊 Coletando dados do Step 8...');
        
        const dados = window.WizardDataCollector.dados;
        
        // Verificar se os termos foram aceitos
        const termsCheckbox = document.querySelector('#termsCheckbox');
        if (termsCheckbox) {
            dados.termos_aceitos = termsCheckbox.classList.contains('checked');
        }
        
        console.log('✅ Dados do Step 8 coletados:', dados);
        console.log('🎉 DADOS COMPLETOS DO WIZARD:', window.WizardDataCollector);
    }
    
    // Função para coletar dados do step atual
    function coletarDadosStepAtual(step) {
        switch(step) {
            case 1: coletarStep1(); break;
            case 2: coletarStep2(); break;
            case 3: coletarStep3(); break;
            case 4: coletarStep4(); break;
            case 5: coletarStep5(); break;
            case 6: coletarStep6(); break;
            case 7: coletarStep7(); break;
            case 8: coletarStep8(); break;
            default: console.log('Step não reconhecido:', step);
        }
    }
    
    // Função para interceptar o nextStep
    function interceptarNextStep() {
        console.log('🔧 Configurando interceptação do nextStep...');
        
        // Tentar várias vezes para garantir
        let tentativas = 0;
        const tentarInterceptar = setInterval(() => {
            tentativas++;
            console.log(`🔍 Tentativa ${tentativas} de interceptar nextStep...`);
            
            if (window.nextStep) {
                clearInterval(tentarInterceptar);
                
                const originalNextStep = window.nextStep;
                
                window.nextStep = function() {
                    console.log('🚀 NextStep interceptado pelo Wizard Data Collector!');
                    
                    // Obter step atual
                    const stepAtual = window.getCurrentStep ? window.getCurrentStep() : 
                                     (window.wizardState ? window.wizardState.currentStep : 1);
                    
                    console.log(`📍 Step atual: ${stepAtual}`);
                    
                    // Coletar dados do step atual
                    coletarDadosStepAtual(stepAtual);
                    
                    // Atualizar step_atual no coletor
                    window.WizardDataCollector.step_atual = stepAtual;
                    
                    // Salvar em localStorage para persistência
                    const dadosParaSalvar = JSON.stringify(window.WizardDataCollector);
                    localStorage.setItem('wizardCollectedData', dadosParaSalvar);
                    console.log('💾 Dados salvos no localStorage:', dadosParaSalvar.length, 'caracteres');
                    
                    // Chamar função original
                    return originalNextStep.apply(this, arguments);
                };
                
                console.log('✅ Interceptação do nextStep configurada com sucesso!');
            } else if (tentativas >= 20) {
                clearInterval(tentarInterceptar);
                console.error('❌ window.nextStep não encontrado após 20 tentativas!');
            }
        }, 250);
    }
    
    // Função para recuperar dados salvos
    function recuperarDadosSalvos() {
        const dadosSalvos = localStorage.getItem('wizardCollectedData');
        if (dadosSalvos) {
            try {
                const dados = JSON.parse(dadosSalvos);
                window.WizardDataCollector = dados;
                console.log('📂 Dados recuperados do localStorage:', dados);
            } catch (e) {
                console.error('Erro ao recuperar dados:', e);
            }
        }
    }
    
    // Função helper para visualizar dados coletados
    window.verDadosColetados = function() {
        console.log('📊 DADOS COLETADOS ATÉ AGORA:');
        console.log(JSON.stringify(window.WizardDataCollector, null, 2));
        return window.WizardDataCollector;
    };
    
    // Função para limpar dados coletados
    window.limparDadosColetados = function() {
        // Usar função de limpeza completa se disponível
        if (window.limparTodosOsDadosDoWizard) {
            window.limparTodosOsDadosDoWizard();
        } else {
            // Fallback - limpeza básica
            localStorage.removeItem('wizardDataCollector');
            window.WizardDataCollector.dados = {
                nome: '',
                classificacao: '',
                categoria: '',
                cor_fundo: '',
                logo_url: '',
                capa_url: '',
                fundo_url: '',
                data_inicio: '',
                data_fim: '',
                nome_local: '',
                cep: '',
                rua: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                estado: '',
                descricao: '',
                tipo_produtor: '',
                nome_produtor: '',
                email_produtor: '',
                lotes: [],
                ingressos: [],
                termos_aceitos: false
            };
            window.WizardDataCollector.step_atual = 1;
        }
        console.log('🧹 Dados limpos!');
    };
    
    // Expor função para uso externo
    window.coletarDadosStepAtual = coletarDadosStepAtual;
    
    // Inicializar
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📋 Wizard Data Collector carregado!');
        recuperarDadosSalvos();
        interceptarNextStep();
        
        console.log('💡 Use verDadosColetados() para ver os dados coletados');
        console.log('💡 Use limparDadosColetados() para limpar os dados');
    });
    
})();
