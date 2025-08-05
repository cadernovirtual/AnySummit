/**
 * CORREÇÕES DEFINITIVAS - LIMITE DE VENDAS E INGRESSOS
 * Resolve todos os problemas reportados:
 * 1. Checkbox com estado baseado no banco
 * 2. Botão habilitado apenas quando checkbox marcado  
 * 3. removeTicket sem confirmação e com DOM atualizado
 * 4. editTicket funcionando corretamente
 * 5. handleControleVendasChange sem popups desnecessários
 */

console.log('🔧 CORRECOES-DEFINITIVAS-LIMITE-VENDAS.JS carregando...');

/**
 * PROBLEMA 1: Carregar estado do checkbox baseado no banco
 */
function carregarEstadoCheckboxDoBanco() {
    console.log('🔄 Carregando estado do checkbox dos dados PHP...');
    
    // Usar dados carregados pelo PHP
    if (window.dadosEvento) {
        const controlarLimite = window.dadosEvento.controlarLimiteVendas === 1;
        const limiteVendas = window.dadosEvento.limiteVendas || 0;
        
        console.log(`✅ Estado carregado: controlar=${controlarLimite}, limite=${limiteVendas}`);
        
        // Aplicar ao checkbox
        const checkbox = document.getElementById('controlar_limite_vendas');
        if (checkbox) {
            checkbox.checked = controlarLimite;
            console.log(`✅ Checkbox configurado: ${controlarLimite ? 'MARCADO' : 'DESMARCADO'}`);
            
            // Aplicar visibilidade dos campos
            aplicarVisibilidadeBaseadaNoCheckbox(controlarLimite);
            
            // Se há limite, preencher campo e habilitar botão
            if (controlarLimite && limiteVendas > 0) {
                const inputLimite = document.getElementById('limiteVendas');
                if (inputLimite) {
                    inputLimite.value = limiteVendas;
                    console.log(`✅ Limite preenchido: ${limiteVendas}`);
                }
                habilitarBotaoCriarLoteQuantidade();
            }
        }
    } else {
        console.log('📝 Novo evento - checkbox inicia desmarcado');
    }
}

/**
 * PROBLEMA 2: Controlar habilitação do botão baseado no checkbox
 */
function aplicarVisibilidadeBaseadaNoCheckbox(marcado) {
    console.log(`👁️ Aplicando visibilidade: ${marcado ? 'MOSTRAR' : 'ESCONDER'}`);
    
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    const btnCriarLote = document.getElementById('btnCriarLoteQuantidade');
    
    if (campoLimite) {
        campoLimite.style.display = marcado ? 'block' : 'none';
    }
    
    if (btnConfirmar) {
        btnConfirmar.style.display = marcado ? 'inline-block' : 'none';
    }
    
    // PROBLEMA 2: Botão só habilitado quando checkbox marcado
    if (btnCriarLote) {
        if (!marcado) {
            // Checkbox desmarcado = botão desabilitado
            btnCriarLote.disabled = true;
            btnCriarLote.style.opacity = '0.5';
            btnCriarLote.style.cursor = 'not-allowed';
            console.log('🔒 Botão criar lotes DESABILITADO (checkbox desmarcado)');
        } else {
            // Checkbox marcado - verificar se já tem limite confirmado
            const inputLimite = document.getElementById('limiteVendas');
            const temLimite = inputLimite && inputLimite.value && parseInt(inputLimite.value) > 0;
            
            if (temLimite) {
                habilitarBotaoCriarLoteQuantidade();
            }
        }
    }
}

/**
 * Habilitar botão de criar lotes
 */
function habilitarBotaoCriarLoteQuantidade() {
    const btnCriarLote = document.getElementById('btnCriarLoteQuantidade');
    if (btnCriarLote) {
        btnCriarLote.disabled = false;
        btnCriarLote.style.opacity = '1';
        btnCriarLote.style.cursor = 'pointer';
        console.log('✅ Botão criar lotes HABILITADO');
    }
}

