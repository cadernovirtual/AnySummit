/**
 * FORÇAR CRIAÇÃO DO BOTÃO BUSCAR ENDEREÇO
 * Se o botão não aparecer, este script vai criá-lo
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Verificando botão Buscar Endereço...');
    
    setTimeout(function() {
        // Verificar se o botão já existe
        let botaoBuscar = document.querySelector('button[onclick="searchAddressManual()"]');
        
        if (!botaoBuscar) {
            console.log('❌ Botão não encontrado! Criando forcadamente...');
            
            // Encontrar o container do campo de busca
            const campoBusca = document.getElementById('addressSearch');
            if (campoBusca && campoBusca.parentElement) {
                
                // Criar o botão
                botaoBuscar = document.createElement('button');
                botaoBuscar.type = 'button';
                botaoBuscar.className = 'btn btn-primary';
                botaoBuscar.onclick = function() { searchAddressManual(); };
                botaoBuscar.style.cssText = 'white-space: nowrap; margin-left: 10px;';
                botaoBuscar.innerHTML = '🔍 Buscar Endereço';
                
                // Adicionar o botão ao container
                campoBusca.parentElement.appendChild(botaoBuscar);
                
                console.log('✅ Botão criado forcadamente!');
            } else {
                console.error('❌ Campo de busca não encontrado para criar botão');
            }
        } else {
            console.log('✅ Botão já existe');
        }
        
        // Verificar se está visível
        if (botaoBuscar) {
            const isVisible = botaoBuscar.offsetParent !== null;
            console.log('👁️ Botão visível:', isVisible);
            
            if (!isVisible) {
                console.log('⚠️ Botão existe mas não está visível. Forçando visibilidade...');
                botaoBuscar.style.display = 'inline-block';
                botaoBuscar.style.visibility = 'visible';
                botaoBuscar.style.opacity = '1';
            }
        }
        
        // Função de teste
        window.testarBotao = function() {
            const btn = document.querySelector('button[onclick="searchAddressManual()"]');
            if (btn) {
                console.log('🎯 Clicando no botão...');
                btn.click();
            } else {
                console.error('❌ Botão não encontrado');
            }
        };
        
        console.log('✅ Verificação do botão concluída. Use testarBotao() para teste.');
        
    }, 1000);
});
