/**
 * TESTE RÁPIDO DA CORREÇÃO
 */

window.testeRapidoCorrecao = async function() {
    console.log('🔧 TESTANDO CORREÇÃO...');
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=verificar_rascunho'
        });
        
        console.log('Status:', response.status);
        const texto = await response.text();
        console.log('Tamanho resposta:', texto.length);
        console.log('Conteúdo:', texto);
        
        if (texto.length > 0) {
            const json = JSON.parse(texto);
            console.log('✅ CORRIGIDO! JSON:', json);
            return true;
        } else {
            console.log('❌ Ainda vazio');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
        return false;
    }
};

// Executar automaticamente
setTimeout(() => {
    window.testeRapidoCorrecao();
}, 500);

console.log('🔧 Teste rápido carregado');