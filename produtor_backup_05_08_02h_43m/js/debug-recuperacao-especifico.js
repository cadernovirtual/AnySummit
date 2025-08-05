/**
 * DEBUG ESPECÍFICO PARA RECUPERAÇÃO DE LOTES
 */

console.log('🔍 DEBUG-RECUPERACAO-ESPECIFICO.JS CARREGANDO...');

// Interceptar a função restaurarLotes original
const originalRestaurarLotes = window.restaurarLotes;

window.restaurarLotes = function(lotes) {
    console.log('🎯 [INTERCEPTADO] restaurarLotes chamada com:', lotes);
    console.log('🎯 [INTERCEPTADO] Tipo:', typeof lotes);
    console.log('🎯 [INTERCEPTADO] É array:', Array.isArray(lotes));
    console.log('🎯 [INTERCEPTADO] Quantidade:', lotes ? lotes.length : 'undefined');
    
    if (lotes && lotes.length > 0) {
        console.log('🎯 [INTERCEPTADO] Primeiro lote:', lotes[0]);
    }
    
    // Chamar a função original ou unificada
    if (typeof window.restaurarLotesUnificado === 'function') {
        console.log('🎯 [INTERCEPTADO] Redirecionando para restaurarLotesUnificado');
        return window.restaurarLotesUnificado(lotes);
    } else if (originalRestaurarLotes) {
        console.log('🎯 [INTERCEPTADO] Chamando função original');
        return originalRestaurarLotes(lotes);
    } else {
        console.error('🎯 [INTERCEPTADO] Nenhuma função de restauração disponível!');
    }
};

// Teste manual para forçar renderização
window.testarRenderizacaoManual = function() {
    console.log('🧪 Testando renderização manual...');
    
    const lotesTeste = [
        {
            id: 201,
            evento_id: 49,
            nome: "Lote 1",
            data_inicio: "2025-08-02 13:51:00",
            data_fim: "2025-08-09 13:51:00",
            tipo: "data",
            divulgar_criterio: 1,
            percentual_aumento_valor: 0
        }
    ];
    
    console.log('🧪 Testando com lotes:', lotesTeste);
    
    if (typeof window.renderizarLotesUnificado === 'function') {
        window.renderizarLotesUnificado(lotesTeste);
    } else {
        console.error('❌ Função renderizarLotesUnificado não encontrada');
    }
};

// Verificar se os containers existem
function verificarContainers() {
    console.log('🔍 Verificando containers DOM...');
    
    const containers = [
        'lotesPorDataList',
        'lotesPorPercentualList',
        'loteDataEmpty',
        'lotePercentualEmpty'
    ];
    
    containers.forEach(containerId => {
        const element = document.getElementById(containerId);
        console.log(`🔍 ${containerId}:`, !!element, element ? 'encontrado' : 'NÃO ENCONTRADO');
        
        if (element) {
            console.log(`  📐 ${containerId} - children:`, element.children.length);
            console.log(`  👁️ ${containerId} - display:`, getComputedStyle(element).display);
        }
    });
    
    // Listar todos os elementos com 'lote' no ID
    const loteElements = Array.from(document.querySelectorAll('[id*="lote"]'));
    console.log('🔍 Todos os elementos com "lote" no ID:', loteElements.map(el => el.id));
}

// Executar verificações ao carregar
setTimeout(() => {
    verificarContainers();
    
    // Se estivermos na etapa 5, adicionar botão de teste
    const etapaAtual = window.currentStep || 1;
    if (etapaAtual === 5) {
        const container = document.querySelector('.lotes-container') || document.body;
        
        if (!document.getElementById('btnTesteManual')) {
            const btnTeste = document.createElement('button');
            btnTeste.id = 'btnTesteManual';
            btnTeste.innerHTML = '🧪 Teste Manual Renderização';
            btnTeste.className = 'btn btn-outline btn-small';
            btnTeste.style.margin = '10px';
            btnTeste.onclick = window.testarRenderizacaoManual;
            container.appendChild(btnTeste);
        }
    }
}, 2000);

console.log('✅ DEBUG-RECUPERACAO-ESPECIFICO.JS CARREGADO!');
console.log('🔧 Funções disponíveis:');
console.log('  - testarRenderizacaoManual()');
console.log('  - verificarContainers() já executada');
