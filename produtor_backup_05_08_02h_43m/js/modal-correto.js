/**
 * Sistema correto de modais - Respeitando CSS existente
 */

// Função para abrir modal corretamente
window.abrirModalCorreto = function(modalId) {
    console.log('Abrindo modal corretamente:', modalId);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal não encontrado:', modalId);
        return;
    }
    
    // Remover style inline primeiro para garantir
    modal.style.display = '';
    
    // Adicionar classe show (o CSS fará o display: flex)
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Debug
    console.log('Modal classes:', modal.className);
    
    // Se for o modal de lote por data, executar configuração após abrir
    if (modalId === 'loteDataModal') {
        setTimeout(() => {
            configurarCamposLoteDataAposAbrir();
        }, 100);
    }
};

// Função para configurar campos do lote por data após o modal abrir
function configurarCamposLoteDataAposAbrir() {
    console.log('Configurando campos após modal abrir');
    
    const loteDataInicio = document.getElementById('loteDataInicio');
    const loteDataFim = document.getElementById('loteDataFim');
    
    if (!loteDataInicio || !loteDataFim) {
        console.error('Campos não encontrados após abrir modal');
        return;
    }
    
    // Garantir que window.lotesData existe
    if (!window.lotesData) {
        window.lotesData = { porData: [], porPercentual: [] };
    }
    
    // Se já existem lotes, configurar data inicial baseada no último lote
    if (window.lotesData.porData && window.lotesData.porData.length > 0) {
        console.log('Aplicando configuração para lote subsequente');
        
        // Ordenar lotes por data fim para pegar o mais recente
        const lotesOrdenados = [...window.lotesData.porData].sort((a, b) => 
            new Date(b.dataFim) - new Date(a.dataFim)
        );
        
        const ultimoLote = lotesOrdenados[0];
        const dataFimUltimoLote = new Date(ultimoLote.dataFim);
        
        // Data inicial = data fim do último lote + 1 segundo
        const novaDataInicio = new Date(dataFimUltimoLote.getTime() + 1000);
        const dataInicioFormatada = formatDateTimeLocal(novaDataInicio);
        
        console.log('Cálculo de data:');
        console.log('- Data fim último lote:', ultimoLote.dataFim);
        console.log('- Data fim em ms:', dataFimUltimoLote.getTime());
        console.log('- Nova data início em ms:', novaDataInicio.getTime());
        console.log('- Diferença em ms:', novaDataInicio.getTime() - dataFimUltimoLote.getTime());
        console.log('- Nova data formatada:', dataInicioFormatada);
        
        // Aplicar valor e readonly
        loteDataInicio.value = dataInicioFormatada;
        loteDataInicio.readOnly = true;
        loteDataInicio.setAttribute('readonly', 'readonly');
        
        // Aplicar estilos com !important para sobrescrever CSS global
        loteDataInicio.style.setProperty('background-color', '#f0f0f0', 'important');
        loteDataInicio.style.setProperty('color', '#333', 'important');
        loteDataInicio.style.setProperty('cursor', 'not-allowed', 'important');
        loteDataInicio.style.setProperty('opacity', '1', 'important');
        
        // Sugerir data fim (7 dias depois da data início)
        const dataFimSugerida = new Date(novaDataInicio);
        dataFimSugerida.setDate(dataFimSugerida.getDate() + 7);
        
        // Verificar se não ultrapassa a data do evento
        const eventoDataInicio = document.getElementById('startDateTime')?.value;
        if (eventoDataInicio) {
            const dataEvento = new Date(eventoDataInicio);
            if (dataFimSugerida > dataEvento) {
                // Se ultrapassa, usar 1 segundo antes do evento
                dataFimSugerida.setTime(dataEvento.getTime() - 1000);
            }
        }
        
        loteDataFim.value = formatDateTimeLocal(dataFimSugerida);
        
        console.log('Campo configurado:', {
            dataInicio: loteDataInicio.value,
            dataFim: loteDataFim.value,
            readonly: loteDataInicio.readOnly,
            hasAttribute: loteDataInicio.hasAttribute('readonly')
        });
    }
}

// Função para fechar modal
window.fecharModalCorreto = function(modalId) {
    console.log('Fechando modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Importante: remover style inline para voltar ao CSS padrão
        modal.style.display = '';
    }
};

