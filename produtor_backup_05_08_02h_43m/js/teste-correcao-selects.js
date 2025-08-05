/**
 * TESTE MANUAL DA CORREÇÃO DE SELECTS DE LOTES
 * 
 * Este script permite testar se a correção está funcionando corretamente
 */

console.log('🧪 [TESTE] Script de teste da correção carregado');

// Função para testar se os selects estão sendo populados
window.testarSelects = function() {
    console.log('🧪 [TESTE] Iniciando teste dos selects...');
    
    const selects = [
        { id: 'paidTicketLote', nome: 'Ingresso Pago', modal: 'paidTicketModal' },
        { id: 'freeTicketLote', nome: 'Ingresso Gratuito', modal: 'freeTicketModal' },
        { id: 'comboTicketLote', nome: 'Combo', modal: 'comboTicketModal' }
    ];
    
    selects.forEach(teste => {
        const select = document.getElementById(teste.id);
        if (select) {
            const opcoes = select.querySelectorAll('option');
            console.log(`${opcoes.length > 1 ? '✅' : '❌'} ${teste.nome}: ${opcoes.length} opções`);
            
            // Listar opções se houver
            if (opcoes.length > 1) {
                Array.from(opcoes).forEach((opcao, index) => {
                    if (index > 0) { // Pular "Selecione um lote"
                        console.log(`   - ${opcao.textContent} (valor: ${opcao.value})`);
                    }
                });
            }
        } else {
            console.log(`❌ ${teste.nome}: Select não encontrado`);
        }
    });
    
    // Testar se a função da Etapa 5 está disponível
    if (typeof window.carregarLotesDoBanco === 'function') {
        console.log('✅ window.carregarLotesDoBanco está disponível');
        
        // Testar a função
        window.carregarLotesDoBanco().then(lotes => {
            console.log(`📦 Lotes disponíveis no banco: ${lotes.length}`);
            lotes.forEach(lote => {
                console.log(`   - ${lote.nome} (ID: ${lote.id}, Tipo: ${lote.tipo})`);
            });
        }).catch(error => {
            console.error('❌ Erro ao carregar lotes:', error);
        });
    } else {
        console.log('❌ window.carregarLotesDoBanco NÃO está disponível');
    }
};

// Função para abrir modais e testar
window.testarModais = function() {
    console.log('🧪 [TESTE] Testando abertura de modais...');
    
    const modais = ['paidTicketModal', 'freeTicketModal', 'comboTicketModal'];
    
    modais.forEach((modalId, index) => {
        setTimeout(() => {
            console.log(`🪟 [TESTE] Abrindo ${modalId}...`);
            
            if (typeof window.openModal === 'function') {
                window.openModal(modalId);
                
                // Aguardar um momento e verificar o select
                setTimeout(() => {
                    const selectId = modalId.replace('Modal', 'Lote');
                    const select = document.getElementById(selectId);
                    
                    if (select) {
                        const opcoes = select.querySelectorAll('option');
                        console.log(`${opcoes.length > 1 ? '✅' : '❌'} ${modalId} -> ${selectId}: ${opcoes.length} opções`);
                    }
                    
                    // Fechar modal
                    if (typeof window.closeModal === 'function') {
                        window.closeModal(modalId);
                    } else {
                        const modal = document.getElementById(modalId);
                        if (modal) {
                            modal.style.display = 'none';
                        }
                    }
                }, 500);
                
            } else {
                console.log('❌ window.openModal não está disponível');
            }
        }, index * 2000); // 2 segundos entre cada teste
    });
};

// Função para verificar se as funções corrigidas estão ativas
window.verificarCorrecao = function() {
    console.log('🔍 [TESTE] Verificando se a correção está ativa...');
    
    const funcoes = [
        'populatePaidTicketLote',
        'populateFreeTicketLote', 
        'populateComboTicketLote',
        'carregarLotesNoModal',
        'carregarLotesNoModalFree'
    ];
    
    funcoes.forEach(funcao => {
        if (typeof window[funcao] === 'function') {
            console.log(`✅ window.${funcao} está disponível`);
            
            // Verificar se é a versão corrigida (tem 'CORREÇÃO' no log)
            const originalLog = console.log;
            let isCorrigida = false;
            
            console.log = function(...args) {
                if (args.some(arg => typeof arg === 'string' && arg.includes('CORREÇÃO'))) {
                    isCorrigida = true;
                }
                originalLog.apply(console, args);
            };
            
            // Executar função brevemente
            try {
                window[funcao]();
                setTimeout(() => {
                    console.log = originalLog;
                    console.log(`${isCorrigida ? '✅' : '⚠️'} ${funcao}: ${isCorrigida ? 'versão corrigida' : 'versão original'}`);
                }, 100);
            } catch (e) {
                console.log = originalLog;
                console.log(`❌ ${funcao}: erro ao executar`);
            }
        } else {
            console.log(`❌ window.${funcao} NÃO está disponível`);
        }
    });
};

console.log('🧪 [TESTE] Funções de teste disponíveis:');
console.log('  - window.testarSelects() - Testa se selects estão populados');
console.log('  - window.testarModais() - Abre modais e testa selects');
console.log('  - window.verificarCorrecao() - Verifica se correção está ativa');
console.log('  - window.testarCorrecaoSelects() - Função da correção principal');

// Auto-executar teste básico após 3 segundos
setTimeout(() => {
    console.log('🚀 [TESTE] Executando teste automático...');
    window.testarSelects();
}, 3000);