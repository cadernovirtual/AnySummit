/**
 * SISTEMA DE LOTES MYSQL - SUBSTITUIÇÃO COMPLETA DOS COOKIES
 * 
 * Este arquivo implementa todas as operações de lotes diretamente no MySQL,
 * seguindo as regras de negócio definidas no CORRECAO_LOTES.md
 * 
 * FUNCIONALIDADES:
 * - Criação de lotes por data e quantidade
 * - Edição com validações específicas
 * - Exclusão com verificação de ingressos
 * - Renomeação automática sequencial
 * - Validações de períodos e percentuais
 */

console.log('🗄️ SISTEMA-LOTES-MYSQL.JS CARREGANDO...');

// ========== CONFIGURAÇÕES GLOBAIS ==========

// Estado global para evitar operações simultâneas
window.lotesOperationLock = false;

// Cache para otimizar consultas
window.lotesCache = {
    data: null,
    timestamp: 0,
    ttl: 30000 // 30 segundos
};

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Obter ID do evento da URL
 */
function obterEventoId() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    if (!eventoId) {
        console.warn('⚠️ evento_id não encontrado na URL - modo novo evento');
        return null;
    }
    return parseInt(eventoId);
}

/**
 * Fazer requisição para a API
 */
async function fazerRequisicaoAPI(action, dados = {}) {
    const eventoId = obterEventoId();
    
    const body = new URLSearchParams({
        action,
        evento_id: eventoId || '',
        ...dados
    });
    
    try {
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
        console.log('📡 Resposta bruta da API:', textResponse);
        
        // Tentar extrair JSON da resposta (pode ter HTML misturado)
        let jsonData = null;
        
        try {
            // Tentar parsear diretamente
            jsonData = JSON.parse(textResponse);
        } catch (parseError) {
            // Se falhar, tentar encontrar JSON na resposta
            const lines = textResponse.split('\n');
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('{') && line.endsWith('}')) {
                    try {
                        jsonData = JSON.parse(line);
                        console.log('✅ JSON extraído da linha:', line);
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            }
            
            if (!jsonData) {
                console.error('❌ Nenhum JSON válido encontrado na resposta');
                throw new Error('Resposta da API não contém JSON válido');
            }
        }
        
        if (!jsonData.sucesso) {
            throw new Error(jsonData.erro || 'Erro desconhecido na API');
        }
        
        return jsonData;
        
    } catch (error) {
        console.error(`❌ Erro na requisição ${action}:`, error);
        throw error;
    }
}

/**
 * Invalidar cache de lotes
 */
function invalidarCacheLotes() {
    window.lotesCache.data = null;
    window.lotesCache.timestamp = 0;
    console.log('🗑️ Cache de lotes invalidado');
}

/**
 * Validar se operação pode ser executada
 */
function validarOperacao(operacao) {
    if (window.lotesOperationLock) {
        console.warn(`⚠️ Operação ${operacao} bloqueada - operação em andamento`);
        return false;
    }
    
    const eventoId = obterEventoId();
    if (!eventoId) {
        console.warn(`⚠️ Operação ${operacao} em modo novo evento - dados temporários`);
        return true; // Permitir em modo novo evento
    }
    
    return true;
}

// ========== FUNÇÕES DE LOTES POR DATA ==========

/**
 * Criar lote por data no MySQL
 */
window.criarLoteData = async function(dadosLote) {
    console.log('📅 Criando lote por data:', dadosLote);
    
    if (!validarOperacao('criarLoteData')) {
        throw new Error('Operação bloqueada');
    }
    
    window.lotesOperationLock = true;
    
    try {
        // Validações
        if (!dadosLote.dataInicio || !dadosLote.dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }
        
        const dataInicio = new Date(dadosLote.dataInicio);
        const dataFim = new Date(dadosLote.dataFim);
        
        if (dataInicio >= dataFim) {
            throw new Error('Data de início deve ser anterior à data fim');
        }
        
        const eventoId = obterEventoId();
        
        if (eventoId) {
            // Salvar no MySQL usando API melhorada
            const resultado = await fazerRequisicaoAPI('criar_lote_data_com_renomeacao', {
                data_inicio: dadosLote.dataInicio,
                data_fim: dadosLote.dataFim,
                divulgar_criterio: dadosLote.divulgar ? 1 : 0,
                percentual_aumento_valor: dadosLote.percentualAumento || 0
            });
            
            console.log('✅ Lote por data criado no MySQL:', resultado);
            
            // Invalidar cache
            invalidarCacheLotes();
            
            return resultado.lote_id;
        } else {
            // Modo novo evento - armazenar temporariamente
            console.log('📝 Armazenando lote por data temporariamente (novo evento)');
            
            if (!window.lotesTemporarios) {
                window.lotesTemporarios = { porData: [], porQuantidade: [] };
            }
            
            const loteTemp = {
                id: Date.now(),
                nome: `Lote ${window.lotesTemporarios.porData.length + 1}`,
                tipo: 'data',
                dataInicio: dadosLote.dataInicio,
                dataFim: dadosLote.dataFim,
                divulgar: Boolean(dadosLote.divulgar),
                percentualAumento: dadosLote.percentualAumento || 0
            };
            
            window.lotesTemporarios.porData.push(loteTemp);
            
            return loteTemp.id;
        }
        
    } finally {
        window.lotesOperationLock = false;
    }
};