// Override das funções de adicionar lotes
window.adicionarLotePorData = function() {
    console.log('Abrindo modal de lote por data');
    console.log('Lotes existentes:', window.lotesData);
    
    const loteDataInicio = document.getElementById('loteDataInicio');
    const loteDataFim = document.getElementById('loteDataFim');
    
    if (!loteDataInicio || !loteDataFim) {
        console.error('Campos de data não encontrados');
        return;
    }
    
    // Garantir que window.lotesData existe
    if (!window.lotesData) {
        window.lotesData = { porData: [], porPercentual: [] };
    }
    
    // Configuração inicial básica - a configuração real será feita após o modal abrir
    if (!window.lotesData.porData || window.lotesData.porData.length === 0) {
        // Primeiro lote - campos editáveis
        loteDataInicio.readOnly = false;
        loteDataInicio.removeAttribute('readonly');
        
        // Remover estilos aplicados
        loteDataInicio.style.removeProperty('background-color');
        loteDataInicio.style.removeProperty('color');
        loteDataInicio.style.removeProperty('cursor');
        loteDataInicio.style.removeProperty('opacity');
        
        // Sugerir data inicial como agora
        const agora = new Date();
        loteDataInicio.value = formatDateTimeLocal(agora);
        
        // Sugerir data fim como 7 dias depois
        const dataFimSugerida = new Date(agora);
        dataFimSugerida.setDate(dataFimSugerida.getDate() + 7);
        loteDataFim.value = formatDateTimeLocal(dataFimSugerida);
    }
    
    // Limpar checkbox
    const divulgarCheckbox = document.getElementById('loteDataDivulgar');
    if (divulgarCheckbox) {
        divulgarCheckbox.checked = true;
    }
    
    // Abrir modal - a configuração dos campos será feita após abrir
    abrirModalCorreto('loteDataModal');
};

window.adicionarLotePorPercentual = function() {
    console.log('Abrindo modal de lote por percentual');
    
    // Limpar campos
    const nomeField = document.getElementById('lotePercentualNome');
    const valorField = document.getElementById('lotePercentualValor');
    
    if (nomeField) nomeField.value = '';
    if (valorField) valorField.value = '';
    
    // Abrir modal
    abrirModalCorreto('lotePercentualModal');
};

// Override das funções de editar
window.editarLoteData = function(id) {
    console.log('Editando lote data:', id);
    
    const lote = window.lotesData?.porData.find(l => l.id === id);
    if (!lote) {
        console.error('Lote não encontrado');
        return;
    }
    
    // IDs corretos dos campos (sem prefixo 'edit')
    const campos = {
        'editLoteDataId': id,
        'editLoteDataNome': lote.nome,
        'editLoteDataInicio': lote.dataInicio,
        'editLoteDataFim': lote.dataFim
    };
    
    // Preencher campos
    for (let [campoId, valor] of Object.entries(campos)) {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.value = valor;
        } else {
            console.warn(`Campo ${campoId} não encontrado`);
        }
    }
    
    // Checkbox
    const checkbox = document.getElementById('editLoteDataDivulgar');
    if (checkbox) checkbox.checked = lote.divulgar;
    
    // Abrir modal
    abrirModalCorreto('editLoteDataModal');
};

window.editarLotePercentual = function(id) {
    console.log('Editando lote percentual:', id);
    
    const lote = window.lotesData?.porPercentual.find(l => l.id === id);
    if (!lote) {
        console.error('Lote não encontrado');
        return;
    }
    
    // IDs corretos dos campos
    const campos = {
        'editLotePercentualId': id,
        'editLotePercentualNome': lote.nome,
        'editLotePercentualValor': lote.percentual
    };
    
    // Preencher campos
    for (let [campoId, valor] of Object.entries(campos)) {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.value = valor;
        } else {
            console.warn(`Campo ${campoId} não encontrado`);
        }
    }
    
    // Checkbox
    const checkbox = document.getElementById('editLotePercentualDivulgar');
    if (checkbox) checkbox.checked = lote.divulgar;
    
    // Abrir modal
    abrirModalCorreto('editLotePercentualModal');
};

// Override do closeModal
window.closeModal = function(modalId) {
    fecharModalCorreto(modalId);
};

// Função auxiliar
function formatDateTimeLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Funções de fallback caso não estejam definidas ainda
if (typeof excluirLoteData === 'undefined') {
    window.excluirLoteData = function(id) {
        console.warn('excluirLoteData chamada antes de lotes.js carregar');
        // Tentar chamar depois que lotes.js carregar
        setTimeout(() => {
            if (window.excluirLoteData && window.excluirLoteData !== arguments.callee) {
                window.excluirLoteData(id);
            }
        }, 100);
    };
}

if (typeof excluirLotePercentual === 'undefined') {
    window.excluirLotePercentual = function(id) {
        console.warn('excluirLotePercentual chamada antes de lotes.js carregar');
        setTimeout(() => {
            if (window.excluirLotePercentual && window.excluirLotePercentual !== arguments.callee) {
                window.excluirLotePercentual(id);
            }
        }, 100);
    };
}

// Garantir que as funções estejam globais
window.editarLoteData = editarLoteData;
window.editarLotePercentual = editarLotePercentual;
// Não sobrescrever se já existirem
if (!window.excluirLoteData) window.excluirLoteData = excluirLoteData;
if (!window.excluirLotePercentual) window.excluirLotePercentual = excluirLotePercentual;

// Adicionar listeners para fechar ao clicar fora
document.addEventListener('DOMContentLoaded', function() {
    const modais = ['loteDataModal', 'lotePercentualModal', 'editLoteDataModal', 'editLotePercentualModal'];
    
    modais.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Clique no overlay (mas não no modal interno)
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    fecharModalCorreto(modalId);
                }
            });
        }
    });
});

console.log('Sistema CORRETO de modais carregado - Usando classes CSS existentes');