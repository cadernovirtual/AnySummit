/**
 * CONTROLE DE LIMITE DE VENDAS - ETAPA 5
 * Implementa checkbox para controlar limite global de vendas do evento
 * e gerencia a criação/exclusão de lotes por quantidade
 */

console.log('🔧 CONTROLE-LIMITE-VENDAS.JS CARREGANDO...');

// Função principal para carregar o estado do controle de limite - PRIORIDADE 1
window.carregarControleLimit = function() {
    console.log('📖 Carregando estado do controle de limite...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('ℹ️ Novo evento - sem dados para carregar');
        return;
    }
    
    return fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=carregar_limite_vendas&evento_id=${eventoId}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.sucesso && data.dados) {
            console.log('📦 Dados de limite carregados:', data.dados);
            
            const checkbox = document.getElementById('controlarLimiteVendas');
            const inputLimite = document.getElementById('limiteVendas');
            const campoLimite = document.getElementById('campoLimiteVendas');
            const botao = document.getElementById('btnCriarLoteQuantidade');
            
            // CORREÇÃO: Aplicar estado diretamente (onclick não dispara no carregamento)
            if (checkbox) {
                checkbox.checked = Boolean(data.dados.controlar_limite_vendas);
                console.log(`✅ Checkbox definido como: ${checkbox.checked} (onclick não dispara)`);
            }
            
            // Aplicar estado visual baseado no checkbox
            if (data.dados.controlar_limite_vendas && campoLimite) {
                campoLimite.style.display = 'block';
                console.log('✅ Campo de limite exibido');
                
                // Definir valor do limite no campo
                if (inputLimite && data.dados.limite_vendas) {
                    inputLimite.value = data.dados.limite_vendas;
                    console.log(`📊 Limite carregado: ${data.dados.limite_vendas}`);
                }
                
                // Habilitar botão se há limite confirmado
                if (botao && data.dados.limite_vendas > 0) {
                    botao.disabled = false;
                    botao.style.opacity = '1';
                    botao.style.cursor = 'pointer';
                    console.log('✅ Botão de criar lotes habilitado');
                }
            } else {
                // Checkbox desmarcado - ocultar campo
                if (campoLimite) {
                    campoLimite.style.display = 'none';
                }
                if (botao) {
                    botao.disabled = true;
                    botao.style.opacity = '0.5';
                    botao.style.cursor = 'not-allowed';
                }
            }
            
            console.log('✅ Estado do controle de limite carregado SEM disparar onclick');
            
            // NOVO: Carregar lotes por quantidade existentes se o controle estiver ativo
            if (data.dados.controlar_limite_vendas) {
                console.log('🔄 Carregando lotes por quantidade existentes...');
                carregarLotesQuantidadeExistentes();
            }
        } else {
            console.error('❌ Erro ao carregar dados:', data.erro || 'Resposta inválida');
        }
    })
    .catch(error => {
        console.error('❌ Erro ao carregar controle de limite:', error);
    });
};

