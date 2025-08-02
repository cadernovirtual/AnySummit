/**
 * Correção para restauração de imagens e cor de fundo ao retomar rascunho
 */

(function() {
    'use strict';
    
    console.log('🔧 Correção de restauração de rascunho ativada');
    
    // Interceptar a função preencherDadosEvento
    const originalPreencherDados = window.preencherDadosEvento;
    
    if (originalPreencherDados) {
        window.preencherDadosEvento = function(evento, lotes, ingressos) {
            console.log('🎯 Interceptando preenchimento de dados');
            
            // Chamar função original
            originalPreencherDados.apply(this, arguments);
            
            // Aguardar um pouco e tentar novamente para garantir
            setTimeout(() => {
                console.log('🔄 Tentando preencher novamente após delay...');
                
                // Cor de fundo
                if (evento.cor_fundo) {
                    const corFundoInput = document.getElementById('corFundo');
                    const bgColorDisplay = document.getElementById('colorPreview'); // Corrigido aqui
                    
                    if (corFundoInput && corFundoInput.value !== evento.cor_fundo) {
                        corFundoInput.value = evento.cor_fundo;
                        console.log('✅ Cor de fundo definida (retry):', evento.cor_fundo);
                        
                        // Disparar evento change
                        const changeEvent = new Event('change', { bubbles: true });
                        corFundoInput.dispatchEvent(changeEvent);
                    }
                    
                    if (bgColorDisplay) {
                        bgColorDisplay.style.backgroundColor = evento.cor_fundo;
                    }
                }
                
                // Imagens
                restaurarImagem('logo', evento.logo_evento, 'logoPreviewContainer', '800x200px');
                restaurarImagem('capa', evento.imagem_capa, 'capaPreviewContainer', '450x450px');
                restaurarImagemFundo(evento.imagem_fundo);
                
            }, 500);
        };
    }
    
    // Função auxiliar para restaurar imagem
    function restaurarImagem(tipo, url, containerId, hint) {
        if (!url) return;
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} não encontrado`);
            return;
        }
        
        console.log(`🖼️ Restaurando ${tipo}:`, url);
        
        // Criar HTML completo
        container.innerHTML = `
            <img src="${url}" alt="${tipo}" style="max-width: 100%; height: auto;">
            <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
            <div class="upload-hint">${hint}</div>
        `;
        
        // Salvar no window.uploadedImages
        if (!window.uploadedImages) window.uploadedImages = {};
        window.uploadedImages[tipo] = url;
        
        // Mostrar botão de limpar
        const clearBtn = document.getElementById(`clear${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
        if (clearBtn) {
            clearBtn.style.display = 'flex';
        }
        
        console.log(`✅ ${tipo} restaurado com sucesso`);
    }
    
    // Função específica para imagem de fundo
    function restaurarImagemFundo(url) {
        if (!url) return;
        
        const container = document.getElementById('fundoPreviewMain');
        if (!container) {
            // Tentar container alternativo
            const altContainer = document.getElementById('fundoPreviewContainer');
            if (altContainer) {
                altContainer.innerHTML = `<img src="${url}" alt="Fundo" style="max-width: 100%; height: auto;">`;
            }
            console.error('❌ Container fundoPreviewMain não encontrado');
            return;
        }
        
        console.log('🖼️ Restaurando imagem de fundo:', url);
        
        container.innerHTML = `<img src="${url}" alt="Fundo" style="max-width: 100%; height: auto;">`;
        
        // Salvar no window.uploadedImages
        if (!window.uploadedImages) window.uploadedImages = {};
        window.uploadedImages.fundo = url;
        
        // Mostrar botão de limpar
        const clearBtn = document.getElementById('clearFundo');
        if (clearBtn) {
            clearBtn.style.display = 'flex';
        }
        
        console.log('✅ Imagem de fundo restaurada com sucesso');
    }
    
    // Adicionar listener para quando a página carregar
    document.addEventListener('DOMContentLoaded', function() {
        // Se há evento_id na URL, aguardar e verificar se dados foram carregados
        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('evento_id');
        
        if (eventoId) {
            console.log('📋 Detectado evento_id na URL:', eventoId);
            
            // Verificar periodicamente se os dados foram carregados
            let tentativas = 0;
            const checkInterval = setInterval(() => {
                tentativas++;
                
                const eventName = document.getElementById('eventName');
                if (eventName && eventName.value) {
                    console.log('✅ Dados carregados após', tentativas, 'tentativas');
                    clearInterval(checkInterval);
                } else if (tentativas > 20) {
                    console.error('❌ Timeout ao aguardar dados');
                    clearInterval(checkInterval);
                }
            }, 500);
        }
    });
    
})();
