// Correção do Preview de Imagens
// AnySummit - Fix para atualização do preview hero

(function() {
    'use strict';
    
    console.log('🎨 Iniciando correção do preview...');
    
    // Aguardar DOM carregar
    function initPreviewFix() {
        console.log('✅ Preview Fix iniciado');
        
        // Substituir função updatePreview
        const originalUpdatePreview = window.updatePreview;
        window.updatePreview = function() {
            console.log('📸 updatePreview chamado');
            
            // Chamar função original se existir
            if (originalUpdatePreview) {
                originalUpdatePreview.apply(this, arguments);
            }
            
            // Garantir que updateHeroPreview seja chamado
            const eventName = document.getElementById('eventName')?.value || 'Nome do evento';
            const startDateTime = document.getElementById('startDateTime')?.value;
            const venueName = document.getElementById('venueName')?.value;
            const eventLink = document.getElementById('eventLink')?.value;
            const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
            
            updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential);
        };
        
        // Função para atualizar o preview hero
        window.updateHeroPreview = function(eventName, startDateTime, venueName, eventLink, isPresential) {
            console.log('🎨 Atualizando preview hero...');
            
            // Atualizar imagem de fundo
            const heroBackground = document.getElementById('heroBackground');
            const heroSection = document.querySelector('.hero-section-mini');
            const fundoImg = document.querySelector('#fundoPreviewMain img');
            const corFundo = document.getElementById('corFundo')?.value || '#000000';
            
            if (heroBackground && heroSection) {
                if (fundoImg && fundoImg.src && !fundoImg.src.includes('placeholder')) {
                    // Tem imagem de fundo
                    heroBackground.style.backgroundImage = `url(${fundoImg.src})`;
                    heroBackground.style.backgroundColor = '';
                    heroBackground.style.opacity = '1';
                    heroSection.classList.remove('solid-bg');
                    console.log('✅ Imagem de fundo aplicada:', fundoImg.src);
                } else {
                    // Usar cor sólida
                    heroBackground.style.backgroundImage = '';
                    heroBackground.style.backgroundColor = corFundo;
                    heroBackground.style.opacity = '1';
                    heroSection.classList.add('solid-bg');
                    console.log('✅ Cor de fundo aplicada:', corFundo);
                }
            }

            // Atualizar logo
            const heroLogo = document.getElementById('heroLogo');
            const logoImg = document.querySelector('#logoPreviewContainer img');
            
            if (heroLogo && logoImg && logoImg.src && !logoImg.src.includes('placeholder')) {
                heroLogo.src = logoImg.src;
                heroLogo.style.display = 'block';
                console.log('✅ Logo aplicado:', logoImg.src);
            } else if (heroLogo) {
                heroLogo.style.display = 'none';
            }

            // Atualizar imagem capa quadrada
            const heroCapa = document.getElementById('heroCapa');
            const capaImg = document.querySelector('#capaPreviewContainer img');
            
            if (heroCapa && capaImg && capaImg.src && !capaImg.src.includes('placeholder')) {
                heroCapa.src = capaImg.src;
                heroCapa.style.display = 'block';
                console.log('✅ Capa aplicada:', capaImg.src);
            } else if (heroCapa) {
                heroCapa.style.display = 'none';
            }
        };
        
        // Adicionar listener para o nome do evento
        const eventNameInput = document.getElementById('eventName');
        if (eventNameInput) {
            eventNameInput.addEventListener('input', function() {
                if (window.updatePreview) {
                    window.updatePreview();
                }
            });
        }
        
        // Fazer uma atualização inicial
        setTimeout(() => {
            if (window.updatePreview) {
                window.updatePreview();
            }
        }, 1000);
    }
    
    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreviewFix);
    } else {
        setTimeout(initPreviewFix, 100);
    }
    
})();