/**
 * CORREÇÃO ULTRA DEFINITIVA - INGRESSOS
 * Resolve DEFINITIVAMENTE todos os problemas:
 * 1. Coleta correta de dados dos modais
 * 2. removeTicket funcionando com API limpa
 * 3. DOM sempre atualizado
 */

console.log('🔧 CORRECAO-ULTRA-DEFINITIVA-INGRESSOS.JS carregando...');

/**
 * MAPEAMENTO CORRETO DOS IDs DOS MODAIS
 */
const MODAL_FIELDS = {
    paidTicketModal: {
        titulo: '#paidTicketTitle',
        descricao: '#paidTicketDescription', 
        quantidade_total: '#paidTicketQuantity',
        preco: '#paidTicketPrice',
        lote_id: '#paidTicketLote'
    },
    freeTicketModal: {
        titulo: '#freeTicketTitle',
        descricao: '#freeTicketDescription',
        quantidade_total: '#freeTicketQuantity', 
        preco: null, // Sempre 0 para gratuito
        lote_id: '#freeTicketLote'
    },
    comboTicketModal: {
        titulo: '#comboTicketTitle',
        descricao: '#comboTicketDescription',
        quantidade_total: '#comboTicketQuantity',
        preco: '#comboTicketPrice',
        conteudo_combo: '#comboTicketContent'
    }
};

/**
 * SOBRESCREVER TODAS AS FUNÇÕES DE CRIAÇÃO
 */
function aplicarSobrescritasCompletas() {
    console.log('🎯 Aplicando sobrescritas completas...');
    
    // Lista de todas as funções que criam ingressos
    const funcoesParaSobrescrever = [
        'createPaidTicket',
        'createFreeTicket', 
        'createComboTicket',
        'createPaidTicketMySQL',
        'createFreeTicketMySQL',
        'createComboTicketMySQL',
        'salvarIngressoPago',
        'salvarIngressoGratuito',
        'salvarCombo'
    ];
    
    funcoesParaSobrescrever.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const funcaoOriginal = window[nomeFuncao];
            
            window[nomeFuncao] = async function(...args) {
                console.log(`📝 Interceptando ${nomeFuncao}`);
                
                // Determinar tipo baseado no nome da função
                let tipo;
                if (nomeFuncao.includes('Paid') || nomeFuncao.includes('Pago')) {
                    tipo = 'pago';
                } else if (nomeFuncao.includes('Free') || nomeFuncao.includes('Gratuito')) {
                    tipo = 'gratuito';
                } else if (nomeFuncao.includes('Combo')) {
                    tipo = 'combo';
                } else {
                    tipo = 'pago'; // Padrão
                }
                
                await criarIngressoViaSobrescrita(tipo);
                return false; // Bloquear execução original
            };
            
            console.log(`✅ ${nomeFuncao} sobrescrita`);
        }
    });
    
    // Sobrescrever também removeTicket e editTicket
    window.removeTicket = removeTicketAPILimpa;
    window.editTicket = editTicketAPILimpa;
    
    console.log('✅ Todas as funções sobrescritas');
}

/**
 * Criar ingresso via sobrescrita
 */
async function criarIngressoViaSobrescrita(tipo) {
    console.log(`💾 Criando ingresso ${tipo} via sobrescrita...`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        alert('Erro: Evento não identificado');
        return;
    }
    
    // Determinar modal baseado no tipo
    let modalId;
    if (tipo === 'pago') {
        modalId = 'paidTicketModal';
    } else if (tipo === 'gratuito') {
        modalId = 'freeTicketModal';
    } else if (tipo === 'combo') {
        modalId = 'comboTicketModal';
    }
    
    // Coletar dados corretamente
    const dados = coletarDadosCorretamente(modalId, tipo);
    dados.evento_id = eventoId;
    dados.tipo = tipo;
    
    console.log('📊 Dados coletados corretamente:', dados);
    
    // Validar
    if (!dados.titulo || dados.titulo.trim() === '') {
        alert('Por favor, preencha o título do ingresso');
        return;
    }
    
    if (!dados.quantidade_total || dados.quantidade_total < 1) {
        alert('Por favor, informe uma quantidade válida');
        return;
    }
    
    try {
        // Criar via API limpa
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'criar_ingresso',
                ...dados
            })
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta API limpa:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
            alert('Erro de comunicação com o servidor');
            return;
        }
        
        if (data.sucesso) {
            console.log(`✅ Ingresso criado! ID: ${data.ingresso_id}`);
            
            // Fechar modal
            fecharModalCorreto(modalId);
            
            // Recarregar via API limpa
            await recarregarListaAPILimpa();
            
            console.log('✅ DOM atualizado após criação');
            
        } else {
            console.error('❌ Erro ao criar:', data.erro);
            alert('Erro ao criar ingresso: ' + data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        alert('Erro de conexão');
    }
}

/**
 * Coletar dados corretamente dos modais
 */
