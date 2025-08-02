// CORREÇÕES DEFINITIVAS - TAXA E PERSISTÊNCIA
console.log('🔧 INICIANDO CORREÇÕES DEFINITIVAS...');

// 1. VARIÁVEL GLOBAL PARA TAXA
window.TAXA_SERVICO_PADRAO = 8.00;

// 2. BUSCAR TAXA DO BANCO
async function buscarTaxaServico() {
    try {
        const response = await fetch('/produtor/ajax/buscar_taxa_servico.php');
        const data = await response.json();
        
        if (data.success) {
            window.TAXA_SERVICO_PADRAO = parseFloat(data.taxa_servico) || 8.00;
            console.log('✅ Taxa carregada do banco:', window.TAXA_SERVICO_PADRAO + '%');
            
            // Atualizar todos os displays de percentual
            const percentualElements = ['taxaPercentual', 'editTaxaPercentual', 'comboTaxaPercentual', 'editComboTaxaPercentual'];
            percentualElements.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = window.TAXA_SERVICO_PADRAO;
            });
        }
    } catch (error) {
        console.error('Erro ao buscar taxa:', error);
    }
}

// 3. FUNÇÕES DE CÁLCULO CORRIGIDAS
window.calcularValoresIngresso = function() {
    const priceInput = document.getElementById('paidTicketPrice');
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    
    if (!priceInput) return;
    
    const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
    const valorIngresso = parseFloat(valorLimpo) || 0;
    const taxaDecimal = window.TAXA_SERVICO_PADRAO / 100;
    
    let taxaValor = 0;
    let valorComprador = valorIngresso;
    let valorReceber = valorIngresso;
    
    if (taxaCheckbox && taxaCheckbox.checked) {
        taxaValor = valorIngresso * taxaDecimal;
        valorComprador = valorIngresso + taxaValor;
        valorReceber = valorIngresso;
    }
    
    // ATUALIZAR OS INPUTS (não textContent)
    const taxaInput = document.getElementById('paidTicketTaxaValor');
    if (taxaInput) taxaInput.value = `R$ ${taxaValor.toFixed(2).replace('.', ',')}`;
    
    const compradorInput = document.getElementById('paidTicketValorComprador');
    if (compradorInput) compradorInput.value = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    
    const receberInput = document.getElementById('paidTicketValorReceber');
    if (receberInput) receberInput.value = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
};

window.calcularValoresIngressoEdit = function() {
    const priceInput = document.getElementById('editPaidTicketPrice');
    const taxaCheckbox = document.getElementById('editPaidTicketTaxaServico');
    
    if (!priceInput) return;
    
    const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
    const valorIngresso = parseFloat(valorLimpo) || 0;
    const taxaDecimal = window.TAXA_SERVICO_PADRAO / 100;
    
    let taxaValor = 0;
    let valorComprador = valorIngresso;
    let valorReceber = valorIngresso;
    
    if (taxaCheckbox && taxaCheckbox.checked) {
        taxaValor = valorIngresso * taxaDecimal;
        valorComprador = valorIngresso + taxaValor;
        valorReceber = valorIngresso;
    }
    
    // ATUALIZAR OS INPUTS
    const taxaInput = document.getElementById('editPaidTicketTaxaValor');
    if (taxaInput) taxaInput.value = `R$ ${taxaValor.toFixed(2).replace('.', ',')}`;
    
    const compradorInput = document.getElementById('editPaidTicketValorComprador');
    if (compradorInput) compradorInput.value = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    
    const receberInput = document.getElementById('editPaidTicketValorReceber');
    if (receberInput) receberInput.value = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
};

window.calcularValoresCombo = function() {
    const priceInput = document.getElementById('comboTicketPrice');
    const taxaCheckbox = document.getElementById('comboTicketTaxaServico');
    
    if (!priceInput) return;
    
    const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
    const valorCombo = parseFloat(valorLimpo) || 0;
    const taxaDecimal = window.TAXA_SERVICO_PADRAO / 100;
    
    let taxaValor = 0;
    let valorComprador = valorCombo;
    let valorReceber = valorCombo;
    
    if (taxaCheckbox && taxaCheckbox.checked) {
        taxaValor = valorCombo * taxaDecimal;
        valorComprador = valorCombo + taxaValor;
        valorReceber = valorCombo;
    }
    
    // ATUALIZAR OS ELEMENTOS CORRETOS
    const taxaEl = document.getElementById('comboTicketTaxaPlataforma');
    if (taxaEl) taxaEl.textContent = `R$ ${taxaValor.toFixed(2).replace('.', ',')}`;
    
    const compradorEl = document.getElementById('comboTicketValorComprador');
    if (compradorEl) compradorEl.textContent = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    
    const receberEl = document.getElementById('comboTicketValorReceber');
    if (receberEl) receberEl.textContent = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
};

