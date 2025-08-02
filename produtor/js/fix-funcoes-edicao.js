/**
 * CORREÇÃO: Funções de edição de ingressos quebradas
 * Resolve erros de funções não definidas
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção de funções de edição carregada');
    
    // Definir função abrirModalEdicaoImediataGratuito se não existir
    if (!window.abrirModalEdicaoImediataGratuito) {
        window.abrirModalEdicaoImediataGratuito = function(dadosIngresso) {
            console.log('🆓 Abrindo modal de edição para ingresso gratuito:', dadosIngresso);
            
            // Preencher campos do modal de edição gratuito
            const titulo = document.getElementById('editFreeTicketTitle');
            const descricao = document.getElementById('editFreeTicketDescription');
            const quantidade = document.getElementById('editFreeTicketQuantity');
            const lote = document.getElementById('editFreeTicketLote');
            const inicio = document.getElementById('editFreeSaleStart');
            const fim = document.getElementById('editFreeSaleEnd');
            const min = document.getElementById('editFreeMinQuantity');
            const max = document.getElementById('editFreeMaxQuantity');
            const ticketId = document.getElementById('editFreeTicketId');
            
            if (titulo) titulo.value = dadosIngresso.titulo || dadosIngresso.title || '';
            if (descricao) descricao.value = dadosIngresso.descricao || dadosIngresso.description || '';
            if (quantidade) quantidade.value = dadosIngresso.quantidade_total || dadosIngresso.quantity || 100;
            if (lote) lote.value = dadosIngresso.lote_id || dadosIngresso.loteId || '';
            if (inicio) inicio.value = dadosIngresso.inicio_venda || dadosIngresso.saleStart || '';
            if (fim) fim.value = dadosIngresso.fim_venda || dadosIngresso.saleEnd || '';
            if (min) min.value = dadosIngresso.limite_min || dadosIngresso.minLimit || 1;
            if (max) max.value = dadosIngresso.limite_max || dadosIngresso.maxLimit || 5;
            if (ticketId) ticketId.value = dadosIngresso.id || dadosIngresso.ingresso_id || '';
            
            // Abrir modal
            if (window.openModal) {
                window.openModal('editFreeTicketModal');
            }
        };
    }
    
    // Definir função abrirModalEdicaoImediataPago se não existir
    if (!window.abrirModalEdicaoImediataPago) {
        window.abrirModalEdicaoImediataPago = function(dadosIngresso) {
            console.log('💰 Abrindo modal de edição para ingresso pago:', dadosIngresso);
            
            // Preencher campos do modal de edição pago
            const titulo = document.getElementById('editPaidTicketTitle');
            const descricao = document.getElementById('editPaidTicketDescription');
            const quantidade = document.getElementById('editPaidTicketQuantity');
            const preco = document.getElementById('editPaidTicketPrice');
            const lote = document.getElementById('editPaidTicketLote');
            const inicio = document.getElementById('editPaidSaleStart');
            const fim = document.getElementById('editPaidSaleEnd');
            const min = document.getElementById('editPaidMinQuantity');
            const max = document.getElementById('editPaidMaxQuantity');
            const ticketId = document.getElementById('editPaidTicketId');
            
            if (titulo) titulo.value = dadosIngresso.titulo || dadosIngresso.title || '';
            if (descricao) descricao.value = dadosIngresso.descricao || dadosIngresso.description || '';
            if (quantidade) quantidade.value = dadosIngresso.quantidade_total || dadosIngresso.quantity || 100;
            if (preco) preco.value = `R$ ${(dadosIngresso.preco || dadosIngresso.price || 0).toFixed(2).replace('.', ',')}`;
            if (lote) lote.value = dadosIngresso.lote_id || dadosIngresso.loteId || '';
            if (inicio) inicio.value = dadosIngresso.inicio_venda || dadosIngresso.saleStart || '';
            if (fim) fim.value = dadosIngresso.fim_venda || dadosIngresso.saleEnd || '';
            if (min) min.value = dadosIngresso.limite_min || dadosIngresso.minLimit || 1;
            if (max) max.value = dadosIngresso.limite_max || dadosIngresso.maxLimit || 5;
            if (ticketId) ticketId.value = dadosIngresso.id || dadosIngresso.ingresso_id || '';
            
            // Abrir modal
            if (window.openModal) {
                window.openModal('editPaidTicketModal');
            }
        };
    }
    
    // Corrigir função editarIngressoImediato se tiver problema
    if (window.editarIngressoImediato) {
        const originalEditarIngressoImediato = window.editarIngressoImediato;
        window.editarIngressoImediato = function(ingressoId) {
            console.log('✏️ Editando ingresso (versão corrigida):', ingressoId);
            
            try {
                return originalEditarIngressoImediato.call(this, ingressoId);
            } catch (error) {
                console.error('❌ Erro na edição original, tentando método alternativo:', error);
                
                // Método alternativo - buscar dados e abrir modal
                const ticketElement = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
                
                if (ticketElement && ticketElement.ticketData) {
                    const dadosIngresso = ticketElement.ticketData;
                    
                    if (dadosIngresso.tipo === 'pago' || dadosIngresso.type === 'paid') {
                        window.abrirModalEdicaoImediataPago(dadosIngresso);
                    } else if (dadosIngresso.tipo === 'gratuito' || dadosIngresso.type === 'free') {
                        window.abrirModalEdicaoImediataGratuito(dadosIngresso);
                    }
                } else {
                    alert('Dados do ingresso não encontrados. Recarregue a página e tente novamente.');
                }
            }
        };
    }
    
    console.log('✅ Funções de edição corrigidas');
});
