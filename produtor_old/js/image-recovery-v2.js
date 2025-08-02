/**
 * Sistema de Recuperação de Imagens do Wizard V2
 * Restaura imagens ao recarregar a página
 */
(function() {
    console.log('🖼️ Sistema de recuperação de imagens V2 iniciado');
    
    // Aguardar carregamento do DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // Recuperar dados do wizard
        recuperarImagens();
        
        // Adicionar listener para mudanças no wizard
        if (window.WizardSaveSystemV2) {
            const originalRecuperar = window.WizardSaveSystemV2.recuperarDeCookies;
            window.WizardSaveSystemV2.recuperarDeCookies = function() {
                originalRecuperar.call(this);
                recuperarImagens();
            };
        }
    }
    
    function recuperarImagens() {
        console.log('🔄 Recuperando imagens salvas...');
        
        // Tentar recuperar do WizardSaveSystemV2
        let dadosImagens = null;
        
        if (window.WizardSaveSystemV2 && window.WizardSaveSystemV2.dadosEvento.evento) {
            dadosImagens = window.WizardSaveSystemV2.dadosEvento.evento;
        } else {
            // Tentar recuperar direto do cookie
            const cookieData = getCookie('eventoWizardV2') || getCookie('eventoWizard');
            if (cookieData) {
                try {
                    const parsed = JSON.parse(cookieData);
                    dadosImagens = parsed.evento || parsed;
                } catch (e) {
                    console.error('Erro ao parsear cookie:', e);
                }
            }
        }
        
        if (!dadosImagens) {
            console.log('❌ Nenhum dado de imagem encontrado');
            return;
        }
        
        // Recuperar logo
        if (dadosImagens.logo_url || dadosImagens.logoUrl || dadosImagens.logoPath) {
            const logoUrl = dadosImagens.logo_url || dadosImagens.logoUrl || dadosImagens.logoPath;
            restaurarImagem('logo', logoUrl);
        }
        
        // Recuperar capa
        if (dadosImagens.capa_url || dadosImagens.capaUrl || dadosImagens.capaPath) {
            const capaUrl = dadosImagens.capa_url || dadosImagens.capaUrl || dadosImagens.capaPath;
            restaurarImagem('capa', capaUrl);
        }
        
        // Recuperar fundo
        if (dadosImagens.fundo_url || dadosImagens.fundoUrl || dadosImagens.fundoPath) {
            const fundoUrl = dadosImagens.fundo_url || dadosImagens.fundoUrl || dadosImagens.fundoPath;
            restaurarImagem('fundo', fundoUrl);
        }
        
        // Recuperar cor de fundo
        if (dadosImagens.cor_fundo || dadosImagens.corFundo) {
            const cor = dadosImagens.cor_fundo || dadosImagens.corFundo;
            const corInput = document.getElementById('corFundo');
            if (corInput) {
                corInput.value = cor;
                console.log('✅ Cor de fundo recuperada:', cor);
            }
        }
        
        // Atualizar window.uploadedImages se existir
        if (!window.uploadedImages) {
            window.uploadedImages = {};
        }
        
        if (dadosImagens.logo_url) window.uploadedImages.logo = dadosImagens.logo_url;
        if (dadosImagens.capa_url) window.uploadedImages.capa = dadosImagens.capa_url;
        if (dadosImagens.fundo_url) window.uploadedImages.fundo = dadosImagens.fundo_url;
    }
    
    function restaurarImagem(tipo, url) {
        if (!url || url.includes('blob:')) {
            console.log(`⏭️ Ignorando ${tipo} - URL inválida ou blob`);
            return;
        }
        
        console.log(`🖼️ Restaurando ${tipo}:`, url);
        
        // Containers de preview
        const containers = {
            logo: ['#logoPreviewContainer', '#logoPreview'],
            capa: ['#capaPreviewContainer', '#capaPreview'],
            fundo: ['#fundoPreviewContainer', '#fundoPreviewMain', '#fundoPreview']
        };
        
        const seletores = containers[tipo] || [];
        
        seletores.forEach(seletor => {
            const container = document.querySelector(seletor);
            if (container) {
                // Remover imagem default se existir
                const defaultImg = container.querySelector('img[src*="default"], img[src*="placeholder"], img.default-image');
                if (defaultImg) {
                    defaultImg.remove();
                    console.log(`🗑️ Removida imagem default de ${tipo}`);
                }
                
                // Procurar img existente ou criar nova
                let img = container.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    container.appendChild(img);
                }
                
                // Definir src
                img.src = url;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                // Mostrar container se estiver oculto
                container.style.display = 'block';
                
                // Remover classes de vazio/default
                container.classList.remove('empty', 'default', 'no-image');
                
                // Para containers com ícone default, escondê-lo
                const defaultIcon = container.querySelector('.default-icon, .upload-icon, .placeholder-icon');
                if (defaultIcon) {
                    defaultIcon.style.display = 'none';
                }
                
                // Para o preview principal do fundo
                if (seletor === '#fundoPreviewMain') {
                    img.style.position = 'absolute';
                    img.style.top = '0';
                    img.style.left = '0';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.zIndex = '0';
                }
                
                // Esconder texto de resolução se existir
                const resolutionText = container.parentElement?.querySelector('.resolution-text, .image-requirements, .upload-hint');
                if (resolutionText) {
                    resolutionText.style.display = 'none';
                    console.log(`🚫 Ocultada indicação de resolução de ${tipo}`);
                }
                
                console.log(`✅ ${tipo} restaurado em ${seletor}`);
            }
        });
        
        // Marcar checkbox se existir
        const checkbox = document.querySelector(`input[type="checkbox"][data-image-type="${tipo}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
    
    // Função auxiliar getCookie se não existir
    if (typeof getCookie === 'undefined') {
        window.getCookie = function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
            return null;
        };
    }
    
    // Adicionar função de debug
    window.debugImagensRecuperadas = function() {
        console.log('=== DEBUG IMAGENS ===');
        console.log('uploadedImages:', window.uploadedImages);
        
        if (window.WizardSaveSystemV2) {
            const dados = window.WizardSaveSystemV2.dadosEvento.evento;
            console.log('Logo URL:', dados.logo_url);
            console.log('Capa URL:', dados.capa_url);
            console.log('Fundo URL:', dados.fundo_url);
            console.log('Cor fundo:', dados.cor_fundo);
        }
        
        // Verificar elementos no DOM
        console.log('Logo img:', document.querySelector('#logoPreviewContainer img')?.src);
        console.log('Capa img:', document.querySelector('#capaPreviewContainer img')?.src);
        console.log('Fundo img:', document.querySelector('#fundoPreviewMain img')?.src);
    };
    
    console.log('💡 Use debugImagensRecuperadas() para verificar imagens');
})();