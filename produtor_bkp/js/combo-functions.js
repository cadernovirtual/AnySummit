// Funções adicionais para combos com suporte a lotes

// Função auxiliar para formatar moeda
function formatarMoeda(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// Função auxiliar para formatar data e hora
function formatarDataHora(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// Função para carregar lotes no modal de combo
function carregarLotesNoModalCombo() {
    console.log('Carregando lotes no modal de combo...');
    const selectLote = document.getElementById('comboTicketLote');
    if (!selectLote) return;

    selectLote.innerHTML = '<option value="">Selecione um lote</option>';

    // Tenta acessar lotesData diretamente (variável global do lotes.js)
    if (typeof lotesData !== 'undefined' && lotesData) {
        console.log('lotesData encontrado:', lotesData);
        
        const todosLotes = [];
        
        // Adicionar lotes por data
        if (lotesData.porData && Array.isArray(lotesData.porData)) {
            lotesData.porData.forEach(lote => {
                todosLotes.push({
                    ...lote,
                    tipo: 'data'
                });
            });
        }
        
        // Adicionar lotes por percentual
        if (lotesData.porPercentual && Array.isArray(lotesData.porPercentual)) {
            lotesData.porPercentual.forEach(lote => {
                todosLotes.push({
                    ...lote,
                    tipo: 'percentual'
                });
            });
        }
        
        console.log(`Total de lotes encontrados: ${todosLotes.length}`);
        
        // Adicionar lotes ao select com formatação completa
        todosLotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.id;
            
            // Criar descrição detalhada do lote
            let descricao = `${lote.nome} - `;
            
            if (lote.tipo === 'data') {
                const dataInicio = formatarDataHora(lote.dataInicio);
                const dataFim = formatarDataHora(lote.dataFim);
                descricao += `Por Data (${dataInicio} até ${dataFim})`;
            } else if (lote.tipo === 'percentual') {
                descricao += `Por Vendas (${lote.percentual}% dos ingressos vendidos)`;
            }
            
            option.textContent = descricao;
            option.dataset.tipoLote = lote.tipo;
            option.dataset.dataInicio = lote.dataInicio || '';
            option.dataset.dataFim = lote.dataFim || '';
            option.dataset.percentual = lote.percentual || '';
            option.dataset.nomeSimples = lote.nome;
            selectLote.appendChild(option);
        });
        
        console.log(`${todosLotes.length} lotes adicionados ao dropdown de combo`);
        
        // Se já houver um lote selecionado, atualizar o select de tipos
        if (selectLote.value) {
            console.log('Lote já selecionado, atualizando tipos de ingresso...');
            updateComboTicketDates();
        }
    }
}

// Função para atualizar datas quando lote é selecionado
function updateComboTicketDates() {
    console.log('=== updateComboTicketDates chamada ===');
    const selectLote = document.getElementById('comboTicketLote');
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    const startInput = document.getElementById('comboSaleStart');
    const endInput = document.getElementById('comboSaleEnd');
    const periodTitle = document.getElementById('comboTicketPeriodTitle');
    
    // Verificar se há itens no combo antes de trocar o lote
    if (window.comboItems && window.comboItems.length > 0 && selectedOption && selectedOption.value) {
        const confirmacao = confirm('Ao trocar o lote, todos os tipos de ingresso já adicionados ao combo serão removidos. Deseja continuar?');
        if (!confirmacao) {
            // Restaurar o valor anterior do select
            if (window.ultimoLoteSelecionado) {
                selectLote.value = window.ultimoLoteSelecionado;
            } else {
                selectLote.value = '';
            }
            return;
        }
        // Limpar itens do combo
        window.comboItems = [];
        updateComboItemsList();
    }
    
    // Salvar o lote selecionado
    window.ultimoLoteSelecionado = selectedOption ? selectedOption.value : '';
    
    if (!selectedOption || !selectedOption.value) {
        startInput.value = '';
        endInput.value = '';
        if (periodTitle) periodTitle.textContent = 'Período das vendas';
        
        // Limpar select de tipos de ingresso
        populateComboTicketSelectByLote('');
        return;
    }
    
    const tipoLote = selectedOption.dataset.tipoLote;
    
    if (tipoLote === 'data') {
        // Lote por data - campos readonly
        const dataInicio = selectedOption.dataset.dataInicio;
        const dataFim = selectedOption.dataset.dataFim;
        
        startInput.value = dataInicio || '';
        endInput.value = dataFim || '';
        startInput.readOnly = true;
        endInput.readOnly = true;
        
        if (periodTitle) periodTitle.textContent = 'Período das vendas (definido pelo lote)';
    } else if (tipoLote === 'percentual') {
        // Lote por percentual - campos editáveis
        const percentual = selectedOption.dataset.percentual;
        
        // Para lote percentual, as datas são editáveis
        startInput.value = '';
        endInput.value = '';
        startInput.readOnly = false;
        endInput.readOnly = false;
        
        if (periodTitle) periodTitle.textContent = `Lote ${percentual}% - Período flexível`;
    }
    
    // Carregar tipos de ingresso do lote selecionado
    console.log('Chamando populateComboTicketSelectByLote com loteId:', selectedOption.value);
    // Adicionar pequeno delay para garantir que o DOM esteja atualizado
    setTimeout(() => {
        populateComboTicketSelectByLote(selectedOption.value);
    }, 100);
}

