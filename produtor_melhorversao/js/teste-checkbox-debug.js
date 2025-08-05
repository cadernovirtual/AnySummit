/**
 * TESTE ESPECÍFICO PARA VALIDAR COMPORTAMENTO DOS CHECKBOXES
 * Execute no console: testarComportamentoCheckbox()
 */

window.testarComportamentoCheckbox = function() {
    console.log('🧪 === TESTE DE COMPORTAMENTO DOS CHECKBOXES ===');
    
    // Testar campos de criação
    console.log('\n📋 CAMPOS DE CRIAÇÃO:');
    
    const paidCheckbox = document.getElementById('limitPaidQuantityCheck');
    const paidQuantity = document.getElementById('paidTicketQuantity');
    const freeCheckbox = document.getElementById('limitFreeQuantityCheck');
    const freeQuantity = document.getElementById('freeTicketQuantity');
    
    console.log('Pago - Checkbox:', paidCheckbox?.checked, 'Campo:', paidQuantity?.value);
    console.log('Gratuito - Checkbox:', freeCheckbox?.checked, 'Campo:', freeQuantity?.value);
    
    // Testar campos de edição
    console.log('\n✏️ CAMPOS DE EDIÇÃO:');
    
    const editPaidCheckbox = document.getElementById('limitEditPaidQuantityCheck');
    const editPaidQuantity = document.getElementById('editPaidTicketQuantity');
    const editFreeCheckbox = document.getElementById('limitEditFreeQuantityCheck');
    const editFreeQuantity = document.getElementById('editFreeTicketQuantity');
    
    console.log('Pago Edição - Checkbox:', editPaidCheckbox?.checked, 'Campo:', editPaidQuantity?.value);
    console.log('Gratuito Edição - Checkbox:', editFreeCheckbox?.checked, 'Campo:', editFreeQuantity?.value);
    
    // Testar funções de interceptação
    console.log('\n🔧 FUNÇÕES INTERCEPTADAS:');
    console.log('createPaidTicket interceptada:', typeof window.createPaidTicket === 'function');
    console.log('createFreeTicket interceptada:', typeof window.createFreeTicket === 'function');
    console.log('updatePaidTicket interceptada:', typeof window.updatePaidTicket === 'function');
    console.log('updateFreeTicket interceptada:', typeof window.updateFreeTicket === 'function');
    
    return {
        criacao: {
            pago: { checkbox: paidCheckbox?.checked, campo: paidQuantity?.value },
            gratuito: { checkbox: freeCheckbox?.checked, campo: freeQuantity?.value }
        },
        edicao: {
            pago: { checkbox: editPaidCheckbox?.checked, campo: editPaidQuantity?.value },
            gratuito: { checkbox: editFreeCheckbox?.checked, campo: editFreeQuantity?.value }
        }
    };
};

window.forcarZerarCampos = function() {
    console.log('🔄 Forçando zerar todos os campos...');
    
    const campos = [
        'paidTicketQuantity',
        'freeTicketQuantity', 
        'editPaidTicketQuantity',
        'editFreeTicketQuantity'
    ];
    
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = '0';
            console.log(`${id} = 0`);
        }
    });
    
    const checkboxes = [
        'limitPaidQuantityCheck',
        'limitFreeQuantityCheck',
        'limitEditPaidQuantityCheck', 
        'limitEditFreeQuantityCheck'
    ];
    
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = false;
            console.log(`${id} = false`);
        }
    });
};

console.log('✅ Funções de teste carregadas: testarComportamentoCheckbox() e forcarZerarCampos()');
