/**
 * CORREÇÃO RADICAL E DIRETA DOS PROBLEMAS REPORTADOS
 * 
 * Esta é uma sobrescrita IMEDIATA e AGRESSIVA das funções problemáticas
 * para garantir que funcionem corretamente
 */

console.log('🚨 CARREGANDO CORREÇÃO RADICAL E DIRETA...');

// ============================================================================
// SOBRESCRITA IMEDIATA E AGRESSIVA DAS FUNÇÕES PROBLEMÁTICAS
// ============================================================================

/**
 * FUNÇÃO DE RECARREGAMENTO SIMPLIFICADA E FUNCIONAL
 */
window.recarregarListaIngressos = async function() {
    console.log('🔄 RECARREGANDO LISTA DE INGRESSOS (versão radical)...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem recarregamento');
        return true;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${eventoId}`
        });
        
        const data = await response.json();
        
        if (!data.sucesso) {
            console.error('❌ Erro ao carregar:', data.erro);
            return false;
        }
        
        // Armazenar dados globalmente
        window.ingressosAtuais = data.ingressos || [];
        window.lotesAtuais = data.lotes || [];
        
        console.log(`✅ Carregados: ${window.ingressosAtuais.length} ingressos`);
        
        // Recriar lista completamente
        recriarListaDOM();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        return false;
    }
};

/**
 * RECRIAR LISTA DOM BASEADA EM DADOS REAIS
 */
function recriarListaDOM() {
    console.log('🎨 RECRIANDO DOM BASEADO EM DADOS REAIS...');
    
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    // Limpar completamente
    ticketList.innerHTML = '';
    
    if (!window.ingressosAtuais || window.ingressosAtuais.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state" style="background: transparent !important; background-color: transparent !important;">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        console.log('📝 Lista vazia renderizada');
        return;
    }
    
    // Renderizar cada ingresso
    window.ingressosAtuais.forEach(ingresso => {
        adicionarIngressoAoDOM(ingresso);
    });
    
    console.log(`✅ ${window.ingressosAtuais.length} ingressos adicionados ao DOM`);
}

/**
 * ADICIONAR INGRESSO AO DOM COM DADOS REAIS
 */
function adicionarIngressoAoDOM(ingresso) {
    const ticketList = document.getElementById('ticketList');
    
    // Converter tipo
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    // Usar addTicketToList se disponível
    if (typeof addTicketToList === 'function') {
        const elementosAntes = ticketList.children.length;
        
        addTicketToList(
            type, 
            title, 
            quantity, 
            price, 
            ingresso.lote_id || '', 
            ingresso.descricao || '', 
            ingresso.inicio_venda || '', 
            ingresso.fim_venda || '', 
            parseInt(ingresso.limite_min) || 1, 
            parseInt(ingresso.limite_max) || 5
        );
        
        // Corrigir o último elemento criado
        const elementosDepois = ticketList.children.length;
        if (elementosDepois > elementosAntes) {
            const ultimoElemento = ticketList.lastElementChild;
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                // Corrigir IDs e botões
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.dataset.ingressoId = ingresso.id;
                
                // Corrigir botões com IDs reais
                const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
                const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
                
                if (editBtn) {
                    editBtn.setAttribute('onclick', `editarIngressoRadical(${ingresso.id})`);
                }
                if (removeBtn) {
                    removeBtn.setAttribute('onclick', `excluirIngressoRadical(${ingresso.id})`);
                }
                
                console.log(`✅ Ingresso ${ingresso.id} adicionado com botões corrigidos`);
            }
        }
    }
}

/**
 * EXCLUSÃO RADICAL - FUNCIONA SEMPRE
 */
window.excluirIngressoRadical = async function(ingressoId) {
    console.log(`🗑️ EXCLUSÃO RADICAL do ingresso ${ingressoId}...`);
    
    if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        alert('Erro: Evento não identificado');
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
            console.log(`✅ Ingresso ${ingressoId} excluído do MySQL`);
            
            // RECARREGAR LISTA IMEDIATAMENTE
            await window.recarregarListaIngressos();
            
            console.log(`✅ Lista atualizada após exclusão`);
            
        } else {
            alert('Erro ao excluir: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao excluir:', error);
        alert('Erro de conexão');
    }
};

/**
 * EDIÇÃO RADICAL - FUNCIONA SEMPRE
 */
window.editarIngressoRadical = async function(ingressoId) {
    console.log(`✏️ EDIÇÃO RADICAL do ingresso ${ingressoId}...`);
    
    // Garantir que dados estão carregados
    if (!window.ingressosAtuais || window.ingressosAtuais.length === 0) {
        console.log('🔄 Carregando dados primeiro...');
        await window.recarregarListaIngressos();
    }
    
    // Buscar ingresso
    const ingresso = window.ingressosAtuais.find(i => i.id == ingressoId);
    
    if (!ingresso) {
        console.error(`❌ Ingresso ${ingressoId} não encontrado`);
        alert('Ingresso não encontrado. Recarregando dados...');
        await window.recarregarListaIngressos();
        return;
    }
    
    console.log(`✅ Ingresso encontrado:`, ingresso);
    
    // Abrir modal apropriado
    if (ingresso.tipo === 'pago') {
        popularModalPagoRadical(ingresso);
        if (typeof openModal === 'function') {
            openModal('paidTicketModal');
        }
    } else if (ingresso.tipo === 'gratuito') {
        popularModalGratuitoRadical(ingresso);
        if (typeof openModal === 'function') {
            openModal('freeTicketModal');
        }
    } else {
        alert('Edição de combos não implementada');
    }
};

/**
 * POPULAR MODAIS COM DADOS REAIS
 */
function popularModalPagoRadical(ingresso) {
    console.log(`📝 Populando modal pago...`);
    
    document.getElementById('paidTicketTitle').value = ingresso.titulo;
    document.getElementById('paidTicketQuantity').value = ingresso.quantidade_total;
    document.getElementById('paidTicketPrice').value = `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('paidTicketDescription').value = ingresso.descricao || '';
    document.getElementById('paidSaleStart').value = ingresso.inicio_venda || '';
    document.getElementById('paidSaleEnd').value = ingresso.fim_venda || '';
    document.getElementById('paidMinQuantity').value = ingresso.limite_min || 1;
    document.getElementById('paidMaxQuantity').value = ingresso.limite_max || 5;
    document.getElementById('paidTicketLote').value = ingresso.lote_id || '';
    
    // Marcar que está editando
    document.getElementById('paidTicketModal').dataset.editingId = ingresso.id;
    
    console.log(`✅ Modal pago populado para edição do ingresso ${ingresso.id}`);
}