// Função para popular select de tipos de ingresso baseado no lote
function populateComboTicketSelectByLote(loteId) {
    console.log('=== populateComboTicketSelectByLote chamada ===');
    console.log('LoteId recebido:', loteId);
    
    const select = document.getElementById('comboTicketTypeSelect');
    if (!select) {
        console.error('Select comboTicketTypeSelect não encontrado!');
        return;
    }
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    if (!loteId) {
        select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        return;
    }
    
    // Buscar tipos de ingresso do lote específico
    const ticketItems = document.querySelectorAll('.ticket-item');
    console.log('Total de ticket-items encontrados:', ticketItems.length);
    
    if (ticketItems.length === 0) {
        select.innerHTML = '<option value="">Nenhum tipo de ingresso disponível</option>';
        return;
    }
    
    let hasTickets = false;
    let ticketCount = 0;
    
    ticketItems.forEach((item) => {
        const ticketLote = item.dataset.loteId;
        const ticketName = item.querySelector('.ticket-name')?.textContent?.trim();
        const buyerPrice = item.querySelector('.ticket-buyer-price')?.textContent;
        const isCombo = item.querySelector('.ticket-type-badge.combo');
        
        // Verificar se é do mesmo lote e não é combo (comparação como string)
        if (String(ticketLote) === String(loteId) && ticketName && !isCombo) {
            hasTickets = true;
            const option = document.createElement('option');
            option.value = item.dataset.ticketId || ticketCount;
            option.textContent = ticketName;
            option.dataset.ticketData = JSON.stringify({
                name: ticketName,
                price: buyerPrice,
                ticketId: item.dataset.ticketId || `ticket_${Date.now()}_${ticketCount}`,
                loteId: ticketLote,
                index: item.dataset.ticketId || `ticket_${Date.now()}_${ticketCount}`
            });
            select.appendChild(option);
        }
        ticketCount++;
    });
    
    if (!hasTickets) {
        select.innerHTML = '<option value="">Nenhum ingresso deste lote. Crie tipos de ingresso primeiro.</option>';
    }
}

// Função para calcular quantidade do lote (para lotes percentuais)
function calcularQuantidadeLoteCombo() {
    const quantidadeInput = document.getElementById('comboTicketQuantity');
    const quantidadeLoteInput = document.getElementById('comboTicketQuantidadeLote');
    const selectLote = document.getElementById('comboTicketLote');
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    
    if (!selectedOption || !selectedOption.value || selectedOption.dataset.tipoLote !== 'percentual') {
        return;
    }
    
    const quantidade = parseInt(quantidadeInput.value) || 0;
    const percentual = parseInt(selectedOption.dataset.percentual) || 0;
    
    // Calcular quantidade total baseada no percentual
    if (quantidade > 0 && percentual > 0) {
        const quantidadeTotal = Math.ceil((quantidade * 100) / percentual);
        if (quantidadeLoteInput) {
            quantidadeLoteInput.value = `${quantidadeTotal} combos`;
        }
    } else {
        if (quantidadeLoteInput) {
            quantidadeLoteInput.value = '0 combos';
        }
    }
}

