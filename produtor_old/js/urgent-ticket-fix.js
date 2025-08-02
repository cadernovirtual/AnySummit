// Correção URGENTE para botões de criar ingresso
console.log('🚨 Aplicando correção urgente dos botões...');

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. CRIAR AS FUNÇÕES PRIMEIRO
    
    // Função createPaidTicket
    window.createPaidTicket = function() {
        console.log('💰 Criando ingresso pago...');
        
        // Limpar erros anteriores
        document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
        
        // Coletar dados
        const title = document.getElementById('paidTicketTitle')?.value?.trim();
        const quantity = document.getElementById('paidTicketQuantity')?.value;
        const price = document.getElementById('paidTicketPrice')?.value;
        const loteId = document.getElementById('paidTicketLote')?.value;
        
        // Validar campos básicos
        if (!title || !quantity || !price || price === 'R$ 0,00' || !loteId) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Limpar preço
        const cleanPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
        
        // Criar elemento do ingresso
        const ticketId = 'ticket_' + Date.now();
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.dataset.ticketId = ticketId;
        
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-name">${title}</div>
                    <div class="ticket-details">
                        <span>Quantidade: ${quantity}</span>
                        <span>Preço: R$ ${cleanPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ticketId}')">✏️</button>
                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')">🗑️</button>
                </div>
            </div>
        `;
        
        // Adicionar à lista
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            ticketList.appendChild(ticketItem);
        }
        
        // Fechar modal
        closeModal('paidTicketModal');
        
        // Limpar formulário
        document.getElementById('paidTicketTitle').value = '';
        document.getElementById('paidTicketQuantity').value = '';
        document.getElementById('paidTicketPrice').value = '';
        
        console.log('✅ Ingresso pago criado!');
    };
    
    // Função createFreeTicket
    window.createFreeTicket = function() {
        console.log('🆓 Criando ingresso gratuito...');
        
        const title = document.getElementById('freeTicketTitle')?.value?.trim();
        const quantity = document.getElementById('freeTicketQuantity')?.value;
        const loteId = document.getElementById('freeTicketLote')?.value;
        
        if (!title || !quantity || !loteId) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const ticketId = 'ticket_' + Date.now();
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.dataset.ticketId = ticketId;
        
        ticketItem.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-name">${title}</div>
                    <div class="ticket-details">
                        <span>Quantidade: ${quantity}</span>
                        <span>Preço: Gratuito</span>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn-icon" onclick="editTicket('${ticketId}')">✏️</button>
                    <button class="btn-icon delete" onclick="removeTicket('${ticketId}')">🗑️</button>
                </div>
            </div>
        `;
        
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            ticketList.appendChild(ticketItem);
        }
        
        closeModal('freeTicketModal');
        
        document.getElementById('freeTicketTitle').value = '';
        document.getElementById('freeTicketQuantity').value = '';
        
        console.log('✅ Ingresso gratuito criado!');
    };
    
    // Função createComboTicket
    window.createComboTicket = function() {
        console.log('📦 Criando combo...');
        alert('Função de combo será implementada em breve!');
        closeModal('comboTicketModal');
    };
    
    // Funções auxiliares
    window.removeTicket = function(ticketId) {
        if (confirm('Tem certeza que deseja excluir este ingresso?')) {
            const ticket = document.querySelector(`[data-ticket-id="${ticketId}"]`);
            if (ticket) ticket.remove();
        }
    };
    
    window.editTicket = function(ticketId) {
        alert('Função de edição será implementada em breve!');
    };
    
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    };
    
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
        
        // Popular lotes se necessário
        if (modalId === 'paidTicketModal' || modalId === 'freeTicketModal' || modalId === 'comboTicketModal') {
            popularLotesNoModal(modalId);
        }
    };
    
    // Popular lotes
    function popularLotesNoModal(modalId) {
        let selectId = '';
        if (modalId === 'paidTicketModal') selectId = 'paidTicketLote';
        else if (modalId === 'freeTicketModal') selectId = 'freeTicketLote';
        else if (modalId === 'comboTicketModal') selectId = 'comboTicketLote';
        
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Limpar e adicionar opção padrão
        select.innerHTML = '<option value="">Selecione um lote</option>';
        
        // Adicionar lote padrão para teste
        const option = document.createElement('option');
        option.value = 'lote_default';
        option.textContent = 'Lote Principal';
        select.appendChild(option);
    }
    
    // Máscara monetária
    window.aplicarMascaraMonetaria = function(input) {
        let value = input.value;
        value = value.replace(/\D/g, '');
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        input.value = 'R$ ' + value;
    };
    
    window.calcularValoresIngresso = function() {
        // Implementação básica
        console.log('Calculando valores...');
    };
    
    // 2. CORRIGIR OS BOTÕES NO HTML
    
    // Encontrar botões com problema e corrigir
    setTimeout(() => {
        // Botão do modal de ingresso pago
        const paidModalButtons = document.querySelectorAll('#paidTicketModal .modal-actions button');
        paidModalButtons.forEach(btn => {
            if (btn.textContent.includes('Criar')) {
                btn.onclick = function() { createPaidTicket(); };
                console.log('✅ Botão ingresso pago corrigido');
            }
        });
        
        // Botão do modal de ingresso gratuito
        const freeModalButtons = document.querySelectorAll('#freeTicketModal .modal-actions button');
        freeModalButtons.forEach(btn => {
            if (btn.textContent.includes('Criar')) {
                btn.onclick = function() { createFreeTicket(); };
                console.log('✅ Botão ingresso gratuito corrigido');
            }
        });
        
        // Botão do modal de combo
        const comboModalButtons = document.querySelectorAll('#comboTicketModal .modal-actions button');
        comboModalButtons.forEach(btn => {
            if (btn.textContent.includes('Criar')) {
                btn.onclick = function() { createComboTicket(); };
                console.log('✅ Botão combo corrigido');
            }
        });
    }, 500);
    
    console.log('✅ Correção urgente aplicada!');
});

// Verificação adicional
window.addEventListener('load', function() {
    console.log('🔍 Verificando funções após carregamento completo...');
    console.log('createPaidTicket:', typeof window.createPaidTicket);
    console.log('createFreeTicket:', typeof window.createFreeTicket);
    console.log('createComboTicket:', typeof window.createComboTicket);
});
