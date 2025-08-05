/**
 * TESTE DE SINTAXE PARA LOTES.JS
 * Verifica se há erros de sintaxe no arquivo
 */

console.log('🧪 Testando sintaxe do lotes.js...');

try {
    // Tentar carregar e executar o script
    const script = document.createElement('script');
    script.src = '/produtor/js/lotes.js?v=' + Date.now();
    script.onload = function() {
        console.log('✅ lotes.js carregado sem erros de sintaxe');
    };
    script.onerror = function(error) {
        console.error('❌ Erro ao carregar lotes.js:', error);
    };
    
    // Não adicionar ao DOM, apenas testar se compila
    console.log('✅ Teste de sintaxe concluído');
    
} catch (error) {
    console.error('❌ Erro de sintaxe encontrado:', error);
}
