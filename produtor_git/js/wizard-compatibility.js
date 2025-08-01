/**
 * =====================================================
 * WIZARD COMPATIBILITY - RETROCOMPATIBILIDADE
 * =====================================================
 * Mantém compatibilidade com código legado
 * Criado em: 29/01/2025
 * 
 * Este arquivo mapeia todas as funções do namespace
 * AnySummit para o window, garantindo que código
 * existente continue funcionando
 * =====================================================
 */

// =====================================================
// 1. FUNÇÕES DE NAVEGAÇÃO
// =====================================================

// Já mapeadas no wizard-final-completo.js, mas garantimos aqui também
if (!window.validateStep) {
    window.validateStep = function(step) {
        return window.AnySummit?.Validation?.validateStep(step) || true;
    };
}

if (!window.nextStep) {
    window.nextStep = function() {
        return window.AnySummit?.Navigation?.nextStep();
    };
}

if (!window.prevStep) {
    window.prevStep = function() {
        return window.AnySummit?.Navigation?.prevStep();
    };
}

if (!window.goToStep) {
    window.goToStep = function(step) {
        return window.AnySummit?.Navigation?.goToStep(step);
    };
}

if (!window.updateStepDisplay) {
    window.updateStepDisplay = function() {
        return window.AnySummit?.Navigation?.updateStepDisplay();
    };
}

// =====================================================
// 2. FUNÇÕES DE STORAGE
// =====================================================

if (!window.saveWizardData) {
    window.saveWizardData = function() {
        return window.AnySummit?.Storage?.saveWizardData();
    };
}

if (!window.clearAllWizardData) {
    window.clearAllWizardData = function() {
        return window.AnySummit?.Storage?.clearAllWizardData();
    };
}

if (!window.checkAndShowRecoveryDialog) {
    window.checkAndShowRecoveryDialog = function() {
        // Esta função está definida globalmente no wizard-final-completo.js
        if (typeof checkAndShowRecoveryDialog === 'function') {
            return checkAndShowRecoveryDialog();
        }
    };
}

// =====================================================
// 3. FUNÇÕES DE LOTES
// =====================================================

if (!window.adicionarLotePorData) {
    window.adicionarLotePorData = function() {
        return window.AnySummit?.Lotes?.adicionarLotePorData();
    };
}

if (!window.adicionarLotePorPercentual) {
    window.adicionarLotePorPercentual = function() {
        return window.AnySummit?.Lotes?.adicionarLotePorPercentual();
    };
}

if (!window.renderizarLotesPorData) {
    window.renderizarLotesPorData = function() {
        return window.AnySummit?.Lotes?.renderizarLotesPorData();
    };
}

if (!window.renderizarLotesPorPercentual) {
    window.renderizarLotesPorPercentual = function() {
        return window.AnySummit?.Lotes?.renderizarLotesPorPercentual();
    };
}

if (!window.excluirLote) {
    window.excluirLote = function(loteId) {
        return window.AnySummit?.Lotes?.excluirLote(loteId);
    };
}

if (!window.editarLoteData) {
    window.editarLoteData = function(loteId) {
        return window.AnySummit?.Lotes?.editarLoteData(loteId);
    };
}

if (!window.editarLotePercentual) {
    window.editarLotePercentual = function(loteId) {
        return window.AnySummit?.Lotes?.editarLotePercentual(loteId);
    };
}

// =====================================================
// 4. FUNÇÕES DE INGRESSOS
// =====================================================

if (!window.createPaidTicket) {
    window.createPaidTicket = function() {
        return window.AnySummit?.Ingressos?.createPaidTicket();
    };
}

if (!window.createFreeTicket) {
    window.createFreeTicket = function() {
        return window.AnySummit?.Ingressos?.createFreeTicket();
    };
}

if (!window.editTicket) {
    window.editTicket = function(ticketId) {
        return window.AnySummit?.Ingressos?.editTicket(ticketId);
    };
}

if (!window.removeTicket) {
    window.removeTicket = function(ticketId) {
        return window.AnySummit?.Ingressos?.removeTicket(ticketId);
    };
}

if (!window.carregarLotesNoModal) {
    window.carregarLotesNoModal = function(selectId) {
        return window.AnySummit?.Ingressos?.carregarLotesNoModal(selectId);
    };
}

// =====================================================
// 5. FUNÇÕES DE COMBOS
// =====================================================

if (!window.createCombo) {
    window.createCombo = function() {
        return window.AnySummit?.Combos?.createCombo();
    };
}

if (!window.addToCombo) {
    window.addToCombo = function() {
        return window.AnySummit?.Combos?.addToCombo();
    };
}

if (!window.removeFromCombo) {
    window.removeFromCombo = function(index) {
        return window.AnySummit?.Combos?.removeFromCombo(index);
    };
}

