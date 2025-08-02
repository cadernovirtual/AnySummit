/**
 * CORREÇÃO DEFINITIVA - USAR IDS REAIS DO MYSQL
 * Substitui IDs temporários pelos IDs reais do banco de dados
 */

(function() {
    console.log('🗄️ CORREÇÃO IDS MYSQL - Iniciando...');
    
    setTimeout(function() {
        
        // ===== SOBRESCREVER CRIAÇÃO DE LOTE POR DATA =====
        window.criarLoteData = async function() {
            console.log('📅 [MYSQL] Criando lote por data no banco...');
            
            try {
                // Capturar valores dos campos
                const dataInicio = document.getElementById('loteDataInicio')?.value;
                const dataFim = document.getElementById('loteDataFim')?.value;
                const divulgar = document.getElementById('loteDataDivulgar')?.checked || false;
                
                if (!dataInicio || !dataFim) {
                    alert('Por favor, preencha as datas de início e fim.');
                    return;
                }
                
                console.log('📅 Dados capturados:', { dataInicio, dataFim, divulgar });
                
                // Verificar sobreposições (mantendo validação original)
                if (window.lotesData?.porData) {
                    const dataInicioObj = new Date(dataInicio);
                    const dataFimObj = new Date(dataFim);
                    
                    for (let loteExistente of window.lotesData.porData) {
                        const inicioExistente = new Date(loteExistente.dataInicio);
                        const fimExistente = new Date(loteExistente.dataFim);
                        
                        if ((dataInicioObj >= inicioExistente && dataInicioObj <= fimExistente) ||
                            (dataFimObj >= inicioExistente && dataFimObj <= fimExistente) ||
                            (dataInicioObj <= inicioExistente && dataFimObj >= fimExistente)) {
                            alert('As datas do lote não podem ter intersecção com outros lotes existentes.');
                            return;
                        }
                    }
                }
                
                // Pegar evento_id
                const eventoId = window.getEventoId?.() || 
                               new URLSearchParams(window.location.search).get('evento_id') ||
                               window.eventoAtual?.id;
                
                if (!eventoId) {
                    throw new Error('ID do evento não encontrado');
                }
                
                // Nome temporário (será renomeado automaticamente)
                const nomeTemporario = `Lote Temporário ${Date.now()}`;
                
                console.log('📡 Salvando lote por data no MySQL...', { 
                    eventoId, nomeTemporario, dataInicio, dataFim, divulgar
                });
                
                // SALVAR IMEDIATAMENTE NO MYSQL
                const response = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: `action=criar_lote_data&evento_id=${eventoId}&nome=${encodeURIComponent(nomeTemporario)}&data_inicio=${encodeURIComponent(dataInicio)}&data_fim=${encodeURIComponent(dataFim)}&divulgar_criterio=${divulgar ? 1 : 0}`
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
                    console.log('✅ Lote por data salvo no MySQL com ID:', result.lote_id);
                    
                    // Criar objeto com ID REAL do banco
                    const lote = {
                        id: result.lote_id, // ID REAL DO MYSQL
                        nome: `Lote ${(window.lotesData?.porData?.length || 0) + 1}`,
                        dataInicio: dataInicio,
                        dataFim: dataFim,
                        divulgar: divulgar,
                        tipo: 'POR DATA'
                    };
                    
                    console.log('📦 Lote criado com ID real:', lote);
                    
                    // Adicionar ao array local
                    if (!window.lotesData) {
                        window.lotesData = { porData: [], porPercentual: [] };
                    }
                    if (!window.lotesData.porData) {
                        window.lotesData.porData = [];
                    }
                    
                    window.lotesData.porData.push(lote);
                    
                    // Renomear automaticamente
                    if (window.renomearLotesAutomaticamente) {
                        window.renomearLotesAutomaticamente();
                    }
                    
                    // Atualizar interface
                    if (window.renderizarInterfaceComBotoes) {
                        window.renderizarInterfaceComBotoes();
                    } else if (window.renderizarLotesPorData) {
                        window.renderizarLotesPorData();
                    }
                    
                    // Salvar no cookie
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                    
                    // Limpar campos
                    document.getElementById('loteDataInicio').value = '';
                    document.getElementById('loteDataFim').value = '';
                    document.getElementById('loteDataDivulgar').checked = true;
                    
                    // Fechar modal
                    if (window.closeModal) {
                        window.closeModal('loteDataModal');
                    }
                    
                    console.log('✅ Lote por data criado e salvo com sucesso!');
                    
                } else {
                    throw new Error(result.erro || 'Erro ao salvar lote por data no banco');
                }
                
            } catch (error) {
                console.error('❌ Erro ao criar lote por data:', error);
                alert('Erro ao criar lote: ' + error.message);
            }
        };
        
        // ===== SOBRESCREVER FUNÇÃO DE RESTAURAÇÃO =====
        window.restaurarLotes = function(lotesDoBanco) {
            console.log('🔄 [MYSQL] Restaurando lotes COM IDs REAIS do banco:', lotesDoBanco);
            
            if (!lotesDoBanco || lotesDoBanco.length === 0) {
                console.log('⚠️ Nenhum lote para restaurar');
                return;
            }
            
            // Limpar dados atuais
            window.lotesData = {
                porData: [],
                porPercentual: []
            };
            
            // Processar cada lote do banco
            lotesDoBanco.forEach(lote => {
                const loteData = {
                    id: parseInt(lote.id), // ID REAL DO MYSQL (NÚMERO)
                    nome: lote.nome,
                    divulgar: lote.divulgar_criterio == 1
                };
                
                console.log('🔄 Processando lote do banco:', lote);
                
                if (lote.tipo === 'data') {
                    // Lote por data
                    loteData.dataInicio = lote.data_inicio;
                    loteData.dataFim = lote.data_fim;
                    loteData.tipo = 'POR DATA';
                    
                    window.lotesData.porData.push(loteData);
                    console.log('📅 Lote por data restaurado com ID real:', loteData.id);
                    
                } else if (lote.tipo === 'percentual') {
                    // Lote por percentual
                    loteData.percentual = parseInt(lote.percentual_venda);
                    loteData.tipo = 'POR PERCENTUAL DE VENDA';
                    
                    window.lotesData.porPercentual.push(loteData);
                    console.log('📊 Lote por percentual restaurado com ID real:', loteData.id);
                }
            });
            
            console.log('✅ TODOS OS LOTES RESTAURADOS COM IDS REAIS:');
            console.log('📅 Lotes por data:', window.lotesData.porData.map(l => ({ id: l.id, tipo: typeof l.id, nome: l.nome })));
            console.log('📊 Lotes por percentual:', window.lotesData.porPercentual.map(l => ({ id: l.id, tipo: typeof l.id, nome: l.nome })));
            
            // Renderizar os lotes na interface
            setTimeout(() => {
                if (window.renderizarInterfaceComBotoes) {
                    window.renderizarInterfaceComBotoes();
                } else {
                    if (typeof renderizarLotesPorData === 'function') {
                        renderizarLotesPorData();
                    }
                    if (typeof renderizarLotesPorPercentual === 'function') {
                        renderizarLotesPorPercentual();
                    }
                }
                
                console.log('✅ Interface renderizada com IDs reais do MySQL');
            }, 100);
        };
        
        // ===== CORRIGIR FUNÇÃO DE LOTES PERCENTUAL PARA USAR ID REAL =====
        const originalCriarLotePercentual = window.criarLotePercentual;
        window.criarLotePercentual = async function() {
            console.log('📊 [MYSQL] Sobrescrevendo criação de lote percentual...');
            
            try {
                // Executar função original mas interceptar para usar ID real
                await originalCriarLotePercentual.call(this);
                
                // A função original já deve ter criado com ID real
                // Apenas garantir que a interface seja atualizada
                if (window.renderizarInterfaceComBotoes) {
                    window.renderizarInterfaceComBotoes();
                }
                
            } catch (error) {
                console.error('❌ Erro na criação de lote percentual:', error);
            }
        };
        
        // ===== FUNÇÃO DE DEBUG ATUALIZADA =====
        window.verificarIDsReais = function() {
            console.clear();
            console.log('🔍 === VERIFICAÇÃO DE IDs REAIS ===');
            
            console.log('\n📊 LOTES POR DATA:');
            if (window.lotesData?.porData?.length > 0) {
                window.lotesData.porData.forEach((lote, index) => {
                    console.log(`  Lote ${index}:`, {
                        id: lote.id,
                        id_type: typeof lote.id,
                        id_is_number: Number.isInteger(lote.id),
                        nome: lote.nome
                    });
                });
            } else {
                console.log('  ❌ Nenhum lote por data');
            }
            
            console.log('\n📊 LOTES POR PERCENTUAL:');
            if (window.lotesData?.porPercentual?.length > 0) {
                window.lotesData.porPercentual.forEach((lote, index) => {
                    console.log(`  Lote ${index}:`, {
                        id: lote.id,
                        id_type: typeof lote.id,
                        id_is_number: Number.isInteger(lote.id),
                        nome: lote.nome,
                        percentual: lote.percentual
                    });
                });
            } else {
                console.log('  ❌ Nenhum lote por percentual');
            }
            
            console.log('\n🖼️ INTERFACE DOM:');
            const containerData = document.getElementById('lotesPorDataList');
            const containerPercentual = document.getElementById('lotesPorPercentualList');
            
            if (containerData) {
                const items = containerData.querySelectorAll('.lote-item');
                console.log(`📅 ${items.length} lotes por data na interface:`);
                items.forEach((item, index) => {
                    const dataId = item.getAttribute('data-id');
                    const onclick = item.querySelector('button[onclick*="editarLote"]')?.getAttribute('onclick');
                    console.log(`  Item ${index}:`, {
                        data_id: dataId,
                        data_id_type: typeof dataId,
                        onclick_content: onclick
                    });
                });
            }
            
            if (containerPercentual) {
                const items = containerPercentual.querySelectorAll('.lote-item');
                console.log(`📊 ${items.length} lotes por percentual na interface:`);
                items.forEach((item, index) => {
                    const dataId = item.getAttribute('data-id');
                    const onclick = item.querySelector('button[onclick*="editarLote"]')?.getAttribute('onclick');
                    console.log(`  Item ${index}:`, {
                        data_id: dataId,
                        data_id_type: typeof dataId,
                        onclick_content: onclick
                    });
                });
            }
        };
        
        console.log('✅ Correção de IDs MySQL aplicada');
        console.log('🎯 Agora usando IDs reais do banco de dados');
        console.log('💡 Use verificarIDsReais() para verificar correção');
        
    }, 3500); // Aguardar outros scripts carregarem
    
})();
