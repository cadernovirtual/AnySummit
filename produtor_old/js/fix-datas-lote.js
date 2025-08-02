// Fix para recuperar datas do lote ao editar ingresso/combo
(function() {
    console.log('📅 Fix de datas do lote iniciado...');
    
    // Função para buscar datas do lote
    window.recuperarDatasDoLote = function(loteId) {
        console.log(`🔍 Buscando datas do lote ${loteId}...`);
        
        // Tentar encontrar o lote nos dados salvos
        let dataInicio = null;
        let dataFim = null;
        
        // 1. Buscar em lotesData (cookie)
        try {
            const lotesCookie = document.cookie.split(';').find(c => c.trim().startsWith('lotesData='));
            if (lotesCookie) {
                const lotesData = JSON.parse(decodeURIComponent(lotesCookie.split('=')[1]));
                
                // Buscar em lotes por data
                if (lotesData.porData) {
                    const lote = lotesData.porData.find(l => l.id == loteId);
                    if (lote) {
                        dataInicio = lote.dataInicio;
                        dataFim = lote.dataFim;
                        console.log('✅ Datas encontradas em lotesData.porData');
                    }
                }
                
                // Buscar em lotes por percentual
                if (!dataInicio && lotesData.porPercentual) {
                    const lote = lotesData.porPercentual.find(l => l.id == loteId);
                    if (lote) {
                        // Lotes por percentual não têm datas próprias
                        console.log('⚠️ Lote por percentual - usar datas do evento');
                    }
                }
            }
        } catch (e) {
            console.error('Erro ao buscar em lotesData:', e);
        }
        
        // 2. Buscar no lotesManager se existir
        if (!dataInicio && window.lotesManager && window.lotesManager.getLotes) {
            const lotes = window.lotesManager.getLotes();
            const todosLotes = [...(lotes.porData || []), ...(lotes.porPercentual || [])];
            const lote = todosLotes.find(l => l.id == loteId);
            
            if (lote && lote.data_inicio) {
                dataInicio = lote.data_inicio;
                dataFim = lote.data_fim;
                console.log('✅ Datas encontradas no lotesManager');
            }
        }
        
        // 3. Se ainda não encontrou, buscar nas opções do select
        if (!dataInicio) {
            const selectLote = document.querySelector(`select option[value="${loteId}"]`);
            if (selectLote && selectLote.dataset.dataInicio) {
                dataInicio = selectLote.dataset.dataInicio;
                dataFim = selectLote.dataset.dataFim;
                console.log('✅ Datas encontradas no select option');
            }
        }
        
        return { dataInicio, dataFim };
    };
    
    // Função para aplicar datas do lote nos campos
    window.aplicarDatasDoLote = function(loteId, campoInicio, campoFim) {
        console.log(`📅 Aplicando datas do lote ${loteId}...`);
        
        const datas = recuperarDatasDoLote(loteId);
        
        if (datas.dataInicio && datas.dataFim) {
            // Formatar para datetime-local
            const formatarParaInput = (dataStr) => {
                const data = new Date(dataStr);
                const ano = data.getFullYear();
                const mes = String(data.getMonth() + 1).padStart(2, '0');
                const dia = String(data.getDate()).padStart(2, '0');
                const hora = String(data.getHours()).padStart(2, '0');
                const min = String(data.getMinutes()).padStart(2, '0');
                return `${ano}-${mes}-${dia}T${hora}:${min}`;
            };
            
            if (campoInicio) {
                campoInicio.value = formatarParaInput(datas.dataInicio);
                console.log('✅ Data início aplicada:', campoInicio.value);
            }
            
            if (campoFim) {
                campoFim.value = formatarParaInput(datas.dataFim);
                console.log('✅ Data fim aplicada:', campoFim.value);
            }
            
            return true;
        } else {
            console.log('❌ Datas do lote não encontradas');
            return false;
        }
    };
    
    // Interceptar mudanças de lote nos modais
    document.addEventListener('change', function(e) {
        // Modal de ingresso pago
        if (e.target.id === 'ticketLote') {
            console.log('🎫 Lote do ingresso pago alterado');
            const campoInicio = document.getElementById('ticketSaleStart');
            const campoFim = document.getElementById('ticketSaleEnd');
            
            if (campoInicio && campoFim && e.target.value) {
                aplicarDatasDoLote(e.target.value, campoInicio, campoFim);
            }
        }
        
        // Modal de combo
        if (e.target.id === 'comboTicketLote') {
            console.log('📦 Lote do combo alterado');
            const campoInicio = document.getElementById('comboSaleStart');
            const campoFim = document.getElementById('comboSaleEnd');
            
            if (campoInicio && campoFim && e.target.value) {
                aplicarDatasDoLote(e.target.value, campoInicio, campoFim);
            }
        }
        
        // Modal de ingresso gratuito
        if (e.target.id === 'freeTicketLote') {
            console.log('🎟️ Lote do ingresso gratuito alterado');
            const campoInicio = document.getElementById('freeTicketSaleStart');
            const campoFim = document.getElementById('freeTicketSaleEnd');
            
            if (campoInicio && campoFim && e.target.value) {
                aplicarDatasDoLote(e.target.value, campoInicio, campoFim);
            }
        }
    });
    
    // Função para debug
    window.debugDatasLotes = function() {
        console.log('🔍 Debug de datas dos lotes:');
        
        // Buscar todos os lotes disponíveis
        const selects = document.querySelectorAll('select[id*="Lote"]');
        selects.forEach(select => {
            console.log(`\nSelect: ${select.id}`);
            Array.from(select.options).forEach(option => {
                if (option.value) {
                    const datas = recuperarDatasDoLote(option.value);
                    console.log(`- Lote ${option.value}: ${option.text}`);
                    console.log(`  Início: ${datas.dataInicio || 'não encontrado'}`);
                    console.log(`  Fim: ${datas.dataFim || 'não encontrado'}`);
                }
            });
        });
    };
    
    console.log('✅ Fix de datas do lote carregado!');
    console.log('Use debugDatasLotes() para verificar');
})();