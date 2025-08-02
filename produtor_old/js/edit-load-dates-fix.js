// Correção específica para carregar datas do lote imediatamente na abertura dos modais
(function() {
    console.log('🔧 Aplicando correção de carregamento imediato de datas...');
    
    // Aguardar carregamento
    setTimeout(function() {
        // Override específico para populateEditPaidTicketModal
        const originalPopulateEditPaid = window.populateEditPaidTicketModal;
        if (originalPopulateEditPaid) {
            window.populateEditPaidTicketModal = function(ticketData) {
                console.log('📝 Populando modal de edição pago com dados:', ticketData);
                
                // Chamar função original
                const result = originalPopulateEditPaid.apply(this, arguments);
                
                // Se tem loteId, aplicar datas imediatamente
                if (ticketData && ticketData.loteId) {
                    setTimeout(function() {
                        console.log('🔍 Buscando dados do lote:', ticketData.loteId);
                        
                        // Buscar o lote no DOM
                        const loteCard = document.querySelector(`[data-lote-id="${ticketData.loteId}"]`);
                        if (loteCard && loteCard.classList.contains('por-data')) {
                            console.log('✅ Lote por data encontrado, aplicando datas...');
                            
                            // Extrair datas
                            let dataInicio = '';
                            let dataFim = '';
                            
                            // Tentar extrair das informações do lote
                            const dataInicioEl = loteCard.querySelector('.lote-info span:first-child');
                            const dataFimEl = loteCard.querySelector('.lote-info span:nth-child(2)');
                            
                            if (dataInicioEl) {
                                const dataInicioText = dataInicioEl.textContent.replace('Início: ', '');
                                dataInicio = convertDateToInput(dataInicioText);
                            }
                            
                            if (dataFimEl) {
                                const dataFimText = dataFimEl.textContent.replace('Fim: ', '');
                                dataFim = convertDateToInput(dataFimText);
                            }
                            
                            // Aplicar nos campos
                            const startField = document.getElementById('editPaidSaleStart');
                            const endField = document.getElementById('editPaidSaleEnd');
                            
                            if (startField && dataInicio) {
                                startField.value = dataInicio;
                                startField.readOnly = true;
                                startField.style.backgroundColor = '#f5f5f5';
                            }
                            
                            if (endField && dataFim) {
                                endField.value = dataFim;
                                endField.readOnly = true;
                                endField.style.backgroundColor = '#f5f5f5';
                            }
                        }
                    }, 100);
                }
                
                return result;
            };
        }
        
        // Override para ingresso gratuito
        const originalPopulateEditFree = window.populateEditFreeTicketModal;
        if (originalPopulateEditFree) {
            window.populateEditFreeTicketModal = function(ticketData) {
                console.log('📝 Populando modal de edição gratuito:', ticketData);
                
                const result = originalPopulateEditFree.apply(this, arguments);
                
                if (ticketData && ticketData.loteId) {
                    setTimeout(function() {
                        const loteCard = document.querySelector(`[data-lote-id="${ticketData.loteId}"]`);
                        if (loteCard && loteCard.classList.contains('por-data')) {
                            // Mesma lógica de extração
                            applyLoteDatesToEditModal('editFreeSaleStart', 'editFreeSaleEnd', loteCard);
                        }
                    }, 100);
                }
                
                return result;
            };
        }
        
        // Função auxiliar
        function applyLoteDatesToEditModal(startFieldId, endFieldId, loteCard) {
            const dataInicioEl = loteCard.querySelector('.lote-info span:first-child');
            const dataFimEl = loteCard.querySelector('.lote-info span:nth-child(2)');
            
            let dataInicio = '';
            let dataFim = '';
            
            if (dataInicioEl) {
                const dataInicioText = dataInicioEl.textContent.replace('Início: ', '');
                dataInicio = convertDateToInput(dataInicioText);
            }
            
            if (dataFimEl) {
                const dataFimText = dataFimEl.textContent.replace('Fim: ', '');
                dataFim = convertDateToInput(dataFimText);
            }
            
            const startField = document.getElementById(startFieldId);
            const endField = document.getElementById(endFieldId);
            
            if (startField && dataInicio) {
                startField.value = dataInicio;
                startField.readOnly = true;
                startField.style.backgroundColor = '#f5f5f5';
            }
            
            if (endField && dataFim) {
                endField.value = dataFim;
                endField.readOnly = true;
                endField.style.backgroundColor = '#f5f5f5';
            }
        }
        
        // Função para converter data do formato brasileiro para input
        function convertDateToInput(dateText) {
            // Formato: "01/01/2024 10:00" -> "2024-01-01T10:00"
            const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
            if (match) {
                const [_, dia, mes, ano, hora, minuto] = match;
                return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
            }
            return '';
        }
        
        console.log('✅ Correção de carregamento imediato aplicada!');
    }, 2000); // Aguardar mais tempo para garantir que tudo esteja carregado
})();
