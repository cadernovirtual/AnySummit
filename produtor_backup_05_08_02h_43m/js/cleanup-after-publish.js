// Fix para limpar dados após publicar evento
console.log('🧹 Configurando limpeza após publicação...');

(function() {
    // Aguardar DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        
        // Interceptar função publishEvent
        const originalPublishEvent = window.publishEvent;
        
        if (originalPublishEvent) {
            window.publishEvent = async function() {
                console.log('📤 Publicando evento...');
                
                // Chamar função original
                const result = await originalPublishEvent.apply(this, arguments);
                
                // Se publicou com sucesso, limpar dados
                if (result !== false) {
                    console.log('✅ Evento publicado - limpando dados do wizard...');
                    
                    setTimeout(() => {
                        if (window.limparTodosOsDadosDoWizard) {
                            window.limparTodosOsDadosDoWizard();
                        } else {
                            // Fallback - limpar manualmente
                            document.cookie = "eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            localStorage.removeItem('eventoWizard');
                            console.log('✅ Dados limpos após publicação');
                        }
                    }, 2000); // Aguardar 2s para garantir que tudo foi processado
                }
                
                return result;
            };
        }
        
        // Também limpar ao clicar em "Cancelar"
        const cancelButtons = document.querySelectorAll('.btn-cancel');
        cancelButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
                    console.log('❌ Wizard cancelado - limpando dados...');
                    if (window.limparTodosOsDadosDoWizard) {
                        window.limparTodosOsDadosDoWizard();
                    }
                } else {
                    e.preventDefault();
                }
            });
        });
        
        console.log('✅ Limpeza configurada para publicação e cancelamento');
    });
})();