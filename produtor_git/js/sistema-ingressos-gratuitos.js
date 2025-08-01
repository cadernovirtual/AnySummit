// =====================================================
// SISTEMA DE INGRESSOS GRATUITOS - ANYSUMMIT
// =====================================================
// Importado de: ingressos-gratuitos.js

console.log('🎟️ Importando sistema de ingressos gratuitos...');

// Carregar lotes no modal de ingresso gratuito
window.carregarLotesNoModalFree = function() {
    console.log('📋 Carregando lotes para ingresso gratuito...');
    
    const selectLote = document.getElementById('freeTicketLote');
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

// Criar ingresso gratuito
window.createFreeTicket = function() {
    console.log('🎟️ Criando ingresso gratuito...');
    
    // Limpar erros
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    const title = document.getElementById('freeTicketTitle')?.value;
    const quantity = document.getElementById('freeTicketQuantity')?.value;
    const description = document.getElementById('freeTicketDescription')?.value || '';
    const loteId = document.getElementById('freeTicketLote')?.value;
    const saleStart = document.getElementById('freeSaleStart')?.value;
    const saleEnd = document.getElementById('freeSaleEnd')?.value;
    const minQuantity = document.getElementById('freeMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('freeMaxQuantity')?.value || 10;
    
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
    
    // Criar dados do ticket
    const ticketData = {
        id: `ticket_${Date.now()}`,
        tipo: 'gratuito',
        titulo: title,
        quantidade: parseInt(quantity),
        preco: 0,
        descricao: description,
        loteId: loteId,
        saleStart: saleStart,
        saleEnd: saleEnd,
        minQuantity: parseInt(minQuantity),
        maxQuantity: parseInt(maxQuantity),
        taxaServico: false,
        taxaPlataforma: 0,
        valorComprador: 0,
        valorReceber: 0
    };
    
    // Adicionar ao DOM
    addFreeTicketToList(ticketData);
    
    // Fechar modal
    if (window.closeModal) {
        window.closeModal('freeTicketModal');
    }
    
    // Salvar dados
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
    
    // Limpar campos
    document.getElementById('freeTicketTitle').value = '';
    document.getElementById('freeTicketQuantity').value = '1';
    document.getElementById('freeTicketDescription').value = '';
};

// Adicionar ingresso gratuito à lista
function addFreeTicketToList(ticketData) {
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
                        <span class="ticket-detail-value">${getLoteNomeGratuito(ticketData.loteId)}</span>
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
    
    ticketList.appendChild(ticketItem);
}

// Obter nome do lote
function getLoteNomeGratuito(loteId) {
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

// Preencher datas quando selecionar lote
document.addEventListener('DOMContentLoaded', function() {
    const selectLote = document.getElementById('freeTicketLote');
    if (selectLote) {
        selectLote.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption && selectedOption.value) {
                const dataInicio = selectedOption.getAttribute('data-inicio');
                const dataFim = selectedOption.getAttribute('data-fim');
                
                if (dataInicio) {
                    const campoInicio = document.getElementById('freeSaleStart');
                    if (campoInicio) campoInicio.value = dataInicio;
                }
                
                if (dataFim) {
                    const campoFim = document.getElementById('freeSaleEnd');
                    if (campoFim) campoFim.value = dataFim;
                }
            }
        });
    }
});

// Função auxiliar para editar ticket
window.editTicket = window.editTicket || function(ticketId) {
    console.log('✏️ Editando ticket:', ticketId);
    alert('Função de edição em desenvolvimento');
};

console.log('✅ Sistema de ingressos gratuitos importado');