/**
 * Extensão para capturar URLs de imagens upload
 */

(function() {
    'use strict';
    
    console.log('🖼️ Image URL Collector iniciando...');
    
    // Função para determinar tipo de imagem pelo campo do FormData
    function detectImageType(formData) {
        if (formData.has('eventLogo') || formData.has('logo')) return 'logo';
        if (formData.has('eventCover') || formData.has('capa')) return 'capa';
        if (formData.has('eventBackground') || formData.has('fundo')) return 'fundo';
        
        // Tentar detectar pelo campo 'tipo' se existir
        const tipo = formData.get('tipo');
        if (tipo) return tipo;
        
        return null;
    }
    
    // Interceptar respostas de upload de imagem
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
            // Clonar a resposta para poder ler
            const clonedResponse = response.clone();
            
            // Verificar se é uma resposta de upload
            if (args[0] && typeof args[0] === 'string' && 
                (args[0].includes('uploadimagem.php') || args[0].includes('upload_imagem'))) {
                
                clonedResponse.json().then(data => {
                    if (data.success && (data.url || data.image_url)) {
                        const imageUrl = data.url || data.image_url;
                        console.log('📸 Imagem capturada:', data);
                        
                        // Determinar qual tipo de imagem foi enviada
                        const formData = args[1] && args[1].body;
                        if (formData && formData instanceof FormData) {
                            const tipo = detectImageType(formData);
                            
                            if (tipo) {
                                // Garantir que o objeto existe
                                if (!window.WizardDataCollector) {
                                    window.WizardDataCollector = { dados: {} };
                                }
                                
                                // Salvar URL com o tipo correto
                                window.WizardDataCollector.dados[`${tipo}_url`] = imageUrl;
                                console.log(`✅ ${tipo} URL salva:`, imageUrl);
                                
                                // Também atualizar window.uploadedImages para compatibilidade
                                if (!window.uploadedImages) {
                                    window.uploadedImages = {};
                                }
                                window.uploadedImages[tipo] = imageUrl;
                            }
                        }
                        
                        // Salvar no localStorage
                        localStorage.setItem('wizardCollectedData', JSON.stringify(window.WizardDataCollector));
                    }
                }).catch(err => console.error('Erro ao processar resposta de upload:', err));
            }
            
            return response;
        });
    };
    
    // Também interceptar XMLHttpRequest caso seja usado
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._url = url;
        return originalXHROpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(data) {
        const xhr = this;
        const url = xhr._url;
        
        if (url && (url.includes('uploadimagem.php') || url.includes('upload_imagem'))) {
            xhr.addEventListener('load', function() {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success && (response.url || response.image_url)) {
                        const imageUrl = response.url || response.image_url;
                        console.log('📸 Imagem capturada via XHR:', response);
                        
                        // Tentar identificar o tipo de imagem pelo FormData
                        if (data instanceof FormData) {
                            const tipo = detectImageType(data);
                            
                            if (tipo) {
                                // Garantir que o objeto existe
                                if (!window.WizardDataCollector) {
                                    window.WizardDataCollector = { dados: {} };
                                }
                                
                                window.WizardDataCollector.dados[`${tipo}_url`] = imageUrl;
                                console.log(`✅ ${tipo} URL salva:`, imageUrl);
                                
                                // Também atualizar window.uploadedImages
                                if (!window.uploadedImages) {
                                    window.uploadedImages = {};
                                }
                                window.uploadedImages[tipo] = imageUrl;
                            }
                            
                            // Salvar no localStorage
                            localStorage.setItem('wizardCollectedData', JSON.stringify(window.WizardDataCollector));
                        }
                    }
                } catch (e) {
                    console.error('Erro ao processar resposta XHR:', e);
                }
            });
        }
        
        return originalXHRSend.apply(this, [data]);
    };
    
    // Função helper para detectar tipo no início
    window.detectImageType = detectImageType;
    
    console.log('✅ Image URL Collector configurado!');
    
})();