function coletarDadosCorretamente(modalId, tipo) {
    console.log(`🔍 Coletando dados do modal ${modalId}...`);
    
    const campos = MODAL_FIELDS[modalId];
    if (!campos) {
        console.error(`❌ Mapeamento não encontrado para ${modalId}`);
        return {};
    }
    
    const dados = {};
    
    // Coletar cada campo
    Object.keys(campos).forEach(campo => {
        const seletor = campos[campo];
        
        if (!seletor) {
            // Campo não aplicável (ex: preço para ingresso gratuito)
            if (campo === 'preco' && tipo === 'gratuito') {
                dados[campo] = 0;
            }
            return;
        }
        
        const elemento = document.querySelector(seletor);
        if (elemento) {
            let valor = elemento.value;
            
            // Limpeza e conversão baseada no campo
            if (campo === 'preco') {
                // Remover formatação monetária e converter
                valor = valor.replace(/[R$\s.]/g, '').replace(',', '.');
                dados[campo] = parseFloat(valor) || 0;
            } else if (campo === 'quantidade_total') {
                dados[campo] = parseInt(valor) || 100;
            } else if (campo === 'lote_id') {
                dados[campo] = valor ? parseInt(valor) : null;
            } else {
                dados[campo] = valor.trim();
            }
            
            console.log(`  ${campo}: ${dados[campo]} (de ${seletor})`);
        } else {
            console.warn(`⚠️ Elemento não encontrado: ${seletor}`);
            
            // Valores padrão
            if (campo === 'quantidade_total') {
                dados[campo] = 100;
            } else if (campo === 'preco') {
                dados[campo] = 0;
            } else {
                dados[campo] = '';
            }
        }
    });
    
    // Campos sempre presentes
    dados.valor_receber = dados.preco || 0;
    dados.limite_min = 1;
    dados.limite_max = 5;
    
    return dados;
}

/**
 * Fechar modal corretamente
 */
function fecharModalCorreto(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Remover backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Limpar campos
        const campos = MODAL_FIELDS[modalId];
        if (campos) {
            Object.values(campos).forEach(seletor => {
                if (seletor) {
                    const elemento = document.querySelector(seletor);
                    if (elemento) {
                        elemento.value = '';
                    }
                }
            });
        }
        
        console.log(`✅ Modal ${modalId} fechado e limpo`);
    }
}

/**
 * removeTicket via API limpa
 */
async function removeTicketAPILimpa(ingressoId) {
    console.log(`🗑️ removeTicket API limpa: ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta exclusão API limpa:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON exclusão:', parseError);
            return;
        }
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído via API limpa`);
            
            // Remoção direta do DOM
            const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
            if (elemento) {
                elemento.remove();
                console.log('✅ Elemento removido do DOM');
            }
            
            // Atualizar dados globais
            if (window.dadosAtivos?.ingressos) {
                window.dadosAtivos.ingressos = window.dadosAtivos.ingressos.filter(
                    ing => ing.id != ingressoId
                );
                console.log('✅ Dados globais atualizados');
            }
            
            // Recarregar para garantir sincronização
            setTimeout(() => {
                recarregarListaAPILimpa();
            }, 200);
            
        } else {
            console.error('❌ Erro ao excluir via API limpa:', data.erro);
            alert('Erro ao excluir ingresso: ' + data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na exclusão via API limpa:', error);
        alert('Erro de conexão ao excluir');
    }
}

/**
 * editTicket via API limpa
 */
async function editTicketAPILimpa(ingressoId) {
    console.log(`✏️ editTicket API limpa: ${ingressoId}`);
    
    // Buscar nos dados globais primeiro
    if (window.dadosAtivos?.ingressos) {
        const ingresso = window.dadosAtivos.ingressos.find(ing => 
            ing.id == ingressoId || ing.id === ingressoId || ing.id === String(ingressoId)
        );
        
        if (ingresso) {
            console.log('✅ Ingresso encontrado nos dados globais');
            abrirModalEdicao(ingresso);
            return;
        }
    }
    
    // Buscar via API limpa
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        
        if (data.sucesso && data.ingresso) {
            console.log('✅ Ingresso encontrado via API limpa');
            abrirModalEdicao(data.ingresso);
        } else {
            console.error('❌ Ingresso não encontrado');
            alert(`Ingresso ${ingressoId} não encontrado`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar ingresso:', error);
        alert('Erro ao buscar ingresso');
    }
}

/**
 * Recarregar lista via API limpa
 */
async function recarregarListaAPILimpa() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem dados para recarregar');
        return;
    }
    
    try {
        console.log('🔄 Recarregando via API limpa...');
        
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta listagem API limpa:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON listagem:', parseError);
            return;
        }
        
        if (data.sucesso) {
            // Atualizar dados globais
            if (!window.dadosAtivos) {
                window.dadosAtivos = {};
            }
            
            window.dadosAtivos.ingressos = data.ingressos || [];
            
            console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos recarregados via API limpa`);
            
            // Renderizar
            renderizarIngressosCorretamente();
            
        } else {
            console.error('❌ Erro ao recarregar via API limpa:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no recarregamento via API limpa:', error);
    }
}

/**
 * Renderizar ingressos corretamente
 */
function renderizarIngressosCorretamente() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    console.log('🎨 Renderizando ingressos corretamente...');
    
    // Limpar
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
    window.dadosAtivos.ingressos.forEach((ingresso, index) => {
        console.log(`🎨 Renderizando ${index + 1}: ${ingresso.titulo} (ID: ${ingresso.id})`);
        criarElementoIngressoCorreto(ingresso);
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados corretamente`);
}

