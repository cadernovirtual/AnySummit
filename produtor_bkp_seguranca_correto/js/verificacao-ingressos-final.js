/**
 * CORREÇÃO FINAL - Verificação de Ingressos em Lotes
 * Impede exclusão de lotes com ingressos associados
 */

(function() {
    console.log('🛡️ CORREÇÃO FINAL - Verificação de Ingressos');
    
    setTimeout(function() {
        
        // FUNÇÃO DEFINITIVA DE VERIFICAÇÃO
        window.verificarIngressosNoLote = function(loteId) {
            console.log('🔍 [VERIFICAÇÃO COMPLETA] Procurando ingressos no lote:', loteId);
            
            // Normalizar o ID do lote
            const loteIdString = String(loteId);
            const loteIdNumber = parseInt(loteId) || 0;
            
            let temIngressos = false;
            let ingressosEncontrados = [];
            
            // 1. Verificar em window.ingressosTemporarios
            if (window.ingressosTemporarios) {
                console.log('📋 Verificando ingressosTemporarios...');
                
                // Pagos
                if (window.ingressosTemporarios.pagos && Array.isArray(window.ingressosTemporarios.pagos)) {
                    window.ingressosTemporarios.pagos.forEach(function(ing, idx) {
                        const ingLoteId = String(ing.loteId || '');
                        if (ingLoteId == loteIdString || ingLoteId == loteIdNumber || 
                            ingLoteId.includes(loteIdString) || loteIdString.includes(ingLoteId)) {
                            temIngressos = true;
                            ingressosEncontrados.push({
                                tipo: 'Pago',
                                titulo: ing.title || ing.nome || `Ingresso ${idx + 1}`,
                                preco: ing.price || ing.valor
                            });
                        }
                    });
                }
                
                // Gratuitos
                if (window.ingressosTemporarios.gratuitos && Array.isArray(window.ingressosTemporarios.gratuitos)) {
                    window.ingressosTemporarios.gratuitos.forEach(function(ing, idx) {
                        const ingLoteId = String(ing.loteId || '');
                        if (ingLoteId == loteIdString || ingLoteId == loteIdNumber || 
                            ingLoteId.includes(loteIdString) || loteIdString.includes(ingLoteId)) {
                            temIngressos = true;
                            ingressosEncontrados.push({
                                tipo: 'Gratuito',
                                titulo: ing.title || ing.nome || `Ingresso Gratuito ${idx + 1}`,
                                preco: 'Grátis'
                            });
                        }
                    });
                }
                
                // Combos
                if (window.ingressosTemporarios.combos && Array.isArray(window.ingressosTemporarios.combos)) {
                    window.ingressosTemporarios.combos.forEach(function(combo, idx) {
                        const comboLoteId = String(combo.loteId || '');
                        if (comboLoteId == loteIdString || comboLoteId == loteIdNumber || 
                            comboLoteId.includes(loteIdString) || loteIdString.includes(comboLoteId)) {
                            temIngressos = true;
                            ingressosEncontrados.push({
                                tipo: 'Combo',
                                titulo: combo.title || combo.nome || `Combo ${idx + 1}`,
                                preco: combo.price || combo.valor
                            });
                        }
                    });
                }
            }
            
            // 2. Verificar em window.temporaryTickets
            if (!temIngressos && window.temporaryTickets && window.temporaryTickets.tickets) {
                console.log('📋 Verificando temporaryTickets...');
                
                window.temporaryTickets.tickets.forEach(function(ticket, idx) {
                    const ticketLoteId = String(ticket.loteId || ticket.lote_id || '');
                    if (ticketLoteId == loteIdString || ticketLoteId == loteIdNumber || 
                        ticketLoteId.includes(loteIdString) || loteIdString.includes(ticketLoteId)) {
                        temIngressos = true;
                        ingressosEncontrados.push({
                            tipo: ticket.type || 'Ingresso',
                            titulo: ticket.title || ticket.name || `Ticket ${idx + 1}`,
                            preco: ticket.price || ticket.value
                        });
                    }
                });
            }
            
            // 3. Verificar no DOM (visual)
            if (!temIngressos) {
                console.log('📋 Verificando no DOM...');
                
                const selectors = [
                    `.ticket-item[data-lote-id="${loteIdString}"]`,
                    `.ticket-item[data-lote-id="${loteIdNumber}"]`,
                    `.ingresso-item[data-lote="${loteIdString}"]`,
                    `.ingresso-item[data-lote="${loteIdNumber}"]`
                ];
                
                selectors.forEach(function(selector) {
                    const elementos = document.querySelectorAll(selector);
                    if (elementos.length > 0) {
                        temIngressos = true;
                        elementos.forEach(function(el) {
                            ingressosEncontrados.push({
                                tipo: 'Visual',
                                titulo: el.textContent || 'Ingresso',
                                preco: '-'
                            });
                        });
                    }
                });
            }
            
            // Mostrar resultado no console
            if (temIngressos) {
                console.log('⚠️ LOTE TEM INGRESSOS ASSOCIADOS!');
                console.log('Ingressos encontrados:', ingressosEncontrados);
            } else {
                console.log('✅ Lote sem ingressos, pode excluir');
            }
            
            return temIngressos;
        };
        
        // SOBRESCREVER FUNÇÃO DE EXCLUSÃO
        window.excluirLote = async function(loteId, tipo) {
            console.log('🗑️ [EXCLUSÃO SEGURA] Tentando excluir lote:', loteId, tipo);
            
            // VERIFICAR INGRESSOS
            const temIngressos = window.verificarIngressosNoLote(loteId);
            
            if (temIngressos) {
                console.log('❌ EXCLUSÃO BLOQUEADA - Lote tem ingressos!');
                
                if (window.customDialog && window.customDialog.alert) {
                    await window.customDialog.alert(
                        'Este lote possui ingressos associados e não pode ser excluído.<br><br>' +
                        'Por favor, remova todos os ingressos deste lote antes de excluí-lo.',
                        '⚠️ Atenção'
                    );
                } else {
                    alert('Este lote possui ingressos associados!\n\nRemova todos os ingressos antes de excluir o lote.');
                }
                return; // PARAR AQUI
            }
            
            // Se não tem ingressos, continuar com exclusão
            console.log('✅ Lote sem ingressos, prosseguindo com exclusão...');
            
            let confirmar = false;
            if (window.customDialog && window.customDialog.confirm) {
                const resultado = await window.customDialog.confirm('Tem certeza que deseja excluir este lote?');
                confirmar = (resultado === 'confirm');
            } else {
                confirmar = confirm('Tem certeza que deseja excluir este lote?');
            }
            
            if (confirmar) {
                // Excluir o lote
                if (tipo === 'data') {
                    window.lotesData.porData = window.lotesData.porData.filter(l => l.id != loteId);
                } else {
                    window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id != loteId);
                }
                
                // Renomear
                if (window.renomearLotesAutomaticamente) {
                    window.renomearLotesAutomaticamente();
                }
                
                // Atualizar tela
                if (window.atualizarTelaLotes) {
                    window.atualizarTelaLotes();
                }
                
                // Salvar
                if (window.salvarLotesNoCookie) {
                    window.salvarLotesNoCookie();
                }
                
                // Mensagem de sucesso
                if (window.customDialog && window.customDialog.alert) {
                    window.customDialog.alert('Lote excluído com sucesso!', 'success');
                }
                
                console.log('✅ Lote excluído com sucesso!');
            }
        };
        
        console.log('✅ VERIFICAÇÃO DE INGRESSOS INSTALADA!');
        
    }, 3000); // Aguardar tudo carregar
    
})();