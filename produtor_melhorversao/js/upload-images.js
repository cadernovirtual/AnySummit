// Adicionar ao arquivo criaevento.js ou criar novo arquivo

// Variáveis globais para armazenar URLs das imagens
window.uploadedImages = {
    logo: '',
    capa: '',
    fundo: ''
};

// Função para fazer upload de imagem
async function uploadImage(file, tipo) {
    const formData = new FormData();
    formData.append('imagem', file);
    formData.append('tipo', tipo);
    
    try {
        const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Salvar URL da imagem
            window.uploadedImages[tipo] = result.image_url;
            console.log(`✅ Imagem ${tipo} enviada:`, result.image_url);
            return result.image_url;
        } else {
            throw new Error(result.message || 'Erro ao enviar imagem');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        alert(`Erro ao enviar ${tipo}: ${error.message}`);
        return null;
    }
}

// Adicionar event listeners aos inputs de arquivo
document.addEventListener('DOMContentLoaded', function() {
    // Logo
    const logoInput = document.getElementById('logoUpload');
    if (logoInput) {
        logoInput.addEventListener('change', async function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                
                // Mostrar preview localmente
                const reader = new FileReader();
                reader.onload = function(e) {
                    const container = document.getElementById('logoPreviewContainer');
                    container.innerHTML = `<img src="${e.target.result}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
                    document.getElementById('clearLogo').style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Fazer upload
                const url = await uploadImage(file, 'logo');
                if (url) {
                    // Salvar no wizard data
                    if (window.saveWizardData) {
                        window.saveWizardData();
                    }
                }
            }
        });
    }
    
    // Capa
    const capaInput = document.getElementById('capaUpload');
    if (capaInput) {
        capaInput.addEventListener('change', async function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                
                // Mostrar preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    const container = document.getElementById('capaPreviewContainer');
                    container.innerHTML = `<img src="${e.target.result}" alt="Capa" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
                    document.getElementById('clearCapa').style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Fazer upload
                const url = await uploadImage(file, 'capa');
                if (url) {
                    if (window.saveWizardData) {
                        window.saveWizardData();
                    }
                }
            }
        });
    }
    
    // Fundo
    const fundoInput = document.getElementById('fundoUpload');
    if (fundoInput) {
        fundoInput.addEventListener('change', async function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                
                // Mostrar preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    const container = document.getElementById('fundoPreviewMain');
                    container.style.backgroundImage = `url(${e.target.result})`;
                    container.style.backgroundSize = 'cover';
                    container.style.backgroundPosition = 'center';
                    container.innerHTML = '';
                    document.getElementById('clearFundo').style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Fazer upload
                const url = await uploadImage(file, 'fundo');
                if (url) {
                    if (window.saveWizardData) {
                        window.saveWizardData();
                    }
                }
            }
        });
    }
});

// Função para limpar imagem (atualizada)
window.clearImage = function(tipo, event) {
    if (event) {
        event.stopPropagation();
    }
    
    // Limpar URL salva
    window.uploadedImages[tipo] = '';
    
    // Limpar preview
    switch(tipo) {
        case 'logo':
            document.getElementById('logoPreviewContainer').innerHTML = `
                <div class="upload-icon">🎨</div>
                <div class="upload-text">Adicionar logo</div>
                <div class="upload-hint">800x200px • Fundo transparente</div>
            `;
            document.getElementById('clearLogo').style.display = 'none';
            document.getElementById('logoUpload').value = '';
            break;
            
        case 'capa':
            document.getElementById('capaPreviewContainer').innerHTML = `
                <div class="upload-icon">🖼️</div>
                <div class="upload-text">Adicionar capa</div>
                <div class="upload-hint">450x450px • Fundo transparente</div>
            `;
            document.getElementById('clearCapa').style.display = 'none';
            document.getElementById('capaUpload').value = '';
            break;
            
        case 'fundo':
            const fundoContainer = document.getElementById('fundoPreviewMain');
            fundoContainer.style.backgroundImage = '';
            fundoContainer.innerHTML = `
                <div class="upload-icon">🌄</div>
                <div class="upload-text">Clique para adicionar imagem de fundo</div>
                <div class="upload-hint">PNG, JPG até 5MB • Tamanho ideal: 1920x640px</div>
            `;
            document.getElementById('clearFundo').style.display = 'none';
            document.getElementById('fundoUpload').value = '';
            break;
    }
    
    // Salvar estado
    if (window.saveWizardData) {
        window.saveWizardData();
    }
};
