// Correção específica para ícone de lixeira no combo
console.log('🗑️ Aplicando correção do ícone de lixeira...');

(function() {
    // Aguardar a função estar disponível
    const checkInterval = setInterval(function() {
        if (window.renderEditComboItems) {
            clearInterval(checkInterval);
            
            // Salvar função original
            const originalRender = window.renderEditComboItems;
            
            // Substituir função
            window.renderEditComboItems = function() {
                console.log('🎨 Renderizando itens do combo com SVG...');
                
                const container = document.getElementById('editComboItemsList');
                if (!container) return;
                
                // Se não tem itens
                if (!window.editComboItems || window.editComboItems.length === 0) {
                    container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum tipo de ingresso adicionado</p>';
                    return;
                }
                
                // Renderizar com ícone SVG
                container.innerHTML = window.editComboItems.map((item, index) => `
                    <div class="combo-item">
                        <div class="combo-item-info">
                            <strong>${item.ticket_name}</strong>
                            <span>Quantidade: ${item.quantidade}</span>
                        </div>
                        <button class="btn-icon btn-delete" onclick="removeEditComboItem(${index})" title="Remover" style="background: none; border: none; cursor: pointer; padding: 5px;">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="#dc3545" style="display: block;">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                    </div>
                `).join('');
                
                console.log('✅ Itens renderizados com ícone SVG');
            };
            
            // Se já existem itens, re-renderizar
            if (window.editComboItems && window.editComboItems.length > 0) {
                window.renderEditComboItems();
            }
            
            console.log('✅ Função renderEditComboItems substituída com sucesso');
        }
    }, 100);
    
    // Também interceptar editCombo para garantir SVG
    const checkEditCombo = setInterval(function() {
        if (window.editCombo) {
            clearInterval(checkEditCombo);
            
            const originalEditCombo = window.editCombo;
            window.editCombo = function(comboId) {
                const result = originalEditCombo.apply(this, arguments);
                
                // Garantir que use SVG após abrir modal
                setTimeout(function() {
                    if (window.editComboItems && window.editComboItems.length > 0) {
                        window.renderEditComboItems();
                    }
                }, 500);
                
                return result;
            };
            
            console.log('✅ editCombo interceptado para garantir SVG');
        }
    }, 100);
})();

// Também adicionar CSS se necessário
const style = document.createElement('style');
style.textContent = `
    .btn-delete svg {
        transition: fill 0.2s;
    }
    .btn-delete:hover svg {
        fill: #a02020 !important;
    }
    .combo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        margin-bottom: 8px;
    }
    .combo-item-info {
        flex: 1;
    }
`;
document.head.appendChild(style);

console.log('✅ Correção de ícone de lixeira aplicada!');
