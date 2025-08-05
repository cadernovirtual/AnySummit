/**
 * CORREÇÃO: Força exibição dos lotes na etapa 5
 * Corrige o problema de lotes não aparecendo automaticamente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 CORREÇÃO de exibição de lotes na etapa 5 carregada');
    
    // Interceptar mudança para etapa 5
    const originalShowStep = window.showStep;
    if (originalShowStep) {
        window.showStep = function(stepNumber) {
            console.log(`📍 Entrando na etapa ${stepNumber}`);
            
            const result = originalShowStep.apply(this, arguments);
            
            if (stepNumber === 5) {
                console.log('🎯 ETAPA 5 DETECTADA - Forçando carregamento de lotes');
                
                // Aguardar um pouco para a etapa ser renderizada
                setTimeout(() => {
                    forcarExibicaoLotes();
                }, 300);
            }
            
            return result;
        };
    }
    
    // Função para forçar exibição dos lotes
    function forcarExibicaoLotes() {
        console.log('🚀 Forçando exibição dos lotes...');
        
        // 1. Verificar se há dados de lotes globais
        if (window.lotesData && (window.lotesData.porData?.length > 0 || window.lotesData.porPercentual?.length > 0)) {
            console.log('✅ Lotes encontrados em window.lotesData:', window.lotesData);
            renderizarLotesNaInterface();
            return;
        }
        
        // 2. Verificar se há lotes carregados de outra forma
        if (window.lotesCarregados && window.lotesCarregados.length > 0) {
            console.log('✅ Lotes encontrados em window.lotesCarregados:', window.lotesCarregados);
            if (window.restaurarLotes) {
                window.restaurarLotes(window.lotesCarregados);
            }
            return;
        }
        
        // 3. Tentar carregar do servidor
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        if (eventoId) {
            console.log('📡 Carregando lotes do servidor para evento:', eventoId);
            carregarLotesDoServidor(eventoId);
        } else {
            console.log('ℹ️ Sem evento ID - provavelmente evento novo');
        }
    }
    
    // Função para renderizar lotes na interface
    function renderizarLotesNaInterface() {
        console.log('🎨 Renderizando lotes na interface...');
        
        const lotesData = window.lotesData;
        
        // Renderizar lotes por data
        if (lotesData.porData && lotesData.porData.length > 0) {
            console.log(`📅 Renderizando ${lotesData.porData.length} lotes por data`);
            
            const containerData = document.getElementById('lotesPorDataList');
            if (containerData) {
                containerData.innerHTML = '';
                
                lotesData.porData.forEach((lote, index) => {
                    const loteElement = criarElementoLote(lote, 'data', index);
                    containerData.appendChild(loteElement);
                });
                
                console.log('✅ Lotes por data renderizados');
            }
        }
        
        // Renderizar lotes por percentual
        if (lotesData.porPercentual && lotesData.porPercentual.length > 0) {
            console.log(`📊 Renderizando ${lotesData.porPercentual.length} lotes por percentual`);
            
            const containerPercentual = document.getElementById('lotesPorPercentualList');
            if (containerPercentual) {
                containerPercentual.innerHTML = '';
                
                lotesData.porPercentual.forEach((lote, index) => {
                    const loteElement = criarElementoLote(lote, 'percentual', index);
                    containerPercentual.appendChild(loteElement);
                });
                
                console.log('✅ Lotes por percentual renderizados');
            }
        }
        
        // Atualizar contadores
        atualizarContadores();
    }
    
    // Função para criar elemento de lote na interface
    function criarElementoLote(lote, tipo, index) {
        const div = document.createElement('div');
        div.className = 'lote-item';
        div.dataset.loteId = lote.id;
        div.dataset.loteNome = lote.nome;
        
        if (tipo === 'data') {
            div.innerHTML = `
                <div class="lote-info">
                    <strong>${lote.nome}</strong>
                    <div class="lote-details">
                        <span>📅 ${formatarData(lote.dataInicio)} até ${formatarData(lote.dataFim)}</span>
                    </div>
                    <div class="lote-config">
                        <label>
                            <input type="checkbox" ${lote.divulgar ? 'checked' : ''}> 
                            Divulgar critério
                        </label>
                    </div>
                </div>
                <button type="button" class="btn-excluir-lote" onclick="excluirLote(this)">🗑️</button>
            `;
        } else {
            div.innerHTML = `
                <div class="lote-info">
                    <strong>${lote.nome}</strong>
                    <div class="lote-details">
                        <span>📊 ${lote.percentual}% das vendas</span>
                    </div>
                    <div class="lote-config">
                        <label>
                            <input type="checkbox" ${lote.divulgar ? 'checked' : ''}> 
                            Divulgar critério
                        </label>
                    </div>
                </div>
                <button type="button" class="btn-excluir-lote" onclick="excluirLote(this)">🗑️</button>
            `;
        }
        
        return div;
    }
    
    // Função para carregar lotes do servidor
    function carregarLotesDoServidor(eventoId) {
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
                
                if (window.restaurarLotes) {
                    window.restaurarLotes(data.lotes);
                    setTimeout(() => {
                        renderizarLotesNaInterface();
                    }, 100);
                }
            } else {
                console.log('ℹ️ Nenhum lote encontrado no servidor');
            }
        })
        .catch(error => {
            console.error('❌ Erro ao carregar lotes:', error);
        });
    }
    
    // Funções auxiliares
    function formatarData(dataString) {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }
    
    function atualizarContadores() {
        const contadorData = document.getElementById('totalLotesPorData');
        const contadorPercentual = document.getElementById('totalLotesPorPercentual');
        
        if (contadorData && window.lotesData?.porData) {
            contadorData.textContent = window.lotesData.porData.length;
        }
        
        if (contadorPercentual && window.lotesData?.porPercentual) {
            contadorPercentual.textContent = window.lotesData.porPercentual.length;
        }
    }
    
    // Função manual para testar
    window.testarExibicaoLotes = function() {
        console.log('🧪 Teste manual de exibição de lotes');
        forcarExibicaoLotes();
    };
    
    console.log('✅ Correção de exibição de lotes instalada');
    console.log('💡 Use testarExibicaoLotes() para testar manualmente');
});
