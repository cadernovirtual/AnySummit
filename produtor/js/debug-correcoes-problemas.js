/**
 * DEBUG E CORREÇÃO DOS PROBLEMAS IDENTIFICADOS
 * 
 * PROBLEMAS:
 * 1. removeTicket() e editTicket() não atualizam a lista
 * 2. Inserção não atualiza a lista
 * 3. editTicket() responde "Ingresso não encontrado"
 */

console.log('🐛 Carregando correções para problemas identificados...');

// Debug: Interceptar todas as operações para debug
const DEBUG_OPERATIONS = true;

/**
 * CORREÇÃO 1: Verificar se as funções estão sendo redirecionadas
 */
window.debugRedirecionamentos = function() {
    console.log('🔍 ========== DEBUG REDIRECIONAMENTOS ==========');
    
    const funcoesOriginais = ['createPaidTicket', 'createFreeTicket', 'removeTicket', 'editTicket'];
    const funcoesMySQL = ['createPaidTicketMySQL', 'createFreeTicketMySQL', 'excluirIngressoDoMySQL', 'editarIngressoDoMySQL'];
    
    console.log('📋 Verificando funções originais:');
    funcoesOriginais.forEach(funcao => {
        const disponivel = typeof window[funcao] === 'function';
        const codigo = disponivel ? window[funcao].toString().slice(0, 200) : 'N/A';
        console.log(`${disponivel ? '✅' : '❌'} ${funcao}:`, codigo);
    });
    
    console.log('📋 Verificando funções MySQL:');
    funcoesMySQL.forEach(funcao => {
        const disponivel = typeof window[funcao] === 'function';
        console.log(`${disponivel ? '✅' : '❌'} ${funcao}`);
    });
};

/**
 * CORREÇÃO 2: Função de recarregamento mais robusta
 */
