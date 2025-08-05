/**
 * DEBUG INTERCEPTADOR - RASTREAR RECARREGAMENTO
 * Identifica exatamente qual função está causando a recarga do rascunho
 */

console.log('🕵️ DEBUG INTERCEPTADOR ATIVO - Rastreando recarregamentos...');

// Lista de funções suspeitas que podem causar recarregamento
const funcoesSuspeitas = [
    'restoreWizardData',
    'retomarEvento', 
    'carregarDadosEvento',
    'preencherDadosEvento',
    'recarregarIngressosDoMySQL',
    'updatePreview',
    'saveWizardData',
    'carregarLotesDoBanco',
    'renderizarLotesNaInterface',
    'carregarRascunho'
];

// Interceptar funções globais
funcoesSuspeitas.forEach(nomeFuncao => {
    if (window[nomeFuncao] && typeof window[nomeFuncao] === 'function') {
        const funcaoOriginal = window[nomeFuncao];
        
        window[nomeFuncao] = function(...args) {
            // Capturar stack trace para ver quem chamou
            const stack = new Error().stack;
            
            console.log(`🚨 INTERCEPTADO: ${nomeFuncao}() foi chamada!`);
            console.log(`📍 Stack trace:`, stack);
            console.log(`📦 Argumentos:`, args);
            
            // Se exclusão em andamento, BLOQUEAR
            if (window.exclusaoEmAndamento) {
                console.log(`🚫 BLOQUEADO: ${nomeFuncao}() durante exclusão de lote`);
                return Promise.resolve();
            }
            
            return funcaoOriginal.apply(this, args);
        };
        
        console.log(`✅ Interceptador instalado para: ${nomeFuncao}`);
    }
});

// Interceptar fetch para APIs suspeitas
const fetchOriginal = window.fetch;
window.fetch = function(url, options) {
    if (window.exclusaoEmAndamento && url.includes('wizard_evento.php')) {
        const body = options?.body;
        if (body && !body.includes('excluir_lote')) {
            console.log(`🚫 FETCH BLOQUEADO durante exclusão: ${url}`);
            console.log(`📦 Body:`, body);
            console.log(`📍 Stack:`, new Error().stack);
            return Promise.resolve(new Response('{"sucesso": true}'));
        }
    }
    
    // Log todas as chamadas de API durante exclusão
    if (window.exclusaoEmAndamento) {
        console.log(`📡 FETCH durante exclusão: ${url}`, options?.body);
    }
    
    return fetchOriginal.apply(this, arguments);
};

// Interceptar eventos DOM que podem disparar recarregamento
document.addEventListener('DOMContentLoaded', function() {
    // Interceptar mudanças no DOM que podem estar causando recarregamento
    const observer = new MutationObserver(function(mutations) {
        if (window.exclusaoEmAndamento) {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach(node => {
                        if (node.classList && node.classList.contains('lote-item')) {
                            console.log(`🗑️ Lote removido do DOM:`, node);
                        }
                    });
                }
            });
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

console.log('🔍 Debug interceptador instalado - aguardando exclusão de lote...');
