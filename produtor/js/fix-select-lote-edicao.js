/**
 * FIX: Dialog de Edição - Select de Lote
 * 
 * PROBLEMA RESOLVIDO:
 * - Modal de edição abre mas select de lote não carrega automaticamente
 * - Precisa popular os lotes e aplicar regras (readonly, datas)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Fix para select de lote em edição carregado');
    
    // =======================================================
    // INTERCEPTAR ABERTURA DO MODAL DE EDIÇÃO PAGO
    // =======================================================
    
    // Interceptar a função openModal original
    if (window.openModal) {
        const originalOpenModal = window.openModal;
        
        window.openModal = function(modalId) {
            console.log(`🎭 Interceptando abertura do modal: ${modalId}`);
            
            // Se for modal de edição pago, popular select de lotes
            if (modalId === 'editPaidTicketModal') {
                popularSelectLotesEdicao();
            } else if (modalId === 'editFreeTicketModal') {
                popularSelectLotesEdicaoGratuito();
            } else if (modalId === 'editComboTicketModal') {
                popularSelectLotesEdicaoCombo();
            }
            
            // Chamar função original
            return originalOpenModal.apply(this, arguments);
        };
    }
    
    // =======================================================
    // POPULAR SELECT DE LOTES PARA EDIÇÃO
    // =======================================================
    
    function popularSelectLotesEdicao() {
        console.log('📋 Populando select de lotes para edição de ingresso pago');
        
        const selectLote = document.getElementById('editPaidTicketLote');
        if (!selectLote) {
            console.error('❌ Select editPaidTicketLote não encontrado');
            return;
        }
        
        // Salvar valor atual para restaurar após popular
        const valorAtual = selectLote.value;
        
        // Limpar e adicionar opção padrão
        selectLote.innerHTML = '<option value="">Selecione um lote</option>';
        
        // Verificar se há lotes na variável global
        if (typeof lotesData !== 'undefined' && lotesData) {
            console.log('📊 LotesData encontrado para edição');
            
            // Processar lotes por data
            if (lotesData.porData && Array.isArray(lotesData.porData)) {
                lotesData.porData.forEach(lote => {
                    const option = document.createElement('option');
                    option.value = lote.id;
                    
                    const dataInicio = formatarDataHora(lote.data_inicio);
                    const dataFim = formatarDataHora(lote.data_fim);
                    option.textContent = `${lote.nome} - Por Data (${dataInicio} até ${dataFim})`;
                    
                    option.setAttribute('data-tipo', 'data');
                    option.setAttribute('data-inicio', lote.data_inicio || '');
                    option.setAttribute('data-fim', lote.data_fim || '');
                    
                    selectLote.appendChild(option);
                });
            }
            
            // Processar lotes por percentual
            if (lotesData.porPercentual && Array.isArray(lotesData.porPercentual)) {
                lotesData.porPercentual.forEach(lote => {
                    const option = document.createElement('option');
                    option.value = lote.id;
                    option.textContent = `${lote.nome} - Por Vendas (${lote.percentual_venda}% dos ingressos vendidos)`;
                    
                    option.setAttribute('data-tipo', 'percentual');
                    option.setAttribute('data-percentual', lote.percentual_venda || '');
                    
                    selectLote.appendChild(option);
                });
            }
            
            // Restaurar valor original se existir
            if (valorAtual) {
                selectLote.value = valorAtual;
                console.log(`✅ Valor do lote restaurado: ${valorAtual}`);
                
                // Aplicar regras do lote selecionado
                setTimeout(() => {
                    aplicarRegrasDoLote('edicao', valorAtual);
                }, 100);
            }
            
        } else {
            console.warn('⚠️ lotesData não encontrado - tentando buscar via API');
            buscarLotesViaAPI('editPaidTicketLote', valorAtual);
        }
    }
    
    function popularSelectLotesEdicaoGratuito() {
        console.log('📋 Populando select de lotes para edição de ingresso gratuito');
        
        const selectLote = document.getElementById('editFreeTicketLote');
        if (!selectLote) return;
        
        const valorAtual = selectLote.value;
        popularSelectGenerico(selectLote, valorAtual);
    }
    
    function popularSelectLotesEdicaoCombo() {
        console.log('📋 Populando select de lotes para edição de combo');
        
        const selectLote = document.getElementById('editComboTicketLote');
        if (!selectLote) return;
        
        const valorAtual = selectLote.value;
        popularSelectGenerico(selectLote, valorAtual);
    }
    
    function popularSelectGenerico(selectLote, valorAtual) {
        // Limpar e popular igual ao método do pago
        selectLote.innerHTML = '<option value="">Selecione um lote</option>';
        
        if (typeof lotesData !== 'undefined' && lotesData) {
            // Lotes por data
            if (lotesData.porData && Array.isArray(lotesData.porData)) {
                lotesData.porData.forEach(lote => {
                    const option = document.createElement('option');
                    option.value = lote.id;
                    
                    const dataInicio = formatarDataHora(lote.data_inicio);
                    const dataFim = formatarDataHora(lote.data_fim);
                    option.textContent = `${lote.nome} - Por Data (${dataInicio} até ${dataFim})`;
                    
                    option.setAttribute('data-tipo', 'data');
                    option.setAttribute('data-inicio', lote.data_inicio || '');
                    option.setAttribute('data-fim', lote.data_fim || '');
                    
                    selectLote.appendChild(option);
                });
            }
            
            // Lotes por percentual
            if (lotesData.porPercentual && Array.isArray(lotesData.porPercentual)) {
                lotesData.porPercentual.forEach(lote => {
                    const option = document.createElement('option');
                    option.value = lote.id;
                    option.textContent = `${lote.nome} - Por Vendas (${lote.percentual_venda}% dos ingressos vendidos)`;
                    
                    option.setAttribute('data-tipo', 'percentual');
                    option.setAttribute('data-percentual', lote.percentual_venda || '');
                    
                    selectLote.appendChild(option);
                });
            }
            
            // Restaurar valor
            if (valorAtual) {
                selectLote.value = valorAtual;
            }
        }
    }
    
    // =======================================================
    // BUSCAR LOTES VIA API (FALLBACK)
    // =======================================================
    
    async function buscarLotesViaAPI(selectId, valorParaRestaurar) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_dados_lote&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.lotes) {
                console.log('✅ Lotes obtidos via API:', data.lotes);
                
                const select = document.getElementById(selectId);
                if (select) {
                    select.innerHTML = '<option value="">Selecione um lote</option>';
                    
                    data.lotes.forEach(lote => {
                        const option = document.createElement('option');
                        option.value = lote.id;
                        option.textContent = `${lote.nome} - ${lote.tipo}`;
                        select.appendChild(option);
                    });
                    
                    if (valorParaRestaurar) {
                        select.value = valorParaRestaurar;
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao buscar lotes via API:', error);
        }
    }
    
    // =======================================================
    // APLICAR REGRAS DO LOTE SELECIONADO
    // =======================================================
    
    async function aplicarRegrasDoLote(modalTipo, loteId) {
        if (!loteId) return;
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Obter tipo do lote
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_tipo_lote&evento_id=${eventoId}&lote_id=${loteId}`
            });
            
            const data = await response.json();
            
            if (data.tipo === 'data') {
                // Aplicar regras de lote por data (readonly)
                aplicarRegrasLoteData(modalTipo, loteId);
            } else {
                // Liberar campos para lote por percentual
                liberarCamposLotePercentual(modalTipo);
            }
            
        } catch (error) {
            console.error('❌ Erro ao aplicar regras do lote:', error);
        }
    }
    
    function aplicarRegrasLoteData(modalTipo, loteId) {
        const prefixo = modalTipo === 'criacao' ? 'paid' : 'editPaid';
        
        const campoInicio = document.getElementById(`${prefixo}SaleStart`);
        const campoFim = document.getElementById(`${prefixo}SaleEnd`);
        
        if (campoInicio) campoInicio.readOnly = true;
        if (campoFim) campoFim.readOnly = true;
        
        console.log(`🔒 Campos de data bloqueados para lote ${loteId}`);
    }
    
    function liberarCamposLotePercentual(modalTipo) {
        const prefixo = modalTipo === 'criacao' ? 'paid' : 'editPaid';
        
        const campoInicio = document.getElementById(`${prefixo}SaleStart`);
        const campoFim = document.getElementById(`${prefixo}SaleEnd`);
        
        if (campoInicio) campoInicio.readOnly = false;
        if (campoFim) campoFim.readOnly = false;
        
        console.log(`🔓 Campos de data liberados para lote por percentual`);
    }
    
    // =======================================================
    // FUNÇÃO AUXILIAR PARA FORMATAÇÃO DE DATA
    // =======================================================
    
    function formatarDataHora(dataString) {
        if (!dataString) return '';
        
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dataString;
        }
    }
    
    console.log('✅ Fix para select de lote em edição configurado');
});
