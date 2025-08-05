/**
 * Teste de funcionamento da busca de endereços
 * Para verificar se todas as funções estão carregadas corretamente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Teste de busca de endereços iniciado...');
    
    setTimeout(function() {
        // Verificar se as funções essenciais existem
        console.log('📋 Verificação de funções:');
        console.log('- window.initMap:', typeof window.initMap);
        console.log('- window.searchAddressManual:', typeof window.searchAddressManual);
        console.log('- window.initAddressSearch:', typeof window.initAddressSearch);
        console.log('- google:', typeof google);
        
        // Verificar se os elementos DOM existem
        console.log('📋 Verificação de elementos DOM:');
        console.log('- addressSearch:', !!document.getElementById('addressSearch'));
        console.log('- addressSuggestions:', !!document.getElementById('addressSuggestions'));
        console.log('- addressLoading:', !!document.getElementById('addressLoading'));
        console.log('- addressFields:', !!document.getElementById('addressFields'));
        
        // Verificar se o Google Maps API foi carregado
        if (typeof google !== 'undefined' && google.maps) {
            console.log('✅ Google Maps API carregado');
            
            // Verificar serviços específicos
            console.log('- google.maps.Geocoder:', typeof google.maps.Geocoder);
            console.log('- google.maps.places:', typeof google.maps.places);
            console.log('- google.maps.places.AutocompleteService:', typeof google.maps.places.AutocompleteService);
        } else {
            console.log('❌ Google Maps API não carregado');
        }
        
        // Teste do botão buscar endereço
        const btnBuscar = document.querySelector('button[onclick="searchAddressManual()"]');
        if (btnBuscar) {
            console.log('✅ Botão "Buscar Endereço" encontrado');
            
            // Adicionar evento de teste
            btnBuscar.addEventListener('click', function(e) {
                console.log('🎯 Clique no botão detectado!');
                console.log('Campo de busca valor:', document.getElementById('addressSearch')?.value);
            });
        } else {
            console.log('❌ Botão "Buscar Endereço" NÃO encontrado');
        }
        
        // Função de teste manual
        window.testarBuscaEndereco = function() {
            console.log('🧪 Teste manual da busca de endereços');
            
            const addressSearch = document.getElementById('addressSearch');
            if (addressSearch) {
                addressSearch.value = 'Av Paulista 1000, São Paulo';
                console.log('Campo preenchido com endereço de teste');
                
                if (typeof window.searchAddressManual === 'function') {
                    console.log('Chamando searchAddressManual...');
                    window.searchAddressManual();
                } else {
                    console.log('❌ Função searchAddressManual não disponível');
                }
            } else {
                console.log('❌ Campo de busca não encontrado');
            }
        };
        
        console.log('✅ Teste completo. Use testarBuscaEndereco() no console para teste manual.');
        
    }, 2000); // Aguardar 2 segundos para tudo carregar
});
