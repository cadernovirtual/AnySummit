// Extensão das funções de criação de ingresso gratuito

// Função para criar ingresso gratuito com validação
window.createFreeTicket = function() {
    // Limpar erros anteriores
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    const title = document.getElementById('freeTicketTitle')?.value;
    const quantity = document.getElementById('freeTicketQuantity')?.value;
    const description = document.getElementById('freeTicketDescription')?.value || '';
    const saleStart = document.getElementById('freeSaleStart')?.value;
    const saleEnd = document.getElementById('freeSaleEnd')?.value;
    const minQuantity = document.getElementById('freeMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('freeMaxQuantity')?.value || 5;
    const loteId = document.getElementById('freeTicketLote')?.value;
    
    // Validação com destaque de campos
    let hasError = false;
    
    if (!title) {
        document.getElementById('freeTicketTitle').classList.add('error-field');
        hasError = true;
    }
    if (!quantity) {
        document.getElementById('freeTicketQuantity').classList.add('error-field');
        hasError = true;
    }
    if (!loteId) {
        document.getElementById('freeTicketLote').classList.add('error-field');
        hasError = true;
    }
    
    if (hasError) {
        alert('Por favor, preencha todos os campos obrigatórios marcados em vermelho.');
        return;
    }
    
    // Obter informações do lote
    let loteInfo = null;
    if (loteId) {
        const selectLote = document.getElementById('freeTicketLote');
        const selectedOption = selectLote.querySelector(`option[value="${loteId}"]`);
        if (selectedOption) {
            loteInfo = {
                id: loteId,
                nome: selectedOption.textContent,
                tipo: selectedOption.getAttribute('data-tipo'),
                percentual: selectedOption.getAttribute('data-percentual')
            };
        }
    }

    // Verificar se estamos em modo de edição (existe API)
    if (window.location.pathname.includes('editar-evento.php') && typeof fetch !== 'undefined') {
        // Modo edição - usar API
        const eventoId = new URLSearchParams(window.location.search).get('eventoid');
        const data = {
            evento_id: parseInt(eventoId),
            tipo: 'gratuito',
            titulo: title,
            descricao: description,
            quantidade_total: parseInt(quantity),
            preco: 0,
            taxa_plataforma: 0,
            valor_receber: 0,
            cobrar_taxa_servico: 0,
            lote_id: loteId,
            inicio_venda: saleStart || new Date().toISOString().slice(0, 16),
            fim_venda: saleEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 16),
            limite_min: parseInt(minQuantity),
            limite_max: parseInt(maxQuantity),
            disponibilidade: 'publico',
            ativo: 1
        };

        fetch('/produtor/ajax/salvar_ingresso.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                if (typeof addTicketToEditList === 'function') {
                    addTicketToEditList(result.ingresso);
                }
                closeModal('freeTicketModal');
                console.log('✅ Ingresso gratuito criado com sucesso via API');
            } else {
                console.error('❌ Erro ao criar ingresso:', result.message);
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            alert('Erro ao criar ingresso. Tente novamente.');
        });
    } else {
        // Modo criação - usar sistema de ingressos temporários
        if (typeof addTicketToCreationList === 'function') {
            addTicketToCreationList(
                'free', 
                title, 
                parseInt(quantity), 
                0, // preço zero para gratuito
                description, 
                saleStart, 
                saleEnd, 
                parseInt(minQuantity), 
                parseInt(maxQuantity),
                0, // cobrar taxa = 0
                0, // taxa plataforma = 0
                0, // valor receber = 0
                loteId,
                loteInfo
            );
        } else {
            // Fallback para função antiga
            addTicketToList('free', title, quantity, '0');
        }
        
        closeModal('freeTicketModal');
        
        // Limpar campos
        document.getElementById('freeTicketTitle').value = '';
        document.getElementById('freeTicketQuantity').value = '';
        document.getElementById('freeTicketDescription').value = '';
        document.getElementById('freeSaleStart').value = '';
        document.getElementById('freeSaleEnd').value = '';
        document.getElementById('freeMinQuantity').value = '1';
        document.getElementById('freeMaxQuantity').value = '5';
        document.getElementById('freeTicketLote').value = '';
    }
};
