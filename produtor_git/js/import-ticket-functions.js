// =====================================================
// IMPORTAÇÃO DAS FUNÇÕES DE INGRESSOS - ANYSUMMIT
// =====================================================
// Este arquivo importa as funções corretas dos arquivos originais

console.log('📦 Importando funções de ingressos...');

// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================
window.lotesCarregados = [];
window.taxaServicoPadrao = 8;
window.loteAtualPercentual = null;
window.comboItems = [];

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

// Formatar moeda
window.formatarMoeda = function(valor) {
    valor = parseFloat(valor) || 0;
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Parsear valor monetário
window.parsearValorMonetario = function(valor) {
    if (!valor) return 0;
    valor = valor.replace(/[^\d,.-]/g, '');
    valor = valor.replace(',', '.');
    return parseFloat(valor) || 0;
};

// =====================================================
// CÁLCULO DE VALORES
// =====================================================
window.calcularValoresIngresso = function() {
    console.log('💰 Calculando valores do ingresso...');
    
    const precoInput = document.getElementById('paidTicketPrice');
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    const taxaValorInput = document.getElementById('paidTicketTaxaValor');
    const valorCompradorInput = document.getElementById('paidTicketValorComprador');
    const valorReceberInput = document.getElementById('paidTicketValorReceber');
    
    if (!precoInput) return;
    
    const precoVenda = parsearValorMonetario(precoInput.value);
    const cobrarTaxa = taxaCheckbox ? taxaCheckbox.checked : true;
    
    let taxaValor = 0;
    let valorComprador = 0;
    let valorReceber = 0;
    
    if (precoVenda > 0) {
        if (cobrarTaxa) {
            taxaValor = precoVenda * (window.taxaServicoPadrao / 100);
            valorComprador = precoVenda + taxaValor;
            valorReceber = precoVenda;
        } else {
            taxaValor = precoVenda * (window.taxaServicoPadrao / 100);
            valorReceber = precoVenda - taxaValor;
            valorComprador = precoVenda;
        }
    }
    
    if (taxaValorInput) taxaValorInput.value = formatarMoeda(taxaValor);
    if (valorCompradorInput) valorCompradorInput.value = formatarMoeda(valorComprador);
    if (valorReceberInput) valorReceberInput.value = formatarMoeda(valorReceber);
};

// =====================================================
// CARREGAR LOTES
// =====================================================
window.carregarLotesIngressoPago = function() {
    console.log('📋 Carregando lotes para ingresso pago...');
    
    const selectLote = document.getElementById('paidTicketLote');
    if (!selectLote) return;
    
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Carregar lotes do DOM
    const loteCards = document.querySelectorAll('.lote-card');
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index}`;
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = loteNome;
        selectLote.appendChild(option);
    });
    
    console.log(`✅ ${loteCards.length} lotes carregados`);
};

window.carregarLotesNoModalFree = function() {
    console.log('📋 Carregando lotes para ingresso gratuito...');
    
    const selectLote = document.getElementById('freeTicketLote');
    if (!selectLote) return;
    
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Carregar lotes do DOM
    const loteCards = document.querySelectorAll('.lote-card');
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index}`;
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = loteNome;
        selectLote.appendChild(option);
    });
    
    console.log(`✅ ${loteCards.length} lotes carregados`);
};

