/**
 * TESTE DIRETO DA API - Verifica se a API está funcionando
 */

// Criar função global para teste
window.testarAPIMinima = async function() {
    console.log('🧪 TESTE MÍNIMO DA API...');
    
    // Dados absolutamente mínimos
    const dados = {
        teste: "ok"
    };
    
    try {
        const response = await fetch('/produtor/criaeventoapi.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        console.log('Status:', response.status);
        const texto = await response.text();
        console.log('Resposta:', texto || '(vazia)');
        
        // Tentar acessar como GET também
        console.log('\n🧪 Tentando GET...');
        const responseGet = await fetch('/produtor/criaeventoapi.php');
        console.log('GET Status:', responseGet.status);
        const textoGet = await responseGet.text();
        console.log('GET Resposta:', textoGet || '(vazia)');
        
    } catch (error) {
        console.error('Erro:', error);
    }
};

// Executar automaticamente
console.log('📌 Use testarAPIMinima() para testar a API');
console.log('📌 Use debugDadosEvento() para ver dados coletados');