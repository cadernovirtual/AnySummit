// Debug helper para o wizard

// Verificar estado das funções após carregamento completo
window.addEventListener('load', function() {
    
    // Verificar botões
    const btnsAvançar = document.querySelectorAll('.btn-continue');
    
    btnsAvançar.forEach((btn, index) => {
        
    });
    
    // Adicionar listener de debug em todos os botões avançar
    btnsAvançar.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            
        });
    });
});

// Função de teste manual
window.testarNextStep = function() {
    
    if (typeof window.nextStep === 'function') {
        window.nextStep();
        
    } else {
        console.error('❌ nextStep não é uma função!');
    }
};
