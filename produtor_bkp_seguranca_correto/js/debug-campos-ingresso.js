/**
 * DEBUG: Verificar campos de ingresso que não estão sendo salvos
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Interceptar dados enviados na etapa 6
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options] = args;
        
        if (url.includes('wizard_evento.php') && options?.body) {
            const body = options.body;
            
            if (body instanceof URLSearchParams || body instanceof FormData) {
                let formData = {};
                
                if (body instanceof URLSearchParams) {
                    for (let [key, value] of body.entries()) {
                        formData[key] = value;
                    }
                } else if (body instanceof FormData) {
                    for (let [key, value] of body.entries()) {
                        formData[key] = value;
                    }
                }
                
                if (formData.action === 'salvar_etapa' && formData.etapa === '6') {
                    console.log('🔍 ANÁLISE DETALHADA DOS INGRESSOS:');
                    
                    try {
                        const ingressos = JSON.parse(formData.ingressos);
                        ingressos.forEach((ingresso, index) => {
                            console.log(`📋 Ingresso ${index + 1}:`);
                            console.log('  - tipo:', ingresso.tipo, typeof ingresso.tipo);
                            console.log('  - titulo:', ingresso.titulo);
                            console.log('  - descricao:', ingresso.descricao);
                            console.log('  - quantidade:', ingresso.quantidade, typeof ingresso.quantidade);
                            console.log('  - preco:', ingresso.preco, typeof ingresso.preco);
                            console.log('  - taxa_plataforma:', ingresso.taxa_plataforma, typeof ingresso.taxa_plataforma);
                            console.log('  - valor_receber:', ingresso.valor_receber, typeof ingresso.valor_receber);
                            console.log('  - inicio_venda:', ingresso.inicio_venda, typeof ingresso.inicio_venda);
                            console.log('  - fim_venda:', ingresso.fim_venda, typeof ingresso.fim_venda);
                            console.log('  - limite_min:', ingresso.limite_min, typeof ingresso.limite_min);
                            console.log('  - limite_max:', ingresso.limite_max, typeof ingresso.limite_max);
                            console.log('  - lote_nome:', ingresso.lote_nome, typeof ingresso.lote_nome);
                            console.log('  - conteudo_combo:', ingresso.conteudo_combo);
                            console.log('---');
                        });
                    } catch (e) {
                        console.error('❌ Erro ao analisar ingressos:', e);
                    }
                }
            }
        }
        
        return originalFetch.apply(this, args);
    };
    
    console.log('🔍 Debug de campos de ingresso ativo');
});
