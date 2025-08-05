/**
 * VERSÃO FINAL DEFINITIVA - RENDERIZAÇÃO CORRETA DE COMBOS
 * Correções específicas:
 * 1. Renderização correta de combos com valores e itens
 * 2. Substituição completa da função addTicketToList para combos
 * 3. Exibição dos itens do combo (nome + quantidade)
 */

console.log('🔧 VERSAO-FINAL-DEFINITIVA-RENDERIZACAO-INGRESSOS.JS carregando...');

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
        preco: null,
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
        conteudo_combo: null
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
        titulo: '#editComboTitle',
        descricao: '#editComboDescription',
        preco: '#editComboPrice',
        taxa_plataforma: '#editComboTaxaValor',
        valor_receber: '#editComboReceive',
        lote_id: '#editComboTicketLote',
        conteudo_combo: null
    }
};

/**
 * BLOQUEIO TOTAL DE FUNÇÕES CONFLITANTES
 */
function bloquearFuncoesConflitantes() {
    console.log('🚫 Bloqueando funções conflitantes...');
    
    // Lista de funções problemáticas para bloquear
    const funcoesParaBloquear = [
        'updateFreeTicket',
        'updatePaidTicket', 
        'updateComboTicket',
        'savePaidTicket',
        'saveFreeTicket',
        'saveComboTicket',
        'editarIngressoDoMySQL',
        'salvarEdicaoIngresso',
        'updateTicket',
        'saveTicket'
    ];
    
    funcoesParaBloquear.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            console.log(`🚫 Bloqueando função conflitante: ${nomeFuncao}`);
            window[nomeFuncao] = function(...args) {
                console.log(`🚫 Função ${nomeFuncao} BLOQUEADA - usando sistema novo`);
                return false; // Bloquear execução
            };
        }
    });
}

/**
 * SOBRESCREVER TODAS AS FUNÇÕES GLOBAIS
 */
function aplicarSobrescritasCompletas() {
    console.log('🎯 Aplicando sobrescritas completas...');
    
    // Primeiro bloquear funções conflitantes
    bloquearFuncoesConflitantes();
    
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
    
    // CRÍTICO: Sobrescrever operações SEMPRE via API limpa
    window.removeTicket = removeTicketAPILimpaForcado;
    window.editTicket = editTicketAPILimpaCompleto;
    
    // Interceptar abertura de modais para limpeza TOTAL
    interceptarAberturaModaisTotal();
    
    console.log('✅ Todas as funções sobrescritas');
}

/**
 * Interceptar abertura de modais para limpeza TOTAL
 */
function interceptarAberturaModaisTotal() {
    console.log('🎯 Configurando interceptação TOTAL de modais...');
    
    // Lista de funções de abertura para interceptar
    const funcoesAbertura = [
        'openPaidTicketModal', 
        'openFreeTicketModal', 
        'openComboTicketModal',
        'abrirModalPago',
        'abrirModalGratuito',
        'abrirModalCombo'
    ];
    
    funcoesAbertura.forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            const funcaoOriginal = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                console.log(`🎯 Interceptando abertura: ${nomeFuncao}`);
                
                // Executar função original primeiro
                const resultado = funcaoOriginal.apply(this, args);
                
                // Depois limpar selects TOTALMENTE
                setTimeout(() => {
                    resetarSelectsCompletamente();
                }, 100);
                
                return resultado;
            };
            
            console.log(`✅ ${nomeFuncao} interceptada para limpeza`);
        }
    });
    
    // Interceptar também cliques diretos em botões
    setTimeout(() => {
        const seletoresBotoes = [
            'button[onclick*="openPaidTicketModal"]',
            'button[onclick*="openFreeTicketModal"]', 
            'button[onclick*="openComboTicketModal"]',
            '[onclick*="Modal"]'
        ];
        
        seletoresBotoes.forEach(seletor => {
            const elementos = document.querySelectorAll(seletor);
            elementos.forEach(elemento => {
                elemento.addEventListener('click', () => {
                    console.log('🎯 Clique interceptado - resetando selects');
                    setTimeout(() => resetarSelectsCompletamente(), 150);
                });
            });
        });
        
        console.log(`✅ ${seletoresBotoes.length} tipos de botões interceptados`);
    }, 2000);
}

