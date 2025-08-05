// =====================================================
// OVERRIDE FORÇADO - SISTEMA DE LOTES
// =====================================================

console.log('🚨 APLICANDO OVERRIDE FORÇADO DO SISTEMA DE LOTES');
console.log('Timestamp:', new Date().toISOString());

// Aguardar um pouco para garantir que outros scripts carregaram
setTimeout(function() {
    console.log('🔧 Sobrescrevendo funções do sistema de lotes...');
    
    // FORÇAR DEFINIÇÃO DAS FUNÇÕES
    window.criarLoteData = function() {
        console.log('📅 Criando lote por data (OVERRIDE)...');
        
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
        
        // Garantir que lotesData existe
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
        atualizarVisualizacaoSimples();
        
        // Fechar modal
        if (window.bootstrap && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('loteDataModal'));
            if (modal) modal.hide();
        }
        
        // Salvar
        salvarLotesSimples();
        
        // Limpar campos
        document.getElementById('loteDataNome').value = '';
        document.getElementById('loteDataInicio').value = '';
        document.getElementById('loteDataFim').value = '';
        
        console.log('✅ Lote criado:', novoLote);
    };
    
    window.criarLotePercentual = function() {
        console.log('📊 Criando lote percentual (OVERRIDE)...');
        
        const nome = document.getElementById('lotePercentualNome')?.value || '';
        const percentual = document.getElementById('lotePercentualVendido')?.value;
        const dataInicio = document.getElementById('lotePercentualInicio')?.value;
        const dataFim = document.getElementById('lotePercentualFim')?.value;
        
        if (!percentual || !dataInicio || !dataFim) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        const percentualNum = parseInt(percentual);
        if (percentualNum < 0 || percentualNum > 100) {
            alert('O percentual deve estar entre 0 e 100');
            return;
        }
        
        // Garantir que lotesData existe
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
        atualizarVisualizacaoSimples();
        
        // Fechar modal
        if (window.bootstrap && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('lotePercentualModal'));
            if (modal) modal.hide();
        }
        
        // Salvar
        salvarLotesSimples();
        
        // Limpar campos
        document.getElementById('lotePercentualNome').value = '';
        document.getElementById('lotePercentualVendido').value = '';
        document.getElementById('lotePercentualInicio').value = '';
        document.getElementById('lotePercentualFim').value = '';
        
        console.log('✅ Lote criado:', novoLote);
    };
    
    window.carregarLotesParaIngressos = function() {
        console.log('🎫 Carregando lotes para ingressos (OVERRIDE)...');
        
        const selects = [
            document.getElementById('paidTicketLote'),
            document.getElementById('freeTicketLote'),
            document.getElementById('comboTicketLote')
        ];
        
        selects.forEach(function(select) {
            if (!select) return;
            
            select.innerHTML = '<option value="">Selecione um lote</option>';
            
            // Garantir que lotesData existe
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
        
        console.log('✅ Lotes carregados nos selects');
    };
    
    // Funções auxiliares
    function atualizarVisualizacaoSimples() {
        console.log('🖼️ Atualizando visualização...');
        
        const containerData = document.getElementById('lotesPorDataList');
        const containerPercentual = document.getElementById('lotesPorPercentualList');
        
        if (containerData) {
            if (window.lotesData.porData.length > 0) {
                containerData.innerHTML = '';
                window.lotesData.porData.forEach(function(lote) {
                    const div = document.createElement('div');
                    div.style.cssText = 'padding: 10px; background: #f5f5f5; margin: 5px 0; border-radius: 5px;';
                    div.innerHTML = '<strong>' + lote.nome + '</strong><br>' +
                                   'Início: ' + formatarData(lote.dataInicio) + '<br>' +
                                   'Fim: ' + formatarData(lote.dataFim);
                    containerData.appendChild(div);
                });
            }
        }
        
        if (containerPercentual) {
            if (window.lotesData.porPercentual.length > 0) {
                containerPercentual.innerHTML = '';
                window.lotesData.porPercentual.forEach(function(lote) {
                    const div = document.createElement('div');
                    div.style.cssText = 'padding: 10px; background: #f5f5f5; margin: 5px 0; border-radius: 5px;';
                    div.innerHTML = '<strong>' + lote.nome + ' - ' + lote.percentual + '%</strong><br>' +
                                   'Início: ' + formatarData(lote.dataInicio) + '<br>' +
                                   'Fim: ' + formatarData(lote.dataFim);
                    containerPercentual.appendChild(div);
                });
            }
        }
    }
    
    function formatarData(dataStr) {
        if (!dataStr) return '';
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    }
    
    function salvarLotesSimples() {
        const dados = JSON.stringify(window.lotesData);
        document.cookie = 'lotesData=' + encodeURIComponent(dados) + ';path=/;max-age=604800';
    }
    
    // Validação do Step 5
    window.validarLotes = function() {
        window.lotesData = window.lotesData || { porData: [], porPercentual: [] };
        
        const temLotes = window.lotesData.porData.length > 0 || window.lotesData.porPercentual.length > 0;
        
        if (!temLotes) {
            alert('É necessário criar pelo menos um lote!');
            return false;
        }
        
        if (window.lotesData.porPercentual.length > 0) {
            const tem100 = window.lotesData.porPercentual.some(function(l) { return l.percentual === 100; });
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
    
    // Interceptar cliques nos botões da etapa 6
    document.addEventListener('click', function(e) {
        if (e.target.id === 'addPaidTicket' || 
            e.target.id === 'addFreeTicket' || 
            e.target.id === 'addComboTicket') {
            setTimeout(carregarLotesParaIngressos, 200);
        }
    });
    
    console.log('✅ OVERRIDE COMPLETO - Funções disponíveis:');
    console.log('- criarLoteData()');
    console.log('- criarLotePercentual()');
    console.log('- carregarLotesParaIngressos()');
    console.log('- validarLotes()');
    
}, 1000); // Aguardar 1 segundo para garantir que outros scripts carregaram