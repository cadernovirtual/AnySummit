/**
 * TESTE: Verificar se salvamento de lotes funciona na etapa 5
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Função para testar salvamento de lotes
    window.testarSalvamentoLotes = function() {
        console.log('🧪 Testando salvamento de lotes...');
        
        // Verificar se há lotes
        console.log('📊 Dados atuais:');
        console.log('  - window.lotesData:', window.lotesData);
        console.log('  - Total lotes por data:', window.lotesData?.porData?.length || 0);
        console.log('  - Total lotes por percentual:', window.lotesData?.porPercentual?.length || 0);
        
        // Verificar elementos na interface
        const lotesPorData = document.querySelectorAll('#lotesPorDataList .lote-item');
        const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentualList .lote-item');
        
        console.log('🖥️ Interface:');
        console.log('  - Lotes por data visíveis:', lotesPorData.length);
        console.log('  - Lotes por percentual visíveis:', lotesPorPercentual.length);
        
        // Testar função de verificação
        if (typeof window.verificarSeTemLotesParaSalvar === 'function') {
            const temLotes = window.verificarSeTemLotesParaSalvar();
            console.log('✅ Função verificarSeTemLotesParaSalvar retornou:', temLotes);
        } else {
            console.log('❌ Função verificarSeTemLotesParaSalvar não encontrada');
        }
        
        // Simular salvamento da etapa 5
        const eventoId = new URLSearchParams(window.location.search).get('evento_id') || '49';
        
        // Chamar função interna para coletar dados (se existir)
        let lotes = [];
        try {
            // Tentar acessar a função interna
            const scriptContent = document.querySelector('script[src*="wizard-database.js"]');
            if (window.coletarDadosLotes) {
                lotes = window.coletarDadosLotes();
            } else {
                console.log('⚠️ Função coletarDadosLotes não disponível globalmente');
                
                // Coletar manualmente
                if (window.lotesData) {
                    const lotesData = window.lotesData;
                    
                    // Lotes por data
                    if (lotesData.porData) {
                        lotesData.porData.forEach((lote, index) => {
                            lotes.push({
                                nome: lote.nome || `Lote ${index + 1}`,
                                tipo: 'data',
                                data_inicio: lote.dataInicio,
                                data_fim: lote.dataFim,
                                percentual_aumento_valor: lote.percentualAumento || 0,
                                divulgar_criterio: lote.divulgar ? 1 : 0
                            });
                        });
                    }
                    
                    // Lotes por percentual
                    if (lotesData.porPercentual) {
                        lotesData.porPercentual.forEach((lote, index) => {
                            lotes.push({
                                nome: lote.nome || `Lote Percentual ${index + 1}`,
                                tipo: 'percentual',
                                percentual_venda: lote.percentual,
                                percentual_aumento_valor: lote.percentualAumento || 0,
                                divulgar_criterio: lote.divulgar ? 1 : 0
                            });
                        });
                    }
                }
            }
        } catch (e) {
            console.error('❌ Erro ao coletar lotes:', e);
        }
        
        console.log('📦 Lotes coletados:', lotes);
        
        if (lotes.length > 0) {
            console.log('🚀 Tentando salvar lotes...');
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'salvar_etapa',
                    evento_id: eventoId,
                    etapa: '5',
                    lotes: JSON.stringify(lotes)
                })
            })
            .then(response => response.text())
            .then(data => {
                console.log('📥 Resposta do salvamento:', data);
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.sucesso) {
                        console.log('✅ LOTES SALVOS COM SUCESSO!');
                        alert('✅ Lotes salvos com sucesso!');
                    } else {
                        console.error('❌ Erro ao salvar:', jsonData.erro);
                        alert('❌ Erro: ' + jsonData.erro);
                    }
                } catch (e) {
                    console.error('❌ Resposta não é JSON:', data);
                    alert('❌ Erro na resposta do servidor');
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição:', error);
                alert('❌ Erro na requisição: ' + error.message);
            });
        } else {
            console.log('⚠️ Nenhum lote para salvar');
            alert('⚠️ Nenhum lote encontrado para salvar');
        }
    };
    
    console.log('🧪 Teste de salvamento de lotes carregado. Use: testarSalvamentoLotes()');
});
