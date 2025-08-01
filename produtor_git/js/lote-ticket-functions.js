// Funções para popular selects de lotes nos modais
console.log('📋 Carregando funções de lotes para ingressos...');

// Função para obter lotes salvos
function getLotesSalvos() {
    // Tentar obter de várias fontes
    let lotes = [];
    
    // 1. Verificar window.lotesData
    if (window.lotesData) {
        if (window.lotesData.porData) {
            window.lotesData.porData.forEach(lote => {
                lotes.push({
                    id: lote.id || `lote_data_${Date.now()}_${Math.random()}`,
                    nome: lote.nome,
                    tipo: 'data'
                });
            });
        }
        if (window.lotesData.porPercentual) {
            window.lotesData.porPercentual.forEach(lote => {
                lotes.push({
                    id: lote.id || `lote_perc_${Date.now()}_${Math.random()}`,
                    nome: lote.nome,
                    tipo: 'percentual'
                });
            });
        }
    }
    
    // 2. Verificar cookie
    if (lotes.length === 0) {
        const lotesDataCookie = getCookie('lotesData');
        if (lotesDataCookie) {
            try {
                const parsed = JSON.parse(lotesDataCookie);
                if (parsed.porData) {
                    parsed.porData.forEach(lote => {
                        lotes.push({
                            id: lote.id || `lote_data_${Date.now()}_${Math.random()}`,
                            nome: lote.nome,
                            tipo: 'data'
                        });
                    });
                }
                if (parsed.porPercentual) {
                    parsed.porPercentual.forEach(lote => {
                        lotes.push({
                            id: lote.id || `lote_perc_${Date.now()}_${Math.random()}`,
                            nome: lote.nome,
                            tipo: 'percentual'
                        });
                    });
                }
            } catch (e) {
                console.error('Erro ao parsear lotes do cookie:', e);
            }
        }
    }
    
    return lotes;
}

// Função auxiliar para obter cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

// Popular select de lote para ingresso pago
window.populatePaidTicketLote = function() {
    console.log('📝 Populando lotes para ingresso pago...');
    const select = document.getElementById('paidTicketLote');
    if (!select) return;
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Obter lotes
    const lotes = getLotesSalvos();
    
    if (lotes.length === 0) {
        select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
        return;
    }
    
    // Adicionar lotes ao select
    lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        option.textContent = lote.nome;
        select.appendChild(option);
    });
    
    console.log(`✅ ${lotes.length} lotes adicionados ao select`);
};

// Popular select de lote para ingresso gratuito
window.populateFreeTicketLote = function() {
    console.log('📝 Populando lotes para ingresso gratuito...');
    const select = document.getElementById('freeTicketLote');
    if (!select) return;
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Obter lotes
    const lotes = getLotesSalvos();
    
    if (lotes.length === 0) {
        select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
        return;
    }
    
    // Adicionar lotes ao select
    lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        option.textContent = lote.nome;
        select.appendChild(option);
    });
    
    console.log(`✅ ${lotes.length} lotes adicionados ao select`);
};

// Popular select de lote para combo
window.populateComboTicketLote = function() {
    console.log('📝 Populando lotes para combo...');
    const select = document.getElementById('comboTicketLote');
    if (!select) return;
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Obter lotes
    const lotes = getLotesSalvos();
    
    if (lotes.length === 0) {
        select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
        return;
    }
    
    // Adicionar lotes ao select
    lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        option.textContent = lote.nome;
        select.appendChild(option);
    });
    
    console.log(`✅ ${lotes.length} lotes adicionados ao select`);
};

// Atualizar datas baseado no lote selecionado
window.updatePaidTicketDates = function() {
    const loteId = document.getElementById('paidTicketLote')?.value;
    if (!loteId) return;
    
    console.log('📅 Atualizando datas para lote:', loteId);
    
    // Por enquanto, definir datas padrão
    const hoje = new Date();
    const fim = new Date();
    fim.setDate(fim.getDate() + 30);
    
    const startInput = document.getElementById('paidSaleStart');
    const endInput = document.getElementById('paidSaleEnd');
    
    if (startInput) {
        startInput.value = hoje.toISOString().slice(0, 16);
    }
    if (endInput) {
        endInput.value = fim.toISOString().slice(0, 16);
    }
};

window.updateFreeTicketDates = function() {
    const loteId = document.getElementById('freeTicketLote')?.value;
    if (!loteId) return;
    
    console.log('📅 Atualizando datas para lote:', loteId);
    
    // Por enquanto, definir datas padrão
    const hoje = new Date();
    const fim = new Date();
    fim.setDate(fim.getDate() + 30);
    
    const startInput = document.getElementById('freeSaleStart');
    const endInput = document.getElementById('freeSaleEnd');
    
    if (startInput) {
        startInput.value = hoje.toISOString().slice(0, 16);
    }
    if (endInput) {
        endInput.value = fim.toISOString().slice(0, 16);
    }
};

window.updateComboTicketDates = function() {
    const loteId = document.getElementById('comboTicketLote')?.value;
    if (!loteId) return;
    
    console.log('📅 Atualizando datas para lote:', loteId);
    
    // Por enquanto, definir datas padrão
    const hoje = new Date();
    const fim = new Date();
    fim.setDate(fim.getDate() + 30);
    
    const startInput = document.getElementById('comboSaleStart');
    const endInput = document.getElementById('comboSaleEnd');
    
    if (startInput) {
        startInput.value = hoje.toISOString().slice(0, 16);
    }
    if (endInput) {
        endInput.value = fim.toISOString().slice(0, 16);
    }
};

// Atualizar automaticamente ao abrir modal
const originalOpenModal = window.openModal;
window.openModal = function(modalId) {
    // Chamar função original
    if (typeof originalOpenModal === 'function') {
        originalOpenModal(modalId);
    } else {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
    
    // Popular selects de lotes
    if (modalId === 'paidTicketModal') {
        populatePaidTicketLote();
    } else if (modalId === 'freeTicketModal') {
        populateFreeTicketLote();
    } else if (modalId === 'comboTicketModal') {
        populateComboTicketLote();
    }
};

console.log('✅ Funções de lotes para ingressos carregadas!');