/**
 * RESETAR SELECTS COMPLETAMENTE
 */
function resetarSelectsCompletamente() {
    console.log('🧹 RESETANDO selects completamente...');
    
    const selects = [
        '#paidTicketLote',
        '#freeTicketLote',
        '#comboTicketLote',
        '#comboTicketTypeSelect',
        '#editPaidTicketLote',
        '#editFreeTicketLote',
        '#editComboTicketLote'
    ];
    
    selects.forEach(seletor => {
        const select = document.querySelector(seletor);
        if (select) {
            // Guardar primeira opção (placeholder)
            const primeiraOpcao = select.querySelector('option:first-child');
            const placeholderText = primeiraOpcao ? primeiraOpcao.textContent : 'Selecione um lote';
            const placeholderValue = primeiraOpcao ? primeiraOpcao.value : '';
            
            // Limpar completamente
            select.innerHTML = '';
            
            // Recriar placeholder
            const novaOpcao = document.createElement('option');
            novaOpcao.value = placeholderValue;
            novaOpcao.textContent = placeholderText;
            select.appendChild(novaOpcao);
            
            console.log(`✅ Select ${seletor} resetado completamente`);
        }
    });
    
    console.log('✅ Todos os selects resetados');
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
            
            fecharModalCompleto(modalId);
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
                // Extrair conteúdo do combo via estrutura REAL
                dados[campo] = extrairConteudoComboEstrutraReal();
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
 * EXTRAIR CONTEÚDO DO COMBO USANDO ESTRUTURA REAL
 */
function extrairConteudoComboEstrutraReal() {
    console.log('🔍 Extraindo conteúdo do combo via estrutura REAL...');
    
    const itensCombo = [];
    
    // Estrutura REAL detectada: {ticketId, name, price, quantity, type}
    if (typeof window.comboItems !== 'undefined' && Array.isArray(window.comboItems)) {
        console.log('📦 comboItems REAL encontrado:', window.comboItems);
        
        window.comboItems.forEach(item => {
            let ingressoId = null;
            
            // ESTRUTURA REAL: usar ticketId primeiro
            if (item.ticketId) {
                ingressoId = parseInt(item.ticketId);
            } else if (item.index) {
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
                console.log(`✅ Item adicionado: ingresso_id=${ingressoId}, quantidade=${quantidade}`);
            } else {
                console.warn('⚠️ Item do combo sem ID válido:', item);
            }
        });
    }
    
    // Fallback 1: Lista visual
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
                    console.log(`✅ Item visual adicionado: ingresso_id=${ingressoId}, quantidade=${quantidade}`);
                }
            });
        }
    }
    
    // Fallback 2: Inputs hidden
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
                            console.log(`✅ Item input adicionado: ingresso_id=${item.ingresso_id}, quantidade=${item.quantidade}`);
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
 * removeTicket FORÇADO via API limpa
 */
