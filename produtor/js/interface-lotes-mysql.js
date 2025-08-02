/**
 * INTERFACE DE LOTES MYSQL - SUBSTITUIÇÃO DOS MODAIS
 * 
 * Este arquivo substitui todas as funções de interface dos modais de lotes
 * para trabalharem diretamente com o sistema MySQL, mantendo a interface
 * visual 100% intacta conforme especificado no CORRECAO_LOTES.md
 */

console.log('🎨 INTERFACE-LOTES-MYSQL.JS CARREGANDO...');

// ========== SOBRESCREVER FUNÇÕES EXISTENTES ==========

/**
 * Sobrescrever função adicionarLotePorData (mantém interface intacta)
 */
window.adicionarLotePorData = function() {
    console.log('📅 [MYSQL] Abrindo modal para adicionar lote por data...');
    
    try {
        // Verificar se modal existe
        const modal = document.getElementById('loteDataModal');
        if (!modal) {
            console.error('❌ Modal loteDataModal não encontrado');
            alert('Erro: Modal não encontrado. Verifique se o HTML do modal existe.');
            return;
        }
        
        // Calcular valores padrão baseados nas regras de negócio
        calcularValoresPadraoLoteData();
        
        // Limpar outros campos
        document.getElementById('loteDataDivulgar').checked = true;
        
        // Abrir modal
        if (typeof openModal === 'function') {
            openModal('loteDataModal');
        } else {
            // Fallback manual
            modal.classList.add('show');
            modal.style.display = 'block';
        }
        
        console.log('✅ Modal de lote por data aberto');
        
    } catch (error) {
        console.error('❌ Erro ao abrir modal de lote por data:', error);
        alert('Erro ao abrir modal: ' + error.message);
    }
};

/**
 * Calcular valores padrão para lote por data
 */
function calcularValoresPadraoLoteData() {
    const agora = new Date();
    const eventoDataInput = document.getElementById('startDateTime');
    
    if (eventoDataInput && eventoDataInput.value) {
        const dataEvento = new Date(eventoDataInput.value);
        const diaAnterior = new Date(dataEvento);
        diaAnterior.setDate(diaAnterior.getDate() - 1);
        diaAnterior.setHours(23, 59, 0, 0);
        
        // Para primeiro lote, usar data atual
        // Para lotes subsequentes, calcular baseado no último lote
        if (typeof window.carregarLotesDoBanco === 'function') {
            window.carregarLotesDoBanco().then(lotes => {
                const lotesPorData = lotes.filter(l => l.tipo === 'data');
                const campoDataInicio = document.getElementById('loteDataInicio');
                
                if (lotesPorData.length === 0) {
                    // Primeiro lote - campo editável
                    console.log('📅 Primeiro lote - campo data_inicio editável');
                    if (campoDataInicio) {
                        campoDataInicio.readOnly = false;
                        campoDataInicio.style.backgroundColor = '';
                        campoDataInicio.style.color = '';
                        campoDataInicio.title = '';
                        campoDataInicio.value = formatDateTimeLocal(agora);
                    }
                } else {
                    // Lotes subsequentes - campo read-only
                    console.log('📅 Lote subsequente - campo data_inicio read-only');
                    const ultimoLote = lotesPorData.sort((a, b) => new Date(b.data_fim || b.dataFim) - new Date(a.data_fim || a.dataFim))[0];
                    const ultimaDataFim = new Date(ultimoLote.data_fim || ultimoLote.dataFim);
                    ultimaDataFim.setMinutes(ultimaDataFim.getMinutes() + 1);
                    
                    if (campoDataInicio) {
                        campoDataInicio.readOnly = true;
                        campoDataInicio.style.backgroundColor = '#f5f5f5';
                        campoDataInicio.style.color = '#666';
                        campoDataInicio.title = 'Data de início automática baseada no último lote';
                        campoDataInicio.value = formatDateTimeLocal(ultimaDataFim);
                    }
                }
                
                // Data fim padrão: 7 dias após início
                const dataInicioValue = document.getElementById('loteDataInicio').value;
                if (dataInicioValue) {
                    const dataInicio = new Date(dataInicioValue);
                    dataInicio.setDate(dataInicio.getDate() + 7);
                    
                    // Não ultrapassar data do evento
                    if (dataInicio < diaAnterior) {
                        document.getElementById('loteDataFim').value = formatDateTimeLocal(dataInicio);
                    } else {
                        document.getElementById('loteDataFim').value = formatDateTimeLocal(diaAnterior);
                    }
                }
            }).catch(error => {
                console.error('❌ Erro ao calcular valores padrão:', error);
                // Usar valores básicos em caso de erro
                document.getElementById('loteDataInicio').value = formatDateTimeLocal(agora);
                document.getElementById('loteDataFim').value = formatDateTimeLocal(diaAnterior);
            });
        } else {
            // Fallback se função não existir
            document.getElementById('loteDataInicio').value = formatDateTimeLocal(agora);
            document.getElementById('loteDataFim').value = formatDateTimeLocal(diaAnterior);
        }
    } else {
        // Sem data do evento definida
        const seteDiasDepois = new Date(agora);
        seteDiasDepois.setDate(seteDiasDepois.getDate() + 7);
        
        document.getElementById('loteDataInicio').value = formatDateTimeLocal(agora);
        document.getElementById('loteDataFim').value = formatDateTimeLocal(seteDiasDepois);
    }
}

