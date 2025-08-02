/**
 * CORREÇÃO: Botões de lotes com posicionamento correto e persistência
 * Garante que botões apareçam sempre e no local correto
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção de botões de lotes carregada');
    
    // CSS para botões de lotes
    const style = document.createElement('style');
    style.textContent = `
        .lote-item {
            position: relative;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            background: #f9f9f9;
        }
        
        .lote-actions {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
        }
        
        .btn-editar-lote,
        .btn-excluir-lote {
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        .btn-editar-lote:hover {
            background: #e3f2fd;
            border-color: #2196f3;
        }
        
        .btn-excluir-lote:hover {
            background: #ffebee;
            border-color: #f44336;
        }
        
        .lote-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-right: 80px; /* Espaço para os botões */
        }
        
        .lote-tipo {
            background: #e3f2fd;
            color: #1976d2;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .lote-detalhes {
            margin-bottom: 8px;
            color: #666;
        }
        
        .lote-opcoes {
            display: flex;
            align-items: center;
        }
    `;
    document.head.appendChild(style);
    
    // Interceptar showStep para garantir botões na etapa 5
    const originalShowStep = window.showStep;
    if (originalShowStep) {
        window.showStep = function(stepNumber) {
            const result = originalShowStep.apply(this, arguments);
            
            if (stepNumber === 5) {
                console.log('📍 Etapa 5 ativa - garantindo botões nos lotes');
                setTimeout(() => {
                    garantirBotoesEmTodosOsLotes();
                }, 500);
            }
            
            return result;
        };
    }
    
    // Interceptar funções de restauração de lotes
    const originalRestaurarLotes = window.restaurarLotes;
    if (originalRestaurarLotes) {
        window.restaurarLotes = function(lotes) {
            console.log('🔄 Interceptando restaurarLotes para adicionar botões');
            
            const result = originalRestaurarLotes.apply(this, arguments);
            
            setTimeout(() => {
                garantirBotoesEmTodosOsLotes();
            }, 800);
            
            return result;
        };
    }
    
    // Função principal para garantir botões em todos os lotes
    function garantirBotoesEmTodosOsLotes() {
        console.log('🔧 Garantindo botões em todos os lotes...');
        
        const loteItems = document.querySelectorAll('.lote-item');
        console.log(`📦 Encontrados ${loteItems.length} lotes`);
        
        loteItems.forEach((item, index) => {
            console.log(`📋 Processando lote ${index + 1}...`);
            
            // Remover botões existentes para recriar
            const botoesExistentes = item.querySelectorAll('.lote-actions');
            botoesExistentes.forEach(btn => btn.remove());
            
            // Criar container de ações
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'lote-actions';
            
            // Botão editar
            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-editar-lote';
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
            btnExcluir.className = 'btn-excluir-lote';
            btnExcluir.innerHTML = '🗑️';
            btnExcluir.title = 'Excluir lote';
            btnExcluir.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                excluirLoteImediato(this);
            };
            
            actionsContainer.appendChild(btnEditar);
            actionsContainer.appendChild(btnExcluir);
            
            // Adicionar ao item
            item.appendChild(actionsContainer);
            
            // Garantir estrutura HTML correta
            garantirEstruturaLote(item);
            
            console.log(`✅ Botões adicionados ao lote ${index + 1}`);
        });
        
        console.log('✅ Todos os lotes processados');
    }
    
    // Função para garantir estrutura HTML correta do lote
    function garantirEstruturaLote(loteItem) {
        // Verificar se tem estrutura de header
        let header = loteItem.querySelector('.lote-header');
        if (!header) {
            // Buscar título do lote
            const titulo = loteItem.querySelector('strong')?.textContent || 
                          loteItem.dataset.loteNome || 
                          'Lote sem nome';
            
            // Determinar tipo do lote
            const tipo = loteItem.textContent.includes('%') ? 'Por Percentual' : 'Por Data';
            
            // Criar header
            header = document.createElement('div');
            header.className = 'lote-header';
            header.innerHTML = `
                <strong>${titulo}</strong>
                <span class="lote-tipo">${tipo}</span>
            `;
            
            // Inserir no início
            loteItem.insertBefore(header, loteItem.firstChild);
        }
        
        // Garantir container de detalhes
        let detalhes = loteItem.querySelector('.lote-detalhes');
        if (!detalhes) {
            detalhes = document.createElement('div');
            detalhes.className = 'lote-detalhes';
            
            // Buscar informações do lote
            const textoLote = loteItem.textContent;
            if (textoLote.includes('%')) {
                const match = textoLote.match(/(\d+)%/);
                if (match) {
                    detalhes.innerHTML = `<span>📊 ${match[1]}% das vendas</span>`;
                }
            } else if (textoLote.includes('até')) {
                const dateInfo = textoLote.match(/(\d{2}\/\d{2}\/\d{4}.*?até.*?\d{2}\/\d{2}\/\d{4}.*?)(?:\n|$)/);
                if (dateInfo) {
                    detalhes.innerHTML = `<span>📅 ${dateInfo[1]}</span>`;
                }
            }
            
            header.after(detalhes);
        }
        
        // Garantir container de opções
        let opcoes = loteItem.querySelector('.lote-opcoes');
        if (!opcoes) {
            opcoes = document.createElement('div');
            opcoes.className = 'lote-opcoes';
            
            // Buscar checkbox existente
            const checkbox = loteItem.querySelector('input[type="checkbox"]');
            if (checkbox) {
                const label = document.createElement('label');
                label.appendChild(checkbox.cloneNode(true));
                label.appendChild(document.createTextNode(' Divulgar critério'));
                opcoes.appendChild(label);
                
                // Remover checkbox original
                checkbox.parentNode?.removeChild(checkbox);
            }
            
            detalhes.after(opcoes);
        }
        
        // Aplicar classe CSS se não tiver
        if (!loteItem.classList.contains('lote-item-styled')) {
            loteItem.classList.add('lote-item-styled');
        }
    }
    
    // Observer para detectar novos lotes adicionados dinamicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Se é um lote ou contém lotes
                        if (node.classList?.contains('lote-item') || node.querySelector?.('.lote-item')) {
                            console.log('🔍 Novo lote detectado - adicionando botões');
                            setTimeout(() => {
                                garantirBotoesEmTodosOsLotes();
                            }, 200);
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
        '#lotesPorPercentualContainer',
        '.step-content[data-step="5"]'
    ];
    
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
    
    // Garantir botões quando script carrega (se já estiver na etapa 5)
    setTimeout(() => {
        if (window.currentStep === 5 || document.querySelector('.step-content.active[data-step="5"]')) {
            console.log('📍 Já na etapa 5 - garantindo botões');
            garantirBotoesEmTodosOsLotes();
        }
    }, 1000);
    
    // Função de teste
    window.testarBotoesLotes = function() {
        console.log('🧪 Testando botões dos lotes...');
        garantirBotoesEmTodosOsLotes();
    };
    
    console.log('✅ Correção de botões de lotes carregada');
    console.log('  - CSS aplicado para posicionamento correto');
    console.log('  - Observer configurado para novos lotes');
    console.log('  - Intercepção de showStep e restaurarLotes ativa');
    console.log('💡 Use testarBotoesLotes() para forçar atualização');
});
