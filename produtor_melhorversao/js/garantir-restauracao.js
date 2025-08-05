/**
 * Garantir que imagens e cor sejam restauradas após todos os scripts carregarem
 */

(function() {
    'use strict';
    
    // Aguardar tudo carregar
    window.addEventListener('load', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('evento_id');
        
        if (!eventoId) return;
        
        console.log('🔄 Verificação final de restauração para evento:', eventoId);
        
        // Aguardar um pouco mais para garantir que tudo foi processado
        setTimeout(() => {
            // Verificar se as imagens foram carregadas
            const logoContainer = document.getElementById('logoPreviewContainer');
            const capaContainer = document.getElementById('capaPreviewContainer');
            const fundoContainer = document.getElementById('fundoPreviewMain');
            
            // Se os containers estão vazios, tentar buscar dados novamente
            if (logoContainer && !logoContainer.querySelector('img')) {
                console.log('⚠️ Logo não carregado, verificando window.uploadedImages...');
                if (window.uploadedImages && window.uploadedImages.logo) {
                    console.log('🔄 Restaurando logo de window.uploadedImages');
                    logoContainer.innerHTML = `
                        <img src="${window.uploadedImages.logo}" alt="Logo" style="max-width: 100%; height: auto;">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">800x200px</div>
                    `;
                    document.getElementById('clearLogo').style.display = 'flex';
                }
            }
            
            if (capaContainer && !capaContainer.querySelector('img')) {
                console.log('⚠️ Capa não carregada, verificando window.uploadedImages...');
                if (window.uploadedImages && window.uploadedImages.capa) {
                    console.log('🔄 Restaurando capa de window.uploadedImages');
                    capaContainer.innerHTML = `
                        <img src="${window.uploadedImages.capa}" alt="Capa" style="max-width: 100%; height: auto;">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">450x450px</div>
                    `;
                    document.getElementById('clearCapa').style.display = 'flex';
                }
            }
            
            if (fundoContainer && !fundoContainer.querySelector('img')) {
                console.log('⚠️ Fundo não carregado, verificando window.uploadedImages...');
                if (window.uploadedImages && window.uploadedImages.fundo) {
                    console.log('🔄 Restaurando fundo de window.uploadedImages');
                    fundoContainer.innerHTML = `
                        <img src="${window.uploadedImages.fundo}" alt="Fundo" style="max-width: 100%; height: auto;">
                    `;
                    document.getElementById('clearFundo').style.display = 'flex';
                }
            }
            
            // Verificar cor de fundo
            const corInput = document.getElementById('corFundo');
            const corDisplay = document.getElementById('colorPreview');
            
            if (corInput && corInput.value && corInput.value !== '#000000') {
                console.log('🎨 Aplicando cor de fundo:', corInput.value);
                if (corDisplay) {
                    corDisplay.style.backgroundColor = corInput.value;
                }
            }
            
        }, 2000); // Aguardar 2 segundos após load completo
    });
    
})();
