/**
 * DEBUG FUNCÕES DISPONÍVEIS
 */

console.log('🔍 DEBUG-FUNCOES-DISPONIVEIS.JS CARREGANDO...');

function verificarFuncoesDisponiveis() {
    console.log('🔍 Verificando funções disponíveis no window...');
    
    const funcoes = [
        'criarLoteData',
        'criarLoteQuantidade', 
        'criarLoteDataMySQL',
        'criarLoteQuantidadeMySQL',
        'carregarLotesDoBanco',
        'renderizarLotesUnificado',
        'fazerRequisicaoAPI'
    ];
    
    funcoes.forEach(funcao => {
        const existe = typeof window[funcao] === 'function';
        console.log(`${existe ? '✅' : '❌'} window.${funcao}: ${typeof window[funcao]}`);
    });
    
    // Listar todas as funções que contêm 'Lote'
    const todasFuncoes = Object.keys(window).filter(key => 
        key.toLowerCase().includes('lote') && typeof window[key] === 'function'
    );
    
    console.log('🔍 Todas as funções com "lote" no nome:', todasFuncoes);
}

// Verificar imediatamente e depois de 2 segundos
setTimeout(() => {
    console.log('🚀 Verificação inicial de funções:');
    verificarFuncoesDisponiveis();
}, 100);

setTimeout(() => {
    console.log('🔄 Verificação após 2 segundos:');
    verificarFuncoesDisponiveis();
}, 2000);

// Exportar função para uso manual
window.verificarFuncoesDisponiveis = verificarFuncoesDisponiveis;

console.log('✅ DEBUG-FUNCOES-DISPONIVEIS.JS CARREGADO!');
console.log('🔧 Para verificar manualmente: verificarFuncoesDisponiveis()');
