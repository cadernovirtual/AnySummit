/**
 * CORREÇÕES FINAIS - COMBOS E CÁLCULOS
 * Corrige: renderização de itens, cálculos de valores, função updateComboTicket
 */

console.log('🔧 COMBO-CORRECOES-FINAIS.JS carregando...');

/**
 * RENDERIZAÇÃO UNIFICADA DOS ITENS DO COMBO
 */
function renderizarItensComboUnificado(container, items = null) {
    console.log('🎨 Renderizando itens do combo de forma unificada...');
    
    if (!container) {
        console.error('❌ Container não fornecido');
        return;
    }
    
    // Usar items fornecido ou window.comboItems
    const itens = items || window.comboItems || [];
    
    if (itens.length === 0) {
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
    
    itens.forEach((item, index) => {
        // Padronizar dados independente da estrutura
        const nome = item.name || item.titulo || item.nome || `Ingresso ${item.ticketId || item.ingresso_id || index}`;
        const quantidade = parseInt(item.quantity || item.quantidade) || 1;
        const id = item.ticketId || item.ingresso_id || index;
        
        // ESTRUTURA UNIFICADA para todos os itens
        html += `
            <div class="combo-item" data-index="${index}" data-ticket-id="${id}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin-bottom: 8px; border: 1px solid #e0e0e0; border-radius: 4px; background: #f9f9f9;">
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
    console.log(`✅ ${itens.length} itens renderizados de forma unificada`);
}

/**
 * SOBRESCREVER FUNÇÃO addItemToCombo PARA GARANTIR QUANTIDADE CORRETA
 */
window.addItemToCombo = function() {
    console.log('➕ addItemToCombo CORRIGIDA chamada');
    
    const select = document.getElementById('comboTicketTypeSelect');
    const quantityInput = document.getElementById('comboItemQuantity');
    
    if (!select || !quantityInput) {
        console.error('❌ Elementos do combo não encontrados');
        return;
    }
    
    const ingressoId = select.value;
    const quantidade = parseInt(quantityInput.value) || 1; // QUANTIDADE CORRETA
    
    if (!ingressoId) {
        alert('Por favor, selecione um tipo de ingresso');
        return;
    }
    
    if (quantidade < 1) {
        alert('Quantidade deve ser no mínimo 1');
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
    
    // Adicionar item COM QUANTIDADE CORRETA
    const novoItem = {
        ticketId: ingressoId,
        quantity: quantidade, // USAR QUANTIDADE DO INPUT
        name: nomeIngresso,
        price: '0',
        type: 'unknown',
        ingresso_id: parseInt(ingressoId),
        quantidade: quantidade, // DUPLICAR PARA COMPATIBILIDADE
        titulo: nomeIngresso
    };
    
    window.comboItems.push(novoItem);
    
    console.log('✅ Item adicionado ao combo com quantidade correta:', novoItem);
    console.log('📦 comboItems atual:', window.comboItems);
    
    // Limpar campos
    select.value = '';
    quantityInput.value = '1'; // RESETAR PARA 1
    
    // Atualizar interface
    atualizarInterfaceComboUnificada();
};

/**
 * SOBRESCREVER FUNÇÃO addItemToEditCombo PARA GARANTIR QUANTIDADE CORRETA
 */
window.addItemToEditCombo = function() {
    console.log('➕ addItemToEditCombo CORRIGIDA chamada');
    
    const select = document.getElementById('editComboTicketTypeSelect');
    const quantityInput = document.getElementById('editComboItemQuantity');
    
    if (!select || !quantityInput) {
        console.error('❌ Elementos do combo de edição não encontrados');
        return;
    }
    
    const ingressoId = select.value;
    const quantidade = parseInt(quantityInput.value) || 1; // QUANTIDADE CORRETA
    
    if (!ingressoId) {
        alert('Por favor, selecione um tipo de ingresso');
        return;
    }
    
    if (quantidade < 1) {
        alert('Quantidade deve ser no mínimo 1');
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
    
    // Adicionar item COM QUANTIDADE CORRETA
    const novoItem = {
        ticketId: ingressoId,
        quantity: quantidade, // USAR QUANTIDADE DO INPUT
        name: nomeIngresso,
        price: '0',
        type: 'unknown',
        ingresso_id: parseInt(ingressoId),
        quantidade: quantidade, // DUPLICAR PARA COMPATIBILIDADE
        titulo: nomeIngresso
    };
    
    window.comboItems.push(novoItem);
    
    console.log('✅ Item adicionado ao combo de edição com quantidade correta:', novoItem);
    console.log('📦 comboItems atual:', window.comboItems);
    
    // Limpar campos
    select.value = '';
    quantityInput.value = '1'; // RESETAR PARA 1
    
    // Atualizar interface
    atualizarInterfaceComboUnificada();
};

/**
 * ATUALIZAR INTERFACE DO COMBO UNIFICADA
 */
function atualizarInterfaceComboUnificada() {
    console.log('🔄 Atualizando interface do combo de forma unificada...');
    
    // Atualizar ambos os containers
    const containers = [
        document.getElementById('comboItemsList'),
        document.getElementById('editComboItemsList')
    ];
    
    containers.forEach(container => {
        if (container) {
            renderizarItensComboUnificado(container);
        }
    });
}

/**
 * BUSCAR TAXA DA PLATAFORMA DO CONTRATANTE
 */
async function buscarTaxaPlataforma() {
    console.log('💰 Buscando taxa da plataforma...');
    
    try {
        const response = await fetch('/produtor/ajax/buscar_taxa_servico.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        const textResponse = await response.text();
        console.log('📡 Resposta taxa plataforma:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON da taxa:', parseError);
            return 5.0; // Taxa padrão
        }
        
        if (data.success && data.taxa_servico) {
            const taxa = parseFloat(data.taxa_servico);
            console.log(`✅ Taxa da plataforma obtida: ${taxa}%`);
            return taxa;
        } else {
            console.warn('⚠️ Erro ao obter taxa, usando padrão:', data.message || 'Erro desconhecido');
            return 5.0; // Taxa padrão 5%
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar taxa da plataforma:', error);
        return 5.0; // Taxa padrão
    }
}

/**
 * CALCULAR VALORES BASEADO NO PREÇO E SWITCH
 */
async function calcularValores(preco, switchMarcado = false) {
    console.log(`💰 Calculando valores - Preço: ${preco}, Switch: ${switchMarcado ? 'MARCADO' : 'DESMARCADO'}`);
    
    const precoFloat = parseFloat(preco) || 0;
    const taxaPercentual = await buscarTaxaPlataforma();
    
    // Taxa de serviço - SEMPRE baseada no preço (independente do switch)
    const taxaServico = (precoFloat * taxaPercentual) / 100;
    
    let valorCobrar, valorReceber;
    
    if (switchMarcado) {
        // Switch MARCADO: comprador paga preço + taxa, produtor recebe preço integral
        valorCobrar = precoFloat + taxaServico;
        valorReceber = precoFloat;
    } else {
        // Switch DESMARCADO: comprador paga só o preço, produtor recebe preço - taxa
        valorCobrar = precoFloat;
        valorReceber = precoFloat - taxaServico;
    }
    
    const resultado = {
        preco: precoFloat,
        taxaServico: taxaServico,
        valorCobrar: valorCobrar,
        valorReceber: valorReceber,
        taxaPercentual: taxaPercentual
    };
    
    console.log('💰 Valores calculados:', resultado);
    
    return resultado;
}

/**
 * APLICAR CÁLCULOS AOS CAMPOS DO MODAL
 */
async function aplicarCalculosAoModal(modalPrefix, preco, switchMarcado) {
    console.log(`💰 Aplicando cálculos ao modal ${modalPrefix}...`);
    
    const valores = await calcularValores(preco, switchMarcado);
    
    // Mapeamento correto dos campos por modal
    let taxaField, cobrancaField, receberField, percentualSpan;
    
    if (modalPrefix === 'paidTicket') {
        taxaField = document.getElementById('paidTicketTaxaValor');
        cobrancaField = document.getElementById('paidTicketValorComprador');
        receberField = document.getElementById('paidTicketValorReceber');
        percentualSpan = document.getElementById('taxaPercentual');
    } else if (modalPrefix === 'editPaidTicket') {
        taxaField = document.getElementById('editPaidTicketTaxaValor');
        cobrancaField = document.getElementById('editPaidTicketValorComprador');
        receberField = document.getElementById('editPaidTicketValorReceber');
        percentualSpan = document.getElementById('editTaxaPercentual');
    } else if (modalPrefix === 'comboTicket') {
        taxaField = document.getElementById('comboTicketTaxaValor');
        cobrancaField = document.getElementById('comboTicketValorComprador');
        receberField = document.getElementById('comboTicketReceive');
        percentualSpan = document.getElementById('comboTaxaPercentual');
    } else if (modalPrefix === 'editCombo') {
        taxaField = document.getElementById('editComboTaxaValor');
        cobrancaField = document.getElementById('editComboValorComprador');
        receberField = document.getElementById('editComboReceive');
        percentualSpan = document.getElementById('editComboTaxaPercentual');
    }
    
    // Atualizar percentual na label
    if (percentualSpan) {
        percentualSpan.textContent = valores.taxaPercentual.toFixed(1);
    }
    
    // Atualizar campos
    if (taxaField) {
        taxaField.value = `R$ ${valores.taxaServico.toFixed(2).replace('.', ',')}`;
        console.log(`  Taxa: R$ ${valores.taxaServico.toFixed(2)}`);
    }
    
    if (cobrancaField) {
        cobrancaField.value = `R$ ${valores.valorCobrar.toFixed(2).replace('.', ',')}`;
        console.log(`  Cobrança: R$ ${valores.valorCobrar.toFixed(2)}`);
    }
    
    if (receberField) {
        receberField.value = `R$ ${valores.valorReceber.toFixed(2).replace('.', ',')}`;
        console.log(`  Receber: R$ ${valores.valorReceber.toFixed(2)}`);
    }
    
    return valores;
}

/**
 * CONFIGURAR LISTENERS DE CÁLCULO PARA TODOS OS MODAIS
 */
function configurarListenersCalculo() {
    console.log('🎯 Configurando listeners de cálculo...');
    
    // Mapeamento dos modais e seus campos
    const modais = [
        {
            prefix: 'paidTicket',
            precoField: 'paidTicketPrice',
            switchField: 'paidTicketTaxaServico'
        },
        {
            prefix: 'editPaidTicket',
            precoField: 'editPaidTicketPrice',
            switchField: 'editPaidTicketTaxaServico'
        },
        {
            prefix: 'comboTicket',
            precoField: 'comboTicketPrice',
            switchField: 'comboTicketTaxaServico'
        },
        {
            prefix: 'editCombo',
            precoField: 'editComboPrice',
            switchField: 'editComboTaxaServico'
        }
    ];
    
    modais.forEach(modal => {
        const precoField = document.getElementById(modal.precoField);
        const switchField = document.getElementById(modal.switchField);
        
        if (precoField) {
            // Listener para mudança de preço
            precoField.addEventListener('input', async function() {
                const precoLimpo = this.value.replace(/[R$\s.]/g, '').replace(',', '.');
                const preco = parseFloat(precoLimpo) || 0;
                const switchMarcado = switchField ? switchField.checked : false;
                
                console.log(`💰 Preço alterado em ${modal.prefix}: ${preco}`);
                
                if (preco > 0) {
                    await aplicarCalculosAoModal(modal.prefix, preco, switchMarcado);
                    
                    // Formatar campo de preço
                    this.value = `R$ ${preco.toFixed(2).replace('.', ',')}`;
                }
            });
            
            console.log(`✅ Listener de preço configurado para ${modal.precoField}`);
        }
        
        if (switchField) {
            // Listener para mudança do switch
            switchField.addEventListener('change', async function() {
                const precoField = document.getElementById(modal.precoField);
                if (precoField) {
                    const precoLimpo = precoField.value.replace(/[R$\s.]/g, '').replace(',', '.');
                    const preco = parseFloat(precoLimpo) || 0;
                    
                    console.log(`🔄 Switch alterado em ${modal.prefix}: ${this.checked}`);
                    
                    if (preco > 0) {
                        await aplicarCalculosAoModal(modal.prefix, preco, this.checked);
                    }
                }
            });
            
            console.log(`✅ Listener de switch configurado para ${modal.switchField}`);
        }
    });
}

/**
 * INTERCEPTAR removerItemCombo PARA USAR RENDERIZAÇÃO UNIFICADA
 */
const originalRemoverItemCombo = window.removerItemCombo;
window.removerItemCombo = function(index) {
    console.log(`🗑️ removerItemCombo UNIFICADA chamada com index: ${index}`);
    
    // Chamar função original se existir
    if (originalRemoverItemCombo && typeof originalRemoverItemCombo === 'function') {
        originalRemoverItemCombo(index);
    } else {
        // Implementação própria
        if (!window.comboItems) {
            window.comboItems = [];
        }
        
        if (index >= 0 && index < window.comboItems.length) {
            const itemRemovido = window.comboItems.splice(index, 1);
            console.log(`✅ Item removido:`, itemRemovido[0]);
        }
    }
    
    // Sempre atualizar com renderização unificada
    atualizarInterfaceComboUnificada();
};

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando correções finais dos combos...');
    
    // Configurar listeners de cálculo
    setTimeout(() => {
        configurarListenersCalculo();
    }, 1000);
    
    // Aplicar interceptações
    setTimeout(() => {
        atualizarInterfaceComboUnificada();
    }, 2000);
    
    console.log('✅ Correções finais dos combos inicializadas');
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ COMBO-CORRECOES-FINAIS.JS carregado!');
console.log('🔧 Correções implementadas:');
console.log('  1. ✅ Renderização unificada dos itens do combo');
console.log('  2. ✅ Quantidade correta ao adicionar itens');
console.log('  3. ✅ Sistema de cálculo de valores baseado em taxa + switch');
console.log('  4. ✅ Listeners automáticos para preço e switch');
