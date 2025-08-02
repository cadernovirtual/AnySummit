// Funções para gerenciamento de ingressos gratuitos

// Variável para armazenar percentual do lote (compartilhada com ingresso pago)
let loteAtualPercentualFree = null;

// Função para atualizar as datas do ingresso gratuito baseado no lote
window.updateFreeTicketDates = function() {
    const selectLote = document.getElementById('freeTicketLote');
    const startInput = document.getElementById('freeSaleStart');
    const endInput = document.getElementById('freeSaleEnd');
    const titleSection = document.getElementById('freeTicketPeriodTitle');
    const quantidadeContainer = document.getElementById('freeQuantidadeLoteContainer');
    
    if (!selectLote || !startInput || !endInput) return;
    
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    
    if (!selectedOption || selectedOption.value === '') {
        startInput.value = '';
        endInput.value = '';
        startInput.setAttribute('readonly', true);
        endInput.setAttribute('readonly', true);
        titleSection.textContent = 'Período das vendas';
        if (quantidadeContainer) {
            quantidadeContainer.style.display = 'none';
        }
        loteAtualPercentualFree = null;
        return;
    }
    
    const tipo = selectedOption.getAttribute('data-tipo');
    const dataInicio = selectedOption.getAttribute('data-inicio');
    const dataFim = selectedOption.getAttribute('data-fim');
    const percentual = selectedOption.getAttribute('data-percentual');
    
    if (tipo === 'POR DATA') {
        if (dataInicio) startInput.value = formatarParaDateTimeLocal(dataInicio);
        if (dataFim) endInput.value = formatarParaDateTimeLocal(dataFim);
        startInput.setAttribute('readonly', true);
        endInput.setAttribute('readonly', true);
        titleSection.textContent = 'Período das vendas (Datas associadas ao Lote escolhido)';
        if (quantidadeContainer) quantidadeContainer.style.display = 'none';
        loteAtualPercentualFree = null;
    } else if (tipo === 'POR PERCENTUAL') {
        const agora = new Date();
        startInput.value = formatarParaDateTimeLocal(agora.toISOString());
        const eventoDataInput = document.getElementById('startDateTime');
        if (eventoDataInput && eventoDataInput.value) {
            endInput.value = eventoDataInput.value;
        } else {
            const futuro = new Date();
            futuro.setDate(futuro.getDate() + 30);
            endInput.value = formatarParaDateTimeLocal(futuro.toISOString());
        }
        startInput.removeAttribute('readonly');
        endInput.removeAttribute('readonly');
        titleSection.textContent = 'Período das vendas';
        if (quantidadeContainer) quantidadeContainer.style.display = 'block';
        loteAtualPercentualFree = parseFloat(percentual) || 0;
        calcularQuantidadeLoteFree();
    }
};

// Função para calcular quantidade do lote gratuito
window.calcularQuantidadeLoteFree = function() {
    const quantidadeInput = document.getElementById('freeTicketQuantity');
    const quantidadeLoteInput = document.getElementById('freeTicketQuantidadeLote');
    
    if (!quantidadeInput || !quantidadeLoteInput || !loteAtualPercentualFree) return;
    
    const quantidade = parseInt(quantidadeInput.value) || 0;
    
    if (quantidade > 0 && loteAtualPercentualFree > 0) {
        const quantidadeLote = Math.ceil(quantidade * (loteAtualPercentualFree / 100));
        quantidadeLoteInput.value = `${quantidadeLote} ingressos`;
    } else {
        quantidadeLoteInput.value = '0 ingressos';
    }
};

