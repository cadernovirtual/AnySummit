// BYPASS TOTAL - USAR SISTEMA QUE JÁ FUNCIONA
window.salvarComboDirecto = function() {
    console.log('🔥 SALVAMENTO DIRETO DO COMBO');
    
    // COLETAR DADOS SIMPLES
    const titulo = document.getElementById('comboTicketTitle')?.value || '';
    const preco = document.getElementById('comboTicketPrice')?.value || '';
    const lote = document.getElementById('comboTicketLote')?.value || '';
    
    console.log('📊 Dados coletados:');
    console.log('  - titulo:', titulo);
    console.log('  - preco:', preco);
    console.log('  - lote:', lote);
    
    if (!titulo) {
        alert('Digite o título do combo');
        return;
    }
    
    if (!preco || preco === 'R$ 0,00') {
        alert('Digite o preço do combo');
        return;
    }
    
    if (!lote) {
        alert('Selecione um lote');
        return;
    }
    
    // COLETAR ITENS
    const itens = [];
    if (window.comboItems && window.comboItems.length > 0) {
        window.comboItems.forEach(item => {
            const id = item.ticketId || item.ticket_id || item.id;
            const qtd = item.quantity || item.quantidade || 1;
            
            if (id && qtd) {
                itens.push({ ingresso_id: parseInt(id), quantidade: parseInt(qtd) });
            }
        });
    }
    
    if (itens.length === 0) {
        alert('Adicione pelo menos um item ao combo');
        return;
    }
    
    console.log('📦 Itens coletados:', itens);
    
    // USAR O SISTEMA AJAX DIRETO
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    const dados = {
        action: 'salvar_ingresso_individual',
        evento_id: eventoId,
        ingresso: JSON.stringify({
            tipo: 'combo',
            titulo: titulo,
            preco: preco,
            lote_id: parseInt(lote),
            conteudo_combo: JSON.stringify(itens),
            quantidade_total: 100,
            descricao: '',
            inicio_venda: null,
            fim_venda: null,
            limite_min: 1,
            limite_max: 5
        })
    };
    
    console.log('💾 Enviando para servidor:', dados);
    
    // AJAX DIRETO
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(dados).toString()
    })
    .then(response => response.json())
    .then(result => {
        console.log('📥 Resposta servidor:', result);
        if (result.sucesso) {
            alert('Combo salvo com sucesso!');
            // FECHAR MODAL E RECARREGAR
            document.getElementById('comboTicketModal').style.display = 'none';
            if (window.carregarIngressosDoBanco) {
                window.carregarIngressosDoBanco();
            }
        } else {
            alert('Erro ao salvar: ' + (result.erro || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('❌ Erro:', error);
        alert('Erro de conexão');
    });
};

// SOBRESCREVER A FUNÇÃO PROBLEMÁTICA
window.createComboTicket = window.salvarComboDirecto;