/**
 * Editar lote por data
 */
window.editarLoteData = async function(loteId, novosDados) {
    console.log('✏️ Editando lote por data:', loteId, novosDados);
    
    if (!validarOperacao('editarLoteData')) {
        throw new Error('Operação bloqueada');
    }
    
    window.lotesOperationLock = true;
    
    try {
        const eventoId = obterEventoId();
        
        if (eventoId) {
            // Buscar lote atual para validações
            const loteAtual = await buscarLote(loteId);
            
            // Validações específicas por posição
            await validarEdicaoLoteData(loteAtual, novosDados);
            
            // Atualizar no MySQL
            const resultado = await fazerRequisicaoAPI('atualizar_lote_especifico', {
                lote_id: loteId,
                nome: novosDados.nome || loteAtual.nome,
                data_inicio: novosDados.dataInicio || loteAtual.data_inicio,
                data_fim: novosDados.dataFim || loteAtual.data_fim,
                divulgar_criterio: novosDados.divulgar ? 1 : 0,
                percentual_aumento_valor: novosDados.percentualAumento || 0
            });
            
            console.log('✅ Lote por data editado no MySQL');
            
            // Renomear lotes se necessário
            await renomearLotesAutomaticamente();
            
            // Invalidar cache
            invalidarCacheLotes();
            
            return resultado;
        } else {
            // Modo novo evento
            const lote = window.lotesTemporarios?.porData?.find(l => l.id === loteId);
            if (lote) {
                Object.assign(lote, novosDados);
                console.log('✅ Lote temporário editado');
                return lote;
            } else {
                throw new Error('Lote temporário não encontrado');
            }
        }
        
    } finally {
        window.lotesOperationLock = false;
    }
};

/**
 * Excluir lote por data
 */
window.excluirLoteData = async function(loteId) {
    console.log('🗑️ Excluindo lote por data:', loteId);
    
    if (!validarOperacao('excluirLoteData')) {
        throw new Error('Operação bloqueada');
    }
    
    // Verificar se há ingressos associados
    const temIngressos = await verificarIngressosNoLote(loteId);
    if (temIngressos) {
        throw new Error('Não é possível excluir este lote pois existem ingressos associados a ele.');
    }
    
    const confirmacao = confirm('Tem certeza que deseja excluir este lote?');
    if (!confirmacao) {
        console.log('❌ Exclusão cancelada pelo usuário');
        return false;
    }
    
    window.lotesOperationLock = true;
    
    try {
        const eventoId = obterEventoId();
        
        if (eventoId) {
            // Excluir do MySQL
            await fazerRequisicaoAPI('excluir_lote_especifico', {
                lote_id: loteId
            });
            
            console.log('✅ Lote por data excluído do MySQL');
            
            // Renomear lotes restantes
            await renomearLotesAutomaticamente();
            
            // Invalidar cache
            invalidarCacheLotes();
            
        } else {
            // Modo novo evento
            if (window.lotesTemporarios?.porData) {
                window.lotesTemporarios.porData = window.lotesTemporarios.porData.filter(l => l.id !== loteId);
                console.log('✅ Lote temporário excluído');
            }
        }
        
        return true;
        
    } finally {
        window.lotesOperationLock = false;
    }
};

// ========== FUNÇÕES DE LOTES POR QUANTIDADE ==========

/**
 * Criar lote por quantidade no MySQL
 */
