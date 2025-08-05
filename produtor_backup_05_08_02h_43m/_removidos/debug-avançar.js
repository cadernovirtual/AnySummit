// Script de debug para identificar problema no botão avançar
console.log('=== DEBUG DO BOTÃO AVANÇAR ===');

// 1. Verificar se as funções existem
console.log('1. Funções disponíveis:');
console.log('   nextStep:', typeof window.nextStep);
console.log('   validateStep:', typeof window.validateStep);
console.log('   getCurrentStep:', typeof window.getCurrentStep);

// 2. Verificar step atual
const stepAtual = window.getCurrentStep ? window.getCurrentStep() : 'N/A';
console.log('\n2. Step atual:', stepAtual);

// 3. Verificar validação manual do step 1
console.log('\n3. Testando validação do Step 1:');

// Nome do evento
const eventName = document.getElementById('eventName');
console.log('   - Nome do evento:', eventName ? eventName.value : 'Campo não encontrado');

// Logo
const logoContainer = document.getElementById('logoPreviewContainer');
const logoImg = logoContainer ? logoContainer.querySelector('img') : null;
console.log('   - Logo presente:', logoImg ? 'SIM' : 'NÃO');
if (logoImg) {
    console.log('     URL da logo:', logoImg.src);
}

// window.uploadedImages
console.log('   - window.uploadedImages:', window.uploadedImages);

// 4. Tentar validar manualmente
if (window.validateStep) {
    console.log('\n4. Executando validateStep(1):');
    const resultado = window.validateStep(1);
    console.log('   Resultado:', resultado);
}

// 5. Tentar executar nextStep
console.log('\n5. Tentando executar nextStep():');
try {
    if (window.nextStep) {
        // Não vamos executar de verdade, apenas verificar se daria erro
        console.log('   nextStep está disponível e pode ser executada');
    } else {
        console.log('   ERRO: nextStep não está definida!');
    }
} catch (e) {
    console.log('   ERRO ao tentar acessar nextStep:', e.message);
}

console.log('\n=== FIM DO DEBUG ===');
