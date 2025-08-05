// Correção específica para botões de edição de combo
// Este arquivo deve ser carregado APÓS a renderização da lista de ingressos

(function() {
    console.log('🎭 Aplicando correção de botões para combos...');

    // Função para detectar se um elemento é um combo
    function isComboTicket(ticketElement) {
        // Verificar se tem badge de combo
        const comboBadge = ticketElement.querySelector('.ticket-type-badge.combo, [style*="background: #9C27B0"], [style*="background:#9C27B0"]');
        if (comboBadge) return true;

        // Verificar se tem texto "COMBO" ou "(Combo)"
        const ticketText = ticketElement.textContent;
        if (ticketText.includes('COMBO') || ticketText.includes('(Combo)')) return true;

        // Verificar dataset
        const ticketData = ticketElement.ticketData;
        if (ticketData && (ticketData.type === 'combo' || ticketData.tipo === 'combo')) return true;

        // Verificar atributos dataset
        if (ticketElement.dataset.tipo === 'combo' || ticketElement.dataset.type === 'combo') return true;

        return false;
    }

    // Função para extrair ID do ingresso do botão
    function extractTicketId(buttonElement) {
        const onclick = buttonElement.getAttribute('onclick');
        if (!onclick) return null;

        // Extrair ID do onclick="editTicket(123)" ou editTicket('123')
        const match = onclick.match(/editTicket\s*\(\s*['"]?(\d+)['"]?\s*\)/);
        return match ? match[1] : null;
    }

    // Função para corrigir botões de combo
    function fixComboButtons() {
        console.log('🔧 Verificando botões de edição de combo...');

        // Buscar todos os botões de editar
        const editButtons = document.querySelectorAll('button[onclick*="editTicket"], [onclick*="editTicket"]');
        
        editButtons.forEach(button => {
            // Encontrar o elemento pai do ingresso
            const ticketElement = button.closest('.ticket-item');
            if (!ticketElement) return;

            // Verificar se é um combo
            if (isComboTicket(ticketElement)) {
                const ticketId = extractTicketId(button);
                if (ticketId) {
                    // Substituir editTicket por editComboTicket
                    const newOnclick = `editComboTicket(${ticketId})`;
                    button.setAttribute('onclick', newOnclick);
                    
                    console.log(`✅ Botão de combo corrigido: editTicket(${ticketId}) → editComboTicket(${ticketId})`);
                }
            }
        });
    }

    // Função para observar mudanças no DOM e aplicar correções
    function startObserver() {
        const ticketList = document.getElementById('ticketList');
        if (!ticketList) {
            console.warn('⚠️ Lista de ingressos não encontrada');
            return;
        }

        // Observer para mudanças na lista
        const observer = new MutationObserver(function(mutations) {
            let hasNewTickets = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === 1 && (node.classList.contains('ticket-item') || node.querySelector('.ticket-item'))) {
                            hasNewTickets = true;
                            break;
                        }
                    }
                }
            });

            if (hasNewTickets) {
                console.log('🆕 Novos ingressos detectados, verificando combos...');
                setTimeout(fixComboButtons, 100); // Pequeno delay para garantir que o DOM esteja atualizado
            }
        });

        observer.observe(ticketList, {
            childList: true,
            subtree: true
        });

        console.log('👁️ Observer ativo para correção automática de botões');
    }

    // Aplicar correções ao carregar
    document.addEventListener('DOMContentLoaded', function() {
        fixComboButtons();
        startObserver();
    });

    // Se o documento já estiver carregado
    if (document.readyState === 'loading') {
        // Ainda carregando, aguardar DOMContentLoaded
    } else {
        // DOM já carregado
        fixComboButtons();
        startObserver();
    }

    // Função global para ser chamada manualmente se necessário
    window.fixComboButtons = fixComboButtons;

    console.log('✅ Correção de botões de combo configurada');
})();
