/**
 * CORREÇÕES FINAIS ADICIONAIS - BOTÕES + ATUALIZAÇÃO + LIMPEZA FORÇADA
 * Corrige: habilitação de botões, atualização específica de itens, limpeza forçada de selects
 */

console.log('🔧 COMBO-CORRECOES-FINAIS-ADICIONAIS.JS carregando...');

/**
 * CONTROLAR ESTADO DOS BOTÕES DE COMBO
 */
function controlarBotoesCombo() {
    console.log('🎛️ Controlando estado dos botões de combo...');
    
    // Verificar se existem itens no combo
    const temItens = window.comboItems && window.comboItems.length > 0;
    
    // Botões para controlar
    const botoes = [
        document.querySelector('#comboTicketModal .btn-primary'), // Criar Combo
        document.querySelector('#editComboTicketModal .btn-primary'), // Salvar alterações
        document.querySelector('button[onclick*="createComboTicket"]'),
        document.querySelector('button[onclick*="updateComboTicket"]')
    ];
    
    botoes.forEach(botao => {
        if (botao) {
            if (temItens) {
                botao.disabled = false;
                botao.style.opacity = '1';
                botao.style.cursor = 'pointer';
                botao.title = '';
            } else {
                botao.disabled = true;
                botao.style.opacity = '0.5';
                botao.style.cursor = 'not-allowed';
                botao.title = 'Adicione pelo menos um item ao combo';
            }
        }
    });
    
    console.log(`🎛️ Botões ${temItens ? 'habilitados' : 'desabilitados'} (${window.comboItems?.length || 0} itens)`);
}

/**
 * INTERCEPTAR MUDANÇAS NO comboItems PARA CONTROLAR BOTÕES
 */
function interceptarMudancasComboItems() {
    console.log('🎯 Configurando interceptação de mudanças no comboItems...');
    
    // Interceptar window.comboItems usando Proxy
    let comboItemsOriginal = window.comboItems || [];
    
    window.comboItems = new Proxy(comboItemsOriginal, {
        set(target, property, value) {
            const resultado = Reflect.set(target, property, value);
            
            // Atualizar botões sempre que o array mudar
            setTimeout(() => controlarBotoesCombo(), 100);
            
            return resultado;
        },
        
        deleteProperty(target, property) {
            const resultado = Reflect.deleteProperty(target, property);
            
            // Atualizar botões após remoção
            setTimeout(() => controlarBotoesCombo(), 100);
            
            return resultado;
        }
    });
    
    // Interceptar métodos que modificam o array
    ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(metodo => {
        const metodoOriginal = window.comboItems[metodo];
        
        window.comboItems[metodo] = function(...args) {
            const resultado = metodoOriginal.apply(this, args);
            
            // Atualizar botões após modificação
            setTimeout(() => controlarBotoesCombo(), 100);
            
            return resultado;
        };
    });
    
    console.log('✅ Interceptação de comboItems configurada');
}

/**
 * ATUALIZAR ITEM ESPECÍFICO NA LISTA APÓS EDIÇÃO
 */
async function atualizarItemEspecificoNaLista(ingressoId) {
    console.log(`🔄 Atualizando item específico ${ingressoId} na lista...`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem lista para atualizar');
        return;
    }
    
    try {
        // Buscar dados atualizados do ingresso específico
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta busca item específico:', textResponse.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON do item:', parseError);
            return;
        }
        
        if (data.sucesso && data.ingresso) {
            console.log('✅ Dados atualizados do ingresso obtidos:', data.ingresso);
            
            // Encontrar elemento na lista
            const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
            
            if (elemento) {
                console.log(`🎨 Atualizando elemento na lista: ${ingressoId}`);
                
                // Atualizar dados globais se existirem
                if (window.dadosAtivos?.ingressos) {
                    const index = window.dadosAtivos.ingressos.findIndex(ing => ing.id == ingressoId);
                    if (index !== -1) {
                        window.dadosAtivos.ingressos[index] = data.ingresso;
                        console.log('✅ Dados globais atualizados para o item');
                    }
                }
                
                // Recriar elemento com dados atualizados
                const novoElemento = criarElementoIngressoAtualizado(data.ingresso);
                elemento.parentNode.replaceChild(novoElemento, elemento);
                
                console.log(`✅ Elemento ${ingressoId} atualizado na lista`);
                
            } else {
                console.warn(`⚠️ Elemento ${ingressoId} não encontrado na lista, recarregando tudo`);
                // Fallback: recarregar lista inteira
                await atualizarListaAposEdicao();
            }
            
        } else {
            console.error('❌ Erro ao buscar item específico:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar item específico:', error);
        // Fallback: recarregar lista inteira
        await atualizarListaAposEdicao();
    }
}

/**
 * CRIAR ELEMENTO ATUALIZADO DE INGRESSO
 */
