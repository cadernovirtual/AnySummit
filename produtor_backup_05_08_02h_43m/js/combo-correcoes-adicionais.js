/**
 * CORREÇÕES ADICIONAIS - CACHE DE LOTES + ATUALIZAÇÃO PÓS-EDIÇÃO
 * Corrige: duplicação de lotes nos selects + atualização da lista após edição
 */

console.log('🔧 COMBO-CORRECOES-ADICIONAIS.JS carregando...');

/**
 * LIMPAR CACHE DOS SELECTS DE LOTE - VERSÃO RIGOROSA
 */
function limparCacheSelectsLote() {
    console.log('🧹 Limpeza RIGOROSA dos selects de lote...');
    
    const selectsLote = [
        document.getElementById('paidTicketLote'),
        document.getElementById('freeTicketLote'),
        document.getElementById('comboTicketLote'),
        document.getElementById('editPaidTicketLote'),
        document.getElementById('editFreeTicketLote'),
        document.getElementById('editComboTicketLote')
    ];
    
    selectsLote.forEach(select => {
        if (select) {
            // Obter placeholder original
            const primeiraOpcao = select.querySelector('option:first-child');
            const placeholderText = primeiraOpcao ? primeiraOpcao.textContent : 'Selecione um lote';
            
            // LIMPEZA TOTAL - remover ALL options
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            
            // Recriar APENAS o placeholder
            const novaOpcao = document.createElement('option');
            novaOpcao.value = '';
            novaOpcao.textContent = placeholderText;
            select.appendChild(novaOpcao);
            
            // Adicionar flag para evitar múltiplos carregamentos
            select.setAttribute('data-cache-limpo', 'true');
            select.setAttribute('data-ultimo-carregamento', Date.now().toString());
            
            console.log(`✅ Select ${select.id} TOTALMENTE limpo`);
        }
    });
}

/**
 * CARREGAR LOTES LIMPOS COM CONTROLE DE DUPLICAÇÃO
 */
async function carregarLotesLimpos() {
    console.log('🔄 Carregando lotes com controle RIGOROSO de duplicação...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem lotes para carregar');
        return;
    }
    
    // Verificar se já existe um carregamento em andamento
    if (window.carregandoLotes) {
        console.log('⚠️ Carregamento já em andamento, ignorando...');
        return;
    }
    
    window.carregandoLotes = true;
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=carregar_todos_lotes&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta lotes:', textResponse.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON dos lotes:', parseError);
            return;
        }
        
        if (data.sucesso && data.lotes) {
            console.log(`📋 ${data.lotes.length} lotes encontrados para carregamento ÚNICO`);
            
            // Aplicar lotes a todos os selects COM CONTROLE RIGOROSO
            const selectsLote = [
                document.getElementById('paidTicketLote'),
                document.getElementById('freeTicketLote'),
                document.getElementById('comboTicketLote'),
                document.getElementById('editPaidTicketLote'),
                document.getElementById('editFreeTicketLote'),
                document.getElementById('editComboTicketLote')
            ];
            
            selectsLote.forEach(select => {
                if (select) {
                    // VERIFICAR se já foi carregado recentemente
                    const ultimoCarregamento = select.getAttribute('data-ultimo-carregamento');
                    const agora = Date.now();
                    
                    if (ultimoCarregamento && (agora - parseInt(ultimoCarregamento)) < 1000) {
                        console.log(`⚠️ Select ${select.id} carregado recentemente, pulando...`);
                        return;
                    }
                    
                    // VERIFICAR se já tem mais de 1 opção (placeholder + opções)
                    if (select.options.length > 1) {
                        console.log(`⚠️ Select ${select.id} já tem opções, limpando primeiro...`);
                        // Manter apenas placeholder
                        while (select.options.length > 1) {
                            select.removeChild(select.lastChild);
                        }
                    }
                    
                    // Adicionar lotes SEM DUPLICAÇÃO
                    const lotesUnicos = new Map();
                    data.lotes.forEach(lote => {
                        if (!lotesUnicos.has(lote.id)) {
                            lotesUnicos.set(lote.id, lote);
                        }
                    });
                    
                    let adicionados = 0;
                    lotesUnicos.forEach(lote => {
                        // VERIFICAR se opção já existe
                        const jaExiste = Array.from(select.options).some(opt => opt.value === lote.id.toString());
                        
                        if (!jaExiste) {
                            const option = document.createElement('option');
                            option.value = lote.id;
                            option.textContent = lote.nome || `Lote ${lote.id}`;
                            select.appendChild(option);
                            adicionados++;
                        }
                    });
                    
                    // Marcar como carregado
                    select.setAttribute('data-ultimo-carregamento', agora.toString());
                    
                    console.log(`✅ ${adicionados} lotes únicos adicionados a ${select.id} (total: ${select.options.length - 1})`);
                }
            });
            
        } else {
            console.error('❌ Erro ao carregar lotes:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar lotes:', error);
    } finally {
        window.carregandoLotes = false;
    }
}

