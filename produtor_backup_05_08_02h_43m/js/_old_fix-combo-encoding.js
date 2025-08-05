// Sobrescrever a função addComboToList com versão corrigida
window.addComboToList = function(title, quantity, price, comboData, totalItems, description, loteId, loteNome, startDate, endDate) {
    window.ticketCount = (window.ticketCount || 0) + 1;
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;

    const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
    const tax = cleanPrice * 0.1;
    const receiveAmount = cleanPrice * 0.9;
    
    const taxFormatted = `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const receiveFormatted = `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = window.ticketCount;
    ticketItem.dataset.comboData = JSON.stringify(comboData);
    
    // HTML CORRIGIDO COM CARACTERES CORRETOS
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">
                ${title}
                <span class="ticket-type-badge combo">Combo</span>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onClick="editCombo(${window.ticketCount})" title="Editar Combo">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                    </svg>
                </button>
                <button class="btn-icon" onClick="removeTicket(${window.ticketCount})" title="Remover">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="ticket-details">
            <div class="ticket-info">
                <span>Quantidade: <strong>${quantity}</strong></span>
                <span>Preço: <strong>${price}</strong></span>
                <span>Taxa: <strong>${taxFormatted}</strong></span>
                <span>Você recebe: <strong>${receiveFormatted}</strong></span>
            </div>
            ${description ? `<div class="ticket-description">${description}</div>` : ''}
            <div class="combo-items">
                <strong>Inclui:</strong>
                ${comboData.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
            </div>
        </div>
    `;
    
    ticketList.appendChild(ticketItem);
    
    // Armazenar dados do combo para edição
    ticketItem.ticketData = {
        type: 'combo',
        title: title,
        quantity: quantity,
        price: cleanPrice,
        description: description,
        comboData: comboData
    };
};

console.log('✅ Função addComboToList corrigida e substituída!');
