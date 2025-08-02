// CORREÇÃO CONSOLIDADA V2 - Corrige os 3 problemas pendentes
// 1. Select de Lotes SEM Tipo
// 2. Regras de Data Quebradas
// 3. Trava de Lote (já estava OK)
// 4. Melhorias visuais no combo de edição

(function() {
    console.log('🔧 Aplicando correção CONSOLIDADA V2...');
    
    // Função para aplicar todas as correções
    function aplicarCorrecoes() {
        console.log('🚀 Iniciando aplicação das correções...');
        
        // =============== PROBLEMA 1: SELECT SEM TIPO ===============
        // Override mais robusto da função openModal
        const originalOpenModal = window.openModal;
        if (originalOpenModal) {
            window.openModal = function(modalId) {
                console.log('🔓 Abrindo modal V2:', modalId);
                const result = originalOpenModal.apply(this, arguments);
                
                // Garantir que os selects sejam populados
                setTimeout(() => {
                    switch(modalId) {
                        case 'paidTicketModal':
                            popularSelectComTipo('paidTicketLote');
                            limparCamposData('paidSaleStart', 'paidSaleEnd');
                            break;
                        case 'freeTicketModal':
                            popularSelectComTipo('freeTicketLote');
                            break;
                        case 'comboTicketModal':
                            console.log('📦 Modal de combo detectado!');
                            popularSelectComTipo('comboTicketLote');
                            limparCamposData('comboSaleStart', 'comboSaleEnd');
                            // Adicionar listener se não existir
                            adicionarListenerCombo();
                            break;
                        case 'editPaidTicketModal':
                            popularSelectComTipo('editPaidTicketLote');
                            break;
                        case 'editFreeTicketModal':
                            popularSelectComTipo('editFreeTicketLote');
                            break;
                        case 'editComboModal':
                            popularSelectComTipo('editComboLote');
                            // Adicionar listener de edição se não existir
                            adicionarListenerEditCombo();
                            break;
                    }
                }, 200); // Aumentar delay para garantir
                
                return result;
            };
        }
        
        // Função melhorada para popular select com tipo
        function popularSelectComTipo(selectId) {
            console.log('📋 Populando select com tipo:', selectId);
            const select = document.getElementById(selectId);
            if (!select) {
                console.log('❌ Select não encontrado:', selectId);
                return;
            }
            
            // Guardar valor atual
            const valorAtual = select.value;
            
            // Limpar e adicionar opção padrão
            select.innerHTML = '<option value="">Selecione um lote</option>';
            
            // Buscar lotes por data
            const lotesPorData = document.querySelectorAll('#lotesPorDataList .lote-item');
            lotesPorData.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.dataset.id;
                const nomeLote = lote.querySelector('.lote-item-name')?.textContent || 'Lote';
                option.textContent = `${nomeLote.trim()} - Por data`;
                option.setAttribute('data-tipo', 'data');
                select.appendChild(option);
            });
            
            // Buscar lotes por percentual
            const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentualList .lote-item');
            lotesPorPercentual.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.dataset.id;
                const nomeLote = lote.querySelector('.lote-item-name')?.textContent || 'Lote';
                option.textContent = `${nomeLote.trim()} - Por quantidade`;
                option.setAttribute('data-tipo', 'percentual');
                select.appendChild(option);
            });
            
            // Restaurar valor se existia
            if (valorAtual) {
                select.value = valorAtual;
            }
            
            console.log(`✅ Select populado com ${select.options.length - 1} lotes`);
        }
        
        // =============== PROBLEMA 2: REGRAS DE DATA ===============
        // Função para aplicar regras de data
        function aplicarRegrasData(loteId, modalType) {
            console.log('📅 Aplicando regras de data:', loteId, modalType);
            
            const campos = obterCamposData(modalType);
            if (!campos.start || !campos.end) {
                console.log('❌ Campos não encontrados para:', modalType);
                return;
            }
            
            if (!loteId) {
                // Liberar campos
                campos.start.readOnly = false;
                campos.end.readOnly = false;
                campos.start.style.removeProperty('background-color');
                campos.end.style.removeProperty('background-color');
                return;
            }
            
            // Verificar tipo do lote pelo select
            const selectId = obterSelectId(modalType);
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const option = select.querySelector(`option[value="${loteId}"]`);
            if (!option) return;
            
            const tipo = option.getAttribute('data-tipo');
            console.log('Tipo do lote:', tipo);
            
            if (tipo !== 'data') {
                // Liberar campos se não for por data
                campos.start.readOnly = false;
                campos.end.readOnly = false;
                campos.start.style.removeProperty('background-color');
                campos.end.style.removeProperty('background-color');
                return;
            }
            
            // É lote por data - buscar datas
            const loteElement = document.querySelector(`.lote-item[data-id="${loteId}"]`);
            if (!loteElement) return;
            
            const detailsText = loteElement.querySelector('.lote-item-details')?.textContent || '';
            const dateMatch = detailsText.match(/(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}) até (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2})/);
            
            if (dateMatch) {
                const dataInicio = convertDateToInput(dateMatch[1]);
                const dataFim = convertDateToInput(dateMatch[2]);
                
                // Aplicar datas e travar campos
                campos.start.value = dataInicio;
                campos.end.value = dataFim;
                campos.start.readOnly = true;
                campos.end.readOnly = true;
                
                console.log('✅ Datas aplicadas:', dataInicio, dataFim);
            }
        }
        
        // Função auxiliar para converter data
        function convertDateToInput(dateText) {
            const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})/);
            if (match) {
                const [_, dia, mes, ano, hora, minuto] = match;
                return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
            }
            return '';
        }
        
        // Função para obter campos de data
        function obterCamposData(modalType) {
            const campos = {
                'paid-create': { start: 'paidSaleStart', end: 'paidSaleEnd' },
                'free-create': { start: 'freeSaleStart', end: 'freeSaleEnd' },
                'combo-create': { start: 'comboSaleStart', end: 'comboSaleEnd' },
                'paid': { start: 'editPaidSaleStart', end: 'editPaidSaleEnd' },
                'free': { start: 'editFreeSaleStart', end: 'editFreeSaleEnd' },
                'combo': { start: 'editComboSaleStart', end: 'editComboSaleEnd' }
            };
            
            const ids = campos[modalType] || {};
            return {
                start: ids.start ? document.getElementById(ids.start) : null,
                end: ids.end ? document.getElementById(ids.end) : null
            };
        }
        
        // Função para obter ID do select
        function obterSelectId(modalType) {
            const selects = {
                'paid-create': 'paidTicketLote',
                'free-create': 'freeTicketLote', 
                'combo-create': 'comboTicketLote',
                'paid': 'editPaidTicketLote',
                'free': 'editFreeTicketLote',
                'combo': 'editComboLote'
            };
            return selects[modalType] || '';
        }
        
        // Função para limpar campos
        function limparCamposData(startId, endId) {
            const start = document.getElementById(startId);
            const end = document.getElementById(endId);
            if (start) {
                start.readOnly = false;
                start.style.removeProperty('background-color');
            }
            if (end) {
                end.readOnly = false; 
                end.style.removeProperty('background-color');
            }
        }
        
        // =============== ADICIONAR LISTENERS ===============
        
        // Função para adicionar listener no combo criação
        function adicionarListenerCombo() {
            const select = document.getElementById('comboTicketLote');
            if (!select || select.hasAttribute('data-listener-added')) return;
            
            console.log('➕ Adicionando listener para combo criação');
            
            let valorAnterior = select.value;
            
            select.addEventListener('focus', function() {
                valorAnterior = this.value;
            });
            
            select.addEventListener('change', function() {
                // Verificar se há itens no combo
                const items = document.querySelectorAll('#comboItems .combo-item');
                if (items.length > 0 && valorAnterior !== '') {
                    this.value = valorAnterior;
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Não é possível alterar o lote',
                            'Para alterar o lote, remova primeiro todos os ingressos do combo.'
                        );
                    } else {
                        alert('Para alterar o lote, remova primeiro todos os ingressos do combo.');
                    }
                    return;
                }
                
                valorAnterior = this.value;
                aplicarRegrasData(this.value, 'combo-create');
            });
            
            select.setAttribute('data-listener-added', 'true');
        }
        
        // Função para adicionar listener no combo edição
        function adicionarListenerEditCombo() {
            const select = document.getElementById('editComboLote');
            if (!select || select.hasAttribute('data-listener-added')) return;
            
            console.log('➕ Adicionando listener para combo edição');
            
            let valorAnterior = select.value;
            
            select.addEventListener('focus', function() {
                valorAnterior = this.value;
            });
            
            select.addEventListener('change', function() {
                // Verificar se há itens no combo
                const items = document.querySelectorAll('#editComboItemsList .combo-item');
                if (items.length > 0 && valorAnterior !== '') {
                    this.value = valorAnterior;
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Não é possível alterar o lote',
                            'Para alterar o lote, remova primeiro todos os ingressos do combo.'
                        );
                    } else {
                        alert('Para alterar o lote, remova primeiro todos os ingressos do combo.');
                    }
                    return;
                }
                
                valorAnterior = this.value;
                aplicarRegrasData(this.value, 'combo');
            });
            
            select.setAttribute('data-listener-added', 'true');
        }
        
        // Adicionar listeners gerais após delay
        setTimeout(() => {
            // Listeners para ingressos pagos
            const paidSelect = document.getElementById('paidTicketLote');
            if (paidSelect && !paidSelect.hasAttribute('data-listener-added')) {
                paidSelect.addEventListener('change', function() {
                    aplicarRegrasData(this.value, 'paid-create');
                });
                paidSelect.setAttribute('data-listener-added', 'true');
            }
            
            // Listeners para ingressos gratuitos
            const freeSelect = document.getElementById('freeTicketLote');
            if (freeSelect && !freeSelect.hasAttribute('data-listener-added')) {
                freeSelect.addEventListener('change', function() {
                    aplicarRegrasData(this.value, 'free-create');
                });
                freeSelect.setAttribute('data-listener-added', 'true');
            }
            
            // Listeners para edição
            const editPaidSelect = document.getElementById('editPaidTicketLote');
            if (editPaidSelect && !editPaidSelect.hasAttribute('data-listener-added')) {
                editPaidSelect.addEventListener('change', function() {
                    aplicarRegrasData(this.value, 'paid');
                });
                editPaidSelect.setAttribute('data-listener-added', 'true');
            }
            
            const editFreeSelect = document.getElementById('editFreeTicketLote');
            if (editFreeSelect && !editFreeSelect.hasAttribute('data-listener-added')) {
                editFreeSelect.addEventListener('change', function() {
                    aplicarRegrasData(this.value, 'free');
                });
                editFreeSelect.setAttribute('data-listener-added', 'true');
            }
            
        }, 3000);
        
        // =============== MANTER FUNCIONALIDADES QUE JÁ FUNCIONAM ===============
        // Copiar todas as outras funções do consolidated-fix.js original...
        // (validações, proteção de lotes, cálculos, etc)
        
        // Por ora, vamos garantir que as funções essenciais existam
        if (!window.popularSelectLotesComTipo) {
            window.popularSelectLotesComTipo = popularSelectComTipo;
        }
        
        if (!window.applyLoteDatesOnEdit) {
            window.applyLoteDatesOnEdit = aplicarRegrasData;
        }
        
        // =============== MELHORIAS VISUAIS COMBO EDIÇÃO ===============
        
        // Override da função renderEditComboItems para remover edição de quantidade
        if (window.renderEditComboItems) {
            const originalRenderEditComboItems = window.renderEditComboItems;
            window.renderEditComboItems = function() {
                const container = document.getElementById('editComboItemsList');
                if (!container) return;
                
                const editComboItems = window.editComboItems || [];
                
                if (editComboItems.length === 0) {
                    container.innerHTML = `
                        <div class="combo-empty-state">
                            <div style="font-size: 1.2rem; margin-bottom: 5px;">📦</div>
                            <div style="color: #8B95A7; font-size: 11px;">Nenhum ingresso no combo</div>
                        </div>
                    `;
                    return;
                }
                
                // Renderizar itens sem campo de edição de quantidade
                container.innerHTML = editComboItems.map((item, index) => `
                    <div class="combo-item" style="padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="combo-item-info">
                            <strong style="font-size: 12px;">${item.ticket_name || item.nome_ingresso || 'Ingresso'}</strong>
                            <span style="color: #666; font-size: 11px; margin-left: 8px;">Qtd: ${item.quantidade}</span>
                        </div>
                        <button class="btn-icon" onClick="removeEditComboItem(${index})" title="Remover" style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 16px; padding: 4px;">
                            🗑️
                        </button>
                    </div>
                `).join('');
            };
        }
        
        // Override da função addItemToCombo para melhorar visual na criação
        setTimeout(() => {
            // Procurar a função original para fazer override
            if (window.addItemToCombo) {
                const originalAddItemToCombo = window.addItemToCombo;
                window.addItemToCombo = function() {
                    // Chamar função original
                    const result = originalAddItemToCombo.apply(this, arguments);
                    
                    // Melhorar visual dos itens renderizados
                    setTimeout(() => {
                        const items = document.querySelectorAll('#comboItems .combo-item');
                        items.forEach(item => {
                            // Procurar botão de remover e trocar por emoji
                            const removeBtn = item.querySelector('button:last-child');
                            if (removeBtn && !removeBtn.innerHTML.includes('🗑️')) {
                                removeBtn.innerHTML = '🗑️';
                                removeBtn.style.background = 'none';
                                removeBtn.style.border = 'none';
                                removeBtn.style.color = '#ff4444';
                                removeBtn.style.cursor = 'pointer';
                                removeBtn.style.fontSize = '16px';
                                removeBtn.style.padding = '4px';
                            }
                        });
                    }, 100);
                    
                    return result;
                };
            }
            
            // Também melhorar visual dos itens já existentes ao abrir modal
            const observerConfig = { childList: true, subtree: true };
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node => {
                            if (node.classList && node.classList.contains('combo-item')) {
                                const removeBtn = node.querySelector('button:last-child');
                                if (removeBtn && !removeBtn.innerHTML.includes('🗑️')) {
                                    removeBtn.innerHTML = '🗑️';
                                    removeBtn.style.background = 'none';
                                    removeBtn.style.border = 'none';
                                    removeBtn.style.color = '#ff4444';
                                    removeBtn.style.cursor = 'pointer';
                                    removeBtn.style.fontSize = '16px';
                                    removeBtn.style.padding = '4px';
                                }
                            }
                        });
                    }
                });
            });
            
            // Observar mudanças no container de itens do combo
            const comboContainer = document.getElementById('comboItems');
            if (comboContainer) {
                observer.observe(comboContainer, observerConfig);
            }
        }, 3000);
        
        // Garantir que a função de renderização existe globalmente
        if (!window.renderEditComboItems) {
            window.renderEditComboItems = function() {
                const container = document.getElementById('editComboItemsList');
                if (!container) return;
                
                const editComboItems = window.editComboItems || [];
                
                if (editComboItems.length === 0) {
                    container.innerHTML = `
                        <div class="combo-empty-state">
                            <div style="font-size: 1.2rem; margin-bottom: 5px;">📦</div>
                            <div style="color: #8B95A7; font-size: 11px;">Nenhum ingresso no combo</div>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = editComboItems.map((item, index) => `
                    <div class="combo-item" style="padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="combo-item-info">
                            <strong style="font-size: 12px;">${item.ticket_name || item.nome_ingresso || 'Ingresso'}</strong>
                            <span style="color: #666; font-size: 11px; margin-left: 8px;">Qtd: ${item.quantidade}</span>
                        </div>
                        <button class="btn-icon" onClick="removeEditComboItem(${index})" title="Remover" style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 16px; padding: 4px;">
                            🗑️
                        </button>
                    </div>
                `).join('');
            };
        }
        
        console.log('✅ Correção CONSOLIDADA V2 aplicada com sucesso!');
    }
    
    // Tentar aplicar imediatamente
    if (document.readyState === 'complete') {
        aplicarCorrecoes();
    } else {
        // Se não, aguardar DOM
        window.addEventListener('load', aplicarCorrecoes);
    }
    
    // Aplicar novamente após delay para garantir
    setTimeout(aplicarCorrecoes, 3000);
    setTimeout(aplicarCorrecoes, 5000);
    
})();