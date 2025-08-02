/**
 * Integração do Sistema de Salvamento V2 com Publicação
 * Conecta o WizardSaveSystemV2 com as funções de publicação existentes
 */
(function() {
    console.log('🔌 Iniciando integração do sistema de salvamento V2');
    
    // Aguardar carregamento completo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // Integrar com a função de coleta de dados existente
        interceptarColetaDados();
        
        // Integrar com o botão de publicação
        interceptarPublicacao();
    }
    
    /**
     * Interceptar a função coletarDadosFormulario para usar nosso sistema
     */
    function interceptarColetaDados() {
        // Se a função existir, sobrescrever
        if (typeof window.coletarDadosFormulario === 'function') {
            console.log('✅ Função coletarDadosFormulario encontrada, integrando...');
            
            const originalColetar = window.coletarDadosFormulario;
            
            window.coletarDadosFormulario = function() {
                console.log('🔄 coletarDadosFormulario interceptada');
                
                // Primeiro, garantir que todos os dados estejam salvos
                if (window.WizardSaveSystemV2) {
                    // Salvar step 8 (final) para garantir
                    window.WizardSaveSystemV2.salvarStep8();
                    
                    // Retornar dados no formato correto
                    const dados = window.WizardSaveSystemV2.obterDadosCompletos();
                    console.log('📤 Retornando dados do WizardSaveSystemV2:', dados);
                    return dados;
                }
                
                // Se não tiver o sistema V2, usar original
                return originalColetar.apply(this, arguments);
            };
        }
    }
    
    /**
     * Interceptar cliques no botão de publicação
     */
    function interceptarPublicacao() {
        document.addEventListener('click', function(e) {
            // Verificar se é o botão de publicação
            if (e.target.classList.contains('btn-publish') || 
                e.target.closest('.btn-publish')) {
                
                console.log('🚀 Clique em publicar detectado');
                
                // Garantir que todos os dados estejam salvos
                if (window.WizardSaveSystemV2) {
                    // Salvar todos os steps por garantia
                    for (let i = 1; i <= 8; i++) {
                        window.WizardSaveSystemV2.salvarStepAtual(i);
                    }
                    
                    console.log('✅ Todos os dados salvos antes da publicação');
                }
            }
        }, true);
    }
    
    // Adicionar função de debug para publicação
    window.debugPublicacaoV2 = function() {
        console.log('=== DEBUG PUBLICAÇÃO V2 ===');
        
        if (window.WizardSaveSystemV2) {
            const dados = window.WizardSaveSystemV2.obterDadosCompletos();
            console.log('Dados que serão enviados:', dados);
            console.log('JSON formatado:', JSON.stringify(dados, null, 2));
        }
        
        // Testar coleta
        if (window.coletarDadosFormulario) {
            const dadosColetados = window.coletarDadosFormulario();
            console.log('Dados coletados pela função:', dadosColetados);
        }
    };
    
    console.log('💡 Para debug de publicação, execute: debugPublicacaoV2()');
})();