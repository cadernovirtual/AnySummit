/**
 * CORREÇÃO ESPECÍFICA APENAS PARA OPERAÇÕES DE INGRESSOS
 * 
 * Este script corrige APENAS as operações que estavam com problema de JSON contaminado,
 * sem interferir com outras funcionalidades como rascunhos.
 */

console.log('🎯 Carregando correção específica para ingressos...');

/**
 * Função para fazer requisições específicas com limpeza de JSON
 */
async function requisicaoLimpaIngressos(action, eventoId, dados = {}) {
    console.log(`🔧 Fazendo requisição limpa: ${action}`);
    
    let body = `action=${action}&evento_id=${eventoId}`;
    
    // Adicionar dados específicos baseado na ação
    if (action === 'salvar_ingresso_individual' && dados.ingresso) {
        body += `&ingresso=${encodeURIComponent(JSON.stringify(dados.ingresso))}`;
    } else if (action === 'excluir_ingresso' && dados.ingresso_id) {
        body += `&ingresso_id=${dados.ingresso_id}`;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });
        
        // Ler como texto primeiro
        const textoResposta = await response.text();
        console.log(`📥 Resposta recebida (${textoResposta.length} chars)`);
        
        // Limpar JSON contaminado
        const jsonLimpo = limparJSONContaminadoEspecifico(textoResposta);
        console.log('✅ JSON processado:', jsonLimpo);
        
        return jsonLimpo;
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}

/**
 * Função específica para limpar JSON apenas quando necessário
 */
function limparJSONContaminadoEspecifico(textoResposta) {
    try {
        // Primeiro, tentar parsear direto
        return JSON.parse(textoResposta);
    } catch (error) {
        console.log('⚠️ JSON contaminado detectado, limpando...');
        
        // Procurar pelo primeiro { e último }
        const primeiraChave = textoResposta.indexOf('{');
        const ultimaChave = textoResposta.lastIndexOf('}');
        
        if (primeiraChave !== -1 && ultimaChave !== -1 && ultimaChave > primeiraChave) {
            const jsonLimpo = textoResposta.substring(primeiraChave, ultimaChave + 1);
            try {
                return JSON.parse(jsonLimpo);
            } catch (error2) {
                console.error('❌ Erro ao parsear JSON limpo:', error2);
                throw error2;
            }
        } else {
            console.error('❌ Não foi possível encontrar JSON válido');
            throw error;
        }
    }
}

/**
 * RECARREGAMENTO ESPECÍFICO SEM INTERFERIR COM OUTRAS FUNÇÕES
 */
window.recarregarIngressosEspecifico = async function() {
    console.log('🔄 Recarregando ingressos (versão específica)...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Evento novo - sem recarregamento');
        return true;
    }
    
    try {
        const data = await requisicaoLimpaIngressos('recuperar_evento', eventoId);
        
        if (!data.sucesso) {
            console.error('❌ Erro ao carregar dados:', data.erro);
            return false;
        }
        
        // Armazenar dados
        window.ingressosAtuaisEspecifico = data.ingressos || [];
        window.lotesAtuaisEspecifico = data.lotes || [];
        
        console.log(`✅ Carregados: ${window.ingressosAtuaisEspecifico.length} ingressos`);
        
        // Recriar DOM
        recriarDOMEspecifico();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        return false;
    }
};

/**
 * RECRIAR DOM ESPECÍFICO
 */
function recriarDOMEspecifico() {
    console.log('🎨 Recriando DOM específico...');
    
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    // Limpar
    ticketList.innerHTML = '';
    
    if (!window.ingressosAtuaisEspecifico || window.ingressosAtuaisEspecifico.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state" style="background: transparent !important;">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada ingresso
    window.ingressosAtuaisEspecifico.forEach(ingresso => {
        adicionarIngressoEspecifico(ingresso);
    });
    
    console.log(`✅ ${window.ingressosAtuaisEspecifico.length} ingressos renderizados`);
}

/**
 * ADICIONAR INGRESSO ESPECÍFICO
 */
function adicionarIngressoEspecifico(ingresso) {
    const ticketList = document.getElementById('ticketList');
    const type = ingresso.tipo === 'pago' ? 'paid' : 'free';
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    if (typeof addTicketToList === 'function') {
        const elementosAntes = ticketList.children.length;
        
        addTicketToList(
            type, title, quantity, price,
            ingresso.lote_id || '', ingresso.descricao || '',
            ingresso.inicio_venda || '', ingresso.fim_venda || '',
            parseInt(ingresso.limite_min) || 1, parseInt(ingresso.limite_max) || 5
        );
        
        const elementosDepois = ticketList.children.length;
        if (elementosDepois > elementosAntes) {
            const ultimoElemento = ticketList.lastElementChild;
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.dataset.ingressoId = ingresso.id;
                
                const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
                const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
                
                if (editBtn) {
                    editBtn.setAttribute('onclick', `editarIngressoEspecifico(${ingresso.id})`);
                }
                if (removeBtn) {
                    removeBtn.setAttribute('onclick', `excluirIngressoEspecifico(${ingresso.id})`);
                }
                
                console.log(`✅ Ingresso ${ingresso.id} adicionado`);
            }
        }
    }
}