window.recarregarIngressosComDebug = async function() {
    console.log('🔄 ========== RECARREGAMENTO COM DEBUG ==========');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem dados para carregar');
        return;
    }
    
    console.log(`🔍 Carregando dados do evento ${eventoId}...`);
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${eventoId}`
        });
        
        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('📊 Dados recebidos:', data);
        
        if (!data.sucesso) {
            console.error('❌ Erro ao carregar dados:', data.erro);
            return;
        }
        
        // Atualizar dados globais
        if (!window.dadosAtivos) {
            window.dadosAtivos = {};
        }
        
        window.dadosAtivos.ingressos = data.ingressos || [];
        window.dadosAtivos.lotes = data.lotes || [];
        
        console.log(`✅ Dados atualizados: ${window.dadosAtivos.ingressos.length} ingressos, ${window.dadosAtivos.lotes.length} lotes`);
        
        // Renderizar na interface
        renderizarIngressosComDebug();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        return false;
    }
};

/**
 * CORREÇÃO 3: Renderização mais robusta
 */
function renderizarIngressosComDebug() {
    console.log('🎨 ========== RENDERIZAÇÃO COM DEBUG ==========');
    
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    console.log(`🔍 ticketList encontrado: ${ticketList.tagName}`);
    
    // Limpar lista atual
    const elementosAntigos = ticketList.children.length;
    ticketList.innerHTML = '';
    console.log(`🧹 Removidos ${elementosAntigos} elementos antigos`);
    
    if (!window.dadosAtivos || !window.dadosAtivos.ingressos || window.dadosAtivos.ingressos.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state" style="background: transparent !important; background-color: transparent !important;">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        console.log('📝 Lista vazia renderizada');
        return;
    }
    
    console.log(`🎨 Renderizando ${window.dadosAtivos.ingressos.length} ingressos...`);
    
    // Renderizar cada ingresso
    window.dadosAtivos.ingressos.forEach((ingresso, index) => {
        console.log(`🔧 Renderizando ingresso ${index + 1}: ID ${ingresso.id} - ${ingresso.titulo}`);
        criarElementoComDadosReaisDebug(ingresso);
    });
    
    const elementosNovos = ticketList.children.length;
    console.log(`✅ Renderização concluída: ${elementosNovos} elementos criados`);
}

/**
 * CORREÇÃO 4: Criação de elemento com debug completo
 */
function criarElementoComDadosReaisDebug(ingresso) {
    console.log(`🔧 Criando elemento para ingresso ${ingresso.id}:`, ingresso);
    
    // Converter dados do MySQL para formato do addTicketToList()
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
    
    console.log(`📋 Dados convertidos:`, { type, title, quantity, price, loteId });
    
    // Verificar se addTicketToList existe
    if (typeof addTicketToList !== 'function') {
        console.error('❌ addTicketToList não disponível');
        return;
    }
    
    // Contar elementos antes
    const ticketList = document.getElementById('ticketList');
    const elementosAntes = ticketList.children.length;
    
    // Usar addTicketToList() para gerar HTML idêntico
    addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
    
    // Verificar se elemento foi criado
    const elementosDepois = ticketList.children.length;
    
    if (elementosDepois > elementosAntes) {
        const ultimoElemento = ticketList.lastElementChild;
        console.log(`✅ Elemento criado: ${ultimoElemento.className}`);
        
        // CRÍTICO: Corrigir o último elemento criado para usar ID REAL do banco
        if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
            // Salvar ID original
            const idOriginal = ultimoElemento.dataset.ticketId;
            
            // Substituir dataset temporário por dados REAIS
            ultimoElemento.dataset.ticketId = ingresso.id;
            ultimoElemento.dataset.ingressoId = ingresso.id;
            ultimoElemento.dataset.tipo = ingresso.tipo;
            ultimoElemento.dataset.loteId = ingresso.lote_id || '';
            
            console.log(`🔧 IDs corrigidos: ${idOriginal} → ${ingresso.id}`);
            
            // CRÍTICO: Corrigir botões para usar ID REAL do banco
            const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
            const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
            
            if (editBtn) {
                const onclickOriginal = editBtn.getAttribute('onclick');
                editBtn.setAttribute('onclick', `editarIngressoComDebug(${ingresso.id})`);
                console.log(`🔧 Botão editar corrigido: ${onclickOriginal} → editarIngressoComDebug(${ingresso.id})`);
            }
            if (removeBtn) {
                const onclickOriginal = removeBtn.getAttribute('onclick');
                removeBtn.setAttribute('onclick', `excluirIngressoComDebug(${ingresso.id})`);
                console.log(`🔧 Botão remover corrigido: ${onclickOriginal} → excluirIngressoComDebug(${ingresso.id})`);
            }
            
            // Armazenar dados completos REAIS
            ultimoElemento.ticketData = {
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
            
            console.log(`✅ Dados completos armazenados no elemento`);
        }
    } else {
        console.error('❌ Elemento não foi criado');
    }
}

/**
 * CORREÇÃO 5: Função de exclusão com debug
 */
window.excluirIngressoComDebug = async function(ingressoId) {
    console.log(`🗑️ ========== EXCLUSÃO COM DEBUG ==========`);
    console.log(`🗑️ Excluindo ingresso ${ingressoId}...`);
    
    if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
        console.log('❌ Exclusão cancelada pelo usuário');
        return;
    }
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        alert('Erro: Evento não identificado');
        return;
    }
    
    try {
        console.log(`📡 Enviando requisição de exclusão...`);
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('📊 Resposta da exclusão:', data);
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído do MySQL`);
            
            // RECARREGAR DADOS DO MYSQL
            console.log(`🔄 Recarregando dados após exclusão...`);
            const recarregou = await recarregarIngressosComDebug();
            
            if (recarregou) {
                console.log(`✅ Lista atualizada após exclusão`);
            } else {
                console.error(`❌ Erro ao recarregar após exclusão`);
            }
            
            // Salvar dados do wizard
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
            
        } else {
            console.error('❌ Erro ao excluir:', data.erro);
            alert('Erro ao excluir ingresso: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição de exclusão:', error);
        alert('Erro de conexão');
    }
};

/**
 * CORREÇÃO 6: Função de edição com debug
 */
