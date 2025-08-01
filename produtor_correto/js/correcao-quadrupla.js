/**
 * CORREÇÃO QUÁDRUPLA - Resolve 4 problemas específicos
 * 1. Refresh visual após exclusão de lotes
 * 2. Verificar ingressos antes de excluir lote
 * 3. Mostrar lote como label na edição
 * 4. Datas readonly quando lote por data
 */

(function() {
    console.log('🚨 CORREÇÃO QUÁDRUPLA - Iniciando...');
    
    // Aguardar carregamento completo
    function aplicarCorrecoesQuadruplas() {
        console.log('🔧 Aplicando correções quádruplas...');
        
        // ===== FUNÇÃO AUXILIAR: Verificar ingressos no lote =====
        window.verificarIngressosNoLote = function(loteId) {
            console.log('🔍 Verificando ingressos no lote:', loteId);
            
            let temIngressos = false;
            
            // Verificar ingressos temporários
            if (window.ingressosTemporarios) {
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
                if (!temIngressos && window.ingressosTemporarios.combos) {
                    temIngressos = window.ingressosTemporarios.combos.some(function(combo) {
                        return combo.loteId == loteId;
                    });
                }
            }
            
            // Verificar temporaryTickets
            if (!temIngressos && window.temporaryTickets && window.temporaryTickets.tickets) {
                temIngressos = window.temporaryTickets.tickets.some(function(ticket) {
                    return ticket.loteId == loteId || ticket.lote_id == loteId;
                });
            }
            
            console.log('Lote tem ingressos?', temIngressos);
            return temIngressos;
        };
        
        // ===== CORREÇÃO 1 e 2: EXCLUSÃO COM VERIFICAÇÃO E REFRESH IMEDIATO =====
        window.excluirLote = async function(loteId, tipo) {
            console.log('🗑️ [CORREÇÃO QUÁDRUPLA] Excluindo lote:', loteId, tipo);
            
            // Converter para número se necessário
            if (typeof loteId === 'string') {
                loteId = parseInt(loteId) || loteId;
            }
            
            // Verificar se tem ingressos associados
            if (window.verificarIngressosNoLote(loteId)) {
                if (window.customDialog) {
                    await window.customDialog.alert(
                        'Não é possível excluir este lote pois existem ingressos associados a ele. Remova os ingressos primeiro.',
                        'Atenção'
                    );
                } else {
                    alert('Não é possível excluir este lote pois existem ingressos associados a ele. Remova os ingressos primeiro.');
                }
                return;
            }
            
            // Confirmar exclusão
            let confirmar = false;
            if (window.customDialog && window.customDialog.confirm) {
                const resultado = await window.customDialog.confirm('Tem certeza que deseja excluir este lote?');
                confirmar = (resultado === 'confirm');
            } else {
                confirmar = confirm('Tem certeza que deseja excluir este lote?');
            }
            
            if (confirmar) {
                console.log('✅ Confirmado! Executando exclusão...');
                
                // Remover o lote do array
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
                
                // ATUALIZAR INTERFACE IMEDIATAMENTE
                atualizarInterfaceLotes();
                
                // Salvar
                if (window.salvarLotesNoCookie) {
                    window.salvarLotesNoCookie();
                }
                
                // Mostrar sucesso
                if (window.customDialog) {
                    window.customDialog.alert('Lote excluído com sucesso!', 'success');
                }
                
                console.log('✅ Lote excluído e interface atualizada!');
            }
        };
        
        // Função para atualizar interface imediatamente
        function atualizarInterfaceLotes() {
            console.log('🔄 Atualizando interface dos lotes...');
            
            // Atualizar lotes por data
            const containerData = document.getElementById('lotesPorDataList');
            if (containerData) {
                containerData.innerHTML = '';
                
                if (window.lotesData && window.lotesData.porData && window.lotesData.porData.length > 0) {
                    window.lotesData.porData.forEach(function(lote) {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.setAttribute('data-id', lote.id);
                        
                        const dataInicioFormatada = formatarDataBrasil(lote.dataInicio);
                        const dataFimFormatada = formatarDataBrasil(lote.dataFim);
                        
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    ${dataInicioFormatada} até ${dataFimFormatada}
                                    ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote(${lote.id}, 'data')" title="Excluir">🗑️</button>
                            </div>
                        `;
                        containerData.appendChild(div);
                    });
                } else {
                    // Mostrar empty state
                    const emptyState = document.getElementById('loteDataEmpty');
                    if (emptyState) {
                        emptyState.style.display = 'block';
                    }
                }
            }
            
            // Atualizar lotes por percentual
            const containerPercentual = document.getElementById('lotesPorPercentualList');
            if (containerPercentual) {
                containerPercentual.innerHTML = '';
                
                if (window.lotesData && window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
                    window.lotesData.porPercentual.forEach(function(lote) {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.setAttribute('data-id', lote.id);
                        
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    Encerra aos ${lote.percentual}% das vendas
                                    ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote(${lote.id}, 'percentual')" title="Excluir">🗑️</button>
                            </div>
                        `;
                        containerPercentual.appendChild(div);
                    });
                } else {
                    // Mostrar empty state
                    const emptyState = document.getElementById('lotePercentualEmpty');
                    if (emptyState) {
                        emptyState.style.display = 'block';
                    }
                }
            }
            
            console.log('✅ Interface atualizada!');
        }
        
        // ===== CORREÇÃO 3 e 4: EDIÇÃO DE INGRESSOS =====
        
        // Sobrescrever edição de ingresso PAGO
        const originalEditarTicketPago = window.editarTicketPago;
        window.editarTicketPago = function(index) {
            console.log('✏️ [CORREÇÃO QUÁDRUPLA] Editando ingresso pago...');
            
            if (originalEditarTicketPago) {
                originalEditarTicketPago(index);
            }
            
            setTimeout(function() {
                const ingresso = window.ingressosTemporarios?.pagos?.[index];
                if (!ingresso) return;
                
                // Encontrar o lote
                const lote = [...(window.lotesData.porData || []), ...(window.lotesData.porPercentual || [])]
                    .find(l => l.id == ingresso.loteId);
                
                if (lote) {
                    // Substituir select por label
                    const selectContainer = document.querySelector('#editPaidTicketModal .mb-3:has(#editPaidTicketLote)');
                    if (selectContainer) {
                        const tipoLote = lote.tipo === 'POR DATA' ? 'Por Data' : 'Por Percentual';
                        selectContainer.innerHTML = `
                            <label class="form-label">Lote Associado</label>
                            <div class="alert alert-info mb-2" style="padding: 10px;">
                                <strong>${lote.nome}</strong> - ${tipoLote}
                                <input type="hidden" id="editPaidTicketLote" value="${lote.id}">
                            </div>
                            <small class="text-muted">O lote não pode ser alterado após a criação do ingresso</small>
                        `;
                    }
                    
                    // Se for lote por data, tornar campos de data readonly
                    if (lote.tipo === 'POR DATA') {
                        const startDate = document.getElementById('editPaidTicketStartDate');
                        const endDate = document.getElementById('editPaidTicketEndDate');
                        
                        if (startDate) {
                            startDate.readOnly = true;
                            startDate.style.backgroundColor = '#f8f9fa';
                            startDate.value = lote.dataInicio;
                            
                            // Adicionar aviso
                            const avisoStart = document.createElement('small');
                            avisoStart.className = 'text-muted d-block mt-1';
                            avisoStart.textContent = 'Data definida pelo lote';
                            startDate.parentElement.appendChild(avisoStart);
                        }
                        
                        if (endDate) {
                            endDate.readOnly = true;
                            endDate.style.backgroundColor = '#f8f9fa';
                            endDate.value = lote.dataFim;
                            
                            // Adicionar aviso
                            const avisoEnd = document.createElement('small');
                            avisoEnd.className = 'text-muted d-block mt-1';
                            avisoEnd.textContent = 'Data definida pelo lote';
                            endDate.parentElement.appendChild(avisoEnd);
                        }
                    }
                }
            }, 300);
        };
        
        // Sobrescrever edição de ingresso GRATUITO
        const originalEditarTicketGratuito = window.editarTicketGratuito;
        window.editarTicketGratuito = function(index) {
            console.log('✏️ [CORREÇÃO QUÁDRUPLA] Editando ingresso gratuito...');
            
            if (originalEditarTicketGratuito) {
                originalEditarTicketGratuito(index);
            }
            
            setTimeout(function() {
                const ingresso = window.ingressosTemporarios?.gratuitos?.[index];
                if (!ingresso) return;
                
                // Encontrar o lote
                const lote = [...(window.lotesData.porData || []), ...(window.lotesData.porPercentual || [])]
                    .find(l => l.id == ingresso.loteId);
                
                if (lote) {
                    // Substituir select por label
                    const selectContainer = document.querySelector('#editFreeTicketModal .mb-3:has(#editFreeTicketLote)');
                    if (selectContainer) {
                        const tipoLote = lote.tipo === 'POR DATA' ? 'Por Data' : 'Por Percentual';
                        selectContainer.innerHTML = `
                            <label class="form-label">Lote Associado</label>
                            <div class="alert alert-info mb-2" style="padding: 10px;">
                                <strong>${lote.nome}</strong> - ${tipoLote}
                                <input type="hidden" id="editFreeTicketLote" value="${lote.id}">
                            </div>
                            <small class="text-muted">O lote não pode ser alterado após a criação do ingresso</small>
                        `;
                    }
                    
                    // Se for lote por data, tornar campos de data readonly
                    if (lote.tipo === 'POR DATA') {
                        const startDate = document.getElementById('editFreeTicketStartDate');
                        const endDate = document.getElementById('editFreeTicketEndDate');
                        
                        if (startDate) {
                            startDate.readOnly = true;
                            startDate.style.backgroundColor = '#f8f9fa';
                            startDate.value = lote.dataInicio;
                            
                            // Adicionar aviso
                            const avisoStart = document.createElement('small');
                            avisoStart.className = 'text-muted d-block mt-1';
                            avisoStart.textContent = 'Data definida pelo lote';
                            startDate.parentElement.appendChild(avisoStart);
                        }
                        
                        if (endDate) {
                            endDate.readOnly = true;
                            endDate.style.backgroundColor = '#f8f9fa';
                            endDate.value = lote.dataFim;
                            
                            // Adicionar aviso
                            const avisoEnd = document.createElement('small');
                            avisoEnd.className = 'text-muted d-block mt-1';
                            avisoEnd.textContent = 'Data definida pelo lote';
                            endDate.parentElement.appendChild(avisoEnd);
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
        
        // Garantir que as funções globais estejam disponíveis
        window.atualizarInterfaceLotes = atualizarInterfaceLotes;
        
        console.log('✅ CORREÇÕES QUÁDRUPLAS APLICADAS!');
    }
    
    // Aplicar quando tudo estiver pronto
    if (document.readyState === 'complete') {
        setTimeout(aplicarCorrecoesQuadruplas, 1500);
    } else {
        window.addEventListener('load', function() {
            setTimeout(aplicarCorrecoesQuadruplas, 1500);
        });
    }
    
})();