/**
 * Gestão de Lotes para Novo Evento
 * AnySummit - Sistema de Gestão de Eventos
 */

// Armazenamento temporário dos lotes
window.lotesData = {
    porData: [],
    porPercentual: []
};

// FUNÇÃO PRINCIPAL PARA RESTAURAR LOTES DO BANCO DE DADOS
window.restaurarLotes = function(lotesDoBanco) {
    console.log('🔄 Restaurando lotes do banco de dados:', lotesDoBanco);
    
    if (!lotesDoBanco || lotesDoBanco.length === 0) {
        console.log('⚠️ Nenhum lote para restaurar');
        return;
    }
    
    // Limpar dados atuais
    window.lotesData = {
        porData: [],
        porPercentual: []
    };
    
    // Processar cada lote do banco
    lotesDoBanco.forEach(lote => {
        const loteData = {
            id: lote.id,
            nome: lote.nome,
            divulgar: lote.divulgar_criterio == 1
        };
        
        if (lote.tipo === 'data') {
            // Lote por data
            loteData.dataInicio = lote.data_inicio;
            loteData.dataFim = lote.data_fim;
            loteData.percentualAumento = lote.percentual_aumento_valor || 0;
            
            window.lotesData.porData.push(loteData);
            console.log('📅 Lote por data restaurado:', loteData);
            
        } else if (lote.tipo === 'percentual') {
            // Lote por percentual
            loteData.percentual = lote.percentual_venda;
            loteData.percentualAumento = lote.percentual_aumento_valor || 0;
            
            window.lotesData.porPercentual.push(loteData);
            console.log('📊 Lote por percentual restaurado:', loteData);
        }
    });
    
    // Renderizar os lotes na interface
    setTimeout(() => {
        if (typeof renderizarLotesPorData === 'function') {
            renderizarLotesPorData();
        }
        if (typeof renderizarLotesPorPercentual === 'function') {
            renderizarLotesPorPercentual();
        }
        if (typeof atualizarSummaryPercentual === 'function') {
            atualizarSummaryPercentual();
        }
        
        console.log('✅ Lotes restaurados e renderizados:', window.lotesData);
    }, 100);
};

console.log('✅ Função restaurarLotes definida:', typeof window.restaurarLotes);

// Função para renomear lotes automaticamente
function renomearLotesAutomaticamente() {
    // Renomear lotes por data (do mais antigo para o mais recente)
    lotesData.porData.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
    lotesData.porData.forEach((lote, index) => {
        lote.nome = `Lote ${index + 1}`;
    });
    
    // Renomear lotes por percentual (do menor para o maior percentual)
    lotesData.porPercentual.sort((a, b) => a.percentual - b.percentual);
    lotesData.porPercentual.forEach((lote, index) => {
        lote.nome = `Lote ${index + 1}`;
    });
}

// Tornar as funções disponíveis globalmente
// window.adicionarLotePorData = adicionarLotePorData; // Sobrescrita por modal-correto.js
window.adicionarLotePorPercentual = adicionarLotePorPercentual;
window.criarLoteData = criarLoteData;
window.criarLotePercentual = criarLotePercentual;
window.editarLoteData = editarLoteData;
window.editarLotePercentual = editarLotePercentual;
window.salvarLoteData = salvarLoteData;
window.salvarLotePercentual = salvarLotePercentual;
window.excluirLoteData = excluirLoteData;
window.excluirLotePercentual = excluirLotePercentual;

// CORREÇÃO: Função global para roteamento de exclusão
window.excluirLote = function(loteId, tipo) {
    console.log('🗑️ [GLOBAL] excluirLote chamada:', loteId, tipo);
    console.trace('📍 Stack trace de quem chamou excluirLote:');
    
    if (tipo === 'data') {
        console.log('📋 Redirecionando para excluirLoteData...');
        excluirLoteData(loteId);
    } else if (tipo === 'percentual' || tipo === 'quantidade') {
        console.log('📋 Redirecionando para excluirLotePercentual...');
        excluirLotePercentual(loteId);
    } else {
        console.error('❌ Tipo de lote desconhecido para exclusão:', tipo);
        alert('Tipo de lote não reconhecido: ' + tipo);
    }
};

window.validarLotes = validarLotes;
window.carregarLotesDoCookie = carregarLotesDoCookie;
window.renderizarLotesPorData = renderizarLotesPorData;
window.renderizarLotesPorPercentual = renderizarLotesPorPercentual;
window.renomearLotesAutomaticamente = renomearLotesAutomaticamente;