/**
 * EXCLUSÃO ESPECÍFICA
 */
window.excluirIngressoEspecifico = async function(ingressoId) {
    console.log(`🗑️ Excluindo ingresso específico ${ingressoId}...`);
    
    if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    try {
        const data = await requisicaoLimpaIngressos('excluir_ingresso', eventoId, {
            ingresso_id: ingressoId
        });
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído`);
            await window.recarregarIngressosEspecifico();
        } else {
            alert('Erro ao excluir: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao excluir:', error);
        alert('Erro de conexão');
    }
};

/**
 * EDIÇÃO ESPECÍFICA
 */
window.editarIngressoEspecifico = async function(ingressoId) {
    console.log(`✏️ Editando ingresso específico ${ingressoId}...`);
    
    // Garantir dados carregados
    if (!window.ingressosAtuaisEspecifico || window.ingressosAtuaisEspecifico.length === 0) {
        await window.recarregarIngressosEspecifico();
    }
    
    const ingresso = window.ingressosAtuaisEspecifico.find(i => i.id == ingressoId);
    
    if (!ingresso) {
        console.error(`❌ Ingresso ${ingressoId} não encontrado`);
        alert('Ingresso não encontrado. Recarregando...');
        await window.recarregarIngressosEspecifico();
        return;
    }
    
    console.log(`✅ Ingresso encontrado:`, ingresso);
    
    // Popular modal
    if (ingresso.tipo === 'pago') {
        popularModalPagoEspecifico(ingresso);
        if (typeof openModal === 'function') {
            openModal('paidTicketModal');
        }
    } else if (ingresso.tipo === 'gratuito') {
        popularModalGratuitoEspecifico(ingresso);
        if (typeof openModal === 'function') {
            openModal('freeTicketModal');
        }
    }
};

/**
 * POPULAR MODAIS ESPECÍFICO
 */
function popularModalPagoEspecifico(ingresso) {
    document.getElementById('paidTicketTitle').value = ingresso.titulo;
    document.getElementById('paidTicketQuantity').value = ingresso.quantidade_total;
    document.getElementById('paidTicketPrice').value = `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('paidTicketDescription').value = ingresso.descricao || '';
    document.getElementById('paidSaleStart').value = ingresso.inicio_venda || '';
    document.getElementById('paidSaleEnd').value = ingresso.fim_venda || '';
    document.getElementById('paidMinQuantity').value = ingresso.limite_min || 1;
    document.getElementById('paidMaxQuantity').value = ingresso.limite_max || 5;
    document.getElementById('paidTicketLote').value = ingresso.lote_id || '';
    
    document.getElementById('paidTicketModal').dataset.editingId = ingresso.id;
    console.log(`✅ Modal pago populado para ${ingresso.id}`);
}

function popularModalGratuitoEspecifico(ingresso) {
    document.getElementById('freeTicketTitle').value = ingresso.titulo;
    document.getElementById('freeTicketQuantity').value = ingresso.quantidade_total;
    document.getElementById('freeTicketDescription').value = ingresso.descricao || '';
    document.getElementById('freeSaleStart').value = ingresso.inicio_venda || '';
    document.getElementById('freeSaleEnd').value = ingresso.fim_venda || '';
    document.getElementById('freeMinQuantity').value = ingresso.limite_min || 1;
    document.getElementById('freeMaxQuantity').value = ingresso.limite_max || 5;
    document.getElementById('freeTicketLote').value = ingresso.lote_id || '';
    
    document.getElementById('freeTicketModal').dataset.editingId = ingresso.id;
    console.log(`✅ Modal gratuito populado para ${ingresso.id}`);
}

/**
 * SOBRESCRITA ESPECÍFICA E CUIDADOSA
 */
console.log('🎯 Aplicando sobrescrita específica...');

// Aguardar carregamento e sobrescrever apenas se necessário
setTimeout(() => {
    if (typeof window.removeTicket === 'function') {
        window.removeTicket = window.excluirIngressoEspecifico;
        console.log('✅ removeTicket sobrescrita');
    }
    
    if (typeof window.editTicket === 'function') {
        window.editTicket = window.editarIngressoEspecifico;
        console.log('✅ editTicket sobrescrita');
    }
    
    // Carregamento inicial
    setTimeout(() => {
        window.recarregarIngressosEspecifico();
    }, 2000);
    
}, 3000);

console.log('✅ CORREÇÃO ESPECÍFICA PARA INGRESSOS CARREGADA!');