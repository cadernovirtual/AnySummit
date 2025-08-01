// Debug para investigar associação lote-ingresso
(function() {
    console.log('🔍 INICIANDO DEBUG DE LOTE-INGRESSO');
    
    // Função global para debug
    window.debugLoteIngresso = function() {
        console.log('=== DEBUG DE LOTES E INGRESSOS ===');
        
        // 1. Verificar lotes no DOM
        console.log('\n📋 LOTES NO DOM:');
        const loteCards = document.querySelectorAll('.lote-card');
        loteCards.forEach((card, index) => {
            const loteId = card.getAttribute('data-lote-id');
            const nome = card.querySelector('.lote-nome')?.textContent || 'Sem nome';
            console.log(`Lote ${index}: ID="${loteId}", Nome="${nome}"`);
        });
        
        // 2. Verificar ingressos no DOM
        console.log('\n🎫 INGRESSOS NO DOM:');
        const ticketItems = document.querySelectorAll('.ticket-item');
        ticketItems.forEach((item, index) => {
            const ticketId = item.dataset.ticketId;
            const loteId = item.dataset.loteId;
            const ticketData = item.ticketData;
            const nome = item.querySelector('.ticket-name')?.textContent || 'Sem nome';
            
            console.log(`Ingresso ${index}:`, {
                ticketId: ticketId,
                loteId_dataset: loteId,
                loteId_ticketData: ticketData?.loteId,
                nome: nome,
                tipo: item.dataset.ticketType || ticketData?.tipo
            });
        });
        
        // 3. Verificar dados salvos no cookie
        console.log('\n💾 DADOS SALVOS NO COOKIE:');
        const savedData = getCookie('eventoWizard');
        if (savedData) {
            try {
                const wizardData = JSON.parse(savedData);
                
                console.log('Lotes salvos:', wizardData.lotes);
                console.log('Ingressos salvos:', wizardData.ingressos);
                
                // Analisar associações
                if (wizardData.ingressos) {
                    console.log('\n🔗 ASSOCIAÇÕES LOTE-INGRESSO:');
                    wizardData.ingressos.forEach((ingresso, index) => {
                        console.log(`Ingresso "${ingresso.titulo}": loteId="${ingresso.loteId}"`);
                    });
                }
            } catch (e) {
                console.error('Erro ao parsear dados salvos:', e);
            }
        }
        
        // 4. Testar função loteTemIngressos
        console.log('\n🧪 TESTE DA FUNÇÃO loteTemIngressos:');
        loteCards.forEach(card => {
            const loteId = card.getAttribute('data-lote-id');
            const resultado = window.loteTemIngressos ? window.loteTemIngressos(loteId) : 'Função não encontrada';
            console.log(`Lote "${loteId}" tem ingressos: ${resultado}`);
        });
        
        // 5. Verificar se as funções de exclusão existem
        console.log('\n⚙️ FUNÇÕES DE EXCLUSÃO:');
        console.log('excluirLoteData existe:', typeof window.excluirLoteData);
        console.log('excluirLotePercentual existe:', typeof window.excluirLotePercentual);
        console.log('loteTemIngressos existe:', typeof window.loteTemIngressos);
    };
    
    // Adicionar botão de debug
    const addDebugButton = function() {
        const existingButton = document.getElementById('debugLoteIngressoBtn');
        if (existingButton) return;
        
        const button = document.createElement('button');
        button.id = 'debugLoteIngressoBtn';
        button.textContent = '🔍 Debug Lote-Ingresso';
        button.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            z-index: 9999;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;
        button.onclick = window.debugLoteIngresso;
        document.body.appendChild(button);
    };
    
    // Adicionar botão quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDebugButton);
    } else {
        addDebugButton();
    }
    
    // Auto-executar debug inicial
    setTimeout(() => {
        console.log('🔧 Debug automático inicial:');
        window.debugLoteIngresso();
    }, 2000);
    
})();
