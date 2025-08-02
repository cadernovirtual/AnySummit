// Sistema de gerenciamento de ingressos temporários para wizard de criação
let temporaryTickets = new Map(); // Armazena ingressos temporários com ID único
let ticketCounter = 0; // Contador para IDs únicos

// Funções para wizard de criação (ingressos temporários)
function addTicketToCreationList(type, title, quantity, price, description = '', saleStart = '', saleEnd = '', minLimit = 1, maxLimit = 5, cobrarTaxa = 1, taxaPlataforma = 0, valorReceber = 0, loteId = null) {
    ticketCounter++;
    const ticketId = `temp_${ticketCounter}`;
    
    // Obter informações do lote selecionado
    let loteInfo = null;
    if (loteId) {
        const selectLote = document.getElementById('paidTicketLote');
        if (selectLote) {
            const selectedOption = selectLote.querySelector(`option[value="${loteId}"]`);
            if (selectedOption) {
                loteInfo = {
                    id: loteId,
                    nome: selectedOption.textContent,
                    tipo: selectedOption.getAttribute('data-tipo'),
                    percentual: selectedOption.getAttribute('data-percentual')
                };
            }
        }
    }
    
    const ticketData = {
        id: ticketId,
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
        loteInfo: loteInfo,
        isTemporary: true // IMPORTANTE: Marcar como temporário
    };
    
    // Armazenar no Map
    temporaryTickets.set(ticketId, ticketData);
    
    // Adicionar à interface visual
    renderTicketInList(ticketData);
    
    console.log('🎟️ Ingresso temporário adicionado:', ticketData);
}

