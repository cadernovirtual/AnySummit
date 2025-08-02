// =====================================================
// CORREÇÃO SIMPLES - IDs CORRETOS DOS CONTAINERS
// =====================================================

console.log('🔧 Aplicando correção de IDs...');

// Sobrescrever a função de atualização para usar os IDs corretos
window.atualizarVisualizacaoLotes = function() {
    console.log('🖼️ Atualizando visualização dos lotes...');
    
    const containerData = document.getElementById('lotesPorDataList');
    const containerPercentual = document.getElementById('lotesPorPercentualList');
    
    // Atualizar lotes por data
    if (containerData) {
        containerData.innerHTML = '';
        
        if (window.lotesData && window.lotesData.porData && window.lotesData.porData.length > 0) {
            window.lotesData.porData.forEach((lote, index) => {
                containerData.appendChild(criarElementoLote(lote, 'data', index));
            });
        } else {
            containerData.innerHTML = `
                <div class="lote-empty-state" id="loteDataEmpty">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📅</div>
                    <div style="color: #8B95A7;">Nenhum lote por data criado</div>
                    <div style="color: #8B95A7; font-size: 0.85rem;">Clique em "Adicionar" para criar</div>
                </div>
            `;
        }
    }
    
    // Atualizar lotes por percentual
    if (containerPercentual) {
        containerPercentual.innerHTML = '';
        
        if (window.lotesData && window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
            window.lotesData.porPercentual.forEach((lote, index) => {
                containerPercentual.appendChild(criarElementoLote(lote, 'percentual', index));
            });
        } else {
            containerPercentual.innerHTML = `
                <div class="lote-empty-state" id="lotePercentualEmpty">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                    <div style="color: #8B95A7;">Nenhum lote por percentual criado</div>
                    <div style="color: #8B95A7; font-size: 0.85rem;">Clique em "Adicionar" para criar</div>
                </div>
            `;
        }
    }
};

// Função auxiliar para criar elemento (se não existir)
window.criarElementoLote = window.criarElementoLote || function(lote, tipo, index) {
    const div = document.createElement('div');
    div.className = 'lote-card ' + (tipo === 'data' ? 'por-data' : 'por-percentual');
    div.setAttribute('data-lote-id', lote.id);
    
    const formatarData = (dataStr) => {
        const data = new Date(dataStr);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    };
    
    let conteudo = `
        <div class="lote-header">
            <h4 class="lote-nome">${lote.nome}</h4>
            <div class="lote-actions">
                <button class="btn-icon" onclick="editarLote('${lote.id}', '${tipo}')">✏️</button>
                <button class="btn-icon delete" onclick="excluirLoteSeguro('${lote.id}', '${tipo}')">🗑️</button>
            </div>
        </div>
        <div class="lote-info">
            <span>Início: ${formatarData(lote.dataInicio)}</span>
            <span>Fim: ${formatarData(lote.dataFim)}</span>
    `;
    
    if (tipo === 'percentual') {
        conteudo += `<span class="percentual-value">${lote.percentual}%</span>`;
    }
    
    conteudo += '</div>';
    div.innerHTML = conteudo;
    
    return div;
};

console.log('✅ Correção de IDs aplicada');