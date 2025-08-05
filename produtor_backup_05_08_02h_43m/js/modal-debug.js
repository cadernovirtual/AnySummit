/**
 * Debug e correção para modais de lotes
 */

// Função para verificar se todos os elementos necessários existem
window.verificarElementosModais = function() {
    const elementos = [
        // Modais principais
        'loteDataModal',
        'lotePercentualModal',
        'editLoteDataModal',
        'editLotePercentualModal',
        
        // Campos do modal de criar por data
        'loteDataNome',
        'loteDataInicio',
        'loteDataFim',
        'loteDataDivulgar',
        
        // Campos do modal de criar por percentual
        'lotePercentualNome',
        'lotePercentualValor',
        'lotePercentualDivulgar',
        
        // Campos do modal de editar por data
        'editLoteDataId',
        'editLoteDataNome',
        'editLoteDataInicio',
        'editLoteDataFim',
        'editLoteDataDivulgar',
        
        // Campos do modal de editar por percentual
        'editLotePercentualId',
        'editLotePercentualNome',
        'editLotePercentualValor',
        'editLotePercentualDivulgar'
    ];
    
    console.log('=== Verificando elementos dos modais ===');
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`${id}: ${elemento ? 'OK' : 'NÃO ENCONTRADO'}`);
    });
    console.log('=== Fim da verificação ===');
};

// Executar verificação quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.verificarElementosModais();
        
        // Se algum elemento não foi encontrado, tentar buscar com diferentes métodos
        const elementosTeste = ['editLotePercentualNome', 'editLotePercentualValor'];
        elementosTeste.forEach(id => {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.log(`Tentando buscar ${id} de outras formas...`);
                const porName = document.querySelector(`[name="${id}"]`);
                const porClasse = document.querySelector(`.${id}`);
                console.log(`Por name: ${!!porName}, Por classe: ${!!porClasse}`);
            }
        });
    }, 2000);
});

// Tornar as funções de editar e excluir globais
window.editarLoteData = editarLoteData;
window.editarLotePercentual = editarLotePercentual;
window.excluirLoteData = excluirLoteData;
window.excluirLotePercentual = excluirLotePercentual;

console.log('Debug de modais carregado');