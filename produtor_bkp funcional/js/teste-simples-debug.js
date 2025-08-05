// === TESTE SIMPLES - DEVE APARECER NO CONSOLE ===
console.log('🚨 SCRIPT DE TESTE CARREGADO - SE VOCÊ VÊ ISSO, O ARQUIVO ESTÁ FUNCIONANDO');

// Verificar se a função existe
if (window.coletarDadosModalPagoFinal) {
    console.log('✅ Função coletarDadosModalPagoFinal EXISTE');
} else {
    console.log('❌ Função coletarDadosModalPagoFinal NÃO EXISTE');
}

// Tentar interceptar de forma mais direta
setTimeout(() => {
    console.log('🔄 Tentando interceptar createPaidTicket...');
    
    if (window.createPaidTicket) {
        const originalCreatePaidTicket = window.createPaidTicket;
        window.createPaidTicket = function() {
            console.log('🚨 INTERCEPTADO! createPaidTicket foi chamado');
            
            // Verificar todos os campos ANTES da validação
            console.log('📋 VALORES DOS CAMPOS:');
            
            const campos = {
                titulo: document.getElementById('paidTicketTitle')?.value,
                quantidade: document.getElementById('paidTicketQuantity')?.value,
                preco: document.getElementById('paidTicketPrice')?.value,
                lote: document.getElementById('paidTicketLote')?.value,
                inicio: document.getElementById('paidSaleStart')?.value,
                fim: document.getElementById('paidSaleEnd')?.value,
                min: document.getElementById('paidMinQuantity')?.value,
                max: document.getElementById('paidMaxQuantity')?.value,
                descricao: document.getElementById('paidTicketDescription')?.value
            };
            
            Object.keys(campos).forEach(key => {
                console.log(`${key}: "${campos[key]}"`);
            });
            
            // Verificar elementos que podem não existir
            console.log('🔍 VERIFICAÇÃO DE ELEMENTOS DOM:');
            Object.keys(campos).forEach(key => {
                const elementId = key === 'titulo' ? 'paidTicketTitle' :
                                key === 'quantidade' ? 'paidTicketQuantity' :
                                key === 'preco' ? 'paidTicketPrice' :
                                key === 'lote' ? 'paidTicketLote' :
                                key === 'inicio' ? 'paidSaleStart' :
                                key === 'fim' ? 'paidSaleEnd' :
                                key === 'min' ? 'paidMinQuantity' :
                                key === 'max' ? 'paidMaxQuantity' :
                                'paidTicketDescription';
                
                const element = document.getElementById(elementId);
                console.log(`${key} (${elementId}): ${element ? '✅ EXISTS' : '❌ NOT FOUND'}`);
            });
            
            // Chamar função original e capturar resultado
            console.log('🔄 Chamando função original...');
            const resultado = originalCreatePaidTicket.apply(this, arguments);
            console.log('✅ Função original executada, resultado:', resultado);
            
            return resultado;
        };
        console.log('✅ createPaidTicket interceptado com sucesso');
    } else {
        console.log('❌ createPaidTicket não encontrado');
    }
    
    // Também interceptar a função problemática se existir
    if (window.coletarDadosModalPagoFinal) {
        const originalColeta = window.coletarDadosModalPagoFinal;
        window.coletarDadosModalPagoFinal = function() {
            console.log('🔍 INTERCEPTANDO coletarDadosModalPagoFinal...');
            
            const resultado = originalColeta.apply(this, arguments);
            console.log('📊 Resultado da coleta de dados:', resultado);
            
            if (!resultado) {
                console.log('❌ coletarDadosModalPagoFinal retornou NULL - dados inválidos');
            }
            
            return resultado;
        };
        console.log('✅ coletarDadosModalPagoFinal interceptado');
    }
}, 1000);