// Função para calcular valores do combo
function calcularValoresCombo() {
    const precoInput = document.getElementById('comboTicketPrice');
    const taxaServicoCheckbox = document.getElementById('comboTicketTaxaServico');
    const taxaValorInput = document.getElementById('comboTicketTaxaValor');
    const valorCompradorInput = document.getElementById('comboTicketValorComprador');
    const valorReceberInput = document.getElementById('comboTicketReceive');
    
    if (!precoInput || !taxaServicoCheckbox) return;
    
    // Remover máscara para cálculo
    const preco = parseFloat(precoInput.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    const cobrarTaxa = taxaServicoCheckbox.checked;
    const percentualTaxa = 8; // 8% de taxa
    
    let valorTaxa = 0;
    let valorComprador = preco;
    let valorReceber = preco;
    
    if (cobrarTaxa && preco > 0) {
        valorTaxa = preco * (percentualTaxa / 100);
        valorComprador = preco + valorTaxa;
        // Valor a receber é o preço sem a taxa (produtor recebe o valor base)
        valorReceber = preco;
    }
    
    // Aplicar máscara e atualizar campos
    if (taxaValorInput) taxaValorInput.value = formatarMoeda(valorTaxa);
    if (valorCompradorInput) valorCompradorInput.value = formatarMoeda(valorComprador);
    if (valorReceberInput) valorReceberInput.value = formatarMoeda(valorReceber);
}

// Funções similares para o modal de edição
function carregarLotesNoModalEditCombo() {
    console.log('Carregando lotes no modal de edição de combo...');
    const selectLote = document.getElementById('editComboLote');
    if (!selectLote) return;

    selectLote.innerHTML = '<option value="">Selecione um lote</option>';

    // Tenta acessar lotesData diretamente (variável global do lotes.js)
    if (typeof lotesData !== 'undefined' && lotesData) {
        console.log('lotesData encontrado:', lotesData);
        
        const todosLotes = [];
        
        // Adicionar lotes por data
        if (lotesData.porData && Array.isArray(lotesData.porData)) {
            lotesData.porData.forEach(lote => {
                todosLotes.push({
                    ...lote,
                    tipo: 'data'
                });
            });
        }
        
        // Adicionar lotes por percentual
        if (lotesData.porPercentual && Array.isArray(lotesData.porPercentual)) {
            lotesData.porPercentual.forEach(lote => {
                todosLotes.push({
                    ...lote,
                    tipo: 'percentual'
                });
            });
        }
        
        // Adicionar lotes ao select com formatação completa
        todosLotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.id;
            
            // Criar descrição detalhada do lote
            let descricao = `${lote.nome} - `;
            
            if (lote.tipo === 'data') {
                const dataInicio = formatarDataHora(lote.dataInicio);
                const dataFim = formatarDataHora(lote.dataFim);
                descricao += `Por Data (${dataInicio} até ${dataFim})`;
            } else if (lote.tipo === 'percentual') {
                descricao += `Por Vendas (${lote.percentual}% dos ingressos vendidos)`;
            }
            
            option.textContent = descricao;
            option.dataset.tipoLote = lote.tipo;
            option.dataset.dataInicio = lote.dataInicio || '';
            option.dataset.dataFim = lote.dataFim || '';
            option.dataset.percentual = lote.percentual || '';
            option.dataset.nomeSimples = lote.nome;
            selectLote.appendChild(option);
        });
    }
}

