/**
 * CORREÇÃO ESPECÍFICA: editTicket() para ingressos combo
 * 
 * PROBLEMAS IDENTIFICADOS:
 * 1. Dados da tabela não estão sendo renderizados corretamente no dialog de edição
 * 2. Itens do JSON contido no campo conteudo_combo não estão sendo renderizados
 * 
 * SOLUÇÃO:
 * - Corrigir função editTicket para buscar dados corretamente do banco
 * - Corrigir population do modal de edição de combo
 * - Corrigir renderização dos itens do conteudo_combo
 */

console.log('🔧 CORREÇÃO ESPECÍFICA: editTicket() para combos carregando...');

/**
 * FUNÇÃO EDITTICKET CORRIGIDA ESPECIFICAMENTE PARA COMBOS
 */
window.editTicketComboCorrigido = async function(ingressoId) {
    console.log(`✏️ editTicket CORRIGIDO para combo: ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        alert('Erro: Evento não identificado');
        return;
    }
    
    try {
        console.log('🔍 Buscando dados do ingresso no banco...');
        
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta busca ingresso:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON busca:', parseError);
            alert('Erro de comunicação ao buscar ingresso');
            return;
        }
        
        if (data.sucesso && data.ingresso) {
            console.log('✅ Dados do ingresso encontrados:', data.ingresso);
            
            // Usar a função existente do sistema para popular o modal
            await abrirModalEdicaoCorrigido(data.ingresso);
            
        } else {
            console.error('❌ Ingresso não encontrado:', data.erro);
            alert(`Ingresso ${ingressoId} não encontrado: ${data.erro || 'Erro desconhecido'}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar ingresso:', error);
        alert('Erro de conexão ao buscar ingresso');
    }
};

/**
 * ABRIR MODAL DE EDIÇÃO CORRIGIDO - USA FUNÇÕES EXISTENTES
 */
