// =====================================================
// SISTEMA DE INGRESSOS PAGOS - ANYSUMMIT
// =====================================================
// Importado de: ingressos-pagos.js

console.log('💰 Importando sistema de ingressos pagos...');

// Variáveis globais
window.taxaServicoPadrao = 8;

// Funções utilitárias
window.formatarMoeda = function(valor) {
    valor = parseFloat(valor) || 0;
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

window.parsearValorMonetario = function(valor) {
    if (!valor) return 0;
    valor = valor.toString().replace(/[^\d,.-]/g, '');
    valor = valor.replace(',', '.');
    return parseFloat(valor) || 0;
};

// Calcular valores do ingresso
window.calcularValoresIngresso = function() {
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
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorComprador = precoVenda + taxaValor;
            valorReceber = precoVenda;
        } else {
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorReceber = precoVenda - taxaValor;
            valorComprador = precoVenda;
        }
    }
    
    if (taxaValorInput) taxaValorInput.value = formatarMoeda(taxaValor);
    if (valorCompradorInput) valorCompradorInput.value = formatarMoeda(valorComprador);
    if (valorReceberInput) valorReceberInput.value = formatarMoeda(valorReceber);
};

// Carregar lotes no modal
window.carregarLotesIngressoPago = function() {
    console.log('📋 Carregando lotes para ingresso pago...');
    
    const selectLote = document.getElementById('paidTicketLote');
    if (!selectLote) return;
    
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Carregar de window.lotesData
    if (window.lotesData) {
        // Lotes por data
        if (window.lotesData.porData) {
            window.lotesData.porData.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome;
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
                option.textContent = `${lote.nome} (${lote.percentual}%)`;
                option.setAttribute('data-inicio', lote.dataInicio);
                option.setAttribute('data-fim', lote.dataFim);
                selectLote.appendChild(option);
            });
        }
    }
};

// Criar ingresso pago
window.createPaidTicket = function() {
    console.log('💳 Criando ingresso pago...');
    
    // Limpar erros
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    const title = document.getElementById('paidTicketTitle')?.value;
    const quantity = document.getElementById('paidTicketQuantity')?.value;
    const price = document.getElementById('paidTicketPrice')?.value;
    const description = document.getElementById('paidTicketDescription')?.value || '';
    const loteId = document.getElementById('paidTicketLote')?.value;
    const saleStart = document.getElementById('paidSaleStart')?.value;
    const saleEnd = document.getElementById('paidSaleEnd')?.value;
    const minQuantity = document.getElementById('paidMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('paidMaxQuantity')?.value || 10;
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
    
    // Criar dados do ticket
    const preco = parsearValorMonetario(price);
    const taxa = preco * (taxaServicoPadrao / 100);
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
        saleStart: saleStart,
        saleEnd: saleEnd,
        minQuantity: parseInt(minQuantity),
        maxQuantity: parseInt(maxQuantity),
        taxaServico: cobrarTaxa,
        taxaPlataforma: taxa,
        valorComprador: valorComprador,
        valorReceber: valorReceber
    };
    
    // Adicionar ao DOM
    addPaidTicketToList(ticketData);
    
    // Fechar modal
    if (window.closeModal) {
        window.closeModal('paidTicketModal');
    }
    
    // Salvar dados
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
    
    // Limpar campos
    document.getElementById('paidTicketTitle').value = '';
    document.getElementById('paidTicketPrice').value = '';
    document.getElementById('paidTicketQuantity').value = '1';
    document.getElementById('paidTicketDescription').value = '';
};

// Adicionar ingresso pago à lista
function addPaidTicketToList(ticketData) {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;
    
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketData.id;
    ticketItem.dataset.ticketType = ticketData.tipo;
    ticketItem.dataset.loteId = ticketData.loteId;
    ticketItem.ticketData = ticketData;
    
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
                        <span class="ticket-detail-value">${getLoteNome(ticketData.loteId)}</span>
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
    
    ticketList.appendChild(ticketItem);
}

// Obter nome do lote
function getLoteNome(loteId) {
    if (window.lotesData) {
        // Procurar nos lotes por data
        const loteData = window.lotesData.porData.find(l => l.id === loteId);
        if (loteData) return loteData.nome;
        
        // Procurar nos lotes percentuais
        const lotePerc = window.lotesData.porPercentual.find(l => l.id === loteId);
        if (lotePerc) return `${lotePerc.nome} (${lotePerc.percentual}%)`;
    }
    return loteId;
}

// Inicializar máscara de preço
window.initPriceInput = function() {
    const priceInput = document.getElementById('paidTicketPrice');
    if (!priceInput) return;
    
    priceInput.value = '';
    
    priceInput.addEventListener('input', function(e) {
        let value = e.target.value;
        value = value.replace(/\D/g, '');
        let numValue = parseInt(value) || 0;
        numValue = numValue / 100;
        e.target.value = formatarMoeda(numValue);
        calcularValoresIngresso();
    });
    
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    if (taxaCheckbox) {
        taxaCheckbox.addEventListener('change', calcularValoresIngresso);
    }
};

// Preencher datas quando selecionar lote
document.addEventListener('DOMContentLoaded', function() {
    const selectLote = document.getElementById('paidTicketLote');
    if (selectLote) {
        selectLote.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption && selectedOption.value) {
                const dataInicio = selectedOption.getAttribute('data-inicio');
                const dataFim = selectedOption.getAttribute('data-fim');
                
                if (dataInicio) {
                    const campoInicio = document.getElementById('paidSaleStart');
                    if (campoInicio) campoInicio.value = dataInicio;
                }
                
                if (dataFim) {
                    const campoFim = document.getElementById('paidSaleEnd');
                    if (campoFim) campoFim.value = dataFim;
                }
            }
        });
    }
});

// Remover ticket
window.removeTicket = function(ticketId) {
    if (confirm('Tem certeza que deseja excluir este ingresso?')) {
        const ticketItem = document.querySelector(`[data-ticket-id="${ticketId}"]`);
        if (ticketItem) {
            ticketItem.remove();
            
            if (window.AnySummit && window.AnySummit.Storage) {
                window.AnySummit.Storage.saveWizardData();
            }
        }
    }
};

console.log('✅ Sistema de ingressos pagos importado');