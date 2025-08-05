/**
 * Fix simples para garantir que lotes sejam renderizados ao entrar no step
 */

(function() {
    'use strict';
    
    console.log('🔧 Fix de renderização de lotes iniciado');
    
    // Observer para detectar quando entra no step 5
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                // Quando step-content 5 fica ativo
                if (target.dataset && target.dataset.stepContent === '5' && target.classList.contains('active')) {
                    console.log('📍 Entrou no step 5 - renderizando lotes em 500ms');
                    
                    setTimeout(() => {
                        if (window.renderizarLotesPorData) {
                            window.renderizarLotesPorData();
                        }
                        if (window.renderizarLotesPorPercentual) {
                            window.renderizarLotesPorPercentual();
                        }
                        if (window.atualizarSelectsLotes) {
                            window.atualizarSelectsLotes();
                        }
                    }, 500);
                }
            }
        });
    });
    
    // Configurar observer quando DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-step-content]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
    });
    
    console.log('✅ Fix de renderização carregado');
    
})();
