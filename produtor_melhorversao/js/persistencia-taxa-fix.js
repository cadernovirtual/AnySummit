// Correções para persistência de ingressos e taxa de serviço
console.log('🔧 Aplicando correções de persistência e taxa de serviço...');

// 1. BUSCAR TAXA DE SERVIÇO PADRÃO
window.taxaServicoPadrao = 8.00; // Valor padrão

async function buscarTaxaServicoPadrao() {
    try {
        const response = await fetch('/produtor/ajax/buscar_taxa_servico.php');
        const data = await response.json();
        
        if (data.success) {
            window.taxaServicoPadrao = data.taxa_servico;
            console.log('✅ Taxa de serviço padrão:', window.taxaServicoPadrao + '%');
            
            // Atualizar cálculos existentes
            atualizarCalculosComTaxa();
        }
    } catch (error) {
        console.error('❌ Erro ao buscar taxa de serviço:', error);
        window.taxaServicoPadrao = 8.00;
    }
}

// 2. ATUALIZAR CÁLCULOS COM A TAXA CORRETA
function atualizarCalculosComTaxa() {
    // Atualizar função de cálculo de valores
    if (window.calcularValoresIngresso) {
        const originalCalc = window.calcularValoresIngresso;
        window.calcularValoresIngresso = function() {
            // Usar a taxa padrão ao invés de valor fixo
            const taxaDecimal = window.taxaServicoPadrao / 100;
            
            const priceInput = document.getElementById('paidTicketPrice');
            const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
            
            if (priceInput) {
                const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
                const valorIngresso = parseFloat(valorLimpo) || 0;
                
                let taxaPlataforma = 0;
                let valorComprador = valorIngresso;
                let valorReceber = valorIngresso;
                
                if (taxaCheckbox && taxaCheckbox.checked) {
                    taxaPlataforma = valorIngresso * taxaDecimal;
                    valorComprador = valorIngresso + taxaPlataforma;
                    valorReceber = valorIngresso;
                }
                
                // Atualizar displays
                const taxaDisplay = document.getElementById('paidTicketTaxaPlataforma');
                if (taxaDisplay) {
                    taxaDisplay.textContent = `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`;
                }
                
                const compradorDisplay = document.getElementById('paidTicketValorComprador');
                if (compradorDisplay) {
                    compradorDisplay.textContent = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
                }
                
                const receberDisplay = document.getElementById('paidTicketValorReceber');
                if (receberDisplay) {
                    receberDisplay.textContent = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
                }
            }
        };
    }
}

// 3. GARANTIR SALVAMENTO COMPLETO DOS INGRESSOS
(function() {
    // Override da função nextStep para salvar antes de mudar
    const originalNextStep = window.nextStep;
    if (originalNextStep) {
        window.nextStep = function() {
            console.log('📝 Salvando dados antes de avançar...');
            
            // Salvar tudo
            if (window.saveWizardData) {
                window.saveWizardData();
            }
            
            // Salvar ingressos especificamente
            const ticketItems = document.querySelectorAll('.ticket-item');
            const ingressos = [];
            
            ticketItems.forEach(item => {
                if (item.ticketData) {
                    ingressos.push(item.ticketData);
                }
            });
            
            if (ingressos.length > 0) {
                setCookie('ingressosTemporarios', JSON.stringify(ingressos), 7);
                console.log('✅ Ingressos salvos:', ingressos.length);
            }
            
            // Chamar função original
            return originalNextStep.apply(this, arguments);
        };
    }
})();

// 4. RESTAURAR INGRESSOS AO VOLTAR
function restaurarIngressosTemporarios() {
    const savedIngressos = getCookie('ingressosTemporarios');
    if (savedIngressos) {
        try {
            const ingressos = JSON.parse(savedIngressos);
            console.log('📋 Restaurando ingressos temporários:', ingressos.length);
            
            const ticketList = document.getElementById('ticketList');
            if (ticketList && ticketList.children.length === 0) {
                // Só restaurar se a lista estiver vazia
                ingressos.forEach(ingresso => {
                    recriarIngresso(ingresso);
                });
            }
        } catch (error) {
            console.error('Erro ao restaurar ingressos:', error);
        }
    }
}

