/**
 * TESTE DIRETO DA API - Verifica se a API está funcionando
 */

// Criar função global para teste
window.testarAPIMinima = async function() {
    
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
        
        const texto = await response.text();
        
        // Tentar acessar como GET também
        const responseGet = await fetch('/produtor/criaeventoapi.php');
        const textoGet = await responseGet.text();
        
    } catch (error) {
        console.error('Erro:', error);
    }
};

// Executar automaticamente