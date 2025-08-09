// CORREÇÃO DEFINITIVA PARA IMAGENS QUEBRADAS - NOVO EVENTO
console.log('🔥 CARREGANDO CORREÇÃO DEFINITIVA DE IMAGENS...');

// Função que força a correção das imagens
function forceFixBrokenImages() {
    console.log('🖼️ Executando correção forçada de imagens...');
    
    // 1. Corrigir heroLogo
    const heroLogo = document.getElementById('heroLogo');
    if (heroLogo) {
        console.log('🔍 Verificando heroLogo...', heroLogo.src);
        
        if (!heroLogo.src || heroLogo.src === '' || heroLogo.src === window.location.href) {
            heroLogo.style.display = 'none';
            console.log('🚫 heroLogo OCULTADO (src inválido)');
        } else {
            // Testar se carrega
            const testImg = new Image();
            testImg.onload = function() {
                heroLogo.style.display = 'block';
                console.log('✅ heroLogo VALIDADO e EXIBIDO');
            };
            testImg.onerror = function() {
                heroLogo.style.display = 'none';
                console.log('❌ heroLogo FALHOU - OCULTADO');
            };
            testImg.src = heroLogo.src;
        }
        
        // Adicionar event listeners permanentes
        heroLogo.addEventListener('error', function() {
            this.style.display = 'none';
            console.log('❌ heroLogo ERROR event - OCULTADO');
        });
        heroLogo.addEventListener('load', function() {
            this.style.display = 'block';
            console.log('✅ heroLogo LOAD event - EXIBIDO');
        });
    } else {
        console.log('⚠️ heroLogo não encontrado');
    }
    
    // 2. Corrigir heroCapa
    const heroCapa = document.getElementById('heroCapa');
    if (heroCapa) {
        console.log('🔍 Verificando heroCapa...', heroCapa.src);
        
        if (!heroCapa.src || heroCapa.src === '' || heroCapa.src === window.location.href) {
            heroCapa.style.display = 'none';
            console.log('🚫 heroCapa OCULTADO (src inválido)');
        } else {
            // Testar se carrega
            const testImg = new Image();
            testImg.onload = function() {
                heroCapa.style.display = 'block';
                console.log('✅ heroCapa VALIDADO e EXIBIDO');
            };
            testImg.onerror = function() {
                heroCapa.style.display = 'none';
                console.log('❌ heroCapa FALHOU - OCULTADO');
            };
            testImg.src = heroCapa.src;
        }
        
        // Adicionar event listeners permanentes
        heroCapa.addEventListener('error', function() {
            this.style.display = 'none';
            console.log('❌ heroCapa ERROR event - OCULTADO');
        });
        heroCapa.addEventListener('load', function() {
            this.style.display = 'block';
            console.log('✅ heroCapa LOAD event - EXIBIDO');
        });
    } else {
        console.log('⚠️ heroCapa não encontrado');
    }
}

