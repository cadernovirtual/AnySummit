// Script de diagnóstico completo

// 1. Verificar se cookies estão habilitados
document.cookie = "teste=123; path=/";
const testeCookie = document.cookie.includes('teste=123');
document.cookie = "teste=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// 2. Listar TODOS os cookies
const allCookies = document.cookie.split(';');
allCookies.forEach((cookie, index) => {
    const trimmed = cookie.trim();
    if (trimmed) {
        
    }
});

// 3. Procurar especificamente pelo eventoWizard
const wizardCookie = allCookies.find(c => c.trim().startsWith('eventoWizard='));
if (wizardCookie) {
    const value = wizardCookie.trim().substring(13);
    console.log('- Cookie encontrado!');
    console.log('- Valor raw:', value);
    console.log('- Tamanho:', value.length);
    
    // Tentar decodificar
    try {
        const decoded = decodeURIComponent(value);
        console.log('- Decodificado:', decoded);
        
        // Tentar parse
        try {
            const parsed = JSON.parse(decoded);
            console.log('- JSON válido! Dados:', parsed);
        } catch (e) {
            console.log('- ❌ Erro no parse JSON:', e.message);
            console.log('- Primeiros 100 caracteres:', decoded.substring(0, 100));
        }
    } catch (e) {
        console.log('- ❌ Erro ao decodificar:', e.message);
    }
} else {
    console.log('- ❌ Cookie NÃO encontrado!');
}

// 4. Verificar se scripts foram carregados
console.log('\n4️⃣ SCRIPTS DE RECUPERAÇÃO:');
console.log('- json-recovery-fix.js carregado:', 
    document.querySelector('script[src*="json-recovery-fix"]') ? '✅ SIM' : '❌ NÃO');
console.log('- simple-recovery.js carregado:', 
    document.querySelector('script[src*="simple-recovery"]') ? '✅ SIM' : '❌ NÃO');
console.log('- wizard-management.js carregado:', 
    document.querySelector('script[src*="wizard-management"]') ? '✅ SIM' : '❌ NÃO');

// 5. Verificar funções disponíveis
console.log('\n5️⃣ FUNÇÕES DISPONÍVEIS:');
console.log('- getCookie:', typeof window.getCookie);
console.log('- restoreWizardData:', typeof window.restoreWizardData);
console.log('- wizardState:', window.wizardState);

// 6. Testar confirm
console.log('\n6️⃣ TESTE DE DIALOG:');
console.log('- window.confirm disponível:', typeof window.confirm);
console.log('- Vou mostrar um confirm de teste em 2 segundos...');

setTimeout(() => {
    const resultado = confirm('🧪 TESTE: Este dialog apareceu corretamente?');
    console.log('- Resultado do teste:', resultado ? 'OK clicado' : 'Cancelar clicado');
}, 2000);

console.log('\n📋 DIAGNÓSTICO CONCLUÍDO - Copie todo o resultado acima');

// 7. Forçar salvamento e mostrar valor
console.log('\n7️⃣ SALVANDO COOKIE DE TESTE:');
const testData = {
    currentStep: 3,
    eventName: "Teste Diagnóstico",
    classification: "12"
};
const testJson = JSON.stringify(testData);
const testEncoded = encodeURIComponent(testJson);
document.cookie = `eventoWizard=${testEncoded}; path=/; max-age=86400`;
console.log('- Cookie salvo! Valor:', testEncoded);
console.log('- Recarregue a página para testar se o dialog aparece');
