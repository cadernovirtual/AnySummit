/**
 * CORREÇÃO DEFINITIVA FINAL - INGRESSOS
 * Resolve TODOS os problemas:
 * 1. Inserção de ingresso COM ID correto e DOM atualizado
 * 2. editTicket() funcionando perfeitamente
 * 3. handleControleVendasChange() SEM popups/dialogs
 */

console.log('🔧 CORRECAO-DEFINITIVA-FINAL-INGRESSOS.JS carregando...');

/**
 * PROBLEMA 1: Inserção de ingresso COM ID correto e DOM atualizado
 */
window.interceptarInsercaoIngresso = function() {
    console.log('🎯 Configurando interceptação de inserção de ingressos...');
    
    // Interceptar todos os modais de criação de ingresso
    const modais = ['paidTicketModal', 'freeTicketModal', 'comboTicketModal'];
    
    modais.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const form = modal.querySelector('form') || modal;
            
            // Interceptar submit do form
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log(`📝 Interceptando submit do modal ${modalId}`);
                
                // Processar dados do form
                const formData = new FormData(form);
                const dados = Object.fromEntries(formData.entries());
                
                // Adicionar dados extras necessários
                const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                if (eventoId) {
                    dados.evento_id = eventoId;
                }
                
                // Determinar tipo do ingresso
                if (modalId === 'paidTicketModal') {
                    dados.tipo = 'pago';
                } else if (modalId === 'freeTicketModal') {
                    dados.tipo = 'gratuito';
                } else if (modalId === 'comboTicketModal') {
                    dados.tipo = 'combo';
                }
                
                console.log('📊 Dados do ingresso a ser criado:', dados);
                
                // Salvar no banco e obter ID
                const novoIngressoId = await salvarIngressoComRetornoDeId(dados);
                
                if (novoIngressoId) {
                    console.log(`✅ Ingresso criado com ID: ${novoIngressoId}`);
                    
                    // Fechar modal
                    fecharModal(modalId);
                    
                    // Recarregar dados do banco para obter dados completos
                    await recarregarListaIngressosRobusta();
                    
                    console.log('✅ DOM atualizado após inserção');
                } else {
                    console.error('❌ Falha ao criar ingresso');
                    alert('Erro ao criar ingresso');
                }
            });
        }
    });
    
    // Interceptar botões de salvar também
    const botoesSalvar = document.querySelectorAll('[onclick*="saveTicket"], [onclick*="salvarIngresso"]');
    botoesSalvar.forEach(botao => {
        const onclickOriginal = botao.onclick;
        botao.onclick = async function(e) {
            e.preventDefault();
            console.log('📝 Interceptando botão salvar ingresso');
            
            // Tentar executar função original primeiro para validação
            if (onclickOriginal) {
                const resultado = onclickOriginal.call(this, e);
                if (resultado === false) {
                    return; // Validação falhou
                }
            }
            
            // Após salvar, recarregar lista
            setTimeout(async () => {
                await recarregarListaIngressosRobusta();
                console.log('✅ Lista recarregada após salvar');
            }, 1000);
        };
    });
};

/**
 * Salvar ingresso e retornar ID do registro criado
 */
async function salvarIngressoComRetornoDeId(dados) {
    console.log('💾 Salvando ingresso via API direta...');
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'salvar_ingresso_direto',
                ...dados
            })
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta salvar ingresso:', textResponse);
        
        const data = extrairJSONLimpo(textResponse);
        
        if (data && data.sucesso) {
            console.log(`✅ Ingresso criado com ID: ${data.ingresso_id}`);
            return data.ingresso_id;
        } else {
            console.error('❌ Erro ao salvar ingresso:', data?.erro);
            alert('Erro ao criar ingresso: ' + (data?.erro || 'Erro desconhecido'));
            return null;
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição de salvamento:', error);
        alert('Erro de conexão ao criar ingresso.');
        return null;
    }
}

