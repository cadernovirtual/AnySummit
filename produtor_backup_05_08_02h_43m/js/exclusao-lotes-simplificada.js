/**
 * CORREÇÃO DEFINITIVA: Função de Exclusão de Lotes Simplificada
 * 
 * Baseada na versão que estava funcionando no GitHub
 * Implementação direta sem verificações complexas que estão travando o sistema
 */

console.log('🔧 [EXCLUSÃO LOTES] Carregando função simplificada...');

/**
 * Função unificada para exclusão de lotes - VERSÃO SIMPLIFICADA
 */
window.excluirLoteUnificado = function(loteId, tipo) {
    console.log('🗑️ [SIMPLIFICADO] Excluindo lote:', loteId, tipo);
    
    // Confirmação simples
    if (!confirm('Tem certeza que deseja excluir este lote?')) {
        console.log('❌ Exclusão cancelada pelo usuário');
        return;
    }
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    if (!eventoId) {
        alert('Erro: ID do evento não encontrado');
        return;
    }
    
    console.log('🚀 Executando exclusão direta...');
    
    // Usar FormData para ser consistente com outras operações
    const formData = new FormData();
    formData.append('action', 'excluir_lote');
    formData.append('lote_id', loteId);
    formData.append('evento_id', eventoId);
    
    // Requisição direta sem interceptadores complexos
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('📡 Resposta recebida:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📊 Dados da resposta:', data);
        
        if (data.sucesso) {
            console.log('✅ Lote excluído com sucesso');
            alert('Lote excluído com sucesso!');
            
            // Remover elemento da DOM
            const elemento = document.querySelector(`[data-lote-id="${loteId}"]`);
            if (elemento) {
                elemento.remove();
                console.log('🗑️ Elemento removido da DOM');
            }
            
            // Atualizar listas
            if (typeof atualizarListaLotes === 'function') {
                atualizarListaLotes();
            }
            
            // Recarregar página como último recurso
            setTimeout(() => {
                console.log('🔄 Recarregando página para garantir atualização...');
                location.reload();
            }, 1000);
            
        } else {
            console.error('❌ Erro na exclusão:', data);
            alert('Erro ao excluir lote: ' + (data.erro || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('💥 Erro na requisição:', error);
        alert('Erro de comunicação com o servidor');
    });
};

/**
 * Função de força bruta para casos extremos
 */
window.forcarExclusaoLoteSimples = function(loteId) {
    console.log('🚨 [FORÇA BRUTA] Forçando exclusão:', loteId);
    
    if (!confirm('FORÇAR exclusão do lote? Use apenas se o método normal não funcionar.')) {
        return;
    }
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    // Usar o fetch original se existir
    const fetchToUse = window.originalFetchBackup || window.fetch;
    
    fetchToUse('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=excluir_lote&lote_id=${loteId}&evento_id=${eventoId}`
    })
    .then(response => response.json())
    .then(data => {
        console.log('🚨 [FORÇA BRUTA] Resultado:', data);
        if (data.sucesso) {
            alert('Lote excluído com sucesso!');
            location.reload();
        } else {
            alert('Erro: ' + (data.erro || 'Falha na exclusão'));
        }
    })
    .catch(error => {
        console.error('🚨 [FORÇA BRUTA] Erro:', error);
        alert('Erro na comunicação');
    });
};

/**
 * Override das funções específicas por tipo (para compatibilidade)
 */
window.excluirLoteData = function(loteId) {
    console.log('🗑️ [COMPATIBILIDADE] excluirLoteData chamada:', loteId);
    return window.excluirLoteUnificado(loteId, 'data');
};

window.excluirLotePercentual = function(loteId) {
    console.log('🗑️ [COMPATIBILIDADE] excluirLotePercentual chamada:', loteId);
    return window.excluirLoteUnificado(loteId, 'percentual');
};

window.excluirLoteQuantidade = function(loteId) {
    console.log('🗑️ [COMPATIBILIDADE] excluirLoteQuantidade chamada:', loteId);
    return window.excluirLoteUnificado(loteId, 'quantidade');
};

console.log('✅ [EXCLUSÃO LOTES] Função simplificada carregada');
console.log('🔧 Disponível: excluirLoteUnificado(), forcarExclusaoLoteSimples()');
