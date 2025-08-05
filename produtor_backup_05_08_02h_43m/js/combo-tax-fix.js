// Correções para cálculo de taxas em combo editado
// Este arquivo deve ser incluído após edit-combo-functions.js

(function() {
    console.log('🔧 Aplicando correções para cálculo de taxas em combo editado...');
    
    // Função para calcular valores do combo editado
    window.calculateEditComboValues = function() {
        console.log('💰 Calculando valores do combo editado...');
        
        const priceInput = document.getElementById('editComboPrice');
        const receiveInput = document.getElementById('editComboReceive');
        const taxaCheckbox = document.getElementById('editComboServiceTax');
        
        if (!priceInput || !receiveInput) {
            console.error('Campos de preço não encontrados!');
            return;
        }
        
        // Obter valor do combo
        let valorCombo = parseFloat(priceInput.value.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
        
        // Se não tiver valor definido, calcular baseado nos itens
        if (valorCombo === 0 && window.editComboItems && window.editComboItems.length > 0) {
            valorCombo = window.editComboItems.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
            priceInput.value = `R$ ${valorCombo.toFixed(2).replace('.', ',')}`;
        }
        
        // Verificar se taxa está ativada
        const taxaAtiva = taxaCheckbox ? taxaCheckbox.checked : true;
        
        let valorReceber = valorCombo;
        let valorTaxa = 0;
        
        if (taxaAtiva && valorCombo > 0) {
            // Calcular taxa de 10%
            valorTaxa = valorCombo * 0.10;
            valorReceber = valorCombo - valorTaxa;
        }
        
        // Atualizar campo de valor a receber
        receiveInput.value = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
        
        // Se houver campo de taxa, atualizar também
        const taxaDisplay = document.getElementById('editComboTaxDisplay');
        if (taxaDisplay) {
            taxaDisplay.textContent = `R$ ${valorTaxa.toFixed(2).replace('.', ',')}`;
        }
        
        console.log('✅ Valores calculados:', {
            valorCombo,
            valorTaxa,
            valorReceber,
            taxaAtiva
        });
    };
    
    // Adicionar listeners para recalcular ao mudar valores
    document.addEventListener('DOMContentLoaded', function() {
        // Listener para mudança de preço
        const priceInput = document.getElementById('editComboPrice');
        if (priceInput) {
            priceInput.addEventListener('blur', function() {
                window.calculateEditComboValues();
            });
        }
        
        // Listener para checkbox de taxa
        const taxaCheckbox = document.getElementById('editComboServiceTax');
        if (taxaCheckbox) {
            taxaCheckbox.addEventListener('change', function() {
                window.calculateEditComboValues();
            });
        }
    });
    
    // Override da função populateEditComboModal para incluir cálculos
    const originalPopulateEditComboModal = window.populateEditComboModal;
    if (originalPopulateEditComboModal) {
        window.populateEditComboModal = function(comboData) {
            // Chamar função original
            originalPopulateEditComboModal.apply(this, arguments);
            
            // Definir checkbox de taxa baseado nos dados
            const taxaCheckbox = document.getElementById('editComboServiceTax');
            if (taxaCheckbox && comboData.taxaServico !== undefined) {
                taxaCheckbox.checked = comboData.taxaServico;
            }
            
            // Calcular valores após popular
            setTimeout(function() {
                window.calculateEditComboValues();
            }, 100);
        };
    }
    
    // Override da função addItemToEditCombo para recalcular valores
    const originalAddItemToEditCombo = window.addItemToEditCombo;
    if (originalAddItemToEditCombo) {
        window.addItemToEditCombo = function() {
            // Chamar função original
            originalAddItemToEditCombo.apply(this, arguments);
            
            // Recalcular valores
            setTimeout(function() {
                window.calculateEditComboValues();
            }, 100);
        };
    }
    
    console.log('✅ Correções de cálculo de combo aplicadas com sucesso!');
})();
