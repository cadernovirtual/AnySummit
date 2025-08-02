/**
 * Interceptador do Wizard v2 - SIMPLIFICADO
 * Apenas intercepta para adicionar salvamento, sem criar funções
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Interceptador do Wizard v2');
    
    let tentativas = 0;
    const maxTentativas = 10;
    
    // Aguardar um pouco para garantir que todos os scripts carregaram
    setTimeout(function() {
        interceptarNavegacao();
    }, 100);
    
    function interceptarNavegacao() {
        tentativas++;
        
        // Verificar se existe a função nextStep original
        if (typeof window.nextStep === 'function') {
            console.log('✅ Função nextStep encontrada, interceptando...');
            
            // Salvar referência da função original
            const originalNextStep = window.nextStep;
            
            // Sobrescrever com nossa versão que salva antes de avançar
            window.nextStep = function() {
                console.log('🔄 nextStep interceptado');
                
                // Obter step atual
                const stepAtual = window.currentStep || window.getCurrentStep?.() || 1;
                console.log('📍 Step atual:', stepAtual);
                
                // Salvar dados do step atual ANTES de validar
                if (window.WizardSaveSystemV2) {
                    window.WizardSaveSystemV2.salvarStepAtual(stepAtual);
                }
                
                // Chamar função original (que já tem validação)
                return originalNextStep.apply(this, arguments);
            };
            
            console.log('✅ Interceptação configurada com sucesso');
            
        } else if (tentativas < maxTentativas) {
            console.warn(`⚠️ Função nextStep não encontrada, tentativa ${tentativas}/${maxTentativas}`);
            setTimeout(interceptarNavegacao, 500);
        } else {
            console.error('❌ Função nextStep não encontrada após máximo de tentativas');
        }
    }
    
    // Interceptar também cliques diretos nos botões (caso não usem nextStep)
    document.addEventListener('click', function(e) {
        // Verificar se é um botão de continuar
        if (e.target.classList.contains('btn-continue') || 
            (e.target.classList.contains('nav-btn') && e.target.textContent.includes('Avançar'))) {
            
            console.log('🖱️ Clique em botão Avançar detectado');
            
            // Salvar dados antes do clique ser processado
            const stepAtual = window.currentStep || window.getCurrentStep?.() || 1;
            
            if (window.WizardSaveSystemV2) {
                window.WizardSaveSystemV2.salvarStepAtual(stepAtual);
            }
        }
    }, true); // Usar capture para interceptar antes
    
    // Recuperar dados ao carregar a página
    if (window.WizardSaveSystemV2) {
        window.WizardSaveSystemV2.recuperarDeCookies();
        console.log('📥 Dados recuperados dos cookies');
    }
    
    // Adicionar função global para debug
    window.debugWizardV2 = function() {
        if (window.WizardSaveSystemV2) {
            console.log('=== DEBUG WIZARD V2 ===');
            console.log('Dados do evento:', window.WizardSaveSystemV2.dadosEvento);
            console.log('Lotes:', window.WizardSaveSystemV2.lotes);
            console.log('Dados completos:', window.WizardSaveSystemV2.obterDadosCompletos());
        }
    };
    
    console.log('💡 Para debug, execute: debugWizardV2()');
});