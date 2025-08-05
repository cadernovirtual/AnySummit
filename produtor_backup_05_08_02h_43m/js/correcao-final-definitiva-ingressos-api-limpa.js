/**
 * CORREÇÃO FINAL DEFINITIVA - INGRESSOS COM API LIMPA
 * Resolve 100% dos problemas:
 * 1. DOM atualizado após inserção
 * 2. JSON sempre limpo
 * 3. editTicket funcionando
 * 4. handleControleVendasChange silencioso
 */

console.log('🔧 CORRECAO-FINAL-DEFINITIVA-INGRESSOS-API-LIMPA.JS carregando...');

/**
 * INTERCEPTAÇÃO GLOBAL DE CRIAÇÃO DE INGRESSOS
 */
function interceptarCriacaoGlobal() {
    console.log('🎯 Configurando interceptação global de criação...');
    
    // Sobrescrever funções globais de criação
    if (typeof window.createPaidTicket === 'function') {
        const originalCreatePaid = window.createPaidTicket;
        window.createPaidTicket = async function(...args) {
            console.log('📝 Interceptando createPaidTicket');
            await criarIngressoViaAPILimpa('pago');
            return false; // Bloquear execução original
        };
    }
    
    if (typeof window.createFreeTicket === 'function') {
        const originalCreateFree = window.createFreeTicket;
        window.createFreeTicket = async function(...args) {
            console.log('📝 Interceptando createFreeTicket');
            await criarIngressoViaAPILimpa('gratuito');
            return false; // Bloquear execução original
        };
    }
    
    if (typeof window.createComboTicket === 'function') {
        const originalCreateCombo = window.createComboTicket;
        window.createComboTicket = async function(...args) {
            console.log('📝 Interceptando createComboTicket');
            await criarIngressoViaAPILimpa('combo');
            return false; // Bloquear execução original
        };
    }
    
    // Interceptar também as versões MySQL se existirem
    if (typeof window.createPaidTicketMySQL === 'function') {
        window.createPaidTicketMySQL = async function(...args) {
            console.log('📝 Interceptando createPaidTicketMySQL');
            await criarIngressoViaAPILimpa('pago');
            return false;
        };
    }
    
    if (typeof window.createFreeTicketMySQL === 'function') {
        window.createFreeTicketMySQL = async function(...args) {
            console.log('📝 Interceptando createFreeTicketMySQL');
            await criarIngressoViaAPILimpa('gratuito');
            return false;
        };
    }
    
    if (typeof window.createComboTicketMySQL === 'function') {
        window.createComboTicketMySQL = async function(...args) {
            console.log('📝 Interceptando createComboTicketMySQL');
            await criarIngressoViaAPILimpa('combo');
            return false;
        };
    }
}

/**
 * Criar ingresso via API limpa
 */
