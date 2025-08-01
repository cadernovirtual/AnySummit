/**
 * Gestão de Lotes para Novo Evento
 * AnySummit - Sistema de Gestão de Eventos
 */

// Armazenamento temporário dos lotes
window.lotesData = {
    porData: [],
    porPercentual: []
};

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
window.validarLotes = validarLotes;
window.carregarLotesDoCookie = carregarLotesDoCookie;

// Funções para abrir modais
function adicionarLotePorData() {
    try {
        console.log('=== INICIANDO adicionarLotePorData ===');
        console.log('Botão clicado, função executada');
        
        // Verificar se modal existe
        const modal = document.getElementById('loteDataModal');
        if (!modal) {
            console.error('Modal loteDataModal não encontrado no DOM!');
            alert('Erro: Modal não encontrado. Verifique se o HTML do modal existe.');
            return;
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
            alert('Erro: Modal não encontrado. Verifique se o HTML do modal existe.');
            return;
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
            alert('Por favor, informe a data de início.');
            return;
        }
        
        if (!dataFim || dataFim === '' || dataFim === null) {
            alert('Por favor, informe a data de fim.');
            return;
        }
        
        // Verificar se as datas são válidas
        const dataInicioObj = new Date(dataInicio);
        const dataFimObj = new Date(dataFim);
        
        if (isNaN(dataInicioObj.getTime())) {
            alert('Data de início inválida.');
            return;
        }
        
        if (isNaN(dataFimObj.getTime())) {
            alert('Data de fim inválida.');
            return;
        }
        
        if (dataInicioObj >= dataFimObj) {
            alert('A data de início deve ser anterior à data de fim.');
            return;
        }
        
        // Verificar se não ultrapassa a data do evento
        const eventoDataInicio = document.getElementById('startDateTime')?.value;
        if (eventoDataInicio) {
            const dataEvento = new Date(eventoDataInicio);
            if (dataFimObj >= dataEvento) {
                alert('A data fim do lote não pode ser posterior ou igual à data do evento.');
                return;
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
                alert('As datas do lote não podem ter intersecção com outros lotes existentes.');
                return;
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
            alert('Por favor, informe um percentual válido entre 1 e 100.');
            return;
        }
        
        // Verificar se já existe lote com o mesmo percentual
        const loteComMesmoPercentual = lotesData.porPercentual.find(l => l.percentual === percentual);
        if (loteComMesmoPercentual) {
            alert('Já existe um lote com este percentual. Os percentuais não podem coincidir.');
            return;
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
        
        // Adicionar à lista
        lotesData.porPercentual.push(lote);
        
        // Renomear todos os lotes para manter ordem
        renomearLotesAutomaticamente();
        
        console.log('Lista atual de lotes:', lotesData.porPercentual);
        
        // Atualizar interface
        renderizarLotesPorPercentual();
        atualizarSummaryPercentual();
        salvarLotesNoCookie();
        
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
    const container = document.getElementById('lotesPorDataList');
    const emptyState = document.getElementById('loteDataEmpty');
    
    // Verificar se os elementos existem
    if (!container) {
        console.error('Elemento lotesPorDataList não encontrado');
        return;
    }
    
    if (!emptyState) {
        console.warn('Elemento loteDataEmpty não encontrado, mas continuando renderização');
        // Não retornar, continuar mesmo sem o empty state
    }
    
    if (lotesData.porData.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        container.innerHTML = '';
        return;
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
    const container = document.getElementById('lotesPorPercentualList');
    const emptyState = document.getElementById('lotePercentualEmpty');
    
    // Verificar se os elementos existem
    if (!container) {
        console.error('Elemento lotesPorPercentualList não encontrado');
        return;
    }
    
    if (!emptyState) {
        console.warn('Elemento lotePercentualEmpty não encontrado, mas continuando renderização');
        // Não retornar, continuar mesmo sem o empty state
    }
    
    if (lotesData.porPercentual.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        container.innerHTML = '';
        return;
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
        console.error('Lote não encontrado:', id);
        return;
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
        console.error('Lote não encontrado:', id);
        return;
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
        const nome = `Lote Temp`; // Nome será atualizado pela função de renomear
        const dataInicio = document.getElementById('editLoteDataInicio').value;
        const dataFim = document.getElementById('editLoteDataFim').value;
        const divulgar = document.getElementById('editLoteDataDivulgar').checked;
        
        // Debug para verificar valores
        console.log('Salvando lote data:', { id, nome, dataInicio, dataFim, divulgar });
        console.log('Tipos:', typeof nome, typeof dataInicio, typeof dataFim);
        console.log('Valores vazios?', nome === '', dataInicio === '', dataFim === '');
        
        // Validações mais específicas
        if (!dataInicio || dataInicio === '' || dataInicio === null) {
            alert('Por favor, informe a data de início.');
            return;
        }
        
        if (!dataFim || dataFim === '' || dataFim === null) {
            alert('Por favor, informe a data de fim.');
            return;
        }
        
        // Verificar se as datas são válidas
        const dataInicioObj = new Date(dataInicio);
        const dataFimObj = new Date(dataFim);
        
        if (isNaN(dataInicioObj.getTime())) {
            alert('Data de início inválida.');
            return;
        }
        
        if (isNaN(dataFimObj.getTime())) {
            alert('Data de fim inválida.');
            return;
        }
        
        if (dataInicioObj >= dataFimObj) {
            alert('A data de início deve ser anterior à data de fim.');
            return;
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
            
            renderizarLotesPorData();
            salvarLotesNoCookie();
            
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
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Verificar se não ultrapassa 100% (excluindo o próprio lote)
    const totalOutros = lotesData.porPercentual
        .filter(l => l.id !== id)
        .reduce((sum, lote) => sum + lote.percentual, 0);
    
    if (totalOutros + percentual > 100) {
        alert(`Este percentual faria o total ultrapassar 100%. Disponível: ${100 - totalOutros}%`);
        return;
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
    if (confirm('Tem certeza que deseja excluir este lote?')) {
        lotesData.porData = lotesData.porData.filter(l => l.id !== id);
        renomearLotesAutomaticamente();
        renderizarLotesPorData();
        salvarLotesNoCookie();
    }
}

function excluirLotePercentual(id) {
    if (confirm('Tem certeza que deseja excluir este lote?')) {
        lotesData.porPercentual = lotesData.porPercentual.filter(l => l.id !== id);
        renomearLotesAutomaticamente();
        renderizarLotesPorPercentual();
        atualizarSummaryPercentual();
        salvarLotesNoCookie();
    }
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
        console.log('Página não é o novo evento, sistema de lotes não carregado');
        return;
    }
    
    console.log('Elementos DOM encontrados');
    
    // Debug para os botões
    const btnData = document.querySelector('button[onclick*="adicionarLotePorData"]');
    const btnPercentual = document.querySelector('button[onclick*="adicionarLotePorPercentual"]');
    
    console.log('Botão Lote Data encontrado:', btnData);
    console.log('Botão Lote Percentual encontrado:', btnPercentual);
    
    // NÃO carregar lotes automaticamente - apenas quando o usuário pedir
    // A função carregarLotesDoCookie será chamada pelo sistema principal se necessário
    
    // Adicionar event listeners para prevenir propagação de eventos
    const modals = ['loteDataModal', 'lotePercentualModal', 'editLoteDataModal', 'editLotePercentualModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
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
