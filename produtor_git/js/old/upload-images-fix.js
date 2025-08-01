// ============================================
// UPLOAD IMAGES FIX - CORREÇÃO DE IDS
// ============================================

console.log('🖼️ Carregando correções de upload de imagens...');

document.addEventListener('DOMContentLoaded', function() {
    // Corrigir IDs dos containers
    const fixes = [
        { from: 'logoPreview', to: 'logoPreviewContainer' },
        { from: 'capaPreview', to: 'capaPreviewContainer' },
        { from: 'fundoPreview', to: 'fundoPreviewMain' }
    ];
    
    fixes.forEach(fix => {
        const element = document.getElementById(fix.from);
        if (element && !document.getElementById(fix.to)) {
            element.id = fix.to;
            console.log(`✅ ID corrigido: ${fix.from} → ${fix.to}`);
        }
    });
    
    // Garantir que os uploads funcionem
    setupImageUploads();
});

function setupImageUploads() {
    // Logo
    const logoUpload = document.getElementById('logoUpload');
    const logoContainer = document.getElementById('logoPreviewContainer');
    
    if (logoUpload && logoContainer) {
        logoUpload.addEventListener('change', function(e) {
            handleImagePreview(e, logoContainer);
        });
    }
    
    // Capa
    const capaUpload = document.getElementById('capaUpload');
    const capaContainer = document.getElementById('capaPreviewContainer');
    
    if (capaUpload && capaContainer) {
        capaUpload.addEventListener('change', function(e) {
            handleImagePreview(e, capaContainer);
        });
    }
    
    // Fundo
    const fundoUpload = document.getElementById('fundoUpload');
    const fundoContainer = document.getElementById('fundoPreviewMain');
    
    if (fundoUpload && fundoContainer) {
        fundoUpload.addEventListener('change', function(e) {
            handleImagePreview(e, fundoContainer);
        });
    }
}

function handleImagePreview(event, container) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Limpar container
            container.innerHTML = '';
            
            // Criar imagem
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            // Adicionar ao container
            container.appendChild(img);
            
            console.log('✅ Imagem carregada em', container.id);
        };
        
        reader.readAsDataURL(file);
    }
}

console.log('✅ Correções de upload de imagens carregadas');
