/**
 * CORREÇÃO: Atualização de IDs após salvamento
 * Garante que botões de edição funcionem após salvar ingressos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Correção de IDs de edição carregada');
    
    // Interceptar resposta de salvamento para atualizar IDs
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const request = originalFetch.apply(this, args);
        
        // Se é uma requisição para salvar ingresso
        if (args[0] && args[0].includes('wizard_evento.php')) {
            return request.then(response => {
                const clonedResponse = response.clone();
                
                // Verificar se é salvamento de ingresso - CORRIGIDO
                if (args[1] && args[1].body) {
                    let bodyString = '';
                    
                    // Verificar tipo do body
                    if (typeof args[1].body === 'string') {
                        bodyString = args[1].body;
                    } else if (args[1].body instanceof FormData) {
                        // Para FormData, verificar se tem a action
                        const action = args[1].body.get ? args[1].body.get('action') : null;
                        if (action === 'salvar_ingresso_individual') {
                            bodyString = 'salvar_ingresso_individual';
                        }
                    }
                    
                    // Apenas processar se for salvamento de ingresso
                    if (bodyString.includes('salvar_ingresso_individual')) {
                        clonedResponse.json().then(data => {
                            if (data.sucesso && data.ingresso_id) {
                                console.log(`🔄 Ingresso salvo com ID: ${data.ingresso_id}`);
                                
                                // Aguardar um pouco para garantir que o elemento foi criado
                                setTimeout(() => {
                                    atualizarElementoIngressoCompleto(data.ingresso_id);
                                }, 200);
                            }
                        }).catch(e => {
                            // Ignorar erros de parsing se não for JSON
                        });
                    }
                }
                
                return response;
            });
        }
        
        return request;
    };
    
    function atualizarElementoIngressoCompleto(ingressoId) {
        console.log(`🔍 Procurando elemento para atualizar com ID: ${ingressoId}`);
        
        // Buscar o último item adicionado
        const ticketItems = document.querySelectorAll('.ticket-item');
        const ultimoItem = ticketItems[ticketItems.length - 1];
        
        if (ultimoItem) {
            console.log(`✅ Atualizando último item com ID: ${ingressoId}`);
            
            // Atualizar todos os atributos possíveis
            ultimoItem.dataset.ticketId = ingressoId;
            ultimoItem.dataset.ingressoId = ingressoId;
            ultimoItem.setAttribute('data-ticket-id', ingressoId);
            ultimoItem.setAttribute('data-ingresso-id', ingressoId);
            ultimoItem.id = `ticket-${ingressoId}`;
            
            // Garantir que ticketData existe e tem o ID
            if (!ultimoItem.ticketData) {
                ultimoItem.ticketData = {};
            }
            ultimoItem.ticketData.id = ingressoId;
            ultimoItem.ticketData.ingresso_id = ingressoId;
            
            // Atualizar botões de edição/exclusão
            atualizarBotoesEdicao(ultimoItem, ingressoId);
            
            console.log(`✅ Elemento completamente atualizado:`, {
                dataset: ultimoItem.dataset,
                ticketData: ultimoItem.ticketData
            });
        } else {
            console.warn('❌ Nenhum item encontrado para atualizar');
        }
    }
    
    function atualizarBotoesEdicao(elemento, ingressoId) {
        // Buscar botões de edição e exclusão
        const botoes = elemento.querySelectorAll('[onclick*="editItem"], [onclick*="deleteItem"], .edit-ticket-btn, .delete-ticket-btn');
        
        botoes.forEach(botao => {
            const onclickAtual = botao.getAttribute('onclick');
            if (onclickAtual) {
                let novoOnclick = onclickAtual;
                
                // Substituir editItem com ID antigo
                if (onclickAtual.includes('editItem')) {
                    novoOnclick = `editItem('${ingressoId}')`;
                }
                
                // Substituir deleteItem com ID antigo  
                if (onclickAtual.includes('deleteItem')) {
                    novoOnclick = `deleteItem('${ingressoId}')`;
                }
                
                botao.setAttribute('onclick', novoOnclick);
                console.log(`🔄 Botão atualizado: ${novoOnclick}`);
            }
        });
        
        // Também verificar se há botões com event listeners
        const editButtons = elemento.querySelectorAll('.edit-btn, .edit-ticket-btn');
        editButtons.forEach(btn => {
            btn.dataset.ticketId = ingressoId;
            btn.dataset.ingressoId = ingressoId;
        });
        
        const deleteButtons = elemento.querySelectorAll('.delete-btn, .delete-ticket-btn');
        deleteButtons.forEach(btn => {
            btn.dataset.ticketId = ingressoId;
            btn.dataset.ingressoId = ingressoId;
        });
    }
    
    // Função para re-escanear e corrigir todos os elementos existentes
    function corrigirTodosElementos() {
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach(item => {
            const ticketId = item.dataset.ticketId || item.dataset.ingressoId;
            
            if (ticketId && item.ticketData) {
                // Garantir consistência
                item.dataset.ticketId = ticketId;
                item.dataset.ingressoId = ticketId;
                item.setAttribute('data-ticket-id', ticketId);
                item.setAttribute('data-ingresso-id', ticketId);
                
                item.ticketData.id = ticketId;
                item.ticketData.ingresso_id = ticketId;
                
                atualizarBotoesEdicao(item, ticketId);
            }
        });
        
        console.log(`🔄 ${ticketItems.length} elementos verificados e corrigidos`);
    }
    
    // Executar correção inicial após 2 segundos
    setTimeout(() => {
        corrigirTodosElementos();
    }, 2000);
    
    // Disponibilizar função globalmente para debug
    window.corrigirTodosElementos = corrigirTodosElementos;
});
