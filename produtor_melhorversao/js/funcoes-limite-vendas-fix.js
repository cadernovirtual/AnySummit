/**
 * CORREÇÃO DEFINITIVA - FUNÇÕES DE LIMITE DE VENDAS
 * Resolve os problemas de funções não definidas:
 * 1. confirmarLimiteVendas() 
 * 2. handleControleVendasChange()
 * 3. btnConfirmarLimite onclick
 */

console.log('🔧 FUNCOES-LIMITE-VENDAS-FIX.JS carregando...');

/**
 * PROBLEMA 1: confirmarLimiteVendas não está definida
 * Solução: Definir globalmente com fallback robusto
 */
window.confirmarLimiteVendas = async function() {
    console.log('✅ confirmarLimiteVendas() executando...');
    
    const inputLimite = document.getElementById('limiteVendas');
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!inputLimite) {
        console.error('❌ Campo limiteVendas não encontrado');
        alert('Erro: Campo de limite não encontrado.');
        return;
    }
    
    const limite = parseInt(inputLimite.value);
    
    if (!limite || limite < 1) {
        alert('⚠️ Por favor, informe uma lotação máxima válida (maior que 0).');
        inputLimite.focus();
        return;
    }
    
    try {
        // Fazer requisição para salvar o limite
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=salvar_limite_vendas&evento_id=${eventoId || ''}&controlar_limite_vendas=1&limite_vendas=${limite}`
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Limite salvo com sucesso');
            alert(`✅ Lotação máxima de ${limite} pessoas confirmada!`);
            
            // Habilitar botão de criar lotes por quantidade
            const botaoCriar = document.getElementById('btnCriarLoteQuantidade');
            if (botaoCriar) {
                botaoCriar.disabled = false;
                botaoCriar.style.opacity = '1';
                botaoCriar.style.cursor = 'pointer';
                console.log('✅ Botão criar lote por quantidade habilitado');
            }
            
            // Esconder campo de confirmação
            const campoLimite = document.getElementById('campoLimiteVendas');
            if (campoLimite) {
                campoLimite.style.display = 'none';
            }
            
        } else {
            console.error('❌ Erro ao salvar limite:', data.erro);
            alert('❌ Erro ao salvar limite: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        alert('❌ Erro de conexão ao salvar limite.');
    }
};

/**
 * PROBLEMA 2: handleControleVendasChange não funciona corretamente
 * Solução: Redefine função com lógica correta de verificação
 */
window.handleControleVendasChange = async function(event) {
    const isChecked = event.target.checked;
    console.log('🎛️ handleControleVendasChange:', isChecked ? 'ATIVADO' : 'DESATIVADO');
    
    if (isChecked) {
        // MARCANDO: Mostrar campos de limitação
        mostrarCamposLimitacao();
        await atualizarBancoDados(1); // Salvar no banco que está ativado
        
    } else {
        // DESMARCANDO: Verificar se pode desmarcar
        console.log('🔍 Verificando se pode desmarcar...');
        
        // Bloquear temporariamente a mudança
        event.target.checked = true;
        
        const podeDesmarcar = await verificarSePodesDesmarcar();
        
        if (podeDesmarcar) {
            console.log('✅ Pode desmarcar - processando...');
            event.target.checked = false;
            esconderCamposLimitacao();
            await atualizarBancoDados(0); // Salvar no banco que está desativado
        } else {
            console.log('❌ Não pode desmarcar - mantendo marcado');
            event.target.checked = true;
            // Campos permanecem visíveis
        }
    }
};

/**
 * Mostrar campos de limitação quando checkbox marcado
 */
function mostrarCamposLimitacao() {
    console.log('👁️ Mostrando campos de limitação...');
    
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    
    if (campoLimite) {
        campoLimite.style.display = 'block';
        console.log('✅ Campo limite visível');
    }
    
    if (btnConfirmar) {
        btnConfirmar.style.display = 'inline-block';
        console.log('✅ Botão confirmar visível');
    }
}

/**
 * Esconder campos de limitação quando checkbox desmarcado
 */
function esconderCamposLimitacao() {
    console.log('👁️ Escondendo campos de limitação...');
    
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    const inputLimite = document.getElementById('limiteVendas');
    
    if (campoLimite) {
        campoLimite.style.display = 'none';
        console.log('✅ Campo limite escondido');
    }
    
    if (btnConfirmar) {
        btnConfirmar.style.display = 'none';
        console.log('✅ Botão confirmar escondido');
    }
    
    if (inputLimite) {
        inputLimite.value = '';
        console.log('✅ Valor limite limpo');
    }
}

/**
 * Verificar se pode desmarcar o checkbox
 */
async function verificarSePodesDesmarcar() {
    console.log('🔍 Verificando se existem lotes por quantidade...');
    
    try {
        // Carregar lotes do banco
        let lotes = [];
        if (typeof window.carregarLotesDoBanco === 'function') {
            lotes = await window.carregarLotesDoBanco();
        } else {
            console.warn('⚠️ Função carregarLotesDoBanco não encontrada');
            return true; // Se não conseguir verificar, permitir desmarcar
        }
        
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        
        if (lotesPorQuantidade.length === 0) {
            console.log('✅ Nenhum lote por quantidade - pode desmarcar');
            return true;
        }
        
        console.log(`📊 Encontrados ${lotesPorQuantidade.length} lotes por quantidade`);
        
        // Verificar se há ingressos nos lotes
        let temIngressos = false;
        for (const lote of lotesPorQuantidade) {
            const ingressos = await verificarIngressosNoLote(lote.id);
            if (ingressos) {
                temIngressos = true;
                break;
            }
        }
        
        if (temIngressos) {
            // Há ingressos - não pode desmarcar
            alert('❌ Para desmarcar essa opção você precisa excluir todos os lotes por quantidade de vendas e seus respectivos ingressos.');
            return false;
        }
        
        // Não há ingressos - perguntar se quer excluir lotes
        const nomes = lotesPorQuantidade.map(l => l.nome).join(', ');
        const confirmacao = confirm(
            `Para desmarcar o controle de limite será necessário excluir os seguintes lotes:\n\n${nomes}\n\nDeseja continuar?`
        );
        
        if (!confirmacao) {
            console.log('❌ Usuário cancelou');
            return false;
        }
        
        // Excluir lotes
        console.log('🗑️ Excluindo lotes por quantidade...');
        for (const lote of lotesPorQuantidade) {
            await excluirLote(lote.id);
        }
        
        // Renomear lotes restantes
        await renomearLotesSequencial();
        
        // Atualizar interface
        if (typeof window.renderizarLotesUnificado === 'function') {
            setTimeout(() => window.renderizarLotesUnificado(), 500);
        }
        
        console.log('✅ Lotes excluídos - pode desmarcar');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao verificar lotes:', error);
        alert('❌ Erro ao verificar lotes: ' + error.message);
        return false;
    }
}

/**
 * Verificar se há ingressos no lote
 */
async function verificarIngressosNoLote(loteId) {
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=verificar_ingressos_lote&lote_id=${loteId}`
        });
        
        const data = await response.json();
        return data.sucesso && data.tem_ingressos;
        
    } catch (error) {
        console.error('❌ Erro ao verificar ingressos:', error);
        return false;
    }
}