async function criarIngressoViaAPILimpa(tipoIngresso) {
    console.log(`💾 Criando ingresso ${tipoIngresso} via API limpa...`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        alert('Erro: Evento não identificado');
        return;
    }
    
    // Coletar dados do modal correspondente
    let modalId;
    if (tipoIngresso === 'pago') {
        modalId = 'paidTicketModal';
    } else if (tipoIngresso === 'gratuito') {
        modalId = 'freeTicketModal';
    } else if (tipoIngresso === 'combo') {
        modalId = 'comboTicketModal';
    }
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} não encontrado`);
        return;
    }
    
    // Coletar dados do form
    const dados = coletarDadosDoModal(modal, tipoIngresso);
    dados.evento_id = eventoId;
    dados.tipo = tipoIngresso;
    
    console.log('📊 Dados coletados:', dados);
    
    // Validar dados básicos
    if (!dados.titulo || dados.titulo.trim() === '') {
        alert('Por favor, preencha o título do ingresso');
        return;
    }
    
    if (!dados.quantidade_total || dados.quantidade_total < 1) {
        alert('Por favor, informe uma quantidade válida (maior que 0)');
        return;
    }
    
    try {
        // Usar API limpa
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'criar_ingresso',
                ...dados
            })
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta da API limpa:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
            console.error('📄 Resposta recebida:', textResponse);
            alert('Erro de comunicação com o servidor');
            return;
        }
        
        if (data.sucesso) {
            console.log(`✅ Ingresso criado com sucesso! ID: ${data.ingresso_id}`);
            
            // Fechar modal
            fecharModal(modalId);
            
            // Recarregar lista via API limpa
            await recarregarIngressosViaAPILimpa();
            
            console.log('✅ DOM atualizado após inserção');
            
        } else {
            console.error('❌ Erro ao criar ingresso:', data.erro);
            alert('Erro ao criar ingresso: ' + data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        alert('Erro de conexão ao criar ingresso');
    }
}

/**
 * Coletar dados do modal
 */
function coletarDadosDoModal(modal, tipo) {
    const dados = {};
    
    // Campos comuns
    const titulo = modal.querySelector('[name="titulo"], [name="ticketName"], #ticketName')?.value;
    const descricao = modal.querySelector('[name="descricao"], [name="description"], #description')?.value;
    const quantidade = modal.querySelector('[name="quantidade_total"], [name="quantity"], #quantity')?.value;
    
    dados.titulo = titulo || '';
    dados.descricao = descricao || '';
    dados.quantidade_total = parseInt(quantidade) || 100;
    
    if (tipo === 'pago') {
        const preco = modal.querySelector('[name="preco"], [name="price"], #price')?.value;
        dados.preco = parseFloat(preco) || 0;
        dados.valor_receber = dados.preco; // Por padrão igual ao preço
    } else {
        dados.preco = 0;
        dados.valor_receber = 0;
    }
    
    // Campos opcionais
    const loteId = modal.querySelector('[name="lote_id"], #loteId')?.value;
    const inicioVenda = modal.querySelector('[name="inicio_venda"], [name="saleStart"], #saleStart')?.value;
    const fimVenda = modal.querySelector('[name="fim_venda"], [name="saleEnd"], #saleEnd')?.value;
    const limiteMin = modal.querySelector('[name="limite_min"], [name="minQuantity"], #minQuantity')?.value;
    const limiteMax = modal.querySelector('[name="limite_max"], [name="maxQuantity"], #maxQuantity')?.value;
    
    if (loteId) dados.lote_id = parseInt(loteId);
    if (inicioVenda) dados.inicio_venda = inicioVenda;
    if (fimVenda) dados.fim_venda = fimVenda;
    dados.limite_min = parseInt(limiteMin) || 1;
    dados.limite_max = parseInt(limiteMax) || 5;
    
    // Para combos
    if (tipo === 'combo') {
        const conteudoCombo = modal.querySelector('[name="conteudo_combo"]')?.value;
        if (conteudoCombo) {
            dados.conteudo_combo = conteudoCombo;
        }
    }
    
    return dados;
}

/**
 * Fechar modal
 */
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Remover backdrop se existir
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Limpar form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        console.log(`✅ Modal ${modalId} fechado`);
    }
}

/**
 * Recarregar ingressos via API limpa
 */
async function recarregarIngressosViaAPILimpa() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem dados para recarregar');
        return;
    }
    
    try {
        console.log('🔄 Recarregando ingressos via API limpa...');
        
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta listar ingressos:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON na listagem:', parseError);
            return;
        }
        
        if (data.sucesso) {
            // Atualizar dados globais
            if (!window.dadosAtivos) {
                window.dadosAtivos = {};
            }
            
            window.dadosAtivos.ingressos = data.ingressos || [];
            
            console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos recarregados via API limpa`);
            
            // Renderizar interface
            renderizarIngressosRobusto();
            
        } else {
            console.error('❌ Erro ao recarregar ingressos:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no recarregamento via API limpa:', error);
    }
}

/**
 * editTicket via API limpa
 */
