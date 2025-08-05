/**
 * PATCH: Corrigir coleta de dados nos modais de ingresso
 * Garantir que lote_nome, datas e tipo sejam coletados corretamente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Patch para coleta de dados dos modais carregado');
    
    // Interceptar e melhorar a função createPaidTicket
    const originalCreatePaidTicket = window.createPaidTicket;
    if (originalCreatePaidTicket) {
        window.createPaidTicket = function() {
            console.log('🎫 Interceptando createPaidTicket para coletar dados corretly');
            
            // Coletar dados adicionais que estavam faltando
            const loteSelect = document.getElementById('paidTicketLote');
            const loteId = loteSelect ? loteSelect.value : null; // COLETAR LOTE_ID
            const saleStart = document.getElementById('paidSaleStart')?.value || null;
            const saleEnd = document.getElementById('paidSaleEnd')?.value || null;
            
            console.log('📊 Dados coletados do modal pago:');
            console.log('  - loteId DIRETO:', loteId);
            console.log('  - saleStart:', saleStart);
            console.log('  - saleEnd:', saleEnd);
            
            // Chamar função original
            const result = originalCreatePaidTicket.apply(this, arguments);
            
            // Após criação, FORÇAR os dados no elemento
            setTimeout(() => {
                const ticketItems = document.querySelectorAll('.ticket-item');
                const lastTicket = ticketItems[ticketItems.length - 1];
                
                if (lastTicket) {
                    // FORÇAR criação do ticketData se não existir
                    if (!lastTicket.ticketData) {
                        lastTicket.ticketData = {};
                    }
                    
                    // FORÇAR os dados críticos
                    lastTicket.ticketData.loteId = loteId;
                    lastTicket.ticketData.lote_id = loteId;
                    lastTicket.ticketData.inicio_venda = saleStart;
                    lastTicket.ticketData.startDate = saleStart;
                    lastTicket.ticketData.fim_venda = saleEnd;
                    lastTicket.ticketData.endDate = saleEnd;
                    lastTicket.ticketData.tipo = 'pago';
                    lastTicket.ticketData.type = 'paid';
                    
                    console.log('🔥 FORÇADO ticketData no elemento:', {
                        loteId: lastTicket.ticketData.loteId,
                        lote_id: lastTicket.ticketData.lote_id,
                        inicio_venda: lastTicket.ticketData.inicio_venda,
                        fim_venda: lastTicket.ticketData.fim_venda,
                        tipo: lastTicket.ticketData.tipo
                    });
                }
            }, 100);
            
            return result;
        };
    }
    
    // Interceptar e melhorar a função createFreeTicket
    const originalCreateFreeTicket = window.createFreeTicket;
    if (originalCreateFreeTicket) {
        window.createFreeTicket = function() {
            console.log('🎫 Interceptando createFreeTicket para coletar dados correctly');
            
            // Coletar dados adicionais
            const loteSelect = document.getElementById('freeTicketLote');
            const loteId = loteSelect ? loteSelect.value : null; // COLETAR LOTE_ID
            const saleStart = document.getElementById('freeSaleStart')?.value || null;
            const saleEnd = document.getElementById('freeSaleEnd')?.value || null;
            
            console.log('📊 Dados coletados do modal gratuito:');
            console.log('  - loteId DIRETO:', loteId);
            console.log('  - saleStart:', saleStart);
            console.log('  - saleEnd:', saleEnd);
            
            // Chamar função original
            const result = originalCreateFreeTicket.apply(this, arguments);
            
            // Após criação, FORÇAR os dados no elemento
            setTimeout(() => {
                const ticketItems = document.querySelectorAll('.ticket-item');
                const lastTicket = ticketItems[ticketItems.length - 1];
                
                if (lastTicket) {
                    // FORÇAR criação do ticketData se não existir
                    if (!lastTicket.ticketData) {
                        lastTicket.ticketData = {};
                    }
                    
                    // FORÇAR os dados críticos
                    lastTicket.ticketData.loteId = loteId;
                    lastTicket.ticketData.lote_id = loteId;
                    lastTicket.ticketData.inicio_venda = saleStart;
                    lastTicket.ticketData.startDate = saleStart;
                    lastTicket.ticketData.fim_venda = saleEnd;
                    lastTicket.ticketData.endDate = saleEnd;
                    lastTicket.ticketData.tipo = 'gratuito';
                    lastTicket.ticketData.type = 'free';
                    
                    console.log('🔥 FORÇADO ticketData no elemento:', {
                        loteId: lastTicket.ticketData.loteId,
                        lote_id: lastTicket.ticketData.lote_id,
                        inicio_venda: lastTicket.ticketData.inicio_venda,
                        fim_venda: lastTicket.ticketData.fim_venda,
                        tipo: lastTicket.ticketData.tipo
                    });
                }
            }, 100);
            
            return result;
        };
    }
    
    // Função para testar se o patch está funcionando
    window.testarPatchIngressos = function() {
        console.log('🧪 Testando patch de ingressos...');
        
        const ticketItems = document.querySelectorAll('.ticket-item');
        console.log(`📊 ${ticketItems.length} ingressos encontrados`);
        
        ticketItems.forEach((item, index) => {
            console.log(`\n🎫 Ingresso ${index + 1}:`);
            console.log('  - Element:', item);
            console.log('  - ticketData:', item.ticketData);
            
            if (item.ticketData) {
                console.log('  - tipo:', item.ticketData.tipo);
                console.log('  - lote_nome:', item.ticketData.lote_nome);
                console.log('  - inicio_venda:', item.ticketData.inicio_venda);
                console.log('  - fim_venda:', item.ticketData.fim_venda);
            }
        });
        
        // Testar coleta
        if (typeof window.coletarDadosIngressosCorrigida === 'function') {
            console.log('\n📦 Testando coleta corrigida:');
            const dados = window.coletarDadosIngressosCorrigida();
            console.log('Dados coletados:', dados);
        }
    };
    
    // Aguardar outras funções carregarem
    setTimeout(() => {
        if (!window.createPaidTicket) {
            console.warn('⚠️ createPaidTicket não encontrada - patch não aplicado');
        }
        if (!window.createFreeTicket) {
            console.warn('⚠️ createFreeTicket não encontrada - patch não aplicado');
        }
    }, 2000);
    
    console.log('✅ Patch de coleta de dados dos modais carregado');
    console.log('  - Use testarPatchIngressos() para verificar');
});
