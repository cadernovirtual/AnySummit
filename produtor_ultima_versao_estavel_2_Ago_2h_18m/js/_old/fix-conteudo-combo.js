/**
 * Fix para garantir que conteudo_combo sempre aparece
 * Intercepta a coleta e adiciona o campo se não existir
 */

(function() {
    'use strict';
    
    console.log('🔧 Fix conteudo_combo iniciando...');
    
    // Override do coletarStep6
    setTimeout(() => {
        const originalColetarStep6 = window.coletarStep6;
        if (originalColetarStep6) {
            window.coletarStep6 = function() {
                console.log('📦 coletarStep6 interceptado - garantindo conteudo_combo');
                
                // Chamar original
                originalColetarStep6.apply(this, arguments);
                
                // Garantir que todos os ingressos tenham conteudo_combo
                if (window.WizardDataCollector && window.WizardDataCollector.dados.ingressos) {
                    window.WizardDataCollector.dados.ingressos.forEach(ingresso => {
                        // Se não tem conteudo_combo, adicionar vazio
                        if (!ingresso.hasOwnProperty('conteudo_combo')) {
                            ingresso.conteudo_combo = {};
                            console.log(`➕ Adicionado conteudo_combo vazio ao ingresso ${ingresso.id}`);
                        }
                        
                        // Se é combo mas conteudo_combo está vazio, tentar preencher
                        if (ingresso.tipo === 'combo' && Object.keys(ingresso.conteudo_combo).length === 0) {
                            console.log(`🔍 Tentando preencher combo ${ingresso.nome}...`);
                            
                            // Buscar nos temporaryTickets
                            if (window.temporaryTickets) {
                                if (window.temporaryTickets instanceof Map) {
                                    const ticket = window.temporaryTickets.get(ingresso.id);
                                    if (ticket && ticket.comboData) {
                                        ticket.comboData.forEach(item => {
                                            ingresso.conteudo_combo[item.ticketId] = item.quantity;
                                        });
                                        console.log(`✅ Combo preenchido:`, ingresso.conteudo_combo);
                                    }
                                }
                            }
                            
                            // Se ainda vazio, buscar em window.comboItems
                            if (Object.keys(ingresso.conteudo_combo).length === 0 && window.comboItems) {
                                window.comboItems.forEach(item => {
                                    if (item.ticketId && item.quantity) {
                                        ingresso.conteudo_combo[item.ticketId] = item.quantity;
                                    }
                                });
                            }
                        }
                    });
                    
                    // Salvar novamente
                    localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
                    console.log('💾 Dados salvos com conteudo_combo garantido');
                }
            };
        }
    }, 2000);
    
    // Também interceptar saveWizardData
    setTimeout(() => {
        const originalSave = window.saveWizardData;
        if (originalSave) {
            window.saveWizardData = function() {
                const result = originalSave.apply(this, arguments);
                
                // Após salvar, garantir conteudo_combo
                setTimeout(() => {
                    const saved = localStorage.getItem('wizardDataCollector');
                    if (saved) {
                        const data = JSON.parse(saved);
                        let modified = false;
                        
                        if (data.dados && data.dados.ingressos) {
                            data.dados.ingressos.forEach(ingresso => {
                                if (!ingresso.hasOwnProperty('conteudo_combo')) {
                                    ingresso.conteudo_combo = {};
                                    modified = true;
                                }
                            });
                            
                            if (modified) {
                                localStorage.setItem('wizardDataCollector', JSON.stringify(data));
                                console.log('✅ conteudo_combo adicionado aos ingressos');
                            }
                        }
                    }
                }, 100);
                
                return result;
            };
        }
    }, 2000);
    
    console.log('✅ Fix conteudo_combo carregado!');
    
})();
