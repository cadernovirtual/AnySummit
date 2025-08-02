// Debug para verificar carregamento de scripts
// Este arquivo força recarregamento e mostra status

(function() {
    console.log('=== DEBUG ANYSUMMIT ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Verificar funções de lote
    console.log('loteTemIngressos existe?', typeof window.loteTemIngressos);
    console.log('excluirLoteData existe?', typeof window.excluirLoteData);
    console.log('excluirLotePercentual existe?', typeof window.excluirLotePercentual);
    
    // Verificar funções de edição
    console.log('editTicket existe?', typeof window.editTicket);
    console.log('editCombo existe?', typeof window.editCombo);
    console.log('applyLoteDatesToTicket existe?', typeof window.applyLoteDatesToTicket);
    console.log('calculateEditComboValues existe?', typeof window.calculateEditComboValues);
    console.log('calculateEditPaidTicketValues existe?', typeof window.calculateEditPaidTicketValues);
    
    // Verificar se renderEditComboItems tem o SVG
    if (window.renderEditComboItems) {
        const funcString = window.renderEditComboItems.toString();
        const hasSVG = funcString.includes('<svg');
        const hasEmoji = funcString.includes('🗑️');
        console.log('renderEditComboItems tem SVG?', hasSVG);
        console.log('renderEditComboItems tem emoji?', hasEmoji);
    }
    
    // Forçar re-aplicação das correções se necessário
    if (typeof window.applyLoteDatesToTicket !== 'function') {
        console.warn('⚠️ applyLoteDatesToTicket não encontrada - recarregue a página!');
    }
    
    // Verificar validação de lotes
    if (window.validateStep) {
        console.log('validateStep existe?', true);
        // Testar validação da etapa 5
        const oldStep = window.getCurrentStep ? window.getCurrentStep() : 1;
        if (window.setCurrentStep) {
            window.setCurrentStep(5);
            const isValid = window.validateStep(5);
            console.log('Etapa 5 válida sem lotes?', isValid);
            window.setCurrentStep(oldStep);
        }
    }
    
    console.log('=== FIM DEBUG ===');
})();
