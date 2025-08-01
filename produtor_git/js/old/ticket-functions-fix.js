// Correções para funções de criação de ingressos
console.log('🎟️ Carregando correções de ingressos...');

// Função para criar ingresso pago
window.createPaidTicket = function() {
    console.log('💰 Criando ingresso pago...');
    
    // Limpar erros anteriores
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    // Coletar dados do formulário
    const title = document.getElementById('paidTicketTitle')?.value?.trim();
    const quantity = document.getElementById('paidTicketQuantity')?.value;
    const price = document.getElementById('paidTicketPrice')?.value;
    const description = document.getElementById('paidTicketDescription')?.value || '';
    const saleStart = document.getElementById('paidSaleStart')?.value;
    const saleEnd = document.getElementById('paidSaleEnd')?.value;
    const minQuantity = document.getElementById('paidMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('paidMaxQuantity')?.value || 5;
    const loteId = document.getElementById('paidTicketLote')?.value;
    const taxaServico = document.getElementById('paidTicketTaxaServico')?.checked;
    
    // Validar campos obrigatórios
    let hasError = false;
    
    if (!title) {
        document.getElementById('paidTicketTitle').classList.add('error-field');
        hasError = true;
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
        document.getElementById('paidTicketQuantity').classList.add('error-field');
        hasError = true;
    }
    
    if (!price || price === 'R$ 0,00') {
        document.getElementById('paidTicketPrice').classList.add('error-field');
        hasError = true;
    }
    
    if (!loteId) {
        document.getElementById('paidTicketLote').classList.add('error-field');
        hasError = true;
    }
    
    if (hasError) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Limpar preço para número
    const cleanPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
    
    // Calcular valores
    let valorComprador = cleanPrice;
    let taxaPlataforma = 0;
    let valorReceber = cleanPrice;
    
    if (taxaServico) {
        taxaPlataforma = cleanPrice * 0.08;
        valorComprador = cleanPrice + taxaPlataforma;
        valorReceber = cleanPrice;
    }
    
    // Criar elemento do ingresso
    const ticketId = 'ticket_' + Date.now();
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketId;
    ticketItem.dataset.ticketType = 'paid';
    ticketItem.dataset.loteId = loteId;
    ticketItem.dataset.description = description;
    ticketItem.dataset.minQuantity = minQuantity;
    ticketItem.dataset.maxQuantity = maxQuantity;
    ticketItem.dataset.saleStart = saleStart;
    ticketItem.dataset.saleEnd = saleEnd;
    ticketItem.dataset.taxaServico = taxaServico ? '1' : '0';
    
    // Nome do lote
    const loteSelect = document.getElementById('paidTicketLote');
    const loteName = loteSelect.options[loteSelect.selectedIndex]?.text || 'Lote não definido';
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-info">
                <div class="ticket-name">${title}</div>
                <div class="ticket-details">
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Quantidade:</span>
                        <span class="ticket-detail-value">${quantity}</span>
                    </span>
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Lote:</span>
                        <span class="ticket-detail-value">${loteName}</span>
                    </span>
                </div>
            </div>
            <div class="ticket-pricing">
                <div class="ticket-price-item">
                    <span class="ticket-price-label">Valor para o comprador:</span>
                    <span class="ticket-buyer-price">R$ ${valorComprador.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="ticket-price-item">
                    <span class="ticket-price-label">Você recebe:</span>
                    <span class="ticket-receive-amount">R$ ${valorReceber.toFixed(2).replace('.', ',')}</span>
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
        type: 'paid',
        title: title,
        quantity: parseInt(quantity),
        price: cleanPrice,
        description: description,
        saleStart: saleStart,
        saleEnd: saleEnd,
        minQuantity: parseInt(minQuantity),
        maxQuantity: parseInt(maxQuantity),
        loteId: loteId,
        taxaServico: taxaServico,
        valorComprador: valorComprador,
        valorReceber: valorReceber,
        taxaPlataforma: taxaPlataforma
    };
    
    // Adicionar à lista
    document.getElementById('ticketList').appendChild(ticketItem);
    
    // Fechar modal
    closeModal('paidTicketModal');
    
    // Limpar formulário
    document.getElementById('paidTicketTitle').value = '';
    document.getElementById('paidTicketQuantity').value = '';
    document.getElementById('paidTicketPrice').value = '';
    document.getElementById('paidTicketDescription').value = '';
    document.getElementById('paidMinQuantity').value = '1';
    document.getElementById('paidMaxQuantity').value = '5';
    document.getElementById('paidTicketLote').value = '';
    
    // Salvar dados do wizard
    if (typeof window.saveWizardData === 'function') {
        window.saveWizardData();
    }
    
    console.log('✅ Ingresso pago criado:', ticketItem.ticketData);
};

// Função para criar ingresso gratuito
window.createFreeTicket = function() {
    console.log('🆓 Criando ingresso gratuito...');
    
    // Limpar erros anteriores
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    // Coletar dados
    const title = document.getElementById('freeTicketTitle')?.value?.trim();
    const quantity = document.getElementById('freeTicketQuantity')?.value;
    const description = document.getElementById('freeTicketDescription')?.value || '';
    const saleStart = document.getElementById('freeSaleStart')?.value;
    const saleEnd = document.getElementById('freeSaleEnd')?.value;
    const minQuantity = document.getElementById('freeMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('freeMaxQuantity')?.value || 5;
    const loteId = document.getElementById('freeTicketLote')?.value;
    
    // Validar
    let hasError = false;
    
    if (!title) {
        document.getElementById('freeTicketTitle').classList.add('error-field');
        hasError = true;
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
        document.getElementById('freeTicketQuantity').classList.add('error-field');
        hasError = true;
    }
    
    if (!loteId) {
        document.getElementById('freeTicketLote').classList.add('error-field');
        hasError = true;
    }
    
    if (hasError) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Criar elemento
    const ticketId = 'ticket_' + Date.now();
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketId;
    ticketItem.dataset.ticketType = 'free';
    ticketItem.dataset.loteId = loteId;
    
    // Nome do lote
    const loteSelect = document.getElementById('freeTicketLote');
    const loteName = loteSelect.options[loteSelect.selectedIndex]?.text || 'Lote não definido';
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-info">
                <div class="ticket-name">${title}</div>
                <div class="ticket-details">
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Quantidade:</span>
                        <span class="ticket-detail-value">${quantity}</span>
                    </span>
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Lote:</span>
                        <span class="ticket-detail-value">${loteName}</span>
                    </span>
                </div>
            </div>
            <div class="ticket-pricing">
                <div class="ticket-price-item">
                    <span class="ticket-price-label">Valor:</span>
                    <span class="ticket-buyer-price">Gratuito</span>
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
    
    // Salvar dados
    ticketItem.ticketData = {
        type: 'free',
        title: title,
        quantity: parseInt(quantity),
        price: 0,
        description: description,
        saleStart: saleStart,
        saleEnd: saleEnd,
        minQuantity: parseInt(minQuantity),
        maxQuantity: parseInt(maxQuantity),
        loteId: loteId
    };
    
    // Adicionar à lista
    document.getElementById('ticketList').appendChild(ticketItem);
    
    // Fechar modal e limpar
    closeModal('freeTicketModal');
    
    document.getElementById('freeTicketTitle').value = '';
    document.getElementById('freeTicketQuantity').value = '';
    document.getElementById('freeTicketDescription').value = '';
    document.getElementById('freeMinQuantity').value = '1';
    document.getElementById('freeMaxQuantity').value = '5';
    document.getElementById('freeTicketLote').value = '';
    
    // Salvar
    if (typeof window.saveWizardData === 'function') {
        window.saveWizardData();
    }
    
    console.log('✅ Ingresso gratuito criado:', ticketItem.ticketData);
};

// Função para remover ingresso
window.removeTicket = function(ticketId) {
    if (confirm('Tem certeza que deseja excluir este ingresso?')) {
        const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
        if (ticketElement) {
            ticketElement.remove();
            
            // Salvar após remover
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
            
            console.log('🗑️ Ingresso removido:', ticketId);
        }
    }
};

// Função para editar ingresso
window.editTicket = function(ticketId) {
    console.log('✏️ Editando ingresso:', ticketId);
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    
    if (!ticketElement || !ticketElement.ticketData) {
        alert('Erro ao editar ingresso');
        return;
    }
    
    const ticketData = ticketElement.ticketData;
    
    // Abrir modal apropriado baseado no tipo
    if (ticketData.type === 'paid') {
        // Popular campos do modal de edição pago
        alert('Função de edição será implementada em breve');
    } else if (ticketData.type === 'free') {
        // Popular campos do modal de edição gratuito
        alert('Função de edição será implementada em breve');
    }
};

// Função para fechar modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
};

// Funções auxiliares para cálculo de valores
window.calcularValoresIngresso = function() {
    const priceInput = document.getElementById('paidTicketPrice');
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    
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
    const taxaInput = document.getElementById('paidTicketTaxaValor');
    const compradorInput = document.getElementById('paidTicketValorComprador');
    const receberInput = document.getElementById('paidTicketValorReceber');
    
    if (taxaInput) taxaInput.value = `R$ ${taxaServico.toFixed(2).replace('.', ',')}`;
    if (compradorInput) compradorInput.value = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    if (receberInput) receberInput.value = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
};

// Função para aplicar máscara monetária
window.aplicarMascaraMonetaria = function(input) {
    let value = input.value;
    
    // Remove tudo exceto números
    value = value.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para ter os centavos
    value = (parseInt(value) / 100).toFixed(2);
    
    // Formata com separadores brasileiros
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Adiciona R$
    input.value = 'R$ ' + value;
    
    // Recalcular valores
    calcularValoresIngresso();
};

console.log('✅ Correções de funções de ingresso carregadas!');
