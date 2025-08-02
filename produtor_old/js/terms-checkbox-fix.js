/**
 * Correção dos Checkboxes de Termos
 * Garante que a verificação funcione corretamente
 */

(function() {
    console.log('✅ Correção de checkboxes de termos ativada');
    
    // Aguardar DOM carregar
    function initTermsFix() {
        // Encontrar checkboxes
        const termsCheckbox = document.getElementById('acceptTerms');
        const privacyCheckbox = document.getElementById('acceptPrivacy');
        
        if (termsCheckbox) {
            // Adicionar listener para debug
            termsCheckbox.addEventListener('change', function() {
                console.log('📋 Termos checkbox mudou:', this.checked);
            });
            
            // Garantir que o valor seja lido corretamente
            Object.defineProperty(termsCheckbox, 'checked', {
                get: function() {
                    return this.hasAttribute('checked') || this.getAttribute('checked') === 'true';
                },
                set: function(value) {
                    if (value) {
                        this.setAttribute('checked', 'true');
                    } else {
                        this.removeAttribute('checked');
                    }
                }
            });
        }
        
        if (privacyCheckbox) {
            // Adicionar listener para debug
            privacyCheckbox.addEventListener('change', function() {
                console.log('🔒 Privacidade checkbox mudou:', this.checked);
            });
            
            // Garantir que o valor seja lido corretamente
            Object.defineProperty(privacyCheckbox, 'checked', {
                get: function() {
                    return this.hasAttribute('checked') || this.getAttribute('checked') === 'true';
                },
                set: function(value) {
                    if (value) {
                        this.setAttribute('checked', 'true');
                    } else {
                        this.removeAttribute('checked');
                    }
                }
            });
        }
        
        // Debug function
        window.debugTerms = function() {
            console.log('=== DEBUG TERMOS ===');
            console.log('Terms checkbox:', termsCheckbox);
            console.log('Terms checked:', termsCheckbox?.checked);
            console.log('Terms attribute:', termsCheckbox?.getAttribute('checked'));
            console.log('Privacy checkbox:', privacyCheckbox);
            console.log('Privacy checked:', privacyCheckbox?.checked);
            console.log('Privacy attribute:', privacyCheckbox?.getAttribute('checked'));
            console.log('===================');
        };
    }
    
    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTermsFix);
    } else {
        initTermsFix();
    }
    
})();