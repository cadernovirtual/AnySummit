/**
 * Fix específico para capturar conteúdo dos combos
 * Monitora quando um combo é criado e salva seus itens
 */

(function() {
    'use strict';
    
    console.log('🎯 Fix de captura de conteúdo de combos iniciando...');
    
    // Variável para armazenar o último combo criado
    let ultimoComboId = null;
    let comboItemsBackup = [];
    
    // 1. Interceptar quando itens são adicionados ao combo
    if (window.addItemToCombo) {
        const originalAddItem = window.addItemToCombo;
        window.addItemToCombo = function() {
            console.log('📦 addItemToCombo interceptado');
            
            // Chamar original
            const result = originalAddItem.apply(this, arguments);
            
            // Fazer backup dos items
            if (window.comboItems) {
                comboItemsBackup = [...window.comboItems];
                console.log('💾 Backup dos itens do combo:', comboItemsBackup);
            }
            
            return result;
        };
    }
    
    // 2. Interceptar createComboTicket
    setTimeout(() => {
        if (window.createComboTicket) {
            const originalCreateCombo = window.createComboTicket;
            window.createComboTicket = function() {
                console.log('🎫 createComboTicket interceptado');
                console.log('Items atuais:', window.comboItems);
                
                // Salvar items antes de criar
                const itemsParaSalvar = window.comboItems ? [...window.comboItems] : [];
                
                // Chamar original
                const result = originalCreateCombo.apply(this, arguments);
                
                // Após criar, encontrar o combo e adicionar os items
                setTimeout(() => {
                    // Encontrar o último combo criado
                    let ultimoCombo = null;
                    
                    // Procurar no temporaryTickets
                    if (window.temporaryTickets) {
                        if (window.temporaryTickets instanceof Map) {
                            // Pegar o último combo adicionado
                            const combos = Array.from(window.temporaryTickets.values()).filter(t => t.type === 'combo');
                            if (combos.length > 0) {
                                ultimoCombo = combos[combos.length - 1];
                                ultimoComboId = ultimoCombo.id;
                                
                                // Adicionar items ao combo
                                if (!ultimoCombo.comboData) {
                                    ultimoCombo.comboData = [];
                                }
                                
                                // Limpar e adicionar items corretos
                                ultimoCombo.comboData = itemsParaSalvar.map(item => ({
                                    ticketId: item.ticketId,
                                    quantity: item.quantity
                                }));
                                
                                console.log('✅ Items adicionados ao combo:', ultimoCombo.comboData);
                            }
                        }
                    }
                    
                    // Forçar coleta e salvamento
                    if (window.coletarDadosStepAtual) {
                        window.coletarDadosStepAtual(6);
                        
                        // Garantir que o conteudo_combo foi salvo
                        setTimeout(() => {
                            const saved = localStorage.getItem('wizardDataCollector');
                            if (saved) {
                                const data = JSON.parse(saved);
                                const combos = data.dados.ingressos.filter(ing => ing.tipo === 'combo');
                                
                                combos.forEach(combo => {
                                    if (combo.id === ultimoComboId && Object.keys(combo.conteudo_combo).length === 0) {
                                        // Preencher com os items salvos
                                        itemsParaSalvar.forEach(item => {
                                            combo.conteudo_combo[item.ticketId] = item.quantity;
                                        });
                                        
                                        // Salvar novamente
                                        localStorage.setItem('wizardDataCollector', JSON.stringify(data));
                                        console.log('💾 Conteúdo do combo salvo:', combo.conteudo_combo);
                                    }
                                });
                            }
                        }, 500);
                    }
                    
                }, 300);
                
                return result;
            };
        }
    }, 2000);
    
    // 3. Monitorar mudanças no comboItems
    setInterval(() => {
        if (window.comboItems && window.comboItems.length > 0) {
            // Se temos items mas não temos combo, fazer backup
            if (comboItemsBackup.length !== window.comboItems.length) {
                comboItemsBackup = [...window.comboItems];
                console.log('📋 Backup atualizado:', comboItemsBackup);
            }
        }
    }, 1000);
    
    // 4. Override mais agressivo do coletarStep6
    setTimeout(() => {
        const originalColetarStep6 = window.coletarStep6;
        if (originalColetarStep6) {
            window.coletarStep6 = function() {
                console.log('🎯 coletarStep6 interceptado - garantindo conteúdo dos combos');
                
                // Chamar original
                originalColetarStep6.apply(this, arguments);
                
                // Processar combos
                if (window.WizardDataCollector && window.WizardDataCollector.dados.ingressos) {
                    window.WizardDataCollector.dados.ingressos.forEach(ingresso => {
                        if (ingresso.tipo === 'combo') {
                            console.log(`🔍 Processando combo: ${ingresso.nome}`);
                            
                            // Se conteudo_combo está vazio
                            if (!ingresso.conteudo_combo || Object.keys(ingresso.conteudo_combo).length === 0) {
                                // Tentar várias fontes
                                
                                // 1. Buscar no temporaryTickets
                                if (window.temporaryTickets && window.temporaryTickets instanceof Map) {
                                    const ticket = window.temporaryTickets.get(ingresso.id);
                                    if (ticket && ticket.comboData && ticket.comboData.length > 0) {
                                        ingresso.conteudo_combo = {};
                                        ticket.comboData.forEach(item => {
                                            ingresso.conteudo_combo[item.ticketId] = item.quantity;
                                        });
                                        console.log('✅ Preenchido do temporaryTickets:', ingresso.conteudo_combo);
                                    }
                                }
                                
                                // 2. Se ainda vazio, usar backup
                                if (Object.keys(ingresso.conteudo_combo).length === 0 && comboItemsBackup.length > 0) {
                                    ingresso.conteudo_combo = {};
                                    comboItemsBackup.forEach(item => {
                                        ingresso.conteudo_combo[item.ticketId] = item.quantity;
                                    });
                                    console.log('✅ Preenchido do backup:', ingresso.conteudo_combo);
                                }
                                
                                // 3. Se ainda vazio, usar window.comboItems
                                if (Object.keys(ingresso.conteudo_combo).length === 0 && window.comboItems) {
                                    ingresso.conteudo_combo = {};
                                    window.comboItems.forEach(item => {
                                        if (item.ticketId && item.quantity) {
                                            ingresso.conteudo_combo[item.ticketId] = item.quantity;
                                        }
                                    });
                                    console.log('✅ Preenchido do comboItems:', ingresso.conteudo_combo);
                                }
                            }
                        }
                    });
                    
                    // Salvar
                    localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
                }
            };
        }
    }, 3000);
    
    // Comando de debug
    window.debugConteudoCombo = function() {
        console.log('=== DEBUG CONTEÚDO COMBO ===');
        console.log('comboItems atual:', window.comboItems);
        console.log('backup:', comboItemsBackup);
        
        if (window.temporaryTickets && window.temporaryTickets instanceof Map) {
            window.temporaryTickets.forEach((ticket, key) => {
                if (ticket.type === 'combo') {
                    console.log(`Combo ${key}:`, ticket);
                    console.log('comboData:', ticket.comboData);
                }
            });
        }
        
        const saved = localStorage.getItem('wizardDataCollector');
        if (saved) {
            const data = JSON.parse(saved);
            const combos = data.dados.ingressos.filter(ing => ing.tipo === 'combo');
            console.log('Combos salvos:', combos);
        }
    };
    
    console.log('✅ Fix de captura de conteúdo de combos carregado!');
    console.log('💡 Use debugConteudoCombo() para debug');
    
})();
