/**
 * CORREÇÃO: Força atualização da interface na etapa 5
 * Dispara eventos para atualizar divs dos lotes
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção de atualização da etapa 5 carregada');
    
    // Interceptar entrada na etapa 5
    const originalShowStep = window.showStep;
    if (originalShowStep) {
        window.showStep = function(stepNumber) {
            console.log(`📍 Mudando para etapa ${stepNumber}`);
            
            const result = originalShowStep.apply(this, arguments);
            
            if (stepNumber === 5) {
                console.log('🎯 ETAPA 5 DETECTADA - Forçando atualização da interface');
                
                setTimeout(() => {
                    forcarAtualizacaoEtapa5();
                }, 500);
            }
            
            return result;
        };
    }
    
    function forcarAtualizacaoEtapa5() {
        console.log('🔄 Forçando atualização da interface da etapa 5...');
        
        // 1. Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('etapa5-ativada'));
        
        // 2. Forçar renderização dos lotes se existirem
        if (window.lotesData) {
            console.log('📦 Dados de lotes encontrados:', window.lotesData);
            renderizarLotesInterface();
        }
        
        // 3. Tentar carregar do servidor se não tem dados
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        if (eventoId && (!window.lotesData || (
            (!window.lotesData.porData || window.lotesData.porData.length === 0) &&
            (!window.lotesData.porPercentual || window.lotesData.porPercentual.length === 0)
        ))) {
            console.log('📡 Carregando lotes do servidor...');
            carregarEExibirLotes(eventoId);
        }
        
        // 4. Atualizar contadores
        atualizarContadoresLotes();
        
        // 5. Forçar re-render dos elementos visuais
        forcarReRenderLotes();
    }
    
    function renderizarLotesInterface() {
        console.log('🎨 Renderizando lotes na interface...');
        
        const lotesData = window.lotesData;
        
        // Renderizar lotes por data
        if (lotesData.porData && lotesData.porData.length > 0) {
            const container = document.getElementById('lotesPorDataList');
            if (container) {
                container.innerHTML = '';
                
                lotesData.porData.forEach((lote, index) => {
                    const elemento = criarElementoLoteData(lote, index);
                    container.appendChild(elemento);
                });
                
                console.log(`✅ ${lotesData.porData.length} lotes por data renderizados`);
            }
        }
        
        // Renderizar lotes por percentual
        if (lotesData.porPercentual && lotesData.porPercentual.length > 0) {
            const container = document.getElementById('lotesPorPercentualList');
            if (container) {
                container.innerHTML = '';
                
                lotesData.porPercentual.forEach((lote, index) => {
                    const elemento = criarElementoLotePercentual(lote, index);
                    container.appendChild(elemento);
                });
                
                console.log(`✅ ${lotesData.porPercentual.length} lotes por percentual renderizados`);
            }
        }
    }
    
    function criarElementoLoteData(lote, index) {
        const div = document.createElement('div');
        div.className = 'lote-item';
        div.dataset.loteId = lote.id;
        div.dataset.loteNome = lote.nome;
        div.dataset.loteIndex = index;
        
        const dataInicio = formatarDataParaExibicao(lote.dataInicio);
        const dataFim = formatarDataParaExibicao(lote.dataFim);
        
        div.innerHTML = `
            <div class="lote-header">
                <strong>${lote.nome}</strong>
                <span class="lote-tipo">Por Data</span>
            </div>
            <div class="lote-detalhes">
                <span>📅 ${dataInicio} até ${dataFim}</span>
            </div>
            <div class="lote-opcoes">
                <label>
                    <input type="checkbox" ${lote.divulgar ? 'checked' : ''}> 
                    Divulgar critério
                </label>
            </div>
            <button type="button" class="btn-excluir-lote" onclick="excluirLote(this)">🗑️</button>
        `;
        
        return div;
    }
    
    function criarElementoLotePercentual(lote, index) {
        const div = document.createElement('div');
        div.className = 'lote-item';
        div.dataset.loteId = lote.id;
        div.dataset.loteNome = lote.nome;
        div.dataset.loteIndex = index;
        
        div.innerHTML = `
            <div class="lote-header">
                <strong>${lote.nome}</strong>
                <span class="lote-tipo">Por Percentual</span>
            </div>
            <div class="lote-detalhes">
                <span>📊 ${lote.percentual}% das vendas</span>
            </div>
            <div class="lote-opcoes">
                <label>
                    <input type="checkbox" ${lote.divulgar ? 'checked' : ''}> 
                    Divulgar critério
                </label>
            </div>
            <button type="button" class="btn-excluir-lote" onclick="excluirLote(this)">🗑️</button>
        `;
        
        return div;
    }
    
    function carregarEExibirLotes(eventoId) {
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=retomar_evento&evento_id=${eventoId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.lotes && data.lotes.length > 0) {
                console.log('✅ Lotes carregados do servidor:', data.lotes);
                
                // Restaurar lotes usando função existente
                if (window.restaurarLotes) {
                    window.restaurarLotes(data.lotes);
                }
                
                // Aguardar e renderizar
                setTimeout(() => {
                    renderizarLotesInterface();
                    atualizarContadoresLotes();
                }, 300);
            } else {
                console.log('ℹ️ Nenhum lote encontrado no servidor');
            }
        })
        .catch(error => {
            console.error('❌ Erro ao carregar lotes:', error);
        });
    }
    
    function atualizarContadoresLotes() {
        const contadorData = document.getElementById('totalLotesPorData');
        const contadorPercentual = document.getElementById('totalLotesPorPercentual');
        
        if (contadorData && window.lotesData?.porData) {
            contadorData.textContent = window.lotesData.porData.length;
            console.log(`📊 Contador lotes por data: ${window.lotesData.porData.length}`);
        }
        
        if (contadorPercentual && window.lotesData?.porPercentual) {
            contadorPercentual.textContent = window.lotesData.porPercentual.length;
            console.log(`📊 Contador lotes por percentual: ${window.lotesData.porPercentual.length}`);
        }
    }
    
    function forcarReRenderLotes() {
        // Forçar update visual dos containers
        const containers = [
            document.getElementById('lotesPorDataContainer'),
            document.getElementById('lotesPorPercentualContainer'),
            document.getElementById('lotesPorDataList'),
            document.getElementById('lotesPorPercentualList')
        ];
        
        containers.forEach(container => {
            if (container) {
                // Forçar repaint
                container.style.display = 'none';
                container.offsetHeight; // trigger reflow
                container.style.display = '';
            }
        });
        
        console.log('🔄 Re-render forçado nos containers de lotes');
    }
    
    function formatarDataParaExibicao(dataString) {
        if (!dataString) return '';
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        } catch (e) {
            return dataString;
        }
    }
    
    // Função de teste
    window.testarAtualizacaoEtapa5 = function() {
        console.log('🧪 Testando atualização da etapa 5...');
        forcarAtualizacaoEtapa5();
    };
    
    console.log('✅ Correção de atualização da etapa 5 carregada');
    console.log('💡 Use testarAtualizacaoEtapa5() para testar manualmente');
});
