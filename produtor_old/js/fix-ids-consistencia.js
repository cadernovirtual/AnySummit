// Fix para garantir consistência de IDs entre frontend e backend
(function() {
    console.log('🔗 Fix de consistência de IDs iniciado...');
    
    // Override da função que coleta dados completos
    const originalColetarDadosCompletos = window.coletarDadosCompletos;
    
    window.coletarDadosCompletos = function() {
        console.log('📊 Coletando dados com fix de IDs...');
        
        // Chamar função original
        let dados = originalColetarDadosCompletos ? originalColetarDadosCompletos.call(this) : {};
        
        // Criar um mapa de IDs para garantir consistência
        const mapaIds = new Map();
        
        // Processar ingressos primeiro para mapear IDs
        if (dados.ingressos && Array.isArray(dados.ingressos)) {
            dados.ingressos.forEach((ingresso, index) => {
                // Garantir que o ingresso tem um ID
                if (!ingresso.id) {
                    ingresso.id = `ticket_${Date.now()}_${index}`;
                }
                
                // Salvar no mapa
                mapaIds.set(ingresso.id, ingresso);
                
                console.log(`🎫 Ingresso mapeado: ${ingresso.id} -> ${ingresso.titulo || ingresso.title}`);
            });
        }
        
        // Processar combos e atualizar referências
        if (dados.combos && Array.isArray(dados.combos)) {
            dados.combos.forEach((combo, comboIndex) => {
                console.log(`\n📦 Processando combo: ${combo.titulo}`);
                
                // Garantir que o combo tem itens
                let itens = combo.itens || combo.items || combo.comboData || [];
                
                // Se for um objeto único, converter para array
                if (itens && !Array.isArray(itens)) {
                    itens = [itens];
                }
                
                console.log(`  Itens originais:`, itens);
                
                // Processar cada item do combo
                const itensProcessados = [];
                
                itens.forEach((item, itemIndex) => {
                    // Extrair ID do ticket
                    let ticketId = item.ticket_id || item.ticketId || item.id;
                    
                    // Verificar se o ID existe no mapa
                    if (ticketId && mapaIds.has(ticketId)) {
                        console.log(`  ✅ ID ${ticketId} encontrado no mapa`);
                    } else {
                        console.log(`  ⚠️ ID ${ticketId} NÃO encontrado no mapa`);
                        
                        // Tentar encontrar por índice ou criar novo
                        const ingressos = dados.ingressos || [];
                        if (itemIndex < ingressos.length) {
                            ticketId = ingressos[itemIndex].id;
                            console.log(`  📌 Usando ID do ingresso no índice ${itemIndex}: ${ticketId}`);
                        }
                    }
                    
                    // Adicionar item processado
                    itensProcessados.push({
                        ticket_id: ticketId,
                        quantidade: parseInt(item.quantidade || item.quantity || 1)
                    });
                });
                
                // Atualizar itens do combo
                combo.itens = itensProcessados;
                
                console.log(`  Itens processados:`, combo.itens);
            });
        }
        
        // Se houver combos no array de ingressos, movê-los
        if (dados.ingressos && Array.isArray(dados.ingressos)) {
            const ingressosTemp = [];
            const combosEncontrados = [];
            
            dados.ingressos.forEach(item => {
                if (item.tipo === 'combo' || item.type === 'combo' || (item.id && item.id.includes('combo_'))) {
                    // Processar como combo
                    const combo = {
                        id: item.id,
                        titulo: item.titulo || item.title,
                        descricao: item.descricao || item.description || '',
                        preco: parseFloat(item.preco || item.price || 0),
                        quantidade_total: parseInt(item.quantidade_total || item.quantity || 0),
                        lote_id: item.lote_id || item.loteId,
                        inicio_vendas: item.inicio_vendas || item.saleStart || '',
                        fim_vendas: item.fim_vendas || item.saleEnd || '',
                        itens: []
                    };
                    
                    // Processar itens
                    let itensOriginais = item.items || item.itens || item.comboData || [];
                    if (itensOriginais && !Array.isArray(itensOriginais)) {
                        itensOriginais = [itensOriginais];
                    }
                    
                    combo.itens = itensOriginais.map(subItem => ({
                        ticket_id: subItem.ticketId || subItem.ticket_id || subItem.id,
                        quantidade: parseInt(subItem.quantity || subItem.quantidade || 1)
                    }));
                    
                    combosEncontrados.push(combo);
                } else {
                    ingressosTemp.push(item);
                }
            });
            
            // Atualizar arrays
            dados.ingressos = ingressosTemp;
            if (!dados.combos) dados.combos = [];
            dados.combos = dados.combos.concat(combosEncontrados);
        }
        
        console.log('\n✅ Dados finais:');
        console.log('- Ingressos:', dados.ingressos?.length || 0);
        console.log('- Combos:', dados.combos?.length || 0);
        
        return dados;
    };
    
    // Debug function
    window.debugIdsConsistencia = function() {
        const dados = window.coletarDadosCompletos();
        
        console.log('\n🔍 DEBUG CONSISTÊNCIA DE IDs:');
        
        // Mostrar todos os IDs de ingressos
        console.log('\n📋 IDs dos Ingressos:');
        if (dados.ingressos) {
            dados.ingressos.forEach((ing, i) => {
                console.log(`${i + 1}. ID: ${ing.id} - ${ing.titulo || ing.title}`);
            });
        }
        
        // Mostrar combos e seus itens
        console.log('\n📦 Combos e referências:');
        if (dados.combos) {
            dados.combos.forEach((combo, i) => {
                console.log(`\nCombo ${i + 1}: ${combo.titulo}`);
                if (combo.itens && combo.itens.length > 0) {
                    combo.itens.forEach(item => {
                        const ingressoRef = dados.ingressos?.find(ing => ing.id === item.ticket_id);
                        const status = ingressoRef ? '✅' : '❌';
                        console.log(`  ${status} ${item.quantidade}x ticket_id: ${item.ticket_id}`);
                        if (ingressoRef) {
                            console.log(`     -> ${ingressoRef.titulo || ingressoRef.title}`);
                        } else {
                            console.log(`     -> NÃO ENCONTRADO!`);
                        }
                    });
                } else {
                    console.log('  ⚠️ SEM ITENS!');
                }
            });
        }
        
        return dados;
    };
    
    console.log('✅ Fix de consistência de IDs carregado!');
    console.log('Use debugIdsConsistencia() para verificar');
})();