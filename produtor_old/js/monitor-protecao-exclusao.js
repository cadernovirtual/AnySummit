/**
 * Monitor de Proteção - Garante que a função excluirLote não seja sobrescrita
 */

(function() {
    console.log('🛡️ Monitor de Proteção de Exclusão iniciado...');
    
    let funcaoCorreta = null;
    let monitorAtivo = false;
    
    // Função para proteger
    function protegerFuncao() {
        if (!funcaoCorreta && window.excluirLote && window.excluirLote.toString().includes('CORREÇÃO PROMISE')) {
            funcaoCorreta = window.excluirLote;
            console.log('✅ Função correta capturada!');
            
            // Definir getter/setter para detectar mudanças
            Object.defineProperty(window, 'excluirLote', {
                get: function() {
                    return funcaoCorreta;
                },
                set: function(novaFuncao) {
                    console.warn('⚠️ Tentativa de sobrescrever excluirLote bloqueada!');
                    console.log('Tentativa de definir:', novaFuncao.toString().substring(0, 100) + '...');
                    // Não permitir a mudança
                    return funcaoCorreta;
                },
                configurable: false
            });
            
            console.log('🛡️ Proteção ativada para excluirLote');
            monitorAtivo = true;
        }
        
        // Continuar monitorando se ainda não encontrou
        if (!monitorAtivo) {
            setTimeout(protegerFuncao, 100);
        }
    }
    
    // Iniciar proteção
    setTimeout(protegerFuncao, 2000); // Aguardar 2 segundos para a função correta ser definida
    
})();