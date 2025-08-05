/**
 * TESTE RÁPIDO DA CORREÇÃO DA SESSÃO
 */

console.log('🔧 Testando correção da sessão...');

window.testarCorrecaoSessao = async function() {
    console.log('🧪 TESTANDO CORREÇÃO DA SESSÃO...');
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=verificar_rascunho'
        });
        
        console.log('📡 Status:', response.status);
        
        const texto = await response.text();
        console.log('📄 Resposta:', texto);
        console.log('📏 Tamanho:', texto.length);
        
        if (texto.length > 0) {
            const json = JSON.parse(texto);
            console.log('✅ JSON VÁLIDO:', json);
            
            if (json.erro && json.erro.includes('não autenticado')) {
                console.log('⚠️ Problema de autenticação resolvido, mas usuário não logado');
            } else {
                console.log('🎉 CORREÇÃO FUNCIONOU!');
            }
        } else {
            console.log('❌ Ainda retornando resposta vazia');
        }
        
        return texto;
        
    } catch (error) {
        console.error('❌ Erro:', error);
        return null;
    }
};

// Testar automaticamente
setTimeout(() => {
    window.testarCorrecaoSessao();
}, 1000);

console.log('✅ Teste de correção carregado!');