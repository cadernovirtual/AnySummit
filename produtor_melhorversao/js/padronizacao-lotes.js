/**
 * PADRONIZAÇÃO LOTES: Botões e Edição
 * Força formatação padrão e busca no banco para lotes
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏷️ Padronização de lotes carregada');
    
    // ===========================================
    // 1. SUBSTITUIR FUNÇÕES DE EDIÇÃO DE LOTES
    // ===========================================
    
    window.editarLote = function(loteId, tipo) {
        console.log(`📝 [PADRONIZADO] Editando lote: ${loteId} (${tipo})`);
        buscarDadosLoteDoBanco(loteId);
    };
    
    // Sobrescrever outras funções
    window.editarLoteImediato = window.editarLote;
    
    window.excluirLote = function(loteId, tipo) {
        console.log(`🗑️ [PADRONIZADO] Excluindo lote: ${loteId}`);
        
        if (confirm('Tem certeza que deseja excluir este lote?')) {
            excluirLoteDoBanco(loteId);
        }
    };
    
    // ===========================================
    // 2. BUSCAR DADOS DO LOTE NO BANCO
    // ===========================================
    
    async function buscarDadosLoteDoBanco(loteId) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            console.log(`🔍 Buscando lote ${loteId} no banco...`);
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_dados_lote&evento_id=${eventoId}&lote_id=${loteId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.lote) {
                console.log('✅ Dados do lote obtidos:', data.lote);
                abrirModalEdicaoLote(data.lote);
            } else {
                console.error('❌ Erro ao buscar lote:', data.erro);
                alert('Erro ao carregar dados: ' + (data.erro || 'Lote não encontrado'));
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro de conexão ao buscar dados do lote.');
        }
    }
    
    function abrirModalEdicaoLote(lote) {
        console.log(`🎭 Abrindo modal de edição para lote tipo: ${lote.tipo}`);
        
        if (lote.tipo === 'data') {
            preencherModalLoteData(lote);
            abrirModal('editLoteDataModal');
        } else if (lote.tipo === 'percentual') {
            preencherModalLotePercentual(lote);
            abrirModal('editLotePercentualModal');
        }
    }
    
    function preencherModalLoteData(lote) {
        const campos = {
            'editLoteDataId': lote.id,
            'editLoteDataNome': lote.nome,
            'editLoteDataInicio': lote.data_inicio,
            'editLoteDataFim': lote.data_fim
        };
        
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
            }
        });
        
        // Checkbox de divulgação
        const checkboxDivulgar = document.getElementById('editLoteDataDivulgar');
        if (checkboxDivulgar) {
            checkboxDivulgar.checked = lote.divulgar_criterio == 1;
        }
    }
    
    function preencherModalLotePercentual(lote) {
        const campos = {
            'editLotePercentualId': lote.id,
            'editLotePercentualNome': lote.nome,
            'editLotePercentualValor': lote.percentual_venda
        };
        
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
            }
        });
        
        // Checkbox de divulgação
        const checkboxDivulgar = document.getElementById('editLotePercentualDivulgar');
        if (checkboxDivulgar) {
            checkboxDivulgar.checked = lote.divulgar_criterio == 1;
        }
    }
    
    // ===========================================
    // 3. PADRONIZAR BOTÕES DE LOTES
    // ===========================================
    
    function padronizarBotoesLotes() {
        const loteItems = document.querySelectorAll('.lote-item');
        
        loteItems.forEach(item => {
            const actionsDiv = item.querySelector('.lote-item-actions, .lote-actions');
            if (actionsDiv) {
                const loteId = extrairIdLote(item);
                const tipo = extrairTipoLote(item);
                
                if (loteId) {
                    // Formatação padrão para botões de lote
                    actionsDiv.innerHTML = `
                        <button class="btn-icon" onclick="editarLote('${loteId}', '${tipo}')" title="Editar lote">✏️</button>
                        <button class="btn-icon delete" onclick="excluirLote('${loteId}', '${tipo}')" title="Excluir">🗑️</button>
                    `;
                    
                    console.log(`🔄 Botão de lote padronizado: ${loteId}`);
                }
            }
        });
    }
    
    // ===========================================
    // 4. FUNÇÕES AUXILIARES
    // ===========================================
    
    function extrairIdLote(element) {
        return element.dataset.loteId || 
               element.getAttribute('data-lote-id') ||
               element.dataset.id;
    }
    
    function extrairTipoLote(element) {
        return element.dataset.tipo || 
               element.getAttribute('data-tipo') ||
               'data'; // padrão
    }
    
    function abrirModal(modalId) {
        if (window.openModal) {
            window.openModal(modalId);
        } else {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
            }
        }
    }
    
    async function excluirLoteDoBanco(loteId) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=excluir_lote&evento_id=${eventoId}&lote_id=${loteId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                // Remover elemento da interface
                const elemento = document.querySelector(`[data-lote-id="${loteId}"]`);
                if (elemento) elemento.remove();
                
                console.log('✅ Lote excluído com sucesso');
            } else {
                alert('Erro ao excluir lote: ' + data.erro);
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir lote:', error);
            alert('Erro de conexão ao excluir lote');
        }
    }
    
    // ===========================================
    // 5. INICIALIZAÇÃO
    // ===========================================
    
    setTimeout(() => {
        padronizarBotoesLotes();
    }, 1500);
    
    // Monitorar mudanças na etapa 5 (lotes)
    const observer = new MutationObserver(() => {
        if (window.currentStep === 5) {
            padronizarBotoesLotes();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Padronização de lotes configurada');
});