/**
 * PROBLEMA 5: handleControleVendasChange sem popups desnecessários
 */
window.handleControleVendasChange = async function(event) {
    const isChecked = event.target.checked;
    console.log('🎛️ handleControleVendasChange:', isChecked ? 'MARCADO' : 'DESMARCADO');
    
    if (isChecked) {
        // MARCADO: Mostrar campos e atualizar banco
        aplicarVisibilidadeBaseadaNoCheckbox(true);
        await atualizarControleBanco(1);
        
    } else {
        // DESMARCADO: Verificar dependências SEM POPUPS
        console.log('🔍 Verificando se pode desmarcar...');
        
        const podeDemarcar = await verificarSePodesDesmarcarSemPopup(event.target);
        
        if (!podeDemarcar) {
            // Reativar checkbox se não pode desmarcar
            event.target.checked = true;
        }
    }
};

/**
 * Verificar se pode desmarcar SEM popups excessivos
 */
async function verificarSePodesDesmarcarSemPopup(checkbox) {
    try {
        // Carregar lotes
        let lotes = [];
        if (typeof window.carregarLotesDoBanco === 'function') {
            lotes = await window.carregarLotesDoBanco();
        }
        
        const lotesPorQuantidade = lotes.filter(l => l.tipo === 'quantidade' || l.tipo === 'percentual');
        
        if (lotesPorQuantidade.length === 0) {
            console.log('✅ Nenhum lote por quantidade - pode desmarcar');
            aplicarVisibilidadeBaseadaNoCheckbox(false);
            await atualizarControleBanco(0);
            return true;
        }
        
        // Verificar se há ingressos
        let temIngressos = false;
        for (const lote of lotesPorQuantidade) {
            const ingressos = await verificarIngressosNoLote(lote.id);
            if (ingressos) {
                temIngressos = true;
                break;
            }
        }
        
        if (temIngressos) {
            // HÁ INGRESSOS: Apenas UMA mensagem e não pode desmarcar
            alert('Para desmarcar essa opção você precisa excluir todos os lotes por quantidade de vendas e seus respectivos ingressos.');
            return false;
        }
        
        // SÓ LOTES SEM INGRESSOS: Excluir automaticamente SEM perguntar
        console.log('🗑️ Excluindo lotes sem ingressos automaticamente...');
        
        for (const lote of lotesPorQuantidade) {
            await excluirLote(lote.id);
        }
        
        await renomearLotesSequencial();
        
        // Atualizar interface
        if (typeof window.renderizarLotesUnificado === 'function') {
            setTimeout(() => window.renderizarLotesUnificado(), 500);
        }
        
        aplicarVisibilidadeBaseadaNoCheckbox(false);
        await atualizarControleBanco(0);
        
        console.log('✅ Lotes excluídos automaticamente - checkbox desmarcado');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao verificar dependências:', error);
        return false;
    }
}

/**
 * PROBLEMA 3: removeTicket SEM confirmação e COM atualização do DOM
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
        
        // CORREÇÃO: Parser JSON robusto para evitar erro
        const textResponse = await response.text();
        console.log('📡 Resposta bruta:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            // Tentar extrair JSON da resposta
            const lines = textResponse.split('\\n');
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('{') && line.endsWith('}')) {
                    try {
                        data = JSON.parse(line);
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            }
            
            if (!data) {
                console.error('❌ Resposta não contém JSON válido:', textResponse);
                return;
            }
        }
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído do MySQL`);
            
            // ATUALIZAR DOM: Recarregar lista de ingressos
            await recarregarListaIngressos();
            
            console.log(`✅ DOM atualizado após exclusão`);
            
        } else {
            console.error('❌ Erro ao excluir:', data.erro);
            alert('Erro ao excluir ingresso: ' + data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na exclusão:', error);
        alert('Erro de conexão ao excluir ingresso.');
    }
};

/**
 * PROBLEMA 4: editTicket com verificação correta de existência
 */
