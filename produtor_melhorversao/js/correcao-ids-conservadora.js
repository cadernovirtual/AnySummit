/**
 * CORREÇÃO CONSERVADORA - CONVERTER IDs TEMPORÁRIOS PARA REAIS
 * Apenas converte IDs existentes sem modificar outras funcionalidades
 */

(function() {
    console.log('🔧 CORREÇÃO CONSERVADORA - Convertendo IDs temporários...');
    
    setTimeout(function() {
        
        // ===== FUNÇÃO PARA CONVERTER IDs TEMPORÁRIOS =====
        function converterIdsTemporarios() {
            console.log('🔄 Verificando e convertendo IDs temporários...');
            
            // Verificar se há lotes com IDs temporários
            let precisaConversao = false;
            
            if (window.lotesData?.porData) {
                window.lotesData.porData.forEach(lote => {
                    if (typeof lote.id === 'string' && lote.id.includes('lote_data_')) {
                        console.log('📅 Encontrado ID temporário para conversão:', lote.id);
                        precisaConversao = true;
                    }
                });
            }
            
            if (window.lotesData?.porPercentual) {
                window.lotesData.porPercentual.forEach(lote => {
                    if (typeof lote.id === 'string' && (lote.id.includes('lote_perc_') || lote.id.includes('lote_percentual_'))) {
                        console.log('📊 Encontrado ID temporário para conversão:', lote.id);
                        precisaConversao = true;
                    }
                });
            }
            
            if (precisaConversao) {
                console.log('⚠️ IDs temporários detectados. Iniciando processo de conversão...');
                buscarLotesDoBackend();
            } else {
                console.log('✅ Todos os IDs já são reais');
            }
        }
        
        // ===== BUSCAR LOTES REAIS DO BACKEND =====
        async function buscarLotesDoBackend() {
            try {
                const eventoId = window.getEventoId?.() || 
                               new URLSearchParams(window.location.search).get('evento_id') ||
                               window.eventoAtual?.id;
                
                if (!eventoId) {
                    console.error('❌ ID do evento não encontrado para conversão');
                    return;
                }
                
                console.log('📡 Buscando lotes reais do backend...');
                
                const response = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=retomar_evento&evento_id=${eventoId}`
                });
                
                const result = await response.json();
                
                if (result.sucesso && result.lotes) {
                    console.log('✅ Lotes reais recebidos do backend:', result.lotes);
                    substituirIdsTemporarios(result.lotes);
                } else {
                    console.error('❌ Erro ao buscar lotes do backend:', result);
                }
                
            } catch (error) {
                console.error('❌ Erro na requisição ao backend:', error);
            }
        }
        
        // ===== SUBSTITUIR IDs TEMPORÁRIOS PELOS REAIS =====
        function substituirIdsTemporarios(lotesReais) {
            console.log('🔄 Substituindo IDs temporários pelos reais...');
            
            // Mapear lotes por características para encontrar correspondências
            const lotesData = lotesReais.filter(l => l.tipo === 'data');
            const lotesPercentual = lotesReais.filter(l => l.tipo === 'percentual');
            
            // Substituir lotes por data
            if (window.lotesData?.porData) {
                window.lotesData.porData.forEach((loteLocal, index) => {
                    if (typeof loteLocal.id === 'string' && loteLocal.id.includes('lote_data_')) {
                        // Tentar encontrar correspondência por datas
                        const loteReal = lotesData.find(lr => 
                            lr.data_inicio === loteLocal.dataInicio && 
                            lr.data_fim === loteLocal.dataFim
                        );
                        
                        if (loteReal) {
                            console.log(`🔄 Convertendo lote por data: ${loteLocal.id} → ${loteReal.id}`);
                            window.lotesData.porData[index].id = parseInt(loteReal.id);
                        }
                    }
                });
            }
            
            // Substituir lotes por percentual
            if (window.lotesData?.porPercentual) {
                window.lotesData.porPercentual.forEach((loteLocal, index) => {
                    if (typeof loteLocal.id === 'string' && (loteLocal.id.includes('lote_perc_') || loteLocal.id.includes('lote_percentual_'))) {
                        // Tentar encontrar correspondência por percentual
                        const loteReal = lotesPercentual.find(lr => 
                            parseInt(lr.percentual_venda) === parseInt(loteLocal.percentual)
                        );
                        
                        if (loteReal) {
                            console.log(`🔄 Convertendo lote percentual: ${loteLocal.id} → ${loteReal.id}`);
                            window.lotesData.porPercentual[index].id = parseInt(loteReal.id);
                        }
                    }
                });
            }
            
            // Re-renderizar interface com IDs corretos
            console.log('🖼️ Re-renderizando interface com IDs corretos...');
            if (window.renderizarInterfaceComBotoes) {
                window.renderizarInterfaceComBotoes();
            } else if (window.atualizarTelaLotes) {
                window.atualizarTelaLotes();
            } else {
                if (window.renderizarLotesPorData) window.renderizarLotesPorData();
                if (window.renderizarLotesPorPercentual) window.renderizarLotesPorPercentual();
            }
            
            console.log('✅ Conversão de IDs concluída!');
            verificarConversao();
        }
        
        // ===== VERIFICAR SE CONVERSÃO FOI BEM-SUCEDIDA =====
        function verificarConversao() {
            console.log('🔍 Verificando resultado da conversão...');
            
            let todosConvertidos = true;
            
            if (window.lotesData?.porData) {
                window.lotesData.porData.forEach(lote => {
                    if (typeof lote.id === 'string') {
                        console.log('⚠️ ID ainda temporário (data):', lote.id);
                        todosConvertidos = false;
                    }
                });
            }
            
            if (window.lotesData?.porPercentual) {
                window.lotesData.porPercentual.forEach(lote => {
                    if (typeof lote.id === 'string') {
                        console.log('⚠️ ID ainda temporário (percentual):', lote.id);
                        todosConvertidos = false;
                    }
                });
            }
            
            if (todosConvertidos) {
                console.log('✅ TODOS OS IDs FORAM CONVERTIDOS PARA REAIS!');
                console.log('📅 Lotes por data:', window.lotesData?.porData?.map(l => ({ id: l.id, tipo: typeof l.id })));
                console.log('📊 Lotes por percentual:', window.lotesData?.porPercentual?.map(l => ({ id: l.id, tipo: typeof l.id })));
            } else {
                console.log('❌ Alguns IDs ainda são temporários. Pode ser necessário recarregar a página.');
            }
        }
        
        // ===== EXECUTAR CONVERSÃO =====
        converterIdsTemporarios();
        
        // Função de teste para verificar
        window.verificarConversaoIds = function() {
            console.clear();
            console.log('🔍 === VERIFICAÇÃO DE CONVERSÃO DE IDs ===');
            verificarConversao();
        };
        
        console.log('✅ Correção conservadora carregada');
        console.log('💡 Use verificarConversaoIds() para verificar status');
        
    }, 2000); // Aguardar outros scripts carregarem
    
})();
