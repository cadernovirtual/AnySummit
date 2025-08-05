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
        console.log('🎨 Criando elemento com MESMA renderização do addTicketToList');
        
        // Converter dados do banco para o formato que addTicketToList() espera
        const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
        const title = ingresso.titulo;
        const quantity = parseInt(ingresso.quantidade_total) || 100;
        const price = type === 'paid' ? 
            `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
            'Gratuito';
        const loteId = ingresso.lote_id || '';
        const description = ingresso.descricao || '';
        const saleStart = ingresso.inicio_venda || '';
        const saleEnd = ingresso.fim_venda || '';
        const minQuantity = parseInt(ingresso.limite_min) || 1;
        const maxQuantity = parseInt(ingresso.limite_max) || 5;
        
        // Criar elemento temporário para usar addTicketToList()
        const tempTicketList = document.createElement('div');
        
        // Usar addTicketToList() para gerar HTML idêntico
        if (typeof addTicketToList === 'function') {
            // Backup do ticketList original
            const originalTicketList = document.getElementById('ticketList');
            
            // Substituir temporariamente por nosso elemento
            const tempContainer = document.createElement('div');
            tempContainer.id = 'ticketList';
            document.body.appendChild(tempContainer);
            
            // Chamar addTicketToList() para gerar o HTML
            addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
            
            // Pegar o elemento gerado
            const elementoGerado = tempContainer.querySelector('.ticket-item');
            
            // Restaurar o ticketList original
            document.body.removeChild(tempContainer);
            
            if (elementoGerado) {
                // Corrigir dataset para usar ID real do banco
                elementoGerado.dataset.ticketId = ingresso.id;
                elementoGerado.dataset.ingressoId = ingresso.id;
                elementoGerado.dataset.tipo = ingresso.tipo;
                elementoGerado.dataset.loteId = ingresso.lote_id;
                
                // Corrigir botões para usar ID real
                const editBtn = elementoGerado.querySelector('button[onclick*="editTicket"]');
                const removeBtn = elementoGerado.querySelector('button[onclick*="removeTicket"]');
                if (editBtn) {
                    editBtn.setAttribute('onclick', `editTicket(${ingresso.id})`);
                }
                if (removeBtn) {
                    removeBtn.setAttribute('onclick', `removeTicket(${ingresso.id})`);
                }
                
                // Armazenar dados completos
                elementoGerado.ticketData = {
                    ...ingresso,
                    id: ingresso.id,
                    type: type,
                    title: title,
                    quantity: quantity,
                    price: parseFloat(ingresso.preco) || 0,
                    description: description,
                    saleStart: saleStart,
                    saleEnd: saleEnd,
                    minQuantity: minQuantity,
                    maxQuantity: maxQuantity,
                    loteId: loteId,
                    isFromDatabase: true
                };
                
                return elementoGerado;
            }
        }
        
        // Fallback se addTicketToList não funcionar
        console.error('❌ addTicketToList não disponível, usando fallback');
        const div = document.createElement('div');
        div.className = 'ticket-item';
        div.dataset.ticketId = ingresso.id;
        div.innerHTML = `<div>Erro na renderização</div>`;
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
