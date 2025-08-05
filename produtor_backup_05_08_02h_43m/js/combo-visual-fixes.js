// Correção DEFINITIVA V2 para ícones de lixeira e melhorias visuais em combos
(function() {
    console.log('🔧 Aplicando correção DEFINITIVA V2 de ícones e visual...');
    
    // Função para aplicar correções visuais
    function aplicarCorrecoesVisuais() {
        console.log('🎨 Aplicando correções visuais V2...');
        
        // =============== CORREÇÃO 1: ÍCONES DE LIXEIRA COM QUANTIDADE ===============
        // Trocar botões por emoji mas MANTER quantidade visível
        function trocarBotoesPorEmoji() {
            // Combos em criação - MANTER quantidade
            const itemsCriacao = document.querySelectorAll('#comboItems .combo-item, #comboItemsList .combo-item');
            itemsCriacao.forEach(item => {
                const btn = item.querySelector('.btn-delete, button[onclick*="removeComboItem"]');
                if (btn && !btn.innerHTML.includes('🗑️')) {
                    btn.innerHTML = '🗑️';
                    btn.style.cssText = 'background: none; border: none; color: #ff4444; cursor: pointer; font-size: 18px; padding: 4px; margin-left: 10px;';
                }
                
                // Garantir que a quantidade está visível
                const qtdElement = item.querySelector('.combo-item-quantity');
                if (qtdElement) {
                    qtdElement.style.display = 'block';
                    qtdElement.style.marginRight = '10px';
                }
            });
            
            // Combos em edição - SEM campos de edição
            const itemsEdicao = document.querySelectorAll('#editComboItemsList .combo-item');
            itemsEdicao.forEach(item => {
                // Remover inputs de quantidade
                const inputs = item.querySelectorAll('input[type="number"]');
                inputs.forEach(input => {
                    const qtd = input.value || '1';
                    const span = document.createElement('span');
                    span.className = 'combo-item-quantity-text';
                    span.style.cssText = 'color: #666; font-size: 12px; margin-left: 8px;';
                    span.textContent = `Qtd: ${qtd}`;
                    input.parentNode.replaceChild(span, input);
                });
                
                // Trocar botão por emoji
                const btn = item.querySelector('.btn-delete, button[onclick*="removeEditComboItem"]');
                if (btn && !btn.innerHTML.includes('🗑️')) {
                    btn.innerHTML = '🗑️';
                    btn.style.cssText = 'background: none; border: none; color: #ff4444; cursor: pointer; font-size: 18px; padding: 4px;';
                }
            });
        }
        
        // =============== CORREÇÃO 2: PRESERVAR SELECT AO MUDAR LOTE ===============
        // Override do listener de mudança de lote para preservar o select
        const comboLoteSelect = document.getElementById('comboTicketLote');
        if (comboLoteSelect && !comboLoteSelect.hasAttribute('data-v2-listener')) {
            console.log('🔧 Adicionando listener V2 para comboTicketLote');
            
            // Remover listeners antigos se existirem
            const newSelect = comboLoteSelect.cloneNode(true);
            comboLoteSelect.parentNode.replaceChild(newSelect, comboLoteSelect);
            
            let valorAnterior = newSelect.value;
            
            newSelect.addEventListener('focus', function() {
                valorAnterior = this.value;
            });
            
            newSelect.addEventListener('change', function() {
                const loteId = this.value;
                
                // Verificar se há itens no combo
                const items = document.querySelectorAll('#comboItems .combo-item, #comboItemsList .combo-item');
                if (items.length > 0 && valorAnterior !== '') {
                    // Reverter para valor anterior
                    this.value = valorAnterior;
                    
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Não é possível alterar o lote',
                            'Para alterar o lote, remova primeiro todos os ingressos do combo.'
                        );
                    } else {
                        alert('Para alterar o lote, remova primeiro todos os ingressos do combo.');
                    }
                    
                    // IMPORTANTE: Não chamar populateComboTicketSelectByLote aqui
                    return;
                }
                
                // Se permitido mudar, atualizar valor anterior e popular select
                valorAnterior = this.value;
                
                // Popular select de tipos de ingresso
                if (window.populateComboTicketSelectByLote) {
                    window.populateComboTicketSelectByLote(loteId);
                }
                
                // Aplicar regras de data se existir a função
                if (window.applyLoteDatesOnEdit) {
                    window.applyLoteDatesOnEdit(loteId, 'combo-create');
                }
            });
            
            newSelect.setAttribute('data-v2-listener', 'true');
        }
        
        // =============== CORREÇÃO 3: MONITORAR MUDANÇAS NO DOM ===============
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    setTimeout(trocarBotoesPorEmoji, 100);
                }
            });
        });
        
        // Observar containers
        const containers = ['comboItems', 'comboItemsList', 'editComboItemsList'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
            }
        });
        
        // =============== CORREÇÃO 4: OVERRIDE DO updateComboItemsList ===============
        if (window.updateComboItemsList) {
            const originalUpdate = window.updateComboItemsList;
            window.updateComboItemsList = function() {
                const result = originalUpdate.apply(this, arguments);
                setTimeout(trocarBotoesPorEmoji, 50);
                return result;
            };
        }
        
        // =============== CORREÇÃO 5: CSS ESPECÍFICO ===============
        if (!document.getElementById('combo-visual-fixes-v2')) {
            const style = document.createElement('style');
            style.id = 'combo-visual-fixes-v2';
            style.textContent = `
                /* Garantir visibilidade da quantidade na criação */
                #comboItems .combo-item-quantity,
                #comboItemsList .combo-item-quantity {
                    display: inline-block !important;
                    margin-right: 10px !important;
                    font-weight: bold;
                    color: #333;
                }
                
                /* Esconder SVGs mas não emojis */
                .combo-item .btn-delete svg,
                .combo-item .btn-icon svg {
                    display: none !important;
                }
                
                /* Estilo dos botões emoji */
                .combo-item button[onclick*="remove"] {
                    background: none !important;
                    border: none !important;
                    color: #ff4444 !important;
                    cursor: pointer !important;
                    font-size: 18px !important;
                    padding: 4px !important;
                    line-height: 1 !important;
                    transition: all 0.2s ease;
                }
                
                /* Hover effect */
                .combo-item button[onclick*="remove"]:hover {
                    opacity: 0.7;
                    transform: scale(1.1);
                }
                
                /* Layout do combo item */
                .combo-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                }
                
                /* Esconder inputs na edição, mas não elementos de quantidade */
                #editComboItemsList input[type="number"] {
                    display: none !important;
                }
                
                /* Estilo para quantidade na edição */
                .combo-item-quantity-text {
                    color: #666;
                    font-size: 12px;
                    margin-left: 8px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Aplicar correções imediatamente
        trocarBotoesPorEmoji();
        
        console.log('✅ Correções visuais V2 aplicadas!');
    }
    
    // Aplicar em diferentes momentos
    if (document.readyState === 'complete') {
        aplicarCorrecoesVisuais();
    } else {
        window.addEventListener('load', aplicarCorrecoesVisuais);
    }
    
    // Reaplicar periodicamente
    setTimeout(aplicarCorrecoesVisuais, 1000);
    setTimeout(aplicarCorrecoesVisuais, 2000);
    setTimeout(aplicarCorrecoesVisuais, 3000);
    
    // Aplicar quando modais forem abertos
    const originalOpenModal = window.openModal;
    if (originalOpenModal) {
        window.openModal = function(modalId) {
            const result = originalOpenModal.apply(this, arguments);
            if (modalId === 'comboTicketModal' || modalId === 'editComboModal') {
                setTimeout(aplicarCorrecoesVisuais, 300);
            }
            return result;
        };
    }
    
    console.log('✅ Sistema de correção visual V2 instalado!');
})();