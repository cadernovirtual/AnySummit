/**
 * CORREÇÃO: Botões de lotes funcionais com design correto
 * Corrige busca de dados e design dos botões
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção de botões de lotes funcionais carregada');
    
    // CSS corrigido - mesmo estilo do btn-icon delete dos ingressos
    const style = document.createElement('style');
    style.textContent = `
        .lote-item-actions {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            z-index: 10;
        }
        
        .btn-lote-action {
            background: transparent;
            border: none;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            border-radius: 3px;
            transition: background-color 0.2s ease;
        }
        
        .btn-lote-action:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        .btn-lote-action.edit-btn {
            color: #333;
        }
        
        .btn-lote-action.delete-btn {
            color: #dc3545;
        }
            border-radius: 4px;
            transition: all 0.2s;
        }
        
        .btn-lote-action:hover {
            background: rgba(0,0,0,0.1);
            transform: scale(1.1);
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
                console.log('📍 Etapa 5 ativa - adicionando botões funcionais');
                setTimeout(() => {
                    adicionarBotoesFuncionais();
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
                adicionarBotoesFuncionais();
            }, 1000);
            
            return result;
        };
    }
    
    // Função principal para adicionar botões funcionais
    function adicionarBotoesFuncionais() {
        console.log('🔧 Adicionando botões funcionais nos lotes...');
        
        const loteItems = document.querySelectorAll('.lote-item');
        console.log(`📦 Encontrados ${loteItems.length} lotes`);
        
        loteItems.forEach((item, index) => {
            // Verificar se já tem botões
            if (item.querySelector('.lote-item-actions')) {
                return; // Já tem botões
            }
            
            console.log(`📋 Processando lote ${index + 1}...`);
            
            // Garantir posição relativa
            item.style.position = 'relative';
            
            // Coletar dados do lote ANTES de criar botões
            const dadosLote = coletarDadosLoteDoElemento(item);
            
            if (!dadosLote.id) {
                console.warn(`⚠️ Lote ${index + 1} sem ID - pulando`);
                return;
            }
            
            console.log(`📊 Dados do lote ${index + 1}:`, dadosLote);
            
            // Criar container de ações
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'lote-item-actions';
            
            // Botão editar com design correto
            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-lote-action edit-btn';
            btnEditar.innerHTML = '✏️';
            btnEditar.title = 'Editar lote';
            btnEditar.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                editarLoteFuncional(dadosLote);
            };
            
            // Botão excluir com mesmo design
            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn-lote-action delete-btn';
            btnExcluir.innerHTML = '🗑️';
            btnExcluir.title = 'Excluir lote';
            btnExcluir.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                excluirLoteFuncional(dadosLote);
            };
            
            actionsContainer.appendChild(btnEditar);
            actionsContainer.appendChild(btnExcluir);
            
            // Adicionar ao item
            item.appendChild(actionsContainer);
            
            console.log(`✅ Botões funcionais adicionados ao lote ${index + 1}`);
        });
        
        console.log('✅ Todos os lotes processados com botões funcionais');
    }
    
    // Coletar dados do lote do elemento DOM
    function coletarDadosLoteDoElemento(loteItem) {
        const dados = {
            id: loteItem.dataset.loteId || null,
            nome: loteItem.dataset.loteNome || null,
            tipo: null,
            elemento: loteItem
        };
        
        // Tentar extrair nome do DOM se não tem no dataset
        if (!dados.nome) {
            const nomeElement = loteItem.querySelector('strong');
            if (nomeElement) {
                dados.nome = nomeElement.textContent.trim();
            }
        }
        
        // Determinar tipo baseado no conteúdo
        const textoLote = loteItem.textContent;
        if (textoLote.includes('%')) {
            dados.tipo = 'percentual';
            const match = textoLote.match(/(\d+)%/);
            if (match) {
                dados.percentual = parseInt(match[1]);
            }
        } else {
            dados.tipo = 'data';
            // Buscar datas no texto
            const datas = textoLote.match(/(\d{2}\/\d{2}\/\d{4}[^até]*até[^\d]*\d{2}\/\d{2}\/\d{4}[^\n]*)/);
            if (datas) {
                dados.datasTexto = datas[1];
            }
        }
        
        // Verificar checkbox divulgar
        const checkbox = loteItem.querySelector('input[type="checkbox"]');
        if (checkbox) {
            dados.divulgar = checkbox.checked;
        }
        
        console.log(`📊 Dados coletados do lote:`, dados);
        return dados;
    }
    
    // Função para editar lote funcional
    function editarLoteFuncional(dadosLote) {
        console.log('✏️ Editando lote funcional:', dadosLote);
        
        if (!dadosLote.id) {
            console.error('❌ ID do lote não encontrado');
            alert('Erro: ID do lote não encontrado.');
            return;
        }
        
        // Buscar dados completos do lote no servidor
        buscarDadosCompletosLote(dadosLote.id)
            .then(loteCompleto => {
                if (loteCompleto) {
                    console.log('📋 Dados completos do lote:', loteCompleto);
                    abrirModalEdicaoLote(loteCompleto, dadosLote.elemento);
                } else {
                    console.error('❌ Dados completos do lote não encontrados');
                    alert('Erro ao carregar dados do lote.');
                }
            })
            .catch(error => {
                console.error('❌ Erro ao buscar dados do lote:', error);
                alert('Erro ao carregar dados do lote.');
            });
    }
    
    // Buscar dados completos do lote no servidor
    async function buscarDadosCompletosLote(loteId) {
        try {
            const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=retomar_evento&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.lotes) {
                const lote = data.lotes.find(l => l.id == loteId);
                return lote;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            return null;
        }
    }
    
    // Abrir modal de edição do lote
    function abrirModalEdicaoLote(loteData, elemento) {
        console.log('📝 Abrindo modal de edição para lote:', loteData);
        
        // Criar modal dinamicamente
        let modal = document.getElementById('editLoteModal');
        if (!modal) {
            modal = criarModalEdicaoLote();
            document.body.appendChild(modal);
        }
        
        // Preencher campos baseado no tipo
        document.getElementById('editLoteId').value = loteData.id;
        document.getElementById('editLoteNome').value = loteData.nome;
        document.getElementById('editLoteTipo').value = loteData.tipo;
        
        if (loteData.tipo === 'data') {
            document.getElementById('editLoteDataInicio').value = loteData.data_inicio || '';
            document.getElementById('editLoteDataFim').value = loteData.data_fim || '';
            document.getElementById('camposData').style.display = 'block';
            document.getElementById('camposPercentual').style.display = 'none';
        } else {
            document.getElementById('editLotePercentual').value = loteData.percentual_venda || 0;
            document.getElementById('camposData').style.display = 'none';
            document.getElementById('camposPercentual').style.display = 'block';
        }
        
        document.getElementById('editLoteDivulgar').checked = loteData.divulgar_criterio == 1;
        
        // Armazenar referências
        window.loteParaEdicao = { dados: loteData, elemento: elemento };
        
        // Mostrar modal
        modal.style.display = 'flex';
    }
    
    // Criar modal de edição
    function criarModalEdicaoLote() {
        const modal = document.createElement('div');
        modal.id = 'editLoteModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 8px; width: 500px; max-width: 90%;">
                <h3 style="margin-top: 0;">Editar Lote</h3>
                
                <input type="hidden" id="editLoteId">
                <input type="hidden" id="editLoteTipo">
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px;">Nome do Lote:</label>
                    <input type="text" id="editLoteNome" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
                </div>
                
                <div id="camposData" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Data de Início:</label>
                        <input type="datetime-local" id="editLoteDataInicio" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Data de Fim:</label>
                        <input type="datetime-local" id="editLoteDataFim" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
                
                <div id="camposPercentual" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Percentual de Vendas:</label>
                        <input type="number" id="editLotePercentual" min="0" max="100" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="editLoteDivulgar">
                        Divulgar critério
                    </label>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="fecharModalEdicaoLote()" style="padding: 8px 16px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    <button type="button" onclick="salvarEdicaoLote()" style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">Salvar</button>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    // Função para excluir lote funcional
    function excluirLoteFuncional(dadosLote) {
        console.log('🗑️ Excluindo lote funcional:', dadosLote);
        
        if (!dadosLote.id) {
            console.error('❌ ID do lote não encontrado');
            return;
        }
        
        if (!confirm(`Tem certeza que deseja excluir o lote "${dadosLote.nome}"?`)) {
            return;
        }
        
        // Usar a função de exclusão existente
        if (window.excluirLoteImediato) {
            // Simular botão para a função existente
            const btnTemp = document.createElement('button');
            dadosLote.elemento.appendChild(btnTemp);
            
            window.excluirLoteImediato(btnTemp);
            
            btnTemp.remove();
        }
    }
    
    // Funções globais para o modal
    window.fecharModalEdicaoLote = function() {
        const modal = document.getElementById('editLoteModal');
        if (modal) modal.style.display = 'none';
    };
    
    window.salvarEdicaoLote = function() {
        const loteData = {
            id: document.getElementById('editLoteId').value,
            nome: document.getElementById('editLoteNome').value,
            tipo: document.getElementById('editLoteTipo').value,
            divulgar_criterio: document.getElementById('editLoteDivulgar').checked ? 1 : 0
        };
        
        if (loteData.tipo === 'data') {
            loteData.data_inicio = document.getElementById('editLoteDataInicio').value;
            loteData.data_fim = document.getElementById('editLoteDataFim').value;
        } else {
            loteData.percentual_venda = parseInt(document.getElementById('editLotePercentual').value);
        }
        
        // Usar a função de salvamento existente
        if (window.salvarLoteNoBanco) {
            window.salvarLoteNoBanco(loteData, window.loteParaEdicao?.elemento);
            fecharModalEdicaoLote();
        }
    };
    
    // Observer para detectar novos lotes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('lote-item') || node.querySelector?.('.lote-item')) {
                            console.log('🔍 Novo lote detectado - adicionando botões funcionais');
                            setTimeout(() => {
                                adicionarBotoesFuncionais();
                            }, 300);
                        }
                    }
                });
            }
        });
    });
    
    // Observar containers de lotes
    setTimeout(() => {
        const containers = ['#lotesPorDataList', '#lotesPorPercentualList'];
        containers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
                console.log(`👁️ Observando: ${selector}`);
            }
        });
    }, 1000);
    
    // Garantir botões quando já estiver na etapa 5
    setTimeout(() => {
        if (window.currentStep === 5 || document.querySelector('.step-content.active[data-step="5"]')) {
            console.log('📍 Já na etapa 5 - adicionando botões funcionais');
            adicionarBotoesFuncionais();
        }
    }, 2000);
    
    // Função de teste
    window.testarBotoesFuncionais = function() {
        console.log('🧪 Testando botões funcionais...');
        adicionarBotoesFuncionais();
    };
    
    console.log('✅ Correção de botões funcionais carregada');
    console.log('💡 Use testarBotoesFuncionais() para testar');
});
