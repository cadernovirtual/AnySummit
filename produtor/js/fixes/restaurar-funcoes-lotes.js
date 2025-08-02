// =====================================================
// RESTAURAR FUNÇÕES DE CRIAÇÃO DE LOTES
// =====================================================

console.log('🔧 Restaurando funções de criação de lotes...');

// Variável global para lotes se não existir
window.lotesData = window.lotesData || {
    porData: [],
    porPercentual: []
};

// Função para criar lote por data
window.criarLoteData = function() {
    console.log('📅 Criando lote por data...');
    
    const nome = document.getElementById('loteDataNome')?.value || '';
    const dataInicio = document.getElementById('loteDataInicio')?.value;
    const dataFim = document.getElementById('loteDataFim')?.value;
    
    // Validações
    if (!dataInicio || !dataFim) {
        alert('Por favor, preencha as datas de início e fim');
        return;
    }
    
    if (new Date(dataInicio) >= new Date(dataFim)) {
        alert('A data de início deve ser anterior à data de fim');
        return;
    }
    
    // Criar objeto do lote
    const novoLote = {
        id: `lote_data_${Date.now()}`,
        nome: nome || `${window.lotesData.porData.length + 1}º Lote`,
        tipo: 'data',
        dataInicio: dataInicio,
        dataFim: dataFim,
        ativo: true
    };
    
    // Adicionar ao array
    window.lotesData.porData.push(novoLote);
    
    // Renomear todos os lotes
    if (window.renomearLotesAutomaticamente) {
        window.renomearLotesAutomaticamente();
    }
    
    // Atualizar visualização
    if (window.atualizarVisualizacaoLotes) {
        window.atualizarVisualizacaoLotes();
    }
    
    // Fechar modal
    if (window.closeModal) {
        window.closeModal('loteDataModal');
    }
    
    // Salvar no cookie
    salvarLotesNoCookie();
    
    // Limpar campos
    document.getElementById('loteDataNome').value = '';
    document.getElementById('loteDataInicio').value = '';
    document.getElementById('loteDataFim').value = '';
    
    console.log('✅ Lote por data criado:', novoLote);
};

// Função para criar lote por percentual
window.criarLotePercentual = function() {
    console.log('📊 Criando lote por percentual...');
    
    const nome = document.getElementById('lotePercentualNome')?.value || '';
    const percentual = document.getElementById('lotePercentualVendido')?.value;
    const dataInicio = document.getElementById('lotePercentualInicio')?.value;
    const dataFim = document.getElementById('lotePercentualFim')?.value;
    
    // Validações
    if (!percentual || !dataInicio || !dataFim) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    if (new Date(dataInicio) >= new Date(dataFim)) {
        alert('A data de início deve ser anterior à data de fim');
        return;
    }
    
    const percentualNum = parseInt(percentual);
    if (percentualNum < 0 || percentualNum > 100) {
        alert('O percentual deve estar entre 0 e 100');
        return;
    }
    
    // Criar objeto do lote
    const novoLote = {
        id: `lote_perc_${Date.now()}`,
        nome: nome || `${window.lotesData.porPercentual.length + 1}º Lote`,
        tipo: 'percentual',
        percentual: percentualNum,
        dataInicio: dataInicio,
        dataFim: dataFim,
        ativo: true
    };
    
    // Adicionar ao array
    window.lotesData.porPercentual.push(novoLote);
    
    // Renomear todos os lotes
    if (window.renomearLotesAutomaticamente) {
        window.renomearLotesAutomaticamente();
    }
    
    // Atualizar visualização
    if (window.atualizarVisualizacaoLotes) {
        window.atualizarVisualizacaoLotes();
    }
    
    // Fechar modal
    if (window.closeModal) {
        window.closeModal('lotePercentualModal');
    }
    
    // Salvar no cookie
    salvarLotesNoCookie();
    
    // Limpar campos
    document.getElementById('lotePercentualNome').value = '';
    document.getElementById('lotePercentualVendido').value = '';
    document.getElementById('lotePercentualInicio').value = '';
    document.getElementById('lotePercentualFim').value = '';
    
    console.log('✅ Lote percentual criado:', novoLote);
};

// Função auxiliar para salvar no cookie
function salvarLotesNoCookie() {
    const dados = JSON.stringify(window.lotesData);
    document.cookie = `lotesData=${encodeURIComponent(dados)};path=/;max-age=${7*24*60*60}`;
    
    // Também salvar no wizard se existir
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
}