if (!window.updateComboDisplay) {
    window.updateComboDisplay = function() {
        return window.AnySummit?.Combos?.updateComboDisplay();
    };
}

if (!window.carregarIngressosPorLote) {
    window.carregarIngressosPorLote = function(loteId) {
        return window.AnySummit?.Combos?.carregarIngressosPorLote(loteId);
    };
}

if (!window.editCombo) {
    window.editCombo = function(comboId) {
        return window.AnySummit?.Combos?.editCombo(comboId);
    };
}

if (!window.removeCombo) {
    window.removeCombo = function(comboId) {
        return window.AnySummit?.Combos?.removeCombo(comboId);
    };
}

// =====================================================
// 6. FUNÇÕES DE UPLOAD
// =====================================================

if (!window.handleImageUpload) {
    window.handleImageUpload = function(event, tipo) {
        return window.AnySummit?.Upload?.handleImageUpload(event, tipo);
    };
}

if (!window.clearImage) {
    window.clearImage = function(tipo) {
        return window.AnySummit?.Upload?.clearImage(tipo);
    };
}

// =====================================================
// 7. FUNÇÕES UTILITÁRIAS
// =====================================================

if (!window.formatarMoeda && window.AnySummit?.Utils) {
    window.formatarMoeda = function(valor) {
        return window.AnySummit.Utils.formatarMoeda(valor);
    };
}

if (!window.formatarDataHora && window.AnySummit?.Utils) {
    window.formatarDataHora = function(dataStr) {
        return window.AnySummit.Utils.formatarDataHora(dataStr);
    };
}

if (!window.formatarDataBrasil && window.AnySummit?.Utils) {
    window.formatarDataBrasil = function(dataStr) {
        return window.AnySummit.Utils.formatarDataBrasil(dataStr);
    };
}

if (!window.parsearValorMonetario && window.AnySummit?.Utils) {
    window.parsearValorMonetario = function(valor) {
        return window.AnySummit.Utils.parsearValorMonetario(valor);
    };
}

// =====================================================
// 8. VARIÁVEIS GLOBAIS
// =====================================================

// Sincronizar variáveis globais com o estado
if (window.AnySummit?.State) {
    // lotesData
    if (!window.lotesData) {
        Object.defineProperty(window, 'lotesData', {
            get: function() { return window.AnySummit.State.lotesData; },
            set: function(value) { window.AnySummit.State.lotesData = value; }
        });
    }
    
    // temporaryTickets
    if (!window.temporaryTickets) {
        Object.defineProperty(window, 'temporaryTickets', {
            get: function() { return window.AnySummit.State.temporaryTickets; },
            set: function(value) { window.AnySummit.State.temporaryTickets = value; }
        });
    }
    
    // comboItems
    if (!window.comboItems) {
        Object.defineProperty(window, 'comboItems', {
            get: function() { return window.AnySummit.State.comboItems; },
            set: function(value) { window.AnySummit.State.comboItems = value; }
        });
    }
    
    // taxaServico
    if (!window.taxaServico) {
        Object.defineProperty(window, 'taxaServico', {
            get: function() { return window.AnySummit.Config.taxaServico; },
            set: function(value) { window.AnySummit.Config.taxaServico = value; }
        });
    }
}

// =====================================================
// 9. FUNÇÕES DE PREVIEW E UI
// =====================================================

if (!window.updatePreview) {
    window.updatePreview = function() {
        // Implementação básica para compatibilidade
        if (window.AnySummit?.UI?.updatePreview) {
            return window.AnySummit.UI.updatePreview();
        }
        console.log('[Compatibility] updatePreview chamada mas UI module não disponível');
    };
}

// =====================================================
// 10. FUNÇÕES DE DIALOGS
// =====================================================

if (!window.customDialog && window.AnySummit?.Dialogs) {
    window.customDialog = {
        alert: function(message, title) {
            return window.AnySummit.Dialogs.alert(message, title);
        },
        confirm: function(message, title) {
            return window.AnySummit.Dialogs.confirm(message, title);
        }
    };
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

console.log('✅ Wizard Compatibility Layer carregado');
console.log('📊 Funções mapeadas para compatibilidade:');
console.log('- Navegação: validateStep, nextStep, prevStep, goToStep, updateStepDisplay');
console.log('- Storage: saveWizardData, clearAllWizardData');
console.log('- Lotes: adicionarLotePorData, adicionarLotePorPercentual, etc');
console.log('- Ingressos: createPaidTicket, createFreeTicket, etc');
console.log('- Combos: createCombo, addToCombo, etc');
console.log('- Upload: handleImageUpload, clearImage');
console.log('- Utils: formatarMoeda, formatarDataHora, etc');
console.log('- Variáveis: lotesData, temporaryTickets, comboItems, taxaServico');
