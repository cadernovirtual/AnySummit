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
            'editComboTicketTitle': combo.titulo,
            'editComboTicketDescription': combo.descricao || '',
            'editComboTicketPrice': formatarPreco(combo.preco),
            'editComboTicketLote': combo.lote_id || '',
            'editComboSaleStart': combo.inicio_venda || '',
            'editComboSaleEnd': combo.fim_venda || '',
            'editComboMinQuantity': combo.limite_min || 1,
            'editComboMaxQuantity': combo.limite_max || 5
        };
        
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
        // Remover mensagens anteriores
        const mensagensAnteriores = selectLote.parentNode.querySelectorAll('.lote-readonly-msg');
        mensagensAnteriores.forEach(msg => msg.remove());
        
        // Criar mensagem
        const mensagem = document.createElement('div');
        mensagem.className = 'lote-readonly-msg';
        mensagem.style.cssText = `
            background-color: #e3f2fd;
            border: 1px solid #2196f3;
            color: #1976d2;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 5px;
        `;
        mensagem.innerHTML = '🔒 <strong>Lote fixo:</strong> O lote não pode ser alterado durante a edição do combo.';
        
        // Inserir após o select
        selectLote.parentNode.insertBefore(mensagem, selectLote.nextSibling);
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
    // 6. CARREGAR ITENS DO COMBO
    // =======================================================
    
    function carregarItensDoCombo(combo) {
        console.log('📦 Carregando itens do combo:', combo.conteudo_combo);
        
        if (!combo.conteudo_combo) {
            console.log('📦 Combo sem itens definidos');
            return;
        }
        
        try {
            const itens = typeof combo.conteudo_combo === 'string' 
                ? JSON.parse(combo.conteudo_combo) 
                : combo.conteudo_combo;
            
            if (Array.isArray(itens) && itens.length > 0) {
                // Limpar lista atual se existir
                if (window.comboItems) {
                    window.comboItems.length = 0;
                }
                
                // Adicionar itens do banco
                itens.forEach(item => {
                    if (window.comboItems && typeof item === 'object') {
                        window.comboItems.push({
                            ingresso_id: item.ingresso_id,
                            quantidade: item.quantidade,
                            ticket_id: item.ingresso_id, // Para compatibilidade
                            id: item.ingresso_id, // Para compatibilidade
                            quantity: item.quantidade // Para compatibilidade
                        });
                    }
                });
                
                console.log(`✅ ${itens.length} itens carregados no combo`);
                
                // Atualizar interface do combo se função existir
                if (typeof window.updateComboItemsList === 'function') {
                    window.updateComboItemsList();
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar conteúdo do combo:', error);
        }
    }
    
    // =======================================================
    // 7. FUNÇÃO AUXILIAR
    // =======================================================
    
    function formatarPreco(preco) {
        if (!preco) return 'R$ 0,00';
        return `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
    }
    
    console.log('✅ Sistema de Edição de Combos configurado');
});
