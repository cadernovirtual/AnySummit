// TESTE DIRETO - FORÇA CRIAÇÃO E BUSCA
(function() {
    'use strict';
    
    console.log('🔥 TESTE DIRETO CARREGADO');
    
    // CRIAR ELEMENTO DE TESTE NA PÁGINA
    function criarElementoTeste() {
        // Remover teste anterior se existir
        const testeAnterior = document.getElementById('teste-lote-display');
        if (testeAnterior) {
            testeAnterior.remove();
        }
        
        // Criar novo elemento de teste
        const div = document.createElement('div');
        div.id = 'teste-lote-display';
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 99999;
            font-family: monospace;
            max-width: 300px;
        `;
        div.textContent = 'Testando busca de lote...';
        
        document.body.appendChild(div);
        return div;
    }
    
    // FUNÇÃO DE TESTE DIRETO
    window.testeDirectoLote = async function(loteId) {
        console.log(`🔥 TESTE DIRETO - LOTE ${loteId}`);
        
        const elementoTeste = criarElementoTeste();
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            console.log(`🔥 PARAMETROS: loteId=${loteId}, eventoId=${eventoId}`);
            
            elementoTeste.textContent = `Consultando lote ${loteId}...`;
            
            const response = await fetch('/produtor/ajax/buscar_lote_simples.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            console.log(`🔥 RESPONSE STATUS: ${response.status}`);
            console.log(`🔥 RESPONSE HEADERS:`, response.headers);
            
            const responseText = await response.text();
            console.log(`🔥 RESPONSE TEXT (primeiros 500 chars): ${responseText.substring(0, 500)}`);
            
            if (!responseText.trim()) {
                throw new Error('Resposta vazia do servidor');
            }
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log(`🔥 RESPONSE JSON:`, data);
            } catch (jsonError) {
                console.error(`🔥 ERRO JSON PARSE:`, jsonError);
                console.error(`🔥 RESPOSTA COMPLETA: "${responseText}"`);
                throw new Error(`JSON inválido: ${responseText.substring(0, 100)}...`);
            }
            
            if (data.sucesso && data.lote) {
                const texto = data.texto || `${data.lote.nome} - ${data.lote.tipo}`;
                elementoTeste.innerHTML = `
                    <strong>✅ SUCESSO!</strong><br>
                    <strong>${texto}</strong><br>
                    <small>Lote ID: ${loteId}</small><br>
                    <small>Dados: ${JSON.stringify(data.lote).substring(0, 50)}...</small>
                `;
                elementoTeste.style.backgroundColor = '#28a745';
                
                console.log(`🔥 RESULTADO FINAL: ${texto}`);
                return texto;
                
            } else {
                const erro = data.erro || 'Erro desconhecido';
                elementoTeste.innerHTML = `
                    <strong>❌ ERRO</strong><br>
                    ${erro}
                `;
                elementoTeste.style.backgroundColor = '#dc3545';
                console.error(`🔥 ERRO RETORNADO: ${erro}`);
            }
            
        } catch (error) {
            console.error(`🔥 ERRO CATCH:`, error);
            elementoTeste.innerHTML = `
                <strong>💥 EXCEPTION</strong><br>
                ${error.message}<br>
                <small>Veja console para detalhes</small>
            `;
            elementoTeste.style.backgroundColor = '#dc3545';
        }
        
        // Remover após 15 segundos
        setTimeout(() => {
            if (elementoTeste.parentNode) {
                elementoTeste.remove();
            }
        }, 15000);
    };
    
    // BUSCAR PRIMEIRO LOTE DISPONÍVEL
    window.testarPrimeiroLote = function() {
        console.log('🔥 BUSCANDO PRIMEIRO LOTE DISPONÍVEL...');
        
        if (window.ingressosDoBanco && window.ingressosDoBanco.length > 0) {
            const primeiroIngresso = window.ingressosDoBanco[0];
            console.log('🔥 PRIMEIRO INGRESSO:', primeiroIngresso);
            window.testeDirectoLote(primeiroIngresso.lote_id);
        } else {
            console.log('🔥 NENHUM INGRESSO ENCONTRADO - TESTANDO COM LOTE 48');
            window.testeDirectoLote(48);
        }
    };
    
    console.log('🔥 COMANDOS DISPONÍVEIS:');
    console.log('  testeDirectoLote(loteId) - Testa um lote específico');
    console.log('  testarPrimeiroLote() - Testa o primeiro lote disponível');
    
})();
