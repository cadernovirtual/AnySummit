// Fix para garantir que upload de imagens funcione
console.log('🖼️ Aplicando fix de upload de imagens...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📸 Verificando elementos de upload...');
    
    // Verificar se os elementos existem
    const logoUpload = document.getElementById('logoUpload');
    const capaUpload = document.getElementById('capaUpload');
    const fundoUpload = document.getElementById('fundoUpload');
    
    console.log('Elementos encontrados:', {
        logo: !!logoUpload,
        capa: !!capaUpload,
        fundo: !!fundoUpload
    });
    
    // Se handleImageUpload não existir, criar uma versão básica
    if (typeof window.handleImageUpload !== 'function') {
        console.warn('⚠️ handleImageUpload não encontrada, criando versão de emergência...');
        
        window.handleImageUpload = async function(input, containerId, type) {
            console.log('🎨 handleImageUpload chamada:', type);
            const file = input.files[0];
            if (!file) return;

            // Validar tipo
            if (!file.type.match('image.*')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            // Mostrar preview local
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
                    
                    console.log('✅ Preview atualizado para:', type);

                    // Atualizar preview se existir
                    if (typeof window.updatePreview === 'function') {
                        window.updatePreview();
                    }
                    
                    // Salvar dados se existir
                    if (typeof window.saveWizardData === 'function') {
                        window.saveWizardData();
                    }
                }
            };
            reader.readAsDataURL(file);

            // Upload para servidor
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
                        if (!window.uploadedImages) {
                            window.uploadedImages = {};
                        }
                        window.uploadedImages[type] = data.image_url;
                        console.log(`✅ ${type} enviado ao servidor:`, data.image_url);
                    }
                }
            } catch (error) {
                console.error('Erro ao fazer upload:', error);
            }
        };
    }
    
    // Adicionar listeners manualmente se necessário
    if (logoUpload && !logoUpload.hasAttribute('data-listener-added')) {
        logoUpload.addEventListener('change', function() {
            console.log('🖼️ Logo selecionado');
            window.handleImageUpload(this, 'logoPreviewContainer', 'logo');
        });
        logoUpload.setAttribute('data-listener-added', 'true');
    }
    
    if (capaUpload && !capaUpload.hasAttribute('data-listener-added')) {
        capaUpload.addEventListener('change', function() {
            console.log('🖼️ Capa selecionada');
            window.handleImageUpload(this, 'capaPreviewContainer', 'capa');
        });
        capaUpload.setAttribute('data-listener-added', 'true');
    }
    
    if (fundoUpload && !fundoUpload.hasAttribute('data-listener-added')) {
        fundoUpload.addEventListener('change', function() {
            console.log('🖼️ Fundo selecionado');
            // Verificar se é o preview principal ou o container pequeno
            const mainPreview = document.getElementById('fundoPreviewMain');
            if (mainPreview) {
                window.handleImageUpload(this, 'fundoPreviewMain', 'fundo');
            } else {
                window.handleImageUpload(this, 'fundoPreviewContainer', 'fundo');
            }
        });
        fundoUpload.setAttribute('data-listener-added', 'true');
    }
    
    console.log('✅ Fix de upload aplicado com sucesso!');
});