// Função para atualizar datas quando lote é selecionado (edição)
function updateEditComboTicketDates() {
    const selectLote = document.getElementById('editComboLote');
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    const startInput = document.getElementById('editComboSaleStart');
    const endInput = document.getElementById('editComboSaleEnd');
    const periodTitle = document.getElementById('editComboTicketPeriodTitle');
    const quantidadeContainer = document.getElementById('quantidadeLoteEditComboContainer');
    
    if (!selectedOption || !selectedOption.value) {
        startInput.value = '';
        endInput.value = '';
        if (periodTitle) periodTitle.textContent = 'Período das vendas';
        if (quantidadeContainer) quantidadeContainer.style.display = 'none';
        
        // Limpar select de tipos de ingresso
        populateEditComboTicketSelectByLote('');
        return;
    }
    
    const tipoLote = selectedOption.dataset.tipoLote;
    
    if (tipoLote === 'data') {
        // Lote por data - campos readonly
        const dataInicio = selectedOption.dataset.dataInicio;
        const dataFim = selectedOption.dataset.dataFim;
        
        startInput.value = dataInicio || '';
        endInput.value = dataFim || '';
        startInput.readOnly = true;
        endInput.readOnly = true;
        
        if (periodTitle) periodTitle.textContent = 'Período das vendas (definido pelo lote)';
        if (quantidadeContainer) quantidadeContainer.style.display = 'none';
    } else if (tipoLote === 'percentual') {
        // Lote por percentual - campos editáveis
        const percentual = selectedOption.dataset.percentual;
        
        // Para lote percentual, as datas são editáveis
        startInput.value = '';
        endInput.value = '';
        startInput.readOnly = false;
        endInput.readOnly = false;
        
        if (periodTitle) periodTitle.textContent = `Lote ${percentual}% - Período flexível`;
        if (quantidadeContainer) quantidadeContainer.style.display = 'block';
        
        calcularQuantidadeLoteEditCombo();
    }
    
    // Carregar tipos de ingresso do lote selecionado
    populateEditComboTicketSelectByLote(selectedOption.value);
}

// Função para popular select de tipos de ingresso baseado no lote (edição)
function populateEditComboTicketSelectByLote(loteId) {
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select) return;
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    if (!loteId) {
        select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        return;
    }
    
    // Buscar tipos de ingresso do lote específico
    const ticketItems = document.querySelectorAll('.ticket-item');
    console.log('Total de ticket-items encontrados:', ticketItems.length);
    
    if (ticketItems.length === 0) {
        select.innerHTML = '<option value="">Nenhum tipo de ingresso disponível</option>';
        return;
    }
    
    let hasTickets = false;
    let ticketCount = 0;
    
    ticketItems.forEach((item) => {
        const ticketLote = item.dataset.loteId;
        const ticketName = item.querySelector('.ticket-name')?.textContent?.trim();
        const buyerPrice = item.querySelector('.ticket-buyer-price')?.textContent;
        const isCombo = item.querySelector('.ticket-type-badge.combo');
        
        // Verificar se é do mesmo lote e não é combo (comparação como string)
        if (String(ticketLote) === String(loteId) && ticketName && !isCombo) {
            hasTickets = true;
            const option = document.createElement('option');
            option.value = item.dataset.ticketId || ticketCount;
            option.textContent = ticketName;
            option.dataset.ticketData = JSON.stringify({
                name: ticketName,
                price: buyerPrice,
                ticketId: item.dataset.ticketId || `ticket_${Date.now()}_${ticketCount}`,
                loteId: ticketLote,
                index: item.dataset.ticketId || `ticket_${Date.now()}_${ticketCount}`
            });
            select.appendChild(option);
        }
        ticketCount++;
    });
    
    if (!hasTickets) {
        select.innerHTML = '<option value="">Nenhum ingresso deste lote. Crie tipos de ingresso primeiro.</option>';
    }
}