// Função para alternar o controle de limite de vendas
window.toggleLimiteVendas = function(event) {
    console.log('🔄 Click no checkbox de limite de vendas detectado...');
    
    const checkbox = document.getElementById('controlarLimiteVendas');
    const campoLimite = document.getElementById('campoLimiteVendas');
    const inputLimite = document.getElementById('limiteVendas');
    
    if (!checkbox || !campoLimite) {
        console.error('❌ Elementos não encontrados para controle de limite');
        return;
    }
    
    // CORREÇÃO: Verificar se está tentando DESMARCAR
    if (!checkbox.checked) {
        console.log('⚠️ Tentativa de desmarcar checkbox - verificando se há lotes...');
        
        // IMPEDIR a desmarcação até confirmar
        checkbox.checked = true; // Manter marcado durante verificação
        
        // Verificar se há lotes por quantidade
        temLotesQuantidade()
            .then(temLotes => {
                if (temLotes) {
                    console.log('🔍 Encontrados lotes por quantidade - solicitando confirmação...');
                    
                    const confirmacao = confirm(
                        'Essa operação vai excluir todos os Lotes (e seus tipos de ingresso) por Quantidade de Vendas. Confirma?'
                    );
                    
                    console.log('🎯 Resposta do usuário no dialog:', confirmacao ? 'CONFIRMOU' : 'CANCELOU');
                    
                    if (confirmacao === true) {
                        console.log('✅ Usuário CONFIRMOU exclusão - AGORA desmarcando checkbox');
                        
                        // AGORA SIM desmarcar o checkbox
                        checkbox.checked = false;
                        
                        // Fazer a exclusão via API
                        excluirLotesQuantidade()
                            .then(() => {
                                console.log('✅ Lotes excluídos com sucesso no MySQL');
                                
                                // Salvar o estado desativado
                                return salvarEstadoCheckbox(false);
                            })
                            .then(() => {
                                console.log('✅ Estado do checkbox salvo como desmarcado');
                                
                                // Atualizar interface
                                campoLimite.style.display = 'none';
                                
                                // Desabilitar botão de criar lotes
                                const botao = document.getElementById('btnCriarLoteQuantidade');
                                if (botao) {
                                    botao.disabled = true;
                                    botao.style.opacity = '0.5';
                                    botao.style.cursor = 'not-allowed';
                                }
                                
                                // Remover lotes da interface
                                removerLotesDaInterface();
                                
                                console.log('✅ Controle de limite desativado e interface atualizada');
                            })
                            .catch(error => {
                                console.error('❌ Erro ao excluir lotes ou salvar estado:', error);
                                alert('Erro ao excluir lotes. Tente novamente.');
                                
                                // Manter checkbox marcado em caso de erro
                                checkbox.checked = true;
                            });
                            
                    } else {
                        console.log('❌ Usuário CANCELOU - checkbox permanece marcado');
                        // Checkbox já está marcado, não fazer nada
                    }
                } else {
                    // Não há lotes, pode desmarcar normalmente
                    console.log('✅ Nenhum lote por quantidade - desmarcando normalmente');
                    
                    checkbox.checked = false; // Agora desmarcar
                    
                    // Salvar estado e atualizar interface
                    salvarEstadoCheckbox(false)
                        .then(() => {
                            campoLimite.style.display = 'none';
                            
                            // Desabilitar botão de criar lotes
                            const botao = document.getElementById('btnCriarLoteQuantidade');
                            if (botao) {
                                botao.disabled = true;
                                botao.style.opacity = '0.5';
                                botao.style.cursor = 'not-allowed';
                            }
                        });
                }
            })
            .catch(error => {
                console.error('❌ Erro ao verificar lotes:', error);
                // Em caso de erro na verificação, manter marcado
                checkbox.checked = true;
                alert('Erro ao verificar lotes existentes. Operação cancelada.');
            });
    } else {
        // MARCANDO o checkbox (normal)
        console.log('✅ Marcando controle de limite de vendas...');
        
        // Mostrar campo de limite
        campoLimite.style.display = 'block';
        
        // Manter valor existente no campo
        const valorAtual = inputLimite ? inputLimite.value : '';
        if (valorAtual && valorAtual !== '0') {
            console.log(`✅ Mantendo valor existente no campo: ${valorAtual}`);
        } else {
            console.log('📝 Campo vazio - aguardando usuário digitar valor');
            if (inputLimite) {
                setTimeout(() => inputLimite.focus(), 100);
            }
        }
        
        // Salvar APENAS o estado do checkbox
        salvarEstadoCheckbox(true);
    }
};