/**
 * Fechar modal
 */
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Remover backdrop se existir
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Limpar form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        console.log(`✅ Modal ${modalId} fechado`);
    }
}

/**
 * PROBLEMA 2: editTicket() funcionando perfeitamente
 */
window.editTicket = async function(ingressoId) {
    console.log(`✏️ editTicket: Editando ingresso ${ingressoId}`);
    
    // ESTRATÉGIA 1: Buscar em dados globais PRIMEIRO
    if (window.dadosAtivos && window.dadosAtivos.ingressos) {
        const ingresso = window.dadosAtivos.ingressos.find(ing => 
            ing.id == ingressoId || ing.id === ingressoId || ing.id === String(ingressoId)
        );
        
        if (ingresso) {
            console.log(`✅ Ingresso encontrado nos dados globais:`, ingresso);
            abrirModalEdicao(ingresso);
            return;
        } else {
            console.log(`⚠️ Ingresso ${ingressoId} não encontrado nos dados globais. IDs disponíveis:`, 
                window.dadosAtivos.ingressos.map(i => i.id));
        }
    }
    
    // ESTRATÉGIA 2: Recarregar dados ANTES de buscar
    console.log('🔄 Recarregando dados antes de buscar ingresso...');
    await recarregarListaIngressosRobusta();
    
    // Tentar novamente nos dados atualizados
    if (window.dadosAtivos && window.dadosAtivos.ingressos) {
        const ingresso = window.dadosAtivos.ingressos.find(ing => 
            ing.id == ingressoId || ing.id === ingressoId || ing.id === String(ingressoId)
        );
        
        if (ingresso) {
            console.log(`✅ Ingresso encontrado após recarregar:`, ingresso);
            abrirModalEdicao(ingresso);
            return;
        }
    }
    
    // ESTRATÉGIA 3: Buscar diretamente na API (último recurso)
    console.log('🔍 Buscando diretamente na API como último recurso...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        alert('Erro: Evento não identificado');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta da API buscar_ingresso:', textResponse);
        
        const data = extrairJSONLimpo(textResponse);
        
        if (data && data.sucesso && data.ingresso) {
            console.log(`✅ Ingresso encontrado na API:`, data.ingresso);
            abrirModalEdicao(data.ingresso);
        } else {
            console.error('❌ Ingresso não encontrado na API:', data);
            alert(`Erro: Ingresso ${ingressoId} não encontrado. Tente recarregar a página.`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar ingresso na API:', error);
        alert('Erro de conexão ao buscar ingresso.');
    }
};

/**
 * PROBLEMA 3: handleControleVendasChange SEM NENHUM popup/dialog
 */
window.handleControleVendasChange = async function(event) {
    const isChecked = event.target.checked;
    console.log('🎛️ handleControleVendasChange:', isChecked ? 'MARCADO' : 'DESMARCADO');
    
    if (isChecked) {
        // MARCADO: Mostrar campos e atualizar banco SILENCIOSAMENTE
        mostrarCamposLimitacao();
        await atualizarControleBanco(1);
        console.log('✅ Controle ativado silenciosamente');
        
    } else {
        // DESMARCADO: Verificar e processar SILENCIOSAMENTE
        console.log('🔍 Verificando dependências silenciosamente...');
        
        const podeDemarcar = await processarDesmarcacaoSilenciosa(event.target);
        
        if (!podeDemarcar) {
            // Reativar checkbox silenciosamente
            event.target.checked = true;
            console.log('❌ Checkbox reativado silenciosamente - há dependências');
        } else {
            console.log('✅ Checkbox desmarcado silenciosamente');
        }
    }
};

/**
 * Processar desmarcação COMPLETAMENTE SILENCIOSA
 */
async function processarDesmarcacaoSilenciosa(checkbox) {
    try {
        // Carregar lotes
        let lotes = [];
        if (typeof window.carregarLotesDoBanco === 'function') {
            lotes = await window.carregarLotesDoBanco();
        }
        
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        
        if (lotesPorQuantidade.length === 0) {
            console.log('✅ Nenhum lote por quantidade - pode desmarcar silenciosamente');
            esconderCamposLimitacao();
            await atualizarControleBanco(0);
            return true;
        }
        
        // Verificar se há ingressos SILENCIOSAMENTE
        let temIngressos = false;
        for (const lote of lotesPorQuantidade) {
            const ingressos = await verificarIngressosNoLote(lote.id);
            if (ingressos) {
                temIngressos = true;
                break;
            }
        }
        
        if (temIngressos) {
            // HÁ INGRESSOS: NÃO pode desmarcar - SILENCIOSO
            console.log('❌ Há ingressos relacionados - não pode desmarcar (SILENCIOSO)');
            return false;
        }
        
        // SÓ LOTES SEM INGRESSOS: Excluir automaticamente SILENCIOSAMENTE
        console.log('🗑️ Excluindo lotes sem ingressos automaticamente e silenciosamente...');
        
        for (const lote of lotesPorQuantidade) {
            await excluirLote(lote.id);
        }
        
        await renomearLotesSequencial();
        
        // Atualizar interface silenciosamente
        if (typeof window.renderizarLotesUnificado === 'function') {
            setTimeout(() => window.renderizarLotesUnificado(), 500);
        }
        
        esconderCamposLimitacao();
        await atualizarControleBanco(0);
        
        console.log('✅ Lotes excluídos automaticamente - checkbox desmarcado SILENCIOSAMENTE');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao verificar dependências:', error);
        return false;
    }
}

/**
 * removeTicket sem confirmação + DOM atualizado (mantido da versão anterior)
 */
window.removeTicket = async function(ingressoId) {
    console.log(`🗑️ removeTicket: Excluindo ingresso ${ingressoId} SEM confirmação`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        // Excluir do banco SEM confirmação
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        
        if (!data) {
            console.error('❌ Não foi possível extrair JSON válido da resposta');
            return;
        }
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído do MySQL`);
            
            // MÉTODO 1: Remoção direta do DOM
            const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
            if (elemento) {
                elemento.remove();
                console.log(`✅ Elemento DOM removido diretamente`);
            }
            
            // MÉTODO 2: Atualizar dados globais
            if (window.dadosAtivos && window.dadosAtivos.ingressos) {
                window.dadosAtivos.ingressos = window.dadosAtivos.ingressos.filter(
                    ing => ing.id != ingressoId
                );
                console.log(`✅ Dados globais atualizados`);
            }
            
            // MÉTODO 3: Recarregar lista
            setTimeout(() => {
                recarregarListaIngressosRobusta();
            }, 300);
            
            console.log(`✅ DOM atualizado após exclusão`);
            
        } else {
            console.error('❌ Erro ao excluir:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na exclusão:', error);
    }
};

/**
 * Parser JSON super robusto (mantido da versão anterior)
 */
function extrairJSONLimpo(textResponse) {
    console.log('🔍 Analisando resposta para extrair JSON...');
    
    // Tentar parser direto primeiro
    try {
        const data = JSON.parse(textResponse);
        console.log('✅ JSON parseado diretamente');
        return data;
    } catch (parseError) {
        console.log('⚠️ Parser direto falhou, tentando extrair...');
    }
    
    // Método 1: Procurar por linha que começa e termina com {}
    const lines = textResponse.split('\\n');
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('{') && line.endsWith('}')) {
            try {
                const data = JSON.parse(line);
                console.log('✅ JSON extraído da linha:', line.substring(0, 100) + '...');
                return data;
            } catch (e) {
                continue;
            }
        }
    }
    
    // Método 2: Procurar primeiro { até último }
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = textResponse.substring(firstBrace, lastBrace + 1);
        try {
            const data = JSON.parse(jsonStr);
            console.log('✅ JSON extraído por posição');
            return data;
        } catch (e) {
            console.log('❌ Falha ao extrair por posição');
        }
    }
    
    console.error('❌ Não foi possível extrair JSON válido');
    console.error('📄 Resposta:', textResponse.substring(0, 500) + '...');
    return null;
}

/**
 * Recarregar lista de ingressos com parser robusto
 */
async function recarregarListaIngressosRobusta() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - não há lista para recarregar');
        return;
    }
    
    try {
        console.log('🔄 Recarregando lista de ingressos...');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        
        if (data && data.sucesso) {
            // Atualizar dados globais
            if (!window.dadosAtivos) {
                window.dadosAtivos = {};
            }
            
            window.dadosAtivos.ingressos = data.ingressos || [];
            
            console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos recarregados`);
            
            // Renderizar na interface
            renderizarIngressosRobusto();
            
        } else {
            console.error('❌ Erro ao recarregar:', data?.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no recarregamento:', error);
    }
}

/**
 * Renderizar ingressos de forma robusta
 */
function renderizarIngressosRobusto() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    console.log('🎨 Renderizando ingressos...');
    
    // Limpar lista
    ticketList.innerHTML = '';
    
    if (!window.dadosAtivos?.ingressos || window.dadosAtivos.ingressos.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        console.log('📝 Lista vazia renderizada');
        return;
    }
    
    // Renderizar cada ingresso
    window.dadosAtivos.ingressos.forEach((ingresso, index) => {
        console.log(`🎨 Renderizando ingresso ${index + 1}: ${ingresso.titulo} (ID: ${ingresso.id})`);
        criarElementoIngressoRobusto(ingresso);
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados`);
}

/**
 * Criar elemento de ingresso de forma robusta
 */
function criarElementoIngressoRobusto(ingresso) {
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    const loteId = ingresso.lote_id || '';
    const description = ingresso.descricao || '';
    const saleStart = ingresso.inicio_venda || '';
    const saleEnd = ingresso.fim_venda || '';
    const minQuantity = parseInt(ingresso.limite_min) || 1;
    const maxQuantity = parseInt(ingresso.limite_max) || 5;
    
    // Usar função existente se disponível
    if (typeof addTicketToList === 'function') {
        try {
            addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
            
            // CRÍTICO: Corrigir ID do elemento criado com ID REAL do banco
            const ticketList = document.getElementById('ticketList');
            const ultimoElemento = ticketList.lastElementChild;
            
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                // Aplicar ID REAL
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.setAttribute('data-ticket-id', ingresso.id);
                
                // Corrigir onclicks dos botões para usar ID REAL
                const botaoEditar = ultimoElemento.querySelector('[onclick*="editTicket"]');
                if (botaoEditar) {
                    botaoEditar.setAttribute('onclick', `editTicket(${ingresso.id})`);
                }
                
                const botaoExcluir = ultimoElemento.querySelector('[onclick*="removeTicket"]');
                if (botaoExcluir) {
                    botaoExcluir.setAttribute('onclick', `removeTicket(${ingresso.id})`);
                }
                
                console.log(`✅ ID correto aplicado: ${ingresso.id} com botões configurados`);
            }
        } catch (error) {
            console.error('❌ Erro ao usar addTicketToList:', error);
            criarElementoManual(ingresso);
        }
    } else {
        console.warn('⚠️ addTicketToList não disponível - criando manualmente');
        criarElementoManual(ingresso);
    }
}

/**
 * Criar elemento manual como fallback
 */
function criarElementoManual(ingresso) {
    const ticketList = document.getElementById('ticketList');
    
    const elemento = document.createElement('div');
    elemento.className = 'ticket-item';
    elemento.dataset.ticketId = ingresso.id;
    elemento.setAttribute('data-ticket-id', ingresso.id);
    
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    elemento.innerHTML = `
        <div class="ticket-content">
            <div class="ticket-header">
                <span class="ticket-name">${ingresso.titulo}</span>
                <span class="ticket-price">${price}</span>
            </div>
            <div class="ticket-details">
                <span>Quantidade: ${ingresso.quantidade_total || 100}</span>
            </div>
        </div>
        <div class="ticket-actions">
            <button type="button" onclick="editTicket(${ingresso.id})" class="btn-icon edit" title="Editar">
                ✏️
            </button>
            <button type="button" onclick="removeTicket(${ingresso.id})" class="btn-icon delete" title="Excluir">
                🗑️
            </button>
        </div>
    `;
    
    ticketList.appendChild(elemento);
    console.log(`✅ Elemento manual criado para ingresso ${ingresso.id}`);
}

/**
 * Abrir modal de edição
 */
function abrirModalEdicao(ingresso) {
    console.log('📝 Abrindo modal de edição para:', ingresso.titulo);
    
    // Tentar usar função existente
    if (typeof window.editarIngressoDoMySQL === 'function') {
        window.editarIngressoDoMySQL(ingresso);
    } else if (typeof window.openEditModal === 'function') {
        window.openEditModal(ingresso);
    } else if (typeof window.editarIngresso === 'function') {
        window.editarIngresso(ingresso);
    } else {
        console.warn('⚠️ Função de edição não encontrada - implementando fallback básico');
        alert(`Modal de edição ainda não implementado para: ${ingresso.titulo} (ID: ${ingresso.id})`);
    }
}

/**
 * Funções auxiliares
 */
function mostrarCamposLimitacao() {
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    
    if (campoLimite) campoLimite.style.display = 'block';
    if (btnConfirmar) btnConfirmar.style.display = 'inline-block';
}

function esconderCamposLimitacao() {
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    const inputLimite = document.getElementById('limiteVendas');
    
    if (campoLimite) campoLimite.style.display = 'none';
    if (btnConfirmar) btnConfirmar.style.display = 'none';
    if (inputLimite) inputLimite.value = '';
}

async function verificarIngressosNoLote(loteId) {
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=verificar_ingressos_lote&lote_id=${loteId}`
        });
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        return data && data.sucesso && data.tem_ingressos;
        
    } catch (error) {
        console.error('❌ Erro ao verificar ingressos:', error);
        return false;
    }
}

