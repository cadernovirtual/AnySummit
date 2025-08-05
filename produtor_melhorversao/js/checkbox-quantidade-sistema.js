/**
 * MODIFICAÇÕES PARA CHECKBOX DE QUANTIDADE
 * Controla a exibição dos campos de quantidade e força valor 0 quando não limitado
 */

// Interceptar funções de salvamento para aplicar as novas regras
(function() {
    'use strict';
    
    console.log('🎯 Aplicando sistema de checkbox de quantidade...');
    
    // Função auxiliar para capturar quantidade baseada no checkbox
    function obterQuantidade(checkboxId, quantityFieldId) {
        const checkbox = document.getElementById(checkboxId);
        const quantityField = document.getElementById(quantityFieldId);
        
        if (!checkbox || !checkbox.checked) {
            // Se checkbox não marcado, limpar o campo e retornar 0
            if (quantityField) {
                quantityField.value = 0;
            }
            return 0;
        }
        
        return parseInt(quantityField?.value || 0);
    }
    
    // Interceptar criação de ingresso pago
    const originalCreatePaidTicket = window.createPaidTicket;
    window.createPaidTicket = function() {
        console.log('🎯 Interceptando createPaidTicket para aplicar checkbox...');
        
        // Verificar estado do checkbox e forçar valor correto
        const checkbox = document.getElementById('limitPaidQuantityCheck');
        const quantityField = document.getElementById('paidTicketQuantity');
        
        if (!checkbox || !checkbox.checked) {
            // Checkbox desmarcado = quantidade deve ser 0
            if (quantityField) {
                quantityField.value = '0';
                console.log('🔄 Campo paidTicketQuantity forçado para "0" (checkbox desmarcado)');
            }
        } else {
            // Checkbox marcado = verificar se tem valor válido
            const valor = quantityField?.value;
            if (!valor || valor === '' || parseInt(valor) <= 0) {
                alert('Por favor, digite uma quantidade válida maior que zero.');
                return;
            }
        }
        
        console.log(`📊 Quantidade final: ${quantityField?.value}`);
        
        // Chamar função original
        if (typeof originalCreatePaidTicket === 'function') {
            return originalCreatePaidTicket.apply(this, arguments);
        }
    };
    
    // Interceptar criação de ingresso gratuito
    const originalCreateFreeTicket = window.createFreeTicket;
    window.createFreeTicket = function() {
        console.log('🎯 Interceptando createFreeTicket para aplicar checkbox...');
        
        // Verificar estado do checkbox e forçar valor correto
        const checkbox = document.getElementById('limitFreeQuantityCheck');
        const quantityField = document.getElementById('freeTicketQuantity');
        
        if (!checkbox || !checkbox.checked) {
            // Checkbox desmarcado = quantidade deve ser 0
            if (quantityField) {
                quantityField.value = '0';
                console.log('🔄 Campo freeTicketQuantity forçado para "0" (checkbox desmarcado)');
            }
        } else {
            // Checkbox marcado = verificar se tem valor válido
            const valor = quantityField?.value;
            if (!valor || valor === '' || parseInt(valor) <= 0) {
                alert('Por favor, digite uma quantidade válida maior que zero.');
                return;
            }
        }
        
        console.log(`📊 Quantidade final: ${quantityField?.value}`);
        
        // Chamar função original
        if (typeof originalCreateFreeTicket === 'function') {
            return originalCreateFreeTicket.apply(this, arguments);
        }
    };
    
    // Interceptar edição de ingresso pago
    const originalUpdatePaidTicket = window.updatePaidTicket;
    window.updatePaidTicket = function() {
        console.log('🎯 Interceptando updatePaidTicket para aplicar checkbox...');
        
        // Garantir que o campo seja zerado se checkbox desmarcado
        const checkbox = document.getElementById('limitEditPaidQuantityCheck');
        const quantityField = document.getElementById('editPaidTicketQuantity');
        
        if (!checkbox || !checkbox.checked) {
            if (quantityField) {
                quantityField.value = 0;
                console.log('🔄 Campo editPaidTicketQuantity zerado (checkbox desmarcado)');
            }
        }
        
        // Capturar quantidade baseada no checkbox
        const quantidade = obterQuantidade('limitEditPaidQuantityCheck', 'editPaidTicketQuantity');
        
        console.log(`📊 Quantidade definida para edição ingresso pago: ${quantidade}`);
        
        // Chamar função original se existir
        if (typeof originalUpdatePaidTicket === 'function') {
            return originalUpdatePaidTicket.apply(this, arguments);
        }
    };
    
    // Interceptar edição de ingresso gratuito
    const originalUpdateFreeTicket = window.updateFreeTicket;
    window.updateFreeTicket = function() {
        console.log('🎯 Interceptando updateFreeTicket para aplicar checkbox...');
        
        // Garantir que o campo seja zerado se checkbox desmarcado
        const checkbox = document.getElementById('limitEditFreeQuantityCheck');
        const quantityField = document.getElementById('editFreeTicketQuantity');
        
        if (!checkbox || !checkbox.checked) {
            if (quantityField) {
                quantityField.value = 0;
                console.log('🔄 Campo editFreeTicketQuantity zerado (checkbox desmarcado)');
            }
        }
        
        // Capturar quantidade baseada no checkbox
        const quantidade = obterQuantidade('limitEditFreeQuantityCheck', 'editFreeTicketQuantity');
        
        console.log(`📊 Quantidade definida para edição ingresso gratuito: ${quantidade}`);
        
        // Chamar função original se existir
        if (typeof originalUpdateFreeTicket === 'function') {
            return originalUpdateFreeTicket.apply(this, arguments);
        }
    };
    
    // Interceptar salvamento de combo para sempre usar quantidade 0
    const originalSaveComboTicket = window.saveComboTicket;
    window.saveComboTicket = function() {
        console.log('🎯 Interceptando saveComboTicket para forçar quantidade 0...');
        
        // Sempre definir quantidade como 0 para combos
        const comboQuantityField = document.getElementById('comboTicketQuantity');
        if (comboQuantityField) {
            comboQuantityField.value = 0;
        }
        
        console.log('📊 Quantidade de combo definida como 0');
        
        // Chamar função original se existir
        if (typeof originalSaveComboTicket === 'function') {
            return originalSaveComboTicket.apply(this, arguments);
        }
    };
    
    // Interceptar edição de combo para sempre usar quantidade 0
    const originalUpdateComboTicket = window.updateComboTicket;
    window.updateComboTicket = function() {
        console.log('🎯 Interceptando updateComboTicket para forçar quantidade 0...');
        
        // Sempre definir quantidade como 0 para combos
        const editComboQuantityField = document.getElementById('editComboQuantity');
        if (editComboQuantityField) {
            editComboQuantityField.value = 0;
        }
        
        console.log('📊 Quantidade de combo (edição) definida como 0');
        
        // Chamar função original se existir
        if (typeof originalUpdateComboTicket === 'function') {
            return originalUpdateComboTicket.apply(this, arguments);
        }
    };
    
    console.log('✅ Sistema de checkbox de quantidade ativo!');
})();

