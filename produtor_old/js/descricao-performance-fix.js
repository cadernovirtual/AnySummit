/**
 * Correção para performance na digitação da descrição
 * Remove o update em tempo real que está travando
 */

(function() {
    console.log('🔧 Aplicando correção de performance na descrição...');
    
    // Aguardar DOM carregar
    function aplicarCorrecao() {
        const eventDescription = document.getElementById('eventDescription');
        
        if (!eventDescription) {
            console.warn('Campo eventDescription não encontrado, tentando novamente...');
            setTimeout(aplicarCorrecao, 500);
            return;
        }
        
        console.log('📝 Removendo listeners problemáticos do campo descrição...');
        
        // Remover todos os event listeners de input
        const newDescription = eventDescription.cloneNode(true);
        eventDescription.parentNode.replaceChild(newDescription, eventDescription);
        
        // Adicionar apenas listener de blur (ao sair do campo)
        newDescription.addEventListener('blur', function() {
            console.log('💾 Salvando descrição ao sair do campo...');
            if (window.saveWizardData) {
                window.saveWizardData();
            }
            if (window.updatePreview) {
                window.updatePreview();
            }
        });
        
        // Adicionar listener para Ctrl+S para salvar manualmente
        newDescription.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                console.log('💾 Salvamento manual (Ctrl+S)...');
                if (window.saveWizardData) {
                    window.saveWizardData();
                }
                if (window.updatePreview) {
                    window.updatePreview();
                }
            }
        });
        
        console.log('✅ Correção de performance aplicada! Descrição só atualiza ao sair do campo.');
    }
    
    // Aplicar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarCorrecao);
    } else {
        aplicarCorrecao();
    }
})();