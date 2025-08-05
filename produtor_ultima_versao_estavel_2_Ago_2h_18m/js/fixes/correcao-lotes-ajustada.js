// =====================================================
// CORREÇÃO FINAL AJUSTADA - SISTEMA DE LOTES
// =====================================================

console.log('🚨 APLICANDO CORREÇÕES FINAIS AJUSTADAS');

// Aguardar carregamento completo
setTimeout(function() {
    console.log('🔧 Aplicando correções ajustadas...');
    
    // 1. CRIAR LOTE POR DATA
    window.criarLoteData = function() {
        console.log('📅 Criando lote por data...');
        
        const nome = document.getElementById('loteDataNome')?.value || '';
        const dataInicio = document.getElementById('loteDataInicio')?.value;
        const dataFim = document.getElementById('loteDataFim')?.value;
        
        if (!dataInicio || !dataFim) {
            showDialog('Por favor, preencha as datas de início e fim', 'warning');
            return;
        }
        
        if (new Date(dataInicio) >= new Date(dataFim)) {
            showDialog('A data de início deve ser anterior à data de fim', 'warning');
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
        atualizarVisualizacaoEstilizada();
        fecharModalLote('loteDataModal');
        salvarLotes();
        
        // Limpar campos
        document.getElementById('loteDataNome').value = '';
        document.getElementById('loteDataInicio').value = '';
        document.getElementById('loteDataFim').value = '';
    };
    
    // 2. CRIAR LOTE PERCENTUAL - SEM VALIDAÇÃO
    window.criarLotePercentual = function() {
        console.log('📊 Criando lote percentual...');
        
        const nome = document.getElementById('lotePercentualNome')?.value || '';
        const percentualInput = document.getElementById('lotePercentualVendido');
        const dataInicio = document.getElementById('lotePercentualInicio')?.value;
        const dataFim = document.getElementById('lotePercentualFim')?.value;
        
        // Apenas validar se tem datas
        if (!dataInicio || !dataFim) {
            showDialog('Por favor, preencha as datas de início e fim', 'warning');
            return;
        }
        
        if (new Date(dataInicio) >= new Date(dataFim)) {
            showDialog('A data de início deve ser anterior à data de fim', 'warning');
            return;
        }
        
        // Pegar percentual com valor padrão se vazio
        const percentualNum = parseInt(percentualInput?.value) || 100;
        
        window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
        
        const novoLote = {
            id: 'lote_perc_' + Date.now(),
            nome: nome || 'Lote ' + (window.lotesData.porPercentual.length + 1),
            tipo: 'percentual',
            percentual: percentualNum,
            dataInicio: dataInicio,
            dataFim: dataFim,
            ativo: true
        };
        
        window.lotesData.porPercentual.push(novoLote);
        atualizarVisualizacaoEstilizada();
        fecharModalLote('lotePercentualModal');
        salvarLotes();
        
        // Limpar campos
        document.getElementById('lotePercentualNome').value = '';
        document.getElementById('lotePercentualVendido').value = '';
        document.getElementById('lotePercentualInicio').value = '';
        document.getElementById('lotePercentualFim').value = '';
    };
    
    // 3. ATUALIZAR VISUALIZAÇÃO COM ESTILO DO SISTEMA
    function atualizarVisualizacaoEstilizada() {
        console.log('🖼️ Atualizando visualização estilizada...');
        
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
                                    '<span class="date-item">Início: ' + formatarData(lote.dataInicio) + '</span>' +
                                    '<span class="date-item">Fim: ' + formatarData(lote.dataFim) + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<button class="btn-action-delete" onclick="excluirLoteComValidacao(\'' + lote.id + '\', \'data\')">' +
                                '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">' +
                                    '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>' +
                                    '<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>' +
                                '</svg>' +
                            '</button>' +
                        '</div>';
                    containerData.appendChild(div);
                });
            } else {
                containerData.innerHTML = 
                    '<div class="lote-empty-state" id="loteDataEmpty">' +
                        '<div style="font-size: 2rem; margin-bottom: 10px;">📅</div>' +
                        '<div style="color: #8B95A7;">Nenhum lote por data criado</div>' +
                        '<div style="color: #8B95A7; font-size: 0.85rem;">Clique em "Adicionar" para criar</div>' +
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
                                '<div class="lote-title">' + lote.nome + ' <span class="lote-badge">' + lote.percentual + '%</span></div>' +
                                '<div class="lote-dates">' +
                                    '<span class="date-item">Início: ' + formatarData(lote.dataInicio) + '</span>' +
                                    '<span class="date-item">Fim: ' + formatarData(lote.dataFim) + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<button class="btn-action-delete" onclick="excluirLoteComValidacao(\'' + lote.id + '\', \'percentual\')">' +
                                '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">' +
                                    '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>' +
                                    '<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>' +
                                '</svg>' +
                            '</button>' +
                        '</div>';
                    containerPercentual.appendChild(div);
                });
            } else {
                containerPercentual.innerHTML = 
                    '<div class="lote-empty-state" id="lotePercentualEmpty">' +
                        '<div style="font-size: 2rem; margin-bottom: 10px;">📊</div>' +
                        '<div style="color: #8B95A7;">Nenhum lote por percentual criado</div>' +
                        '<div style="color: #8B95A7; font-size: 0.85rem;">Clique em "Adicionar" para criar</div>' +
                    '</div>';
            }
        }
    }
    
    // 4. EXCLUIR COM VALIDAÇÃO DE INGRESSOS
    window.excluirLoteComValidacao = function(loteId, tipo) {
        // Verificar se existem ingressos associados
        const ingressosAssociados = verificarIngressosAssociados(loteId);
        
        if (ingressosAssociados) {
            showDialog('Este lote possui ingressos associados e não pode ser excluído.', 'error');
            return;
        }
        
        // Usar dialog customizado para confirmação
        showConfirmDialog('Tem certeza que deseja excluir este lote?', function() {
            if (tipo === 'data') {
                window.lotesData.porData = window.lotesData.porData.filter(function(l) { 
                    return l.id !== loteId; 
                });
            } else {
                window.lotesData.porPercentual = window.lotesData.porPercentual.filter(function(l) { 
                    return l.id !== loteId; 
                });
            }
            
            atualizarVisualizacaoEstilizada();
            salvarLotes();
            showDialog('Lote excluído com sucesso!', 'success');
        });
    };
    
    // Verificar ingressos associados
    function verificarIngressosAssociados(loteId) {
        const ticketItems = document.querySelectorAll('.ticket-item');
        for (let i = 0; i < ticketItems.length; i++) {
            if (ticketItems[i].dataset.loteId === loteId) {
                return true;
            }
        }
        return false;
    }
    
    // Funções de dialog customizado
    function showDialog(message, type) {
        if (window.showCustomAlert) {
            window.showCustomAlert(message, type);
        } else {
            // Fallback para console se não tiver dialog customizado
            console.log(type + ': ' + message);
        }
    }
    
    function showConfirmDialog(message, onConfirm) {
        if (window.showCustomConfirm) {
            window.showCustomConfirm(message, onConfirm);
        } else {
            // Fallback para confirm nativo
            if (confirm(message)) {
                onConfirm();
            }
        }
    }
    
    // Função auxiliar para fechar modal
    function fecharModalLote(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (window.bootstrap && bootstrap.Modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                } else {
                    const newModal = new bootstrap.Modal(modal);
                    newModal.hide();
                }
            } else if (window.$ && $.fn.modal) {
                $(modal).modal('hide');
            } else {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
        }
    }
    
    // Outras funções mantidas...
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
        console.log('🎫 Carregando lotes para ingressos...');
        
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
            showDialog('É necessário criar pelo menos um lote!', 'warning');
            return false;
        }
        
        if (window.lotesData.porPercentual.length > 0) {
            const tem100 = window.lotesData.porPercentual.some(function(l) { 
                return l.percentual === 100; 
            });
            if (!tem100) {
                showDialog('É necessário ter pelo menos um lote com 100% de vendas!', 'warning');
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
            atualizarVisualizacaoEstilizada();
        } catch (e) {
            console.error('Erro ao carregar lotes:', e);
        }
    }
    
    // Interceptar cliques na etapa 6
    document.addEventListener('click', function(e) {
        if (e.target.id === 'addPaidTicket' || 
            e.target.id === 'addFreeTicket' || 
            e.target.id === 'addComboTicket') {
            setTimeout(carregarLotesParaIngressos, 200);
        }
    });
    
    // Adicionar estilos CSS
    const style = document.createElement('style');
    style.textContent = `
        .lote-item-styled {
            margin-bottom: 12px;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s ease;
        }
        
        .lote-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s ease;
        }
        
        .lote-item-styled:hover .lote-content {
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
            margin-bottom: 8px;
        }
        
        .lote-badge {
            display: inline-block;
            padding: 2px 8px;
            background: #00C2FF;
            color: #1a1a2e;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .lote-dates {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #8B95A7;
        }
        
        .date-item {
            display: flex;
            align-items: center;
        }
        
        .btn-action-delete {
            background: transparent;
            border: 1px solid rgba(220, 53, 69, 0.5);
            color: #dc3545;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn-action-delete:hover {
            background: rgba(220, 53, 69, 0.1);
            border-color: #dc3545;
            transform: translateY(-1px);
        }
        
        .btn-action-delete svg {
            width: 16px;
            height: 16px;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ SISTEMA DE LOTES AJUSTADO E FUNCIONANDO');
    
}, 1000);