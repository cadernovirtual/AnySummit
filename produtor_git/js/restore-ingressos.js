// =====================================================
// RESTAURAÇÃO DAS FUNÇÕES DE INGRESSOS - ANYSUMMIT
// =====================================================
// Este arquivo restaura as funções completas de criação de ingressos
// que estavam funcionando corretamente

console.log('🎟️ Restaurando sistema de ingressos...');

// Variáveis globais necessárias
window.lotesCarregados = window.lotesCarregados || [];
window.taxaServicoPadrao = 8; // Valor padrão
window.loteAtualPercentual = null;

// FUNÇÕES AUXILIARES DE FORMATAÇÃO E CÁLCULO
window.formatarMoeda = function(valor) {
    // Garantir que o valor seja um número
    valor = parseFloat(valor) || 0;
    
    // Formatar com 2 casas decimais
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

window.parsearValorMonetario = function(valor) {
    if (!valor) return 0;
    // Remove tudo exceto números, vírgula e ponto
    valor = valor.replace(/[^\d,.-]/g, '');
    // Substitui vírgula por ponto
    valor = valor.replace(',', '.');
    return parseFloat(valor) || 0;
};

// FUNÇÃO PARA CALCULAR VALORES DO INGRESSO
window.calcularValoresIngresso = function() {
    console.log('💵 Calculando valores do ingresso...');
    
    const precoInput = document.getElementById('paidTicketPrice');
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    const taxaValorInput = document.getElementById('paidTicketTaxaValor');
    const valorCompradorInput = document.getElementById('paidTicketValorComprador');
    const valorReceberInput = document.getElementById('paidTicketValorReceber');
    
    if (!precoInput || !taxaCheckbox || !taxaValorInput || !valorCompradorInput || !valorReceberInput) {
        console.error('Elementos de cálculo não encontrados');
        return;
    }
    
    // Obter valor numérico do campo já formatado
    const precoVenda = parsearValorMonetario(precoInput.value);
    const cobrarTaxa = taxaCheckbox.checked;
    
    let taxaValor = 0;
    let valorComprador = 0;
    let valorReceber = 0;
    
    if (precoVenda > 0) {
        if (cobrarTaxa) {
            // Taxa cobrada do cliente
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorComprador = precoVenda + taxaValor;
            valorReceber = precoVenda;
        } else {
            // Taxa absorvida pelo produtor
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorReceber = precoVenda - taxaValor;
            valorComprador = precoVenda;
        }
    }
    
    // Atualizar campos com formatação
    taxaValorInput.value = formatarMoeda(taxaValor);
    valorCompradorInput.value = formatarMoeda(valorComprador);
    valorReceberInput.value = formatarMoeda(valorReceber);
    
    console.log('💰 Valores calculados:', {
        precoVenda,
        cobrarTaxa,
        taxaValor,
        valorComprador,
        valorReceber
    });
};

// 1. FUNÇÃO PARA CARREGAR LOTES NO MODAL DE INGRESSO PAGO
window.carregarLotesIngressoPago = function() {
    console.log('📋 Carregando lotes para ingresso pago...');
    
    const selectLote = document.getElementById('paidTicketLote');
    if (!selectLote) {
        console.error('Select de lotes não encontrado');
        return;
    }
    
    // Limpar opções existentes
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Buscar lotes do DOM
    const loteCards = document.querySelectorAll('.lote-card');
    let lotesEncontrados = 0;
    
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index}`;
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        const tipoDado = card.classList.contains('por-data') ? 'data' : 'percentual';
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = `${loteNome} (${tipoDado})`;
        selectLote.appendChild(option);
        lotesEncontrados++;
    });
    
    // Se não encontrou lotes no DOM, tentar do window.lotesData
    if (lotesEncontrados === 0 && window.lotesData) {
        // Lotes por data
        if (window.lotesData.porData) {
            window.lotesData.porData.forEach((lote, index) => {
                const option = document.createElement('option');
                option.value = lote.id || `lote_data_${index}`;
                option.textContent = `${lote.nome || 'Lote ' + (index + 1)} (data)`;
                selectLote.appendChild(option);
            });
        }
        
        // Lotes por percentual
        if (window.lotesData.porPercentual) {
            window.lotesData.porPercentual.forEach((lote, index) => {
                const option = document.createElement('option');
                option.value = lote.id || `lote_percentual_${index}`;
                option.textContent = `${lote.nome || 'Lote ' + (index + 1)} (${lote.percentual}%)`;
                selectLote.appendChild(option);
            });
        }
    }
    
    console.log(`✅ ${selectLote.options.length - 1} lotes carregados`);
};

// Alias para compatibilidade
window.carregarLotesNoModal = window.carregarLotesIngressoPago;

// 2. FUNÇÃO PARA CARREGAR LOTES NO MODAL DE INGRESSO GRATUITO
window.carregarLotesNoModalFree = function() {
    console.log('📋 Carregando lotes para ingresso gratuito...');
    
    const selectLote = document.getElementById('freeTicketLote');
    if (!selectLote) {
        console.error('Select de lotes (gratuito) não encontrado');
        return;
    }
    
    // Limpar opções existentes
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Buscar lotes do DOM
    const loteCards = document.querySelectorAll('.lote-card');
    
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index}`;
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        const tipoDado = card.classList.contains('por-data') ? 'data' : 'percentual';
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = `${loteNome} (${tipoDado})`;
        selectLote.appendChild(option);
    });
    
    console.log(`✅ ${selectLote.options.length - 1} lotes carregados (gratuito)`);
};

