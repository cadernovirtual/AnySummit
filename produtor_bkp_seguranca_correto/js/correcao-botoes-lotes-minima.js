/**
 * CORREÇÃO: Botões de lotes SEM quebrar design existente
 * Apenas adiciona botões sem modificar layout
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção mínima de botões de lotes carregada');
    
    // CSS mínimo apenas para os botões
    const style = document.createElement('style');
    style.textContent = `
        .lote-item-actions {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 4px;
            z-index: 10;
        }
        
        .btn-lote-action {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            border-radius: 3px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .btn-lote-action:hover {
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        
        .lote-item {
            position: relative !important;
        }
    `;
    document.head.appendChild(style);
    
    // Interceptar showStep para garantir botões na etapa 5
    const originalShowStep = window.showStep;
    if (originalShowStep) {
        window.showStep = function(stepNumber) {
            const result = originalShowStep.apply(this, arguments);
            
            if (stepNumber === 5) {
                console.log('📍 Etapa 5 ativa - adicionando botões mínimos nos lotes');
                setTimeout(() => {
                    adicionarBotoesMinimosTodosLotes();
                }, 800);
            }
            
            return result;
        };
    }
    
    // Interceptar restauração de lotes
    const originalRestaurarLotes = window.restaurarLotes;
    if (originalRestaurarLotes) {
        window.restaurarLotes = function(lotes) {
            const result = originalRestaurarLotes.apply(this, arguments);
            
            setTimeout(() => {
                adicionarBotoesMinimosTodosLotes();
            }, 1000);
            
            return result;
        };
    }
    
    // Função principal para adicionar botões mínimos
    function adicionarBotoesMinimosTodosLotes() {
        console.log('🔧 Adicionando botões mínimos nos lotes...');
        
        const loteItems = document.querySelectorAll('.lote-item');
        console.log(`📦 Encontrados ${loteItems.length} lotes`);
        
        loteItems.forEach((item, index) => {
            // Verificar se já tem botões
            if (item.querySelector('.lote-item-actions')) {
                return; // Já tem botões
            }
            
            console.log(`📋 Adicionando botões ao lote ${index + 1}...`);
            
            // Garantir posição relativa
            if (getComputedStyle(item).position === 'static') {
                item.style.position = 'relative';
            }
            
            // Criar container de ações mínimo
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'lote-item-actions';
            
            // Botão editar
            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-lote-action btn-editar-lote';
            btnEditar.innerHTML = '✏️';
            btnEditar.title = 'Editar lote';
            btnEditar.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                editarLoteImediato(this);
            };
            
            // Botão excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn-lote-action btn-excluir-lote';
            btnExcluir.innerHTML = '🗑️';
            btnExcluir.title = 'Excluir lote';
            btnExcluir.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                excluirLoteImediato(this);
            };
            
            actionsContainer.appendChild(btnEditar);
            actionsContainer.appendChild(btnExcluir);
            
            // Adicionar ao item SEM modificar o resto
            item.appendChild(actionsContainer);
            
            console.log(`✅ Botões adicionados ao lote ${index + 1}`);
        });
        
        console.log('✅ Todos os lotes processados com botões mínimos');
    }
    
    // Observer para detectar novos lotes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('lote-item') || node.querySelector?.('.lote-item')) {
                            console.log('🔍 Novo lote detectado - adicionando botões mínimos');
                            setTimeout(() => {
                                adicionarBotoesMinimosTodosLotes();
                            }, 300);
                        }
                    }
                });
            }
        });
    });
    
    // Observar containers de lotes
    const containersParaObservar = [
        '#lotesPorDataList',
        '#lotesPorPercentualList',
        '#lotesPorDataContainer',
        '#lotesPorPercentualContainer'
    ];
    
    setTimeout(() => {
        containersParaObservar.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                observer.observe(container, {
                    childList: true,
                    subtree: true
                });
                console.log(`👁️ Observando container: ${selector}`);
            }
        });
    }, 1000);
    
    // Garantir botões quando já estiver na etapa 5
    setTimeout(() => {
        if (window.currentStep === 5 || document.querySelector('.step-content.active[data-step="5"]')) {
            console.log('📍 Já na etapa 5 - adicionando botões mínimos');
            adicionarBotoesMinimosTodosLotes();
        }
    }, 2000);
    
    // Função de teste
    window.testarBotoesLotesMinimos = function() {
        console.log('🧪 Testando botões mínimos dos lotes...');
        adicionarBotoesMinimosTodosLotes();
    };
    
    console.log('✅ Correção mínima de botões de lotes carregada');
    console.log('💡 Use testarBotoesLotesMinimos() para testar');
});
