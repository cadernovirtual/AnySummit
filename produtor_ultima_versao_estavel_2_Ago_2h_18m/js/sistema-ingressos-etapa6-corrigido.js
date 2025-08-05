/**
 * SISTEMA DE INGRESSOS DA ETAPA 6 - CORRIGIDO
 * 
 * PROBLEMAS RESOLVIDOS:
 * a) Combo carrega ingressos do banco (não da sessão) por lote selecionado
 * b) Botões uniformes e mesmos eventos para ingressos novos e antigos
 * c) Dados sempre sincronizados: banco ↔ interface
 * d) Operações instantâneas (insert, update, delete) no banco
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de Ingressos Etapa 6 - Corrigido carregado');
    
    let eventoId = null;
    let ingressosDoBanco = []; // Cache dos ingressos do banco
    let lotesDoBanco = []; // Cache dos lotes do banco
    
    // =======================================================
    // 1. INICIALIZAÇÃO E CARREGAMENTO DO BANCO
    // =======================================================
    
    function inicializarSistemaIngressos() {
        // Obter evento_id da URL
        const urlParams = new URLSearchParams(window.location.search);
        eventoId = urlParams.get('evento_id');
        
        if (!eventoId) {
            console.log('📝 Novo evento - sem dados para carregar');
            return;
        }
        
        console.log(`🔄 Carregando dados do evento ${eventoId} do banco...`);
        carregarDadosDoEvento();
    }
    
    async function carregarDadosDoEvento() {
        try {
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=recuperar_evento&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                console.log('✅ Dados do evento carregados:', data);
                
                // Armazenar dados em cache
                ingressosDoBanco = data.ingressos || [];
                lotesDoBanco = data.lotes || [];
                
                // Renderizar ingressos na interface
                renderizarIngressosNaInterface();
                
                // Atualizar selects de combo
                atualizarSelectsComboComDadosDoBanco();
                
            } else {
                console.error('❌ Erro ao carregar dados:', data.erro);
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
        }
    }
    
    // =======================================================
    // 2. RENDERIZAÇÃO UNIFORME DE INGRESSOS
    // =======================================================
    
    function renderizarIngressosNaInterface() {
        console.log('🎨 Renderizando ingressos na interface');
        
        const ticketList = document.getElementById('ticketList');
        if (!ticketList) {
            console.error('❌ ticketList não encontrado');
            return;
        }
        
        // Limpar lista atual
        ticketList.innerHTML = '';
        
        if (ingressosDoBanco.length === 0) {
            ticketList.innerHTML = `
                <div class="empty-state" style="background: transparent !important; background-color: transparent !important;">
                    <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                    <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
                </div>
            `;
            return;
        }
        
        // Renderizar cada ingresso com layout uniforme
        ingressosDoBanco.forEach(ingresso => {
            const elemento = criarElementoIngresso(ingresso);
            ticketList.appendChild(elemento);
        });
        
        console.log(`✅ ${ingressosDoBanco.length} ingressos renderizados na interface`);
    }
    
    function criarElementoIngresso(ingresso) {
        const div = document.createElement('div');
        div.className = 'ticket-item';
        div.dataset.ticketId = ingresso.id;
        div.dataset.ingressoId = ingresso.id;
        div.dataset.tipo = ingresso.tipo;
        div.dataset.loteId = ingresso.lote_id;
        
        // Buscar dados completos do lote
        const lote = lotesDoBanco.find(l => l.id == ingresso.lote_id);
        let infoLote = `Lote ID ${ingresso.lote_id}`;
        let detalhesLote = '';
        
        if (lote) {
            const tipoTexto = lote.tipo === 'data' ? 'Por Data' : 'Por Vendas';
            infoLote = `📦 ${lote.nome} - ${tipoTexto}`;
            
            // Adicionar detalhes específicos do tipo de lote
            if (lote.tipo === 'data') {
                const dataInicio = new Date(lote.data_inicio).toLocaleDateString('pt-BR');
                const dataFim = new Date(lote.data_fim).toLocaleDateString('pt-BR');
                detalhesLote = `📅 ${dataInicio} até ${dataFim}`;
            } else {
                detalhesLote = `📈 ${lote.percentual_venda}% dos ingressos vendidos`;
            }
        }
        
        // Layout uniforme para todos os tipos
        div.innerHTML = `
            <div class="ticket-header">
                <h4 class="ticket-title">${ingresso.titulo}</h4>
                <span class="ticket-type-badge type-${ingresso.tipo}">${ingresso.tipo.toUpperCase()}</span>
            </div>
            <div class="ticket-body">
                <div class="ticket-info">
                    <div>
                        <span class="ticket-quantity">📊 ${ingresso.quantidade_total} unidades</span>
                        ${ingresso.tipo !== 'gratuito' ? `<span class="ticket-price">💰 R$ ${parseFloat(ingresso.preco || 0).toFixed(2).replace('.', ',')}</span>` : ''}
                    </div>
                    <div>
                        <span class="ticket-batch">${infoLote}</span>
                        ${detalhesLote ? `<span class="ticket-lote-info">${detalhesLote}</span>` : ''}
                    </div>
                </div>
                ${ingresso.descricao ? `<p class="ticket-description">${ingresso.descricao}</p>` : ''}
            </div>
            <div class="ticket-actions">
                <button class="btn-icon btn-edit" onclick="editarIngressoDoBanco(${ingresso.id})" title="Editar ingresso">✏️</button>
                <button class="btn-icon btn-delete" onclick="removeTicket(${ingresso.id})" title="Excluir ingresso">🗑️</button>
            </div>
        `;
        
        return div;
    }
    
    // =======================================================
    // 3. OPERAÇÕES INSTANTÂNEAS NO BANCO
    // =======================================================
    
    // Função global para editar ingresso (sempre do banco)
    window.editarIngressoDoBanco = function(ingressoId) {
        console.log(`✏️ Editando ingresso ${ingressoId} (dados do banco)`);
        
        const ingresso = ingressosDoBanco.find(i => i.id == ingressoId);
        if (!ingresso) {
            alert('Ingresso não encontrado');
            return;
        }
        
        // Usar a função de edição existente que busca dados do banco
        if (window.editTicket) {
            window.editTicket(ingressoId);
        } else {
            alert('Sistema de edição não carregado');
        }
    };
    
    // Função global para excluir ingresso
    window.excluirIngressoDoBanco = async function(ingressoId) {
        console.log(`🗑️ Excluindo ingresso ${ingressoId}`);
        
        if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
            return;
        }
        
        try {
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                // Remover do cache
                ingressosDoBanco = ingressosDoBanco.filter(i => i.id != ingressoId);
                
                // Atualizar interface
                renderizarIngressosNaInterface();
                atualizarSelectsComboComDadosDoBanco();
                
                console.log('✅ Ingresso excluído com sucesso');
                
            } else {
                alert('Erro ao excluir: ' + (data.erro || 'Erro desconhecido'));
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir:', error);
            alert('Erro de conexão');
        }
    };
    
    // =======================================================
    // 4. SISTEMA DE COMBOS COM DADOS DO BANCO
    // =======================================================
    
    function atualizarSelectsComboComDadosDoBanco() {
        console.log('🔄 Atualizando selects de combo com dados do banco');
        
        // Atualizar select de lote do combo
        const comboLoteSelect = document.getElementById('comboTicketLote');
        if (comboLoteSelect) {
            // Salvar valor atual
            const valorAtual = comboLoteSelect.value;
            
            // Limpar e repopular
            comboLoteSelect.innerHTML = '<option value="">Selecione um lote</option>';
            
            lotesDoBanco.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = `${lote.nome} - ${lote.tipo === 'data' ? 'Por Data' : 'Por Vendas'}`;
                comboLoteSelect.appendChild(option);
            });
            
            // Restaurar valor se havia
            if (valorAtual) {
                comboLoteSelect.value = valorAtual;
                // Atualizar lista de ingressos do lote
                atualizarIngressosDoLoteNoCombo(valorAtual);
            }
        }
        
        // Configurar listener para mudança de lote
        if (comboLoteSelect && !comboLoteSelect.hasAttribute('data-listener-configurado')) {
            comboLoteSelect.addEventListener('change', function() {
                const loteId = this.value;
                if (loteId) {
                    atualizarIngressosDoLoteNoCombo(loteId);
                } else {
                    limparSelectIngressosCombo();
                }
            });
            comboLoteSelect.setAttribute('data-listener-configurado', 'true');
        }
    }
    
    function atualizarIngressosDoLoteNoCombo(loteId) {
        console.log(`📦 Carregando ingressos do lote ${loteId} para combo`);
        
        const ingressosSelect = document.getElementById('comboTicketTypeSelect'); // ID correto
        if (!ingressosSelect) {
            console.error('❌ Select comboTicketTypeSelect não encontrado');
            return;
        }
        
        // Filtrar ingressos do lote (exceto combos)
        const ingressosDoLote = ingressosDoBanco.filter(i => 
            i.lote_id == loteId && i.tipo !== 'combo'
        );
        
        // Limpar select
        ingressosSelect.innerHTML = '<option value="">Selecione um ingresso</option>';
        
        if (ingressosDoLote.length === 0) {
            ingressosSelect.innerHTML = '<option value="">Nenhum ingresso neste lote</option>';
            return;
        }
        
        // Adicionar opções
        ingressosDoLote.forEach(ingresso => {
            const option = document.createElement('option');
            option.value = ingresso.id;
            option.textContent = `${ingresso.titulo} - ${ingresso.tipo === 'gratuito' ? 'Gratuito' : 'R$ ' + parseFloat(ingresso.preco).toFixed(2).replace('.', ',')}`;
            
            // Adicionar dados do ingresso como data attributes
            option.dataset.ticketData = JSON.stringify({
                id: ingresso.id,
                index: ingresso.id, // Para compatibilidade
                ticketId: ingresso.id, // Para compatibilidade
                name: ingresso.titulo,
                title: ingresso.titulo,
                price: ingresso.preco || 0,
                type: ingresso.tipo
            });
            
            ingressosSelect.appendChild(option);
        });
        
        console.log(`✅ ${ingressosDoLote.length} ingressos carregados no select do combo`);
    }
    
    function limparSelectIngressosCombo() {
        const ingressosSelect = document.getElementById('comboTicketTypeSelect'); // ID correto
        if (ingressosSelect) {
            ingressosSelect.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        }
    }
    
    // =======================================================
    // 5. HOOKS PARA SINCRONIZAÇÃO APÓS OPERAÇÕES
    // =======================================================
    
    // Interceptar salvamento de ingresso para recarregar cache
    function interceptarSalvamentoDeIngresso() {
        // Buscar função de salvamento existente
        const funcoesSalvamento = [
            'createPaidTicket',
            'createFreeTicket', 
            'createComboTicket',
            'updatePaidTicket',
            'updateFreeTicket',
            'updateComboTicket'
        ];
        
        funcoesSalvamento.forEach(nomeFuncao => {
            if (typeof window[nomeFuncao] === 'function') {
                const funcaoOriginal = window[nomeFuncao];
                
                window[nomeFuncao] = function() {
                    console.log(`🔄 Interceptando ${nomeFuncao} para recarregar dados`);
                    
                    // Chamar função original
                    const resultado = funcaoOriginal.apply(this, arguments);
                    
                    // Recarregar dados após um pequeno delay
                    setTimeout(() => {
                        recarregarDadosDoEvento();
                    }, 500);
                    
                    return resultado;
                };
            }
        });
    }
    
    async function recarregarDadosDoEvento() {
        console.log('🔄 Recarregando dados do evento após operação');
        await carregarDadosDoEvento();
    }
    
    // =======================================================
    // 6. INICIALIZAÇÃO
    // =======================================================
    
    // Aguardar carregamento completo
    setTimeout(() => {
        inicializarSistemaIngressos();
        interceptarSalvamentoDeIngresso();
    }, 1000);
    
    // Disponibilizar funções globalmente
    window.recarregarIngressosEtapa6 = recarregarDadosDoEvento;
    window.ingressosDoBanco = ingressosDoBanco;
    window.renderizarIngressosNaInterface = renderizarIngressosNaInterface;
    
    console.log('✅ Sistema de Ingressos Etapa 6 configurado');
});
