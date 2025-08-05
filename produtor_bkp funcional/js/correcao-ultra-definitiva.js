/**
 * CORREÇÃO ULTRA DEFINITIVA: Coleta APENAS lote_id, sem lote_nome
 * Esta correção substitui completamente a função coletarDadosIngressos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 CORREÇÃO ULTRA DEFINITIVA carregada');
    
    // SUBSTITUIR COMPLETAMENTE a função coletarDadosIngressos
    window.coletarDadosIngressos = function() {
        console.log('📋 [ULTRA DEFINITIVA] Coletando dados dos ingressos...');
        
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
            
            // COLETAR lote_id NUMÉRICO - PRIORIDADE ABSOLUTA
            let lote_id = null;
            
            // Ordem de prioridade para encontrar lote_id
            const fontes_lote_id = [
                ticketData.loteId,
                ticketData.lote_id,
                item.dataset.loteId,
                item.dataset.lote_id
            ];
            
            for (const fonte of fontes_lote_id) {
                if (fonte && fonte !== '' && fonte !== '0' && !isNaN(fonte)) {
                    lote_id = parseInt(fonte);
                    console.log(`✅ lote_id encontrado: ${lote_id} (fonte: ${fonte})`);
                    break;
                }
            }
            
            // Se ainda não encontrou, buscar nos selects dos modais
            if (!lote_id) {
                console.log('🔍 Buscando lote_id nos selects dos modais...');
                
                const selects = [
                    document.getElementById('paidTicketLote'),
                    document.getElementById('freeTicketLote'),
                    document.getElementById('editPaidTicketLote'),
                    document.getElementById('editFreeTicketLote')
                ];
                
                for (const select of selects) {
                    if (select && select.value && select.value !== '' && select.value !== '0') {
                        lote_id = parseInt(select.value);
                        console.log(`📋 lote_id do modal ${select.id}: ${lote_id}`);
                        break;
                    }
                }
            }
            
            console.log(`🎯 LOTE_ID FINAL: ${lote_id}`);
            
            // MAPEAR TIPO para português
            let tipo = 'pago'; // padrão
            const tipoOriginal = ticketData.tipo || ticketData.type || 'paid';
            
            switch(tipoOriginal.toLowerCase()) {
                case 'paid':
                case 'pago':
                    tipo = 'pago';
                    break;
                case 'free':
                case 'gratuito':
                    tipo = 'gratuito';
                    break;
                case 'combo':
                    tipo = 'combo';
                    break;
                default:
                    tipo = 'pago';
            }
            
            // COLETAR DATAS corretamente
            let inicio_venda = ticketData.inicio_venda || ticketData.startDate || null;
            let fim_venda = ticketData.fim_venda || ticketData.endDate || null;
            
            console.log(`📅 Datas coletadas: ${inicio_venda} até ${fim_venda}`);
            
            // MONTAR OBJETO FINAL
            const ingresso = {
                tipo: tipo,
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
            
            // GARANTIR que não há lote_nome
            delete ingresso.lote_nome;
            
            // Combo especial
            if (tipo === 'combo' && ticketData.comboData) {
                ingresso.conteudo_combo = ticketData.comboData;
            }
            
            console.log('✅ INGRESSO MONTADO:');
            console.log(`  - tipo: "${ingresso.tipo}"`);
            console.log(`  - titulo: "${ingresso.titulo}"`);
            console.log(`  - lote_id: ${ingresso.lote_id}`);
            console.log(`  - inicio_venda: "${ingresso.inicio_venda}"`);
            console.log(`  - fim_venda: "${ingresso.fim_venda}"`);
            console.log(`  - preco: ${ingresso.preco}`);
            
            ingressos.push(ingresso);
        });
        
        console.log(`\n📦 RESULTADO FINAL (${ingressos.length} ingressos):`);
        console.log(ingressos);
        
        console.log('\n📤 JSON QUE SERÁ ENVIADO:');
        console.log('ingressos=' + JSON.stringify(ingressos));
        
        return ingressos;
    };
    
    console.log('✅ CORREÇÃO ULTRA DEFINITIVA aplicada');
    console.log('  - coletarDadosIngressos() SUBSTITUÍDA');
    console.log('  - Foco APENAS em lote_id (sem lote_nome)');
    console.log('  - Mapeamento correto de tipos');
});
