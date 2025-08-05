/**
 * CORREÇÃO DEFINITIVA: IDs de edição após salvamento
 * Resolve problema de edição de itens já salvos no banco
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção definitiva de IDs carregada');
    
    // Interceptar função editItem para buscar por ID correto
    const originalEditItem = window.editItem;
    if (originalEditItem) {
        window.editItem = function(ticketId) {
            console.log(`🔍 Tentando editar item: ${ticketId}`);
            
            // Primeiro tentar buscar pelo ID exato
            let ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
            
            if (!ticketElement || !ticketElement.ticketData) {
                console.log(`❌ Item não encontrado com ID ${ticketId}, buscando por ID real...`);
                
                // Buscar por ingresso_id no ticketData
                const allItems = document.querySelectorAll('.ticket-item');
                for (const item of allItems) {
                    if (item.ticketData && (
                        item.ticketData.id == ticketId || 
                        item.ticketData.ingresso_id == ticketId ||
                        item.dataset.ingressoId == ticketId
                    )) {
                        ticketElement = item;
                        console.log(`✅ Item encontrado por ID real:`, item.ticketData);
                        break;
                    }
                }
            }
            
            if (ticketElement && ticketElement.ticketData) {
                console.log(`✅ Editando item encontrado:`, ticketElement.ticketData);
                return originalEditItem.call(this, ticketId);
            } else {
                console.error(`❌ Item ${ticketId} realmente não encontrado`);
                alert('Item não encontrado. Recarregue a página e tente novamente.');
            }
        };
    }
    
    // Interceptar função de edição de lote
    const originalEditarLoteImediato = window.editarLoteImediato;
    if (originalEditarLoteImediato) {
        window.editarLoteImediato = function(loteId) {
            console.log(`🔍 Tentando editar lote: ${loteId}`);
            
            // Buscar lote nos dados globais ou DOM
            const loteItems = document.querySelectorAll('.lote-item');
            let loteEncontrado = null;
            
            for (const item of loteItems) {
                const dadosLote = item.loteData || {};
                if (dadosLote.id == loteId || item.dataset.loteId == loteId) {
                    loteEncontrado = dadosLote;
                    console.log(`✅ Lote encontrado:`, dadosLote);
                    break;
                }
            }
            
            if (loteEncontrado) {
                return originalEditarLoteImediato.call(this, loteId);
            } else {
                console.error(`❌ Lote ${loteId} não encontrado`);
                alert('Lote não encontrado. Recarregue a página e tente novamente.');
            }
        };
    }
    
    // Função para sincronizar IDs após salvamento
    function sincronizarIdsAposSalvamento() {
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach(item => {
            if (item.ticketData && item.ticketData.id) {
                const idReal = item.ticketData.id;
                
                // Atualizar todos os atributos com ID real
                item.dataset.ticketId = idReal;
                item.dataset.ingressoId = idReal;
                item.setAttribute('data-ticket-id', idReal);
                item.setAttribute('data-ingresso-id', idReal);
                
                // Atualizar botões de edição
                const editBtn = item.querySelector('[onclick*="editItem"]');
                if (editBtn) {
                    editBtn.setAttribute('onclick', `editItem('${idReal}')`);
                }
                
                const deleteBtn = item.querySelector('[onclick*="deleteItem"]');
                if (deleteBtn) {
                    deleteBtn.setAttribute('onclick', `deleteItem('${idReal}')`);
                }
                
                console.log(`🔄 Item sincronizado com ID real: ${idReal}`);
            }
        });
        
        // Sincronizar lotes também
        const loteItems = document.querySelectorAll('.lote-item');
        loteItems.forEach(item => {
            if (item.loteData && item.loteData.id) {
                const idReal = item.loteData.id;
                
                item.dataset.loteId = idReal;
                item.setAttribute('data-lote-id', idReal);
                
                // Atualizar botões de lote
                const editBtn = item.querySelector('[onclick*="editarLoteImediato"]');
                if (editBtn) {
                    editBtn.setAttribute('onclick', `editarLoteImediato('${idReal}')`);
                }
                
                console.log(`🔄 Lote sincronizado com ID real: ${idReal}`);
            }
        });
    }
    
    // Executar sincronização periodicamente
    setInterval(sincronizarIdsAposSalvamento, 3000);
    
    // Executar após carregamento inicial
    setTimeout(sincronizarIdsAposSalvamento, 2000);
    
    console.log('✅ Correção de IDs de edição ativada');
});
