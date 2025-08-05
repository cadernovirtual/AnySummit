/**
 * PATCH SUPER AGRESSIVO: Garante que lote_id seja coletado nos modais
 * Força inserção de lote_id nos elementos .ticket-item
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 PATCH SUPER AGRESSIVO para modais carregado');
    
    // Aguardar um pouco para outras funções carregarem
    setTimeout(() => {
        aplicarPatchSuperAgressivo();
    }, 1000);
    
    function aplicarPatchSuperAgressivo() {
        console.log('⚡ Aplicando patch super agressivo...');
        
        // INTERCEPTAR CRIAÇÃO DE INGRESSOS PAGOS
        if (window.createPaidTicket) {
            const originalCreatePaidTicket = window.createPaidTicket;
            window.createPaidTicket = function() {
                console.log('💰 INTERCEPTANDO createPaidTicket');
                
                // Coletar lote_id ANTES de criar
                const loteSelect = document.getElementById('paidTicketLote');
                const loteId = loteSelect ? parseInt(loteSelect.value) : null;
                
                console.log('🎯 lote_id coletado do modal pago:', loteId);
                
                // Chamar função original
                const result = originalCreatePaidTicket.apply(this, arguments);
                
                // FORÇAR lote_id no elemento criado
                setTimeout(() => {
                    forcarLoteIdNoUltimoIngresso(loteId, 'pago');
                }, 200);
                
                return result;
            };
            console.log('✅ createPaidTicket interceptada');
        } else {
            console.warn('⚠️ createPaidTicket não encontrada');
        }
        
        // INTERCEPTAR CRIAÇÃO DE INGRESSOS GRATUITOS
        if (window.createFreeTicket) {
            const originalCreateFreeTicket = window.createFreeTicket;
            window.createFreeTicket = function() {
                console.log('🆓 INTERCEPTANDO createFreeTicket');
                
                // Coletar lote_id ANTES de criar
                const loteSelect = document.getElementById('freeTicketLote');
                const loteId = loteSelect ? parseInt(loteSelect.value) : null;
                
                console.log('🎯 lote_id coletado do modal gratuito:', loteId);
                
                // Chamar função original
                const result = originalCreateFreeTicket.apply(this, arguments);
                
                // FORÇAR lote_id no elemento criado
                setTimeout(() => {
                    forcarLoteIdNoUltimoIngresso(loteId, 'gratuito');
                }, 200);
                
                return result;
            };
            console.log('✅ createFreeTicket interceptada');
        } else {
            console.warn('⚠️ createFreeTicket não encontrada');
        }
        
        // INTERCEPTAR UPDATE DE INGRESSOS PAGOS
        if (window.updatePaidTicket) {
            const originalUpdatePaidTicket = window.updatePaidTicket;
            window.updatePaidTicket = function() {
                console.log('📝 INTERCEPTANDO updatePaidTicket');
                
                // Coletar lote_id e ticket_id ANTES do update
                const loteSelect = document.getElementById('editPaidTicketLote');
                const ticketIdInput = document.getElementById('editPaidTicketId');
                const loteId = loteSelect ? parseInt(loteSelect.value) : null;
                const ticketId = ticketIdInput ? ticketIdInput.value : null;
                
                console.log('🎯 UPDATE - lote_id:', loteId, 'ticket_id:', ticketId);
                
                // Chamar função original
                const result = originalUpdatePaidTicket.apply(this, arguments);
                
                // FORÇAR lote_id no elemento específico
                setTimeout(() => {
                    forcarLoteIdNoIngressoEspecifico(ticketId, loteId);
                }, 200);
                
                return result;
            };
            console.log('✅ updatePaidTicket interceptada');
        }
        
        // INTERCEPTAR UPDATE DE INGRESSOS GRATUITOS
        if (window.updateFreeTicket) {
            const originalUpdateFreeTicket = window.updateFreeTicket;
            window.updateFreeTicket = function() {
                console.log('📝 INTERCEPTANDO updateFreeTicket');
                
                // Coletar lote_id e ticket_id ANTES do update
                const loteSelect = document.getElementById('editFreeTicketLote');
                const ticketIdInput = document.getElementById('editFreeTicketId');
                const loteId = loteSelect ? parseInt(loteSelect.value) : null;
                const ticketId = ticketIdInput ? ticketIdInput.value : null;
                
                console.log('🎯 UPDATE GRATUITO - lote_id:', loteId, 'ticket_id:', ticketId);
                
                // Chamar função original
                const result = originalUpdateFreeTicket.apply(this, arguments);
                
                // FORÇAR lote_id no elemento específico
                setTimeout(() => {
                    forcarLoteIdNoIngressoEspecifico(ticketId, loteId);
                }, 200);
                
                return result;
            };
            console.log('✅ updateFreeTicket interceptada');
        }
    }
    
    // Função para forçar lote_id no último ingresso criado
    function forcarLoteIdNoUltimoIngresso(loteId, tipo) {
        console.log(`🔥 Forçando lote_id ${loteId} no último ingresso ${tipo}`);
        
        const ticketItems = document.querySelectorAll('.ticket-item');
        const ultimoIngresso = ticketItems[ticketItems.length - 1];
        
        if (ultimoIngresso) {
            // Garantir que ticketData existe
            if (!ultimoIngresso.ticketData) {
                ultimoIngresso.ticketData = {};
            }
            
            // FORÇAR todos os formatos possíveis
            ultimoIngresso.ticketData.loteId = loteId;
            ultimoIngresso.ticketData.lote_id = loteId;
            ultimoIngresso.dataset.loteId = loteId;
            ultimoIngresso.dataset.lote_id = loteId;
            
            // Garantir tipo também
            ultimoIngresso.ticketData.tipo = tipo;
            ultimoIngresso.ticketData.type = tipo === 'pago' ? 'paid' : 'free';
            
            console.log('✅ lote_id FORÇADO no último elemento:', {
                loteId: ultimoIngresso.ticketData.loteId,
                lote_id: ultimoIngresso.ticketData.lote_id,
                tipo: ultimoIngresso.ticketData.tipo
            });
        } else {
            console.error('❌ Último ingresso não encontrado');
        }
    }
    
    // Função para forçar lote_id em ingresso específico (para updates)
    function forcarLoteIdNoIngressoEspecifico(ticketId, loteId) {
        console.log(`🔥 Forçando lote_id ${loteId} no ingresso ${ticketId}`);
        
        const elemento = document.querySelector(`[data-ticket-id="${ticketId}"]`);
        
        if (elemento) {
            // Garantir que ticketData existe
            if (!elemento.ticketData) {
                elemento.ticketData = {};
            }
            
            // FORÇAR todos os formatos possíveis
            elemento.ticketData.loteId = loteId;
            elemento.ticketData.lote_id = loteId;
            elemento.dataset.loteId = loteId;
            elemento.dataset.lote_id = loteId;
            
            console.log('✅ lote_id FORÇADO no elemento específico:', {
                ticketId: ticketId,
                loteId: elemento.ticketData.loteId,
                lote_id: elemento.ticketData.lote_id
            });
        } else {
            console.error('❌ Elemento com ticket_id', ticketId, 'não encontrado');
        }
    }
    
    // Função para verificar todos os ingressos
    window.verificarLoteIdTodosIngressos = function() {
        console.log('🔍 Verificando lote_id em todos os ingressos...');
        
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach((item, index) => {
            console.log(`\n🎫 Ingresso ${index + 1}:`);
            console.log('  - ticketData.loteId:', item.ticketData?.loteId);
            console.log('  - ticketData.lote_id:', item.ticketData?.lote_id);
            console.log('  - dataset.loteId:', item.dataset?.loteId);
            console.log('  - dataset.lote_id:', item.dataset?.lote_id);
            
            if (!item.ticketData?.loteId && !item.ticketData?.lote_id) {
                console.warn('⚠️ INGRESSO SEM LOTE_ID!');
            }
        });
    };
    
    console.log('🚨 PATCH SUPER AGRESSIVO carregado');
    console.log('💡 Use verificarLoteIdTodosIngressos() para verificar');
});
