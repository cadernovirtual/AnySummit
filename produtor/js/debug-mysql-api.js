/**
 * DEBUG MYSQL API - TESTA RECUPERAÇÃO DE DADOS
 */

console.log('🔍 DEBUG-MYSQL-API.JS CARREGANDO...');

window.testarAPIMysql = async function() {
    console.log('🔍 Testando API MySQL...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    console.log('📋 Evento ID:', eventoId);
    
    if (!eventoId) {
        console.log('❌ Sem evento_id na URL');
        return;
    }
    
    try {
        // Testar API simples
        console.log('📡 Testando recuperar_evento_simples...');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=recuperar_evento_simples&evento_id=${eventoId}`
        });
        
        console.log('📡 Status da resposta:', response.status);
        console.log('📡 Headers:', response.headers);
        
        const textResponse = await response.text();
        console.log('📡 Resposta bruta:', textResponse);
        
        try {
            const data = JSON.parse(textResponse);
            console.log('✅ JSON válido:', data);
            
            if (data.sucesso) {
                console.log('📋 Evento:', data.evento);
                console.log('📦 Lotes:', data.evento?.lotes);
                console.log(`📊 Total de lotes: ${data.evento?.lotes?.length || 0}`);
            } else {
                console.log('❌ API retornou erro:', data.erro);
            }
            
        } catch (jsonError) {
            console.error('❌ Erro ao parsear JSON:', jsonError);
            console.log('📄 Texto da resposta (primeiros 500 chars):', textResponse.substring(0, 500));
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
};

// Executar teste automaticamente
setTimeout(() => {
    console.log('🚀 Executando teste automático da API...');
    window.testarAPIMysql();
}, 2000);

console.log('✅ DEBUG-MYSQL-API.JS CARREGADO!');
console.log('🔧 Para testar manualmente: testarAPIMysql()');
