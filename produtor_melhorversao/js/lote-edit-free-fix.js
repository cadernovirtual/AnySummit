// Adicionar ao final do arquivo edit-combo-fixes.js ou criar novo arquivo
// Função para carregar lotes no modal de edição de ingresso gratuito
window.carregarLotesNoModalEditFree = function() {
    console.log('📋 Carregando lotes no modal de edição gratuito...');
    
    const selectLote = document.getElementById('editFreeTicketLote');
    if (!selectLote) {
        console.error('Select de lotes não encontrado no modal de edição gratuito!');
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
    
    console.log(`✅ ${loteCards.length} lotes carregados no select de edição gratuito`);
};

// Garantir que o ingresso gratuito salve o lote_id
const originalCreateFreeTicket = window.createFreeTicket;
window.createFreeTicket = function() {
    console.log('🆓 Criando ingresso gratuito com lote...');
    
    // Verificar se o lote foi selecionado
    const loteId = document.getElementById('freeTicketLote')?.value;
    if (!loteId) {
        alert('Por favor, selecione um lote para o ingresso');
        return;
    }
    
    // Chamar função original se existir
    if (typeof originalCreateFreeTicket === 'function') {
        originalCreateFreeTicket();
    }
};
