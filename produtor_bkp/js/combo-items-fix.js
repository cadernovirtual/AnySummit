// Fix definitivo para salvar combos com items corretos
(function() {
    console.log('🚀 Combo Items Fix iniciado...');
    
    // Função para garantir que o combo tenha a estrutura correta
    window.garantirEstruturaCombo = function(comboData) {
        console.log('🔧 Garantindo estrutura do combo:', comboData);
        
        // Se não tem items mas tem comboItems (global), usar esses
        if ((!comboData.items || comboData.items.length === 0) && window.comboItems && window.comboItems.length > 0) {
            console.log('📦 Usando comboItems global:', window.comboItems);
            comboData.items = window.comboItems.map(item => ({
                ticketId: item.ticketId || item.id,
                quantity: item.quantity || 1
            }));
        }
        
        return comboData;
    };
    
    // Interceptar quando o combo é adicionado à lista
    const originalAddTicketToList = window.addTicketToList;
    
    window.addTicketToList = function(ticketData) {
        console.log('➕ Adicionando ticket/combo à lista:', ticketData);
        
        // Se for um combo, garantir que tem items
        if (ticketData.type === 'combo') {
            ticketData = garantirEstruturaCombo(ticketData);
            console.log('📦 Combo após garantir estrutura:', ticketData);
        }
        
        // Chamar função original
        if (originalAddTicketToList) {
            return originalAddTicketToList.call(this, ticketData);
        }
        
        // Se não existir função original, implementar uma básica
        const ticketsList = document.getElementById('ticketsList');
        if (!ticketsList) return;
        
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.dataset.ticketId = ticketData.id || `ticket_${Date.now()}`;
        
        // Guardar dados completos no elemento
        ticketItem.ticketData = ticketData;
        
        // HTML do item
        const badgeHtml = ticketData.type === 'combo' ? 
            '<span class="ticket-type-badge combo">COMBO</span>' : 
            '<span class="ticket-type-badge">' + (ticketData.type === 'free' ? 'GRATUITO' : 'PAGO') + '</span>';
        
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-main-info">
                    <div class="ticket-name">${ticketData.title || ticketData.name}</div>
                    ${badgeHtml}
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket(this.closest('.ticket-item'))">✏️</button>
                    <button class="btn-icon" onclick="removeTicket(this.closest('.ticket-item'))">🗑️</button>
                </div>
            </div>
            <div class="ticket-details">
                <span class="ticket-info">Quantidade: ${ticketData.quantity}</span>
                <span class="ticket-info">Preço: R$ ${parseFloat(ticketData.price).toFixed(2)}</span>
            </div>
        `;
        
        // Se for combo, adicionar lista de itens
        if (ticketData.type === 'combo' && ticketData.items && ticketData.items.length > 0) {
            const itemsList = document.createElement('div');
            itemsList.className = 'combo-items-preview';
            itemsList.innerHTML = '<div style="margin-top: 10px; font-size: 0.85em; color: #8B95A7;">Itens inclusos:</div>';
            
            ticketData.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = 'margin-left: 20px; font-size: 0.85em; color: #B8B8C8;';
                itemDiv.textContent = `• ${item.quantity || 1}x ingresso`;
                itemsList.appendChild(itemDiv);
            });
            
            ticketItem.appendChild(itemsList);
        }
        
        ticketsList.appendChild(ticketItem);
    };
    
    // Função para debug
    window.verificarCombosNaLista = function() {
        const ticketItems = document.querySelectorAll('.ticket-item');
        let combosEncontrados = 0;
        
        ticketItems.forEach(item => {
            if (item.querySelector('.ticket-type-badge.combo')) {
                combosEncontrados++;
                console.log('📦 Combo encontrado:', {
                    id: item.dataset.ticketId,
                    data: item.ticketData,
                    temItems: item.ticketData && item.ticketData.items && item.ticketData.items.length > 0
                });
            }
        });
        
        console.log(`Total de combos: ${combosEncontrados}`);
    };
    
    console.log('✅ Combo Items Fix carregado!');
})();