/**
 * DEBUG AGRESSIVO - Interceptar TODOS os cliques em botões
 */

console.log('🚨 [DEBUG AGRESSIVO] Interceptando TODOS os cliques...');

// Interceptar TODOS os cliques na página COM MÁXIMA PRIORIDADE
document.addEventListener('click', function(event) {
    const target = event.target;
    
    // Se tem 🗑️ ou título com "excluir" ou onclick com "lote"
    if (target.textContent?.includes('🗑️') || 
        target.innerHTML?.includes('🗑️') ||
        target.title?.toLowerCase().includes('excluir') ||
        target.getAttribute('onclick')?.includes('Lote') ||
        target.getAttribute('onclick')?.includes('lote')) {
        
        console.log('🎯 [DEBUG] CLIQUE INTERCEPTADO em botão suspeito:');
        console.log('- Elemento:', target);
        console.log('- Texto:', target.textContent);
        console.log('- HTML:', target.innerHTML);
        console.log('- Onclick:', target.getAttribute('onclick'));
        console.log('- Title:', target.title);
        console.log('- Classes:', target.className);
        console.log('- ID:', target.id);
        
        // PREVINIR outros interceptadores se for lote
        const onclick = target.getAttribute('onclick') || '';
        if (onclick.includes('excluirLote') || onclick.includes('Lote')) {
            console.log('🛑 [DEBUG] PREVENINDO outros interceptadores - este é um LOTE!');
            event.stopImmediatePropagation();
            
            // Executar a função diretamente
            try {
                console.log('🚀 [DEBUG] Executando onclick manualmente:', onclick);
                eval(onclick);
            } catch (error) {
                console.error('❌ [DEBUG] Erro ao executar onclick:', error);
            }
            
            return false;
        }
        
        console.log('⚠️ [DEBUG] Deixando clique continuar (não é lote)...');
    }
}, true); // true = capture phase - PRIMEIRA PRIORIDADE

// Também interceptar via window para pegar chamadas diretas
const funcoesParaDebug = [
    'excluirLoteDataInterface',
    'excluirLoteQuantidadeInterface', 
    'excluirLoteUnificado',
    'excluirLoteData',
    'excluirLotePercentual',
    'excluirLote'
];

funcoesParaDebug.forEach(nomeFuncao => {
    const original = window[nomeFuncao];
    if (typeof original === 'function') {
        window[nomeFuncao] = function(...args) {
            console.log(`🔥 [DEBUG] FUNÇÃO CHAMADA: ${nomeFuncao}(${args.join(', ')})`);
            console.trace('Stack trace da chamada:');
            return original.apply(this, args);
        };
    }
});

console.log('✅ [DEBUG AGRESSIVO] Interceptação ativa com MÁXIMA PRIORIDADE - aguardando cliques...');
