// Configuração de API para desenvolvimento local
(function() {
    console.log('🔧 Aplicando configuração de desenvolvimento...');
    
    // Sobrescrever configuração da API para usar URL local
    if (typeof API_CONFIG !== 'undefined') {
        const urlAtual = window.location.origin;
        API_CONFIG.baseUrl = urlAtual + '/produtor/criaeventoapi.php';
        console.log('✅ API configurada para:', API_CONFIG.baseUrl);
    }
    
    // Garantir que a função enviarEventoParaAPI use a URL correta
    const originalEnviar = window.enviarEventoParaAPI;
    if (originalEnviar) {
        window.enviarEventoParaAPI = async function() {
            console.log('🚀 Interceptando envio - URL:', API_CONFIG.baseUrl);
            return originalEnviar.apply(this, arguments);
        };
    }
})();