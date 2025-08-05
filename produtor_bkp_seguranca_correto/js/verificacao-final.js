/**
 * VERIFICAÇÃO DA BUSCA INCREMENTAL
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Verificando busca incremental...');
    
    setTimeout(function() {
        console.log('=== RELATÓRIO BUSCA INCREMENTAL ===');
        console.log('1. Google Maps:', typeof google);
        console.log('2. AutocompleteService:', !!window.autocompleteService);
        console.log('3. Função searchAddressManual:', typeof window.searchAddressManual);
        console.log('4. Campo addressSearch:', !!document.getElementById('addressSearch'));
        console.log('5. Container sugestões:', !!document.getElementById('addressSuggestions'));
        console.log('6. Botão buscar:', !!document.querySelector('button[onclick="searchAddressManual()"]'));
        console.log('=====================================');
        
        if (typeof window.searchAddressManual === 'function') {
            console.log('✅ SISTEMA PRONTO!');
            console.log('');
            console.log('📝 COMO USAR:');
            console.log('1. Digite no campo (ex: "Av Paulista") → 6 sugestões aparecem');
            console.log('2. Clique botão "Buscar" → 15 sugestões aparecem');
            console.log('3. Use ↑↓ Enter para navegar');
            console.log('4. Clique numa sugestão → campos preenchidos');
            console.log('');
            
            // Funções de teste
            window.testeIncremental = function() {
                const campo = document.getElementById('addressSearch');
                if (campo) {
                    campo.value = 'Av Paulista';
                    campo.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('🎯 Teste incremental executado');
                } else {
                    console.error('Campo não encontrado');
                }
            };
            
            window.testeBuscar = function() {
                const campo = document.getElementById('addressSearch');
                if (campo) {
                    campo.value = 'Rua Augusta';
                    window.searchAddressManual();
                    console.log('🎯 Teste busca manual executado');
                } else {
                    console.error('Campo não encontrado');
                }
            };
            
            console.log('🧪 TESTES DISPONÍVEIS:');
            console.log('- testeIncremental() → Simula digitação');
            console.log('- testeBuscar() → Simula clique no botão');
            
        } else {
            console.error('❌ ERRO: Sistema não está funcionando!');
        }
        
    }, 3000);
});