// Função para calcular quantidade do lote (edição)
function calcularQuantidadeLoteEditCombo() {
    const quantidadeInput = document.getElementById('editComboQuantity');
    const quantidadeLoteInput = document.getElementById('editComboQuantidadeLote');
    const selectLote = document.getElementById('editComboLote');
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    
    if (!selectedOption || !selectedOption.value || selectedOption.dataset.tipoLote !== 'percentual') {
        return;
    }
    
    const quantidade = parseInt(quantidadeInput.value) || 0;
    const percentual = parseInt(selectedOption.dataset.percentual) || 0;
    
    // Calcular quantidade total baseada no percentual
    if (quantidade > 0 && percentual > 0) {
        const quantidadeTotal = Math.ceil((quantidade * 100) / percentual);
        if (quantidadeLoteInput) {
            quantidadeLoteInput.value = `${quantidadeTotal} combos`;
        }
    } else {
        if (quantidadeLoteInput) {
            quantidadeLoteInput.value = '0 combos';
        }
    }
}

// Função para calcular valores do combo (edição)
function calcularValoresEditCombo() {
    const precoInput = document.getElementById('editComboPrice');
    const taxaServicoCheckbox = document.getElementById('editComboTaxaServico');
    const taxaValorInput = document.getElementById('editComboTaxaValor');
    const valorCompradorInput = document.getElementById('editComboValorComprador');
    const valorReceberInput = document.getElementById('editComboReceive');
    
    if (!precoInput || !taxaServicoCheckbox) return;
    
    // Remover máscara para cálculo
    const preco = parseFloat(precoInput.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    const cobrarTaxa = taxaServicoCheckbox.checked;
    const percentualTaxa = 8; // 8% de taxa
    
    let valorTaxa = 0;
    let valorComprador = preco;
    let valorReceber = preco;
    
    if (cobrarTaxa && preco > 0) {
        valorTaxa = preco * (percentualTaxa / 100);
        valorComprador = preco + valorTaxa;
        // Valor a receber é o preço sem a taxa (produtor recebe o valor base)
        valorReceber = preco;
    }
    
    // Aplicar máscara e atualizar campos
    if (taxaValorInput) taxaValorInput.value = formatarMoeda(valorTaxa);
    if (valorCompradorInput) valorCompradorInput.value = formatarMoeda(valorComprador);
    if (valorReceberInput) valorReceberInput.value = formatarMoeda(valorReceber);
}

// Tornar funções globais
window.carregarLotesNoModalCombo = carregarLotesNoModalCombo;
window.updateComboTicketDates = updateComboTicketDates;
window.populateComboTicketSelectByLote = populateComboTicketSelectByLote;
window.calcularQuantidadeLoteCombo = calcularQuantidadeLoteCombo;
window.calcularValoresCombo = calcularValoresCombo;
window.carregarLotesNoModalEditCombo = carregarLotesNoModalEditCombo;
window.updateEditComboTicketDates = updateEditComboTicketDates;
window.populateEditComboTicketSelectByLote = populateEditComboTicketSelectByLote;
window.calcularQuantidadeLoteEditCombo = calcularQuantidadeLoteEditCombo;
window.calcularValoresEditCombo = calcularValoresEditCombo;
// Adicionar ao final do arquivo combo-functions.js

// Função para atualizar o select de tipos de ingresso quando um novo ingresso é criado
function atualizarSelectComboAposNovoIngresso() {
    const selectLote = document.getElementById('comboTicketLote');
    if (selectLote && selectLote.value) {
        // Re-popular o select com o lote atual
        populateComboTicketSelectByLote(selectLote.value);
    }
}

// Adicionar observer para detectar mudanças na lista de ingressos
function observarMudancasIngressos() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;
    
    // Criar um MutationObserver para detectar quando novos ingressos são adicionados
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Novo ingresso foi adicionado
                console.log('Novo ingresso detectado, atualizando selects de combo...');
                
                // Atualizar select do modal de criação
                const selectLoteCreate = document.getElementById('comboTicketLote');
                if (selectLoteCreate && selectLoteCreate.value) {
                    populateComboTicketSelectByLote(selectLoteCreate.value);
                }
                
                // Atualizar select do modal de edição
                const selectLoteEdit = document.getElementById('editComboLote');
                if (selectLoteEdit && selectLoteEdit.value) {
                    populateEditComboTicketSelectByLote(selectLoteEdit.value);
                }
            }
        });
    });
    
    // Configurar o observer
    observer.observe(ticketList, {
        childList: true,
        subtree: false
    });
}

