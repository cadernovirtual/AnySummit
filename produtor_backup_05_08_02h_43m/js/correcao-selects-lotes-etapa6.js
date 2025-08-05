/**
 * CORREÇÃO ESPECÍFICA: SELECTS DE LOTES VAZIOS NA ETAPA 6
 * 
 * PROBLEMA: Modais de ingresso PAGO e GRATUITO não preenchem lista de lotes
 * CAUSA: Funções tentam buscar lotes de cookies em vez do MySQL
 * SOLUÇÃO: Usar window.carregarLotesDoBanco() da Etapa 5 (que funciona)
 */

console.log('🔧 [CORREÇÃO] Carregando correção de selects de lotes da Etapa 6...');

/**
 * Função unificada para popular select de lotes
 * Usa window.carregarLotesDoBanco() da Etapa 5 que está funcionando
 */
async function popularSelectLotesUnificado(selectId) {
    console.log(`📝 [CORREÇÃO] Populando select ${selectId}...`);
    
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`❌ Select ${selectId} não encontrado`);
        return;
    }
    
    // CORREÇÃO 1: Sempre limpar completamente antes de popular para evitar duplicação
    console.log(`🧹 [CORREÇÃO] Limpando select ${selectId} para evitar duplicação...`);
    select.innerHTML = '';
    select.appendChild(new Option('Selecione um lote', ''));
    
    try {
        // Usar a função da Etapa 5 que funciona
        if (typeof window.carregarLotesDoBanco === 'function') {
            console.log(`🔄 [CORREÇÃO] Carregando lotes do banco para ${selectId}...`);
            const lotes = await window.carregarLotesDoBanco();
            
            if (!lotes || lotes.length === 0) {
                select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
                console.log(`⚠️ [CORREÇÃO] Nenhum lote encontrado para ${selectId}`);
                return;
            }
            
            // Adicionar lotes ao select
            lotes.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.id;
                
                // Criar descrição do lote baseado no tipo
                let descricao = lote.nome;
                if (lote.tipo === 'data') {
                    const dataInicio = new Date(lote.data_inicio).toLocaleDateString('pt-BR');
                    const dataFim = new Date(lote.data_fim).toLocaleDateString('pt-BR');
                    descricao += ` - de ${dataInicio} até ${dataFim}`;
                } else if (lote.tipo === 'quantidade' || lote.tipo === 'percentual') {
                    descricao += ` - ${lote.percentual_venda}% das vendas`;
                }
                
                option.textContent = descricao;
                select.appendChild(option);
            });
            
            console.log(`✅ [CORREÇÃO] ${lotes.length} lotes adicionados ao ${selectId}`);
            
        } else {
            console.error('❌ [CORREÇÃO] window.carregarLotesDoBanco não está disponível');
            select.innerHTML = '<option value="">Erro: função não disponível</option>';
        }
        
    } catch (error) {
        console.error(`❌ [CORREÇÃO] Erro ao carregar lotes para ${selectId}:`, error);
        select.innerHTML = '<option value="">Erro ao carregar lotes</option>';
    }
}

/**
 * Sobrescrever funções que não funcionam com versões corrigidas
 */

// Modal de ingresso PAGO
window.populatePaidTicketLote = function() {
    console.log('💰 [CORREÇÃO] populatePaidTicketLote - versão corrigida');
    return popularSelectLotesUnificado('paidTicketLote');
};

window.carregarLotesNoModal = function() {
    console.log('💰 [CORREÇÃO] carregarLotesNoModal - versão corrigida para PAGO');
    return popularSelectLotesUnificado('paidTicketLote');
};

window.carregarLotesIngressoPago = function() {
    console.log('💰 [CORREÇÃO] carregarLotesIngressoPago - versão corrigida');
    return popularSelectLotesUnificado('paidTicketLote');
};

// Modal de ingresso GRATUITO
window.populateFreeTicketLote = function() {
    console.log('🆓 [CORREÇÃO] populateFreeTicketLote - versão corrigida');
    return popularSelectLotesUnificado('freeTicketLote');
};

window.carregarLotesNoModalFree = function() {
    console.log('🆓 [CORREÇÃO] carregarLotesNoModalFree - versão corrigida');
    return popularSelectLotesUnificado('freeTicketLote');
};

// Modal de COMBO (manter funcionamento atual, mas garantir que use a versão corrigida)
const originalPopulateComboTicketLote = window.populateComboTicketLote;
window.populateComboTicketLote = function() {
    console.log('📦 [CORREÇÃO] populateComboTicketLote - garantindo versão corrigida');
    return popularSelectLotesUnificado('comboTicketLote');
};

