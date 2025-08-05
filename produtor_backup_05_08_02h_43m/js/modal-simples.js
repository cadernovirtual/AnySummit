/**
 * Solução simples e direta para os modais
 */

// Funções simples para abrir/fechar modais
window.abrirModal = function(modalId) {
    console.log('Abrindo modal:', modalId);
    const modal = document.getElementById(modalId);
    
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        console.log('Modal encontrado e aberto');
    } else {
        console.error('Modal não encontrado:', modalId);
        // Tentar buscar de outras formas
        const modalPorQuery = document.querySelector(`#${modalId}`);
        if (modalPorQuery) {
            console.log('Modal encontrado por querySelector');
            modalPorQuery.style.display = 'flex';
            modalPorQuery.classList.add('show');
        }
    }
};

window.fecharModal = function(modalId) {
    console.log('Fechando modal:', modalId);
    const modal = document.getElementById(modalId);
    
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
};

// Override das funções problemáticas
window.adicionarLotePorData = function() {
    console.log('=== adicionarLotePorData SIMPLES ===');
    
    // Preparar dados (código existente)
    const agora = new Date();
    const eventoDataInicio = document.getElementById('startDateTime')?.value;
    
    if (eventoDataInicio) {
        // ... código de preparação dos dados ...
    }
    
    // Limpar campo
    const nomeField = document.getElementById('loteDataNome');
    if (nomeField) nomeField.value = '';
    
    // Abrir modal de forma simples
    abrirModal('loteDataModal');
};

window.adicionarLotePorPercentual = function() {
    console.log('=== adicionarLotePorPercentual SIMPLES ===');
    
    // Limpar campos
    const nomeField = document.getElementById('lotePercentualNome');
    const valorField = document.getElementById('lotePercentualValor');
    
    if (nomeField) nomeField.value = '';
    if (valorField) valorField.value = '';
    
    // Abrir modal de forma simples
    abrirModal('lotePercentualModal');
};

// Substituir closeModal
window.closeModal = function(modalId) {
    fecharModal(modalId);
};

// Garantir que as funções de editar usem o sistema simples
window.editarLoteData = function(id) {
    console.log('Editando lote data:', id);
    const lote = window.lotesData?.porData.find(l => l.id === id);
    if (!lote) return;
    
    // Preencher campos se existirem
    const campos = {
        'editLoteDataId': id,
        'editLoteDataNome': lote.nome,
        'editLoteDataInicio': lote.dataInicio,
        'editLoteDataFim': lote.dataFim
    };
    
    for (let [campoId, valor] of Object.entries(campos)) {
        const campo = document.getElementById(campoId);
        if (campo) campo.value = valor;
    }
    
    abrirModal('editLoteDataModal');
};

window.editarLotePercentual = function(id) {
    console.log('Editando lote percentual:', id);
    const lote = window.lotesData?.porPercentual.find(l => l.id === id);
    if (!lote) return;
    
    // Preencher campos se existirem
    const campos = {
        'editLotePercentualId': id,
        'editLotePercentualNome': lote.nome,
        'editLotePercentualValor': lote.percentual
    };
    
    for (let [campoId, valor] of Object.entries(campos)) {
        const campo = document.getElementById(campoId);
        if (campo) campo.value = valor;
    }
    
    abrirModal('editLotePercentualModal');
};

// Adicionar listeners para fechar ao clicar fora
document.addEventListener('DOMContentLoaded', function() {
    const modais = ['loteDataModal', 'lotePercentualModal', 'editLoteDataModal', 'editLotePercentualModal'];
    
    modais.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Clique no overlay fecha o modal
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    fecharModal(modalId);
                }
            });
            
            // Botões de fechar
            const closeButtons = modal.querySelectorAll('.modal-close, .btn-cancel');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    fecharModal(modalId);
                });
            });
        }
    });
});

console.log('Sistema SIMPLES de modais carregado');