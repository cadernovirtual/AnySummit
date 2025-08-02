// Adicionar ao edit-combo-fixes.js ou criar novo arquivo
// Funções complementares para edição de combo

// Função para popular tipos de ingresso no modal de edição
window.populateEditComboTicketSelect = function(loteId) {
    console.log('📦 Populando tipos de ingresso para edição de combo - Lote:', loteId);
    
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select) {
        console.error('Select editComboTicketTypeSelect não encontrado!');
        return;
    }
    
    // Limpar opções
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    if (!loteId) {
        select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        return;
    }
    
    // Buscar todos os ticket-items do lote
    const ticketItems = document.querySelectorAll('.ticket-item');
    let hasTickets = false;
    
    ticketItems.forEach(item => {
        // Verificar se é do lote correto e não é combo
        if (item.dataset.loteId === loteId && item.dataset.ticketType !== 'combo') {
            hasTickets = true;
            
            // Obter dados do ticket
            const ticketData = item.ticketData || {};
            const ticketName = ticketData.title || item.querySelector('.ticket-name')?.textContent || 'Ingresso';
            const ticketPrice = ticketData.price || 0;
            const ticketType = ticketData.type || item.dataset.ticketType || 'paid';
            const ticketId = item.dataset.ticketId;
            
            // Criar option
            const option = document.createElement('option');
            option.value = ticketId;
            option.dataset.price = ticketPrice;
            option.dataset.type = ticketType;
            option.dataset.title = ticketName;
            
            // Texto do option
            if (ticketType === 'free' || ticketPrice === 0) {
                option.textContent = `${ticketName} (Gratuito)`;
            } else {
                option.textContent = `${ticketName} (R$ ${ticketPrice.toFixed(2).replace('.', ',')})`;
            }
            
            select.appendChild(option);
        }
    });
    
    if (!hasTickets) {
        select.innerHTML = '<option value="">Nenhum ingresso neste lote. Crie ingressos primeiro.</option>';
    }
    
    console.log(`✅ ${select.options.length - 1} ingressos adicionados ao select de edição`);
};

// Função para atualizar datas do combo ao mudar lote
window.updateEditComboTicketDates = function() {
    console.log('📅 Atualizando datas do combo de edição');
    
    const loteSelect = document.getElementById('editComboLote');
    if (!loteSelect || !loteSelect.value) return;
    
    const loteId = loteSelect.value;
    
    // Popular tipos de ingresso do lote
    window.populateEditComboTicketSelect(loteId);
    
    // Buscar dados do lote selecionado
    const loteCard = document.querySelector(`[data-lote-id="${loteId}"]`);
    if (loteCard) {
        // Extrair datas do lote se for por data
        if (loteCard.classList.contains('por-data')) {
            const dataInicio = loteCard.querySelector('.lote-data-inicio')?.textContent;
            const dataFim = loteCard.querySelector('.lote-data-fim')?.textContent;
            
            // Converter para formato datetime-local se necessário
            if (dataInicio && document.getElementById('editComboSaleStart')) {
                // Implementar conversão se necessário
            }
            if (dataFim && document.getElementById('editComboSaleEnd')) {
                // Implementar conversão se necessário
            }
        }
    }
};

// Função para carregar lotes no modal de edição de combo
window.carregarLotesNoModalEditCombo = function() {
    console.log('📋 Carregando lotes no modal de edição de combo...');
    
    const selectLote = document.getElementById('editComboLote');
    if (!selectLote) {
        console.error('Select de lotes não encontrado no modal de edição de combo!');
        return;
    }
    
    // Limpar opções existentes
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Buscar lotes da página
    const loteCards = document.querySelectorAll('.lote-card');
    
    if (loteCards.length === 0) {
        selectLote.innerHTML = '<option value="">Nenhum lote criado</option>';
        return;
    }
    
    loteCards.forEach((card, index) => {
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        const loteId = card.getAttribute('data-lote-id') || `lote_${index}`;
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = loteNome;
        
        selectLote.appendChild(option);
    });
    
    console.log(`✅ ${loteCards.length} lotes carregados no select de edição de combo`);
};

