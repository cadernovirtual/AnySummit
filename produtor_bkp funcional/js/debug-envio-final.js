/**
 * DEBUG FINAL: Verificar exatamente que dados estão sendo enviados
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG ENVIO FINAL carregado');
    
    // Interceptar o salvamento da etapa 6
    const originalSalvarEtapaAtual = window.salvarEtapaAtual;
    if (originalSalvarEtapaAtual) {
        window.salvarEtapaAtual = function(etapa) {
            if (etapa === 6) {
                console.log('\n🚨 INTERCEPTANDO SALVAMENTO DA ETAPA 6');
                
                // Verificar todos os elementos ticket-item
                const ticketItems = document.querySelectorAll('.ticket-item');
                console.log(`🎫 Encontrados ${ticketItems.length} ticket-items:`);
                
                ticketItems.forEach((item, index) => {
                    console.log(`\n=== ITEM ${index + 1} ===`);
                    console.log('Element:', item);
                    console.log('ticketData:', item.ticketData);
                    
                    if (item.ticketData) {
                        console.log('Propriedades do ticketData:');
                        Object.keys(item.ticketData).forEach(key => {
                            console.log(`  ${key}: "${item.ticketData[key]}"`);
                        });
                    }
                });
                
                // Testar a função de coleta
                if (window.coletarDadosIngressos) {
                    console.log('\n📦 TESTANDO coletarDadosIngressos():');
                    const dados = window.coletarDadosIngressos();
                    console.log('Dados retornados:', dados);
                    
                    dados.forEach((ingresso, index) => {
                        console.log(`\nIngresso ${index + 1}:`);
                        console.log(`  - tipo: "${ingresso.tipo}"`);
                        console.log(`  - lote_id: ${ingresso.lote_id}`);
                        console.log(`  - lote_nome: "${ingresso.lote_nome || 'undefined'}"`);
                        console.log(`  - inicio_venda: "${ingresso.inicio_venda}"`);
                        console.log(`  - fim_venda: "${ingresso.fim_venda}"`);
                    });
                    
                    console.log('\n📤 JSON que será enviado:');
                    console.log(JSON.stringify(dados, null, 2));
                }
            }
            
            // Chamar função original
            return originalSalvarEtapaAtual.apply(this, arguments);
        };
    }
    
    // Função manual para testar
    window.debugEnvioIngressos = function() {
        console.log('\n🔍 === DEBUG MANUAL DE ENVIO ===');
        
        const ticketItems = document.querySelectorAll('.ticket-item');
        console.log(`🎫 ${ticketItems.length} ticket-items encontrados`);
        
        ticketItems.forEach((item, index) => {
            console.log(`\n--- Item ${index + 1} ---`);
            console.log('🔧 ticketData completo:', item.ticketData);
            
            if (item.ticketData) {
                console.log('📊 Análise dos dados:');
                console.log(`  ✅ loteId: ${item.ticketData.loteId}`);
                console.log(`  ✅ lote_id: ${item.ticketData.lote_id}`); 
                console.log(`  ✅ tipo: ${item.ticketData.tipo}`);
                console.log(`  ✅ inicio_venda: ${item.ticketData.inicio_venda}`);
                console.log(`  ✅ fim_venda: ${item.ticketData.fim_venda}`);
            }
        });
        
        if (window.coletarDadosIngressos) {
            console.log('\n📦 Resultado da coleta:');
            const ingressos = window.coletarDadosIngressos();
            console.log(ingressos);
            
            console.log('\n📤 JSON final:');
            console.log(JSON.stringify(ingressos));
        }
    };
    
    console.log('✅ Debug de envio carregado');
    console.log('💡 Use debugEnvioIngressos() para testar manualmente');
});
