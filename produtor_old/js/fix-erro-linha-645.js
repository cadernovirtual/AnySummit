// Fix DEFINITIVO para erro de sintaxe linha 645
(function() {
    console.log('🔧 Aplicando fix definitivo para erro linha 645...');
    
    // Sobrescrever a função problemática diretamente
    window.handleImageUpload = async function(input, containerId, type) {
        console.log(`📸 Upload de ${type} iniciado...`);
        
        const file = input.files[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }

        // Mostrar preview local primeiro
        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById(containerId);
            if (container) {
                let dimensions = '';
                switch(type) {
                    case 'logo':
                        dimensions = '800x200px';
                        break;
                    case 'capa':
                        dimensions = '450x450px';
                        break;
                    case 'fundo':
                        dimensions = '1920x640px';
                        break;
                }

                container.innerHTML = `
                    <img src="${e.target.result}" alt="${type}">
                    <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    <div class="upload-hint">${dimensions}</div>
                `;

                // Mostrar botão de limpar
                const clearButton = document.getElementById('clear' + type.charAt(0).toUpperCase() + type.slice(1));
                if (clearButton) {
                    clearButton.style.display = 'flex';
                }
            }
        };
        reader.readAsDataURL(file);

        // Fazer upload real para o servidor
        const formData = new FormData();
        formData.append('imagem', file);
        formData.append('tipo', type);

        try {
            const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Salvar caminho da imagem
                    if (!window.uploadedImages) {
                        window.uploadedImages = {};
                    }
                    window.uploadedImages[type] = data.image_url;
                    console.log(`✅ ${type} enviado:`, data.image_url);
                    
                    // Salvar no wizard
                    if (typeof saveWizardData === 'function') {
                        saveWizardData();
                    }
                    if (typeof updatePreview === 'function') {
                        updatePreview();
                    }
                } else {
                    console.error('Erro no upload:', data.message);
                }
            } else {
                console.error('Erro na resposta:', response.status);
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
        }
    };
    
    // Função handleMainImageUpload corrigida
    window.handleMainImageUpload = async function(input, containerId, type) {
        // Reusar a mesma lógica
        return handleImageUpload(input, containerId, type);
    };
    
    // Garantir que clearImage existe
    if (typeof clearImage === 'undefined') {
        window.clearImage = function(type, event) {
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
                    containerId = 'fundoPreviewMain';
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
            if (typeof updatePreview === 'function') {
                updatePreview();
            }
        };
    }
    
    console.log('✅ Fix definitivo aplicado - funções de upload corrigidas');
})();