/**
 * CORREÇÃO DO PROBLEMA DO JSON MAL FORMADO
 * 
 * O problema é que a API está retornando error_log() misturado com JSON
 * Esta correção intercepta e limpa as respostas
 */

console.log('🛠️ Carregando correção do JSON mal formado...');

/**
 * Função para limpar JSON contaminado com error_log
 */
function limparJSONContaminado(textoResposta) {
    try {
        // Primeiro, tentar parsear direto (caso não tenha problema)
        return JSON.parse(textoResposta);
    } catch (error) {
        console.log('⚠️ JSON contaminado detectado, limpando...');
        
        // Procurar pelo primeiro { e último }
        const primeiraChave = textoResposta.indexOf('{');
        const ultimaChave = textoResposta.lastIndexOf('}');
        
        if (primeiraChave !== -1 && ultimaChave !== -1 && ultimaChave > primeiraChave) {
            const jsonLimpo = textoResposta.substring(primeiraChave, ultimaChave + 1);
            try {
                const parsed = JSON.parse(jsonLimpo);
                console.log('✅ JSON limpo com sucesso');
                return parsed;
            } catch (error2) {
                console.error('❌ Erro ao parsear JSON limpo:', error2);
                throw error2;
            }
        } else {
            console.error('❌ Não foi possível encontrar JSON válido na resposta');
            throw error;
        }
    }
}

/**
 * Interceptar fetch para wizard_evento.php e limpar respostas
 */
const fetchOriginal = window.fetch;
window.fetch = function(url, options) {
    const isWizardEvento = url.includes('wizard_evento.php') || url.includes('/produtor/ajax/');
    
    if (isWizardEvento) {
        console.log(`🔧 Interceptando requisição para ${url}`);
        
        return fetchOriginal.apply(this, arguments).then(response => {
            // Clonar response para poder ler o texto
            const responseClone = response.clone();
            
            // Criar um response personalizado com JSON limpo
            const responsePersonalizado = {
                ...response,
                json: async function() {
                    const texto = await responseClone.text();
                    console.log(`📥 Resposta bruta (${texto.length} chars):`, texto.substring(0, 200) + '...');
                    
                    try {
                        const jsonLimpo = limparJSONContaminado(texto);
                        console.log('✅ JSON parseado com sucesso:', jsonLimpo);
                        return jsonLimpo;
                    } catch (error) {
                        console.error('❌ Erro ao limpar JSON:', error);
                        console.error('📄 Texto completo da resposta:', texto);
                        throw error;
                    }
                },
                text: async function() {
                    return responseClone.text();
                }
            };
            
            return responsePersonalizado;
        });
    } else {
        return fetchOriginal.apply(this, arguments);
    }
};

/**
 * RECARREGAMENTO ROBUSTO COM LIMPEZA DE JSON
 */