// Funções para abrir modais
function adicionarLotePorData() {
    try {
        console.log('=== INICIANDO adicionarLotePorData ===');
        console.log('Botão clicado, função executada');
        
        // Verificar se modal existe
        const modal = document.getElementById('loteDataModal');
        if (!modal) {
            console.error('Modal loteDataModal não encontrado no DOM!');
            alert('Erro: Modal não encontrado. Verifique se o HTML do modal existe.');            return;
        }
        
        // Calcular defaults
        const agora = new Date();
        const eventoData = document.getElementById('startDateTime').value;
        
        if (eventoData) {
            const dataEvento = new Date(eventoData);
            const diaAnterior = new Date(dataEvento);
            diaAnterior.setDate(diaAnterior.getDate() - 1);
            diaAnterior.setHours(23, 59, 0, 0);
            
            // Para primeiro lote, usar data atual
            if (lotesData.porData.length === 0) {
                document.getElementById('loteDataInicio').value = formatDateTimeLocal(agora);
            } else {
                // Para lotes subsequentes, usar fim do lote anterior
                const ultimoLote = lotesData.porData[lotesData.porData.length - 1];
                document.getElementById('loteDataInicio').value = ultimoLote.dataFim;
            }
            
            document.getElementById('loteDataFim').value = formatDateTimeLocal(diaAnterior);
        }
        
        // Preencher nome automaticamente (campo não existe mais no HTML)
        // const proximoNumero = lotesData.porData.length + 1;
        // const nomeInput = document.getElementById('loteDataNome');
        // if (nomeInput) {
        //     nomeInput.value = `Lote ${proximoNumero}`;
        //     nomeInput.readOnly = true;
        // }
        
        // Limpar outros campos
        document.getElementById('loteDataDivulgar').checked = true;
        
        // Debug: verificar estado do modal antes
        console.log('Estado do modal antes:', modal.classList.contains('show'));
        
        // Usar a função openModal do sistema principal
        if (typeof openModal === 'function') {
            console.log('Chamando openModal...');
            openModal('loteDataModal');
            
            // Verificar se abriu
            setTimeout(() => {
                console.log('Estado do modal depois:', modal.classList.contains('show'));
                if (!modal.classList.contains('show')) {
                    console.error('Modal não foi aberto corretamente!');
                    // Tentar abrir manualmente
                    modal.classList.add('show');
                    modal.style.display = 'block';
                }
            }, 100);
        } else {
            console.warn('Função openModal não encontrada, usando fallback');
            // Fallback manual
            modal.classList.add('show');
            modal.style.display = 'block';
        }
        
        console.log('Modal de lote por data aberto com sucesso');
        
    } catch (error) {
        console.error('Erro ao abrir modal de lote por data:', error);
        alert('Erro ao abrir modal. Verifique o console.');
    }
}

function adicionarLotePorPercentual() {
    try {
        console.log('Iniciando adicionarLotePorPercentual');
        
        // Verificar se modal existe
        const modal = document.getElementById('lotePercentualModal');
        if (!modal) {
            console.error('Modal lotePercentualModal não encontrado no DOM!');
            alert('Erro: Modal não encontrado. Verifique se o HTML do modal existe.');            return;
        }
        
        // Preencher nome automaticamente (campo não existe mais no HTML)
        // const proximoNumero = lotesData.porPercentual.length + 1;
        // const nomeInput = document.getElementById('lotePercentualNome');
        // if (nomeInput) {
        //     nomeInput.value = `Lote ${proximoNumero}`;
        //     nomeInput.readOnly = true;
        // }
        
        // Limpar outros campos
        document.getElementById('lotePercentualValor').value = '';
        document.getElementById('lotePercentualDivulgar').checked = false;
        
        // Debug: verificar estado do modal antes
        console.log('Estado do modal antes:', modal.classList.contains('show'));
        
        // Usar a função openModal do sistema principal
        if (typeof openModal === 'function') {
            console.log('Chamando openModal...');
            openModal('lotePercentualModal');
            
            // Verificar se abriu
            setTimeout(() => {
                console.log('Estado do modal depois:', modal.classList.contains('show'));
                if (!modal.classList.contains('show')) {
                    console.error('Modal não foi aberto corretamente!');
                    // Tentar abrir manualmente
                    modal.classList.add('show');
                    modal.style.display = 'block';
                }
            }, 100);
        } else {
            console.warn('Função openModal não encontrada, usando fallback');
            // Fallback manual
            modal.classList.add('show');
            modal.style.display = 'block';
        }
        
        console.log('Modal de lote por percentual aberto com sucesso');
        
    } catch (error) {
        console.error('Erro ao abrir modal de lote por percentual:', error);
        alert('Erro ao abrir modal. Verifique o console.');
    }
}

