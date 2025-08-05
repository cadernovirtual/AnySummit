/**
 * DIAGNÓSTICO GOOGLE MAPS API
 * Verifica se todos os serviços estão carregando corretamente
 */

console.log('🔬 Iniciando diagnóstico Google Maps...');

// Verificar periodicamente se Google Maps carregou
let checkCount = 0;
const maxChecks = 20; // 10 segundos máximo

function verificarGoogleMaps() {
    checkCount++;
    console.log(`🔍 Verificação ${checkCount}/${maxChecks}:`);
    
    // Verificar objetos básicos
    console.log('  - google:', typeof google);
    console.log('  - google.maps:', typeof google?.maps);
    console.log('  - google.maps.places:', typeof google?.maps?.places);
    
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        console.log('✅ Google Maps Places API disponível!');
        
        // Testar criação dos serviços
        try {
            const testGeocoder = new google.maps.Geocoder();
            console.log('✅ Geocoder: OK');
            
            const testAutocomplete = new google.maps.places.AutocompleteService();
            console.log('✅ AutocompleteService: OK');
            
            // Testar uma busca rápida
            testAutocomplete.getPlacePredictions({
                input: 'São Paulo',
                componentRestrictions: { country: 'br' },
                language: 'pt-BR'
            }, function(predictions, status) {
                console.log('✅ Teste AutocompleteService:');
                console.log('  - Status:', status);
                console.log('  - Resultados:', predictions?.length || 0);
                
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log('🎉 TUDO FUNCIONANDO!');
                } else {
                    console.error('❌ Erro no teste:', status);
                }
            });
            
        } catch (error) {
            console.error('❌ Erro ao criar serviços:', error);
        }
        
        return; // Parar verificação
    }
    
    if (checkCount < maxChecks) {
        setTimeout(verificarGoogleMaps, 500);
    } else {
        console.error('❌ TIMEOUT: Google Maps não carregou em 10 segundos');
        console.log('🔧 Possíveis causas:');
        console.log('  - Chave API inválida');
        console.log('  - Problema de conexão');  
        console.log('  - Script bloqueado');
        console.log('  - Cota da API excedida');
    }
}

// Verificar callback
const originalInitMap = window.initMap;
window.initMap = function() {
    console.log('🗺️ Callback initMap executado!');
    
    if (originalInitMap && typeof originalInitMap === 'function') {
        console.log('📞 Chamando initMap original...');
        originalInitMap();
    }
    
    console.log('✅ Callback concluído');
};

// Iniciar verificação
setTimeout(verificarGoogleMaps, 1000);

// Função de teste manual
window.diagnosticoCompleto = function() {
    console.log('🔬 === DIAGNÓSTICO COMPLETO ===');
    console.log('Google Maps API:', typeof google);
    console.log('Places API:', typeof google?.maps?.places);
    console.log('Geocoder global:', !!window.geocoder);
    console.log('AutocompleteService global:', !!window.autocompleteService);
    console.log('Função searchAddressManual:', typeof window.searchAddressManual);
    console.log('================================');
    
    // Teste da função
    if (typeof window.searchAddressManual === 'function') {
        console.log('🧪 Testando busca...');
        const campo = document.getElementById('addressSearch');
        if (campo) {
            campo.value = 'Rua Augusta';
            window.searchAddressManual();
        }
    }
};

console.log('🔬 Diagnóstico carregado. Use diagnosticoCompleto() no console.');
