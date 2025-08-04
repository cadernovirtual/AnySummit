/**
 * RENDERIZAÇÃO DE TICKET APÓS UPDATE
 * Foco único: atualizar o item na lista após edição
 */

console.log('🔧 RENDERIZACAO-TICKET-UPDATE.JS carregando...');

/**
 * INTERCEPTAR FUNÇÕES DE UPDATE PARA RENDERIZAR TICKET
 */
function interceptarUpdateParaRenderizacao() {
    console.log('🎯 Interceptando funções de update para renderização...');
    
    // Aguardar um pouco para garantir que outras funções foram carregadas
    setTimeout(() => {
        // Guardar funções originais
        const funcoesOriginais = {};
        
        ['updatePaidTicket', 'updateFreeTicket', 'updateComboTicket'].forEach(nomeFuncao => {
            if (typeof window[nomeFuncao] === 'function') {
                console.log(`🎯 Encontrada função ${nomeFuncao}, interceptando...`);
                funcoesOriginais[nomeFuncao] = window[nomeFuncao];
                
                window[nomeFuncao] = async function(...args) {
                    console.log(`🎯 Interceptando ${nomeFuncao} para renderização`);
                    
                    // Capturar ID do ingresso
                    let ingressoId = null;
                    
                    if (nomeFuncao === 'updatePaidTicket') {
                        ingressoId = document.getElementById('editPaidTicketId')?.value;
                    } else if (nomeFuncao === 'updateFreeTicket') {
                        ingressoId = document.getElementById('editFreeTicketId')?.value;
                    } else if (nomeFuncao === 'updateComboTicket') {
                        ingressoId = document.getElementById('editComboTicketId')?.value;
                    }
                    
                    console.log(`📋 ID capturado: ${ingressoId}`);
                    
                    // Executar função original
                    let resultado;
                    try {
                        resultado = await funcoesOriginais[nomeFuncao].apply(this, args);
                    } catch (error) {
                        resultado = funcoesOriginais[nomeFuncao].apply(this, args);
                    }
                    
                    // Renderizar ticket atualizado
                    if (ingressoId) {
                        setTimeout(() => {
                            console.log(`🎨 Renderizando ticket ${ingressoId} após ${nomeFuncao}`);
                            renderizarTicketAtualizado(ingressoId);
                        }, 1000);
                    }
                    
                    return resultado;
                };
                
                console.log(`✅ ${nomeFuncao} interceptada para renderização`);
            } else {
                console.warn(`⚠️ Função ${nomeFuncao} não encontrada para interceptação`);
            }
        });
    }, 500); // Delay para permitir que outras funções sejam definidas primeiro
}

/**
 * PRE-CARREGAR TODOS OS NOMES DOS INGRESSOS (OTIMIZADO)
 */
async function preCarregarNomesIngressos() {
    // Se já foi carregado recentemente, não recarregar
    if (window.ingressosNomes && window.ingressosNomesCarregadoEm) {
        const tempoDecorrido = Date.now() - window.ingressosNomesCarregadoEm;
        if (tempoDecorrido < 30000) { // 30 segundos
            console.log('✅ Nomes dos ingressos já carregados recentemente');
            return;
        }
    }
    
    console.log('🔄 Pre-carregando todos os nomes dos ingressos...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.warn('⚠️ Evento ID não encontrado para pre-carregamento');
        return;
    }
    
    try {
        // Buscar todos os ingressos do evento
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear resposta da listagem:', parseError);
            return;
        }
        
        if (data.sucesso && data.ingressos) {
            // Criar mapa de nomes
            if (!window.ingressosNomes) window.ingressosNomes = {};
            
            data.ingressos.forEach(ingresso => {
                if (ingresso.id && ingresso.titulo) {
                    window.ingressosNomes[ingresso.id] = ingresso.titulo;
                }
            });
            
            window.ingressosNomesCarregadoEm = Date.now();
            
            console.log(`✅ ${data.ingressos.length} nomes de ingressos pre-carregados`);
            
        } else {
            console.error('❌ Erro ao listar ingressos para pre-carregamento:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no pre-carregamento de nomes:', error);
    }
}

/**
 * BUSCAR NOME REAL DO INGRESSO
 */