window.carregarLotesNoModalCombo = function() {
    console.log('📋 Carregando lotes para combo...');
    
    const selectLote = document.getElementById('comboTicketLote');
    if (!selectLote) return;
    
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Carregar lotes do DOM
    const loteCards = document.querySelectorAll('.lote-card');
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index}`;
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = loteNome;
        selectLote.appendChild(option);
    });
};

// =====================================================
// CRIAR INGRESSOS
// =====================================================
window.createPaidTicket = function() {
    console.log('💳 Criando ingresso pago...');
    
    // Limpar erros
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    const title = document.getElementById('paidTicketTitle')?.value;
    const quantity = document.getElementById('paidTicketQuantity')?.value;
    const price = document.getElementById('paidTicketPrice')?.value;
    const description = document.getElementById('paidTicketDescription')?.value || '';
    const loteId = document.getElementById('paidTicketLote')?.value;
    const cobrarTaxa = document.getElementById('paidTicketTaxaServico')?.checked ? 1 : 0;
    
    // Validação
    let hasError = false;
    
    if (!title) {
        document.getElementById('paidTicketTitle').classList.add('error-field');
        hasError = true;
    }
    if (!quantity) {
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
    
    // Criar ticket
    const preco = parsearValorMonetario(price);
    const taxa = preco * (window.taxaServicoPadrao / 100);
    const valorComprador = cobrarTaxa ? preco + taxa : preco;
    const valorReceber = cobrarTaxa ? preco : preco - taxa;
    
    const ticketData = {
        id: `ticket_${Date.now()}`,
        tipo: 'pago',
        titulo: title,
        quantidade: parseInt(quantity),
        preco: preco,
        descricao: description,
        loteId: loteId,
        taxaServico: cobrarTaxa,
        taxaPlataforma: taxa,
        valorComprador: valorComprador,
        valorReceber: valorReceber
    };
    
    // Adicionar ao DOM
    addTicketToList(ticketData);
    
    // Fechar modal
    closeModal('paidTicketModal');
    
    // Salvar dados
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
};

window.createFreeTicket = function() {
    console.log('🎟️ Criando ingresso gratuito...');
    
    // Limpar erros
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    const title = document.getElementById('freeTicketTitle')?.value;
    const quantity = document.getElementById('freeTicketQuantity')?.value;
    const description = document.getElementById('freeTicketDescription')?.value || '';
    const loteId = document.getElementById('freeTicketLote')?.value;
    
    // Validação
    let hasError = false;
    
    if (!title) {
        document.getElementById('freeTicketTitle').classList.add('error-field');
        hasError = true;
    }
    if (!quantity) {
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
    
    // Criar ticket
    const ticketData = {
        id: `ticket_${Date.now()}`,
        tipo: 'gratuito',
        titulo: title,
        quantidade: parseInt(quantity),
        preco: 0,
        descricao: description,
        loteId: loteId,
        taxaServico: false,
        taxaPlataforma: 0,
        valorComprador: 0,
        valorReceber: 0
    };
    
    // Adicionar ao DOM
    addTicketToList(ticketData);
    
    // Fechar modal
    closeModal('freeTicketModal');
    
    // Salvar dados
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
};

// =====================================================
// ADICIONAR TICKET À LISTA
// =====================================================
function addTicketToList(ticketData) {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;
    
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketData.id;
    ticketItem.dataset.ticketType = ticketData.tipo;
    ticketItem.dataset.loteId = ticketData.loteId;
    ticketItem.ticketData = ticketData;
    
    if (ticketData.tipo === 'gratuito') {
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-name">${ticketData.titulo}</div>
                    <div class="ticket-details">
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Quantidade:</span>
                            <span class="ticket-detail-value">${ticketData.quantidade}</span>
                        </span>
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Lote:</span>
                            <span class="ticket-detail-value">${ticketData.loteId}</span>
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
                    <button class="btn-icon" onclick="editTicket('${ticketData.id}')" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="removeTicket('${ticketData.id}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    } else {
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-name">${ticketData.titulo}</div>
                    <div class="ticket-details">
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Quantidade:</span>
                            <span class="ticket-detail-value">${ticketData.quantidade}</span>
                        </span>
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Lote:</span>
                            <span class="ticket-detail-value">${ticketData.loteId}</span>
                        </span>
                    </div>
                </div>
                <div class="ticket-pricing">
                    <div class="ticket-price-item">
                        <span class="ticket-price-label">Valor para o comprador:</span>
                        <span class="ticket-buyer-price">${formatarMoeda(ticketData.valorComprador)}</span>
                    </div>
                    <div class="ticket-price-item">
                        <span class="ticket-price-label">Você recebe:</span>
                        <span class="ticket-receive-amount">${formatarMoeda(ticketData.valorReceber)}</span>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ticketData.id}')" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="removeTicket('${ticketData.id}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    }
    
    ticketList.appendChild(ticketItem);
    console.log('✅ Ingresso adicionado à lista');
}

// =====================================================
// INICIALIZAR MÁSCARA DE PREÇO
// =====================================================
window.initPriceInput = function() {
    console.log('💵 Inicializando máscara de preço...');
    
    const priceInput = document.getElementById('paidTicketPrice');
    if (!priceInput) return;
    
    // Limpar valor inicial
    priceInput.value = '';
    
    // Adicionar eventos
    priceInput.addEventListener('input', function(e) {
        let value = e.target.value;
        
        // Remove tudo exceto números
        value = value.replace(/\D/g, '');
        
        // Converte para número
        let numValue = parseInt(value) || 0;
        
        // Divide por 100 para ter centavos
        numValue = numValue / 100;
        
        // Formata como moeda
        e.target.value = formatarMoeda(numValue);
        
        // Calcular valores
        calcularValoresIngresso();
    });
    
    // Evento de change
    priceInput.addEventListener('change', calcularValoresIngresso);
    
    // Taxa de serviço
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    if (taxaCheckbox) {
        taxaCheckbox.addEventListener('change', calcularValoresIngresso);
    }
};

// =====================================================
// REMOVER E EDITAR TICKETS
// =====================================================
window.removeTicket = function(ticketId) {
    if (confirm('Tem certeza que deseja excluir este ingresso?')) {
        const ticketItem = document.querySelector(`[data-ticket-id="${ticketId}"]`);
        if (ticketItem) {
            ticketItem.remove();
            
            // Salvar dados
            if (window.AnySummit && window.AnySummit.Storage) {
                window.AnySummit.Storage.saveWizardData();
            }
        }
    }
};

window.editTicket = function(ticketId) {
    console.log('✏️ Editando ticket:', ticketId);
    // Implementar edição se necessário
    alert('Função de edição em desenvolvimento');
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================
console.log('✅ Funções de ingressos importadas com sucesso!');

// Garantir que as funções globais estejam disponíveis
window.carregarLotesNoModal = window.carregarLotesIngressoPago;