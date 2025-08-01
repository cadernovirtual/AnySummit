// =====================================================
// CORREÇÃO COMPLETA - TODOS OS PROBLEMAS
// =====================================================

console.log('🔧 Aplicando correções completas do sistema...');

setTimeout(function() {
    
    // 1. CRIAR LOTE POR DATA - COM FECHAMENTO DO MODAL
    window.criarLoteData = function() {
        console.log('📅 Criando lote por data...');
        
        const nome = document.getElementById('loteDataNome')?.value || '';
        const dataInicio = document.getElementById('loteDataInicio')?.value;
        const dataFim = document.getElementById('loteDataFim')?.value;
        
        if (!dataInicio || !dataFim) {
            if (window.showCustomAlert) {
                window.showCustomAlert('Por favor, preencha as datas de início e fim', 'warning');
            }
            return;
        }
        
        if (new Date(dataInicio) >= new Date(dataFim)) {
            if (window.showCustomAlert) {
                window.showCustomAlert('A data de início deve ser anterior à data de fim', 'warning');
            }
            return;
        }
        
        window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
        
        const novoLote = {
            id: 'lote_data_' + Date.now(),
            nome: nome || 'Lote ' + (window.lotesData.porData.length + 1),
            tipo: 'data',
            dataInicio: dataInicio,
            dataFim: dataFim,
            ativo: true
        };
        
        window.lotesData.porData.push(novoLote);
        atualizarVisualizacao();
        salvarLotes();
        
        // FECHAR MODAL - FORÇAR FECHAMENTO
        const modal = document.getElementById('loteDataModal');
        if (modal) {
            // Tentar Bootstrap
            if (window.bootstrap && window.bootstrap.Modal) {
                try {
                    const bsModal = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                    bsModal.hide();
                } catch(e) {}
            }
            // Tentar jQuery
            if (window.$ && window.$.fn && window.$.fn.modal) {
                try {
                    window.$(modal).modal('hide');
                } catch(e) {}
            }
            // Forçar fechamento manual
            setTimeout(function() {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(function(b) { b.remove(); });
            }, 100);
        }
        
        // Limpar campos
        document.getElementById('loteDataNome').value = '';
        document.getElementById('loteDataInicio').value = '';
        document.getElementById('loteDataFim').value = '';
    };
    
    // 2. CRIAR LOTE PERCENTUAL - COM VALIDAÇÃO DE DUPLICIDADE
    window.criarLotePercentual = function() {
        console.log('📊 Criando lote percentual...');
        
        const nome = document.getElementById('lotePercentualNome')?.value || '';
        const percentualInput = document.getElementById('lotePercentualVendido');
        const dataInicio = document.getElementById('lotePercentualInicio')?.value;
        const dataFim = document.getElementById('lotePercentualFim')?.value;
        
        const percentualNum = parseInt(percentualInput?.value) || 100;
        
        window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
        
        // VALIDAR PERCENTUAL DUPLICADO
        const percentualExiste = window.lotesData.porPercentual.some(function(lote) {
            return lote.percentual === percentualNum;
        });
        
        if (percentualExiste) {
            if (window.showCustomAlert) {
                window.showCustomAlert('Já existe um lote com ' + percentualNum + '% de vendas!', 'warning');
            }
            return;
        }
        
        const agora = new Date();
        const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
        
        const novoLote = {
            id: 'lote_perc_' + Date.now(),
            nome: nome || 'Lote ' + (window.lotesData.porPercentual.length + 1),
            tipo: 'percentual',
            percentual: percentualNum,
            dataInicio: dataInicio || agora.toISOString().slice(0, 16),
            dataFim: dataFim || amanha.toISOString().slice(0, 16),
            ativo: true
        };
        
        window.lotesData.porPercentual.push(novoLote);
        atualizarVisualizacao();
        salvarLotes();
        
        // FECHAR MODAL
        const modal = document.getElementById('lotePercentualModal');
        if (modal) {
            if (window.bootstrap && window.bootstrap.Modal) {
                try {
                    const bsModal = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                    bsModal.hide();
                } catch(e) {}
            }
            if (window.$ && window.$.fn && window.$.fn.modal) {
                try {
                    window.$(modal).modal('hide');
                } catch(e) {}
            }
            setTimeout(function() {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(function(b) { b.remove(); });
            }, 100);
        }
        
        // Limpar campos
        document.getElementById('lotePercentualNome').value = '';
        document.getElementById('lotePercentualVendido').value = '';
        document.getElementById('lotePercentualInicio').value = '';
        document.getElementById('lotePercentualFim').value = '';
    };
    
    // 3. EXCLUIR LOTE - CORRIGINDO FUNÇÃO
    window.excluirLote = function(loteId, tipo) {
        console.log('🗑️ Excluindo lote:', loteId, tipo);
        
        // Verificar ingressos
        const ingressosAssociados = verificarIngressosAssociados(loteId);
        
        if (ingressosAssociados) {
            if (window.showCustomAlert) {
                window.showCustomAlert('Este lote possui ingressos associados e não pode ser excluído.', 'error');
            }
            return;
        }
        
        // Confirmar exclusão
        if (window.showCustomConfirm) {
            window.showCustomConfirm('Tem certeza que deseja excluir este lote?', function() {
                if (tipo === 'data') {
                    window.lotesData.porData = window.lotesData.porData.filter(function(l) { 
                        return l.id !== loteId; 
                    });
                } else {
                    window.lotesData.porPercentual = window.lotesData.porPercentual.filter(function(l) { 
                        return l.id !== loteId; 
                    });
                }
                
                atualizarVisualizacao();
                salvarLotes();
                
                if (window.showCustomAlert) {
                    window.showCustomAlert('Lote excluído com sucesso!', 'success');
                }
            });
        } else {
            // Fallback se não tiver dialog customizado
            if (confirm('Tem certeza que deseja excluir este lote?')) {
                if (tipo === 'data') {
                    window.lotesData.porData = window.lotesData.porData.filter(function(l) { 
                        return l.id !== loteId; 
                    });
                } else {
                    window.lotesData.porPercentual = window.lotesData.porPercentual.filter(function(l) { 
                        return l.id !== loteId; 
                    });
                }
                
                atualizarVisualizacao();
                salvarLotes();
            }
        }
    };
    
    // Tornar função global
    window.excluirLoteComValidacao = window.excluirLote;
    
    // 4. CARREGAR LOTES COM SELEÇÃO PRÉVIA
    window.carregarLotesParaIngressos = function(loteIdSelecionado) {
        console.log('🎫 Carregando lotes para ingressos, selecionado:', loteIdSelecionado);
        
        const selects = [
            document.getElementById('paidTicketLote'),
            document.getElementById('freeTicketLote'),
            document.getElementById('comboTicketLote'),
            document.getElementById('editPaidTicketLote'),
            document.getElementById('editFreeTicketLote')
        ];
        
        selects.forEach(function(select) {
            if (!select) return;
            
            select.innerHTML = '<option value="">Selecione um lote</option>';
            
            window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
            
            window.lotesData.porData.forEach(function(lote) {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome + ' - Por Data';
                if (loteIdSelecionado && lote.id === loteIdSelecionado) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            window.lotesData.porPercentual.forEach(function(lote) {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome + ' - ' + lote.percentual + '%';
                if (loteIdSelecionado && lote.id === loteIdSelecionado) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        });
    };
    
    // 5. INTERCEPTAR EXCLUSÃO DE INGRESSOS
    const excluirIngressoOriginal = window.excluirIngresso;
    window.excluirIngresso = function(index, tipo) {
        console.log('🎫 Excluindo ingresso com dialog customizado');
        
        if (window.showCustomConfirm) {
            window.showCustomConfirm('Tem certeza que deseja excluir este ingresso?', function() {
                if (excluirIngressoOriginal) {
                    excluirIngressoOriginal(index, tipo);
                } else {
                    // Implementação básica se não existir
                    if (window.ingressosTemporarios && window.ingressosTemporarios[tipo]) {
                        window.ingressosTemporarios[tipo].splice(index, 1);
                        if (window.atualizarListaIngressos) {
                            window.atualizarListaIngressos();
                        }
                    }
                }
            });
        } else {
            // Fallback
            if (excluirIngressoOriginal) {
                excluirIngressoOriginal(index, tipo);
            }
        }
    };
    
    // Interceptar outras funções de exclusão
    const excluirTicketPagoOriginal = window.excluirTicketPago;
    window.excluirTicketPago = function(index) {
        if (window.showCustomConfirm) {
            window.showCustomConfirm('Tem certeza que deseja excluir este ingresso pago?', function() {
                if (excluirTicketPagoOriginal) {
                    excluirTicketPagoOriginal(index);
                }
            });
        } else if (excluirTicketPagoOriginal) {
            excluirTicketPagoOriginal(index);
        }
    };
    
    const excluirTicketGratuitoOriginal = window.excluirTicketGratuito;
    window.excluirTicketGratuito = function(index) {
        if (window.showCustomConfirm) {
            window.showCustomConfirm('Tem certeza que deseja excluir este ingresso gratuito?', function() {
                if (excluirTicketGratuitoOriginal) {
                    excluirTicketGratuitoOriginal(index);
                }
            });
        } else if (excluirTicketGratuitoOriginal) {
            excluirTicketGratuitoOriginal(index);
        }
    };
    
    const excluirComboOriginal = window.excluirCombo;
    window.excluirCombo = function(index) {
        if (window.showCustomConfirm) {
            window.showCustomConfirm('Tem certeza que deseja excluir este combo?', function() {
                if (excluirComboOriginal) {
                    excluirComboOriginal(index);
                }
            });
        } else if (excluirComboOriginal) {
            excluirComboOriginal(index);
        }
    };
    
    // Verificar ingressos associados
    function verificarIngressosAssociados(loteId) {
        // Verificar ingressos temporários
        if (window.ingressosTemporarios) {
            if (window.ingressosTemporarios.pagos) {
                for (let i = 0; i < window.ingressosTemporarios.pagos.length; i++) {
                    if (window.ingressosTemporarios.pagos[i].loteId === loteId) {
                        return true;
                    }
                }
            }
            if (window.ingressosTemporarios.gratuitos) {
                for (let i = 0; i < window.ingressosTemporarios.gratuitos.length; i++) {
                    if (window.ingressosTemporarios.gratuitos[i].loteId === loteId) {
                        return true;
                    }
                }
            }
        }
        
        // Verificar elementos DOM
        const ticketItems = document.querySelectorAll('.ticket-item[data-lote-id="' + loteId + '"]');
        return ticketItems.length > 0;
    }
    
    // Função de atualização
    function atualizarVisualizacao() {
        const containerData = document.getElementById('lotesPorDataList');
        const containerPercentual = document.getElementById('lotesPorPercentualList');
        
        if (containerData) {
            if (window.lotesData.porData.length > 0) {
                containerData.innerHTML = '';
                window.lotesData.porData.forEach(function(lote) {
                    const div = document.createElement('div');
                    div.className = 'lote-item-styled';
                    div.innerHTML = 
                        '<div class="lote-content">' +
                            '<div class="lote-info">' +
                                '<div class="lote-title">' + lote.nome + '</div>' +
                                '<div class="lote-dates">' +
                                    '<span>Início: ' + formatarData(lote.dataInicio) + '</span> | ' +
                                    '<span>Fim: ' + formatarData(lote.dataFim) + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<button class="btn-delete-lote" onclick="excluirLote(\'' + lote.id + '\', \'data\')">🗑️</button>' +
                        '</div>';
                    containerData.appendChild(div);
                });
            } else {
                containerData.innerHTML = 
                    '<div class="lote-empty-state">' +
                        '<div style="font-size: 2rem; margin-bottom: 10px;">📅</div>' +
                        '<div style="color: #8B95A7;">Nenhum lote por data criado</div>' +
                    '</div>';
            }
        }
        
        if (containerPercentual) {
            if (window.lotesData.porPercentual.length > 0) {
                containerPercentual.innerHTML = '';
                window.lotesData.porPercentual.forEach(function(lote) {
                    const div = document.createElement('div');
                    div.className = 'lote-item-styled';
                    div.innerHTML = 
                        '<div class="lote-content">' +
                            '<div class="lote-info">' +
                                '<div class="lote-title">' + lote.nome + ' - ' + lote.percentual + '%</div>' +
                                '<div class="lote-dates">' +
                                    '<span>Início: ' + formatarData(lote.dataInicio) + '</span> | ' +
                                    '<span>Fim: ' + formatarData(lote.dataFim) + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<button class="btn-delete-lote" onclick="excluirLote(\'' + lote.id + '\', \'percentual\')">🗑️</button>' +
                        '</div>';
                    containerPercentual.appendChild(div);
                });
            } else {
                containerPercentual.innerHTML = 
                    '<div class="lote-empty-state">' +
                        '<div style="font-size: 2rem; margin-bottom: 10px;">📊</div>' +
                        '<div style="color: #8B95A7;">Nenhum lote por percentual criado</div>' +
                    '</div>';
            }
        }
    }
    
    // Funções auxiliares
    function formatarData(dataStr) {
        if (!dataStr) return '';
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR') + ' ' + 
               data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    }
    
    function salvarLotes() {
        const dados = JSON.stringify(window.lotesData);
        document.cookie = 'lotesData=' + encodeURIComponent(dados) + ';path=/;max-age=604800';
    }
    
    // Validação Step 5
    window.validarLotes = function() {
        window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
        
        const temLotes = window.lotesData.porData.length > 0 || 
                        window.lotesData.porPercentual.length > 0;
        
        if (!temLotes) {
            if (window.showCustomAlert) {
                window.showCustomAlert('É necessário criar pelo menos um lote!', 'warning');
            }
            return false;
        }
        
        if (window.lotesData.porPercentual.length > 0) {
            const tem100 = window.lotesData.porPercentual.some(function(l) { 
                return l.percentual === 100; 
            });
            if (!tem100) {
                if (window.showCustomAlert) {
                    window.showCustomAlert('É necessário ter pelo menos um lote com 100% de vendas!', 'warning');
                }
                return false;
            }
        }
        
        return true;
    };
    
    // Override validateStep
    const validateStepOriginal = window.validateStep;
    window.validateStep = function(step) {
        if (step === 5) {
            return window.validarLotes();
        }
        return validateStepOriginal ? validateStepOriginal(step) : true;
    };
    
    // Carregar lotes salvos
    const cookie = document.cookie.split(';').find(function(c) { 
        return c.trim().startsWith('lotesData='); 
    });
    if (cookie) {
        try {
            const value = decodeURIComponent(cookie.split('=')[1]);
            window.lotesData = JSON.parse(value);
            atualizarVisualizacao();
        } catch (e) {
            console.error('Erro ao carregar lotes:', e);
        }
    }
    
    // Interceptar cliques
    document.addEventListener('click', function(e) {
        if (e.target.id === 'addPaidTicket' || 
            e.target.id === 'addFreeTicket' || 
            e.target.id === 'addComboTicket') {
            setTimeout(carregarLotesParaIngressos, 200);
        }
    });
    
    // CSS
    const style = document.createElement('style');
    style.textContent = `
        .lote-item-styled {
            margin-bottom: 10px;
        }
        
        .lote-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .lote-content:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.2);
        }
        
        .lote-info {
            flex: 1;
        }
        
        .lote-title {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 4px;
        }
        
        .lote-dates {
            font-size: 14px;
            color: #8B95A7;
        }
        
        .btn-delete-lote {
            background: transparent;
            border: 1px solid rgba(220, 53, 69, 0.5);
            color: #dc3545;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-delete-lote:hover {
            background: rgba(220, 53, 69, 0.1);
            border-color: #dc3545;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Sistema completo corrigido e funcionando');
    
}, 1000);