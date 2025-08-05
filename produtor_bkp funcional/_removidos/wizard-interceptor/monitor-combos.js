/**
 * Monitor específico para ingressos combo
 * Garante que conteudo_combo está sendo salvo corretamente
 */

(function() {
    'use strict';
    
    console.log('🎫 Monitor de Combos iniciado');
    
    // Override do createComboTicket se existir
    if (window.createComboTicket) {
        const originalCreateCombo = window.createComboTicket;
        window.createComboTicket = function() {
            console.log('📦 createComboTicket chamado');
            console.log('Items do combo:', window.comboItems);
            
            const result = originalCreateCombo.apply(this, arguments);
            
            // Forçar coleta após criar combo
            setTimeout(() => {
                if (window.coletarDadosStepAtual) {
                    window.coletarDadosStepAtual(6);
                }
                
                // Verificar se foi salvo corretamente
                const saved = localStorage.getItem('wizardCollectedData');
                if (saved) {
                    const data = JSON.parse(saved);
                    const combos = data.dados.ingressos.filter(ing => ing.tipo === 'combo');
                    console.log('🎯 Combos salvos:', combos);
                    
                    combos.forEach(combo => {
                        console.log(`📦 Combo "${combo.nome}":`, combo.conteudo_combo);
                    });
                }
            }, 500);
            
            return result;
        };
    }
    
    // Monitorar window.comboItems
    let lastComboItems = '';
    setInterval(() => {
        if (window.comboItems) {
            const current = JSON.stringify(window.comboItems);
            if (current !== lastComboItems) {
                lastComboItems = current;
                console.log('🔄 comboItems mudou:', window.comboItems);
            }
        }
    }, 1000);
    
    // Comando para debug manual
    window.debugCombos = function() {
        console.log('=== DEBUG COMBOS ===');
        console.log('window.comboItems:', window.comboItems);
        
        // Verificar temporaryTickets
        if (window.temporaryTickets) {
            if (window.temporaryTickets instanceof Map) {
                window.temporaryTickets.forEach((ticket, key) => {
                    if (ticket.type === 'combo') {
                        console.log('Combo em temporaryTickets:', ticket);
                    }
                });
            }
        }
        
        // Verificar dados salvos
        const saved = localStorage.getItem('wizardCollectedData');
        if (saved) {
            const data = JSON.parse(saved);
            const combos = data.dados.ingressos.filter(ing => ing.tipo === 'combo');
            console.log('Combos salvos:', combos);
        }
        
        // Verificar elementos DOM
        document.querySelectorAll('.ticket-item').forEach(el => {
            if (el.dataset.ticketType === 'combo' || el.querySelector('.ticket-type')?.textContent === 'Combo') {
                console.log('Combo no DOM:', el);
                console.log('ticketData:', el.ticketData);
            }
        });
    };
    
    console.log('💡 Use debugCombos() para debug manual');
    
})();
