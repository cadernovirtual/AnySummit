/**
 * TESTE DE RECUPERAÇÃO DE LOTES
 */

console.log('🧪 TESTE-RECUPERACAO-LOTES.JS CARREGANDO...');

window.testarRecuperacaoLotes = async function() {
    console.log('🧪 Testando recuperação de lotes...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('❌ Sem evento_id para testar');
        return;
    }
    
    try {
        console.log('📡 Testando recuperar_evento_simples...');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=recuperar_evento_simples&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📄 Resposta da API:', textResponse);
        
        // Tentar extrair JSON
        let jsonData = null;
        try {
            jsonData = JSON.parse(textResponse);
        } catch (parseError) {
            const lines = textResponse.split('\n');
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('{') && line.endsWith('}')) {
                    try {
                        jsonData = JSON.parse(line);
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            }
        }
        
        if (jsonData && jsonData.sucesso) {
            console.log('✅ Dados do evento recuperados:', jsonData.evento);
            console.log('📦 Lotes encontrados:', jsonData.evento.lotes);
            
            if (jsonData.evento.lotes && jsonData.evento.lotes.length > 0) {
                console.log('🔄 Testando renderização unificada...');
                
                if (typeof window.renderizarLotesUnificado === 'function') {
                    await window.renderizarLotesUnificado(jsonData.evento.lotes);
                    console.log('✅ Renderização unificada executada');
                } else {
                    console.error('❌ Função renderizarLotesUnificado não encontrada');
                }
                
                if (typeof window.restaurarLotesUnificado === 'function') {
                    await window.restaurarLotesUnificado(jsonData.evento.lotes);
                    console.log('✅ Restauração unificada executada');
                } else {
                    console.error('❌ Função restaurarLotesUnificado não encontrada');
                }
            } else {
                console.log('📭 Nenhum lote encontrado no banco');
            }
        } else {
            console.error('❌ Erro na API ou resposta inválida:', jsonData);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
};

// Executar teste automaticamente se estivermos na etapa 5
setTimeout(() => {
    const etapaAtual = window.currentStep || 1;
    if (etapaAtual === 5) {
        console.log('🚀 Executando teste automático de recuperação...');
        window.testarRecuperacaoLotes();
    }
}, 3000);

console.log('✅ TESTE-RECUPERACAO-LOTES.JS CARREGADO!');
console.log('🔧 Para testar manualmente: testarRecuperacaoLotes()');
