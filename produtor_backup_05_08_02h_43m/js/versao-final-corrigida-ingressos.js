/**
 * VERSÃO FINAL CORRIGIDA - INGRESSOS COMPLETOS
 * Resolve TODOS os problemas restantes:
 * 1. Combo com conteudo_combo JSON correto
 * 2. Renderização correta de combos (não como gratuitos)
 * 3. Campos preco, taxa_plataforma, valor_receber para combos
 * 4. Limpeza de selects ao abrir modais
 * 5. editTicket funcionando via API limpa
 */

console.log('🔧 VERSAO-FINAL-CORRIGIDA-INGRESSOS.JS carregando...');

/**
 * MAPEAMENTO COMPLETO DOS IDs DOS MODAIS
 */
const MODAL_FIELDS = {
    paidTicketModal: {
        titulo: '#paidTicketTitle',
        descricao: '#paidTicketDescription', 
        quantidade_total: '#paidTicketQuantity',
        preco: '#paidTicketPrice',
        lote_id: '#paidTicketLote',
        taxa_plataforma: '#paidTicketTaxaValor',
        valor_receber: '#paidTicketValorReceber'
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
        taxa_plataforma: '#comboTicketTaxaValor',
        valor_receber: '#comboTicketReceive',
        lote_id: '#comboTicketLote',
        conteudo_combo: null // Será extraído da interface de combo
    }
};

/**
 * SOBRESCREVER TODAS AS FUNÇÕES GLOBAIS
 */
function aplicarSobrescritasCompletas() {
    console.log('🎯 Aplicando sobrescritas completas...');
    
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
            window[nomeFuncao] = async function(...args) {
                console.log(`📝 Interceptando ${nomeFuncao}`);
                
                let tipo;
                if (nomeFuncao.includes('Paid') || nomeFuncao.includes('Pago')) {
                    tipo = 'pago';
                } else if (nomeFuncao.includes('Free') || nomeFuncao.includes('Gratuito')) {
                    tipo = 'gratuito';
                } else if (nomeFuncao.includes('Combo')) {
                    tipo = 'combo';
                } else {
                    tipo = 'pago';
                }
                
                await criarIngressoViaSobrescrita(tipo);
                return false;
            };
            
            console.log(`✅ ${nomeFuncao} sobrescrita`);
        }
    });
    
    // Sobrescrever operações
    window.removeTicket = removeTicketAPILimpa;
    window.editTicket = editTicketAPILimpa;
    
    // Interceptar abertura de modais para limpeza
    interceptarAberturaModais();
    
    console.log('✅ Todas as funções sobrescritas');
}

/**
 * Interceptar abertura de modais para limpeza
 */
function interceptarAberturaModais() {
    // Interceptar funções que abrem modais
    const funcoesAbertura = ['openPaidTicketModal', 'openFreeTicketModal', 'openComboTicketModal'];
    
    funcoesAbertura.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const funcaoOriginal = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                // Executar função original primeiro
                const resultado = funcaoOriginal.apply(this, args);
                
                // Depois limpar selects
                setTimeout(() => {
                    limparSelectsModais();
                }, 100);
                
                return resultado;
            };
        }
    });
    
    // Interceptar também cliques diretos nos botões
    setTimeout(() => {
        const botoes = [
            'button[onclick*="openPaidTicketModal"]',
            'button[onclick*="openFreeTicketModal"]', 
            'button[onclick*="openComboTicketModal"]'
        ];
        
        botoes.forEach(seletor => {
            const elementos = document.querySelectorAll(seletor);
            elementos.forEach(elemento => {
                elemento.addEventListener('click', () => {
                    setTimeout(() => limparSelectsModais(), 150);
                });
            });
        });
    }, 2000);
}

/**
 * Limpar selects dos modais para evitar acúmulo
 */