window.editarIngressoComDebug = async function(ingressoId) {
    console.log(`✏️ ========== EDIÇÃO COM DEBUG ==========`);
    console.log(`✏️ Editando ingresso ${ingressoId}...`);
    
    // Verificar se dados estão carregados
    if (!window.dadosAtivos || !window.dadosAtivos.ingressos) {
        console.log('🔄 Dados não carregados, carregando primeiro...');
        await recarregarIngressosComDebug();
    }
    
    console.log(`🔍 Procurando ingresso ${ingressoId} nos dados...`);
    console.log(`📊 Ingressos disponíveis:`, window.dadosAtivos.ingressos.map(i => ({ id: i.id, titulo: i.titulo })));
    
    // Buscar dados atuais do cache
    const ingresso = window.dadosAtivos.ingressos.find(i => i.id == ingressoId);
    
    if (!ingresso) {
        console.error(`❌ Ingresso ${ingressoId} não encontrado nos dados`);
        alert('Ingresso não encontrado. Recarregando dados...');
        await recarregarIngressosComDebug();
        return;
    }
    
    console.log(`✅ Ingresso encontrado:`, ingresso);
    
    // Abrir modal apropriado baseado no tipo
    if (ingresso.tipo === 'pago') {
        console.log(`📝 Abrindo modal de edição pago...`);
        popularModalPagoDebug(ingresso);
        
        if (typeof openModal === 'function') {
            openModal('paidTicketModal');
            console.log(`✅ Modal pago aberto`);
        } else {
            console.error(`❌ openModal não disponível`);
        }
        
    } else if (ingresso.tipo === 'gratuito') {
        console.log(`📝 Abrindo modal de edição gratuito...`);
        popularModalGratuitoDebug(ingresso);
        
        if (typeof openModal === 'function') {
            openModal('freeTicketModal');
            console.log(`✅ Modal gratuito aberto`);
        } else {
            console.error(`❌ openModal não disponível`);
        }
        
    } else {
        console.log(`⚠️ Tipo ${ingresso.tipo} não suportado para edição`);
        alert('Edição de combos será implementada em breve');
    }
};

/**
 * CORREÇÃO 7: Popular modais com debug
 */
function popularModalPagoDebug(ingresso) {
    console.log(`📝 Populando modal pago com dados:`, ingresso);
    
    const campos = {
        'paidTicketTitle': ingresso.titulo,
        'paidTicketQuantity': ingresso.quantidade_total,
        'paidTicketPrice': `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
        'paidTicketDescription': ingresso.descricao || '',
        'paidSaleStart': ingresso.inicio_venda || '',
        'paidSaleEnd': ingresso.fim_venda || '',
        'paidMinQuantity': ingresso.limite_min || 1,
        'paidMaxQuantity': ingresso.limite_max || 5,
        'paidTicketLote': ingresso.lote_id || ''
    };
    
    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
            console.log(`✅ ${id} = ${valor}`);
        } else {
            console.error(`❌ Campo ${id} não encontrado`);
        }
    });
    
    // Marcar que está editando
    const modal = document.getElementById('paidTicketModal');
    if (modal) {
        modal.dataset.editingId = ingresso.id;
        console.log(`✅ Modal marcado para edição: ${ingresso.id}`);
    }
}

function popularModalGratuitoDebug(ingresso) {
    console.log(`📝 Populando modal gratuito com dados:`, ingresso);
    
    const campos = {
        'freeTicketTitle': ingresso.titulo,
        'freeTicketQuantity': ingresso.quantidade_total,
        'freeTicketDescription': ingresso.descricao || '',
        'freeSaleStart': ingresso.inicio_venda || '',
        'freeSaleEnd': ingresso.fim_venda || '',
        'freeMinQuantity': ingresso.limite_min || 1,
        'freeMaxQuantity': ingresso.limite_max || 5,
        'freeTicketLote': ingresso.lote_id || ''
    };
    
    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
            console.log(`✅ ${id} = ${valor}`);
        } else {
            console.error(`❌ Campo ${id} não encontrado`);
        }
    });
    
    // Marcar que está editando
    const modal = document.getElementById('freeTicketModal');
    if (modal) {
        modal.dataset.editingId = ingresso.id;
        console.log(`✅ Modal marcado para edição: ${ingresso.id}`);
    }
}

/**
 * CORREÇÃO 8: Sobrescrever funções originais com versões de debug
 */
window.aplicarCorrecoesDeBug = function() {
    console.log('🔧 ========== APLICANDO CORREÇÕES DE DEBUG ==========');
    
    // Sobrescrever função de recarregamento
    if (typeof window.recarregarIngressosDoMySQL === 'function') {
        window.recarregarIngressosDoMySQL = window.recarregarIngressosComDebug;
        console.log('✅ recarregarIngressosDoMySQL sobrescrita');
    }
    
    // Sobrescrever funções de operação
    window.removeTicket = window.excluirIngressoComDebug;
    window.editTicket = window.editarIngressoComDebug;
    window.excluirIngressoDoMySQL = window.excluirIngressoComDebug;
    window.editarIngressoDoMySQL = window.editarIngressoComDebug;
    
    console.log('✅ Funções de operação sobrescritas com versões de debug');
};

/**
 * APLICAÇÃO AUTOMÁTICA
 */
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔧 Aplicando correções de debug automaticamente...');
        window.aplicarCorrecoesDeBug();
        
        // Executar debug inicial
        setTimeout(() => {
            window.debugRedirecionamentos();
        }, 1000);
    }, 3000);
});

console.log('✅ Correções de debug carregadas!');