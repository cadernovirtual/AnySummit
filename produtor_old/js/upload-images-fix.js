// Fix para upload de imagens na etapa 1
(function() {
    console.log('🖼️ Fix de upload de imagens iniciado...');
    
    // Garantir que window.uploadedImages existe
    window.uploadedImages = window.uploadedImages || {};
    
    // Override da função handleImageUpload para garantir que funcione
    const originalHandleImageUpload = window.handleImageUpload;
    
    window.handleImageUpload = async function(input, containerId, type) {
        console.log(`📸 Upload de ${type} iniciado...`);
        
        const file = input.files[0];
        if (!file) {
            console.log('❌ Nenhum arquivo selecionado');
            return;
        }
        
        console.log(`📁 Arquivo selecionado: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
        
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
        
        // Mostrar preview local imediatamente
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log(`🖼️ Preview local criado para ${type}`);
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
                
                // Criar preview com imagem
                container.innerHTML = `
                    <img src="${e.target.result}" alt="${type}" style="max-width: 100%; height: auto;">
                    <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    <div class="upload-hint">${dimensions}</div>
                `;
                
                // Salvar preview local temporariamente
                window.uploadedImages[type + '_preview'] = e.target.result;
                
                // Mostrar botão de limpar
                const clearButton = document.getElementById('clear' + type.charAt(0).toUpperCase() + type.slice(1));
                if (clearButton) {
                    clearButton.style.display = 'flex';
                }
                
                // Forçar atualização do preview
                if (typeof updatePreview === 'function') {
                    updatePreview();
                }
            } else {
                console.error(`❌ Container ${containerId} não encontrado`);
            }
        };
        reader.readAsDataURL(file);
        
        // Fazer upload para o servidor
        const formData = new FormData();
        formData.append('imagem', file);
        formData.append('tipo', type);
        
        try {
            console.log(`📤 Enviando ${type} para o servidor...`);
            
            const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            console.log(`📡 Resposta do servidor: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('📄 Resposta bruta:', text);
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('❌ Erro ao parsear JSON:', e);
                console.error('Resposta recebida:', text);
                throw new Error('Resposta inválida do servidor');
            }
            
            if (data.success) {
                console.log(`✅ ${type} enviado com sucesso:`, data.image_url);
                
                // Salvar URL da imagem
                window.uploadedImages[type] = data.image_url;
                
                // Atualizar preview com URL do servidor
                const container = document.getElementById(containerId);
                if (container) {
                    const img = container.querySelector('img');
                    if (img) {
                        img.src = data.image_url;
                    }
                }
                
                // Salvar no wizard
                if (typeof saveWizardData === 'function') {
                    saveWizardData();
                }
                
                // Atualizar preview
                if (typeof updatePreview === 'function') {
                    updatePreview();
                }
            } else {
                console.error('❌ Erro no upload:', data.message);
                alert('Erro ao fazer upload: ' + data.message);
            }
        } catch (error) {
            console.error('❌ Erro ao fazer upload:', error);
            alert('Erro ao fazer upload da imagem. Verifique o console para mais detalhes.');
        }
    };
    
    // Garantir que os event listeners estão configurados
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎯 Configurando event listeners de upload...');
        
        // Logo
        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            logoUpload.addEventListener('change', function() {
                handleImageUpload(this, 'logoPreviewContainer', 'logo');
            });
        }
        
        // Capa
        const capaUpload = document.getElementById('capaUpload');
        if (capaUpload) {
            capaUpload.addEventListener('change', function() {
                handleImageUpload(this, 'capaPreviewContainer', 'capa');
            });
        }
        
        // Fundo
        const fundoUpload = document.getElementById('fundoUpload');
        if (fundoUpload) {
            fundoUpload.addEventListener('change', function() {
                handleImageUpload(this, 'fundoPreviewMain', 'fundo');
            });
        }
        
        console.log('✅ Event listeners configurados');
    });
    
    // Função para debug
    window.debugUploadImages = function() {
        console.log('🖼️ Estado das imagens:');
        console.log('uploadedImages:', window.uploadedImages);
        
        ['logo', 'capa', 'fundo'].forEach(type => {
            const preview = document.getElementById(type + 'Preview');
            const upload = document.getElementById(type + 'Upload');
            
            console.log(`\n${type.toUpperCase()}:`);
            console.log(`- Preview element:`, preview);
            console.log(`- Upload element:`, upload);
            console.log(`- URL salva:`, window.uploadedImages[type]);
            
            if (preview) {
                const img = preview.querySelector('img');
                console.log(`- Tem imagem no preview:`, !!img);
                if (img) {
                    console.log(`- Src da imagem:`, img.src);
                }
            }
        });
    };
    
    console.log('✅ Fix de upload carregado! Use debugUploadImages() para verificar estado');
})();