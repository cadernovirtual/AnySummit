// Script para forçar salvamento imediato do wizard
console.log('💾 Iniciando script de salvamento forçado...');

// Função para salvar dados imediatamente
window.salvarDadosAgora = function() {
    console.log('💾 Salvando dados AGORA...');
    
    const wizardData = {
        currentStep: window.wizardState ? window.wizardState.currentStep : 1,
        eventName: document.getElementById('eventName')?.value || '',
        classification: document.getElementById('classification')?.value || '',
        category: document.getElementById('category')?.value || '',
        startDateTime: document.getElementById('startDateTime')?.value || '',
        endDateTime: document.getElementById('endDateTime')?.value || '',
        eventDescription: document.getElementById('eventDescription')?.innerText || '',
        locationTypeSwitch: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
        venueName: document.getElementById('venueName')?.value || '',
        addressSearch: document.getElementById('addressSearch')?.value || '',
        eventLink: document.getElementById('eventLink')?.value || '',
        producer: document.getElementById('producer')?.value || 'current',
        producerName: document.getElementById('producerName')?.value || '',
        displayName: document.getElementById('displayName')?.value || '',
        producerDescription: document.getElementById('producerDescription')?.value || '',
        termsAccepted: document.getElementById('termsCheckbox')?.classList.contains('checked'),
        timestamp: Date.now()
    };
    
    // Salvar no cookie
    const jsonString = JSON.stringify(wizardData);
    const encoded = encodeURIComponent(jsonString);
    document.cookie = `eventoWizard=${encoded}; path=/; max-age=86400`;
    
    console.log('✅ Cookie salvo:', encoded.substring(0, 100) + '...');
    
    // Verificar se foi salvo
    const cookies = document.cookie.split(';');
    const saved = cookies.find(c => c.trim().startsWith('eventoWizard='));
    
    if (saved) {
        console.log('✅ Cookie verificado - SALVO COM SUCESSO!');
    } else {
        console.log('❌ ERRO: Cookie não foi salvo!');
    }
    
    return wizardData;
};

// Interceptar todos os cliques em botões de navegação
document.addEventListener('click', function(e) {
    // Se clicou em botão de avançar ou voltar
    if (e.target.classList.contains('btn-continue') || 
        e.target.classList.contains('btn-back') ||
        e.target.onclick?.toString().includes('nextStep') ||
        e.target.onclick?.toString().includes('prevStep')) {
        
        console.log('🔄 Botão de navegação clicado - salvando...');
        
        // Salvar imediatamente
        setTimeout(() => {
            salvarDadosAgora();
        }, 100);
    }
});

// Salvar a cada 10 segundos automaticamente
setInterval(() => {
    const step = window.wizardState?.currentStep || 1;
    if (step > 1) {
        console.log('⏰ Salvamento automático...');
        salvarDadosAgora();
    }
}, 10000);

// Adicionar listener para mudanças em campos importantes
const camposImportantes = ['eventName', 'startDateTime', 'classification', 'category'];
camposImportantes.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
        campo.addEventListener('change', () => {
            console.log(`📝 Campo ${id} alterado - salvando...`);
            setTimeout(salvarDadosAgora, 500);
        });
    }
});

console.log('✅ Script de salvamento forçado ativo!');
console.log('💡 Use salvarDadosAgora() para salvar manualmente');