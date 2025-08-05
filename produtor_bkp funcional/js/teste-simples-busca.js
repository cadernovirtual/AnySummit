/**
 * Teste simples da nova busca de endereços
 */

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('🧪 TESTE BUSCA DE ENDEREÇOS:');
        console.log('- Google Maps:', typeof google);
        console.log('- searchAddressManual:', typeof window.searchAddressManual);
        console.log('- Campo addressSearch:', !!document.getElementById('addressSearch'));
        console.log('- Botão buscar:', !!document.querySelector('button[onclick="searchAddressManual()"]'));
        
        // Função de teste rápido
        window.testeBusca = function() {
            const campo = document.getElementById('addressSearch');
            if (campo) {
                campo.value = 'Av Paulista 1000, São Paulo';
                console.log('🎯 Campo preenchido para teste');
                if (typeof window.searchAddressManual === 'function') {
                    window.searchAddressManual();
                } else {
                    console.error('❌ Função não encontrada');
                }
            }
        };
        
        console.log('✅ Teste carregado. Use testeBusca() no console.');
        
    }, 2000);
});