// Função para gerenciar background
function forceFixBackground() {
    console.log('🎨 Configurando gerenciamento de background...');
    
    const fundoUpload = document.getElementById('fundoUpload');
    const clearFundo = document.getElementById('clearFundo');
    
    if (fundoUpload && !fundoUpload._forcedHandler) {
        fundoUpload._forcedHandler = true;
        
        fundoUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            if (file && file.type.startsWith('image/')) {
                console.log('📁 PROCESSANDO upload de fundo:', file.name);
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Testar imagem
                    const testImg = new Image();
                    testImg.onload = function() {
                        // Aplicar em TODOS os possíveis elementos
                        const heroMiniBackground = document.querySelector('.hero-mini-background');
                        const heroContainer = document.querySelector('.hero-mini-container');
                        
                        if (heroMiniBackground) {
                            heroMiniBackground.style.backgroundImage = `url(${e.target.result})`;
                            heroMiniBackground.style.backgroundColor = '';
                            console.log('✅ Background aplicado em .hero-mini-background');
                        }
                        
                        if (heroContainer) {
                            heroContainer.style.backgroundImage = `url(${e.target.result})`;
                            console.log('✅ Background aplicado em .hero-mini-container');
                        }
                        
                        // Atualizar preview também
                        const fundoPreviewMain = document.getElementById('fundoPreviewMain');
                        if (fundoPreviewMain) {
                            fundoPreviewMain.innerHTML = `<img src="${e.target.result}" alt="Imagem de fundo">`;
                        }
                        
                        // Mostrar botão limpar
                        if (clearFundo) {
                            clearFundo.style.display = 'flex';
                        }
                        
                        console.log('✅ BACKGROUND APLICADO COM SUCESSO');
                    };
                    testImg.onerror = function() {
                        console.error('❌ Erro ao carregar imagem de fundo');
                        alert('Erro ao carregar a imagem. Tente outro arquivo.');
                    };
                    testImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        console.log('✅ Event listener do fundoUpload configurado');
    }
    
    if (clearFundo && !clearFundo._forcedHandler) {
        clearFundo._forcedHandler = true;
        
        clearFundo.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('🗑️ LIMPANDO background...');
            
            // Obter cor
            const corFundoHex = document.getElementById('corFundoHex');
            const corFundo = document.getElementById('corFundo');
            let corHex = '#000000';
            
            if (corFundoHex && corFundoHex.value) {
                corHex = corFundoHex.value;
            } else if (corFundo && corFundo.value) {
                corHex = corFundo.value;
            }
            
            console.log('🎨 Aplicando cor:', corHex);
            
            // Remover background de TODOS os elementos
            const heroMiniBackground = document.querySelector('.hero-mini-background');
            const heroContainer = document.querySelector('.hero-mini-container');
            
            if (heroMiniBackground) {
                heroMiniBackground.style.backgroundImage = '';
                heroMiniBackground.style.backgroundColor = corHex;
                console.log('✅ Background removido de .hero-mini-background, cor aplicada');
            }
            
            if (heroContainer) {
                heroContainer.style.backgroundImage = '';
                heroContainer.style.backgroundColor = corHex;
                console.log('✅ Background removido de .hero-mini-container, cor aplicada');
            }
            
            // Restaurar preview
            const fundoPreviewMain = document.getElementById('fundoPreviewMain');
            if (fundoPreviewMain) {
                fundoPreviewMain.innerHTML = `
                    <div class="upload-icon">🌄</div>
                    <div class="upload-text">Clique para adicionar imagem de fundo</div>
                    <div class="upload-hint">PNG, JPG até 5MB • Tamanho ideal: 1920x640px</div>
                `;
            }
            
            // Ocultar botão
            clearFundo.style.display = 'none';
            
            // Limpar input
            if (fundoUpload) {
                fundoUpload.value = '';
            }
            
            console.log('✅ BACKGROUND LIMPO COM SUCESSO');
        });
        
        console.log('✅ Event listener do clearFundo configurado');
    }
}

// Sobrescrever função global updateImageSrc para garantir funcionamento
window.updateImageSrc = function(imageId, newSrc) {
    console.log('🔄 updateImageSrc chamado:', imageId, newSrc);
    
    const img = document.getElementById(imageId);
    if (img) {
        if (newSrc && newSrc.trim() !== '') {
            const testImg = new Image();
            testImg.onload = function() {
                img.src = newSrc;
                img.style.display = 'block';
                console.log(`✅ updateImageSrc: ${imageId} ATUALIZADO e EXIBIDO`);
            };
            testImg.onerror = function() {
                img.style.display = 'none';
                console.log(`❌ updateImageSrc: ${imageId} FALHOU - OCULTADO`);
            };
            testImg.src = newSrc;
        } else {
            img.style.display = 'none';
            console.log(`🚫 updateImageSrc: ${imageId} OCULTADO (src vazio)`);
        }
    }
};

// Executar correções imediatamente e em múltiplos momentos
function executeCorrections() {
    console.log('⚡ EXECUTANDO TODAS AS CORREÇÕES...');
    forceFixBrokenImages();
    forceFixBackground();
}

// Executar imediatamente
executeCorrections();

// Executar quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', executeCorrections);
} else {
    executeCorrections();
}

// Executar quando window carregar
window.addEventListener('load', executeCorrections);

// Executar em intervalos para garantir funcionamento
setTimeout(executeCorrections, 100);
setTimeout(executeCorrections, 500);
setTimeout(executeCorrections, 1000);
setTimeout(executeCorrections, 2000);

console.log('🎯 CORREÇÃO DEFINITIVA DE IMAGENS CONFIGURADA - EXECUÇÃO MÚLTIPLA ATIVADA');