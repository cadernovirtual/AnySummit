// Fix para garantir que os combos sejam salvos com conteudo_combo
(function() {
    console.log('🎯 Combo Save Fix iniciado...');
    
    // Interceptar a função de coleta de combos
    const originalColetarDadosCombos = window.coletarDadosCombos;
    
    window.coletarDadosCombos = function() {
        console.log('📦 Coletando dados dos combos com fix...');
        
        const combos = [];
        const comboItems = document.querySelectorAll('.ticket-item');
        
        comboItems.forEach(item => {
            // Verificar se é um combo
            const isCombo = item.querySelector('.ticket-type-badge.combo') !== null;
            if (!isCombo) return;
            
            const ticketData = item.ticketData || {};
            console.log('📦 Dados do combo encontrado:', ticketData);
            
            // Buscar itens do combo em diferentes locais possíveis
            let itensCombo = [];
            
            // Tentar primeiro no formato esperado
            if (ticketData.items && Array.isArray(ticketData.items)) {
                console.log('✅ Itens encontrados em ticketData.items:', ticketData.items);
                itensCombo = ticketData.items.map(item => ({
                    ticket_id: item.ticketId || item.ticket_id || item.id,
                    quantidade: parseInt(item.quantity) || parseInt(item.quantidade) || 1
                }));
            }
            // Tentar no comboData
            else if (ticketData.comboData && ticketData.comboData.items) {
                console.log('✅ Itens encontrados em comboData.items:', ticketData.comboData.items);
                itensCombo = ticketData.comboData.items.map(item => ({
                    ticket_id: item.ticketId || item.ticket_id || item.id,
                    quantidade: parseInt(item.quantity) || parseInt(item.quantidade) || 1
                }));
            }
            // Tentar buscar do DOM
            else {
                console.log('⚠️ Tentando buscar itens do DOM...');
                const comboItemsList = item.querySelector('.combo-items-list');
                if (comboItemsList) {
                    const items = comboItemsList.querySelectorAll('.combo-item');
                    items.forEach(comboItem => {
                        const ticketId = comboItem.dataset.ticketId;
                        const quantity = comboItem.querySelector('.combo-item-quantity')?.textContent?.match(/\d+/)?.[0];
                        if (ticketId && quantity) {
                            itensCombo.push({
                                ticket_id: ticketId,
                                quantidade: parseInt(quantity)
                            });
                        }
                    });
                }
            }
            
            console.log('📦 Itens processados do combo:', itensCombo);
            
            if (itensCombo.length === 0) {
                console.error('❌ Combo sem itens:', ticketData.title || 'SEM TÍTULO');
            }
            
            const comboObj = {
                id: item.dataset.ticketId || ticketData.id || `combo_${Date.now()}`,
                titulo: ticketData.title || ticketData.name || '',
                descricao: ticketData.description || '',
                preco: parseFloat(ticketData.price) || 0,
                quantidade_total: parseInt(ticketData.quantity) || 0,
                lote_id: item.dataset.loteId || ticketData.loteId || null,
                inicio_vendas: ticketData.saleStart || '',
                fim_vendas: ticketData.saleEnd || '',
                itens: itensCombo
            };
            
            console.log('✅ Combo estruturado:', comboObj);
            combos.push(comboObj);
        });
        
        console.log(`📦 Total de ${combos.length} combos coletados`);
        return combos;
    };
    
    // Interceptar também a função que salva os dados do ticket
    const originalSaveTicketData = window.saveTicketData;
    if (originalSaveTicketData) {
        window.saveTicketData = function(ticketItem, data) {
            console.log('💾 Salvando dados do ticket com fix:', data);
            
            // Se for um combo, garantir que os items estejam salvos
            if (data.type === 'combo' && data.items) {
                console.log('📦 Garantindo que items do combo sejam salvos:', data.items);
                ticketItem.ticketData = ticketItem.ticketData || {};
                ticketItem.ticketData.items = data.items;
            }
            
            // Chamar função original
            if (originalSaveTicketData) {
                return originalSaveTicketData.call(this, ticketItem, data);
            }
        };
    }
    
    // Debug: função para verificar combos antes do envio
    window.debugCombosAntesDeSalvar = function() {
        const combos = window.coletarDadosCombos();
        console.log('🔍 DEBUG - Combos que serão enviados:', combos);
        
        combos.forEach((combo, idx) => {
            console.log(`Combo ${idx + 1}: ${combo.titulo}`);
            console.log('  Itens:', combo.itens);
            console.log('  Tem itens?', combo.itens && combo.itens.length > 0);
        });
        
        return combos;
    };
    
    console.log('✅ Combo Save Fix carregado! Use debugCombosAntesDeSalvar() para verificar');
})();