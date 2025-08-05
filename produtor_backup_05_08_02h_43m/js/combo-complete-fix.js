// Correções para funções de combo
console.log('📦 Carregando correções de combo...');

// Variável global para armazenar itens do combo
window.comboItems = window.comboItems || [];

// Função para adicionar item ao combo
window.addItemToCombo = function() {
    console.log('➕ Adicionando item ao combo...');
    
    // Obter valores dos campos
    const ticketSelect = document.getElementById('comboTicketTypeSelect');
    const quantityInput = document.getElementById('comboItemQuantity');
    
    if (!ticketSelect || !quantityInput) {
        console.error('Elementos do formulário não encontrados');
        return;
    }
    
    const selectedOption = ticketSelect.options[ticketSelect.selectedIndex];
    const quantity = parseInt(quantityInput.value) || 1;
    
    // Validar seleção
    if (!selectedOption || !selectedOption.value) {
        alert('Por favor, selecione um tipo de ingresso');
        return;
    }
    
    if (quantity < 1) {
        alert('A quantidade deve ser pelo menos 1');
        return;
    }
    
    // Verificar se o item já existe no combo
    const existingItem = comboItems.find(item => item.ticketId === selectedOption.value);
    if (existingItem) {
        alert('Este ingresso já foi adicionado ao combo. Remova-o primeiro se quiser alterar a quantidade.');
        return;
    }
    
    // Criar objeto do item
    const item = {
        ticketId: selectedOption.value,
        name: selectedOption.dataset.title || selectedOption.textContent,
        price: selectedOption.dataset.price || '0',
        quantity: quantity,
        type: selectedOption.dataset.type || 'paid'
    };
    
    // Adicionar à lista
    comboItems.push(item);
    
    // Atualizar visualização
    updateComboItemsList();
    
    // Limpar campos
    ticketSelect.value = '';
    quantityInput.value = '1';
    
    // Recalcular valores
    if (typeof window.calcularValoresCombo === 'function') {
        window.calcularValoresCombo();
    }
    
    console.log('✅ Item adicionado ao combo:', item);
};

// Função para remover item do combo
window.removeComboItem = function(index) {
    console.log('🗑️ Removendo item do combo:', index);
    
    if (index >= 0 && index < comboItems.length) {
        comboItems.splice(index, 1);
        updateComboItemsList();
        
        // Recalcular valores
        if (typeof window.calcularValoresCombo === 'function') {
            window.calcularValoresCombo();
        }
    }
};

