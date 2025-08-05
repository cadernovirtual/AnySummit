/**
 * CORREÇÃO FINAL - INGRESSOS E LIMITE DE VENDAS
 * Resolve todos os problemas reportados:
 * 1. removeTicket() sem confirmação + DOM atualizado
 * 2. Inserção de ingresso com DOM atualizado  
 * 3. editTicket() funcionando corretamente
 * 4. handleControleVendasChange() sem popups
 * 5. Parser JSON robusto para evitar erros
 */

console.log('🔧 CORRECAO-FINAL-INGRESSOS.JS carregando...');

/**
 * PROBLEMA 1 e 2: removeTicket sem confirmação + DOM atualizado
 */
window.removeTicket = async function(ingressoId) {
    console.log(`🗑️ removeTicket: Excluindo ingresso ${ingressoId} SEM confirmação`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        // Excluir do banco SEM confirmação
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        // CORREÇÃO: Parser JSON super robusto
        const textResponse = await response.text();
        console.log('📡 Resposta bruta completa:', textResponse);
        
        const data = extrairJSONLimpo(textResponse);
        
        if (!data) {
            console.error('❌ Não foi possível extrair JSON válido da resposta');
            alert('Erro de comunicação com o servidor');
            return;
        }
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído do MySQL`);
            
            // MÉTODO 1: Remoção direta do DOM
            const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
            if (elemento) {
                elemento.remove();
                console.log(`✅ Elemento DOM removido diretamente`);
            }
            
            // MÉTODO 2: Atualizar dados globais
            if (window.dadosAtivos && window.dadosAtivos.ingressos) {
                window.dadosAtivos.ingressos = window.dadosAtivos.ingressos.filter(
                    ing => ing.id != ingressoId
                );
                console.log(`✅ Dados globais atualizados`);
            }
            
            // MÉTODO 3: Recarregar lista com parser robusto
            setTimeout(() => {
                recarregarListaIngressosRobusta();
            }, 500);
            
            console.log(`✅ DOM atualizado após exclusão`);
            
        } else {
            console.error('❌ Erro ao excluir:', data.erro);
            alert('Erro ao excluir ingresso: ' + data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na exclusão:', error);
        alert('Erro de conexão ao excluir ingresso.');
    }
};

/**
 * PROBLEMA 3: Inserção de ingresso com DOM atualizado
 */
window.adicionarIngressoComAtualizacao = async function(dadosIngresso) {
    console.log('➕ Adicionando ingresso com atualização do DOM:', dadosIngresso);
    
    try {
        // Salvar no banco
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'salvar_ingresso_individual',
                ...dadosIngresso
            })
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        
        if (data && data.sucesso) {
            console.log('✅ Ingresso salvo no banco');
            
            // Recarregar lista para mostrar o novo ingresso
            setTimeout(() => {
                recarregarListaIngressosRobusta();
            }, 300);
            
            return true;
        } else {
            console.error('❌ Erro ao salvar ingresso:', data?.erro);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro ao adicionar ingresso:', error);
        return false;
    }
};

/**
 * PROBLEMA 4: editTicket funcionando corretamente
 */
window.editTicket = async function(ingressoId) {
    console.log(`✏️ editTicket: Editando ingresso ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        // MÉTODO 1: Buscar nos dados globais primeiro
        if (window.dadosAtivos && window.dadosAtivos.ingressos) {
            const ingresso = window.dadosAtivos.ingressos.find(ing => ing.id == ingressoId);
            if (ingresso) {
                console.log(`✅ Ingresso encontrado nos dados globais:`, ingresso);
                abrirModalEdicao(ingresso);
                return;
            }
        }
        
        // MÉTODO 2: Buscar no banco
        console.log('🔍 Buscando ingresso no banco...');
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        
        if (data && data.sucesso && data.ingresso) {
            console.log(`✅ Ingresso encontrado no banco:`, data.ingresso);
            abrirModalEdicao(data.ingresso);
        } else {
            console.error('❌ Ingresso não encontrado:', data?.erro);
            // Tentar recarregar dados e buscar novamente
            await recarregarListaIngressosRobusta();
            setTimeout(() => {
                window.editTicket(ingressoId);
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar ingresso:', error);
        alert('Erro de conexão ao buscar ingresso.');
    }
};

/**
 * PROBLEMA 5: handleControleVendasChange sem popups
 */
window.handleControleVendasChange = async function(event) {
    const isChecked = event.target.checked;
    console.log('🎛️ handleControleVendasChange:', isChecked ? 'MARCADO' : 'DESMARCADO');
    
    if (isChecked) {
        // MARCADO: Mostrar campos e atualizar banco SEM POPUP
        mostrarCamposLimitacao();
        await atualizarControleBanco(1);
        console.log('✅ Controle ativado sem popup');
        
    } else {
        // DESMARCADO: Verificar dependências SEM POPUPS EXCESSIVOS
        console.log('🔍 Verificando se pode desmarcar...');
        
        const podeDemarcar = await verificarSePodesDesmarcarSilencioso(event.target);
        
        if (!podeDemarcar) {
            // Reativar checkbox se não pode desmarcar
            event.target.checked = true;
            console.log('❌ Checkbox reativado - não pode desmarcar');
        } else {
            console.log('✅ Checkbox desmarcado com sucesso');
        }
    }
};

/**
 * Verificar se pode desmarcar SEM popups excessivos
 */
async function verificarSePodesDesmarcarSilencioso(checkbox) {
    try {
        // Carregar lotes
        let lotes = [];
        if (typeof window.carregarLotesDoBanco === 'function') {
            lotes = await window.carregarLotesDoBanco();
        }
        
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        
        if (lotesPorQuantidade.length === 0) {
            console.log('✅ Nenhum lote por quantidade - pode desmarcar');
            esconderCamposLimitacao();
            await atualizarControleBanco(0);
            return true;
        }
        
        // Verificar se há ingressos
        let temIngressos = false;
        for (const lote of lotesPorQuantidade) {
            const ingressos = await verificarIngressosNoLote(lote.id);
            if (ingressos) {
                temIngressos = true;
                break;
            }
        }
        
        if (temIngressos) {
            // HÁ INGRESSOS: Apenas UMA mensagem simples
            alert('Para desmarcar essa opção você precisa excluir todos os lotes por quantidade de vendas e seus respectivos ingressos.');
            return false;
        }
        
        // SÓ LOTES SEM INGRESSOS: Excluir automaticamente SEM perguntar
        console.log('🗑️ Excluindo lotes sem ingressos automaticamente...');
        
        for (const lote of lotesPorQuantidade) {
            await excluirLote(lote.id);
        }
        
        await renomearLotesSequencial();
        
        // Atualizar interface
        if (typeof window.renderizarLotesUnificado === 'function') {
            setTimeout(() => window.renderizarLotesUnificado(), 500);
        }
        
        esconderCamposLimitacao();
        await atualizarControleBanco(0);
        
        console.log('✅ Lotes excluídos automaticamente - checkbox desmarcado SEM popup');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao verificar dependências:', error);
        return false;
    }
}

/**
 * CORE: Parser JSON super robusto
 */
function extrairJSONLimpo(textResponse) {
    console.log('🔍 Analisando resposta para extrair JSON...');
    
    // Tentar parser direto primeiro
    try {
        const data = JSON.parse(textResponse);
        console.log('✅ JSON parseado diretamente');
        return data;
    } catch (parseError) {
        console.log('⚠️ Parser direto falhou, tentando extrair...');
    }
    
    // Método 1: Procurar por linha que começa e termina com {}
    const lines = textResponse.split('\\n');
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('{') && line.endsWith('}')) {
            try {
                const data = JSON.parse(line);
                console.log('✅ JSON extraído da linha:', line);
                return data;
            } catch (e) {
                continue;
            }
        }
    }
    
    // Método 2: Procurar primeiro { até último }
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = textResponse.substring(firstBrace, lastBrace + 1);
        try {
            const data = JSON.parse(jsonStr);
            console.log('✅ JSON extraído por posição:', jsonStr);
            return data;
        } catch (e) {
            console.log('❌ Falha ao extrair por posição');
        }
    }
    
    // Método 3: Procurar padrões específicos
    const patterns = [
        /\{"sucesso":true[^}]*\}/,
        /\{"sucesso":false[^}]*\}/,
        /\{"erro":"[^"]*"\}/
    ];
    
    for (const pattern of patterns) {
        const match = textResponse.match(pattern);
        if (match) {
            try {
                const data = JSON.parse(match[0]);
                console.log('✅ JSON extraído por padrão:', match[0]);
                return data;
            } catch (e) {
                continue;
            }
        }
    }
    
    console.error('❌ Não foi possível extrair JSON válido da resposta');
    console.error('📄 Resposta completa:', textResponse);
    return null;
}