/**
 * Sobrescrever função adicionarLotePorPercentual (mantém interface intacta)
 */
window.adicionarLotePorPercentual = function() {
    console.log('📊 [MYSQL] Abrindo modal para adicionar lote por percentual...');
    
    try {
        // Verificar se modal existe
        const modal = document.getElementById('lotePercentualModal');
        if (!modal) {
            console.error('❌ Modal lotePercentualModal não encontrado');
            alert('Erro: Modal não encontrado. Verifique se o HTML do modal existe.');
            return;
        }
        
        // Limpar campos
        document.getElementById('lotePercentualValor').value = '';
        document.getElementById('lotePercentualDivulgar').checked = false;
        
        // Abrir modal
        if (typeof openModal === 'function') {
            openModal('lotePercentualModal');
        } else {
            // Fallback manual
            modal.classList.add('show');
            modal.style.display = 'block';
        }
        
        console.log('✅ Modal de lote por percentual aberto');
        
    } catch (error) {
        console.error('❌ Erro ao abrir modal de lote por percentual:', error);
        alert('Erro ao abrir modal: ' + error.message);
    }
};

/**
 * Sobrescrever função criarLoteData (conecta com MySQL)
 */
window.criarLoteDataInterface = async function() {
    console.log('📅 [MYSQL] Criando lote por data...');
    
    try {
        // Coletar dados do modal
        const dadosLote = {
            dataInicio: document.getElementById('loteDataInicio').value,
            dataFim: document.getElementById('loteDataFim').value,
            divulgar: document.getElementById('loteDataDivulgar').checked,
            percentualAumento: 0 // Padrão
        };
        
        console.log('📋 Dados coletados:', dadosLote);
        
        // Validações básicas
        if (!dadosLote.dataInicio || !dadosLote.dataFim) {
            alert('Por favor, informe as datas de início e fim.');
            return;
        }
        
        const dataInicio = new Date(dadosLote.dataInicio);
        const dataFim = new Date(dadosLote.dataFim);
        
        if (dataInicio >= dataFim) {
            alert('A data de início deve ser anterior à data de fim.');
            return;
        }
        
        // Criar lote usando sistema MySQL - chamando função original
        if (typeof window.criarLoteDataMySQL === 'function') {
            const loteId = await window.criarLoteDataMySQL(dadosLote);
            console.log('✅ Lote por data criado com ID:', loteId);
            
            // Forçar atualização da interface usando sistema unificado
            setTimeout(async () => {
                if (typeof window.renderizarLotesUnificado === 'function') {
                    await window.renderizarLotesUnificado();
                    console.log('✅ Interface atualizada após criação via sistema unificado');
                }
            }, 500);
            
        } else {
            console.error('❌ Sistema MySQL de lotes não encontrado');
            console.log('🔍 Funções disponíveis:', Object.keys(window).filter(key => key.includes('Lote')));
            alert('Erro: Sistema de lotes MySQL não está carregado');
            return;
        }
        
        // Fechar modal
        if (typeof closeModal === 'function') {
            closeModal('loteDataModal');
        } else {
            const modal = document.getElementById('loteDataModal');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        }
        
        // Atualizar interface
        if (typeof window.renderizarLotesNaInterface === 'function') {
            await window.renderizarLotesNaInterface();
        }
        
        // Limpar campos para próxima criação
        document.getElementById('loteDataDivulgar').checked = true;
        
        console.log('✅ Lote por data criado e interface atualizada');
        
    } catch (error) {
        console.error('❌ Erro ao criar lote por data:', error);
        alert('Erro ao criar lote: ' + error.message);
    }
};