window.criarLoteQuantidade = async function(dadosLote) {
    console.log('📊 Criando lote por quantidade:', dadosLote);
    
    if (!validarOperacao('criarLoteQuantidade')) {
        throw new Error('Operação bloqueada');
    }
    
    window.lotesOperationLock = true;
    
    try {
        // Validações
        if (!dadosLote.percentual || dadosLote.percentual < 1 || dadosLote.percentual > 100) {
            throw new Error('Percentual deve estar entre 1 e 100');
        }
        
        const eventoId = obterEventoId();
        
        if (eventoId) {
            // Verificar se controle de limite está ativo
            const controleAtivo = await verificarControleVendasAtivo();
            if (!controleAtivo) {
                throw new Error('Controle de limite de vendas deve estar ativo para criar lotes por quantidade');
            }
            
            // Salvar no MySQL usando API melhorada
            const resultado = await fazerRequisicaoAPI('criar_lote_quantidade_com_renomeacao', {
                percentual_venda: dadosLote.percentual,
                divulgar_criterio: dadosLote.divulgar ? 1 : 0,
                percentual_aumento_valor: dadosLote.percentualAumento || 0
            });
            
            console.log('✅ Lote por quantidade criado no MySQL:', resultado);
            
            // Invalidar cache
            invalidarCacheLotes();
            
            return resultado.lote_id;
        } else {
            // Modo novo evento
            if (!window.lotesTemporarios) {
                window.lotesTemporarios = { porData: [], porQuantidade: [] };
            }
            
            const loteTemp = {
                id: Date.now(),
                nome: `Lote ${window.lotesTemporarios.porQuantidade.length + 1}`,
                tipo: 'quantidade',
                percentual: dadosLote.percentual,
                divulgar: Boolean(dadosLote.divulgar),
                percentualAumento: dadosLote.percentualAumento || 0
            };
            
            window.lotesTemporarios.porQuantidade.push(loteTemp);
            
            return loteTemp.id;
        }
        
    } finally {
        window.lotesOperationLock = false;
    }
};
/**
 * Editar lote por quantidade
 */
window.editarLoteQuantidade = async function(loteId, novosDados) {
    console.log('✏️ Editando lote por quantidade:', loteId, novosDados);
    
    if (!validarOperacao('editarLoteQuantidade')) {
        throw new Error('Operação bloqueada');
    }
    
    window.lotesOperationLock = true;
    
    try {
        // Validações
        if (novosDados.percentual && (novosDados.percentual < 1 || novosDados.percentual > 100)) {
            throw new Error('Percentual deve estar entre 1 e 100');
        }
        
        // Verificar se novo percentual é único (excluindo o lote atual)
        if (novosDados.percentual) {
            await verificarPercentualUnico(novosDados.percentual, loteId);
        }
        
        const eventoId = obterEventoId();
        
        if (eventoId) {
            // Buscar lote atual
            const loteAtual = await buscarLote(loteId);
            
            // Atualizar no MySQL
            const resultado = await fazerRequisicaoAPI('atualizar_lote_especifico', {
                lote_id: loteId,
                nome: novosDados.nome || loteAtual.nome,
                percentual_venda: novosDados.percentual || loteAtual.percentual_venda,
                divulgar_criterio: novosDados.divulgar ? 1 : 0,
                percentual_aumento_valor: novosDados.percentualAumento || 0
            });
            
            console.log('✅ Lote por quantidade editado no MySQL');
            
            // Renomear lotes se necessário
            await renomearLotesAutomaticamente();
            
            // Invalidar cache
            invalidarCacheLotes();
            
            return resultado;
        } else {
            // Modo novo evento
            const lote = window.lotesTemporarios?.porQuantidade?.find(l => l.id === loteId);
            if (lote) {
                Object.assign(lote, novosDados);
                console.log('✅ Lote temporário editado');
                return lote;
            } else {
                throw new Error('Lote temporário não encontrado');
            }
        }
        
    } finally {
        window.lotesOperationLock = false;
    }
};

/**
 * Excluir lote por quantidade
 */
window.excluirLoteQuantidade = async function(loteId) {
    console.log('🗑️ Excluindo lote por quantidade:', loteId);
    
    if (!validarOperacao('excluirLoteQuantidade')) {
        throw new Error('Operação bloqueada');
    }
    
    // Verificar se há ingressos associados
    const temIngressos = await verificarIngressosNoLote(loteId);
    if (temIngressos) {
        throw new Error('Não é possível excluir este lote pois existem ingressos associados a ele.');
    }
    
    const confirmacao = confirm('Tem certeza que deseja excluir este lote?');
    if (!confirmacao) {
        console.log('❌ Exclusão cancelada pelo usuário');
        return false;
    }
    
    window.lotesOperationLock = true;
    
    try {
        const eventoId = obterEventoId();
        
        if (eventoId) {
            // Excluir do MySQL
            await fazerRequisicaoAPI('excluir_lote_especifico', {
                lote_id: loteId
            });
            
            console.log('✅ Lote por quantidade excluído do MySQL');
            
            // Renomear lotes restantes
            await renomearLotesAutomaticamente();
            
            // Invalidar cache
            invalidarCacheLotes();
            
        } else {
            // Modo novo evento
            if (window.lotesTemporarios?.porQuantidade) {
                window.lotesTemporarios.porQuantidade = window.lotesTemporarios.porQuantidade.filter(l => l.id !== loteId);
                console.log('✅ Lote temporário excluído');
            }
        }
        
        return true;
        
    } finally {
        window.lotesOperationLock = false;
    }
};