async function abrirModalEdicaoCorrigido(ingresso) {
    console.log('📝 Abrindo modal de edição CORRIGIDO para:', ingresso.titulo, 'Tipo:', ingresso.tipo);
    
    let modalId;
    if (ingresso.tipo === 'pago') {
        modalId = 'editPaidTicketModal';
        // Usar função existente se disponível
        if (typeof window.populateEditPaidTicketModal === 'function') {
            window.populateEditPaidTicketModal(ingresso, ingresso.id);
        } else {
            preencherModalPagoCorrigido(ingresso);
        }
    } else if (ingresso.tipo === 'gratuito') {
        modalId = 'editFreeTicketModal';
        // Usar função existente se disponível
        if (typeof window.populateEditFreeTicketModal === 'function') {
            window.populateEditFreeTicketModal(ingresso, ingresso.id);
        } else {
            preencherModalGratuitoCorrigido(ingresso);
        }
    } else if (ingresso.tipo === 'combo') {
        modalId = 'editComboTicketModal';
        // USAR A FUNÇÃO EXISTENTE DO SISTEMA PARA COMBOS
        if (typeof window.populateEditComboModal === 'function') {
            console.log('✅ Usando função existente populateEditComboModal');
            
            // Converter dados para formato esperado pela função existente
            const comboDataFormatado = {
                id: ingresso.id,
                title: ingresso.titulo,          // Converter titulo -> title
                description: ingresso.descricao, // Converter descricao -> description  
                quantity: ingresso.quantidade_total, // Converter quantidade_total -> quantity
                price: parseFloat(ingresso.preco), // Garantir que seja número
                valor_receber: parseFloat(ingresso.valor_receber),
                inicio_venda: ingresso.inicio_venda,
                fim_venda: ingresso.fim_venda,
                loteId: ingresso.lote_id,        // Manter loteId
                items: [], // Será preenchido pelo processamento do conteudo_combo
                conteudo_combo: ingresso.conteudo_combo
            };
            
            console.log('📊 Dados formatados para populateEditComboModal:', comboDataFormatado);
            
            window.populateEditComboModal(comboDataFormatado, ingresso.id);
            
            // DEPOIS aplicar correções específicas que estão faltando
            setTimeout(() => {
                aplicarCorrecoesPosPopulacao(ingresso);
            }, 200);
            
        } else {
            console.warn('⚠️ Função populateEditComboModal não encontrada, usando fallback');
            preencherModalComboCorrigido(ingresso);
        }
    } else {
        console.error('❌ Tipo de ingresso não reconhecido:', ingresso.tipo);
        alert('Tipo de ingresso não reconhecido');
        return;
    }
    
    console.log(`📝 Usando modal: ${modalId}`);
    
    // Verificar se modal existe
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} não encontrado`);
        alert(`Modal de edição para ${ingresso.tipo} não encontrado`);
        return;
    }
    
    // Mostrar modal
    modal.style.display = 'block';
    modal.style.display = 'flex'; // Garantir que apareça
    
    console.log(`✅ Modal ${modalId} aberto e preenchido`);
}

/**
 * PREENCHER MODAL COMBO CORRIGIDO - USANDO NOMES CORRETOS DOS CAMPOS
 */
function preencherModalComboCorrigido(ingresso) {
    console.log('📦 Preenchendo modal de combo com nomes corretos:', ingresso);
    
    // USAR OS NOMES CORRETOS DOS CAMPOS CONFORME IDENTIFICADO
    const campos = {
        'editComboId': ingresso.id,
        'editComboTitle': ingresso.titulo,
        'editComboDescription': ingresso.descricao || '',
        'editComboQuantity': ingresso.quantidade_total,
        'editComboPrice': formatarMoeda(ingresso.preco),
        'editComboTaxaValor': formatarMoeda(ingresso.taxa_plataforma || 0),
        'editComboReceive': formatarMoeda(ingresso.valor_receber || ingresso.preco),
        'editComboSaleStart': ingresso.inicio_venda || '',
        'editComboSaleEnd': ingresso.fim_venda || ''
    };
    
    // Preencher cada campo
    Object.keys(campos).forEach(fieldId => {
        const elemento = document.getElementById(fieldId);
        if (elemento) {
            elemento.value = campos[fieldId];
            console.log(`✅ Preenchido ${fieldId}: ${campos[fieldId]}`);
        } else {
            console.warn(`⚠️ Campo não encontrado: ${fieldId}`);
        }
    });
    
    // ESPECÍFICO PARA COMBO: Processar conteudo_combo
    if (ingresso.conteudo_combo) {
        processarConteudoComboCorrigido(ingresso.conteudo_combo);
    }
}

/**
 * PREENCHER MODAL PAGO CORRIGIDO
 */
function preencherModalPagoCorrigido(ingresso) {
    console.log('💰 Preenchendo modal de pago:', ingresso);
    
    const campos = {
        'editPaidTicketId': ingresso.id,
        'editPaidTicketTitle': ingresso.titulo,
        'editPaidTicketDescription': ingresso.descricao || '',
        'editPaidTicketQuantity': ingresso.quantidade_total,
        'editPaidTicketPrice': formatarMoeda(ingresso.preco),
        'editPaidSaleStart': ingresso.inicio_venda || '',
        'editPaidSaleEnd': ingresso.fim_venda || '',
        'editPaidMinLimit': ingresso.limite_min || 1,
        'editPaidMaxLimit': ingresso.limite_max || 5
    };
    
    Object.keys(campos).forEach(fieldId => {
        const elemento = document.getElementById(fieldId);
        if (elemento) {
            elemento.value = campos[fieldId];
            console.log(`✅ Preenchido ${fieldId}: ${campos[fieldId]}`);
        }
    });
}

/**
 * PREENCHER MODAL GRATUITO CORRIGIDO
 */
function preencherModalGratuitoCorrigido(ingresso) {
    console.log('🆓 Preenchendo modal de gratuito:', ingresso);
    
    const campos = {
        'editFreeTicketId': ingresso.id,
        'editFreeTicketTitle': ingresso.titulo,
        'editFreeTicketDescription': ingresso.descricao || '',
        'editFreeTicketQuantity': ingresso.quantidade_total,
        'editFreeSaleStart': ingresso.inicio_venda || '',
        'editFreeSaleEnd': ingresso.fim_venda || '',
        'editFreeMinLimit': ingresso.limite_min || 1,
        'editFreeMaxLimit': ingresso.limite_max || 5
    };
    
    Object.keys(campos).forEach(fieldId => {
        const elemento = document.getElementById(fieldId);
        if (elemento) {
            elemento.value = campos[fieldId];
            console.log(`✅ Preenchido ${fieldId}: ${campos[fieldId]}`);
        }
    });
}

/**
 * APLICAR CORREÇÕES PÓS-POPULAÇÃO - USA FUNÇÕES EXISTENTES DO SISTEMA
 */
async function aplicarCorrecoesPosPopulacao(ingresso) {
    console.log('🔧 Aplicando correções pós-população:', ingresso.titulo);
    
    try {
        // 1. CARREGAR CAMPOS QUE FALTARAM
        aplicarCamposFaltantes(ingresso);
        
        // 2. CALCULAR VALORES MONETÁRIOS (usar função existente se disponível)
        calcularValoresCombo(ingresso);
        
        // 3. CARREGAR E EXIBIR NOME DO LOTE
        await carregarNomeLote(ingresso.lote_id);
        
        // 4. APLICAR DATAS E REGRAS DE LOTE
        aplicarRegrasDatas(ingresso.lote_id);
        
        // 5. BUSCAR NOMES REAIS DOS INGRESSOS E PROCESSAR COMBO
        if (ingresso.conteudo_combo) {
            await processarConteudoComboCorrigido(ingresso.conteudo_combo);
        }
        
        // 6. CARREGAR SELECT DE INGRESSOS DO LOTE
        await carregarIngressosDoLote(ingresso.lote_id);
        
        console.log('✅ Todas as correções pós-população aplicadas');
        
    } catch (error) {
        console.error('❌ Erro nas correções pós-população:', error);
    }
}

/**
 * APLICAR CAMPOS FALTANTES
 */
function aplicarCamposFaltantes(ingresso) {
    console.log('📝 Aplicando campos faltantes...');
    
    // Campos de data
    const saleStart = document.getElementById('editComboSaleStart');
    const saleEnd = document.getElementById('editComboSaleEnd');
    
    if (saleStart && ingresso.inicio_venda) {
        saleStart.value = ingresso.inicio_venda;
    }
    if (saleEnd && ingresso.fim_venda) {
        saleEnd.value = ingresso.fim_venda;
    }
    
    console.log('✅ Campos de data aplicados');
}

/**
 * CALCULAR VALORES MONETÁRIOS DO COMBO - USA FUNÇÕES EXISTENTES
 */
function calcularValoresCombo(ingresso) {
    console.log('💰 Calculando valores monetários do combo...');
    
    const preco = parseFloat(ingresso.preco) || 0;
    const taxaPlataforma = parseFloat(ingresso.taxa_plataforma) || 0;
    const valorReceber = parseFloat(ingresso.valor_receber) || preco;
    
    // Tentar usar função existente calcularValoresEditCombo
    if (typeof window.calcularValoresEditCombo === 'function') {
        console.log('🔧 Usando função existente calcularValoresEditCombo');
        window.calcularValoresEditCombo();
    }
    
    // Preencher campos manualmente se necessário
    const camposTaxa = [
        'editComboTaxaValor',
        'editComboTaxaPlataforma',
        'editComboTax'
    ];
    
    const camposComprador = [
        'editComboValorComprador',
        'editComboComprador'
    ];
    
    // Atualizar campos de taxa
    camposTaxa.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            if (elemento.tagName === 'INPUT') {
                elemento.value = formatarMoeda(taxaPlataforma);
            } else {
                elemento.textContent = formatarMoeda(taxaPlataforma);
            }
            console.log(`✅ ${campoId} atualizado: ${formatarMoeda(taxaPlataforma)}`);
        }
    });
    
    // Atualizar campos de valor do comprador
    const valorComprador = preco + taxaPlataforma;
    camposComprador.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            if (elemento.tagName === 'INPUT') {
                elemento.value = formatarMoeda(valorComprador);
            } else {
                elemento.textContent = formatarMoeda(valorComprador);
            }
            console.log(`✅ ${campoId} atualizado: ${formatarMoeda(valorComprador)}`);
        }
    });
    
    console.log('✅ Valores monetários calculados');
}

/**
 * CARREGAR NOME DO LOTE E EXIBIR
 */
async function carregarNomeLote(loteId) {
    if (!loteId) {
        console.log('⚠️ Sem lote associado');
        return;
    }
    
    console.log('🏷️ Carregando nome do lote:', loteId);
    
    // Usar função existente se disponível
    if (typeof window.exibirDadosLoteDisplay === 'function') {
        console.log('🔧 Usando função existente exibirDadosLoteDisplay');
        window.exibirDadosLoteDisplay(loteId, 'editComboLoteDisplay');
    }
    
    // Buscar nome do lote manualmente se necessário
    const nomeDisplay = document.getElementById('editComboLoteDisplay');
    if (nomeDisplay && !nomeDisplay.textContent.trim()) {
        try {
            // Tentar buscar via DOM primeiro
            const loteElement = document.querySelector(`[data-lote-id="${loteId}"]`);
            if (loteElement) {
                const nomeElement = loteElement.querySelector('.lote-item-name');
                if (nomeElement) {
                    nomeDisplay.textContent = nomeElement.textContent;
                    console.log('✅ Nome do lote carregado via DOM:', nomeElement.textContent);
                    return;
                }
            }
            
            // Fallback: nome genérico
            nomeDisplay.textContent = `Lote ${loteId}`;
            console.log('⚠️ Nome genérico aplicado:', `Lote ${loteId}`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar nome do lote:', error);
        }
    }
}

/**
 * APLICAR REGRAS DE DATAS BASEADAS NO TIPO DO LOTE
 */
function aplicarRegrasDatas(loteId) {
    if (!loteId) return;
    
    console.log('📅 Aplicando regras de datas para lote:', loteId);
    
    try {
        // Buscar dados do lote no DOM
        const loteElement = document.querySelector(`[data-lote-id="${loteId}"]`);
        if (loteElement) {
            const tipoLote = loteElement.dataset.loteType || loteElement.dataset.tipo;
            
            if (tipoLote === 'data') {
                console.log('🔒 Lote tipo data - aplicando readonly nas datas');
                
                const saleStart = document.getElementById('editComboSaleStart');
                const saleEnd = document.getElementById('editComboSaleEnd');
                
                if (saleStart) {
                    saleStart.readOnly = true;
                    saleStart.style.backgroundColor = '#f5f5f5';
                    saleStart.style.cursor = 'not-allowed';
                }
                if (saleEnd) {
                    saleEnd.readOnly = true;
                    saleEnd.style.backgroundColor = '#f5f5f5';
                    saleEnd.style.cursor = 'not-allowed';
                }
                
                console.log('✅ Campos de data marcados como readonly');
            } else {
                console.log('📝 Lote não é tipo data - datas editáveis');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao aplicar regras de datas:', error);
    }
}

/**
 * CARREGAR INGRESSOS DO LOTE NO SELECT
 */
async function carregarIngressosDoLote(loteId) {
    if (!loteId) return;
    
    console.log('🎫 Carregando ingressos do lote para select:', loteId);
    
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select) {
        console.log('⚠️ Select editComboTicketTypeSelect não encontrado');
        return;
    }
    
    // Usar função existente se disponível
    if (typeof window.populateEditComboTicketSelect === 'function') {
        console.log('🔧 Usando função existente populateEditComboTicketSelect');
        window.populateEditComboTicketSelect();
        return;
    }
    
    // Implementação manual
    try {
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        if (!eventoId) {
            console.log('⚠️ Evento ID não encontrado');
            return;
        }
        
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos_lote&evento_id=${eventoId}&lote_id=${loteId}`
        });
        
        const data = await response.json();
        
        if (data.sucesso && data.ingressos) {
            select.innerHTML = '<option value="">Escolha um ingresso</option>';
            
            data.ingressos.forEach(ingresso => {
                if (ingresso.tipo !== 'combo') { // Não incluir outros combos
                    const option = document.createElement('option');
                    option.value = ingresso.id;
                    option.textContent = `${ingresso.titulo} - R$ ${parseFloat(ingresso.preco).toFixed(2)}`;
                    option.dataset.ticketData = JSON.stringify({
                        id: ingresso.id,
                        name: ingresso.titulo,
                        price: ingresso.preco,
                        type: ingresso.tipo
                    });
                    select.appendChild(option);
                }
            });
            
            console.log(`✅ ${data.ingressos.length} ingressos carregados no select`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar ingressos do lote:', error);
        select.innerHTML = '<option value="">Erro ao carregar ingressos</option>';
    }
}
async function processarConteudoComboCorrigido(conteudoCombo) {
    console.log('📦 Processando conteudo_combo CORRIGIDO:', conteudoCombo);
    
    if (!conteudoCombo || conteudoCombo === '') {
        console.log('📦 Combo sem itens definidos');
        return;
    }
    
    try {
        let itensCombo;
        
        // Tentar parsear JSON se for string
        if (typeof conteudoCombo === 'string') {
            itensCombo = JSON.parse(conteudoCombo);
        } else {
            itensCombo = conteudoCombo;
        }
        
        console.log('📦 Itens do combo parseados:', itensCombo);
        
        if (!Array.isArray(itensCombo) || itensCombo.length === 0) {
            console.log('📦 Array de itens vazio ou inválido');
            return;
        }
        
        // Buscar nomes dos ingressos para exibição correta
        const nomesIngressos = await buscarNomesIngressosCorrigido();
        console.log('📋 Nomes dos ingressos:', nomesIngressos);
        
        // IMPORTANTE: Usar a variável global editComboItems se existir (compatibilidade com criaevento.js)
        if (typeof window.editComboItems !== 'undefined') {
            window.editComboItems = itensCombo;
            console.log('✅ editComboItems atualizado:', window.editComboItems);
            
            // Chamar função de renderização se existir
            if (typeof window.renderEditComboItems === 'function') {
                window.renderEditComboItems();
                console.log('✅ Interface renderizada via renderEditComboItems');
            }
        }
        
        // Atualizar window.comboItems para compatibilidade geral
        window.comboItems = itensCombo.map(item => ({
            ticketId: item.ingresso_id.toString(),
            quantity: item.quantidade,
            name: nomesIngressos[item.ingresso_id] || `Ingresso ${item.ingresso_id}`,
            price: '0',
            type: 'unknown'
        }));
        
        console.log('📦 window.comboItems atualizado:', window.comboItems);
        
        // Tentar múltiplas estratégias para atualizar a interface
        
        // Estratégia 1: updateComboItemsList
        if (typeof window.updateComboItemsList === 'function') {
            setTimeout(() => {
                window.updateComboItemsList();
                console.log('✅ Interface atualizada via updateComboItemsList');
            }, 100);
        }
        
        // Estratégia 2: updateEditComboItemsList  
        if (typeof window.updateEditComboItemsList === 'function') {
            setTimeout(() => {
                window.updateEditComboItemsList();
                console.log('✅ Interface atualizada via updateEditComboItemsList');
            }, 200);
        }
        
        // Estratégia 3: Forçar atualização manual
        setTimeout(() => {
            atualizarInterfaceComboManual(itensCombo, nomesIngressos);
        }, 300);
        
    } catch (error) {
        console.error('❌ Erro ao processar conteudo_combo:', error);
        alert('Erro ao carregar itens do combo');
    }
}