// Função para verificar se existem lotes por quantidade - VERSÃO MELHORADA
window.temLotesQuantidade = function() {
    console.log('🔍 Verificando se existem lotes por quantidade...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('❌ Sem evento_id para consultar backend');
        return Promise.resolve(false);
    }
    
    return fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=carregar_lotes_quantidade&evento_id=${eventoId}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📦 Resposta do backend sobre lotes:', data);
        
        if (data.sucesso && data.lotes) {
            const quantidade = data.lotes.length || 0;
            console.log(`📊 Backend confirma: ${quantidade} lotes por quantidade`);
            return quantidade > 0;
        } else {
            console.log('📊 Backend confirma: nenhum lote por quantidade');
            return false;
        }
    })
    .catch(error => {
        console.error('❌ Erro ao consultar backend:', error);
        return false;
    });
};

// Função para confirmar e salvar o limite
window.confirmarLimiteVendas = function() {
    console.log('✅ Confirmando limite de vendas...');
    
    const inputLimite = document.getElementById('limiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    const btnCriarLote = document.getElementById('btnCriarLoteQuantidade');
    
    if (!inputLimite) {
        console.error('❌ Campo de limite não encontrado');
        return;
    }
    
    const limite = parseInt(inputLimite.value);
    
    if (!limite || limite < 1) {
        alert('⚠️ Por favor, informe uma lotação máxima válida (maior que 0).');
        inputLimite.focus();
        return;
    }
    
    console.log(`📊 Salvando limite: ${limite} pessoas`);
    
    // Mostrar indicador de carregamento
    if (btnConfirmar) {
        btnConfirmar.innerHTML = '⏳ Salvando...';
        btnConfirmar.disabled = true;
    }
    
    // Salvar no banco
    salvarLimiteVendas()
        .then(sucesso => {
            if (sucesso) {
                console.log('✅ Limite salvo com sucesso');
                
                // Habilitar botão de criar lotes
                if (btnCriarLote) {
                    btnCriarLote.disabled = false;
                    btnCriarLote.style.opacity = '1';
                    btnCriarLote.style.cursor = 'pointer';
                }
                
                // Mostrar mensagem de sucesso
                mostrarMensagemSucesso(`Lotação máxima de ${limite} pessoas confirmada!`);
                
            } else {
                console.error('❌ Erro ao salvar limite');
                alert('Erro ao salvar a lotação máxima. Tente novamente.');
            }
        })
        .finally(() => {
            // Restaurar botão
            if (btnConfirmar) {
                btnConfirmar.innerHTML = '✅ Confirmar';
                btnConfirmar.disabled = false;
            }
        });
};

// Função para excluir todos os lotes por quantidade
window.excluirLotesQuantidade = function() {
    console.log('🗑️ Iniciando exclusão de lotes por quantidade...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ evento_id não encontrado na URL');
        return Promise.reject(new Error('ID do evento não encontrado'));
    }
    
    console.log(`📋 Excluindo lotes por quantidade do evento ${eventoId}...`);
    
    return fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=excluir_lotes_quantidade&evento_id=${eventoId}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📦 Dados da exclusão:', data);
        
        if (data.sucesso) {
            console.log('✅ Lotes por quantidade excluídos com sucesso');
            
            // Atualizar interface
            atualizarInterfaceAposExclusao();
            
            return Promise.resolve();
        } else {
            console.error('❌ Erro ao excluir lotes:', data.erro || 'Erro desconhecido');
            return Promise.reject(new Error(data.erro || 'Erro ao excluir lotes'));
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
        return Promise.reject(error);
    });
};

