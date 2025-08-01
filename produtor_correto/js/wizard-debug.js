// Debug helper para o wizard
console.log('🐛 Debug Helper carregado');

// Verificar estado das funções após carregamento completo
window.addEventListener('load', function() {
    console.log('=== WIZARD DEBUG ===');
    console.log('nextStep tipo:', typeof window.nextStep);
    console.log('prevStep tipo:', typeof window.prevStep);
    console.log('validateStep tipo:', typeof window.validateStep);
    console.log('updateStepDisplay tipo:', typeof window.updateStepDisplay);
    console.log('wizardState:', window.wizardState);
    
    // Verificar botões
    const btnsAvançar = document.querySelectorAll('.btn-continue');
    console.log('Botões Avançar encontrados:', btnsAvançar.length);
    
    btnsAvançar.forEach((btn, index) => {
        console.log(`Botão ${index + 1}:`, {
            onclick: btn.onclick,
            getAttribute: btn.getAttribute('onclick'),
            outerHTML: btn.outerHTML.substring(0, 100)
        });
    });
    
    // Adicionar listener de debug em todos os botões avançar
    btnsAvançar.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            console.log(`🔵 Clique no botão Avançar ${index + 1}`);
            console.log('Event:', e);
            console.log('CurrentStep antes:', window.wizardState?.currentStep);
        });
    });
});

// Função de teste manual
window.testarNextStep = function() {
    console.log('🧪 Testando nextStep manualmente...');
    console.log('CurrentStep antes:', window.wizardState?.currentStep);
    
    if (typeof window.nextStep === 'function') {
        window.nextStep();
        console.log('CurrentStep depois:', window.wizardState?.currentStep);
    } else {
        console.error('❌ nextStep não é uma função!');
    }
};

console.log('Para testar manualmente, execute: testarNextStep()');
