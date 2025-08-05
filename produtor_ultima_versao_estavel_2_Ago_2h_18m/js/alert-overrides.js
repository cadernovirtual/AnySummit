/**
 * Sistema de override de alerts
 * Substitui alert() padrão por dialogs customizados
 */

(function() {
    'use strict';
    
    console.log('🔧 Aplicando override de alert...');
    
    // Salvar referência ao alert original
    window._originalAlert = window.alert;
    
    // Substituir alert global
    window.alert = function(message) {
        // Se customDialog existir, usar
        if (window.customDialog && window.customDialog.alert) {
            window.customDialog.alert(message);
        } else {
            // Fallback para alert original
            window._originalAlert(message);
        }
    };
    
    // Substituir confirm global
    window._originalConfirm = window.confirm;
    
    window.confirm = function(message) {
        // Se customDialog existir, usar
        if (window.customDialog && window.customDialog.confirm) {
            return window.customDialog.confirm(message);
        } else {
            // Fallback para confirm original
            return window._originalConfirm(message);
        }
    };
    
    console.log('✅ Override de alert aplicado com sucesso');
    
})();