window.calcularValoresEditCombo = function() {
    const priceInput = document.getElementById('editComboPrice');
    const taxaCheckbox = document.getElementById('editComboTaxaServico');
    
    if (!priceInput) return;
    
    const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
    const valorCombo = parseFloat(valorLimpo) || 0;
    const taxaDecimal = window.TAXA_SERVICO_PADRAO / 100;
    
    let taxaValor = 0;
    let valorComprador = valorCombo;
    let valorReceber = valorCombo;
    
    if (taxaCheckbox && taxaCheckbox.checked) {
        taxaValor = valorCombo * taxaDecimal;
        valorComprador = valorCombo + taxaValor;
        valorReceber = valorCombo;
    }
    
    const taxaEl = document.getElementById('editComboTaxaPlataforma');
    if (taxaEl) taxaEl.textContent = `R$ ${taxaValor.toFixed(2).replace('.', ',')}`;
    
    const compradorEl = document.getElementById('editComboValorComprador');
    if (compradorEl) compradorEl.textContent = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    
    const receberEl = document.getElementById('editComboValorReceber');
    if (receberEl) receberEl.textContent = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
};

// 4. PERSISTÊNCIA DEFINITIVA DOS INGRESSOS
(function() {
    // Override do saveWizardData para garantir que salva ingressos
    const checkInterval = setInterval(() => {
        if (window.saveWizardData) {
            clearInterval(checkInterval);
            
            const originalSave = window.saveWizardData;
            window.saveWizardData = function() {
                console.log('💾 Salvando dados com ingressos...');
                
                // Chamar original
                originalSave();
                
                // Garantir que ingressos sejam salvos
                const ticketItems = document.querySelectorAll('.ticket-item');
                if (ticketItems.length > 0) {
                    const ingressos = [];
                    
                    ticketItems.forEach(item => {
                        if (item.ticketData) {
                            // Garantir que todos os dados estão salvos
                            const data = {
                                ...item.ticketData,
                                id: item.dataset.ticketId,
                                tipo: item.dataset.ticketType,
                                loteId: item.dataset.loteId
                            };
                            ingressos.push(data);
                        }
                    });
                    
                    // Salvar em cookie separado também
                    setCookie('ingressosSalvos', JSON.stringify(ingressos), 7);
                    console.log('✅ Ingressos salvos:', ingressos.length);
                    
                    // Atualizar o wizardData no cookie principal
                    const wizardData = getCookie('eventoWizard');
                    if (wizardData) {
                        try {
                            const data = JSON.parse(wizardData);
                            data.ingressosSalvos = ingressos;
                            setCookie('eventoWizard', JSON.stringify(data), 7);
                        } catch (e) {
                            console.error('Erro ao atualizar wizardData:', e);
                        }
                    }
                }
            };
        }
    }, 100);
    
    // Garantir restauração ao voltar para step 6
    const checkRestore = setInterval(() => {
        const currentStep = window.currentStep || window.wizardState?.currentStep;
        if (currentStep === 6) {
            clearInterval(checkRestore);
            
            // Tentar restaurar de várias fontes
            setTimeout(() => {
                const ticketList = document.getElementById('ticketList');
                if (ticketList && ticketList.children.length === 0) {
                    console.log('🔄 Tentando restaurar ingressos...');
                    
                    // Tentar do cookie específico primeiro
                    const savedIngressos = getCookie('ingressosSalvos');
                    if (savedIngressos) {
                        try {
                            const ingressos = JSON.parse(savedIngressos);
                            console.log('📋 Restaurando do cookie específico:', ingressos.length);
                            restaurarIngressos(ingressos);
                            return;
                        } catch (e) {
                            console.error('Erro ao parsear ingressos:', e);
                        }
                    }
                    
                    // Tentar do wizardData
                    const wizardData = getCookie('eventoWizard');
                    if (wizardData) {
                        try {
                            const data = JSON.parse(wizardData);
                            if (data.ingressosSalvos && data.ingressosSalvos.length > 0) {
                                console.log('📋 Restaurando do wizardData:', data.ingressosSalvos.length);
                                restaurarIngressos(data.ingressosSalvos);
                            } else if (data.tickets && data.tickets.length > 0) {
                                console.log('📋 Restaurando do tickets:', data.tickets.length);
                                restaurarIngressos(data.tickets);
                            }
                        } catch (e) {
                            console.error('Erro ao parsear wizardData:', e);
                        }
                    }
                }
            }, 500);
        }
    }, 500);
})();