/**
 * Sobrescrever função criarLotePercentual (conecta com MySQL)
 */
window.criarLotePercentualInterface = async function() {
    console.log('📊 [MYSQL] Criando lote por percentual...');
    
    try {
        // Verificar se controle de limite está ativo
        const controleAtivo = await verificarControleVendasAtivo();
        if (!controleAtivo) {
            alert('Para criar lotes por percentual, primeiro ative o controle de limite de vendas.');
            return;
        }
        
        // Coletar dados do modal
        const percentual = parseInt(document.getElementById('lotePercentualValor').value);
        const divulgar = document.getElementById('lotePercentualDivulgar').checked;
        
        console.log('📋 Dados coletados:', { percentual, divulgar });
        
        // Validações básicas
        if (!percentual || isNaN(percentual) || percentual < 1 || percentual > 100) {
            alert('Por favor, informe um percentual válido entre 1 e 100.');
            return;
        }
        
        const dadosLote = {
            percentual: percentual,
            divulgar: divulgar,
            percentualAumento: 0 // Padrão
        };
        
        // Criar lote usando sistema MySQL - chamando função original
        if (typeof window.criarLoteQuantidadeMySQL === 'function') {
            const loteId = await window.criarLoteQuantidadeMySQL(dadosLote);
            console.log('✅ Lote por percentual criado com ID:', loteId);
            
            // Forçar atualização da interface usando sistema unificado
            setTimeout(async () => {
                if (typeof window.renderizarLotesUnificado === 'function') {
                    await window.renderizarLotesUnificado();
                    console.log('✅ Interface atualizada após criação via sistema unificado');
                }
            }, 500);
            
        } else {
            console.error('❌ Sistema MySQL de lotes não encontrado');
            console.log('🔍 Funções disponíveis:', Object.keys(window).filter(key => key.includes('Lote')));
            alert('Erro: Sistema de lotes MySQL não está carregado');
            return;
        }
        
        // Fechar modal
        if (typeof closeModal === 'function') {
            closeModal('lotePercentualModal');
        } else {
            const modal = document.getElementById('lotePercentualModal');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        }
        
        // Atualizar interface
        if (typeof window.renderizarLotesNaInterface === 'function') {
            await window.renderizarLotesNaInterface();
        }
        
        // Limpar campos para próxima criação
        document.getElementById('lotePercentualValor').value = '';
        document.getElementById('lotePercentualDivulgar').checked = false;
        
        console.log('✅ Lote por percentual criado e interface atualizada');
        
    } catch (error) {
        console.error('❌ Erro ao criar lote por percentual:', error);
        alert('Erro ao criar lote: ' + error.message);
    }
};

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Formatar data para input datetime-local
 */