// Adicionar listener para mudança de lote no modal de edição
document.addEventListener('DOMContentLoaded', function() {
    const editComboLoteSelect = document.getElementById('editComboLote');
    if (editComboLoteSelect) {
        editComboLoteSelect.addEventListener('change', function() {
            console.log('🔄 Lote do combo de edição alterado:', this.value);
            window.updateEditComboTicketDates();
        });
    }
});

// Função para calcular valores do combo de edição
window.calcularValoresEditCombo = function() {
    console.log('💵 Calculando valores do combo de edição');
    
    const priceInput = document.getElementById('editComboPrice');
    const taxaCheckbox = document.getElementById('editComboTaxaServico');
    
    if (!priceInput) return;
    
    // Limpar máscara para obter valor numérico
    const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
    const valorCombo = parseFloat(valorLimpo) || 0;
    
    let taxaPlataforma = 0;
    let valorComprador = valorCombo;
    let valorReceber = valorCombo;
    
    if (taxaCheckbox && taxaCheckbox.checked) {
        taxaPlataforma = valorCombo * 0.08; // 8% de taxa
        valorComprador = valorCombo + taxaPlataforma;
        valorReceber = valorCombo;
    }
    
    // Atualizar campos de exibição
    const taxaDisplay = document.getElementById('editComboTaxaPlataforma');
    if (taxaDisplay) {
        taxaDisplay.textContent = `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`;
    }
    
    const compradorDisplay = document.getElementById('editComboValorComprador');
    if (compradorDisplay) {
        compradorDisplay.textContent = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    }
    
    const receberDisplay = document.getElementById('editComboValorReceber');
    if (receberDisplay) {
        receberDisplay.textContent = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
    }
};

// Função para atualizar combo
window.updateComboTicket = function() {
    console.log('💾 Salvando alterações do combo...');
    
    const comboId = document.getElementById('editComboId')?.value;
    if (!comboId) {
        alert('Erro ao identificar o combo');
        return;
    }
    
    // Coletar dados
    const title = document.getElementById('editComboTitle')?.value;
    const quantity = document.getElementById('editComboQuantity')?.value;
    const price = document.getElementById('editComboPrice')?.value;
    const loteId = document.getElementById('editComboLote')?.value;
    const description = document.getElementById('editComboDescription')?.value;
    
    // Validar
    if (!title || !quantity || !price || !loteId) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    // Coletar itens do combo
    const items = [];
    const comboItems = document.querySelectorAll('#editComboItemsList .combo-item');
    
    comboItems.forEach(item => {
        const ticketId = item.dataset.ticketId;
        const quantity = parseInt(item.querySelector('.combo-item-quantity').value) || 1;
        
        items.push({
            ticketId: ticketId,
            quantity: quantity
        });
    });
    
    if (items.length === 0) {
        alert('Adicione pelo menos um ingresso ao combo');
        return;
    }
    
    // Atualizar elemento
    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
    if (comboElement) {
        // Atualizar dados salvos
        if (comboElement.ticketData) {
            comboElement.ticketData.title = title;
            comboElement.ticketData.quantity = parseInt(quantity);
            comboElement.ticketData.price = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
            comboElement.ticketData.loteId = loteId;
            comboElement.ticketData.description = description;
            comboElement.ticketData.items = items;
        }
        
        // Atualizar visual
        const nameEl = comboElement.querySelector('.ticket-name');
        if (nameEl) nameEl.textContent = title;
        
        const qtyEl = comboElement.querySelector('.ticket-detail-value');
        if (qtyEl) qtyEl.textContent = quantity;
        
        // Atualizar número de ingressos no combo
        const totalIngressos = items.reduce((sum, item) => sum + item.quantity, 0);
        const comboLabel = comboElement.querySelector('.ticket-detail-label');
        if (comboLabel && comboLabel.textContent.includes('Combo com')) {
            comboLabel.textContent = `Combo com ${totalIngressos} ingressos`;
        }
    }
    
    // Salvar dados do wizard
    if (typeof window.saveWizardData === 'function') {
        window.saveWizardData();
    }
    
    closeModal('editComboModal');
    console.log('✅ Combo atualizado');
};

console.log('✅ Funções complementares de edição de combo carregadas');