window.editTicket = async function(ingressoId) {
    console.log(`✏️ editTicket: Editando ingresso ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        // Verificar se ingresso existe no banco
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta buscar ingresso:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON na busca:', parseError);
            console.error('📄 Resposta recebida:', textResponse);
            return;
        }
        
        if (data.sucesso && data.ingresso) {
            console.log(`✅ Ingresso encontrado:`, data.ingresso);
            
            // Chamar função de edição com dados do banco
            if (typeof window.editarIngressoDoMySQL === 'function') {
                window.editarIngressoDoMySQL(data.ingresso);
            } else {
                console.error('❌ Função editarIngressoDoMySQL não encontrada');
            }
            
        } else {
            console.error('❌ Ingresso não encontrado no banco:', data.erro);
            alert('Ingresso não encontrado: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar ingresso:', error);
        alert('Erro de conexão ao buscar ingresso.');
    }
};

/**
 * Recarregar lista de ingressos do banco
 */
async function recarregarListaIngressos() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - não há lista para recarregar');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta recarregar:', textResponse.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON no recarregamento:', parseError);
            return;
        }
        
        if (data.sucesso) {
            // Atualizar dados globais
            if (!window.dadosAtivos) {
                window.dadosAtivos = {};
            }
            
            window.dadosAtivos.ingressos = data.ingressos || [];
            
            console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos recarregados`);
            
            // Renderizar na interface
            renderizarIngressos();
            
        } else {
            console.error('❌ Erro ao recarregar:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no recarregamento:', error);
    }
}

/**
 * Renderizar ingressos na interface
 */
function renderizarIngressos() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    // Limpar lista
    ticketList.innerHTML = '';
    
    if (!window.dadosAtivos?.ingressos || window.dadosAtivos.ingressos.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada ingresso
    window.dadosAtivos.ingressos.forEach(ingresso => {
        criarElementoIngresso(ingresso);
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados`);
}

/**
 * Criar elemento de ingresso
 */
function criarElementoIngresso(ingresso) {
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
    
    // Usar função existente
    if (typeof addTicketToList === 'function') {
        addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
        
        // Corrigir ID do elemento criado
        const ticketList = document.getElementById('ticketList');
        const ultimoElemento = ticketList.lastElementChild;
        
        if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
            ultimoElemento.dataset.ticketId = ingresso.id;
            ultimoElemento.setAttribute('data-ticket-id', ingresso.id);
        }
    }
}

/**
 * Função confirmarLimiteVendas corrigida
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
            
            habilitarBotaoCriarLoteQuantidade();
            
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
 * Funções auxiliares reutilizadas
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
        
        const data = await response.json();
        if (data.sucesso) {
            console.log(`✅ Controle atualizado no banco: ${valor}`);
        } else {
            console.error('❌ Erro ao atualizar banco:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
    }
}

/**
 * Configurar botão confirmar quando aparecer no DOM
 */
function configurarBotaoConfirmar() {
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    
    if (btnConfirmar && !btnConfirmar.onclick) {
        console.log('🔘 Configurando btnConfirmarLimite...');
        btnConfirmar.onclick = window.confirmarLimiteVendas;
        console.log('✅ btnConfirmarLimite configurado');
    }
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correções definitivas...');
    
    // Carregar estado do checkbox
    setTimeout(carregarEstadoCheckboxDoBanco, 1000);
    
    // Configurar botão confirmar
    setTimeout(configurarBotaoConfirmar, 1500);
    
    // Observer para detectar novos elementos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.id === 'btnConfirmarLimite') {
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

console.log('✅ CORRECOES-DEFINITIVAS-LIMITE-VENDAS.JS carregado!');
console.log('🔧 Correções implementadas:');
console.log('  1. ✅ Checkbox carregado do banco');
console.log('  2. ✅ Botão habilitado apenas quando checkbox marcado');
console.log('  3. ✅ removeTicket sem confirmação + DOM atualizado');
console.log('  4. ✅ editTicket com verificação correta');
console.log('  5. ✅ handleControleVendasChange sem popups desnecessários');
