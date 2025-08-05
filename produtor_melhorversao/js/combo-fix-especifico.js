/**
 * FIX ESPECÍFICO PARA PROBLEMAS DOS COMBOS
 * Corrige: função removerItemCombo + carregamento de selects + limpeza geral
 */

console.log('🔧 COMBO-FIX-ESPECIFICO.JS carregando...');

/**
 * FUNÇÃO removerItemCombo DEFINITIVA
 */
window.removerItemCombo = function(index) {
    console.log(`🗑️ removerItemCombo chamada com index: ${index}`);
    
    // Garantir que window.comboItems existe
    if (!window.comboItems) {
        console.log('📦 Inicializando window.comboItems vazio');
        window.comboItems = [];
    }
    
    console.log('📦 comboItems antes da remoção:', window.comboItems);
    
    // Remover item pelo index
    if (index >= 0 && index < window.comboItems.length) {
        const itemRemovido = window.comboItems.splice(index, 1);
        console.log(`✅ Item removido:`, itemRemovido[0]);
        console.log('📦 comboItems após remoção:', window.comboItems);
        
        // Atualizar interface
        atualizarInterfaceCombo();
        
    } else {
        console.warn(`⚠️ Index ${index} inválido para array de tamanho ${window.comboItems.length}`);
    }
};

/**
 * FUNÇÃO removerItemEditCombo DEFINITIVA (para modal de edição)
 */
window.removerItemEditCombo = function(index) {
    console.log(`🗑️ removerItemEditCombo chamada com index: ${index}`);
    
    // Para modal de edição, usar mesma lógica
    window.removerItemCombo(index);
};

/**
 * Atualizar interface do combo após mudanças
 */
function atualizarInterfaceCombo() {
    console.log('🔄 Atualizando interface do combo...');
    
    // Atualizar lista visual nos dois containers
    const containers = [
        document.getElementById('comboItemsList'),
        document.getElementById('editComboItemsList')
    ];
    
    containers.forEach(container => {
        if (container) {
            renderizarListaItensCombo(container);
        }
    });
}

/**
 * Renderizar lista de itens do combo
 */