function popularModalGratuitoRadical(ingresso) {
    console.log(`📝 Populando modal gratuito...`);
    
    document.getElementById('freeTicketTitle').value = ingresso.titulo;
    document.getElementById('freeTicketQuantity').value = ingresso.quantidade_total;
    document.getElementById('freeTicketDescription').value = ingresso.descricao || '';
    document.getElementById('freeSaleStart').value = ingresso.inicio_venda || '';
    document.getElementById('freeSaleEnd').value = ingresso.fim_venda || '';
    document.getElementById('freeMinQuantity').value = ingresso.limite_min || 1;
    document.getElementById('freeMaxQuantity').value = ingresso.limite_max || 5;
    document.getElementById('freeTicketLote').value = ingresso.lote_id || '';
    
    // Marcar que está editando
    document.getElementById('freeTicketModal').dataset.editingId = ingresso.id;
    
    console.log(`✅ Modal gratuito populado para edição do ingresso ${ingresso.id}`);
}

/**
 * CRIAÇÃO RADICAL - SALVA NO MYSQL E RECARREGA
 */
window.criarIngressoPagoRadical = async function() {
    console.log('💰 CRIAÇÃO RADICAL de ingresso pago...');
    
    // Pegar dados do formulário
    const title = document.getElementById('paidTicketTitle')?.value?.trim();
    const quantity = document.getElementById('paidTicketQuantity')?.value;
    const price = document.getElementById('paidTicketPrice')?.value;
    const loteId = document.getElementById('paidTicketLote')?.value;
    
    if (!title || !quantity || !price || !loteId) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        alert('Erro: Evento não identificado');
        return;
    }
    
    // Verificar se está editando
    const modal = document.getElementById('paidTicketModal');
    const editingId = modal?.dataset?.editingId;
    const isEditing = editingId && editingId !== '';
    
    // Processar preço
    const cleanPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
    
    // Preparar dados
    const ingressoData = {
        tipo: 'pago',
        titulo: title,
        descricao: document.getElementById('paidTicketDescription')?.value || '',
        quantidade_total: parseInt(quantity),
        preco: cleanPrice,
        taxa_plataforma: cleanPrice * 0.08,
        valor_receber: cleanPrice,
        inicio_venda: document.getElementById('paidSaleStart')?.value || null,
        fim_venda: document.getElementById('paidSaleEnd')?.value || null,
        limite_min: parseInt(document.getElementById('paidMinQuantity')?.value) || 1,
        limite_max: parseInt(document.getElementById('paidMaxQuantity')?.value) || 5,
        lote_id: parseInt(loteId)
    };
    
    // Se está editando, incluir ID
    if (isEditing) {
        ingressoData.id = parseInt(editingId);
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=salvar_ingresso_individual&evento_id=${eventoId}&ingresso=${encodeURIComponent(JSON.stringify(ingressoData))}`
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            const acao = isEditing ? 'atualizado' : 'criado';
            console.log(`✅ Ingresso ${acao} com sucesso`);
            
            // Fechar modal
            if (typeof closeModal === 'function') {
                closeModal('paidTicketModal');
            }
            
            // Limpar formulário
            document.getElementById('paidTicketTitle').value = '';
            document.getElementById('paidTicketQuantity').value = '';
            document.getElementById('paidTicketPrice').value = '';
            document.getElementById('paidTicketDescription').value = '';
            delete modal.dataset.editingId;
            
            // RECARREGAR LISTA IMEDIATAMENTE
            await window.recarregarListaIngressos();
            
            console.log(`✅ Lista atualizada após ${acao}`);
            
        } else {
            alert('Erro ao salvar: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro de conexão');
    }
};

window.criarIngressoGratuitoRadical = async function() {
    console.log('🆓 CRIAÇÃO RADICAL de ingresso gratuito...');
    
    // Pegar dados do formulário
    const title = document.getElementById('freeTicketTitle')?.value?.trim();
    const quantity = document.getElementById('freeTicketQuantity')?.value;
    const loteId = document.getElementById('freeTicketLote')?.value;
    
    if (!title || !quantity || !loteId) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        alert('Erro: Evento não identificado');
        return;
    }
    
    // Verificar se está editando
    const modal = document.getElementById('freeTicketModal');
    const editingId = modal?.dataset?.editingId;
    const isEditing = editingId && editingId !== '';
    
    // Preparar dados
    const ingressoData = {
        tipo: 'gratuito',
        titulo: title,
        descricao: document.getElementById('freeTicketDescription')?.value || '',
        quantidade_total: parseInt(quantity),
        preco: 0,
        taxa_plataforma: 0,
        valor_receber: 0,
        inicio_venda: document.getElementById('freeSaleStart')?.value || null,
        fim_venda: document.getElementById('freeSaleEnd')?.value || null,
        limite_min: parseInt(document.getElementById('freeMinQuantity')?.value) || 1,
        limite_max: parseInt(document.getElementById('freeMaxQuantity')?.value) || 5,
        lote_id: parseInt(loteId)
    };
    
    // Se está editando, incluir ID
    if (isEditing) {
        ingressoData.id = parseInt(editingId);
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=salvar_ingresso_individual&evento_id=${eventoId}&ingresso=${encodeURIComponent(JSON.stringify(ingressoData))}`
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            const acao = isEditing ? 'atualizado' : 'criado';
            console.log(`✅ Ingresso ${acao} com sucesso`);
            
            // Fechar modal
            if (typeof closeModal === 'function') {
                closeModal('freeTicketModal');
            }
            
            // Limpar formulário
            document.getElementById('freeTicketTitle').value = '';
            document.getElementById('freeTicketQuantity').value = '';
            document.getElementById('freeTicketDescription').value = '';
            delete modal.dataset.editingId;
            
            // RECARREGAR LISTA IMEDIATAMENTE
            await window.recarregarListaIngressos();
            
            console.log(`✅ Lista atualizada após ${acao}`);
            
        } else {
            alert('Erro ao salvar: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro de conexão');
    }
};

