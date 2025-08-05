/**
 * TESTE EMERGENCIAL - ENCONTRAR PROBLEMA DOS RASCUNHOS
 */

console.log('🚨 TESTE EMERGENCIAL CARREGADO');

window.testeEmergencialRascunho = async function() {
    console.log('🚨 EXECUTANDO TESTE EMERGENCIAL...');
    
    try {
        // Testar API de sessão
        console.log('1. Testando sessão...');
        const respSessao = await fetch('/produtor/ajax/teste_sessao.php');
        const textoSessao = await respSessao.text();
        console.log('SESSÃO:', textoSessao);
        
        // Testar API original
        console.log('2. Testando API original...');
        const respOriginal = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=verificar_rascunho'
        });
        
        console.log('Status API original:', respOriginal.status);
        const textoOriginal = await respOriginal.text();
        console.log('Resposta API original (length=' + textoOriginal.length + '):', textoOriginal);
        
        if (textoOriginal.length === 0) {
            console.log('🚨 PROBLEMA: API retorna resposta VAZIA!');
        } else {
            try {
                const json = JSON.parse(textoOriginal);
                console.log('✅ JSON válido:', json);
            } catch (error) {
                console.log('❌ JSON inválido:', error);
                console.log('Primeiro char:', textoOriginal.charCodeAt(0));
                console.log('Último char:', textoOriginal.charCodeAt(textoOriginal.length-1));
            }
        }
        
    } catch (error) {
        console.error('🚨 ERRO NO TESTE:', error);
    }
};

// Executar automaticamente
setTimeout(() => {
    window.testeEmergencialRascunho();
}, 1000);

console.log('🚨 Use testeEmergencialRascunho() para executar o teste');