// 3. FUNÇÃO PARA CARREGAR LOTES NO MODAL DE COMBO
window.carregarLotesNoModalCombo = function() {
    console.log('📋 Carregando lotes para combo...');
    
    const selectLote = document.getElementById('comboTicketLote');
    if (!selectLote) {
        console.error('Select de lotes (combo) não encontrado');
        return;
    }
    
    // Limpar opções existentes
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Buscar lotes do DOM
    const loteCards = document.querySelectorAll('.lote-card');
    
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index}`;
        const loteNome = card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`;
        const tipoDado = card.classList.contains('por-data') ? 'data' : 'percentual';
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = `${loteNome} (${tipoDado})`;
        selectLote.appendChild(option);
    });
    
    console.log(`✅ ${selectLote.options.length - 1} lotes carregados (combo)`);
};

// 4. RESTAURAR FUNÇÃO createPaidTicket COMPLETA
window.createPaidTicket = function() {
    console.log('💰 Criando ingresso pago...');
    
    // Limpar erros anteriores
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    const title = document.getElementById('paidTicketTitle')?.value;
    const quantity = document.getElementById('paidTicketQuantity')?.value;
    const price = document.getElementById('paidTicketPrice')?.value;
    const description = document.getElementById('paidTicketDescription')?.value || '';
    const saleStart = document.getElementById('paidSaleStart')?.value;
    const saleEnd = document.getElementById('paidSaleEnd')?.value;
    const minQuantity = document.getElementById('paidMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('paidMaxQuantity')?.value || 5;
    const loteId = document.getElementById('paidTicketLote')?.value;
    
    // Obter valores calculados
    const cobrarTaxa = document.getElementById('paidTicketTaxaServico')?.checked ? 1 : 0;
    const taxaValor = document.getElementById('paidTicketTaxaValor')?.value || 'R$ 0,00';
    const valorReceber = document.getElementById('paidTicketValorReceber')?.value || 'R$ 0,00';

    // Validação com destaque de campos
    let hasError = false;
    
    if (!title) {
        document.getElementById('paidTicketTitle').classList.add('error-field');
        hasError = true;
    }
    if (!quantity) {
        document.getElementById('paidTicketQuantity').classList.add('error-field');
        hasError = true;
    }
    if (!price || price === 'R$ 0,00') {
        document.getElementById('paidTicketPrice').classList.add('error-field');
        hasError = true;
    }
    if (!loteId) {
        document.getElementById('paidTicketLote').classList.add('error-field');
        hasError = true;
    }
    
    if (hasError) {
        alert('Por favor, preencha todos os campos obrigatórios marcados em vermelho.');
        return;
    }

    // Limpar valores monetários
    const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
    const cleanTaxa = parseFloat(taxaValor.replace(/[R$\s\.]/g, '').replace(',', '.'));
    const cleanValorReceber = parseFloat(valorReceber.replace(/[R$\s\.]/g, '').replace(',', '.'));
    
    // Criar elemento do ingresso
    const ticketId = `ticket_${Date.now()}`;
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketId;
    ticketItem.dataset.ticketType = 'paid';
    ticketItem.dataset.loteId = loteId;
    
    // Salvar dados completos
    ticketItem.ticketData = {
        id: ticketId,
        tipo: 'pago',
        type: 'paid',
        titulo: title,
        title: title,
        quantidade: parseInt(quantity),
        quantity: parseInt(quantity),
        preco: cleanPrice,
        price: cleanPrice,
        descricao: description,
        description: description,
        loteId: loteId,
        saleStart: saleStart,
        saleEnd: saleEnd,
        minQuantity: parseInt(minQuantity),
        maxQuantity: parseInt(maxQuantity),
        taxaServico: cobrarTaxa === 1,
        taxaPlataforma: cleanTaxa,
        valorReceber: cleanValorReceber,
        valorComprador: cobrarTaxa ? cleanPrice + cleanTaxa : cleanPrice
    };
    
    // HTML do ingresso
    const valorComprador = cobrarTaxa ? cleanPrice + cleanTaxa : cleanPrice;
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-info">
                <div class="ticket-name">${title}</div>
                <div class="ticket-details">
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Quantidade:</span>
                        <span class="ticket-detail-value">${quantity}</span>
                    </span>
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Lote:</span>
                        <span class="ticket-detail-value">${loteId ? 'Definido' : 'Não definido'}</span>
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
                    <span class="ticket-receive-amount">R$ ${cleanValorReceber.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
            </div>
        </div>
    `;
    
    // Adicionar à lista
    const ticketList = document.getElementById('ticketList');
    if (ticketList) {
        ticketList.appendChild(ticketItem);
    }
    
    // Fechar modal
    if (window.closeModal) {
        window.closeModal('paidTicketModal');
    }
    
    // Limpar campos
    document.getElementById('paidTicketTitle').value = '';
    document.getElementById('paidTicketQuantity').value = '';
    document.getElementById('paidTicketPrice').value = '';
    document.getElementById('paidTicketDescription').value = '';
    document.getElementById('paidSaleStart').value = '';
    document.getElementById('paidSaleEnd').value = '';
    document.getElementById('paidMinQuantity').value = '1';
    document.getElementById('paidMaxQuantity').value = '5';
    document.getElementById('paidTicketLote').value = '';
    document.getElementById('paidTicketTaxaServico').checked = true;
    
    // Salvar dados do wizard
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
    
    console.log('✅ Ingresso pago criado com sucesso');
};

// 5. RESTAURAR FUNÇÃO createFreeTicket
window.createFreeTicket = function() {
    console.log('🆓 Criando ingresso gratuito...');
    
    const title = document.getElementById('freeTicketTitle')?.value;
    const quantity = document.getElementById('freeTicketQuantity')?.value;
    const description = document.getElementById('freeTicketDescription')?.value || '';
    const saleStart = document.getElementById('freeSaleStart')?.value;
    const saleEnd = document.getElementById('freeSaleEnd')?.value;
    const minQuantity = document.getElementById('freeMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('freeMaxQuantity')?.value || 5;
    const loteId = document.getElementById('freeTicketLote')?.value;

    if (!title || !quantity || !loteId) {
        alert('Por favor, preencha o título, quantidade e selecione um lote.');
        return;
    }

    // Criar elemento do ingresso
    const ticketId = `ticket_${Date.now()}`;
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketId;
    ticketItem.dataset.ticketType = 'free';
    ticketItem.dataset.loteId = loteId;
    
    // Salvar dados completos
    ticketItem.ticketData = {
        id: ticketId,
        tipo: 'gratuito',
        type: 'free',
        titulo: title,
        title: title,
        quantidade: parseInt(quantity),
        quantity: parseInt(quantity),
        preco: 0,
        price: 0,
        descricao: description,
        description: description,
        loteId: loteId,
        saleStart: saleStart,
        saleEnd: saleEnd,
        minQuantity: parseInt(minQuantity),
        maxQuantity: parseInt(maxQuantity),
        taxaServico: false,
        taxaPlataforma: 0,
        valorReceber: 0
    };
    
    // HTML do ingresso
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-info">
                <div class="ticket-name">${title}</div>
                <div class="ticket-details">
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Quantidade:</span>
                        <span class="ticket-detail-value">${quantity}</span>
                    </span>
                    <span class="ticket-detail-item">
                        <span class="ticket-detail-label">Lote:</span>
                        <span class="ticket-detail-value">${loteId ? 'Definido' : 'Não definido'}</span>
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
    
    // Adicionar à lista
    const ticketList = document.getElementById('ticketList');
    if (ticketList) {
        ticketList.appendChild(ticketItem);
    }
    
    // Fechar modal
    if (window.closeModal) {
        window.closeModal('freeTicketModal');
    }
    
    // Limpar campos
    document.getElementById('freeTicketTitle').value = '';
    document.getElementById('freeTicketQuantity').value = '';
    document.getElementById('freeTicketDescription').value = '';
    document.getElementById('freeSaleStart').value = '';
    document.getElementById('freeSaleEnd').value = '';
    document.getElementById('freeMinQuantity').value = '1';
    document.getElementById('freeMaxQuantity').value = '5';
    document.getElementById('freeTicketLote').value = '';
    
    // Salvar dados do wizard
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
    
    console.log('✅ Ingresso gratuito criado com sucesso');
};

// 6. FUNÇÃO PARA REMOVER INGRESSO
window.removeTicket = function(ticketId) {
    console.log('🗑️ Removendo ingresso:', ticketId);
    
    const ticketItem = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (ticketItem) {
        if (confirm('Tem certeza que deseja excluir este ingresso?')) {
            ticketItem.remove();
            
            // Salvar alterações
            if (window.AnySummit && window.AnySummit.Storage) {
                window.AnySummit.Storage.saveWizardData();
            }
            
            console.log('✅ Ingresso removido');
        }
    }
};

// 7. FUNÇÃO PARA EDITAR INGRESSO (placeholder)
window.editTicket = function(ticketId) {
    console.log('✏️ Editando ingresso:', ticketId);
    alert('Função de edição será implementada em breve.');
};

// 8. INICIALIZAR QUANDO DOM CARREGAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎟️ Inicializando sistema de ingressos...');
    
    // Adicionar listeners aos botões
    const addPaidBtn = document.getElementById('addPaidTicket');
    const addFreeBtn = document.getElementById('addFreeTicket');
    const addComboBtn = document.getElementById('addComboTicket');

    if (addPaidBtn) {
        addPaidBtn.addEventListener('click', function() {
            console.log('Abrindo modal de ingresso pago...');
            if (window.openModal) {
                window.openModal('paidTicketModal');
            }
            // Carregar lotes após abrir o modal
            setTimeout(function() {
                window.carregarLotesIngressoPago();
                // Calcular valores do ingresso
                if (window.calcularValoresIngresso) {
                    window.calcularValoresIngresso();
                }
            }, 300);
        });
    }

    if (addFreeBtn) {
        addFreeBtn.addEventListener('click', function() {
            console.log('Abrindo modal de ingresso gratuito...');
            if (window.openModal) {
                window.openModal('freeTicketModal');
            }
            // Carregar lotes após abrir o modal
            setTimeout(function() {
                window.carregarLotesNoModalFree();
            }, 300);
        });
    }

    if (addComboBtn) {
        addComboBtn.addEventListener('click', function() {
            console.log('Abrindo modal de combo...');
            if (window.openModal) {
                window.openModal('comboTicketModal');
            }
            // Carregar lotes após abrir o modal
            setTimeout(function() {
                window.carregarLotesNoModalCombo();
            }, 300);
        });
    }
    
    // ADICIONAR LISTENERS PARA CÁLCULO DE VALORES
    const precoInput = document.getElementById('paidTicketPrice');
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    
    if (precoInput) {
        precoInput.addEventListener('input', function() {
            window.calcularValoresIngresso();
        });
        precoInput.addEventListener('change', function() {
            window.calcularValoresIngresso();
        });
    }
    
    if (taxaCheckbox) {
        taxaCheckbox.addEventListener('change', function() {
            window.calcularValoresIngresso();
        });
    }
    
    console.log('✅ Sistema de ingressos inicializado');
});

console.log('✅ Funções de ingressos restauradas com sucesso!');