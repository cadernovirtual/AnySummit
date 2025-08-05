/**
 * Correções finais para preview, descrição e endereço
 */

(function() {
    'use strict';
    
    console.log('🔧 Correções finais ativadas');
    
    // 1. Forçar updatePreview após carregar imagens
    const originalUpdatePreview = window.updatePreview;
    if (originalUpdatePreview) {
        window.updatePreview = function() {
            console.log('🎨 Atualizando preview...');
            
            // Chamar original
            originalUpdatePreview.apply(this, arguments);
            
            // Atualizar imagens no preview se existirem
            if (window.uploadedImages) {
                // Logo no preview
                const previewLogo = document.querySelector('.preview-logo img');
                if (previewLogo && window.uploadedImages.logo) {
                    previewLogo.src = window.uploadedImages.logo;
                }
                
                // Capa no preview
                const previewCapa = document.querySelector('.preview-image img');
                if (previewCapa && window.uploadedImages.capa) {
                    previewCapa.src = window.uploadedImages.capa;
                }
                
                // Fundo no preview
                const previewContainer = document.querySelector('.preview-container');
                if (previewContainer && window.uploadedImages.fundo) {
                    previewContainer.style.backgroundImage = `url(${window.uploadedImages.fundo})`;
                }
            }
        };
    }
    
    // 2. Função searchAddress removida - causava loop infinito
    
    // 3. Interceptar e corrigir busca de endereço
    document.addEventListener('DOMContentLoaded', function() {
        // Adicionar listener ao campo de busca
        const addressInput = document.getElementById('addressSearch');
        if (addressInput) {
            // Remover readonly se existir
            addressInput.removeAttribute('readonly');
            
            // Adicionar listener para Enter
            addressInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Não fazer nada - deixar o autocomplete funcionar
                }
            });
        }
    });
    
    // 4. Atualizar preview quando mudar nome do evento
    document.addEventListener('DOMContentLoaded', function() {
        const eventNameInput = document.getElementById('eventName');
        if (eventNameInput) {
            // Listener já deve existir, mas garantir
            eventNameInput.addEventListener('input', function() {
                if (window.updatePreview) {
                    window.updatePreview();
                }
            });
        }
    });
    
    // 5. Chamar updatePreview após retomar rascunho
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('evento_id')) {
        // Aguardar dados carregarem e chamar updatePreview
        setTimeout(() => {
            if (window.updatePreview) {
                console.log('🔄 Chamando updatePreview após retomar rascunho');
                window.updatePreview();
            }
        }, 4000); // 4 segundos para garantir que imagens foram carregadas
    }
    
})();
