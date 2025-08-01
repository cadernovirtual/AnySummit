// Correções para edição de ingressos e combo
console.log('🔧 Aplicando correções de edição e combo...');

// 1. FUNÇÃO DE EDIÇÃO DE INGRESSOS
window.editTicket = function(ticketId) {
    console.log('✏️ Editando item:', ticketId);
    
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (!ticketElement || !ticketElement.ticketData) {
        console.error('Item não encontrado');
        return;
    }
    
    const ticketData = ticketElement.ticketData;
    console.log('Dados do item:', ticketData);
    
    if (ticketData.type === 'combo') {
        window.editCombo(ticketId);
    } else if (ticketData.type === 'paid' || ticketData.tipo === 'pago') {
        populateEditPaidTicketModal(ticketData, ticketId);
        openModal('editPaidTicketModal');
    } else if (ticketData.type === 'free' || ticketData.tipo === 'gratuito') {
        populateEditFreeTicketModal(ticketData, ticketId);
        openModal('editFreeTicketModal');
    }
};

// 2. FUNÇÃO PARA EDITAR COMBO
window.editCombo = function(comboId) {
    console.log('📦 Editando combo:', comboId);
    
    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
    if (!comboElement || !comboElement.ticketData) {
        console.error('Combo não encontrado');
        return;
    }
    
    const comboData = comboElement.ticketData;
    populateEditComboModal(comboData, comboId);
    openModal('editComboModal');
};