/**
 * ATUALIZAR INTERFACE COMBO MANUAL - ÚLTIMO RECURSO
 */
function atualizarInterfaceComboManual(itensCombo, nomesIngressos) {
    console.log('🔧 Atualizando interface de combo MANUALMENTE...');
    
    // Buscar container de itens do combo no modal de edição
    const containers = [
        'editComboItemsList',
        'comboItemsList', 
        'combo-items-list',
        'editComboItems'
    ];
    
    let container = null;
    for (const containerId of containers) {
        container = document.getElementById(containerId);
        if (container) {
            console.log(`✅ Container encontrado: ${containerId}`);
            break;
        }
    }
    
    if (!container) {
        console.warn('⚠️ Container de itens do combo não encontrado');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Renderizar itens
    if (itensCombo.length === 0) {
        container.innerHTML = `
            <div class="combo-empty-state">
                <div style="font-size: 1.2rem; margin-bottom: 5px;">+</div>
                <div style="color: #8B95A7; font-size: 11px;">Adicione tipos de ingresso</div>
            </div>
        `;
    } else {
        const itensHtml = itensCombo.map((item, index) => {
            const nomeIngresso = nomesIngressos[item.ingresso_id] || `Ingresso ${item.ingresso_id}`;
            
            return `
                <div class="combo-item" data-index="${index}" data-ticket-id="${item.ingresso_id}">
                    <div class="combo-item-info">
                        <div class="combo-item-title">${nomeIngresso}</div>
                        <div class="combo-item-details">ID: ${item.ingresso_id} • Quantidade: ${item.quantidade}</div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div class="combo-item-quantity">${item.quantidade}x</div>
                        <button class="btn-icon btn-delete" onclick="removerItemComboCorrigido(${index})" title="Remover">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = itensHtml;
    }
    
    console.log('✅ Interface de combo atualizada MANUALMENTE');
}

/**
 * PROCESSAR CONTEÚDO DO COMBO CORRIGIDO - USA NOMES REAIS DOS INGRESSOS
 */
async function processarConteudoComboCorrigido(conteudoCombo) {
    console.log('📦 Processando conteudo_combo CORRIGIDO:', conteudoCombo);
    
    if (!conteudoCombo || conteudoCombo === '') {
        console.log('📦 Combo sem itens definidos');
        return;
    }
    
    try {
        let itensCombo;
        if (typeof conteudoCombo === 'string') {
            itensCombo = JSON.parse(conteudoCombo);
        } else {
            itensCombo = conteudoCombo;
        }
        
        if (!Array.isArray(itensCombo) || itensCombo.length === 0) {
            console.log('📦 Array de itens vazio ou inválido');
            return;
        }
        
        // BUSCAR NOMES REAIS DOS INGRESSOS VIA API
        const nomesIngressos = await buscarNomesIngressosViaAPI();
        console.log('📋 Nomes dos ingressos obtidos:', nomesIngressos);
        
        // Atualizar variáveis globais
        if (typeof window.editComboItems !== 'undefined') {
            window.editComboItems = itensCombo;
            if (typeof window.renderEditComboItems === 'function') {
                window.renderEditComboItems();
            }
        }
        
        window.comboItems = itensCombo.map(item => ({
            ticketId: item.ingresso_id.toString(),
            quantity: item.quantidade,
            name: nomesIngressos[item.ingresso_id] || `Ingresso ${item.ingresso_id}`,
            price: '0',
            type: 'unknown'
        }));
        
        // Atualizar interface manualmente com nomes reais
        setTimeout(() => {
            atualizarInterfaceComboManual(itensCombo, nomesIngressos);
        }, 300);
        
    } catch (error) {
        console.error('❌ Erro ao processar conteudo_combo:', error);
    }
}

/**
 * BUSCAR NOMES REAIS DOS INGRESSOS VIA API
 */
async function buscarNomesIngressosViaAPI() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    if (!eventoId) return {};
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const data = await response.json();
        if (data.sucesso && data.ingressos) {
            const nomes = {};
            data.ingressos.forEach(ingresso => {
                nomes[ingresso.id] = ingresso.titulo; // NOME REAL do banco
            });
            return nomes;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar nomes via API:', error);
    }
    return {};
}

/**
 * ATUALIZAR INTERFACE COMBO MANUAL - COM NOMES REAIS
 */
function atualizarInterfaceComboManual(itensCombo, nomesIngressos) {
    const containers = ['editComboItemsList', 'comboItemsList', 'combo-items-list', 'editComboItems'];
    let container = null;
    
    for (const containerId of containers) {
        container = document.getElementById(containerId);
        if (container) break;
    }
    
    if (!container) return;
    
    if (itensCombo.length === 0) {
        container.innerHTML = '<div class="combo-empty-state">Nenhum item no combo</div>';
    } else {
        const itensHtml = itensCombo.map((item, index) => {
            const nomeIngresso = nomesIngressos[item.ingresso_id] || `Ingresso ${item.ingresso_id}`;
            return `
                <div class="combo-item" data-index="${index}" data-ticket-id="${item.ingresso_id}">
                    <div class="combo-item-info">
                        <div class="combo-item-title">${nomeIngresso}</div>
                        <div class="combo-item-details">Quantidade: ${item.quantidade}x</div>
                    </div>
                    <button class="btn-icon btn-delete" onclick="removerItemComboCorrigido(${index})">🗑️</button>
                </div>
            `;
        }).join('');
        container.innerHTML = itensHtml;
    }
    
    console.log('✅ Interface de combo atualizada com nomes reais');
}

/**
 * REMOVER ITEM DO COMBO CORRIGIDO
 */
window.removerItemComboCorrigido = function(index) {
    console.log(`🗑️ Removendo item do combo: ${index}`);
    
    if (window.comboItems && window.comboItems[index]) {
        window.comboItems.splice(index, 1);
        
        // Atualizar editComboItems também se existir
        if (window.editComboItems && window.editComboItems[index]) {
            window.editComboItems.splice(index, 1);
        }
        
        // Atualizar interface
        if (typeof window.updateComboItemsList === 'function') {
            window.updateComboItemsList();
        } else if (typeof window.renderEditComboItems === 'function') {
            window.renderEditComboItems();
        } else {
            // Buscar nomes e atualizar manualmente
            buscarNomesIngressosCorrigido().then(nomes => {
                const itensCombo = window.comboItems.map(item => ({
                    ingresso_id: parseInt(item.ticketId),
                    quantidade: item.quantity
                }));
                atualizarInterfaceComboManual(itensCombo, nomes);
            });
        }
        
        console.log(`✅ Item ${index} removido`);
    }
};
async function buscarNomesIngressosCorrigido() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem nomes para buscar');
        return {};
    }
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=buscar_nomes_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        let data;
        
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON nomes:', parseError);
            return {};
        }
        
        if (data.sucesso) {
            console.log('✅ Nomes dos ingressos obtidos:', data.nomes);
            return data.nomes;
        } else {
            console.error('❌ Erro ao buscar nomes:', data.erro);
            return {};
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar nomes dos ingressos:', error);
        return {};
    }
}

/**
 * FORMATAR MOEDA
 */
function formatarMoeda(valor) {
    if (!valor || valor === 0) return 'R$ 0,00';
    
    const numero = parseFloat(valor);
    return `R$ ${numero.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

/**
 * SOBRESCREVER FUNÇÃO EDITTICKET ORIGINAL - VERSÃO AGRESSIVA
 */
console.log('🔄 Sobrescrevendo função editTicket original com prioridade MÁXIMA...');

// Aguardar um pouco mais para garantir que todos os outros scripts carregaram
setTimeout(() => {
    console.log('🎯 FORÇANDO sobrescrita da função editTicket...');
    
    // Fazer backup de qualquer função existente
    if (typeof window.editTicket === 'function') {
        window.editTicketBackup = window.editTicket;
        console.log('📦 Backup da função original criado');
    }
    
    // FORÇAR nossa função
    window.editTicket = window.editTicketComboCorrigido;
    console.log('✅ window.editTicket = editTicketComboCorrigido FORÇADO');
    
    // Também sobrescrever variações que podem existir
    window.editTicketAPILimpaCompleto = window.editTicketComboCorrigido;
    console.log('✅ editTicketAPILimpaCompleto sobrescrito');
    
}, 3000); // Aguardar 3 segundos

// Reforçar sobrescrita periodicamente
const intervaloSobrescrita = setInterval(() => {
    if (typeof window.editTicket !== 'undefined') {
        const funcaoAtual = window.editTicket.toString();
        if (!funcaoAtual.includes('editTicketComboCorrigido')) {
            console.log('🔄 Função foi sobrescrita novamente, REFORÇANDO...');
            window.editTicket = window.editTicketComboCorrigido;
            console.log('✅ Função REFORÇADA');
        } else {
            console.log('✅ Nossa função ainda está ativa');
            clearInterval(intervaloSobrescrita); // Parar monitoramento
        }
    }
}, 2000); // Verificar a cada 2 segundos

// Parar monitoramento após 30 segundos
setTimeout(() => {
    clearInterval(intervaloSobrescrita);
    console.log('⏰ Monitoramento de sobrescrita finalizado');
}, 30000);

console.log('✅ CORREÇÃO ESPECÍFICA: editTicket() para combos carregada com PRIORIDADE MÁXIMA!');
console.log('🔧 Recursos corrigidos:');
console.log('  1. ✅ Busca correta de dados do banco');
console.log('  2. ✅ Uso da função populateEditComboModal existente');
console.log('  3. ✅ Nomes corretos dos campos (editComboTitle, editComboPrice, etc.)');
console.log('  4. ✅ Renderização correta dos itens do conteudo_combo');
console.log('  5. ✅ Compatibilidade com sistema existente');
console.log('  6. ✅ Sobrescrita AGRESSIVA para garantir funcionamento');

