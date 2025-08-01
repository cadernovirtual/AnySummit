// =====================================================
// SISTEMA DE COMBOS - ANYSUMMIT
// =====================================================
// Importado de: combo-functions.js

console.log('📦 Importando sistema de combos...');

// Variáveis globais
window.comboItems = [];
window.ultimoLoteSelecionado = '';

// Carregar lotes no modal de combo
window.carregarLotesNoModalCombo = function() {
    console.log('📋 Carregando lotes para combo...');
    
    const selectLote = document.getElementById('comboTicketLote');
    if (!selectLote) return;
    
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Carregar de window.lotesData
    if (window.lotesData) {
        // Lotes por data
        if (window.lotesData.porData) {
            window.lotesData.porData.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = `${lote.nome} - Por Data`;
                option.setAttribute('data-tipo', 'data');
                option.setAttribute('data-inicio', lote.dataInicio);
                option.setAttribute('data-fim', lote.dataFim);
                selectLote.appendChild(option);
            });
        }
        
        // Lotes por percentual
        if (window.lotesData.porPercentual) {
            window.lotesData.porPercentual.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = `${lote.nome} - Por Vendas (${lote.percentual}%)`;
                option.setAttribute('data-tipo', 'percentual');
                option.setAttribute('data-percentual', lote.percentual);
                option.setAttribute('data-inicio', lote.dataInicio);
                option.setAttribute('data-fim', lote.dataFim);
                selectLote.appendChild(option);
            });
        }
    }
};

// Atualizar tipos de ingresso quando selecionar lote
window.updateComboTicketTypes = function() {
    const selectLote = document.getElementById('comboTicketLote');
    const selectTipos = document.getElementById('comboTicketTypeSelect');
    
    if (!selectLote || !selectTipos) return;
    
    const loteId = selectLote.value;
    selectTipos.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    if (!loteId) {
        selectTipos.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        return;
    }
    
    // Buscar ingressos do lote selecionado
    const ticketItems = document.querySelectorAll('.ticket-item');
    let hasTickets = false;
    
    ticketItems.forEach(item => {
        if (item.dataset.loteId === loteId && item.dataset.ticketType !== 'combo') {
            hasTickets = true;
            const ticketData = item.ticketData || {};
            const ticketName = item.querySelector('.ticket-name')?.textContent;
            const ticketPrice = item.querySelector('.ticket-buyer-price')?.textContent;
            
            const option = document.createElement('option');
            option.value = item.dataset.ticketId;
            option.textContent = `${ticketName} - ${ticketPrice}`;
            option.dataset.price = ticketData.preco || '0';
            option.dataset.name = ticketName;
            selectTipos.appendChild(option);
        }
    });
    
    if (!hasTickets) {
        selectTipos.innerHTML = '<option value="">Nenhum ingresso disponível neste lote</option>';
    }
    
    // Atualizar datas baseado no lote
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    if (selectedOption) {
        const dataInicio = selectedOption.getAttribute('data-inicio');
        const dataFim = selectedOption.getAttribute('data-fim');
        
        const startInput = document.getElementById('comboSaleStart');
        const endInput = document.getElementById('comboSaleEnd');
        
        if (startInput && dataInicio) startInput.value = dataInicio;
        if (endInput && dataFim) endInput.value = dataFim;
    }
};

// Adicionar item ao combo
window.addItemToCombo = function() {
    const selectTipo = document.getElementById('comboTicketTypeSelect');
    const quantidade = document.getElementById('comboItemQuantity');
    
    if (!selectTipo.value) {
        alert('Selecione um tipo de ingresso');
        return;
    }
    
    const selectedOption = selectTipo.options[selectTipo.selectedIndex];
    const preco = parseFloat(selectedOption.dataset.price) || 0;
    const nome = selectedOption.dataset.name || 'Ingresso';
    const qty = parseInt(quantidade.value) || 1;
    
    window.comboItems.push({
        id: selectTipo.value,
        nome: nome,
        quantidade: qty,
        preco: preco,
        subtotal: preco * qty
    });
    
    updateComboItemsList();
    
    // Limpar seleção
    selectTipo.value = '';
    quantidade.value = '1';
};