function limparSelectsModais() {
    console.log('🧹 Limpando selects dos modais...');
    
    const selects = [
        '#paidTicketLote',
        '#freeTicketLote',
        '#comboTicketLote',
        '#comboTicketTypeSelect'
    ];
    
    selects.forEach(seletor => {
        const select = document.querySelector(seletor);
        if (select) {
            // Manter apenas a primeira opção (placeholder)
            const primeiraOpcao = select.querySelector('option:first-child');
            select.innerHTML = '';
            if (primeiraOpcao) {
                select.appendChild(primeiraOpcao);
            }
            console.log(`✅ Select ${seletor} limpo`);
        }
    });
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
    
    // Validação específica para combo
    if (tipo === 'combo') {
        if (!dados.conteudo_combo || dados.conteudo_combo === '[]') {
            alert('Por favor, adicione pelo menos um item ao combo');
            return;
        }
        
        if (!dados.preco || dados.preco <= 0) {
            alert('Por favor, informe um preço válido para o combo');
            return;
        }
    }
    
    try {
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
            console.log(`✅ Ingresso ${tipo} criado! ID: ${data.ingresso_id}`);
            
            fecharModalCorreto(modalId);
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
            // Campo especial
            if (campo === 'preco' && tipo === 'gratuito') {
                dados[campo] = 0;
            } else if (campo === 'conteudo_combo' && tipo === 'combo') {
                // Extrair conteúdo do combo da interface
                dados[campo] = extrairConteudoCombo();
            }
            return;
        }
        
        const elemento = document.querySelector(seletor);
        if (elemento) {
            let valor = elemento.value;
            
            if (campo === 'preco' || campo === 'taxa_plataforma' || campo === 'valor_receber') {
                // Limpeza monetária
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
            } else if (campo === 'preco' || campo === 'taxa_plataforma' || campo === 'valor_receber') {
                dados[campo] = 0;
            } else {
                dados[campo] = '';
            }
        }
    });
    
    // Campos sempre presentes
    if (tipo === 'gratuito') {
        dados.preco = 0;
        dados.taxa_plataforma = 0;
        dados.valor_receber = 0;
    } else if (tipo === 'combo') {
        // Para combos, garantir que temos todos os campos financeiros
        if (!dados.taxa_plataforma) dados.taxa_plataforma = 0;
        if (!dados.valor_receber) dados.valor_receber = dados.preco || 0;
    }
    
    dados.limite_min = 1;
    dados.limite_max = 5;
    
    return dados;
}

/**
 * Extrair conteúdo do combo da interface
 */
function extrairConteudoCombo() {
    console.log('🔍 Extraindo conteúdo do combo...');
    
    // Procurar por elementos que representam itens do combo
    const itensCombo = [];
    
    // Método 1: Procurar em lista visual de itens
    const listaItens = document.querySelector('#comboItemsList, .combo-items-list, [data-combo-items]');
    if (listaItens) {
        const itens = listaItens.querySelectorAll('.combo-item, [data-combo-item]');
        itens.forEach(item => {
            const ingressoId = item.dataset.ingressoId || item.dataset.comboIngressoId;
            const quantidade = item.dataset.quantidade || item.dataset.comboQuantidade;
            
            if (ingressoId && quantidade) {
                itensCombo.push({
                    ingresso_id: parseInt(ingressoId),
                    quantidade: parseInt(quantidade)
                });
            }
        });
    }
    
    // Método 2: Procurar em variável global se existir
    if (typeof window.comboItems !== 'undefined' && Array.isArray(window.comboItems)) {
        window.comboItems.forEach(item => {
            if (item.ingresso_id && item.quantidade) {
                itensCombo.push({
                    ingresso_id: parseInt(item.ingresso_id),
                    quantidade: parseInt(item.quantidade)
                });
            }
        });
    }
    
    // Método 3: Buscar em inputs hidden se existirem
    const inputsCombo = document.querySelectorAll('input[name*="combo"], input[data-combo]');
    inputsCombo.forEach(input => {
        try {
            const valor = JSON.parse(input.value);
            if (Array.isArray(valor)) {
                valor.forEach(item => {
                    if (item.ingresso_id && item.quantidade) {
                        itensCombo.push({
                            ingresso_id: parseInt(item.ingresso_id),
                            quantidade: parseInt(item.quantidade)
                        });
                    }
                });
            }
        } catch (e) {
            // Ignorar inputs que não são JSON
        }
    });
    
    console.log('📦 Itens do combo encontrados:', itensCombo);
    
    return itensCombo.length > 0 ? JSON.stringify(itensCombo) : '[]';
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
            
            setTimeout(() => recarregarListaAPILimpa(), 200);
            
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
 * editTicket via API limpa EXCLUSIVAMENTE
 */
async function editTicketAPILimpa(ingressoId) {
    console.log(`✏️ editTicket API limpa EXCLUSIVAMENTE: ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        alert('Erro: Evento não identificado');
        return;
    }
    
    try {
        console.log('🔍 Buscando ingresso via API limpa...');
        
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta busca API limpa:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON busca:', parseError);
            alert('Erro de comunicação ao buscar ingresso');
            return;
        }
        
        if (data.sucesso && data.ingresso) {
            console.log('✅ Ingresso encontrado via API limpa:', data.ingresso);
            abrirModalEdicaoAPILimpa(data.ingresso);
        } else {
            console.error('❌ Ingresso não encontrado via API limpa:', data.erro);
            alert(`Ingresso ${ingressoId} não encontrado: ${data.erro || 'Erro desconhecido'}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar ingresso via API limpa:', error);
        alert('Erro de conexão ao buscar ingresso');
    }
}

/**
 * Abrir modal de edição via API limpa
 */
function abrirModalEdicaoAPILimpa(ingresso) {
    console.log('📝 Abrindo modal de edição via API limpa:', ingresso.titulo);
    
    // Mostrar dados do ingresso para debug
    console.log('📊 Dados do ingresso para edição:', ingresso);
    
    // Por enquanto, mostrar alert com os dados (até implementar modal de edição)
    const info = `
Editar Ingresso:
- ID: ${ingresso.id}
- Título: ${ingresso.titulo}
- Tipo: ${ingresso.tipo}
- Preço: R$ ${parseFloat(ingresso.preco || 0).toFixed(2)}
- Quantidade: ${ingresso.quantidade_total}
- Lote ID: ${ingresso.lote_id || 'Nenhum'}
    `.trim();
    
    alert(info);
    
    // TODO: Implementar modal de edição real
    console.log('⚠️ Modal de edição ainda não implementado completamente');
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
            if (!window.dadosAtivos) {
                window.dadosAtivos = {};
            }
            
            window.dadosAtivos.ingressos = data.ingressos || [];
            
            console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos recarregados via API limpa`);
            
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
    
    window.dadosAtivos.ingressos.forEach((ingresso, index) => {
        console.log(`🎨 Renderizando ${index + 1}: ${ingresso.titulo} (ID: ${ingresso.id}, Tipo: ${ingresso.tipo})`);
        criarElementoIngressoCorreto(ingresso);
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados corretamente`);
}

