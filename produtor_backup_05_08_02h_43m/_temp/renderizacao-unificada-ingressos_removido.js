/**
 * SISTEMA UNIFICADO DE RENDERIZAÇÃO DE INGRESSOS
 * Corrige o problema dos diferentes formatos entre rascunho e operações
 * Garante que tanto restauração quanto criação usem o mesmo formato
 */

console.log('🔧 Carregando sistema unificado de renderização de ingressos...');

/**
 * Função unificada para renderizar ingresso na lista
 * Substitui tanto renderTicketInList quanto criarElementoIngresso
 */
window.renderIngressoUnificado = function(ingressoData, useRealId = false) {
    console.log('🎨 Renderizando ingresso unificado:', ingressoData);
    
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ Container ticketList não encontrado');
        return null;
    }
    
    // Normalizar dados do ingresso (compatibilidade entre formatos)
    const ingresso = {
        id: useRealId ? ingressoData.id : (ingressoData.id || `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
        tipo: ingressoData.tipo || mapearTipoParaPortugues(ingressoData.type),
        titulo: ingressoData.titulo || ingressoData.title || '',
        descricao: ingressoData.descricao || ingressoData.description || '',
        quantidade: parseInt(ingressoData.quantidade || ingressoData.quantity || ingressoData.quantidade_total) || 100,
        preco: parseFloat(ingressoData.preco || ingressoData.price) || 0,
        taxaPlataforma: parseFloat(ingressoData.taxaPlataforma || ingressoData.taxa_plataforma) || 0,
        valorReceber: parseFloat(ingressoData.valorReceber || ingressoData.valor_receber) || 0,
        loteId: ingressoData.loteId || ingressoData.lote_id || null,
        loteNome: ingressoData.lote_nome || ingressoData.loteName || '',
        limite_min: parseInt(ingressoData.limite_min || ingressoData.minLimit || ingressoData.minQuantity) || 1,
        limite_max: parseInt(ingressoData.limite_max || ingressoData.maxLimit || ingressoData.maxQuantity) || 5
    };
    
    // Para combos, adicionar dados específicos
    if (ingresso.tipo === 'combo') {
        try {
            ingresso.comboData = ingressoData.comboData || 
                                (typeof ingressoData.conteudo_combo === 'string' ? 
                                 JSON.parse(ingressoData.conteudo_combo) : 
                                 ingressoData.conteudo_combo) || [];
        } catch (e) {
            console.error('Erro ao parsear combo data:', e);
            ingresso.comboData = [];
        }
    }
    
    // Criar elemento do ingresso
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ingresso.id;
    
    // Adicionar loteId ao dataset se existir
    if (ingresso.loteId) {
        ticketItem.dataset.loteId = ingresso.loteId;
    }
    
    // Armazenar dados completos no elemento (importante para edição)
    ticketItem.ticketData = ingresso;
    
    // Calcular valores de exibição
    const tipoLabel = ingresso.tipo === 'pago' ? 'Pago' : (ingresso.tipo === 'gratuito' ? 'Gratuito' : 'Combo');
    const precoFormatado = ingresso.tipo === 'pago' || ingresso.tipo === 'combo' ? 
        `R$ ${ingresso.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    // Taxa calculada se não existir
    const taxa = ingresso.taxaPlataforma || (ingresso.preco * 0.08);
    const taxaFormatada = `R$ ${taxa.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    // Valor a receber calculado se não existir
    const valorReceber = ingresso.valorReceber || (ingresso.preco - taxa);
    const valorReceberFormatado = ingresso.tipo === 'gratuito' ? 
        'Gratuito' : 
        `R$ ${valorReceber.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    let ticketHtml = '';
    
    if (ingresso.tipo === 'combo') {
        const totalItens = ingresso.comboData ? ingresso.comboData.length : 0;
        ticketHtml = `
            <div class="ticket-header">
                <div class="ticket-title">
                    <span class="ticket-name" style="color: #00C2FF;">${ingresso.titulo}</span>
                    <span class="ticket-type-badge combo">(Combo)</span>
                    ${ingresso.loteNome ? `<span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">${ingresso.loteNome}</span>` : ''}
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ingresso.id}')" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="removeTicket('${ingresso.id}')" title="Remover">🗑️</button>
                </div>
            </div>
            <div class="ticket-details">
                <div class="ticket-info">
                    <span>Combo com <strong>${totalItens} itens</strong></span>
                    <span>Preço: <strong>${precoFormatado}</strong></span>
                    <span>Taxa: <strong>${taxaFormatada}</strong></span>
                    <span>Você recebe: <strong>${valorReceberFormatado}</strong></span>
                </div>
            </div>
        `;
    } else {
        ticketHtml = `
            <div class="ticket-header">
                <div class="ticket-title">
                    <span class="ticket-name">${ingresso.titulo}</span>
                    <span class="ticket-type-badge ${ingresso.tipo}">(${tipoLabel})</span>
                    ${ingresso.loteNome ? `<span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">${ingresso.loteNome}</span>` : ''}
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ingresso.id}')" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="removeTicket('${ingresso.id}')" title="Remover">🗑️</button>
                </div>
            </div>
            <div class="ticket-details">
                <div class="ticket-info">
                    <span>Quantidade: <strong>${ingresso.quantidade}</strong></span>
                    ${ingresso.tipo === 'pago' ? `<span>Preço: <strong>${precoFormatado}</strong></span>` : '<span class="ticket-free">Gratuito</span>'}
                    <span>Taxa: <strong>${taxaFormatada}</strong></span>
                    <span>Você recebe: <strong>${valorReceberFormatado}</strong></span>
                    ${ingresso.loteNome ? `<span>Lote: <strong>${ingresso.loteNome}</strong></span>` : ''}
                </div>
            </div>
        `;
    }
    
    ticketItem.innerHTML = ticketHtml;
    ticketList.appendChild(ticketItem);
    
    console.log(`✅ Ingresso renderizado: ${ingresso.titulo} (ID: ${ingresso.id})`);
    return ticketItem;
};

/**
 * Mapear tipo inglês para português (compatibilidade)
 */
function mapearTipoParaPortugues(tipo) {
    const mapa = {
        'paid': 'pago',
        'free': 'gratuito',
        'combo': 'combo'
    };
    return mapa[tipo] || 'pago';
}

/**
 * Sobrescrever função window.restaurarIngressos para usar renderização unificada
 */
window.restaurarIngressos = function(ingressos) {
    console.log('🔄 Restaurando ingressos (versão unificada):', ingressos);
    
    if (!ingressos || !Array.isArray(ingressos) || ingressos.length === 0) {
        console.log('⚠️ Nenhum ingresso para restaurar');
        return;
    }
    
    // Limpar lista atual
    const ticketList = document.getElementById('ticketList');
    if (ticketList) {
        ticketList.innerHTML = '';
    }
    
    // Restaurar cada ingresso usando renderização unificada com IDs reais do banco
    ingressos.forEach((ingresso, index) => {
        console.log(`📋 Restaurando ingresso ${index + 1}:`, ingresso);
        window.renderIngressoUnificado(ingresso, true); // useRealId = true
    });
    
    console.log('✅ Ingressos restaurados na interface (versão unificada)');
};

/**
 * Sobrescrever renderTicketInList para usar renderização unificada
 */
if (typeof window.originalRenderTicketInList === 'undefined') {
    window.originalRenderTicketInList = window.renderTicketInList;
}

window.renderTicketInList = function(ticketData) {
    console.log('🔄 Renderizando via renderTicketInList (redirecionando para unificado)');
    return window.renderIngressoUnificado(ticketData, false); // useRealId = false (IDs temporários)
};

console.log('✅ Sistema unificado de renderização carregado!');
console.log('📋 Funções disponíveis:');
console.log('  - renderIngressoUnificado(): Renderização padrão para todos os casos');
console.log('  - restaurarIngressos(): Versão unificada para restauração de rascunho');
console.log('  - renderTicketInList(): Interceptada para usar renderização unificada');

/**
 * Função para adicionar ingresso criado via API (modo edição) à lista
 * Usa renderização unificada e IDs reais do banco
 */
window.addTicketToEditList = function(ingressoData) {
    console.log('📝 Adicionando ingresso via API à lista (modo edição):', ingressoData);
    
    // Usar renderização unificada com ID real do banco
    const elemento = window.renderIngressoUnificado(ingressoData, true);
    
    if (elemento) {
        console.log('✅ Ingresso adicionado à lista via API');
    } else {
        console.error('❌ Erro ao adicionar ingresso à lista');
    }
};

/**
 * Interceptar addTicketToCreationList para usar renderização unificada
 */
if (typeof window.originalAddTicketToCreationList === 'undefined') {
    window.originalAddTicketToCreationList = window.addTicketToCreationList;
}

window.addTicketToCreationList = function(type, title, quantity, price, description = '', saleStart = '', saleEnd = '', minLimit = 1, maxLimit = 5, cobrarTaxa = 1, taxaPlataforma = 0, valorReceber = 0, loteId = null) {
    console.log('🔄 addTicketToCreationList interceptado - usando renderização unificada');
    
    // Converter parâmetros para formato unificado
    const ingressoData = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        title: title,
        quantity: quantity,
        price: type === 'paid' ? price : 0,
        description: description,
        saleStart: saleStart,
        saleEnd: saleEnd,
        minLimit: minLimit,
        maxLimit: maxLimit,
        cobrarTaxa: cobrarTaxa,
        taxaPlataforma: taxaPlataforma,
        valorReceber: valorReceber,
        loteId: loteId,
        isTemporary: true
    };
    
    // Adicionar à lista de temporários se existir
    if (typeof temporaryTickets !== 'undefined' && temporaryTickets instanceof Map) {
        temporaryTickets.set(ingressoData.id, ingressoData);
    }
    
    // Usar renderização unificada
    window.renderIngressoUnificado(ingressoData, false);
    
    console.log('✅ Ingresso temporário criado via renderização unificada');
};

console.log('✅ Funções de integração carregadas para renderização unificada!');