// ========== FUNÇÕES DE VALIDAÇÃO ==========

/**
 * Verificar conflitos de data entre lotes
 */
async function verificarConflitosData(dataInicio, dataFim, excluirLoteId = null) {
    console.log('🔍 Verificando conflitos de data...');
    
    const lotes = await carregarLotesDoBanco();
    const lotesPorData = lotes.filter(l => l.tipo === 'data' && l.id !== excluirLoteId);
    
    for (const lote of lotesPorData) {
        const inicioExistente = new Date(lote.data_inicio);
        const fimExistente = new Date(lote.data_fim);
        
        // Verificar sobreposição
        if ((dataInicio >= inicioExistente && dataInicio <= fimExistente) ||
            (dataFim >= inicioExistente && dataFim <= fimExistente) ||
            (dataInicio <= inicioExistente && dataFim >= fimExistente)) {
            throw new Error(`Conflito de datas com ${lote.nome}. Os períodos não podem se sobrepor.`);
        }
    }
    
    console.log('✅ Nenhum conflito de data encontrado');
}

/**
 * Verificar se percentual é único
 */
async function verificarPercentualUnico(percentual, excluirLoteId = null) {
    console.log('🔍 Verificando se percentual é único:', percentual);
    
    const lotes = await carregarLotesDoBanco();
    const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' && l.id !== excluirLoteId);
    
    const conflito = lotesPorQuantidade.find(l => l.percentual_venda === percentual);
    if (conflito) {
        throw new Error(`Já existe um lote com ${percentual}% de vendas (${conflito.nome}). Os percentuais devem ser únicos.`);
    }
    
    console.log('✅ Percentual é único');
}

/**
 * Validar edição de lote por data (regras específicas)
 */
async function validarEdicaoLoteData(loteAtual, novosDados) {
    console.log('🔍 Validando edição de lote por data...');
    
    // Buscar posição do lote (baseado na ordem cronológica)
    const lotes = await carregarLotesDoBanco();
    const lotesPorData = lotes.filter(l => l.tipo === 'data').sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
    
    const posicaoLote = lotesPorData.findIndex(l => l.id === loteAtual.id);
    
    if (posicaoLote === 0) {
        // Primeiro lote: pode alterar data_inicio e data_fim
        console.log('✅ Primeiro lote: pode alterar data_inicio e data_fim');
    } else {
        // Lotes subsequentes: data_inicio é calculada automaticamente
        if (novosDados.dataInicio && novosDados.dataInicio !== loteAtual.data_inicio) {
            throw new Error('Apenas o primeiro lote pode ter sua data de início alterada. Para lotes subsequentes, a data de início é calculada automaticamente.');
        }
        console.log('✅ Lote subsequente: data_inicio calculada automaticamente');
    }
    
    // Validar data_fim vs data do evento
    if (novosDados.dataFim) {
        await validarDataFimVsEvento(novosDados.dataFim);
    }
    
    // Verificar conflitos com outros lotes (excluindo o atual)
    if (novosDados.dataInicio || novosDados.dataFim) {
        const dataInicio = new Date(novosDados.dataInicio || loteAtual.data_inicio);
        const dataFim = new Date(novosDados.dataFim || loteAtual.data_fim);
        
        await verificarConflitosData(dataInicio, dataFim, loteAtual.id);
    }
    
    console.log('✅ Validação de edição concluída');
}

/**
 * Validar data fim vs data do evento
 */
async function validarDataFimVsEvento(dataFim) {
    console.log('🔍 Validando data fim vs evento...');
    
    const eventoDataInput = document.getElementById('startDateTime');
    if (!eventoDataInput || !eventoDataInput.value) {
        console.log('⚠️ Data do evento não definida, pulando validação');
        return;
    }
    
    const dataEvento = new Date(eventoDataInput.value);
    const dataFimLote = new Date(dataFim);
    
    if (dataFimLote >= dataEvento) {
        throw new Error('A data fim do lote não pode ser posterior ou igual à data do evento.');
    }
    
    console.log('✅ Data fim válida em relação ao evento');
}

/**
 * Verificar se há ingressos associados ao lote
 */
