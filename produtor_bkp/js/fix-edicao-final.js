/**
 * Fix definitivo para modais de edição
 */

// Garantir que os modais de edição funcionem
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicando fix para modais de edição...');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // Verificar se os modais existem
        const modalEditData = document.getElementById('editLoteDataModal');
        const modalEditPercentual = document.getElementById('editLotePercentualModal');
        
        console.log('Modal edit data existe?', !!modalEditData);
        console.log('Modal edit percentual existe?', !!modalEditPercentual);
        
        // Se não existirem, há um problema sério
        if (!modalEditData || !modalEditPercentual) {
            console.error('ERRO CRÍTICO: Modais de edição não encontrados no DOM!');
            console.log('Tentando buscar modais de outra forma...');
            
            // Buscar em todo o documento
            const todosModais = document.querySelectorAll('.modal-overlay');
            console.log('Total de modal-overlay encontrados:', todosModais.length);
            todosModais.forEach(modal => {
                console.log('Modal ID:', modal.id);
            });
        }
    }, 1000);
});

// Override definitivo das funções
window.editarLoteData = function(id) {
    console.log('=== EDITAR LOTE DATA (FIX) ===');
    
    // Buscar o modal de forma mais agressiva
    let modal = document.getElementById('editLoteDataModal');
    
    if (!modal) {
        console.error('Modal não encontrado por ID, tentando querySelector...');
        modal = document.querySelector('#editLoteDataModal');
    }
    
    if (!modal) {
        console.error('Modal ainda não encontrado, tentando buscar por texto...');
        const allElements = document.getElementsByTagName('*');
        for (let el of allElements) {
            if (el.id === 'editLoteDataModal') {
                modal = el;
                console.log('Modal encontrado por busca manual!');
                break;
            }
        }
    }
    
    if (!modal) {
        alert('Erro: Modal de edição não encontrado. Por favor, recarregue a página.');
        return;
    }
    
    // Buscar lote
    const lote = window.lotesData?.porData.find(l => l.id === id);
    if (!lote) return;
    
    // Preencher campos (com verificação)
    const setCampo = (id, valor) => {
        const campo = document.getElementById(id);
        if (campo) campo.value = valor;
    };
    
    setCampo('editLoteDataId', id);
    setCampo('editLoteDataNome', lote.nome);
    setCampo('editLoteDataInicio', lote.dataInicio);
    setCampo('editLoteDataFim', lote.dataFim);
    
    const checkbox = document.getElementById('editLoteDataDivulgar');
    if (checkbox) checkbox.checked = lote.divulgar;
    
    // Forçar abertura do modal
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    console.log('Modal deve estar visível agora');
};

window.editarLotePercentual = function(id) {
    console.log('=== EDITAR LOTE PERCENTUAL (FIX) ===');
    
    // Buscar o modal
    let modal = document.getElementById('editLotePercentualModal');
    
    if (!modal) {
        alert('Erro: Modal de edição não encontrado. Por favor, recarregue a página.');
        return;
    }
    
    // Buscar lote
    const lote = window.lotesData?.porPercentual.find(l => l.id === id);
    if (!lote) return;
    
    // Preencher campos
    const setCampo = (id, valor) => {
        const campo = document.getElementById(id);
        if (campo) campo.value = valor;
    };
    
    setCampo('editLotePercentualId', id);
    setCampo('editLotePercentualNome', lote.nome);
    setCampo('editLotePercentualValor', lote.percentual);
    
    const checkbox = document.getElementById('editLotePercentualDivulgar');
    if (checkbox) checkbox.checked = lote.divulgar;
    
    // Forçar abertura do modal
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    console.log('Modal deve estar visível agora');
};

// Garantir que as funções estejam disponíveis globalmente
window.editarLoteData = editarLoteData;
window.editarLotePercentual = editarLotePercentual;

console.log('Fix para modais de edição aplicado');