// Função para criar lote por data
function criarLoteData() {
    try {
        const dataInicio = document.getElementById('loteDataInicio').value;
        const dataFim = document.getElementById('loteDataFim').value;
        const divulgar = document.getElementById('loteDataDivulgar').checked;
        
        // Gerar nome automaticamente temporário
        const nome = `Lote Temp`;
        
        console.log('Criando lote data:', { nome, dataInicio, dataFim, divulgar });
        
        // Validações
        if (!dataInicio || dataInicio === '' || dataInicio === null) {
            alert('Por favor, informe a data de início.');            return;
        }
        
        if (!dataFim || dataFim === '' || dataFim === null) {
            alert('Por favor, informe a data de fim.');            return;
        }
        
        // Verificar se as datas são válidas
        const dataInicioObj = new Date(dataInicio);
        const dataFimObj = new Date(dataFim);
        
        if (isNaN(dataInicioObj.getTime())) {
            alert('Data de início inválida.');            return;
        }
        
        if (isNaN(dataFimObj.getTime())) {
            alert('Data de fim inválida.');            return;
        }
        
        if (dataInicioObj >= dataFimObj) {
            alert('A data de início deve ser anterior à data de fim.');            return;
        }
        
        // Verificar se não ultrapassa a data do evento
        const eventoDataInicio = document.getElementById('startDateTime')?.value;
        if (eventoDataInicio) {
            const dataEvento = new Date(eventoDataInicio);
            if (dataFimObj >= dataEvento) {
                alert('A data fim do lote não pode ser posterior ou igual à data do evento.');            return;
            }
        }
        
        // Verificar intersecções com outros lotes
        for (let lote of window.lotesData.porData) {
            const inicioExistente = new Date(lote.dataInicio);
            const fimExistente = new Date(lote.dataFim);
            
            // Verificar se há sobreposição
            if ((dataInicioObj >= inicioExistente && dataInicioObj <= fimExistente) ||
                (dataFimObj >= inicioExistente && dataFimObj <= fimExistente) ||
                (dataInicioObj <= inicioExistente && dataFimObj >= fimExistente)) {
                alert('As datas do lote não podem ter intersecção com outros lotes existentes.');            return;
            }
        }
        
        // Criar objeto do lote
        const lote = {
            id: Date.now(),
            nome: nome,
            dataInicio: dataInicio,
            dataFim: dataFim,
            divulgar: divulgar,
            tipo: 'POR DATA'
        };
        
        console.log('Lote criado:', lote);
        
        // Adicionar à lista
        window.lotesData.porData.push(lote);
        
        // Renomear todos os lotes para manter ordem
        renomearLotesAutomaticamente();
        
        console.log('Lista atual de lotes:', window.lotesData.porData);
        
        // Atualizar interface
        renderizarLotesPorData();
        salvarLotesNoCookie();
        
        // Fechar modal
        if (typeof closeModal === 'function') {
            closeModal('loteDataModal');
        } else {
            // Fallback manual
            const modal = document.getElementById('loteDataModal');
            if (modal) {
                modal.classList.remove('show');
            }
        }
        
        // Limpar campos para próxima criação
        // document.getElementById('loteDataNome').value = ''; // Campo removido
        // document.getElementById('loteDataInicio').value = ''; // Comentado - será gerenciado pelo modal-correto.js
        // document.getElementById('loteDataFim').value = ''; // Comentado - será gerenciado pelo modal-correto.js
        document.getElementById('loteDataDivulgar').checked = true;
        
        console.log('Lote por data criado com sucesso');
        
    } catch (error) {
        console.error('Erro ao criar lote por data:', error);
        alert('Erro inesperado ao criar lote. Verifique o console.');
    }
}

