/**
 * Solução definitiva para carregar imagens ao retomar rascunho
 */

(function() {
    'use strict';
    
    // Verificar se está retomando evento
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) return;
    
    console.log('🎯 Solução definitiva para carregar imagens do evento:', eventoId);
    
    // Função para carregar imagens
    function carregarImagensDefinitivo() {
        console.log('🔄 Tentando carregar imagens definitivamente...');
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=retomar_evento&evento_id=${eventoId}`
        })
        .then(response => response.json())
        .then(data => {
            console.log('📦 Dados recebidos:', data);
            
            if (data.sucesso && data.evento) {
                const evento = data.evento;
                
                // Logo
                if (evento.logo_evento) {
                    const logoContainer = document.getElementById('logoPreviewContainer');
                    if (logoContainer) {
                        logoContainer.innerHTML = `
                            <img src="${evento.logo_evento}" alt="Logo" style="max-width: 100%; height: auto;">
                            <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                            <div class="upload-hint">800x200px</div>
                        `;
                        const clearBtn = document.getElementById('clearLogo');
                        if (clearBtn) clearBtn.style.display = 'flex';
                        console.log('✅ Logo carregado:', evento.logo_evento);
                    }
                }
                
                // Capa
                if (evento.imagem_capa) {
                    const capaContainer = document.getElementById('capaPreviewContainer');
                    if (capaContainer) {
                        capaContainer.innerHTML = `
                            <img src="${evento.imagem_capa}" alt="Capa" style="max-width: 100%; height: auto;">
                            <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                            <div class="upload-hint">450x450px</div>
                        `;
                        const clearBtn = document.getElementById('clearCapa');
                        if (clearBtn) clearBtn.style.display = 'flex';
                        console.log('✅ Capa carregada:', evento.imagem_capa);
                    }
                }
                
                // Fundo
                if (evento.imagem_fundo) {
                    const fundoContainer = document.getElementById('fundoPreviewMain');
                    if (fundoContainer) {
                        fundoContainer.innerHTML = `
                            <img src="${evento.imagem_fundo}" alt="Fundo" style="max-width: 100%; height: auto;">
                        `;
                        const clearBtn = document.getElementById('clearFundo');
                        if (clearBtn) clearBtn.style.display = 'flex';
                        console.log('✅ Fundo carregado:', evento.imagem_fundo);
                    }
                }
                
                // Atualizar window.uploadedImages
                if (!window.uploadedImages) window.uploadedImages = {};
                if (evento.logo_evento) window.uploadedImages.logo = evento.logo_evento;
                if (evento.imagem_capa) window.uploadedImages.capa = evento.imagem_capa;
                if (evento.imagem_fundo) window.uploadedImages.fundo = evento.imagem_fundo;
                
                console.log('✅ Imagens carregadas com sucesso!');
                console.log('📸 window.uploadedImages:', window.uploadedImages);
                
                // Atualizar preview
                if (window.updatePreview) {
                    console.log('🔄 Atualizando preview...');
                    window.updatePreview();
                } else {
                    console.log('⚠️ Função updatePreview não encontrada');
                }
            }
        })
        .catch(error => {
            console.error('❌ Erro ao carregar imagens:', error);
        });
    }
    
    // Executar após diferentes delays para garantir
    setTimeout(carregarImagensDefinitivo, 3000);  // 3 segundos
    setTimeout(carregarImagensDefinitivo, 5000);  // 5 segundos (fallback)
    
    // Adicionar função global para forçar carregamento
    window.forcarCarregamentoImagens = carregarImagensDefinitivo;
    
    console.log('💡 Execute forcarCarregamentoImagens() para carregar manualmente');
    
})();