function formatDateTimeLocal(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

/**
 * Verificar se controle de vendas está ativo (versão otimizada)
 */
async function verificarControleVendasAtivo() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        // Modo novo evento: verificar checkbox
        const checkbox = document.getElementById('controlar_limite_vendas');
        return checkbox?.checked || false;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=carregar_limite_vendas&evento_id=${eventoId}`
        });
        
        const data = await response.json();
        return data.sucesso && data.dados?.controlar_limite_vendas;
    } catch (error) {
        console.error('❌ Erro ao verificar controle de vendas:', error);
        return false;
    }
}

// ========== FUNÇÕES DE COMPATIBILIDADE ==========

/**
 * Função para renderizar lotes (mantém compatibilidade)
 */
window.renderizarLotesPorData = function() {
    console.log('🎨 [COMPAT] renderizarLotesPorData chamada - redirecionando para sistema unificado');
    if (typeof window.renderizarLotesUnificado === 'function') {
        window.renderizarLotesUnificado();
    }
};

window.renderizarLotesPorPercentual = function() {
    console.log('🎨 [COMPAT] renderizarLotesPorPercentual chamada - redirecionando para sistema unificado');
    if (typeof window.renderizarLotesUnificado === 'function') {
        window.renderizarLotesUnificado();
    }
};

/**
 * Função de validação para o sistema de etapas
 */
window.validarLotes = function() {
    console.log('✅ [COMPAT] validarLotes chamada - redirecionando para MySQL');
    if (typeof window.validarLotesCompleto === 'function') {
        return window.validarLotesCompleto();
    }
    return true;
};

/**
 * Integração com sistema de cookies (dummy functions)
 */
window.salvarLotesNoCookie = function() {
    console.log('🍪 [DUMMY] salvarLotesNoCookie chamada - MySQL não usa cookies');
    // Não fazer nada - sistema MySQL não usa cookies
};

window.carregarLotesDoCookie = function() {
    console.log('🍪 [DUMMY] carregarLotesDoCookie chamada - redirecionando para MySQL');
    // Redirecionar para sistema MySQL
    if (typeof window.carregarLotesDoBanco === 'function') {
        return window.carregarLotesDoBanco();
    }
    return [];
};

// ========== INICIALIZAÇÃO ==========

/**
 * Inicializar sistema de interface ao carregar
 */
window.inicializarInterfaceLotes = function() {
    console.log('🚀 Inicializando interface de lotes MySQL...');
    
    // Verificar se estamos na etapa 5
    const etapaAtual = window.currentStep || 1;
    if (etapaAtual === 5) {
        // Carregar lotes existentes
        if (typeof window.renderizarLotesNaInterface === 'function') {
            window.renderizarLotesNaInterface();
        }
        
        // Carregar estado do controle de limite
        if (typeof window.carregarControleLimit === 'function') {
            setTimeout(() => window.carregarControleLimit(), 500);
        }
    }
    
    console.log('✅ Interface de lotes MySQL inicializada');
};

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.inicializarInterfaceLotes);
} else {
    window.inicializarInterfaceLotes();
}

// ========== ALIASES PARA BOTÕES HTML ==========

/**
 * Aliases para manter compatibilidade com onclick dos botões HTML
 */
window.criarLoteData = window.criarLoteDataInterface;
window.criarLotePercentual = window.criarLotePercentualInterface;

console.log('✅ INTERFACE-LOTES-MYSQL.JS CARREGADO COM SUCESSO!');
console.log('🔄 Funções disponíveis:');
console.log('  - adicionarLotePorData()');
console.log('  - adicionarLotePorPercentual()');
console.log('  - criarLoteData() [alias para criarLoteDataInterface]');
console.log('  - criarLotePercentual() [alias para criarLotePercentualInterface]');
console.log('  - criarLoteDataInterface()');
console.log('  - criarLotePercentualInterface()');
console.log('  - renderizarLotesPorData()');
console.log('  - renderizarLotesPorPercentual()');
console.log('  - validarLotes()');
console.log('  - salvarLotesNoCookie() [dummy]');
console.log('  - carregarLotesDoCookie() [dummy]');