// Função para criar lote por percentual
function criarLotePercentual() {
    try {
        const percentual = parseInt(document.getElementById('lotePercentualValor').value);
        const divulgar = document.getElementById('lotePercentualDivulgar').checked;
        
        // Gerar nome automaticamente temporário
        const nome = `Lote Temp`;
        
        console.log('Criando lote percentual:', { nome, percentual, divulgar });
        
        // Validações
        if (!percentual || isNaN(percentual) || percentual < 1 || percentual > 100) {
            alert('Por favor, informe um percentual válido entre 1 e 100.');            return;
        }
        
        // Verificar se já existe lote com o mesmo percentual
        const loteComMesmoPercentual = lotesData.porPercentual.find(l => l.percentual === percentual);
        if (loteComMesmoPercentual) {
            alert('Já existe um lote com este percentual. Os percentuais não podem coincidir.');            return;
        }
        
        // Criar objeto do lote
        const lote = {
            id: Date.now(),
            nome: nome,
            percentual: percentual,
            divulgar: divulgar,
            tipo: 'POR PERCENTUAL DE VENDA'
        };
        
        console.log('Lote criado:', lote);
        
        // CORREÇÃO PROBLEMA 2: Criar lote no banco de dados imediatamente
        console.log('📦 Criando lote no banco de dados...');
        
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        
        if (eventoId) {
            // CORREÇÃO PROBLEMA 3: Sinalizar que está criando lotes (não remover botões)
            window.criandoLotesPercentual = true;
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=criar_lote_percentual&evento_id=${eventoId}&nome=${encodeURIComponent(lote.nome)}&percentual_venda=${percentual}&divulgar_criterio=${divulgar ? 1 : 0}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    console.log('✅ Lote criado no banco com ID:', data.lote_id);
                    
                    // Atualizar o lote com o ID do banco
                    lote.id = data.lote_id;
                    
                    // Adicionar à lista na memória
                    lotesData.porPercentual.push(lote);
                    
                    // Renomear todos os lotes para manter ordem
                    renomearLotesAutomaticamente();
                    
                    // Atualizar interface
                    renderizarLotesPorPercentual();
                    atualizarSummaryPercentual();
                    salvarLotesNoCookie();
                    
                    console.log('✅ Lote por percentual criado com sucesso no banco e interface');
                    
                } else {
                    console.error('❌ Erro ao criar lote no banco:', data.erro);
                    alert('Erro ao criar lote: ' + data.erro);
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição:', error);
                alert('Erro ao criar lote. Verifique sua conexão.');
            })
            .finally(() => {
                // CORREÇÃO PROBLEMA 3: Permitir remoção de botões novamente após delay
                setTimeout(() => {
                    window.criandoLotesPercentual = false;
                }, 2000);
            });
        } else {
            console.warn('⚠️ Sem evento_id - criando apenas na memória (modo novo evento)');
            
            // Adicionar apenas na memória se não há evento_id (novo evento)
            lotesData.porPercentual.push(lote);
            renomearLotesAutomaticamente();
            renderizarLotesPorPercentual();
            atualizarSummaryPercentual();
            salvarLotesNoCookie();
        }
        
        // Fechar modal
        if (typeof closeModal === 'function') {
            closeModal('lotePercentualModal');
        } else {
            // Fallback manual
            const modal = document.getElementById('lotePercentualModal');
            if (modal) {
                modal.classList.remove('show');
            }
        }
        
        // Limpar campos para próxima criação
        // document.getElementById('lotePercentualNome').value = ''; // Campo removido
        document.getElementById('lotePercentualValor').value = '';
        document.getElementById('lotePercentualDivulgar').checked = false;
        
        console.log('Lote por percentual criado com sucesso');
        
    } catch (error) {
        console.error('Erro ao criar lote por percentual:', error);
        alert('Erro inesperado ao criar lote. Verifique o console.');
    }
}

