// Fix completo para encoding em todas as funções
(function() {
    'use strict';
    
    console.log('🔧 Aplicando correções de encoding nas funções...');
    
    // Salvar referências originais
    const originalAddTicketToList = window.addTicketToList;
    const originalAddComboToList = window.addComboToList;
    
    // Função auxiliar para limpar texto
    function fixText(text) {
        return text
            .replace(/PreÃ§o/g, 'Preço')
            .replace(/VocÃª/g, 'Você')
            .replace(/preÃ§o/g, 'preço')
            .replace(/vocÃª/g, 'você')
            .replace(/âœï¸/g, '✏️')
            .replace(/ðŸ—'ï¸/g, '🗑️')
            .replace(/ðŸ"¦/g, '📦');
    }
    
    // Sobrescrever addTicketToList
    if (originalAddTicketToList) {
        window.addTicketToList = function(...args) {
            // Chamar função original
            originalAddTicketToList.apply(this, args);
            
            // Corrigir textos após renderização
            setTimeout(() => {
                document.querySelectorAll('.ticket-item').forEach(item => {
                    // Corrigir textos
                    item.querySelectorAll('span').forEach(span => {
                        span.innerHTML = fixText(span.innerHTML);
                    });
                    
                    // Substituir ícones por SVG
                    item.querySelectorAll('.btn-icon').forEach(btn => {
                        const html = btn.innerHTML;
                        if (html.includes('✏') || html.includes('âœï¸')) {
                            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>';
                        }
                        if (html.includes('🗑') || html.includes('ðŸ—'ï¸')) {
                            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';
                        }
                    });
                });
            }, 10);
        };
    }
    
    // Função para corrigir combos existentes
    function fixExistingCombos() {
        document.querySelectorAll('.ticket-item').forEach(item => {
            // Remover emoji de caixa do título
            const title = item.querySelector('.ticket-title');
            if (title) {
                title.innerHTML = fixText(title.innerHTML).replace(/📦|ðŸ"¦/g, '');
            }
            
            // Corrigir todos os spans
            item.querySelectorAll('span').forEach(span => {
                span.innerHTML = fixText(span.innerHTML);
            });
            
            // Corrigir botões
            item.querySelectorAll('.btn-icon').forEach(btn => {
                const html = btn.innerHTML;
                if (html.includes('✏') || html.includes('âœï¸')) {
                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>';
                }
                if (html.includes('🗑') || html.includes('ðŸ—'ï¸')) {
                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';
                }
            });
        });
    }
    
    // Aplicar correções quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixExistingCombos);
    } else {
        setTimeout(fixExistingCombos, 100);
    }
    
    // Exportar função para uso manual
    window.fixComboEncoding = fixExistingCombos;
    
    console.log('✅ Correções de encoding aplicadas!');
    console.log('💡 Use window.fixComboEncoding() para aplicar correções manualmente');
    
})();
