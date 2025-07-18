// Sistema de gerenciamento de ingressos temporários para wizard de criação
let temporaryTickets = new Map(); // Armazena ingressos temporários com ID único
let ticketCounter = 0; // Contador para IDs únicos

// Funções para wizard de criação (ingressos temporários)
function addTicketToCreationList(type, title, quantity, price, description = '', saleStart = '', saleEnd = '', minLimit = 1, maxLimit = 5) {
    ticketCounter++;
    const ticketId = `temp_${ticketCounter}`;
    
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
        isTemporary: true
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
    
    const buyerPrice = ticketData.type === 'paid' ? 
        `R$ ${parseFloat(ticketData.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    const cleanPrice = ticketData.type === 'paid' ? parseFloat(ticketData.price) : 0;
    const tax = ticketData.type === 'paid' ? cleanPrice * 0.05 : 0;
    const receiveAmount = ticketData.type === 'paid' ? cleanPrice * 0.95 : 0;
    
    const taxFormatted = `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const receiveFormatted = ticketData.type === 'paid' ? 
        `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">
                ${ticketData.title}
                <span class="ticket-type-badge ${ticketData.type === 'paid' ? 'pago' : 'gratuito'}">
                    ${ticketData.type === 'paid' ? 'Pago' : 'Gratuito'}
                </span>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onClick="editTemporaryTicket('${ticketData.id}')" title="Editar">✏️</button>
                <button class="btn-icon" onClick="removeTemporaryTicket('${ticketData.id}')" title="Remover">🗑️</button>
            </div>
        </div>
        <div class="ticket-details">
            <div class="ticket-info">
                <span>Quantidade: <strong>${ticketData.quantity}</strong></span>
                ${ticketData.type === 'paid' ? `<span>Preço: <strong>${buyerPrice}</strong></span>` : ''}
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
    document.getElementById('editTicketId').value = ticketData.id;
    document.getElementById('editPaidTicketTitle').value = ticketData.title;
    document.getElementById('editPaidTicketQuantity').value = ticketData.quantity;
    document.getElementById('editPaidTicketPrice').value = formatPriceForInput(ticketData.price);
    document.getElementById('editPaidTicketReceive').value = formatPriceForInput(ticketData.price * 0.95);
    document.getElementById('editPaidSaleStart').value = ticketData.saleStart;
    document.getElementById('editPaidSaleEnd').value = ticketData.saleEnd;
    document.getElementById('editPaidMinLimit').value = ticketData.minLimit;
    document.getElementById('editPaidMaxLimit').value = ticketData.maxLimit;
    document.getElementById('editPaidTicketDescription').value = ticketData.description;
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
