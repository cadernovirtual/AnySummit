// Fix definitivo para problemas de encoding
(function() {
    'use strict';
    
    // Mapeamento de caracteres corrompidos para corretos
    const encodingFixes = {
        'Ã§': 'ç',
        'Ã£': 'ã',
        'Ã¡': 'á',
        'Ã¢': 'â',
        'Ã©': 'é',
        'Ãª': 'ê',
        'Ã­': 'í',
        'Ã³': 'ó',
        'Ã´': 'ô',
        'Ãµ': 'õ',
        'Ãº': 'ú',
        'Ã‡': 'Ç',
        'Ãƒ': 'Ã',
        'Ã': 'Á',
        'Ã‚': 'Â',
        'Ã‰': 'É',
        'ÃŠ': 'Ê',
        'Ã': 'Í',
        'Ã"': 'Ó',
        'Ã"': 'Ô',
        'Ã•': 'Õ',
        'Ãš': 'Ú',
        'PreÃ§o': 'Preço',
        'VocÃª': 'Você',
        'âœï¸': '✏️',
        'ðŸ—'ï¸': '🗑️',
        'ðŸ"¦': '📦'
    };
    
    // Função para corrigir texto
    function fixText(text) {
        let fixed = text;
        for (const [bad, good] of Object.entries(encodingFixes)) {
            fixed = fixed.replace(new RegExp(bad, 'g'), good);
        }
        return fixed;
    }
    
    // Função para corrigir todos os elementos de texto
    function fixAllTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue && node.nodeValue.trim()) {
                const originalText = node.nodeValue;
                const fixedText = fixText(originalText);
                if (originalText !== fixedText) {
                    node.nodeValue = fixedText;
                }
            }
        }
    }
    
    // Função para substituir emojis por ícones SVG
    function replaceEmojisWithSVG() {
        // Substituir botões de editar
        document.querySelectorAll('button').forEach(button => {
            const html = button.innerHTML;
            if (html.includes('✏️') || html.includes('âœï¸') || html.includes('✏')) {
                button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                </svg>`;
            }
            if (html.includes('🗑️') || html.includes('ðŸ—'ï¸') || html.includes('🗑')) {
                button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>`;
            }
        });
        
        // Remover emojis de caixa dos títulos de combo
        document.querySelectorAll('.ticket-title').forEach(title => {
            title.innerHTML = title.innerHTML.replace(/ðŸ"¦|📦/g, '');
        });
    }
    
    // Função principal que aplica todas as correções
    function applyAllFixes() {
        console.log('🔧 Aplicando correções de encoding...');
        fixAllTextNodes();
        replaceEmojisWithSVG();
        console.log('✅ Correções de encoding aplicadas!');
    }
    
    // Aplicar correções quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyAllFixes);
    } else {
        applyAllFixes();
    }
    
    // Observar mudanças no DOM para aplicar correções em novos elementos
    const observer = new MutationObserver((mutations) => {
        let shouldFix = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldFix = true;
            }
        });
        if (shouldFix) {
            setTimeout(applyAllFixes, 10);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Exportar para uso manual se necessário
    window.fixEncodingNow = applyAllFixes;
    
})();
