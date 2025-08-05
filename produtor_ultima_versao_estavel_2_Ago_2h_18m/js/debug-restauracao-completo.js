/**
 * Debug completo para entender por que as imagens não estão sendo restauradas
 */

(function() {
    'use strict';
    
    console.log('🔍 Debug de restauração de imagens iniciado');
    
    // Monitorar quando os dados são recebidos
    const originalRetomarEvento = window.retomarEvento;
    if (originalRetomarEvento) {
        window.retomarEvento = function(id) {
            console.log('📋 Interceptando retomar evento:', id);
            
            // Interceptar a resposta do fetch
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
                if (url.includes('wizard_evento.php') && options.body && options.body.includes('retomar_evento')) {
                    console.log('📡 Requisição para retomar evento detectada');
                    
                    return originalFetch.apply(this, arguments)
                        .then(response => {
                            // Clonar resposta para ler
                            const cloned = response.clone();
                            cloned.json().then(data => {
                                console.log('📦 Dados recebidos do servidor:', data);
                                if (data.evento) {
                                    console.log('🖼️ Imagens no evento:', {
                                        logo: data.evento.logo_evento,
                                        capa: data.evento.imagem_capa,
                                        fundo: data.evento.imagem_fundo
                                    });
                                }
                            });
                            return response;
                        });
                }
                return originalFetch.apply(this, arguments);
            };
            
            // Chamar original
            originalRetomarEvento.apply(this, arguments);
            
            // Restaurar fetch original após alguns segundos
            setTimeout(() => {
                window.fetch = originalFetch;
            }, 5000);
        };
    }
    
    // Verificar periodicamente o estado das variáveis
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        
        console.log(`🔄 Verificação ${checkCount}:`);
        console.log('- window.uploadedImages:', window.uploadedImages);
        console.log('- Containers:', {
            logo: document.getElementById('logoPreviewContainer')?.innerHTML?.substring(0, 100),
            capa: document.getElementById('capaPreviewContainer')?.innerHTML?.substring(0, 100),
            fundo: document.getElementById('fundoPreviewMain')?.innerHTML?.substring(0, 100)
        });
        
        if (checkCount >= 10) {
            clearInterval(checkInterval);
        }
    }, 1000);
    
    // Adicionar função global para debug manual
    window.debugRestaurarImagens = function() {
        console.log('🔧 Debug manual de imagens:');
        console.log('- window.uploadedImages:', window.uploadedImages);
        console.log('- window.getEventoId():', window.getEventoId ? window.getEventoId() : 'função não existe');
        
        // Tentar buscar dados do evento manualmente
        if (window.getEventoId && window.getEventoId()) {
            console.log('📡 Tentando buscar dados do evento manualmente...');
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=retomar_evento&evento_id=${window.getEventoId()}`
            })
            .then(response => response.json())
            .then(data => {
                console.log('📦 Resposta manual:', data);
                if (data.sucesso && data.evento) {
                    console.log('🎯 Tentando preencher manualmente...');
                    
                    // Preencher imagens manualmente
                    if (data.evento.logo_evento) {
                        const logoContainer = document.getElementById('logoPreviewContainer');
                        if (logoContainer) {
                            logoContainer.innerHTML = `
                                <img src="${data.evento.logo_evento}" alt="Logo" style="max-width: 100%; height: auto;">
                                <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                                <div class="upload-hint">800x200px</div>
                            `;
                            document.getElementById('clearLogo').style.display = 'flex';
                            console.log('✅ Logo restaurado manualmente');
                        }
                    }
                    
                    if (data.evento.imagem_capa) {
                        const capaContainer = document.getElementById('capaPreviewContainer');
                        if (capaContainer) {
                            capaContainer.innerHTML = `
                                <img src="${data.evento.imagem_capa}" alt="Capa" style="max-width: 100%; height: auto;">
                                <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                                <div class="upload-hint">450x450px</div>
                            `;
                            document.getElementById('clearCapa').style.display = 'flex';
                            console.log('✅ Capa restaurada manualmente');
                        }
                    }
                    
                    if (data.evento.imagem_fundo) {
                        const fundoContainer = document.getElementById('fundoPreviewMain');
                        if (fundoContainer) {
                            fundoContainer.innerHTML = `
                                <img src="${data.evento.imagem_fundo}" alt="Fundo" style="max-width: 100%; height: auto;">
                            `;
                            document.getElementById('clearFundo').style.display = 'flex';
                            console.log('✅ Fundo restaurado manualmente');
                        }
                    }
                    
                    // Atualizar window.uploadedImages
                    if (!window.uploadedImages) window.uploadedImages = {};
                    if (data.evento.logo_evento) window.uploadedImages.logo = data.evento.logo_evento;
                    if (data.evento.imagem_capa) window.uploadedImages.capa = data.evento.imagem_capa;
                    if (data.evento.imagem_fundo) window.uploadedImages.fundo = data.evento.imagem_fundo;
                    
                    console.log('✅ window.uploadedImages atualizado:', window.uploadedImages);
                }
            })
            .catch(error => {
                console.error('❌ Erro ao buscar manualmente:', error);
            });
        }
    };
    
    console.log('💡 Execute debugRestaurarImagens() no console para debug manual');
    
})();