// 3. POPULAR MODAL DE EDIÇÃO PAGO
function populateEditPaidTicketModal(ticketData, ticketId) {
    console.log('💰 Populando modal de edição pago');
    console.log('Dados recebidos:', ticketData);
    
    const idInput = document.getElementById('editTicketId');
    if (idInput) idInput.value = ticketId;
    
    // Popular campos básicos
    const fields = {
        'editPaidTicketTitle': ticketData.title || '',
        'editPaidTicketQuantity': ticketData.quantity || '',
        'editPaidTicketDescription': ticketData.description || '',
        'editPaidMinLimit': ticketData.minQuantity || 1,
        'editPaidMaxLimit': ticketData.maxQuantity || 5
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
    
    // Preço
    if (document.getElementById('editPaidTicketPrice')) {
        const price = ticketData.price || 0;
        document.getElementById('editPaidTicketPrice').value = `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    
    // Taxa de serviço
    const taxaCheckbox = document.getElementById('editPaidTicketTaxaServico');
    if (taxaCheckbox) {
        taxaCheckbox.checked = ticketData.taxaServico !== false;
    }
    
    // Carregar e setar lote
    const loteSelect = document.getElementById('editPaidTicketLote');
    if (loteSelect) {
        carregarLotesNoSelect(loteSelect);
        setTimeout(() => {
            if (ticketData.loteId) {
                console.log('🎯 Setando lote:', ticketData.loteId);
                loteSelect.value = ticketData.loteId;
            }
        }, 100);
    }
}

// 4. POPULAR MODAL DE EDIÇÃO GRATUITO
function populateEditFreeTicketModal(ticketData, ticketId) {
    console.log('🆓 Populando modal de edição gratuito');
    console.log('Dados recebidos:', ticketData);
    
    const idInput = document.getElementById('editFreeTicketId');
    if (idInput) idInput.value = ticketId;
    
    // Popular campos básicos
    const fields = {
        'editFreeTicketTitle': ticketData.title || '',
        'editFreeTicketQuantity': ticketData.quantity || '',
        'editFreeTicketDescription': ticketData.description || '',
        'editFreeMinLimit': ticketData.minQuantity || 1,
        'editFreeMaxLimit': ticketData.maxQuantity || 5
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
    
    // Carregar e setar lote
    const loteSelect = document.getElementById('editFreeTicketLote');
    if (loteSelect) {
        carregarLotesNoSelect(loteSelect);
        setTimeout(() => {
            if (ticketData.loteId) {
                console.log('🎯 Setando lote gratuito:', ticketData.loteId);
                loteSelect.value = ticketData.loteId;
            }
        }, 100);
    }
}

// 5. FUNÇÃO AUXILIAR PARA CARREGAR LOTES
function carregarLotesNoSelect(selectElement) {
    selectElement.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Buscar lotes no DOM
    const loteItems = document.querySelectorAll('.lote-item');
    console.log('🔍 Lotes encontrados:', loteItems.length);
    
    if (loteItems.length === 0 && window.lotesData) {
        // Usar dados salvos
        if (window.lotesData.porData) {
            window.lotesData.porData.forEach((lote, index) => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome || `Lote ${index + 1}`;
                selectElement.appendChild(option);
            });
        }
        if (window.lotesData.porPercentual) {
            window.lotesData.porPercentual.forEach((lote, index) => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome || `Lote Percentual ${index + 1}`;
                selectElement.appendChild(option);
            });
        }
    } else {
        // Usar elementos do DOM
        loteItems.forEach((item, index) => {
            const loteId = item.getAttribute('data-id');
            const loteNome = item.querySelector('.lote-item-name')?.textContent || `Lote ${index + 1}`;
            
            const option = document.createElement('option');
            option.value = loteId;
            option.textContent = loteNome;
            selectElement.appendChild(option);
        });
    }
}

// 6. POPULAR TIPOS DE INGRESSO PARA COMBO
window.populateComboTicketSelect = function(loteId) {
    console.log('📦 Populando tipos de ingresso para combo - Lote:', loteId);
    
    const select = document.getElementById('comboTicketTypeSelect');
    if (!select) {
        console.error('Select comboTicketTypeSelect não encontrado!');
        return;
    }
    
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    if (!loteId) {
        select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        return;
    }
    
    // Buscar ingressos do lote
    const ticketItems = document.querySelectorAll('.ticket-item');
    let hasTickets = false;
    
    ticketItems.forEach(item => {
        // Verificar se é do lote correto e não é combo
        if (item.dataset.loteId == loteId && item.dataset.ticketType !== 'combo') {
            hasTickets = true;
            
            const ticketData = item.ticketData || {};
            const ticketName = ticketData.title || item.querySelector('.ticket-name')?.textContent || 'Ingresso';
            const ticketPrice = ticketData.price || 0;
            const ticketType = ticketData.type || item.dataset.ticketType || 'paid';
            const ticketId = item.dataset.ticketId;
            
            const option = document.createElement('option');
            option.value = ticketId;
            option.dataset.price = ticketPrice;
            option.dataset.type = ticketType;
            option.dataset.title = ticketName;
            
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
    
    console.log(`✅ ${select.options.length - 1} ingressos adicionados ao select`);
};

// 7. FUNÇÃO PARA ATUALIZAR INGRESSO PAGO
window.updatePaidTicket = function() {
    console.log('💾 Salvando alterações do ingresso pago...');
    
    const ticketId = document.getElementById('editTicketId')?.value;
    if (!ticketId) {
        alert('Erro ao identificar o ingresso');
        return;
    }
    
    const title = document.getElementById('editPaidTicketTitle')?.value;
    const quantity = document.getElementById('editPaidTicketQuantity')?.value;
    const price = document.getElementById('editPaidTicketPrice')?.value;
    const loteId = document.getElementById('editPaidTicketLote')?.value;
    
    if (!title || !quantity || !price) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (ticketElement && ticketElement.ticketData) {
        // Atualizar dados
        ticketElement.ticketData.title = title;
        ticketElement.ticketData.quantity = parseInt(quantity);
        ticketElement.ticketData.price = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
        ticketElement.ticketData.loteId = loteId;
        ticketElement.ticketData.description = document.getElementById('editPaidTicketDescription')?.value || '';
        ticketElement.ticketData.minQuantity = parseInt(document.getElementById('editPaidMinLimit')?.value) || 1;
        ticketElement.ticketData.maxQuantity = parseInt(document.getElementById('editPaidMaxLimit')?.value) || 5;
        ticketElement.ticketData.taxaServico = document.getElementById('editPaidTicketTaxaServico')?.checked;
        
        // Atualizar dataset
        ticketElement.dataset.loteId = loteId;
        
        // Atualizar visual
        const nameEl = ticketElement.querySelector('.ticket-name');
        if (nameEl) nameEl.textContent = title;
        
        const qtyEl = ticketElement.querySelector('.ticket-detail-value');
        if (qtyEl) qtyEl.textContent = quantity;
        
        // Atualizar nome do lote
        const loteSelect = document.getElementById('editPaidTicketLote');
        if (loteSelect) {
            const loteText = loteSelect.options[loteSelect.selectedIndex]?.text || 'Lote não definido';
            const loteSpans = ticketElement.querySelectorAll('.ticket-detail-value');
            loteSpans.forEach(span => {
                if (span.previousElementSibling?.textContent.includes('Lote:')) {
                    span.textContent = loteText;
                }
            });
        }
    }
    
    // Salvar no wizard
    if (typeof window.saveWizardData === 'function') {
        window.saveWizardData();
    }
    
    closeModal('editPaidTicketModal');
    console.log('✅ Ingresso atualizado');
};

// 8. FUNÇÃO PARA ATUALIZAR INGRESSO GRATUITO
window.updateFreeTicket = function() {
    console.log('💾 Salvando alterações do ingresso gratuito...');
    
    const ticketId = document.getElementById('editFreeTicketId')?.value;
    if (!ticketId) {
        alert('Erro ao identificar o ingresso');
        return;
    }
    
    const title = document.getElementById('editFreeTicketTitle')?.value;
    const quantity = document.getElementById('editFreeTicketQuantity')?.value;
    const loteId = document.getElementById('editFreeTicketLote')?.value;
    
    if (!title || !quantity) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (ticketElement && ticketElement.ticketData) {
        // Atualizar dados
        ticketElement.ticketData.title = title;
        ticketElement.ticketData.quantity = parseInt(quantity);
        ticketElement.ticketData.loteId = loteId;
        ticketElement.ticketData.description = document.getElementById('editFreeTicketDescription')?.value || '';
        ticketElement.ticketData.minQuantity = parseInt(document.getElementById('editFreeMinLimit')?.value) || 1;
        ticketElement.ticketData.maxQuantity = parseInt(document.getElementById('editFreeMaxLimit')?.value) || 5;
        
        // Atualizar dataset
        ticketElement.dataset.loteId = loteId;
        
        // Atualizar visual
        const nameEl = ticketElement.querySelector('.ticket-name');
        if (nameEl) nameEl.textContent = title;
        
        const qtyEl = ticketElement.querySelector('.ticket-detail-value');
        if (qtyEl) qtyEl.textContent = quantity;
        
        // Atualizar nome do lote
        const loteSelect = document.getElementById('editFreeTicketLote');
        if (loteSelect) {
            const loteText = loteSelect.options[loteSelect.selectedIndex]?.text || 'Lote não definido';
            const loteSpans = ticketElement.querySelectorAll('.ticket-detail-value');
            loteSpans.forEach(span => {
                if (span.previousElementSibling?.textContent.includes('Lote:')) {
                    span.textContent = loteText;
                }
            });
        }
    }
    
    // Salvar no wizard
    if (typeof window.saveWizardData === 'function') {
        window.saveWizardData();
    }
    
    closeModal('editFreeTicketModal');
    console.log('✅ Ingresso gratuito atualizado');
};

// 9. POPULAR MODAL DE EDIÇÃO DE COMBO
window.populateEditComboModal = function(comboData, comboId) {
    console.log('📦 Populando modal de edição de combo', comboData);
    
    const idInput = document.getElementById('editComboId');
    if (idInput) idInput.value = comboId;
    
    // Popular campos básicos
    const fields = {
        'editComboTitle': comboData.title || '',
        'editComboDescription': comboData.description || '',
        'editComboQuantity': comboData.quantity || ''
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
    
    // Preço
    if (document.getElementById('editComboPrice')) {
        const price = comboData.price || 0;
        document.getElementById('editComboPrice').value = `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    
    // Carregar e setar lote
    const loteSelect = document.getElementById('editComboLote');
    if (loteSelect) {
        carregarLotesNoSelect(loteSelect);
        
        setTimeout(() => {
            if (comboData.loteId) {
                console.log('🎯 Setando lote do combo:', comboData.loteId);
                loteSelect.value = comboData.loteId;
                // Disparar evento para popular ingressos
                loteSelect.dispatchEvent(new Event('change'));
            }
        }, 100);
    }
    
    // Popular itens do combo
    const comboItems = comboData.items || comboData.comboItems;
    if (comboItems && Array.isArray(comboItems)) {
        console.log('📦 Carregando itens do combo:', comboItems);
        setTimeout(() => {
            const itemsList = document.getElementById('editComboItemsList');
            if (itemsList) {
                itemsList.innerHTML = '';
                comboItems.forEach(item => {
                    if (window.addEditComboItem) {
                        window.addEditComboItem(item.ticketId, item.quantity);
                    }
                });
            }
        }, 500);
    }
};

// 10. LISTENERS
document.addEventListener('DOMContentLoaded', function() {
    // Listener para mudança de lote no combo
    const comboLoteSelect = document.getElementById('comboTicketLote');
    if (comboLoteSelect) {
        comboLoteSelect.addEventListener('change', function() {
            console.log('🔄 Lote do combo alterado:', this.value);
            populateComboTicketSelect(this.value);
        });
    }
    
    // Listener para mudança de lote no combo de edição
    const editComboLoteSelect = document.getElementById('editComboLote');
    if (editComboLoteSelect) {
        editComboLoteSelect.addEventListener('change', function() {
            console.log('🔄 Lote do combo de edição alterado:', this.value);
            if (window.populateEditComboTicketSelect) {
                window.populateEditComboTicketSelect(this.value);
            }
        });
    }
});

console.log('✅ Correções de edição aplicadas - Sistema completo!');
// Adicionar ao final do edit-combo-fixes.js

// FUNÇÃO PARA ADICIONAR ITEM AO COMBO DE EDIÇÃO
window.addEditComboItem = function(ticketId, quantity = 1) {
    console.log('➕ Adicionando item ao combo de edição:', ticketId, quantity);
    
    const itemsList = document.getElementById('editComboItemsList');
    if (!itemsList) {
        console.error('Lista de itens do combo não encontrada');
        return;
    }
    
    // Buscar dados do ticket
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (!ticketElement || !ticketElement.ticketData) {
        console.error('Ticket não encontrado:', ticketId);
        return;
    }
    
    const ticketData = ticketElement.ticketData;
    const itemId = 'edit_combo_item_' + Date.now();
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'combo-item';
    itemDiv.id = itemId;
    itemDiv.dataset.ticketId = ticketId;
    itemDiv.dataset.price = ticketData.price || 0;
    
    itemDiv.innerHTML = `
        <div class="combo-item-info">
            <span class="combo-item-name">${ticketData.title}</span>
            <div class="combo-item-controls">
                <label>Qtd:</label>
                <input type="number" 
                       class="combo-item-quantity" 
                       value="${quantity}" 
                       min="1" 
                       onchange="updateEditComboTotal()">
                <button class="btn-remove" onclick="removeEditComboItem('${itemId}')">Remover</button>
            </div>
        </div>
    `;
    
    itemsList.appendChild(itemDiv);
    
    if (window.updateEditComboTotal) {
        window.updateEditComboTotal();
    }
};

// FUNÇÃO PARA REMOVER ITEM DO COMBO DE EDIÇÃO
window.removeEditComboItem = function(itemId) {
    const item = document.getElementById(itemId);
    if (item) {
        item.remove();
        if (window.updateEditComboTotal) {
            window.updateEditComboTotal();
        }
    }
};

// FUNÇÃO PARA ATUALIZAR TOTAL DO COMBO DE EDIÇÃO
window.updateEditComboTotal = function() {
    console.log('💰 Atualizando total do combo de edição');
    
    const items = document.querySelectorAll('#editComboItemsList .combo-item');
    let total = 0;
    
    items.forEach(item => {
        const price = parseFloat(item.dataset.price) || 0;
        const quantity = parseInt(item.querySelector('.combo-item-quantity').value) || 1;
        total += price * quantity;
    });
    
    const suggestedPriceEl = document.getElementById('editComboSuggestedPrice');
    if (suggestedPriceEl) {
        suggestedPriceEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
};

// FUNÇÃO PARA ADICIONAR ITEM VIA BOTÃO
window.addItemToEditCombo = function() {
    console.log('🎫 Adicionando item ao combo de edição via botão');
    
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select || !select.value) {
        alert('Selecione um tipo de ingresso');
        return;
    }
    
    const ticketId = select.value;
    
    // Verificar se já existe
    const existingItem = document.querySelector(`#editComboItemsList [data-ticket-id="${ticketId}"]`);
    if (existingItem) {
        alert('Este ingresso já foi adicionado ao combo');
        return;
    }
    
    // Adicionar item
    window.addEditComboItem(ticketId, 1);
    
    // Limpar seleção
    select.value = '';
};

// FUNÇÃO PARA POPULAR SELECT DE EDIÇÃO DE COMBO
window.populateEditComboTicketSelect = function(loteId) {
    console.log('📦 Populando tipos de ingresso para edição de combo - Lote:', loteId);
    
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select) {
        console.error('Select editComboTicketTypeSelect não encontrado!');
        return;
    }
    
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    if (!loteId) {
        select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        return;
    }
    
    // Buscar ingressos do lote
    const ticketItems = document.querySelectorAll('.ticket-item');
    let hasTickets = false;
    
    ticketItems.forEach(item => {
        // Verificar se é do lote correto e não é combo
        if (item.dataset.loteId == loteId && item.dataset.ticketType !== 'combo') {
            hasTickets = true;
            
            const ticketData = item.ticketData || {};
            const ticketName = ticketData.title || item.querySelector('.ticket-name')?.textContent || 'Ingresso';
            const ticketPrice = ticketData.price || 0;
            const ticketType = ticketData.type || item.dataset.ticketType || 'paid';
            const ticketId = item.dataset.ticketId;
            
            const option = document.createElement('option');
            option.value = ticketId;
            option.dataset.price = ticketPrice;
            option.dataset.type = ticketType;
            option.dataset.title = ticketName;
            
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

// FUNÇÃO PARA ATUALIZAR COMBO
window.updateComboTicket = function() {
    console.log('💾 Salvando alterações do combo...');
    
    const comboId = document.getElementById('editComboId')?.value;
    if (!comboId) {
        alert('Erro ao identificar o combo');
        return;
    }
    
    const title = document.getElementById('editComboTitle')?.value;
    const quantity = document.getElementById('editComboQuantity')?.value;
    const price = document.getElementById('editComboPrice')?.value;
    const loteId = document.getElementById('editComboLote')?.value;
    const description = document.getElementById('editComboDescription')?.value;
    
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
        items.push({ ticketId, quantity });
    });
    
    if (items.length === 0) {
        alert('Adicione pelo menos um ingresso ao combo');
        return;
    }
    
    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
    if (comboElement && comboElement.ticketData) {
        // Atualizar dados
        comboElement.ticketData.title = title;
        comboElement.ticketData.quantity = parseInt(quantity);
        comboElement.ticketData.price = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
        comboElement.ticketData.loteId = loteId;
        comboElement.ticketData.description = description;
        comboElement.ticketData.items = items;
        
        // Atualizar dataset
        comboElement.dataset.loteId = loteId;
        
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
    
    // Salvar no wizard
    if (typeof window.saveWizardData === 'function') {
        window.saveWizardData();
    }
    
    closeModal('editComboModal');
    console.log('✅ Combo atualizado');
};

console.log('✅ Funções de combo de edição carregadas!');
