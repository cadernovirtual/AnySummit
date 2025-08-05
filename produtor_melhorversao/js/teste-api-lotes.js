/**
 * TESTE DIRETO DA API DE LOTES
 */

console.log('🧪 TESTE-API-LOTES.JS CARREGANDO...');

window.testarAPILotesDiretamente = async function() {
    console.log('🧪 Testando API de lotes diretamente...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('❌ Sem evento_id para testar');
        return;
    }
    
    try {
        console.log('📡 Testando criar_lote_data_com_renomeacao...');
        
        const dadosLote = {
            action: 'criar_lote_data_com_renomeacao',
            evento_id: eventoId,
            data_inicio: '2024-08-15T10:00',
            data_fim: '2024-08-20T23:59',
            divulgar_criterio: 1,
            percentual_aumento_valor: 0
        };
        
        console.log('📋 Enviando dados:', dadosLote);
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(dadosLote)
        });
        
        console.log('📡 Status da resposta:', response.status);
        console.log('📡 Headers da resposta:', [...response.headers.entries()]);
        
        const textResponse = await response.text();
        console.log('📄 Resposta completa (bruta):', textResponse);
        
        // Tentar extrair apenas o JSON
        const lines = textResponse.split('\n');
        let jsonLine = '';
        
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('{') && line.endsWith('}')) {
                jsonLine = line;
                break;
            }
        }
        
        if (jsonLine) {
            console.log('📋 JSON encontrado:', jsonLine);
            
            try {
                const data = JSON.parse(jsonLine);
                console.log('✅ JSON válido:', data);
                
                if (data.sucesso) {
                    console.log('🎉 Lote criado com sucesso!');
                    console.log('📋 ID:', data.lote_id);
                    console.log('🏷️ Nome:', data.nome);
                    
                    // Forçar atualização da interface
                    if (typeof window.renderizarLotesNaInterface === 'function') {
                        setTimeout(() => {
                            window.renderizarLotesNaInterface();
                        }, 500);
                    }
                } else {
                    console.log('❌ Erro na API:', data.erro);
                }
                
            } catch (jsonError) {
                console.error('❌ Erro ao parsear JSON:', jsonError);
            }
        } else {
            console.error('❌ Nenhum JSON válido encontrado na resposta');
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
};

// Adicionar botão de teste
setTimeout(() => {
    console.log('🔧 Para testar manualmente: testarAPILotesDiretamente()');
    
    // Se estivermos na etapa 5, adicionar botão de teste
    const etapaAtual = window.currentStep || 1;
    if (etapaAtual === 5) {
        const container = document.querySelector('.lotes-container');
        if (container && !document.getElementById('btnTesteAPI')) {
            const btnTeste = document.createElement('button');
            btnTeste.id = 'btnTesteAPI';
            btnTeste.innerHTML = '🧪 Testar API Diretamente';
            btnTeste.className = 'btn btn-outline btn-small';
            btnTeste.style.margin = '10px';
            btnTeste.onclick = window.testarAPILotesDiretamente;
            container.appendChild(btnTeste);
        }
    }
}, 2000);

console.log('✅ TESTE-API-LOTES.JS CARREGADO!');