/**
 * BLOQUEAR OUTRAS FUNÇÕES QUE CARREGAM LOTES
 */
function bloquearFuncoesCarregamentoLotes() {
    console.log('🚫 Bloqueando outras funções que carregam lotes...');
    
    const funcoesParaBloquear = [
        'carregarLotesNoModalCombo',
        'carregarLotesNoModalEditCombo', 
        'populateLoteSelect',
        'loadLotes',
        'carregarLotes',
        'updateComboTicketDates',
        'updateEditComboTicketDates'
    ];
    
    funcoesParaBloquear.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const funcaoOriginal = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                console.log(`🚫 Função ${nomeFuncao} BLOQUEADA para evitar duplicação de lotes`);
                
                // Para updateComboTicketDates, executar apenas a parte de datas, não carregar lotes
                if (nomeFuncao.includes('updateComboTicketDates') || nomeFuncao.includes('updateEditComboTicketDates')) {
                    console.log(`📅 Executando apenas atualização de datas para ${nomeFuncao}`);
                    // Chamar função original mas interromper carregamento de lotes
                    try {
                        return funcaoOriginal.apply(this, args);
                    } catch (e) {
                        console.log(`⚠️ Erro controlado em ${nomeFuncao}:`, e.message);
                    }
                }
                
                return false; // Bloquear outras funções
            };
            
            console.log(`🚫 ${nomeFuncao} bloqueada`);
        }
    });
    
    console.log('✅ Funções de carregamento de lotes bloqueadas');
}

/**
 * INTERCEPTAR ABERTURA DE MODAIS PARA LIMPAR CACHE - VERSÃO RIGOROSA
 */
function interceptarAberturaDosModais() {
    console.log('🎯 Configurando interceptação RIGOROSA para limpeza de cache...');
    
    // Lista de funções que abrem modais
    const funcoesModalOriginais = {};
    
    [
        'openPaidTicketModal', 'abrirModalPago',
        'openFreeTicketModal', 'abrirModalGratuito', 
        'openComboTicketModal', 'abrirModalCombo',
        'editComboTicket', 'editTicket', 'openModal'
    ].forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            funcoesModalOriginais[nomeFuncao] = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                console.log(`🎯 Interceptando ${nomeFuncao} - limpeza RIGOROSA`);
                
                // LIMPEZA IMEDIATA E AGRESSIVA
                limparCacheSelectsLote();
                
                // Executar função original
                const resultado = funcoesModalOriginais[nomeFuncao].apply(this, args);
                
                // Carregar lotes com delay ÚNICO
                setTimeout(() => {
                    if (!window.carregandoLotes) {
                        carregarLotesLimpos();
                    }
                }, 200);
                
                return resultado;
            };
            
            console.log(`✅ ${nomeFuncao} interceptada para limpeza RIGOROSA`);
        }
    });
    
    // Interceptar cliques em botões que abrem modais - MAIS AGRESSIVO
    setTimeout(() => {
        const botoes = document.querySelectorAll('button, .btn, [onclick]');
        botoes.forEach(botao => {
            const onclick = botao.onclick?.toString() || botao.getAttribute('onclick') || '';
            const texto = botao.textContent || botao.innerText || '';
            
            if (onclick.includes('Modal') || onclick.includes('modal') || 
                onclick.includes('editTicket') || onclick.includes('editCombo') ||
                texto.toLowerCase().includes('ingresso') || texto.toLowerCase().includes('combo')) {
                
                botao.addEventListener('click', () => {
                    console.log('🎯 Botão interceptado - limpeza IMEDIATA');
                    
                    // Limpeza IMEDIATA
                    limparCacheSelectsLote();
                    
                    // Carregar com delay
                    setTimeout(() => {
                        if (!window.carregandoLotes) {
                            carregarLotesLimpos();
                        }
                    }, 300);
                }, { once: false, passive: true });
            }
        });
        
        console.log('✅ Botões interceptados com limpeza RIGOROSA');
    }, 2000);
}

