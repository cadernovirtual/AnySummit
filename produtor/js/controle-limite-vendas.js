/**
 * CONTROLE DE LIMITE DE VENDAS - EXCLUSÃO AUTOMÁTICA DE LOTES
 */

console.log('🎛️ CONTROLE-LIMITE-VENDAS.JS CARREGANDO...');

/**
 * Função específica para o onchange do checkbox (CORREÇÃO PROBLEMA 1)
 */
window.handleControleVendasChange = async function(event) {
    const isChecked = event.target.checked;
    console.log('🎛️ [ONCHANGE] Controle de limite alterado:', isChecked ? 'ATIVADO' : 'DESATIVADO');
    
    // CORREÇÃO PROBLEMA 1: Controlar visibilidade do campo lotação máxima
    controlarVisibilidadeLotacaoMaxima(isChecked);
    
    if (!isChecked) {
        // CORREÇÃO: Bloquear mudança do checkbox até decisão
        event.preventDefault();
        event.target.checked = true; // Manter marcado temporariamente
        
        console.log('🔍 Verificando se pode desmarcar checkbox...');
        
        // Verificar se há lotes por quantidade
        await verificarEPermitirDesmarcacao(event.target);
    }
};

/**
 * CORREÇÃO PROBLEMA 1: Controlar visibilidade dos campos de lotação máxima
 */
function controlarVisibilidadeLotacaoMaxima(mostrar) {
    console.log('👁️ Controlando visibilidade dos campos de lotação:', mostrar ? 'MOSTRAR' : 'ESCONDER');
    
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    
    if (campoLimite) {
        campoLimite.style.display = mostrar ? 'block' : 'none';
        console.log('📱 Campo limite vendas:', mostrar ? 'visível' : 'escondido');
    }
    
    if (btnConfirmar) {
        btnConfirmar.style.display = mostrar ? 'inline-block' : 'none';
        console.log('🔘 Botão confirmar:', mostrar ? 'visível' : 'escondido');
    }
}

/**
 * CORREÇÃO PROBLEMA 1: Aplicar visibilidade na carga inicial
 */
function aplicarVisibilidadeInicial() {
    console.log('🔄 Aplicando visibilidade inicial dos campos...');
    
    setTimeout(() => {
        const checkbox = document.getElementById('controlar_limite_vendas');
        if (checkbox) {
            const isChecked = checkbox.checked;
            console.log('📋 Estado inicial do checkbox:', isChecked);
            controlarVisibilidadeLotacaoMaxima(isChecked);
        } else {
            console.warn('⚠️ Checkbox não encontrado para aplicar visibilidade inicial');
        }
    }, 500);
}

/**
 * Verificar se pode desmarcar e gerenciar processo
 */
