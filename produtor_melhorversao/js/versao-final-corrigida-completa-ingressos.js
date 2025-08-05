/**
 * VERSÃO FINAL CORRIGIDA - TODOS OS PROBLEMAS RESOLVIDOS
 * Correções específicas:
 * 1. Captura correta do conteudo_combo usando comboItems global
 * 2. Implementação da edição via modais existentes
 * 3. Todos os outros recursos mantidos
 */

console.log('🔧 VERSAO-FINAL-CORRIGIDA-COMPLETA-INGRESSOS.JS carregando...');

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
        conteudo_combo: null // Será extraído via comboItems global
    },
    // Modais de edição existentes
    editPaidTicketModal: {
        titulo: '#editPaidTicketTitle',
        descricao: '#editPaidTicketDescription',
        quantidade_total: '#editPaidTicketQuantity',
        preco: '#editPaidTicketPrice',
        lote_id: '#editPaidTicketLote',
        taxa_plataforma: '#editPaidTicketTaxaValor',
        valor_receber: '#editPaidTicketValorReceber'
    },
    editFreeTicketModal: {
        titulo: '#editFreeTicketTitle',
        descricao: '#editFreeTicketDescription',
        quantidade_total: '#editFreeTicketQuantity',
        preco: null,
        lote_id: '#editFreeTicketLote'
    },
    editComboTicketModal: {
        titulo: '#editComboTicketTitle',
        descricao: '#editComboTicketDescription',
        quantidade_total: '#editComboTicketQuantity',
        preco: '#editComboTicketPrice',
        taxa_plataforma: '#editComboTicketTaxaValor',
        valor_receber: '#editComboTicketReceive',
        lote_id: '#editComboTicketLote',
        conteudo_combo: null
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
    const funcoesAbertura = ['openPaidTicketModal', 'openFreeTicketModal', 'openComboTicketModal'];
    
    funcoesAbertura.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const funcaoOriginal = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                const resultado = funcaoOriginal.apply(this, args);
                setTimeout(() => limparSelectsModais(), 100);
                return resultado;
            };
        }
    });
    
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
            console.error('❌ Conteúdo do combo vazio:', dados.conteudo_combo);
            console.log('🔍 Verificando comboItems global:', window.comboItems);
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
                // Extrair conteúdo do combo via comboItems global
                dados[campo] = extrairConteudoComboCorreto();
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
 * EXTRAIR CONTEÚDO DO COMBO CORRETAMENTE usando comboItems global
 */