async function verificarIngressosNoLote(loteId) {
    console.log('🔍 Verificando ingressos no lote:', loteId);
    
    const eventoId = obterEventoId();
    
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
        const resultado = await fazerRequisicaoAPI('verificar_ingressos_lote', {
            lote_id: loteId
        });
        
        const temIngressos = resultado.tem_ingressos || false;
        console.log('📊 Ingressos no banco:', temIngressos ? 'encontrados' : 'não encontrados');
        
        return temIngressos;
    } catch (error) {
        console.error('❌ Erro ao verificar ingressos:', error);
        return false; // Em caso de erro, permitir exclusão
    }
}

/**
 * Verificar se controle de vendas está ativo
 */
async function verificarControleVendasAtivo() {
    console.log('🔍 Verificando se controle de vendas está ativo...');
    
    const eventoId = obterEventoId();
    
    if (!eventoId) {
        // Modo novo evento: verificar checkbox
        const checkbox = document.getElementById('controlar_limite_vendas');
        const ativo = checkbox?.checked || false;
        console.log('📊 Controle de vendas (novo evento):', ativo ? 'ativo' : 'inativo');
        return ativo;
    }
    
    try {
        const resultado = await fazerRequisicaoAPI('carregar_limite_vendas');
        const ativo = resultado.dados?.controlar_limite_vendas || false;
        console.log('📊 Controle de vendas (banco):', ativo ? 'ativo' : 'inativo');
        return ativo;
    } catch (error) {
        console.error('❌ Erro ao verificar controle de vendas:', error);
        return false;
    }
}

// ========== FUNÇÕES DE CARREGAMENTO ==========

/**
 * Carregar lotes do banco com cache
 */
window.carregarLotesDoBanco = async function() {
    console.log('📦 Carregando lotes do banco...');
    
    // Verificar cache
    const agora = Date.now();
    if (window.lotesCache.data && (agora - window.lotesCache.timestamp) < window.lotesCache.ttl) {
        console.log('⚡ Usando cache de lotes');
        return window.lotesCache.data;
    }
    
    const eventoId = obterEventoId();
    
    if (!eventoId) {
        // Modo novo evento: retornar lotes temporários
        const lotes = window.lotesTemporarios || { porData: [], porQuantidade: [] };
        const lotesNormalizados = [
            ...lotes.porData.map(l => ({ ...l, tipo: 'data' })),
            ...lotes.porQuantidade.map(l => ({ ...l, tipo: 'quantidade' }))
        ];
        console.log('📊 Lotes temporários carregados:', lotesNormalizados.length);
        return lotesNormalizados;
    }
    
    try {
        // Carregar do banco usando API simples
        const resultado = await fazerRequisicaoAPI('recuperar_evento_simples');
        const lotes = resultado.evento?.lotes || [];
        
        // Atualizar cache
        window.lotesCache.data = lotes;
        window.lotesCache.timestamp = agora;
        
        console.log('📦 Lotes carregados do banco:', lotes.length);
        return lotes;
        
    } catch (error) {
        console.error('❌ Erro ao carregar lotes do banco:', error);
        return [];
    }
};

/**
 * Buscar lote específico
 */
async function buscarLote(loteId) {
    console.log('🔍 Buscando lote específico:', loteId, typeof loteId);
    
    try {
        // Primeiro tentar via API específica
        const resultado = await fazerRequisicaoAPI('buscar_lote_especifico', {
            lote_id: loteId
        });
        
        if (resultado.lote) {
            console.log('✅ Lote encontrado via API específica:', resultado.lote);
            return resultado.lote;
        }
    } catch (apiError) {
        console.warn('⚠️ API específica falhou, tentando busca local:', apiError.message);
    }
    
    // Fallback: buscar nos lotes carregados
    const lotes = await carregarLotesDoBanco();
    console.log('📦 Total de lotes carregados:', lotes.length);
    console.log('📦 IDs dos lotes disponíveis:', lotes.map(l => `${l.id} (${typeof l.id})`));
    
    // Converter para number para comparação segura
    const loteIdNum = parseInt(loteId);
    console.log('🔢 LoteId convertido:', loteIdNum, typeof loteIdNum);
    
    const lote = lotes.find(l => {
        const loteDBId = parseInt(l.id);
        return loteDBId === loteIdNum;
    });
    
    console.log('🎯 Lote encontrado no cache:', lote);
    
    if (!lote) {
        console.error(`❌ Lote ${loteId} não encontrado nem via API nem no cache. Lotes disponíveis:`, lotes);
        throw new Error(`Lote ${loteId} não encontrado`);
    }
    
    return lote;
}

// ========== FUNÇÕES DE RENOMEAÇÃO ==========

/**
 * Renomear lotes automaticamente seguindo regras de negócio
 */
