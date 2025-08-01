/**
 * Debug específico para modais de edição
 */

// Verificar se os modais de edição existem no DOM
window.verificarModaisEdicao = function() {
    console.log('=== VERIFICANDO MODAIS DE EDIÇÃO ===');
    
    // Modais de edição
    const modaisEdicao = ['editLoteDataModal', 'editLotePercentualModal'];
    
    modaisEdicao.forEach(modalId => {
        const modal = document.getElementById(modalId);
        console.log(`${modalId}: ${modal ? 'EXISTE' : 'NÃO EXISTE'}`);
        
        if (modal) {
            console.log(`  - Display atual: ${window.getComputedStyle(modal).display}`);
            console.log(`  - Classes: ${modal.className}`);
            console.log(`  - Parent: ${modal.parentElement?.tagName}`);
            
            // Verificar campos dentro do modal
            if (modalId === 'editLoteDataModal') {
                const campos = ['editLoteDataId', 'editLoteDataNome', 'editLoteDataInicio', 'editLoteDataFim'];
                campos.forEach(campoId => {
                    const campo = document.getElementById(campoId);
                    console.log(`    Campo ${campoId}: ${campo ? 'OK' : 'NÃO ENCONTRADO'}`);
                });
            } else if (modalId === 'editLotePercentualModal') {
                const campos = ['editLotePercentualId', 'editLotePercentualNome', 'editLotePercentualValor'];
                campos.forEach(campoId => {
                    const campo = document.getElementById(campoId);
                    console.log(`    Campo ${campoId}: ${campo ? 'OK' : 'NÃO ENCONTRADO'}`);
                });
            }
        }
    });
    
    // Verificar se estão no step correto
    const stepAtivo = document.querySelector('[data-step-content="5"]');
    console.log('\nStep 5 (Lotes) está ativo?', stepAtivo?.classList.contains('active'));
    
    // Buscar modais em toda a página
    console.log('\n=== BUSCA AMPLA POR MODAIS DE EDIÇÃO ===');
    const todosElementos = document.querySelectorAll('*');
    let encontrados = 0;
    todosElementos.forEach(el => {
        if (el.id && el.id.includes('edit') && el.id.includes('Lote')) {
            console.log(`Encontrado: ${el.id} - Tag: ${el.tagName}`);
            encontrados++;
        }
    });
    console.log(`Total de elementos com 'edit' e 'Lote' no ID: ${encontrados}`);
};

// Override melhorado das funções de editar com mais debug
window.editarLoteData = function(id) {
    console.log('=== TENTANDO EDITAR LOTE DATA ===');
    console.log('ID do lote:', id);
    
    // Verificar se os modais existem
    verificarModaisEdicao();
    
    const lote = window.lotesData?.porData.find(l => l.id === id);
    if (!lote) {
        console.error('Lote não encontrado no array lotesData.porData');
        return;
    }
    
    console.log('Lote encontrado:', lote);
    
    // Verificar modal antes de tentar abrir
    const modal = document.getElementById('editLoteDataModal');
    if (!modal) {
        console.error('Modal editLoteDataModal não existe no DOM!');
        
        // Tentar criar o modal se não existir
        console.log('Tentando buscar template do modal...');
        const template = document.querySelector('template#editLoteDataModalTemplate');
        if (template) {
            console.log('Template encontrado, clonando...');
            const clone = template.content.cloneNode(true);
            document.body.appendChild(clone);
        } else {
            console.error('Template do modal também não encontrado');
        }
        return;
    }
    
    // Preencher campos
    const campos = {
        'editLoteDataId': id,
        'editLoteDataNome': lote.nome,
        'editLoteDataInicio': lote.dataInicio,
        'editLoteDataFim': lote.dataFim
    };
    
    for (let [campoId, valor] of Object.entries(campos)) {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.value = valor;
            console.log(`Campo ${campoId} preenchido com:`, valor);
        } else {
            console.error(`Campo ${campoId} não encontrado!`);
        }
    }
    
    const checkbox = document.getElementById('editLoteDataDivulgar');
    if (checkbox) {
        checkbox.checked = lote.divulgar;
    }
    
    // Tentar abrir o modal
    console.log('Tentando abrir modal...');
    modal.classList.add('show');
    console.log('Classe "show" adicionada. Modal visível?', modal.classList.contains('show'));
};

window.editarLotePercentual = function(id) {
    console.log('=== TENTANDO EDITAR LOTE PERCENTUAL ===');
    console.log('ID do lote:', id);
    
    // Verificar se os modais existem
    verificarModaisEdicao();
    
    const lote = window.lotesData?.porPercentual.find(l => l.id === id);
    if (!lote) {
        console.error('Lote não encontrado no array lotesData.porPercentual');
        return;
    }
    
    console.log('Lote encontrado:', lote);
    
    // Verificar modal antes de tentar abrir
    const modal = document.getElementById('editLotePercentualModal');
    if (!modal) {
        console.error('Modal editLotePercentualModal não existe no DOM!');
        return;
    }
    
    // Preencher campos
    const campos = {
        'editLotePercentualId': id,
        'editLotePercentualNome': lote.nome,
        'editLotePercentualValor': lote.percentual
    };
    
    for (let [campoId, valor] of Object.entries(campos)) {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.value = valor;
            console.log(`Campo ${campoId} preenchido com:`, valor);
        } else {
            console.error(`Campo ${campoId} não encontrado!`);
        }
    }
    
    const checkbox = document.getElementById('editLotePercentualDivulgar');
    if (checkbox) {
        checkbox.checked = lote.divulgar;
    }
    
    // Tentar abrir o modal
    console.log('Tentando abrir modal...');
    modal.classList.add('show');
    console.log('Classe "show" adicionada. Modal visível?', modal.classList.contains('show'));
};

// Executar verificação ao carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('=== VERIFICAÇÃO INICIAL DOS MODAIS DE EDIÇÃO ===');
        verificarModaisEdicao();
    }, 2000);
});

console.log('Debug de modais de edição carregado. Use verificarModaisEdicao() para debug manual.');