function renderizarListaItensCombo(container) {
    console.log('📋 Renderizando lista de itens do combo...');
    
    if (!window.comboItems || window.comboItems.length === 0) {
        container.innerHTML = `
            <div class="combo-empty-state">
                <div style="font-size: 1.2rem; margin-bottom: 5px;">+</div>
                <div style="color: #8B95A7; font-size: 11px;">Adicione tipos de ingresso</div>
            </div>
        `;
        console.log('📋 Lista vazia renderizada');
        return;
    }
    
    let html = '';
    
    window.comboItems.forEach((item, index) => {
        const nome = item.name || item.titulo || `Ingresso ${item.ticketId || item.ingresso_id || index}`;
        const quantidade = item.quantity || item.quantidade || 1;
        
        html += `
            <div class="combo-item" data-index="${index}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin-bottom: 8px; border: 1px solid #e0e0e0; border-radius: 4px; background: #f9f9f9;">
                <div class="combo-item-info">
                    <strong style="color: #333;">${nome}</strong>
                    <span style="color: #666; font-size: 14px; margin-left: 10px;">Qtd: ${quantidade}</span>
                </div>
                <button type="button" onclick="removerItemCombo(${index})" class="btn-remove-combo-item" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;" title="Remover item">
                    🗑️
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`✅ ${window.comboItems.length} itens renderizados na lista`);
}

/**
 * CARREGAMENTO DOS SELECTS DE COMBO - VERSÃO MELHORADA
 */
async function carregarSelectsCombo() {
    console.log('🔄 Carregando selects de combo - VERSÃO MELHORADA...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem ingressos para carregar nos selects');
        return;
    }
    
    // Verificar se os selects existem no DOM
    const selects = [
        document.getElementById('comboTicketTypeSelect'),
        document.getElementById('editComboTicketTypeSelect')
    ];
    
    const selectsExistentes = selects.filter(s => s !== null);
    
    if (selectsExistentes.length === 0) {
        console.log('⚠️ Nenhum select de combo encontrado no DOM ainda');
        return;
    }
    
    console.log(`📋 ${selectsExistentes.length} selects encontrados: ${selectsExistentes.map(s => s.id).join(', ')}`);
    
    try {
        console.log('📡 Fazendo requisição para listar ingressos...');
        
        // Buscar ingressos existentes
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta API para selects:', textResponse.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
            console.error('📄 Resposta completa:', textResponse);
            return;
        }
        
        if (data.sucesso && data.ingressos) {
            const ingressos = data.ingressos.filter(ing => ing.tipo !== 'combo'); // Não incluir combos nos selects
            console.log(`📋 ${ingressos.length} ingressos não-combo encontrados para os selects`);
            
            if (ingressos.length === 0) {
                console.log('⚠️ Nenhum ingresso não-combo disponível para adicionar aos combos');
                
                // Atualizar selects com mensagem
                selectsExistentes.forEach(select => {
                    select.innerHTML = '<option value="">Nenhum ingresso disponível</option>';
                    console.log(`✅ Select ${select.id} atualizado com mensagem de vazio`);
                });
                
                return;
            }
            
            // Atualizar cada select existente
            selectsExistentes.forEach(select => {
                console.log(`🔄 Atualizando select: ${select.id}`);
                
                // Manter primeira opção (placeholder)
                const primeiraOpcao = select.querySelector('option:first-child');
                const placeholderText = primeiraOpcao ? primeiraOpcao.textContent : 'Selecione um ingresso';
                
                // Limpar e recriar
                select.innerHTML = `<option value="">${placeholderText}</option>`;
                
                // Adicionar ingressos
                ingressos.forEach(ingresso => {
                    const option = document.createElement('option');
                    option.value = ingresso.id;
                    
                    const preco = ingresso.tipo === 'gratuito' ? 'Gratuito' : 'R$ ' + parseFloat(ingresso.preco || 0).toFixed(2);
                    option.textContent = `${ingresso.titulo} (${preco})`;
                    
                    select.appendChild(option);
                });
                
                console.log(`✅ Select ${select.id} carregado com ${ingressos.length} opções`);
                
                // Disparar evento para notificar que o select foi atualizado
                select.dispatchEvent(new Event('selectUpdated'));
            });
            
        } else {
            console.error('❌ Erro ao buscar ingressos para selects:', data.erro || 'Erro desconhecido');
            
            // Atualizar selects com mensagem de erro
            selectsExistentes.forEach(select => {
                select.innerHTML = '<option value="">Erro ao carregar ingressos</option>';
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar selects:', error);
        
        // Atualizar selects com mensagem de erro
        selectsExistentes.forEach(select => {
            select.innerHTML = '<option value="">Erro de conexão</option>';
        });
    }
}

/**
 * INTERCEPTAR ABERTURA DE MODAIS PARA CARREGAR SELECTS - VERSÃO CORRIGIDA
 */
function interceptarAberturaCombos() {
    console.log('🎯 Configurando interceptação CORRIGIDA para modais de combo...');
    
    // Interceptar funções de abertura APENAS PARA EDIÇÃO
    const funcoesOriginais = {};
    
    ['editComboTicket', 'openModal'].forEach(nomeFuncao => {
        if (typeof window[nomeFuncao] === 'function') {
            funcoesOriginais[nomeFuncao] = window[nomeFuncao];
            
            window[nomeFuncao] = function(...args) {
                console.log(`🎯 Interceptando ${nomeFuncao} com args:`, args);
                
                // Executar função original
                const resultado = funcoesOriginais[nomeFuncao].apply(this, args);
                
                // APENAS para modal de edição carregar selects imediatamente
                if (nomeFuncao === 'editComboTicket' || 
                    (nomeFuncao === 'openModal' && args[0] === 'editComboTicketModal')) {
                    console.log('🎯 MODAL DE EDIÇÃO DETECTADO - carregando selects imediatamente');
                    carregarSelectsEdicaoComboImediato();
                }
                // NÃO carregar automaticamente para modal de criação
                
                return resultado;
            };
            
            console.log(`✅ ${nomeFuncao} interceptada`);
        }
    });
    
    // CONFIGURAR EVENTO DE MUDANÇA DO LOTE NO MODAL DE CRIAÇÃO
    setTimeout(() => {
        configurarEventoLoteModalCriacao();
    }, 1000);
    
    // Interceptar apenas botões de edição
    setTimeout(() => {
        const todosBotoes = document.querySelectorAll('button, .btn, [onclick]');
        todosBotoes.forEach(botao => {
            const onclick = botao.onclick?.toString() || botao.getAttribute('onclick') || '';
            
            // APENAS interceptar botões de edição
            if (onclick.includes('editComboTicket') || onclick.includes('editTicket')) {
                botao.addEventListener('click', () => {
                    console.log('🎯 BOTÃO DE EDIÇÃO DETECTADO - carregando selects imediatamente');
                    carregarSelectsEdicaoComboImediato();
                });
            }
        });
    }, 2000);
    
    // Observer apenas para modal de edição
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.id === 'editComboTicketModal') {
                    console.log('🎯 MODAL DE EDIÇÃO DETECTADO PELO OBSERVER - carregando selects imediatamente');
                    carregarSelectsEdicaoComboImediato();
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Interceptação configurada APENAS para edição');
}

/**
 * CONFIGURAR EVENTO DE LOTE NO MODAL DE CRIAÇÃO
 */
function configurarEventoLoteModalCriacao() {
    console.log('🎯 Configurando evento de lote para modal de criação...');
    
    const selectLoteCriacao = document.getElementById('comboTicketLote');
    if (selectLoteCriacao) {
        // Remover listeners existentes
        const novoSelect = selectLoteCriacao.cloneNode(true);
        selectLoteCriacao.parentNode.replaceChild(novoSelect, selectLoteCriacao);
        
        // Adicionar novo listener
        novoSelect.addEventListener('change', function() {
            const loteId = this.value;
            console.log(`🔄 Lote selecionado no modal de criação: ${loteId}`);
            
            if (loteId) {
                console.log('✅ Carregando ingressos para o lote selecionado');
                setTimeout(() => {
                    carregarIngressosDoLote(loteId, 'comboTicketTypeSelect');
                }, 100);
            } else {
                // Limpar select de ingressos
                const selectIngressos = document.getElementById('comboTicketTypeSelect');
                if (selectIngressos) {
                    selectIngressos.innerHTML = '<option value="">Selecione um lote primeiro</option>';
                    console.log('🧹 Select de ingressos limpo');
                }
            }
        });
        
        console.log('✅ Evento de mudança de lote configurado para modal de criação');
    } else {
        console.warn('⚠️ Select de lote não encontrado para modal de criação');
    }
}

/**
 * CARREGAR INGRESSOS DE UM LOTE ESPECÍFICO
 */
async function carregarIngressosDoLote(loteId, selectId) {
    console.log(`🔄 Carregando ingressos do lote ${loteId} para select ${selectId}...`);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.log('📝 Novo evento - sem ingressos para carregar');
        return;
    }
    
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`❌ Select ${selectId} não encontrado`);
        return;
    }
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta API para lote específico:', textResponse.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
            return;
        }
        
        if (data.sucesso && data.ingressos) {
            // Filtrar ingressos do lote específico e que não são combos
            const ingressosDoLote = data.ingressos.filter(ing => 
                ing.lote_id == loteId && ing.tipo !== 'combo'
            );
            
            console.log(`📋 ${ingressosDoLote.length} ingressos não-combo encontrados para lote ${loteId}`);
            
            // Limpar e recriar opções
            select.innerHTML = '<option value="">Selecione um ingresso</option>';
            
            if (ingressosDoLote.length === 0) {
                select.innerHTML = '<option value="">Nenhum ingresso neste lote</option>';
                return;
            }
            
            // Adicionar ingressos
            ingressosDoLote.forEach(ingresso => {
                const option = document.createElement('option');
                option.value = ingresso.id;
                
                const preco = ingresso.tipo === 'gratuito' ? 'Gratuito' : 'R$ ' + parseFloat(ingresso.preco || 0).toFixed(2);
                option.textContent = `${ingresso.titulo} (${preco})`;
                
                select.appendChild(option);
            });
            
            console.log(`✅ Select ${selectId} carregado com ${ingressosDoLote.length} ingressos do lote ${loteId}`);
            
        } else {
            console.error('❌ Erro ao buscar ingressos do lote:', data.erro);
            select.innerHTML = '<option value="">Erro ao carregar ingressos</option>';
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar ingressos do lote:', error);
        select.innerHTML = '<option value="">Erro de conexão</option>';
    }
}

/**
 * CARREGAR SELECTS ESPECÍFICO PARA EDIÇÃO DE COMBO - IMEDIATO
 */
async function carregarSelectsEdicaoComboImediato() {
    console.log('🔥 CARREGAMENTO IMEDIATO para edição de combo...');
    
    // Tentativas mais agressivas para modal de edição
    const tentativas = [50, 100, 200, 400, 800, 1200];
    
    for (let i = 0; i < tentativas.length; i++) {
        setTimeout(async () => {
            console.log(`🔥 Tentativa IMEDIATA ${i + 1}/${tentativas.length} após ${tentativas[i]}ms`);
            
            // Verificar se modal de edição está visível
            const modalEdicao = document.getElementById('editComboTicketModal');
            if (!modalEdicao || modalEdicao.style.display === 'none') {
                console.log('⚠️ Modal de edição não visível, pulando tentativa');
                return;
            }
            
            await carregarSelectsCombo();
            
            // Verificar especificamente o select de edição
            const selectEdicao = document.getElementById('editComboTicketTypeSelect');
            if (selectEdicao && selectEdicao.options.length > 1) {
                console.log(`✅ Select de edição carregado com sucesso na tentativa ${i + 1}`);
                console.log(`📊 Opções carregadas: ${selectEdicao.options.length - 1}`);
                return;
            }
        }, tentativas[i]);
    }
}

/**
 * Carregar selects com múltiplas tentativas
 */
async function carregarSelectsComMultiplasTentativas() {
    console.log('🔄 Iniciando carregamento com múltiplas tentativas...');
    
    const tentativas = [100, 300, 500, 1000, 2000];
    
    for (let i = 0; i < tentativas.length; i++) {
        setTimeout(async () => {
            console.log(`🔄 Tentativa ${i + 1}/${tentativas.length} após ${tentativas[i]}ms`);
            await carregarSelectsCombo();
            
            // Verificar se os selects foram carregados com sucesso
            const selectsCarregados = verificarSelectsCarregados();
            if (selectsCarregados) {
                console.log(`✅ Selects carregados com sucesso na tentativa ${i + 1}`);
                return;
            }
        }, tentativas[i]);
    }
}

/**
 * Verificar se os selects foram carregados com sucesso
 */
function verificarSelectsCarregados() {
    const selects = [
        document.getElementById('comboTicketTypeSelect'),
        document.getElementById('editComboTicketTypeSelect')
    ];
    
    let carregados = 0;
    
    selects.forEach(select => {
        if (select && select.options.length > 1) { // Mais de 1 opção (placeholder + opções reais)
            carregados++;
        }
    });
    
    console.log(`📊 Status dos selects: ${carregados}/${selects.filter(s => s).length} carregados`);
    
    return carregados > 0;
}

/**
 * FUNÇÃO PARA ADICIONAR ITEM AO COMBO (caso não exista)
 */
if (typeof window.addItemToCombo === 'undefined') {
    window.addItemToCombo = function() {
        console.log('➕ addItemToCombo chamada');
        
        const select = document.getElementById('comboTicketTypeSelect');
        const quantityInput = document.getElementById('comboItemQuantity');
        
        if (!select || !quantityInput) {
            console.error('❌ Elementos do combo não encontrados');
            return;
        }
        
        const ingressoId = select.value;
        const quantidade = parseInt(quantityInput.value) || 1;
        
        if (!ingressoId) {
            alert('Por favor, selecione um tipo de ingresso');
            return;
        }
        
        if (quantidade < 1 || quantidade > 10) {
            alert('Quantidade deve ser entre 1 e 10');
            return;
        }
        
        // Verificar se já existe
        if (!window.comboItems) {
            window.comboItems = [];
        }
        
        const jaExiste = window.comboItems.find(item => 
            (item.ticketId && item.ticketId == ingressoId) || 
            (item.ingresso_id && item.ingresso_id == ingressoId)
        );
        
        if (jaExiste) {
            alert('Este ingresso já foi adicionado ao combo');
            return;
        }
        
        // Obter nome do ingresso
        const selectedOption = select.options[select.selectedIndex];
        const nomeIngresso = selectedOption ? selectedOption.textContent : `Ingresso ${ingressoId}`;
        
        // Adicionar item
        const novoItem = {
            ticketId: ingressoId,
            quantity: quantidade,
            name: nomeIngresso,
            price: '0',
            type: 'unknown',
            ingresso_id: parseInt(ingressoId),
            quantidade: quantidade,
            titulo: nomeIngresso
        };
        
        window.comboItems.push(novoItem);
        
        console.log('✅ Item adicionado ao combo:', novoItem);
        console.log('📦 comboItems atual:', window.comboItems);
        
        // Limpar campos
        select.value = '';
        quantityInput.value = '';
        
        // Atualizar interface
        atualizarInterfaceCombo();
    };
}

/**
 * FUNÇÃO PARA ADICIONAR ITEM AO COMBO DE EDIÇÃO (caso não exista)
 */
if (typeof window.addItemToEditCombo === 'undefined') {
    window.addItemToEditCombo = function() {
        console.log('➕ addItemToEditCombo chamada');
        
        const select = document.getElementById('editComboTicketTypeSelect');
        const quantityInput = document.getElementById('editComboItemQuantity');
        
        if (!select || !quantityInput) {
            console.error('❌ Elementos do combo de edição não encontrados');
            return;
        }
        
        const ingressoId = select.value;
        const quantidade = parseInt(quantityInput.value) || 1;
        
        if (!ingressoId) {
            alert('Por favor, selecione um tipo de ingresso');
            return;
        }
        
        if (quantidade < 1 || quantidade > 10) {
            alert('Quantidade deve ser entre 1 e 10');
            return;
        }
        
        // Usar mesma lógica do addItemToCombo
        window.addItemToCombo.call(this);
    };
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando fix específico dos combos...');
    
    // Interceptar abertura de modais
    interceptarAberturaCombos();
    
    // Carregar selects se estivermos editando evento
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    if (eventoId) {
        setTimeout(() => {
            carregarSelectsCombo();
        }, 1000);
        
        // Tentativas adicionais para garantir carregamento
        setTimeout(() => {
            carregarSelectsComMultiplasTentativas();
        }, 3000);
    }
    
    // Função global para forçar carregamento manual
    window.forcarCarregamentoSelectsCombo = function() {
        console.log('🔧 Forçando carregamento manual dos selects...');
        carregarSelectsComMultiplasTentativas();
    };
    
    // Função global para forçar carregamento específico para edição
    window.forcarCarregamentoSelectsEdicao = function() {
        console.log('🔥 Forçando carregamento IMEDIATO para edição...');
        carregarSelectsEdicaoComboImediato();
    };
    
    // Função global para debug
    window.debugSelectsCombo = function() {
        const selects = [
            document.getElementById('comboTicketTypeSelect'),
            document.getElementById('editComboTicketTypeSelect')
        ];
        
        console.log('🔍 Debug dos selects de combo:');
        selects.forEach(select => {
            if (select) {
                console.log(`  ${select.id}: ${select.options.length} opções`);
                for (let i = 0; i < select.options.length; i++) {
                    console.log(`    ${i}: "${select.options[i].text}" (value: ${select.options[i].value})`);
                }
            } else {
                console.log(`  Select não encontrado no DOM`);
            }
        });
        
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        console.log(`  Evento ID: ${eventoId}`);
        console.log(`  ComboItems:`, window.comboItems);
        
        // Verificar qual modal está visível
        const modalCriacao = document.getElementById('comboTicketModal');
        const modalEdicao = document.getElementById('editComboTicketModal');
        
        console.log(`  Modal criação visível: ${modalCriacao ? modalCriacao.style.display : 'não encontrado'}`);
        console.log(`  Modal edição visível: ${modalEdicao ? modalEdicao.style.display : 'não encontrado'}`);
    };
    
    console.log('✅ Fix específico dos combos inicializado');
    console.log('💡 Use window.forcarCarregamentoSelectsCombo() para carregar manualmente');
    console.log('🔍 Use window.debugSelectsCombo() para debug');
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ COMBO-FIX-ESPECIFICO.JS carregado!');
console.log('🔧 Funções implementadas:');
console.log('  1. ✅ removerItemCombo(index) - remove item do combo');
console.log('  2. ✅ carregarSelectsCombo() - carrega opções dos selects');
console.log('  3. ✅ carregarSelectsEdicaoComboImediato() - carregamento agressivo para edição');
console.log('  4. ✅ addItemToCombo() - adiciona item se não existir');
console.log('  5. ✅ Interceptação de modais para atualização automática');
console.log('💡 Funções manuais disponíveis:');
console.log('  - window.forcarCarregamentoSelectsCombo() - carregamento normal');
console.log('  - window.forcarCarregamentoSelectsEdicao() - carregamento para edição');
console.log('  - window.debugSelectsCombo() - debug completo');
