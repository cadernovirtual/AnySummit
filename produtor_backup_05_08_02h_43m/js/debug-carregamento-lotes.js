/**
 * DEBUG - Diagnóstico de Carregamento de Lotes
 * 
 * Para investigar problemas de cache e carregamento após limpeza
 */

console.log('🔧 [DEBUG LOTES] Carregando diagnóstico...');

/**
 * Função para diagnosticar estado dos lotes
 */
window.diagnosticarLotes = function() {
    console.log('🔍 [DIAGNÓSTICO] Estado atual dos lotes:');
    console.log('---');
    
    // 1. Verificar cache
    console.log('📋 [CACHE] Estado do cache:');
    if (window.lotesCache) {
        console.log('- Cache existe:', !!window.lotesCache);
        console.log('- Cache data:', window.lotesCache.data);
        console.log('- Cache timestamp:', new Date(window.lotesCache.timestamp));
        console.log('- Cache TTL:', window.lotesCache.ttl, 'ms');
        
        const agora = Date.now();
        const isValid = window.lotesCache.data && (agora - window.lotesCache.timestamp) < window.lotesCache.ttl;
        console.log('- Cache válido:', isValid);
    } else {
        console.log('- Cache NÃO EXISTE');
    }
    
    // 2. Verificar evento ID
    console.log('---');
    console.log('🆔 [EVENTO] ID do evento:');
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    console.log('- URL evento_id:', eventoId);
    
    if (typeof obterEventoId === 'function') {
        try {
            const idFuncao = obterEventoId();
            console.log('- Função obterEventoId():', idFuncao);
        } catch (e) {
            console.log('- Erro em obterEventoId():', e.message);
        }
    } else {
        console.log('- Função obterEventoId NÃO EXISTE');
    }
    
    // 3. Verificar funções disponíveis
    console.log('---');
    console.log('🔧 [FUNÇÕES] Disponibilidade:');
    console.log('- carregarLotesDoBanco:', typeof window.carregarLotesDoBanco);
    console.log('- renderizarLotesUnificado:', typeof window.renderizarLotesUnificado);
    console.log('- fazerRequisicaoAPI:', typeof window.fazerRequisicaoAPI);
    
    // 4. Verificar lotes temporários
    console.log('---');
    console.log('🏃 [TEMPORÁRIOS] Lotes temporários:');
    if (window.lotesTemporarios) {
        console.log('- Existem:', !!window.lotesTemporarios);
        console.log('- Por data:', window.lotesTemporarios.porData?.length || 0);
        console.log('- Por quantidade:', window.lotesTemporarios.porQuantidade?.length || 0);
    } else {
        console.log('- NÃO EXISTEM lotes temporários');
    }
    
    console.log('---');
    console.log('✅ [DIAGNÓSTICO] Completo!');
};

/**
 * Função para forçar carregamento de lotes
 */
window.forcarCarregamentoLotes = async function() {
    console.log('🚀 [FORÇA] Forçando carregamento de lotes...');
    
    try {
        // 1. Limpar cache
        if (window.lotesCache) {
            window.lotesCache.data = null;
            window.lotesCache.timestamp = 0;
            console.log('🗑️ Cache limpo');
        }
        
        // 2. Tentar carregar
        if (typeof window.carregarLotesDoBanco === 'function') {
            console.log('📡 Carregando do banco...');
            const lotes = await window.carregarLotesDoBanco();
            console.log('📦 Lotes carregados:', lotes.length);
            console.log('📋 Lotes:', lotes);
            
            // 3. Tentar renderizar
            if (typeof window.renderizarLotesUnificado === 'function') {
                console.log('🎨 Renderizando interface...');
                await window.renderizarLotesUnificado(lotes);
                console.log('✅ Interface renderizada');
            } else {
                console.warn('⚠️ renderizarLotesUnificado não disponível');
            }
            
        } else {
            console.error('❌ carregarLotesDoBanco não disponível');
        }
        
    } catch (error) {
        console.error('💥 Erro no carregamento forçado:', error);
    }
};

/**
 * Função para testar API diretamente
 */
window.testarAPILotes = async function() {
    console.log('🧪 [TESTE API] Testando comunicação com backend...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    console.log('🆔 Evento ID:', eventoId);
    
    if (!eventoId) {
        console.warn('⚠️ Nenhum evento_id na URL - modo criação');
        return;
    }
    
    try {
        // Testar requisição simples
        const formData = new FormData();
        formData.append('action', 'recuperar_evento_simples');
        formData.append('evento_id', eventoId);
        
        console.log('📡 Fazendo requisição para recuperar_evento_simples...');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        const textResponse = await response.text();
        console.log('📋 Resposta bruta:', textResponse);
        
        try {
            const jsonData = JSON.parse(textResponse);
            console.log('📊 Dados JSON:', jsonData);
            
            if (jsonData.evento && jsonData.evento.lotes) {
                console.log('📦 Lotes encontrados:', jsonData.evento.lotes.length);
                console.log('📋 Lista dos lotes:', jsonData.evento.lotes);
            } else {
                console.warn('⚠️ Nenhum lote encontrado na resposta');
            }
            
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
        }
        
    } catch (error) {
        console.error('💥 Erro na requisição:', error);
    }
};

console.log('✅ [DEBUG LOTES] Funções carregadas:');
console.log('- window.diagnosticarLotes()');
console.log('- window.forcarCarregamentoLotes()');
console.log('- window.testarAPILotes()');
