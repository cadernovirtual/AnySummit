// Correções para funções de criação de ingressos
console.log('🎟️ Carregando correções de ingressos...');

// Função para criar ingresso pago - REDIRECIONADA PARA MYSQL
window.createPaidTicket = function() {
    console.log('💰 Redirecionando createPaidTicket para versão MySQL...');
    
    // Verificar se a versão MySQL está disponível
    if (typeof window.createPaidTicketMySQL === 'function') {
        return window.createPaidTicketMySQL();
    } else {
        console.error('❌ Versão MySQL não carregada, usando fallback');
        alert('Sistema de MySQL não carregado. Recarregue a página.');
    }
};

// Função para criar ingresso gratuito - REDIRECIONADA PARA MYSQL
window.createFreeTicket = function() {
    console.log('🆓 Redirecionando createFreeTicket para versão MySQL...');
    
    // Verificar se a versão MySQL está disponível
    if (typeof window.createFreeTicketMySQL === 'function') {
        return window.createFreeTicketMySQL();
    } else {
        console.error('❌ Versão MySQL não carregada, usando fallback');
        alert('Sistema de MySQL não carregado. Recarregue a página.');
    }
};

// Função para remover ingresso - REDIRECIONADA PARA MYSQL
window.removeTicket = function(ticketId) {
    console.log(`🗑️ Redirecionando removeTicket(${ticketId}) para versão MySQL...`);
    
    // Verificar se a versão MySQL está disponível
    if (typeof window.excluirIngressoDoMySQL === 'function') {
        return window.excluirIngressoDoMySQL(ticketId);
    } else {
        console.error('❌ Versão MySQL não carregada, usando fallback');
        alert('Sistema de MySQL não carregado. Recarregue a página.');
    }
};

// Função para editar ingresso - REDIRECIONADA PARA MYSQL
window.editTicket = function(ticketId) {
    console.log(`✏️ Redirecionando editTicket(${ticketId}) para versão MySQL...`);
    
    // Verificar se a versão MySQL está disponível
    if (typeof window.editarIngressoDoMySQL === 'function') {
        return window.editarIngressoDoMySQL(ticketId);
    } else {
        console.error('❌ Versão MySQL não carregada, usando fallback');
        alert('Sistema de MySQL não carregado. Recarregue a página.');
    }
};

// Função para fechar modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
};

// Funções auxiliares para cálculo de valores
window.calcularValoresIngresso = function() {
    const priceInput = document.getElementById('paidTicketPrice');
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    
    if (!priceInput) return;
    
    const priceText = priceInput.value;
    const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const cobrarTaxa = taxaCheckbox?.checked ?? true;
    
    let taxaServico = 0;
    let valorComprador = price;
    let valorReceber = price;
    
    if (cobrarTaxa && price > 0) {
        taxaServico = price * 0.08;
        valorComprador = price + taxaServico;
    }
    
    // Atualizar campos
    const taxaInput = document.getElementById('paidTicketTaxaValor');
    const compradorInput = document.getElementById('paidTicketValorComprador');
    const receberInput = document.getElementById('paidTicketValorReceber');
    
    if (taxaInput) taxaInput.value = `R$ ${taxaServico.toFixed(2).replace('.', ',')}`;
    if (compradorInput) compradorInput.value = `R$ ${valorComprador.toFixed(2).replace('.', ',')}`;
    if (receberInput) receberInput.value = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
};

// Função para aplicar máscara monetária
window.aplicarMascaraMonetaria = function(input) {
    let value = input.value;
    
    // Remove tudo exceto números
    value = value.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para ter os centavos
    value = (parseInt(value) / 100).toFixed(2);
    
    // Formata com separadores brasileiros
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Adiciona R$
    input.value = 'R$ ' + value;
    
    // Recalcular valores
    calcularValoresIngresso();
};

console.log('✅ Correções de funções de ingresso carregadas!');