async function removeTicketAPILimpaForcado(ingressoId) {
    console.log(`🗑️ removeTicket FORÇADO via API limpa: ${ingressoId}`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento não identificado');
        return;
    }
    
    try {
        // USAR EXCLUSIVAMENTE a API limpa
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta exclusão API limpa FORÇADA:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON exclusão FORÇADA:', parseError);
            console.error('📄 Resposta recebida:', textResponse.substring(0, 500));
            return;
        }
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído via API limpa FORÇADA`);
            
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
            
            // Recarregar usando APENAS API limpa
            setTimeout(() => recarregarListaAPILimpa(), 200);
            
        } else {
            console.error('❌ Erro ao excluir via API limpa FORÇADA:', data.erro);
            alert('Erro ao excluir ingresso: ' + data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro na exclusão via API limpa FORÇADA:', error);
        alert('Erro de conexão ao excluir');
    }
}

/**
 * editTicket COMPLETO via API limpa com modal funcionando
 */
async function editTicketAPILimpaCompleto(ingressoId) {
    console.log(`✏️ editTicket COMPLETO via API limpa: ${ingressoId}`);
    
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
            abrirModalEdicaoCompleto(data.ingresso);
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
 * Abrir modal de edição COMPLETO
 */
function abrirModalEdicaoCompleto(ingresso) {
    console.log('📝 Abrindo modal de edição COMPLETO:', ingresso.titulo);
    
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
    preencherModalEdicaoCompleto(modalId, ingresso);
    
    // Mostrar modal
    modal.style.display = 'block';
    
    console.log(`✅ Modal ${modalId} aberto e preenchido`);
}

/**
 * Preencher modal de edição COMPLETO
 */
function preencherModalEdicaoCompleto(modalId, ingresso) {
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
            
            // CRÍTICO: Lote read-only para edição
            if (campo === 'lote_id') {
                elemento.setAttribute('readonly', 'readonly');
                elemento.setAttribute('disabled', 'disabled');
                elemento.style.backgroundColor = '#f5f5f5';
                elemento.style.cursor = 'not-allowed';
                console.log(`  ${campo}: ${valor} (READ-ONLY)`);
            } else {
                console.log(`  ${campo}: ${valor} (para ${seletor})`);
            }
        } else {
            console.warn(`⚠️ Elemento não encontrado para ${campo}: ${seletor}`);
        }
    });
    
    // Para combos, carregar itens se existir conteudo_combo
    if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
        try {
            const itensCombo = JSON.parse(ingresso.conteudo_combo);
            console.log('📦 Carregando itens do combo:', itensCombo);
            
            // Atualizar comboItems global para edição (estrutura real)
            window.comboItems = itensCombo.map(item => ({
                ticketId: item.ingresso_id.toString(),
                quantity: item.quantidade,
                name: `Ingresso ${item.ingresso_id}`,
                price: '0',
                type: 'unknown'
            }));
            
            console.log('📦 comboItems atualizado para edição:', window.comboItems);
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
            
            renderizarIngressosPersonalizado();
            
        } else {
            console.error('❌ Erro ao recarregar via API limpa:', data.erro);
        }
        
    } catch (error) {
        console.error('❌ Erro no recarregamento via API limpa:', error);
    }
}

/**
 * RENDERIZAR INGRESSOS PERSONALIZADO (combos corretos + itens)
 */
function renderizarIngressosPersonalizado() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    console.log('🎨 Renderizando ingressos PERSONALIZADO...');
    
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
        
        if (ingresso.tipo === 'combo') {
            // Para combos, usar renderização personalizada
            criarElementoComboPersonalizado(ingresso);
        } else {
            // Para pago e gratuito, usar função existente
            criarElementoIngressoNormal(ingresso);
        }
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados PERSONALIZADO`);
}

/**
 * CRIAR ELEMENTO DE COMBO PERSONALIZADO
 */
