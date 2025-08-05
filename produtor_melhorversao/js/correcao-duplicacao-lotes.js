/**
 * CORREÇÃO ESPECÍFICA PARA DUPLICAÇÃO DE LOTES
 * Problema: Quando lote é selecionado e modal cancelado, select duplica lotes
 * Causa: Funções onchange carregam lotes novamente
 */

console.log('🔧 CORRECAO-DUPLICACAO-LOTES.JS carregando...');

/**
 * FLAG GLOBAL PARA CONTROLAR CARREGAMENTO
 */
window.lotesJaCarregados = false;
window.carregandoLotesAtualmente = false;

/**
 * SOBRESCREVER FUNÇÕES QUE CARREGAM LOTES PARA EVITAR DUPLICAÇÃO
 */
function evitarDuplicacaoLotes() {
    console.log('🛡️ Configurando proteção contra duplicação de lotes...');
    
    // Lista das funções problemáticas que carregam lotes
    const funcoesProblematicas = [
        'carregarLotesNoModalCombo',
        'carregarLotesNoModalEditCombo',
        'carregarLotesNoModalFree',          // ADICIONADO - função específica para gratuitos
        'populateComboTicketSelectByLote',
        'populateFreeTicketLote',            // ADICIONADO - pode estar carregando lotes gratuitos
        'carregarLotesIngressoGratuito'      // ADICIONADO - possível variação
    ];
    
    funcoesProblematicas.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const funcaoOriginal = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                console.log(`🛡️ Interceptando ${nomeFuncao} para evitar duplicação`);
                
                // Se já está carregando, pular
                if (window.carregandoLotesAtualmente) {
                    console.log(`⏳ ${nomeFuncao} - carregamento já em andamento, pulando`);
                    return;
                }
                
                // Executar apenas uma vez ou se forçado
                const forcarRecarregamento = args[args.length - 1] === 'FORCAR_RECARREGAMENTO';
                
                if (window.lotesJaCarregados && !forcarRecarregamento) {
                    console.log(`✅ ${nomeFuncao} - lotes já carregados, pulando`);
                    return;
                }
                
                window.carregandoLotesAtualmente = true;
                
                try {
                    const resultado = funcaoOriginal.apply(this, args);
                    window.lotesJaCarregados = true;
                    return resultado;
                } finally {
                    setTimeout(() => {
                        window.carregandoLotesAtualmente = false;
                    }, 100);
                }
            };
            
            console.log(`✅ ${nomeFuncao} protegida contra duplicação`);
        }
    });
}

/**
 * SOBRESCREVER FUNÇÕES onchange PARA NÃO CARREGAREM LOTES
 */
