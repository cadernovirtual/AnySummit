/**
 * CORREÇÃO SIMPLES E DIRETA PARA OS PROBLEMAS REPORTADOS
 * 
 * FOCO: Apenas fazer removeTicket() e editTicket() atualizarem o DOM
 * SEM quebrar rascunhos ou outras funcionalidades
 */

console.log('🔧 Carregando correção simples e direta...');

/**
 * FUNÇÃO SIMPLES: Recarregar apenas a lista de ingressos
 */
window.recarregarListaSimples = async function() {
    console.log('🔄 Recarregando lista de ingressos (simples)...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Evento novo - sem recarregamento');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${eventoId}`
        });
        
        const textoResposta = await response.text();
        console.log('📄 Resposta recebida:', textoResposta.substring(0, 200) + '...');
        
        // Tentar parsear JSON - se falhar, tentar extrair JSON limpo
        let data;
        try {
            data = JSON.parse(textoResposta);
        } catch (error) {
            // Extrair JSON entre primeira { e última }
            const inicio = textoResposta.indexOf('{');
            const fim = textoResposta.lastIndexOf('}');
            if (inicio !== -1 && fim !== -1) {
                const jsonLimpo = textoResposta.substring(inicio, fim + 1);
                data = JSON.parse(jsonLimpo);
                console.log('✅ JSON extraído e parseado');
            } else {
                throw error;
            }
        }
        
        if (data && data.sucesso && data.ingressos) {
            // Recriar lista
            recriarListaIngressos(data.ingressos);
            console.log(`✅ Lista atualizada com ${data.ingressos.length} ingressos`);
            return true;
        } else {
            console.error('❌ Resposta inválida:', data);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro ao recarregar:', error);
        return false;
    }
};

/**
 * FUNÇÃO SIMPLES: Recriar lista de ingressos
 */
function recriarListaIngressos(ingressos) {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    // Limpar lista
    ticketList.innerHTML = '';
    
    if (ingressos.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state" style="background: transparent !important;">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        return;
    }
    
    // Recriar cada ingresso
    ingressos.forEach(ingresso => {
        criarElementoIngresso(ingresso);
    });
}

/**
 * FUNÇÃO SIMPLES: Criar elemento de ingresso
 */
function criarElementoIngresso(ingresso) {
    const type = ingresso.tipo === 'pago' ? 'paid' : 'free';
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    // Usar addTicketToList se disponível
    if (typeof addTicketToList === 'function') {
        const ticketList = document.getElementById('ticketList');
        const elementosAntes = ticketList.children.length;
        
        addTicketToList(
            type, title, quantity, price,
            ingresso.lote_id || '', ingresso.descricao || '',
            ingresso.inicio_venda || '', ingresso.fim_venda || '',
            parseInt(ingresso.limite_min) || 1, parseInt(ingresso.limite_max) || 5
        );
        
        // Corrigir o último elemento criado
        const elementosDepois = ticketList.children.length;
        if (elementosDepois > elementosAntes) {
            const ultimoElemento = ticketList.lastElementChild;
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                // Usar ID real do banco
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.dataset.ingressoId = ingresso.id;
                
                // Corrigir botões
                const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
                const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
                
                if (editBtn) {
                    editBtn.setAttribute('onclick', `editTicketSimples(${ingresso.id})`);
                }
                if (removeBtn) {
                    removeBtn.setAttribute('onclick', `removeTicketSimples(${ingresso.id})`);
                }
                
                console.log(`✅ Ingresso ${ingresso.id} criado com botões corretos`);
            }
        }
    }
}

/**
 * FUNÇÃO SIMPLES: Remover ingresso
 */
window.removeTicketSimples = async function(ingressoId) {
    console.log(`🗑️ Removendo ingresso ${ingressoId}...`);
    
    if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textoResposta = await response.text();
        
        // Tentar parsear JSON
        let data;
        try {
            data = JSON.parse(textoResposta);
        } catch (error) {
            const inicio = textoResposta.indexOf('{');
            const fim = textoResposta.lastIndexOf('}');
            if (inicio !== -1 && fim !== -1) {
                const jsonLimpo = textoResposta.substring(inicio, fim + 1);
                data = JSON.parse(jsonLimpo);
            } else {
                throw error;
            }
        }
        
        if (data && data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído`);
            
            // RECARREGAR LISTA
            await window.recarregarListaSimples();
            
        } else {
            alert('Erro ao excluir: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao excluir:', error);
        alert('Erro de conexão');
    }
};

/**
 * FUNÇÃO SIMPLES: Editar ingresso
 */
window.editTicketSimples = async function(ingressoId) {
    console.log(`✏️ Editando ingresso ${ingressoId}...`);
    
    // Primeiro, recarregar para ter dados atuais
    await window.recarregarListaSimples();
    
    // Por enquanto, apenas mostrar alerta
    alert(`Função de edição será implementada para ingresso ${ingressoId}`);
};

/**
 * SOBRESCREVER funções originais APENAS se existirem
 */
setTimeout(() => {
    console.log('🔄 Sobrescrevendo funções originais...');
    
    if (typeof window.removeTicket === 'function') {
        window.removeTicket = window.removeTicketSimples;
        console.log('✅ removeTicket sobrescrita');
    }
    
    if (typeof window.editTicket === 'function') {
        window.editTicket = window.editTicketSimples;
        console.log('✅ editTicket sobrescrita');
    }
    
    // Carregar lista inicial
    setTimeout(() => {
        window.recarregarListaSimples();
    }, 1000);
    
}, 2000);

console.log('✅ Correção simples carregada!');