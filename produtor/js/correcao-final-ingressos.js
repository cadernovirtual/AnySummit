/**
 * CORREÇÃO FINAL: Update de ingressos e funções de edição/exclusão
 * Resolve problemas de lote_id no update e botões sem funções
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção final de ingressos - Update e botões');
    
    // 1. CORRIGIR UPDATE de ingressos - interceptar e corrigir dados
    const originalUpdatePaidTicket = window.updatePaidTicket;
    if (originalUpdatePaidTicket) {
        window.updatePaidTicket = function() {
            console.log('📝 Interceptando updatePaidTicket para corrigir lote_id');
            
            // Coletar lote_id do modal de edição
            const loteSelect = document.getElementById('editPaidTicketLote');
            const loteId = loteSelect ? parseInt(loteSelect.value) : null;
            
            console.log('🎯 lote_id coletado do modal de edição:', loteId);
            
            // Chamar função original
            const result = originalUpdatePaidTicket.apply(this, arguments);
            
            // Após update, FORÇAR o lote_id no elemento
            setTimeout(() => {
                const ticketId = document.getElementById('editPaidTicketId')?.value;
                if (ticketId) {
                    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                    if (ticketElement && ticketElement.ticketData) {
                        ticketElement.ticketData.loteId = loteId;
                        ticketElement.ticketData.lote_id = loteId;
                        console.log('✅ lote_id FORÇADO no elemento após update:', loteId);
                    }
                }
            }, 100);
            
            return result;
        };
    }
    
    const originalUpdateFreeTicket = window.updateFreeTicket;
    if (originalUpdateFreeTicket) {
        window.updateFreeTicket = function() {
            console.log('📝 Interceptando updateFreeTicket para corrigir lote_id');
            
            // Coletar lote_id do modal de edição
            const loteSelect = document.getElementById('editFreeTicketLote');
            const loteId = loteSelect ? parseInt(loteSelect.value) : null;
            
            console.log('🎯 lote_id coletado do modal de edição gratuito:', loteId);
            
            // Chamar função original
            const result = originalUpdateFreeTicket.apply(this, arguments);
            
            // Após update, FORÇAR o lote_id no elemento
            setTimeout(() => {
                const ticketId = document.getElementById('editFreeTicketId')?.value;
                if (ticketId) {
                    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                    if (ticketElement && ticketElement.ticketData) {
                        ticketElement.ticketData.loteId = loteId;
                        ticketElement.ticketData.lote_id = loteId;
                        console.log('✅ lote_id FORÇADO no elemento gratuito após update:', loteId);
                    }
                }
            }, 100);
            
            return result;
        };
    }
    
    // 2. CRIAR FUNÇÕES DE EDIÇÃO E EXCLUSÃO (que estavam faltando)
    
    // Função para editar ingresso
    window.editarIngresso = function(button) {
        console.log('✏️ Editando ingresso...');
        
        const ticketItem = button.closest('.ticket-item');
        if (!ticketItem || !ticketItem.ticketData) {
            console.error('❌ Dados do ingresso não encontrados');
            return;
        }
        
        const ticketData = ticketItem.ticketData;
        console.log('📊 Dados do ingresso para edição:', ticketData);
        
        // Determinar tipo do ingresso e abrir modal apropriado
        const tipo = ticketData.tipo || ticketData.type;
        
        if (tipo === 'pago' || tipo === 'paid') {
            abrirModalEdicaoPago(ticketData);
        } else if (tipo === 'gratuito' || tipo === 'free') {
            abrirModalEdicaoGratuito(ticketData);
        } else if (tipo === 'combo') {
            // Para combos, usar modal específico se existir
            console.log('🎭 Editando combo - implementar se necessário');
            abrirModalEdicaoPago(ticketData); // Fallback
        }
    };
    
    // Função para excluir ingresso
    window.excluirIngresso = function(button) {
        console.log('🗑️ Excluindo ingresso...');
        
        const ticketItem = button.closest('.ticket-item');
        if (!ticketItem) {
            console.error('❌ Item do ingresso não encontrado');
            return;
        }
        
        const ticketData = ticketItem.ticketData;
        const titulo = ticketData?.titulo || ticketData?.title || 'ingresso';
        
        if (confirm(`Tem certeza que deseja excluir o ingresso "${titulo}"?`)) {
            // Remover da interface
            ticketItem.remove();
            
            // Atualizar contador se existir
            atualizarContadorIngressos();
            
            console.log('✅ Ingresso excluído da interface');
        }
    };
    
    // Função para abrir modal de edição - pago
    function abrirModalEdicaoPago(ticketData) {
        console.log('💰 Abrindo modal de edição para ingresso pago');
        
        // Preencher campos do modal
        document.getElementById('editPaidTicketId').value = ticketData.id || '';
        document.getElementById('editPaidTicketTitle').value = ticketData.titulo || ticketData.title || '';
        document.getElementById('editPaidTicketDescription').value = ticketData.descricao || ticketData.description || '';
        document.getElementById('editPaidTicketQuantity').value = ticketData.quantity || ticketData.quantidade_total || 100;
        document.getElementById('editPaidTicketPrice').value = ticketData.preco || ticketData.price || 0;
        document.getElementById('editPaidSaleStart').value = ticketData.inicio_venda || ticketData.startDate || '';
        document.getElementById('editPaidSaleEnd').value = ticketData.fim_venda || ticketData.endDate || '';
        document.getElementById('editPaidMinLimit').value = ticketData.limite_min || ticketData.minQuantity || 1;
        document.getElementById('editPaidMaxLimit').value = ticketData.limite_max || ticketData.maxQuantity || 5;
        
        // Selecionar lote correto
        const loteSelect = document.getElementById('editPaidTicketLote');
        if (loteSelect && ticketData.loteId) {
            loteSelect.value = ticketData.loteId;
        }
        
        // Abrir modal
        openModal('editPaidTicketModal');
    }
    
    // Função para abrir modal de edição - gratuito
    function abrirModalEdicaoGratuito(ticketData) {
        console.log('🆓 Abrindo modal de edição para ingresso gratuito');
        
        // Preencher campos do modal
        document.getElementById('editFreeTicketId').value = ticketData.id || '';
        document.getElementById('editFreeTicketTitle').value = ticketData.titulo || ticketData.title || '';
        document.getElementById('editFreeTicketDescription').value = ticketData.descricao || ticketData.description || '';
        document.getElementById('editFreeTicketQuantity').value = ticketData.quantity || ticketData.quantidade_total || 100;
        document.getElementById('editFreeSaleStart').value = ticketData.inicio_venda || ticketData.startDate || '';
        document.getElementById('editFreeSaleEnd').value = ticketData.fim_venda || ticketData.endDate || '';
        document.getElementById('editFreeMinLimit').value = ticketData.limite_min || ticketData.minQuantity || 1;
        document.getElementById('editFreeMaxLimit').value = ticketData.limite_max || ticketData.maxQuantity || 5;
        
        // Selecionar lote correto
        const loteSelect = document.getElementById('editFreeTicketLote');
        if (loteSelect && ticketData.loteId) {
            loteSelect.value = ticketData.loteId;
        }
        
        // Abrir modal
        openModal('editFreeTicketModal');
    }
    
    // Função para atualizar contador de ingressos
    function atualizarContadorIngressos() {
        const ticketItems = document.querySelectorAll('.ticket-item');
        const contador = document.getElementById('totalIngressos');
        
        if (contador) {
            contador.textContent = ticketItems.length;
        }
        
        console.log(`📊 Contador atualizado: ${ticketItems.length} ingressos`);
    }
    
    // 3. CORRIGIR RESTAURAÇÃO DE INGRESSOS - Garantir botões com ícones
    const originalRestaurarIngressos = window.restaurarIngressos;
    if (originalRestaurarIngressos) {
        window.restaurarIngressos = function(ingressos) {
            console.log('🔄 Interceptando restauração de ingressos para corrigir botões');
            
            // Chamar função original
            const result = originalRestaurarIngressos.apply(this, arguments);
            
            // Após restauração, corrigir botões
            setTimeout(() => {
                corrigirBotoesIngressos();
            }, 500);
            
            return result;
        };
    }
    
    // Função para corrigir botões dos ingressos
    function corrigirBotoesIngressos() {
        console.log('🔧 Corrigindo botões dos ingressos restaurados...');
        
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach((item, index) => {
// ARQUIVO DESATIVADO - ESTAVA CAUSANDO DUPLICAÇÃO DE BOTÕES
// Os botões já são criados corretamente pelo padronizacao-definitiva.js

console.log('⚠️ correcao-final-ingressos.js DESATIVADO para evitar duplicação');

// Manter apenas as funções essenciais sem criar botões duplicados
                    editButton.title = 'Editar ingresso';
                    editButton.onclick = function() { editarIngresso(this); };
                    actionsContainer.appendChild(editButton);
                }
                
                if (!deleteButton) {
                    deleteButton = document.createElement('button');
                    deleteButton.type = 'button';
                    deleteButton.className = 'btn-delete-ticket';
                    deleteButton.innerHTML = '🗑️'; // Ícone de exclusão
                    deleteButton.title = 'Excluir ingresso';
                    deleteButton.onclick = function() { excluirIngresso(this); };
                    actionsContainer.appendChild(deleteButton);
                }
            } else {
                // Corrigir ícones se botões existem mas sem ícone
                if (editButton && !editButton.innerHTML.includes('✏️')) {
                    editButton.innerHTML = '✏️';
                    editButton.onclick = function() { editarIngresso(this); };
                }
                
                if (deleteButton && !deleteButton.innerHTML.includes('🗑️')) {
                    deleteButton.innerHTML = '🗑️';
                    deleteButton.onclick = function() { excluirIngresso(this); };
                }
            }
        });
        
        console.log('✅ Botões corrigidos para todos os ingressos');
    }
    
    // Função para criar container de ações se não existir
    function criarContainerAcoes(ticketItem) {
        let container = ticketItem.querySelector('.ticket-actions');
        if (!container) {
            container = document.createElement('div');
            container.className = 'ticket-actions';
            container.style.cssText = 'display: flex; gap: 5px; margin-top: 10px;';
            ticketItem.appendChild(container);
        }
        return container;
    }
    
    // Função de teste manual
    window.testarCorrecaoIngressos = function() {
        console.log('🧪 Testando correção de ingressos...');
        
        const ticketItems = document.querySelectorAll('.ticket-item');
        console.log(`📊 ${ticketItems.length} ingressos encontrados`);
        
        ticketItems.forEach((item, index) => {
            console.log(`\n🎫 Ingresso ${index + 1}:`);
            console.log('  - ticketData.loteId:', item.ticketData?.loteId);
            console.log('  - ticketData.lote_id:', item.ticketData?.lote_id);
            
            const editBtn = item.querySelector('button[onclick*="editarIngresso"]');
            const deleteBtn = item.querySelector('button[onclick*="excluirIngresso"]');
            
            console.log('  - Botão editar:', !!editBtn);
            console.log('  - Botão excluir:', !!deleteBtn);
        });
        
        console.log('\n📦 Testando coleta de dados:');
        if (window.coletarDadosIngressos) {
            const dados = window.coletarDadosIngressos();
            dados.forEach((ingresso, index) => {
                console.log(`  Ingresso ${index + 1} - lote_id: ${ingresso.lote_id}`);
            });
        }
    };
    
    console.log('✅ Correção final de ingressos carregada');
    console.log('  - Update corrigido para enviar lote_id');
    console.log('  - Funções editarIngresso() e excluirIngresso() criadas');
    console.log('  - Botões com ícones garantidos na restauração');
    console.log('💡 Use testarCorrecaoIngressos() para verificar');
});