function criarElementoIngressoAtualizado(ingresso) {
    console.log(`🎨 Criando elemento atualizado para: ${ingresso.titulo}`);
    
    const elemento = document.createElement('div');
    elemento.className = 'ticket-item';
    elemento.dataset.ticketId = ingresso.id;
    elemento.setAttribute('data-ticket-id', ingresso.id);
    elemento.setAttribute('data-lote-id', ingresso.lote_id || '');
    
    let badgeHtml = '';
    let precoTexto = '';
    let valorReceberReal = 0;
    
    if (ingresso.tipo === 'gratuito') {
        badgeHtml = '<span class="ticket-type-badge gratuito" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">GRATUITO</span>';
        precoTexto = 'Gratuito';
        valorReceberReal = 0;
    } else if (ingresso.tipo === 'combo') {
        badgeHtml = '<span class="ticket-type-badge combo" style="background: #ff6b35; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">COMBO</span>';
        const precoReal = parseFloat(ingresso.preco) || 0;
        precoTexto = `R$ ${precoReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        valorReceberReal = parseFloat(ingresso.valor_receber) || precoReal;
    } else {
        badgeHtml = '<span class="ticket-type-badge pago" style="background: #007bff; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">PAGO</span>';
        const precoReal = parseFloat(ingresso.preco) || 0;
        precoTexto = `R$ ${precoReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        valorReceberReal = parseFloat(ingresso.valor_receber) || precoReal;
    }
    
    let detalhesExtras = '';
    
    // Para combos, mostrar itens inclusos
    if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
        try {
            const itensCombo = JSON.parse(ingresso.conteudo_combo);
            if (itensCombo.length > 0) {
                const itensTexto = itensCombo.map(item => {
                    const nomeIngresso = window.ingressosNomes?.[item.ingresso_id] || `Ingresso ${item.ingresso_id}`;
                    return `<li><strong>${nomeIngresso}</strong> × ${item.quantidade}</li>`;
                }).join('');
                
                detalhesExtras = `
                    <div class="combo-items-column" style="margin-top: 10px;">
                        <div class="combo-items-display">
                            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #555;">Itens inclusos:</h4>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                                ${itensTexto}
                            </ul>
                        </div>
                    </div>
                `;
            }
        } catch (e) {
            console.error('❌ Erro ao parsear conteudo_combo na atualização:', e);
        }
    }
    
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
        <div class="ticket-details" style="margin-top: 10px;">
            <div style="margin-bottom: 6px;"><strong>Quantidade:</strong> ${ingresso.quantidade_total || 100}</div>
            <div style="margin-bottom: 6px;"><strong>Preço:</strong> ${precoTexto}</div>
            <div style="margin-bottom: 6px;"><strong>Você recebe:</strong> <span style="color: #28a745; font-weight: bold;">R$ ${valorReceberReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
            ${detalhesExtras}
        </div>
    `;
    
    return elemento;
}

/**
 * INTERCEPTAR FUNÇÕES DE UPDATE PARA ATUALIZAÇÃO ESPECÍFICA
 */
function interceptarFuncoesUpdateEspecifico() {
    console.log('🎯 Configurando interceptação específica de funções de update...');
    
    // Lista de funções que fazem update
    const funcoesUpdateOriginais = {};
    
    [
        'updatePaidTicket', 'updateFreeTicket', 'updateComboTicket'
    ].forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            funcoesUpdateOriginais[nomeFuncao] = window[nomeFuncao];
            
            window[nomeFuncao] = async function(...args) {
                console.log(`🎯 Interceptando ${nomeFuncao} para atualização específica`);
                
                // Capturar ID do ingresso antes de executar
                let ingressoId = null;
                
                if (nomeFuncao === 'updatePaidTicket') {
                    ingressoId = document.getElementById('editPaidTicketId')?.value;
                } else if (nomeFuncao === 'updateFreeTicket') {
                    ingressoId = document.getElementById('editFreeTicketId')?.value;
                } else if (nomeFuncao === 'updateComboTicket') {
                    ingressoId = document.getElementById('editComboTicketId')?.value;
                }
                
                console.log(`📋 ID capturado para atualização: ${ingressoId}`);
                
                // Executar função original
                let resultado;
                try {
                    resultado = await funcoesUpdateOriginais[nomeFuncao].apply(this, args);
                } catch (error) {
                    resultado = funcoesUpdateOriginais[nomeFuncao].apply(this, args);
                }
                
                // Atualizar item específico na lista
                if (ingressoId) {
                    setTimeout(() => {
                        console.log(`🔄 Atualizando item específico ${ingressoId} após ${nomeFuncao}`);
                        atualizarItemEspecificoNaLista(ingressoId);
                    }, 500);
                } else {
                    console.warn(`⚠️ ID não encontrado para ${nomeFuncao}, recarregando lista inteira`);
                    setTimeout(() => atualizarListaAposEdicao(), 500);
                }
                
                return resultado;
            };
            
            console.log(`✅ ${nomeFuncao} interceptada para atualização específica`);
        }
    });
}

/**
 * INTERCEPTAR E SOBRESCREVER FUNÇÕES QUE CARREGAM LOTES COM LIMPEZA FORÇADA
 */
function interceptarCarregamentoLotesComLimpeza() {
    console.log('🧹 Interceptando TODAS as funções que carregam lotes com LIMPEZA FORÇADA...');
    
    // Lista COMPLETA de funções que podem carregar lotes
    const funcoesCarregamentoLotes = [
        'carregarLotesNoModalCombo',
        'carregarLotesNoModalEditCombo',
        'populateLoteSelect',
        'loadLotes',
        'carregarLotes',
        'carregarLotesQuantidade',
        'carregarTodosLotes',
        'populateComboTicketSelectByLote',
        'updateComboTicketDates',
        'updateEditComboTicketDates',
        'populateEditComboTicketSelect',
        'populateComboTicketSelect'
    ];
    
    funcoesCarregamentoLotes.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const funcaoOriginal = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                console.log(`🧹 INTERCEPTANDO ${nomeFuncao} - FORÇANDO LIMPEZA antes de carregar`);
                
                // FORÇAR LIMPEZA ANTES DE QUALQUER CARREGAMENTO
                limparTodosOsSelectsLotesForcado();
                
                // Aguardar um pouco para garantir limpeza
                setTimeout(() => {
                    // Executar função original
                    try {
                        return funcaoOriginal.apply(this, args);
                    } catch (error) {
                        console.error(`❌ Erro ao executar ${nomeFuncao}:`, error);
                    }
                }, 50);
                
                return false; // Impedir execução imediata
            };
            
            console.log(`✅ ${nomeFuncao} interceptada com limpeza forçada`);
        }
    });
}

/**
 * LIMPEZA FORÇADA DE TODOS OS SELECTS DE LOTES
 */
function limparTodosOsSelectsLotesForcado() {
    console.log('🧹 LIMPEZA FORÇADA de TODOS os selects de lotes...');
    
    // Selecionar TODOS os selects que podem conter lotes
    const seletores = [
        '#paidTicketLote', '#freeTicketLote', '#comboTicketLote',
        '#editPaidTicketLote', '#editFreeTicketLote', '#editComboTicketLote',
        'select[id*="Lote"]', 'select[id*="lote"]'
    ];
    
    const selectsEncontrados = new Set();
    
    seletores.forEach(seletor => {
        const elementos = document.querySelectorAll(seletor);
        elementos.forEach(select => {
            selectsEncontrados.add(select);
        });
    });
    
    selectsEncontrados.forEach(select => {
        if (select && select.tagName === 'SELECT') {
            const placeholder = select.querySelector('option:first-child')?.textContent || 'Selecione um lote';
            
            // LIMPEZA TOTAL
            select.innerHTML = `<option value="">${placeholder}</option>`;
            
            // Remover atributos de controle
            select.removeAttribute('data-ultimo-carregamento');
            select.removeAttribute('data-cache-limpo');
            
            console.log(`🧹 Select ${select.id || 'sem-id'} LIMPO FORÇADAMENTE`);
        }
    });
    
    console.log(`✅ ${selectsEncontrados.size} selects limpos forçadamente`);
}

/**
 * Funções de carregamento sem duplicação da implementação anterior
 */
async function atualizarListaAposEdicao() {
    console.log('🔄 Atualizando lista após edição (função existente)...');
    
    // Usar implementação da função existente se disponível
    if (typeof window.recarregarListaAPILimpa === 'function') {
        await window.recarregarListaAPILimpa();
    } else if (typeof window.renderizarIngressosPersonalizado === 'function') {
        window.renderizarIngressosPersonalizado();
    }
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correções finais adicionais...');
    
    // Configurar controle de botões
    setTimeout(() => {
        interceptarMudancasComboItems();
        controlarBotoesCombo(); // Estado inicial
    }, 500);
    
    // Configurar interceptação específica de update
    setTimeout(() => {
        interceptarFuncoesUpdateEspecifico();
    }, 1000);
    
    // Configurar interceptação com limpeza forçada
    setTimeout(() => {
        interceptarCarregamentoLotesComLimpeza();
    }, 1500);
    
    console.log('✅ Correções finais adicionais inicializadas');
}

// Funções globais
window.controlarBotoesCombo = controlarBotoesCombo;
window.atualizarItemEspecificoNaLista = atualizarItemEspecificoNaLista;
window.limparTodosOsSelectsLotesForcado = limparTodosOsSelectsLotesForcado;

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ COMBO-CORRECOES-FINAIS-ADICIONAIS.JS carregado!');
console.log('🔧 Correções implementadas:');
console.log('  1. ✅ Controle automático de botões baseado em itens do combo');
console.log('  2. ✅ Atualização específica de itens na lista após edição');
console.log('  3. ✅ Limpeza forçada de selects em TODAS as funções de carregamento');
console.log('💡 Funções globais:');
console.log('  - window.controlarBotoesCombo() - controlar estado dos botões');
console.log('  - window.atualizarItemEspecificoNaLista(id) - atualizar item específico');
console.log('  - window.limparTodosOsSelectsLotesForcado() - limpeza forçada total');