window.recarregarListaRobusta = async function() {
    console.log('🔄 RECARREGAMENTO ROBUSTO COM LIMPEZA DE JSON...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem recarregamento');
        return true;
    }
    
    try {
        console.log(`🔍 Carregando dados do evento ${eventoId}...`);
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${eventoId}`
        });
        
        console.log('📡 Response status:', response.status);
        
        // Usar nossa função de JSON limpo
        const data = await response.json();
        
        if (!data.sucesso) {
            console.error('❌ Erro ao carregar dados:', data.erro);
            return false;
        }
        
        // Armazenar dados globalmente
        window.ingressosAtuais = data.ingressos || [];
        window.lotesAtuais = data.lotes || [];
        
        console.log(`✅ Carregados: ${window.ingressosAtuais.length} ingressos, ${window.lotesAtuais.length} lotes`);
        
        // Recriar lista completamente
        recriarListaDOMRobusta();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        return false;
    }
};

/**
 * RECRIAR DOM DE FORMA ROBUSTA
 */
function recriarListaDOMRobusta() {
    console.log('🎨 RECRIANDO DOM ROBUSTO...');
    
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    // Limpar completamente
    ticketList.innerHTML = '';
    
    if (!window.ingressosAtuais || window.ingressosAtuais.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state" style="background: transparent !important; background-color: transparent !important;">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        console.log('📝 Lista vazia renderizada');
        return;
    }
    
    console.log(`🎨 Renderizando ${window.ingressosAtuais.length} ingressos...`);
    
    // Renderizar cada ingresso
    window.ingressosAtuais.forEach((ingresso, index) => {
        console.log(`🔧 Processando ingresso ${index + 1}: ${ingresso.titulo}`);
        adicionarIngressoAoDOMRobusto(ingresso);
    });
    
    console.log(`✅ ${window.ingressosAtuais.length} ingressos adicionados ao DOM`);
}

/**
 * ADICIONAR INGRESSO DE FORMA ROBUSTA
 */
function adicionarIngressoAoDOMRobusto(ingresso) {
    const ticketList = document.getElementById('ticketList');
    
    // Converter tipo
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    // Usar addTicketToList se disponível
    if (typeof addTicketToList === 'function') {
        const elementosAntes = ticketList.children.length;
        
        addTicketToList(
            type, 
            title, 
            quantity, 
            price, 
            ingresso.lote_id || '', 
            ingresso.descricao || '', 
            ingresso.inicio_venda || '', 
            ingresso.fim_venda || '', 
            parseInt(ingresso.limite_min) || 1, 
            parseInt(ingresso.limite_max) || 5
        );
        
        // Corrigir o último elemento criado
        const elementosDepois = ticketList.children.length;
        if (elementosDepois > elementosAntes) {
            const ultimoElemento = ticketList.lastElementChild;
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                // Corrigir IDs e botões
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.dataset.ingressoId = ingresso.id;
                
                // Corrigir botões com IDs reais e funções robustas
                const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
                const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
                
                if (editBtn) {
                    editBtn.setAttribute('onclick', `editarIngressoRobusto(${ingresso.id})`);
                }
                if (removeBtn) {
                    removeBtn.setAttribute('onclick', `excluirIngressoRobusto(${ingresso.id})`);
                }
                
                console.log(`✅ Ingresso ${ingresso.id} (${ingresso.titulo}) adicionado com botões robustos`);
            }
        }
    } else {
        console.error('❌ addTicketToList não disponível');
    }
}

/**
 * EXCLUSÃO ROBUSTA COM LIMPEZA DE JSON
 */
window.excluirIngressoRobusto = async function(ingressoId) {
    console.log(`🗑️ EXCLUSÃO ROBUSTA do ingresso ${ingressoId}...`);
    
    if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
        alert('Erro: Evento não identificado');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const data = await response.json(); // Usa nossa interceptação que limpa o JSON
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído do MySQL`);
            
            // RECARREGAR LISTA ROBUSTA
            const sucesso = await window.recarregarListaRobusta();
            
            if (sucesso) {
                console.log(`✅ Lista atualizada após exclusão`);
            } else {
                console.error(`❌ Erro ao recarregar após exclusão`);
            }
            
        } else {
            alert('Erro ao excluir: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao excluir:', error);
        alert('Erro de conexão');
    }
};

/**
 * EDIÇÃO ROBUSTA COM LIMPEZA DE JSON
 */
