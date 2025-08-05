/**
 * DEBUG ESPECÍFICO PARA PROBLEMA DOS RASCUNHOS
 * 
 * Intercepta especificamente a requisição de verificar_rascunho
 * para ver o que está sendo retornado
 */

console.log('🐛 Carregando debug específico para rascunhos...');

/**
 * Interceptar APENAS a requisição de verificar_rascunho
 */
const fetchOriginalRascunho = window.fetch;

window.fetch = function(url, options) {
    // Interceptar apenas wizard_evento.php com action=verificar_rascunho
    if (url.includes('wizard_evento.php') && options && options.body && options.body.includes('verificar_rascunho')) {
        
        console.log('🔍 INTERCEPTANDO: verificar_rascunho');
        
        return fetchOriginalRascunho.apply(this, arguments).then(response => {
            console.log('📡 Response status:', response.status);
            
            // Clonar response para debug
            const responseClone = response.clone();
            
            return responseClone.text().then(texto => {
                console.log('📄 RESPOSTA BRUTA verificar_rascunho:');
                console.log('Tamanho:', texto.length, 'chars');
                console.log('Conteúdo:', texto);
                
                // Tentar parsear JSON
                try {
                    const json = JSON.parse(texto);
                    console.log('✅ JSON válido:', json);
                    
                    // Retornar response original com JSON válido
                    return Promise.resolve({
                        ...response,
                        json: () => Promise.resolve(json),
                        text: () => Promise.resolve(texto)
                    });
                } catch (error) {
                    console.error('❌ ERRO NO JSON:', error);
                    console.log('🔍 Tentando limpeza...');
                    
                    // Tentar limpar JSON
                    const primeiraChave = texto.indexOf('{');
                    const ultimaChave = texto.lastIndexOf('}');
                    
                    if (primeiraChave !== -1 && ultimaChave !== -1) {
                        const jsonLimpo = texto.substring(primeiraChave, ultimaChave + 1);
                        console.log('🧹 JSON LIMPO:', jsonLimpo);
                        
                        try {
                            const jsonParsed = JSON.parse(jsonLimpo);
                            console.log('✅ JSON LIMPO VÁLIDO:', jsonParsed);
                            
                            return Promise.resolve({
                                ...response,
                                json: () => Promise.resolve(jsonParsed),
                                text: () => Promise.resolve(jsonLimpo)
                            });
                        } catch (error2) {
                            console.error('❌ ERRO NO JSON LIMPO:', error2);
                        }
                    }
                    
                    // Se tudo falhar, retornar erro
                    return Promise.reject(new Error('JSON inválido: ' + error.message));
                }
            });
        });
    }
    
    // Para todas as outras requisições, usar fetch original
    return fetchOriginalRascunho.apply(this, arguments);
};

/**
 * Função para testar a API diretamente
 */
window.testarAPIRascunho = async function() {
    console.log('🧪 TESTANDO API DE RASCUNHO DIRETAMENTE...');
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=verificar_rascunho'
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        const texto = await response.text();
        console.log('📄 Texto da resposta:', texto);
        
        const json = JSON.parse(texto);
        console.log('✅ JSON parseado:', json);
        
        return json;
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return null;
    }
};

/**
 * Função para verificar se há error_log contaminando
 */
window.verificarContaminacaoRascunho = async function() {
    console.log('🔍 VERIFICANDO CONTAMINAÇÃO NA API...');
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=verificar_rascunho'
        });
        
        const texto = await response.text();
        
        console.log('📊 ANÁLISE DA RESPOSTA:');
        console.log('- Tamanho:', texto.length);
        console.log('- Primeiro char:', texto.charCodeAt(0), `"${texto[0]}"`);
        console.log('- Último char:', texto.charCodeAt(texto.length-1), `"${texto[texto.length-1]}"`);
        console.log('- Contém "{":', texto.includes('{'));
        console.log('- Contém "}":', texto.includes('}'));
        console.log('- Posição primeiro "{":', texto.indexOf('{'));
        console.log('- Posição último "}":', texto.lastIndexOf('}'));
        
        // Verificar se há caracteres antes do JSON
        const primeiroJSON = texto.indexOf('{');
        if (primeiroJSON > 0) {
            const lixoAntes = texto.substring(0, primeiroJSON);
            console.log('🚫 LIXO ANTES DO JSON:', JSON.stringify(lixoAntes));
        }
        
        // Verificar se há caracteres depois do JSON
        const ultimoJSON = texto.lastIndexOf('}');
        if (ultimoJSON < texto.length - 1) {
            const lixoDepois = texto.substring(ultimoJSON + 1);
            console.log('🚫 LIXO DEPOIS DO JSON:', JSON.stringify(lixoDepois));
        }
        
        return texto;
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
        return null;
    }
};

// Executar verificação automática
setTimeout(() => {
    console.log('🔍 Executando verificação automática da API de rascunho...');
    window.verificarContaminacaoRascunho();
}, 2000);

console.log('✅ Debug específico para rascunhos carregado!');