// Função para salvar estado do checkbox (apenas controlar_limite_vendas)
window.salvarEstadoCheckbox = function(ativado) {
    console.log(`💾 Salvando estado do checkbox: ${ativado}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ evento_id não encontrado');
        return Promise.resolve(false);
    }
    
    const dados = {
        action: 'salvar_limite_vendas',
        evento_id: eventoId,
        controlar_limite_vendas: ativado ? 1 : 0
        // Não enviar limite_vendas para preservar o valor no banco
    };
    
    return fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(dados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.sucesso) {
            console.log(`✅ Estado do checkbox salvo: ${ativado}`);
            return true;
        } else {
            console.error('❌ Erro ao salvar estado do checkbox:', data.erro);
            return false;
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição de salvamento do checkbox:', error);
        return false;
    });
};

// Função para salvar o limite de vendas completo
window.salvarLimiteVendas = function() {
    console.log('💾 Salvando limite de vendas...');
    
    const checkbox = document.getElementById('controlarLimiteVendas');
    const inputLimite = document.getElementById('limiteVendas');
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ evento_id não encontrado');
        return Promise.resolve(false);
    }
    
    const controlar = checkbox && checkbox.checked;
    const limite = controlar && inputLimite ? parseInt(inputLimite.value) || 0 : 0;
    
    console.log(`📊 Salvando: controlar=${controlar}, limite=${limite}`);
    
    const dados = {
        action: 'salvar_limite_vendas',
        evento_id: eventoId,
        controlar_limite_vendas: controlar ? 1 : 0,
        limite_vendas: limite
    };
    
    return fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(dados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.sucesso) {
            console.log('✅ Limite de vendas salvo com sucesso');
            return true;
        } else {
            console.error('❌ Erro ao salvar limite:', data.erro);
            return false;
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição de salvamento:', error);
        return false;
    });
};

// Função auxiliar para carregar lotes por quantidade existentes
function carregarLotesQuantidadeExistentes() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('ℹ️ Sem evento_id para carregar lotes');
        return;
    }
    
    console.log('📦 Carregando lotes por quantidade existentes...');
    
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=carregar_lotes_quantidade&evento_id=${eventoId}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.sucesso && data.lotes) {
            console.log(`✅ Carregados ${data.lotes.length} lotes por quantidade:`, data.lotes);
            
            if (data.lotes.length > 0) {
                exibirLotesQuantidadeNaInterface(data.lotes);
            } else {
                console.log('📭 Nenhum lote por quantidade encontrado');
                mostrarEmptyState();
            }
        } else {
            console.warn('⚠️ Erro ao carregar lotes:', data.erro || 'Nenhum lote encontrado');
            mostrarEmptyState();
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição de lotes:', error);
        mostrarEmptyState();
    });
}

// Função para exibir lotes na interface
function exibirLotesQuantidadeNaInterface(lotes) {
    console.log('🎨 Exibindo lotes na interface...');
    
    // CORREÇÃO: Usar container correto para lotes por data
    const container = document.getElementById('lotesPorDataList');
    const emptyState = document.getElementById('loteDataEmpty');
    
    if (!container) {
        console.error('❌ Container lotesPorDataList não encontrado');
        return;
    }
    
    // Verificar se já há lotes na interface
    const lotesExistentes = container.querySelectorAll('.lote-item[data-tipo="data"]');
    if (lotesExistentes.length > 0) {
        console.log('ℹ️ Lotes já existem na interface, evitando duplicação');
        return;
    }
    
    // Ocultar empty state se há lotes
    if (lotes.length > 0 && emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Se não há lotes, mostrar empty state
    if (lotes.length === 0) {
        mostrarEmptyState();
        return;
    }
    
    // CORREÇÃO: CRIAR OS BOTÕES HTML CORRETAMENTE
    let html = '';
    lotes.forEach(lote => {
        const dataInicio = lote.data_inicio ? new Date(lote.data_inicio).toLocaleDateString('pt-BR') : '';
        const dataFim = lote.data_fim ? new Date(lote.data_fim).toLocaleDateString('pt-BR') : '';
        
        html += `
            <div class="lote-item" data-id="${lote.id}" data-tipo="data">
                <div class="lote-item-info">
                    <div class="lote-item-name">${lote.nome}</div>
                    <div class="lote-item-details">
                        ${dataInicio} até ${dataFim}
                        ${lote.divulgar_criterio ? ' • Critério público' : ' • Critério oculto'}
                    </div>
                </div>
                <div class="lote-item-actions">
                    <button class="btn-icon" onclick="editarLote('${lote.id}', 'data')" title="Editar lote">✏️</button>
                    <button class="btn-icon delete" onclick="excluirLote('${lote.id}', 'data')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    });
    
    // ADICIONAR ao container (não sobrescrever)
    container.innerHTML += html;
    
    console.log(`🎉 ${lotes.length} lotes exibidos na interface com botões corretos`);
}

// Função para remover lotes da interface após exclusão confirmada
function removerLotesDaInterface() {
    console.log('🗑️ Removendo lotes da interface após exclusão confirmada...');
    
    const container = document.getElementById('lotesPorPercentualList');
    const emptyState = document.getElementById('lotePercentualEmpty');
    
    if (container) {
        // Remover apenas lotes por quantidade/percentual
        const lotesParaRemover = container.querySelectorAll('.lote-item[data-tipo="quantidade"], .lote-item[data-tipo="percentual"]');
        
        lotesParaRemover.forEach(lote => {
            console.log(`🗑️ Removendo lote: ${lote.dataset.loteNome || 'sem nome'}`);
            lote.remove();
        });
        
        console.log(`✅ ${lotesParaRemover.length} lotes removidos da interface`);
    }
    
    // Mostrar empty state se não há mais lotes
    if (emptyState) {
        emptyState.style.display = 'block';
    }
    
    // percentual-summary REMOVIDO DEFINITIVAMENTE - não há mais necessidade desta verificação
    
    console.log('✅ Interface limpa após exclusão');
}

// Função para mostrar empty state
function mostrarEmptyState() {
    const container = document.getElementById('lotesPorPercentualList');
    const emptyState = document.getElementById('lotePercentualEmpty');
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
    
    // percentual-summary REMOVIDO DEFINITIVAMENTE - não há mais necessidade desta verificação
}

// Função auxiliar para formatar data
function formatarData(dataStr) {
    if (!dataStr) return 'N/A';
    
    try {
        const data = new Date(dataStr + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return dataStr;
    }
}

// Função para recarregar dados se necessário (apenas para compatibilidade)
function atualizarInterfaceAposExclusao() {
    console.log('🔄 Função de compatibilidade - interface já foi atualizada via removerLotesDaInterface()');
    
    // Esta função agora é apenas para compatibilidade
    // A atualização real é feita por removerLotesDaInterface()
}

// Função para mostrar mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    let msgElement = document.getElementById('mensagemSucessoLimite');
    
    if (!msgElement) {
        msgElement = document.createElement('div');
        msgElement.id = 'mensagemSucessoLimite';
        msgElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(msgElement);
    }
    
    msgElement.textContent = mensagem;
    
    // Animar entrada
    setTimeout(() => {
        msgElement.style.opacity = '1';
        msgElement.style.transform = 'translateX(0)';
    }, 100);
    
    // Animar saída após 3 segundos
    setTimeout(() => {
        msgElement.style.opacity = '0';
        msgElement.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (msgElement.parentNode) {
                msgElement.parentNode.removeChild(msgElement);
            }
        }, 300);
    }, 3000);
}

// Garantir que as funções estejam disponíveis globalmente
window.carregarControleLimit = window.carregarControleLimit;
window.toggleLimiteVendas = window.toggleLimiteVendas;
window.confirmarLimiteVendas = window.confirmarLimiteVendas;
window.temLotesQuantidade = window.temLotesQuantidade;
window.excluirLotesQuantidade = window.excluirLotesQuantidade;
window.salvarEstadoCheckbox = window.salvarEstadoCheckbox;
window.salvarLimiteVendas = window.salvarLimiteVendas;

console.log('✅ Controle de limite de vendas carregado! Funções disponíveis:');
console.log('  - carregarControleLimit()');
console.log('  - toggleLimiteVendas()');
console.log('  - confirmarLimiteVendas()');
console.log('  - temLotesQuantidade()');
console.log('  - excluirLotesQuantidade()');
console.log('  - salvarEstadoCheckbox()');
console.log('  - salvarLimiteVendas()');
