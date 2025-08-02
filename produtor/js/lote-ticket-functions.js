// Funções para popular selects de lotes nos modais (CORRIGIDO para usar sistema MySQL)
console.log('📋 Carregando funções de lotes para ingressos...');

// Função para obter lotes usando o sistema MySQL da Etapa 5
async function getLotesSalvos() {
    try {
        // Usar a função da Etapa 5 que funciona perfeitamente
        if (typeof window.carregarLotesDoBanco === 'function') {
            const lotes = await window.carregarLotesDoBanco();
            console.log('📦 Lotes obtidos do banco:', lotes);
            return lotes || [];
        } else {
            console.warn('⚠️ Função window.carregarLotesDoBanco não encontrada');
            return [];
        }
    } catch (error) {
        console.error('❌ Erro ao carregar lotes:', error);
        return [];
    }
}

// Popular select de lote para ingresso pago
window.populatePaidTicketLote = async function() {
    console.log('📝 Populando lotes para ingresso pago...');
    const select = document.getElementById('paidTicketLote');
    if (!select) {
        console.warn('⚠️ Select paidTicketLote não encontrado');
        return;
    }
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Carregando lotes...</option>';
    
    try {
        // Obter lotes do banco
        const lotes = await getLotesSalvos();
        
        // Limpar e recriar opções
        select.innerHTML = '<option value="">Selecione um lote</option>';
        
        if (lotes.length === 0) {
            select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
            console.log('⚠️ Nenhum lote encontrado para ingresso pago');
            return;
        }
        
        // Adicionar lotes ao select
        lotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.id;
            option.textContent = lote.nome;
            select.appendChild(option);
        });
        
        console.log(`✅ ${lotes.length} lotes adicionados ao select de ingresso pago`);
    } catch (error) {
        console.error('❌ Erro ao popular select de ingresso pago:', error);
        select.innerHTML = '<option value="">Erro ao carregar lotes</option>';
    }
};

// Popular select de lote para ingresso gratuito
window.populateFreeTicketLote = async function() {
    console.log('📝 Populando lotes para ingresso gratuito...');
    const select = document.getElementById('freeTicketLote');
    if (!select) {
        console.warn('⚠️ Select freeTicketLote não encontrado');
        return;
    }
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Carregando lotes...</option>';
    
    try {
        // Obter lotes do banco
        const lotes = await getLotesSalvos();
        
        // Limpar e recriar opções
        select.innerHTML = '<option value="">Selecione um lote</option>';
        
        if (lotes.length === 0) {
            select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
            console.log('⚠️ Nenhum lote encontrado para ingresso gratuito');
            return;
        }
        
        // Adicionar lotes ao select
        lotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.id;
            option.textContent = lote.nome;
            select.appendChild(option);
        });
        
        console.log(`✅ ${lotes.length} lotes adicionados ao select de ingresso gratuito`);
    } catch (error) {
        console.error('❌ Erro ao popular select de ingresso gratuito:', error);
        select.innerHTML = '<option value="">Erro ao carregar lotes</option>';
    }
};

// Popular select de lote para combo
window.populateComboTicketLote = async function() {
    console.log('📝 Populando lotes para combo...');
    const select = document.getElementById('comboTicketLote');
    if (!select) {
        console.warn('⚠️ Select comboTicketLote não encontrado');
        return;
    }
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Carregando lotes...</option>';
    
    try {
        // Obter lotes do banco
        const lotes = await getLotesSalvos();
        
        // Limpar e recriar opções
        select.innerHTML = '<option value="">Selecione um lote</option>';
        
        if (lotes.length === 0) {
            select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
            console.log('⚠️ Nenhum lote encontrado para combo');
            return;
        }
        
        // Adicionar lotes ao select
        lotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.id;
            option.textContent = lote.nome;
            select.appendChild(option);
        });
        
        console.log(`✅ ${lotes.length} lotes adicionados ao select de combo`);
    } catch (error) {
        console.error('❌ Erro ao popular select de combo:', error);
        select.innerHTML = '<option value="">Erro ao carregar lotes</option>';
    }
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

// Interceptar openModal para popular lotes automaticamente
if (typeof window.originalOpenModal === 'undefined') {
    window.originalOpenModal = window.openModal;
}

window.openModal = function(modalId) {
    console.log('🎯 Abrindo modal:', modalId);
    
    // Chamar função original de abertura
    if (typeof window.originalOpenModal === 'function') {
        window.originalOpenModal(modalId);
    } else {
        // Fallback para abertura manual
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
    
    // Popular selects de lotes baseado no modal aberto
    setTimeout(() => {
        if (modalId === 'paidTicketModal') {
            console.log('🎫 Modal de ingresso pago aberto - populando lotes');
            window.populatePaidTicketLote();
        } else if (modalId === 'freeTicketModal') {
            console.log('🎫 Modal de ingresso gratuito aberto - populando lotes');
            window.populateFreeTicketLote();
        } else if (modalId === 'comboTicketModal') {
            console.log('🎫 Modal de combo aberto - populando lotes');
            window.populateComboTicketLote();
        }
    }, 100); // Pequeno delay para garantir que o modal está totalmente carregado
};

console.log('✅ Funções de lotes para ingressos carregadas (versão MySQL)!');
console.log('📋 Funções disponíveis:');
console.log('  - populatePaidTicketLote(): Popular lotes no modal de ingresso pago');
console.log('  - populateFreeTicketLote(): Popular lotes no modal de ingresso gratuito');
console.log('  - populateComboTicketLote(): Popular lotes no modal de combo');
console.log('  - openModal(): Intercepta abertura de modais e popula lotes automaticamente');
