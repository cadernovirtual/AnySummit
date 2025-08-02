/**
 * SISTEMA UNIFICADO DE RENDERIZAÇÃO DE LOTES
 * 
 * Este arquivo cria uma única função de renderização que funciona tanto para:
 * - Recuperação de rascunho (dados do banco)
 * - Atualizações após operações (CRUD)
 * - Interface limpa e consistente
 */

console.log('🎨 RENDERIZACAO-UNIFICADA-LOTES.JS CARREGANDO...');

/**
 * FUNÇÃO ÚNICA E UNIFICADA PARA RENDERIZAR LOTES
 * Substitui todas as outras funções de renderização
 */
window.renderizarLotesUnificado = async function(lotesDoBanco = null) {
    console.log('🎨 [UNIFICADO] Renderizando lotes...');
    console.log('📦 [DEBUG] Parâmetro lotesDoBanco:', lotesDoBanco);
    
    try {
        let lotes = [];
        
        // Se não foram passados lotes, carregar do banco
        if (!lotesDoBanco) {
            console.log('📡 [DEBUG] Nenhum lote fornecido - carregando do banco...');
            if (typeof window.carregarLotesDoBanco === 'function') {
                lotes = await window.carregarLotesDoBanco();
                console.log(`📦 Carregados ${lotes.length} lotes do banco`);
            } else {
                console.warn('⚠️ Função carregarLotesDoBanco não disponível');
                lotes = [];
            }
        } else {
            // Usar lotes passados como parâmetro
            lotes = Array.isArray(lotesDoBanco) ? lotesDoBanco : [];
            console.log(`📦 [DEBUG] Usando ${lotes.length} lotes fornecidos:`, lotes);
        }
        
        console.log('📦 [DEBUG] Lotes finais para renderização:', lotes);
        
        // Separar lotes por tipo
        const lotesPorData = lotes.filter(l => l.tipo === 'data');
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        
        console.log(`📅 [DEBUG] ${lotesPorData.length} lotes por data:`, lotesPorData);
        console.log(`📊 [DEBUG] ${lotesPorQuantidade.length} lotes por quantidade:`, lotesPorQuantidade);
        
        // Renderizar lotes por data
        console.log('🎨 [DEBUG] Chamando renderizarSecaoLotesData...');
        renderizarSecaoLotesData(lotesPorData);
        
        // Renderizar lotes por quantidade
        console.log('🎨 [DEBUG] Chamando renderizarSecaoLotesQuantidade...');
        renderizarSecaoLotesQuantidade(lotesPorQuantidade);
        
        console.log('✅ Renderização unificada concluída');
        
    } catch (error) {
        console.error('❌ Erro na renderização unificada:', error);
    }
};

/**
 * Renderizar seção de lotes por data
 */