/**
 * Recarregar lista de ingressos com parser robusto
 */
async function recarregarListaIngressosRobusta() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - não há lista para recarregar');
        return;
    }
    
    try {
        console.log('🔄 Recarregando lista de ingressos...');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        
        if (data && data.sucesso) {
            // Atualizar dados globais
            if (!window.dadosAtivos) {
                window.dadosAtivos = {};
            }
            
            window.dadosAtivos.ingressos = data.ingressos || [];
            
            console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos recarregados`);
            
            // Renderizar na interface
            renderizarIngressosRobusto();
            
        } else {
            console.error('❌ Erro ao recarregar:', data?.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no recarregamento:', error);
    }
}

/**
 * Renderizar ingressos de forma robusta
 */
function renderizarIngressosRobusto() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    console.log('🎨 Renderizando ingressos...');
    
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
        console.log(`🎨 Renderizando ingresso ${index + 1}: ${ingresso.titulo}`);
        criarElementoIngressoRobusto(ingresso);
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados`);
}

/**
 * Criar elemento de ingresso de forma robusta
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
    
    // Usar função existente se disponível
    if (typeof addTicketToList === 'function') {
        try {
            addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
            
            // Corrigir ID do elemento criado
            const ticketList = document.getElementById('ticketList');
            const ultimoElemento = ticketList.lastElementChild;
            
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.setAttribute('data-ticket-id', ingresso.id);
                console.log(`✅ ID correto aplicado: ${ingresso.id}`);
            }
        } catch (error) {
            console.error('❌ Erro ao usar addTicketToList:', error);
            // Criar elemento manualmente como fallback
            criarElementoManual(ingresso);
        }
    } else {
        console.warn('⚠️ addTicketToList não disponível - criando manualmente');
        criarElementoManual(ingresso);
    }
}

/**
 * Criar elemento manual como fallback
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
    console.log('📝 Abrindo modal de edição para:', ingresso.titulo);
    
    // Tentar usar função existente
    if (typeof window.editarIngressoDoMySQL === 'function') {
        window.editarIngressoDoMySQL(ingresso);
    } else if (typeof window.openEditModal === 'function') {
        window.openEditModal(ingresso);
    } else {
        console.warn('⚠️ Função de edição não encontrada - implementando fallback');
        // Implementar modal básico como fallback
        alert(`Editar ingresso: ${ingresso.titulo} (ID: ${ingresso.id})`);
    }
}

/**
 * Funções auxiliares reutilizadas
 */