/**
 * Criar elemento de ingresso correto
 */
function criarElementoIngressoCorreto(ingresso) {
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    
    // Tentar usar função existente
    if (typeof addTicketToList === 'function') {
        try {
            const loteId = ingresso.lote_id || '';
            const description = ingresso.descricao || '';
            const saleStart = ingresso.inicio_venda || '';
            const saleEnd = ingresso.fim_venda || '';
            const minQuantity = parseInt(ingresso.limite_min) || 1;
            const maxQuantity = parseInt(ingresso.limite_max) || 5;
            
            addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
            
            // Corrigir ID do último elemento
            const ticketList = document.getElementById('ticketList');
            const ultimoElemento = ticketList.lastElementChild;
            
            if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
                // Aplicar ID real
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.setAttribute('data-ticket-id', ingresso.id);
                
                // Corrigir botões
                const botaoEditar = ultimoElemento.querySelector('[onclick*="editTicket"]');
                if (botaoEditar) {
                    botaoEditar.setAttribute('onclick', `editTicket(${ingresso.id})`);
                }
                
                const botaoExcluir = ultimoElemento.querySelector('[onclick*="removeTicket"]');
                if (botaoExcluir) {
                    botaoExcluir.setAttribute('onclick', `removeTicket(${ingresso.id})`);
                }
                
                console.log(`✅ ID real aplicado: ${ingresso.id}`);
            }
        } catch (error) {
            console.error('❌ Erro ao usar addTicketToList:', error);
            criarElementoManual(ingresso);
        }
    } else {
        criarElementoManual(ingresso);
    }
}

/**
 * Criar elemento manual
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
    console.log(`✅ Elemento manual criado: ${ingresso.id}`);
}

/**
 * Abrir modal de edição
 */
function abrirModalEdicao(ingresso) {
    console.log('📝 Abrindo modal de edição:', ingresso.titulo);
    
    if (typeof window.editarIngressoDoMySQL === 'function') {
        window.editarIngressoDoMySQL(ingresso);
    } else if (typeof window.openEditModal === 'function') {
        window.openEditModal(ingresso);
    } else {
        console.warn('⚠️ Função de edição não encontrada');
        alert(`Editar: ${ingresso.titulo} (ID: ${ingresso.id})`);
    }
}

/**
 * handleControleVendasChange silencioso
 */
window.handleControleVendasChange = function(event) {
    const isChecked = event.target.checked;
    console.log('🎛️ handleControleVendasChange SILENCIOSO:', isChecked ? 'MARCADO' : 'DESMARCADO');
    
    const campoLimite = document.getElementById('campoLimiteVendas');
    const btnConfirmar = document.getElementById('btnConfirmarLimite');
    const inputLimite = document.getElementById('limiteVendas');
    
    if (isChecked) {
        // Mostrar campos silenciosamente
        if (campoLimite) campoLimite.style.display = 'block';
        if (btnConfirmar) btnConfirmar.style.display = 'inline-block';
        console.log('✅ Controle ativado silenciosamente');
    } else {
        // Esconder campos silenciosamente
        if (campoLimite) campoLimite.style.display = 'none';
        if (btnConfirmar) btnConfirmar.style.display = 'none';
        if (inputLimite) inputLimite.value = '';
        console.log('✅ Controle desativado silenciosamente');
    }
};

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correção ultra definitiva...');
    
    // Aguardar e aplicar sobrescritas
    setTimeout(() => {
        aplicarSobrescritasCompletas();
        
        // Recarregar dados se estiver editando
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        if (eventoId) {
            recarregarListaAPILimpa();
        }
    }, 2000);
    
    // Aplicar novamente para garantir
    setTimeout(() => {
        aplicarSobrescritasCompletas();
    }, 5000);
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ CORRECAO-ULTRA-DEFINITIVA-INGRESSOS.JS carregado!');
console.log('🔧 Recursos implementados:');
console.log('  1. ✅ Mapeamento correto dos IDs dos modais');
console.log('  2. ✅ Coleta precisa de dados');
console.log('  3. ✅ removeTicket via API limpa');
console.log('  4. ✅ DOM sempre atualizado');
console.log('  5. ✅ handleControleVendasChange silencioso');
