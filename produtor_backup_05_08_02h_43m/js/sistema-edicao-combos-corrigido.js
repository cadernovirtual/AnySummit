/**
 * SISTEMA DE EDIÇÃO DE COMBOS - CORRIGIDO
 * 
 * PROBLEMA RESOLVIDO:
 * - Ao editar combo, carrega lote associado como readonly
 * - Usa datas do lote se for "por data" para travar campos
 * - Dados sempre vêm do banco, não da sessão
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de Edição de Combos carregado');
    
    // =======================================================
    // 1. INTERCEPTAR ABERTURA DE MODAL DE EDIÇÃO DE COMBO
    // =======================================================
    
    // Aguardar funções estarem disponíveis
    setTimeout(() => {
        interceptarEdicaoCombo();
    }, 1500);
    
    function interceptarEdicaoCombo() {
        // Interceptar função que abre modal de edição de combo
        if (window.preencherModalCombo) {
            const originalPreencherModal = window.preencherModalCombo;
            
            window.preencherModalCombo = function(ingresso) {
                console.log('🎭 [INTERCEPTADO] Preenchendo modal de edição de combo:', ingresso);
                
                // Chamar função original primeiro
                const resultado = originalPreencherModal.call(this, ingresso);
                
                // Aplicar correções específicas para combo
                setTimeout(() => {
                    configurarLoteReadonlyParaCombo(ingresso);
                }, 100);
                
                return resultado;
            };
        }
        
        // Também interceptar pela função de edição direta
        if (typeof window.editComboTicket === 'function') {
            const originalEditCombo = window.editComboTicket;
            
            window.editComboTicket = function(comboId) {
                console.log(`🎭 [INTERCEPTADO] Editando combo ${comboId}`);
                
                // Buscar dados do combo do banco antes de abrir modal
                buscarDadosComboParaEdicao(comboId);
            };
        }
    }
    
    // =======================================================
    // 2. BUSCAR DADOS DO COMBO DO BANCO
    // =======================================================
    
    async function buscarDadosComboParaEdicao(comboId) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            console.log(`🔍 Buscando dados do combo ${comboId} no banco...`);
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_dados_ingresso&evento_id=${eventoId}&ingresso_id=${comboId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.ingresso) {
                console.log('✅ Dados do combo obtidos:', data.ingresso);
                
                // Preencher modal com dados do banco
                preencherModalComboComDadosBanco(data.ingresso);
                
                // Abrir modal
                if (window.openModal) {
                    window.openModal('editComboTicketModal');
                }
                
            } else {
                console.error('❌ Erro ao buscar combo:', data.erro);
                alert('Erro ao carregar dados do combo: ' + (data.erro || 'Combo não encontrado'));
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro de conexão ao buscar dados do combo.');
        }
    }
    
    // =======================================================
    // 3. PREENCHER MODAL COM DADOS DO BANCO
    // =======================================================
    
    function preencherModalComboComDadosBanco(combo) {
        console.log('🎭 Preenchendo modal de combo com dados do banco');
        
        // Campos básicos
        const campos = {
            'editComboTicketId': combo.id,
            'editComboTitle': combo.titulo,
            'editComboDescription': combo.descricao || '',
            'editComboPrice': formatarPreco(combo.preco),
            'editComboTicketLote': combo.lote_id || '',
            'editComboSaleStart': combo.inicio_venda || '',
            'editComboSaleEnd': combo.fim_venda || '',
            'editComboQuantity': combo.quantidade_total || '',
            'editComboMinQuantity': combo.limite_min || 1,
            'editComboMaxQuantity': combo.limite_max || 5
        };
        
        // **1. REMOVER MENSAGEM DE LOTE FIXO**
        const mensagemLoteFixo = document.querySelector('.bloqueio-lote-data-msg-combo');
        if (mensagemLoteFixo) {
            mensagemLoteFixo.remove();
            console.log('✅ Mensagem "Lote fixo" removida');
        }
        
        // Preencher campos
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
                console.log(`✅ Campo preenchido ${id}: ${campos[id]}`);
            } else {
                console.warn(`⚠️ Campo não encontrado: ${id}`);
            }
        });
        
        // Configurar lote como readonly e aplicar regras
        setTimeout(() => {
            configurarLoteReadonlyParaCombo(combo);
        }, 100);
        
        // **2. CALCULAR VALORES (baseado em editTicket)**
        calcularValoresCombo(combo);
        
        // **ADICIONAR LISTENERS PARA RECÁLCULO AUTOMÁTICO**
        adicionarListenersCalculoCombo();
        
        // **3. POPULAR SELECT DE INGRESSOS DO MESMO LOTE (usar função existente)**
        // Usar as funções globais que já funcionam
        if (typeof window.populateEditComboTicketSelect === 'function') {
            window.populateEditComboTicketSelect(combo.lote_id);
        } else {
            popularSelectIngressosDoLote(combo);
        }
        
        // Carregar itens do combo
        carregarItensDoCombo(combo);
    }
    
    // =======================================================
    // 4. CONFIGURAR LOTE COMO READONLY
    // =======================================================
    
    async function configurarLoteReadonlyParaCombo(combo) {
        console.log(`🔒 Configurando lote ${combo.lote_id} como readonly para combo`);
        
        const selectLote = document.getElementById('editComboTicketLote');
        if (!selectLote) {
            console.error('❌ Select editComboTicketLote não encontrado');
            return;
        }
        
        // 1. Popular o select com lotes disponíveis
        await popularSelectLotesParaCombo(selectLote);
        
        // 2. Definir valor do lote atual
        selectLote.value = combo.lote_id;
        
        // 3. Tornar readonly
        selectLote.disabled = true;
        selectLote.style.backgroundColor = '#f0f0f0'; // Cor mais suave
        selectLote.style.cursor = 'not-allowed';
        
        // 4. Adicionar mensagem explicativa
        adicionarMensagemLoteReadonly(selectLote);
        
        // 5. Buscar tipo do lote e aplicar regras nas datas
        aplicarRegrasDatasDoLote(combo.lote_id);
        
        console.log(`✅ Lote ${combo.lote_id} configurado como readonly`);
    }
    
    async function popularSelectLotesParaCombo(selectLote) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Buscar lotes do evento
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=recuperar_evento&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.lotes) {
                // Limpar select
                selectLote.innerHTML = '<option value="">Selecione um lote</option>';
                
                // Adicionar lotes
                data.lotes.forEach(lote => {
                    const option = document.createElement('option');
                    option.value = lote.id;
                    option.textContent = `${lote.nome} - ${lote.tipo === 'data' ? 'Por Data' : 'Por Vendas'}`;
                    selectLote.appendChild(option);
                });
                
                console.log(`✅ ${data.lotes.length} lotes carregados no select do combo`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar lotes:', error);
        }
    }
    
    function adicionarMensagemLoteReadonly(selectLote) {
        // REMOVIDO: Não renderizar mais esta mensagem de lote readonly
        console.log('🔒 Mensagem de lote readonly removida - não será mais exibida');
    }
    
    // =======================================================
    // 5. APLICAR REGRAS DE DATAS DO LOTE
    // =======================================================
    
    async function aplicarRegrasDatasDoLote(loteId) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Buscar tipo do lote
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_tipo_lote&evento_id=${eventoId}&lote_id=${loteId}`
            });
            
            const data = await response.json();
            
            if (data.tipo === 'data') {
                // Lote por data - buscar datas e aplicar readonly
                await aplicarDatasLoteNoCombo(loteId);
            } else {
                // Lote por percentual - liberar campos
                liberarCamposDataCombo();
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar tipo do lote:', error);
        }
    }
    
    async function aplicarDatasLoteNoCombo(loteId) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Buscar datas do lote
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_datas_lote&evento_id=${eventoId}&lote_id=${loteId}`
            });
            
            const data = await response.json();
            
            if (data.data_inicio && data.data_fim) {
                // Aplicar datas e tornar readonly
                const campoInicio = document.getElementById('editComboSaleStart');
                const campoFim = document.getElementById('editComboSaleEnd');
                
                if (campoInicio) {
                    campoInicio.value = data.data_inicio;
                    campoInicio.readOnly = true;
                    campoInicio.style.backgroundColor = '#f0f0f0'; // Cor mais suave
                }
                
                if (campoFim) {
                    campoFim.value = data.data_fim;
                    campoFim.readOnly = true;
                    campoFim.style.backgroundColor = '#f0f0f0'; // Cor mais suave
                }
                
                // Adicionar mensagem explicativa
                adicionarMensagemDatasReadonly();
                
                console.log(`🔒 Datas do lote aplicadas: ${data.data_inicio} até ${data.data_fim}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao buscar datas do lote:', error);
        }
    }
    
    function liberarCamposDataCombo() {
        const campoInicio = document.getElementById('editComboSaleStart');
        const campoFim = document.getElementById('editComboSaleEnd');
        
        if (campoInicio) {
            campoInicio.readOnly = false;
            campoInicio.style.backgroundColor = '';
        }
        
        if (campoFim) {
            campoFim.readOnly = false;
            campoFim.style.backgroundColor = '';
        }
        
        // Remover mensagem de datas readonly
        const mensagens = document.querySelectorAll('.datas-readonly-msg');
        mensagens.forEach(msg => msg.remove());
        
        console.log('🔓 Campos de data liberados para lote por percentual');
    }
    
    function adicionarMensagemDatasReadonly() {
        // Verificar se já existe
        if (document.querySelector('.datas-readonly-msg')) return;
        
        const modal = document.getElementById('editComboTicketModal');
        if (!modal) return;
        
        const mensagem = document.createElement('div');
        mensagem.className = 'datas-readonly-msg';
        mensagem.style.cssText = `
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin: 10px 0;
        `;
        mensagem.innerHTML = '📅 <strong>Datas fixas:</strong> As datas são herdadas do lote e não podem ser alteradas.';
        
        // Inserir no modal
        const campoInicio = document.getElementById('editComboSaleStart');
        if (campoInicio && campoInicio.parentNode) {
            campoInicio.parentNode.insertBefore(mensagem, campoInicio);
        }
    }
    
    // =======================================================
    // 5.5. CALCULAR VALORES DO COMBO (COPIADO de editTicket/taxa-servico-completa.js)
    // =======================================================
    
    function calcularValoresCombo(combo) {
        console.log('💰 Calculando valores do combo (baseado em editTicket)');
        
        const priceInput = document.getElementById('editComboPrice');
        const taxaCheckbox = document.getElementById('editComboTaxaServico');
        
        if (!priceInput) {
            console.warn('⚠️ Campo editComboPrice não encontrado');
            return;
        }
        
        // Limpeza monetária (igual ao editTicket)
        const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
        const valorCombo = parseFloat(valorLimpo) || 0;
        
        // Taxa do sistema (igual ao editTicket)
        const TAXA_SERVICO_PADRAO = 0.08; // 8%
        
        let taxaPlataforma = 0;
        let valorComprador = valorCombo;
        let valorReceber = valorCombo;
        
        // Verificar se taxa está ativa (igual ao editTicket)
        if (taxaCheckbox && taxaCheckbox.checked) {
            taxaPlataforma = valorCombo * TAXA_SERVICO_PADRAO;
            valorComprador = valorCombo + taxaPlataforma;
            valorReceber = valorCombo;
        }
        
        // Atualizar elementos na tela (igual ao editTicket)
        const elements = {
            'editComboTaxaValor': `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`,
            'editComboValorComprador': `R$ ${valorComprador.toFixed(2).replace('.', ',')}`,
            'editComboReceive': `R$ ${valorReceber.toFixed(2).replace('.', ',')}`
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) {
                // Verificar se é input ou span/div
                if (el.tagName === 'INPUT') {
                    el.value = value;
                } else {
                    el.textContent = value;
                }
                console.log(`💰 ${id}: ${value}`);
            } else {
                console.warn(`⚠️ Elemento ${id} não encontrado`);
            }
        }
        
        console.log('✅ Valores calculados:', { valorCombo, taxaPlataforma, valorComprador, valorReceber });
    }
    
    // Função para adicionar listeners de recálculo automático
    function adicionarListenersCalculoCombo() {
        console.log('🔧 Adicionando listeners para cálculo automático');
        
        // Listener para campo de preço
        const priceInput = document.getElementById('editComboPrice');
        if (priceInput) {
            // Remover listeners existentes
            priceInput.replaceWith(priceInput.cloneNode(true));
            const newPriceInput = document.getElementById('editComboPrice');
            
            newPriceInput.addEventListener('input', function() {
                console.log('💰 Preço alterado, recalculando...');
                calcularValoresComboAutomatico();
            });
            
            newPriceInput.addEventListener('blur', function() {
                console.log('💰 Campo preço perdeu foco, recalculando...');
                calcularValoresComboAutomatico();
            });
            
            console.log('✅ Listener de preço adicionado');
        }
        
        // Listener para checkbox de taxa
        const taxaCheckbox = document.getElementById('editComboTaxaServico');
        if (taxaCheckbox) {
            // Remover listeners existentes
            taxaCheckbox.replaceWith(taxaCheckbox.cloneNode(true));
            const newTaxaCheckbox = document.getElementById('editComboTaxaServico');
            
            newTaxaCheckbox.addEventListener('change', function() {
                console.log('💰 Taxa alterada, recalculando...', this.checked);
                calcularValoresComboAutomatico();
            });
            
            console.log('✅ Listener de taxa adicionado');
        }
    }
    
    // Função para calcular valores automaticamente (sem parâmetro combo)
    function calcularValoresComboAutomatico() {
        console.log('💰 Calculando valores automaticamente...');
        
        const priceInput = document.getElementById('editComboPrice');
        const taxaCheckbox = document.getElementById('editComboTaxaServico');
        
        if (!priceInput) {
            console.warn('⚠️ Campo editComboPrice não encontrado');
            return;
        }
        
        // Limpeza monetária (igual ao editTicket)
        const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
        const valorCombo = parseFloat(valorLimpo) || 0;
        
        // Taxa do sistema (igual ao editTicket)
        const TAXA_SERVICO_PADRAO = 0.08; // 8%
        
        let taxaPlataforma = 0;
        let valorComprador = valorCombo;
        let valorReceber = valorCombo;
        
        // Verificar se taxa está ativa (igual ao editTicket)
        if (taxaCheckbox && taxaCheckbox.checked) {
            taxaPlataforma = valorCombo * TAXA_SERVICO_PADRAO;
            valorComprador = valorCombo + taxaPlataforma;
            valorReceber = valorCombo;
        }
        
        // Atualizar elementos na tela (igual ao editTicket)
        const elements = {
            'editComboTaxaValor': `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`,
            'editComboValorComprador': `R$ ${valorComprador.toFixed(2).replace('.', ',')}`,
            'editComboReceive': `R$ ${valorReceber.toFixed(2).replace('.', ',')}`
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) {
                // Verificar se é input ou span/div
                if (el.tagName === 'INPUT') {
                    el.value = value;
                } else {
                    el.textContent = value;
                }
            }
        }
        
        console.log('✅ Valores recalculados:', { valorCombo, taxaPlataforma, valorComprador, valorReceber });
    }

    // =======================================================
    // 6. CARREGAR ITENS DO COMBO
    // =======================================================
    
    function carregarItensDoCombo(combo) {
        console.log('📦 Carregando itens do combo para editComboItemsList:', combo.conteudo_combo);
        
        const container = document.getElementById('editComboItemsList');
        if (!container) {
            console.warn('⚠️ Container editComboItemsList não encontrado');
            return;
        }
        
        if (!combo.conteudo_combo) {
            console.log('📦 Combo sem itens definidos');
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum item no combo</p>';
            return;
        }
        
        try {
            const itens = typeof combo.conteudo_combo === 'string' 
                ? JSON.parse(combo.conteudo_combo) 
                : combo.conteudo_combo;
            
            if (Array.isArray(itens) && itens.length > 0) {
                console.log(`📦 Processando ${itens.length} itens do combo`);
                
                // Buscar nomes dos ingressos e renderizar
                buscarNomesEExibirItens(itens, container);
                
                // Também atualizar comboItems global para compatibilidade
                if (window.comboItems) {
                    window.comboItems.length = 0;
                    itens.forEach(item => {
                        window.comboItems.push({
                            ingresso_id: item.ingresso_id,
                            quantidade: item.quantidade,
                            ticket_id: item.ingresso_id,
                            id: item.ingresso_id,
                            quantity: item.quantidade
                        });
                    });
                }
                
                // Atualizar interface do combo se função existir
                if (typeof window.updateComboItemsList === 'function') {
                    window.updateComboItemsList();
                }
            } else {
                container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum item no combo</p>';
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar conteúdo do combo:', error);
            console.error('❌ Conteúdo que causou erro:', combo.conteudo_combo);
            
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Erro ao carregar itens do combo</p>';
        }
    }
    
    // Função para buscar nomes dos ingressos e exibir no container
    async function buscarNomesEExibirItens(itens, container) {
        console.log('🔍 Buscando nomes dos ingressos para exibição...');
        
        // Mostrar loading
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Carregando itens...</p>';
        
        const itensComNomes = [];
        
        for (const item of itens) {
            try {
                const nomeIngresso = await buscarNomeIngresso(item.ingresso_id);
                itensComNomes.push({
                    ...item,
                    titulo: nomeIngresso
                });
            } catch (error) {
                console.warn(`⚠️ Erro ao buscar nome do ingresso ${item.ingresso_id}:`, error);
                itensComNomes.push({
                    ...item,
                    titulo: `Ingresso ${item.ingresso_id}`
                });
            }
        }
        
        // Renderizar lista
        renderizarListaItens(itensComNomes, container);
    }
    
    // Função para buscar nome de um ingresso específico
    async function buscarNomeIngresso(ingressoId) {
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=obter_dados_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const data = await response.json();
        if (data.sucesso && data.ingresso) {
            return data.ingresso.titulo;
        }
        
        return `Ingresso ${ingressoId}`;
    }
    
    // Função para renderizar a lista visual dos itens
    function renderizarListaItens(itens, container) {
        console.log(`📋 Renderizando ${itens.length} itens na lista`);
        
        let html = '';
        
        itens.forEach((item, index) => {
            html += `
                <div class="combo-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin-bottom: 8px; border: 1px solid #e0e0e0; border-radius: 4px; background: #f9f9f9;">
                    <div class="combo-item-info">
                        <strong style="color: #333;">${item.titulo}</strong>
                        <span style="color: #666; font-size: 14px; margin-left: 10px;">Qtd: ${item.quantidade}</span>
                    </div>
                    <button type="button" onclick="removerItemCombo(${index})" class="btn-icon" title="Remover" style="background: #dc3545; color: white; border: none; border-radius: 3px; width: 24px; height: 24px; cursor: pointer;">
                        🗑️
                    </button>
                </div>
            `;
        });
        
        if (html) {
            container.innerHTML = html;
            console.log(`✅ ${itens.length} itens renderizados em editComboItemsList`);
        } else {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum item no combo</p>';
        }
    }
    
    // =======================================================
    // 8. POPULAR SELECT COM INGRESSOS DO MESMO LOTE
    // =======================================================
    
    async function popularSelectIngressosDoLote(combo) {
        console.log(`📋 Populando select com ingressos do lote ${combo.lote_id}`);
        
        const select = document.getElementById('editComboTicketTypeSelect');
        if (!select) {
            console.warn('⚠️ Select editComboTicketTypeSelect não encontrado');
            return;
        }
        
        // Limpar select
        select.innerHTML = '<option value="">Carregando ingressos...</option>';
        
        if (!combo.lote_id) {
            console.warn('⚠️ Lote ID não informado');
            select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
            return;
        }
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Buscar ingressos usando a ação correta que existe
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=listar_ingressos_combo&evento_id=${eventoId}`
            });
            
            const textResponse = await response.text();
            console.log('📡 Resposta raw do servidor:', textResponse);
            
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (parseError) {
                console.error('❌ Erro ao parsear JSON:', parseError);
                select.innerHTML = '<option value="">Erro ao carregar ingressos</option>';
                return;
            }
            
            if (data.sucesso && data.ingressos) {
                select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
                
                let ingressosAdicionados = 0;
                
                data.ingressos.forEach(ingresso => {
                    // A API já filtra combos, mas vamos filtrar por lote também
                    // Como a API não filtra por lote, vamos usar todos e filtrar depois
                    // IMPORTANTE: Vamos precisar melhorar isso
                    const option = document.createElement('option');
                    option.value = ingresso.id;
                    option.textContent = `${ingresso.titulo} (${ingresso.tipo})`;
                    select.appendChild(option);
                    ingressosAdicionados++;
                });
                
                console.log(`✅ ${ingressosAdicionados} ingressos adicionados ao select (todos os ingressos, filtro por lote temporariamente removido)`);
            } else {
                console.error('❌ Erro na resposta:', data.erro);
                select.innerHTML = '<option value="">Erro ao carregar ingressos</option>';
            }
        } catch (error) {
            console.error('❌ Erro ao buscar ingressos do lote:', error);
            select.innerHTML = '<option value="">Erro de conexão</option>';
        }
    }

    // =======================================================
    // 9. FUNÇÃO AUXILIAR
    // =======================================================
    
    function formatarPreco(preco) {
        if (!preco) return 'R$ 0,00';
        return `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
    }
    
    console.log('✅ Sistema de Edição de Combos configurado');
    
    // **TORNAR FUNÇÃO DE CÁLCULO GLOBAL PARA SER USADA POR OUTROS SCRIPTS**
    window.calcularValoresEditCombo = calcularValoresComboAutomatico;
    window.popularSelectIngressosCombo = popularSelectIngressosDoLote;
    
    console.log('✅ Funções globais expostas: calcularValoresEditCombo, popularSelectIngressosCombo');
});
