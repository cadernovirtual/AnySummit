/**
 * TESTE ESPECÍFICO PARA FUNÇÃO RESTAURAR LOTES
 * Verifica se a função está sendo definida corretamente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Testando disponibilidade da função restaurarLotes...');
    
    setTimeout(function() {
        console.log('=== DIAGNÓSTICO RESTAURAR LOTES ===');
        console.log('1. window.restaurarLotes:', typeof window.restaurarLotes);
        console.log('2. Função definida:', typeof window.restaurarLotes === 'function');
        console.log('3. window.lotesData:', typeof window.lotesData);
        console.log('4. validarStep5:', typeof window.validarStep5);
        console.log('5. testarRestaurarLotes:', typeof window.testarRestaurarLotes);
        console.log('=====================================');
        
        if (typeof window.restaurarLotes === 'function') {
            console.log('✅ Função restaurarLotes está disponível');
            
            // Criar função de teste
            window.testarRestaurarLotes = function() {
                const testeLotes = [
                    {
                        id: 1,
                        nome: 'Lote Teste 1',
                        tipo: 'data',
                        data_inicio: '2024-02-01T10:00',
                        data_fim: '2024-02-15T23:59',
                        percentual_aumento_valor: 10,
                        divulgar_criterio: 1
                    },
                    {
                        id: 2,
                        nome: 'Lote Teste 2',
                        tipo: 'percentual',
                        percentual_venda: 50,
                        percentual_aumento_valor: 20,
                        divulgar_criterio: 0
                    }
                ];
                
                console.log('🎯 Executando teste com lotes:', testeLotes);
                window.restaurarLotes(testeLotes);
            };
            
            console.log('📝 Use testarRestaurarLotes() no console para testar');
            
        } else {
            console.error('❌ Função restaurarLotes NÃO está disponível');
            console.log('🔍 Verificando se o arquivo lotes.js foi carregado...');
            
            const scripts = document.querySelectorAll('script[src*="lotes.js"]');
            console.log('Scripts lotes.js encontrados:', scripts.length);
            scripts.forEach((script, index) => {
                console.log(`Script ${index + 1}:`, script.src);
            });
        }
        
    }, 2000);
});