// Função para renderizar lotes por data
function renderizarLotesPorData() {
    console.log('🎨 renderizarLotesPorData chamada');
    
    const container = document.getElementById('lotesPorDataList');
    const emptyState = document.getElementById('loteDataEmpty');
    
    // Verificar se os elementos existem
    if (!container) {
        console.error('Elemento lotesPorDataList não encontrado');            return;
    }
    
    if (!emptyState) {
        console.warn('Elemento loteDataEmpty não encontrado, mas continuando renderização');
    }
    
    // RECUPERAR LOTES DO WIZARDDATACOLLECTOR SE NECESSÁRIO
    if ((!window.lotesData || window.lotesData.porData.length === 0) && window.WizardDataCollector) {
        console.log('🔄 Tentando recuperar lotes do WizardDataCollector...');
        
        const saved = localStorage.getItem('wizardDataCollector');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.dados && data.dados.lotes && data.dados.lotes.length > 0) {
                    console.log('📦 Lotes encontrados no WizardDataCollector');
                    
                    // Garantir estrutura
                    if (!window.lotesData) {
                        window.lotesData = { porData: [], porPercentual: [] };
                    }
                    
                    // Processar apenas lotes por data
                    data.dados.lotes.forEach(lote => {
                        if (lote.tipo === 'data') {
                            // Verificar se já existe
                            const existe = window.lotesData.porData.find(l => l.id === lote.id);
                            if (!existe) {
                                window.lotesData.porData.push({
                                    id: lote.id,
                                    nome: lote.nome,
                                    dataInicio: lote.data_inicio,
                                    dataFim: lote.data_fim,
                                    divulgar: lote.divulgar || false
                                });
                            }
                        }
                    });
                    
                    console.log('✅ Lotes recuperados:', window.lotesData.porData);
                }
            } catch (e) {
                console.error('Erro ao recuperar lotes:', e);
            }
        }
    }
    
    if (lotesData.porData.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        container.innerHTML = '';            return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Ordenar lotes por data de início
    const lotesOrdenados = [...lotesData.porData].sort((a, b) => {
        return new Date(a.dataInicio) - new Date(b.dataInicio);
    });
    
    let html = '';
    lotesOrdenados.forEach((lote, index) => {
        const dataInicioFormatada = formatarDataBrasil(lote.dataInicio);
        const dataFimFormatada = formatarDataBrasil(lote.dataFim);
        
        html += `
            <div class="lote-item" data-id="${lote.id}">
                <div class="lote-item-info">
                    <div class="lote-item-name">${lote.nome}</div>
                    <div class="lote-item-details">
                        ${dataInicioFormatada} até ${dataFimFormatada}
                        ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                    </div>
                </div>
                <div class="lote-item-actions">
                    <button class="btn-icon" onclick="editarLote('${lote.id}', 'data')" title="Editar lote">✏️</button>
                    <button class="btn-icon delete" onclick="excluirLoteData(${lote.id})" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('Lotes por data renderizados:', lotesData.porData.length);
}

// Função para renderizar lotes por percentual
function renderizarLotesPorPercentual() {
    console.log('🎨 renderizarLotesPorPercentual chamada');
    
    const container = document.getElementById('lotesPorPercentualList');
    const emptyState = document.getElementById('lotePercentualEmpty');
    
    // Verificar se os elementos existem
    if (!container) {
        console.error('Elemento lotesPorPercentualList não encontrado');            return;
    }
    
    if (!emptyState) {
        console.warn('Elemento lotePercentualEmpty não encontrado, mas continuando renderização');
    }
    
    // RECUPERAR LOTES DO WIZARDDATACOLLECTOR SE NECESSÁRIO
    if ((!window.lotesData || window.lotesData.porPercentual.length === 0) && window.WizardDataCollector) {
        console.log('🔄 Tentando recuperar lotes percentuais do WizardDataCollector...');
        
        const saved = localStorage.getItem('wizardDataCollector');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.dados && data.dados.lotes && data.dados.lotes.length > 0) {
                    console.log('📦 Lotes encontrados no WizardDataCollector');
                    
                    // Garantir estrutura
                    if (!window.lotesData) {
                        window.lotesData = { porData: [], porPercentual: [] };
                    }
                    
                    // Processar apenas lotes por percentual
                    data.dados.lotes.forEach(lote => {
                        if (lote.tipo === 'percentual') {
                            // Verificar se já existe
                            const existe = window.lotesData.porPercentual.find(l => l.id === lote.id);
                            if (!existe) {
                                window.lotesData.porPercentual.push({
                                    id: lote.id,
                                    nome: lote.nome,
                                    percentual: lote.percentual,
                                    divulgar: lote.divulgar || false
                                });
                            }
                        }
                    });
                    
                    console.log('✅ Lotes percentuais recuperados:', window.lotesData.porPercentual);
                }
            } catch (e) {
                console.error('Erro ao recuperar lotes percentuais:', e);
            }
        }
    }
    
    // Verificar empty state warning
    if (!emptyState) {
        console.warn('Elemento lotePercentualEmpty não encontrado, mas continuando renderização');
    }
    
    if (lotesData.porPercentual.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        container.innerHTML = '';            return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Ordenar lotes por percentual (crescente)
    const lotesOrdenados = [...lotesData.porPercentual].sort((a, b) => a.percentual - b.percentual);
    
    let html = '';
    lotesOrdenados.forEach(lote => {
        html += `
            <div class="lote-item" data-id="${lote.id}">
                <div class="lote-item-info">
                    <div class="lote-item-name">${lote.nome}</div>
                    <div class="lote-item-details">
                        Encerra aos ${lote.percentual}% das vendas
                        ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                    </div>
                </div>
                <div class="lote-item-actions">
                    <button class="btn-icon delete" onclick="excluirLotePercentual(${lote.id})" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('Lotes por percentual renderizados:', lotesData.porPercentual.length);
}

// Função para atualizar summary de percentuais
function atualizarSummaryPercentual() {
    // Removido - não é mais necessário mostrar totais
    const summary = document.getElementById('percentualSummary');
    if (summary) {
        summary.style.display = 'none';
    }
}

// Funções para editar lotes
function editarLoteData(id) {
    const lote = lotesData.porData.find(l => l.id === id);
    if (!lote) {
        console.error('Lote não encontrado:', id);            return;
    }
    
    // Verificar se elementos existem antes de preencher
    const campos = {
        'editLoteDataId': id,
        // 'editLoteDataNome': lote.nome, // Campo removido
        'editLoteDataInicio': lote.dataInicio,
        'editLoteDataFim': lote.dataFim
    };
    
    for (let [campoId, valor] of Object.entries(campos)) {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            elemento.value = valor;
        } else {
            console.error(`Elemento ${campoId} não encontrado`);
        }
    }
    
    const divulgarCheckbox = document.getElementById('editLoteDataDivulgar');
    if (divulgarCheckbox) {
        divulgarCheckbox.checked = lote.divulgar;
    }
    
    // Usar o sistema de modais correto
    if (window.LoteModalManager) {
        window.LoteModalManager.open('editLoteDataModal');
    } else if (window.openModal) {
        window.openModal('editLoteDataModal');
    } else {
        console.error('Sistema de modais não encontrado');
    }
}

function editarLotePercentual(id) {
    const lote = lotesData.porPercentual.find(l => l.id === id);
    if (!lote) {
        console.error('Lote não encontrado:', id);            return;
    }
    
    // Verificar se elementos existem antes de preencher
    const campos = {
        'editLotePercentualId': id,
        // 'editLotePercentualNome': lote.nome, // Campo removido
        'editLotePercentualValor': lote.percentual
    };
    
    for (let [campoId, valor] of Object.entries(campos)) {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            elemento.value = valor;
        } else {
            console.error(`Elemento ${campoId} não encontrado`);
        }
    }
    
    const divulgarCheckbox = document.getElementById('editLotePercentualDivulgar');
    if (divulgarCheckbox) {
        divulgarCheckbox.checked = lote.divulgar;
    }
    
    // Usar o sistema de modais correto
    if (window.LoteModalManager) {
        window.LoteModalManager.open('editLotePercentualModal');
    } else if (window.openModal) {
        window.openModal('editLotePercentualModal');
    } else {
        console.error('Sistema de modais não encontrado');
    }
}

