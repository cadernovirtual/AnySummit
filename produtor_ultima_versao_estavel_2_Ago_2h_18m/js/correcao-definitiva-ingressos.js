/**
 * CORREÇÃO DEFINITIVA: Coleta correta de lote_id e datas
 * Esta é a correção final e definitiva
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 CORREÇÃO DEFINITIVA de coleta de dados carregada');
    
    // SUBSTITUIR COMPLETAMENTE a função de coleta
    window.coletarDadosIngressos = function() {
        console.log('📋 [CORREÇÃO DEFINITIVA] Coletando dados dos ingressos...');
        
        const ingressos = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        console.log(`🎫 Encontrados ${ticketItems.length} elementos .ticket-item`);
        
        ticketItems.forEach((item, index) => {
            console.log(`\n=== PROCESSANDO INGRESSO ${index + 1} ===`);
            
            const ticketData = item.ticketData;
            
            if (!ticketData) {
                console.error('❌ ticketData não encontrado no elemento');
                return;
            }
            
            console.log('📊 ticketData original:', ticketData);
            
            // COLETAR lote_id NUMÉRICO (não nome!) - BUSCAR EM TODOS OS LUGARES
            let lote_id = null;
            
            // 1. Tentar do ticketData
            if (ticketData.loteId && ticketData.loteId !== '' && ticketData.loteId !== '0') {
                lote_id = parseInt(ticketData.loteId);
                console.log('✅ lote_id do ticketData.loteId:', lote_id);
            } else if (ticketData.lote_id && ticketData.lote_id !== '' && ticketData.lote_id !== '0') {
                lote_id = parseInt(ticketData.lote_id);
                console.log('✅ lote_id do ticketData.lote_id:', lote_id);
            }
            
            // 2. Se não encontrou, buscar nos selects ativos dos modais
            if (!lote_id) {
                console.log('🔍 lote_id não encontrado no ticketData, buscando nos modais...');
                
                const selects = [
                    document.getElementById('paidTicketLote'),
                    document.getElementById('freeTicketLote'),
                    document.getElementById('editPaidTicketLote'),
                    document.getElementById('editFreeTicketLote')
                ];
                
                for (const select of selects) {
                    if (select && select.value && select.value !== '' && select.value !== '0') {
                        lote_id = parseInt(select.value);
                        console.log(`✅ lote_id encontrado no modal ${select.id}:`, lote_id);
                        break;
                    }
                }
            }
            
            // 3. Log final do lote_id
            if (lote_id) {
                console.log(`🎯 LOTE_ID FINAL: ${lote_id}`);
            } else {
                console.log('⚠️ NENHUM lote_id encontrado - será null');
            }
            
            // COLETAR datas corretamente
            let inicio_venda = ticketData.inicio_venda || ticketData.startDate || null;
            let fim_venda = ticketData.fim_venda || ticketData.endDate || null;
            
            // Se null, tentar buscar nos campos DOM
            if (!inicio_venda || !fim_venda) {
                console.log('🔍 Datas null, tentando buscar nos campos DOM...');
                
                // Buscar campos de data próximos ao elemento
                const startField = document.querySelector('#paidSaleStart, #freeSaleStart, #editPaidSaleStart, #editFreeSaleStart');
                const endField = document.querySelector('#paidSaleEnd, #freeSaleEnd, #editPaidSaleEnd, #editFreeSaleEnd');
                
                if (startField && startField.value) {
                    inicio_venda = startField.value;
                    console.log('📅 Data início encontrada no DOM:', inicio_venda);
                }
                
                if (endField && endField.value) {
                    fim_venda = endField.value;
                    console.log('📅 Data fim encontrada no DOM:', fim_venda);
                }
            }
            
            const ingresso = {
                tipo: ticketData.tipo || mapearTipoParaPortugues(ticketData.type),
                titulo: ticketData.titulo || ticketData.title || '',
                descricao: ticketData.descricao || ticketData.description || '',
                quantidade: parseInt(ticketData.quantity) || 100,
                preco: parseFloat(ticketData.preco || ticketData.price) || 0,
                taxa_plataforma: parseFloat(ticketData.taxaPlataforma) || 0,
                valor_receber: parseFloat(ticketData.valorReceber) || parseFloat(ticketData.preco || ticketData.price) || 0,
                inicio_venda: inicio_venda,
                fim_venda: fim_venda,
                limite_min: parseInt(ticketData.limite_min || ticketData.minQuantity) || 1,
                limite_max: parseInt(ticketData.limite_max || ticketData.maxQuantity) || 5,
                lote_id: lote_id  // APENAS lote_id - SEM lote_nome!
            };
            
            // GARANTIR QUE NÃO TEM lote_nome
            delete ingresso.lote_nome;
            
            if (ticketData.tipo === 'combo' && ticketData.comboData) {
                ingresso.conteudo_combo = ticketData.comboData;
            }
            
            console.log('✅ INGRESSO FINAL:', ingresso);
            console.log(`  - tipo: "${ingresso.tipo}"`);
            console.log(`  - inicio_venda: "${ingresso.inicio_venda}"`);
            console.log(`  - fim_venda: "${ingresso.fim_venda}"`);
            console.log(`  - lote_id: ${ingresso.lote_id}`);
            
            ingressos.push(ingresso);
        });
        
        console.log(`📦 DADOS FINAIS PARA ENVIO (${ingressos.length} ingressos):`, ingressos);
        return ingressos;
    };
    
    function mapearTipoParaPortugues(tipo) {
        const mapa = {
            'paid': 'pago',
            'free': 'gratuito',
            'combo': 'combo'
        };
        return mapa[tipo] || 'pago';
    }
    
    console.log('✅ CORREÇÃO DEFINITIVA carregada - coletarDadosIngressos() substituída');
});
