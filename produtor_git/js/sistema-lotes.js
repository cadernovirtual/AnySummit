// =====================================================
// IMPORTAÇÃO COMPLETA - SISTEMA DE LOTES
// =====================================================
// Arquivo original: lotes.js

console.log('📋 Importando sistema principal de lotes...');

// Armazenamento temporário dos lotes
window.lotesData = {
    porData: [],
    porPercentual: []
};

// Função para renomear lotes automaticamente
function renomearLotesAutomaticamente() {
    // Renomear lotes por data (do mais antigo para o mais recente)
    lotesData.porData.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
    lotesData.porData.forEach((lote, index) => {
        lote.nome = `${index + 1}º Lote`;
    });
    
    // Renomear lotes por percentual (do menor para o maior percentual)
    lotesData.porPercentual.sort((a, b) => a.percentual - b.percentual);
    lotesData.porPercentual.forEach((lote, index) => {
        lote.nome = `${index + 1}º Lote`;
    });
}

// Funções principais de criação de lotes
window.criarLoteData = function() {
    console.log('Criando lote por data...');
    
    const nome = document.getElementById('loteDataNome')?.value || '';
    const dataInicio = document.getElementById('loteDataInicio')?.value;
    const dataFim = document.getElementById('loteDataFim')?.value;
    
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
        nome: nome || `${lotesData.porData.length + 1}º Lote`,
        tipo: 'data',
        dataInicio: dataInicio,
        dataFim: dataFim,
        ativo: true
    };
    
    // Adicionar ao array
    lotesData.porData.push(novoLote);
    
    // Renomear todos os lotes
    renomearLotesAutomaticamente();
    
    // Atualizar visualização
    atualizarVisualizacaoLotes();
    
    // Fechar modal
    closeModal('loteDataModal');
    
    // Salvar no cookie
    salvarLotesNoCookie();
    
    // Limpar campos
    document.getElementById('loteDataNome').value = '';
    document.getElementById('loteDataInicio').value = '';
    document.getElementById('loteDataFim').value = '';
};

window.criarLotePercentual = function() {
    console.log('Criando lote por percentual...');
    
    const nome = document.getElementById('lotePercentualNome')?.value || '';
    const percentual = document.getElementById('lotePercentualVendido')?.value;
    const dataInicio = document.getElementById('lotePercentualInicio')?.value;
    const dataFim = document.getElementById('lotePercentualFim')?.value;
    
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
        nome: nome || `${lotesData.porPercentual.length + 1}º Lote`,
        tipo: 'percentual',
        percentual: percentualNum,
        dataInicio: dataInicio,
        dataFim: dataFim,
        ativo: true
    };
    
    // Adicionar ao array
    lotesData.porPercentual.push(novoLote);
    
    // Renomear todos os lotes
    renomearLotesAutomaticamente();
    
    // Atualizar visualização
    atualizarVisualizacaoLotes();
    
    // Fechar modal
    closeModal('lotePercentualModal');
    
    // Salvar no cookie
    salvarLotesNoCookie();
    
    // Limpar campos
    document.getElementById('lotePercentualNome').value = '';
    document.getElementById('lotePercentualVendido').value = '';
    document.getElementById('lotePercentualInicio').value = '';
    document.getElementById('lotePercentualFim').value = '';
};

// Função para atualizar visualização dos lotes
function atualizarVisualizacaoLotes() {
    const container = document.getElementById('lotesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Adicionar lotes por data
    lotesData.porData.forEach((lote, index) => {
        container.appendChild(criarElementoLote(lote, 'data', index));
    });
    
    // Adicionar lotes por percentual
    lotesData.porPercentual.forEach((lote, index) => {
        container.appendChild(criarElementoLote(lote, 'percentual', index));
    });
}

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
                <button class="btn-icon delete" onclick="excluirLote('${lote.id}', '${tipo}')">🗑️</button>
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

// Funções de edição e exclusão
window.editarLote = function(loteId, tipo) {
    console.log('Editando lote:', loteId, tipo);
    // TODO: Implementar edição
    alert('Função de edição em desenvolvimento');
};

window.excluirLote = function(loteId, tipo) {
    if (!confirm('Tem certeza que deseja excluir este lote?')) {
        return;
    }
    
    if (tipo === 'data') {
        lotesData.porData = lotesData.porData.filter(l => l.id !== loteId);
    } else {
        lotesData.porPercentual = lotesData.porPercentual.filter(l => l.id !== loteId);
    }
    
    renomearLotesAutomaticamente();
    atualizarVisualizacaoLotes();
    salvarLotesNoCookie();
};

// Salvar no cookie
function salvarLotesNoCookie() {
    const dados = JSON.stringify(lotesData);
    document.cookie = `lotesData=${encodeURIComponent(dados)};path=/;max-age=${7*24*60*60}`;
    
    // Também salvar no wizard se existir
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
}

// Carregar do cookie
window.carregarLotesDoCookie = function() {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('lotesData='));
    if (cookie) {
        try {
            const value = cookie.split('=')[1];
            const dados = JSON.parse(decodeURIComponent(value));
            window.lotesData = dados;
            atualizarVisualizacaoLotes();
        } catch (error) {
            console.error('Erro ao carregar lotes:', error);
        }
    }
};

// Validar lotes
window.validarLotes = function() {
    // Deve ter pelo menos um lote
    if (lotesData.porData.length === 0 && lotesData.porPercentual.length === 0) {
        alert('É necessário criar pelo menos um lote!');
        return false;
    }
    
    // Se tem lotes percentuais, deve ter um com 100%
    if (lotesData.porPercentual.length > 0) {
        const tem100 = lotesData.porPercentual.some(l => l.percentual === 100);
        if (!tem100) {
            alert('É necessário ter pelo menos um lote com 100% de vendas!');
            return false;
        }
    }
    
    return true;
};

// Calcular data inicial do próximo lote
window.calcularProximaDataInicio = function() {
    let ultimaData = null;
    
    // Verificar lotes por data
    lotesData.porData.forEach(lote => {
        const dataFim = new Date(lote.dataFim);
        if (!ultimaData || dataFim > ultimaData) {
            ultimaData = dataFim;
        }
    });
    
    // Verificar lotes por percentual
    lotesData.porPercentual.forEach(lote => {
        const dataFim = new Date(lote.dataFim);
        if (!ultimaData || dataFim > ultimaData) {
            ultimaData = dataFim;
        }
    });
    
    if (ultimaData) {
        // Adicionar 1 minuto
        ultimaData.setMinutes(ultimaData.getMinutes() + 1);
        
        // Formatar para datetime-local
        const ano = ultimaData.getFullYear();
        const mes = String(ultimaData.getMonth() + 1).padStart(2, '0');
        const dia = String(ultimaData.getDate()).padStart(2, '0');
        const hora = String(ultimaData.getHours()).padStart(2, '0');
        const minuto = String(ultimaData.getMinutes()).padStart(2, '0');
        
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    }
    
    return '';
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        carregarLotesDoCookie();
    }, 500);
});

console.log('✅ Sistema de lotes importado com sucesso');