/**
 * Excluir lote específico
 */
async function excluirLote(loteId) {
    const response = await fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=excluir_lote_especifico&lote_id=${loteId}`
    });
    
    const data = await response.json();
    if (!data.sucesso) {
        throw new Error(data.erro || 'Erro ao excluir lote');
    }
}

/**
 * Renomear lotes sequencialmente
 */
async function renomearLotesSequencial() {
    const response = await fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=renomear_lotes_sequencial`
    });
    
    const data = await response.json();
    if (!data.sucesso) {
        throw new Error(data.erro || 'Erro ao renomear lotes');
    }
}

/**
 * Atualizar banco de dados com estado do controle
 */
async function atualizarBancoDados(valor) {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('ℹ️ Modo novo evento - sem atualização de banco');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=salvar_controle_limite&evento_id=${eventoId}&controlar_limite_vendas=${valor}`
        });
        
        const data = await response.json();
        if (data.sucesso) {
            console.log(`✅ Controle de limite atualizado no banco: ${valor}`);
        } else {
            console.error('❌ Erro ao atualizar banco:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição de atualização:', error);
    }
}

/**
 * PROBLEMA 3: Garantir que btnConfirmarLimite funcione
 * Configurar onclick diretamente no DOM quando disponível
 */
function configurarBotaoConfirmar() {
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    
    if (btnConfirmar) {
        console.log('🔘 Configurando onclick do btnConfirmarLimite...');
        
        // Remover onclick anterior e definir novo
        btnConfirmar.onclick = null;
        btnConfirmar.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔘 btnConfirmarLimite clicado - executando confirmarLimiteVendas');
            window.confirmarLimiteVendas();
        });
        
        console.log('✅ btnConfirmarLimite configurado');
    } else {
        console.warn('⚠️ btnConfirmarLimite não encontrado');
    }
}

/**
 * Configurar estado inicial baseado no checkbox
 */
function configurarEstadoInicial() {
    setTimeout(() => {
        const checkbox = document.getElementById('controlar_limite_vendas');
        
        if (checkbox) {
            const isChecked = checkbox.checked;
            console.log(`🔄 Estado inicial do checkbox: ${isChecked ? 'MARCADO' : 'DESMARCADO'}`);
            
            if (isChecked) {
                mostrarCamposLimitacao();
            } else {
                esconderCamposLimitacao();
            }
        }
        
        // Configurar botão confirmar
        configurarBotaoConfirmar();
        
    }, 1000);
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correções de limite de vendas...');
    
    configurarEstadoInicial();
    
    // Observar mudanças no DOM para configurar botão quando aparecer
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.id === 'btnConfirmarLimite') {
                        console.log('🔘 btnConfirmarLimite adicionado ao DOM - configurando...');
                        configurarBotaoConfirmar();
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ FUNCOES-LIMITE-VENDAS-FIX.JS carregado!');
console.log('🔧 Funções disponíveis globalmente:');
console.log('  - window.confirmarLimiteVendas()');
console.log('  - window.handleControleVendasChange(event)');
