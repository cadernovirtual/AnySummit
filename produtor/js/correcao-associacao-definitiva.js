/**
 * CORREÇÃO DEFINITIVA - Associação Lotes/Ingressos e Exclusão
 * 1. Corrige IDs dos lotes (remove prefixos desnecessários)
 * 2. Garante associação correta ingresso-lote
 * 3. Chama atualizarInterfaceLotes() após exclusão
 */

(function() {
    console.log('🚨 CORREÇÃO DEFINITIVA ASSOCIAÇÃO - Iniciando...');
    
    function aplicarCorrecaoDefinitiva() {
        console.log('🔧 Aplicando correção definitiva de associação...');
        
        // ===== CORREÇÃO 1: PADRONIZAR IDS DOS LOTES =====
        // Garantir que lotes usem IDs numéricos simples
        window.criarLoteData = function() {
            console.log('📅 [CORREÇÃO] Criando lote por data...');
            
            const dataInicio = document.getElementById('loteDataInicio').value;
            const dataFim = document.getElementById('loteDataFim').value;
            const divulgar = document.getElementById('loteDataDivulgar').checked;
            
            if (!dataInicio || !dataFim) {
                alert('Por favor, preencha as datas de início e fim.');
                return;
            }
            
            // ID NUMÉRICO SIMPLES
            const lote = {
                id: Date.now(), // Apenas número, sem prefixo
                nome: `Lote ${window.lotesData.porData.length + 1}`,
                dataInicio: dataInicio,
                dataFim: dataFim,
                divulgar: divulgar,
                tipo: 'POR DATA'
            };
            
            console.log('✅ Lote criado com ID correto:', lote);
            
            window.lotesData.porData.push(lote);
            
            if (window.renomearLotesAutomaticamente) {
                window.renomearLotesAutomaticamente();
            }
            
            // CHAMAR ATUALIZAÇÃO
            console.log('🔄 CHAMANDO atualizarTelaLotes()...');
            if (window.atualizarTelaLotes) {
                window.atualizarTelaLotes();
            } else if (window.atualizarInterfaceLotes) {
                window.atualizarInterfaceLotes();
            } else if (window.renderizarLotesPorData) {
                window.renderizarLotesPorData();
            }
            
            if (window.salvarLotesNoCookie) {
                window.salvarLotesNoCookie();
            }
            
            if (window.closeModal) {
                window.closeModal('loteDataModal');
            }
        };
        
        window.criarLotePercentual = function() {
            console.log('📊 [CORREÇÃO] Criando lote percentual...');
            
            const percentualInput = document.getElementById('lotePercentualValor');
            const divulgar = document.getElementById('lotePercentualDivulgar').checked;
            
            let percentual = parseInt(percentualInput?.value) || 100;
            console.log('Percentual capturado:', percentual);
            
            if (percentual < 1 || percentual > 100) {
                alert('Por favor, informe um percentual entre 1 e 100.');
                return;
            }

            // CORREÇÃO: Chamar função que faz INSERT no MySQL
            const loteConfig = {
                nome: `Lote ${window.lotesData.porPercentual.length + 1}`,
                percentual: percentual,
                divulgar: divulgar
            };
            
            console.log('🚀 Chamando criarLotesPercentual() para INSERT no MySQL...');
            
            if (window.criarLotesPercentual) {
                window.criarLotesPercentual([loteConfig])
                    .then(lotesConfirmados => {
                        console.log('✅ Lote inserido no MySQL:', lotesConfirmados);
                        
                        // Adicionar à interface local também
                        const lote = {
                            id: lotesConfirmados[0].id, // Usar ID real do banco
                            nome: loteConfig.nome,
                            percentual: percentual,
                            divulgar: divulgar,
                            tipo: 'POR PERCENTUAL DE VENDA'
                        };
                        
                        window.lotesData.porPercentual.push(lote);
                        
                        // Atualizar interface
                        if (window.renomearLotesAutomaticamente) {
                            window.renomearLotesAutomaticamente();
                        }
                        
                        if (window.atualizarTelaLotes) {
                            window.atualizarTelaLotes();
                        } else if (window.atualizarInterfaceLotes) {
                            window.atualizarInterfaceLotes();
                        } else if (window.renderizarLotesPorPercentual) {
                            window.renderizarLotesPorPercentual();
                        }
                        
                        if (window.salvarLotesNoCookie) {
                            window.salvarLotesNoCookie();
                        }
                        
                        if (window.closeModal) {
                            window.closeModal('lotePercentualModal');
                        }
                        
                        alert('Lote criado e inserido no banco com sucesso!');
                    })
                    .catch(error => {
                        console.error('❌ Erro ao inserir lote no MySQL:', error);
                        alert('Erro ao criar lote: ' + error.message);
                    });
            } else {
                console.error('❌ Função criarLotesPercentual não encontrada!');
                alert('Erro: Função de inserção no banco não está disponível');
            }
        };
        
        // ===== CORREÇÃO 2: VERIFICAÇÃO DE INGRESSOS =====
        window.verificarIngressosNoLote = function(loteId) {
            console.log('🔍 [CORREÇÃO] Verificando ingressos no lote:', loteId);
            
            // Normalizar ID (remover prefixos se houver)
            const loteIdNormalizado = String(loteId).replace('lote_data_', '').replace('lote_percentual_', '');
            
            let temIngressos = false;
            let ingressosEncontrados = [];
            
            // Verificar ingressos temporários
            if (window.ingressosTemporarios) {
                if (window.ingressosTemporarios.pagos) {
                    window.ingressosTemporarios.pagos.forEach(function(ing, idx) {
                        const ingLoteId = String(ing.loteId || '').replace('lote_data_', '').replace('lote_percentual_', '');
                        if (ingLoteId == loteIdNormalizado) {
                            temIngressos = true;
                            ingressosEncontrados.push({tipo: 'pago', index: idx, titulo: ing.title});
                        }
                    });
                }
                
                if (window.ingressosTemporarios.gratuitos) {
                    window.ingressosTemporarios.gratuitos.forEach(function(ing, idx) {
                        const ingLoteId = String(ing.loteId || '').replace('lote_data_', '').replace('lote_percentual_', '');
                        if (ingLoteId == loteIdNormalizado) {
                            temIngressos = true;
                            ingressosEncontrados.push({tipo: 'gratuito', index: idx, titulo: ing.title});
                        }
                    });
                }
            }
            
            console.log('Ingressos encontrados:', ingressosEncontrados);
            console.log('Lote tem ingressos?', temIngressos);
            
            return temIngressos;
        };
        
        // ===== CORREÇÃO 3: EXCLUSÃO COM ATUALIZAÇÃO =====
        window.excluirLote = async function(loteId, tipo) {
            console.log('🗑️ [CORREÇÃO] Excluindo lote:', loteId, tipo);
            
            // Verificar ingressos
            if (window.verificarIngressosNoLote(loteId)) {
                if (window.customDialog) {
                    await window.customDialog.alert(
                        'Este lote possui ingressos associados. Remova os ingressos primeiro.',
                        'Atenção'
                    );
                } else {
                    alert('Este lote possui ingressos associados. Remova os ingressos primeiro.');
                }
                return;
            }
            
            // Confirmar
            let confirmar = false;
            if (window.customDialog && window.customDialog.confirm) {
                const resultado = await window.customDialog.confirm('Tem certeza que deseja excluir este lote?');
                confirmar = (resultado === 'confirm');
            } else {
                confirmar = confirm('Tem certeza que deseja excluir este lote?');
            }
            
            if (confirmar) {
                // Excluir
                if (tipo === 'data') {
                    window.lotesData.porData = window.lotesData.porData.filter(l => l.id != loteId);
                } else {
                    window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id != loteId);
                }
                
                // Renomear
                if (window.renomearLotesAutomaticamente) {
                    window.renomearLotesAutomaticamente();
                }
                
                // *** CHAMAR ATUALIZAÇÃO DA INTERFACE ***
                console.log('🔄 CHAMANDO ATUALIZAÇÃO DA INTERFACE...');
                if (window.atualizarTelaLotes) {
                    console.log('✅ Usando atualizarTelaLotes()');
                    window.atualizarTelaLotes();
                } else if (window.atualizarInterfaceLotes) {
                    console.log('✅ Usando atualizarInterfaceLotes()');
                    window.atualizarInterfaceLotes();
                } else {
                    console.log('⚠️ Usando fallback manual');
                    atualizarLotesManualmente();
                }
                
                // Salvar
                if (window.salvarLotesNoCookie) {
                    window.salvarLotesNoCookie();
                }
                
                // Sucesso
                if (window.customDialog) {
                    window.customDialog.alert('Lote excluído com sucesso!', 'success');
                }
            }
        };
        
        // Função de atualização manual como fallback
        function atualizarLotesManualmente() {
            console.log('🔄 Atualizando lotes manualmente...');
            
            // Lotes por data
            const containerData = document.getElementById('lotesPorDataList');
            if (containerData) {
                containerData.innerHTML = '';
                if (window.lotesData.porData.length > 0) {
                    window.lotesData.porData.forEach(lote => {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    ${formatarData(lote.dataInicio)} até ${formatarData(lote.dataFim)}
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote(${lote.id}, 'data')">🗑️</button>
                            </div>
                        `;
                        containerData.appendChild(div);
                    });
                }
            }
            
            // Lotes por percentual
            const containerPercentual = document.getElementById('lotesPorPercentualList');
            if (containerPercentual) {
                containerPercentual.innerHTML = '';
                if (window.lotesData.porPercentual.length > 0) {
                    window.lotesData.porPercentual.forEach(lote => {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    Encerra aos ${lote.percentual}% das vendas
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote(${lote.id}, 'percentual')">🗑️</button>
                            </div>
                        `;
                        containerPercentual.appendChild(div);
                    });
                }
            }
        }
        
        // ===== CORREÇÃO 4: CARREGAR LOTES NOS SELECTS =====
        window.carregarLotesParaIngressos = function() {
            console.log('📋 [CORREÇÃO] Carregando lotes para ingressos...');
            
            const selects = [
                'paidTicketLote',
                'freeTicketLote',
                'editPaidTicketLote',
                'editFreeTicketLote'
            ];
            
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    select.innerHTML = '<option value="">Selecione um lote</option>';
                    
                    // Adicionar lotes por data
                    if (window.lotesData.porData.length > 0) {
                        const optgroup1 = document.createElement('optgroup');
                        optgroup1.label = 'Lotes por Data';
                        window.lotesData.porData.forEach(lote => {
                            const option = document.createElement('option');
                            option.value = lote.id; // ID numérico simples
                            option.textContent = lote.nome;
                            option.dataset.tipo = 'data';
                            optgroup1.appendChild(option);
                        });
                        select.appendChild(optgroup1);
                    }
                    
                    // Adicionar lotes por percentual
                    if (window.lotesData.porPercentual.length > 0) {
                        const optgroup2 = document.createElement('optgroup');
                        optgroup2.label = 'Lotes por Percentual';
                        window.lotesData.porPercentual.forEach(lote => {
                            const option = document.createElement('option');
                            option.value = lote.id; // ID numérico simples
                            option.textContent = `${lote.nome} (${lote.percentual}%)`;
                            option.dataset.tipo = 'percentual';
                            optgroup2.appendChild(option);
                        });
                        select.appendChild(optgroup2);
                    }
                }
            });
        };
        
        // ===== CORREÇÃO 5: EDIÇÃO DE INGRESSOS =====
        // Interceptar edição para mostrar lote corretamente
        const originalEditarPago = window.editarTicketPago;
        window.editarTicketPago = function(index) {
            if (originalEditarPago) originalEditarPago(index);
            
            setTimeout(() => {
                const ingresso = window.ingressosTemporarios?.pagos?.[index];
                if (!ingresso) return;
                
                // Normalizar ID do lote
                const loteIdNormalizado = String(ingresso.loteId || '').replace('lote_data_', '').replace('lote_percentual_', '');
                
                // Encontrar lote
                const lote = [...(window.lotesData.porData || []), ...(window.lotesData.porPercentual || [])]
                    .find(l => String(l.id) == loteIdNormalizado);
                
                if (lote) {
                    console.log('✅ Lote encontrado para edição:', lote);
                    
                    // Substituir select por label
                    const container = document.querySelector('#editPaidTicketModal .mb-3:has(#editPaidTicketLote)');
                    if (container) {
                        const tipoLote = lote.tipo === 'POR DATA' ? 'Por Data' : `Por Percentual (${lote.percentual}%)`;
                        container.innerHTML = `
                            <label class="form-label">Lote Associado</label>
                            <div class="alert alert-info">
                                <strong>${lote.nome}</strong> - ${tipoLote}
                                <input type="hidden" id="editPaidTicketLote" value="${lote.id}">
                            </div>
                            <small class="text-muted">O lote não pode ser alterado após criação</small>
                        `;
                        
                        // Se lote por data, tornar datas readonly
                        if (lote.tipo === 'POR DATA') {
                            const startDate = document.getElementById('editPaidTicketStartDate');
                            const endDate = document.getElementById('editPaidTicketEndDate');
                            
                            if (startDate) {
                                startDate.value = lote.dataInicio;
                                startDate.readOnly = true;
                                startDate.style.backgroundColor = '#f8f9fa';
                            }
                            if (endDate) {
                                endDate.value = lote.dataFim;
                                endDate.readOnly = true;
                                endDate.style.backgroundColor = '#f8f9fa';
                            }
                        }
                    }
                } else {
                    console.error('❌ Lote não encontrado:', ingresso.loteId);
                }
            }, 300);
        };
        
        // Função auxiliar
        function formatarData(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Tornar função global
        window.atualizarLotesManualmente = atualizarLotesManualmente;
        
        console.log('✅ CORREÇÃO DEFINITIVA APLICADA!');
    }
    
    // Aplicar após carregamento
    if (document.readyState === 'complete') {
        setTimeout(aplicarCorrecaoDefinitiva, 2000);
    } else {
        window.addEventListener('load', () => setTimeout(aplicarCorrecaoDefinitiva, 2000));
    }
})();