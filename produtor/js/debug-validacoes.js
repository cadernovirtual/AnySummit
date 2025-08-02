// Debug de validações

// Verificar se as funções existem
document.addEventListener('DOMContentLoaded', function() {
    
    // Verificar se os elementos existem
    
    // Testar validação diretamente
    window.testValidation = function(step) {
        const result = window.validateStep ? window.validateStep(step) : 'validateStep não encontrada';
    };
    
});

// Adicionar listener nos botões para debug
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('btn-continue')) {
        console.log('🖱️ Botão Avançar clicado!');
        console.log('- nextStep existe?', typeof window.nextStep);
        console.log('- currentStep:', window.getCurrentStep ? window.getCurrentStep() : 'não disponível');
    }
});