window.editarIngressoRobusto = async function(ingressoId) {
    console.log(`✏️ EDIÇÃO ROBUSTA do ingresso ${ingressoId}...`);
    
    // Garantir que dados estão carregados
    if (!window.ingressosAtuais || window.ingressosAtuais.length === 0) {
        console.log('🔄 Carregando dados primeiro...');
        await window.recarregarListaRobusta();
    }
    
    // Buscar ingresso
    const ingresso = window.ingressosAtuais.find(i => i.id == ingressoId);
    
    if (!ingresso) {
        console.error(`❌ Ingresso ${ingressoId} não encontrado nos dados carregados`);
        console.log(`📊 Ingressos disponíveis:`, window.ingressosAtuais.map(i => ({id: i.id, titulo: i.titulo})));
        alert('Ingresso não encontrado. Recarregando dados...');
        await window.recarregarListaRobusta();
        return;
    }
    
    console.log(`✅ Ingresso encontrado:`, ingresso);
    
    // Abrir modal apropriado
    if (ingresso.tipo === 'pago') {
        popularModalPagoRobusto(ingresso);
        if (typeof openModal === 'function') {
            openModal('paidTicketModal');
            console.log('✅ Modal pago aberto');
        }
    } else if (ingresso.tipo === 'gratuito') {
        popularModalGratuitoRobusto(ingresso);
        if (typeof openModal === 'function') {
            openModal('freeTicketModal');
            console.log('✅ Modal gratuito aberto');
        }
    } else {
        alert('Edição de combos não implementada');
    }
};

/**
 * POPULAR MODAIS DE FORMA ROBUSTA
 */
function popularModalPagoRobusto(ingresso) {
    console.log(`📝 Populando modal pago robusto...`);
    
    const campos = {
        'paidTicketTitle': ingresso.titulo,
        'paidTicketQuantity': ingresso.quantidade_total,
        'paidTicketPrice': `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
        'paidTicketDescription': ingresso.descricao || '',
        'paidSaleStart': ingresso.inicio_venda || '',
        'paidSaleEnd': ingresso.fim_venda || '',
        'paidMinQuantity': ingresso.limite_min || 1,
        'paidMaxQuantity': ingresso.limite_max || 5,
        'paidTicketLote': ingresso.lote_id || ''
    };
    
    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
            console.log(`✅ ${id} = ${valor}`);
        } else {
            console.error(`❌ Campo ${id} não encontrado`);
        }
    });
    
    // Marcar que está editando
    const modal = document.getElementById('paidTicketModal');
    if (modal) {
        modal.dataset.editingId = ingresso.id;
        console.log(`✅ Modal marcado para edição do ingresso ${ingresso.id}`);
    }
}

function popularModalGratuitoRobusto(ingresso) {
    console.log(`📝 Populando modal gratuito robusto...`);
    
    const campos = {
        'freeTicketTitle': ingresso.titulo,
        'freeTicketQuantity': ingresso.quantidade_total,
        'freeTicketDescription': ingresso.descricao || '',
        'freeSaleStart': ingresso.inicio_venda || '',
        'freeSaleEnd': ingresso.fim_venda || '',
        'freeMinQuantity': ingresso.limite_min || 1,
        'freeMaxQuantity': ingresso.limite_max || 5,
        'freeTicketLote': ingresso.lote_id || ''
    };
    
    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
            console.log(`✅ ${id} = ${valor}`);
        } else {
            console.error(`❌ Campo ${id} não encontrado`);
        }
    });
    
    // Marcar que está editando
    const modal = document.getElementById('freeTicketModal');
    if (modal) {
        modal.dataset.editingId = ingresso.id;
        console.log(`✅ Modal marcado para edição do ingresso ${ingresso.id}`);
    }
}

/**
 * SOBRESCRITA ROBUSTA DAS FUNÇÕES
 */
console.log('🛠️ Aplicando sobrescrita robusta das funções...');

// Sobrescrever funções de operação
window.removeTicket = window.excluirIngressoRobusto;
window.editTicket = window.editarIngressoRobusto;

// Sobrescrever função de recarregamento se ela existir
if (typeof window.recarregarIngressosDoMySQL === 'function') {
    window.recarregarIngressosDoMySQL = window.recarregarListaRobusta;
}

// Aplicar carregamento inicial
setTimeout(() => {
    console.log('🔄 Carregamento inicial robusto...');
    window.recarregarListaRobusta();
}, 3000);

console.log('✅ CORREÇÃO DO JSON MAL FORMADO APLICADA!');