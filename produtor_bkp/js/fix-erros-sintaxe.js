// Fix para corrigir erros de sintaxe e duplicação
(function() {
    console.log('🔧 Corrigindo erros de sintaxe...');
    
    // 1. Corrigir a função clearImage se estiver quebrada
    if (typeof clearImage === 'undefined') {
        window.clearImage = function(type, event) {
            // Prevenir propagação do clique
            if (event) {
                event.stopPropagation();
            }
            
            let containerId;
            let inputId;
            let clearButtonId;
            let defaultContent;
            
            switch(type) {
                case 'logo':
                    containerId = 'logoPreviewContainer';
                    inputId = 'logoUpload';
                    clearButtonId = 'clearLogo';
                    defaultContent = `
                        <div class="upload-icon">🎨</div>
                        <div class="upload-text">Adicionar logo</div>
                        <div class="upload-hint">800x200px • Fundo transparente</div>
                    `;
                    break;
                case 'capa':
                    containerId = 'capaPreviewContainer';
                    inputId = 'capaUpload';
                    clearButtonId = 'clearCapa';
                    defaultContent = `
                        <div class="upload-icon">🖼️</div>
                        <div class="upload-text">Adicionar capa</div>
                        <div class="upload-hint">450x450px • JPG ou PNG</div>
                    `;
                    break;
                case 'fundo':
                    containerId = 'fundoPreviewContainer';
                    inputId = 'fundoUpload';
                    clearButtonId = 'clearFundo';
                    defaultContent = `
                        <div class="upload-icon">🌄</div>
                        <div class="upload-text">Adicionar imagem de fundo</div>
                        <div class="upload-hint">1920x640px • JPG ou PNG</div>
                    `;
                    break;
            }
            
            // Limpar preview
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = defaultContent;
            }
            
            // Limpar input
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }
            
            // Esconder botão de limpar
            const clearButton = document.getElementById(clearButtonId);
            if (clearButton) {
                clearButton.style.display = 'none';
            }
            
            // Limpar dados salvos
            if (window.uploadedImages) {
                delete window.uploadedImages[type];
            }
            
            // Salvar mudança
            if (typeof saveWizardData === 'function') {
                saveWizardData();
            }
            
            // Atualizar preview
            if (typeof updatePreview === 'function') {
                updatePreview();
            }
        };
    }
    
    // 2. Garantir que initMap existe para o Google Maps
    if (typeof initMap === 'undefined') {
        window.initMap = function() {
            console.log('🗺️ Google Maps inicializado');
            
            // Chamar a função de inicialização de endereço se existir
            if (typeof initAddressSearch === 'function') {
                initAddressSearch();
            }
        };
    }
    
    // 3. Prevenir redeclaração de variáveis
    if (typeof window.temporaryTickets === 'undefined') {
        window.temporaryTickets = [];
    }
    
    if (typeof window.comboItems === 'undefined') {
        window.comboItems = [];
    }
    
    // 4. Garantir que getCookie existe
    if (typeof getCookie === 'undefined') {
        window.getCookie = function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };
    }
    
    // 5. Garantir que clearAllWizardData existe
    if (typeof clearAllWizardData === 'undefined') {
        window.clearAllWizardData = function() {
            console.log('🗑️ Limpando todos os dados do wizard...');
            document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'ingressosSalvos=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'ingressosData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        };
    }
    
    console.log('✅ Correções de sintaxe aplicadas');
})();