/**
 * CORREÇÃO DEFINITIVA - Exclusão de Lotes com Promise
 * Este arquivo corrige o uso incorreto de window.customDialog.confirm
 */

(function() {
    console.log('🚨 CORREÇÃO DEFINITIVA PROMISE - Iniciando...');
    
    // Aguardar tudo carregar
    function aplicarCorrecaoDefinitiva() {
        console.log('🔧 Aplicando correção definitiva de exclusão com Promise...');
        
        // SOBRESCREVER A FUNÇÃO COM IMPLEMENTAÇÃO CORRETA
        window.excluirLote = async function(loteId, tipo) {
            console.log('🗑️ [CORREÇÃO PROMISE] Excluindo lote:', loteId, tipo);
            
            // Converter loteId para número se necessário
            if (typeof loteId === 'string') {
                loteId = parseInt(loteId) || loteId;
            }
            
            // Verificar se customDialog existe
            if (!window.customDialog || !window.customDialog.confirm) {
                console.error('❌ window.customDialog não está disponível!');
                // Fallback para confirm nativo
                if (confirm('Tem certeza que deseja excluir este lote?')) {
                    executarExclusao(loteId, tipo);
                }
                return;
            }
            
            // Verificar ingressos associados
            let temIngressos = false;
            
            if (window.temporaryTickets && window.temporaryTickets.tickets) {
                temIngressos = window.temporaryTickets.tickets.some(function(ticket) {
                    return ticket.loteId == loteId || ticket.lote_id == loteId;
                });
            }
            
            if (!temIngressos && window.ingressosTemporarios) {
                if (window.ingressosTemporarios.pagos) {
                    temIngressos = window.ingressosTemporarios.pagos.some(function(ing) {
                        return ing.loteId == loteId;
                    });
                }
                if (!temIngressos && window.ingressosTemporarios.gratuitos) {
                    temIngressos = window.ingressosTemporarios.gratuitos.some(function(ing) {
                        return ing.loteId == loteId;
                    });
                }
            }
            
            if (temIngressos) {
                await window.customDialog.alert('Este lote possui ingressos associados e não pode ser excluído.', 'error');
                return;
            }
            
            // USAR O CONFIRM CORRETAMENTE (PROMISE)
            try {
                const resultado = await window.customDialog.confirm('Tem certeza que deseja excluir este lote?');
                
                if (resultado === 'confirm') {
                    executarExclusao(loteId, tipo);
                } else {
                    console.log('❌ Exclusão cancelada pelo usuário');
                }
            } catch (error) {
                console.error('❌ Erro ao mostrar dialog:', error);
            }
        };
        
        // Função auxiliar para executar a exclusão
        function executarExclusao(loteId, tipo) {
            console.log('✅ Executando exclusão do lote...');
            
            if (tipo === 'data') {
                window.lotesData.porData = window.lotesData.porData.filter(function(l) {
                    return l.id != loteId;
                });
            } else {
                window.lotesData.porPercentual = window.lotesData.porPercentual.filter(function(l) {
                    return l.id != loteId;
                });
            }
            
            // Renomear lotes
            if (window.renomearLotesAutomaticamente) {
                window.renomearLotesAutomaticamente();
            }
            
            // Atualizar visualização
            if (window.atualizarVisualizacao) {
                window.atualizarVisualizacao();
            } else if (window.renderizarLotesPorData) {
                window.renderizarLotesPorData();
                window.renderizarLotesPorPercentual();
            }
            
            // Salvar
            if (window.salvarLotes) {
                window.salvarLotes();
            } else if (window.salvarLotesNoCookie) {
                window.salvarLotesNoCookie();
            }
            
            // Mostrar sucesso
            window.customDialog.alert('Lote excluído com sucesso!', 'success');
            
            console.log('✅ Lote excluído com sucesso!');
        }
        
        // SOBRESCREVER AS FUNÇÕES ANTIGAS TAMBÉM
        window.excluirLoteData = function(id) {
            console.log('🔄 Redirecionando excluirLoteData para excluirLote');
            window.excluirLote(id, 'data');
        };
        
        window.excluirLotePercentual = function(id) {
            console.log('🔄 Redirecionando excluirLotePercentual para excluirLote');
            window.excluirLote(id, 'percentual');
        };
        
        console.log('✅ CORREÇÃO PROMISE APLICADA COM SUCESSO!');
        console.log('📌 Função excluirLote:', typeof window.excluirLote);
        console.log('📌 customDialog disponível:', !!window.customDialog);
        
        // Testar se confirm retorna Promise - COMENTADO PARA EVITAR DIALOG DESNECESSÁRIO
        /*
        if (window.customDialog && window.customDialog.confirm) {
            const testResult = window.customDialog.confirm('test');
            console.log('📌 customDialog.confirm retorna:', testResult);
            console.log('📌 É uma Promise?', testResult instanceof Promise);
            // Cancelar o dialog de teste
            if (testResult && testResult.then) {
                testResult.then(() => {}).catch(() => {});
                setTimeout(() => {
                    if (window.customDialog.activeDialog) {
                        window.customDialog.close();
                    }
                }, 100);
            }
        }
        */
    }
    
    // Aplicar correção quando tudo estiver pronto
    if (document.readyState === 'complete') {
        setTimeout(aplicarCorrecaoDefinitiva, 1000);
    } else {
        window.addEventListener('load', function() {
            setTimeout(aplicarCorrecaoDefinitiva, 1000);
        });
    }
    
    // Aplicar também no DOMContentLoaded como backup
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(aplicarCorrecaoDefinitiva, 1500);
    });
    
})();