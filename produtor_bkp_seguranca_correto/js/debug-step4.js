/**
 * Debug temporário para problema de validação do step 4
 */

window.debugStep4 = function() {
    console.log('=== DEBUG STEP 4 ===');
    
    // Verificar switch
    const locationSwitch = document.getElementById('locationTypeSwitch');
    console.log('Switch encontrado:', !!locationSwitch);
    console.log('Switch ativo (presencial):', locationSwitch?.classList.contains('active'));
    
    // Verificar todos os campos
    const fields = ['venueName', 'street', 'city', 'addressSearch', 'eventLink'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        console.log(`Campo ${fieldId}:`, {
            existe: !!field,
            valor: field?.value,
            valorTrimmed: field?.value?.trim(),
            tipo: field?.type,
            visivel: field ? window.getComputedStyle(field).display !== 'none' : false
        });
    });
    
    // Verificar se campos estão dentro do formulário correto
    const step4 = document.querySelector('[data-step-content="4"]');
    console.log('Step 4 encontrado:', !!step4);
    console.log('Step 4 ativo:', step4?.classList.contains('active'));
    
    // Verificar se há algum formulário interferindo
    const forms = document.querySelectorAll('form');
    console.log('Número de formulários na página:', forms.length);
    
    // Tentar validação manual
    const isPresential = locationSwitch?.classList.contains('active');
    if (isPresential) {
        const venueName = document.getElementById('venueName')?.value || '';
        const street = document.getElementById('street')?.value || '';
        const city = document.getElementById('city')?.value || '';
        
        const isValid = venueName.trim() !== '' && (street.trim() !== '' || city.trim() !== '');
        
        console.log('Validação manual:', {
            venueName: venueName,
            street: street,
            city: city,
            resultado: isValid
        });
        
        if (!isValid) {
            console.log('Condições para passar:');
            console.log('1. Nome do local deve estar preenchido:', venueName.trim() !== '');
            console.log('2. Rua OU Cidade devem estar preenchidos:', street.trim() !== '' || city.trim() !== '');
        }
    }
    
    console.log('=== FIM DEBUG ===');
};

// Adicionar botão de debug temporário
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const navButtons = document.querySelector('.step-navigation');
        if (navButtons) {
            const debugBtn = document.createElement('button');
            debugBtn.textContent = 'Debug Step 4';
            debugBtn.className = 'nav-btn';
            debugBtn.style.background = '#ff6b6b';
            debugBtn.onclick = (e) => {
                e.preventDefault();
                window.debugStep4();
            };
            navButtons.appendChild(debugBtn);
        }
    }, 1000);
});

// Auto executar debug quando tentar avançar do step 4
const originalValidateStep = window.validateStep;
if (originalValidateStep) {
    window.validateStep = function(stepNumber) {
        if (stepNumber === 4) {
            console.log('Tentando validar step 4...');
            window.debugStep4();
        }
        return originalValidateStep.apply(this, arguments);
    };
}

console.log('Debug do Step 4 carregado. Use debugStep4() no console ou clique no botão vermelho.');