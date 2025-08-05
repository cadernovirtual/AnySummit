/**
 * CORREÇÃO ESPECÍFICA - LOTES POR PERCENTUAL
 * Corrige:
 * 1. Valor sempre 100 ao salvar
 * 2. Salvamento imediato no banco após criação
 */

(function() {
    console.log('📊 CORREÇÃO LOTES PERCENTUAL - Iniciando...');
    
    setTimeout(function() {
        
        // ===== SOBRESCREVER CRIAÇÃO DE LOTE PERCENTUAL =====
        window.criarLotePercentual = async function() {
            console.log('📊 [CORREÇÃO] Criando lote percentual...');
            
            try {
                // Pegar valor real do campo
                const percentualInput = document.getElementById('lotePercentualValor');
                const divulgarInput = document.getElementById('lotePercentualDivulgar');
                
                if (!percentualInput) {
                    console.error('❌ Campo lotePercentualValor não encontrado');
                    alert('Erro: Campo de percentual não encontrado');
                    return;
                }
                
                const percentual = parseInt(percentualInput.value);
                const divulgar = divulgarInput ? divulgarInput.checked : false;
                
                console.log('📊 Valores capturados:', { 
                    percentual_raw: percentualInput.value,
                    percentual_parsed: percentual, 
                    divulgar: divulgar 
                });
                
                // Validações
                if (!percentual || isNaN(percentual) || percentual < 1 || percentual > 100) {
                    alert('Por favor, informe um percentual válido entre 1 e 100.');
                    return;
                }
                
                // Verificar duplicatas
                const loteComMesmoPercentual = window.lotesData?.porPercentual?.find(l => l.percentual === percentual);
                if (loteComMesmoPercentual) {
                    alert('Já existe um lote com este percentual. Os percentuais não podem coincidir.');
                    return;
                }
                
                // Pegar evento_id
                const eventoId = window.getEventoId?.() || 
                               new URLSearchParams(window.location.search).get('evento_id') ||
                               window.eventoAtual?.id;
                
                if (!eventoId) {
                    throw new Error('ID do evento não encontrado');
                }
                
                console.log('📡 Salvando lote no MySQL imediatamente...', { 
                    percentual: percentual, 
                    divulgar: divulgar,
                    eventoId: eventoId 
                });
                
                // Nome temporário (será renomeado depois)
                const nomeTemporario = `Lote Temporário ${Date.now()}`;
                
                // SALVAR NO BANCO IMEDIATAMENTE
                const response = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: `action=criar_lote_percentual&evento_id=${eventoId}&nome=${encodeURIComponent(nomeTemporario)}&percentual_venda=${percentual}&divulgar_criterio=${divulgar ? 1 : 0}`
                });
                
                const resultText = await response.text();
                console.log('📡 Resposta do backend:', resultText);
                
                let result;
                try {
                    result = JSON.parse(resultText);
                } catch (e) {
                    console.error('❌ Erro ao parsear JSON:', e);
                    throw new Error('Resposta inválida do servidor: ' + resultText);
                }
                
                if (result.sucesso && result.lote_id) {
                    console.log('✅ Lote salvo no MySQL com ID:', result.lote_id);
                    
                    // Criar objeto do lote com ID real do banco
                    const lote = {
                        id: result.lote_id,
                        nome: `Lote ${(window.lotesData?.porPercentual?.length || 0) + 1}`,
                        percentual: percentual,
                        divulgar: divulgar,
                        tipo: 'POR PERCENTUAL DE VENDA'
                    };
                    
                    console.log('📦 Lote criado:', lote);
                    
                    // Adicionar ao array local
                    if (!window.lotesData) {
                        window.lotesData = { porData: [], porPercentual: [] };
                    }
                    if (!window.lotesData.porPercentual) {
                        window.lotesData.porPercentual = [];
                    }
                    
                    window.lotesData.porPercentual.push(lote);
                    
                    // Renomear automaticamente
                    if (window.renomearLotesAutomaticamente) {
                        window.renomearLotesAutomaticamente();
                    }
                    
                    // Atualizar interface
                    if (window.renderizarInterfaceComBotoes) {
                        window.renderizarInterfaceComBotoes();
                    } else if (window.renderizarLotesPorPercentual) {
                        window.renderizarLotesPorPercentual();
                    }
                    
                    // Salvar no cookie
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                    
                    // Limpar campos
                    percentualInput.value = '';
                    if (divulgarInput) {
                        divulgarInput.checked = true;
                    }
                    
                    // Fechar modal
                    if (window.closeModal) {
                        window.closeModal('lotePercentualModal');
                    }
                    
                    console.log('✅ Lote percentual criado e salvo com sucesso!');
                    
                } else {
                    throw new Error(result.erro || 'Erro ao salvar lote no banco de dados');
                }
                
            } catch (error) {
                console.error('❌ Erro ao criar lote percentual:', error);
                alert('Erro ao criar lote: ' + error.message);
            }
        };
        
        // ===== SOBRESCREVER SALVAMENTO DE LOTE PERCENTUAL EDITADO =====
        window.salvarLotePercentual = async function() {
            console.log('💾 [CORREÇÃO] Salvando edição de lote percentual...');
            
            try {
                const id = document.getElementById('editLotePercentualId').value;
                const percentualInput = document.getElementById('editLotePercentualValor');
                const divulgarInput = document.getElementById('editLotePercentualDivulgar');
                
                if (!percentualInput) {
                    console.error('❌ Campo editLotePercentualValor não encontrado');
                    return;
                }
                
                const percentual = parseInt(percentualInput.value);
                const divulgar = divulgarInput ? divulgarInput.checked : false;
                
                console.log('💾 Valores para salvar:', { 
                    id: id,
                    percentual_raw: percentualInput.value,
                    percentual_parsed: percentual, 
                    divulgar: divulgar 
                });
                
                // Validações
                if (!percentual || isNaN(percentual) || percentual < 1 || percentual > 100) {
                    alert('Por favor, informe um percentual válido entre 1 e 100.');
                    return;
                }
                
                // Verificar duplicatas (exceto o próprio lote)
                const loteComMesmoPercentual = window.lotesData?.porPercentual?.find(l => 
                    l.percentual === percentual && l.id != id
                );
                if (loteComMesmoPercentual) {
                    alert('Já existe outro lote com este percentual. Os percentuais não podem coincidir.');
                    return;
                }
                
                // Encontrar o lote no array local
                const index = window.lotesData?.porPercentual?.findIndex(l => l.id == id);
                if (index === -1) {
                    console.error('❌ Lote não encontrado no array local');
                    return;
                }
                
                // Atualizar no array local
                window.lotesData.porPercentual[index] = {
                    ...window.lotesData.porPercentual[index],
                    percentual: percentual,
                    divulgar: divulgar
                };
                
                // Renomear
                if (window.renomearLotesAutomaticamente) {
                    window.renomearLotesAutomaticamente();
                }
                
                // Atualizar interface
                if (window.renderizarInterfaceComBotoes) {
                    window.renderizarInterfaceComBotoes();
                } else if (window.renderizarLotesPorPercentual) {
                    window.renderizarLotesPorPercentual();
                }
                
                // Salvar no cookie
                if (window.salvarLotesNoCookie) {
                    window.salvarLotesNoCookie();
                }
                
                // Fechar modal
                if (window.closeModal) {
                    window.closeModal('editLotePercentualModal');
                }
                
                console.log('✅ Lote percentual editado com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao salvar edição de lote percentual:', error);
                alert('Erro ao salvar: ' + error.message);
            }
        };
        
        // ===== INTERCEPTAR CRIAÇÃO DE LOTE POR DATA PARA SALVAMENTO IMEDIATO =====
        const originalCriarLoteData = window.criarLoteData;
        if (originalCriarLoteData) {
            window.criarLoteData = async function() {
                console.log('📅 [CORREÇÃO] Interceptando criação de lote por data para salvamento imediato');
                
                try {
                    // Chamar função original
                    originalCriarLoteData.call(this);
                    
                    // TODO: Implementar salvamento imediato para lotes por data também
                    // Por enquanto, manter comportamento atual
                    
                } catch (error) {
                    console.error('❌ Erro na criação interceptada de lote por data:', error);
                }
            };
        }
        
        console.log('✅ Correção de lotes percentual aplicada');
        console.log('🎯 Problemas corrigidos:');
        console.log('   1. ✅ Valor correto capturado do campo (não mais 100 fixo)');
        console.log('   2. ✅ Salvamento imediato no MySQL após criação');
        console.log('   3. ✅ Edição com valores corretos');
        
    }, 2500); // Aguardar outros scripts carregarem
    
})();