function renderTicketInList(ticketData) {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;

    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketData.id;
    
    // IMPORTANTE: Adicionar o loteId ao dataset
    if (ticketData.loteId) {
        ticketItem.dataset.loteId = ticketData.loteId;
    }
    
    const buyerPrice = ticketData.type === 'paid' ? 
        `R$ ${parseFloat(ticketData.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    // Usar valores calculados se disponíveis
    const tax = ticketData.taxaPlataforma || (ticketData.type === 'paid' ? parseFloat(ticketData.price) * 0.08 : 0);
    const receiveAmount = ticketData.valorReceber || (ticketData.type === 'paid' ? parseFloat(ticketData.price) * 0.92 : 0);
    
    const taxFormatted = `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const receiveFormatted = ticketData.type === 'paid' ? 
        `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    // Determinar qual função usar nos botões baseado no tipo de ingresso
    const isTemporary = ticketData.isTemporary !== false; // Se não especificado, assume temporário
    const editFunction = isTemporary ? 'editTemporaryTicket' : 'editTicket';
    const removeFunction = isTemporary ? 'removeTemporaryTicket' : 'removeTicket';
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">
                <span class="ticket-name">${ticketData.title}</span>
                <span class="ticket-type-badge ${ticketData.type === 'paid' ? 'pago' : 'gratuito'}">
                    ${ticketData.type === 'paid' ? '(Pago)' : '(Gratuito)'}
                </span>
                ${ticketData.loteInfo ? `<span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">${ticketData.loteInfo.nome}</span>` : ''}
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onClick="${editFunction}('${ticketData.id}')" title="Editar">✏️</button>
                <button class="btn-icon" onClick="${removeFunction}('${ticketData.id}')" title="Remover">🗑️</button>
            </div>
        </div>
        <div class="ticket-details">
            <div class="ticket-info">
                <span>Quantidade: <strong>${ticketData.quantity}</strong></span>
                ${ticketData.type === 'paid' ? `<span>Preço: <strong class="ticket-buyer-price">${buyerPrice}</strong></span>` : '<span class="ticket-buyer-price">Gratuito</span>'}
                <span>Taxa: <strong>${taxFormatted}</strong></span>
                <span>Você recebe: <strong>${receiveFormatted}</strong></span>
            </div>
            ${ticketData.description ? `<div class="ticket-description">${ticketData.description}</div>` : ''}
        </div>
    `;
    
    ticketList.appendChild(ticketItem);
}

function editTemporaryTicket(ticketId) {
    console.log('✏️ Editando ingresso temporário:', ticketId);
    
    const ticketData = temporaryTickets.get(ticketId);
    if (!ticketData) {
        alert('Ingresso não encontrado');
        return;
    }
    
    // Popular modal baseado no tipo
    if (ticketData.type === 'paid') {
        populateEditPaidTicketModalWithTemp(ticketData);
        openModal('editPaidTicketModal');
    } else {
        populateEditFreeTicketModalWithTemp(ticketData);
        openModal('editFreeTicketModal');
    }
}

function removeTemporaryTicket(ticketId) {
    if (confirm('Tem certeza que deseja remover este ingresso?')) {
        // Remover do Map
        temporaryTickets.delete(ticketId);
        
        // Remover da interface
        const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
        if (ticketElement) {
            ticketElement.remove();
        }
        
        console.log('🗑️ Ingresso temporário removido:', ticketId);
    }
}

function populateEditPaidTicketModalWithTemp(ticketData) {
    // Carregar lotes primeiro
    if (typeof carregarLotesNoModalEdit === 'function') {
        carregarLotesNoModalEdit();
    }
    
    // Popular campos básicos
    document.getElementById('editTicketId').value = ticketData.id;
    document.getElementById('editPaidTicketTitle').value = ticketData.title;
    document.getElementById('editPaidTicketQuantity').value = ticketData.quantity;
    document.getElementById('editPaidTicketPrice').value = formatPriceForInput(ticketData.price);
    
    // Popular campos de datas
    document.getElementById('editPaidSaleStart').value = ticketData.saleStart;
    document.getElementById('editPaidSaleEnd').value = ticketData.saleEnd;
    document.getElementById('editPaidMinLimit').value = ticketData.minLimit;
    document.getElementById('editPaidMaxLimit').value = ticketData.maxLimit;
    document.getElementById('editPaidTicketDescription').value = ticketData.description;
    
    // Popular lote (com delay para garantir que os lotes foram carregados)
    setTimeout(() => {
        if (ticketData.loteId) {
            document.getElementById('editPaidTicketLote').value = ticketData.loteId;
        }
        
        // Configurar checkbox de taxa
        if (ticketData.cobrarTaxa !== undefined) {
            document.getElementById('editPaidTicketTaxaServico').checked = ticketData.cobrarTaxa === 1;
        }
        
        // Atualizar cálculos e datas
        if (typeof updateEditPaidTicketDates === 'function') {
            updateEditPaidTicketDates();
        }
        if (typeof calcularValoresIngressoEdit === 'function') {
            calcularValoresIngressoEdit();
        }
    }, 300);
}

function populateEditFreeTicketModalWithTemp(ticketData) {
    document.getElementById('editFreeTicketId').value = ticketData.id;
    document.getElementById('editFreeTicketTitle').value = ticketData.title;
    document.getElementById('editFreeTicketQuantity').value = ticketData.quantity;
    document.getElementById('editFreeSaleStart').value = ticketData.saleStart;
    document.getElementById('editFreeSaleEnd').value = ticketData.saleEnd;
    document.getElementById('editFreeMinLimit').value = ticketData.minLimit;
    document.getElementById('editFreeMaxLimit').value = ticketData.maxLimit;
    document.getElementById('editFreeTicketDescription').value = ticketData.description;
}

function formatPriceForInput(value) {
    if (!value) return '';
    return 'R$ ' + parseFloat(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para atualizar ingresso temporário
function updateTemporaryTicket(ticketId, newData) {
    const ticketData = temporaryTickets.get(ticketId);
    if (!ticketData) return false;
    
    // Atualizar dados
    Object.assign(ticketData, newData);
    temporaryTickets.set(ticketId, ticketData);
    
    // Re-renderizar na interface
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (ticketElement) {
        ticketElement.remove();
        renderTicketInList(ticketData);
    }
    
    return true;
}

// Função para obter todos os ingressos temporários (para envio no formulário)
function getAllTemporaryTickets() {
    return Array.from(temporaryTickets.values());
}

// Exportar para uso global
window.addTicketToCreationList = addTicketToCreationList;
window.editTemporaryTicket = editTemporaryTicket;
window.removeTemporaryTicket = removeTemporaryTicket;
window.updateTemporaryTicket = updateTemporaryTicket;
window.getAllTemporaryTickets = getAllTemporaryTickets;

console.log('✅ Sistema de ingressos temporários carregado');

// Teste de inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Temporary Tickets System Ready');
    console.log('📊 Funções disponíveis:', {
        addTicketToCreationList: typeof window.addTicketToCreationList,
        editTemporaryTicket: typeof window.editTemporaryTicket,
        removeTemporaryTicket: typeof window.removeTemporaryTicket,
        updateTemporaryTicket: typeof window.updateTemporaryTicket,
        getAllTemporaryTickets: typeof window.getAllTemporaryTickets
    });
});
