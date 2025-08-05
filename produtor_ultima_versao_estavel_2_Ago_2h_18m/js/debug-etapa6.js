/**
 * DEBUG PARA ETAPA 6 - INGRESSOS
 * Monitora o salvamento dos ingressos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Debug da Etapa 6 carregado');
    
    // Interceptar requisições AJAX para monitorar
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options] = args;
        
        if (url.includes('wizard_evento.php') && options?.body) {
            console.log('📡 Interceptando requisição para wizard_evento.php');
            
            // Se é FormData, tentar extrair dados
            if (options.body instanceof FormData) {
                const formDataEntries = {};
                for (let [key, value] of options.body.entries()) {
                    formDataEntries[key] = value;
                }
                
                if (formDataEntries.action === 'salvar_etapa' && formDataEntries.etapa === '6') {
                    console.log('🎯 SALVAMENTO ETAPA 6 DETECTADO:');
                    console.log('📊 Dados completos:', formDataEntries);
                    
                    // Tentar parsear JSON dos ingressos
                    if (formDataEntries.ingressos) {
                        try {
                            const ingressos = JSON.parse(formDataEntries.ingressos);
                            console.log('🎫 Ingressos parseados:', ingressos);
                            
                            ingressos.forEach((ingresso, index) => {
                                console.log(`📋 Ingresso ${index + 1}:`, {
                                    tipo: ingresso.tipo,
                                    titulo: ingresso.titulo,
                                    quantidade: ingresso.quantidade,
                                    preco: ingresso.preco,
                                    lote_nome: ingresso.lote_nome || 'VAZIO'
                                });
                            });
                        } catch (e) {
                            console.error('❌ Erro ao parsear ingressos:', e);
                        }
                    }
                }
            }
        }
        
        return originalFetch.apply(this, args)
            .then(response => {
                // Interceptar resposta também
                if (url.includes('wizard_evento.php')) {
                    response.clone().json().then(data => {
                        if (data.erro) {
                            console.error('❌ ERRO NA RESPOSTA:', data.erro);
                        } else if (data.sucesso) {
                            console.log('✅ SUCESSO NA RESPOSTA:', data.mensagem);
                        }
                    }).catch(() => {
                        // Resposta não é JSON válido - já foi consumida, não usar clone
                        console.log('⚠️ Resposta não é JSON válido');
                    });
                }
                
                return response;
            });
    };
    
    // Função para testar salvamento manual
    window.testarSalvamentoEtapa6 = function() {
        console.log('🧪 Testando salvamento da etapa 6...');
        
        const ingressoTeste = [{
            tipo: "paid",
            titulo: "Teste Debug",
            descricao: "Ingresso de teste",
            quantidade: 100,
            preco: 50.00,
            taxa_plataforma: 4.00,
            valor_receber: 50.00,
            limite_min: 1,
            limite_max: 3,
            lote_nome: ""
        }];
        
        const formData = new FormData();
        formData.append('action', 'salvar_etapa');
        formData.append('evento_id', new URLSearchParams(window.location.search).get('evento_id') || '49');
        formData.append('etapa', '6');
        formData.append('ingressos', JSON.stringify(ingressoTeste));
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('🎯 Resposta do teste:', data);
        })
        .catch(error => {
            console.error('❌ Erro no teste:', error);
        });
    };
    
    console.log('✅ Debug da Etapa 6 ativo. Use testarSalvamentoEtapa6() para testar.');
});
