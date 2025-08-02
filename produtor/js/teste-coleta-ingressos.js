/**
 * TESTE ESPECÍFICO PARA COLETA DE DADOS DE INGRESSOS
 * Verifica se tipo, datas e lote estão sendo coletados corretamente
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Função para testar coleta de dados
    window.testarColetaDadosIngressos = function() {
        console.log('🧪 Testando coleta de dados de ingressos...');
        
        // Verificar elementos ticket-item
        const ticketItems = document.querySelectorAll('.ticket-item');
        console.log(`📊 Elementos .ticket-item encontrados: ${ticketItems.length}`);
        
        if (ticketItems.length === 0) {
            console.log('⚠️ Nenhum elemento .ticket-item encontrado');
            console.log('🔍 Verificando outros seletores possíveis:');
            
            const possiveisSeletores = [
                '.ticket-card',
                '.ingresso-item', 
                '.ticket',
                '[data-ticket-type]',
                '.paid-ticket',
                '.free-ticket'
            ];
            
            possiveisSeletores.forEach(seletor => {
                const elementos = document.querySelectorAll(seletor);
                console.log(`  - ${seletor}: ${elementos.length} elementos`);
            });
            
            return;
        }
        
        // Analisar cada ticket-item
        ticketItems.forEach((item, index) => {
            console.log(`\n🎫 === TICKET ITEM ${index + 1} ===`);
            console.log('Element:', item);
            console.log('Dataset:', item.dataset);
            console.log('ticketData:', item.ticketData);
            
            // Verificar campos específicos
            const campos = {
                nome: item.querySelector('.ticket-name')?.textContent,
                tipo: item.dataset.ticketType,
                preco: item.querySelector('.ticket-price')?.textContent
            };
            
            console.log('Campos extraídos:', campos);
            
            // Buscar campos de data
            const camposData = item.querySelectorAll('input[type="datetime-local"]');
            console.log(`Campos datetime-local encontrados: ${camposData.length}`);
            
            camposData.forEach((campo, idx) => {
                console.log(`  Campo ${idx + 1}: ID=${campo.id}, name=${campo.name}, value=${campo.value}`);
            });
        });
        
        // Tentar chamar a função real de coleta
        if (typeof window.coletarDadosIngressos === 'function') {
            console.log('\n📦 Chamando função coletarDadosIngressos...');
            const dadosColetados = window.coletarDadosIngressos();
            console.log('✅ Dados coletados:', dadosColetados);
        } else {
            console.log('❌ Função coletarDadosIngressos não disponível globalmente');
        }
    };
    
    // Função para simular criação de ingresso
    window.simularCriacaoIngresso = function() {
        console.log('🎭 Simulando criação de ingresso para teste...');
        
        // Criar elemento ticket-item fictício
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.dataset.ticketType = 'paid';
        
        // Adicionar dados simulados
        ticketItem.ticketData = {
            type: 'paid',
            title: 'Ingresso Teste',
            description: 'Descrição de teste',
            quantity: 100,
            price: 50.00,
            taxaPlataforma: 4.00,
            valorReceber: 50.00,
            startDate: '2024-03-01T10:00',
            endDate: '2024-03-31T23:59',
            minQuantity: 1,
            maxQuantity: 5,
            loteName: 'Lote Teste'
        };
        
        // Adicionar à página
        const container = document.getElementById('ticketContainer') || document.body;
        container.appendChild(ticketItem);
        
        console.log('✅ Ingresso simulado criado');
        
        // Testar coleta
        setTimeout(() => {
            testarColetaDadosIngressos();
        }, 100);
    };
    
    // Função para verificar modais
    window.verificarModaisIngresso = function() {
        console.log('🔍 Verificando modais de ingresso...');
        
        const modais = [
            'paidTicketModal',
            'freeTicketModal', 
            'editPaidTicketModal',
            'editFreeTicketModal'
        ];
        
        modais.forEach(modalId => {
            const modal = document.getElementById(modalId);
            console.log(`Modal ${modalId}: ${modal ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
            
            if (modal) {
                // Verificar campos do modal
                const campos = modal.querySelectorAll('input, select, textarea');
                console.log(`  Campos no modal: ${campos.length}`);
                
                campos.forEach(campo => {
                    if (campo.type === 'datetime-local' || campo.name?.includes('data') || campo.id?.includes('date')) {
                        console.log(`    Campo de data: ID=${campo.id}, name=${campo.name}, value=${campo.value}`);
                    }
                });
            }
        });
    };
    
    console.log('🧪 Testes de coleta de dados carregados:');
    console.log('  - testarColetaDadosIngressos()');
    console.log('  - simularCriacaoIngresso()');
    console.log('  - verificarModaisIngresso()');
});
