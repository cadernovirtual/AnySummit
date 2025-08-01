/**
 * Sistema de Salvamento do Wizard v2
 * Compatível com a estrutura esperada pelo criaevento.js
 * NÃO altera regras de negócio ou funcionalidades existentes
 * Apenas organiza o salvamento dos dados no formato correto
 */
window.WizardSaveSystemV2 = {
    // Estrutura compatível com criaevento.js
    dadosEvento: {
        evento: {},
        ingressos: []
    },
    
    // Lotes salvos separadamente (não vão para API diretamente)
    lotes: {
        porData: [],
        porPercentual: []
    },
    
    /**
     * Salvar Step 1 - Informações Básicas
     */
    salvarStep1: function() {
        console.log('📝 Salvando Step 1 - Informações Básicas');
        
        this.dadosEvento.evento.nome = document.getElementById('eventName')?.value || '';
        this.dadosEvento.evento.classificacao = document.getElementById('classification')?.value || '';
        this.dadosEvento.evento.categoria = document.getElementById('category')?.value || '';
        
        // Salvar cor de fundo
        this.dadosEvento.evento.cor_fundo = document.getElementById('corFundo')?.value || '#000000';
        
        // Salvar referências das imagens
        const logoImg = document.querySelector('#logoPreviewContainer img');
        const capaImg = document.querySelector('#capaPreviewContainer img');
        const fundoImg = document.querySelector('#fundoPreviewMain img') || document.querySelector('#fundoPreviewContainer img');
        
        // Armazenar URLs das imagens - priorizar window.uploadedImages
        if (window.uploadedImages) {
            this.dadosEvento.evento.logo_url = window.uploadedImages.logo || '';
            this.dadosEvento.evento.capa_url = window.uploadedImages.capa || '';
            this.dadosEvento.evento.fundo_url = window.uploadedImages.fundo || '';
        }
        
        // Se não tiver em uploadedImages, pegar do DOM
        if (!this.dadosEvento.evento.logo_url && logoImg && logoImg.src && !logoImg.src.includes('blob:')) {
            this.dadosEvento.evento.logo_url = logoImg.src;
        }
        if (!this.dadosEvento.evento.capa_url && capaImg && capaImg.src && !capaImg.src.includes('blob:')) {
            this.dadosEvento.evento.capa_url = capaImg.src;
        }
        if (!this.dadosEvento.evento.fundo_url && fundoImg && fundoImg.src && !fundoImg.src.includes('blob:')) {
            this.dadosEvento.evento.fundo_url = fundoImg.src;
        }
        
        // Adicionar flags de imagens
        this.dadosEvento.evento.tem_logo = !!(this.dadosEvento.evento.logo_url);
        this.dadosEvento.evento.tem_capa = !!(this.dadosEvento.evento.capa_url);
        this.dadosEvento.evento.tem_fundo = !!(this.dadosEvento.evento.fundo_url);
        
        console.log('✅ Step 1 salvo:', this.dadosEvento.evento);
    },
    
    /**
     * Salvar Step 2 - Data e Local
     */
    salvarStep2: function() {
        console.log('📝 Salvando Step 2 - Data e Local');
        
        // Classificação e Categoria
        this.dadosEvento.evento.classificacao = document.getElementById('classification')?.value || '';
        this.dadosEvento.evento.categoria = document.getElementById('category')?.value || '';
        
        // Datas
        this.dadosEvento.evento.data_inicio = document.getElementById('startDateTime')?.value || '';
        this.dadosEvento.evento.data_fim = document.getElementById('endDateTime')?.value || '';
        this.dadosEvento.evento.evento_multiplos_dias = document.getElementById('multiDaySwitch')?.classList.contains('active') || false;
        
        // Tipo de local
        const isPresencial = document.getElementById('locationTypeSwitch')?.classList.contains('active');
        this.dadosEvento.evento.tipo_local = isPresencial ? 'presencial' : 'online';
        
        if (isPresencial) {
            // Coletar todos os campos de endereço
            this.dadosEvento.evento.nome_local = document.getElementById('venueName')?.value || '';
            this.dadosEvento.evento.cep = document.getElementById('cep')?.value || '';
            this.dadosEvento.evento.rua = document.getElementById('street')?.value || '';
            this.dadosEvento.evento.numero = document.getElementById('number')?.value || '';
            this.dadosEvento.evento.complemento = document.getElementById('complement')?.value || '';
            this.dadosEvento.evento.bairro = document.getElementById('neighborhood')?.value || '';
            this.dadosEvento.evento.cidade = document.getElementById('city')?.value || '';
            this.dadosEvento.evento.estado = document.getElementById('state')?.value || '';
            
            // Montar endereço completo
            let endereco = this.dadosEvento.evento.rua;
            if (this.dadosEvento.evento.numero) endereco += `, ${this.dadosEvento.evento.numero}`;
            if (this.dadosEvento.evento.bairro) endereco += ` - ${this.dadosEvento.evento.bairro}`;
            if (this.dadosEvento.evento.cidade) endereco += `, ${this.dadosEvento.evento.cidade}`;
            if (this.dadosEvento.evento.estado) endereco += ` - ${this.dadosEvento.evento.estado}`;
            
            this.dadosEvento.evento.busca_endereco = endereco.trim() || document.getElementById('addressSearch')?.value || '';
        } else {
            this.dadosEvento.evento.link_online = document.getElementById('eventLink')?.value || '';
        }
        
        console.log('✅ Step 2 salvo:', this.dadosEvento.evento);
    },
    
    /**
     * Salvar Step 3 - Descrição
     */
    salvarStep3: function() {
        console.log('📝 Salvando Step 3 - Descrição');
        
        const descricaoElement = document.getElementById('eventDescription');
        if (descricaoElement) {
            this.dadosEvento.evento.descricao_completa = descricaoElement.innerHTML || '';
            this.dadosEvento.evento.descricao_texto = descricaoElement.textContent || '';
        }
        
        console.log('✅ Step 3 salvo');
    },
    
    /**
     * Salvar Step 4 - Dados do Produtor
     */
    salvarStep4: function() {
        console.log('📝 Salvando Step 4 - Dados do Produtor');
        
        const isNovoProdutor = document.getElementById('producer')?.value === 'new';
        this.dadosEvento.evento.tipo_produtor = isNovoProdutor ? 'novo' : 'atual';
        
        if (isNovoProdutor) {
            this.dadosEvento.evento.nome_produtor = document.getElementById('producerName')?.value || '';
            this.dadosEvento.evento.nome_exibicao = document.getElementById('displayName')?.value || '';
            this.dadosEvento.evento.descricao_produtor = document.getElementById('producerDescription')?.value || '';
        }
        
        console.log('✅ Step 4 salvo:', this.dadosEvento.evento);
    },
    
    /**
     * Salvar Step 5 - Lotes
     * Lotes são salvos e incluídos no JSON final
     */
    salvarStep5: function() {
        console.log('📝 Salvando Step 5 - Lotes');
        
        // Coletar lotes do DOM
        const lotesPorData = [];
        const lotesPorPercentual = [];
        
        // Lotes por data
        document.querySelectorAll('#lotesPorData .lote-card').forEach((card, index) => {
            const nomeInput = card.querySelector('input[type="text"]');
            const loteData = {
                id: card.getAttribute('data-lote-id') || `lote_data_${index + 1}`,
                nome: nomeInput?.value || `Lote ${index + 1}`,
                tipo: 'data',
                data_inicio: card.querySelector('[data-field="data-inicio"]')?.value || '',
                data_fim: card.querySelector('[data-field="data-fim"]')?.value || '',
                ativo: true
            };
            lotesPorData.push(loteData);
        });
        
        // Lotes por percentual
        document.querySelectorAll('#lotesPorPercentual .lote-card').forEach((card, index) => {
            const nomeInput = card.querySelector('input[type="text"]');
            const loteData = {
                id: card.getAttribute('data-lote-id') || `lote_perc_${index + 1}`,
                nome: nomeInput?.value || `Lote ${index + 1}`,
                tipo: 'percentual',
                percentual: card.querySelector('[data-field="percentual"]')?.value || '',
                ativo: true
            };
            lotesPorPercentual.push(loteData);
        });
        });
        
        // Salvar em estruturas diferentes
        this.lotes = {
            porData: lotesPorData,
            porPercentual: lotesPorPercentual
        };
        
        // Também incluir no evento para API
        this.dadosEvento.lotes = [...lotesPorData, ...lotesPorPercentual];
        
        // Salvar também no window para outros scripts
        window.lotesData = this.lotes;
        
        console.log('✅ Step 5 - Lotes salvos:', this.lotes);
    },
    
    /**
     * Salvar Step 6 - Ingressos
     * Usa a estrutura compatível com coletarDadosIngressos() do criaevento.js
     */
    salvarStep6: function() {
        console.log('📝 Salvando Step 6 - Ingressos');
        
        // Usar o método de coleta de ingressos já existente se disponível
        if (window.coletarDadosIngressos && typeof window.coletarDadosIngressos === 'function') {
            this.dadosEvento.ingressos = window.coletarDadosIngressos();
        } else {
            // Implementação própria compatível
            this.dadosEvento.ingressos = this.coletarIngressosAtualizados();
        }
        
        console.log('✅ Step 6 - Ingressos salvos:', this.dadosEvento.ingressos);
    },
    
    /**
     * Salvar Step 7 - Extras
     * Estacionamento, acessibilidade, formas de pagamento
     */
    salvarStep7: function() {
        console.log('📝 Salvando Step 7 - Extras');
        
        // Coletar dados de extras
        // Estacionamento
        const estacionamentoSwitch = document.getElementById('parkingSwitch');
        this.dadosEvento.evento.tem_estacionamento = estacionamentoSwitch?.classList.contains('active') ? 'sim' : 'nao';
        
        // Acessibilidade
        const acessibilidadeSwitch = document.getElementById('accessibilitySwitch');
        this.dadosEvento.evento.tem_acessibilidade = acessibilidadeSwitch?.classList.contains('active') ? 'sim' : 'nao';
        
        // Formas de pagamento (podem estar em checkboxes ou switches)
        const formasPagamento = [];
        const pagamentoElements = document.querySelectorAll('[data-payment-method]');
        pagamentoElements.forEach(el => {
            if (el.checked || el.classList.contains('active') || el.classList.contains('checked')) {
                formasPagamento.push(el.dataset.paymentMethod);
            }
        });
        
        if (formasPagamento.length > 0) {
            this.dadosEvento.evento.formas_pagamento = formasPagamento;
        }
        
        console.log('✅ Step 7 salvo:', this.dadosEvento.evento);
    },
    
    /**
     * Salvar Step 8 - Termos e Publicação
     */
    salvarStep8: function() {
        console.log('📝 Salvando Step 8 - Termos e Publicação');
        
        // Visibilidade
        const visibilityRadio = document.querySelector('.radio.checked[data-value]');
        this.dadosEvento.evento.visibilidade = visibilityRadio?.dataset.value || 'public';
        
        // Termos aceitos
        const termsCheckbox = document.getElementById('termsCheckbox');
        this.dadosEvento.evento.termos_aceitos = termsCheckbox?.classList.contains('checked') || false;
        
        // Se existir estado global dos termos, usar ele
        if (window.termsState && window.termsState.accepted !== undefined) {
            this.dadosEvento.evento.termos_aceitos = window.termsState.accepted;
        }
        
        console.log('✅ Step 8 salvo:', this.dadosEvento.evento);
    },
    
    /**
     * Método auxiliar para coletar ingressos
     * Compatível com a estrutura esperada pela API
     */
    coletarIngressosAtualizados: function() {
        const ingressos = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach((item, index) => {
            // Coletar dados do header
            const ticketName = item.querySelector('.ticket-name')?.textContent?.trim() || `Ingresso ${index + 1}`;
            const buyerPriceText = item.querySelector('.ticket-buyer-price')?.textContent || '';
            const receivePriceText = item.querySelector('.ticket-receive-amount')?.textContent || '';
            
            // Coletar dados dos detalhes
            const detailValues = item.querySelectorAll('.ticket-detail-value');
            const quantidade = detailValues[0]?.textContent?.trim() || '1';
            const taxaText = detailValues[1]?.textContent?.trim() || '0';
            const statusText = detailValues[2]?.textContent?.trim() || 'Ativo';
            
            // Obter lote_id do ingresso
            let loteId = item.dataset.loteId || item.getAttribute('data-lote-id') || '';
            
            // Se não tiver lote_id direto, tentar encontrar pelo nome do lote no item
            if (!loteId) {
                const loteInfo = item.querySelector('.ticket-lote-info')?.textContent || '';
                if (loteInfo && this.lotes) {
                    // Procurar lote correspondente
                    const todosLotes = [...(this.lotes.porData || []), ...(this.lotes.porPercentual || [])];
                    const loteEncontrado = todosLotes.find(l => loteInfo.includes(l.nome));
                    if (loteEncontrado) {
                        loteId = loteEncontrado.id;
                    }
                }
            }
            
            // Determinar tipo e valores
            let tipo = 'gratuito';
            let valorComprador = 0;
            let valorReceber = 0;
            let taxaPlataforma = 0;
            let conteudoCombo = null;
            
            // Verificar se é combo
            if (ticketName.includes('📦') || item.dataset.comboData || item.classList.contains('combo')) {
                tipo = 'combo';
                
                // Extrair valor do combo
                const comboMatch = buyerPriceText.match(/R\$\s*([\d,.]+)/);
                if (comboMatch) {
                    valorComprador = parseFloat(comboMatch[1].replace(/\./g, '').replace(',', '.'));
                    taxaPlataforma = valorComprador * 0.1;
                    valorReceber = valorComprador - taxaPlataforma;
                }
                
                // Extrair dados do combo
                if (item.dataset.comboData) {
                    try {
                        const comboDataParsed = JSON.parse(item.dataset.comboData);
                        // Formatar conteudo_combo corretamente
                        conteudoCombo = {};
                        if (comboDataParsed.items) {
                            comboDataParsed.items.forEach(comboItem => {
                                conteudoCombo[comboItem.id] = comboItem.quantity || 1;
                            });
                        } else if (Array.isArray(comboDataParsed)) {
                            comboDataParsed.forEach(comboItem => {
                                conteudoCombo[comboItem.id] = comboItem.quantity || 1;
                            });
                        }
                    } catch (e) {
                        console.error('Erro ao parsear combo data:', e);
                    }
                }
            } else if (buyerPriceText.includes('R$')) {
                tipo = 'pago';
                
                // Extrair valor do comprador
                const buyerMatch = buyerPriceText.match(/R\$\s*([\d,.]+)/);
                if (buyerMatch) {
                    valorComprador = parseFloat(buyerMatch[1].replace(/\./g, '').replace(',', '.'));
                    taxaPlataforma = valorComprador * 0.1; // 10% de taxa
                    valorReceber = valorComprador - taxaPlataforma;
                }
            } else if (buyerPriceText.includes('código') || ticketName.toLowerCase().includes('código')) {
                tipo = 'codigo';
            }
            
            // Verificar se está ativo
            const switchElement = item.querySelector('.switch-mini');
            const ativo = switchElement ? switchElement.classList.contains('active') : true;
            
            // Datas padrão
            const agora = new Date();
            const inicioVenda = agora.toISOString().slice(0, 16);
            const fimVenda = new Date(agora.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16);
            
            const ingresso = {
                tipo: tipo,
                titulo: ticketName.replace(' 📦', ''), // Remover emoji do combo
                descricao: item.dataset.description || '',
                quantidade_total: parseInt(quantidade) || 1,
                preco: valorComprador,
                valor_receber: valorReceber,
                taxa_plataforma: taxaPlataforma,
                inicio_venda: inicioVenda,
                fim_venda: fimVenda,
                limite_min: 1,
                limite_max: 10,
                ativo: ativo,
                posicao_ordem: index + 1,
                lote_id: loteId // Incluir lote_id
            };
            
            // Adicionar conteudo_combo apenas para combos
            if (conteudoCombo && Object.keys(conteudoCombo).length > 0) {
                ingresso.conteudo_combo = conteudoCombo;
            }
            
            ingressos.push(ingresso);
        });
        
        return ingressos;
    },
    
    /**
     * Salvar todos os dados em cookies
     */
    salvarEmCookies: function() {
        // Salvar estrutura principal
        setCookie('eventoWizardV2', JSON.stringify(this.dadosEvento), 7);
        
        // Salvar lotes separadamente
        if (this.lotes) {
            setCookie('lotesData', JSON.stringify(this.lotes), 7);
        }
        
        console.log('✅ Dados salvos em cookies');
    },
    
    /**
     * Recuperar dados dos cookies
     */
    recuperarDeCookies: function() {
        // Recuperar estrutura principal
        const savedData = getCookie('eventoWizardV2');
        if (savedData) {
            try {
                this.dadosEvento = JSON.parse(savedData);
            } catch (e) {
                console.error('Erro ao recuperar dados do evento:', e);
            }
        }
        
        // Recuperar lotes
        const savedLotes = getCookie('lotesData');
        if (savedLotes) {
            try {
                this.lotes = JSON.parse(savedLotes);
            } catch (e) {
                console.error('Erro ao recuperar lotes:', e);
            }
        }
    },
    
    /**
     * Obter dados completos no formato esperado pela API
     */
    obterDadosCompletos: function() {
        return this.dadosEvento;
    },
    
    /**
     * Salvar dados da etapa atual
     */
    salvarStepAtual: function(stepNumber) {
        // Chamar método específico baseado no número da etapa
        const metodosStep = {
            1: 'salvarStep1',
            2: 'salvarStep2',
            3: 'salvarStep3',
            4: 'salvarStep4',
            5: 'salvarStep5',
            6: 'salvarStep6',
            7: 'salvarStep7',
            8: 'salvarStep8'
        };
        
        const metodo = metodosStep[stepNumber];
        if (metodo && this[metodo]) {
            this[metodo]();
            this.salvarEmCookies();
        }
    }
};

// Funções auxiliares de cookies (se não existirem)
if (typeof getCookie === 'undefined') {
    window.getCookie = function(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };
}

if (typeof setCookie === 'undefined') {
    window.setCookie = function(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    };
}