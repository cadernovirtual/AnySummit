/**
 * Debug temporário para verificar funções disponíveis
 */

(function() {
    'use strict';
    
    console.log('🔍 DEBUG: Verificando funções disponíveis');
    
    setTimeout(() => {
        console.log('📋 Funções do wizard:');
        console.log('- window.salvarEtapa:', typeof window.salvarEtapa);
        console.log('- window.salvarEtapaAtual:', typeof window.salvarEtapaAtual);
        console.log('- window.getEventoId:', typeof window.getEventoId);
        console.log('- window.getCurrentStep:', typeof window.getCurrentStep);
        console.log('- window.setCurrentStep:', typeof window.setCurrentStep);
        console.log('- window.validateStep:', typeof window.validateStep);
        console.log('- window.nextStep:', typeof window.nextStep);
        console.log('- window.updateStepDisplay:', typeof window.updateStepDisplay);
        
        // Verificar se wizardState existe
        if (window.wizardState) {
            console.log('📊 wizardState:', window.wizardState);
        }
        
        // Testar chamada manual
        window.testarCriarEvento = function() {
            console.log('🧪 Testando criação manual de evento...');
            if (window.salvarEtapaAtual) {
                window.salvarEtapaAtual(1);
            } else {
                console.error('❌ salvarEtapaAtual não está disponível!');
            }
        };
        
        console.log('💡 Para testar criação manual, execute: testarCriarEvento()');
        
    }, 2000);
    
})();