/**
 * FUNÇÕES PARA CONFIGURAR CHECKBOXES AO ABRIR MODAIS DE EDIÇÃO
 */

// Configurar checkbox na abertura do modal de edição pago
function configurarCheckboxEdicaoPago(quantidade) {
    const checkbox = document.getElementById('limitEditPaidQuantityCheck');
    const container = document.getElementById('editPaidQuantityContainer');
    const quantityField = document.getElementById('editPaidTicketQuantity');
    
    console.log(`🎯 Configurando checkbox edição pago - quantidade recebida: ${quantidade}`);
    
    if (!checkbox || !container || !quantityField) {
        console.log('❌ Elementos não encontrados para configuração do checkbox');
        return;
    }
    
    if (quantidade > 0) {
        // Se tem quantidade, marcar checkbox e mostrar campo
        checkbox.checked = true;
        container.style.display = 'block';
        quantityField.value = quantidade;
        quantityField.required = true;
        console.log(`✅ Checkbox marcado - quantidade: ${quantidade}`);
    } else {
        // Se quantidade é 0, desmarcar checkbox e ocultar campo
        checkbox.checked = false;
        container.style.display = 'none';
        quantityField.value = 0;
        quantityField.required = false;
        console.log('✅ Checkbox desmarcado - quantidade: 0');
    }
}