// Função para renomear lotes automaticamente
window.renomearLotesAutomaticamente = window.renomearLotesAutomaticamente || function() {
    console.log('🔢 Renomeando lotes...');
    
    // Renomear lotes por data (do mais antigo para o mais recente)
    if (window.lotesData.porData) {
        window.lotesData.porData.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
        window.lotesData.porData.forEach((lote, index) => {
            lote.nome = `${index + 1}º Lote`;
        });
    }
    
    // Renomear lotes por percentual (do menor para o maior percentual)
    if (window.lotesData.porPercentual) {
        window.lotesData.porPercentual.sort((a, b) => a.percentual - b.percentual);
        window.lotesData.porPercentual.forEach((lote, index) => {
            lote.nome = `${index + 1}º Lote`;
        });
    }
};

// Função para atualizar visualização
window.atualizarVisualizacaoLotes = window.atualizarVisualizacaoLotes || function() {
    console.log('🖼️ Atualizando visualização dos lotes...');
    
    const container = document.getElementById('lotesList');
    if (!container) {
        console.error('Container lotesList não encontrado');
        return;
    }
    
    container.innerHTML = '';
    
    // Adicionar lotes por data
    if (window.lotesData.porData) {
        window.lotesData.porData.forEach((lote, index) => {
            container.appendChild(criarElementoLote(lote, 'data', index));
        });
    }
    
    // Adicionar lotes por percentual
    if (window.lotesData.porPercentual) {
        window.lotesData.porPercentual.forEach((lote, index) => {
            container.appendChild(criarElementoLote(lote, 'percentual', index));
        });
    }
    
    if (container.innerHTML === '') {
        container.innerHTML = '<p class="empty-state">Nenhum lote criado ainda</p>';
    }
};

// Criar elemento visual do lote
function criarElementoLote(lote, tipo, index) {
    const div = document.createElement('div');
    div.className = 'lote-card ' + (tipo === 'data' ? 'por-data' : 'por-percentual');
    div.setAttribute('data-lote-id', lote.id);
    
    const formatarData = (dataStr) => {
        const data = new Date(dataStr);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    };
    
    let conteudo = `
        <div class="lote-header">
            <h4 class="lote-nome">${lote.nome}</h4>
            <div class="lote-actions">
                <button class="btn-icon" onclick="editarLote('${lote.id}', '${tipo}')">✏️</button>
                <button class="btn-icon delete" onclick="excluirLoteSeguro('${lote.id}', '${tipo}')">🗑️</button>
            </div>
        </div>
        <div class="lote-info">
            <span>Início: ${formatarData(lote.dataInicio)}</span>
            <span>Fim: ${formatarData(lote.dataFim)}</span>
    `;
    
    if (tipo === 'percentual') {
        conteudo += `<span class="percentual-value">${lote.percentual}%</span>`;
    }
    
    conteudo += '</div>';
    div.innerHTML = conteudo;
    
    return div;
}

// Função de edição (placeholder)
window.editarLote = window.editarLote || function(loteId, tipo) {
    console.log('✏️ Editando lote:', loteId, tipo);
    
    // CORREÇÃO: Implementar função real baseada no tipo
    if (tipo === 'data') {
        if (typeof window.editarLoteData === 'function') {
            window.editarLoteData(loteId);
        } else {
            console.error('❌ Função editarLoteData não encontrada');
            alert('Função de edição de lotes por data não disponível');
        }
    } else if (tipo === 'percentual' || tipo === 'quantidade') {
        if (typeof window.editarLotePercentual === 'function') {
            window.editarLotePercentual(loteId);
        } else {
            console.error('❌ Função editarLotePercentual não encontrada');
            alert('Função de edição de lotes por percentual não disponível');
        }
    } else {
        console.error('❌ Tipo de lote desconhecido:', tipo);
        alert('Tipo de lote não reconhecido: ' + tipo);
    }
};

// Carregar lotes do cookie ao iniciar
window.carregarLotesDoCookie = window.carregarLotesDoCookie || function() {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('lotesData='));
    if (cookie) {
        try {
            const value = cookie.split('=')[1];
            const dados = JSON.parse(decodeURIComponent(value));
            window.lotesData = dados;
            console.log('📋 Lotes carregados do cookie:', dados);
            
            // Atualizar visualização
            if (window.atualizarVisualizacaoLotes) {
                window.atualizarVisualizacaoLotes();
            }
        } catch (error) {
            console.error('Erro ao carregar lotes:', error);
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de lotes inicializado');
    
    // Carregar lotes salvos
    setTimeout(() => {
        carregarLotesDoCookie();
    }, 500);
});

console.log('✅ Funções de criação de lotes restauradas');