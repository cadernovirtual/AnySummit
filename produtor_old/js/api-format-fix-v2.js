/**
 * Correção do formato de envio para API
 * Garante que os dados sejam enviados no formato correto: { evento: {...}, ingressos: [...] }
 */
(function() {
    console.log('🔧 Correção do formato de envio para API ativada');
    
    // Interceptar o fetch para a API
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options) {
        // Se for requisição para criaeventoapi.php
        if (url.includes('criaeventoapi.php') && options && options.body) {
            console.log('📦 Interceptando envio para criaeventoapi.php');
            
            try {
                let dados = JSON.parse(options.body);
                console.log('📊 Dados originais:', dados);
                
                // Verificar se já está no formato correto
                if (!dados.evento && !dados.ingressos) {
                    console.log('⚠️ Dados não estão no formato correto, ajustando...');
                    
                    // Se tiver o WizardSaveSystemV2, usar ele
                    if (window.WizardSaveSystemV2) {
                        // Garantir que todos os dados estejam salvos
                        for (let i = 1; i <= 8; i++) {
                            window.WizardSaveSystemV2.salvarStepAtual(i);
                        }
                        
                        // Obter dados completos
                        const dadosCompletos = window.WizardSaveSystemV2.obterDadosCompletos();
                        console.log('✅ Dados do WizardSaveSystemV2:', dadosCompletos);
                        
                        // Substituir body com dados corretos
                        options.body = JSON.stringify(dadosCompletos);
                        console.log('📤 Enviando dados ajustados');
                    } else {
                        // Fallback: reorganizar dados existentes
                        const dadosReorganizados = {
                            evento: dados,
                            ingressos: dados.ingressos || []
                        };
                        
                        // Remover ingressos do objeto evento se existir
                        if (dadosReorganizados.evento.ingressos) {
                            delete dadosReorganizados.evento.ingressos;
                        }
                        
                        options.body = JSON.stringify(dadosReorganizados);
                        console.log('📤 Enviando dados reorganizados:', dadosReorganizados);
                    }
                } else {
                    console.log('✅ Dados já estão no formato correto');
                }
            } catch (e) {
                console.error('❌ Erro ao processar dados:', e);
            }
        }
        
        // Chamar fetch original
        return originalFetch.apply(this, [url, options]);
    };
    
    console.log('✅ Correção do formato de envio instalada');
})();