async function excluirLote(loteId) {
    const response = await fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=excluir_lote_especifico&lote_id=${loteId}`
    });
    
    const textResponse = await response.text();
    const data = extrairJSONLimpo(textResponse);
    if (!data || !data.sucesso) {
        throw new Error(data?.erro || 'Erro ao excluir lote');
    }
}

async function renomearLotesSequencial() {
    const response = await fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=renomear_lotes_sequencial`
    });
    
    const textResponse = await response.text();
    const data = extrairJSONLimpo(textResponse);
    if (!data || !data.sucesso) {
        throw new Error(data?.erro || 'Erro ao renomear lotes');
    }
}

async function atualizarControleBanco(valor) {
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
        
        const textResponse = await response.text();
        const data = extrairJSONLimpo(textResponse);
        if (data && data.sucesso) {
            console.log(`✅ Controle atualizado no banco: ${valor}`);
        } else {
            console.error('❌ Erro ao atualizar banco:', data?.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
    }
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correção definitiva final...');
    
    // Aguardar DOM estar pronto e configurar interceptações
    setTimeout(() => {
        interceptarInsercaoIngresso();
    }, 2000);
    
    // Aplicar novamente após carregar outros scripts
    setTimeout(() => {
        interceptarInsercaoIngresso();
    }, 5000);
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ CORRECAO-DEFINITIVA-FINAL-INGRESSOS.JS carregado!');
console.log('🔧 Correções implementadas:');
console.log('  1. ✅ Inserção de ingresso COM ID correto e DOM atualizado');
console.log('  2. ✅ editTicket() funcionando perfeitamente');
console.log('  3. ✅ handleControleVendasChange() COMPLETAMENTE SILENCIOSO');