async function buscarNomeIngresso(ingressoId) {
    console.log(`🔍 Buscando nome do ingresso ${ingressoId}...`);
    
    // Primeiro, tentar dados globais
    if (window.ingressosNomes && window.ingressosNomes[ingressoId]) {
        console.log(`✅ Nome encontrado nos dados globais: ${window.ingressosNomes[ingressoId]}`);
        return window.ingressosNomes[ingressoId];
    }
    
    // Tentar buscar de dadosAtivos
    if (window.dadosAtivos && window.dadosAtivos.ingressos) {
        const ingresso = window.dadosAtivos.ingressos.find(ing => ing.id == ingressoId);
        if (ingresso && ingresso.titulo) {
            console.log(`✅ Nome encontrado em dadosAtivos: ${ingresso.titulo}`);
            
            // Armazenar para próximas consultas
            if (!window.ingressosNomes) window.ingressosNomes = {};
            window.ingressosNomes[ingressoId] = ingresso.titulo;
            
            return ingresso.titulo;
        }
    }
    
    // Buscar via API como último recurso
    try {
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        
        if (!eventoId) {
            console.warn('⚠️ Evento ID não encontrado');
            return `Ingresso ${ingressoId}`;
        }
        
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear resposta da busca do ingresso:', parseError);
            return `Ingresso ${ingressoId}`;
        }
        
        if (data.sucesso && data.ingresso && data.ingresso.titulo) {
            console.log(`✅ Nome obtido via API: ${data.ingresso.titulo}`);
            
            // Armazenar para próximas consultas
            if (!window.ingressosNomes) window.ingressosNomes = {};
            window.ingressosNomes[ingressoId] = data.ingresso.titulo;
            
            return data.ingresso.titulo;
        } else {
            console.warn(`⚠️ Ingresso ${ingressoId} não encontrado via API`);
            return `Ingresso ${ingressoId}`;
        }
        
    } catch (error) {
        console.error(`❌ Erro ao buscar nome do ingresso ${ingressoId}:`, error);
        return `Ingresso ${ingressoId}`;
    }
}

/**
 * RENDERIZAR TICKET ATUALIZADO COM CARREGAMENTO FORÇADO DE NOMES
 */
