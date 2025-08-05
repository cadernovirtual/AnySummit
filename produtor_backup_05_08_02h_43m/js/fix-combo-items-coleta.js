/**
 * FIX: Combo com "Nenhum item adicionado"
 * 
 * PROBLEMA RESOLVIDO:
 * - ingresso_id não estava sendo extraído corretamente dos itens do combo
 * - Diferentes estruturas de dados usadas: {ticketId, index} vs {ticket_id, ingresso_id}
 * - Função de coleta não reconhecia todas as variações de propriedades
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Fix para coleta de itens do combo carregado');
    
    // =======================================================
    // SOBRESCREVER FUNÇÃO DE COLETA DE ITENS DO COMBO
    // =======================================================
    
    // Aguardar carregamento completo antes de sobrescrever
    setTimeout(() => {
        // Procurar e sobrescrever a função coletarItensDoCombo se existir
        if (typeof window.coletarItensDoCombo === 'function') {
            console.log('🔄 Sobrescrevendo função coletarItensDoCombo existente');
        }
        
        window.coletarItensDoCombo = function() {
            console.log('📦 [FIX] Coletando itens do combo...');
            const itens = [];
            
            // VERIFICAR MÚLTIPLAS FONTES DE DADOS
            let itensEncontrados = false;
            
            // 1. Verificar variável global comboItems
            if (typeof window.comboItems !== 'undefined' && window.comboItems && window.comboItems.length > 0) {
                console.log('📊 Fonte: window.comboItems');
                console.log('📦 Dados brutos:', window.comboItems);
                
                window.comboItems.forEach((item, index) => {
                    console.log(`📋 Processando item ${index}:`, item);
                    
                    // TENTAR MÚLTIPLAS PROPRIEDADES PARA O ID
                    const ingressoId = parseInt(item.ticket_id) || 
                                     parseInt(item.ingresso_id) || 
                                     parseInt(item.id) || 
                                     parseInt(item.ticketId) ||  // Nova propriedade
                                     parseInt(item.index) ||     // Nova propriedade
                                     null;
                    
                    // TENTAR MÚLTIPLAS PROPRIEDADES PARA QUANTIDADE
                    const quantidade = parseInt(item.quantity) || 
                                     parseInt(item.quantidade) || 
                                     parseInt(item.qtd) ||
                                     null;
                    
                    console.log(`🔍 Extraído: ingressoId=${ingressoId}, quantidade=${quantidade}`);
                    
                    if (ingressoId && quantidade && quantidade > 0) {
                        itens.push({
                            ingresso_id: ingressoId,
                            quantidade: quantidade
                        });
                        console.log(`✅ Item adicionado: ingresso_id=${ingressoId}, quantidade=${quantidade}`);
                        itensEncontrados = true;
                    } else {
                        console.warn('⚠️ Item ignorado (ID ou quantidade inválidos):', {
                            item: item,
                            ingressoId: ingressoId,
                            quantidade: quantidade,
                            propriedadesDisponveis: Object.keys(item)
                        });
                    }
                });
            }
            
            // 2. Se não encontrou via variável global, buscar na interface
            if (!itensEncontrados) {
                console.log('📊 Fonte: Interface DOM');
                
                const comboItemsList = document.getElementById('comboItemsList');
                if (comboItemsList) {
                    const itemElements = comboItemsList.querySelectorAll('.combo-item, [data-ticket-id], [data-ingresso-id]');
                    
                    itemElements.forEach((element, index) => {
                        console.log(`📋 Processando elemento DOM ${index}:`, element);
                        
                        // BUSCAR ID EM MÚLTIPLOS ATRIBUTOS
                        const ticketId = element.dataset.ticketId || 
                                       element.dataset.ingressoId || 
                                       element.dataset.id ||
                                       element.getAttribute('data-ticket-id') ||
                                       element.getAttribute('data-ingresso-id');
                        
                        // BUSCAR QUANTIDADE EM MÚLTIPLOS LUGARES
                        const quantity = element.dataset.quantity || 
                                       element.dataset.quantidade ||
                                       element.getAttribute('data-quantity') ||
                                       element.textContent.match(/(\d+)x/)?.[1] ||
                                       element.textContent.match(/(\d+)\s*unidades?/i)?.[1];
                        
                        const ingressoId = parseInt(ticketId);
                        const quantidade = parseInt(quantity);
                        
                        console.log(`🔍 Extraído DOM: ingressoId=${ingressoId}, quantidade=${quantidade}`);
                        
                        if (ingressoId && quantidade && quantidade > 0) {
                            itens.push({
                                ingresso_id: ingressoId,
                                quantidade: quantidade
                            });
                            console.log(`✅ Item DOM adicionado: ingresso_id=${ingressoId}, quantidade=${quantidade}`);
                            itensEncontrados = true;
                        } else {
                            console.warn('⚠️ Item DOM ignorado:', { 
                                ticketId, quantity, element,
                                datasets: element.dataset,
                                textContent: element.textContent
                            });
                        }
                    });
                }
            }
            
            // 3. Se ainda não encontrou, buscar em outras variáveis globais
            if (!itensEncontrados) {
                console.log('📊 Buscando em outras variáveis globais...');
                
                // Verificar outras possíveis variáveis
                const possiveisVariaveis = ['selectedComboItems', 'comboData', 'comboTickets', 'selectedTickets'];
                
                possiveisVariaveis.forEach(nomeVar => {
                    if (typeof window[nomeVar] !== 'undefined' && window[nomeVar] && window[nomeVar].length > 0) {
                        console.log(`📊 Tentando variável: ${nomeVar}`, window[nomeVar]);
                        // Processar similar ao comboItems
                        // ... (implementação similar se necessário)
                    }
                });
            }
            
            console.log('📦 [FIX] Itens finais coletados para o combo:', itens);
            
            if (itens.length === 0) {
                console.error('❌ Nenhum item válido encontrado para o combo');
                console.log('🔍 Debug info:');
                console.log('  - window.comboItems:', window.comboItems);
                console.log('  - comboItemsList DOM:', document.getElementById('comboItemsList'));
                console.log('  - Elementos com data-ticket-id:', document.querySelectorAll('[data-ticket-id]'));
            }
            
            return itens;
        };
        
        console.log('✅ Função coletarItensDoCombo corrigida');
        
    }, 1500);
    
    // =======================================================
    // DEBUG: MONITORAR ADIÇÃO DE ITENS AO COMBO
    // =======================================================
    
    // Interceptar adições ao comboItems para debug
    if (typeof window.comboItems === 'undefined') {
        window.comboItems = [];
    }
    
    // Criar proxy para monitorar mudanças
    const originalComboItems = window.comboItems;
    window.comboItems = new Proxy(originalComboItems, {
        set(target, property, value) {
            if (property === 'length' || !isNaN(property)) {
                console.log('📦 [DEBUG] Item adicionado ao comboItems:', value);
                console.log('📦 [DEBUG] Estrutura do item:', JSON.stringify(value, null, 2));
            }
            target[property] = value;
            return true;
        }
    });
    
    console.log('✅ Fix para coleta de itens do combo configurado');
});
