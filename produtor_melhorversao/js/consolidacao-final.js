/**
 * CONSOLIDAÇÃO FINAL - Apenas o essencial
 * Remove redundâncias e conflitos entre scripts
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Consolidação final carregada');
    
    // ===========================================
    // 1. CORREÇÃO DE CSS DOS BOTÕES DE LOTE
    // ===========================================
    const style = document.createElement('style');
    style.textContent = `
        .lote-item-actions {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            z-index: 10;
        }
        
        .btn-lote-action {
            background: transparent;
            border: none;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            border-radius: 3px;
            transition: background-color 0.2s ease;
        }
        
        .btn-lote-action:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
    
    // ===========================================
    // 2. FUNÇÕES DE EDIÇÃO FALTANTES
    // ===========================================
    if (!window.abrirModalEdicaoImediataGratuito) {
        window.abrirModalEdicaoImediataGratuito = function(dadosIngresso) {
            console.log('🆓 Abrindo modal de edição gratuito');
            
            const campos = {
                editFreeTicketTitle: dadosIngresso.titulo || dadosIngresso.title || '',
                editFreeTicketDescription: dadosIngresso.descricao || dadosIngresso.description || '',
                editFreeTicketQuantity: dadosIngresso.quantidade_total || dadosIngresso.quantity || 100,
                editFreeTicketLote: dadosIngresso.lote_id || dadosIngresso.loteId || '',
                editFreeSaleStart: dadosIngresso.inicio_venda || dadosIngresso.saleStart || '',
                editFreeSaleEnd: dadosIngresso.fim_venda || dadosIngresso.saleEnd || '',
                editFreeMinQuantity: dadosIngresso.limite_min || dadosIngresso.minLimit || 1,
                editFreeMaxQuantity: dadosIngresso.limite_max || dadosIngresso.maxLimit || 5,
                editFreeTicketId: dadosIngresso.id || dadosIngresso.ingresso_id || ''
            };
            
            Object.keys(campos).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.value = campos[id];
            });
            
            if (window.openModal) window.openModal('editFreeTicketModal');
        };
    }
    
    if (!window.abrirModalEdicaoImediataPago) {
        window.abrirModalEdicaoImediataPago = function(dadosIngresso) {
            console.log('💰 Abrindo modal de edição pago');
            
            const preco = dadosIngresso.preco || dadosIngresso.price || 0;
            const precoFormatado = `R$ ${preco.toFixed(2).replace('.', ',')}`;
            
            const campos = {
                editPaidTicketTitle: dadosIngresso.titulo || dadosIngresso.title || '',
                editPaidTicketDescription: dadosIngresso.descricao || dadosIngresso.description || '',
                editPaidTicketQuantity: dadosIngresso.quantidade_total || dadosIngresso.quantity || 100,
                editPaidTicketPrice: precoFormatado,
                editPaidTicketLote: dadosIngresso.lote_id || dadosIngresso.loteId || '',
                editPaidSaleStart: dadosIngresso.inicio_venda || dadosIngresso.saleStart || '',
                editPaidSaleEnd: dadosIngresso.fim_venda || dadosIngresso.saleEnd || '',
                editPaidMinQuantity: dadosIngresso.limite_min || dadosIngresso.minLimit || 1,
                editPaidMaxQuantity: dadosIngresso.limite_max || dadosIngresso.maxLimit || 5,
                editPaidTicketId: dadosIngresso.id || dadosIngresso.ingresso_id || ''
            };
            
            Object.keys(campos).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.value = campos[id];
            });
            
            if (window.openModal) window.openModal('editPaidTicketModal');
        };
    }
    
    // ===========================================
    // 3. FUNÇÕES AUXILIARES (editItem será tratado por edicao-dados-banco.js)
    // ===========================================
    
    // ===========================================
    // 4. ATUALIZAR IDS APÓS SALVAMENTO (SEM LOOP)
    // ===========================================
    function atualizarElementoUnicoComId(ingressoId, dadosIngresso) {
        const ticketItems = document.querySelectorAll('.ticket-item');
        const ultimoItem = ticketItems[ticketItems.length - 1];
        
        if (ultimoItem && (!ultimoItem.dataset.ticketId || ultimoItem.dataset.ticketId.includes('ticket_'))) {
            ultimoItem.dataset.ticketId = ingressoId;
            ultimoItem.dataset.ingressoId = ingressoId;
            ultimoItem.setAttribute('data-ticket-id', ingressoId);
            
            if (!ultimoItem.ticketData) ultimoItem.ticketData = {};
            ultimoItem.ticketData.id = ingressoId;
            ultimoItem.ticketData.ingresso_id = ingressoId;
            ultimoItem.ticketData = { ...ultimoItem.ticketData, ...dadosIngresso };
            
            // Atualizar botões de edição
            const editBtn = ultimoItem.querySelector('[onclick*="editItem"]');
            if (editBtn) {
                editBtn.setAttribute('onclick', `editItem('${ingressoId}')`);
            }
            
            console.log(`✅ Elemento atualizado com ID real: ${ingressoId}`);
        }
    }
    
    // Interceptar resposta de salvamento
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const request = originalFetch.apply(this, args);
        
        if (args[0] && args[0].includes('wizard_evento.php')) {
            return request.then(response => {
                const clonedResponse = response.clone();
                
                if (args[1] && args[1].body) {
                    let bodyString = '';
                    
                    if (typeof args[1].body === 'string') {
                        bodyString = args[1].body;
                    } else if (args[1].body instanceof FormData) {
                        const action = args[1].body.get ? args[1].body.get('action') : null;
                        if (action === 'salvar_ingresso_individual') {
                            bodyString = 'salvar_ingresso_individual';
                        }
                    }
                    
                    if (bodyString.includes('salvar_ingresso_individual')) {
                        clonedResponse.json().then(data => {
                            if (data.sucesso && data.ingresso_id) {
                                setTimeout(() => {
                                    atualizarElementoUnicoComId(data.ingresso_id, {});
                                }, 200);
                            }
                        }).catch(() => {});
                    }
                }
                
                return response;
            });
        }
        
        return request;
    };
    
    console.log('✅ Consolidação final aplicada');
});
