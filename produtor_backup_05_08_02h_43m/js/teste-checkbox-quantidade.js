/**
 * TESTE ESPECÍFICO: CHECKBOX BASEADO EM quantidade_total DO BANCO
 * 
 * Este arquivo testa se o checkbox "Limitar a Quantidade de Vendas desse ingresso" 
 * está sendo preenchido corretamente com base nos dados reais do banco.
 */

console.log('🧪 TESTE-CHECKBOX-QUANTIDADE.JS carregando...');

// Aguardar carregamento completo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Iniciando teste do checkbox de quantidade...');
    
    // Aguardar mais um pouco para garantir que tudo carregou
    setTimeout(() => {
        testarCheckboxQuantidade();
    }, 3000);
});

function testarCheckboxQuantidade() {
    console.log('🔍 ========== TESTE CHECKBOX QUANTIDADE ==========');
    
    // 1. Verificar se a função de interceptação existe
    console.log('📋 Verificando sistema de interceptação...');
    console.log('- window.editTicket existe?', typeof window.editTicket === 'function');
    console.log('- editTicket foi interceptado?', window.editTicket?._interceptado);
    console.log('- configurarCheckboxPorQuantidade existe?', typeof window.configurarCheckboxPorQuantidade === 'function');
    
    // 2. Verificar se os elementos dos checkboxes existem
    console.log('📋 Verificando elementos HTML...');
    const checkboxesTeste = [
        'limitEditPaidQuantityCheck',
        'limitEditFreeQuantityCheck'
    ];
    
    checkboxesTeste.forEach(id => {
        const checkbox = document.getElementById(id);
        console.log(`- ${id}:`, checkbox ? '✅ Existe' : '❌ Não encontrado');
        
        if (checkbox) {
            console.log(`  Estado atual: ${checkbox.checked ? 'Marcado' : 'Desmarcado'}`);
        }
    });
    
    // 3. Verificar campos de quantidade
    console.log('📋 Verificando campos de quantidade...');
    const camposTeste = [
        'editPaidTicketQuantity',
        'editFreeTicketQuantity'
    ];
    
    camposTeste.forEach(id => {
        const campo = document.getElementById(id);
        console.log(`- ${id}:`, campo ? `✅ Existe (valor: ${campo.value})` : '❌ Não encontrado');
    });
    
    // 4. Buscar botões de edição existentes
    console.log('📋 Verificando botões de edição...');
    const botoesEdicao = document.querySelectorAll('button[onclick*="editTicket"], button[onclick*="editarIngresso"]');
    console.log(`- Encontrados ${botoesEdicao.length} botões de edição`);
    
    if (botoesEdicao.length > 0) {
        console.log('- Primeiro botão:', botoesEdicao[0].getAttribute('onclick'));
        console.log('👆 Clique no botão acima para testar a interceptação');
    }
    
    // 5. Simular configuração de checkbox
    console.log('🧪 Testando configuração de checkbox...');
    
    // Teste com quantidade > 0 (deve marcar checkbox)
    if (typeof window.configurarCheckboxPorQuantidade === 'function') {
        console.log('🔄 Testando quantidade > 0...');
        window.configurarCheckboxPorQuantidade(5, 'limitEditPaidQuantityCheck', 'editPaidTicketQuantity');
        
        const checkbox = document.getElementById('limitEditPaidQuantityCheck');
        const campo = document.getElementById('editPaidTicketQuantity');
        
        if (checkbox && campo) {
            console.log(`✅ Resultado: checkbox=${checkbox.checked}, campo=${campo.value}`);
            
            // Teste com quantidade = 0 (deve desmarcar checkbox)
            console.log('🔄 Testando quantidade = 0...');
            window.configurarCheckboxPorQuantidade(0, 'limitEditPaidQuantityCheck', 'editPaidTicketQuantity');
            console.log(`✅ Resultado: checkbox=${checkbox.checked}, campo=${campo.value}`);
        }
    } else {
        console.log('❌ Função configurarCheckboxPorQuantidade não disponível');
    }
    
    console.log('🧪 ========== FIM DO TESTE ==========');
    
    // Exibir resultado em alert para o usuário
    setTimeout(() => {
        alert(`
TESTE DE CHECKBOX CONCLUÍDO!

✅ Sistema de interceptação: ${window.editTicket?._interceptado ? 'ATIVO' : 'INATIVO'}
✅ Função de configuração: ${typeof window.configurarCheckboxPorQuantidade === 'function' ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
✅ Botões de edição: ${botoesEdicao.length} encontrados

Abra o Console (F12) para ver detalhes completos do teste.
        `);
    }, 1000);
}

console.log('✅ TESTE-CHECKBOX-QUANTIDADE.JS carregado!');
