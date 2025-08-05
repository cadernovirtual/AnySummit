/**
 * TESTE ESPECÍFICO - VERIFICAÇÃO DE LOTES POR QUANTIDADE
 * Para testar se a função temLotesQuantidade() está funcionando
 */

console.log('🧪 TESTE LOTES QUANTIDADE - Carregando...');

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('🧪 === TESTE DA FUNÇÃO temLotesQuantidade ===');
        
        // Testar a função
        if (window.temLotesQuantidade) {
            console.log('🧪 Testando temLotesQuantidade()...');
            
            try {
                const resultado = window.temLotesQuantidade();
                console.log('🧪 Resultado:', resultado);
                
                if (resultado) {
                    console.log('✅ Função retornou TRUE - há lotes por quantidade');
                } else {
                    console.log('❌ Função retornou FALSE - não há lotes por quantidade');
                }
                
            } catch (e) {
                console.error('❌ Erro ao executar temLotesQuantidade:', e);
            }
        } else {
            console.error('❌ Função temLotesQuantidade não encontrada!');
        }
        
        // Testar também o checkbox diretamente
        const checkbox = document.getElementById('controlarLimiteVendas');
        if (checkbox) {
            console.log('🧪 Checkbox encontrado. Estado atual:', checkbox.checked);
            
            // Simular desmarcação para testar
            if (checkbox.checked) {
                console.log('🧪 Simulando desmarcação do checkbox...');
                
                // Criar evento sintético
                const evento = new Event('change');
                checkbox.checked = false;
                checkbox.dispatchEvent(evento);
                
                // Aguardar um pouco e reverter
                setTimeout(() => {
                    checkbox.checked = true;
                    console.log('🧪 Checkbox revertido para o estado original');
                }, 2000);
            }
        }
        
        console.log('🧪 === FIM DO TESTE ===');
        
    }, 3000);
});

// Também interceptar a função toggleLimiteVendas para debug
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (window.toggleLimiteVendas) {
            const original = window.toggleLimiteVendas;
            window.toggleLimiteVendas = function() {
                console.log('🧪 toggleLimiteVendas INTERCEPTADO!');
                
                const checkbox = document.getElementById('controlarLimiteVendas');
                if (checkbox) {
                    console.log('🧪 Estado do checkbox:', checkbox.checked);
                    
                    if (!checkbox.checked) {
                        console.log('🧪 Checkbox foi desmarcado - testando temLotesQuantidade...');
                        
                        if (window.temLotesQuantidade) {
                            const temLotes = window.temLotesQuantidade();
                            console.log('🧪 temLotesQuantidade retornou:', temLotes);
                            
                            if (temLotes) {
                                console.log('✅ Deve mostrar confirmação de exclusão');
                            } else {
                                console.log('⚠️ Não deve mostrar confirmação - sem lotes');
                            }
                        }
                    }
                }
                
                // Chamar função original
                return original.apply(this, arguments);
            };
            
            console.log('✅ toggleLimiteVendas interceptado para debug');
        }
    }, 1000);
});

console.log('✅ Teste de lotes por quantidade carregado!');