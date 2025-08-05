/**
 * Debug detalhado para o envio de dados do wizard
 */

(function() {
    'use strict';
    
    console.log('🔍 Debug de envio do wizard ativado');
    
    // Interceptar fetch para logar detalhes
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options) {
        if (url.includes('wizard_evento.php')) {
            console.log('📤 Requisição para wizard_evento.php:');
            console.log('- URL:', url);
            console.log('- Método:', options?.method);
            console.log('- Headers:', options?.headers);
            
            if (options?.body) {
                // Se for URLSearchParams, converter para objeto para visualizar
                if (options.body instanceof URLSearchParams) {
                    const params = {};
                    for (const [key, value] of options.body) {
                        params[key] = value;
                    }
                    console.log('- Dados enviados:', params);
                } else {
                    console.log('- Body:', options.body);
                }
            }
            
            // Fazer a requisição original
            return originalFetch.apply(this, arguments)
                .then(response => {
                    console.log('📥 Resposta recebida:');
                    console.log('- Status:', response.status);
                    console.log('- Status Text:', response.statusText);
                    
                    // Clonar a resposta para poder ler o conteúdo
                    const clonedResponse = response.clone();
                    
                    // Tentar ler como texto primeiro
                    clonedResponse.text().then(text => {
                        console.log('- Conteúdo da resposta (texto):', text);
                        
                        // Se for erro 500, provavelmente tem mensagem de erro PHP
                        if (response.status === 500) {
                            console.error('❌ ERRO 500 - Resposta do servidor:', text);
                        }
                    }).catch(err => {
                        console.error('- Erro ao ler resposta:', err);
                    });
                    
                    return response;
                })
                .catch(error => {
                    console.error('❌ Erro na requisição:', error);
                    throw error;
                });
        }
        
        // Para outras URLs, usar fetch normal
        return originalFetch.apply(this, arguments);
    };
    
    // Debug das variáveis de upload
    setTimeout(() => {
        console.log('📸 Estado das imagens:');
        console.log('- window.uploadedImages:', window.uploadedImages);
        
        // Verificar se as imagens estão nos elementos
        const logoContainer = document.getElementById('logoPreviewContainer');
        const capaContainer = document.getElementById('capaPreviewContainer');
        const fundoContainer = document.getElementById('fundoPreviewContainer');
        
        console.log('- Logo preview:', logoContainer?.querySelector('img')?.src);
        console.log('- Capa preview:', capaContainer?.querySelector('img')?.src);
        console.log('- Fundo preview:', fundoContainer?.querySelector('img')?.src);
    }, 1000);
    
})();
