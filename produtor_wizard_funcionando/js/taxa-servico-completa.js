// Correções DIRETAS para taxa de serviço em TODOS os lugares
console.log('🔧 Aplicando taxa de serviço em TODOS os cálculos...');

// 1. BUSCAR TAXA DO BANCO AO CARREGAR
(async function() {
    try {
        const response = await fetch('/produtor/ajax/buscar_taxa_servico.php');
        const data = await response.json();
        
        if (data.success) {
            window.TAXA_SERVICO_PADRAO = parseFloat(data.taxa_servico) || 8.00;
            console.log('✅ Taxa de serviço carregada:', window.TAXA_SERVICO_PADRAO + '%');
        } else {
            window.TAXA_SERVICO_PADRAO = 8.00;
        }
    } catch (error) {
        console.error('Erro ao buscar taxa:', error);
        window.TAXA_SERVICO_PADRAO = 8.00;
    }
    
    // Aplicar taxa em todos os lugares
    aplicarTaxaEmTodosOsLugares();
})();

// 2. APLICAR TAXA EM TODOS OS CÁLCULOS
function aplicarTaxaEmTodosOsLugares() {
    const taxaDecimal = window.TAXA_SERVICO_PADRAO / 100;
    
    // INGRESSO PAGO - CRIAR
    const originalCalcPago = window.calcularValoresIngresso;
    window.calcularValoresIngresso = function() {
        console.log('💰 Calculando com taxa:', window.TAXA_SERVICO_PADRAO + '%');
        
        const priceInput = document.getElementById('paidTicketPrice');
        const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
        
        if (!priceInput) return;
        
        const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
        const valorIngresso = parseFloat(valorLimpo) || 0;
        
        let taxaPlataforma = 0;
        let valorComprador = valorIngresso;
        let valorReceber = valorIngresso;
        
        if (taxaCheckbox && taxaCheckbox.checked) {
            taxaPlataforma = valorIngresso * taxaDecimal;
            valorComprador = valorIngresso + taxaPlataforma;
            valorReceber = valorIngresso;
        }
        
        // Atualizar displays
        const elements = {
            'paidTicketTaxaPlataforma': `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`,
            'paidTicketValorComprador': `R$ ${valorComprador.toFixed(2).replace('.', ',')}`,
            'paidTicketValorReceber': `R$ ${valorReceber.toFixed(2).replace('.', ',')}`
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    };
    
    // COMBO - CRIAR
    const originalCalcCombo = window.calcularValoresCombo;
    window.calcularValoresCombo = function() {
        console.log('📦 Calculando combo com taxa:', window.TAXA_SERVICO_PADRAO + '%');
        
        const priceInput = document.getElementById('comboTicketPrice');
        const taxaCheckbox = document.getElementById('comboTicketTaxaServico');
        
        if (!priceInput) return;
        
        const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
        const valorCombo = parseFloat(valorLimpo) || 0;
        
        let taxaPlataforma = 0;
        let valorComprador = valorCombo;
        let valorReceber = valorCombo;
        
        if (taxaCheckbox && taxaCheckbox.checked) {
            taxaPlataforma = valorCombo * taxaDecimal;
            valorComprador = valorCombo + taxaPlataforma;
            valorReceber = valorCombo;
        }
        
        const elements = {
            'comboTicketTaxaPlataforma': `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`,
            'comboTicketValorComprador': `R$ ${valorComprador.toFixed(2).replace('.', ',')}`,
            'comboTicketValorReceber': `R$ ${valorReceber.toFixed(2).replace('.', ',')}`
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    };
    
    // EDIÇÃO - INGRESSO PAGO
    window.calcularValoresEditPago = function() {
        console.log('✏️ Calculando edição pago com taxa:', window.TAXA_SERVICO_PADRAO + '%');
        
        const priceInput = document.getElementById('editPaidTicketPrice');
        const taxaCheckbox = document.getElementById('editPaidTicketTaxaServico');
        
        if (!priceInput) return;
        
        const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
        const valorIngresso = parseFloat(valorLimpo) || 0;
        
        let taxaPlataforma = 0;
        let valorComprador = valorIngresso;
        let valorReceber = valorIngresso;
        
        if (taxaCheckbox && taxaCheckbox.checked) {
            taxaPlataforma = valorIngresso * taxaDecimal;
            valorComprador = valorIngresso + taxaPlataforma;
            valorReceber = valorIngresso;
        }
        
        const elements = {
            'editPaidTicketTaxaPlataforma': `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`,
            'editPaidTicketValorComprador': `R$ ${valorComprador.toFixed(2).replace('.', ',')}`,
            'editPaidTicketValorReceber': `R$ ${valorReceber.toFixed(2).replace('.', ',')}`
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    };
    
    // EDIÇÃO - COMBO
    window.calcularValoresEditCombo = function() {
        console.log('✏️ Calculando edição combo com taxa:', window.TAXA_SERVICO_PADRAO + '%');
        
        const priceInput = document.getElementById('editComboPrice');
        const taxaCheckbox = document.getElementById('editComboTaxaServico');
        
        if (!priceInput) return;
        
        const valorLimpo = priceInput.value.replace(/[^\d,]/g, '').replace(',', '.');
        const valorCombo = parseFloat(valorLimpo) || 0;
        
        let taxaPlataforma = 0;
        let valorComprador = valorCombo;
        let valorReceber = valorCombo;
        
        if (taxaCheckbox && taxaCheckbox.checked) {
            taxaPlataforma = valorCombo * taxaDecimal;
            valorComprador = valorCombo + taxaPlataforma;
            valorReceber = valorCombo;
        }
        
        const elements = {
            'editComboTaxaPlataforma': `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`,
            'editComboValorComprador': `R$ ${valorComprador.toFixed(2).replace('.', ',')}`,
            'editComboValorReceber': `R$ ${valorReceber.toFixed(2).replace('.', ',')}`
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    };
}

// 3. ADICIONAR EVENTOS DE INPUT PARA CALCULAR AO DIGITAR
document.addEventListener('DOMContentLoaded', function() {
    // CRIAR INGRESSO PAGO
    const paidPriceInput = document.getElementById('paidTicketPrice');
    if (paidPriceInput) {
        paidPriceInput.addEventListener('input', function() {
            if (window.calcularValoresIngresso) {
                window.calcularValoresIngresso();
            }
        });
    }
    
    const paidTaxaCheckbox = document.getElementById('paidTicketTaxaServico');
    if (paidTaxaCheckbox) {
        paidTaxaCheckbox.addEventListener('change', function() {
            if (window.calcularValoresIngresso) {
                window.calcularValoresIngresso();
            }
        });
    }
    
    // CRIAR COMBO
    const comboPriceInput = document.getElementById('comboTicketPrice');
    if (comboPriceInput) {
        comboPriceInput.addEventListener('input', function() {
            if (window.calcularValoresCombo) {
                window.calcularValoresCombo();
            }
        });
    }
    
    const comboTaxaCheckbox = document.getElementById('comboTicketTaxaServico');
    if (comboTaxaCheckbox) {
        comboTaxaCheckbox.addEventListener('change', function() {
            if (window.calcularValoresCombo) {
                window.calcularValoresCombo();
            }
        });
    }
    
    // EDITAR INGRESSO PAGO
    const editPaidPriceInput = document.getElementById('editPaidTicketPrice');
    if (editPaidPriceInput) {
        editPaidPriceInput.addEventListener('input', function() {
            if (window.calcularValoresEditPago) {
                window.calcularValoresEditPago();
            }
        });
    }
    
    const editPaidTaxaCheckbox = document.getElementById('editPaidTicketTaxaServico');
    if (editPaidTaxaCheckbox) {
        editPaidTaxaCheckbox.addEventListener('change', function() {
            if (window.calcularValoresEditPago) {
                window.calcularValoresEditPago();
            }
        });
    }
    
    // EDITAR COMBO
    const editComboPriceInput = document.getElementById('editComboPrice');
    if (editComboPriceInput) {
        editComboPriceInput.addEventListener('input', function() {
            if (window.calcularValoresEditCombo) {
                window.calcularValoresEditCombo();
            }
        });
    }
    
    const editComboTaxaCheckbox = document.getElementById('editComboTaxaServico');
    if (editComboTaxaCheckbox) {
        editComboTaxaCheckbox.addEventListener('change', function() {
            if (window.calcularValoresEditCombo) {
                window.calcularValoresEditCombo();
            }
        });
    }
});

// 4. CORRIGIR CRIAÇÃO DE INGRESSOS PARA USAR A TAXA CORRETA
(function() {
    // Override createPaidTicket
    const originalCreatePaid = window.createPaidTicket;
    if (originalCreatePaid) {
        window.createPaidTicket = function() {
            // Recalcular com a taxa correta antes de criar
            if (window.calcularValoresIngresso) {
                window.calcularValoresIngresso();
            }
            
            // Chamar original
            if (typeof originalCreatePaid === 'function') {
                originalCreatePaid();
            }
        };
    }
    
    // Override createComboTicket
    const originalCreateCombo = window.createComboTicket;
    if (originalCreateCombo) {
        window.createComboTicket = function() {
            // Recalcular com a taxa correta antes de criar
            if (window.calcularValoresCombo) {
                window.calcularValoresCombo();
            }
            
            // Chamar original
            if (typeof originalCreateCombo === 'function') {
                originalCreateCombo();
            }
        };
    }
})();

console.log('✅ Taxa de serviço aplicada em TODOS os cálculos!');
