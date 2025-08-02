/**
 * Correção para esconder mensagens de validação ao carregar
 */

(function() {
    'use strict';
    
    // Esconder todas as mensagens de validação ao carregar
    document.addEventListener('DOMContentLoaded', function() {
        // Esconder todas as validation-messages
        document.querySelectorAll('.validation-message').forEach(msg => {
            msg.style.display = 'none';
        });
        
        console.log('✅ Mensagens de validação ocultas');
    });
    
})();
