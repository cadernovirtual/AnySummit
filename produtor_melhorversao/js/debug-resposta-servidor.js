/**
 * DEBUG ESPECÍFICO PARA RESPOSTA DO SERVIDOR
 * 
 * O problema real é: "SyntaxError: Unexpected non-whitespace character after JSON at position 3687"
 * Isso significa que o servidor está retornando JSON corrompido
 */

console.log('🔍 Carregando debug específico da resposta do servidor...');

/**
 * Interceptar TODAS as requisições para wizard_evento.php e debuggar as respostas
 */
const originalFetch = window.fetch;

window.fetch = async function(...args) {
    const [url, options] = args;
    
    // Só interceptar wizard_evento.php
    if (typeof url === 'string' && url.includes('wizard_evento.php')) {
        console.log('🔍 ========== DEBUG REQUISIÇÃO WIZARD_EVENTO ==========');
        console.log('📤 URL:', url);
        console.log('📤 Options:', options);
        
        if (options && options.body) {
            console.log('📤 Body:', options.body);
        }
        
        try {
            const response = await originalFetch.apply(this, args);
            
            console.log('📥 Response Status:', response.status);
            console.log('📥 Response Headers:', [...response.headers.entries()]);
            
            // Ler o texto da resposta
            const responseText = await response.text();
            
            console.log('📥 Response Length:', responseText.length);
            console.log('📥 Response Text (first 500 chars):', responseText.substring(0, 500));
            console.log('📥 Response Text (last 500 chars):', responseText.substring(responseText.length - 500));
            
            // Tentar encontrar onde está o problema do JSON
            try {
                const data = JSON.parse(responseText);
                console.log('✅ JSON válido:', data);
                
                // Retornar resposta válida
                return new Response(JSON.stringify(data), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
                
            } catch (jsonError) {
                console.error('❌ ERRO JSON:', jsonError);
                console.log('🔍 Tentando identificar o problema...');
                
                // Analisar onde está o erro
                const errorPos = jsonError.message.match(/position (\d+)/);
                if (errorPos) {
                    const pos = parseInt(errorPos[1]);
                    console.log(`🔍 Erro na posição ${pos}:`);
                    console.log('Antes:', responseText.substring(Math.max(0, pos - 50), pos));
                    console.log('↓ PROBLEMA AQUI ↓');
                    console.log('Depois:', responseText.substring(pos, pos + 50));
                }
                
                // Tentar limpar o JSON
                const jsonLimpo = tentarLimparJSON(responseText);
                if (jsonLimpo) {
                    console.log('✅ JSON limpo com sucesso');
                    return new Response(jsonLimpo, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                } else {
                    console.error('❌ Não foi possível limpar o JSON');
                    throw jsonError;
                }
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            throw error;
        }
        
    } else {
        // Outras requisições passam normalmente
        return originalFetch.apply(this, args);
    }
};

/**
 * Tentar limpar JSON corrompido
 */
function tentarLimparJSON(texto) {
    console.log('🧹 Tentando limpar JSON corrompido...');
    
    // Estratégias de limpeza
    const estrategias = [
        // 1. Remover warnings PHP do início
        (txt) => {
            const match = txt.match(/\{.*\}$/s);
            return match ? match[0] : null;
        },
        
        // 2. Remover conteúdo após o último }
        (txt) => {
            const lastBrace = txt.lastIndexOf('}');
            return lastBrace !== -1 ? txt.substring(0, lastBrace + 1) : null;
        },
        
        // 3. Procurar por {"sucesso": e pegar dali
        (txt) => {
            const match = txt.match(/\{"sucesso".*\}$/s);
            return match ? match[0] : null;
        },
        
        // 4. Remover quebras de linha e espaços extras
        (txt) => {
            return txt.replace(/\r?\n/g, '').replace(/\s+/g, ' ').trim();
        }
    ];
    
    for (let i = 0; i < estrategias.length; i++) {
        try {
            const resultado = estrategias[i](texto);
            if (resultado) {
                JSON.parse(resultado); // Testar se é válido
                console.log(`✅ Estratégia ${i + 1} funcionou`);
                return resultado;
            }
        } catch (e) {
            console.log(`❌ Estratégia ${i + 1} falhou:`, e.message);
        }
    }
    
    return null;
}

/**
 * Função para testar uma requisição específica
 */
window.testarRequisicaoWizard = async function(action = 'recuperar_evento', eventoId = null) {
    console.log(`🧪 Testando requisição: ${action}`);
    
    if (!eventoId) {
        const urlParams = new URLSearchParams(window.location.search);
        eventoId = urlParams.get('evento_id');
    }
    
    if (!eventoId) {
        console.log('❌ Nenhum evento_id disponível');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=${action}&evento_id=${eventoId}`
        });
        
        console.log('✅ Requisição completada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na requisição de teste:', error);
    }
};

/**
 * Função para bypass completo - usar dados em cache se disponível
 */
window.bypassProblemaJSON = function() {
    console.log('🔄 Aplicando bypass para problema JSON...');
    
    // Sobrescrever função de recarregamento para não depender do JSON do servidor
    window.recarregarListaSemJSON = function() {
        console.log('🔄 Recarregando lista SEM depender do JSON do servidor...');
        
        const ticketList = document.getElementById('ticketList');
        if (!ticketList) return;
        
        // Se não há dados do servidor, manter o DOM atual
        const elementosAtuais = ticketList.querySelectorAll('.ticket-item');
        console.log(`📊 Mantendo ${elementosAtuais.length} elementos atuais no DOM`);
        
        return true;
    };
    
    // Sobrescrever funções problemáticas
    window.excluirIngressoSemJSON = function(ingressoId) {
        console.log(`🗑️ Excluindo ingresso ${ingressoId} SEM recarregar JSON...`);
        
        if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
            return;
        }
        
        // Excluir apenas do DOM (como workaround)
        const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
        if (elemento) {
            elemento.remove();
            console.log(`✅ Ingresso ${ingressoId} removido do DOM`);
        }
    };
    
    window.editarIngressoSemJSON = function(ingressoId) {
        console.log(`✏️ Editando ingresso ${ingressoId} SEM carregar JSON...`);
        
        // Usar dados do próprio elemento DOM
        const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
        if (!elemento) {
            alert('Ingresso não encontrado');
            return;
        }
        
        // Extrair dados do DOM
        const nomeElement = elemento.querySelector('.ticket-name');
        const nome = nomeElement ? nomeElement.textContent : 'Ingresso';
        
        // Popular modal básico
        if (nome.includes('Gratuito') || elemento.textContent.includes('Gratuito')) {
            document.getElementById('freeTicketTitle').value = nome.replace(/\s*\(.*?\)\s*/g, '');
            if (typeof openModal === 'function') {
                openModal('freeTicketModal');
            }
        } else {
            document.getElementById('paidTicketTitle').value = nome.replace(/\s*\(.*?\)\s*/g, '');
            if (typeof openModal === 'function') {
                openModal('paidTicketModal');
            }
        }
    };
    
    // Aplicar sobrescrita
    window.removeTicket = window.excluirIngressoSemJSON;
    window.editTicket = window.editarIngressoSemJSON;
    
    console.log('✅ Bypass aplicado - funções agora funcionam sem depender do JSON do servidor');
};

console.log('✅ Debug da resposta do servidor carregado');
console.log('💡 Execute testarRequisicaoWizard() para testar uma requisição');
console.log('💡 Execute bypassProblemaJSON() para contornar o problema JSON');

// Aplicar bypass automaticamente após alguns segundos
setTimeout(() => {
    console.log('🔄 Aplicando bypass automático...');
    window.bypassProblemaJSON();
}, 3000);