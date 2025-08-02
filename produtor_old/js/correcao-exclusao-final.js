/**
 * CORREÇÃO FINAL DEFINITIVA - Exclusão de Lotes
 * Este arquivo DEVE ser carregado por ÚLTIMO
 */

(function() {
    console.log('🚨 CORREÇÃO FINAL DEFINITIVA - Iniciando...');
    
    // Aguardar tudo carregar
    function aplicarCorrecaoFinal() {
        console.log('🔧 Aplicando correção final de exclusão de lotes...');
        
        // SOBRESCREVER A FUNÇÃO DEFINITIVAMENTE
        window.excluirLote = function(loteId, tipo) {
            console.log('🗑️ [CORREÇÃO FINAL] Excluindo lote:', loteId, tipo);
            
            // Converter loteId para número se necessário
            if (typeof loteId === 'string') {
                loteId = parseInt(loteId) || loteId;
            }
            
            // Verificar se customDialog existe
            if (!window.customDialog || !window.customDialog.confirm) {
                console.error('❌ window.customDialog não está disponível!');
                alert('Erro: Sistema de diálogos não carregado.');
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
                window.customDialog.alert('Este lote possui ingressos associados e não pode ser excluído.', 'error');
                return;
            }
            
            // USAR O CONFIRM CORRETAMENTE
            window.customDialog.confirm(
                'Tem certeza que deseja excluir este lote?',
                function() {
                    // Função de confirmação
                    console.log('✅ Confirmado! Excluindo lote...');
                    
                    if (tipo === 'data') {
                        window.lotesData.porData = window.lotesData.porData.filter(function(l) {
                            return l.id != loteId; // Usar != para comparação não estrita
                        });
                    } else {
                        window.lotesData.porPercentual = window.lotesData.porPercentual.filter(function(l) {
                            return l.id != loteId; // Usar != para comparação não estrita
                        });
                    }
                    
                    // Atualizar visualização
                    if (window.atualizarVisualizacao) {
                        window.atualizarVisualizacao();
                    }
                    
                    // Salvar
                    if (window.salvarLotes) {
                        window.salvarLotes();
                    }
                    
                    // Mostrar sucesso
                    window.customDialog.alert('Lote excluído com sucesso!', 'success');
                }
            );
        };
        
        // SOBRESCREVER AS FUNÇÕES ANTIGAS TAMBÉM
        window.excluirLoteData = function(id) {
            console.log('🔄 Redirecionando excluirLoteData para excluirLote');
            window.excluirLote(id, 'data');
        };
        
        window.excluirLotePercentual = function(id) {
            console.log('🔄 Redirecionando excluirLotePercentual para excluirLote');
            window.excluirLote(id, 'percentual');
        };
        
        console.log('✅ CORREÇÃO FINAL APLICADA COM SUCESSO!');
        console.log('📌 Função excluirLote:', typeof window.excluirLote);
        console.log('📌 customDialog disponível:', !!window.customDialog);
    }
    
    // Aplicar correção quando tudo estiver pronto
    if (document.readyState === 'complete') {
        // Aguardar um pouco para garantir que todos os scripts carregaram
        setTimeout(aplicarCorrecaoFinal, 500);
    } else {
        window.addEventListener('load', function() {
            setTimeout(aplicarCorrecaoFinal, 500);
        });
    }
    
    // Aplicar também no DOMContentLoaded como backup
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(aplicarCorrecaoFinal, 1000);
    });
    
})();