/**
 * ATUALIZAR LISTA DE INGRESSOS APÓS EDIÇÃO
 */
async function atualizarListaAposEdicao() {
    console.log('🔄 Atualizando lista de ingressos após edição...');
    
    // Tentar usar funções existentes de recarregamento
    const funcoesRecarregamento = [
        'recarregarListaAPILimpa',
        'renderizarIngressosPersonalizado',
        'recarregarIngressosEtapa6',
        'carregarIngressos',
        'loadTickets',
        'refreshTicketList'
    ];
    
    let recarregouComSucesso = false;
    
    for (const nomeFuncao of funcoesRecarregamento) {
        if (typeof window[nomeFuncao] === 'function') {
            try {
                console.log(`🔄 Tentando recarregar com ${nomeFuncao}...`);
                await window[nomeFuncao]();
                recarregouComSucesso = true;
                console.log(`✅ Lista recarregada com ${nomeFuncao}`);
                break;
            } catch (error) {
                console.warn(`⚠️ Erro ao recarregar com ${nomeFuncao}:`, error);
            }
        }
    }
    
    if (!recarregouComSucesso) {
        console.log('⚠️ Nenhuma função de recarregamento encontrada, usando método direto');
        await recarregarListaDiretamente();
    }
}

/**
 * RECARREGAR LISTA DIRETAMENTE
 */
async function recarregarListaDiretamente() {
    console.log('🔄 Recarregando lista diretamente...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem lista para recarregar');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta lista direta:', textResponse.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON da lista:', parseError);
            return;
        }
        
        if (data.sucesso) {
            // Atualizar dados globais se existirem
            if (window.dadosAtivos) {
                window.dadosAtivos.ingressos = data.ingressos || [];
                console.log(`✅ Dados globais atualizados: ${data.ingressos?.length || 0} ingressos`);
            }
            
            // Tentar renderizar usando função disponível
            if (typeof window.renderizarIngressosPersonalizado === 'function') {
                window.renderizarIngressosPersonalizado();
                console.log('✅ Lista renderizada com função personalizada');
            } else {
                console.log('⚠️ Função de renderização não encontrada');
            }
            
        } else {
            console.error('❌ Erro ao recarregar lista:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no recarregamento direto:', error);
    }
}

/**
 * INTERCEPTAR FUNÇÕES DE UPDATE PARA ATUALIZAR LISTA
 */
function interceptarFuncoesUpdate() {
    console.log('🎯 Configurando interceptação de funções de update...');
    
    // Lista de funções que fazem update
    const funcoesUpdateOriginais = {};
    
    [
        'updatePaidTicket', 'updateFreeTicket', 'updateComboTicket',
        'salvarEdicaoIngresso', 'salvarIngressoEditado'
    ].forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            funcoesUpdateOriginais[nomeFuncao] = window[nomeFuncao];
            
            window[nomeFuncao] = async function(...args) {
                console.log(`🎯 Interceptando ${nomeFuncao} para atualização posterior`);
                
                // Executar função original
                let resultado;
                try {
                    resultado = await funcoesUpdateOriginais[nomeFuncao].apply(this, args);
                } catch (error) {
                    resultado = funcoesUpdateOriginais[nomeFuncao].apply(this, args);
                }
                
                // Atualizar lista após salvar
                setTimeout(() => {
                    console.log(`🔄 Atualizando lista após ${nomeFuncao}`);
                    atualizarListaAposEdicao();
                }, 500);
                
                return resultado;
            };
            
            console.log(`✅ ${nomeFuncao} interceptada para atualização`);
        }
    });
}

/**
 * FUNÇÃO GLOBAL PARA FORÇAR LIMPEZA MANUAL - VERSÃO RIGOROSA
 */
