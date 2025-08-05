/**
 * VERIFICAÇÃO E GARANTIA DA FUNÇÃO searchAddressManual
 * Executa após todos os scripts carregarem
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Verificando função searchAddressManual...');
    
    setTimeout(function() {
        // Verificar se a função existe
        if (typeof window.searchAddressManual !== 'function') {
            console.error('❌ ERRO: searchAddressManual não definida!');
            
            // Criar função de emergência
            window.searchAddressManual = function() {
                alert('Sistema de busca não carregado. Recarregue a página.');
                console.error('Função de emergência executada');
            };
            
            console.log('🚨 Função de emergência criada');
        } else {
            console.log('✅ Função searchAddressManual OK');
        }
        
        // Verificar se o botão existe e tem a função vinculada
        const botao = document.querySelector('button[onclick="searchAddressManual()"]');
        if (botao) {
            console.log('✅ Botão encontrado');
            
            // Adicionar listener adicional como backup
            botao.addEventListener('click', function(e) {
                console.log('🎯 Clique no botão detectado (listener backup)');
                if (typeof window.searchAddressManual === 'function') {
                    // Prevenir execução dupla
                    if (e.target.getAttribute('onclick')) {
                        return; // Deixar o onclick executar
                    }
                    window.searchAddressManual();
                } else {
                    alert('Erro: Função de busca não disponível');
                }
            });
            
            console.log('✅ Listener backup adicionado ao botão');
        } else {
            console.error('❌ Botão não encontrado!');
        }
        
        // Função de teste manual
        window.testarFuncaoBusca = function() {
            console.log('🧪 Testando função de busca...');
            console.log('Tipo:', typeof window.searchAddressManual);
            
            if (typeof window.searchAddressManual === 'function') {
                const campo = document.getElementById('addressSearch');
                if (campo) {
                    campo.value = 'Av Paulista 1000, São Paulo';
                    console.log('Executando teste...');
                    window.searchAddressManual();
                } else {
                    console.error('Campo não encontrado');
                }
            } else {
                console.error('Função não é uma function!');
            }
        };
        
        console.log('✅ Verificação completa. Use testarFuncaoBusca() no console.');
        
    }, 2000);
});