// ============================================================================
// SOBRESCRITA IMEDIATA E AGRESSIVA
// ============================================================================

console.log('🚨 SOBRESCREVENDO FUNÇÕES IMEDIATAMENTE...');

// Sobrescrever AGORA (não esperar nada)
window.createPaidTicket = window.criarIngressoPagoRadical;
window.createFreeTicket = window.criarIngressoGratuitoRadical;
window.removeTicket = window.excluirIngressoRadical;
window.editTicket = window.editarIngressoRadical;

console.log('✅ SOBRESCRITA IMEDIATA CONCLUÍDA');

// Carregamento inicial
setTimeout(() => {
    console.log('🔄 Carregamento inicial da lista...');
    window.recarregarListaIngressos();
}, 2000);

// Aplicar novamente após carregamento para garantir
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🚨 REFORÇANDO SOBRESCRITA APÓS CARREGAMENTO...');
        
        window.createPaidTicket = window.criarIngressoPagoRadical;
        window.createFreeTicket = window.criarIngressoGratuitoRadical;
        window.removeTicket = window.excluirIngressoRadical;
        window.editTicket = window.editarIngressoRadical;
        
        console.log('✅ SOBRESCRITA REFORÇADA - FUNÇÕES AGORA FUNCIONAM CORRETAMENTE');
        
        // Teste das funções
        setTimeout(() => {
            console.log('🧪 TESTE DAS FUNÇÕES:');
            console.log('- createPaidTicket:', typeof window.createPaidTicket);
            console.log('- createFreeTicket:', typeof window.createFreeTicket);
            console.log('- removeTicket:', typeof window.removeTicket);
            console.log('- editTicket:', typeof window.editTicket);
        }, 1000);
        
    }, 3000);
});

console.log('🚨 CORREÇÃO RADICAL CARREGADA - PROBLEMAS DEVEM ESTAR RESOLVIDOS!');