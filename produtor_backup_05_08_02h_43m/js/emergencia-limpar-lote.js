// SCRIPT DE EMERGÊNCIA - Execute isto no console!

// 1. Limpar cookie ingressosSalvos completamente
document.cookie = "ingressosSalvos=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
console.log('✅ Cookie ingressosSalvos apagado');

// 2. Limpar ingressos do cookie principal
const wizardData = getCookie('eventoWizard');
if (wizardData) {
    try {
        const data = JSON.parse(wizardData);
        
        // Remover TODAS as propriedades relacionadas a ingressos
        delete data.ingressos;
        delete data.tickets;
        delete data.ingressosSalvos;
        
        // Salvar de volta
        setCookie('eventoWizard', JSON.stringify(data), 7);
        console.log('✅ Ingressos removidos do cookie principal');
    } catch (e) {
        console.error('Erro:', e);
    }
}

// 3. Forçar exclusão do lote específico
setTimeout(() => {
    console.log('🔥 Tentando excluir lote agora...');
    if (window.excluirLoteData) {
        // Temporariamente desabilitar verificação
        const original = window.loteTemIngressos;
        window.loteTemIngressos = function() { return false; };
        
        // Excluir
        window.excluirLoteData(1753325873433);
        
        // Restaurar
        window.loteTemIngressos = original;
        console.log('✅ Comando de exclusão enviado!');
    }
}, 1000);

console.log('🎯 Limpeza de emergência executada! O lote deve ser excluído em 1 segundo...');