function corrigirFuncoesOnchange() {
    console.log('🔧 Corrigindo funções onchange...');
    
    // Aguardar funções estarem disponíveis
    setTimeout(() => {
        // updateComboTicketDates - versão que não carrega lotes
        if (typeof window.updateComboTicketDates === 'function') {
            const funcaoOriginal = window.updateComboTicketDates;
            
            window.updateComboTicketDates = function() {
                console.log('📅 updateComboTicketDates - versão sem carregamento de lotes');
                
                const selectLote = document.getElementById('comboTicketLote');
                const selectedOption = selectLote?.options[selectLote.selectedIndex];
                const startInput = document.getElementById('comboSaleStart');
                const endInput = document.getElementById('comboSaleEnd');
                const periodTitle = document.getElementById('comboTicketPeriodTitle');
                
                // Apenas atualizar datas, NÃO carregar lotes
                if (!selectedOption || !selectedOption.value) {
                    if (startInput) startInput.value = '';
                    if (endInput) endInput.value = '';
                    if (periodTitle) periodTitle.textContent = 'Período das vendas';
                    return;
                }
                
                const tipoLote = selectedOption.dataset?.tipoLote;
                
                if (tipoLote === 'data') {
                    const dataInicio = selectedOption.dataset?.dataInicio;
                    const dataFim = selectedOption.dataset?.dataFim;
                    
                    if (startInput) {
                        startInput.value = dataInicio || '';
                        startInput.readOnly = true;
                    }
                    if (endInput) {
                        endInput.value = dataFim || '';
                        endInput.readOnly = true;
                    }
                    if (periodTitle) periodTitle.textContent = 'Período das vendas (definido pelo lote)';
                    
                } else if (tipoLote === 'percentual') {
                    const percentual = selectedOption.dataset?.percentual;
                    
                    if (startInput) {
                        startInput.value = '';
                        startInput.readOnly = false;
                    }
                    if (endInput) {
                        endInput.value = '';
                        endInput.readOnly = false;
                    }
                    if (periodTitle) periodTitle.textContent = `Lote ${percentual}% - Período flexível`;
                }
                
                console.log('✅ Datas atualizadas sem carregar lotes');
            };
            
            console.log('✅ updateComboTicketDates corrigida');
        }
        
        // updatePaidTicketDates - versão que não carrega lotes
        if (typeof window.updatePaidTicketDates === 'function') {
            const funcaoOriginal = window.updatePaidTicketDates;
            
            window.updatePaidTicketDates = function() {
                console.log('📅 updatePaidTicketDates - versão sem carregamento de lotes');
                
                // Apenas executar lógica de datas, sem carregamento adicional
                try {
                    return funcaoOriginal.apply(this, arguments);
                } catch (error) {
                    console.warn('⚠️ Erro na updatePaidTicketDates original:', error);
                }
            };
            
            console.log('✅ updatePaidTicketDates corrigida');
        }
        
        // updateFreeTicketDates - versão que não carrega lotes
        if (typeof window.updateFreeTicketDates === 'function') {
            const funcaoOriginal = window.updateFreeTicketDates;
            
            window.updateFreeTicketDates = function() {
                console.log('📅 updateFreeTicketDates - versão sem carregamento de lotes');
                
                // CRÍTICO: Interceptar qualquer tentativa de carregamento de lotes dentro da função
                const carregarLotesOriginal = window.carregarLotesNoModalFree;
                
                // Temporariamente desabilitar carregamento
                window.carregarLotesNoModalFree = function() {
                    console.log('🚫 carregarLotesNoModalFree BLOQUEADA durante updateFreeTicketDates');
                    return;
                };
                
                try {
                    // Executar função original
                    const resultado = funcaoOriginal.apply(this, arguments);
                    
                    // Restaurar função após execução
                    setTimeout(() => {
                        window.carregarLotesNoModalFree = carregarLotesOriginal;
                    }, 100);
                    
                    return resultado;
                } catch (error) {
                    console.warn('⚠️ Erro na updateFreeTicketDates original:', error);
                    
                    // Restaurar função mesmo em caso de erro
                    window.carregarLotesNoModalFree = carregarLotesOriginal;
                }
            };
            
            console.log('✅ updateFreeTicketDates corrigida com bloqueio de carregamento');
        }
        
    }, 2000);
}

/**
 * LIMPAR FLAGS QUANDO MODAL É FECHADO
 */
function configurarLimpezaFlags() {
    console.log('🧹 Configurando limpeza de flags ao fechar modais...');
    
    // Interceptar função closeModal
    if (typeof window.closeModal === 'function') {
        const closeModalOriginal = window.closeModal;
        
        window.closeModal = function(modalId) {
            console.log(`🚪 Fechando modal: ${modalId}`);
            
            // Resetar flags quando modal for fechado
            if (modalId.includes('Ticket') || modalId.includes('Modal') || modalId.includes('Combo')) {
                console.log('🧹 Resetando flags de carregamento de lotes');
                window.lotesJaCarregados = false;
                window.carregandoLotesAtualmente = false;
            }
            
            return closeModalOriginal.apply(this, arguments);
        };
        
        console.log('✅ closeModal interceptada para limpeza de flags');
    }
    
    // Também interceptar cliques nos botões de fechar
    setTimeout(() => {
        const botoesFechar = document.querySelectorAll('.modal-close, [onclick*="closeModal"]');
        
        botoesFechar.forEach(botao => {
            botao.addEventListener('click', () => {
                console.log('🚪 Botão de fechar clicado - resetando flags');
                setTimeout(() => {
                    window.lotesJaCarregados = false;
                    window.carregandoLotesAtualmente = false;
                }, 100);
            });
        });
        
        console.log(`✅ ${botoesFechar.length} botões de fechar interceptados`);
        
    }, 3000);
}

