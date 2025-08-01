// ============================================
// DEBUG VALIDAÇÕES - TESTE DE FUNCIONALIDADES
// ============================================

console.log('🔍 Debug de validações carregado');

// Verificar se as funções essenciais existem
window.addEventListener('load', function() {
    console.log('=== VERIFICAÇÃO DE FUNÇÕES ===');
    
    const funcoesEssenciais = [
        'validateStep',
        'nextStep',
        'prevStep',
        'goToStep',
        'saveWizardData',
        'clearAllWizardData',
        'mostrarSucesso',
        'populateComboTicketSelect'
    ];
    
    funcoesEssenciais.forEach(funcao => {
        const existe = typeof window[funcao] === 'function';
        console.log(`${existe ? '✅' : '❌'} ${funcao}: ${existe ? 'Disponível' : 'NÃO ENCONTRADA'}`);
    });
    
    // Verificar botões
    console.log('\n=== VERIFICAÇÃO DE BOTÕES ===');
    const botoesAvançar = document.querySelectorAll('[onClick*="nextStep"]');
    console.log(`Botões "Avançar" encontrados: ${botoesAvançar.length}`);
    
    // Monitorar cliques
    botoesAvançar.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            console.log(`🖱️ Clique detectado no botão ${index + 1}`);
        });
    });
});

// Funções de teste manual
window.testarValidacao = function(step) {
    console.log(`\n🧪 Testando validação do step ${step}...`);
    const resultado = window.validateStep(step);
    console.log(`Resultado: ${resultado ? '✅ PASSOU' : '❌ FALHOU'}`);
    return resultado;
};

window.testarTodasValidacoes = function() {
    console.log('\n🧪 TESTANDO TODAS AS VALIDAÇÕES...\n');
    for (let i = 1; i <= 8; i++) {
        window.testarValidacao(i);
    }
};

window.verificarCampos = function() {
    console.log('\n=== VERIFICAÇÃO DE CAMPOS ===');
    
    const campos = {
        'eventName': 'Nome do evento',
        'eventDate': 'Data do evento',
        'eventTime': 'Hora do evento',
        'eventClassification': 'Classificação',
        'eventCategory': 'Categoria',
        'eventDescription': 'Descrição',
        'endereco': 'Endereço',
        'numero': 'Número',
        'eventLink': 'Link do evento',
        'acceptTerms': 'Aceitar termos'
    };
    
    Object.entries(campos).forEach(([id, nome]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            const valor = elemento.value || elemento.textContent || (elemento.checked ? 'checked' : 'not checked');
            console.log(`✅ ${nome}: ${valor}`);
        } else {
            console.log(`❌ ${nome}: ELEMENTO NÃO ENCONTRADO`);
        }
    });
    
    // Verificar containers de imagem
    console.log('\n=== VERIFICAÇÃO DE IMAGENS ===');
    const containers = ['logoPreviewContainer', 'capaPreviewContainer', 'fundoPreviewMain'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        const temImagem = container && container.querySelector('img') !== null;
        console.log(`${temImagem ? '✅' : '❌'} ${id}: ${temImagem ? 'Tem imagem' : 'Sem imagem'}`);
    });
};

console.log('\n📌 COMANDOS DISPONÍVEIS:');
console.log('- testarValidacao(1-8) - Testa validação de um step específico');
console.log('- testarTodasValidacoes() - Testa todas as validações');
console.log('- verificarCampos() - Verifica todos os campos do formulário');