function extrairConteudoComboCorreto() {
    console.log('🔍 Extraindo conteúdo do combo via comboItems global...');
    
    const itensCombo = [];
    
    // Método 1: Usar comboItems global (principal)
    if (typeof window.comboItems !== 'undefined' && Array.isArray(window.comboItems)) {
        console.log('📦 comboItems encontrado:', window.comboItems);
        
        window.comboItems.forEach(item => {
            // Estrutura do comboItems: {index, name, price, quantity}
            // Precisamos converter para {ingresso_id, quantidade}
            
            let ingressoId = null;
            
            // Tentar extrair ingresso_id do index ou nome
            if (item.index) {
                ingressoId = parseInt(item.index);
            } else if (item.ticket_id) {
                ingressoId = parseInt(item.ticket_id);
            } else if (item.ingresso_id) {
                ingressoId = parseInt(item.ingresso_id);
            }
            
            const quantidade = parseInt(item.quantity || item.quantidade) || 1;
            
            if (ingressoId && quantidade > 0) {
                itensCombo.push({
                    ingresso_id: ingressoId,
                    quantidade: quantidade
                });
            } else {
                console.warn('⚠️ Item do combo sem ID válido:', item);
            }
        });
    }
    
    // Método 2: Procurar na lista visual como fallback
    if (itensCombo.length === 0) {
        console.log('🔍 Fallback: buscando na lista visual...');
        
        const listaItens = document.querySelector('#comboItemsList, .combo-items-list, [data-combo-items]');
        if (listaItens) {
            const itens = listaItens.querySelectorAll('.combo-item, [data-combo-item]');
            itens.forEach(item => {
                const ingressoId = item.dataset.ingressoId || item.dataset.comboIngressoId || item.dataset.ticketId;
                const quantidade = item.dataset.quantidade || item.dataset.comboQuantidade || item.dataset.quantity;
                
                if (ingressoId && quantidade) {
                    itensCombo.push({
                        ingresso_id: parseInt(ingressoId),
                        quantidade: parseInt(quantidade)
                    });
                }
            });
        }
    }
    
    // Método 3: Procurar em inputs hidden
    if (itensCombo.length === 0) {
        console.log('🔍 Fallback: buscando em inputs hidden...');
        
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
    }
    
    console.log('📦 Itens do combo finais:', itensCombo);
    
    const json = itensCombo.length > 0 ? JSON.stringify(itensCombo) : '[]';
    console.log('📄 JSON gerado:', json);
    
    return json;
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
 * editTicket via API limpa usando modais existentes
 */
async function editTicketAPILimpa(ingressoId) {
    console.log(`✏️ editTicket API limpa usando modais existentes: ${ingressoId}`);
    
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
            abrirModalEdicaoViaModaisExistentes(data.ingresso);
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
 * Abrir modal de edição usando modais existentes
 */
function abrirModalEdicaoViaModaisExistentes(ingresso) {
    console.log('📝 Abrindo modal de edição via modais existentes:', ingresso.titulo);
    
    let modalId;
    if (ingresso.tipo === 'pago') {
        modalId = 'editPaidTicketModal';
    } else if (ingresso.tipo === 'gratuito') {
        modalId = 'editFreeTicketModal';
    } else if (ingresso.tipo === 'combo') {
        modalId = 'editComboTicketModal';
    }
    
    console.log(`📝 Usando modal: ${modalId}`);
    
    // Verificar se modal existe
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} não encontrado`);
        alert(`Modal de edição para ${ingresso.tipo} não encontrado`);
        return;
    }
    
    // Preencher campos do modal
    preencherModalEdicao(modalId, ingresso);
    
    // Mostrar modal
    modal.style.display = 'block';
    
    console.log(`✅ Modal ${modalId} aberto e preenchido`);
}

/**
 * Preencher modal de edição com dados do ingresso
 */
function preencherModalEdicao(modalId, ingresso) {
    console.log(`🔍 Preenchendo modal ${modalId} com dados:`, ingresso);
    
    const campos = MODAL_FIELDS[modalId];
    if (!campos) {
        console.error(`❌ Mapeamento não encontrado para ${modalId}`);
        return;
    }
    
    // Preencher campo hidden com ID
    const idField = document.querySelector(`#${modalId.replace('Modal', 'Id')}`);
    if (idField) {
        idField.value = ingresso.id;
        console.log(`  ID: ${ingresso.id}`);
    }
    
    // Preencher outros campos
    Object.keys(campos).forEach(campo => {
        const seletor = campos[campo];
        
        if (!seletor) return;
        
        const elemento = document.querySelector(seletor);
        if (elemento) {
            let valor = ingresso[campo] || '';
            
            if (campo === 'preco' || campo === 'taxa_plataforma' || campo === 'valor_receber') {
                // Formatar como moeda para exibição
                const numeroValor = parseFloat(valor) || 0;
                valor = `R$ ${numeroValor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            }
            
            elemento.value = valor;
            console.log(`  ${campo}: ${valor} (para ${seletor})`);
        } else {
            console.warn(`⚠️ Elemento não encontrado para ${campo}: ${seletor}`);
        }
    });
    
    // Para combos, carregar itens se existir conteudo_combo
    if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
        try {
            const itensCombo = JSON.parse(ingresso.conteudo_combo);
            console.log('📦 Carregando itens do combo:', itensCombo);
            
            // Atualizar comboItems global para edição
            if (typeof window.editComboItems !== 'undefined') {
                window.editComboItems = itensCombo;
            } else {
                window.comboItems = itensCombo.map(item => ({
                    index: item.ingresso_id,
                    quantity: item.quantidade,
                    name: `Ingresso ${item.ingresso_id}`,
                    price: 'R$ 0,00'
                }));
            }
        } catch (e) {
            console.error('❌ Erro ao parsear conteudo_combo:', e);
        }
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
    console.log('🚀 Inicializando versão final corrigida completa...');
    
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

console.log('✅ VERSAO-FINAL-CORRIGIDA-COMPLETA-INGRESSOS.JS carregado!');
console.log('🔧 Recursos implementados:');
console.log('  1. ✅ Combo com conteudo_combo JSON via comboItems global');
console.log('  2. ✅ Edição via modais existentes (editPaidTicketModal, etc)');
console.log('  3. ✅ Renderização correta de combos');
console.log('  4. ✅ Limpeza de selects ao abrir modais');
console.log('  5. ✅ Todas as operações via API limpa');
