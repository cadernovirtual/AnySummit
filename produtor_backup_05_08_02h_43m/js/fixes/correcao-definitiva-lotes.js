// =====================================================
// CORREÇÃO DEFINITIVA E SIMPLES - LOTES
// =====================================================

console.log('🔧 Aplicando correção definitiva dos lotes...');

// 1. CORRIGIR VISUALIZAÇÃO DOS LOTES NA ETAPA 5
window.atualizarVisualizacaoLotes = function() {
    console.log('📋 Atualizando visualização dos lotes...');
    
    const containerData = document.getElementById('lotesPorDataList');
    const containerPercentual = document.getElementById('lotesPorPercentualList');
    
    // Lotes por data
    if (containerData) {
        if (window.lotesData.porData.length > 0) {
            containerData.innerHTML = '';
            window.lotesData.porData.forEach(lote => {
                const div = document.createElement('div');
                div.className = 'lote-item';
                div.innerHTML = `
                    <div style="flex: 1;">
                        <strong>${lote.nome}</strong><br>
                        <small>Início: ${formatarDataHora(lote.dataInicio)}</small><br>
                        <small>Fim: ${formatarDataHora(lote.dataFim)}</small>
                    </div>
                    <button class="btn-delete" onclick="excluirLoteSeguro('${lote.id}', 'data')">🗑️</button>
                `;
                containerData.appendChild(div);
            });
        } else {
            containerData.innerHTML = `
                <div class="lote-empty-state">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📅</div>
                    <div style="color: #8B95A7;">Nenhum lote por data criado</div>
                </div>
            `;
        }
    }
    
    // Lotes por percentual
    if (containerPercentual) {
        if (window.lotesData.porPercentual.length > 0) {
            containerPercentual.innerHTML = '';
            window.lotesData.porPercentual.forEach(lote => {
                const div = document.createElement('div');
                div.className = 'lote-item';
                div.innerHTML = `
                    <div style="flex: 1;">
                        <strong>${lote.nome} - ${lote.percentual}%</strong><br>
                        <small>Início: ${formatarDataHora(lote.dataInicio)}</small><br>
                        <small>Fim: ${formatarDataHora(lote.dataFim)}</small>
                    </div>
                    <button class="btn-delete" onclick="excluirLoteSeguro('${lote.id}', 'percentual')">🗑️</button>
                `;
                containerPercentual.appendChild(div);
            });
        } else {
            containerPercentual.innerHTML = `
                <div class="lote-empty-state">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                    <div style="color: #8B95A7;">Nenhum lote por percentual criado</div>
                </div>
            `;
        }
    }
};

// 2. FUNÇÃO PARA CARREGAR LOTES NOS MODAIS DE INGRESSO
window.carregarLotesParaIngressos = function() {
    console.log('🎫 Carregando lotes para ingressos...');
    
    // Selects dos modais
    const selects = [
        document.getElementById('paidTicketLote'),
        document.getElementById('freeTicketLote'),
        document.getElementById('comboTicketLote')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um lote</option>';
        
        // Adicionar lotes por data
        if (window.lotesData.porData) {
            window.lotesData.porData.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = `${lote.nome} - Por Data`;
                option.setAttribute('data-inicio', lote.dataInicio);
                option.setAttribute('data-fim', lote.dataFim);
                select.appendChild(option);
            });
        }
        
        // Adicionar lotes por percentual
        if (window.lotesData.porPercentual) {
            window.lotesData.porPercentual.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.id;
                option.textContent = `${lote.nome} - ${lote.percentual}%`;
                option.setAttribute('data-inicio', lote.dataInicio);
                option.setAttribute('data-fim', lote.dataFim);
                select.appendChild(option);
            });
        }
    });
};

// 3. INTERCEPTAR ABERTURA DOS MODAIS DE INGRESSO
document.addEventListener('DOMContentLoaded', function() {
    // Botões da etapa 6
    const btnPaid = document.getElementById('addPaidTicket');
    const btnFree = document.getElementById('addFreeTicket');
    const btnCombo = document.getElementById('addComboTicket');
    
    if (btnPaid) {
        btnPaid.addEventListener('click', () => {
            setTimeout(carregarLotesParaIngressos, 100);
        });
    }
    
    if (btnFree) {
        btnFree.addEventListener('click', () => {
            setTimeout(carregarLotesParaIngressos, 100);
        });
    }
    
    if (btnCombo) {
        btnCombo.addEventListener('click', () => {
            setTimeout(carregarLotesParaIngressos, 100);
        });
    }
});

// 4. FUNÇÃO AUXILIAR PARA FORMATAR DATA
function formatarDataHora(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
}

// 5. ESTILOS CSS SIMPLES
const style = document.createElement('style');
style.textContent = `
    .lote-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        margin-bottom: 8px;
    }
    
    .lote-item:hover {
        background: #f0f0f0;
    }
    
    .btn-delete {
        background: transparent;
        border: 1px solid #dc3545;
        color: #dc3545;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .btn-delete:hover {
        background: #dc3545;
        color: white;
    }
`;
document.head.appendChild(style);

// 6. SOBRESCREVER FUNÇÕES DE CRIAÇÃO PARA GARANTIR COMPATIBILIDADE
const criarLoteDataOriginal = window.criarLoteData;
window.criarLoteData = function() {
    // Chamar original
    if (criarLoteDataOriginal) {
        criarLoteDataOriginal.apply(this, arguments);
    }
    
    // Garantir que a visualização seja atualizada
    setTimeout(() => {
        atualizarVisualizacaoLotes();
        // Forçar carregamento nos selects se algum modal estiver aberto
        carregarLotesParaIngressos();
    }, 100);
};

const criarLotePercentualOriginal = window.criarLotePercentual;
window.criarLotePercentual = function() {
    // Chamar original
    if (criarLotePercentualOriginal) {
        criarLotePercentualOriginal.apply(this, arguments);
    }
    
    // Garantir que a visualização seja atualizada
    setTimeout(() => {
        atualizarVisualizacaoLotes();
        // Forçar carregamento nos selects se algum modal estiver aberto
        carregarLotesParaIngressos();
    }, 100);
};

console.log('✅ Correção definitiva aplicada - Lotes devem funcionar corretamente agora');