// Funções para salvar edições
function salvarLoteData() {
    try {
        const id = parseInt(document.getElementById('editLoteDataId').value);
        
        // CORREÇÃO: Manter nome original do lote
        let nome = document.getElementById('editLoteDataNome')?.value;
        if (!nome || nome.trim() === '') {
            // Se não há campo nome ou está vazio, buscar nome original
            const loteOriginal = lotesData.porData.find(l => l.id === id);
            nome = loteOriginal?.nome || `Lote por Data ${id}`;
        }
        
        const dataInicio = document.getElementById('editLoteDataInicio').value;
        const dataFim = document.getElementById('editLoteDataFim').value;
        const divulgar = document.getElementById('editLoteDataDivulgar').checked;
        
        // Debug para verificar valores
        console.log('Salvando lote data:', { id, nome, dataInicio, dataFim, divulgar });
        console.log('Tipos:', typeof nome, typeof dataInicio, typeof dataFim);
        console.log('Valores vazios?', nome === '', dataInicio === '', dataFim === '');
        
        // Validações mais específicas
        if (!dataInicio || dataInicio === '' || dataInicio === null) {
            alert('Por favor, informe a data de início.');            return;
        }
        
        if (!dataFim || dataFim === '' || dataFim === null) {
            alert('Por favor, informe a data de fim.');            return;
        }
        
        // Verificar se as datas são válidas
        const dataInicioObj = new Date(dataInicio);
        const dataFimObj = new Date(dataFim);
        
        if (isNaN(dataInicioObj.getTime())) {
            alert('Data de início inválida.');            return;
        }
        
        if (isNaN(dataFimObj.getTime())) {
            alert('Data de fim inválida.');            return;
        }
        
        if (dataInicioObj >= dataFimObj) {
            alert('A data de início deve ser anterior à data de fim.');            return;
        }
        
        // Encontrar e atualizar lote
        const index = lotesData.porData.findIndex(l => l.id === id);
        if (index !== -1) {
            lotesData.porData[index] = {
                ...lotesData.porData[index],
                nome,
                dataInicio,
                dataFim,
                divulgar
            };
            
            console.log('Lote atualizado:', lotesData.porData[index]);
            
            // Renomear todos os lotes para manter ordem
            renomearLotesAutomaticamente();
            
            // CORREÇÃO: NÃO renderizar para preservar interface
            // renderizarLotesPorData(); // ❌ Esta função limpa todos os botões
            salvarLotesNoCookie();
            
            console.log('✅ Lote salvo sem recarregar interface');
            
            // Fechar modal
            if (typeof closeModal === 'function') {
                closeModal('editLoteDataModal');
            } else {
                // Fallback manual
                const modal = document.getElementById('editLoteDataModal');
                if (modal) {
                    modal.classList.remove('show');
                }
            }
        } else {
            console.error('Lote não encontrado para edição, ID:', id);
            alert('Erro: Lote não encontrado para edição.');
        }
    } catch (error) {
        console.error('Erro ao salvar lote por data:', error);
        alert('Erro inesperado ao salvar lote. Verifique o console.');
    }
}

