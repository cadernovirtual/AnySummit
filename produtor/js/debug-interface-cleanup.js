// Debug para identificar o que está limpando a interface após salvar lotes
(function() {
    console.log('🔍 DEBUG AGRESSIVO de limpeza de interface carregado');
    
    // Interceptar TODAS as funções suspeitas
    const funcoesProblematicas = [
        'renderizarLotesPorData',
        'renderizarLotesPorPercentual', 
        'atualizarListaLotes',
        'carregarLotesDoCookie',
        'carregarControleLimit',
        'carregarLotes',
        'exibirLotesQuantidadeNaInterface',
        'limparTodosLotes',
        'atualizarTelaLotes',           // ✅ NOVA - Esta estava causando o problema!
        'atualizarInterfaceLotes'       // ✅ NOVA - Fallback que também causa problema
    ];
    
    funcoesProblematicas.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const originalFunc = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                console.log(`🚫 INTERCEPTANDO ${nomeFuncao}()`);
                console.trace(`📍 Stack trace de quem chamou ${nomeFuncao}:`);
                console.log(`📄 Argumentos passados:`, args);
                
                // BLOQUEAR COMPLETAMENTE para preservar interface
                console.log(`✅ ${nomeFuncao} BLOQUEADA - interface preservada`);
                return;
            };
            
            console.log(`✅ ${nomeFuncao} interceptada e BLOQUEADA`);
        } else {
            console.log(`ℹ️ ${nomeFuncao} não encontrada ou não é função`);
        }
    });
    
    // Interceptar closeMo dal para ver se algo executa após fechar
    if (typeof window.closeModal === 'function') {
        const originalCloseModal = window.closeModal;
        
        window.closeModal = function(modalId) {
            console.log(`🔄 closeModal("${modalId}") chamado`);
            console.trace('📍 Stack trace do closeModal:');
            
            // Executar original
            const resultado = originalCloseModal.call(this, modalId);
            
            console.log(`✅ Modal "${modalId}" fechado`);
            
            // Monitorar se algo executa após fechar
            setTimeout(() => {
                console.log(`🔍 Verificando interface 100ms após fechar modal "${modalId}"`);
                const botoes = document.querySelectorAll('button[onclick*="editar"]');
                console.log(`📊 Botões "editar" encontrados: ${botoes.length}`);
            }, 100);
            
            return resultado;
        };
        
        console.log('✅ closeModal interceptado para monitoramento');
    }
    
    // Interceptar innerHTML para ver quem está limpando
    const containers = [
        'lotesPorDataList',
        'lotesPorPercentualList',
        'lotesContainer'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            let originalInnerHTML = container.innerHTML;
            
            Object.defineProperty(container, 'innerHTML', {
                get: function() {
                    return originalInnerHTML;
                },
                set: function(value) {
                    console.log(`🚫 TENTATIVA de definir innerHTML em ${containerId}:`);
                    console.log(`📄 Valor que tentaram definir:`, value.substring(0, 100) + (value.length > 100 ? '...' : ''));
                    console.trace('📍 Stack trace de quem tentou limpar innerHTML:');
                    
                    // BLOQUEAR se tentarem limpar (value vazio ou só espaços)
                    if (!value || value.trim() === '') {
                        console.log(`🚫 BLOQUEADO: Tentativa de limpar ${containerId}`);
                        return; // NÃO permitir limpeza
                    }
                    
                    // Permitir apenas se for conteúdo substancial
                    originalInnerHTML = value;
                    console.log(`✅ innerHTML permitido em ${containerId} (conteúdo substancial)`);
                }
            });
            
            console.log(`✅ ${containerId} protegido contra limpeza`);
        }
    });
    
    console.log('🛡️ Sistema de proteção completo ativado');
    
})();