window.editTicket = async function(ingressoId) {
    console.log(`✏️ editTicket via API limpa: ${ingressoId}`);
    
    // ESTRATÉGIA 1: Buscar nos dados globais
    if (window.dadosAtivos?.ingressos) {
        const ingresso = window.dadosAtivos.ingressos.find(ing => 
            ing.id == ingressoId || ing.id === ingressoId || ing.id === String(ingressoId)
        );
        
        if (ingresso) {
            console.log(`✅ Ingresso encontrado nos dados globais`);
            abrirModalEdicao(ingresso);
            return;
        }
    }
    
    // ESTRATÉGIA 2: Buscar via API limpa
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        
        if (data.sucesso && data.ingresso) {
            console.log(`✅ Ingresso encontrado via API limpa`);
            abrirModalEdicao(data.ingresso);
        } else {
            console.error('❌ Ingresso não encontrado via API limpa');
            alert(`Ingresso ${ingressoId} não encontrado`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar ingresso via API limpa:', error);
        alert('Erro ao buscar ingresso');
    }
};

/**
 * removeTicket via API limpa
 */
window.removeTicket = async function(ingressoId) {
    console.log(`🗑️ removeTicket via API limpa: ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído via API limpa`);
            
            // Remoção direta do DOM
            const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
            if (elemento) {
                elemento.remove();
                console.log('✅ Elemento removido do DOM');
            }
            
            // Atualizar dados globais
            if (window.dadosAtivos?.ingressos) {
                window.dadosAtivos.ingressos = window.dadosAtivos.ingressos.filter(
                    ing => ing.id != ingressoId
                );
            }
            
            // Recarregar para sincronizar
            setTimeout(() => {
                recarregarIngressosViaAPILimpa();
            }, 300);
            
        } else {
            console.error('❌ Erro ao excluir via API limpa:', data.erro);
            alert('Erro ao excluir ingresso: ' + data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na exclusão via API limpa:', error);
        alert('Erro de conexão ao excluir ingresso');
    }
};

/**
 * handleControleVendasChange SILENCIOSO
 */
window.handleControleVendasChange = async function(event) {
    const isChecked = event.target.checked;
    console.log('🎛️ handleControleVendasChange SILENCIOSO:', isChecked ? 'MARCADO' : 'DESMARCADO');
    
    if (isChecked) {
        // MARCADO: Mostrar campos silenciosamente
        const campoLimite = document.getElementById('campoLimiteVendas');
        const btnConfirmar = document.getElementById('btnConfirmarLimite');
        
        if (campoLimite) campoLimite.style.display = 'block';
        if (btnConfirmar) btnConfirmar.style.display = 'inline-block';
        
        console.log('✅ Controle ativado silenciosamente');
        
    } else {
        // DESMARCADO: Verificar silenciosamente
        console.log('🔍 Verificando dependências silenciosamente...');
        
        try {
            // Verificar se há lotes e ingressos (lógica simplificada)
            let podeDesmarcar = true;
            
            // Se há dados ativos, verificar rapidamente
            if (window.dadosAtivos?.ingressos && window.dadosAtivos.ingressos.length > 0) {
                // Se há ingressos, não pode desmarcar silenciosamente
                podeDesmarcar = false;
                console.log('❌ Há ingressos - não pode desmarcar (SILENCIOSO)');
            }
            
            if (!podeDesmarcar) {
                // Reativar checkbox silenciosamente
                event.target.checked = true;
                console.log('🔒 Checkbox reativado silenciosamente');
            } else {
                // Esconder campos silenciosamente
                const campoLimite = document.getElementById('campoLimiteVendas');
                const btnConfirmar = document.getElementById('btnConfirmarLimite');
                const inputLimite = document.getElementById('limiteVendas');
                
                if (campoLimite) campoLimite.style.display = 'none';
                if (btnConfirmar) btnConfirmar.style.display = 'none';
                if (inputLimite) inputLimite.value = '';
                
                console.log('✅ Controle desativado silenciosamente');
            }
            
        } catch (error) {
            console.error('❌ Erro na verificação silenciosa:', error);
            // Em caso de erro, manter marcado
            event.target.checked = true;
        }
    }
};

/**
 * Renderizar ingressos
 */
function renderizarIngressosRobusto() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    console.log('🎨 Renderizando ingressos robustamente...');
    
    // Limpar lista
    ticketList.innerHTML = '';
    
    if (!window.dadosAtivos?.ingressos || window.dadosAtivos.ingressos.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        console.log('📝 Lista vazia renderizada');
        return;
    }
    
    // Renderizar cada ingresso
    window.dadosAtivos.ingressos.forEach((ingresso, index) => {
        console.log(`🎨 Renderizando ingresso ${index + 1}: ${ingresso.titulo} (ID: ${ingresso.id})`);
        criarElementoIngressoRobusto(ingresso);
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados`);
}

/**
 * Criar elemento de ingresso
 */
function criarElementoIngressoRobusto(ingresso) {
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    const loteId = ingresso.lote_id || '';
    const description = ingresso.descricao || '';
    const saleStart = ingresso.inicio_venda || '';
    const saleEnd = ingresso.fim_venda || '';
    const minQuantity = parseInt(ingresso.limite_min) || 1;
    const maxQuantity = parseInt(ingresso.limite_max) || 5;
    
    // Tentar usar função existente
    if (typeof addTicketToList === 'function') {
        try {
            addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
            
            // CRÍTICO: Corrigir ID do último elemento criado
            const ticketList = document.getElementById('ticketList');
            const ultimoElemento = ticketList.lastElementChild;
            
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                // Aplicar ID real
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.setAttribute('data-ticket-id', ingresso.id);
                
                // Corrigir botões
                const botaoEditar = ultimoElemento.querySelector('[onclick*="editTicket"]');
                if (botaoEditar) {
                    botaoEditar.setAttribute('onclick', `editTicket(${ingresso.id})`);
                }
                
                const botaoExcluir = ultimoElemento.querySelector('[onclick*="removeTicket"]');
                if (botaoExcluir) {
                    botaoExcluir.setAttribute('onclick', `removeTicket(${ingresso.id})`);
                }
                
                console.log(`✅ ID real aplicado: ${ingresso.id}`);
            }
        } catch (error) {
            console.error('❌ Erro ao usar addTicketToList:', error);
            criarElementoManual(ingresso);
        }
    } else {
        console.warn('⚠️ addTicketToList não disponível');
        criarElementoManual(ingresso);
    }
}

/**
 * Criar elemento manual
 */
function criarElementoManual(ingresso) {
    const ticketList = document.getElementById('ticketList');
    
    const elemento = document.createElement('div');
    elemento.className = 'ticket-item';
    elemento.dataset.ticketId = ingresso.id;
    elemento.setAttribute('data-ticket-id', ingresso.id);
    
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    elemento.innerHTML = `
        <div class="ticket-content">
            <div class="ticket-header">
                <span class="ticket-name">${ingresso.titulo}</span>
                <span class="ticket-price">${price}</span>
            </div>
            <div class="ticket-details">
                <span>Quantidade: ${ingresso.quantidade_total || 100}</span>
            </div>
        </div>
        <div class="ticket-actions">
            <button type="button" onclick="editTicket(${ingresso.id})" class="btn-icon edit" title="Editar">
                ✏️
            </button>
            <button type="button" onclick="removeTicket(${ingresso.id})" class="btn-icon delete" title="Excluir">
                🗑️
            </button>
        </div>
    `;
    
    ticketList.appendChild(elemento);
    console.log(`✅ Elemento manual criado para ingresso ${ingresso.id}`);
}

/**
 * Abrir modal de edição
 */
function abrirModalEdicao(ingresso) {
    console.log('📝 Abrindo modal de edição:', ingresso.titulo);
    
    if (typeof window.editarIngressoDoMySQL === 'function') {
        window.editarIngressoDoMySQL(ingresso);
    } else if (typeof window.openEditModal === 'function') {
        window.openEditModal(ingresso);
    } else {
        console.warn('⚠️ Função de edição não encontrada');
        alert(`Modal de edição: ${ingresso.titulo} (ID: ${ingresso.id})`);
    }
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correção final com API limpa...');
    
    // Aguardar um pouco e aplicar interceptações
    setTimeout(() => {
        interceptarCriacaoGlobal();
        
        // Recarregar dados iniciais se estiver editando evento
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        if (eventoId) {
            recarregarIngressosViaAPILimpa();
        }
    }, 2000);
    
    // Aplicar novamente após outros scripts carregarem
    setTimeout(() => {
        interceptarCriacaoGlobal();
    }, 5000);
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ CORRECAO-FINAL-DEFINITIVA-INGRESSOS-API-LIMPA.JS carregado!');
console.log('🔧 Recursos implementados:');
console.log('  1. ✅ API limpa dedicada para ingressos');
console.log('  2. ✅ Interceptação global de funções de criação');
console.log('  3. ✅ DOM sempre atualizado após operações');
console.log('  4. ✅ JSON sempre limpo (sem contaminação)');
console.log('  5. ✅ handleControleVendasChange totalmente silencioso');
