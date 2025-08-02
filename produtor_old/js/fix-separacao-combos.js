// Fix para separar corretamente ingressos e combos
(function() {
    console.log('🔧 Fix de separação ingressos/combos iniciado...');
    
    // Override da função que coleta todos os dados
    const originalColetarDadosCompletos = window.coletarDadosCompletos;
    
    window.coletarDadosCompletos = function() {
        console.log('📊 Coletando dados completos (com fix de separação)...');
        
        // Chamar função original se existir
        let dados;
        if (originalColetarDadosCompletos) {
            dados = originalColetarDadosCompletos.call(this);
        } else {
            // Se não existir, criar estrutura básica
            dados = {
                ingressos: [],
                combos: []
            };
        }
        
        // Garantir que temos arrays de ingressos e combos
        if (!dados.ingressos) dados.ingressos = [];
        if (!dados.combos) dados.combos = [];
        
        // Separar ingressos e combos corretamente
        const ingressosTemp = [...dados.ingressos];
        dados.ingressos = [];
        dados.combos = [];
        
        console.log('🔍 Processando ' + ingressosTemp.length + ' itens...');
        
        ingressosTemp.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, item);
            
            // Verificar se é combo por diferentes critérios
            const isCombo = 
                item.tipo === 'combo' || 
                item.type === 'combo' ||
                (item.id && item.id.includes('combo_')) ||
                (item.titulo && item.titulo.toLowerCase().includes('combo')) ||
                (item.items && Array.isArray(item.items));
            
            if (isCombo) {
                console.log('📦 Identificado como COMBO');
                
                // Formatar combo corretamente
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
                
                // Processar itens do combo
                if (item.items && Array.isArray(item.items)) {
                    combo.itens = item.items.map(subItem => ({
                        ticket_id: subItem.ticketId || subItem.ticket_id || subItem.id,
                        quantidade: parseInt(subItem.quantity || subItem.quantidade || 1)
                    }));
                } else if (item.comboData && Array.isArray(item.comboData)) {
                    combo.itens = item.comboData.map(subItem => ({
                        ticket_id: subItem.ticketId || subItem.ticket_id || subItem.id,
                        quantidade: parseInt(subItem.quantity || subItem.quantidade || 1)
                    }));
                }
                
                console.log('📦 Combo formatado:', combo);
                dados.combos.push(combo);
                
            } else {
                console.log('🎫 Identificado como INGRESSO normal');
                // É um ingresso normal
                dados.ingressos.push(item);
            }
        });
        
        console.log('✅ Separação concluída:');
        console.log('- Ingressos:', dados.ingressos.length);
        console.log('- Combos:', dados.combos.length);
        
        return dados;
    };
    
    // Se houver uma função que prepara os dados para envio, interceptar também
    if (window.prepararDadosParaEnvio) {
        const originalPrepararDados = window.prepararDadosParaEnvio;
        
        window.prepararDadosParaEnvio = function() {
            const dados = originalPrepararDados.call(this);
            
            // Aplicar a mesma correção
            if (dados.ingressos && Array.isArray(dados.ingressos)) {
                const ingressosTemp = [...dados.ingressos];
                dados.ingressos = [];
                dados.combos = dados.combos || [];
                
                ingressosTemp.forEach(item => {
                    if (item.tipo === 'combo' || item.type === 'combo' || (item.id && item.id.includes('combo_'))) {
                        dados.combos.push(item);
                    } else {
                        dados.ingressos.push(item);
                    }
                });
            }
            
            return dados;
        };
    }
    
    // Debug function
    window.debugSeparacaoIngressosCombos = function() {
        const dados = window.coletarDadosCompletos();
        
        console.log('\n🔍 DEBUG SEPARAÇÃO INGRESSOS/COMBOS:');
        console.log('\n📋 INGRESSOS (' + dados.ingressos.length + '):');
        dados.ingressos.forEach((ing, i) => {
            console.log(`${i + 1}. ${ing.titulo || ing.title} (${ing.tipo || ing.type})`);
        });
        
        console.log('\n📦 COMBOS (' + dados.combos.length + '):');
        dados.combos.forEach((combo, i) => {
            console.log(`${i + 1}. ${combo.titulo} - ${combo.itens.length} itens`);
            combo.itens.forEach(item => {
                console.log(`   - ${item.quantidade}x ingresso ${item.ticket_id}`);
            });
        });
        
        return dados;
    };
    
    console.log('✅ Fix de separação carregado!');
    console.log('Use debugSeparacaoIngressosCombos() para verificar');
})();