// Função para atualizar lista de itens do combo
window.updateComboItemsList = function() {
    console.log('🔄 Atualizando lista de itens do combo...');
    
    const container = document.getElementById('comboItemsList');
    if (!container) return;
    
    if (comboItems.length === 0) {
        container.innerHTML = `
            <div class="combo-empty-state">
                <div style="font-size: 2rem; margin-bottom: 10px;">📦</div>
                <div style="color: #8B95A7;">Adicione tipos de ingresso ao combo</div>
                <div style="color: #8B95A7; font-size: 0.85rem;">Selecione os tipos já criados e defina quantidades</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = comboItems.map((item, index) => {
        const priceText = item.type === 'free' || parseFloat(item.price) === 0 
            ? 'Gratuito' 
            : `R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}`;
            
        return `
            <div class="combo-item" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                margin-bottom: 8px;
                background: rgba(15, 15, 35, 0.6);
                border: 1px solid rgba(114, 94, 255, 0.2);
                border-radius: 8px;
            ">
                <div class="combo-item-info">
                    <div class="combo-item-title" style="font-weight: 600; color: #E1E5F2;">
                        ${item.name}
                    </div>
                    <div class="combo-item-details" style="font-size: 0.875rem; color: #8B95A7;">
                        ${priceText}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="combo-item-quantity" style="
                        background: rgba(114, 94, 255, 0.1);
                        padding: 4px 12px;
                        border-radius: 6px;
                        font-weight: 600;
                    ">${item.quantity}x</div>
                    <button class="btn-icon btn-delete" onclick="removeComboItem(${index})" title="Remover" style="
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        color: #EF4444;
                        padding: 6px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ Lista atualizada com ${comboItems.length} itens`);
};

// Função para criar combo (completa)
window.createComboTicket = function() {
    console.log('💾 Criando combo de ingressos...');
    
    // Validar campos básicos
    const title = document.getElementById('comboTicketTitle')?.value?.trim();
    const quantity = document.getElementById('comboTicketQuantity')?.value;
    const price = document.getElementById('comboTicketPrice')?.value;
    const loteId = document.getElementById('comboTicketLote')?.value;
    
    if (!title || !quantity || !price || !loteId) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    if (comboItems.length === 0) {
        alert('Adicione pelo menos um tipo de ingresso ao combo');
        return;
    }
    
    // Limpar preço
    const cleanPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
    
    // Criar elemento do combo
    const ticketId = 'combo_' + Date.now();
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketId;
    ticketItem.dataset.ticketType = 'combo';
    ticketItem.dataset.loteId = loteId;
    
    // Calcular total de ingressos no combo
    const totalIngressos = comboItems.reduce((sum, item) => sum + item.quantity, 0);
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-info">
                <div class="ticket-name" style="color: #00C2FF;">${title}</div>
                <div class="ticket-details">
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Combo com ${totalIngressos} ingressos</span>
                    </span>
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Quantidade:</span>
                        <span class="ticket-detail-value">${quantity}</span>
                    </span>
                </div>
            </div>
            <div class="ticket-pricing">
                <div class="ticket-price-item">
                    <span class="ticket-price-label">Valor do combo:</span>
                    <span class="ticket-buyer-price">R$ ${cleanPrice.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">
                    ✏️
                </button>
                <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">
                    🗑️
                </button>
            </div>
        </div>
    `;
    
    // Salvar dados no elemento
    ticketItem.ticketData = {
        type: 'combo',
        title: title,
        quantity: parseInt(quantity),
        price: cleanPrice,
        loteId: loteId,
        items: comboItems.map(item => ({
            ticketId: item.ticketId,
            quantity: item.quantity
        }))
    };
    
    // Adicionar à lista
    document.getElementById('ticketList').appendChild(ticketItem);
    
    // Fechar modal
    closeModal('comboTicketModal');
    
    // Limpar formulário
    document.getElementById('comboTicketTitle').value = '';
    document.getElementById('comboTicketQuantity').value = '';
    document.getElementById('comboTicketPrice').value = '';
    document.getElementById('comboTicketLote').value = '';
    comboItems = [];
    updateComboItemsList();
    
    console.log('✅ Combo criado com sucesso!');
};

// Função auxiliar para calcular valores do combo
window.calcularValoresCombo = function() {
    console.log('🧮 Calculando valores do combo...');
    
    const priceInput = document.getElementById('comboTicketPrice');
    const taxaCheckbox = document.getElementById('comboTicketTaxaServico');
    
    if (!priceInput) return;
    
    const priceText = priceInput.value;
    const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const cobrarTaxa = taxaCheckbox?.checked ?? true;
    
    let taxaServico = 0;
    let valorComprador = price;
    let valorReceber = price;
    
    if (cobrarTaxa && price > 0) {
        taxaServico = price * 0.08;
        valorComprador = price + taxaServico;
    }
    
    // Atualizar campos
    const taxaInput = document.getElementById('comboTicketTaxaValor');
    const compradorInput = document.getElementById('comboTicketValorComprador');
    const receberInput = document.getElementById('comboTicketReceive');
    
    if (taxaInput) taxaInput.value = `R$ ${taxaServico.toFixed(2).replace('.', ',')}`;
    if (compradorInput) compradorInput.value = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    if (receberInput) receberInput.value = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
};

// Limpar lista ao abrir modal
document.addEventListener('DOMContentLoaded', function() {
    const originalOpenModal = window.openModal;
    window.openModal = function(modalId) {
        // Chamar função original
        if (typeof originalOpenModal === 'function') {
            originalOpenModal(modalId);
        } else {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
            }
        }
        
        // Se for modal de combo, limpar lista
        if (modalId === 'comboTicketModal') {
            comboItems = [];
            updateComboItemsList();
        }
    };
});

console.log('✅ Correções de funções de combo carregadas!');