function salvarLotePercentual() {
    const id = parseInt(document.getElementById('editLotePercentualId').value);
    const nome = `Lote Temp`; // Nome será atualizado pela função de renomear
    const percentual = parseInt(document.getElementById('editLotePercentualValor').value);
    const divulgar = document.getElementById('editLotePercentualDivulgar').checked;
    
    // Validações
    if (!percentual) {
        alert('Por favor, preencha todos os campos obrigatórios.');            return;
    }
    
    // Verificar se não ultrapassa 100% (excluindo o próprio lote)
    const totalOutros = lotesData.porPercentual
        .filter(l => l.id !== id)
        .reduce((sum, lote) => sum + lote.percentual, 0);
    
    if (totalOutros + percentual > 100) {
        alert(`Este percentual faria o total ultrapassar 100%. Disponível: ${100 - totalOutros}%`);            return;
    }
    
    // Encontrar e atualizar lote
    const index = lotesData.porPercentual.findIndex(l => l.id === id);
    if (index !== -1) {
        lotesData.porPercentual[index] = {
            ...lotesData.porPercentual[index],
            nome,
            percentual,
            divulgar
        };
        
        // Renomear todos os lotes para manter ordem
        renomearLotesAutomaticamente();
        
        renderizarLotesPorPercentual();
        atualizarSummaryPercentual();
        salvarLotesNoCookie();
        
        // Fechar modal
        if (typeof closeModal === 'function') {
            closeModal('editLotePercentualModal');
        } else {
            // Fallback manual
            const modal = document.getElementById('editLotePercentualModal');
            if (modal) {
                modal.classList.remove('show');
            }
        }
    }
}

// Funções para excluir lotes
function excluirLoteData(id) {
    // Verificar se há ingressos associados a este lote
    const lote = lotesData.porData.find(l => l.id === id);
    if (lote && verificarIngressosNoLote(lote.id)) {
        alert('Não é possível excluir este lote pois existem ingressos associados a ele. Exclua os ingressos primeiro.');            return;
    }
    
    if (confirm('Tem certeza que deseja excluir este lote?')) {
        lotesData.porData = lotesData.porData.filter(l => l.id !== id);
        renomearLotesAutomaticamente();
        renderizarLotesPorData();
        salvarLotesNoCookie();
    }
}

function excluirLotePercentual(id) {
    // Verificar se há ingressos associados a este lote
    const lote = lotesData.porPercentual.find(l => l.id === id);
    if (lote && verificarIngressosNoLote(lote.id)) {
        alert('Não é possível excluir este lote pois existem ingressos associados a ele. Exclua os ingressos primeiro.');            return;
    }
    
    if (confirm('Tem certeza que deseja excluir este lote?')) {
        lotesData.porPercentual = lotesData.porPercentual.filter(l => l.id !== id);
        renomearLotesAutomaticamente();
        renderizarLotesPorPercentual();
        atualizarSummaryPercentual();
        salvarLotesNoCookie();
    }
}

// Função para verificar se há ingressos no lote
function verificarIngressosNoLote(loteId) {
    // Verificar em ingressos temporários
    if (window.temporaryTickets && window.temporaryTickets.tickets) {
        const temIngresso = window.temporaryTickets.tickets.some(ticket => 
            ticket.loteId === loteId || ticket.lote_id === loteId
        );
        if (temIngresso) return true;
    }
    
    // Verificar na lista visual
    const ticketItems = document.querySelectorAll('.ticket-item');
    for (let item of ticketItems) {
        const ticketLoteId = item.dataset.loteId || item.getAttribute('data-lote-id');
        if (ticketLoteId == loteId) return true;
    }
    
    return false;
}

// Função para validar lotes antes de avançar
function validarLotes() {
    const totalLotes = lotesData.porData.length + lotesData.porPercentual.length;
    
    if (totalLotes === 0) {
        document.getElementById('validation-step-5').style.display = 'block';
        document.getElementById('validation-step-5').textContent = 'Por favor, configure pelo menos um lote para continuar.';
        return false;
    }
    
    // Para lotes por percentual: verificar se pelo menos um tem 100%
    if (lotesData.porPercentual.length > 0) {
        const temCem = lotesData.porPercentual.some(lote => lote.percentual === 100);
        if (!temCem) {
            document.getElementById('validation-step-5').style.display = 'block';
            document.getElementById('validation-step-5').textContent = 'Pelo menos um lote deve ter 100% de percentual.';
            return false;
        }
        
        // Verificar se não há percentuais duplicados
        const percentuais = lotesData.porPercentual.map(l => l.percentual);
        const percentuaisUnicos = [...new Set(percentuais)];
        if (percentuais.length !== percentuaisUnicos.length) {
            document.getElementById('validation-step-5').style.display = 'block';
            document.getElementById('validation-step-5').textContent = 'Os percentuais dos lotes não podem ser iguais.';
            return false;
        }
    }
    
    document.getElementById('validation-step-5').style.display = 'none';
    return true;
}