/**
 * Interceptar abertura de modais para garantir que os selects sejam populados
 */
function interceptarAberturaModais() {
    console.log('🔗 [CORREÇÃO] Configurando interceptação de modais...');
    
    // Guardar função original se existir
    const originalOpenModal = window.openModal;
    
    window.openModal = function(modalId) {
        console.log(`🪟 [CORREÇÃO] Abrindo modal: ${modalId}`);
        
        // Chamar função original se existir
        if (typeof originalOpenModal === 'function') {
            originalOpenModal(modalId);
        } else {
            // Fallback: abrir modal manualmente
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
            }
        }
        
        // Popular select de lotes baseado no modal aberto
        setTimeout(() => {
            if (modalId === 'paidTicketModal') {
                console.log('💰 [CORREÇÃO] Modal pago aberto - populando lotes...');
                popularSelectLotesUnificado('paidTicketLote');
            } else if (modalId === 'freeTicketModal') {
                console.log('🆓 [CORREÇÃO] Modal gratuito aberto - populando lotes...');
                popularSelectLotesUnificado('freeTicketLote');
            } else if (modalId === 'comboTicketModal') {
                console.log('📦 [CORREÇÃO] Modal combo aberto - populando lotes...');
                popularSelectLotesUnificado('comboTicketLote');
            }
        }, 100); // Pequeno delay para garantir que o modal esteja renderizado
    };
}

/**
 * Configurar event listeners para botões de adicionar ingresso
 */
function configurarEventListeners() {
    console.log('🔗 [CORREÇÃO] Configurando event listeners...');
    
    // Botão de ingresso pago
    const btnPaid = document.getElementById('addPaidTicket');
    if (btnPaid) {
        btnPaid.addEventListener('click', function(e) {
            console.log('💰 [CORREÇÃO] Clique no botão de ingresso pago');
            setTimeout(() => {
                popularSelectLotesUnificado('paidTicketLote');
            }, 200);
        });
        console.log('✅ [CORREÇÃO] Event listener configurado para botão pago');
    }
    
    // Botão de ingresso gratuito
    const btnFree = document.getElementById('addFreeTicket');
    if (btnFree) {
        btnFree.addEventListener('click', function(e) {
            console.log('🆓 [CORREÇÃO] Clique no botão de ingresso gratuito');
            setTimeout(() => {
                popularSelectLotesUnificado('freeTicketLote');
            }, 200);
        });
        console.log('✅ [CORREÇÃO] Event listener configurado para botão gratuito');
    }
    
    // Botão de combo
    const btnCombo = document.getElementById('addComboTicket');
    if (btnCombo) {
        btnCombo.addEventListener('click', function(e) {
            console.log('📦 [CORREÇÃO] Clique no botão de combo');
            setTimeout(() => {
                popularSelectLotesUnificado('comboTicketLote');
            }, 200);
        });
        console.log('✅ [CORREÇÃO] Event listener configurado para botão combo');
    }
}

/**
 * Teste manual das funções
 */
window.testarCorrecaoSelects = function() {
    console.log('🧪 [TESTE] Testando correção de selects...');
    
    const testes = [
        { id: 'paidTicketLote', nome: 'Ingresso Pago' },
        { id: 'freeTicketLote', nome: 'Ingresso Gratuito' },
        { id: 'comboTicketLote', nome: 'Combo' }
    ];
    
    testes.forEach(teste => {
        console.log(`🧪 [TESTE] Testando ${teste.nome}...`);
        popularSelectLotesUnificado(teste.id);
    });
};

/**
 * Inicialização
 */
function inicializarCorrecao() {
    console.log('🚀 [CORREÇÃO] Inicializando correção de selects de lotes...');
    
    // Aguardar carregamento do DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            interceptarAberturaModais();
            configurarEventListeners();
        });
    } else {
        interceptarAberturaModais();
        configurarEventListeners();
    }
    
    console.log('✅ [CORREÇÃO] Correção de selects de lotes configurada com sucesso!');
    console.log('📋 [CORREÇÃO] Funções disponíveis:');
    console.log('  - window.testarCorrecaoSelects() - para testar manualmente');
    console.log('  - popularSelectLotesUnificado(selectId) - para popular um select específico');
}

// Inicializar imediatamente
inicializarCorrecao();