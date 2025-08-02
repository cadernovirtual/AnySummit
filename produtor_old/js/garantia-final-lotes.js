/**
 * GARANTIA FINAL - Força chamada de atualizarTelaLotes
 * Este arquivo DEVE ser o último a carregar
 */

(function() {
    console.log('🔨 GARANTIA FINAL - Forçando atualizarTelaLotes...');
    
    setTimeout(function() {
        
        // Interceptar TODAS as funções de criar lote
        const funcoesParaInterceptar = [
            'criarLoteData',
            'criarLotePercentual',
            'salvarLoteData',
            'salvarLotePercentual'
        ];
        
        funcoesParaInterceptar.forEach(function(nomeFuncao) {
            const funcaoOriginal = window[nomeFuncao];
            if (funcaoOriginal) {
                window[nomeFuncao] = function() {
                    console.log(`🎯 Interceptando ${nomeFuncao}...`);
                    
                    // Chamar original
                    const resultado = funcaoOriginal.apply(this, arguments);
                    
                    // FORÇAR ATUALIZAÇÃO
                    setTimeout(function() {
                        console.log('💪 FORÇANDO atualizarTelaLotes()!');
                        if (window.atualizarTelaLotes) {
                            window.atualizarTelaLotes();
                        }
                    }, 100);
                    
                    return resultado;
                };
            }
        });
        
        // Interceptar exclusão também
        const excluirOriginal = window.excluirLote;
        if (excluirOriginal) {
            window.excluirLote = async function() {
                console.log('🎯 Interceptando excluirLote...');
                
                // Chamar original
                const resultado = await excluirOriginal.apply(this, arguments);
                
                // FORÇAR ATUALIZAÇÃO
                setTimeout(function() {
                    console.log('💪 FORÇANDO atualizarTelaLotes() após exclusão!');
                    if (window.atualizarTelaLotes) {
                        window.atualizarTelaLotes();
                    }
                }, 100);
                
                return resultado;
            };
        }
        
        console.log('✅ GARANTIA FINAL APLICADA!');
        
    }, 2500); // Esperar mais tempo para garantir que tudo carregou
    
})();