async function verificarEPermitirDesmarcacao(checkbox) {
    console.log('🔍 Verificando lotes por quantidade e ingressos...');
    
    try {
        // Carregar lotes do banco
        let lotes = [];
        if (typeof window.carregarLotesDoBanco === 'function') {
            lotes = await window.carregarLotesDoBanco();
        }
        
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        
        if (lotesPorQuantidade.length === 0) {
            console.log('✅ Nenhum lote por quantidade - pode desmarcar');
            checkbox.checked = false;
            controlarVisibilidadeLotacaoMaxima(false);
            return;
        }
        
        console.log(`📊 Encontrados ${lotesPorQuantidade.length} lotes por quantidade:`, lotesPorQuantidade);
        
        // Verificar se há ingressos relacionados a esses lotes
        let temIngressos = false;
        for (const lote of lotesPorQuantidade) {
            try {
                const resultado = await verificarIngressosNoLote(lote.id);
                if (resultado) {
                    temIngressos = true;
                    break;
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao verificar ingressos do lote ${lote.id}:`, error);
            }
        }
        
        if (temIngressos) {
            // Se há ingressos, mostrar mensagem e manter marcado
            console.log('❌ Existem ingressos relacionados aos lotes por quantidade');
            
            // CORREÇÃO PROBLEMA 2: Aguardar dialog de forma síncrona
            await mostrarDialogSincrono('Para desmarcar essa opção será necessário excluir todos os ingressos e lotes controlados pela quantidade de vendas. Você precisa excluir esses ingressos e os lotes.', 'OK');
            
            // Manter checkbox marcado - RETURN AQUI para sair da função
            checkbox.checked = true;
            controlarVisibilidadeLotacaoMaxima(true);
            console.log('🔒 Checkbox mantido marcado - há ingressos');
            return; // IMPORTANTE: Sair da função aqui
        }
        
        // Se não há ingressos, perguntar se quer excluir lotes
        const nomes = lotesPorQuantidade.map(l => l.nome).join(', ');
        
        // CORREÇÃO PROBLEMA 2: Aguardar confirmação de forma síncrona
        const confirmacao = await mostrarDialogSincrono(
            `Para desmarcar o controle de limite será necessário excluir os seguintes lotes por quantidade:\n\n` +
            `${nomes}\n\n` +
            `Deseja continuar e excluir esses lotes?`,
            'CONFIRMAR_CANCELAR'
        );
        
        if (!confirmacao) {
            console.log('❌ Usuário cancelou - mantendo checkbox marcado');
            checkbox.checked = true;
            controlarVisibilidadeLotacaoMaxima(true);
            return; // IMPORTANTE: Sair da função aqui quando cancelar
        }
        
        console.log('✅ Confirmação recebida - prosseguindo com exclusão dos lotes');
        
        // Só chega aqui se o usuário realmente confirmou a exclusão
        // Excluir cada lote por quantidade
        for (const lote of lotesPorQuantidade) {
            try {
                console.log(`🗑️ Excluindo lote ${lote.nome} (ID: ${lote.id})`);
                
                if (typeof window.fazerRequisicaoAPI === 'function') {
                    await window.fazerRequisicaoAPI('excluir_lote_especifico', {
                        lote_id: lote.id
                    });
                } else {
                    await fazerRequisicaoAPILocal('excluir_lote_especifico', {
                        lote_id: lote.id
                    });
                }
                
                console.log(`✅ Lote ${lote.nome} excluído com sucesso`);
                
            } catch (error) {
                console.error(`❌ Erro ao excluir lote ${lote.nome}:`, error);
            }
        }
        
        // Renomear lotes restantes
        console.log('🔄 Renomeando lotes restantes...');
        try {
            if (typeof window.fazerRequisicaoAPI === 'function') {
                await window.fazerRequisicaoAPI('renomear_lotes_sequencial');
            } else {
                await fazerRequisicaoAPILocal('renomear_lotes_sequencial');
            }
            console.log('✅ Lotes renomeados sequencialmente');
        } catch (error) {
            console.error('❌ Erro na renomeação:', error);
        }
        
        // CORREÇÃO: Só desmarca se chegou até aqui (usuário confirmou)
        checkbox.checked = false;
        console.log('✅ Checkbox desmarcado após exclusão bem-sucedida');
        
        // CORREÇÃO: Esconder controles de limitação após exclusão
        controlarVisibilidadeLotacaoMaxima(false);
        
        // Invalidar cache e atualizar interface
        if (typeof window.invalidarCacheLotes === 'function') {
            window.invalidarCacheLotes();
        }
        
        if (typeof window.renderizarLotesUnificado === 'function') {
            setTimeout(() => {
                window.renderizarLotesUnificado();
            }, 500);
        }
        
        console.log('✅ Processo de desmarcação concluído com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na verificação/exclusão de lotes por quantidade:', error);
        await mostrarDialogSincrono('Erro ao processar lotes por quantidade: ' + error.message, 'OK');
        checkbox.checked = true; // Manter marcado em caso de erro
        controlarVisibilidadeLotacaoMaxima(true);
    }
}

/**
 * CORREÇÃO PROBLEMA 2: Dialog síncrono que PARA tudo até ter resposta
 */
function mostrarDialogSincrono(mensagem, tipo = 'OK') {
    return new Promise((resolve) => {
        console.log('🛑 PARANDO TUDO - aguardando resposta do dialog...');
        
        if (tipo === 'OK') {
            // Apenas informação
            alert(mensagem);
            console.log('✅ Dialog OK confirmado');
            resolve(true);
        } else if (tipo === 'CONFIRMAR_CANCELAR') {
            // Confirmação sim/não
            const resultado = confirm(mensagem);
            console.log('✅ Dialog confirmação respondido:', resultado ? 'CONFIRMOU' : 'CANCELOU');
            resolve(resultado);
        }
    });
}

/**
 * Esconder controles de limitação quando checkbox desmarcado
 */
function esconderControlesLimitacao() {
    console.log('👁️ Escondendo controles de limitação...');
    
    // Esconder campo de limite máximo
    const limiteField = document.getElementById('limiteVendasField');
    if (limiteField) {
        limiteField.style.display = 'none';
        console.log('✅ Campo limite vendas escondido');
    }
    
    // Esconder qualquer outro controle relacionado
    const limiteInput = document.getElementById('limite_vendas');
    if (limiteInput) {
        limiteInput.value = '';
        console.log('✅ Valor limite vendas limpo');
    }
}

/**
 * Monitorar mudanças no checkbox de controle de limite
 */
function monitorarControleVendasCheckbox() {
    const checkbox = document.getElementById('controlar_limite_vendas');
    
    if (!checkbox) {
        console.warn('⚠️ Checkbox controlar_limite_vendas não encontrado');
        return;
    }
    
    console.log('✅ Monitoramento do checkbox de controle iniciado');
    
    // Função para lidar com mudanças
    async function handleControleChange(event) {
        const isChecked = event.target.checked;
        console.log('🎛️ Controle de limite alterado:', isChecked ? 'ATIVADO' : 'DESATIVADO');
        
        if (!isChecked) {
            // Quando desmarcado, verificar se há lotes por quantidade
            await verificarEExcluirLotesQuantidade();
        }
    }
    
    // Adicionar listener (além do onclick)
    checkbox.addEventListener('change', handleControleChange);
    
    console.log('👂 Event listener adicionado ao checkbox');
}

/**
 * Verificar se há lotes por quantidade e ingressos relacionados
 */
async function verificarEExcluirLotesQuantidade() {
    console.log('🔍 Verificando lotes por quantidade e ingressos...');
    
    try {
        // Carregar lotes do banco
        let lotes = [];
        if (typeof window.carregarLotesDoBanco === 'function') {
            lotes = await window.carregarLotesDoBanco();
        }
        
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        
        if (lotesPorQuantidade.length === 0) {
            console.log('✅ Nenhum lote por quantidade encontrado');
            return;
        }
        
        console.log(`📊 Encontrados ${lotesPorQuantidade.length} lotes por quantidade:`, lotesPorQuantidade);
        
        // Verificar se há ingressos relacionados a esses lotes
        let temIngressos = false;
        for (const lote of lotesPorQuantidade) {
            try {
                const resultado = await verificarIngressosNoLote(lote.id);
                if (resultado) {
                    temIngressos = true;
                    break;
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao verificar ingressos do lote ${lote.id}:`, error);
            }
        }
        
        if (temIngressos) {
            // Se há ingressos, mostrar mensagem de erro e reativar checkbox
            console.log('❌ Existem ingressos relacionados aos lotes por quantidade');
            
            alert('Para desmarcar essa opção será necessário excluir todos os ingressos e lotes controlados pela quantidade de vendas. Você precisa excluir esses ingressos e os lotes.');
            
            // Reativar o checkbox
            const checkbox = document.getElementById('controlar_limite_vendas');
            if (checkbox) {
                checkbox.checked = true;
            }
            return;
        }
        
        // Se não há ingressos, prosseguir com confirmação
        const nomes = lotesPorQuantidade.map(l => l.nome).join(', ');
        const confirmacao = confirm(
            `O controle de limite de vendas foi desativado.\n\n` +
            `Existem ${lotesPorQuantidade.length} lote(s) por quantidade que serão automaticamente excluídos:\n` +
            `${nomes}\n\n` +
            `Deseja continuar?`
        );
        
        if (!confirmacao) {
            console.log('❌ Usuário cancelou - reativando controle');
            // Reativar o checkbox
            const checkbox = document.getElementById('controlar_limite_vendas');
            if (checkbox) {
                checkbox.checked = true;
            }
            return;
        }
        
        console.log('✅ Confirmação recebida - excluindo lotes por quantidade');
        
        // Excluir cada lote por quantidade
        for (const lote of lotesPorQuantidade) {
            try {
                console.log(`🗑️ Excluindo lote ${lote.nome} (ID: ${lote.id})`);
                
                // Usar função global exportada
                if (typeof window.fazerRequisicaoAPI === 'function') {
                    await window.fazerRequisicaoAPI('excluir_lote_especifico', {
                        lote_id: lote.id
                    });
                } else {
                    await fazerRequisicaoAPILocal('excluir_lote_especifico', {
                        lote_id: lote.id
                    });
                }
                
                console.log(`✅ Lote ${lote.nome} excluído com sucesso`);
                
            } catch (error) {
                console.error(`❌ Erro ao excluir lote ${lote.nome}:`, error);
            }
        }
        
        // Renomear lotes restantes
        console.log('🔄 Renomeando lotes restantes...');
        try {
            if (typeof window.fazerRequisicaoAPI === 'function') {
                await window.fazerRequisicaoAPI('renomear_lotes_sequencial');
            } else {
                await fazerRequisicaoAPILocal('renomear_lotes_sequencial');
            }
            console.log('✅ Lotes renomeados sequencialmente');
        } catch (error) {
            console.error('❌ Erro na renomeação:', error);
        }
        
        // Invalidar cache e atualizar interface
        if (typeof window.invalidarCacheLotes === 'function') {
            window.invalidarCacheLotes();
        }
        
        if (typeof window.renderizarLotesUnificado === 'function') {
            setTimeout(() => {
                window.renderizarLotesUnificado();
            }, 500);
        }
        
        console.log('✅ Exclusão automática de lotes por quantidade concluída');
        
    } catch (error) {
        console.error('❌ Erro na verificação/exclusão de lotes por quantidade:', error);
        alert('Erro ao processar lotes por quantidade: ' + error.message);
    }
}

