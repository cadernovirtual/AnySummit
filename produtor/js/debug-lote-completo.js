// Debug para entender porque não está encontrando os ingressos
(function() {
    console.log('🔍 DEBUG DE LOTE-INGRESSO INICIADO');
    
    // Função global para debug completo
    window.debugLoteIngressoCompleto = function() {
        console.log('\n========== DEBUG COMPLETO ==========');
        
        // Função getCookie local
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }
        
        // 1. Ver o que tem no cookie principal
        console.log('\n📦 COOKIE eventoWizard:');
        const saved = getCookie('eventoWizard');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                console.log('Dados completos (expandir para ver):', data);
                
                // Listar todas as propriedades
                console.log('\n🔑 Propriedades do cookie:');
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    if (Array.isArray(value)) {
                        console.log(`- ${key}: Array com ${value.length} itens`);
                    } else if (typeof value === 'object' && value !== null) {
                        console.log(`- ${key}: Objeto`);
                    } else {
                        console.log(`- ${key}: ${value}`);
                    }
                });
                
                // Procurar por qualquer coisa que pareça ingresso
                console.log('\n🔍 Procurando por ingressos em TODAS as propriedades:');
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    if (Array.isArray(value) && value.length > 0) {
                        // Ver se o array tem objetos com titulo ou title
                        const primeiroItem = value[0];
                        if (primeiroItem && (primeiroItem.titulo || primeiroItem.title || primeiroItem.nome)) {
                            console.log(`\n📌 Possíveis ingressos em "${key}":`);
                            value.forEach((item, i) => {
                                console.log(`Item ${i}:`, {
                                    titulo: item.titulo || item.title || item.nome,
                                    loteId: item.loteId || item.lote_id || item.lote,
                                    tipo_loteId: typeof (item.loteId || item.lote_id || item.lote)
                                });
                            });
                        }
                    }
                });
                
                if (data.ingressos) {
                    console.log('\n🎫 Ingressos no cookie:');
                    data.ingressos.forEach((ing, i) => {
                        console.log(`Ingresso ${i}:`, {
                            titulo: ing.titulo || ing.title,
                            loteId: ing.loteId,
                            tipo_loteId: typeof ing.loteId
                        });
                    });
                }
                
                if (data.tickets) {
                    console.log('\n🎟️ Tickets no cookie:');
                    data.tickets.forEach((tick, i) => {
                        console.log(`Ticket ${i}:`, {
                            titulo: tick.titulo || tick.title,
                            loteId: tick.loteId,
                            tipo_loteId: typeof tick.loteId
                        });
                    });
                }
            } catch (e) {
                console.error('Erro ao parsear cookie:', e);
            }
        } else {
            console.log('Cookie eventoWizard não encontrado!');
        }
        
        // 2. Ver cookie de ingressos separado
        console.log('\n📦 COOKIE ingressosData:');
        const ingressosData = getCookie('ingressosData');
        if (ingressosData) {
            try {
                const ingressos = JSON.parse(ingressosData);
                console.log('Ingressos salvos separadamente:', ingressos);
            } catch (e) {
                console.error('Erro ao parsear ingressosData:', e);
            }
        } else {
            console.log('Cookie ingressosData não encontrado!');
        }
        
        // 3. Ver lotes no DOM
        console.log('\n📋 LOTES NO DOM:');
        document.querySelectorAll('.lote-item').forEach(lote => {
            console.log('Lote:', {
                id: lote.dataset.id,
                nome: lote.querySelector('.lote-item-name')?.textContent
            });
        });
        
        // 4. Ver ingressos no DOM
        console.log('\n🎫 INGRESSOS NO DOM:');
        document.querySelectorAll('.ticket-item').forEach(ticket => {
            console.log('Ingresso DOM:', {
                id: ticket.dataset.ticketId,
                loteId: ticket.dataset.loteId,
                ticketData: ticket.ticketData
            });
        });
        
        console.log('\n========== FIM DO DEBUG ==========\n');
    };
    
    // Adicionar botão de debug
    const addDebugButton = function() {
        const existingButton = document.getElementById('debugCompleteBtn');
        if (existingButton) existingButton.remove();
        
        const button = document.createElement('button');
        button.id = 'debugCompleteBtn';
        button.textContent = '🐛 Debug Completo';
        button.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            z-index: 9999;
            background: #dc3545;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;
        button.onclick = window.debugLoteIngressoCompleto;
        document.body.appendChild(button);
    };
    
    // Adicionar botão quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDebugButton);
    } else {
        addDebugButton();
    }
    
    // Auto-executar debug
    setTimeout(() => {
        console.log('🔧 Debug automático ao carregar:');
        window.debugLoteIngressoCompleto();
    }, 1000);
})();
