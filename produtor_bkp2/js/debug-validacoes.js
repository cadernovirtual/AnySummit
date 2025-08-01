// Debug de validações
console.log('🔍 DEBUG: Iniciando debug de validações');

// Verificar se as funções existem
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Verificando funções globais:');
    console.log('- window.nextStep:', typeof window.nextStep);
    console.log('- window.prevStep:', typeof window.prevStep);
    console.log('- window.validateStep:', typeof window.validateStep);
    console.log('- window.updateStepDisplay:', typeof window.updateStepDisplay);
    
    // Verificar se os elementos existem
    console.log('\n📋 Verificando elementos:');
    console.log('- eventName:', !!document.getElementById('eventName'));
    console.log('- startDateTime:', !!document.getElementById('startDateTime'));
    console.log('- classification:', !!document.getElementById('classification'));
    console.log('- category:', !!document.getElementById('category'));
    
    // Testar validação diretamente
    window.testValidation = function(step) {
        console.log(`\n🧪 Testando validação do step ${step}:`);
        const result = window.validateStep ? window.validateStep(step) : 'validateStep não encontrada';
        console.log('Resultado:', result);
    };
    
    console.log('\n💡 Para testar, execute no console: testValidation(1)');
});

// Adicionar listener nos botões para debug
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('btn-continue')) {
        console.log('🖱️ Botão Avançar clicado!');
        console.log('- nextStep existe?', typeof window.nextStep);
        console.log('- currentStep:', window.getCurrentStep ? window.getCurrentStep() : 'não disponível');
    }
});