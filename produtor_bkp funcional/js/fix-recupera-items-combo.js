// Fix definitivo para recuperar items do combo
(function() {
    console.log('🔧 Fix de recuperação de items do combo iniciado...');
    
    // Função para buscar items do combo em todas as fontes possíveis
    window.recuperarItemsDoCombo = function(combo) {
        console.log('🔍 Tentando recuperar items para combo:', combo.titulo || combo.title);
        
        let items = [];
        
        // 1. Tentar do próprio combo
        if (combo.items && Array.isArray(combo.items) && combo.items.length > 0) {
            console.log('✅ Items encontrados em combo.items');
            return combo.items;
        }
        
        if (combo.itens && Array.isArray(combo.itens) && combo.itens.length > 0) {
            console.log('✅ Items encontrados em combo.itens');
            return combo.itens;
        }
        
        if (combo.comboData && Array.isArray(combo.comboData) && combo.comboData.length > 0) {
            console.log('✅ Items encontrados em combo.comboData');
            return combo.comboData;
        }
        
        // 2. Buscar nos cookies
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name && (name.includes('ingresso') || name.includes('Salvos'))) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(value));
                    if (Array.isArray(parsed)) {
                        const comboNoCookie = parsed.find(item => 
                            item.id === combo.id && 
                            (item.type === 'combo' || item.tipo === 'combo')
                        );
                        if (comboNoCookie && comboNoCookie.items) {
                            console.log(`✅ Items encontrados no cookie ${name}`);
                            return comboNoCookie.items;
                        }
                    }
                } catch (e) {
                    // Ignorar erros de parse
                }
            }
        }
        
        // 3. Buscar no wizardData
        try {
            const wizardCookie = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
            if (wizardCookie) {
                const wizardData = JSON.parse(decodeURIComponent(wizardCookie.split('=')[1]));
                if (wizardData.ingressosSalvos) {
                    const comboNoWizard = wizardData.ingressosSalvos.find(item => 
                        item.id === combo.id && 
                        (item.type === 'combo' || item.tipo === 'combo')
                    );
                    if (comboNoWizard && comboNoWizard.items) {
                        console.log('✅ Items encontrados no wizardData');
                        return comboNoWizard.items;
                    }
                }
            }
        } catch (e) {
            // Ignorar erros
        }
        
        // 4. Buscar na variável global comboItems
        if (window.comboItems && window.comboItems.length > 0) {
            console.log('✅ Usando window.comboItems como fallback');
            return window.comboItems;
        }
        
        // 5. Buscar no DOM
        const ticketItems = document.querySelectorAll('.ticket-item');
        for (const item of ticketItems) {
            if (item.dataset.ticketId === combo.id && item.ticketData && item.ticketData.items) {
                console.log('✅ Items encontrados no DOM');
                return item.ticketData.items;
            }
        }
        
        console.log('❌ Nenhum item encontrado para o combo');
        return [];
    };
    
    // Override da função de coleta de dados
    const originalColetarDadosCompletos = window.coletarDadosCompletos;
    
    window.coletarDadosCompletos = function() {
        console.log('📊 Coletando dados com recuperação de items...');
        
        // Chamar função original
        let dados = originalColetarDadosCompletos ? originalColetarDadosCompletos.call(this) : {};
        
        // Processar combos para garantir que tenham items
        if (dados.combos && Array.isArray(dados.combos)) {
            dados.combos.forEach(combo => {
                // Se não tem items, tentar recuperar
                if (!combo.itens || combo.itens.length === 0) {
                    console.log(`\n⚠️ Combo sem items: ${combo.titulo}`);
                    const itemsRecuperados = recuperarItemsDoCombo(combo);
                    
                    if (itemsRecuperados && itemsRecuperados.length > 0) {
                        // Formatar items corretamente
                        combo.itens = itemsRecuperados.map(item => ({
                            ticket_id: item.ticketId || item.ticket_id || item.id,
                            quantidade: parseInt(item.quantity || item.quantidade || 1)
                        }));
                        console.log(`✅ Items recuperados:`, combo.itens);
                    } else {
                        console.log(`❌ Não foi possível recuperar items`);
                    }
                }
            });
        }
        
        return dados;
    };
    
    // Função para forçar recuperação manual
    window.forcarRecuperacaoItemsCombos = function() {
        console.log('🔧 Forçando recuperação de items dos combos...');
        
        const dados = window.coletarDadosCompletos();
        
        console.log('\n📊 Resultado:');
        if (dados.combos) {
            dados.combos.forEach((combo, i) => {
                console.log(`\nCombo ${i + 1}: ${combo.titulo}`);
                console.log('Items:', combo.itens);
            });
        }
        
        return dados;
    };
    
    console.log('✅ Fix de recuperação de items carregado!');
    console.log('Use forcarRecuperacaoItemsCombos() para testar');
})();