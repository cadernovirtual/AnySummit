// === TESTE SIMPLES - DEVE APARECER NO CONSOLE ===

// Verificar se a função existe
if (window.coletarDadosModalPagoFinal) {
    
} else {
    
}

// Tentar interceptar de forma mais direta
setTimeout(() => {
    
    if (window.createPaidTicket) {
        const originalCreatePaidTicket = window.createPaidTicket;
        window.createPaidTicket = function() {
            
            // Verificar todos os campos ANTES da validação
            
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
                
            });
            
            // Verificar elementos que podem não existir
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
                
            });
            
            // Chamar função original e capturar resultado
            const resultado = originalCreatePaidTicket.apply(this, arguments);
            
            return resultado;
        };
        
    } else {
        
    }
    
    // Também interceptar a função problemática se existir
    if (window.coletarDadosModalPagoFinal) {
        const originalColeta = window.coletarDadosModalPagoFinal;
        window.coletarDadosModalPagoFinal = function() {
            
            const resultado = originalColeta.apply(this, arguments);
            
            if (!resultado) {
                
            }
            
            return resultado;
        };
        
    }
}, 1000);
