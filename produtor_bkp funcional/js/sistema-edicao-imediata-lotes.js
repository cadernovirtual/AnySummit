/**
 * SISTEMA DE EDIÇÃO/EXCLUSÃO IMEDIATA DE LOTES
 * Salva alterações diretamente no banco sem aguardar "Avançar"
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de edição/exclusão imediata de lotes carregado');
    
    // Função para excluir lote imediatamente
    window.excluirLoteImediato = function(button) {
        console.log('🗑️ Iniciando exclusão imediata de lote...');
        
        const loteItem = button.closest('.lote-item');
        if (!loteItem) {
            console.error('❌ Item do lote não encontrado');
            return;
        }
        
        const loteId = loteItem.dataset.loteId;
        const loteNome = loteItem.dataset.loteNome;
        
        if (!loteId) {
            // Se não tem ID, é um lote novo que ainda não foi salvo
            console.log('📝 Lote novo (sem ID) - removendo apenas da interface');
            loteItem.remove();
            atualizarContadoresLotes();
            return;
        }
        
        if (!confirm(`Tem certeza que deseja excluir o lote "${loteNome}"?`)) {
            return;
        }
        
        // Verificar se lote tem ingressos associados antes de excluir
        verificarIngressosAssociados(loteId)
            .then(temIngressos => {
                if (temIngressos) {
                    alert('Este lote não pode ser excluído pois possui ingressos associados a ele.');
                    return;
                }
                
                // Proceder com a exclusão
                executarExclusaoLote(loteId, loteItem);
            })
            .catch(error => {
                console.error('❌ Erro ao verificar ingressos:', error);
                alert('Erro ao verificar se lote pode ser excluído.');
            });
    };
    
    // Função para verificar se lote tem ingressos associados
    function verificarIngressosAssociados(loteId) {
        console.log(`🔍 Verificando se lote ${loteId} tem ingressos...`);
        
        return new Promise((resolve, reject) => {
            const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                resolve(false);
                return;
            }
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=verificar_ingressos_lote&evento_id=${eventoId}&lote_id=${loteId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    resolve(data.tem_ingressos || false);
                } else {
                    console.error('Erro ao verificar ingressos:', data.erro);
                    resolve(false); // Em caso de erro, permitir exclusão
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                reject(error);
            });
        });
    }
    
    // Função para executar a exclusão no banco
    function executarExclusaoLote(loteId, loteItem) {
        console.log(`🗑️ Excluindo lote ${loteId} do banco...`);
        
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_lote&evento_id=${eventoId}&lote_id=${loteId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log('✅ Lote excluído do banco com sucesso');
                
                // Remover da interface
                loteItem.remove();
                
                // Remover dos dados globais
                removerLoteDosGlobais(loteId);
                
                // Atualizar contadores
                atualizarContadoresLotes();
                
                // Mostrar feedback
                mostrarFeedback('Lote excluído com sucesso!', 'sucesso');
            } else {
                console.error('❌ Erro ao excluir lote:', data.erro);
                alert(`Erro ao excluir lote: ${data.erro}`);
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição de exclusão:', error);
            alert('Erro ao excluir lote. Tente novamente.');
        });
    }
    
    // Função para editar lote imediatamente
    window.editarLoteImediato = function(button) {
        console.log('✏️ Iniciando edição imediata de lote...');
        
        const loteItem = button.closest('.lote-item');
        if (!loteItem) {
            console.error('❌ Item do lote não encontrado');
            return;
        }
        
        const loteId = loteItem.dataset.loteId;
        const loteNome = loteItem.dataset.loteNome;
        
        // Buscar dados completos do lote
        const loteData = buscarDadosLote(loteId);
        
        if (!loteData) {
            console.error('❌ Dados do lote não encontrados');
            return;
        }
        
        console.log('📊 Dados do lote para edição:', loteData);
        
        // Determinar tipo do lote e abrir modal apropriado
        if (loteData.tipo === 'data') {
            abrirModalEdicaoLoteData(loteData, loteItem);
        } else if (loteData.tipo === 'percentual') {
            abrirModalEdicaoLotePercentual(loteData, loteItem);
        }
    };
    
    // Função para buscar dados do lote nos globais
    function buscarDadosLote(loteId) {
        if (!window.lotesData) return null;
        
        // Buscar em lotes por data
        const loteData = window.lotesData.porData?.find(lote => lote.id == loteId);
        if (loteData) return { ...loteData, tipo: 'data' };
        
        // Buscar em lotes por percentual
        const lotePercentual = window.lotesData.porPercentual?.find(lote => lote.id == loteId);
        if (lotePercentual) return { ...lotePercentual, tipo: 'percentual' };
        
        return null;
    }
    
    // Modal de edição de lote por data
    function abrirModalEdicaoLoteData(loteData, loteItem) {
        console.log('📅 Abrindo modal de edição para lote por data');
        
        // Criar modal dinamicamente se não existir
        let modal = document.getElementById('editLoteDataModal');
        if (!modal) {
            modal = criarModalEdicaoLoteData();
            document.body.appendChild(modal);
        }
        
        // Preencher campos
        document.getElementById('editLoteDataId').value = loteData.id || '';
        document.getElementById('editLoteDataNome').value = loteData.nome || '';
        document.getElementById('editLoteDataInicio').value = loteData.dataInicio || '';
        document.getElementById('editLoteDataFim').value = loteData.dataFim || '';
        document.getElementById('editLoteDataDivulgar').checked = loteData.divulgar || false;
        
        // Armazenar referências
        window.loteItemParaEdicao = loteItem;
        window.loteDadosOriginais = loteData;
        
        // Abrir modal
        modal.style.display = 'flex';
    }
    
    // Criar modal de edição de lote por data
    function criarModalEdicaoLoteData() {
        const modal = document.createElement('div');
        modal.id = 'editLoteDataModal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 500px; max-width: 90%;">
                <div class="modal-header">
                    <h3>Editar Lote por Data</h3>
                    <button type="button" class="close" onclick="fecharModalEdicaoLote()">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="editLoteDataId">
                    
                    <div class="form-group">
                        <label for="editLoteDataNome">Nome do Lote:</label>
                        <input type="text" id="editLoteDataNome" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editLoteDataInicio">Data de Início:</label>
                        <input type="datetime-local" id="editLoteDataInicio" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editLoteDataFim">Data de Fim:</label>
                        <input type="datetime-local" id="editLoteDataFim" required>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="editLoteDataDivulgar">
                            Divulgar critério
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="fecharModalEdicaoLote()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="salvarEdicaoLoteData()">Salvar</button>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    // Função global para fechar modal
    window.fecharModalEdicaoLote = function() {
        const modal = document.getElementById('editLoteDataModal');
        if (modal) modal.style.display = 'none';
    };
    
    // Função global para salvar edição de lote por data
    window.salvarEdicaoLoteData = function() {
        console.log('💾 Salvando edição de lote por data...');
        
        const loteData = {
            id: document.getElementById('editLoteDataId').value,
            nome: document.getElementById('editLoteDataNome').value,
            tipo: 'data',
            data_inicio: document.getElementById('editLoteDataInicio').value,
            data_fim: document.getElementById('editLoteDataFim').value,
            divulgar_criterio: document.getElementById('editLoteDataDivulgar').checked ? 1 : 0
        };
        
        // Validações
        if (!loteData.nome || !loteData.data_inicio || !loteData.data_fim) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        // Salvar no banco imediatamente
        salvarLoteNoBanco(loteData, window.loteItemParaEdicao);
    };
    
    // Função genérica para salvar lote no banco
    function salvarLoteNoBanco(loteData, loteItem) {
        console.log('💾 Salvando lote no banco:', loteData);
        
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        const formData = new URLSearchParams();
        formData.append('action', 'salvar_lote_individual');
        formData.append('evento_id', eventoId);
        formData.append('lote', JSON.stringify(loteData));
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log('✅ Lote salvo no banco com sucesso');
                
                // Atualizar dados globais
                atualizarLoteNosGlobais(loteData);
                
                // Atualizar interface visual
                if (loteItem) {
                    atualizarElementoLoteNaInterface(loteItem, loteData);
                }
                
                // Fechar modal
                fecharModalEdicaoLote();
                
                // Mostrar feedback
                mostrarFeedback('Lote salvo com sucesso!', 'sucesso');
            } else {
                console.error('❌ Erro ao salvar lote:', data.erro);
                alert(`Erro ao salvar lote: ${data.erro}`);
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            alert('Erro ao salvar lote. Tente novamente.');
        });
    }
    
    // Função para atualizar lote nos dados globais
    function atualizarLoteNosGlobais(loteData) {
        if (!window.lotesData) return;
        
        if (loteData.tipo === 'data') {
            const index = window.lotesData.porData?.findIndex(lote => lote.id == loteData.id);
            if (index !== -1) {
                window.lotesData.porData[index] = {
                    id: loteData.id,
                    nome: loteData.nome,
                    dataInicio: loteData.data_inicio,
                    dataFim: loteData.data_fim,
                    divulgar: loteData.divulgar_criterio == 1
                };
            }
        } else if (loteData.tipo === 'percentual') {
            const index = window.lotesData.porPercentual?.findIndex(lote => lote.id == loteData.id);
            if (index !== -1) {
                window.lotesData.porPercentual[index] = {
                    id: loteData.id,
                    nome: loteData.nome,
                    percentual: loteData.percentual_venda,
                    divulgar: loteData.divulgar_criterio == 1
                };
            }
        }
    }
    
    // Função para remover lote dos dados globais
    function removerLoteDosGlobais(loteId) {
        if (!window.lotesData) return;
        
        // Remover de lotes por data
        if (window.lotesData.porData) {
            window.lotesData.porData = window.lotesData.porData.filter(lote => lote.id != loteId);
        }
        
        // Remover de lotes por percentual
        if (window.lotesData.porPercentual) {
            window.lotesData.porPercentual = window.lotesData.porPercentual.filter(lote => lote.id != loteId);
        }
    }
    
    // Função para atualizar elemento na interface após salvar
    function atualizarElementoLoteNaInterface(loteItem, loteData) {
        // Atualizar dataset
        loteItem.dataset.loteNome = loteData.nome;
        
        // Atualizar conteúdo HTML
        if (loteData.tipo === 'data') {
            const dataInicio = formatarDataParaExibicao(loteData.data_inicio);
            const dataFim = formatarDataParaExibicao(loteData.data_fim);
            
            loteItem.innerHTML = `
                <div class="lote-header">
                    <strong>${loteData.nome}</strong>
                    <span class="lote-tipo">Por Data</span>
                </div>
                <div class="lote-detalhes">
                    <span>📅 ${dataInicio} até ${dataFim}</span>
                </div>
                <div class="lote-opcoes">
                    <label>
                        <input type="checkbox" ${loteData.divulgar_criterio ? 'checked' : ''}> 
                        Divulgar critério
                    </label>
                </div>
                <div class="lote-acoes">
                    <button type="button" class="btn-editar-lote" onclick="editarLoteImediato(this)">✏️</button>
                    <button type="button" class="btn-excluir-lote" onclick="excluirLoteImediato(this)">🗑️</button>
                </div>
            `;
        }
    }
    
    // Função para atualizar contadores de lotes
    function atualizarContadoresLotes() {
        const contadorData = document.getElementById('totalLotesPorData');
        const contadorPercentual = document.getElementById('totalLotesPorPercentual');
        
        if (contadorData && window.lotesData?.porData) {
            contadorData.textContent = window.lotesData.porData.length;
        }
        
        if (contadorPercentual && window.lotesData?.porPercentual) {
            contadorPercentual.textContent = window.lotesData.porPercentual.length;
        }
    }
    
    // Função para mostrar feedback visual
    function mostrarFeedback(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${tipo}`;
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            ${tipo === 'sucesso' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    // Função para formatar data
    function formatarDataParaExibicao(dataString) {
        if (!dataString) return '';
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        } catch (e) {
            return dataString;
        }
    }
    
    // Adicionar botões de editar aos lotes existentes
    function adicionarBotoesEdicaoAosLotes() {
        const loteItems = document.querySelectorAll('.lote-item');
        
        loteItems.forEach(item => {
            // Verificar se já tem botão de editar
            if (!item.querySelector('.btn-editar-lote')) {
                let acoesContainer = item.querySelector('.lote-acoes');
                
                if (!acoesContainer) {
                    acoesContainer = document.createElement('div');
                    acoesContainer.className = 'lote-acoes';
                    acoesContainer.style.cssText = 'display: flex; gap: 5px; margin-top: 10px;';
                    item.appendChild(acoesContainer);
                }
                
                // Botão editar
                const btnEditar = document.createElement('button');
                btnEditar.type = 'button';
                btnEditar.className = 'btn-editar-lote';
                btnEditar.innerHTML = '✏️';
                btnEditar.title = 'Editar lote';
                btnEditar.onclick = function() { editarLoteImediato(this); };
                acoesContainer.insertBefore(btnEditar, acoesContainer.firstChild);
                
                // Atualizar botão excluir se existir
                const btnExcluir = item.querySelector('.btn-excluir-lote');
                if (btnExcluir) {
                    btnExcluir.onclick = function() { excluirLoteImediato(this); };
                }
            }
        });
    }
    
    // Aguardar um pouco e adicionar botões aos lotes existentes
    setTimeout(() => {
        adicionarBotoesEdicaoAosLotes();
    }, 2000);
    
    // Substituir funções globais existentes se houver
    window.excluirLote = window.excluirLoteImediato;
    
    console.log('✅ Sistema de edição/exclusão imediata de lotes carregado');
    console.log('  - excluirLote() substituída por excluirLoteImediato()');
    console.log('  - editarLoteImediato() criada');
});
