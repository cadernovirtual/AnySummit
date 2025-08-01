// Extensão das funções de edição de ingresso pago

// Função para atualizar ingresso pago com novos campos
window.updatePaidTicket = function() {
    const ticketId = document.getElementById('editTicketId').value;
    const loteId = document.getElementById('editPaidTicketLote').value;
    const cobrarTaxa = document.getElementById('editPaidTicketTaxaServico').checked ? 1 : 0;
    const taxaValor = document.getElementById('editPaidTicketTaxaValor').value || 'R$ 0,00';
    const valorReceber = document.getElementById('editPaidTicketValorReceber').value || 'R$ 0,00';
    
    // Obter informações do lote
    let loteInfo = null;
    if (loteId) {
        const selectLote = document.getElementById('editPaidTicketLote');
        const selectedOption = selectLote.querySelector(`option[value="${loteId}"]`);
        if (selectedOption) {
            loteInfo = {
                id: loteId,
                nome: selectedOption.textContent,
                tipo: selectedOption.getAttribute('data-tipo'),
                percentual: selectedOption.getAttribute('data-percentual')
            };
        }
    }
    
    const ticketData = {
        id: ticketId,
        titulo: document.getElementById('editPaidTicketTitle').value,
        quantidade_total: parseInt(document.getElementById('editPaidTicketQuantity').value),
        preco: parseFloat(document.getElementById('editPaidTicketPrice').value.replace(/[R$\s.]/g, '').replace(',', '.')),
        taxa_plataforma: parseFloat(taxaValor.replace(/[R$\s.]/g, '').replace(',', '.')),
        valor_receber: parseFloat(valorReceber.replace(/[R$\s.]/g, '').replace(',', '.')),
        cobrar_taxa_servico: cobrarTaxa,
        lote_id: loteId,
        loteInfo: loteInfo,
        inicio_venda: document.getElementById('editPaidSaleStart').value,
        fim_venda: document.getElementById('editPaidSaleEnd').value,
        limite_min: parseInt(document.getElementById('editPaidMinLimit').value) || 1,
        limite_max: parseInt(document.getElementById('editPaidMaxLimit').value) || 5,
        descricao: document.getElementById('editPaidTicketDescription').value
    };
    
    // Validações
    if (!ticketData.titulo || !ticketData.quantidade_total || !ticketData.preco || !loteId) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Se for ingresso temporário, atualizar no sistema temporário
    if (ticketId.startsWith('temp_')) {
        if (typeof updateTemporaryTicket === 'function') {
            const updated = updateTemporaryTicket(ticketId, {
                title: ticketData.titulo,
                quantity: ticketData.quantidade_total,
                price: ticketData.preco,
                description: ticketData.descricao,
                saleStart: ticketData.inicio_venda,
                saleEnd: ticketData.fim_venda,
                minLimit: ticketData.limite_min,
                maxLimit: ticketData.limite_max,
                cobrarTaxa: cobrarTaxa,
                taxaPlataforma: ticketData.taxa_plataforma,
                valorReceber: ticketData.valor_receber,
                loteId: loteId,
                loteInfo: loteInfo
            });
            
            if (updated) {
                closeModal('editPaidTicketModal');
                console.log('✅ Ingresso temporário atualizado');
            }
        }
    } else {
        // Atualizar via API se for edição de evento existente
        if (typeof updateTicketInList === 'function') {
            updateTicketInList(ticketData);
        }
        closeModal('editPaidTicketModal');
        console.log('✅ Ingresso pago atualizado:', ticketData);
    }
};
