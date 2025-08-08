// CORREÇÃO SIMPLIFICADA PARA PROBLEMAS DE INGRESSO
// Este script substitui as múltiplas sobreposições problemáticas

console.log('🔧 Carregando correção simplificada para ingressos...');

// Limpar conflitos existentes
if (typeof window.createPaidTicket !== 'undefined') {
    window.originalCreatePaidTicket = window.createPaidTicket;
}

// Implementação limpa da função createPaidTicket
window.createPaidTicket = function() {
    console.log('💰 Criando ingresso pago - versão simplificada');
    
    try {
        // Coletar dados do modal
        const dados = {
            titulo: document.getElementById('paidTicketTitle')?.value || '',
            lote: document.getElementById('paidTicketLote')?.value || '',
            preco: document.getElementById('paidTicketPrice')?.value || '',
            quantidade: document.getElementById('paidTicketQuantity')?.value || '',
            inicio: document.getElementById('paidSaleStart')?.value || '',
            fim: document.getElementById('paidSaleEnd')?.value || '',
            minQuantity: document.getElementById('paidMinQuantity')?.value || 1,
            maxQuantity: document.getElementById('paidMaxQuantity')?.value || 5,
            descricao: document.getElementById('paidTicketDescription')?.value || '',
            taxa: document.getElementById('paidTicketTaxaServico')?.checked || false
        };
        
        console.log('📋 Dados coletados:', dados);
        
        // Validações básicas
        if (!dados.titulo) {
            alert('Por favor, informe o título do ingresso');
            return;
        }
        
        if (!dados.lote) {
            alert('Por favor, selecione um lote');
            return;
        }
        
        if (!dados.preco) {
            alert('Por favor, informe o preço');
            return;
        }
        
        if (!dados.quantidade) {
            alert('Por favor, informe a quantidade');
            return;
        }
        
        // Criar estrutura do ingresso
        const ingresso = {
            id: Date.now(), // ID temporário
            tipo: 'pago',
            titulo: dados.titulo,
            lote_id: dados.lote,
            preco: parseFloat(dados.preco.replace(/[^\d,]/g, '').replace(',', '.')),
            quantidade_total: parseInt(dados.quantidade),
            data_inicio: dados.inicio,
            data_fim: dados.fim,
            min_quantidade: parseInt(dados.minQuantity),
            max_quantidade: parseInt(dados.maxQuantity),
            descricao: dados.descricao,
            taxa_servico: dados.taxa
        };
        
        console.log('🎫 Ingresso criado:', ingresso);
        
        // Adicionar à lista de ingressos
        if (typeof window.ingressos === 'undefined') {
            window.ingressos = [];
        }
        
        window.ingressos.push(ingresso);
        
        // Atualizar interface
        if (typeof updateTicketList === 'function') {
            updateTicketList();
        } else {
            console.log('⚠️ Função updateTicketList não encontrada');
        }
        
        // Fechar modal
        if (typeof closeModal === 'function') {
            closeModal('paidTicketModal');
        } else {
            const modal = document.getElementById('paidTicketModal');
            if (modal) modal.style.display = 'none';
        }
        
        console.log('✅ Ingresso pago criado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao criar ingresso pago:', error);
        alert('Erro ao criar ingresso. Verifique os dados e tente novamente.');
    }
};

// Função similar para ingresso gratuito
window.createFreeTicket = function() {
    console.log('🆓 Criando ingresso gratuito - versão simplificada');
    
    try {
        // Implementação similar para ingresso gratuito
        const dados = {
            titulo: document.getElementById('freeTicketTitle')?.value || '',
            lote: document.getElementById('freeTicketLote')?.value || '',
            quantidade: document.getElementById('freeTicketQuantity')?.value || '',
            inicio: document.getElementById('freeSaleStart')?.value || '',
            fim: document.getElementById('freeSaleEnd')?.value || '',
            minQuantity: document.getElementById('freeMinQuantity')?.value || 1,
            maxQuantity: document.getElementById('freeMaxQuantity')?.value || 5,
            descricao: document.getElementById('freeTicketDescription')?.value || ''
        };
        
        console.log('📋 Dados coletados (gratuito):', dados);
        
        // Validações básicas
        if (!dados.titulo) {
            alert('Por favor, informe o título do ingresso');
            return;
        }
        
        if (!dados.lote) {
            alert('Por favor, selecione um lote');
            return;
        }
        
        if (!dados.quantidade) {
            alert('Por favor, informe a quantidade');
            return;
        }
        
        // Criar estrutura do ingresso
        const ingresso = {
            id: Date.now(), // ID temporário
            tipo: 'gratuito',
            titulo: dados.titulo,
            lote_id: dados.lote,
            preco: 0,
            quantidade_total: parseInt(dados.quantidade),
            data_inicio: dados.inicio,
            data_fim: dados.fim,
            min_quantidade: parseInt(dados.minQuantity),
            max_quantidade: parseInt(dados.maxQuantity),
            descricao: dados.descricao
        };
        
        console.log('🎫 Ingresso gratuito criado:', ingresso);
        
        // Adicionar à lista de ingressos
        if (typeof window.ingressos === 'undefined') {
            window.ingressos = [];
        }
        
        window.ingressos.push(ingresso);
        
        // Atualizar interface
        if (typeof updateTicketList === 'function') {
            updateTicketList();
        }
        
        // Fechar modal
        if (typeof closeModal === 'function') {
            closeModal('freeTicketModal');
        } else {
            const modal = document.getElementById('freeTicketModal');
            if (modal) modal.style.display = 'none';
        }
        
        console.log('✅ Ingresso gratuito criado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao criar ingresso gratuito:', error);
        alert('Erro ao criar ingresso. Verifique os dados e tente novamente.');
    }
};

console.log('✅ Correção simplificada de ingressos carregada');