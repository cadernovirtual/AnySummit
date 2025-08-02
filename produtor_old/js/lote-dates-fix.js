// Correções para carregar datas do lote em ingressos
// Este arquivo aplica datas do lote automaticamente e deixa campos readonly

(function() {
    console.log('🔧 Aplicando correções para datas de lotes em ingressos...');
    
    // Função para aplicar datas do lote no ingresso
    window.applyLoteDatesToTicket = function(loteId, ticketModal) {
        console.log('📅 Aplicando datas do lote:', loteId);
        
        if (!loteId) return;
        
        // Buscar dados do lote
        const loteCard = document.querySelector(`[data-lote-id="${loteId}"]`);
        if (!loteCard) {
            console.warn('Lote não encontrado:', loteId);
            return;
        }
        
        // Verificar se é lote por data
        if (loteCard.classList.contains('por-data')) {
            console.log('✅ Lote por data encontrado');
            
            // Extrair datas do lote
            const dataInicioText = loteCard.querySelector('.lote-data-inicio')?.textContent || '';
            const dataFimText = loteCard.querySelector('.lote-data-fim')?.textContent || '';
            
            console.log('Datas extraídas:', { dataInicioText, dataFimText });
            
            // Converter datas para formato datetime-local
            const dataInicio = convertToDateTimeLocal(dataInicioText);
            const dataFim = convertToDateTimeLocal(dataFimText);
            
            // Aplicar datas nos campos do modal
            if (ticketModal) {
                // Ingresso pago
                const startInput = ticketModal.querySelector('#paidTicketSaleStart, #editPaidTicketSaleStart');
                const endInput = ticketModal.querySelector('#paidTicketSaleEnd, #editPaidTicketSaleEnd');
                
                // Ingresso gratuito
                const freeStartInput = ticketModal.querySelector('#freeTicketSaleStart, #editFreeTicketSaleStart');
                const freeEndInput = ticketModal.querySelector('#freeTicketSaleEnd, #editFreeTicketSaleEnd');
                
                // Combo
                const comboStartInput = ticketModal.querySelector('#comboSaleStart, #editComboSaleStart');
                const comboEndInput = ticketModal.querySelector('#comboSaleEnd, #editComboSaleEnd');
                
                // Aplicar em campos de ingresso pago
                if (startInput && dataInicio) {
                    startInput.value = dataInicio;
                    startInput.readOnly = true;
                    startInput.style.backgroundColor = '#f5f5f5';
                }
                if (endInput && dataFim) {
                    endInput.value = dataFim;
                    endInput.readOnly = true;
                    endInput.style.backgroundColor = '#f5f5f5';
                }
                
                // Aplicar em campos de ingresso gratuito
                if (freeStartInput && dataInicio) {
                    freeStartInput.value = dataInicio;
                    freeStartInput.readOnly = true;
                    freeStartInput.style.backgroundColor = '#f5f5f5';
                }
                if (freeEndInput && dataFim) {
                    freeEndInput.value = dataFim;
                    freeEndInput.readOnly = true;
                    freeEndInput.style.backgroundColor = '#f5f5f5';
                }
                
                // Aplicar em campos de combo
                if (comboStartInput && dataInicio) {
                    comboStartInput.value = dataInicio;
                    comboStartInput.readOnly = true;
                    comboStartInput.style.backgroundColor = '#f5f5f5';
                }
                if (comboEndInput && dataFim) {
                    comboEndInput.value = dataFim;
                    comboEndInput.readOnly = true;
                    comboEndInput.style.backgroundColor = '#f5f5f5';
                }
            }
        } else {
            console.log('✅ Lote por percentual - liberando campos de data');
            
            // Liberar campos se não for lote por data
            if (ticketModal) {
                const allDateInputs = ticketModal.querySelectorAll(
                    '#paidTicketSaleStart, #paidTicketSaleEnd, ' +
                    '#editPaidTicketSaleStart, #editPaidTicketSaleEnd, ' +
                    '#freeTicketSaleStart, #freeTicketSaleEnd, ' +
                    '#editFreeTicketSaleStart, #editFreeTicketSaleEnd, ' +
                    '#comboSaleStart, #comboSaleEnd, ' +
                    '#editComboSaleStart, #editComboSaleEnd'
                );
                
                allDateInputs.forEach(input => {
                    input.readOnly = false;
                    input.style.backgroundColor = '';
                });
            }
        }
    };
    
    // Função para converter texto de data para datetime-local
    function convertToDateTimeLocal(dateText) {
        if (!dateText) return '';
        
        // Remover prefixos como "Início: " ou "Fim: "
        dateText = dateText.replace(/^(Início:|Fim:)\s*/, '');
        
        // Tentar parsear a data (formato brasileiro DD/MM/YYYY HH:mm)
        const parts = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
        if (parts) {
            const [_, dia, mes, ano, hora, minuto] = parts;
            return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
        }
        
        return '';
    }
    
    // Adicionar listeners para mudança de lote
    document.addEventListener('DOMContentLoaded', function() {
        // Listener para select de lote em ingresso pago
        const paidLoteSelect = document.getElementById('paidTicketLote');
        const editPaidLoteSelect = document.getElementById('editPaidTicketLote');
        
        if (paidLoteSelect) {
            paidLoteSelect.addEventListener('change', function() {
                const modal = document.getElementById('paidTicketModal');
                window.applyLoteDatesToTicket(this.value, modal);
            });
        }
        
        if (editPaidLoteSelect) {
            editPaidLoteSelect.addEventListener('change', function() {
                const modal = document.getElementById('editPaidTicketModal');
                window.applyLoteDatesToTicket(this.value, modal);
            });
        }
        
        // Listener para select de lote em ingresso gratuito
        const freeLoteSelect = document.getElementById('freeTicketLote');
        const editFreeLoteSelect = document.getElementById('editFreeTicketLote');
        
        if (freeLoteSelect) {
            freeLoteSelect.addEventListener('change', function() {
                const modal = document.getElementById('freeTicketModal');
                window.applyLoteDatesToTicket(this.value, modal);
            });
        }
        
        if (editFreeLoteSelect) {
            editFreeLoteSelect.addEventListener('change', function() {
                const modal = document.getElementById('editFreeTicketModal');
                window.applyLoteDatesToTicket(this.value, modal);
            });
        }
        
        // Listener para select de lote em combo
        const comboLoteSelect = document.getElementById('comboLote');
        const editComboLoteSelect = document.getElementById('editComboLote');
        
        if (comboLoteSelect) {
            comboLoteSelect.addEventListener('change', function() {
                const modal = document.getElementById('comboModal');
                window.applyLoteDatesToTicket(this.value, modal);
            });
        }
        
        if (editComboLoteSelect) {
            editComboLoteSelect.addEventListener('change', function() {
                const modal = document.getElementById('editComboModal');
                window.applyLoteDatesToTicket(this.value, modal);
            });
        }
    });
    
    console.log('✅ Correções de datas de lotes aplicadas com sucesso!');
})();