// Inicializar o observer quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observarMudancasIngressos);
} else {
    observarMudancasIngressos();
}

// Tornar funções globais
window.atualizarSelectComboAposNovoIngresso = atualizarSelectComboAposNovoIngresso;
window.observarMudancasIngressos = observarMudancasIngressos;
// Adicionar event listeners específicos para os botões de fechar do modal de combo
document.addEventListener('DOMContentLoaded', function() {
    // Botão X do modal de combo
    const comboCloseBtn = document.querySelector('#comboTicketModal .modal-close');
    if (comboCloseBtn) {
        comboCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Fechando modal de combo via X');
            const modal = document.getElementById('comboTicketModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
            }
        });
    }
    
    // Botão Cancelar do modal de combo
    const comboCancelBtn = document.querySelector('#comboTicketModal .btn-secondary');
    if (comboCancelBtn) {
        comboCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Fechando modal de combo via Cancelar');
            const modal = document.getElementById('comboTicketModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
            }
        });
    }
});

// Garantir que a função closeModal esteja disponível globalmente
window.closeModal = function(modalId) {
    console.log('closeModal chamada para:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
};
// Adicionar listener para o select de lote do combo
document.addEventListener('DOMContentLoaded', function() {
    // Listener para mudança de lote no modal de criação
    const comboLoteSelect = document.getElementById('comboTicketLote');
    if (comboLoteSelect) {
        comboLoteSelect.addEventListener('change', function() {
            console.log('Mudança de lote detectada via addEventListener:', this.value);
            updateComboTicketDates();
        });
    }
    
    // Listener para mudança de lote no modal de edição
    const editComboLoteSelect = document.getElementById('editComboLote');
    if (editComboLoteSelect) {
        editComboLoteSelect.addEventListener('change', function() {
            console.log('Mudança de lote detectada no modal de edição:', this.value);
            updateEditComboTicketDates();
        });
    }
});

// Adicionar também um listener que funcione mesmo se o elemento for criado depois
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'comboTicketLote') {
        console.log('Mudança de lote detectada via delegação de evento:', e.target.value);
        // Pequeno delay para garantir que o DOM esteja atualizado
        setTimeout(() => {
            updateComboTicketDates();
        }, 50);
    }
});
// Função para popular select de tipos de ingresso baseado no lote - VERSÃO COM DEBUG COMPLETO
function populateComboTicketSelectByLoteDebug(loteId) {
    console.log('=== populateComboTicketSelectByLote DEBUG COMPLETO ===');
    console.log('1. LoteId recebido:', loteId, 'Tipo:', typeof loteId);
    
    const select = document.getElementById('comboTicketTypeSelect');
    console.log('2. Select encontrado:', !!select);
    if (!select) {
        console.error('❌ Select comboTicketTypeSelect não encontrado!');
        return;
    }
    
    console.log('3. Conteúdo inicial do select:', select.innerHTML);
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    console.log('4. Select limpo');
    
    if (!loteId) {
        select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
        console.log('5. Sem loteId - saindo');
        return;
    }
    
    // Buscar tipos de ingresso do lote específico
    const ticketItems = document.querySelectorAll('.ticket-item');
    console.log('6. Total de ticket-items encontrados:', ticketItems.length);
    
    if (ticketItems.length === 0) {
        select.innerHTML = '<option value="">Nenhum tipo de ingresso disponível</option>';
        console.log('7. Nenhum ticket-item encontrado - saindo');
        return;
    }
    
    let hasTickets = false;
    let ticketCount = 0;
    
    console.log('8. Iniciando análise dos tickets...');
    
    ticketItems.forEach((item, index) => {
        const ticketLote = item.dataset.loteId;
        const ticketName = item.querySelector('.ticket-name')?.textContent?.trim();
        const buyerPrice = item.querySelector('.ticket-buyer-price')?.textContent;
        const isCombo = item.querySelector('.ticket-type-badge.combo');
        
        console.log(`   Ticket ${index + 1}:`, {
            nome: ticketName,
            loteDoTicket: ticketLote,
            tipoLoteTicket: typeof ticketLote,
            loteEsperado: loteId,
            tipoLoteEsperado: typeof loteId,
            éCombo: !!isCombo,
            temNome: !!ticketName,
            comparaçãoString: String(ticketLote) === String(loteId),
            comparaçãoNumber: Number(ticketLote) === Number(loteId)
        });
        
        // Testar diferentes formas de comparação
        const matches = String(ticketLote) === String(loteId);
        console.log(`   >>> Match: ${matches}`);
        
        if (matches && ticketName && !isCombo) {
            hasTickets = true;
            const option = document.createElement('option');
            option.value = item.dataset.ticketId || ticketCount;
            option.textContent = ticketName;
            option.dataset.ticketData = JSON.stringify({
                name: ticketName,
                price: buyerPrice,
                ticketId: item.dataset.ticketId || `ticket_${Date.now()}_${ticketCount}`,
                loteId: ticketLote,
                index: item.dataset.ticketId || `ticket_${Date.now()}_${ticketCount}`
            });
            
            console.log('   ✅ Criando option:', option);
            select.appendChild(option);
            console.log('   ✅ Option adicionada. Select agora tem', select.options.length, 'opções');
        }
        ticketCount++;
    });
    
    console.log('9. Análise completa. hasTickets:', hasTickets);
    console.log('10. Total de opções no select:', select.options.length);
    console.log('11. HTML final do select:', select.innerHTML);
    
    if (!hasTickets) {
        console.log('12. Nenhum ticket do lote encontrado - adicionando mensagem');
        select.innerHTML = '<option value="">Nenhum ingresso deste lote. Crie tipos de ingresso primeiro.</option>';
    }
    
    console.log('13. Função concluída. Select final:', select);
}