// Configurar checkbox na abertura do modal de edição gratuito
function configurarCheckboxEdicaoGratuito(quantidade) {
    const checkbox = document.getElementById('limitEditFreeQuantityCheck');
    const container = document.getElementById('editFreeQuantityContainer');
    const quantityField = document.getElementById('editFreeTicketQuantity');
    
    console.log(`🎯 Configurando checkbox edição gratuito - quantidade recebida: ${quantidade}`);
    
    if (!checkbox || !container || !quantityField) {
        console.log('❌ Elementos não encontrados para configuração do checkbox');
        return;
    }
    
    if (quantidade > 0) {
        // Se tem quantidade, marcar checkbox e mostrar campo
        checkbox.checked = true;
        container.style.display = 'block';
        quantityField.value = quantidade;
        quantityField.required = true;
        console.log(`✅ Checkbox marcado - quantidade: ${quantidade}`);
    } else {
        // Se quantidade é 0, desmarcar checkbox e ocultar campo
        checkbox.checked = false;
        container.style.display = 'none';
        quantityField.value = 0;
        quantityField.required = false;
        console.log('✅ Checkbox desmarcado - quantidade: 0');
    }
}

// Interceptar abertura de modais de edição para configurar checkboxes
(function() {
    // Interceptar função de editar ingresso pago
    const originalEditPaidTicket = window.editPaidTicket;
    window.editPaidTicket = function(ingressoId) {
        console.log(`🎯 Interceptando editPaidTicket para configurar checkbox (ID: ${ingressoId})`);
        
        // Chamar função original primeiro
        if (typeof originalEditPaidTicket === 'function') {
            originalEditPaidTicket.apply(this, arguments);
        }
        
        // Aguardar o modal carregar e depois configurar checkbox
        setTimeout(() => {
            // Buscar quantidade do campo que foi preenchido pela função original
            const quantityField = document.getElementById('editPaidTicketQuantity');
            let quantidade = 0;
            
            if (quantityField && quantityField.value) {
                quantidade = parseInt(quantityField.value) || 0;
            }
            
            // Se não conseguiu pelo campo, tentar buscar do ingresso atual
            if (quantidade === 0 && window.ingressoAtual) {
                quantidade = parseInt(window.ingressoAtual.quantidade_total || window.ingressoAtual.quantity) || 0;
            }
            
            console.log(`📊 Quantidade detectada para configurar checkbox pago: ${quantidade}`);
            configurarCheckboxEdicaoPago(quantidade);
        }, 150); // Delay maior para garantir carregamento
    };
    
    // Interceptar função de editar ingresso gratuito
    const originalEditFreeTicket = window.editFreeTicket;
    window.editFreeTicket = function(ingressoId) {
        console.log(`🎯 Interceptando editFreeTicket para configurar checkbox (ID: ${ingressoId})`);
        
        // Chamar função original primeiro
        if (typeof originalEditFreeTicket === 'function') {
            originalEditFreeTicket.apply(this, arguments);
        }
        
        // Aguardar o modal carregar e depois configurar checkbox
        setTimeout(() => {
            // Buscar quantidade do campo que foi preenchido pela função original
            const quantityField = document.getElementById('editFreeTicketQuantity');
            let quantidade = 0;
            
            if (quantityField && quantityField.value) {
                quantidade = parseInt(quantityField.value) || 0;
            }
            
            // Se não conseguiu pelo campo, tentar buscar do ingresso atual
            if (quantidade === 0 && window.ingressoAtual) {
                quantidade = parseInt(window.ingressoAtual.quantidade_total || window.ingressoAtual.quantity) || 0;
            }
            
            console.log(`📊 Quantidade detectada para configurar checkbox gratuito: ${quantidade}`);
            configurarCheckboxEdicaoGratuito(quantidade);
        }, 150); // Delay maior para garantir carregamento
    };
})();

console.log('✅ Sistema de checkbox de quantidade carregado!');

/**
 * FUNÇÕES ADICIONAIS PARA GARANTIR CAMPOS ZERADOS
 */