function mostrarCamposLimitacao() {
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    
    if (campoLimite) campoLimite.style.display = 'block';
    if (btnConfirmar) btnConfirmar.style.display = 'inline-block';
}

function esconderCamposLimitacao() {
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    const inputLimite = document.getElementById('limiteVendas');
    
    if (campoLimite) campoLimite.style.display = 'none';
    if (btnConfirmar) btnConfirmar.style.display = 'none';
    if (inputLimite) inputLimite.value = '';
}

async function verificarIngressosNoLote(loteId) {
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=verificar_ingressos_lote&lote_id=${loteId}`
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        return data && data.sucesso && data.tem_ingressos;
        
    } catch (error) {
        console.error('❌ Erro ao verificar ingressos:', error);
        return false;
    }
}

async function excluirLote(loteId) {
    const response = await fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=excluir_lote_especifico&lote_id=${loteId}`
    });
    
    const textResponse = await response.text();
    const data = extrairJSONLimpo(textResponse);
    if (!data || !data.sucesso) {
        throw new Error(data?.erro || 'Erro ao excluir lote');
    }
}

async function renomearLotesSequencial() {
    const response = await fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=renomear_lotes_sequencial`
    });
    
    const textResponse = await response.text();
    const data = extrairJSONLimpo(textResponse);
    if (!data || !data.sucesso) {
        throw new Error(data?.erro || 'Erro ao renomear lotes');
    }
}

async function atualizarControleBanco(valor) {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('ℹ️ Modo novo evento - sem atualização de banco');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=salvar_controle_limite&evento_id=${eventoId}&controlar_limite_vendas=${valor}`
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        if (data && data.sucesso) {
            console.log(`✅ Controle atualizado no banco: ${valor}`);
        } else {
            console.error('❌ Erro ao atualizar banco:', data?.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
    }
}

/**
 * Sobrescrever funções conflitantes
 */
function aplicarSobrescritasRobustas() {
    console.log('🔄 Aplicando sobrescritas robustas...');
    
    // Sobrescrever funções problemáticas
    if (typeof window.excluirIngressoComDebug === 'function') {
        window.excluirIngressoComDebug = window.removeTicket;
        console.log('✅ excluirIngressoComDebug sobrescrita');
    }
    
    if (typeof window.editarIngressoComDebug === 'function') {
        window.editarIngressoComDebug = window.editTicket;
        console.log('✅ editarIngressoComDebug sobrescrita');
    }
    
    if (typeof window.recarregarIngressosComDebug === 'function') {
        window.recarregarIngressosComDebug = recarregarListaIngressosRobusta;
        console.log('✅ recarregarIngressosComDebug sobrescrita');
    }
    
    // Interceptar eventos de inserção
    const originalAddTicket = window.addTicketToList;
    if (originalAddTicket) {
        window.addTicketToList = function(...args) {
            const result = originalAddTicket.apply(this, args);
            // Após inserir, recarregar lista
            setTimeout(() => {
                if (window.location.search.includes('evento_id=')) {
                    recarregarListaIngressosRobusta();
                }
            }, 1000);
            return result;
        };
        console.log('✅ addTicketToList interceptada para recarregar DOM');
    }
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correção final de ingressos...');
    
    aplicarSobrescritasRobustas();
    
    // Garantir que funções estejam sempre disponíveis
    setTimeout(() => {
        aplicarSobrescritasRobustas();
    }, 2000);
    
    setTimeout(() => {
        aplicarSobrescritasRobustas();
    }, 5000);
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ CORRECAO-FINAL-INGRESSOS.JS carregado!');
console.log('🔧 Correções implementadas:');
console.log('  1. ✅ removeTicket() sem confirmação + DOM atualizado');
console.log('  2. ✅ Inserção de ingresso com DOM atualizado');
console.log('  3. ✅ editTicket() funcionando corretamente');
console.log('  4. ✅ handleControleVendasChange() sem popups');
console.log('  5. ✅ Parser JSON super robusto');
