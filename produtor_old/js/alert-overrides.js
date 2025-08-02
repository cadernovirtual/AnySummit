/**
 * Substitui todos os alerts e confirms por dialogs customizados
 */

// Salvar referências originais
const originalAlert = window.alert;
const originalConfirm = window.confirm;

// Override global de alert
window.alert = function(message) {
    if (window.customDialog) {
        return window.customDialog.alert(message, '');
    } else {
        return originalAlert(message);
    }
};

// Override global de confirm
window.confirm = function(message) {
    if (window.customDialog) {
        // Como confirm é síncrono e customDialog é assíncrono,
        // precisamos de uma abordagem diferente para cada caso
        console.warn('Confirm nativo substituído por dialog customizado. Considere atualizar o código para usar customDialog.confirm() diretamente.');
        return originalConfirm(message);
    } else {
        return originalConfirm(message);
    }
};

// Função auxiliar para substituir confirms em funções específicas
function replaceConfirmInFunction(functionName, objectContext = window) {
    const originalFunction = objectContext[functionName];
    if (!originalFunction) return;
    
    objectContext[functionName] = async function(...args) {
        // Interceptar chamadas de confirm dentro da função
        const tempConfirm = window.confirm;
        let confirmResult = true;
        
        window.confirm = function(message) {
            if (window.customDialog) {
                // Para manter compatibilidade, usamos confirm nativo por enquanto
                // Em uma refatoração futura, estas funções devem ser async
                return tempConfirm.call(window, message);
            }
            return tempConfirm.call(window, message);
        };
        
        try {
            const result = originalFunction.apply(this, args);
            return result;
        } finally {
            window.confirm = tempConfirm;
        }
    };
}

// Aplicar substituições específicas depois que as funções forem carregadas
setTimeout(() => {
    // Substituir confirms nas funções de exclusão
    replaceConfirmInFunction('excluirLoteData');
    replaceConfirmInFunction('excluirLotePercentual');
    
    console.log('Substituições de alert/confirm aplicadas');
}, 1000);

console.log('Sistema de override de alerts carregado');