function renderizarSecaoLotesData(lotes) {
    console.log('📅 [DEBUG] Renderizando seção de lotes por data...');
    console.log('📅 [DEBUG] Lotes recebidos:', lotes);
    
    const container = document.getElementById('lotesPorDataList');
    const emptyState = document.getElementById('loteDataEmpty');
    
    console.log('🔍 [DEBUG] Container encontrado:', !!container);
    console.log('🔍 [DEBUG] EmptyState encontrado:', !!emptyState);
    
    if (!container) {
        console.error('❌ Container lotesPorDataList não encontrado');
        console.log('🔍 [DEBUG] Containers disponíveis:', 
            Array.from(document.querySelectorAll('[id*="lote"]')).map(el => el.id));
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    console.log('🧹 [DEBUG] Container limpo');
    
    if (lotes.length === 0) {
        // Mostrar empty state
        if (emptyState) {
            emptyState.style.display = 'block';
            console.log('📭 [DEBUG] Empty state exibido');
        }
        console.log('📭 Nenhum lote por data - mostrando empty state');
        return;
    }
    
    // Ocultar empty state
    if (emptyState) {
        emptyState.style.display = 'none';
        console.log('🙈 [DEBUG] Empty state ocultado');
    }
    
    // Ordenar por data de início
    const lotesOrdenados = [...lotes].sort((a, b) => {
        const dataA = new Date(a.data_inicio || a.dataInicio);
        const dataB = new Date(b.data_inicio || b.dataInicio);
        return dataA - dataB;
    });
    
    console.log('📅 [DEBUG] Lotes ordenados:', lotesOrdenados);
    
    // Renderizar cada lote
    lotesOrdenados.forEach((lote, index) => {
        console.log(`🎨 [DEBUG] Renderizando lote ${index + 1}:`, lote);
        const loteElement = criarElementoLoteData(lote);
        container.appendChild(loteElement);
        console.log(`✅ [DEBUG] Lote ${index + 1} adicionado ao container`);
    });
    
    console.log(`✅ ${lotes.length} lotes por data renderizados`);
}

/**
 * Renderizar seção de lotes por quantidade
 */
function renderizarSecaoLotesQuantidade(lotes) {
    console.log('📊 Renderizando seção de lotes por quantidade...');
    
    const container = document.getElementById('lotesPorPercentualList');
    const emptyState = document.getElementById('lotePercentualEmpty');
    
    if (!container) {
        console.error('❌ Container lotesPorPercentualList não encontrado');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    if (lotes.length === 0) {
        // Mostrar empty state
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        console.log('📭 Nenhum lote por quantidade - mostrando empty state');
        return;
    }
    
    // Ocultar empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Ordenar por percentual
    const lotesOrdenados = [...lotes].sort((a, b) => {
        const percentualA = a.percentual_venda || a.percentual || 0;
        const percentualB = b.percentual_venda || b.percentual || 0;
        return percentualA - percentualB;
    });
    
    // Renderizar cada lote
    lotesOrdenados.forEach(lote => {
        const loteElement = criarElementoLoteQuantidade(lote);
        container.appendChild(loteElement);
    });
    
    console.log(`✅ ${lotes.length} lotes por quantidade renderizados`);
}

/**
 * Criar elemento HTML para lote por data
 */
function criarElementoLoteData(lote) {
    const loteDiv = document.createElement('div');
    loteDiv.className = 'lote-item';
    loteDiv.setAttribute('data-id', lote.id);
    loteDiv.setAttribute('data-tipo', 'data');
    
    const dataInicio = formatarDataBrasil(lote.data_inicio || lote.dataInicio);
    const dataFim = formatarDataBrasil(lote.data_fim || lote.dataFim);
    const divulgar = lote.divulgar_criterio || lote.divulgar;
    
    loteDiv.innerHTML = `
        <div class="lote-item-info">
            <div class="lote-item-name">${lote.nome}</div>
            <div class="lote-item-details">
                ${dataInicio} até ${dataFim}
                ${divulgar ? ' • Critério público' : ' • Critério oculto'}
            </div>
        </div>
        <div class="lote-item-actions">
            <button class="btn-icon" onclick="editarLoteUnificado('${lote.id}', 'data')" title="Editar lote">✏️</button>
            <button class="btn-icon delete" onclick="excluirLoteUnificado('${lote.id}', 'data')" title="Excluir">🗑️</button>
        </div>
    `;
    
    return loteDiv;
}

/**
 * Criar elemento HTML para lote por quantidade
 */
function criarElementoLoteQuantidade(lote) {
    const loteDiv = document.createElement('div');
    loteDiv.className = 'lote-item';
    loteDiv.setAttribute('data-id', lote.id);
    loteDiv.setAttribute('data-tipo', 'quantidade');
    
    const percentual = lote.percentual_venda || lote.percentual;
    const divulgar = lote.divulgar_criterio || lote.divulgar;
    
    loteDiv.innerHTML = `
        <div class="lote-item-info">
            <div class="lote-item-name">${lote.nome}</div>
            <div class="lote-item-details">
                Encerra aos ${percentual}% das vendas
                ${divulgar ? ' • Critério público' : ' • Critério oculto'}
            </div>
        </div>
        <div class="lote-item-actions">
            <button class="btn-icon" onclick="editarLoteUnificado('${lote.id}', 'quantidade')" title="Editar lote">✏️</button>
            <button class="btn-icon delete" onclick="excluirLoteUnificado('${lote.id}', 'quantidade')" title="Excluir">🗑️</button>
        </div>
    `;
    
    return loteDiv;
}

/**
 * Função unificada para editar lote
 */
window.editarLoteUnificado = async function(loteId, tipo) {
    console.log('✏️ [UNIFICADO] Editando lote:', loteId, tipo);
    
    try {
        // Invalidar cache antes da edição para garantir dados frescos
        if (window.lotesCache) {
            window.lotesCache.data = null;
            window.lotesCache.timestamp = 0;
            console.log('🗄️ Cache invalidado antes da edição');
        }
        
        if (tipo === 'data') {
            if (typeof window.editarLoteDataInterface === 'function') {
                await window.editarLoteDataInterface(loteId);
            } else {
                console.error('❌ Função editarLoteDataInterface não encontrada');
            }
        } else if (tipo === 'quantidade') {
            if (typeof window.editarLoteQuantidadeInterface === 'function') {
                await window.editarLoteQuantidadeInterface(loteId);
            } else {
                console.error('❌ Função editarLoteQuantidadeInterface não encontrada');
            }
        }
        
        // Forçar atualização da interface após edição
        setTimeout(async () => {
            console.log('🔄 Atualizando interface após edição...');
            await window.renderizarLotesUnificado();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro ao editar lote:', error);
        alert('Erro ao editar lote: ' + error.message);
    }
};

/**
 * Função unificada para excluir lote
 */
window.excluirLoteUnificado = async function(loteId, tipo) {
    console.log('🗑️ [UNIFICADO] Solicitação de exclusão de lote:', loteId, tipo);
    
    try {
        // CORREÇÃO PROBLEMA 2: Verificar apenas se há ingressos - sem confirmação
        console.log('🔍 Verificando se há ingressos associados ao lote...');
        
        // Verificar se há ingressos associados ao lote
        let temIngressos = false;
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        
        if (eventoId && typeof window.fazerRequisicaoAPI === 'function') {
            try {
                const resultado = await window.fazerRequisicaoAPI('verificar_ingressos_lote', {
                    lote_id: loteId
                });
                temIngressos = resultado.tem_ingressos || false;
                console.log('📊 Verificação de ingressos:', temIngressos ? 'encontrados' : 'não encontrados');
            } catch (error) {
                console.warn('⚠️ Erro ao verificar ingressos, assumindo que não há:', error);
                temIngressos = false;
            }
        }
        
        // Se há ingressos, bloquear exclusão
        if (temIngressos) {
            console.log('❌ Exclusão bloqueada - há ingressos associados');
            alert('Não é possível excluir este lote pois existem ingressos associados a ele.');
            return false;
        }
        
        console.log('✅ Nenhum ingresso encontrado - prosseguindo com exclusão');
        
        // Invalidar cache antes da exclusão
        if (window.lotesCache) {
            window.lotesCache.data = null;
            window.lotesCache.timestamp = 0;
            console.log('🗄️ Cache invalidado antes da exclusão');
        }
        
        // Executar exclusão diretamente via API
        if (typeof window.fazerRequisicaoAPI === 'function') {
            // Usar API de exclusão diretamente
            const resultado = await window.fazerRequisicaoAPI('excluir_lote_especifico', {
                lote_id: loteId
            });
            
            console.log('✅ Lote excluído com sucesso:', resultado);
            
            // Renomear lotes sequencialmente após exclusão
            console.log('🔄 Renomeando lotes sequencialmente...');
            await window.fazerRequisicaoAPI('renomear_lotes_sequencial');
            
            // Invalidar cache novamente
            if (window.lotesCache) {
                window.lotesCache.data = null;
                window.lotesCache.timestamp = 0;
            }
            
            console.log('✅ Exclusão e renomeação concluídas');
            
        } else {
            console.error('❌ Função fazerRequisicaoAPI não disponível');
            alert('Erro: Sistema de API não está disponível');
            return false;
        }
        
        // Forçar atualização da interface após exclusão
        setTimeout(async () => {
            console.log('🔄 Atualizando interface após exclusão...');
            await window.renderizarLotesUnificado();
        }, 1000);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao excluir lote:', error);
        alert('Erro ao excluir lote: ' + error.message);
        return false;
    }
};

/**
 * Formatar data para exibição brasileira
 */
function formatarDataBrasil(dataStr) {
    if (!dataStr) return 'N/A';
    
    try {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error('Erro ao formatar data:', dataStr, e);
        return dataStr;
    }
}

// ========== SOBRESCREVER TODAS AS FUNÇÕES DE RENDERIZAÇÃO ==========

/**
 * Sobrescrever todas as funções existentes para usar a versão unificada
 */
window.renderizarLotesNaInterface = window.renderizarLotesUnificado;
window.renderizarLotesPorData = () => window.renderizarLotesUnificado();
window.renderizarLotesPorPercentual = () => window.renderizarLotesUnificado();

/**
 * Função para recuperação de rascunho
 */
window.restaurarLotesUnificado = async function(lotesDoBanco) {
    console.log('🔄 [UNIFICADO] Restaurando lotes do banco:');
    console.log('📦 [DEBUG] Parâmetro lotesDoBanco:', lotesDoBanco);
    console.log('📦 [DEBUG] Tipo:', typeof lotesDoBanco);
    console.log('📦 [DEBUG] É array:', Array.isArray(lotesDoBanco));
    console.log('📦 [DEBUG] Quantidade:', lotesDoBanco ? lotesDoBanco.length : 'undefined');
    
    if (!lotesDoBanco || lotesDoBanco.length === 0) {
        console.log('⚠️ Nenhum lote para restaurar - mostrando empty state');
        await window.renderizarLotesUnificado([]);
        return;
    }
    
    // CORREÇÃO PROBLEMA 1: Invalidar cache e forçar nova consulta
    if (window.lotesCache) {
        window.lotesCache.data = null;
        window.lotesCache.timestamp = 0;
        console.log('🗄️ Cache invalidado para restauração');
    }
    
    // CORREÇÃO PROBLEMA 1: Aguardar um pouco para garantir que a DOM está pronta
    setTimeout(async () => {
        console.log('🎨 [DEBUG] Chamando renderizarLotesUnificado com os lotes após delay...');
        
        // Renderizar lotes fornecidos diretamente
        await window.renderizarLotesUnificado(lotesDoBanco);
        
        console.log('✅ Lotes restaurados via sistema unificado');
    }, 500);
};

// Sobrescrever função de restauração
window.restaurarLotes = window.restaurarLotesUnificado;

console.log('✅ RENDERIZACAO-UNIFICADA-LOTES.JS CARREGADO!');
console.log('🔧 Funções unificadas disponíveis:');
console.log('  - renderizarLotesUnificado()');
console.log('  - restaurarLotesUnificado()');
console.log('  - editarLoteUnificado()');
console.log('  - excluirLoteUnificado()');
