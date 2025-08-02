// Correção para exclusão de lotes por data no MySQL
(function() {
    console.log('🔧 Aplicando correção para exclusão de lotes por data...');
    
    // Sobrescrever a função excluirLoteData
    window.excluirLoteData = function(id) {
        console.log('🗑️ [MYSQL] excluirLoteData chamada com ID:', id);
        console.trace('📍 Stack trace de excluirLoteData:');
        
        // Verificar se há ingressos associados a este lote
        const lote = window.lotesData?.porData?.find(l => l.id === id);
        if (lote && typeof window.verificarIngressosNoLote === 'function' && window.verificarIngressosNoLote(lote.id)) {
            console.log('⚠️ Lote tem ingressos associados - cancelando exclusão');
            alert('Não é possível excluir este lote pois existem ingressos associados a ele. Exclua os ingressos primeiro.');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir este lote?')) {
            console.log('✅ Usuário confirmou exclusão - prosseguindo...');
            
            // CORREÇÃO: Excluir do MySQL também
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            console.log('📡 Enviando requisição para excluir lote:', { eventoId, loteId: id });
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=excluir_lote&evento_id=${eventoId}&lote_id=${id}`
            })
            .then(response => {
                console.log('📡 Resposta recebida:', response.status, response.statusText);
                return response.json();
            })
            .then(data => {
                console.log('📦 Dados da resposta:', data);
                
                if (data.sucesso) {
                    console.log('✅ Lote excluído do MySQL com sucesso');
                    
                    // Remover do array local se existir
                    if (window.lotesData?.porData) {
                        const tamanhoAntes = window.lotesData.porData.length;
                        window.lotesData.porData = window.lotesData.porData.filter(l => l.id != id);
                        const tamanhoDepois = window.lotesData.porData.length;
                        console.log(`📊 Array local atualizado: ${tamanhoAntes} → ${tamanhoDepois} lotes`);
                        
                        // Renomear se função existir
                        if (typeof window.renomearLotesAutomaticamente === 'function') {
                            console.log('🔄 Renomeando lotes...');
                            window.renomearLotesAutomaticamente();
                        }
                        
                        // Salvar no cookie se função existir
                        if (typeof window.salvarLotesNoCookie === 'function') {
                            console.log('💾 Salvando no cookie...');
                            window.salvarLotesNoCookie();
                        }
                    }
                    
                    // CORREÇÃO: Remover elemento específico do DOM SEM renderizar tudo
                    const loteElement = document.querySelector(`[data-id="${id}"]`);
                    if (loteElement) {
                        loteElement.remove();
                        console.log('✅ Elemento do lote removido da interface');
                    } else {
                        console.warn('⚠️ Elemento do lote não encontrado no DOM:', `[data-id="${id}"]`);
                    }
                    
                    alert('Lote excluído com sucesso!');
                } else {
                    console.error('❌ Erro ao excluir lote do MySQL:', data.erro);
                    alert('Erro ao excluir lote: ' + (data.erro || 'Erro desconhecido'));
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição:', error);
                alert('Erro ao excluir lote. Tente novamente.');
            });
        } else {
            console.log('❌ Usuário cancelou a exclusão');
        }
    };
    
    console.log('✅ Função excluirLoteData corrigida para usar MySQL');
})();