/**
 * FUNÇÃO PARA FORÇAR RECARREGAMENTO LIMPO
 */
window.forcarRecarregamentoLotesLimpo = function() {
    console.log('🔄 Forçando recarregamento limpo de lotes...');
    
    // Resetar flags
    window.lotesJaCarregados = false;
    window.carregandoLotesAtualmente = false;
    
    // Limpar todos os selects
    const selects = [
        'paidTicketLote', 'freeTicketLote', 'comboTicketLote',
        'editPaidTicketLote', 'editFreeTicketLote', 'editComboTicketLote'
    ];
    
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Selecione um lote</option>';
        }
    });
    
    // Forçar carregamento
    if (typeof window.carregarLotesNoModalCombo === 'function') {
        window.carregarLotesNoModalCombo('FORCAR_RECARREGAMENTO');
    }
    
    console.log('✅ Recarregamento limpo concluído');
};

/**
 * FUNÇÃO PARA DEBUG - COM FOCO EM INGRESSOS GRATUITOS
 */
window.debugDuplicacaoLotes = function() {
    console.log('🔍 DEBUG da duplicação de lotes:');
    console.log('  lotesJaCarregados:', window.lotesJaCarregados);
    console.log('  carregandoLotesAtualmente:', window.carregandoLotesAtualmente);
    
    const selects = [
        'paidTicketLote', 'freeTicketLote', 'comboTicketLote',
        'editPaidTicketLote', 'editFreeTicketLote', 'editComboTicketLote'
    ];
    
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            console.log(`  ${id}: ${select.options.length} opções`);
            
            // Verificar duplicatas
            const valores = Array.from(select.options).map(opt => opt.value).filter(v => v);
            const duplicatas = valores.filter((v, i) => valores.indexOf(v) !== i);
            
            if (duplicatas.length > 0) {
                console.log(`    ❌ DUPLICATAS encontradas:`, [...new Set(duplicatas)]);
                
                // Para ingressos gratuitos, mostrar mais detalhes
                if (id === 'freeTicketLote') {
                    console.log('    🔍 DEBUG ESPECÍFICO - INGRESSO GRATUITO:');
                    console.log('      - updateFreeTicketDates disponível:', typeof window.updateFreeTicketDates);
                    console.log('      - carregarLotesNoModalFree disponível:', typeof window.carregarLotesNoModalFree);
                    
                    // Mostrar todas as opções
                    Array.from(select.options).forEach((opt, i) => {
                        console.log(`      Opção ${i}: "${opt.text}" (value: ${opt.value})`);
                    });
                }
            } else {
                console.log(`    ✅ Sem duplicatas`);
            }
        }
    });
    
    // Verificar se há interceptações ativas
    console.log('🎯 Interceptações ativas:');
    console.log('  - updateFreeTicketDates interceptada:', window.updateFreeTicketDates?.toString().includes('versão sem carregamento'));
    console.log('  - carregarLotesNoModalFree interceptada:', window.carregarLotesNoModalFree?.toString().includes('evitar duplicação'));
};

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correção de duplicação de lotes...');
    
    evitarDuplicacaoLotes();
    corrigirFuncoesOnchange();
    configurarLimpezaFlags();
    
    console.log('✅ Correção de duplicação inicializada');
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ CORRECAO-DUPLICACAO-LOTES.JS carregado!');
console.log('🎯 Objetivo: Evitar duplicação quando lote é selecionado e modal cancelado');
console.log('💡 Funções disponíveis:');
console.log('  - window.forcarRecarregamentoLotesLimpo() - recarregar lotes limpo');
console.log('  - window.debugDuplicacaoLotes() - debug de duplicatas');