function criarElementoComboPersonalizado(ingresso) {
    console.log(`🎨 Criando elemento COMBO personalizado: ${ingresso.titulo}`);
    
    const ticketList = document.getElementById('ticketList');
    
    const precoReal = parseFloat(ingresso.preco) || 0;
    const taxaReal = parseFloat(ingresso.taxa_plataforma) || 0;
    const valorReceberReal = parseFloat(ingresso.valor_receber) || precoReal;
    
    // Processar itens do combo
    let itensComboHtml = '';
    if (ingresso.conteudo_combo) {
        try {
            const itensCombo = JSON.parse(ingresso.conteudo_combo);
            console.log('📦 Itens do combo para renderização:', itensCombo);
            
            if (itensCombo.length > 0) {
                itensComboHtml = `
                    <div class="combo-items-display">
                        <strong>Itens do combo:</strong>
                        <ul>
                            ${itensCombo.map(item => `
                                <li>Ingresso ID ${item.ingresso_id} × ${item.quantidade}</li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
        } catch (e) {
            console.error('❌ Erro ao parsear conteudo_combo:', e);
        }
    }
    
    const elemento = document.createElement('div');
    elemento.className = 'ticket-item';
    elemento.dataset.ticketId = ingresso.id;
    elemento.setAttribute('data-ticket-id', ingresso.id);
    elemento.setAttribute('data-lote-id', ingresso.lote_id || '');
    
    elemento.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">
                <span class="ticket-name">${ingresso.titulo}</span>
                <span class="ticket-type-badge combo">
                    (COMBO)
                </span>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onclick="editTicket(${ingresso.id})" title="Editar">✏️</button>
                <button class="btn-icon" onclick="removeTicket(${ingresso.id})" title="Remover">🗑️</button>
            </div>
        </div>
        <div class="ticket-details">
            <div class="ticket-info">
                <span>Quantidade: <strong>${ingresso.quantidade_total || 100}</strong></span>
                <span class="ticket-buyer-price">R$ ${precoReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                <span>Taxa: <strong>R$ ${taxaReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span>
                <span>Você recebe: <strong>R$ ${valorReceberReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span>
            </div>
            ${itensComboHtml}
        </div>
    `;
    
    ticketList.appendChild(elemento);
    
    console.log(`✅ Elemento COMBO personalizado criado: ${ingresso.id}`);
    console.log(`   Preço: R$ ${precoReal}, Taxa: R$ ${taxaReal}, Receber: R$ ${valorReceberReal}`);
}

/**
 * Criar elemento de ingresso normal (pago/gratuito)
 */
function criarElementoIngressoNormal(ingresso) {
    let type;
    if (ingresso.tipo === 'pago') {
        type = 'paid';
    } else if (ingresso.tipo === 'gratuito') {
        type = 'free';
    } else {
        type = 'paid'; // Padrão
    }
    
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'free' ? 'Gratuito' : `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    console.log(`🎨 Renderizando normal: ${title} como ${type}`);
    
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
            criarElementoManualNormal(ingresso);
        }
    } else {
        criarElementoManualNormal(ingresso);
    }
}

/**
 * Criar elemento manual normal
 */
function criarElementoManualNormal(ingresso) {
    const ticketList = document.getElementById('ticketList');
    
    const elemento = document.createElement('div');
    elemento.className = 'ticket-item';
    elemento.dataset.ticketId = ingresso.id;
    elemento.setAttribute('data-ticket-id', ingresso.id);
    
    let price;
    if (ingresso.tipo === 'gratuito') {
        price = 'Gratuito';
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
    console.log(`✅ Elemento manual normal criado: ${ingresso.id}`);
}

/**
 * Fechar modal COMPLETO
 */
function fecharModalCompleto(modalId) {
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
        
        // CRÍTICO: Resetar selects ao fechar
        setTimeout(() => resetarSelectsCompletamente(), 100);
        
        console.log(`✅ Modal ${modalId} fechado e limpo COMPLETAMENTE`);
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
    console.log('🚀 Inicializando versão final DEFINITIVA com renderização...');
    
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

console.log('✅ VERSAO-FINAL-DEFINITIVA-RENDERIZACAO-INGRESSOS.JS carregado!');
console.log('🔧 Recursos implementados:');
console.log('  1. ✅ Renderização PERSONALIZADA de combos com valores corretos');
console.log('  2. ✅ Exibição dos itens do combo (ingresso_id × quantidade)');
console.log('  3. ✅ Badge COMBO em vez de Gratuito');
console.log('  4. ✅ Valores financeiros corretos (preço, taxa, receber)');
console.log('  5. ✅ Sistema híbrido: combo personalizado + normal via addTicketToList');