// 5. FUNÇÃO PARA RESTAURAR INGRESSOS
function restaurarIngressos(ingressos) {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList || !ingressos || ingressos.length === 0) return;
    
    ingressos.forEach((ingresso, index) => {
        const ticketId = ingresso.id || `ticket_restored_${Date.now()}_${index}`;
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.dataset.ticketId = ticketId;
        ticketItem.dataset.ticketType = ingresso.tipo || ingresso.type;
        ticketItem.dataset.loteId = ingresso.loteId;
        
        // Restaurar todos os datasets
        if (ingresso.description) ticketItem.dataset.description = ingresso.description;
        if (ingresso.minQuantity) ticketItem.dataset.minQuantity = ingresso.minQuantity;
        if (ingresso.maxQuantity) ticketItem.dataset.maxQuantity = ingresso.maxQuantity;
        if (ingresso.saleStart) ticketItem.dataset.saleStart = ingresso.saleStart;
        if (ingresso.saleEnd) ticketItem.dataset.saleEnd = ingresso.saleEnd;
        if (ingresso.taxaServico !== undefined) ticketItem.dataset.taxaServico = ingresso.taxaServico ? '1' : '0';
        
        // Salvar ticketData completo
        ticketItem.ticketData = ingresso;
        
        // Nome do lote
        let loteNome = 'Lote não definido';
        const loteItem = document.querySelector(`.lote-item[data-id="${ingresso.loteId}"]`);
        if (loteItem) {
            loteNome = loteItem.querySelector('.lote-item-name')?.textContent || loteNome;
        }
        
        // Criar HTML baseado no tipo
        if (ingresso.tipo === 'combo' || ingresso.type === 'combo') {
            const totalIngressos = (ingresso.items || ingresso.comboItems || []).length;
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name" style="color: #00C2FF;">${ingresso.titulo || ingresso.title}</div>
                        <div class="ticket-details">
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Combo com ${totalIngressos} ingressos</span>
                            </span>
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Quantidade:</span>
                                <span class="ticket-detail-value">${ingresso.quantidade || ingresso.quantity}</span>
                            </span>
                        </div>
                    </div>
                    <div class="ticket-pricing">
                        <div class="ticket-price-item">
                            <span class="ticket-price-label">Valor do combo:</span>
                            <span class="ticket-buyer-price">R$ ${(parseFloat(ingresso.preco) || parseFloat(ingresso.price) || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                        <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        } else if (ingresso.tipo === 'gratuito' || ingresso.tipo === 'free' || ingresso.type === 'free') {
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${ingresso.titulo || ingresso.title}</div>
                        <div class="ticket-details">
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Quantidade:</span>
                                <span class="ticket-detail-value">${ingresso.quantidade || ingresso.quantity}</span>
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
            const preco = parseFloat(ingresso.preco) || parseFloat(ingresso.price) || 0;
            const taxaDecimal = window.TAXA_SERVICO_PADRAO / 100;
            const taxaValor = ingresso.taxaServico ? preco * taxaDecimal : 0;
            const valorComprador = preco + taxaValor;
            const valorReceber = preco;
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${ingresso.titulo || ingresso.title}</div>
                        <div class="ticket-details">
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Quantidade:</span>
                                <span class="ticket-detail-value">${ingresso.quantidade || ingresso.quantity}</span>
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
                            <span class="ticket-receive-amount">R$ ${valorReceber.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                        <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        }
        
        ticketList.appendChild(ticketItem);
    });
    
    console.log('✅ Ingressos restaurados:', ingressos.length);
}

// 6. FUNÇÕES AUXILIARES
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

// 7. INICIALIZAR
document.addEventListener('DOMContentLoaded', function() {
    // Buscar taxa
    buscarTaxaServico();
    
    // Configurar eventos
    const priceInputs = [
        { id: 'paidTicketPrice', func: calcularValoresIngresso },
        { id: 'editPaidTicketPrice', func: calcularValoresIngressoEdit },
        { id: 'comboTicketPrice', func: calcularValoresCombo },
        { id: 'editComboPrice', func: calcularValoresEditCombo }
    ];
    
    priceInputs.forEach(({ id, func }) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', func);
            // Calcular ao abrir modal
            const observer = new MutationObserver(() => {
                if (input.offsetParent !== null) {
                    func();
                }
            });
            observer.observe(input.closest('.modal-overlay') || input, { attributes: true });
        }
    });
    
    // Checkboxes
    const checkboxes = [
        { id: 'paidTicketTaxaServico', func: calcularValoresIngresso },
        { id: 'editPaidTicketTaxaServico', func: calcularValoresIngressoEdit },
        { id: 'comboTicketTaxaServico', func: calcularValoresCombo },
        { id: 'editComboTaxaServico', func: calcularValoresEditCombo }
    ];
    
    checkboxes.forEach(({ id, func }) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', func);
        }
    });
});

console.log('✅ CORREÇÕES DEFINITIVAS APLICADAS!');
