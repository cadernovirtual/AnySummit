/**
 * RESTAURAR FETCH ORIGINAL PARA RASCUNHOS E OUTRAS FUNCIONALIDADES
 * 
 * Este script garante que o fetch original seja restaurado para que
 * outras funcionalidades como rascunhos funcionem normalmente.
 */

console.log('🔄 Restaurando fetch original para outras funcionalidades...');

// Se fetch foi modificado, restaurar versão original
if (window.fetch && window.fetch.toString().includes('wizard_evento')) {
    console.log('⚠️ Fetch foi interceptado, restaurando original...');
    
    // Tentar restaurar fetch original
    if (window.fetchOriginal) {
        window.fetch = window.fetchOriginal;
        console.log('✅ Fetch original restaurado');
    } else {
        // Se não temos o original, usar fetch nativo
        delete window.fetch;
        console.log('✅ Fetch resetado para nativo');
    }
}

// Verificar se fetch está funcionando normalmente
setTimeout(() => {
    console.log('🧪 Testando fetch restaurado...');
    
    if (typeof window.fetch === 'function') {
        const fetchCode = window.fetch.toString();
        const temInterceptacao = fetchCode.includes('wizard_evento') || fetchCode.includes('interceptando');
        
        if (temInterceptacao) {
            console.log('⚠️ Fetch ainda tem interceptação');
        } else {
            console.log('✅ Fetch está limpo e funcionando normalmente');
        }
    }
}, 1000);

console.log('✅ Restauração do fetch concluída!');