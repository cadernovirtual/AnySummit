/**
 * TESTE DIRETO DA API DE RASCUNHO
 * 
 * Este script faz um teste direto da API de rascunho para identificar o problema
 */

console.log('🧪 Carregando teste direto da API de rascunho...');

/**
 * Testar a API original
 */
window.testarAPIOriginal = async function() {
    console.log('🔍 TESTANDO API ORIGINAL wizard_evento.php...');
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=verificar_rascunho'
        });
        
        console.log('📡 Status:', response.status);
        console.log('📡 Headers:', [...response.headers.entries()]);
        
        const textoCompleto = await response.text();
        console.log('📄 RESPOSTA COMPLETA:');
        console.log('Tamanho:', textoCompleto.length);
        console.log('Conteúdo completo:', JSON.stringify(textoCompleto));
        
        // Análise detalhada
        for (let i = 0; i < textoCompleto.length; i++) {
            const char = textoCompleto[i];
            const code = textoCompleto.charCodeAt(i);
            if (code < 32 || code > 126) {
                console.log(`Char ${i}: "${char}" (code: ${code}) - SUSPEITO`);
            }
        }
        
        return textoCompleto;
        
    } catch (error) {
        console.error('❌ Erro no teste original:', error);
        return null;
    }
};

/**
 * Testar a API de teste
 */
window.testarAPITeste = async function() {
    console.log('🔍 TESTANDO API DE TESTE teste_rascunho.php...');
    
    try {
        const response = await fetch('/produtor/ajax/teste_rascunho.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Status:', response.status);
        
        const textoCompleto = await response.text();
        console.log('📄 RESPOSTA API TESTE:');
        console.log('Tamanho:', textoCompleto.length);
        console.log('Conteúdo:', textoCompleto);
        
        const json = JSON.parse(textoCompleto);
        console.log('✅ JSON parseado:', json);
        
        return json;
        
    } catch (error) {
        console.error('❌ Erro no teste da API de teste:', error);
        return null;
    }
};

/**
 * Comparar as duas APIs
 */
window.compararAPIs = async function() {
    console.log('🔍 COMPARANDO AS DUAS APIs...');
    
    const [original, teste] = await Promise.all([
        window.testarAPIOriginal(),
        window.testarAPITeste()
    ]);
    
    console.log('📊 COMPARAÇÃO:');
    console.log('Original:', original);
    console.log('Teste:', teste);
    
    if (original && teste) {
        console.log('✅ Ambas funcionaram');
    } else if (!original && teste) {
        console.log('⚠️ Apenas a API de teste funcionou - problema na original');
    } else if (original && !teste) {
        console.log('⚠️ Apenas a original funcionou - problema na API de teste');
    } else {
        console.log('❌ Nenhuma funcionou');
    }
};

/**
 * Executar todos os testes automaticamente
 */
setTimeout(() => {
    console.log('🚀 Executando todos os testes automaticamente...');
    window.compararAPIs();
}, 3000);

console.log('✅ Teste direto da API de rascunho carregado!');