// 5. FUNÇÃO PARA RECRIAR INGRESSO
function recriarIngresso(ingresso) {
    const ticketId = ingresso.id || 'ticket_' + Date.now() + '_' + Math.random();
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketId;
    ticketItem.dataset.ticketType = ingresso.type || ingresso.tipo;
    ticketItem.dataset.loteId = ingresso.loteId;
    
    // Salvar ticketData completo
    ticketItem.ticketData = ingresso;
    
    // Buscar nome do lote
    let loteNome = 'Lote não definido';
    const loteItem = document.querySelector(`.lote-item[data-id="${ingresso.loteId}"]`);
    if (loteItem) {
        loteNome = loteItem.querySelector('.lote-item-name')?.textContent || loteNome;
    }
    
    // Criar HTML baseado no tipo
    if (ingresso.type === 'combo' || ingresso.tipo === 'combo') {
        const totalIngressos = ingresso.items ? ingresso.items.length : 0;
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-name" style="color: #00C2FF;">${ingresso.title || ingresso.titulo}</div>
                    <div class="ticket-details">
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Combo com ${totalIngressos} ingressos</span>
                        </span>
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Quantidade:</span>
                            <span class="ticket-detail-value">${ingresso.quantity || ingresso.quantidade}</span>
                        </span>
                    </div>
                </div>
                <div class="ticket-pricing">
                    <div class="ticket-price-item">
                        <span class="ticket-price-label">Valor do combo:</span>
                        <span class="ticket-buyer-price">R$ ${(ingresso.price || ingresso.preco || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    } else if (ingresso.type === 'free' || ingresso.tipo === 'gratuito') {
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-name">${ingresso.title || ingresso.titulo}</div>
                    <div class="ticket-details">
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Quantidade:</span>
                            <span class="ticket-detail-value">${ingresso.quantity || ingresso.quantidade}</span>
                        </span>
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Lote:</span>
                            <span class="ticket-detail-value">${loteNome}</span>
                        </span>
                    </div>
                </div>
                <div class="ticket-pricing">
                    <div class="ticket-price-item">
                        <span class="ticket-price-label">Valor:</span>
                        <span class="ticket-buyer-price">Gratuito</span>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    } else {
        // Ingresso pago
        const valorComprador = ingresso.taxaServico ? (ingresso.price || ingresso.preco) + (ingresso.taxaPlataforma || 0) : (ingresso.price || ingresso.preco);
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-name">${ingresso.title || ingresso.titulo}</div>
                    <div class="ticket-details">
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Quantidade:</span>
                            <span class="ticket-detail-value">${ingresso.quantity || ingresso.quantidade}</span>
                        </span>
                        <span class="ticket-detail-item">
                            <span class="ticket-detail-label">Lote:</span>
                            <span class="ticket-detail-value">${loteNome}</span>
                        </span>
                    </div>
                </div>
                <div class="ticket-pricing">
                    <div class="ticket-price-item">
                        <span class="ticket-price-label">Valor para o comprador:</span>
                        <span class="ticket-buyer-price">R$ ${valorComprador.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="ticket-price-item">
                        <span class="ticket-price-label">Você recebe:</span>
                        <span class="ticket-receive-amount">R$ ${(ingresso.valorReceber || ingresso.price || ingresso.preco || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    }
    
    document.getElementById('ticketList').appendChild(ticketItem);
}

// 6. CORRIGIR ÍCONE DE REMOVER NO COMBO
(function() {
    // Override da função addEditComboItem
    const originalAddEditComboItem = window.addEditComboItem;
    if (originalAddEditComboItem) {
        window.addEditComboItem = function(ticketId, quantity = 1) {
            console.log('➕ Adicionando item ao combo de edição:', ticketId, quantity);
            
            const itemsList = document.getElementById('editComboItemsList');
            if (!itemsList) {
                console.error('Lista de itens do combo não encontrada');
                return;
            }
            
            const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
            if (!ticketElement || !ticketElement.ticketData) {
                console.error('Ticket não encontrado:', ticketId);
                return;
            }
            
            const ticketData = ticketElement.ticketData;
            const itemId = 'edit_combo_item_' + Date.now();
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'combo-item';
            itemDiv.id = itemId;
            itemDiv.dataset.ticketId = ticketId;
            itemDiv.dataset.price = ticketData.price || 0;
            
            // Usar ícone 🗑️ ao invés de botão "Remover"
            itemDiv.innerHTML = `
                <div class="combo-item-info">
                    <span class="combo-item-name">${ticketData.title}</span>
                    <div class="combo-item-controls">
                        <label>Qtd:</label>
                        <input type="number" 
                               class="combo-item-quantity" 
                               value="${quantity}" 
                               min="1" 
                               onchange="updateEditComboTotal()">
                        <button class="btn-icon delete" onclick="removeEditComboItem('${itemId}')" title="Remover">🗑️</button>
                    </div>
                </div>
            `;
            
            itemsList.appendChild(itemDiv);
            
            if (window.updateEditComboTotal) {
                window.updateEditComboTotal();
            }
        };
    }
})();

// 7. FUNÇÃO DE INICIALIZAÇÃO
function initPersistenciaETaxa() {
    // Buscar taxa de serviço
    buscarTaxaServicoPadrao();
    
    // Restaurar ingressos se estiver no step correto
    const currentStep = window.currentStep || window.wizardState?.currentStep;
    if (currentStep === 6) {
        setTimeout(() => {
            restaurarIngressosTemporarios();
        }, 500);
    }
}

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', initPersistenciaETaxa);

// Funções auxiliares se não existirem
if (typeof getCookie !== 'function') {
    window.getCookie = function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };
}

if (typeof setCookie !== 'function') {
    window.setCookie = function(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };
}

console.log('✅ Correções de persistência e taxa aplicadas!');