// Funções utilitárias
function formatDateTimeLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatarDataBrasil(dateTimeLocal) {
    const date = new Date(dateTimeLocal);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funções para salvar/carregar do cookie
function salvarLotesNoCookie() {
    // Salvar apenas os lotes, não todo o wizard
    setCookie('lotesData', JSON.stringify(lotesData), 7); // 7 dias
    
    // TAMBÉM SALVAR NO WIZARDDATACOLLECTOR
    if (window.WizardDataCollector) {
        console.log('💾 Salvando lotes no WizardDataCollector');
        
        window.WizardDataCollector.dados.lotes = [];
        
        // Lotes por data
        if (lotesData.porData) {
            lotesData.porData.forEach(lote => {
                window.WizardDataCollector.dados.lotes.push({
                    id: lote.id,
                    tipo: 'data',
                    nome: lote.nome,
                    data_inicio: lote.dataInicio,
                    data_fim: lote.dataFim,
                    divulgar: lote.divulgar || false
                });
            });
        }
        
        // Lotes por percentual
        if (lotesData.porPercentual) {
            lotesData.porPercentual.forEach(lote => {
                window.WizardDataCollector.dados.lotes.push({
                    id: lote.id,
                    tipo: 'percentual',
                    nome: lote.nome,
                    percentual: lote.percentual,
                    divulgar: lote.divulgar || false
                });
            });
        }
        
        // Salvar no localStorage
        localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
        console.log('✅ Lotes salvos no WizardDataCollector:', window.WizardDataCollector.dados.lotes);
    }
}

function carregarLotesDoCookie() {
    try {
        const dadosSalvos = getCookie('lotesData');
        if (dadosSalvos) {
            lotesData = JSON.parse(dadosSalvos);
            console.log('Lotes carregados do cookie:', lotesData);
            
            // Renderizar os lotes carregados
            renderizarLotesPorData();
            renderizarLotesPorPercentual();
            atualizarSummaryPercentual();
        }
    } catch (error) {
        console.log('Erro ao carregar lotes do cookie:', error);
    }
}

// Função para limpar todos os lotes
window.limparTodosLotes = function() {
    lotesData = {
        porData: [],
        porPercentual: []
    };
    
    // Limpar o cookie
    setCookie('lotesData', '', -1);
    
    // Limpar a interface
    renderizarLotesPorData();
    renderizarLotesPorPercentual();
    atualizarSummaryPercentual();
    
    console.log('Todos os lotes foram limpos');
};

// Funções de cookie auxiliares
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function obterDadosWizard() {
    // Esta função deve retornar todos os dados do wizard
    // Por agora, retornar objeto vazio, será integrada com o sistema existente
    return {};
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de lotes iniciando...');
    
    // Verificar se estamos na página correta
    if (!document.getElementById('lotesPorDataList')) {
        console.log('Página não é o novo evento, sistema de lotes não carregado');            return;
    }
    
    console.log('Elementos DOM encontrados');
    
    // Debug para os botões
    const btnData = document.querySelector('button[onclick*="adicionarLotePorData"]');
    const btnPercentual = document.querySelector('button[onclick*="adicionarLotePorPercentual"]');
    
    console.log('Botão Lote Data encontrado:', btnData);
    console.log('Botão Lote Percentual encontrado:', btnPercentual);
    
    // NÃO carregar lotes automaticamente - apenas quando o usuário pedir
    // A função carregarLotesDoCookie será chamada pelo sistema principal se necessário
});

// Adicionar funções às exportações
if (typeof window.restaurarLotes !== 'function') {
    console.error('❌ ERRO: window.restaurarLotes não foi definida corretamente!');
} else {
    console.log('✅ window.restaurarLotes está disponível');
}

// Garantir que outras funções estão disponíveis globalmente
window.adicionarLotePorData = adicionarLotePorData;
window.adicionarLotePorPercentual = adicionarLotePorPercentual;

// Integração com sistema de steps existente
window.validarStep5 = function() {
    return validarLotes();
};

console.log('✅ Sistema de lotes carregado completamente');
        if (modal) {
            // Prevenir que cliques dentro do modal fechem ele
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    e.stopPropagation();
                }
            });
        }
    });
    
    // Garantir que as funções estejam disponíveis globalmente
    window.adicionarLotePorData = adicionarLotePorData;
    window.adicionarLotePorPercentual = adicionarLotePorPercentual;
});

// Integração com sistema de steps existente
// Esta função deve ser chamada quando o usuário tentar avançar do step 5
function validarStep5() {
    return validarLotes();
}