async function renderizarTicketAtualizado(ingressoId) {
    console.log(`🎨 Renderizando ticket atualizado: ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem renderização');
        return;
    }
    
    // FORÇAR carregamento de nomes primeiro se não estiverem disponíveis
    if (!window.ingressosNomes || Object.keys(window.ingressosNomes).length === 0) {
        console.log('🔄 Forçando carregamento de nomes antes da renderização...');
        await preCarregarNomesIngressos();
    }
    
    try {
        // Buscar dados atualizados do ingresso
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Dados do ingresso:', textResponse.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
            return;
        }
        
        if (data.sucesso && data.ingresso) {
            console.log('✅ Dados obtidos:', data.ingresso.titulo);
            
            // Encontrar elemento na lista
            const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
            
            if (elemento) {
                console.log(`🎨 Elemento encontrado, atualizando...`);
                
                // Criar novo elemento
                const novoElemento = criarElementoTicket(data.ingresso);
                
                // Substituir elemento
                elemento.parentNode.replaceChild(novoElemento, elemento);
                
                console.log(`✅ Ticket ${ingressoId} renderizado com sucesso`);
                
            } else {
                console.warn(`⚠️ Elemento não encontrado: ${ingressoId}`);
                // Tentar recarregar lista inteira como fallback
                if (typeof window.recarregarListaAPILimpa === 'function') {
                    await window.recarregarListaAPILimpa();
                }
            }
            
        } else {
            console.error('❌ Erro ao buscar ingresso:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na renderização:', error);
    }
}

/**
 * CRIAR ELEMENTO DE TICKET ATUALIZADO
 */
function criarElementoTicket(ingresso) {
    console.log(`🎨 Criando elemento para: ${ingresso.titulo} (${ingresso.tipo})`);
    
    const elemento = document.createElement('div');
    elemento.className = 'ticket-item';
    elemento.dataset.ticketId = ingresso.id;
    elemento.setAttribute('data-ticket-id', ingresso.id);
    elemento.setAttribute('data-lote-id', ingresso.lote_id || '');
    
    let badgeHtml = '';
    let precoTexto = '';
    let valorReceberReal = 0;
    let detalhesHtml = '';
    
    // Configurar por tipo
    if (ingresso.tipo === 'gratuito') {
        badgeHtml = '<span class="ticket-type-badge gratuito" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">GRATUITO</span>';
        precoTexto = 'Gratuito';
        valorReceberReal = 0;
        
        // Detalhes simples para gratuito
        detalhesHtml = `
            <div class="ticket-details" style="margin-top: 10px;">
                ${(ingresso.quantidade_total > 0) ? `<div style="margin-bottom: 6px;"><strong>Quantidade Limite a Venda:</strong> ${ingresso.quantidade_total}</div>` : ''}
                <div style="margin-bottom: 6px;"><strong>Preço:</strong> ${precoTexto}</div>
                <div style="margin-bottom: 6px;"><strong>Você recebe:</strong> <span style="color: #28a745; font-weight: bold;">R$ ${valorReceberReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
            </div>
        `;
        
    } else if (ingresso.tipo === 'combo') {
        badgeHtml = '<span class="ticket-type-badge combo" style="background: #ff6b35; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">COMBO</span>';
        const precoReal = parseFloat(ingresso.preco) || 0;
        precoTexto = `R$ ${precoReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        valorReceberReal = parseFloat(ingresso.valor_receber) || precoReal;
        
        // Processar itens do combo - VERSÃO SÍNCRONA COM NOMES REAIS
        let itensComboHtml = '';
        if (ingresso.conteudo_combo) {
            try {
                const itensCombo = JSON.parse(ingresso.conteudo_combo);
                if (itensCombo.length > 0) {
                    console.log('🔍 Processando itens do combo:', itensCombo);
                    
                    // Gerar HTML com nomes reais IMEDIATAMENTE
                    const itensTexto = itensCombo.map(item => {
                        let nomeIngresso = `Ingresso ${item.ingresso_id}`; // Fallback padrão
                        
                        // 1. Tentar window.ingressosNomes (cache)
                        if (window.ingressosNomes && window.ingressosNomes[item.ingresso_id]) {
                            nomeIngresso = window.ingressosNomes[item.ingresso_id];
                            console.log(`✅ Nome encontrado no cache: ${nomeIngresso}`);
                        }
                        // 2. Tentar window.dadosAtivos.ingressos
                        else if (window.dadosAtivos && window.dadosAtivos.ingressos) {
                            const ingressoEncontrado = window.dadosAtivos.ingressos.find(ing => ing.id == item.ingresso_id);
                            if (ingressoEncontrado && ingressoEncontrado.titulo) {
                                nomeIngresso = ingressoEncontrado.titulo;
                                
                                // Salvar no cache para próximas consultas
                                if (!window.ingressosNomes) window.ingressosNomes = {};
                                window.ingressosNomes[item.ingresso_id] = nomeIngresso;
                                
                                console.log(`✅ Nome encontrado em dadosAtivos: ${nomeIngresso}`);
                            }
                        }
                        // 3. Tentar buscar no DOM da lista atual
                        else {
                            const elementoExistente = document.querySelector(`[data-ticket-id="${item.ingresso_id}"] .ticket-name`);
                            if (elementoExistente) {
                                // Remover badge do texto
                                const nomeCompleto = elementoExistente.textContent || elementoExistente.innerText || '';
                                nomeIngresso = nomeCompleto.replace(/\s*(PAGO|GRATUITO|COMBO)\s*$/i, '').trim();
                                
                                if (nomeIngresso && nomeIngresso !== `Ingresso ${item.ingresso_id}`) {
                                    // Salvar no cache
                                    if (!window.ingressosNomes) window.ingressosNomes = {};
                                    window.ingressosNomes[item.ingresso_id] = nomeIngresso;
                                    
                                    console.log(`✅ Nome extraído do DOM: ${nomeIngresso}`);
                                }
                            }
                        }
                        
                        return `<li><strong>${nomeIngresso}</strong> × ${item.quantidade}</li>`;
                    }).join('');
                    
                    itensComboHtml = `
                        <div class="combo-items-display">
                            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #555;">Itens inclusos:</h4>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                                ${itensTexto}
                            </ul>
                        </div>
                    `;
                    
                    console.log('📋 HTML dos itens do combo gerado:', itensTexto);
                }
            } catch (e) {
                console.error('❌ Erro ao parsear combo:', e);
            }
        }
        
        // Detalhes em 2 colunas para combo
        detalhesHtml = `
            <div class="ticket-details" style="margin-top: 10px; display: flex; gap: 20px;">
                <div class="info-column" style="flex: 1;">
                    <div style="margin-bottom: 6px;"><strong>Preço:</strong> ${precoTexto}</div>
                    <div style="margin-bottom: 6px;"><strong>Você recebe:</strong> <span style="color: #28a745; font-weight: bold;">R$ ${valorReceberReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
                </div>
                <div class="combo-items-column" style="flex: 1;">
                    ${itensComboHtml}
                </div>
            </div>
        `;
        
    } else { // pago
        badgeHtml = '<span class="ticket-type-badge pago" style="background: #007bff; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">PAGO</span>';
        const precoReal = parseFloat(ingresso.preco) || 0;
        precoTexto = `R$ ${precoReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        valorReceberReal = parseFloat(ingresso.valor_receber) || precoReal;
        
        // Detalhes simples para pago
        detalhesHtml = `
            <div class="ticket-details" style="margin-top: 10px;">
                ${(ingresso.quantidade_total > 0) ? `<div style="margin-bottom: 6px;"><strong>Quantidade Limite a Venda:</strong> ${ingresso.quantidade_total}</div>` : ''}
                <div style="margin-bottom: 6px;"><strong>Preço:</strong> ${precoTexto}</div>
                <div style="margin-bottom: 6px;"><strong>Você recebe:</strong> <span style="color: #28a745; font-weight: bold;">R$ ${valorReceberReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
            </div>
        `;
    }
    
    // Criar HTML do elemento
    elemento.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">
                <span class="ticket-name">${ingresso.titulo}${badgeHtml}</span>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onclick="editTicket(${ingresso.id})" title="Editar">✏️</button>
                <button class="btn-icon" onclick="removeTicket(${ingresso.id})" title="Remover">🗑️</button>
            </div>
        </div>
        ${detalhesHtml}
    `;
    
    return elemento;
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando renderização de ticket após update...');
    
    // Aguardar mais tempo para garantir que todas as correções sejam carregadas
    setTimeout(() => {
        interceptarUpdateParaRenderizacao();
        
        // Pre-carregar nomes dos ingressos para combos
        preCarregarNomesIngressos();
    }, 3000); // Aumentado para 3 segundos
    
    console.log('✅ Sistema de renderização inicializado');
}

// Funções globais para uso manual
window.renderizarTicketAtualizado = renderizarTicketAtualizado;
window.preCarregarNomesIngressos = preCarregarNomesIngressos;

// Função para debug da interceptação
window.debugInterceptacao = function() {
    console.log('🔍 DEBUG da interceptação:');
    
    ['updatePaidTicket', 'updateFreeTicket', 'updateComboTicket'].forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            console.log(`✅ ${nomeFuncao}: disponível`);
        } else {
            console.log(`❌ ${nomeFuncao}: NÃO disponível`);
        }
    });
    
    if (typeof window.renderizarTicketAtualizado === 'function') {
        console.log('✅ renderizarTicketAtualizado: disponível');
    } else {
        console.log('❌ renderizarTicketAtualizado: NÃO disponível');
    }
};

// Função para debug específico dos nomes dos combos
window.debugNomesCombos = function() {
    console.log('🔍 DEBUG dos nomes dos combos:');
    
    // Mostrar cache atual
    if (window.ingressosNomes) {
        console.log('📋 Cache de nomes atual:', window.ingressosNomes);
    } else {
        console.log('❌ Cache de nomes não existe');
    }
    
    // Mostrar dadosAtivos
    if (window.dadosAtivos && window.dadosAtivos.ingressos) {
        console.log('📋 Ingressos em dadosAtivos:', window.dadosAtivos.ingressos.map(ing => ({
            id: ing.id,
            titulo: ing.titulo,
            tipo: ing.tipo
        })));
    } else {
        console.log('❌ dadosAtivos.ingressos não existe');
    }
    
    // Verificar elementos no DOM
    const ticketElements = document.querySelectorAll('[data-ticket-id] .ticket-name');
    console.log('📋 Elementos de tickets no DOM:', Array.from(ticketElements).map(el => ({
        id: el.closest('[data-ticket-id]')?.dataset.ticketId,
        nome: el.textContent.replace(/\s*(PAGO|GRATUITO|COMBO)\s*$/i, '').trim()
    })));
};

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ RENDERIZACAO-TICKET-UPDATE.JS carregado!');
console.log('🎯 Recursos implementados:');
console.log('  1. ✅ Interceptação de updatePaidTicket, updateFreeTicket, updateComboTicket');
console.log('  2. ✅ Renderização automática do ticket-item após update');
console.log('  3. ✅ Nomes reais dos ingressos em combos (não IDs)');
console.log('  4. ✅ Pre-carregamento otimizado de nomes');
console.log('  5. ✅ Layout em 2 colunas para combos');
console.log('💡 Funções manuais disponíveis:');
console.log('  - window.renderizarTicketAtualizado(id) - renderizar ticket específico');
console.log('  - window.preCarregarNomesIngressos() - pre-carregar nomes');
console.log('  - window.debugInterceptacao() - debug das interceptações');