// Atualizar lista de itens do combo
window.updateComboItemsList = function() {
    const container = document.getElementById('comboItemsList');
    const totalElement = document.getElementById('comboTotalValue');
    
    if (!container) return;
    
    if (window.comboItems.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum item adicionado ao combo</p>';
        if (totalElement) totalElement.textContent = 'R$ 0,00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    window.comboItems.forEach((item, index) => {
        html += `
            <div class="combo-item">
                <span class="combo-item-name">${item.quantidade}x ${item.nome}</span>
                <span class="combo-item-price">${window.formatarMoeda(item.subtotal)}</span>
                <button class="btn-icon delete" onclick="removeComboItem(${index})">🗑️</button>
            </div>
        `;
        total += item.subtotal;
    });
    
    container.innerHTML = html;
    if (totalElement) totalElement.textContent = window.formatarMoeda(total);
};

// Remover item do combo
window.removeComboItem = function(index) {
    window.comboItems.splice(index, 1);
    updateComboItemsList();
};

// Criar combo
window.createComboTicket = function() {
    console.log('📦 Criando combo...');
    
    // Validação
    const title = document.getElementById('comboTicketTitle')?.value;
    const loteId = document.getElementById('comboTicketLote')?.value;
    const description = document.getElementById('comboTicketDescription')?.value || '';
    const quantity = document.getElementById('comboTicketQuantity')?.value || 1;
    
    if (!title) {
        alert('Digite um nome para o combo');
        return;
    }
    
    if (!loteId) {
        alert('Selecione um lote');
        return;
    }
    
    if (window.comboItems.length === 0) {
        alert('Adicione pelo menos um ingresso ao combo');
        return;
    }
    
    // Calcular preço total
    const precoTotal = window.comboItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Criar dados do combo
    const comboData = {
        id: `combo_${Date.now()}`,
        tipo: 'combo',
        titulo: title,
        descricao: description,
        quantidade: parseInt(quantity),
        preco: precoTotal,
        loteId: loteId,
        items: [...window.comboItems],
        taxaServico: true,
        taxaPlataforma: precoTotal * 0.08,
        valorComprador: precoTotal + (precoTotal * 0.08),
        valorReceber: precoTotal
    };
    
    // Adicionar ao DOM
    addComboToList(comboData);
    
    // Fechar modal
    if (window.closeModal) {
        window.closeModal('comboTicketModal');
    }
    
    // Salvar dados
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
    
    // Limpar campos
    document.getElementById('comboTicketTitle').value = '';
    document.getElementById('comboTicketDescription').value = '';
    document.getElementById('comboTicketQuantity').value = '1';
    document.getElementById('comboTicketLote').value = '';
    window.comboItems = [];
    updateComboItemsList();
};

// Adicionar combo à lista
function addComboToList(comboData) {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;
    
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = comboData.id;
    ticketItem.dataset.ticketType = 'combo';
    ticketItem.dataset.loteId = comboData.loteId;
    ticketItem.ticketData = comboData;
    
    const totalItems = comboData.items.length;
    const itemsDesc = comboData.items.map(i => `${i.quantidade}x ${i.nome}`).join(', ');
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-info">
                <div class="ticket-name" style="color: #00C2FF;">📦 ${comboData.titulo}</div>
                <div class="ticket-details">
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Combo com ${totalItems} tipos</span>
                    </span>
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Quantidade:</span>
                        <span class="ticket-detail-value">${comboData.quantidade}</span>
                    </span>
                </div>
                <div class="combo-items-preview">${itemsDesc}</div>
            </div>
            <div class="ticket-pricing">
                <div class="ticket-price-item">
                    <span class="ticket-price-label">Valor do combo:</span>
                    <span class="ticket-buyer-price">${window.formatarMoeda(comboData.valorComprador)}</span>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onclick="editTicket('${comboData.id}')" title="Editar">✏️</button>
                <button class="btn-icon delete" onclick="removeTicket('${comboData.id}')" title="Excluir">🗑️</button>
            </div>
        </div>
    `;
    
    ticketList.appendChild(ticketItem);
}

// Event listener para mudança de lote
document.addEventListener('DOMContentLoaded', function() {
    const selectLote = document.getElementById('comboTicketLote');
    if (selectLote) {
        selectLote.addEventListener('change', function() {
            // Verificar se há itens antes de trocar
            if (window.comboItems.length > 0) {
                if (!confirm('Ao trocar o lote, os itens do combo serão removidos. Continuar?')) {
                    this.value = window.ultimoLoteSelecionado || '';
                    return;
                }
                window.comboItems = [];
                updateComboItemsList();
            }
            
            window.ultimoLoteSelecionado = this.value;
            updateComboTicketTypes();
        });
    }
});

console.log('✅ Sistema de combos importado');