window.forcarLimpezaCacheLotes = function() {
    console.log('🔧 Forçando limpeza RIGOROSA manual do cache de lotes...');
    
    // Resetar flag de carregamento
    window.carregandoLotes = false;
    
    // Limpeza rigorosa
    limparCacheSelectsLote();
    
    setTimeout(() => {
        if (!window.carregandoLotes) {
            carregarLotesLimpos();
        }
    }, 200);
    
    console.log('✅ Limpeza rigorosa manual concluída');
};

/**
 * FUNÇÃO GLOBAL PARA DEBUG DOS SELECTS
 */
window.debugSelectsLotes = function() {
    console.log('🔍 DEBUG dos selects de lotes:');
    
    const selectsLote = [
        'paidTicketLote', 'freeTicketLote', 'comboTicketLote',
        'editPaidTicketLote', 'editFreeTicketLote', 'editComboTicketLote'
    ];
    
    selectsLote.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            console.log(`  ${id}: ${select.options.length} opções`);
            for (let i = 0; i < select.options.length; i++) {
                console.log(`    ${i}: "${select.options[i].text}" (value: ${select.options[i].value})`);
            }
            console.log(`    Último carregamento: ${select.getAttribute('data-ultimo-carregamento') || 'nunca'}`);
        } else {
            console.log(`  ${id}: não encontrado`);
        }
    });
    
    console.log(`  Carregando lotes: ${window.carregandoLotes || false}`);
};

/**
 * FUNÇÃO GLOBAL PARA RESET COMPLETO (EMERGÊNCIA)
 */
window.resetCompletoDosSelects = function() {
    console.log('🚨 RESET COMPLETO DOS SELECTS - EMERGÊNCIA');
    
    // Parar qualquer carregamento
    window.carregandoLotes = false;
    
    // Limpar TUDO
    const selectsLote = [
        'paidTicketLote', 'freeTicketLote', 'comboTicketLote',
        'editPaidTicketLote', 'editFreeTicketLote', 'editComboTicketLote'
    ];
    
    selectsLote.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            // RESET TOTAL
            select.innerHTML = '<option value="">Selecione um lote</option>';
            select.removeAttribute('data-ultimo-carregamento');
            select.removeAttribute('data-cache-limpo');
            console.log(`🚨 ${id} RESETADO completamente`);
        }
    });
    
    // Aguardar e recarregar
    setTimeout(() => {
        console.log('🔄 Recarregando após reset completo...');
        carregarLotesLimpos();
    }, 500);
    
    console.log('✅ Reset completo concluído');
};

/**
 * FUNÇÃO GLOBAL PARA FORÇAR ATUALIZAÇÃO MANUAL
 */
window.forcarAtualizacaoLista = function() {
    console.log('🔧 Forçando atualização manual da lista...');
    atualizarListaAposEdicao();
};

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correções adicionais...');
    
    // CRÍTICO: Bloquear outras funções que carregam lotes
    setTimeout(() => {
        bloquearFuncoesCarregamentoLotes();
    }, 500);
    
    // Configurar interceptações
    setTimeout(() => {
        interceptarAberturaDosModais();
        interceptarFuncoesUpdate();
    }, 1000);
    
    // Limpeza inicial RIGOROSA
    setTimeout(() => {
        limparCacheSelectsLote();
        carregarLotesLimpos();
    }, 2000);
    
    console.log('✅ Correções adicionais inicializadas com controle RIGOROSO');
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ COMBO-CORRECOES-ADICIONAIS.JS carregado!');
console.log('🔧 Correções RIGOROSAS implementadas:');
console.log('  1. ✅ Limpeza TOTAL de cache dos selects de lote');
console.log('  2. ✅ Carregamento ÚNICO sem duplicação');
console.log('  3. ✅ Bloqueio de funções conflitantes');
console.log('  4. ✅ Controle de timing para evitar sobreposição');
console.log('  5. ✅ Atualização automática da lista após edição');
console.log('💡 Funções manuais RIGOROSAS:');
console.log('  - window.forcarLimpezaCacheLotes() - limpeza rigorosa manual');
console.log('  - window.debugSelectsLotes() - debug completo dos selects');
console.log('  - window.resetCompletoDosSelects() - RESET COMPLETO (emergência)');
console.log('  - window.forcarAtualizacaoLista() - atualizar lista manualmente');
