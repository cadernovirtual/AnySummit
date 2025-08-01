// =====================================================
// CORREÇÃO FINAL - SISTEMA DE LOTES FUNCIONANDO
// =====================================================

console.log('🚨 APLICANDO CORREÇÕES FINAIS DO SISTEMA DE LOTES');

// Aguardar carregamento completo
setTimeout(function() {
    console.log('🔧 Aplicando correções...');
    
    // 1. CRIAR LOTE POR DATA
    window.criarLoteData = function() {
        console.log('📅 Criando lote por data...');
        
        const nome = document.getElementById('loteDataNome')?.value || '';
        const dataInicio = document.getElementById('loteDataInicio')?.value;
        const dataFim = document.getElementById('loteDataFim')?.value;
        
        if (!dataInicio || !dataFim) {
            alert('Por favor, preencha as datas de início e fim');
            return;
        }
        
        if (new Date(dataInicio) >= new Date(dataFim)) {
            alert('A data de início deve ser anterior à data de fim');
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
        
        // Atualizar visualização
        atualizarVisualizacaoCompleta();
        
        // Fechar modal - tentar várias formas
        const modal = document.getElementById('loteDataModal');
        if (modal) {
            // Bootstrap 5
            if (window.bootstrap && bootstrap.Modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                } else {
                    const newModal = new bootstrap.Modal(modal);
                    newModal.hide();
                }
            }
            // jQuery
            else if (window.$ && $.fn.modal) {
                $(modal).modal('hide');
            }
            // Forçar fechamento
            else {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
        }
        
        // Salvar
        salvarLotes();
        
        // Limpar campos
        document.getElementById('loteDataNome').value = '';
        document.getElementById('loteDataInicio').value = '';
        document.getElementById('loteDataFim').value = '';
    };
    
    // 2. CRIAR LOTE PERCENTUAL
    window.criarLotePercentual = function() {
        console.log('📊 Criando lote percentual...');
        
        const nome = document.getElementById('lotePercentualNome')?.value || '';
        const percentualInput = document.getElementById('lotePercentualVendido');
        const dataInicio = document.getElementById('lotePercentualInicio')?.value;
        const dataFim = document.getElementById('lotePercentualFim')?.value;
        
        // Debug
        console.log('Valores:', {
            nome: nome,
            percentual: percentualInput?.value,
            dataInicio: dataInicio,
            dataFim: dataFim
        });
        
        if (!percentualInput?.value || !dataInicio || !dataFim) {
            alert('Por favor, preencha todos os campos obrigatórios');
            console.log('Campos vazios:', {
                percentual: !percentualInput?.value,
                dataInicio: !dataInicio,
                dataFim: !dataFim
            });
            return;
        }
        
        const percentualNum = parseInt(percentualInput.value);
        if (isNaN(percentualNum) || percentualNum < 0 || percentualNum > 100) {
            alert('O percentual deve ser um número entre 0 e 100');
            return;
        }
        
        if (new Date(dataInicio) >= new Date(dataFim)) {
            alert('A data de início deve ser anterior à data de fim');
            return;
        }
        
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
        
        // Atualizar visualização
        atualizarVisualizacaoCompleta();
        
        // Fechar modal
        const modal = document.getElementById('lotePercentualModal');
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
        
        // Salvar
        salvarLotes();
        
        // Limpar campos
        document.getElementById('lotePercentualNome').value = '';
        document.getElementById('lotePercentualVendido').value = '';
        document.getElementById('lotePercentualInicio').value = '';
        document.getElementById('lotePercentualFim').value = '';
    };
    
    // 3. ATUALIZAR VISUALIZAÇÃO COM BOTÃO EXCLUIR
    function atualizarVisualizacaoCompleta() {
        console.log('🖼️ Atualizando visualização completa...');
        
        const containerData = document.getElementById('lotesPorDataList');
        const containerPercentual = document.getElementById('lotesPorPercentualList');
        
        // Lotes por data
        if (containerData) {
            if (window.lotesData.porData.length > 0) {
                containerData.innerHTML = '';
                window.lotesData.porData.forEach(function(lote, index) {
                    const div = document.createElement('div');
                    div.className = 'lote-card';
                    div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 8px;';
                    
                    div.innerHTML = 
                        '<div style="flex: 1;">' +
                            '<strong style="color: #333; font-size: 16px;">' + lote.nome + '</strong><br>' +
                            '<small style="color: #666;">Início: ' + formatarData(lote.dataInicio) + '</small><br>' +
                            '<small style="color: #666;">Fim: ' + formatarData(lote.dataFim) + '</small>' +
                        '</div>' +
                        '<button class="btn-delete" onclick="excluirLote(\'' + lote.id + '\', \'data\')" ' +
                        'style="background: white; border: 1px solid #dc3545; color: #dc3545; padding: 6px 12px; ' +
                        'border-radius: 4px; cursor: pointer; font-size: 14px;">🗑️ Excluir</button>';
                    
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
                window.lotesData.porPercentual.forEach(function(lote, index) {
                    const div = document.createElement('div');
                    div.className = 'lote-card';
                    div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 8px;';
                    
                    div.innerHTML = 
                        '<div style="flex: 1;">' +
                            '<strong style="color: #333; font-size: 16px;">' + lote.nome + ' - ' + lote.percentual + '%</strong><br>' +
                            '<small style="color: #666;">Início: ' + formatarData(lote.dataInicio) + '</small><br>' +
                            '<small style="color: #666;">Fim: ' + formatarData(lote.dataFim) + '</small>' +
                        '</div>' +
                        '<button class="btn-delete" onclick="excluirLote(\'' + lote.id + '\', \'percentual\')" ' +
                        'style="background: white; border: 1px solid #dc3545; color: #dc3545; padding: 6px 12px; ' +
                        'border-radius: 4px; cursor: pointer; font-size: 14px;">🗑️ Excluir</button>';
                    
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
    
    // 4. FUNÇÃO EXCLUIR
    window.excluirLote = function(loteId, tipo) {
        if (!confirm('Tem certeza que deseja excluir este lote?')) {
            return;
        }
        
        if (tipo === 'data') {
            window.lotesData.porData = window.lotesData.porData.filter(function(l) { 
                return l.id !== loteId; 
            });
        } else {
            window.lotesData.porPercentual = window.lotesData.porPercentual.filter(function(l) { 
                return l.id !== loteId; 
            });
        }
        
        atualizarVisualizacaoCompleta();
        salvarLotes();
    };
    
    // 5. CARREGAR LOTES PARA INGRESSOS
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
            
            // Lotes por data
            window.lotesData.porData.forEach(function(lote) {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome + ' - Por Data';
                select.appendChild(option);
            });
            
            // Lotes por percentual
            window.lotesData.porPercentual.forEach(function(lote) {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = lote.nome + ' - ' + lote.percentual + '%';
                select.appendChild(option);
            });
        });
    };
    
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
            alert('É necessário criar pelo menos um lote!');
            return false;
        }
        
        if (window.lotesData.porPercentual.length > 0) {
            const tem100 = window.lotesData.porPercentual.some(function(l) { 
                return l.percentual === 100; 
            });
            if (!tem100) {
                alert('É necessário ter pelo menos um lote com 100% de vendas!');
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
            atualizarVisualizacaoCompleta();
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
    
    console.log('✅ SISTEMA DE LOTES CORRIGIDO E FUNCIONANDO');
    
}, 1000);