// Substituir a função original temporariamente
window.populateComboTicketSelectByLote = populateComboTicketSelectByLoteDebug;
// Função para inspecionar a estrutura dos ticket-items
function inspecionarTicketItems() {
    console.log('=== INSPEÇÃO DE TICKET-ITEMS ===');
    const ticketItems = document.querySelectorAll('.ticket-item');
    
    if (ticketItems.length === 0) {
        console.log('Nenhum ticket-item encontrado');
        return;
    }
    
    ticketItems.forEach((item, index) => {
        console.log(`\nTicket-Item ${index + 1}:`);
        console.log('  - Classes:', item.className);
        console.log('  - Dataset:', item.dataset);
        console.log('  - ID do ticket:', item.dataset.ticketId);
        console.log('  - ID do lote:', item.dataset.loteId);
        
        const ticketName = item.querySelector('.ticket-name');
        console.log('  - Elemento .ticket-name:', !!ticketName);
        if (ticketName) {
            console.log('    - Texto:', ticketName.textContent);
            console.log('    - HTML:', ticketName.innerHTML);
        }
        
        const ticketBadges = item.querySelectorAll('.ticket-type-badge');
        console.log('  - Badges encontrados:', ticketBadges.length);
        ticketBadges.forEach(badge => {
            console.log('    - Badge classes:', badge.className);
            console.log('    - Badge text:', badge.textContent);
        });
        
        console.log('  - HTML completo do item:');
        console.log(item.outerHTML);
    });
}

// Tornar função global para poder chamar do console
window.inspecionarTicketItems = inspecionarTicketItems;

// Chamar automaticamente após 2 segundos para debug
setTimeout(() => {
    console.log('Executando inspeção automática dos ticket-items...');
    inspecionarTicketItems();
}, 2000);
// Função para atualizar a lista de itens do combo com ícone correto
function updateComboItemsListFixed() {
    const container = document.getElementById('comboItemsList');
    if (!container) return;
    
    if (comboItems.length === 0) {
        container.innerHTML = `
            <div class="combo-empty-state">
                <div style="font-size: 2rem; margin-bottom: 10px;">+</div>
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

// Substituir a função original
window.updateComboItemsList = updateComboItemsListFixed;
