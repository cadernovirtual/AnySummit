// =====================================================
// CORREÇÃO DEFINITIVA - PROBLEMAS ESPECÍFICOS
// =====================================================

console.log('🔧 Aplicando correções definitivas...');

setTimeout(function() {
    
    // 1. CRIAR LOTE POR DATA
    window.criarLoteData = function() {
        console.log('📅 Criando lote por data...');
        
        const nome = document.getElementById('loteDataNome')?.value || '';
        const dataInicio = document.getElementById('loteDataInicio')?.value;
        const dataFim = document.getElementById('loteDataFim')?.value;
        
        if (!dataInicio || !dataFim) {
            // Usar dialog do sistema se existir
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
        fecharModal('loteDataModal');
        salvarLotes();
        
        // Limpar campos
        document.getElementById('loteDataNome').value = '';
        document.getElementById('loteDataInicio').value = '';
        document.getElementById('loteDataFim').value = '';
    };
    
    // 2. CRIAR LOTE PERCENTUAL - TOTALMENTE SEM VALIDAÇÃO DE CAMPOS
    window.criarLotePercentual = function() {
        console.log('📊 Criando lote percentual SEM VALIDAÇÕES...');
        
        // Pegar valores sem validar
        const nome = document.getElementById('lotePercentualNome')?.value || '';
        const percentualInput = document.getElementById('lotePercentualVendido');
        const dataInicio = document.getElementById('lotePercentualInicio')?.value;
        const dataFim = document.getElementById('lotePercentualFim')?.value;
        
        // Se não tiver percentual, usa 100
        const percentualNum = parseInt(percentualInput?.value) || 100;
        
        // Se não tiver datas, cria com datas padrão
        const agora = new Date();
        const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
        
        window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
        
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
        fecharModal('lotePercentualModal');
        salvarLotes();
        
        // Limpar campos
        document.getElementById('lotePercentualNome').value = '';
        document.getElementById('lotePercentualVendido').value = '';
        document.getElementById('lotePercentualInicio').value = '';
        document.getElementById('lotePercentualFim').value = '';
        
        console.log('✅ Lote percentual criado:', novoLote);
    };
    
    // 3. EXCLUIR COM VALIDAÇÃO - USANDO DIALOGS DO SISTEMA
    window.excluirLoteComValidacao = function(loteId, tipo) {
        // Verificar ingressos
        const ingressosAssociados = verificarIngressosAssociados(loteId);
        
        if (ingressosAssociados) {
            // USAR DIALOG DO SISTEMA
            if (window.showCustomAlert) {
                window.showCustomAlert('Este lote possui ingressos associados e não pode ser excluído.', 'error');
            }
            return;
        }
        
        // USAR DIALOG DE CONFIRMAÇÃO DO SISTEMA
        if (window.showCustomConfirm) {
            window.showCustomConfirm('Tem certeza que deseja excluir este lote?', function() {
                // Excluir
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
                
                // Mostrar sucesso
                if (window.showCustomAlert) {
                    window.showCustomAlert('Lote excluído com sucesso!', 'success');
                }
            });
        }
    };
    
    // Verificar ingressos associados
    function verificarIngressosAssociados(loteId) {
        // Verificar na lista de ingressos temporários
        if (window.ingressosTemporarios && window.ingressosTemporarios.length > 0) {
            for (let i = 0; i < window.ingressosTemporarios.length; i++) {
                if (window.ingressosTemporarios[i].loteId === loteId) {
                    return true;
                }
            }
        }
        
        // Verificar nos elementos DOM
        const ticketItems = document.querySelectorAll('.ticket-item');
        for (let i = 0; i < ticketItems.length; i++) {
            const item = ticketItems[i];
            if (item.dataset && item.dataset.loteId === loteId) {
                return true;
            }
        }
        
        return false;
    }
    
    // Função simplificada de atualização
    function atualizarVisualizacao() {
        const containerData = document.getElementById('lotesPorDataList');
        const containerPercentual = document.getElementById('lotesPorPercentualList');
        
        // Lotes por data
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
                            '<button class="btn-delete-lote" onclick="excluirLoteComValidacao(\'' + lote.id + '\', \'data\')">🗑️</button>' +
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
        
        // Lotes por percentual
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
                            '<button class="btn-delete-lote" onclick="excluirLoteComValidacao(\'' + lote.id + '\', \'percentual\')">🗑️</button>' +
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
    function fecharModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (window.bootstrap && bootstrap.Modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            } else if (window.$ && $.fn.modal) {
                $(modal).modal('hide');
            }
        }
    }
    
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
    
    // Carregar lotes para ingressos
    window.carregarLotesParaIngressos = function() {
        const selects = [
            document.getElementById('paidTicketLote'),
            document.getElementById('freeTicketLote'),
            document.getElementById('comboTicketLote')
        ];
        
        selects.forEach(function(select) {
            if (!select) return;
            
            select.innerHTML = '<option value="">Selecione um lote</option>';
            
            window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
            
            window.lotesData.porData.forEach(function(lote) {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome + ' - Por Data';
                select.appendChild(option);
            });
            
            window.lotesData.porPercentual.forEach(function(lote) {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome + ' - ' + lote.percentual + '%';
                select.appendChild(option);
            });
        });
    };
    
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
    
    // Interceptar cliques etapa 6
    document.addEventListener('click', function(e) {
        if (e.target.id === 'addPaidTicket' || 
            e.target.id === 'addFreeTicket' || 
            e.target.id === 'addComboTicket') {
            setTimeout(carregarLotesParaIngressos, 200);
        }
    });
    
    // CSS simples
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
    
    console.log('✅ Correções aplicadas com sucesso');
    
}, 1000);