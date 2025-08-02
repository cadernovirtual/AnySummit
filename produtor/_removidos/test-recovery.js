// Script para testar o salvamento e recuperação
console.log('🧪 Script de teste de recuperação carregado');

// Função para forçar salvamento de dados de teste
window.forcarSalvamentoDeTeste = function() {
    const testData = {
        currentStep: 3,
        eventName: "Evento de Teste",
        classification: "12",
        category: "entretenimento",
        startDateTime: "2025-10-10T12:00",
        endDateTime: "",
        eventDescription: "Descrição do evento teste",
        locationTypeSwitch: true,
        venueName: "Local de Teste",
        addressSearch: "Rua Teste, 123",
        eventLink: "",
        producer: "current",
        producerName: "",
        displayName: "",
        producerDescription: "",
        termsAccepted: false
    };
    
    const jsonString = JSON.stringify(testData);
    document.cookie = `eventoWizard=${encodeURIComponent(jsonString)}; path=/; max-age=86400`;
    
    console.log('✅ Dados de teste salvos! Recarregue a página para ver o dialog.');
    console.log('Cookie salvo:', document.cookie);
};

// Função para verificar se há cookie salvo
window.verificarCookieSalvo = function() {
    const cookies = document.cookie.split(';');
    const wizardCookie = cookies.find(c => c.trim().startsWith('eventoWizard='));
    
    if (wizardCookie) {
        const value = wizardCookie.split('=')[1];
        try {
            const data = JSON.parse(decodeURIComponent(value));
            console.log('✅ Cookie encontrado:', data);
        } catch (e) {
            console.log('❌ Cookie existe mas está corrompido:', e);
        }
    } else {
        console.log('❌ Nenhum cookie eventoWizard encontrado');
    }
};

console.log('💡 Use forcarSalvamentoDeTeste() para salvar dados de teste');
console.log('💡 Use verificarCookieSalvo() para verificar o cookie');