// Função editComboTicket - definição global
// Esta função deve estar disponível globalmente para os botões de edição

console.log('🔥 ARQUIVO editComboTicket-definition.js CARREGANDO...');
console.log('🕐 Timestamp:', new Date().toISOString());

(function() {
    console.log('🎭 Definindo função editComboTicket...');

    // Verificar se já existe
    if (typeof window.editComboTicket === 'function') {
        console.log('✅ editComboTicket já está definida');
        return;
    }

    // Definir função global
    window.editComboTicket = async function(comboId) {
        console.log(`🎭 Editando combo: ${comboId}`);

        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                alert('Erro: ID do evento não encontrado');
                return;
            }
            
            console.log(`🔍 Buscando dados do combo ${comboId} no banco...`);
            
            // Mostrar loading
            const modal = document.getElementById('editComboTicketModal');
            if (modal) {
                const overlay = document.createElement('div');
                overlay.id = 'editComboLoading';
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                `;
                overlay.innerHTML = '<div style="text-align: center;"><div style="margin-bottom: 10px;">🔄</div><div>Carregando dados...</div></div>';
                modal.appendChild(overlay);
            }
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_dados_ingresso&evento_id=${eventoId}&ingresso_id=${comboId}`
            });
            
            const data = await response.json();
            
            // Remover loading
            const loadingElement = document.getElementById('editComboLoading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            if (data.sucesso && data.ingresso) {
                console.log('✅ Dados do combo obtidos:', data.ingresso);
                
                // Preencher modal com dados do banco
                if (typeof window.preencherModalComboComDadosBanco === 'function') {
                    window.preencherModalComboComDadosBanco(data.ingresso);
                } else {
                    console.warn('⚠️ Função preencherModalComboComDadosBanco não encontrada, usando método alternativo');
                    preencherModalComboAlternativo(data.ingresso);
                }
                
                // Abrir modal
                if (window.openModal) {
                    window.openModal('editComboTicketModal');
                } else {
                    // Fallback manual
                    const modal = document.getElementById('editComboTicketModal');
                    if (modal) {
                        modal.style.display = 'flex';
                    }
                }
                
            } else {
                console.error('❌ Erro ao buscar combo:', data.erro);
                alert('Erro ao carregar dados do combo: ' + (data.erro || 'Combo não encontrado'));
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro ao carregar dados do combo');
            
            // Remover loading em caso de erro
            const loadingElement = document.getElementById('editComboLoading');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    };

    // Função alternativa para preencher modal
    function preencherModalComboAlternativo(combo) {
        console.log('🎭 Preenchendo modal de combo - método baseado em editTicket');
        
        // **1. REMOVER MENSAGEM DE LOTE FIXO**
        const mensagemLoteFixo = document.querySelector('.bloqueio-lote-data-msg-combo');
        if (mensagemLoteFixo) {
            mensagemLoteFixo.remove();
            console.log('✅ Mensagem de lote fixo removida');
        }
        
        // **2. CAMPOS BÁSICOS (IGUAL editTicket)**
        const campos = {
            'editComboTicketId': combo.id || '',
            'editComboTitle': combo.titulo || '',
            'editComboDescription': combo.descricao || '',
            'editComboQuantity': combo.quantidade_total || '',
            'editComboSaleStart': combo.inicio_venda || '',
            'editComboSaleEnd': combo.fim_venda || '',
            'editComboMinQuantity': combo.limite_min || 1,
            'editComboMaxQuantity': combo.limite_max || 5,
            'editComboPrice': combo.preco || '',
            'editComboTicketLote': combo.lote_id || ''
        };

        // Preencher campos
        for (const [id, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = valor;
                console.log(`✅ Campo ${id} preenchido: ${valor}`);
            } else {
                console.warn(`⚠️ Campo ${id} não encontrado`);
            }
        }

        // **3. CÁLCULO DE VALORES (COPIADO DE editTicket)**
        calcularValoresCombo(combo);

        // **4. PREENCHER LISTA DE ITENS DO COMBO**
        preencherListaItensCombo(combo);

        // **FUNÇÃO PARA POPULAR SELECT DE INGRESSOS DO MESMO LOTE**
        popularSelectIngressosDoLote(combo.lote_id);
    }

    // **FUNÇÃO PARA CALCULAR VALORES (baseada em editTicket)**
    function calcularValoresCombo(combo) {
        console.log('💰 Calculando valores do combo (baseado em editTicket)');
        
        const preco = parseFloat(combo.preco) || 0;
        const taxaServico = combo.taxa_servico || combo.cobrar_taxa || false;
        
        // Taxa padrão do sistema (geralmente 10%)
        const TAXA_PADRAO = 0.10;
        
        let valorTaxa = 0;
        let valorReceber = preco;
        
        if (taxaServico) {
            valorTaxa = preco * TAXA_PADRAO;
            valorReceber = preco - valorTaxa;
        }
        
        // Atualizar campos de exibição
        const camposExibicao = {
            'editComboTaxaValor': `R$ ${valorTaxa.toFixed(2).replace('.', ',')}`,
            'editComboReceive': `R$ ${valorReceber.toFixed(2).replace('.', ',')}`,
            'editComboValorComprador': `R$ ${preco.toFixed(2).replace('.', ',')}`
        };
        
        for (const [id, valor] of Object.entries(camposExibicao)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
                console.log(`💰 ${id}: ${valor}`);
            }
        }
        
        // Atualizar checkbox de taxa
        const taxaCheckbox = document.getElementById('editComboTaxaServico');
        if (taxaCheckbox) {
            taxaCheckbox.checked = taxaServico;
        }
    }

    // **FUNÇÃO PARA PREENCHER LISTA DE ITENS DO COMBO**
    function preencherListaItensCombo(combo) {
        console.log('📦 Preenchendo lista de itens do combo');
        
        const container = document.getElementById('editComboItemsList');
        if (!container) {
            console.warn('⚠️ Container editComboItemsList não encontrado');
            return;
        }
        
        try {
            // Parse do JSON conteudo_combo
            const conteudoCombo = combo.conteudo_combo ? JSON.parse(combo.conteudo_combo) : [];
            console.log('📋 Itens do combo:', conteudoCombo);
            
            if (conteudoCombo.length === 0) {
                container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum item no combo</p>';
                return;
            }
            
            // Buscar nomes dos ingressos primeiro
            buscarNomesIngressosParaCombo(conteudoCombo).then(nomesIngressos => {
                let htmlItens = '';
                
                conteudoCombo.forEach((item, index) => {
                    const nomeIngresso = nomesIngressos[item.ingresso_id] || `Ingresso ${item.ingresso_id}`;
                    
                    htmlItens += `
                        <div class="combo-item" data-ingresso-id="${item.ingresso_id}">
                            <div class="combo-item-info">
                                <strong>${nomeIngresso}</strong>
                                <span>Qtd: ${item.quantidade}</span>
                            </div>
                            <button type="button" onclick="removerItemCombo(${index})" class="btn-icon" title="Remover">
                                🗑️
                            </button>
                        </div>
                    `;
                });
                
                container.innerHTML = htmlItens;
                console.log(`✅ ${conteudoCombo.length} itens renderizados no combo`);
            });
            
        } catch (error) {
            console.error('❌ Erro ao processar conteudo_combo:', error);
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Erro ao carregar itens</p>';
        }
    }

    // **FUNÇÃO PARA BUSCAR NOMES DOS INGRESSOS**
    async function buscarNomesIngressosParaCombo(itensCombo) {
        const nomesIngressos = {};
        
        for (const item of itensCombo) {
            try {
                const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                const response = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `action=obter_dados_ingresso&evento_id=${eventoId}&ingresso_id=${item.ingresso_id}`
                });
                
                const data = await response.json();
                if (data.sucesso && data.ingresso) {
                    nomesIngressos[item.ingresso_id] = data.ingresso.titulo;
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao buscar nome do ingresso ${item.ingresso_id}:`, error);
            }
        }
        
        return nomesIngressos;
    }

    // **FUNÇÃO PARA POPULAR SELECT DE INGRESSOS DO MESMO LOTE**
    function popularSelectIngressosDoLote(loteId) {
        console.log(`📋 Populando select com ingressos do lote ${loteId}`);
        
        const select = document.getElementById('editComboTicketTypeSelect');
        if (!select) {
            console.warn('⚠️ Select editComboTicketTypeSelect não encontrado');
            return;
        }
        
        // Limpar select
        select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
        
        if (!loteId) {
            console.warn('⚠️ Lote ID não informado');
            return;
        }
        
        // Buscar ingressos do lote
        buscarIngressosDoLote(loteId).then(ingressos => {
            ingressos.forEach(ingresso => {
                // Não incluir combos no select
                if (ingresso.tipo !== 'combo') {
                    const option = document.createElement('option');
                    option.value = ingresso.id;
                    option.textContent = `${ingresso.titulo} (${ingresso.tipo})`;
                    select.appendChild(option);
                }
            });
            
            console.log(`✅ ${ingressos.length} ingressos adicionados ao select`);
        });
    }

    // **FUNÇÃO AUXILIAR PARA BUSCAR INGRESSOS DO LOTE**
    async function buscarIngressosDoLote(loteId) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=listar_ingressos&evento_id=${eventoId}&lote_id=${loteId}`
            });
            
            const data = await response.json();
            if (data.sucesso && data.ingressos) {
                return data.ingressos;
            }
            
            return [];
        } catch (error) {
            console.error('❌ Erro ao buscar ingressos do lote:', error);
            return [];
        }
    }

    console.log('✅ Função editComboTicket definida globalmente');
})();
