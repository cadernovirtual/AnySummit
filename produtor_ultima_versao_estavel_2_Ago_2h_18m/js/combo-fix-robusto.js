// Fix mais robusto para encontrar e processar combos
(function() {
    console.log('🎯 Fix robusto para combos iniciado...');
    
    // Função para encontrar combos de qualquer forma
    window.encontrarTodosOsCombos = function() {
        const combos = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach((item, index) => {
            let isCombo = false;
            
            // Método 1: Verificar por badge com classe combo
            if (item.querySelector('.ticket-type-badge.combo')) {
                isCombo = true;
            }
            
            // Método 2: Verificar por texto "COMBO" em qualquer badge
            const badges = item.querySelectorAll('.ticket-type-badge');
            badges.forEach(badge => {
                if (badge.textContent.trim() === 'COMBO') {
                    isCombo = true;
                }
            });
            
            // Método 3: Verificar ticketData
            if (item.ticketData && item.ticketData.type === 'combo') {
                isCombo = true;
            }
            
            // Método 4: Verificar por texto COMBO em qualquer lugar do item
            if (item.textContent.includes('COMBO') && !item.textContent.includes('ADD COMBO')) {
                isCombo = true;
            }
            
            if (isCombo) {
                console.log(`📦 Combo encontrado no item ${index + 1}`);
                
                // Extrair dados do combo
                const ticketData = item.ticketData || {};
                const nomeElement = item.querySelector('.ticket-name');
                const nome = nomeElement ? nomeElement.textContent.trim() : '';
                
                // Tentar encontrar preço
                let preco = 0;
                const precoMatch = item.textContent.match(/R\$\s*([\d.,]+)/);
                if (precoMatch) {
                    preco = parseFloat(precoMatch[1].replace(',', '.'));
                }
                
                // Tentar encontrar quantidade
                let quantidade = 0;
                const qtdMatch = item.textContent.match(/Quantidade:\s*(\d+)/);
                if (qtdMatch) {
                    quantidade = parseInt(qtdMatch[1]);
                }
                
                const comboData = {
                    element: item,
                    id: item.dataset.ticketId || ticketData.id || `combo_${Date.now()}_${index}`,
                    titulo: ticketData.title || ticketData.name || nome || 'Combo sem nome',
                    preco: ticketData.price || preco,
                    quantidade: ticketData.quantity || quantidade,
                    ticketData: ticketData,
                    items: []
                };
                
                // Tentar recuperar items de diferentes fontes
                if (ticketData.items && Array.isArray(ticketData.items)) {
                    comboData.items = ticketData.items;
                } else if (ticketData.comboData && ticketData.comboData.items) {
                    comboData.items = ticketData.comboData.items;
                } else if (window.comboItems && window.comboItems.length > 0) {
                    // Usar comboItems global como fallback
                    comboData.items = window.comboItems.map(item => ({
                        ticketId: item.ticketId || item.id,
                        quantity: item.quantity || 1
                    }));
                }
                
                combos.push(comboData);
            }
        });
        
        console.log(`✅ Total de ${combos.length} combos encontrados`);
        return combos;
    };
    
    // Override da função coletarDadosCombos
    window.coletarDadosCombos = function() {
        console.log('📦 Coletando dados dos combos (versão corrigida)...');
        
        const combosEncontrados = window.encontrarTodosOsCombos();
        const combosFormatados = [];
        
        combosEncontrados.forEach(combo => {
            // Garantir que temos items
            if (!combo.items || combo.items.length === 0) {
                console.warn('⚠️ Combo sem items:', combo.titulo);
                // Tentar recuperar de comboItems global
                if (window.comboItems && window.comboItems.length > 0) {
                    combo.items = window.comboItems.map(item => ({
                        ticketId: item.ticketId || item.id,
                        quantity: item.quantity || 1
                    }));
                }
            }
            
            const comboFormatado = {
                id: combo.id,
                titulo: combo.titulo,
                descricao: combo.ticketData?.description || '',
                preco: parseFloat(combo.preco) || 0,
                quantidade_total: parseInt(combo.quantidade) || 0,
                lote_id: combo.element.dataset.loteId || combo.ticketData?.loteId || null,
                inicio_vendas: combo.ticketData?.saleStart || '',
                fim_vendas: combo.ticketData?.saleEnd || '',
                itens: combo.items.map(item => ({
                    ticket_id: item.ticketId || item.ticket_id || item.id,
                    quantidade: parseInt(item.quantity || item.quantidade || 1)
                }))
            };
            
            console.log('📦 Combo formatado:', comboFormatado);
            combosFormatados.push(comboFormatado);
        });
        
        return combosFormatados;
    };
    
    // Função de debug melhorada
    window.debugCombosCompleto = function() {
        console.log('\n🔍 DEBUG COMPLETO DE COMBOS:');
        
        const combos = window.encontrarTodosOsCombos();
        
        if (combos.length === 0) {
            console.log('❌ Nenhum combo encontrado!');
            console.log('Executando diagnóstico...');
            
            // Mostrar todos os ticket-items para análise
            const items = document.querySelectorAll('.ticket-item');
            console.log(`Total de ticket-items: ${items.length}`);
            
            items.forEach((item, i) => {
                console.log(`\nItem ${i + 1}:`);
                console.log('- HTML:', item.innerHTML.substring(0, 200) + '...');
                console.log('- ticketData:', item.ticketData);
            });
        } else {
            combos.forEach((combo, i) => {
                console.log(`\n📦 COMBO ${i + 1}:`);
                console.log('- ID:', combo.id);
                console.log('- Título:', combo.titulo);
                console.log('- Preço:', combo.preco);
                console.log('- Quantidade:', combo.quantidade);
                console.log('- Items:', combo.items);
                console.log('- ticketData completo:', combo.ticketData);
            });
        }
        
        // Mostrar também dados globais
        console.log('\n📊 DADOS GLOBAIS:');
        console.log('- window.comboItems:', window.comboItems);
        console.log('- window.temporaryTickets:', window.temporaryTickets);
        
        return combos;
    };
    
    console.log('✅ Fix robusto carregado!');
    console.log('Use debugCombosCompleto() para análise detalhada');
})();