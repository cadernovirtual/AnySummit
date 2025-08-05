/**
 * CORREÇÃO TRIPLA - Resolve 3 problemas específicos
 * 1. Refresh após exclusão
 * 2. Valor do percentual sendo ignorado
 * 3. Lote não aparecendo na edição de ingressos
 */

(function() {
    console.log('🚨 CORREÇÃO TRIPLA - Iniciando...');
    
    // Aguardar carregamento completo
    function aplicarCorrecoesTriplas() {
        console.log('🔧 Aplicando correções triplas...');
        
        // ===== CORREÇÃO 1: REFRESH APÓS EXCLUSÃO =====
        // Garantir que atualizarVisualizacao funcione corretamente
        window.atualizarVisualizacaoCompleta = function() {
            console.log('🔄 Atualizando visualização COMPLETA...');
            
            // Atualizar lotes por data
            const containerData = document.getElementById('lotesPorDataList');
            if (containerData) {
                if (window.lotesData && window.lotesData.porData && window.lotesData.porData.length > 0) {
                    containerData.innerHTML = '';
                    window.lotesData.porData.forEach(function(lote) {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    ${formatarDataBrasil(lote.dataInicio)} até ${formatarDataBrasil(lote.dataFim)}
                                    ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote('${lote.id}', 'data')" title="Excluir">🗑️</button>
                            </div>
                        `;
                        containerData.appendChild(div);
                    });
                } else {
                    containerData.innerHTML = '<div class="empty-state">Nenhum lote por data configurado</div>';
                }
            }
            
            // Atualizar lotes por percentual
            const containerPercentual = document.getElementById('lotesPorPercentualList');
            if (containerPercentual) {
                if (window.lotesData && window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
                    containerPercentual.innerHTML = '';
                    window.lotesData.porPercentual.forEach(function(lote) {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    Encerra aos ${lote.percentual}% das vendas
                                    ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote('${lote.id}', 'percentual')" title="Excluir">🗑️</button>
                            </div>
                        `;
                        containerPercentual.appendChild(div);
                    });
                } else {
                    containerPercentual.innerHTML = '<div class="empty-state">Nenhum lote por percentual configurado</div>';
                }
            }
            
            console.log('✅ Visualização atualizada!');
        };
        
        // Sobrescrever a função executarExclusao no correcao-lote-promise.js
        const originalExecutarExclusao = window.executarExclusao;
        window.executarExclusao = function(loteId, tipo) {
            console.log('🗑️ [CORREÇÃO TRIPLA] Executando exclusão com refresh garantido...');
            
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
            
            // FORÇAR ATUALIZAÇÃO COMPLETA
            window.atualizarVisualizacaoCompleta();
            
            // Salvar
            if (window.salvarLotes) {
                window.salvarLotes();
            } else if (window.salvarLotesNoCookie) {
                window.salvarLotesNoCookie();
            }
            
            // Mostrar sucesso
            if (window.customDialog) {
                window.customDialog.alert('Lote excluído com sucesso!', 'success');
            }
            
            console.log('✅ Exclusão e refresh completos!');
        };
        
        // ===== CORREÇÃO 2: VALOR DO PERCENTUAL =====
        window.criarLotePercentual = function() {
            console.log('📊 [CORREÇÃO TRIPLA] Criando lote percentual...');
            
            // PEGAR O VALOR CORRETO DO CAMPO
            const percentualInput = document.getElementById('lotePercentualValor');
            let percentual = 100; // valor padrão
            
            if (percentualInput && percentualInput.value) {
                percentual = parseInt(percentualInput.value);
                console.log('✅ Valor do percentual capturado:', percentual);
            } else {
                console.error('❌ Campo lotePercentualValor não encontrado!');
            }
            
            const divulgar = document.getElementById('lotePercentualDivulgar')?.checked || false;
            
            // Validações
            if (!percentual || isNaN(percentual) || percentual < 1 || percentual > 100) {
                alert('Por favor, informe um percentual válido entre 1 e 100.');
                return;
            }
            
            // Verificar duplicidade
            const percentualExiste = window.lotesData.porPercentual.some(function(lote) {
                return lote.percentual === percentual;
            });
            
            if (percentualExiste) {
                alert('Já existe um lote com este percentual. Os percentuais não podem coincidir.');
                return;
            }
            
            // Criar lote com o valor correto
            const novoLote = {
                id: Date.now(),
                nome: `Lote ${window.lotesData.porPercentual.length + 1}`,
                percentual: percentual, // USAR O VALOR CAPTURADO
                divulgar: divulgar,
                tipo: 'POR PERCENTUAL DE VENDA'
            };
            
            console.log('✅ Novo lote criado:', novoLote);
            
            window.lotesData.porPercentual.push(novoLote);
            
            // Renomear e atualizar
            if (window.renomearLotesAutomaticamente) {
                window.renomearLotesAutomaticamente();
            }
            
            window.atualizarVisualizacaoCompleta();
            
            if (window.salvarLotesNoCookie) {
                window.salvarLotesNoCookie();
            }
            
            // Fechar modal
            if (window.closeModal) {
                window.closeModal('lotePercentualModal');
            }
            
            // Limpar campos
            document.getElementById('lotePercentualValor').value = '';
            document.getElementById('lotePercentualDivulgar').checked = false;
        };
        
        // ===== CORREÇÃO 3: LOTE NA EDIÇÃO DE INGRESSOS =====
        // Sobrescrever função de edição de ingresso pago
        const originalEditarTicketPago = window.editarTicketPago;
        window.editarTicketPago = function(index) {
            console.log('✏️ [CORREÇÃO TRIPLA] Editando ingresso pago...');
            
            if (originalEditarTicketPago) {
                originalEditarTicketPago(index);
            }
            
            // Aguardar modal abrir e preencher lote
            setTimeout(function() {
                const ingresso = window.ingressosTemporarios?.pagos?.[index];
                if (ingresso && ingresso.loteId) {
                    const selectLote = document.getElementById('editPaidTicketLote');
                    const containerLote = document.getElementById('editPaidTicketLoteContainer');
                    
                    if (selectLote && containerLote) {
                        // Substituir select por label
                        const lote = [...window.lotesData.porData, ...window.lotesData.porPercentual]
                            .find(l => l.id == ingresso.loteId);
                        
                        if (lote) {
                            containerLote.innerHTML = `
                                <label class="form-label">Lote</label>
                                <div class="form-control-static" style="padding: 8px 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                                    <strong>${lote.nome}</strong>
                                    <input type="hidden" id="editPaidTicketLote" value="${lote.id}">
                                </div>
                                <small class="text-muted">O lote não pode ser alterado após a criação do ingresso</small>
                            `;
                            console.log('✅ Lote exibido como label:', lote.nome);
                        }
                    }
                }
            }, 300);
        };
        
        // Sobrescrever função de edição de ingresso gratuito
        const originalEditarTicketGratuito = window.editarTicketGratuito;
        window.editarTicketGratuito = function(index) {
            console.log('✏️ [CORREÇÃO TRIPLA] Editando ingresso gratuito...');
            
            if (originalEditarTicketGratuito) {
                originalEditarTicketGratuito(index);
            }
            
            // Aguardar modal abrir e preencher lote
            setTimeout(function() {
                const ingresso = window.ingressosTemporarios?.gratuitos?.[index];
                if (ingresso && ingresso.loteId) {
                    const selectLote = document.getElementById('editFreeTicketLote');
                    const containerLote = document.getElementById('editFreeTicketLoteContainer');
                    
                    if (selectLote && containerLote) {
                        // Substituir select por label
                        const lote = [...window.lotesData.porData, ...window.lotesData.porPercentual]
                            .find(l => l.id == ingresso.loteId);
                        
                        if (lote) {
                            containerLote.innerHTML = `
                                <label class="form-label">Lote</label>
                                <div class="form-control-static" style="padding: 8px 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                                    <strong>${lote.nome}</strong>
                                    <input type="hidden" id="editFreeTicketLote" value="${lote.id}">
                                </div>
                                <small class="text-muted">O lote não pode ser alterado após a criação do ingresso</small>
                            `;
                            console.log('✅ Lote exibido como label:', lote.nome);
                        }
                    }
                }
            }, 300);
        };
        
        // Função auxiliar para formatar data
        function formatarDataBrasil(dateTimeLocal) {
            if (!dateTimeLocal) return '';
            const date = new Date(dateTimeLocal);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        console.log('✅ CORREÇÕES TRIPLAS APLICADAS!');
    }
    
    // Aplicar quando tudo estiver pronto
    if (document.readyState === 'complete') {
        setTimeout(aplicarCorrecoesTriplas, 1500);
    } else {
        window.addEventListener('load', function() {
            setTimeout(aplicarCorrecoesTriplas, 1500);
        });
    }
    
})();