// Teste manual das correções
console.log('🧪 INICIANDO TESTES MANUAIS...');

// Aguardar 2 segundos para garantir que tudo carregou
setTimeout(function() {
    console.log('\n=== TESTE 1: Validação de Lote ===');
    // Simular clique em nextStep na etapa 5
    if (window.setCurrentStep) {
        window.setCurrentStep(5);
        console.log('- Mudando para etapa 5');
        
        // Verificar se há lotes
        const lotes = document.querySelectorAll('.lote-card');
        console.log('- Lotes encontrados:', lotes.length);
        
        // Tentar avançar
        console.log('- Tentando avançar sem lote...');
        if (window.nextStep) {
            window.nextStep();
        }
    }
    
    console.log('\n=== TESTE 2: Proteção de Lote ===');
    // Verificar se função existe
    if (window.loteTemIngressos) {
        console.log('- Função loteTemIngressos existe: ✅');
        
        // Testar com um lote fictício
        const resultado = window.loteTemIngressos('teste123');
        console.log('- Teste com lote fictício:', resultado);
    } else {
        console.log('- Função loteTemIngressos existe: ❌');
    }
    
    console.log('\n=== TESTE 3: Datas na Edição ===');
    if (window.applyLoteDatesToTicket) {
        console.log('- Função applyLoteDatesToTicket existe: ✅');
    } else {
        console.log('- Função applyLoteDatesToTicket existe: ❌');
    }
    
    console.log('\n=== TESTE 4: Ícone de Lixeira ===');
    if (window.renderEditComboItems) {
        console.log('- Função renderEditComboItems existe: ✅');
        
        // Verificar conteúdo da função
        const funcStr = window.renderEditComboItems.toString();
        const temSVG = funcStr.includes('<svg');
        const temEmoji = funcStr.includes('🗑️');
        
        console.log('- Função contém SVG:', temSVG ? '✅' : '❌');
        console.log('- Função contém emoji:', temEmoji ? '❌ (correto)' : '✅ (errado)');
        
        // Criar item de teste
        window.editComboItems = [{
            ticket_name: 'Ingresso Teste',
            quantidade: 2
        }];
        
        // Criar container temporário
        const tempDiv = document.createElement('div');
        tempDiv.id = 'editComboItemsList';
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        // Renderizar
        window.renderEditComboItems();
        
        // Verificar resultado
        const html = tempDiv.innerHTML;
        console.log('- HTML contém SVG:', html.includes('<svg') ? '✅' : '❌');
        console.log('- HTML contém emoji:', html.includes('🗑️') ? '❌ (errado)' : '✅ (correto)');
        
        // Limpar
        document.body.removeChild(tempDiv);
        window.editComboItems = [];
    } else {
        console.log('- Função renderEditComboItems existe: ❌');
    }
    
    console.log('\n=== RESUMO DOS TESTES ===');
    console.log('Se todos os testes mostraram ✅, as correções estão aplicadas.');
    console.log('Se algum mostrou ❌, recarregue a página com Ctrl+F5.');
    
}, 2000);
