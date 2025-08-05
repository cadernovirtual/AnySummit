/**
 * TESTE SIMPLES - CORREÇÃO DE COMBOS
 * Versão simplificada para debug dos combos
 */

console.log('🧪 TESTE COMBOS - Carregando...');

// Interceptar createComboTicket para debug
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 DOM carregado - preparando interceptações...');
    
    setTimeout(function() {
        
        // 1. INTERCEPTAR createComboTicket
        if (window.createComboTicket) {
            const original = window.createComboTicket;
            window.createComboTicket = function() {
                console.log('🧪 createComboTicket INTERCEPTADO!');
                
                // Coletar dados básicos
                const titulo = document.getElementById('comboTicketTitle')?.value || '';
                const precoRaw = document.getElementById('comboTicketPrice')?.value || '0';
                
                console.log('🧪 Dados coletados:');
                console.log('  - Título:', titulo);
                console.log('  - Preço raw:', precoRaw);
                
                // Converter preço
                let preco = 0;
                if (precoRaw) {
                    const precoLimpo = precoRaw.replace(/[R$\s]/g, '').replace(',', '.');
                    preco = parseFloat(precoLimpo) || 0;
                    console.log('  - Preço convertido:', preco);
                }
                
                // Validações básicas
                if (!titulo.trim()) {
                    console.log('❌ Título vazio');
                    alert('Título é obrigatório!');
                    return;
                }
                
                if (preco <= 0) {
                    console.log('❌ Preço inválido');
                    alert('Preço deve ser maior que zero!');
                    return;
                }
                
                console.log('✅ Validações OK - chamando função original');
                
                // Chamar função original
                return original.apply(this, arguments);
            };
            
            console.log('✅ createComboTicket interceptado');
        } else {
            console.log('⚠️ createComboTicket não encontrado');
        }
        
        // 2. INTERCEPTAR salvarComboImediatoNoBanco se existir
        if (window.salvarComboImediatoNoBanco) {
            const originalSalvar = window.salvarComboImediatoNoBanco;
            window.salvarComboImediatoNoBanco = function(dados) {
                console.log('🧪 salvarComboImediatoNoBanco INTERCEPTADO!');
                console.log('🧪 Dados recebidos:', dados);
                
                // Verificar se preço está correto
                if (dados && dados.preco) {
                    console.log('✅ Preço nos dados:', dados.preco);
                } else {
                    console.log('❌ Preço ausente ou zero nos dados!');
                }
                
                // Chamar função original
                return originalSalvar.call(this, dados);
            };
            
            console.log('✅ salvarComboImediatoNoBanco interceptado');
        }
        
        // 3. MONITORAR ERROS
        window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('combo')) {
                console.error('🧪 ERRO RELACIONADO A COMBO:', e.message);
                console.error('🧪 Arquivo:', e.filename);
                console.error('🧪 Linha:', e.lineno);
            }
        });
        
        console.log('🧪 Interceptações configuradas!');
        
    }, 1500);
});

console.log('✅ Teste de combos carregado!');