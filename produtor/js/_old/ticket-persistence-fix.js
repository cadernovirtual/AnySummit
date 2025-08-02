/**
 * Correção completa para persistência de ingressos
 * Corrige tipos, campos e estrutura dos dados
 */

(function() {
    'use strict';
    
    console.log('🔧 Carregando correções de persistência de ingressos...');
    
    // Mapeamento de tipos
    const TYPE_MAP = {
        'paid': 'pago',
        'free': 'gratuito',
        'combo': 'combo',
        'pago': 'pago',
        'gratuito': 'gratuito'
    };
    
    // Override da função addTicketToCreationList
    const originalAddTicketToCreationList = window.addTicketToCreationList;
    if (originalAddTicketToCreationList) {
        window.addTicketToCreationList = function(type, title, quantity, price, description, saleStart, saleEnd, minLimit, maxLimit, cobrarTaxa, taxaPlataforma, valorReceber, loteId) {
            console.log('🎫 addTicketToCreationList interceptado:', {type, title, quantity, price});
            
            // Chamar função original
            const result = originalAddTicketToCreationList.apply(this, arguments);
            
            // Forçar salvamento após adicionar
            setTimeout(() => {
                if (window.saveWizardData) {
                    window.saveWizardData();
                }
            }, 100);
            
            return result;
        };
    }
    
    // Override da função saveWizardData para corrigir estrutura dos ingressos
    const originalSaveWizardData = window.saveWizardData;
    window.saveWizardData = function() {
        console.log('💾 saveWizardData interceptado - corrigindo estrutura de ingressos');
        
        // Primeiro, chamar a função original se existir
        if (originalSaveWizardData) {
            originalSaveWizardData.apply(this, arguments);
        }
        
        // Agora vamos corrigir/complementar os dados salvos
        try {
            // Recuperar dados salvos
            const savedData = getCookie('eventoWizard');
            if (!savedData) return;
            
            const wizardData = JSON.parse(savedData);
            
            // Corrigir ingressos
            if (wizardData.ingressos || wizardData.tickets) {
                const ingressosCorrigidos = [];
                
                // Coletar ingressos de temporaryTickets primeiro
                if (window.temporaryTickets) {
                    if (window.temporaryTickets instanceof Map) {
                        // Se for Map
                        window.temporaryTickets.forEach((ticket, id) => {
                            const ingressoCorrigido = {
                                id: ticket.id || id,
                                tipo: TYPE_MAP[ticket.type] || ticket.type || 'pago',
                                nome: ticket.title || ticket.nome || '',
                                descricao: ticket.description || '',
                                valor: (ticket.price || 0).toString(),
                                taxa: (ticket.taxaPlataforma || 0).toString(),
                                quantidade: (ticket.quantity || 0).toString(),
                                qtd_minima_por_pessoa: (ticket.minLimit || 1).toString(),
                                qtd_maxima_por_pessoa: (ticket.maxLimit || 5).toString(),
                                lote_id: ticket.loteId || ''
                            };
                            
                            // Se for combo, adicionar conteudo_combo
                            if (ticket.type === 'combo' && window.comboItems && window.comboItems.length > 0) {
                                ingressoCorrigido.conteudo_combo = {};
                                window.comboItems.forEach(item => {
                                    if (item.ticketId && item.quantity) {
                                        ingressoCorrigido.conteudo_combo[item.ticketId] = item.quantity;
                                    }
                                });
                            }
                            
                            ingressosCorrigidos.push(ingressoCorrigido);
                        });
                    }
                } 
                
                // Se não conseguiu de temporaryTickets, tentar dos dados salvos
                if (ingressosCorrigidos.length === 0 && (wizardData.ingressos || wizardData.tickets)) {
                    const ingressosSalvos = wizardData.ingressos || wizardData.tickets;
                    ingressosSalvos.forEach(ticket => {
                        const ingressoCorrigido = {
                            id: ticket.id || ticket.ticketId,
                            tipo: TYPE_MAP[ticket.tipo] || TYPE_MAP[ticket.type] || ticket.tipo || 'pago',
                            nome: ticket.nome || ticket.titulo || ticket.title || '',
                            descricao: ticket.descricao || ticket.description || '',
                            valor: (ticket.valor || ticket.preco || ticket.price || 0).toString(),
                            taxa: (ticket.taxa || ticket.taxaPlataforma || 0).toString(),
                            quantidade: (ticket.quantidade || ticket.quantity || 0).toString(),
                            qtd_minima_por_pessoa: (ticket.qtd_minima_por_pessoa || ticket.minQuantity || ticket.minLimit || 1).toString(),
                            qtd_maxima_por_pessoa: (ticket.qtd_maxima_por_pessoa || ticket.maxQuantity || ticket.maxLimit || 5).toString(),
                            lote_id: ticket.lote_id || ticket.loteId || ''
                        };
                        
                        // Remover campo por_pessoa se existir
                        delete ingressoCorrigido.por_pessoa;
                        
                        // Se for combo
                        if (ingressoCorrigido.tipo === 'combo') {
                            if (ticket.conteudo_combo) {
                                ingressoCorrigido.conteudo_combo = ticket.conteudo_combo;
                            } else if (ticket.comboData) {
                                ingressoCorrigido.conteudo_combo = {};
                                if (Array.isArray(ticket.comboData)) {
                                    ticket.comboData.forEach(item => {
                                        if (item.ticketId && item.quantity) {
                                            ingressoCorrigido.conteudo_combo[item.ticketId] = item.quantity;
                                        }
                                    });
                                }
                            } else if (ticket.items) {
                                ingressoCorrigido.conteudo_combo = {};
                                if (typeof ticket.items === 'object' && !Array.isArray(ticket.items)) {
                                    ingressoCorrigido.conteudo_combo = ticket.items;
                                } else if (Array.isArray(ticket.items)) {
                                    ticket.items.forEach(item => {
                                        if (item.ticketId && item.quantity) {
                                            ingressoCorrigido.conteudo_combo[item.ticketId] = item.quantity;
                                        }
                                    });
                                }
                            }
                        }
                        
                        ingressosCorrigidos.push(ingressoCorrigido);
                    });
                }
                
                // Atualizar dados com ingressos corrigidos
                wizardData.ingressos = ingressosCorrigidos;
                
                // Salvar dados corrigidos
                setCookie('eventoWizard', JSON.stringify(wizardData), 7);
                console.log('✅ Ingressos corrigidos e salvos:', ingressosCorrigidos);
            }
            
        } catch (e) {
            console.error('Erro ao corrigir ingressos:', e);
        }
    };
    
    // Função helper para getCookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Função helper para setCookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }
    
    // Interceptar criação de combos também
    const originalCreateComboTicket = window.createComboTicket;
    if (originalCreateComboTicket) {
        window.createComboTicket = function() {
            console.log('📦 createComboTicket interceptado');
            
            // Chamar função original
            const result = originalCreateComboTicket.apply(this, arguments);
            
            // Forçar salvamento após criar combo
            setTimeout(() => {
                if (window.saveWizardData) {
                    window.saveWizardData();
                }
            }, 500);
            
            return result;
        };
    }
    
    console.log('✅ Correções de persistência de ingressos carregadas!');
    
})();
