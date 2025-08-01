// Debug do upload de imagens
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG: Iniciando verificação de upload');
    
    // Verificar se os elementos existem
    const elementos = {
        logoUpload: document.getElementById('logoUpload'),
        capaUpload: document.getElementById('capaUpload'),
        fundoUpload: document.getElementById('fundoUpload'),
        logoContainer: document.getElementById('logoPreviewContainer'),
        capaContainer: document.getElementById('capaPreviewContainer')
    };
    
    console.log('📋 Elementos encontrados:', elementos);
    
    // Adicionar listener direto para teste
    if (elementos.logoUpload) {
        elementos.logoUpload.addEventListener('change', function(e) {
            console.log('🎯 LOGO UPLOAD ACIONADO!', e.target.files);
            
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                console.log('📁 Arquivo selecionado:', file.name, file.type, file.size);
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    console.log('✅ Arquivo lido com sucesso');
                    if (elementos.logoContainer) {
                        elementos.logoContainer.innerHTML = `
                            <img src="${event.target.result}" style="max-width: 100%; max-height: 120px;">
                            <div>Imagem carregada!</div>
                        `;
                        console.log('✅ Preview atualizado');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        console.log('✅ Listener adicionado ao logoUpload');
    } else {
        console.error('❌ logoUpload não encontrado!');
    }
    
    // Verificar se as funções globais existem
    console.log('🔍 Funções globais:', {
        nextStep: typeof window.nextStep,
        validateStep: typeof window.validateStep,
        handleImageUpload: typeof window.handleImageUpload,
        clearImage: typeof window.clearImage
    });
});

// Testar click direto
window.testUploadClick = function() {
    const logo = document.getElementById('logoUpload');
    if (logo) {
        logo.click();
        console.log('✅ Click simulado no logoUpload');
    } else {
        console.error('❌ logoUpload não encontrado para click');
    }
};