/**
 * Verificar se há ingressos associados ao lote
 */
async function verificarIngressosNoLote(loteId) {
    console.log('🔍 Verificando ingressos no lote:', loteId);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        // Modo novo evento: verificar ingressos temporários
        if (window.temporaryTickets?.tickets) {
            const temIngresso = window.temporaryTickets.tickets.some(ticket => 
                ticket.loteId === loteId || ticket.lote_id === loteId
            );
            console.log('📊 Ingressos temporários:', temIngresso ? 'encontrados' : 'não encontrados');
            return temIngresso;
        }
        return false;
    }
    
    try {
        const resultado = await fazerRequisicaoAPILocal('verificar_ingressos_lote', {
            lote_id: loteId
        });
        
        const temIngressos = resultado.tem_ingressos || false;
        console.log('📊 Ingressos no banco:', temIngressos ? 'encontrados' : 'não encontrados');
        
        return temIngressos;
    } catch (error) {
        console.error('❌ Erro ao verificar ingressos:', error);
        return false; // Em caso de erro, assumir que não há ingressos
    }
}

/**
 * Função para fazer requisições à API (implementação local)
 */
async function fazerRequisicaoAPILocal(action, dados = {}) {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    const body = new URLSearchParams({
        action,
        evento_id: eventoId || '',
        ...dados
    });
    
    const response = await fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const textResponse = await response.text();
    
    // Tentar extrair JSON
    let jsonData = null;
    try {
        jsonData = JSON.parse(textResponse);
    } catch (parseError) {
        const lines = textResponse.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('{') && line.endsWith('}')) {
                try {
                    jsonData = JSON.parse(line);
                    break;
                } catch (e) {
                    continue;
                }
            }
        }
        
        if (!jsonData) {
            throw new Error('Resposta da API não contém JSON válido');
        }
    }
    
    if (!jsonData.sucesso) {
        throw new Error(jsonData.erro || 'Erro desconhecido na API');
    }
    
    return jsonData;
}

// Inicializar monitoramento quando DOM estiver pronto
function inicializarControleVendas() {
    console.log('🚀 Inicializando controle de limite de vendas...');
    
    // Verificar se função global está disponível
    console.log('🔍 Verificando função global fazerRequisicaoAPI:', typeof window.fazerRequisicaoAPI);
    
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(() => {
        console.log('🔍 Verificando novamente função global fazerRequisicaoAPI:', typeof window.fazerRequisicaoAPI);
        monitorarControleVendasCheckbox();
    }, 1000);
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarControleVendas);
} else {
    inicializarControleVendas();
}

// CORREÇÃO PROBLEMA 1: Aplicar visibilidade inicial também
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarVisibilidadeInicial);
} else {
    aplicarVisibilidadeInicial();
}

console.log('✅ CONTROLE-LIMITE-VENDAS.JS CARREGADO!');
console.log('🔧 Funcionalidades:');
console.log('  - Monitora checkbox controlar_limite_vendas');
console.log('  - Exclui automaticamente lotes por quantidade quando desmarcado');
console.log('  - Renomeia lotes restantes sequencialmente');