// Função para carregar lotes no modal gratuito
window.carregarLotesNoModalFree = function() {
    console.log('Carregando lotes no modal de ingresso gratuito...');
    
    const selectLote = document.getElementById('freeTicketLote');
    if (!selectLote) {
        console.error('Select de lotes gratuito não encontrado!');
        return;
    }
    
    // Limpar opções existentes
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Primeiro tentar carregar lotes temporários (para novos eventos)
    if (typeof carregarLotesDoCookie === 'function') {
        carregarLotesDoCookie();
    }
    
    // Verificar se existe a variável global lotesData
    if (typeof lotesData !== 'undefined' && lotesData) {
        console.log('LotesData encontrado para gratuito:', lotesData);
        
        const todosLotes = [];
        
        // Adicionar lotes por data
        if (lotesData.porData && Array.isArray(lotesData.porData)) {
            lotesData.porData.forEach((lote, index) => {
                todosLotes.push({
                    id: lote.id || `temp_data_${index}`,
                    nome: lote.nome,
                    tipo: 'POR DATA',
                    data_inicio: lote.dataInicio,
                    data_fim: lote.dataFim,
                    percentual_venda: null
                });
            });
        }
        
        // Adicionar lotes por percentual
        if (lotesData.porPercentual && Array.isArray(lotesData.porPercentual)) {
            lotesData.porPercentual.forEach((lote, index) => {
                todosLotes.push({
                    id: lote.id || `temp_perc_${index}`,
                    nome: lote.nome,
                    tipo: 'POR PERCENTUAL',
                    data_inicio: null,
                    data_fim: null,
                    percentual_venda: lote.percentual
                });
            });
        }
        
        // Popular o select
        todosLotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.id;
            
            let descricao = `${lote.nome} - `;
            
            if (lote.tipo === 'POR DATA') {
                const dataInicio = formatarDataHora(lote.data_inicio);
                const dataFim = formatarDataHora(lote.data_fim);
                descricao += `Por Data (${dataInicio} até ${dataFim})`;
            } else if (lote.tipo === 'POR PERCENTUAL') {
                descricao += `Por Vendas (${lote.percentual_venda}% dos ingressos vendidos)`;
            }
            
            option.textContent = descricao;
            option.setAttribute('data-tipo', lote.tipo);
            option.setAttribute('data-inicio', lote.data_inicio || '');
            option.setAttribute('data-fim', lote.data_fim || '');
            option.setAttribute('data-percentual', lote.percentual_venda || '');
            
            selectLote.appendChild(option);
        });
        
        console.log(`Total de lotes adicionados no modal gratuito: ${todosLotes.length}`);
    } else {
        console.log('LotesData não encontrado para modal gratuito');
        
        // Tentar buscar do banco se houver evento_id
        let eventoId = null;
        const eventoIdInput = document.getElementById('evento_id');
        if (eventoIdInput && eventoIdInput.value) {
            eventoId = eventoIdInput.value;
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            eventoId = urlParams.get('id');
        }
        
        if (eventoId) {
            fetch(`/produtor/ajax/buscar_lotes.php?evento_id=${eventoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.lotes && data.lotes.length > 0) {
                        populateSelectLotesFree(data.lotes);
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar lotes:', error);
                });
        }
    }
};

// Função auxiliar para popular o select
function populateSelectLotesFree(lotes) {
    const selectLote = document.getElementById('freeTicketLote');
    if (!selectLote) return;
    
    lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        
        let descricao = `${lote.nome} - `;
        
        if (lote.tipo === 'POR DATA') {
            const dataInicio = formatarDataHora(lote.data_inicio);
            const dataFim = formatarDataHora(lote.data_fim);
            descricao += `Por Data (${dataInicio} até ${dataFim})`;
        } else if (lote.tipo === 'POR PERCENTUAL') {
            descricao += `Por Vendas (${lote.percentual_venda}% dos ingressos vendidos)`;
        }
        
        option.textContent = descricao;
        option.setAttribute('data-tipo', lote.tipo);
        option.setAttribute('data-inicio', lote.data_inicio || '');
        option.setAttribute('data-fim', lote.data_fim || '');
        option.setAttribute('data-percentual', lote.percentual_venda || '');
        
        selectLote.appendChild(option);
    });
}

// Funções auxiliares (caso não existam)
if (typeof formatarParaDateTimeLocal === 'undefined') {
    window.formatarParaDateTimeLocal = function(dataString) {
        if (!dataString) return '';
        
        const data = new Date(dataString);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    };
}

if (typeof formatarDataHora === 'undefined') {
    window.formatarDataHora = function(dataString) {
        if (!dataString) return '';
        
        const data = new Date(dataString);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    };
}

// Integrar com a abertura do modal
document.addEventListener('DOMContentLoaded', function() {
    const originalOpenModal = window.openModal;
    window.openModal = function(modalId) {
        if (originalOpenModal) {
            originalOpenModal(modalId);
        }
        
        if (modalId === 'freeTicketModal') {
            setTimeout(() => {
                carregarLotesNoModalFree();
            }, 200);
        }
    };
});