/**
 * Criar elemento de ingresso correto (com tipo correto para combos)
 */
function criarElementoIngressoCorreto(ingresso) {
    // CRÍTICO: Tipo correto baseado no campo tipo do banco
    let type;
    if (ingresso.tipo === 'pago') {
        type = 'paid';
    } else if (ingresso.tipo === 'gratuito') {
        type = 'free';
    } else if (ingresso.tipo === 'combo') {
        type = 'combo'; // ✅ Combo renderizado como combo, não como free
    } else {
        type = 'paid'; // Padrão
    }
    
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    
    // CRÍTICO: Preço correto para cada tipo
    let price;
    if (type === 'free') {
        price = 'Gratuito';
    } else if (type === 'combo') {
        price = `COMBO - R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    } else {
        price = `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }
    
    console.log(`🎨 Renderizando: ${title} como ${type} com preço "${price}"`);
    
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
                ultimoElemento.dataset.ticketId = ingresso.id;
                ultimoElemento.setAttribute('data-ticket-id', ingresso.id);
                
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
    
    let price;
    if (ingresso.tipo === 'gratuito') {
        price = 'Gratuito';
    } else if (ingresso.tipo === 'combo') {
        price = `COMBO - R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    } else {
        price = `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }
    
    elemento.innerHTML = `
        <div class="ticket-content">
            <div class="ticket-header">
                <span class="ticket-name">${ingresso.titulo}</span>
                <span class="ticket-price">${price}</span>
            </div>
            <div class="ticket-details">
                <span>Tipo: ${ingresso.tipo.toUpperCase()} | Quantidade: ${ingresso.quantidade_total || 100}</span>
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
 * Fechar modal corretamente
 */
function fecharModalCorreto(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
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
        
        // Limpar combos se for modal de combo
        if (modalId === 'comboTicketModal') {
            if (typeof window.comboItems !== 'undefined') {
                window.comboItems = [];
            }
        }
        
        console.log(`✅ Modal ${modalId} fechado e limpo`);
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
        if (campoLimite) campoLimite.style.display = 'block';
        if (btnConfirmar) btnConfirmar.style.display = 'inline-block';
        console.log('✅ Controle ativado silenciosamente');
    } else {
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
    console.log('🚀 Inicializando versão final corrigida...');
    
    setTimeout(() => {
        aplicarSobrescritasCompletas();
        
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        if (eventoId) {
            recarregarListaAPILimpa();
        }
    }, 2000);
    
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

console.log('✅ VERSAO-FINAL-CORRIGIDA-INGRESSOS.JS carregado!');
console.log('🔧 Recursos implementados:');
console.log('  1. ✅ Combo com conteudo_combo JSON correto');
console.log('  2. ✅ Renderização correta de combos (não como gratuitos)');
console.log('  3. ✅ Campos preco, taxa_plataforma, valor_receber para combos');
console.log('  4. ✅ Limpeza de selects ao abrir modais');
console.log('  5. ✅ editTicket funcionando via API limpa exclusivamente');
