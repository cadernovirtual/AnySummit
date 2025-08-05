/**
 * Debug completo para identificar problema dos modais
 */

// Função para listar todos os elementos com ID na página
window.listarTodosIDs = function() {
    const todosElementos = document.querySelectorAll('[id]');
    const ids = Array.from(todosElementos).map(el => el.id);
    console.log('=== TODOS OS IDs NA PÁGINA ===');
    console.log('Total de elementos com ID:', ids.length);
    
    // Filtrar apenas os relacionados a lotes
    const idsLotes = ids.filter(id => 
        id.includes('lote') || 
        id.includes('Lote') || 
        id.includes('Modal') ||
        id.includes('Percentual') ||
        id.includes('Data')
    );
    
    console.log('\n=== IDs RELACIONADOS A LOTES ===');
    idsLotes.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id} - Tag: ${el.tagName} - Classes: ${el.className}`);
    });
    
    // Procurar especificamente pelos modais esperados
    console.log('\n=== BUSCA ESPECÍFICA DOS MODAIS ===');
    const modaisEsperados = [
        'loteDataModal',
        'lotePercentualModal', 
        'editLoteDataModal',
        'editLotePercentualModal'
    ];
    
    modaisEsperados.forEach(modalId => {
        // Tentar diferentes formas de buscar
        const porId = document.getElementById(modalId);
        const porClasse = document.querySelector(`.${modalId}`);
        const porAtributo = document.querySelector(`[data-modal="${modalId}"]`);
        const textoNoHTML = document.body.innerHTML.includes(modalId);
        
        console.log(`\n${modalId}:`);
        console.log(`  Por ID: ${!!porId}`);
        console.log(`  Por classe: ${!!porClasse}`);
        console.log(`  Por atributo: ${!!porAtributo}`);
        console.log(`  Texto existe no HTML: ${textoNoHTML}`);
        
        if (porId) {
            console.log(`  Elemento encontrado: ${porId.tagName}.${porId.className}`);
            console.log(`  Pai: ${porId.parentElement?.tagName}.${porId.parentElement?.className}`);
        }
    });
    
    // Verificar se os modais estão dentro de algum iframe ou shadow DOM
    console.log('\n=== VERIFICANDO IFRAMES ===');
    const iframes = document.querySelectorAll('iframe');
    console.log('Número de iframes:', iframes.length);
    
    // Verificar se está no step correto
    console.log('\n=== STEP ATUAL ===');
    const stepAtivo = document.querySelector('[data-step-content].active');
    console.log('Step ativo:', stepAtivo?.getAttribute('data-step-content'));
};

// Executar automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO DEBUG DOS MODAIS ===');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        window.listarTodosIDs();
        
        // Tentar buscar os modais de forma mais ampla
        console.log('\n=== BUSCA AMPLA POR MODAIS ===');
        const todosModais = document.querySelectorAll('.modal-overlay, .modal, [class*="modal"]');
        console.log('Total de elementos com "modal" na classe:', todosModais.length);
        
        todosModais.forEach((modal, index) => {
            console.log(`Modal ${index}: ID="${modal.id}" Class="${modal.className}"`);
        });
        
        // Verificar se os modais estão sendo carregados dinamicamente
        console.log('\n=== VERIFICANDO CARREGAMENTO DINÂMICO ===');
        const scripts = document.querySelectorAll('script');
        let temAjax = false;
        scripts.forEach(script => {
            if (script.src.includes('ajax') || script.innerHTML.includes('ajax')) {
                temAjax = true;
            }
        });
        console.log('Scripts que podem carregar conteúdo dinamicamente:', temAjax);
        
    }, 3000); // Esperar 3 segundos
});

console.log('Debug completo de modais carregado. Aguarde 3 segundos para ver o relatório completo.');