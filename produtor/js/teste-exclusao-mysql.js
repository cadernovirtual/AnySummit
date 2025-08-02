/**
 * TESTE ESPECÍFICO - REQUISIÇÃO MYSQL DE EXCLUSÃO
 * Use para testar se a requisição está chegando ao backend
 */

window.testarExclusaoMySQL = async function(loteId) {
    console.clear();
    console.log('🧪 === TESTE ESPECÍFICO DE EXCLUSÃO MYSQL ===');
    
    if (!loteId) {
        console.log('❌ Uso: testarExclusaoMySQL(ID_DO_LOTE)');
        return;
    }
    
    try {
        // 1. Verificar dados antes
        console.log('\n1️⃣ DADOS ANTES DA EXCLUSÃO:');
        console.log('window.lotesData:', window.lotesData);
        
        // 2. Pegar evento_id
        const eventoId = window.getEventoId?.() || 
                       new URLSearchParams(window.location.search).get('evento_id') ||
                       window.eventoAtual?.id;
        
        console.log('\n2️⃣ PARÂMETROS:');
        console.log('loteId:', loteId);
        console.log('eventoId:', eventoId);
        
        if (!eventoId) {
            console.log('❌ Evento ID não encontrado!');
            return;
        }
        
        // 3. Preparar requisição
        const url = '/produtor/ajax/wizard_evento.php';
        const body = `action=excluir_lote&lote_id=${loteId}&evento_id=${eventoId}`;
        
        console.log('\n3️⃣ REQUISIÇÃO:');
        console.log('URL:', url);
        console.log('Body:', body);
        console.log('Method: POST');
        
        // 4. Fazer requisição
        console.log('\n4️⃣ ENVIANDO REQUISIÇÃO...');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: body
        });
        
        console.log('\n5️⃣ RESPOSTA RECEBIDA:');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        // 5. Processar resposta
        const resultText = await response.text();
        console.log('\n6️⃣ CONTEÚDO DA RESPOSTA:');
        console.log('Raw text:', resultText);
        console.log('Tamanho:', resultText.length, 'caracteres');
        
        if (!resultText.trim()) {
            console.log('❌ RESPOSTA VAZIA!');
            console.log('💡 Possíveis causas:');
            console.log('   - Backend não encontrou a action');
            console.log('   - Erro no PHP que não gerou output');
            console.log('   - Headers incorretos');
            return;
        }
        
        // 6. Tentar parsear JSON
        let result;
        try {
            result = JSON.parse(resultText);
            console.log('\n7️⃣ JSON PARSEADO:');
            console.log('Resultado:', result);
            
            if (result.sucesso) {
                console.log('✅ EXCLUSÃO BEM SUCEDIDA NO MYSQL!');
            } else if (result.erro) {
                console.log('❌ ERRO RETORNADO PELO BACKEND:', result.erro);
            } else {
                console.log('⚠️ Resposta inesperada:', result);
            }
            
        } catch (e) {
            console.log('\n❌ ERRO AO PARSEAR JSON:');
            console.log('Erro:', e);
            console.log('Texto recebido não é JSON válido');
            console.log('Primeira linha:', resultText.split('\n')[0]);
            
            // Verificar se é HTML de erro
            if (resultText.includes('<!DOCTYPE') || resultText.includes('<html')) {
                console.log('🚨 RECEBEU HTML EM VEZ DE JSON - ERRO NO BACKEND!');
            }
        }
        
    } catch (error) {
        console.log('\n💥 ERRO NA REQUISIÇÃO:');
        console.log('Error:', error);
        console.log('Message:', error.message);
    }
    
    console.log('\n🏁 TESTE CONCLUÍDO');
};

// Função para testar com lote existente
window.testarComLoteExistente = function() {
    console.log('🔍 Buscando lote existente para testar...');
    
    const lotes = [
        ...(window.lotesData?.porData || []),
        ...(window.lotesData?.porPercentual || [])
    ];
    
    if (lotes.length > 0) {
        const lote = lotes[0];
        console.log('📦 Encontrado lote:', lote);
        console.log('🧪 Testando exclusão...');
        
        if (confirm(`Testar exclusão do lote "${lote.nome}"? (SERÁ EXCLUÍDO PERMANENTEMENTE)`)) {
            testarExclusaoMySQL(lote.id);
        }
    } else {
        console.log('❌ Nenhum lote encontrado para testar');
    }
};

console.log('✅ Teste de exclusão MySQL carregado');
console.log('💡 Comandos disponíveis:');
console.log('   testarExclusaoMySQL(ID_DO_LOTE) - Teste específico');
console.log('   testarComLoteExistente() - Teste com lote real');