// Função para limpar campos de quantidade ao abrir modais
function limparCamposQuantidadeModal(modalType) {
    console.log(`🧹 Limpando campos de quantidade para modal: ${modalType}`);
    
    switch(modalType) {
        case 'paidTicket':
            const paidCheckbox = document.getElementById('limitPaidQuantityCheck');
            const paidQuantity = document.getElementById('paidTicketQuantity');
            if (paidCheckbox) paidCheckbox.checked = false;
            if (paidQuantity) paidQuantity.value = 0;
            togglePaidQuantityFields();
            break;
            
        case 'freeTicket':
            const freeCheckbox = document.getElementById('limitFreeQuantityCheck');
            const freeQuantity = document.getElementById('freeTicketQuantity');
            if (freeCheckbox) freeCheckbox.checked = false;
            if (freeQuantity) freeQuantity.value = 0;
            toggleFreeQuantityFields();
            break;
    }
}

// Interceptar abertura de modais para limpar campos
(function() {
    // Modal de criação ingresso pago
    const originalOpenPaidModal = window.openPaidTicketModal;
    window.openPaidTicketModal = function() {
        console.log('🎯 Interceptando abertura modal ingresso pago...');
        
        // Chamar função original primeiro
        if (typeof originalOpenPaidModal === 'function') {
            originalOpenPaidModal.apply(this, arguments);
        }
        
        // Limpar campos após um pequeno delay
        setTimeout(() => {
            limparCamposQuantidadeModal('paidTicket');
        }, 100);
    };
    
    // Modal de criação ingresso gratuito  
    const originalOpenFreeModal = window.openFreeTicketModal;
    window.openFreeTicketModal = function() {
        console.log('🎯 Interceptando abertura modal ingresso gratuito...');
        
        // Chamar função original primeiro
        if (typeof originalOpenFreeModal === 'function') {
            originalOpenFreeModal.apply(this, arguments);
        }
        
        // Limpar campos após um pequeno delay
        setTimeout(() => {
            limparCamposQuantidadeModal('freeTicket');
        }, 100);
    };
})();

/**
 * FUNÇÃO GLOBAL PARA DEBUG E VALIDAÇÃO
 */
window.debugCheckboxQuantidade = function() {
    console.log('🔍 DEBUG - Estado dos checkboxes e campos:');
    
    const campos = [
        { checkbox: 'limitPaidQuantityCheck', campo: 'paidTicketQuantity', nome: 'Pago Criação' },
        { checkbox: 'limitFreeQuantityCheck', campo: 'freeTicketQuantity', nome: 'Gratuito Criação' },
        { checkbox: 'limitEditPaidQuantityCheck', campo: 'editPaidTicketQuantity', nome: 'Pago Edição' },
        { checkbox: 'limitEditFreeQuantityCheck', campo: 'editFreeTicketQuantity', nome: 'Gratuito Edição' }
    ];
    
    campos.forEach(({checkbox, campo, nome}) => {
        const checkboxEl = document.getElementById(checkbox);
        const campoEl = document.getElementById(campo);
        
        if (checkboxEl && campoEl) {
            console.log(`${nome}: Checkbox=${checkboxEl.checked}, Campo=${campoEl.value}`);
        }
    });
};

/**
 * INTERCEPTAÇÃO ADICIONAL PARA GARANTIR ZERO
 */
(function() {
    // Interceptar TODAS as funções que fazem POST
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // Se é uma requisição POST para salvar ingressos
        if (options && options.method === 'POST' && 
            (url.includes('wizard_evento.php') || url.includes('ingressos_api.php'))) {
            
            console.log('🎯 Interceptando requisição de salvamento de ingresso...');
            
            // Se tem body e é FormData, verificar quantidade
            if (options.body instanceof FormData) {
                const quantidade = options.body.get('quantidade_total') || options.body.get('quantity');
                console.log(`📊 Quantidade detectada na requisição: ${quantidade}`);
                
                // Se quantidade está vazia ou inválida, forçar 0
                if (!quantidade || quantidade === '' || quantidade === null) {
                    options.body.set('quantidade_total', '0');
                    console.log('🔄 Quantidade forçada para 0 na requisição');
                }
            }
        }
        
        return originalFetch.apply(this, arguments);
    };
})();