window.renomearLotesAutomaticamente = async function() {
    console.log('🏷️ Renomeando lotes automaticamente...');
    
    if (!validarOperacao('renomearLotes')) {
        console.log('⚠️ Renomeação pulada - operação em andamento');
        return;
    }
    
    const eventoId = obterEventoId();
    
    if (!eventoId) {
        // Modo novo evento
        if (window.lotesTemporarios) {
            // Renomear lotes por data (ordenados por data_inicio)
            window.lotesTemporarios.porData.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
            window.lotesTemporarios.porData.forEach((lote, index) => {
                lote.nome = `Lote ${index + 1}`;
            });
            
            // Renomear lotes por quantidade (ordenados por percentual)
            window.lotesTemporarios.porQuantidade.sort((a, b) => a.percentual - b.percentual);
            window.lotesTemporarios.porQuantidade.forEach((lote, index) => {
                lote.nome = `Lote ${index + 1}`;
            });
            
            console.log('✅ Lotes temporários renomeados');
        }
        return;
    }
    
    try {
        // Carregar lotes do banco
        const lotes = await carregarLotesDoBanco();
        
        // Separar por tipo
        const lotesPorData = lotes.filter(l => l.tipo === 'data').sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade').sort((a, b) => a.percentual_venda - b.percentual_venda);
        
        // Renomear lotes por data
        for (let i = 0; i < lotesPorData.length; i++) {
            const lote = lotesPorData[i];
            const novoNome = `Lote ${i + 1}`;
            
            if (lote.nome !== novoNome) {
                await fazerRequisicaoAPI('atualizar_lote_especifico', {
                    lote_id: lote.id,
                    nome: novoNome
                });
                console.log(`🏷️ Lote por data ${lote.id} renomeado para: ${novoNome}`);
            }
        }
        
        // Renomear lotes por quantidade
        for (let i = 0; i < lotesPorQuantidade.length; i++) {
            const lote = lotesPorQuantidade[i];
            const novoNome = `Lote ${i + 1}`;
            
            if (lote.nome !== novoNome) {
                await fazerRequisicaoAPI('atualizar_lote_especifico', {
                    lote_id: lote.id,
                    nome: novoNome
                });
                console.log(`🏷️ Lote por quantidade ${lote.id} renomeado para: ${novoNome}`);
            }
        }
        
        // Invalidar cache após renomeação
        invalidarCacheLotes();
        
        console.log('✅ Renomeação automática concluída');
        
    } catch (error) {
        console.error('❌ Erro na renomeação automática:', error);
    }
};

// ========== FUNÇÕES DE INTERFACE ==========

/**
 * Renderizar lotes na interface
 */
window.renderizarLotesNaInterface = async function() {
    console.log('🎨 Renderizando lotes na interface...');
    
    try {
        const lotes = await carregarLotesDoBanco();
        
        // Renderizar lotes por data
        const lotesPorData = lotes.filter(l => l.tipo === 'data');
        renderizarLotesPorDataNaInterface(lotesPorData);
        
        // Renderizar lotes por quantidade (tipo pode ser 'quantidade' ou 'percentual')
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        renderizarLotesPorQuantidadeNaInterface(lotesPorQuantidade);
        
        console.log('✅ Interface de lotes renderizada');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar lotes:', error);
    }
};

/**
 * Renderizar lotes por data
 */
