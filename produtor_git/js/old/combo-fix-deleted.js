// FUNÇÃO CORRIGIDA - updateComboItemsList
function updateComboItemsList() {
    const container = document.getElementById('comboItemsList');
    if (!container) return;
    
    if (comboItems.length === 0) {
        container.innerHTML = `
            <div class="combo-empty-state">
                <div style="font-size: 2rem; margin-bottom: 10px;">📦</div>
                <div style="color: #8B95A7;">Adicione tipos de ingresso ao combo</div>
                <div style="color: #8B95A7; font-size: 0.85rem;">Selecione os tipos já criados e defina quantidades</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = comboItems.map((item, index) => `
        <div class="combo-item">
            <div class="combo-item-info">
                <div class="combo-item-title">${item.name}</div>
                <div class="combo-item-details">${item.price}</div>
            </div>
            <div style="display: flex; align-items: center;">
                <div class="combo-item-quantity">${item.quantity}x</div>
                <button class="btn-icon btn-delete" onclick="removeComboItem(${index})" title="Remover">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}