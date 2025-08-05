/**
 * CORREÇÃO DEFINITIVA: Interceptadores de Fetch Conflitantes
 * 
 * Problema: Múltiplos arquivos estão fazendo override do window.fetch,
 * causando conflitos na exclusão de lotes e ingressos.
 * 
 * Solução: Interceptador unificado que permite exclusões
 */

console.log('🔧 [FETCH UNIFICADO] Corrigindo interceptadores conflitantes...');

(function() {
    // Salvar o fetch original se ainda não foi salvo
    if (!window.originalFetchBackup) {
        window.originalFetchBackup = window.fetch;
        console.log('💾 [FETCH UNIFICADO] Backup do fetch original criado');
    }
    
    // Criar interceptador unificado
    window.fetch = function(url, options = {}) {
        const method = options.method || 'GET';
        
        // Log básico para debug
        if (method === 'POST') {
            console.log('🌐 [FETCH UNIFICADO] Requisição POST interceptada:', url);
        }
        
        // Se é POST para wizard_evento.php, analisar a ação
        if (method === 'POST' && url.includes('wizard_evento.php') && options.body instanceof FormData) {
            const action = options.body.get('action');
            console.log('🎯 [FETCH UNIFICADO] Action detectada:', action);
            
            // PERMITIR EXCLUSÕES SEM INTERFERÊNCIA
            if (action && (
                action.includes('excluir') || 
                action.includes('delete') || 
                action.includes('remover') ||
                action === 'excluir_lote' ||
                action === 'excluir_ingresso'
            )) {
                console.log('✅ [FETCH UNIFICADO] Exclusão permitida, não modificando requisição');
                return window.originalFetchBackup.apply(this, arguments);
            }
            
            // Para outras ações, aplicar correções apenas se necessário
            if (action && (
                action.includes('salvar') || 
                action.includes('criar') || 
                action.includes('update') ||
                action.includes('save')
            )) {
                const quantidade = options.body.get('quantidade_total') || options.body.get('quantity');
                
                // Só modificar se quantidade está realmente vazia/inválida
                if (quantidade === '' || quantidade === null || quantidade === undefined) {
                    options.body.set('quantidade_total', '0');
                    console.log('🔄 [FETCH UNIFICADO] Quantidade vazia corrigida para 0');
                }
            }
        }
        
        // Executar requisição
        return window.originalFetchBackup.apply(this, arguments);
    };
    
    console.log('✅ [FETCH UNIFICADO] Interceptador unificado ativo');
})();

/**
 * Função para debug do estado do fetch
 */
window.debugFetchState = function() {
    console.log('🔍 [DEBUG FETCH] Estado atual:');
    console.log('- originalFetchBackup existe:', !!window.originalFetchBackup);
    console.log('- fetch atual é nativo:', window.fetch === window.originalFetchBackup);
    console.log('- fetch foi modificado:', window.fetch !== window.originalFetchBackup);
};

/**
 * Função para forçar exclusão em caso de problema
 */
window.forcarExclusaoLote = function(loteId) {
    console.log('🚨 [FORÇA EXCLUSÃO] Forçando exclusão do lote:', loteId);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    if (!eventoId) {
        alert('Erro: ID do evento não encontrado');
        return;
    }
    
    if (!confirm('Forçar exclusão do lote? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'excluir_lote');
    formData.append('lote_id', loteId);
    formData.append('evento_id', eventoId);
    
    // Usar o fetch original diretamente
    window.originalFetchBackup('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('🚨 [FORÇA EXCLUSÃO] Resultado:', data);
        if (data.sucesso) {
            alert('Lote excluído com sucesso!');
            location.reload();
        } else {
            alert('Erro ao excluir: ' + (data.erro || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('🚨 [FORÇA EXCLUSÃO] Erro:', error);
        alert('Erro na requisição de exclusão');
    });
};

console.log('🔧 [FETCH UNIFICADO] Sistema de correção carregado');