function renderizarLotesPorDataNaInterface(lotes) {
    const container = document.getElementById('lotesPorDataList');
    const emptyState = document.getElementById('loteDataEmpty');
    
    if (!container) {
        console.error('❌ Container lotesPorDataList não encontrado');
        return;
    }
    
    if (lotes.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Ordenar por data de início
    const lotesOrdenados = [...lotes].sort((a, b) => new Date(a.data_inicio || a.dataInicio) - new Date(b.data_inicio || b.dataInicio));
    
    let html = '';
    lotesOrdenados.forEach(lote => {
        const dataInicio = formatarDataBrasil(lote.data_inicio || lote.dataInicio);
        const dataFim = formatarDataBrasil(lote.data_fim || lote.dataFim);
        const divulgar = lote.divulgar_criterio || lote.divulgar;
        
        html += `
            <div class="lote-item" data-id="${lote.id}" data-tipo="data">
                <div class="lote-item-info">
                    <div class="lote-item-name">${lote.nome}</div>
                    <div class="lote-item-details">
                        ${dataInicio} até ${dataFim}
                        ${divulgar ? ' • Critério público' : ' • Critério oculto'}
                    </div>
                </div>
                <div class="lote-item-actions">
                    <button class="btn-icon" onclick="editarLoteDataInterface('${lote.id}')" title="Editar lote">✏️</button>
                    <button class="btn-icon delete" onclick="excluirLoteDataInterface('${lote.id}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`✅ ${lotes.length} lotes por data renderizados`);
}

/**
 * Renderizar lotes por quantidade
 */
function renderizarLotesPorQuantidadeNaInterface(lotes) {
    const container = document.getElementById('lotesPorPercentualList');
    const emptyState = document.getElementById('lotePercentualEmpty');
    
    if (!container) {
        console.error('❌ Container lotesPorPercentualList não encontrado');
        return;
    }
    
    if (lotes.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Ordenar por percentual
    const lotesOrdenados = [...lotes].sort((a, b) => (a.percentual_venda || a.percentual) - (b.percentual_venda || b.percentual));
    
    let html = '';
    lotesOrdenados.forEach(lote => {
        const percentual = lote.percentual_venda || lote.percentual;
        const divulgar = lote.divulgar_criterio || lote.divulgar;
        
        html += `
            <div class="lote-item" data-id="${lote.id}" data-tipo="quantidade">
                <div class="lote-item-info">
                    <div class="lote-item-name">${lote.nome}</div>
                    <div class="lote-item-details">
                        Encerra aos ${percentual}% das vendas
                        ${divulgar ? ' • Critério público' : ' • Critério oculto'}
                    </div>
                </div>
                <div class="lote-item-actions">
                    <button class="btn-icon" onclick="editarLoteQuantidadeInterface('${lote.id}')" title="Editar lote">✏️</button>
                    <button class="btn-icon delete" onclick="excluirLoteQuantidadeInterface('${lote.id}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`✅ ${lotes.length} lotes por quantidade renderizados`);
}

// ========== FUNÇÕES DE INTERFACE (WRAPPERS) ==========

/**
 * Wrappers para manter compatibilidade com a interface existente
 */
window.editarLoteDataInterface = async function(loteId) {
    try {
        const lote = await buscarLote(loteId);
        
        // Preencher modal de edição
        document.getElementById('editLoteDataId').value = lote.id;
        document.getElementById('editLoteDataInicio').value = lote.data_inicio || lote.dataInicio;
        document.getElementById('editLoteDataFim').value = lote.data_fim || lote.dataFim;
        document.getElementById('editLoteDataDivulgar').checked = Boolean(lote.divulgar_criterio || lote.divulgar);
        
        // Abrir modal
        if (typeof openModal === 'function') {
            openModal('editLoteDataModal');
        }
        
    } catch (error) {
        console.error('❌ Erro ao editar lote:', error);
        alert('Erro ao carregar dados do lote: ' + error.message);
    }
};

window.editarLoteQuantidadeInterface = async function(loteId) {
    try {
        const lote = await buscarLote(loteId);
        
        // Preencher modal de edição
        document.getElementById('editLotePercentualId').value = lote.id;
        document.getElementById('editLotePercentualValor').value = lote.percentual_venda || lote.percentual;
        document.getElementById('editLotePercentualDivulgar').checked = Boolean(lote.divulgar_criterio || lote.divulgar);
        
        // Abrir modal
        if (typeof openModal === 'function') {
            openModal('editLotePercentualModal');
        }
        
    } catch (error) {
        console.error('❌ Erro ao editar lote:', error);
        alert('Erro ao carregar dados do lote: ' + error.message);
    }
};

window.excluirLoteDataInterface = async function(loteId) {
    try {
        console.log('🗑️ [INTERFACE] Executando exclusão do lote por data:', loteId);
        
        // Usar API específica de exclusão
        const resultado = await fazerRequisicaoAPI('excluir_lote_especifico', {
            lote_id: loteId
        });
        
        console.log('✅ Lote excluído com sucesso:', resultado);
        
        // Renomear lotes sequencialmente após exclusão
        console.log('🔄 Renomeando lotes sequencialmente...');
        await fazerRequisicaoAPI('renomear_lotes_sequencial');
        
        // Invalidar cache
        invalidarCacheLotes();
        
        // Atualizar interface usando sistema unificado
        if (typeof window.renderizarLotesUnificado === 'function') {
            await window.renderizarLotesUnificado();
        }
        
        console.log('✅ Exclusão e renomeação concluídas');
        return true; // Retorna true se sucesso
        
    } catch (error) {
        console.error('❌ Erro ao excluir lote:', error);
        alert('Erro ao excluir lote: ' + error.message);
        return false; // Retorna false se erro
    }
};

window.excluirLoteQuantidadeInterface = async function(loteId) {
    try {
        console.log('🗑️ [INTERFACE] Executando exclusão do lote por quantidade:', loteId);
        
        // Usar API específica de exclusão
        const resultado = await fazerRequisicaoAPI('excluir_lote_especifico', {
            lote_id: loteId
        });
        
        console.log('✅ Lote excluído com sucesso:', resultado);
        
        // Renomear lotes sequencialmente após exclusão
        console.log('🔄 Renomeando lotes sequencialmente...');
        await fazerRequisicaoAPI('renomear_lotes_sequencial');
        
        // Invalidar cache
        invalidarCacheLotes();
        
        // Atualizar interface usando sistema unificado
        if (typeof window.renderizarLotesUnificado === 'function') {
            await window.renderizarLotesUnificado();
        }
        
        console.log('✅ Exclusão e renomeação concluídas');
        return true; // Retorna true se sucesso
        
    } catch (error) {
        console.error('❌ Erro ao excluir lote:', error);
        alert('Erro ao excluir lote: ' + error.message);
        return false; // Retorna false se erro
    }
};

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Formatar data para exibição brasileira
 */
function formatarDataBrasil(dataStr) {
    if (!dataStr) return 'N/A';
    
    try {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error('Erro ao formatar data:', dataStr, e);
        return dataStr;
    }
}

// ========== VALIDAÇÕES FINAIS ==========

/**
 * Validar lotes antes de avançar para próxima etapa
 */
window.validarLotesCompleto = async function() {
    console.log('✅ Validando lotes antes de avançar...');
    
    try {
        const lotes = await carregarLotesDoBanco();
        
        if (lotes.length === 0) {
            throw new Error('Por favor, configure pelo menos um lote para continuar.');
        }
        
        // Validar lotes por quantidade: pelo menos um deve ter 100%
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade');
        if (lotesPorQuantidade.length > 0) {
            const temCemPorcento = lotesPorQuantidade.some(l => (l.percentual_venda || l.percentual) === 100);
            if (!temCemPorcento) {
                throw new Error('Pelo menos um lote por quantidade deve ter 100% de percentual.');
            }
        }
        
        console.log('✅ Validação de lotes concluída com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro na validação:', error);
        
        // Mostrar mensagem de erro na interface
        const validationElement = document.getElementById('validation-step-5');
        if (validationElement) {
            validationElement.style.display = 'block';
            validationElement.textContent = error.message;
        } else {
            alert(error.message);
        }
        
        return false;
    }
};

// ========== INICIALIZAÇÃO ==========

/**
 * Inicializar sistema ao carregar
 */
window.inicializarSistemaLotes = function() {
    console.log('🚀 Inicializando sistema de lotes MySQL...');
    
    // Verificar se estamos na etapa 5
    const etapaAtual = window.currentStep || 1;
    if (etapaAtual === 5) {
        // Carregar lotes existentes
        renderizarLotesNaInterface();
    }
    
    console.log('✅ Sistema de lotes MySQL inicializado');
};

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.inicializarSistemaLotes);
} else {
    window.inicializarSistemaLotes();
}

// ========== EXPORTAR FUNÇÕES COM NOMES DIFERENTES ==========

// Exportar funções com nomes únicos para evitar conflitos
window.criarLoteDataMySQL = window.criarLoteData;
window.criarLoteQuantidadeMySQL = window.criarLoteQuantidade;
window.editarLoteDataMySQL = window.editarLoteData;
window.editarLoteQuantidadeMySQL = window.editarLoteQuantidade;
window.excluirLoteDataMySQL = window.excluirLoteData;
window.excluirLoteQuantidadeMySQL = window.excluirLoteQuantidade;

// Exportar função de API para uso global
window.fazerRequisicaoAPI = fazerRequisicaoAPI;

console.log('✅ SISTEMA-LOTES-MYSQL.JS CARREGADO COM SUCESSO!');
console.log('📋 Funções disponíveis:');
console.log('  - criarLoteData(dadosLote)');
console.log('  - criarLoteQuantidade(dadosLote)');
console.log('  - carregarLotesDoBanco()');
console.log('  - criarLoteDataMySQL(dadosLote)');
console.log('  - editarLoteDataMySQL(loteId, novosDados)');
console.log('  - excluirLoteDataMySQL(loteId)');
console.log('  - criarLoteQuantidadeMySQL(dadosLote)');
console.log('  - editarLoteQuantidadeMySQL(loteId, novosDados)');
console.log('  - excluirLoteQuantidadeMySQL(loteId)');
console.log('  - renomearLotesAutomaticamente()');
console.log('  - renderizarLotesNaInterface()');
console.log('  - validarLotesCompleto()');
console.log('  - fazerRequisicaoAPI(action, dados)');
